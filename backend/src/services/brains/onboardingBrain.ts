import OpenAI from 'openai';
import { supabase } from '../supabase';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface OnboardingContext {
    profile?: {
        name?: string;
        jobTitle?: string;
        experienceLevel?: string;
        primaryGoal?: string;
        career_dna?: any;
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tools  — lean, unambiguous, one job each
// ─────────────────────────────────────────────────────────────────────────────

function getTools(): OpenAI.Chat.Completions.ChatCompletionTool[] {
    return [
        {
            type: 'function',
            function: {
                name: 'set_ui',
                description: `Control the UI chrome (button choices + chatbox visibility).
Call this every time you want to change what the user sees.
- choices: buttons to render (empty array = no buttons)
- showChatbox: true when you need free-form text input from the user`,
                parameters: {
                    type: 'object',
                    properties: {
                        choices: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Button labels. Empty array hides all buttons.',
                        },
                        showChatbox: {
                            type: 'boolean',
                            description: 'Show the free-text input box.',
                        },
                    },
                    required: ['choices', 'showChatbox'],
                },
            },
        },
        {
            type: 'function',
            function: {
                name: 'save_name',
                description: `Persist the user's confirmed name to their profile.
Only call this AFTER the user has explicitly confirmed the name (e.g. clicked "Yes, that's me" or typed a new name they want to use).
Do NOT call this with a rejected suggestion or with a negative answer like "no".`,
                parameters: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'The confirmed name.' },
                    },
                    required: ['name'],
                },
            },
        },
        {
            type: 'function',
            function: {
                name: 'save_job_title',
                description: `Persist the user's job title.
Only call this when the user has provided a real job title string.
Do NOT call this if the user said "no", rejected a suggestion, said they don't have a title, or said anything that is not an actual title.
"Skip" means skip — do not call this tool at all.`,
                parameters: {
                    type: 'object',
                    properties: {
                        jobTitle: { type: 'string', description: 'The actual job title, e.g. "Software Engineer".' },
                    },
                    required: ['jobTitle'],
                },
            },
        },
        {
            type: 'function',
            function: {
                name: 'save_experience',
                description: `Persist the user's experience level.
Only call this with one of the allowed enum values.
"Skip" means skip — do not call this tool at all.`,
                parameters: {
                    type: 'object',
                    properties: {
                        experienceLevel: {
                            type: 'string',
                            enum: ['entry', 'junior', 'mid', 'senior', 'lead'],
                        },
                    },
                    required: ['experienceLevel'],
                },
            },
        },
        {
            type: 'function',
            function: {
                name: 'save_primary_goal',
                description: `Persist the user's primary goal.
Only call this when the user has chosen or typed a real goal.
"Skip" means skip — do not call this tool at all.`,
                parameters: {
                    type: 'object',
                    properties: {
                        primaryGoal: { type: 'string' },
                    },
                    required: ['primaryGoal'],
                },
            },
        },
        {
            type: 'function',
            function: {
                name: 'complete_onboarding',
                description: `Finish onboarding and advance the user into the app.
Call this ONLY when:
  1. name has been confirmed AND
  2. the user has either provided or explicitly skipped job title, experience level, AND primary goal.
Do not call prematurely.`,
                parameters: {
                    type: 'object',
                    properties: {
                        summary: {
                            type: 'string',
                            description: 'One short sentence summarising what was collected.',
                        },
                    },
                    required: ['summary'],
                },
            },
        },
    ];
}

// ─────────────────────────────────────────────────────────────────────────────
// System prompt
// ─────────────────────────────────────────────────────────────────────────────

