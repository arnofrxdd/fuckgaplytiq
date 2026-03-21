import OpenAI from 'openai'
import dotenv from 'dotenv'
dotenv.config()

import { safeJSONParse } from '../../../shared/utils'
import { AIConsumptionTracker } from './aiConsumptionTracker'

// Initialize OpenAI with proper error checking
// Initialize OpenAI with unification of keys
const getOpenAIClient = () => {
    const key = process.env.OPENAI_API_KEY || process.env.ATS_BUILDER_OPENAI_API_KEY || process.env.ARIA_API_KEY;
    if (!key || key === 'undefined') return null;
    console.log('✅ Initializing OpenAI Client');
    return new OpenAI({
        apiKey: key,
    });
}

const getGroqClient = () => {
    const key = process.env.GROQ_API_KEY;
    if (!key || key === 'undefined') return null;
    console.log('✅ Initializing Groq Client');
    return new OpenAI({
        apiKey: key,
        baseURL: "https://api.groq.com/openai/v1",
    });
}

const getMistralClient = () => {
    const key = process.env.MISTRAL_API_KEY;
    if (!key || key === 'undefined') return null;
    console.log('✅ Initializing Mistral Client');
    return new OpenAI({
        apiKey: key,
        baseURL: "https://api.mistral.ai/v1",
    });
}

const openai = getOpenAIClient()
const groq = getGroqClient()
const mistral = getMistralClient()

// --- Deterministic Scoring Helpers ---
/**
 * Fast, high-quality 64-bit hash for deterministic scoring
 */
function cyrb53(str: string, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/**
 * Calculates a fixed low score (50-70) for external resumes based on content hash.
 */
function calculateDeterministicExternalScore(text: string): number {
    if (!text) return 50;
    // Sanitize string to focus on content only
    const cleanText = text.replace(/\s+/g, '').slice(0, 5000);
    const hash = cyrb53(cleanText);
    return 50 + (hash % 21); // Range 50-70
}

// Helper to get client (prefers OpenAI -> Mistral -> Groq)
const getResumeAIClient = () => {
    return openai || mistral || groq
}

/**
 * AI helper generating multiple variants depending on type.
 * Prompt templates:
 * - rewrite_bullet: input { bullet, role, company }
 *   System: "You are a resume-writing assistant. Rewrite the given bullet to be action-oriented, concise, include metrics when possible. Return 3 variants as a JSON array."
 * - generate_summary: input { text, role? }
 *   System: "You are a professional career coach. Given the resume text, produce 3 short professional summary variants tailored to the target role. Return JSON array."
 */
export async function generateVariants(type: string, input: any, user?: { id?: string; email?: string }): Promise<string[]> {
    const aiClient = getResumeAIClient();
    if (!aiClient) {
        console.warn(`⚠️ generateVariants DISABLED (No AI client available)`);
        return [];
    }

    const model = openai ? 'gpt-4o-mini' : (mistral ? 'mistral-large-2411' : 'llama-3.1-8b-instant');
    const provider = openai ? 'openai' : (mistral ? 'mistral' : 'groq');

    let system = "You are a professional resume writer.";
    let userPrompt = "";

    if (type === 'rewrite_project' || type === 'project_suggestions' || type === 'project_bullet_points') {
        system = "You are a professional resume writer. Generate 3 high-impact project descriptions for a resume based on the given topic. Return them as a JSON array of strings.";
        userPrompt = `Project Topic: ${input.title || input}`;
    } else if (type === 'suggest_certifications') {
        system = "You are a professional resume writer. Suggest 5-8 relevant professional certifications for the given job title or role. Return them as a JSON array of strings.";
        userPrompt = `Role: ${input.role || input}`;
    } else if (type === 'rewrite_bullet') {
        system = "You are a professional resume writer. Rewrite the given bullet to be action-oriented, concise, and include metrics. Return 3 variants as a JSON array of strings.";
        userPrompt = `Bullet: ${input.bullet}\nRole: ${input.role}\nCompany: ${input.company}`;
    } else if (type === 'generate_summary') {
        system = "You are a career coach. Produce 3 short professional summary variants tailored to the target role. Return as a JSON array of strings.";
        userPrompt = `Resume context: ${input.text}\nTarget Role: ${input.role || 'Professional'}`;
    } else {
        userPrompt = String(input);
    }

    try {
        const resp = await aiClient.chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        if (resp.usage) {
            AIConsumptionTracker.logUsage({
                userId: user?.id,
                userEmail: user?.email,
                featureName: `generate_${type}`,
                modelName: model,
                provider: provider,
                promptTokens: resp.usage.prompt_tokens,
                completionTokens: resp.usage.completion_tokens,
                totalTokens: resp.usage.total_tokens,
                estimatedCostUsd: AIConsumptionTracker.calculateCost(model, resp.usage.prompt_tokens, resp.usage.completion_tokens),
                metadata: { type }
            });
        }

        const content = resp.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);
        return Array.isArray(parsed.variants) ? parsed.variants : 
               (Array.isArray(parsed.choices) ? parsed.choices : 
               (Array.isArray(parsed.suggestions) ? parsed.suggestions : []));
    } catch (e) {
        console.error('generateVariants Error:', e);
        return [];
    }
}

