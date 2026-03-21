import { supabase } from './supabase';
import OpenAI from 'openai';

const summarizerClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ChatSession {
    id: string;
    user_id: string;
    page_context: string;
    messages: any[];
    summary: string | null;
    last_ui_state: any | null;
}

// Loads the latest continuous session for a specific page context
export async function loadOrCreateSession(userId: string, pageContext: string): Promise<ChatSession | null> {
    const { data: session, error } = await supabase
        .from('aria_chat_history')
        .select('*')
        .eq('user_id', userId)
        .eq('page_context', pageContext)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

    if (session) {
        return session as ChatSession;
    }

    if (error && error.code !== 'PGRST116') {
        console.error('[AriaHistory] Error loading session:', error);
        return null;
    }

    // Create a new session if none exists
    const { data: newSession, error: createError } = await supabase
        .from('aria_chat_history')
        .insert({ user_id: userId, page_context: pageContext, messages: [] })
        .select()
        .single();

    if (createError) {
        console.error('[AriaHistory] Error creating session:', createError);
        return null;
    }

    return newSession as ChatSession;
}

// Appends a single turn and summarizes if the history exceeds a threshold.
export async function appendTurnAndSummarize(
    userId: string,
    pageContext: string,
    userMsg: { role: string; text: string },
    assistantMsg: { role: string; text: string },
    uiState: any
): Promise<void> {
    const session = await loadOrCreateSession(userId, pageContext);
    if (!session) return;

    let finalMessages = [...session.messages, userMsg, assistantMsg];
    let newSummary = session.summary || '';

    // If DB messages array is getting long, summarize the oldest 3 messages
    // Threshold set to 5 for debugging (formerly 20)
    if (finalMessages.length > 5) {
        const toSummarize = finalMessages.slice(0, 3);
        finalMessages = finalMessages.slice(3); // Keep only the recent ones

        try {
            console.log(`[AriaHistory] History exceeded 5 messages (Count: ${finalMessages.length + 3}). Summarizing oldest 3 messages...`);
            const sumResponse = await summarizerClient.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { 
                        role: 'system', 
                        content: `You are Aria's internal memory compressor. Summarize this slice of conversation in 2-3 concise sentences. Focus ONLY on what the user wants, factual preferences, or decisions made. If there's an existing summary: "${newSummary || 'None'}", merge the new info into it seamlessly.` 
                    },
                    ...toSummarize.map(m => ({ role: m.role, content: m.text }))
                ],
                temperature: 0.2,
                max_tokens: 150
            });
            newSummary = sumResponse.choices[0]?.message?.content?.trim() || newSummary;
            console.log(`[AriaHistory] Generative summary updated! New Summary: \n${newSummary}`);
        } catch (e) {
            console.error('[AriaHistory] Summarization failed:', e);
            // Revert truncation on failure so we don't lose data
            finalMessages = [...session.messages, userMsg, assistantMsg]; 
        }
    }

    await supabase
        .from('aria_chat_history')
        .update({
            messages: finalMessages,
            summary: newSummary,
            last_ui_state: uiState,
            updated_at: new Date().toISOString()
        })
        .eq('id', session.id);
}
