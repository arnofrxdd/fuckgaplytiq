"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from './supabaseClient';
import { templatesConfig } from '@/app/resume-creator/templates/TemplateManager';


export type UiState = {
    draftMode: 'new' | 'import' | 'dna' | null;
    draftName: string | null;
    templateId: string | null;
    triggerUploadTs?: number;
    navigation?: 'back' | 'forward' | 'close' | null;
    navigationTs?: number;
    draftId: string | null;
    droppedFile?: File; // Deprecated drag-and-drop auto-upload
    stagedFile?: File; // For holding attached files before send
    executeUploadTs?: number; // Tells page.tsx when Aria has approved the import
    isProcessing?: boolean; // True if a resume is currently being analyzed
    availableTemplates?: { id: string; name: string }[];
};

export type WidgetData = {
    type: 'options' | 'upload' | 'carousel' | 'draftMode' | 'draftName' | 'confirm' | 'mode_select' | 'template_carousel';
    choices?: string[]; // Used for 'options'
    items?: string[];   // Used for 'carousel'
    filters?: any;      // Used for 'carousel'
};

export type Message = {
    role: 'user' | 'assistant';
    text: string;
    widget?: WidgetData;
    choices?: string[]; // Quick-reply chips (buttons)
    isHidden?: boolean;
};

interface AriaContextType {
    uiState: UiState;
    setUiState: (partialState: Partial<UiState>) => void;
    messages: Message[];
    isTyping: boolean;
    sendCommand: (query: string, isHidden?: boolean) => Promise<void>;
    resetConversation: () => void;
}

const defaultUiState: UiState = {
    draftMode: null,
    draftName: null,
    templateId: null,
    draftId: null,
};

const AriaContext = createContext<AriaContextType | undefined>(undefined);

