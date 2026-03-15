import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Loader2, Sparkles, Zap, Award, Briefcase, UserCheck, RefreshCw } from "lucide-react";
import { fetchAuthenticatedAI } from "../utils/aiApi";
import ResumeRenderer from "../templates/ResumeRenderer";
import { Editor, EditorProvider, Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnBulletList } from 'react-simple-wysiwyg';
import "./form.css";
import "./education.css"; // Reuse Studio styles
import "./summary.css";
import CompatibilityWarning from "./CompatibilityWarning";

export default function Summary({ data, setData, templateId, onBack, onNext, onPreview, isQuickEdit, onReturnToDashboard, isFieldSupported, currentTemplateName, isMobile }) {
    const [view, setView] = useState(() => {
        if (data.summary && typeof data.summary === 'string' && data.summary.trim() !== '') return 'workspace';
        if (isQuickEdit) return 'workspace';
        return 'intro';
    });

    // 1. Initialize Local State Safely
    const [summaryText, setSummaryText] = useState(
        typeof data.summary === "string" ? data.summary : ""
    );

    const [dnaSummaries, setDnaSummaries] = useState({ specialist: "", achievement: "", modern: "" });
    const [isLoading, setIsLoading] = useState(false);

    // 2. Ensure Structure Exists
    useEffect(() => {
        setData(prev => ({
            ...prev,
            summary: typeof prev.summary === "string" ? prev.summary : ""
        }));
    }, [setData]);

    // 3. DB -> Local Sync
    useEffect(() => {
        setSummaryText(
            typeof data.summary === "string" ? data.summary : ""
        );
    }, [data.summary]);

    // 4. Keep Debounced Autosync
    useEffect(() => {
        const timer = setTimeout(() => {
            setData(prev => ({ ...prev, summary: summaryText }));
        }, 200);
        return () => clearTimeout(timer);
    }, [summaryText, setData]);

    // DNA Fetch based on Context
    const fetchDnaSummaries = async (force = false) => {
        const stored = data.ai_suggestions?.summary;
        if (!force && stored && stored.specialist) {
            setDnaSummaries(stored);
            return;
        }

        if (!force && dnaSummaries.specialist) return;
        setIsLoading(true);
        try {
            const response = await fetchAuthenticatedAI('/resumy/api/ai/header-intelligence', {
                method: 'POST',
                body: JSON.stringify({
                    type: "summary_dna",
                    value: "",
                    context: {
                        userProfession: data.personal?.profession,
                        experiences: data.experience || [],
                        education: data.education || [],
                        skills: data.skills || []
                    }
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("[SUMMARY DNA] Expected JSON but got:", text.substring(0, 100));
                return;
            }

            const resData = await response.json();
            if (resData.result) {
                let cleanJson = resData.result;
                const match = cleanJson.match(/\{[\s\S]*\}/);
                if (match) cleanJson = match[0];
                const parsed = JSON.parse(cleanJson);
                setDnaSummaries(parsed);
                setData(prev => ({
                    ...prev,
                    ai_suggestions: { ...(prev.ai_suggestions || {}), summary: parsed }
                }));
            }
        } catch (error) {
            console.error("[SUMMARY DNA] Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'workspace') {
            fetchDnaSummaries();
        }
    }, [view]);

    const handleApplyVibe = (vibeKey) => {
        const selectedText = dnaSummaries[vibeKey];
        if (selectedText) {
            setSummaryText(selectedText);
        }
    };

    const handleEditorChange = (e) => {
        setSummaryText(e.target.value);
    };

    const goToPrev = () => {
        if (view === 'intro') {
            onBack();
        } else if (view === 'workspace') {
            onBack();
        }
    };

    // --- VIEW: INTRO ---
    if (view === 'intro') {
        return (
            <div className={`animate-fade education-intro-container ${isMobile ? 'mobile-mode' : ''}`} style={{
                justifyContent: 'center',
                maxWidth: '800px',
                margin: '0 auto',
                padding: isMobile ? '20px' : '0'
            }}>
                <div className="edu-intro-left" style={{ flex: 'none', width: '100%', maxWidth: '600px', textAlign: isMobile ? 'center' : 'left' }}>
                    {!isMobile && (
                        <button className="back-link" onClick={goToPrev}>
                            <ArrowLeft size={16} /> Go Back
                        </button>
                    )}

                    <div className="intro-text-content">
                        <h1 className="form-title" style={{ fontSize: isMobile ? '28px' : '36px' }}>Professional Summary</h1>
                        <div className="education-intro-text">
                            <p className="intro-label">Why this matters:</p>
                            <p className="intro-body">
                                A professional summary is your elevator pitch. Choose from our pre-written examples or write your own to make a strong first impression.
                            </p>
                        </div>
                    </div>

                    <div className="form-footer" style={{
                        marginTop: 'auto',
                        paddingBottom: '20px',
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <button
                            className="btn-next primary"
                            onClick={() => setView('workspace')}
                            style={{ width: isMobile ? '100%' : 'auto', minWidth: '240px' }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW: WORKSPACE (STUDIO) ---
    return (
        <div className={`animate-fade education-container ${isMobile ? 'mobile-mode' : ''}`} style={{ padding: isMobile ? '16px' : '40px' }}>
            <div className="ai-header">
                <button className="back-link" onClick={goToPrev} style={{ marginBottom: '10px' }}><ArrowLeft size={16} /> Go Back</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h1 className="form-title">Professional Summary</h1>
                    <CompatibilityWarning isSupported={isFieldSupported('summary')} templateName={currentTemplateName} />
                </div>
                <div className="form-subtitle">We've synthesized your background into three unique professional "Vibes".</div>
            </div>

            <div className="studio-workstation" style={{
                flexDirection: isMobile ? 'column' : 'row',
                height: isMobile ? '750px' : '580px',
                gap: 0
            }}>
                {/* SIDEBAR: AI DNA Vibes */}
                <div className="studio-ws-sidebar">
                    <div className="studio-ws-sidebar-header" style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gap-primary)' }}>
                            <Sparkles size={20} className="animate-pulse" />
                            <span style={{ fontWeight: 800, fontSize: '13px', letterSpacing: '0.05em' }}>RESUME DNA SYNTHESIZER</span>
                        </div>
                        <button
                            onClick={() => fetchDnaSummaries(true)}
                            title="Regenerate Summaries"
                            disabled={isLoading}
                            style={{ background: 'transparent', border: 'none', color: 'var(--gap-text-muted)', cursor: 'pointer', padding: '4px' }}
                        >
                            <RefreshCw size={14} className={isLoading ? "spin" : ""} />
                        </button>
                    </div>

                    <div className="studio-ws-sidebar-scroll" style={{ padding: '16px' }}>
                        {isLoading ? (
                            <div style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                <Loader2 size={40} className="spin" color="var(--gap-primary)" />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    { key: 'specialist', label: 'THE SPECIALIST', icon: <Zap size={16} />, color: '#6366f1', desc: 'Deep technical expertise & hard skills.' },
                                    { key: 'achievement', label: 'THE ACHIEVER', icon: <Award size={16} />, color: '#ec4899', desc: 'Focus on metrics, wins & fast growth.' },
                                    { key: 'modern', label: 'THE MODERN PRO', icon: <UserCheck size={16} />, color: '#10b981', desc: 'Balanced mix of soft skills & vision.' }
                                ].map((vibe) => (
                                    <div
                                        key={vibe.key}
                                        className="summary-vibe-card animate-slide-in"
                                        onClick={() => handleApplyVibe(vibe.key)}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: '1.5px solid #f1f5f9',
                                            background: 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                background: `${vibe.color}15`,
                                                color: vibe.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {vibe.icon}
                                            </div>
                                            <span style={{ fontWeight: 800, fontSize: '12px', color: '#1e293b', letterSpacing: '0.05em' }}>{vibe.label}</span>
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{vibe.desc}</p>
                                        <div className="vibe-hover-indicator" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: vibe.color, opacity: 0, transition: '0.3s' }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* EDITOR PANE */}
                <div className="studio-ws-editor" style={{ height: isMobile ? '400px' : 'none', flex: 1 }}>
                    <div className="studio-ws-editor-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Briefcase size={16} color="#94a3b8" />
                        <span className="studio-ws-editor-label">PROFESSIONAL SUMMARY</span>
                    </div>
                    <div className="studio-editor-canvas">
                        <EditorProvider>
                            <Editor
                                value={summaryText}
                                onChange={handleEditorChange}
                                containerProps={{
                                    style: {
                                        height: '100%',
                                        border: 'none',
                                        outline: 'none',
                                        overflowY: 'auto'
                                    }
                                }}
                            >
                                <Toolbar>
                                    <BtnBold /><BtnItalic /><BtnUnderline /><BtnBulletList />
                                </Toolbar>
                            </Editor>
                        </EditorProvider>
                    </div>
                </div>
            </div>

            <div className="form-footer" style={{
                marginTop: '32px',
                display: 'flex',
                justifyContent: isMobile ? 'center' : 'flex-end',
                width: '100%',
                paddingTop: '32px',
                borderTop: '1px solid var(--gap-border)'
            }}>
                <button
                    className="btn-next primary"
                    onClick={() => {
                        const contentEmpty = !summaryText || summaryText.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length === 0;
                        if (contentEmpty && isMobile) {
                            setTimeout(() => {
                                const editor = document.querySelector('.studio-ws-editor, .studio-editor-canvas');
                                if (editor) editor.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 100);
                        }
                        isQuickEdit ? onReturnToDashboard() : onNext();
                    }}
                    style={{ width: isMobile ? '100%' : 'auto', minWidth: '240px' }}
                >
                    {isQuickEdit ? 'Save & Return' : 'Next: Finalize'}
                </button>
            </div>

            <style jsx>{`
                .summary-vibe-card:hover {
                    border-color: #6366f1;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
                }
                .summary-vibe-card:hover .vibe-hover-indicator {
                    opacity: 1;
                }
                .summary-vibe-card:active {
                    transform: scale(0.98);
                }
            `}</style>
        </div>
    );
}