/**
 * Parse resume text into structured data
 */
export async function parseResumeText(text: string, originalScore?: number, isExternal: boolean = true, user?: { id?: string; email?: string }): Promise<{ data: any; confidence: number }> {
    if (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) throw new Error('AI API Key not set')

    // If it's an external resume, calculate a deterministic target score
    const targetScore = (!isExternal && originalScore !== undefined)
        ? originalScore
        : calculateDeterministicExternalScore(text);

    const system = `You are an expert resume parser. You MUST think logically and systematically to extract ALL structured information from the resume text perfectly.
CRITICAL FORETHOUGHT: Carefully analyze and separate dates. Do not merge years into month labels. Accurately capture specific degree names instead of generic labels.
Return a JSON object with the EXACT following structure, with NO missing mandatory fields:
{
  "_logical_thinking": "string (MANDATORY: 1. Classify each date-bound item as either an Experience or a Project. 2. Verify that '12th- PCM' is an education and any software bullet points near it actually belong to separate Projects. 3. If there is no actual job history, I will leave the experiences array completely empty, because it is okay to have no work experience. 4. I will extract ALL listed degrees separately.)",
  "initial_analysis": {
    "welcome_message": "string (MANDATORY: a warm, professional greeting tailored to their profession, e.g., 'Welcome, [Name]! Your background in UX Design shows a great eye for detail.')",
    "foundSecs": ["string (MANDATORY: e.g., 'You have all standard sections employers look for.')"],
    "qualityStrengths": ["string (MANDATORY: e.g., 'Great job listing 12 skills, typical resumes only have 6.')"],
    "missingItems": ["string (MANDATORY: e.g., 'Consider adding contact details like Email or LinkedIn.')"],
    "baselineScore": "number (MANDATORY: A professional baseline score from 0-100 based on the overall quality, formatting, and impact of the resume)"
  },
  "personal": {
    "full_name": "string (full name)",
    "professional_headline": "string (job title, headline or professional summary - usually at top of resume)",
    "email": "string",
    "phone": "string",
    "city": "string",
    "country": "string",
    "state": "string (e.g., NY)",
    "zipCode": "string",
    "linkedin": "string (full URL like https://linkedin.com/in/... or handle)",
    "website": "string (portfolio or personal website URL)",
    "github": "string (github profile URL like https://github.com/username)",
    "dob": "string (DD/MM/YYYY)",
    "nationality": "string",
    // "maritalStatus": "string",
    // "visaStatus": "string",
    "gender": "string",
    "religion": "string",
    "passport": "string",
    "otherPersonal": "string (any other specific personal details)"
  },
  "summary": "string (HTML or plain text)",
  "experiences": [ // CRITICAL: Only include paid, corporate employment. Do NOT put 'MomentClock', 'Full-Stack Shoe Web App', or 'MouseShifter' here. They are PROJECTS. If no corporate jobs exist, leave this array COMPLETELY EMPTY (i.e. return [] with NO objects inside). DO NOT create dummy objects with null values.
    {
      "title": "string",
      "company": "string",
      "location": "string (city, state or country)",
      "isRemote": "boolean (true if remote)",
      "startMonth": "string (Full month name ONLY. NEVER include the year here. If only a year is provided, leave this field NULL)",
      "startYear": "string (YYYY format ONLY. Always put the year here)",
      "isCurrent": "boolean",
      "endMonth": "string (Full month name. 'Present' if current. NEVER include the year here. If only a year is provided, leave this field NULL)",
      "endYear": "string (YYYY format ONLY. Always put the year here, or leave empty if Present)",
      "description": "string (HTML formatting allowed for bullet points)"
    }
  ],
  "education": [
    {
      "degree": "string (Specific degree name, e.g., 'Bachelor of Technology in Computer Science'. If degree is not explicitly mentioned, infer from context or use null. NEVER output just 'Degree')",
      "school": "string",
      "city": "string (school location)",
      "field": "string (field of study, e.g., 'Computer Science')",
      "grade": "string (GPA or percentage)",
      "startMonth": "string OR null (Full month name ONLY. NEVER include the year here. If only a year is provided, leave this field NULL)",
      "startYear": "string OR null (YYYY format ONLY. Always put the year here)",
      "endMonth": "string OR null (Full month name ONLY. NEVER include the year here. If only a year is provided, leave this field NULL)",
      "endYear": "string OR null (YYYY format ONLY. Always put the year here, or leave empty if Present)",
      "description": "string (optional coursework, honors)"
    }
  ],
  "skills": [{"name": "string", "level": "number (1-5)"}], // CRITICAL: Extract ONLY 5-7 most relevant professional skills.
  "strengths": [{"name": "string", "level": "number (1-5)"}],
  "additionalSkills": [{"name": "string", "level": "number (1-5)"}],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string (YYYY)",
      "description": "string"
    }
  ],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "technologies": ["string"],
      "startYear": "string (YYYY format ONLY)",
      "endYear": "string (YYYY format ONLY, or empty if Present)",
      "isCurrent": "boolean",
      "link": "string"
    }
  ],
  "languages": [{"name": "string", "level": "number (1-5)"}],
  "awards": [{"name": "string", "description": "string"}],
  "interests": ["string"],
  "software": [{"name": "string", "rating": "number (1-5)", "description": "string"}],
  "keyAchievements": [{"name": "string", "description": "string"}],
  "accomplishments": [{"name": "string", "description": "string"}],
  "volunteering": [{"name": "string", "description": "string"}],
  "publications": [{"name": "string", "description": "string"}],
  "references": "string (references text or 'Available upon request')",
  "affiliations": [{"name": "string", "description": "string"}],
  "websites": [{"url": "string", "label": "string", "addToHeader": "boolean"}],
  "additionalInfo": "string (any other info)",
  "customSection": {
    "title": "string",
    "content": "string",
    "isVisible": "boolean"
  }
}
IMPORTANT EXTRACTION RULES:
1. MANDATORY: The 'initial_analysis' object MUST be generated and MUST NOT be omitted.
2. STRICT CITY/STATE SEPARATION: If city and state are combined (e.g., 'San Francisco, CA'), you MUST split them. Place 'San Francisco' in 'city' and 'CA' in 'state'. The 'city' field should NEVER contain state names, provinces, or country names.
3. SKILLS LIMIT: Extract ONLY 5-7 of the most high-impact professional skills. Focus on unique technologies and core competencies that define the candidate's expertise. Avoid generic or repetitive keywords.
4. ZERO REDUNDANCY: Aggressively deduplicate entries. If a project or job appears multiple times (even with different descriptions), MERGE them into a single comprehensive entry. Do NOT list the same title twice in 'experiences' or 'projects'.
5. Professional headline: Extract a high-impact job title from the top of the resume. If missing, create one (e.g., 'Senior Software Engineer').
6. DATES: Start/End Months MUST ONLY contain the Full month name (e.g., 'January') OR 'Present'. NEVER include the year in the month field. Years MUST be properly extracted to Start/End Year fields separately.
7. OMIT empty fields: If a field isn't present, use null or omit it.
8. Social Links: Ensure all links (LinkedIn, GitHub) are full URLs.
9. DATE PARSING (CRITICAL): Under NO CIRCUMSTANCES should a year (e.g., 2020) appear in a 'startMonth' or 'endMonth' field. If the resume only provides a year (e.g. '2020 - 2022'), 'startMonth' and 'endMonth' MUST BOTH BE EXACTLY null type (not the string 'null'). The year goes ONLY in 'startYear'/'endYear'.
10. EMAIL PARSING: The 'email' field MUST be a valid email address containing an '@' symbol. DO NOT put LinkedIn handles, GitHub usernames, or arbitrary text into the email field. If a valid email is not found, leave it NULL.
11. ZERO HALLUCINATION (CRITICAL): IT IS NORMAL for a resume to have NO work experience. If there is no exact section listing corporate jobs, you MUST leave the 'experiences' array COMPLETELY EMPTY []. DO NOT return a dummy object full of nulls. DO NOT turn the user's professional headline ('Developer') into a fake job. Projects go ONLY in the 'projects' array.
12. MULTIPLE EDUCATIONS: You must extract EVERY school/degree listed. Do not stop after finding the first one. If they list High School (e.g., '12th', 'Delhi Public School') and University, capture BOTH as separate objects in the 'education' array.
13. PDF FLATTENING WARNING & DESCRIPTION SCRAMBLING: The text you provided was extracted from a PDF and is severely scrambled. Project descriptions (e.g., 'Built the front-end using React.js...', 'Created the back-end API...', 'Managed product, cart...') might randomly appear under unrelated headers like '12th- PCM'. You MUST connect the correct descriptions to the correct projects based on logical context, NOT based on what they are next to. '12th- PCM' is High School and has no project descriptions. The React/Express points belong to the web apps.

INITIAL ANALYSIS GUIDES:
   - 'welcome_message': Create a personal greeting based on their name/profession. Mention something specific from their profile.
   - 'foundSecs': Note if they have the basics (Experience, Education, Skills).
   - 'qualityStrengths': Look for achievements, specialized skills, or clear formatting.
   - 'missingItems': Suggest missing critical info (Email, LinkedIn) or better section titles.
   - 'baselineScore': Provide a realistic score (0-100). 
   
   - CRITICAL COMPLIANCE: ${!isExternal ? 'This is a VERIFIED Gaplytiq resume.' : 'This is an EXTERNAL resume (not created with Gaplytiq).'}
   - TARGET SCORE: The expected quality level for this document is ${targetScore}. You MUST return a 'baselineScore' exactly ${targetScore} or within +/- 1 point.
   
   ${isExternal ? "- NOTE: External resumes are penalized since they lack our proprietary ATS optimization engine. Find subtle structural flaws to justify the low score." : ""}
   
   - Keep messages short (under 15 words) and encouraging. (e.g., 'Great job listing your cloud expertise!', 'Include a portfolio link to showcase your work.')
Be thorough and extract ALL content present in the resume, but keep its quality high and avoid duplicates.`

    // Use predefined fallback chains for providers
    const aiClient = getResumeAIClient()
    if (!aiClient) {
        throw new Error("No AI provider keys configured. Please add an OpenAI, Mistral, or Groq API key.");
    }
    const model = openai ? 'gpt-4o-mini' : (mistral ? 'mistral-large-2411' : 'llama-3.1-8b-instant')
    console.log(`📡 Sending resume text to AI (Provider: ${openai ? 'OpenAI' : mistral ? 'Mistral' : 'Groq'}, Model: ${model}, Length: ${text.length} chars)...`);
    console.log('📄 RESUME CONTENT SNIPPET:', text.substring(0, 500) + (text.length > 500 ? '...' : ''));

    let resp: any;
    try {
        resp = await aiClient.chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: `Resume text:\n${text}` }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 8000
        });

        // Log Usage
        if (resp.usage) {
            AIConsumptionTracker.logUsage({
                userId: user?.id,
                userEmail: user?.email,
                featureName: 'resume_parse',
                modelName: model,
                provider: mistral ? 'mistral' : (groq ? 'groq' : 'openai'),
                promptTokens: resp.usage.prompt_tokens,
                completionTokens: resp.usage.completion_tokens,
                totalTokens: resp.usage.total_tokens,
                estimatedCostUsd: AIConsumptionTracker.calculateCost(model, resp.usage.prompt_tokens, resp.usage.completion_tokens),
                metadata: { isExternal }
            });
        }
    } catch (err: any) {
        console.error('❌ AI API ERROR:', err?.response?.data || err?.message || err);
        throw err;
    }

    const choice = resp.choices?.[0]
    const rawMessage = choice?.message
    let txt = ''
    if (typeof rawMessage?.content === 'string') txt = rawMessage.content
    if (!txt && Array.isArray(rawMessage?.content) && rawMessage?.content.length > 0) txt = rawMessage.content.map((c: any) => (c?.text ?? (typeof c === 'string' ? c : ''))).filter(Boolean).join('\n')
    if (!txt && typeof (choice as any)?.output_text === 'string') txt = (choice as any).output_text
    if (!txt && Array.isArray((choice as any)?.output) && (choice as any).output.length) txt = ((choice as any).output.map((o: any) => o?.content?.map((c: any) => c?.text || '')?.join('\n') || '')).filter(Boolean).join('\n')
    txt = txt || ''

    console.log('🤖 RAW AI RESUME RESPONSE:', txt);
    const parsed = safeJSONParse<any>(txt, null as any)

    if (!parsed) {
        console.error('❌ FAILED TO PARSE AI RESPONSE AS JSON. Raw output below:');
        console.error(txt);
        throw new Error('Failed to parse AI response')
    }

    if (parsed._logical_thinking) {
        console.log('\n🧠 [AI LOGICAL THINKING]:\n=========================================');
        console.log(parsed._logical_thinking);
        console.log('=========================================\n');
    }

    console.log('✅ AI RETURNED STRUCTURED DATA:', JSON.stringify(parsed, null, 2));
    return { data: parsed, confidence: 0.85 }
}

