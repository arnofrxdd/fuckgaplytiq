import { parseFileBuffer } from './parserCore'
import { parseResumeText as aiParseResumeText } from './aiClient'
import Ajv from 'ajv'

export async function parsePdfBuffer(buffer: Buffer): Promise<{ text: string; meta?: any }> {
    const result = await parseFileBuffer(buffer, 'application/pdf')
    return result
}

export async function parseDocxBuffer(buffer: Buffer): Promise<{ text: string; meta?: any }> {
    const result = await parseFileBuffer(buffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    return result
}

function normalizeToSchema(aiParsed: any, rawText: string) {
    console.log('🏗️ [V2-RESILIENT] Normalizing AI response. Keys found:', Object.keys(aiParsed || {}));

    // ─── UTILITY HELPERS ────────────────────────────────────────────────────────
    // AI prompt says "use null for missing fields". These helpers ensure no null/
    // undefined or literal "null" strings ever reach the frontend UI.

    const str = (v: any): string => {
        if (v === null || v === undefined) return '';
        const s = String(v).trim();
        return (s === 'null' || s === 'undefined') ? '' : s;
    };

    const bool = (v: any): boolean => (v === null || v === undefined) ? false : !!v;

    const safeNum = (v: any, fallback = 3): number => {
        const n = typeof v === 'number' ? v : Number(v);
        return (Number.isFinite(n) && n > 0) ? Math.min(5, Math.max(1, Math.round(n))) : fallback;
    };

    const safeArr = (v: any): any[] => Array.isArray(v) ? v : [];

    // ─── 1. Initial Analysis ────────────────────────────────────────────────────
    const aiRaw = aiParsed?.initial_analysis || aiParsed?.initialAnalysis || aiParsed?.analysis || aiParsed?.feedback || {};

    const initial_analysis = {
        welcome_message: str(aiRaw.welcome_message),
        sections_found: Array.isArray(aiRaw.foundSecs)
            ? aiRaw.foundSecs.map(str).filter(Boolean)
            : safeArr(aiRaw.sections_found).map(str).filter(Boolean),
        strengths: Array.isArray(aiRaw.qualityStrengths)
            ? aiRaw.qualityStrengths.map(str).filter(Boolean)
            : safeArr(aiRaw.strengths).map(str).filter(Boolean),
        improvements: Array.isArray(aiRaw.missingItems)
            ? aiRaw.missingItems.map(str).filter(Boolean)
            : safeArr(aiRaw.improvements).map(str).filter(Boolean),
        score: typeof aiRaw.baselineScore === 'number' ? aiRaw.baselineScore : 0
    };

    if (initial_analysis.sections_found.length === 0 && initial_analysis.improvements.length === 0) {
        console.log('⚠️ [V2-RESILIENT] AI analysis was empty, applying defensive defaults');
        initial_analysis.sections_found = ['Core profile sections (Experience, Education, Skills) identified'];
        initial_analysis.strengths = ['Solid background structure', 'Clear professional experience'];
        initial_analysis.improvements = ['Consider adding a custom LinkedIn URL', 'Optimize summary for target roles'];
        initial_analysis.score = 65;
        if (!initial_analysis.welcome_message && aiParsed?.personal?.full_name) {
            initial_analysis.welcome_message = `Welcome, ${str(aiParsed.personal.full_name)}! We've successfully processed your background.`;
        }
    }

    // ─── 2. Shared map helpers matching the frontend schema ─────────────────────

    // skills[].name + skills[].level (1-5)
    const mapNameLevel = (arr: any) => safeArr(arr).map((item: any) => ({
        name: typeof item === 'string' ? str(item) : str(item?.name),
        level: safeNum(item?.level ?? item?.rating)
    })).filter((i: any) => i.name);

    // generic name + description list (accomplishments, affiliations, etc.)
    const mapNameDescription = (arr: any) => safeArr(arr).map((item: any) => ({
        name: typeof item === 'string' ? str(item) : str(item?.name ?? item?.title ?? item?.organization),
        description: str(item?.description)
    })).filter((i: any) => i.name);

    // ─── 3. Personal fields (schema: personal.{...}) ────────────────────────────
    const p = aiParsed?.personal || {};

    const name = str(p.full_name ?? aiParsed?.name ?? aiParsed?.full_name);
    const email = str(p.email ?? aiParsed?.email);
    const phone = str(p.phone ?? aiParsed?.phone);
    const city = str(p.city ?? p.location);
    const country = str(p.country);
    const state = str(p.state);
    const zipCode = str(p.zipCode ?? p.zip_code);
    const linkedin = str(p.linkedin);
    const github = str(p.github);
    const website = str(p.website);
    const dob = str(p.dob ?? p.dateOfBirth ?? p.birthDate);
    const nationality = str(p.nationality);
    // const maritalStatus = str(p.maritalStatus ?? p.marital_status);
    // const visaStatus = str(p.visaStatus ?? p.visa_status);
    const gender = str(p.gender);
    const religion = str(p.religion);
    const passport = str(p.passport ?? p.passportNumber);
    const otherPersonal = str(p.otherPersonal ?? p.otherInformation);

    // ─── 4. Summary (schema: summary — HTML String) ──────────────────────────────
    const summary = str(aiParsed?.summary ?? p.summary ?? aiParsed?.profile)
        || (rawText ? rawText.substring(0, 300) : '');

    // ─── 5. Experience (schema: experience[].{title, company, location, isRemote, startMonth, startYear, isCurrent, endMonth, endYear, description}) ──
    const experienceSource = safeArr(aiParsed?.experiences ?? aiParsed?.experience);
    const experience = experienceSource.map((e: any) => ({
        title: str(e.title ?? e.role),
        company: str(e.company ?? e.employer ?? e.organization),
        location: str(e.location),
        isRemote: bool(e.isRemote ?? e.is_remote),
        startMonth: str(e.startMonth ?? e.start_month),
        startYear: str(e.startYear ?? e.start_year),
        isCurrent: bool(e.isCurrent ?? e.is_current ?? e.current),
        endMonth: str(e.endMonth ?? e.end_month),
        endYear: str(e.endYear ?? e.end_year),
        description: str(e.description)
    })).filter((e: any) => e.title || e.company);

    // profession: AI professional_headline → first experience title → empty
    const profession = str(p.professional_headline ?? p.profession) || str(experience[0]?.title);

    // ─── 6. Education (schema: education[].{degree, school, city, field, grade, startMonth, startYear, endMonth, endYear, description}) ──
    const education = safeArr(aiParsed?.education).map((ed: any) => ({
        degree: str(ed.degree),
        school: str(ed.school ?? ed.institution ?? ed.university),
        city: str(ed.city ?? ed.location),
        field: str(ed.field ?? ed.major ?? ed.course),
        grade: str(ed.grade ?? ed.gpa ?? ed.percentage),
        startMonth: str(ed.startMonth ?? ed.start_month),
        startYear: str(ed.startYear ?? ed.start_year),
        endMonth: str(ed.endMonth ?? ed.end_month),
        endYear: str(ed.endYear ?? ed.end_year),
        description: str(ed.description)
    })).filter((e: any) => e.school || e.degree);

    // ─── 7. Skills (schema: skills[].{name, level}) ─────────────────────────────
    const skills = mapNameLevel(aiParsed?.skills ?? aiParsed?.skill_list);
    const skillsDescription = skills.length > 0
        ? `<ul>${skills.map((s: any) => `<li>${s.name}</li>`).join('')}</ul>`
        : '';

    // ─── 8. Strengths & Additional Skills ───────────────────────────────────────
    const strengths = mapNameLevel(aiParsed?.strengths);
    const additionalSkills = mapNameLevel(aiParsed?.additionalSkills ?? aiParsed?.additional_skills);

    // ─── 9. Software (schema: software[].{name, rating, description}) ───────────
    const software = safeArr(aiParsed?.software).map((item: any) => ({
        name: typeof item === 'string' ? str(item) : str(item?.name),
        rating: safeNum(item?.rating ?? item?.level),
        description: str(item?.description)
    })).filter((i: any) => i.name);

    // ─── 10. Languages (schema: languages[].{name, level}) ──────────────────────
    const languages = mapNameLevel(aiParsed?.languages);

    // ─── 11. Projects (schema: projects[].{title, link, startYear, endYear, isCurrent, technologies, description}) ──
    const projects = safeArr(aiParsed?.projects).map((proj: any) => ({
        title: str(proj.title ?? proj.name),
        description: str(proj.description),
        technologies: safeArr(proj.technologies).map(str).filter(Boolean),
        startYear: str(proj.startYear ?? proj.start_year),
        endYear: str(proj.endYear ?? proj.end_year),
        isCurrent: bool(proj.isCurrent ?? proj.is_current),
        link: str(proj.link ?? proj.url ?? proj.github)
    })).filter((proj: any) => proj.title);

    // ─── 12. Certifications (schema: certifications[].{name, date, issuer, description}) ──
    const certifications = safeArr(aiParsed?.certifications).map((c: any) => ({
        name: str(c.name ?? c.certification ?? c.title),
        issuer: str(c.issuer ?? c.authority ?? c.provider),
        date: str(c.date ?? c.year),
        description: str(c.description)
    })).filter((c: any) => c.name);

    // ─── 13. Key Achievements (schema: keyAchievements[].{name, description}) ───
    const keyAchievements = mapNameDescription(aiParsed?.keyAchievements ?? aiParsed?.key_achievements);

    // ─── 14. Accomplishments (schema: accomplishments[].{name, description}) ─────
    const accomplishments = mapNameDescription(aiParsed?.accomplishments);

    // ─── 15. Affiliations (schema: affiliations[].{name, description}) ──────────
    const affiliations = mapNameDescription(aiParsed?.affiliations ?? aiParsed?.professional_affiliations);

    // ─── 16. Interests (schema: interests[] — Array<string>) ────────────────────
    // Normalize: AI may return strings or objects like { name: "..." }. Always flatten to plain strings.
    const interests = safeArr(aiParsed?.interests).map((item: any) =>
        typeof item === 'string' ? str(item) : str(item?.name ?? item?.interest)
    ).filter(Boolean);

    // ─── 17. Additional Info (schema: additionalInfo — HTML String) ──────────────
    const additionalInfo = str(
        aiParsed?.additionalInfo ?? aiParsed?.additional_info ?? aiParsed?.additionalInformation
    );

    // ─── 18. Websites (schema: websites[].{url, label, addToHeader}) ─────────────
    const websites = safeArr(aiParsed?.websites).map((w: any) => ({
        url: str(w?.url ?? w?.link),
        label: str(w?.label ?? w?.name ?? w?.title),
        addToHeader: bool(w?.addToHeader ?? w?.add_to_header)
    })).filter((w: any) => w.url);

    // ─── 19. Volunteering (extra fields kept for template renderers) ─────────────
    const volunteering = safeArr(aiParsed?.volunteering ?? aiParsed?.volunteer).map((v: any) => ({
        name: str(v.name ?? v.organization ?? v.title),
        organization: str(v.organization ?? v.company ?? v.name),
        title: str(v.title ?? v.role ?? v.cause),
        cause: str(v.cause ?? v.title ?? v.role),
        description: str(v.description),
        startYear: str(v.startYear ?? v.start_year),
        endYear: str(v.endYear ?? v.end_year),
        isCurrent: bool(v.isCurrent)
    })).filter((v: any) => v.name || v.organization);

    // ─── 20. Publications ────────────────────────────────────────────────────────
    const publications = safeArr(aiParsed?.publications).map((pub: any) => ({
        name: str(pub.name ?? pub.title),
        title: str(pub.title ?? pub.name),
        description: str(pub.description),
        date: str(pub.date ?? pub.year),
        publisher: str(pub.publisher ?? pub.journal)
    })).filter((pub: any) => pub.name || pub.title);

    // ─── 21. Awards ──────────────────────────────────────────────────────────────
    const awards = safeArr(aiParsed?.awards).map((a: any) => ({
        name: str(a.name ?? a.title),
        description: str(a.description),
        date: str(a.date ?? a.year),
        issuer: str(a.issuer ?? a.organization)
    })).filter((a: any) => a.name);

    // ─── 22. References — stored as a plain string ────────────────────────────────
    const referencesRaw = aiParsed?.references;
    const references = (typeof referencesRaw === 'string' && str(referencesRaw))
        ? str(referencesRaw)
        : 'Available upon request';

    // ─── 23. Custom Section (schema: customSection.{title, content, isVisible}) ──
    const csRaw = aiParsed?.customSection || aiParsed?.custom_section || {};
    const customSection = {
        title: str(csRaw.title),
        content: str(csRaw.content),
        isVisible: bool(csRaw.isVisible ?? csRaw.is_visible ?? (str(csRaw.content).length > 0))
    };
    // customSectionTitle — backward compatibility field
    const customSectionTitle = customSection.title;

    // ─── Return fully normalized, null-safe schema object ─────────────────────
    return {
        personal: {
            photo: '',
            name,
            email,
            phone,
            profession,
            linkedin,
            github,
            website,
            city,
            country,
            state,
            zipCode,
            dob,
            nationality,
            // maritalStatus,
            // visaStatus,
            gender,
            religion,
            passport,
            otherPersonal
        },
        summary,
        skills,
        skillsDescription,
        experience,
        projects,
        education,
        languages,
        strengths,
        additionalSkills,
        software,
        keyAchievements,
        accomplishments,
        volunteering,
        publications,
        awards,
        affiliations,
        interests,
        additionalInfo,
        websites,
        references,
        certifications,
        customSection,
        customSectionTitle,
        initial_analysis,
    };
}

export async function extractStructuredResume(text: string, meta?: any, user?: { id?: string; email?: string }): Promise<{ parsed: any; confidence: number; rawText?: string; isFallback?: boolean }> {
    console.log('🔍 [DEBUG] RAW EXTRACTED TEXT START', '—'.repeat(20));
    console.log(text);
    console.log('🔍 [DEBUG] RAW EXTRACTED TEXT END', '—'.repeat(20));

    if (meta?.info) {
        console.log('🔍 [DEBUG] PDF METADATA:', JSON.stringify(meta.info));
    }

    try {
        // --- Stealth Watermark Detection (Deeply Obfuscated REF Format) ---
        let originalScore: number | undefined;
        let isExternal = true;

        // Matches REF-<SALT>-<XOR_SCORE>-B0
        const watermarkRegex = /REF-([0-9A-F]{4})-([0-9A-F]{2})-B0/i;

        // 1. Try text layer
        let watermarkMatch = text.match(watermarkRegex);

        // 2. Try metadata (Keywords / Author / Title / Subject / XMP) if text layer failed
        if (!watermarkMatch && meta) {
            const info = meta.info || {};
            const keywordsMatch = String(info.Keywords || '').match(watermarkRegex);
            const authorMatch = String(info.Author || String(info.author || '')).match(watermarkRegex);
            const titleMatch = String(info.Title || '').match(watermarkRegex);
            const subjectMatch = String(info.Subject || '').match(watermarkRegex);
            const xmpMatch = meta.metadata ? String(meta.metadata).match(watermarkRegex) : null;

            watermarkMatch = keywordsMatch || authorMatch || titleMatch || subjectMatch || xmpMatch;

            if (watermarkMatch) {
                const source = keywordsMatch ? 'Keywords' : (authorMatch ? 'Author' : (titleMatch ? 'Title' : (subjectMatch ? 'Subject' : 'XMP Metadata')));
                console.log(`🎯 [DETECTION] Watermark found in METADATA (${source})`);
            }
        }

        if (watermarkMatch) {
            console.log(`🔎 [DETECTION] Obfuscated watermark found: "${watermarkMatch[0]}"`);
            try {
                const encrypted = watermarkMatch[2];
                // Decode: XOR with 0x7A
                const decodedScore = parseInt(encrypted, 16) ^ 0x7A;

                if (decodedScore >= 0 && decodedScore <= 100) {
                    originalScore = decodedScore;
                    isExternal = false;
                    console.log(`🎯 [DETECTION] Verified Gaplytiq Document! Decoded Score: ${originalScore}`);
                } else {
                    console.warn(`⚠️ [DETECTION] Decoded score out of range: ${decodedScore}`);
                }
            } catch (e) {
                console.warn(`❌ [DETECTION] Failed to parse obfuscated watermark`);
            }
        } else {
            console.log("🕵️ [DETECTION] No watermark sequence (REF-X) detected.");
        }

        const { data: parsedData, confidence } = await aiParseResumeText(text, originalScore, isExternal, user)
        console.log('🤖 [V2-RESILIENT] RAW AI DATA Snippet:', JSON.stringify(parsedData).slice(0, 500));

        const normalized = normalizeToSchema(parsedData, text)
        console.log('🏗️ [V2-RESILIENT] FINAL DATA PRODUCED:', JSON.stringify(normalized).slice(0, 300));

        const resumeSchema = {
            type: 'object',
            properties: {
                personal: { type: 'object' },
                summary: { type: 'string' }
            },
            required: ['personal']
        }
        const ajv = new Ajv()
        const validate = ajv.compile(resumeSchema)
        const valid = validate(normalized)
        if (!valid) console.warn('Normalized resume failed schema validation', validate.errors)

        return { parsed: normalized, confidence: confidence ?? 0.8, isFallback: false }
    } catch (err: any) {
        console.warn('AI parse failed in parser.extractStructuredResume', err?.message || err)
        const fallback = {
            personal: {
                photo: '',
                name: '',
                email: '',
                phone: '',
                profession: '',
                city: '',
                country: '',
                state: '',
                zipCode: '',
                linkedin: '',
                github: '',
                website: '',
                dob: '',
                nationality: '',
                // maritalStatus: '',
                // visaStatus: '',
                gender: '',
                religion: '',
                passport: '',
                otherPersonal: ''
            },
            summary: text ? text.substring(0, 300) : '',
            skills: [],
            skillsDescription: '',
            experience: [],
            projects: [],
            education: [],
            initial_analysis: {
                welcome_message: 'Welcome!',
                sections_found: ['AI Parse Fallback Activated'],
                strengths: ['File content extracted'],
                improvements: ['Retry AI analysis for better insights'],
                score: 50
            },
            languages: [],
            strengths: [],
            additionalSkills: [],
            software: [],
            keyAchievements: [],
            accomplishments: [],
            volunteering: [],
            publications: [],
            references: 'Available upon request',
            affiliations: [],
            websites: [],
            additionalInfo: '',
            interests: [],
            certifications: [],
            awards: [],
            customSection: { title: '', content: '', isVisible: false },
            customSectionTitle: ''
        }
        return { parsed: fallback, confidence: 0, rawText: text, isFallback: true }
    }
}

export default {
    parsePdfBuffer,
    parseDocxBuffer,
    extractStructuredResume
}
