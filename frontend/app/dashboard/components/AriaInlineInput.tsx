import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, ChevronUp, ChevronDown, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useAria } from '@/lib/AriaContext';
import '../dashboard.css'; // Inheriting dashboard minimalist styles

export default function AriaInlineInput({ placeholder = "Or tell Aria how you'd like to start..." }) {
    const { messages, isTyping, sendCommand } = useAria();
    const [query, setQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim() || isTyping) return;
        
        sendCommand(query);
        setQuery('');
        setIsExpanded(true); // Auto expand when sending
    };

    // Auto-scroll to latest message
    useEffect(() => {
        if (isExpanded) {
            setTimeout(() => {
                endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 100);
        }
    }, [messages, isTyping, isExpanded]);

    // Show last 6 messages if there are any
    const recentMessages = messages.slice(-6);

    return (
        <div className="aria-inline-wrap">
            <motion.div 
                className="aria-inline-reveal" // Just a container for the height clip
                initial={false}
                animate={{ 
                    height: isExpanded ? 'auto' : 0,
                    opacity: isExpanded ? 1 : 0
                }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} 
                style={{ overflow: 'hidden' }}
            >
                <div className="aria-inline-history">
                    <AnimatePresence mode="popLayout">
                        {recentMessages.map((msg, i) => (
                            <motion.div 
                                key={i} 
                                className={`aria-inline-bubble ${msg.role}`}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                layout
                            >
                                {msg.role === 'assistant' && (
                                    <div className="aria-avatar mini">A</div>
                                )}
                                <div className="aria-text text-sm">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            </motion.div>
                        ))}
                        {isTyping && (
                            <motion.div 
                                className="aria-inline-bubble assistant"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                layout
                            >
                                <div className="aria-avatar mini">A</div>
                                <div className="aria-typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={endOfMessagesRef} style={{ height: 1 }} />
                </div>
            </motion.div>

            <div className="aria-inline-form-wrapper">
                <form onSubmit={handleSend} className="aria-inline-form">
                    <button type="button" className="aria-inline-attach" onClick={() => sendCommand("I want to import a resume")} title="Attach Resume">
                        <Paperclip size={14} />
                    </button>
                    <input 
                        type="text" 
                        className="aria-inline-input"
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsExpanded(true)}
                        onBlur={() => {
                           // Delay collapse so click-to-select text doesn't hide it instantly
                           if (!isTyping) setTimeout(() => setIsExpanded(false), 200);
                        }}
                        disabled={isTyping}
                    />
                    <button type="submit" className="aria-inline-send" disabled={!query.trim() || isTyping}>
                        <Send size={14} />
                    </button>
                </form>
            </div>
        </div>
    );
}