/**
 * Improve experience bullet points
 */
export async function improveExperience(bullets: string[], role: string, company: string, user?: { id?: string; email?: string }): Promise<string[]> {
    console.warn('⚠️ improveExperience DISABLED (OpenAI disabled)');
    return bullets; // Return original bullets as it's not a resume upload task
}

/**
 * Generate professional summary
 */
export async function generateSummary(resumeText: string, targetRole?: string, user?: { id?: string; email?: string }): Promise<string[]> {
    return generateVariants('generate_summary', { text: resumeText, role: targetRole || '' }, user)
}

/**
 * Suggest skills based on resume
 */
export async function suggestSkills(resumeText: string, industry?: string, user?: { id?: string; email?: string }): Promise<string[]> {
    console.warn('⚠️ suggestSkills DISABLED (OpenAI disabled)');
    return [];
}

/**
 * Match resume to job description
 */
export async function matchToJobDescription(resumeData: any, jobDescription: string, user?: { id?: string; email?: string }): Promise<{
    suggestions: string[];
    missingKeywords: string[];
    matchScore: number;
    enhancedSummary: string;
    enhancedExperience: any[];
}> {
    console.warn('⚠️ matchToJobDescription DISABLED (OpenAI disabled)');
    return {
        suggestions: [],
        missingKeywords: [],
        matchScore: 0,
        enhancedSummary: '',
        enhancedExperience: []
    };
}