export function AriaProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [uiState, setUiStateFull] = useState<UiState>(defaultUiState);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', text: "Hello! I'm Aria, your career architect. How can I help you build your future today?" }
    ]);
    const [commandIsTyping, setCommandIsTyping] = useState(false);
    const isTyping = commandIsTyping || (uiState.isProcessing || false);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data: { session } } = await supabaseClient.auth.getSession();
                const token = session?.access_token;
                if (!token) {
                    setIsHydrated(true);
                    return;
                }

                const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const res = await fetch(`${backendUrl}/api/aria/history?context=dashboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.messages && data.messages.length > 0) {
                        setMessages(data.messages);
                    }
                    if (data.last_ui_state) {
                        // Protect local File objects if the backend tries to overwrite them with basic stubs
                        const safeState = { ...data.last_ui_state };
                        if (safeState.stagedFile !== null) delete safeState.stagedFile;
                        setUiStateFull(prev => ({ ...prev, ...safeState }));
                    }
                }
            } catch (err) {
                console.error("[AriaContext] Failed to load history", err);
            } finally {
                setIsHydrated(true);
            }
        };

        fetchHistory();
    }, []);

    const setUiState = useCallback((partialState: Partial<UiState>) => {
        setUiStateFull(prev => ({ ...prev, ...partialState }));
    }, []);

    const sendCommand = useCallback(async (query: string, isHidden?: boolean) => {
        let actualQuery = query;
        if (!query.trim() && uiState.stagedFile) {
            actualQuery = "I have attached my resume. Please import it.";
        }
        if (!actualQuery.trim()) return;

        // Add user message to chat (don't show the fake text if they only uploaded)
        const userMsg: Message = { role: 'user', text: actualQuery.trim() ? actualQuery : "📄 *Attached Resume*", isHidden };
        setMessages(prev => [...prev, userMsg]);
        if (!isHidden) setCommandIsTyping(true);

        try {
            // Get user session token for auth
            const { data: { session } } = await supabaseClient.auth.getSession();
            const token = session?.access_token;
            
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            // Inject Staged File System Prompt
            let finalQuery = actualQuery;
            if (uiState.stagedFile) {
                finalQuery += `\n\n[System Note: The user has securely staged a file named '${uiState.stagedFile.name}' for import. DO NOT ask them to upload it. If you have all other required pieces of information (like draftName and templateId), immediately ask if they are ready to create the draft!]`;
            }
            // Simple Frontend Safety Lock
            if (uiState.isProcessing) {
                finalQuery += `\n\n[System Note: CRITICAL! A resume is CURRENTLY being analyzed in the background. DO NOT execute ANY tools that create drafts or trigger imports right now. If the user asks you to build or import a resume or do an action, politely tell them to please wait for the current analysis to finish. You may still answer general questions, but DO NOT call 'update_order' or 'confirm_or_reset' under any circumstances.]`;
            }

            const response = await fetch(`${backendUrl}/api/aria/command`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ 
                    message: finalQuery, 
                    context: {
                        ...uiState,
                        stagedFile: uiState.stagedFile ? { name: uiState.stagedFile.name } : null
                    }, 
                    history: messages,
                    stream: true // REQUEST STREAMING
                })
            });
            
            if (!response.ok) throw new Error("Aria responded with an error.");
            
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error("No reader available");

            let done = false;
            let currentAssistantText = "";
            let finalData: any = null;

            // Create a placeholder assistant message that we will stream into
            setMessages(prev => [...prev, { role: 'assistant', text: "" }]);
            setCommandIsTyping(false); // Stop the generic "..." indicator once we start streaming tokens

            let buffer = "";

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || ""; // hold partial in buffer
                
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('data: ')) {
                        const dataStr = trimmedLine.replace('data: ', '').trim();
                        if (dataStr === '[DONE]') continue;

                        try {
                            const data = JSON.parse(dataStr);

                            if (data.type === 'text_chunk') {
                                console.log("[Aria Stream] Chunk:", data.content);
                                currentAssistantText += data.content;
                                // Update the last message (the placeholder one)
                                setMessages(prev => {
                                    const next = [...prev];
                                    if (next.length > 0) {
                                        next[next.length - 1] = { 
                                            ...next[next.length - 1], 
                                            text: currentAssistantText 
                                        };
                                    }
                                    return next;
                                });
                            } else if (data.type === 'widget_chunk') {
                                console.log("[Aria Stream] Widget:", data.widget);
                                setMessages(prev => {
                                    const next = [...prev];
                                    if (next.length > 0) {
                                        next[next.length - 1] = { 
                                            ...next[next.length - 1], 
                                            widget: { type: data.widget, choices: data.choices },
                                            choices: data.choices
                                        };
                                    }
                                    return next;
                                });
                            } else {
                                // This is the final structured response (tool call or final text)
                                finalData = data;
                            }
                        } catch (e) {
                             console.warn("[Aria Debug] Stream parsing error", e, dataStr);
                        }
                    }
                }
            }

            console.log("[Aria Debug] Received final data:", finalData);
            console.log("[Aria Debug] currentAssistantText state:", currentAssistantText);
            
            if (!finalData) {
                console.warn("[Aria Debug] No finalData received in stream.");
                return;
            }

            const data = finalData;

            // ── Update local UI state from backend response ──
            if (data.updatedCtx) {
                const newCtx = { ...data.updatedCtx };
                // Prevent backend from destroying the frontend's File object pointer 
                // unless explicitly resetting it to null
                if (newCtx.stagedFile !== null) delete newCtx.stagedFile;
                if (newCtx.availableTemplates) delete newCtx.availableTemplates;
                
                setUiStateFull(prev => ({ ...prev, ...newCtx }));
            }

            const replyText = data.content || currentAssistantText || "";
            const choices = data.choices || [];
            let widgetPayload: WidgetData | undefined = undefined;

            // ── New AI-Driven Tool Mapping ──────────────────────────────────
            if (data.type === 'tool_call') {
                const tool = data.tool;
                const args = data.args || {};

                if (tool === 'show_widget') {
                    if (args.widget === 'mode_select') widgetPayload = { type: 'mode_select' };
                    else if (args.widget === 'upload') widgetPayload = { type: 'upload' };
                    else if (args.widget === 'template_carousel') widgetPayload = { type: 'template_carousel' };
                    else if (args.widget === 'confirm') widgetPayload = { type: 'confirm' };
                    else if (args.widget === 'options') widgetPayload = { type: 'options', choices: args.choices };
                } 
                
                else if (tool === 'request_template_list') {
                    const templates = templatesConfig.map((t: any) => ({ id: t.id, name: t.name }));
                    setUiState({ availableTemplates: templates });
                    setTimeout(() => {
                        sendCommand("[System] The template list has been successfully loaded into your context. Please process the user's template selection or suggest options from the list.", true);
                    }, 50);
                    return; // early return so we don't display a bubble for this tool call
                }

                else if (tool === 'update_context' || tool === 'progress_resume_creation') {
                    // Update state variables provided by AI
                    const partial: Partial<UiState> = {};
                    if (args.draftMode) partial.draftMode = args.draftMode;
                    if (args.templateId) partial.templateId = args.templateId;
                    if (args.draftName) partial.draftName = args.draftName;
                    if (Object.keys(partial).length > 0) setUiState(partial);

                    // If simple choices/chips were returned
                    if (choices.length > 0 && !widgetPayload) {
                        widgetPayload = { type: 'options', choices: choices };
                    }
                }

                else if (tool === 'update_ui_state') {
                    if (args.executeUploadTs) setUiState({ executeUploadTs: args.executeUploadTs });
                    if (args.navigation) setUiState({ navigationTs: Date.now() });
                }

                else if (tool === 'navigate_to_editor') {
                    const { draftId, mode, templateId, draftName } = args;
                    setUiStateFull(defaultUiState);
                    router.push(`/resume-creator?mode=${mode || 'new'}&template=${templateId || 'meridian'}&view=onboarding&title=${encodeURIComponent(draftName || 'Untitled')}&resumeId=${draftId}`);
                    return; // Early exit on navigation
                }

                else if (tool === 'reset') {
                    resetConversation();
                    return;
                }
            }

            // ── Update visual chat bubble ──
            setMessages(prev => {
                const next = [...prev];
                if (next.length > 0) {
                    const currentMsg = next[next.length - 1];
                    next[next.length - 1] = { 
                        ...currentMsg,
                        text: replyText,
                        choices: choices.length > 0 ? choices : currentMsg.choices,
                        widget: widgetPayload !== undefined ? widgetPayload : currentMsg.widget,
                    };
                }
                return next;
            });

        } catch (error) {
            console.error("Aria error:", error);
            setCommandIsTyping(false);
            setMessages(prev => [...prev.filter(m => m.text !== ""), { 
                role: 'assistant', 
                text: "I'm having trouble connecting to my brain right now. Please try again later." 
            }]);
        }
    }, [uiState, messages]);

    // Synchronize isTyping with background processing removed as it is now derived
    
    const resetConversation = useCallback(() => {
        setMessages([{ role: 'assistant', text: "Hello! I'm Aria, your career architect. How can I help you build your future today?" }]);
        setUiStateFull(defaultUiState);
    }, []);

    return (
        <AriaContext.Provider value={{ uiState, setUiState, messages, isTyping, sendCommand, resetConversation }}>
            {children}
        </AriaContext.Provider>
    );
}

export function useAria() {
    const context = useContext(AriaContext);
    if (context === undefined) {
        throw new Error('useAria must be used within an AriaProvider');
    }
    return context;
}