function buildSystemPrompt(profile: OnboardingContext['profile']): string {
    const p = profile || {};
    return `You are Aria, a senior career consultant running a high-end account setup wizard.
The user's "Professional Profile Card" updates live as you collect information.

━━━━━━━━━━━━━━━━━━━━━━━
CURRENT PROFILE STATE  (do not re-ask for fields already set)
━━━━━━━━━━━━━━━━━━━━━━━
name:            ${p.name || 'NOT SET'}
jobTitle:        ${p.jobTitle || 'NOT SET'}
experienceLevel: ${p.experienceLevel || 'NOT SET'}
primaryGoal:     ${p.primaryGoal || 'NOT SET'}

━━━━━━━━━━━━━━━━━━━━━━━
YOUR PERSONA
━━━━━━━━━━━━━━━━━━━━━━━
- Professional, warm, direct. Proper sentences, proper capitalisation.
- NEVER say: "Great!", "Awesome!", "Of course!", "Feel free to...", "Let me know if..."
- NEVER use exclamation marks.
- Keep prose ≤ 15 words per turn. Always say *something* after tool calls.

━━━━━━━━━━━━━━━━━━━━━━━
AVAILABLE TOOLS
━━━━━━━━━━━━━━━━━━━━━━━
set_ui            — set button choices and chatbox visibility
save_name         — persist confirmed name
save_job_title    — persist a real job title
save_experience   — persist experience level
save_primary_goal — persist primary goal
complete_onboarding — finish the flow (only when all steps done/skipped)

━━━━━━━━━━━━━━━━━━━━━━━
ONBOARDING FLOW  (follow in order; skip already-set fields)
━━━━━━━━━━━━━━━━━━━━━━━

STEP 1 — NAME  (required, cannot be skipped)
  a. Propose a name derived from the user's email/context.
     → set_ui({ choices: ["Yes, that's me", "Use a different name"], showChatbox: false })
  b. User clicks "Use a different name":
     → set_ui({ choices: [], showChatbox: true })  — let them type
  c. User types a new name:
     → save_name({ name: "<typed name>" })
     → set_ui({ choices: ["Yes, that's me", "Use a different name"], showChatbox: false })
     → confirm the name with them again
  d. User clicks "Yes, that's me":
     → save_name({ name: "<confirmed name>" })
     → proceed to Step 2

STEP 2 — JOB TITLE  (optional)
  Ask for their role. Suggest their most likely title as a button.
  → set_ui({ choices: ["<likely title>", "Skip"], showChatbox: true })

  • User types a title OR clicks the suggestion:
      → save_job_title({ jobTitle: "<value>" })
      → proceed to Step 3
  • User says "no", rejects the suggestion, or says something negative:
      → Do NOT call save_job_title.
      → Ask what their actual title is.
      → set_ui({ choices: ["Skip"], showChatbox: true })
  • User says "Skip" or has no title:
      → Do NOT call save_job_title.
      → proceed to Step 3

STEP 3 — EXPERIENCE  (optional)
  → set_ui({ choices: ["Entry", "Junior", "Mid", "Senior", "Lead", "Skip"], showChatbox: false })
  • User picks a level → save_experience + proceed to Step 4
  • User clicks "Skip" → proceed to Step 4 without saving

STEP 4 — PRIMARY GOAL  (optional)
  → set_ui({ choices: ["Get hired fast", "Switch careers", "Internship/Entry role", "General improvement", "Skip"], showChatbox: false })
  • User picks a goal → save_primary_goal + call complete_onboarding
  • User clicks "Skip" → call complete_onboarding without saving goal

━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULES
━━━━━━━━━━━━━━━━━━━━━━━
1. NEVER save a value that is a rejection, negation, or filler ("no", "nope", "not really",
   "no it's not", "n/a", "skip", "none", "idk", etc.). If the user rejects something, ask again.
2. NEVER call complete_onboarding until steps 2-4 are each either saved or explicitly skipped.
3. ALWAYS call set_ui after every exchange so the UI stays in sync.
4. You have NO fallback logic. Every state transition happens through your tool calls.
   If you are unsure what the user means, ask a clarifying question.
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DB helper
// ─────────────────────────────────────────────────────────────────────────────

async function persistProfile(userId: string, updates: Partial<{
    name: string;
    jobTitle: string;
    experienceLevel: string;
    primaryGoal: string;
}>) {
    const { data: existing, error: fetchError } = await supabase
        .from('profiles')
        .select('career_dna')
        .eq('id', userId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    let currentDna: any = {};
    const rawDna = existing?.career_dna;
    if (typeof rawDna === 'string') {
        try { currentDna = JSON.parse(rawDna) || {}; } catch { currentDna = {}; }
    } else if (rawDna && typeof rawDna === 'object') {
        currentDna = rawDna;
    }

    const nextDna = {
        ...currentDna,
        personal: {
            ...(currentDna.personal || {}),
            ...(updates.name ? { name: updates.name } : {}),
            ...(updates.jobTitle ? { profession: updates.jobTitle } : {}),
        },
        ...(updates.name ? { name: updates.name } : {}),
        ...(updates.jobTitle ? { jobTitle: updates.jobTitle } : {}),
        ...(updates.experienceLevel ? { experienceLevel: updates.experienceLevel } : {}),
        ...(updates.primaryGoal ? { primaryGoal: updates.primaryGoal } : {}),
    };

    // Purge legacy malformed keys
    delete nextDna.title;
    delete nextDna.experience_level;

    await supabase.from('profiles').update({
        career_dna: nextDna,
        dna_last_synced: new Date().toISOString(),
    }).eq('id', userId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────────────────────────────────────

export const handleOnboardingCommand = async (
    ariaClient: OpenAI,
    message: string,
    uiContext: OnboardingContext,
    history: any[] = [],
    userId: string | null = null,
    onChunk?: (text: string) => void,
    onWidget?: (widget: string, choices?: string[], showChatbox?: boolean) => void,
    onProfile?: (profile: OnboardingContext['profile']) => void,
) => {
    // Mutable local profile mirror
    const profile: NonNullable<OnboardingContext['profile']> = { ...(uiContext?.profile || {}) };

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: buildSystemPrompt(profile) },
        ...history.slice(-12).map(msg => ({
            role: (msg.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
            content: (msg.text || msg.content || '').trim(),
        })),
        { role: 'user', content: message },
    ];

    try {
        let currentMessages = [...messages];
        let finalProse = '';
        let lastUiState: { choices: string[]; showChatbox: boolean } = { choices: [], showChatbox: false };
        const MAX_LOOPS = 6;

        for (let loop = 0; loop < MAX_LOOPS; loop++) {
            const completion = await ariaClient.chat.completions.create({
                model: 'gpt-4o',
                messages: currentMessages,
                tools: getTools(),
                tool_choice: 'auto',
                temperature: 0.1,
            });

            const assistantMsg = completion.choices[0].message;
            const prose = assistantMsg.content || '';
            const toolCalls = assistantMsg.tool_calls || [];

            if (prose) {
                finalProse += (finalProse ? '\n' : '') + prose;
                onChunk?.(prose);
            }

            // No tool calls → model is done
            if (toolCalls.length === 0) break;

            // Append assistant message to history for next loop
            currentMessages.push(assistantMsg as any);

            const toolResults: OpenAI.Chat.Completions.ChatCompletionToolMessageParam[] = [];

            for (const tc of toolCalls) {
                const name = tc.function.name;
                let args: any = {};
                try { args = JSON.parse(tc.function.arguments); } catch { /* ignore */ }

                let result = 'ok';

                switch (name) {
                    case 'set_ui': {
                        lastUiState = {
                            choices: args.choices ?? [],
                            showChatbox: args.showChatbox ?? false,
                        };
                        onWidget?.('set_ui', lastUiState.choices, lastUiState.showChatbox);
                        break;
                    }

                    case 'save_name': {
                        if (args.name) {
                            profile.name = args.name;
                            if (userId) await persistProfile(userId, { name: args.name });
                            onProfile?.({ ...profile });
                        } else {
                            result = 'error: name was empty';
                        }
                        break;
                    }

                    case 'save_job_title': {
                        if (args.jobTitle) {
                            profile.jobTitle = args.jobTitle;
                            if (userId) await persistProfile(userId, { jobTitle: args.jobTitle });
                            onProfile?.({ ...profile });
                        } else {
                            result = 'error: jobTitle was empty';
                        }
                        break;
                    }

                    case 'save_experience': {
                        if (args.experienceLevel) {
                            profile.experienceLevel = args.experienceLevel;
                            if (userId) await persistProfile(userId, { experienceLevel: args.experienceLevel });
                            onProfile?.({ ...profile });
                        } else {
                            result = 'error: experienceLevel was empty';
                        }
                        break;
                    }

                    case 'save_primary_goal': {
                        if (args.primaryGoal) {
                            profile.primaryGoal = args.primaryGoal;
                            if (userId) await persistProfile(userId, { primaryGoal: args.primaryGoal });
                            onProfile?.({ ...profile });
                        } else {
                            result = 'error: primaryGoal was empty';
                        }
                        break;
                    }

                    case 'complete_onboarding': {
                        if (userId) {
                            await supabase
                                .from('profiles')
                                .update({ onboarding_status: 'completed' })
                                .eq('id', userId);
                        }
                        return {
                            type: 'tool_call',
                            tool: 'finish_onboarding',
                            args: {
                                name: profile.name,
                                jobTitle: profile.jobTitle,
                                experienceLevel: profile.experienceLevel,
                                primaryGoal: profile.primaryGoal,
                            },
                            content: finalProse || 'All set.',
                        };
                    }

                    default:
                        result = `unknown tool: ${name}`;
                }

                toolResults.push({
                    role: 'tool',
                    tool_call_id: tc.id,
                    content: result,
                });
            }

            // Feed all tool results back in one batch
            currentMessages.push(...toolResults);
        }

        const hasWidget = lastUiState.choices.length > 0 || lastUiState.showChatbox;

        return {
            type: hasWidget ? 'tool_call' : 'text',
            tool: hasWidget ? 'update_profile' : undefined,
            args: hasWidget ? { ...lastUiState, profile: { ...profile } } : { profile: { ...profile } },
            content: finalProse,
        };

    } catch (error) {
        console.error('[Aria Onboarding] Error:', error);
        return { type: 'text', content: 'Something went wrong. Please try again.' };
    }
};