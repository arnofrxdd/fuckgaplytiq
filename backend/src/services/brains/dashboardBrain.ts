import OpenAI from 'openai';
import { supabase } from '../supabase';
import fs from 'fs';
import path from 'path';
import { appendTurnAndSummarize } from '../ariaHistory.service';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UIContext {
    draftMode?: 'new' | 'import' | 'dna' | null;
    templateId?: string | null;
    draftName?: string | null;
    stagedFile?: { name: string; url?: string } | null;
    isProcessing?: boolean;
    activeModal?: string | null;
}

export interface AriaResult {
    type: 'tool_call' | 'text';
    tool?: string;
    args?: Record<string, any>;
    content?: string | null;
    choices?: string[];
    updatedCtx: UIContext;
}

// ─────────────────────────────────────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────────────────────────────────────

let TEMPLATES: { id: string; name: string }[] = [];
try {
    const tmPath = path.resolve(process.cwd(), '../frontend/app/resume-creator/templates/TemplateManager.js');
    const content = fs.readFileSync(tmPath, 'utf8');
    const cleanContent = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

    const idMatches = [...cleanContent.matchAll(/id:\s*"([^"]+)"/g)];
    const nameMatches = [...cleanContent.matchAll(/name:\s*"([^"]+)"/g)];

    TEMPLATES = idMatches.map((m, i) => ({
        id: m[1],
        name: nameMatches[i] ? nameMatches[i][1] : m[1]
    }));
} catch (e) {
    console.error('[Aria] Failed to parse TemplateManager.js dynamically', e);
    TEMPLATES = [
        { id: 'azure-modern', name: 'Azure Modern' }
    ];
}

const VALID_TEMPLATE_IDS = TEMPLATES.map(t => t.id);
const TEMPLATE_NAMES = TEMPLATES.map(t => t.name);

// ─────────────────────────────────────────────────────────────────────────────
// Tools
// ─────────────────────────────────────────────────────────────────────────────

function getTools(): OpenAI.Chat.Completions.ChatCompletionTool[] {
    return [
        {
            type: 'function',
            function: {
                name: 'update_order',
                description: `Update the resume order fields. Call this ONLY when the user has EXPLICITLY told you a value — never infer or assume.

STRICT RULES:
- "show me templates" or "what templates do you have?" → do NOT call this. Show templates, ask mode separately.
- "I want to start fresh" → draftMode: "new" ✓
- "upload my CV" → draftMode: "import" ✓  
- "use my career profile" → draftMode: "dna" ✓
- Mentioning a template by name → templateId ✓
- "call it X" / "name it X" → draftName ✓

You may set one, two, or all three in a single call if the user clearly stated multiple values.`,
                parameters: {
                    type: 'object',
                    properties: {
                        draftMode: {
                            type: 'string',
                            enum: ['new', 'import', 'dna'],
                            description: `How the resume will be created. Map natural language:
  "new"    ← "from scratch", "fresh", "blank", "new one", "build one"
  "import" ← "upload", "pdf", "existing resume", "from file", "my old CV"
  "dna"    ← "career dna", "my profile", "use my data", "from my info"
  
  DO NOT set this just because the user asked to see templates or asked a question.`,
                        },
                        templateId: {
                            type: 'string',
                            enum: VALID_TEMPLATE_IDS,
                            description: `The template slug. Map natural language:
  "creative-marketing"  ← creative, colorful, marketing, design-y
  "jade-heritage"       ← classic, traditional, heritage, timeless
  "azure-modern"        ← modern, clean, minimal, simple, blue
  "strategic-leader"    ← professional, executive, leader, corporate
  "academic-latex"      ← academic, research, scientific, latex
  "academic-two-column" ← two column, split layout, double column`,
                        },
                        draftName: {
                            type: 'string',
                            description: `The name for this resume draft. Extract from:
  "call it X", "name it X", "save as X", "let's go with X", "title: X"
  Store only the intended name — trimmed, no filler words.`,
                        },
                    },
                },
            },
        },
        {
            type: 'function',
            function: {
                name: 'confirm_or_reset',
                description: `Confirm final resume creation or reset.
"confirm" → ONLY when ALL 3 fields are set AND user clearly says yes ("yes", "go ahead", "create it", "do it", "looks good").
"reset"   → When user says "start over", "reset", "forget it", "scratch that", "begin again".
NEVER call confirm if any field is missing.`,
                parameters: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['confirm', 'reset'],
                        },
                    },
                    required: ['action'],
                },
            },
        },
        {
            type: 'function',
            function: {
                name: 'show_widget',
                description: `Show a UI widget or clickable buttons. Use when:
- User asks to see templates ("show templates")
- You need the user to pick a mode (provide mode choices)
- User wants to upload their PDF (show upload)
- You need the user to confirm creation (provide confirm/reset choices)`,
                parameters: {
                    type: 'object',
                    properties: {
                        widget: {
                            type: 'string',
                            enum: ['template_carousel', 'upload'],
                            description: 'Optional. "template_carousel" = show template gallery. "upload" = show PDF upload zone.',
                        },
                        choices: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Quick reply buttons to show (e.g. ["Build from scratch", "Upload a PDF", "Use Career DNA"])',
                        },
                    },
                },
            },
        },
    ];
}

