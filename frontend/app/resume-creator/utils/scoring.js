/**
 * CYRB53 Hashing function
 * A fast and robust 53-bit hash for strings.
 */
const cyrb53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

/**
 * Calculates a deterministic score based on resume content and template.
 * Includes quality audits to penalize 'sabotaged' or empty resumes.
 * @returns {Object} { score: number, deductions: number, warnings: string[] }
 */
export const calculateDeterministicScore = (data, templatesConfig, activeTemplateId) => {
    if (!data) return { score: 20, deductions: 60, warnings: ["Incomplete Resume: Please add more information to be scorable."] };

    // 1. Collect core content and measure "Density"
    const sections = [];
    let sectionCount = 0;
    const warnings = [];

    const summaryText = typeof data.summary === 'string' ? data.summary : (data.summary?.content || '');
    if (summaryText && summaryText.trim().length > 10) {
        sections.push(summaryText);
        sectionCount++;
    }

    if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
        sectionCount++;
        data.experience.forEach(exp => {
            sections.push(exp.title || '');
            sections.push(exp.company || '');
            sections.push(exp.description || '');
        });
    }

    if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
        sectionCount++;
        data.skills.forEach(skill => {
            if (typeof skill === 'string') sections.push(skill);
            else if (skill && skill.name) sections.push(skill.name);
        });
    }

    if (data.education && Array.isArray(data.education) && data.education.length > 0) {
        sectionCount++;
    }

    // 2. Create the content fingerprint
    const contentString = sections.join('|').toLowerCase().replace(/\s+/g, '');
    const totalCharCount = contentString.length;

    // Hash for variety
    const hash = cyrb53(contentString || 'empty-resume');

    // 3. Base Score (75-87)
    let score = 75 + (hash % 13);

    // 4. QUALITY AUDIT & PENALTIES (Sabotage Detection)
    let totalDeductions = 0;

    // A) Content Volume Penalty
    if (totalCharCount < 200) {
        totalDeductions += 25;
        warnings.push("Critical: Extremely low content density. This will be ignored by ATS.");
    } else if (totalCharCount < 400) {
        totalDeductions += 15;
        warnings.push("Warning: Low content volume. Resume feels sparse.");
    } else if (totalCharCount < 700) {
        totalDeductions += 5;
    }

    // B) Section Variety Penalty
    if (sectionCount < 2) {
        totalDeductions += 15;
        warnings.push("Missing core sections. Professional resumes require depth.");
    }


    // C) "Goofy" Design Penalty (Template-Aware Selection)
    const layoutSettings = data.templateLayouts?.[activeTemplateId];
    const templateConfig = templatesConfig?.find(t => t.id === activeTemplateId);

    // Layered Settings Merge: First defaults, then global items, then template-specific overrides
    const ds = {
        ...(templateConfig?.defaults || {}),
        ...(data.designSettings || {}),
        ...(layoutSettings?.designSettings || {})
    };

    const isCreative = templateConfig?.tags?.includes('Creative');

    if (ds.letterSpacing) {
        const ls = parseFloat(ds.letterSpacing);
        // Creative templates allowed more stylistic spacing
        const limit = isCreative ? 2.5 : 1.5;
        if (ls > limit || ls < -0.5) {
            totalDeductions += 10;
            warnings.push("Poor legibility: Unprofessional character spacing detected.");
        }
    }

    if (ds.lineHeight) {
        const lh = parseFloat(ds.lineHeight);
        const minLh = isCreative ? 0.8 : 0.9;
        if (lh > 2.2 || lh < minLh) {
            totalDeductions += 12;
            warnings.push("Structural issue: Line spacing makes content difficult to scan.");
        }
    }

    // Unprofessional Sizing Penalty (Handles multiplier mapping)
    if (ds.fontSize) {
        const fs = parseFloat(ds.fontSize);
        // Multiplying factors: 0.85 (Small), 1 (Normal), 1.15 (Large) are default.
        // Penalty triggers if they bypass UI to set extreme scaling.
        if (fs > 1.4 || fs < 0.7) {
            totalDeductions += 15;
            warnings.push("Typography failure: Layout scaling is outside of professional standards.");
        }
    }

    // D) Missing Core Info & Dummy Placeholder Penalties
    if (!data.personal || (!data.personal.email && !data.personal.phone)) {
        totalDeductions += 10;
        warnings.push("Missing core contact info: Recruiters need an email or phone number.");
    }

    const stringifiedData = JSON.stringify(data).toLowerCase();

    // Check for common mock data strings from our default state or user keyboard mashing
    const mockPatterns = [
        "new skill",
        "new strength",
        "an addition",
        "teacher's assistant",
        "apprenticeship",
        "asdasd",
        "qwerty",
        "lorem ipsum",
        "test company",
        "test university",
        "john doe",
        "jane doe",
        "your name",
        "solid experience in supporting project tasks",
        "results-driven professional prepared for this role",
        "ararar"
    ];

    let foundMockData = 0;
    mockPatterns.forEach(pattern => {
        if (stringifiedData.includes(pattern)) {
            foundMockData++;
        }
    });

    if (foundMockData > 0) {
        // Apply accumulating penalty for leaving mock data or gibberish
        totalDeductions += (foundMockData * 15); // Harsher penalty for obvious dummy data
        warnings.push(`Detected ${foundMockData} instance(s) of placeholder or dummy texts. Please replace with your actual professional details.`);
    }

    // 5. Template Multiplier (+2 for Premium)
    const template = templatesConfig.find(t => t.id === activeTemplateId);
    if (template && totalDeductions === 0) {
        const isPremium = template.tags?.some(tag =>
            ['Premium', 'Executive', 'Corporate'].includes(tag)
        );
        if (isPremium) score += 2;
    }

    // Final Calculation
    let finalScore = score - totalDeductions;

    // Hard Floor: Even a bad Gaplytiq resume shouldn't look as bad as a 
    // total external failure unless it's literally empty.
    if (totalCharCount < 50) return { score: 20, deductions: 60, warnings: ["Incomplete Resume: Please add more information to be scorable."] };

    return {
        score: Math.max(20, Math.min(finalScore, 89)),
        deductions: totalDeductions,
        warnings
    };
};
