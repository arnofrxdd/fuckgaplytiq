import OpenAI from 'openai';

import {
    AiraChoice,
    AiraResult,
    SECTION_SCHEMAS,
    SectionKey,
    IMPORTANT_FIELDS,
    SECTION_TO_STEP
} from './airaSchema';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deep merge helper — used to keep currentData fresh between worker calls
 * within the same turn (multi-section updates).
 */
function deepMerge(base: any, patch: any): any {
    const result = { ...base };
    for (const key of Object.keys(patch)) {
        if (
            patch[key] !== null &&
            typeof patch[key] === 'object' &&
            !Array.isArray(patch[key]) &&
            typeof result[key] === 'object' &&
            !Array.isArray(result[key])
        ) {
            result[key] = deepMerge(result[key] || {}, patch[key]);
        } else {
            result[key] = patch[key];
        }
    }
    return result;
}

/**
 * Sleep helper — used to pace multi-section updates for a better UI experience.
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Builds a concise resume summary for the supervisor.
 * For list sections, reports the item count and which important fields
 * are missing across ALL items (not just the top-level object).
 */
function buildResumeSummary(currentData: any): object {
    const summary: Record<string, any> = {};

    for (const section of Object.keys(SECTION_SCHEMAS) as SectionKey[]) {
        const schema = SECTION_SCHEMAS[section];
        const sectionData = currentData?.[section] || {};

        if (schema.isListSection) {
            const items: any[] = sectionData.items || [];
            summary[section] = {
                itemCount: items.length,
                // A list section is "complete enough" if it has at least one item
                // with all important fields filled
                hasCompleteItem: items.some(item =>
                    (IMPORTANT_FIELDS[section] ?? []).every(f => item[f])
                ),
                missingImportant: items.length === 0
                    ? (IMPORTANT_FIELDS[section] ?? [])
                    : []
            };
        } else {
            const filled = Object.keys(sectionData).filter(k => sectionData[k]);
            const missingImportant = (IMPORTANT_FIELDS[section] ?? []).filter(k => !sectionData[k]);
            summary[section] = { filledCount: filled.length, missingImportant };
        }
    }

    return summary;
}

/** Validates a patch object against section validators. Returns list of issues. */
function validatePatch(section: SectionKey, patch: Record<string, any>): string[] {
    const validators = (SECTION_SCHEMAS[section] as any).validators || {};
    const issues: string[] = [];

    // For list sections, validate each item individually
    if (patch.items && Array.isArray(patch.items)) {
        for (const item of patch.items) {
            for (const [field, value] of Object.entries(item)) {
                if (
                    typeof value === 'string' &&
                    value !== '' &&
                    validators[field] &&
                    !validators[field](value)
                ) {
                    issues.push(`"${field}" looks invalid: ${value}`);
                }
            }
        }
        return issues;
    }

    for (const [field, value] of Object.entries(patch)) {
        if (
            typeof value === 'string' &&
            value !== '' &&
            validators[field] &&
            !validators[field](value)
        ) {
            issues.push(`"${field}" looks invalid: ${value}`);
        }
    }
    return issues;
}

/**
 * Returns missing important fields for a section after a patch is applied.
 * Handles both object sections and list sections.
 */
function getMissingImportant(section: SectionKey, currentData: any, patch: any): string[] {
    const schema = SECTION_SCHEMAS[section];

    if (schema.isListSection) {
        const items: any[] = patch.items || currentData?.[section]?.items || [];
        if (items.length === 0) return IMPORTANT_FIELDS[section] ?? [];
        // If at least one item has all important fields, we're good
        const hasComplete = items.some(item =>
            (IMPORTANT_FIELDS[section] ?? []).every(f => item[f])
        );
        return hasComplete ? [] : (IMPORTANT_FIELDS[section] ?? []);
    }

    const merged = { ...(currentData?.[section] || {}), ...patch };
    return (IMPORTANT_FIELDS[section] ?? []).filter(k => !merged[k]);
}

/**
 * Strips the `confidence` field from any item inside a list-section patch.
 * The worker is instructed not to include it inside items[], but we defensively
 * clean it up here as well.
 */