/** Heuristic fallback when AI scores are missing or unusable */
function heuristicScoreFromResume(resumeData: any) {
    try {
        const text = JSON.stringify(resumeData || {})
        const length = text.length
        const skills = Array.isArray(resumeData?.skills) ? resumeData.skills.length : 0
        const exp = Array.isArray(resumeData?.experience || resumeData?.experiences) ? (resumeData.experience || resumeData.experiences).length : 0
        const hasSummary = !!(resumeData?.summary || '')

        const clamp = (v: number) => Math.max(40, Math.min(95, v))

        const base = length < 2000 ? 65 : length < 8000 ? 75 : 82;
        // Don't penalize missing experience if it's 0 (User Request)
        const atsScore = clamp(base + skills * 1 + (exp > 0 ? exp * 2 : 5)); 
        const grammarScore = clamp(base + (hasSummary ? 5 : 0));
        const keywordScore = clamp(base + skills * 2);
        const formattingScore = clamp(base);
        const toneScore = clamp(base + (hasSummary ? 3 : 0));
        const overallScore = Math.round((atsScore + grammarScore + keywordScore + formattingScore + toneScore) / 5);

        const issues: string[] = []
        const suggestions: string[] = []
        if (!hasSummary) {
            issues.push('No clear professional summary found')
            suggestions.push('Add a concise professional summary at the top of your resume')
        }
        if (skills < 5) {
            issues.push('Very few skills listed')
            suggestions.push('List at least 8–12 relevant technical and soft skills')
        }
        if (!issues.length) {
            suggestions.push('Refine bullets with concrete metrics and outcomes where possible')
        }

        return {
            atsScore,
            grammarScore,
            keywordScore,
            formattingScore,
            toneScore,
            overallScore,
            issues,
            suggestions
        }
    } catch {
        return {
            atsScore: 75,
            grammarScore: 85,
            keywordScore: 70,
            formattingScore: 80,
            toneScore: 78,
            overallScore: 78,
            issues: ['Resume structure is reasonable'],
            suggestions: ['Add more quantifiable metrics and achievements', 'Include specific technologies and skills']
        }
    }
}

