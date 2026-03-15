import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, Search, Plus, Loader2, Star, Trash2, Sparkles, X, ChevronRight, AlertCircle, Edit2, RefreshCw } from "lucide-react";
import ResumeRenderer from "../templates/ResumeRenderer";
import { Editor, EditorProvider, Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnBulletList } from 'react-simple-wysiwyg';
import { fetchAuthenticatedAI } from "../utils/aiApi";
import "./form.css";
import "./education.css"; // Shared Studio Styles
import "./experience.css"; // Shared Studio Styles
import "./skills.css";
import CompatibilityWarning from "./CompatibilityWarning";

// --- HELPERS ---
const cleanHtmlPreserveFormatting = (html) => {
    if (!html) return "";
    // Remove all tags EXCEPT formatting tags
    // Keep: b, i, u, strong, em, span
    const allowed = "b|i|u|strong|em|span";
    const pattern = new RegExp(`<(?!\/?(${allowed})\\b)[^>]+>`, "gi");
    return html.replace(pattern, "");
};

const extractSkillsFromHtml = (html) => {
    if (!html) return [];

    // 1. Try to extract explicit list items first
    const regex = /<li>(.*?)<\/li>/g;
    let matches = [];
    let match;
    let hasListItems = false;

    while ((match = regex.exec(html)) !== null) {
        hasListItems = true;
        const text = cleanHtmlPreserveFormatting(match[1]).trim();
        if (text) matches.push(text);
    }

    // If we found list items, use them (user is using bullets intentionally)
    if (hasListItems && matches.length > 0) return matches;

    // 2. Fallback: Parse as plain text if no list items found
    // Replace block-level tags and breaks with newlines to ensure separation
    // We treat opening/closing divs and p tags as logical line breaks
    let processedHtml = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?div[^>]*>/gi, '\n')
        .replace(/<\/?p[^>]*>/gi, '\n');

    const plainText = cleanHtmlPreserveFormatting(processedHtml).trim();
    if (!plainText) return [];

    // Split by newline ONLY (User request: no comma splitting)
    return plainText
        .split(/\n+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
};

const normalizeData = (arr) => {
    if (!arr) return [];
    return arr.map(item => typeof item === 'string' ? { name: item, level: 3 } : item);
};