function sanitizePatch(patch: any): any {
    if (!patch) return patch;
    const clean = { ...patch };

    if (clean.items && Array.isArray(clean.items)) {
        clean.items = clean.items.map(({ confidence: _conf, ...item }: any) => item);
    }

    return clean;
}

/**
 * Builds a "nuke" patch that wipes every field in every section.
 * For list sections → items: []
 * For object sections → every known field set to ""
 */
function buildNukePatch(): Record<string, any> {
    const patch: Record<string, any> = {};
    for (const section of Object.keys(SECTION_SCHEMAS) as SectionKey[]) {
        const schema = SECTION_SCHEMAS[section];
        if (schema.isListSection) {
            patch[section] = { items: [] };
        } else {
            const cleared: Record<string, string> = {};
            for (const field of Object.keys(schema.fields)) {
                cleared[field] = '';
            }
            patch[section] = cleared;
        }
    }
    return patch;
}

// ─────────────────────────────────────────────────────────────────────────────
// Model 2: Worker
// ─────────────────────────────────────────────────────────────────────────────

async function runWorkerTask(
    client: OpenAI,
    section: SectionKey,
    task: string,
    sectionData: any
): Promise<{ patch: any; confidence: number; report: string }> {
    const schema = SECTION_SCHEMAS[section];

    const systemPrompt = `You are a high-precision Resume Data Worker for the "${section}" section.

SCHEMA:
${JSON.stringify(schema.fields, null, 2)}

CURRENT DATA FOR THIS SECTION:
${JSON.stringify(sectionData || {}, null, 2)}

RULES:
1. Return ONLY a JSON object with fields that actually changed. Skip unchanged fields.
2. Include a top-level "confidence" field (0.0–1.0):
   - 1.0 = user stated it explicitly and clearly
   - 0.7 = reasonable inference (e.g. "studied at VIT" → school: "VIT", isCurrent: true)
   - below 0.5 = guessing — omit the field instead
3. If the task is impossible or invalid, return { "error": "reason" }.
4. No prose, no markdown — pure JSON only.
5. For LIST sections (Education):
   - Return the COMPLETE updated items array in the "items" field.
   - NEVER invent degree/field values if not mentioned — leave them null or omit them.
   - NEVER put "confidence" inside individual item objects — only at the top level.
   - Preserve all existing items unless the task explicitly modifies or removes them.
   - isCurrent rules — follow exactly:
     * If user says "currently", "right now", "still studying", "enrolled", "pursuing" → set isCurrent: true AND leave endYear as null. Never invent an endYear when isCurrent is true.
     * If user gives an explicit end year → set isCurrent: false and set endYear to that value.
     * If neither is clear → omit both isCurrent and endYear entirely. Do NOT guess.
   - NEVER invent an endYear. If the user did not state one, leave it null or omit it.
   - Example of correct output for a current student:
     { "confidence": 1.0, "items": [{ "school": "Georgia Tech", "degree": "MS", "field": "Computer Science", "isCurrent": true, "endYear": null }] }
   - Example of correct output for a graduate:
     { "confidence": 1.0, "items": [{ "school": "MIT", "degree": "B.S.", "field": "CS", "endYear": 2022, "isCurrent": false }] }
6. For OBJECT sections (Personal): return only changed fields as key/value pairs.
   To clear a field, return it as "".
7. Clearing data is valid — never refuse it.
8. Formatting: capitalize proper nouns, lowercase emails, no trailing whitespace.

TASK: ${task}`;

    const response = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0,
        response_format: { type: 'json_object' }
    });

    const raw = response.choices[0].message.content || '{}';
    let result: any;

    try {
        result = JSON.parse(raw);
    } catch {
        return { patch: null, confidence: 0, report: 'Worker returned invalid JSON.' };
    }

    if (result.error) {
        return { patch: null, confidence: 0, report: result.error };
    }

    const { confidence = 1.0, ...patch } = result;
    const cleanPatch = sanitizePatch(patch);

    return { patch: cleanPatch, confidence, report: 'success' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Model 1: Supervisor
// ─────────────────────────────────────────────────────────────────────────────

export async function handleAiraCommand(
    client: OpenAI,
    message: string,
    currentData: any,
    history: { role: 'user' | 'assistant'; text: string }[] = [],
    onStatus?: (status: string, patch?: any, navigation?: number) => void
): Promise<AiraResult> {

    const resumeSummary = buildResumeSummary(currentData);

    const supervisorPrompt = `You are Aira, a warm and clever AI resume assistant. You help people build their resume through natural conversation — like a smart friend who happens to be great at resumes.
RESUME SECTIONS & RESPONSIBILITIES:
${Object.entries(SECTION_SCHEMAS).map(([id, s]) => `- ${id}: ${s.description}`).join('\n')}

RESUME SUMMARY (counts only — call get_resume_data to read actual values):
${JSON.stringify(resumeSummary, null, 2)}

TOOLS:
- get_resume_data: Fetch actual values when user asks to read/verify their data.
- delegate_to_worker: Update resume fields. One call per section. Batch all changes for a section into a single task string.
- navigate_to_section: Switch the UI to a specific section.
- nuke_resume: Wipe the entire resume clean. Only call this when the user clearly wants to erase everything — treat it as irreversible.
- reply_with_choices: REQUIRED tool for any yes/no confirmation or multi-option question. You MUST call this tool — NEVER write choices as prose, bullet points, or a list in your text response.

TODAY: ${new Date().toLocaleDateString()}

TONE & NATURALNESS RULES:
- Write like a human, not a form. No bullet-point replies, no "Great! I've updated your X." boilerplate.
- Vary your affirmations — don't always start with "Got it" or "Sure". Mix it up: "Nice", "On it", "Done", "Perfect", silence sometimes, etc.
- For conversational messages (greetings, thanks, small talk), reply naturally without calling any tool.
- When nudging for a missing field, ask like you're curious — not like you're filling out a checklist.
- replyMessage should sound like something a real person would text, not a chatbot confirmation.

CHOICES RULE — CRITICAL:
NEVER write options like "- Yes / - No" or "1. Option A / 2. Option B" in your text. That is wrong.
Instead, ALWAYS call reply_with_choices. If you catch yourself writing a list of options in your reply text, STOP and call reply_with_choices instead.

✅ CORRECT: call reply_with_choices({ message: "Sure you want to wipe everything?", choices: [{ label: "Yes, wipe it", value: "yes wipe it all" }, { label: "Keep it", value: "no keep my resume" }] })
❌ WRONG: responding with text like "Please confirm:\n- Yes, wipe it all.\n- No, keep my resume."

STRICT RULES — follow these exactly:
1. SCOPE RULE — CRITICAL, NO EXCEPTIONS:
   ONLY call delegate_to_worker for sections the user's CURRENT message explicitly mentions.
   - "I also did a diploma from Coursera" → education worker ONLY. Do NOT touch personal, experience, skills.
   - "Update my phone number" → personal worker ONLY.
   - "Add Python to my skills" → skills worker ONLY.
   You MUST NOT infer, complete, or "helpfully" update sections not mentioned in THIS message.
   You MUST NOT use conversation history to populate unrelated sections.
   Violating this rule corrupts user data. When in doubt, do nothing extra.
2. For bulk input (user pastes a block of info), extract ALL fields mentioned and batch into ONE worker call per section.
3. replyMessage MUST always be set on delegate_to_worker — it's your final reply, no second API call needed.
4. For LIST sections like education: your task description MUST include ALL existing items plus the changes.
   Tell the worker explicitly: "Existing items: [...]. Now add/update/remove: [...]"
   Never ask the worker to operate on a list without telling it what already exists.
5. When nudging for missing fields, be natural — pick only ONE field to ask about, not a dump of everything missing.
6. For reads: call get_resume_data first, then answer naturally.
7. Use reply_with_choices when you're offering a short set of options (2–4 choices). Never use it for open-ended questions.
8. For "clear everything" / "start over" / "wipe my resume" intent → always confirm first with reply_with_choices (yes/no) unless they said something explicit like "yes, wipe it all".`;

    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
        {
            type: 'function',
            function: {
                name: 'get_resume_data',
                description: 'Fetch actual resume values (e.g. user asks "what\'s my email?" or you need current list items before updating).',
                parameters: {
                    type: 'object',
                    properties: {
                        sections: {
                            type: 'array',
                            items: { type: 'string', enum: [...Object.keys(SECTION_SCHEMAS), 'all'] },
                            description: 'Sections to fetch. Use ["all"] for the full resume.'
                        }
                    },
                    required: ['sections']
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'navigate_to_section',
                description: 'Switch the UI to a specific resume section.',
                parameters: {
                    type: 'object',
                    properties: {
                        section: {
                            type: 'string',
                            enum: Object.keys(SECTION_SCHEMAS),
                            description: 'The section to navigate to.'
                        }
                    },
                    required: ['section']
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'nuke_resume',
                description: 'Completely wipe all resume data — every section, every field. Only call when user explicitly wants to erase everything and has confirmed.',
                parameters: {
                    type: 'object',
                    properties: {
                        replyMessage: {
                            type: 'string',
                            description: 'What to say after wiping. Keep it light and forward-looking, e.g. "All clear — fresh start. What do you want to put in first?"'
                        }
                    },
                    required: ['replyMessage']
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'reply_with_choices',
                description: 'REQUIRED for any yes/no confirmation or multi-option question. You MUST call this tool — never write choices as prose or bullet points in your text response. If you catch yourself writing "- Option A / - Option B" in your reply, stop and call this tool instead.',
                parameters: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'The message to show above the buttons.'
                        },
                        choices: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    label: { type: 'string', description: 'Button label shown to user (short, e.g. "Yes, wipe it", "Bachelor\'s", "Skip for now")' },
                                    value: { type: 'string', description: 'Message sent when user clicks this button.' }
                                },
                                required: ['label', 'value']
                            },
                            minItems: 2,
                            maxItems: 4,
                            description: 'The choices to offer as buttons.'
                        }
                    },
                    required: ['message', 'choices']
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'delegate_to_worker',
                description: 'Update resume fields. One call per section. Batch all field changes into a single task string.',
                parameters: {
                    type: 'object',
                    properties: {
                        section: {
                            type: 'string',
                            enum: Object.keys(SECTION_SCHEMAS),
                            description: 'The section to update.'
                        },
                        task: {
                            type: 'string',
                            description: 'Precise instruction for the worker. For list sections, include existing items + the change.'
                        },
                        statusMessage: {
                            type: 'string',
                            description: 'Short UI status shown while updating, e.g. "Saving your education..."'
                        },
                        replyMessage: {
                            type: 'string',
                            description: 'Your final reply to the user after all updates. Natural, warm, human — not "I\'ve updated your X" boilerplate.'
                        }
                    },
                    required: ['section', 'task', 'statusMessage', 'replyMessage']
                }
            }
        }
    ];

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: supervisorPrompt },
        ...history.slice(-12).map(h => ({ role: h.role as 'user' | 'assistant', content: h.text })),
        { role: 'user', content: message }
    ];

    // ── First supervisor call ──
    let response = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages,
        tools,
        tool_choice: 'auto'
    });

    let assistantMsg = response.choices[0].message;
    let toolCalls = assistantMsg.tool_calls || [];

    const statusUpdates: string[] = [];
    let finalPatch: any = {};
    let finalProse = assistantMsg.content || '';
    let finalNavigation: number | undefined = undefined;
    let finalChoices: AiraChoice[] | undefined = undefined;

    // ── Handle get_resume_data (lazy read) ──
    const dataFetch = toolCalls.find(tc => tc.function.name === 'get_resume_data');
    if (dataFetch) {
        const { sections } = JSON.parse(dataFetch.function.arguments) as { sections: string[] };
        const fetchAll = sections.includes('all');
        const fetched: Record<string, any> = {};

        for (const sec of (fetchAll ? Object.keys(SECTION_SCHEMAS) : sections)) {
            fetched[sec] = currentData?.[sec] || {};
        }

        const messagesWithData: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            ...messages,
            assistantMsg,
            {
                role: 'tool',
                tool_call_id: dataFetch.id,
                content: JSON.stringify(fetched)
            }
        ];

        response = await client.chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: messagesWithData,
            tools,
            tool_choice: 'auto'
        });

        assistantMsg = response.choices[0].message;
        toolCalls = assistantMsg.tool_calls || [];
        finalProse = assistantMsg.content || '';
    }

    // ── Handle nuke_resume ──
    const nukeCall = toolCalls.find(tc => tc.function.name === 'nuke_resume');
    if (nukeCall) {
        const { replyMessage } = JSON.parse(nukeCall.function.arguments);
        const nukePatch = buildNukePatch();
        finalPatch = nukePatch;
        finalProse = replyMessage || "All cleared. Fresh start — what do you want to add first?";
        onStatus?.('Wiping resume...', nukePatch, undefined);

        return {
            type: 'tool_call',
            content: finalProse,
            statusUpdates: ['Wiping resume...'],
            patch: nukePatch,
            navigation: undefined
        };
    }

    // ── Handle reply_with_choices ──
    const choicesCall = toolCalls.find(tc => tc.function.name === 'reply_with_choices');
    if (choicesCall) {
        const { message: choicesMessage, choices } = JSON.parse(choicesCall.function.arguments);
        return {
            type: 'text',
            content: choicesMessage,
            statusUpdates: [],
            patch: null,
            choices: choices as AiraChoice[]
        };
    }

    // ── Handle navigate_to_section ──
    const navCalls = toolCalls.filter(tc => tc.function.name === 'navigate_to_section');
    for (const tc of navCalls) {
        const { section } = JSON.parse(tc.function.arguments) as { section: string };
        const stepId = SECTION_TO_STEP[section];
        if (stepId) {
            finalNavigation = stepId;
            onStatus?.(`Navigating to ${section}...`, undefined, stepId);
        }
    }

    // ── Handle delegate_to_worker calls ──
    const workerCalls = toolCalls.filter(tc => tc.function.name === 'delegate_to_worker');

    // Track a mutable copy of currentData so sequential worker calls within the
    // same turn see the results of earlier workers.
    let liveData = { ...currentData };

    for (const tc of workerCalls) {
        const args = JSON.parse(tc.function.arguments);
        const { section, task, statusMessage, replyMessage } = args;

        // Navigate to the section for every worker call (multi-section support).
        // First section navigated = the one that "wins" in the UI, but we still
        // emit onStatus for every section so the frontend can react.
        const stepId = SECTION_TO_STEP[section];
        if (stepId) {
            if (!finalNavigation) {
                finalNavigation = stepId;
            }
            onStatus?.(statusMessage, undefined, stepId);
        }

        statusUpdates.push(statusMessage);
        onStatus?.(statusMessage);

        const sectionData = liveData?.[section] || {};
        const { patch, confidence, report } = await runWorkerTask(
            client,
            section as SectionKey,
            task,
            sectionData
        );

        if (!patch) {
            finalProse += `\n\n(Couldn't update ${section}: ${report})`;
            continue;
        }

        if (confidence < 0.6) {
            finalProse = `I wasn't quite sure I caught that — could you clarify? (${task})`;
            continue;
        }

        const issues = validatePatch(section as SectionKey, patch);
        if (issues.length > 0) {
            finalProse = `Something looks off — ${issues.join(', ')}. Mind double-checking?`;
            continue;
        }

        liveData = deepMerge(liveData, { [section]: patch });
        finalPatch = deepMerge(finalPatch, { [section]: patch });

        // Emit patch immediately with the section's navigation step
        onStatus?.(statusMessage, { [section]: patch }, stepId);

        // Add a bit of delay between sections for a better UX/flow
        if (workerCalls.length > 1) {
            await sleep(1000);
        }

        if (!finalProse || finalProse.length < 5) {
            finalProse = replyMessage || "Done — saved.";
        }

        const missing = getMissingImportant(section as SectionKey, liveData, patch);
        if (missing.length > 0 && finalProse.length < 220) {
            const pick = missing[0];
            finalProse += `\n\nBy the way — what's your ${pick}? That'll help round things out.`;
        }
    }

    // Pure conversation — no tools called
    if (toolCalls.length === 0 && !finalProse) {
        finalProse = "Happy to help! Just tell me what you'd like to add or change on your resume.";
    }

    return {
        type: (workerCalls.length > 0 || navCalls.length > 0 || nukeCall) ? 'tool_call' : 'text',
        content: finalProse,
        statusUpdates,
        patch: Object.keys(finalPatch).length > 0 ? finalPatch : null,
        navigation: finalNavigation,
        choices: finalChoices
    };
}