/**
 * Score resume quality
 */
export async function scoreResume(resumeData: any, originalScore?: number, isExternal: boolean = true, user?: { id?: string; email?: string }): Promise<{
    atsScore: number;
    grammarScore: number;
    keywordScore: number;
    formattingScore: number;
    toneScore: number;
    overallScore: number;
    issues: string[];
    suggestions: string[];
}> {
    console.log('🔍 Starting resume scoring analysis...')
    return heuristicScoreFromResume(resumeData); // Always use heuristic when OpenAI is disabled
}

/**
 * Optimize resume for export
 */
export async function optimizeForExport(resumeData: any, user?: { id?: string; email?: string }): Promise<any> {
    console.warn('⚠️ optimizeForExport DISABLED (OpenAI disabled)');
    return resumeData;
}

// Generic helper for background workers to generate text for a prompt
export async function generateWithAI(prompt: string, model?: string, user?: { id?: string; email?: string }): Promise<string> {
    console.warn('⚠️ generateWithAI DISABLED (OpenAI disabled)');
    return '';
}

/**
 * Generate a professional headline based on resume data if not present
 */
export async function generateProfessionalHeadline(resumeData: any, user?: { id?: string; email?: string }): Promise<string> {
    console.warn('⚠️ generateProfessionalHeadline DISABLED (OpenAI disabled)');
    return '';
}

