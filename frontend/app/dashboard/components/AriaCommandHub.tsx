import React, { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react';
import { X, Send, FilePlus, Zap, MessageSquare, Paperclip, RotateCcw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useAria } from '@/lib/AriaContext';
import TemplatePreview from '@/app/resume-creator/components/TemplatePreview';
import { templatesConfig } from '@/app/resume-creator/templates/TemplateManager';
import './AriaCommandHub.css';

const AnyTemplatePreview = TemplatePreview as any;

// ─────────────────────────────────────────────────────────────────────────────
// Quick-reply chips — inline below any Aria message
// ─────────────────────────────────────────────────────────────────────────────
const QuickReplies = memo(({ choices, onSelect, disabled }: {
    choices: string[];
    onSelect: (val: string) => void;
    disabled?: boolean;
}) => {
    const [used, setUsed] = useState<string | null>(null);

    if (!choices?.length) return null;

    return (
        <div className="aria-quick-replies">
            {choices.map((c) => (
                <button
                    key={c}
                    className={`aria-qr-chip ${used === c ? 'used' : ''} ${disabled ? 'faded' : ''}`}
                    onClick={() => {
                        if (disabled || used) return;
                        setUsed(c);
                        onSelect(c);
                    }}
                    disabled={!!used || disabled}
                >
                    {c}
                </button>
            ))}
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// Mode selector widget
// ─────────────────────────────────────────────────────────────────────────────
const WidgetModeSelect = memo(({ onSelect }: { onSelect: (val: string) => void }) => {
    const modes = [
        { id: "Start Fresh", icon: "✦", desc: "Blank canvas, total control" },
        { id: "Import Resume", icon: "↑", desc: "Upload & upgrade your existing CV" },
        { id: "Use Career DNA", icon: "⌬", desc: "Build from your saved profile" },
    ];

    return (
        <div className="aria-widget-modes">
            {modes.map((m) => (
                <button key={m.id} className="awm-card" onClick={() => onSelect(m.id)}>
                    <span className="awm-icon">{m.icon}</span>
                    <div className="awm-info">
                        <span className="awm-label">{m.id}</span>
                        <span className="awm-desc">{m.desc}</span>
                    </div>
                    <ChevronRight size={14} className="awm-arrow" />
                </button>
            ))}
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// Upload widget
// ─────────────────────────────────────────────────────────────────────────────
const WidgetUpload = memo(() => {
    const { setUiState, sendCommand } = useAria();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const handleFile = (file: File) => {
        setUiState({ draftMode: 'import', stagedFile: file });
        sendCommand("");
    };

    return (
        <div
            className={`aria-widget-upload ${dragging ? 'drag-over' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
        >
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".pdf,.docx,.doc"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); if (e.target) e.target.value = ''; }}
            />
            <div className="awu-icon"><FilePlus size={22} /></div>
            <div className="awu-text">Drop your resume here or <u>browse</u></div>
            <div className="awu-sub">PDF, DOCX or DOC</div>
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// Lazy template card
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_DATA = {};

const LazyTemplateCard = memo(({ template, onSelect, isHubExpanded }: {
    template: string;
    onSelect: (val: string) => void;
    isHubExpanded: boolean;
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isHubExpanded) { setIsVisible(false); return; }
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setTimeout(() => setIsVisible(true), 150); },
            { threshold: 0.1, rootMargin: '80px' }
        );
        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, [isHubExpanded]);

    const label = template.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <div
            ref={cardRef}
            className="aria-widget-card"
            onClick={() => onSelect(`I choose the ${label} template`)}
        >
            <div className="awc-preview">
                {!isVisible && (
                    <div className="awc-placeholder">{label.charAt(0)}</div>
                )}
                {isVisible && isHubExpanded && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0,
                        width: '794px', height: '1123px',
                        transform: 'scale(0.176)', transformOrigin: 'top left',
                        pointerEvents: 'none',
                    }}>
                        <AnyTemplatePreview templateId={template} data={EMPTY_DATA} forceDefault isFormPanel />
                    </div>
                )}
            </div>
            <div className="awc-label">{label}</div>
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// Template carousel
// ─────────────────────────────────────────────────────────────────────────────
const WidgetCarousel = memo(({ items, filters, onSelect, isHubExpanded }: {
    items?: string[];
    filters?: any;
    onSelect: (val: string) => void;
    isHubExpanded: boolean;
}) => {
    const displayItems = useMemo(() => {
        const all = templatesConfig.map((t) => t.id);
        let filtered = items?.length ? items : all;
        if (filters && !items?.length) {
            filtered = templatesConfig.filter((t) => {
                const matchesCat = filters.category ? t.tags?.includes(filters.category) : true;
                const matchesTag = filters.tag ? t.tags?.includes(filters.tag) : true;
                return matchesCat && matchesTag;
            }).map((t) => t.id);
        }
        if (filtered.length <= 4) return filtered;
        return [...filtered].sort(() => 0.5 - Math.random()).slice(0, 4);
    }, [items, filters]);

    return (
        <div className="aria-widget-carousel">
            {displayItems.map((t) => (
                <LazyTemplateCard key={t} template={t} onSelect={onSelect} isHubExpanded={isHubExpanded} />
            ))}
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// Input bar (isolated to prevent re-render lag)
// ─────────────────────────────────────────────────────────────────────────────
const AriaInput = memo(({ onSend, isTyping }: { onSend: (val: string) => void; isTyping: boolean }) => {
    const [query, setQuery] = useState('');
    const { uiState, setUiState } = useAria();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSend = useCallback((e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim() && !uiState.stagedFile) return;
        onSend(query);
        setQuery('');
    }, [query, uiState.stagedFile, onSend]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) handleSend();
    };

    return (
        <div className="aria-input-container">
            {uiState.stagedFile && (
                <motion.div
                    className="aria-staged-chip"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Paperclip size={11} />
                    <span className="sc-name">{uiState.stagedFile.name}</span>
                    <button
                        className="sc-close"
                        onClick={(e) => { e.stopPropagation(); setUiState({ stagedFile: undefined }); }}
                    >
                        <X size={11} />
                    </button>
                </motion.div>
            )}
            <div className="aria-chat-form">
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setUiState({ draftMode: 'import', stagedFile: f });
                        if (e.target) e.target.value = '';
                    }}
                />
                <button
                    type="button"
                    className="aria-chat-attach"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach resume"
                >
                    <Paperclip size={16} />
                </button>
                <input
                    ref={inputRef}
                    type="text"
                    className="aria-chat-input"
                    placeholder="Type or pick an option above..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
                <button
                    type="button"
                    className="aria-chat-send"
                    onClick={() => handleSend()}
                    disabled={(!query.trim() && !uiState.stagedFile) || isTyping}
                >
                    <Send size={15} />
                </button>
            </div>
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// Typing indicator
// ─────────────────────────────────────────────────────────────────────────────
const TypingIndicator = () => (
    <div className="aria-bubble assistant">
        <div className="aria-avatar">A</div>
        <div className="aria-typing">
            <span /><span /><span />
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Single message bubble
// ─────────────────────────────────────────────────────────────────────────────
const MessageBubble = memo(({ msg, isLast, sendCommand, isExpanded }: {
    msg: any;
    isLast: boolean;
    sendCommand: (val: string) => void;
    isExpanded: boolean;
}) => {
    // Avoid rendering completely empty or hidden bubbles
    if (msg.isHidden || (!msg.text && !msg.widget && (!msg.choices?.length))) return null;

    return (
        <motion.div
            className={`aria-bubble ${msg.role}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            {msg.role === 'assistant' && <div className="aria-avatar">A</div>}

            <div className="aria-content-node">
                {msg.text && (
                    <div className="aria-text">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                )}

                {/* Widgets */}
                {msg.widget && (
                    <div className="aria-widget-container">
                        {(msg.widget.type === 'draftMode' || msg.widget.type === 'mode_select') && (
                            <WidgetModeSelect onSelect={sendCommand} />
                        )}
                        {msg.widget.type === 'options' && (
                            <div className="aria-widget-options">
                                {(msg.widget.choices || []).map((c: string) => (
                                    <button key={c} className="aria-widget-pill" onClick={() => sendCommand(c)}>{c}</button>
                                ))}
                            </div>
                        )}
                        {msg.widget.type === 'upload' && <WidgetUpload />}
                        {(msg.widget.type === 'carousel' || msg.widget.type === 'template_carousel') && (
                            <WidgetCarousel
                                items={msg.widget.items}
                                filters={msg.widget.filters}
                                onSelect={sendCommand}
                                isHubExpanded={isExpanded}
                            />
                        )}
                        {msg.widget.type === 'confirm' && (
                            <div className="aria-widget-options">
                                <button className="aria-widget-pill primary" onClick={() => sendCommand("Yes, build it!")}>Yes, build it!</button>
                                <button className="aria-widget-pill" onClick={() => sendCommand("No, wait")}>No, wait</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Quick-reply chips — only show on last assistant message */}
                {msg.role === 'assistant' && (msg.choices?.length ?? 0) > 0 && (
                    <QuickReplies
                        choices={msg.choices!}
                        onSelect={sendCommand}
                        disabled={!isLast}
                    />
                )}
            </div>
        </motion.div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// Main hub
// ─────────────────────────────────────────────────────────────────────────────
export default function AriaCommandHub() {
    const { messages, isTyping, sendCommand, setUiState, resetConversation } = useAria();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const hubRef = useRef<HTMLDivElement>(null);
    const endRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (hubRef.current && !hubRef.current.contains(e.target as Node)) setIsExpanded(false);
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (isExpanded) {
            setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
        }
    }, [messages, isTyping, isExpanded]);

    // ⌘K shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsExpanded((prev) => !prev);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const handleSend = useCallback((val: string) => sendCommand(val), [sendCommand]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setUiState({ draftMode: 'import', stagedFile: file });
            sendCommand("");
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className={`aria-hub ${isExpanded ? 'active' : ''}`} ref={hubRef}>

            {/* ── Trigger bar ───────────────────────────────────────────────────── */}
            <div className="aria-input-wrap" onClick={() => setIsExpanded(true)}>
                <span className="aria-search-icon">✦</span>
                <div className="aria-placeholder">Ask Aria anything...</div>
                {!isExpanded && <div className="aria-badge">⌘K</div>}
                {isExpanded && (
                    <button className="aria-close" onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}>
                        <X size={15} />
                    </button>
                )}
            </div>

            {/* ── Expanded dropdown ─────────────────────────────────────────────── */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className={`aria-dropdown ${isDragging ? 'dragging' : ''}`}
                        initial={{ opacity: 0, y: -8, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.99 }}
                        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                    >
                        {/* Header */}
                        <div className="aria-dropdown-header">
                            <div className="aria-header-left">
                                <span className="aria-header-dot" />
                                <span className="aria-header-title">Aria</span>
                                <span className="aria-header-sub">Resume Assistant</span>
                            </div>
                            {messages.length > 1 && (
                                <button
                                    className="aria-reset-btn"
                                    onClick={() => resetConversation?.()}
                                    title="Start over"
                                >
                                    <RotateCcw size={12} />
                                    <span>Reset</span>
                                </button>
                            )}
                        </div>

                        {/* Chat history */}
                        <div className="aria-history">
                            {messages.length === 0 && (
                                <div className="aria-empty-state">
                                    <div className="aes-icon">✦</div>
                                    <div className="aes-title">Hey there! I'm Aria.</div>
                                    <div className="aes-sub">Let's build your resume. What would you like to do?</div>
                                    <QuickReplies
                                        choices={["Start a new resume", "Import existing resume", "What's Career DNA?"]}
                                        onSelect={sendCommand}
                                    />
                                </div>
                            )}

                            {messages.map((msg: any, i: number) => (
                                <MessageBubble
                                    key={i}
                                    msg={msg}
                                    isLast={i === messages.length - 1}
                                    sendCommand={sendCommand}
                                    isExpanded={isExpanded}
                                />
                            ))}

                            {isTyping && <TypingIndicator />}
                            <div ref={endRef} style={{ height: 4 }} />
                        </div>

                        {/* Quick actions (shown when no messages yet or briefly) */}
                        {messages.length === 0 && (
                            <div className="aria-actions">
                                <button className="aria-chip" onClick={() => sendCommand("I want to start a new resume")}>
                                    <FilePlus size={11} /><span>New Resume</span>
                                </button>
                                <button className="aria-chip" onClick={() => sendCommand("Can you analyze my drafts?")}>
                                    <Zap size={11} /><span>Analyze Drafts</span>
                                </button>
                                <button className="aria-chip" onClick={() => sendCommand("I need career advice")}>
                                    <MessageSquare size={11} /><span>Career Advice</span>
                                </button>
                            </div>
                        )}

                        {/* Input */}
                        <div className="aria-foot">
                            <AriaInput onSend={handleSend} isTyping={isTyping} />
                            <span className="aria-label">Press <kbd>Enter</kbd> to send · <kbd>⌘K</kbd> to toggle</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}