export default function Skills({ data, setData, templateId, onBack, onNext, onPreview, isQuickEdit, onReturnToDashboard, isFieldSupported, currentTemplateName, isMobile }) {
    const hasAnySkills = () => {
        return (data.skills && data.skills.length > 0) ||
            (data.strengths && data.strengths.length > 0) ||
            (data.additionalSkills && data.additionalSkills.length > 0);
    };

    const [view, setView] = useState(() => {
        if (hasAnySkills()) return 'summary';
        if (isQuickEdit) return 'workstation';
        return 'intro';
    });
    const [activeSection, setActiveSection] = useState('main'); // 'main', 'strengths', 'additional'
    const [activeTab, setActiveTab] = useState('rating'); // 'rating', 'editor'

    // Data States
    const [skillsList, setSkillsList] = useState(normalizeData(data.skills));
    const [skillsText, setSkillsText] = useState(data.skillsDescription || "");
    const [strengthsList, setStrengthsList] = useState(normalizeData(data.strengths));
    const [additionalList, setAdditionalList] = useState(normalizeData(data.additionalSkills));

    // Ensure resume structure exists
    useEffect(() => {
        setData(prev => ({
            ...prev,
            skills: prev.skills || [],
            skillsDescription: prev.skillsDescription || "",
            strengths: prev.strengths || [],
            additionalSkills: prev.additionalSkills || []
        }));
    }, []);

    // Sync local state when DB data loads
    useEffect(() => {
        setSkillsList(normalizeData(data.skills));
        setSkillsText(data.skillsDescription || "");
        setStrengthsList(normalizeData(data.strengths));
        setAdditionalList(normalizeData(data.additionalSkills));
    }, [
        data.skills,
        data.skillsDescription,
        data.strengths,
        data.additionalSkills
    ]);

    // UI States
    const [aiSearchTerm, setAiSearchTerm] = useState("");
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [showLoadingPopup, setShowLoadingPopup] = useState(false);
    const [isProactiveLoading, setIsProactiveLoading] = useState(false);
    const [aiFilterTerm, setAiFilterTerm] = useState("");
    const [showSelectorOverlay, setShowSelectorOverlay] = useState(false);

    // --- TWO-WAY SYNC LOGIC ---

    // Sync List -> Editor (When rating list changes, update HTML)
    const syncListToEditor = (newList) => {
        if (activeSection !== 'main') return;
        const html = `<ul>${newList.map(s => `<li>${s.name}</li>`).join('')}</ul>`;
        setSkillsText(html);
    };

    // Sync Editor -> List (When text changes, parse items into rating list)
    const handleEditorChange = (e) => {
        const newHtml = e.target.value;
        setSkillsText(newHtml);

        const parsedNames = extractSkillsFromHtml(newHtml);
        setSkillsList(prev => {
            // Keep existing levels for matching names, add new ones with level 3
            return parsedNames.map(name => {
                const existing = prev.find(p => p.name === name);
                return existing ? existing : { name, level: 3 };
            });
        });
    };

    // Global Sync to Parent
    useEffect(() => {
        const timer = setTimeout(() => {
            setData(prev => ({
                ...prev,
                skills: skillsList,
                skillsDescription: skillsText,
                strengths: strengthsList,
                additionalSkills: additionalList
            }));
        }, 200);
        return () => clearTimeout(timer);
    }, [skillsList, skillsText, strengthsList, additionalList, setData]);

    // --- HANDLERS ---

    const fetchAiSkills = async (term) => {
        if (!term) return;
        setShowLoadingPopup(true);
        try {
            const response = await fetchAuthenticatedAI('/resumy/api/ai/header-intelligence', {
                method: 'POST',
                body: JSON.stringify({
                    type: "skills",
                    value: term,
                    context: { userProfession: term }
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("[SKILLS] Expected JSON but got:", text.substring(0, 100));
                return;
            }

            const resData = await response.json();
            if (resData.result) {
                let cleanJson = resData.result;
                const match = cleanJson.match(/\[[\s\S]*\]/);
                if (match) cleanJson = match[0];
                const parsed = JSON.parse(cleanJson);
                setAiSuggestions(parsed);
            }
        } catch (error) { console.error("Skills API Error:", error); } finally { setShowLoadingPopup(false); }
    };

    const fetchProactiveSkills = async (force = false) => {
        const stored = data.ai_suggestions?.skills;
        if (!force && stored && stored.length > 0) {
            setAiSuggestions(stored);
            setAiSearchTerm(data.personal?.profession || "");
            return;
        }

        if (!force && aiSuggestions.length > 0) return;
        setShowLoadingPopup(true);
        try {
            const response = await fetchAuthenticatedAI('/resumy/api/ai/header-intelligence', {
                method: 'POST',
                body: JSON.stringify({
                    type: "skills",
                    value: "",
                    context: {
                        userProfession: data.personal?.profession,
                        experiences: data.experience || []
                    }
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("[SKILLS] Expected JSON but got:", text.substring(0, 100));
                return;
            }

            const resData = await response.json();
            if (resData.result) {
                let cleanJson = resData.result;
                const match = cleanJson.match(/\[[\s\S]*\]/);
                if (match) cleanJson = match[0];
                const parsed = JSON.parse(cleanJson);
                setAiSuggestions(parsed);
                setAiSearchTerm(data.personal?.profession || "");
                setData(prev => ({
                    ...prev,
                    ai_suggestions: { ...(prev.ai_suggestions || {}), skills: parsed }
                }));
            }
        } catch (error) { console.error("[SKILLS] Proactive Error:", error); } finally { setShowLoadingPopup(false); }
    };

    useEffect(() => {
        if (view === 'workstation') {
            fetchProactiveSkills();
        }
    }, [view]);

    const handleAddFromAI = (skillName) => {
        // Only check for duplicates if it's NOT a default placeholder
        const isPlaceholder = ["New Skill", "New Strength", "An Addition"].includes(skillName);

        if (activeSection === 'main') {
            if (!isPlaceholder && skillsList.some(s => s.name === skillName)) return;
            const newList = [...skillsList, { name: skillName, level: 3 }];
            setSkillsList(newList);
            syncListToEditor(newList);
        } else if (activeSection === 'strengths') {
            if (!isPlaceholder && strengthsList.some(s => s.name === skillName)) return;
            setStrengthsList(prev => [...prev, { name: skillName, level: 3 }]);
        } else {
            if (!isPlaceholder && additionalList.some(s => s.name === skillName)) return;
            setAdditionalList(prev => [...prev, { name: skillName, level: 3 }]);
        }
    };

    const updateItemLevel = (index, level) => {
        if (activeSection === 'main') {
            const updated = [...skillsList];
            updated[index].level = level;
            setSkillsList(updated);
        } else if (activeSection === 'strengths') {
            const updated = [...strengthsList];
            updated[index].level = level;
            setStrengthsList(updated);
        } else {
            const updated = [...additionalList];
            updated[index].level = level;
            setAdditionalList(updated);
        }
    };

    const updateItemName = (index, val) => {
        if (activeSection === 'main') {
            const updated = [...skillsList];
            updated[index].name = val;
            setSkillsList(updated);
            syncListToEditor(updated);
        } else if (activeSection === 'strengths') {
            const updated = [...strengthsList];
            updated[index].name = val;
            setStrengthsList(updated);
        } else {
            const updated = [...additionalList];
            updated[index].name = val;
            setAdditionalList(updated);
        }
    }

    const removeItem = (index) => {
        if (activeSection === 'main') {
            const newList = skillsList.filter((_, i) => i !== index);
            setSkillsList(newList);
            syncListToEditor(newList);
        } else if (activeSection === 'strengths') {
            setStrengthsList(prev => prev.filter((_, i) => i !== index));
        } else {
            setAdditionalList(prev => prev.filter((_, i) => i !== index));
        }
    };

    // LIST TO RENDER
    const currentList = activeSection === 'main' ? skillsList : activeSection === 'strengths' ? strengthsList : additionalList;
    const currentTitle = activeSection === 'main' ? 'Skills' : activeSection === 'strengths' ? 'Key Strengths' : 'Additional Skills';


    // --- VIEWS ---

    const goToPrev = () => {
        if (view === 'intro') {
            onBack();
        } else if (view === 'summary') {
            onBack();
        } else if (view === 'workstation') {
            setView(hasAnySkills() ? 'summary' : 'intro');
        }
    };

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
                        <h1 className="form-title" style={{ fontSize: isMobile ? '28px' : '36px' }}>Skills & Strengths</h1>
                        <div className="education-intro-text">
                            <p className="intro-label">Why this matters:</p>
                            <p className="intro-body">Employers scan for keywords. We'll help you organize your expertise for maximum impact.</p>
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
                            onClick={() => setView('workstation')}
                            style={{ width: isMobile ? '100%' : 'auto', minWidth: '240px' }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'summary') {
        return (
            <div className={`animate-fade education-container ${isMobile ? 'mobile-mode' : ''}`} style={{ padding: isMobile ? '16px' : '40px' }}>
                <div className="ai-header">
                    <button className="back-link" onClick={goToPrev} style={{ marginBottom: '10px' }}><ArrowLeft size={16} /> Go Back</button>
                    <h1 className="form-title">Skills Summary</h1>
                    <div className="form-subtitle">Review and organize your skill sets.</div>
                </div>

                <div className="skills-summary-container">
                    {[
                        { id: 'main', title: 'Main Skills', list: skillsList },
                        { id: 'strengths', title: 'Key Strengths', list: strengthsList },
                        { id: 'additional', title: 'Additional Skills', list: additionalList }
                    ].map((cat) => (
                        <div key={cat.id} className="skill-category-card">
                            <div className="skill-category-header">
                                <span className="skill-category-title">{cat.title}</span>
                                <button className="btn-edit-category" onClick={() => { setActiveSection(cat.id); setView('workstation'); }}>
                                    <Edit2 size={14} /> Edit
                                </button>
                            </div>
                            <div className="skill-chips-wrapper">
                                {cat.list.length === 0 && <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No skills added.</span>}
                                {cat.list.map((s, i) => (
                                    <div key={i} className="skill-summary-chip">
                                        <span dangerouslySetInnerHTML={{ __html: s.name }} />
                                        <div className="chip-rating-dots">
                                            {[1, 2, 3, 4, 5].map(l => <div key={l} className={`chip-dot ${l <= s.level ? 'filled' : ''}`} />)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="form-footer" style={{
                    display: 'flex',
                    justifyContent: isMobile ? 'center' : 'flex-end',
                    width: '100%',
                    marginTop: 'auto',
                    paddingTop: '32px',
                    borderTop: '1px solid var(--gap-border)'
                }}>
                    <button
                        className="btn-next primary"
                        onClick={() => {
                            if (!hasAnySkills()) {
                                if (isMobile) {
                                    setTimeout(() => {
                                        const entryBtn = document.querySelector('.add-one-more-btn, .btn-next.primary');
                                        if (entryBtn) entryBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }, 100);
                                }
                                // If they haven't added anything, maybe show a toast or just scroll to the "Add" area
                                // But usually Skills is optional, so we allow onNext.
                                // If you want to force at least one skill, add check here.
                            }
                            isQuickEdit ? onReturnToDashboard() : onNext();
                        }}
                        style={{ width: isMobile ? '100%' : 'auto', minWidth: '240px' }}
                    >
                        {isQuickEdit ? 'Save & Return' : 'Save & Continue'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade education-container">
            <div className="ai-header">
                <button className="back-link" onClick={goToPrev} style={{ marginBottom: '10px' }}><ArrowLeft size={16} /> Go Back</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h1 className="form-title">{currentTitle}</h1>
                    <span className="skills-count-badge">{currentList.length} items</span>
                </div>
                <div className="form-subtitle">Add and rate your skills for this section.</div>
            </div>

            <div className="studio-workstation" style={{
                flexDirection: isMobile ? 'column' : 'row',
                height: isMobile ? '750px' : '580px',
                gap: 0
            }}>
                {/* SIDEBAR: AI Suggestions (Preserved Logic) */}
                <div className="studio-ws-sidebar">
                    <div className="studio-ws-sidebar-header">
                        <div className="ai-search-box-studio">
                            <Search size={14} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search skills by job title..."
                                className="search-input"
                                value={aiSearchTerm}
                                onChange={(e) => setAiSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchAiSkills(aiSearchTerm)}
                            />
                            <button className="search-arrow-btn" onClick={() => fetchAiSkills(aiSearchTerm)}>
                                <div className="arrow-right">→</div>
                            </button>
                        </div>
                    </div>

                    <div className="studio-ws-sidebar-scroll">
                        <div style={{
                            padding: '0 0 16px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: 'var(--gap-text-muted)',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '12px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                <span style={{ fontSize: '16px' }}>✨</span>
                                Suggestions {aiSearchTerm && `for ${aiSearchTerm}`}
                            </div>
                            <button
                                onClick={() => fetchProactiveSkills(true)}
                                title="Regenerate Suggestions"
                                disabled={showLoadingPopup}
                                style={{ background: 'transparent', border: 'none', color: 'var(--gap-text-muted)', cursor: 'pointer', padding: '4px' }}
                            >
                                <RefreshCw size={14} className={showLoadingPopup ? "spin" : ""} />
                            </button>
                        </div>

                        <div className="studio-suggestion-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {showLoadingPopup ? (
                                <div style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                    <Loader2 size={32} className="spin" color="#635bff" />
                                </div>
                            ) : aiSuggestions.length > 0 ? (
                                aiSuggestions.map((text, idx) => {
                                    const isSelected = currentList.some(s => s.name === text);
                                    return (
                                        <button
                                            key={idx}
                                            className={`studio-example-pill ${isSelected ? 'added' : ''} animate-slide-in`}
                                            style={{ animationDelay: `${idx * 0.05}s` }}
                                            onClick={() => handleAddFromAI(text)}
                                            disabled={isSelected}
                                        >
                                            <span className="studio-pill-icon">{isSelected ? <Check size={12} /> : <Plus size={12} />}</span>
                                            <span className="studio-pill-text">{text}</span>
                                        </button>
                                    );
                                })
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                    Enter a job title to get relevant suggestions.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* EDITOR PANE */}
                <div className="studio-ws-editor" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: isMobile ? '400px' : 'none', flex: 1 }}>
                    {/* Minimal Tabs */}
                    <div style={{
                        display: 'flex',
                        borderBottom: '1px solid var(--gap-border)',
                        padding: '0 24px'
                    }}>
                        <button
                            onClick={() => setActiveTab('rating')}
                            style={{
                                padding: '16px 4px',
                                marginRight: '24px',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === 'rating' ? '2px solid var(--gap-primary)' : '2px solid transparent',
                                color: activeTab === 'rating' ? 'var(--gap-primary)' : 'var(--gap-text-muted)',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            List View
                        </button>
                        <button
                            onClick={() => setActiveTab('editor')}
                            style={{
                                padding: '16px 4px',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === 'editor' ? '2px solid var(--gap-primary)' : '2px solid transparent',
                                color: activeTab === 'editor' ? 'var(--gap-primary)' : 'var(--gap-text-muted)',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: activeSection === 'main' ? 'block' : 'none' // Hide for non-main unless supported
                            }}
                        >
                            Text Editor
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                        {activeTab === 'rating' ? (
                            <div className="skills-rating-container">
                                {currentList.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gap-text-muted)', fontSize: '14px' }}>
                                        No skills in this section yet.
                                    </div>
                                )}

                                {currentList.map((item, idx) => (
                                    <div key={idx} className="skill-rating-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', background: 'white', padding: '12px', border: '1px solid var(--gap-border)', borderRadius: '8px' }}>
                                        <div style={{ flex: 1 }}>
                                            <input
                                                className="skill-input-box"
                                                value={item.name}
                                                onChange={(e) => updateItemName(idx, e.target.value)}
                                                placeholder="Skill Name"
                                                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14.5px', fontWeight: 500, color: 'var(--gap-text-main)' }}
                                            />
                                        </div>

                                        <div className="star-rating" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                                            {[1, 2, 3, 4, 5].map(l => (
                                                <div
                                                    key={l}
                                                    onClick={() => updateItemLevel(idx, l)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        padding: '4px'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        background: l <= item.level ? 'var(--gap-primary)' : '#e2e8f0',
                                                        transition: 'all 0.2s'
                                                    }} />
                                                </div>
                                            ))}
                                            <div style={{ marginLeft: '8px' }}>
                                                <CompatibilityWarning isSupported={isFieldSupported('skills.level')} templateName={currentTemplateName} />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => removeItem(idx)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--gap-text-muted)',
                                                cursor: 'pointer',
                                                padding: '4px'
                                            }}
                                            className="hover-delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    className="add-one-more-btn"
                                    onClick={() => handleAddFromAI(activeSection === 'main' ? "New Skill" : activeSection === 'strengths' ? "New Strength" : "An Addition")}
                                    style={{
                                        marginTop: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 16px',
                                        background: 'transparent',
                                        border: '1px dashed var(--gap-border)',
                                        borderRadius: '8px',
                                        color: 'var(--gap-primary)',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        width: '100%',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Plus size={16} /> Add another skill
                                </button>
                            </div>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <EditorProvider>
                                    <Editor
                                        value={skillsText || ''}
                                        onChange={handleEditorChange}
                                        containerProps={{
                                            className: 'skills-rich-editor',
                                            style: { height: '100%', flex: 1, border: '1px solid #e2e8f0', borderRadius: 8, overflowY: 'auto' }
                                        }}
                                    >
                                        <Toolbar>
                                            <BtnBold />
                                            <BtnItalic />
                                            <BtnUnderline />
                                            <BtnBulletList />
                                        </Toolbar>
                                    </Editor>
                                </EditorProvider>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="form-footer" style={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
                marginTop: '30px',
                gap: '12px'
            }}>
                <button
                    className="btn-next primary"
                    onClick={isQuickEdit ? onReturnToDashboard : (() => setView('summary'))}
                    style={{ width: isMobile ? '100%' : 'auto', minWidth: '240px' }}
                >
                    {isQuickEdit ? 'Save & Return' : 'Save & Next'}
                </button>
            </div>
        </div>
    );
}