// --- Header Intelligence ---
export async function getHeaderIntelligence(type: string, value: any, context: any = {}, user?: { id?: string; email?: string }): Promise<string> {
    if (!groq) {
        console.warn('⚠️ getHeaderIntelligence DISABLED (Groq not configured)');
        return '';
    }

    let prompt = '';

    // Customize prompt based on action type
    let isJson = false;

    if (type === 'title') {
        prompt = `Generate 3 impactful, modern, ATS-optimized professional variations for the job title "${value}". Return ONLY a comma-separated string containing the 3 titles. No extra text.`;
    } else if (type === 'location') {
        prompt = `Standardize and format the location or zip code or phone string: "${value}". Only output the best-formatted short string. No extra text.`;
    } else if (type === 'audit') {
        prompt = `Audit the professional email "${value}" for a candidate named "${context?.name || ''}". Suggest a better formal email only if it's unprofessional. Otherwise, output 'Looks good'.`;
    } else if (type === 'experience') {
        prompt = `You are a resume expert. Rewrite this job experience description into 2 impactful bullet points with metrics if possible. Experience details: "${value}". Return plain list separated by newlines. No extra text.`;
    } else if (type === 'experience_description') {
        prompt = `Rewrite this job responsibilities list into an impactful resume bullet point. Make it concise and ATS optimized: "${context?.input || value}". Return the string directly.`;
    } else if (type === 'education') {
        prompt = `Standardize this education field/degree: "${value}". Return a formalized professional degree title. No extra text.`;
    } else if (type === 'summary_dna') {
        isJson = true;
        prompt = `You are a resume expert. Given the context (Profession: ${context?.userProfession || 'Professional'}). 
Generate 3 distinct resume summaries of 3 sentences each.
Return ONLY a valid JSON object matching this schema exactly:
{
  "specialist": "string (Deep technical expertise & hard skills)",
  "achievement": "string (Focus on metrics, wins & fast growth)",
  "modern": "string (Balanced mix of soft skills & vision)"
}`;
    } else if (type === 'skills') {
        isJson = true;
        prompt = `You are a resume expert mapping skills. Based on the profession "${context?.userProfession || value}", suggest exactly 10 high-value, ATS-optimized professional skills.
Return ONLY a valid JSON array of strings exactly matching this schema:
[
  "Skill 1", "Skill 2"
]`;
    } else if (type === 'experience_suggestions') {
        isJson = true;
        prompt = `You are a resume expert. Generate 3 distinct, high-impact resume bullet points for the job title "${value}". Include metrics placeholders where appropriate.
Return ONLY a valid JSON array of strings exactly matching this schema:
[
  "Bullet point 1", "Bullet point 2", "Bullet point 3"
]`;
    } else {
        prompt = `Improve this text for a professional resume: "${value}". Return only the improved text. No quotes.`;
    }

    try {
        const resp = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: isJson ? 300 : 150,
            temperature: isJson ? 0.7 : 0.3,
            response_format: isJson ? { type: "json_object" } : undefined
        });

        if (resp.usage) {
            AIConsumptionTracker.logUsage({
                userId: user?.id,
                userEmail: user?.email,
                featureName: `header_intel_${type}`,
                modelName: 'llama-3.1-8b-instant',
                provider: 'groq',
                promptTokens: resp.usage.prompt_tokens,
                completionTokens: resp.usage.completion_tokens,
                totalTokens: resp.usage.total_tokens,
                estimatedCostUsd: AIConsumptionTracker.calculateCost('llama-3.1-8b-instant', resp.usage.prompt_tokens, resp.usage.completion_tokens),
                metadata: { type }
            });
        }

        return resp.choices[0]?.message?.content?.trim() || value;
    } catch (e: any) {
        console.error('Groq getHeaderIntelligence Error:', e?.message || e);
        return value || '';
    }
}