// ─────────────────────────────────────────────────────────────────────────────
// System prompt
// ─────────────────────────────────────────────────────────────────────────────

function buildSystemPrompt(ctx: UIContext, memorySummary: string = ''): string {
    const missing: string[] = [];
    if (!ctx.draftMode) missing.push('mode');
    if (!ctx.templateId) missing.push('template');
    if (!ctx.draftName) missing.push('name');
    const isComplete = missing.length === 0;

    return `You are Aria — a friendly, sharp resume assistant. Think of yourself as a helpful colleague, not a form wizard. You have a natural, warm tone. You never repeat yourself, never pad responses, and never assume things the user didn't say.

Your goal is to collect 3 things to create a resume:
  1. Mode     — HOW to build it (new / import / dna)
  2. Template — which design to use
  3. Name     — what to call the draft

━━━━━━━━━━━━━━━━━━━━━━━
CURRENT STATUS
━━━━━━━━━━━━━━━━━━━━━━━
  Mode:     ${ctx.draftMode ?? '[not set]'}
  Template: ${ctx.templateId ?? '[not set]'}
  Name:     ${ctx.draftName ? `"${ctx.draftName}"` : '[not set]'}
  Still need: ${isComplete ? 'nothing — ready to create!' : missing.join(', ')}

━━━━━━━━━━━━━━━━━━━━━━━
AVAILABLE TEMPLATES
━━━━━━━━━━━━━━━━━━━━━━━
${TEMPLATES.map(t => `  ${t.name}  (${t.id})`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━
THE 3 MODES — explained simply
━━━━━━━━━━━━━━━━━━━━━━━
  New        = Start with a blank resume, fill everything in yourself
  Import     = Upload an existing PDF resume — we'll pull the content from it
  Career DNA = We auto-fill your resume from your saved profile (work history, skills, etc.)

━━━━━━━━━━━━━━━━━━━━━━━
CONVERSATION RULES
━━━━━━━━━━━━━━━━━━━━━━━

NEVER ASSUME:
- Do NOT set draftMode just because someone asked to see templates
- Do NOT set draftMode to "new" as a default
- Only set a field when the user has EXPLICITLY told you what they want
- If you're not sure, ASK — don't guess

NATURAL FLOW:
- If mode is missing, ask for it first — it shapes everything else
- Ask the missing fields naturally in conversation — don't list them robotically
- If the user seems confused ("what's DNA?", "what's the difference?"), explain briefly and warmly, then re-ask
- If user says something vague like "surprise me" for a template, pick a reasonable one but say what you picked and why

RESPONSE LENGTH:
- Keep replies under 35 words unless the user asked a question that needs explaining
- Don't pad. Don't repeat what's already confirmed. Don't say "Great!" before every reply.
- Vary your acknowledgements — not every response starts with "Got it!"

HANDLING CONFUSION:
- "what's Career DNA?" → Explain: "It uses your saved profile to auto-fill your resume — saves a lot of typing! Want to use it?"
- "what's the difference between the templates?" → Show the carousel: call show_widget({ widget: "template_carousel" })
- "I don't know which one to pick" → Give a 1-line recommendation based on context, or show the carousel

CONFIRM BEFORE CREATING:
- Once all 3 are set, summarize naturally: "Alright — [mode], [template] template, named '[name]'. Want me to create it?"
- Do NOT call confirm_or_reset until the user clearly says yes

SILENT TOOL USE IS OK — BUT ALWAYS SPEAK:
- You don't need to announce every update_order call
- BUT you MUST always produce a text response in the same turn — even one sentence
- After update_order: acknowledge naturally and ask for the next missing field
- After show_widget: say something like "Take a look — let me know what catches your eye!" 
- After show_widget when template is already picked: "You've got [Template Name] picked — swap it if anything else looks better!"
- NEVER return an empty response

RESET:
- If user says "start over" / "reset" / "forget it" → call confirm_or_reset with action:"reset" immediately

SHOW TEMPLATES & WIDGETS (CRITICAL):
- If user asks to see templates at any point → call show_widget({ widget: "template_carousel" })
- If draftMode is 'import' and they need to upload → call show_widget({ widget: "upload" })
- When asking a multiple-choice question (like which Mode to pick, or asking them to Confirm setup) → call show_widget({ choices: ["Option 1", "Option 2"] }) so they can click buttons!
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fuzzy template name → id
// ─────────────────────────────────────────────────────────────────────────────

function fuzzyMatchTemplate(input: string): string | null {
    const norm = input.toLowerCase().replace(/[^a-z0-9]/g, '');

    const aliases: Record<string, string> = {
        modern: 'azure-modern',
        clean: 'azure-modern',
        minimal: 'azure-modern',
        blue: 'azure-modern',
        azure: 'azure-modern',
        simple: 'azure-modern',
        creative: 'creative-marketing',
        marketing: 'creative-marketing',
        colorful: 'creative-marketing',
        jade: 'jade-heritage',
        heritage: 'jade-heritage',
        traditional: 'jade-heritage',
        classic: 'jade-heritage',
        timeless: 'jade-heritage',
        strategic: 'strategic-leader',
        executive: 'strategic-leader',
        leader: 'strategic-leader',
        professional: 'strategic-leader',
        corporate: 'strategic-leader',
        academic: 'academic-latex',
        latex: 'academic-latex',
        research: 'academic-latex',
        scientific: 'academic-latex',
        twocolumn: 'academic-two-column',
        doublecolumn: 'academic-two-column',
        split: 'academic-two-column',
    };

    if (aliases[norm]) return aliases[norm];

    for (const t of TEMPLATES) {
        const idNorm = t.id.replace(/-/g, '');
        const nameNorm = t.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (
            norm === idNorm ||
            norm === nameNorm ||
            idNorm.startsWith(norm) ||
            nameNorm.includes(norm) ||
            norm.includes(idNorm)
        ) {
            return t.id;
        }
    }
    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Database helpers
// ─────────────────────────────────────────────────────────────────────────────

async function loadDNAData(userId: string): Promise<Record<string, any>> {
    const { data: profile } = await supabase
        .from('profiles')
        .select('career_dna')
        .eq('id', userId)
        .single();

    if (!profile?.career_dna) {
        return { personal: {}, summary: '', experience: [], education: [], skills: [] };
    }
    const dna = typeof profile.career_dna === 'string'
        ? JSON.parse(profile.career_dna)
        : profile.career_dna;

    return {
        personal: dna.personal ?? { name: dna.name ?? '', email: dna.email ?? '' },
        summary: dna.summary ?? '',
        experience: Array.isArray(dna.experience) ? dna.experience : [],
        education: Array.isArray(dna.education) ? dna.education : [],
        skills: Array.isArray(dna.skills)
            ? dna.skills.map((s: any) => (typeof s === 'string' ? { name: s, level: 3 } : s))
            : [],
    };
}

async function createDraft(userId: string, name: string, template: string, mode: string) {
    const initialData = mode === 'dna'
        ? await loadDNAData(userId)
        : { personal: {}, summary: '', experience: [], education: [], skills: [] };

    const { data, error } = await supabase
        .from('builder_resumes')
        .insert({
            profile_id: userId,
            title: name || 'Untitled Resume',
            template_id: template || 'azure-modern',
            data: initialData,
            onboarding_metadata: { status: 'completed', mode },
        })
        .select()
        .single();

    return error ? null : data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────────────────────────────────────

export async function handleDashboardCommand(
    ariaClient: OpenAI,
    message: string,
    uiContext: UIContext,
    history: { role: 'user' | 'assistant'; text: string }[] = [],
    userId: string | null = null,
    onChunk?: (text: string) => void,
    onWidget?: (widget: string, choices?: string[]) => void,
    onProfile?: (profile: any) => void,
): Promise<AriaResult> {

    let memorySummary = '';
    if (userId) {
        const { loadOrCreateSession } = await import('../ariaHistory.service');
        const session = await loadOrCreateSession(userId, 'dashboard');
        if (session && session.summary) memorySummary = session.summary;
    }

    const tools = getTools();
    const systemPrompt = buildSystemPrompt(uiContext, memorySummary);
    let updatedCtx = { ...uiContext };
    let prose = '';

    console.log(`[Aria] Order in: mode=${uiContext.draftMode} template=${uiContext.templateId} name=${uiContext.draftName}`);

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-10).map(h => ({ role: h.role as 'user' | 'assistant', content: h.text })),
        { role: 'user', content: message },
    ];

    let finalChoices: string[] | undefined = undefined;

    try {
        const toolCallAccumulator: { name: string; args: string }[] = [];

        const stream = await ariaClient.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            stream: true,
            temperature: 0.2,
            tools,
            tool_choice: 'auto',
        });

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;

            if (delta?.content) {
                prose += delta.content;
                onChunk?.(delta.content);
            }

            if (delta?.tool_calls) {
                for (const tc of delta.tool_calls) {
                    if (!toolCallAccumulator[tc.index]) {
                        toolCallAccumulator[tc.index] = { name: '', args: '' };
                    }
                    if (tc.function?.name) toolCallAccumulator[tc.index].name += tc.function.name;
                    if (tc.function?.arguments) toolCallAccumulator[tc.index].args += tc.function.arguments;
                }
            }
        }

        let orderUpdated = false;

        for (const tc of toolCallAccumulator.filter(Boolean)) {
            let args: Record<string, any> = {};
            try {
                args = JSON.parse(tc.args || '{}');
            } catch {
                console.error(`[Aria] Failed to parse args for ${tc.name}:`, tc.args);
                continue;
            }

            console.log(`[Aria] Tool: ${tc.name}`, args);

            // ── show_widget ──────────────────────────────────────────────────
            if (tc.name === 'show_widget') {
                if (args.widget === 'template_carousel') {
                    onWidget?.('template_carousel', TEMPLATE_NAMES);
                } else if (args.widget === 'upload') {
                    onWidget?.('upload');
                }

                if (args.choices && Array.isArray(args.choices)) {
                    finalChoices = args.choices;
                }
                orderUpdated = true;
            }

            // ── update_order ─────────────────────────────────────────────────
            if (tc.name === 'update_order') {
                if (args.draftMode) updatedCtx.draftMode = args.draftMode;
                if (args.draftName) updatedCtx.draftName = String(args.draftName).trim();
                if (args.templateId) {
                    const id = VALID_TEMPLATE_IDS.includes(args.templateId)
                        ? args.templateId
                        : fuzzyMatchTemplate(args.templateId);
                    if (id) updatedCtx.templateId = id;
                    else console.warn(`[Aria] Unknown templateId: "${args.templateId}"`);
                }
                orderUpdated = true;
            }

            // ── confirm_or_reset ─────────────────────────────────────────────
            if (tc.name === 'confirm_or_reset') {
                if (args.action === 'reset') {
                    updatedCtx = { draftMode: null, draftName: null, templateId: null, stagedFile: null };
                    return {
                        type: 'tool_call',
                        tool: 'reset',
                        args: {},
                        content: prose || "No problem — let's start fresh!",
                        updatedCtx,
                    };
                }

                if (args.action === 'confirm') {
                    const { draftMode: mode, templateId: template, draftName: name } = updatedCtx;

                    if (mode === 'import' && !updatedCtx.stagedFile) {
                        onWidget?.('upload');
                        return {
                            type: 'tool_call',
                            tool: 'show_widget',
                            args: { widget: 'upload' },
                            content: prose || 'Please upload your PDF first and we can proceed.',
                            updatedCtx,
                        };
                    }

                    if (!userId || !mode || !template || !name) {
                        console.error('[Aria] confirm called with missing fields', { userId, mode, template, name });
                        return {
                            type: 'text',
                            content: "Hmm, I'm still missing a detail or two — let me know the mode, template, and name and we're good to go!",
                            updatedCtx,
                        };
                    }

                    if (mode === 'import') {
                        return {
                            type: 'tool_call',
                            tool: 'update_ui_state',
                            args: {
                                executeUploadTs: Date.now(),
                                draftMode: mode,
                                draftName: name,
                                templateId: template,
                            },
                            content: prose || 'Great — building your resume from the PDF now!',
                            updatedCtx,
                        };
                    }

                    const draft = await createDraft(userId, name, template, mode);
                    if (draft) {
                        return {
                            type: 'tool_call',
                            tool: 'navigate_to_editor',
                            args: { draftId: draft.id, mode, templateId: template, draftName: name },
                            content: prose || "Your resume is ready — let's build something great!",
                            updatedCtx,
                        };
                    }

                    return {
                        type: 'text',
                        content: 'Something went wrong creating your resume. Want to try again?',
                        updatedCtx,
                    };
                }
            }
        }

        // ── If tools fired but model produced no text, do a follow-up call ────
        // OpenAI streaming cannot emit text AND tool calls in the same turn.
        // So we always need a second pass to get Aria's spoken response.
        if (orderUpdated && !prose) {
            const missing: string[] = [];
            if (!updatedCtx.draftMode) missing.push('mode');
            if (!updatedCtx.templateId) missing.push('template');
            if (!updatedCtx.draftName) missing.push('name');

            const followUpMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                { role: 'system', content: systemPrompt },
                ...history.slice(-10).map(h => ({ role: h.role as 'user' | 'assistant', content: h.text })),
                { role: 'user', content: message },
                {
                    role: 'assistant',
                    content: null,
                    tool_calls: toolCallAccumulator.filter(Boolean).map((tc, i) => ({
                        id: `call_${i}`,
                        type: 'function' as const,
                        function: { name: tc.name, arguments: tc.args },
                    })),
                },
                ...toolCallAccumulator.filter(Boolean).map((tc, i) => ({
                    role: 'tool' as const,
                    tool_call_id: `call_${i}`,
                    content: 'done',
                })),
            ];

            const followUp = await ariaClient.chat.completions.create({
                model: 'gpt-4o',
                messages: followUpMessages,
                stream: false,
                temperature: 0.2,
                max_tokens: 80,
            });

            prose = followUp.choices[0]?.message?.content?.trim() ?? '';
            if (prose) onChunk?.(prose);
        }
    } catch (err) {
        console.error('[Aria] Error:', err);
        prose = "Something went sideways on my end — want to try that again?";
    }

    console.log(`[Aria] Order out: mode=${updatedCtx.draftMode} template=${updatedCtx.templateId} name=${updatedCtx.draftName}`);
    console.log(`[Aria] Prose: "${prose.slice(0, 120)}"`);

    // Asynchronously save this turn to Supabase Memory
    if (userId) {
        appendTurnAndSummarize(
            userId,
            'dashboard',
            { role: 'user', text: message },
            { role: 'assistant', text: prose },
            updatedCtx
        ).catch((err: any) => {
            console.error('[AriaHistory] Async save failed:', err);
        });
    }

    return {
        type: 'text',
        content: prose || null,
        choices: finalChoices,
        updatedCtx,
    };
}