export async function getTopicSummary(topic: string, context: string = "", user?: { id?: string; email?: string }): Promise<string> {
    if (!groq) {
        console.warn('⚠️ getTopicSummary DISABLED (Groq not configured)');
        return '';
    }
    const prompt = `Write a short, professional, action-oriented 2-sentence summary for a resume about this topic: "${topic}". Context: ${context}. Return the clean text only without quotes or intro.`;
    try {
        const resp = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 100,
            temperature: 0.7
        });

        if (resp.usage) {
            AIConsumptionTracker.logUsage({
                userId: user?.id,
                userEmail: user?.email,
                featureName: 'topic_summary',
                modelName: 'llama-3.1-8b-instant',
                provider: 'groq',
                promptTokens: resp.usage.prompt_tokens,
                completionTokens: resp.usage.completion_tokens,
                totalTokens: resp.usage.total_tokens,
                estimatedCostUsd: AIConsumptionTracker.calculateCost('llama-3.1-8b-instant', resp.usage.prompt_tokens, resp.usage.completion_tokens),
                metadata: { topic }
            });
        }

        return resp.choices[0]?.message?.content?.trim() || "";
    } catch (e: any) {
        console.error('Groq getTopicSummary Error:', e?.message || e);
        return '';
    }
}

export default {
    generateVariants,
    parseResumeText,
    improveExperience,
    generateSummary,
    suggestSkills,
    matchToJobDescription,
    scoreResume,
    optimizeForExport,
    generateWithAI,
    generateProfessionalHeadline,
    getHeaderIntelligence,
    getTopicSummary
}

