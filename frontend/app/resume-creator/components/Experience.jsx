import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, Search, Plus, Loader2, Edit2, Trash2, Lightbulb, PenLine, Briefcase, ChevronDown, ChevronUp, Link as LinkIcon, Zap, Sparkles, GripVertical, RefreshCw } from "lucide-react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ResumeRenderer from "../templates/ResumeRenderer";
import { templatesConfig } from "../templates/TemplateManager";
import { Editor, EditorProvider, Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnBulletList } from 'react-simple-wysiwyg';
import { fetchAuthenticatedAI } from "../utils/aiApi";
import "./form.css";
import "./education.css"; // We heavily rely on education.css for the studio look now
import "./experience.css";
import CompatibilityWarning from "./CompatibilityWarning";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const years = Array.from({ length: 50 }, (_, i) => 2030 - i);

const EXPERIENCE_TYPES = [
    "Internship",
    "Volunteering",
    "Teacher's Assistant",
    "Freelance",
    "Contract",
    "Tutor",
    "Research Assistant",
    "Full-time Employment"
];

// Helper to format dates
const formatDates = (startMonth, startYear, endMonth, endYear) => {
    if (!startYear) return "";
    const start = startMonth && startYear ? `${startMonth} ${startYear}` : (startYear || "");
    const end = endMonth && endYear ? `${endMonth} ${endYear}` : (endYear || "");
    if (start && !end) return `${start} – Present`;
    const currentYear = new Date().getFullYear();
    if (endYear && parseInt(endYear) > currentYear) return `Expected in ${end}`;
    if (start && end) return `${start} – ${end}`;
    return end || start;
};

// --- SMART INPUT COMPONENTS ---
const ValidatedInput = ({ label, value = "", onChange, placeholder = "", error, required, aiSuggestion, isLoading }) => {
    const strValue = value?.toString() || "";
    const aiStr = aiSuggestion?.toString() || "";
    const hasActiveAISuggestion = aiStr && strValue.toLowerCase() !== aiStr.toLowerCase();
    const showGhost = hasActiveAISuggestion && aiStr.toLowerCase().startsWith(strValue.toLowerCase());

    return (
        <div className="input-wrap group" style={{ position: 'relative', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="form-label">{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
                {hasActiveAISuggestion && (
                    <div className="flex items-center gap-1.5 animate-pulse bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-100 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-600 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                        <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest">AI SUGGESTED</span>
                    </div>
                )}
            </div>
            <div className="input-container" style={{ position: 'relative' }}>
                <input
                    className={`gap-input ${error ? 'error' : ''} ${hasActiveAISuggestion ? 'ai-glow-border' : ''}`}
                    value={strValue}
                    onChange={onChange}
                    placeholder={hasActiveAISuggestion ? "" : placeholder}
                    style={{ position: 'relative', zIndex: 10, background: 'transparent' }}
                />

                {showGhost && (
                    <div className="absolute left-[17px] top-1/2 -translate-y-1/2 pointer-events-none z-20 whitespace-pre overflow-hidden pr-20" style={{ fontSize: '15px' }}>
                        <span className="opacity-0">{strValue}</span>
                        <span className="text-violet-500/50 font-medium">{aiStr.substring(strValue.length)}</span>
                    </div>
                )}

                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-30">
                    {hasActiveAISuggestion && (
                        <button
                            onMouseDown={(e) => {
                                e.preventDefault();
                                onChange({ target: { value: aiStr } });
                            }}
                            className="bg-gradient-to-br from-violet-600 to-pink-500 text-white p-1.5 rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all border-0 flex items-center justify-center"
                            title="Accept AI"
                        >
                            <Sparkles size={13} fill="currentColor" />
                        </button>
                    )}
                    {strValue && !error && !hasActiveAISuggestion && <Check size={14} className="input-check-icon" />}
                </div>
            </div>
            {error && <p className="input-error-text">{error}</p>}
        </div>
    );
};

const SortableExperienceItem = ({ id, exp, idx, onEdit, onDelete, formatDates }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : 1,
        position: 'relative',
        opacity: isDragging ? 0.5 : 1
    };

    const title = exp.title || "Job Title";
    const company = exp.company || "Employer";
    const dates = formatDates(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear);

    return (
        <div ref={setNodeRef} style={style} className={`summary-card ${isDragging ? 'dragging' : ''}`}>
            <div {...attributes} {...listeners} className="drag-handle" style={{ cursor: 'grab', marginRight: '16px', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                <GripVertical size={20} />
            </div>
            <div className="summary-number-col">
                <div className="summary-number">{idx + 1}</div>
            </div>
            <div className="summary-details">
                <h4 className="summary-title">{title}</h4>
                <p className="summary-subtitle">
                    {company} {exp.location && `• ${exp.location}`} {dates && `• ${dates}`}
                </p>
            </div>
            <div className="item-actions">
                <button className="action-btn icon-btn" onClick={() => onEdit(idx)}><Edit2 size={14} /></button>
                <button className="action-btn icon-btn delete" onClick={() => onDelete(idx)}><Trash2 size={14} /></button>
            </div>
        </div>
    );
};

export default function Experience({ data, setData, templateId, onBack, onNext, onPreview, isQuickEdit, onReturnToDashboard, isFieldSupported, currentTemplateName, isMobile }) {

    const [view, setView] = useState(() => {
        if (isQuickEdit) {
            return (data.experience && data.experience.length > 0) ? 'list' : 'form';
        }
        if (data.experience && data.experience.length > 0) return 'list';
        return 'survey';
    });

    // Initialize experience safely to avoid undefined crashes
    useEffect(() => {
        if (!Array.isArray(data.experience)) {
            setData(prev => ({
                ...prev,
                experience: []
            }));
        }
    }, [data.experience, setData]);

    // Queue State
    const [queue, setQueue] = useState([]);
    const [queueIndex, setQueueIndex] = useState(0);
    const [isQueueMode, setIsQueueMode] = useState(false);

    const [editIndex, setEditIndex] = useState(-1);
    const [backupData, setBackupData] = useState(null);
    const [currentExp, setCurrentExp] = useState({
        title: "", company: "", location: "",
        isRemote: false,
        startMonth: "", startYear: "",
        isCurrent: false,
        endMonth: "", endYear: "",
        description: ""
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = data.experience.findIndex((_, i) => `exp-${i}` === active.id);
            const newIndex = data.experience.findIndex((_, i) => `exp-${i}` === over.id);

            const newList = arrayMove(data.experience, oldIndex, newIndex);
            setData(prev => ({ ...prev, experience: newList }));
        }
    };

    // Sync local changes to parent for live preview
    const syncToParent = (updatedExp) => {
        if (editIndex >= 0) {
            setData(prev => {
                const newList = [...(prev.experience || [])];
                newList[editIndex] = updatedExp;
                return { ...prev, experience: newList };
            });
        }
    };

    const handleLocalChange = (updates) => {
        const updated = { ...currentExp, ...updates };
        setCurrentExp(updated);
        syncToParent(updated);
    };

    const [errors, setErrors] = useState({});
    const [expSuggestions, setExpSuggestions] = useState({ title: null, company: null, location: null });
    const [isGeneratingBullets, setIsGeneratingBullets] = useState(false);
    const [isAiThinking, setIsAiThinking] = useState({ title: false, company: false, location: false });

    // AI Studio State
    const [aiSearchTerm, setAiSearchTerm] = useState("");
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [showLoadingPopup, setShowLoadingPopup] = useState(false);
    const [showLinkPopup, setShowLinkPopup] = useState(false);
    const [linkData, setLinkData] = useState({ text: '', url: '' });

    const getAIHeaderAdvice = async (type, value, context = {}) => {
        try {
            const response = await fetchAuthenticatedAI('/resumy/api/ai/header-intelligence', {
                method: 'POST',
                body: JSON.stringify({ type, value, context })
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) return null;

            const data = await response.json();
            return data.result;
        } catch (err) {
            return null;
        }
    };

    const handleGenerateBullets = async () => {
        if (!currentExp.title || !currentExp.company) {
            alert("Please fill in your Job Title and Employer first so the AI can generate relevant points.");
            return;
        }

        setIsGeneratingBullets(true);
        const context = {
            title: currentExp.title,
            company: currentExp.company,
            userProfession: data.personal?.profession
        };

        const bullets = await getAIHeaderAdvice("experience_description", "", context);
        if (bullets) {
            const currentDesc = currentExp.description || "";
            const newBullets = bullets.trim();

            let updated;
            if (currentDesc.includes("<ul>")) {
                updated = currentDesc.replace("</ul>", `${newBullets}</ul>`);
            } else {
                updated = `<ul>${newBullets}</ul>`;
            }
            handleLocalChange({ description: updated });
        }
        setIsGeneratingBullets(false);
    };

    const handleExpIntelligence = async (field, value) => {
        if (value.length >= 3) {
            setIsAiThinking(prev => ({ ...prev, [field]: true }));
            const context = {
                userCity: data.personal?.city,
                userProfession: data.personal?.profession,
                lastDegree: data.education?.[0]?.degree || "Unknown",
                isRemote: currentExp.isRemote,
                typingField: field
            };

            const aiRes = await getAIHeaderAdvice("experience", value, context);
            setIsAiThinking(prev => ({ ...prev, [field]: false }));
            if (aiRes) {
                try {
                    let cleanJson = aiRes;
                    if (typeof cleanJson === 'string') {
                        const match = cleanJson.match(/\{[\s\S]*\}/);
                        if (match) cleanJson = match[0];
                    }
                    const parsed = (typeof cleanJson === 'string') ? JSON.parse(cleanJson) : cleanJson;
                    if (parsed) {
                        if (field === 'title') {
                            // Lookahead: Suggest everything forward
                            setExpSuggestions({
                                title: parsed.title || null,
                                company: parsed.company || null,
                                location: parsed.location || null
                            });
                        } else if (field === 'company') {
                            // Gated: Clear title, suggest company and location forward
                            setExpSuggestions(prev => ({
                                ...prev,
                                title: null, // dcc9309e-4e26-4110-a160-04f07c2a8b7e
                                company: parsed.company || null,
                                location: parsed.location || null
                            }));
                        } else {
                            // Current field only: Clear everything else
                            setExpSuggestions(prev => ({
                                ...prev,
                                title: null,
                                company: null,
                                [field]: parsed[field] || null
                            }));
                        }
                    }
                } catch (e) { }
            }
        } else if (value.length === 0) {
            setExpSuggestions(prev => ({ ...prev, [field]: null }));
        }
    };

    // Collapsible sections in Studio
    const [openAiSection, setOpenAiSection] = useState(true);

    const insertLink = () => {
        if (!linkData.url) return;
        const linkHtml = `<a href="${linkData.url}" target="_blank" style="color: #2563eb; text-decoration: underline;">${linkData.text || linkData.url}</a>`;
        const currentDesc = currentExp.description || "";

        let updatedDesc;
        if (currentDesc.includes("</ul>")) {
            updatedDesc = currentDesc.replace("</ul>", `<li>${linkHtml}</li></ul>`);
        } else {
            updatedDesc = currentDesc + (currentDesc ? " " : "") + linkHtml;
        }

        const updated = { ...currentExp, description: updatedDesc };
        setCurrentExp(updated);
        syncToParent(updated);

        setShowLinkPopup(false);
        setLinkData({ text: '', url: '' });
    };

    // --- HANDLERS ---

    const handleTypeSelect = (type) => {
        setBackupData([...(data.experience || [])]);
        let autoTitle = type;
        if (type === "Internship") autoTitle = "Intern";
        if (type === "Full-time Employment") autoTitle = "";

        const newEntry = {
            title: autoTitle,
            company: "",
            location: "",
            isRemote: false,
            startMonth: "",
            startYear: "",
            isCurrent: false,
            endMonth: "",
            endYear: "",
            description: ""
        };

        const newList = [...(data.experience || []), newEntry];
        setData(prev => ({ ...prev, experience: newList }));
        setEditIndex(newList.length - 1);
        setCurrentExp(newEntry);
        setIsQueueMode(false);
        setView('form');
    };

    const handleAddNew = () => {
        setBackupData([...(data.experience || [])]);
        setEditIndex(-1);
        setIsQueueMode(false);
        setCurrentExp({
            title: "",
            company: "",
            location: "",
            isRemote: false,
            startMonth: "",
            startYear: "",
            isCurrent: false,
            endMonth: "",
            endYear: "",
            description: ""
        });
        setView('survey');
    };

    const handleCustomNew = () => {
        setBackupData([...(data.experience || [])]);
        const newEntry = {
            title: "",
            company: "",
            location: "",
            isRemote: false,
            startMonth: "",
            startYear: "",
            isCurrent: false,
            endMonth: "",
            endYear: "",
            description: ""
        };
        const newList = [...(data.experience || []), newEntry];
        setData(prev => ({ ...prev, experience: newList }));
        setEditIndex(newList.length - 1);
        setCurrentExp(newEntry);
        setIsQueueMode(false);
        setView('form');
    };

    const handleEdit = (index) => {
        setBackupData([...(data.experience || [])]);
        setEditIndex(index);
        setIsQueueMode(false);
        const item = (data.experience || [])[index];
        if (!item) return;
        setCurrentExp({ ...item, isCurrent: item.isCurrent || false, isRemote: item.isRemote || false });
        setView('form');
    };

    const handleDelete = (index) => {
        const newList = (data.experience || []).filter((_, i) => i !== index);
        setData(prev => ({ ...prev, experience: newList }));
        if (newList.length === 0) setView('survey');
    };

    const handleFormNext = () => {
        setErrors({});
        let newErrors = {};

        if (!currentExp.title?.trim()) {
            newErrors.title = "Please enter a Job Title.";
        }

        if (currentExp.startYear && currentExp.endYear && !currentExp.isCurrent) {
            const sYear = parseInt(currentExp.startYear);
            const eYear = parseInt(currentExp.endYear);
            if (sYear > eYear) {
                newErrors.dates = "In order to proceed, your end date can't be before the start date.";
            } else if (sYear === eYear && currentExp.startMonth && currentExp.endMonth) {
                const sMonthIdx = months.indexOf(currentExp.startMonth);
                const eMonthIdx = months.indexOf(currentExp.endMonth);
                if (sMonthIdx > eMonthIdx) {
                    newErrors.dates = "In order to proceed, your end date can't be before the start date.";
                }
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            if (isMobile) {
                setTimeout(() => {
                    const firstError = document.querySelector('.input-error-text, .error');
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            }
            return;
        }

        setAiSearchTerm(currentExp.title);
        setView('ai-editor');
        if (currentExp.title) fetchAiSuggestions(currentExp.title);
    };

    const handleSaveExperience = () => {
        // Data is already synced to parent via handleLocalChange
        setView('list');
    };

    const handleCancelEdit = () => {
        if (backupData) {
            setData(prev => ({ ...prev, experience: backupData }));
        }
        setView((data.experience || []).length > 0 ? 'list' : 'survey');
    };

    const fetchAiSuggestions = async (term, force = false) => {
        if (!term) return;

        const stored = data.ai_suggestions?.experience?.[term];
        if (!force && stored && stored.length > 0) {
            setAiSuggestions(stored);
            return;
        }

        setShowLoadingPopup(true);
        setAiSuggestions([]);
        try {
            const response = await fetchAuthenticatedAI('/resumy/api/ai/header-intelligence', {
                method: 'POST',
                body: JSON.stringify({
                    type: "experience_suggestions",
                    value: term
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) return;

            const resData = await response.json();
            if (resData.result) {
                let cleanJson = resData.result;
                const match = cleanJson.match(/\[[\s\S]*\]/);
                if (match) cleanJson = match[0];
                const parsed = JSON.parse(cleanJson);
                setAiSuggestions(parsed);
                setData(prev => ({
                    ...prev,
                    ai_suggestions: {
                        ...(prev.ai_suggestions || {}),
                        experience: {
                            ...((prev.ai_suggestions || {}).experience || {}),
                            [term]: parsed
                        }
                    }
                }));
            }
        } catch (error) {
            console.error("AI Fetch Error", error);
        } finally {
            setShowLoadingPopup(false);
        }
    };

    const stripHtml = (html) => {
        if (!html) return "";
        return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    };

    const appendSuggestion = (text) => {
        const cleanText = stripHtml(text);
        const cleanDesc = stripHtml(currentExp.description);

        if (cleanDesc.includes(cleanText)) return;

        const currentDesc = currentExp.description || "";
        const newText = `<li>${text}</li>`;
        const updatedDesc = currentDesc.includes("<ul>")
            ? currentDesc.replace("</ul>", `${newText}</ul>`)
            : currentDesc + `<ul>${newText}</ul>`;

        const updated = { ...currentExp, description: updatedDesc };
        setCurrentExp(updated);
        syncToParent(updated);
    };

    // --- VIEW 1: INTRO / SELECTION ---
    if (view === 'survey') {
        return (
            <div className={`animate-fade education-intro-container ${isMobile ? 'mobile-mode' : ''}`} style={{
                justifyContent: 'center',
                maxWidth: '800px',
                margin: '0 auto',
                padding: isMobile ? '20px' : '0'
            }}>
                <div className="edu-intro-left" style={{ flex: 'none', width: '100%', maxWidth: '600px', textAlign: isMobile ? 'center' : 'left' }}>
                    {!isMobile && (
                        <button className="back-link" onClick={onBack}>
                            <ArrowLeft size={16} /> Go Back
                        </button>
                    )}

                    <div className="intro-text-content">
                        <h1 className="form-title" style={{ fontSize: isMobile ? '28px' : '36px' }}>Work Experience</h1>
                        <div className="education-intro-text">
                            <p className="intro-label">Insight for your career:</p>
                            <p className="intro-body">Start by choosing a relevant experience type. We'll help you format it perfectly.</p>
                        </div>

                        <div className="exp-selection-grid" style={{
                            marginTop: '32px',
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                            gap: '12px'
                        }}>
                            {EXPERIENCE_TYPES.map(type => (
                                <button key={type} className="exp-type-btn" onClick={() => handleTypeSelect(type)} style={{ padding: isMobile ? '16px' : '12px 16px' }}>
                                    <span className="exp-type-label">{type}</span>
                                    <Plus size={14} className="exp-type-icon" />
                                </button>
                            ))}
                            <button className="exp-type-btn" onClick={handleCustomNew} style={{ borderStyle: 'dashed', borderColor: '#94a3b8', padding: isMobile ? '16px' : '12px 16px' }}>
                                <span className="exp-type-label">Other / Custom</span>
                                <Plus size={14} className="exp-type-icon" />
                            </button>
                        </div>
                    </div>

                    <div className="form-footer" style={{
                        marginTop: 'auto',
                        paddingBottom: '20px',
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <button className="btn-cancel" onClick={() => setView('list')}>Skip for now</button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 2: JOB DETAILS FORM ---
    if (view === 'form') {
        return (
            <div className="animate-fade education-container">
                <button
                    className="back-link"
                    onClick={handleCancelEdit}
                    style={{ marginBottom: '20px' }}>
                    <ArrowLeft size={16} /> Cancel
                </button>
                <h1 className="form-title" style={{ fontSize: isMobile ? '24px' : '32px' }}>{currentExp.title ? "Edit Experience" : "Add Experience"}</h1>
                <p className="form-subtitle">Provide details about your role and responsibilities.</p>

                <div className="form-row" style={{ flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '12px' : '24px', marginBottom: isMobile ? '0' : '8px' }}>
                    <div className="form-col" style={{ display: 'flex' }}>
                        <ValidatedInput
                            label="Job Title"
                            required
                            value={currentExp.title}
                            onChange={e => {
                                handleLocalChange({ title: e.target.value });
                                handleExpIntelligence("title", e.target.value);
                                if (errors.title) setErrors(prev => ({ ...prev, title: null }));
                            }}
                            placeholder="e.g. Graphic Designer"
                            error={errors.title}
                            aiSuggestion={expSuggestions.title}
                            isLoading={isAiThinking.title}
                        />
                    </div>
                    <div className="form-col" style={{ display: 'flex' }}>
                        <ValidatedInput
                            label="Employer"
                            value={currentExp.company}
                            onChange={e => {
                                handleLocalChange({ company: e.target.value });
                                handleExpIntelligence("company", e.target.value);
                            }}
                            placeholder="e.g. Acme Corp"
                            aiSuggestion={expSuggestions.company}
                            isLoading={isAiThinking.company}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-col" style={{ display: 'flex', flexDirection: 'column' }}>
                        <ValidatedInput
                            label="Location"
                            value={currentExp.location}
                            onChange={e => {
                                handleLocalChange({ location: e.target.value });
                                handleExpIntelligence("location", e.target.value);
                            }}
                            placeholder="e.g. New York, NY"
                            aiSuggestion={expSuggestions.location}
                            isLoading={isAiThinking.location}
                        />
                        <div className="checkbox-wrapper" style={{ marginTop: '12px' }}>
                            <input
                                type="checkbox"
                                id="remoteWork"
                                checked={currentExp.isRemote}
                                onChange={(e) => {
                                    handleLocalChange({ isRemote: e.target.checked });
                                    if (e.target.checked) handleExpIntelligence("location", currentExp.location || "");
                                }}
                            />
                            <label htmlFor="remoteWork">Remote Position</label>
                            <CompatibilityWarning isSupported={isFieldSupported('experience.isRemote')} templateName={currentTemplateName} />
                        </div>
                    </div>
                    <div className="form-col" />
                </div>

                <div className="form-row" style={{ flexWrap: 'wrap' }}>
                    <div className="form-col">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label className="label">Start Date</label>
                            <CompatibilityWarning isSupported={isFieldSupported('experience.startYear')} templateName={currentTemplateName} />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div className="input-container" style={{ flex: 1 }}>
                                <select className="zety-select" value={currentExp.startMonth} onChange={e => handleLocalChange({ startMonth: e.target.value })}>
                                    <option value="">Month</option>
                                    {months.map(m => <option key={m}>{m}</option>)}
                                </select>
                                <div className="select-arrow-icon"><ChevronDown size={14} /></div>
                            </div>
                            <div className="input-container" style={{ flex: 1 }}>
                                <select className="zety-select" value={currentExp.startYear} onChange={e => handleLocalChange({ startYear: e.target.value })}>
                                    <option value="">Year</option>
                                    {years.map(y => <option key={y}>{y}</option>)}
                                </select>
                                <div className="select-arrow-icon"><ChevronDown size={14} /></div>
                            </div>
                        </div>
                    </div>
                    <div className="form-col">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label className="label">End Date</label>
                            <CompatibilityWarning isSupported={isFieldSupported('experience.endYear')} templateName={currentTemplateName} />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div className="input-container" style={{ flex: 1 }}>
                                <select className="zety-select" value={currentExp.endMonth} onChange={e => handleLocalChange({ endMonth: e.target.value })} disabled={currentExp.isCurrent} style={{ opacity: currentExp.isCurrent ? 0.5 : 1 }}>
                                    <option value="">Month</option>
                                    {months.map(m => <option key={m}>{m}</option>)}
                                </select>
                                <div className="select-arrow-icon"><ChevronDown size={14} /></div>
                            </div>
                            <div className="input-container" style={{ flex: 1 }}>
                                <select className="zety-select" value={currentExp.endYear} onChange={e => handleLocalChange({ endYear: e.target.value })} disabled={currentExp.isCurrent} style={{ opacity: currentExp.isCurrent ? 0.5 : 1 }}>
                                    <option value="">Year</option>
                                    {years.map(y => <option key={y}>{y}</option>)}
                                </select>
                                <div className="select-arrow-icon"><ChevronDown size={14} /></div>
                            </div>
                        </div>
                        <div className="checkbox-wrapper">
                            <input type="checkbox" id="currentWork" checked={currentExp.isCurrent} onChange={(e) => { const isChecked = e.target.checked; handleLocalChange({ isCurrent: isChecked, endMonth: isChecked ? "" : currentExp.endMonth, endYear: isChecked ? "" : currentExp.endYear }); }} />
                            <label htmlFor="currentWork">I currently work here</label>
                            <CompatibilityWarning isSupported={isFieldSupported('experience.isCurrent')} templateName={currentTemplateName} />
                        </div>
                    </div>
                    {errors.dates && (
                        <div style={{ width: '100%', marginTop: '8px' }}>
                            <p className="input-error-text" style={{ padding: '8px 12px', background: '#fef2f2', borderRadius: '4px', border: '1px solid #fecaca' }}>
                                {errors.dates}
                            </p>
                        </div>
                    )}
                </div>

                <div className="form-footer" style={{
                    marginTop: '40px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    width: '100%',
                    gap: '12px'
                }}>
                    <button
                        className="btn-next primary"
                        onClick={handleFormNext}
                        style={{ width: isMobile ? '100%' : 'auto', minWidth: '240px' }}
                    >
                        Next: Description
                    </button>
                </div>
            </div >
        );
    }

    // --- VIEW 3: AI STUDIO (DESCRIPTION) ---
    if (view === 'ai-editor') {
        return (
            <div className="animate-fade education-container">
                <div className="ai-header">
                    <button className="back-link" onClick={() => setView('form')} style={{ marginBottom: '10px' }}><ArrowLeft size={16} /> Back to details</button>
                    <h1 className="form-title">Role Description</h1>
                    <p className="form-subtitle">What did you achieve as {currentExp.title || "an employee"}?</p>
                </div>

                <div className="studio-tip" style={{ marginBottom: isMobile ? '20px' : '24px', padding: isMobile ? '16px' : '24px' }}>
                    <div className="studio-tip-icon">
                        <Lightbulb size={24} />
                    </div>
                    <div className="studio-tip-content">
                        <span className="studio-tip-title">Expert Tip</span>
                        <p className="studio-tip-text">Use action verbs (e.g., "Led", "Developed") and quantify achievements (e.g., "Increased sales by 20%") to make your experience stand out.</p>
                    </div>
                </div>

                <div className="studio-workstation" style={{
                    flexDirection: isMobile ? 'column' : 'row',
                    height: isMobile ? '750px' : '580px',
                    gap: 0
                }}>
                    {showLinkPopup && (
                        <div className="link-overlay">
                            <div className="link-popup">
                                <div className="link-popup-title"><LinkIcon size={20} color="var(--gap-primary)" /> Insert Link</div>
                                <div className="link-field-group">
                                    <label className="link-label">Text to display</label>
                                    <input className="link-input" placeholder="e.g. Project Demo" value={linkData.text} onChange={(e) => setLinkData({ ...linkData, text: e.target.value })} autoFocus />
                                </div>
                                <div className="link-field-group">
                                    <label className="link-label">URL</label>
                                    <input className="link-input" placeholder="https://..." value={linkData.url} onChange={(e) => setLinkData({ ...linkData, url: e.target.value })} />
                                </div>
                                <div className="link-actions">
                                    <button className="btn-cancel" style={{ padding: '8px 16px' }} onClick={() => setShowLinkPopup(false)}>Cancel</button>
                                    <button className="btn-next primary" style={{ padding: '8px 24px' }} onClick={insertLink}>Add Link</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STUDIO SIDEBAR */}
                    <div className="studio-ws-sidebar" style={{
                        width: isMobile ? '100%' : '340px',
                        borderRight: isMobile ? 'none' : '1px solid var(--gap-border)',
                        borderBottom: isMobile ? '1px solid var(--gap-border)' : 'none',
                        maxHeight: isMobile ? '400px' : 'none'
                    }}>
                        <div className="studio-ws-sidebar-header">
                            <div className="ai-search-box-studio">
                                <Search size={14} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search job titles..."
                                    className="search-input"
                                    value={aiSearchTerm}
                                    onChange={(e) => setAiSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchAiSuggestions(aiSearchTerm)}
                                />
                                <button className="search-arrow-btn" onClick={() => fetchAiSuggestions(aiSearchTerm)}>
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
                                    onClick={() => fetchAiSuggestions(aiSearchTerm, true)}
                                    title="Regenerate Suggestions"
                                    disabled={showLoadingPopup}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--gap-text-muted)', cursor: 'pointer', padding: '4px' }}
                                >
                                    <RefreshCw size={14} className={showLoadingPopup ? "spin" : ""} />
                                </button>
                            </div>

                            <div className="studio-suggestion-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {showLoadingPopup ? (
                                    <div style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        <Loader2 size={24} className="spin" color="#635bff" />
                                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>Generating ideas...</span>
                                    </div>
                                ) : aiSuggestions.length > 0 ? (
                                    aiSuggestions.map((text, idx) => {
                                        const isSelected = stripHtml(currentExp.description).includes(stripHtml(text));
                                        return (
                                            <button
                                                key={idx}
                                                className={`studio-example-pill ${isSelected ? 'added' : ''} animate-slide-in`}
                                                style={{ animationDelay: `${idx * 0.05}s` }}
                                                onClick={() => appendSuggestion(text)}
                                                disabled={isSelected}
                                            >
                                                <span className="studio-pill-icon">{isSelected ? <Check size={12} /> : <Plus size={12} />}</span>
                                                <span className="studio-pill-text">{text}</span>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                        No suggestions found. Try a different job title.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* STUDIO EDITOR */}
                    <div className="studio-ws-editor" style={{ height: isMobile ? '400px' : 'none', flex: 1 }}>
                        <div className="studio-ws-editor-header" style={{
                            display: 'flex',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? '12px' : '0',
                            padding: isMobile ? '16px' : '20px 24px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="studio-ws-editor-label">DESCRIPTION</span>
                                <CompatibilityWarning isSupported={isFieldSupported('experience.description')} templateName={currentTemplateName} />
                            </div>
                        </div>
                        <div className="studio-editor-canvas">
                            <EditorProvider>
                                <Editor
                                    value={currentExp.description || ''}
                                    onChange={(e) => handleLocalChange({ description: e.target.value })}
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
                                        <button className="rsw-btn studio-rsw-btn" onClick={() => setShowLinkPopup(true)} title="Insert Link">
                                            <LinkIcon size={14} />
                                        </button>
                                    </Toolbar>
                                </Editor>
                            </EditorProvider>
                        </div>
                    </div>
                </div>

                <div className="form-footer" style={{
                    marginTop: '30px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    width: '100%',
                    gap: '12px'
                }}>
                    <button
                        className="btn-next primary"
                        onClick={() => {
                            handleSaveExperience();
                        }}
                        style={{ width: isMobile ? '100%' : 'auto', minWidth: '240px' }}
                    >
                        Save & Continue
                    </button>
                </div>
            </div>
        );
    }

    // --- VIEW 4: SUMMARY LIST ---
    if (view === 'list') {
        return (
            <div className="animate-fade education-container">
                <button className="back-link" onClick={onBack} style={{ marginBottom: '20px' }}><ArrowLeft size={16} /> Go Back</button>

                <h1 className="form-title">Work Experience</h1>
                <p className="form-subtitle">Review your professional history. You can drag and drop to reorder.</p>

                <div className="summary-list">
                    {(!data.experience || data.experience.length === 0) ? (
                        <div className="empty-summary-state animate-fade">
                            <div className="empty-state-icon">
                                <Briefcase size={32} />
                            </div>
                            <div className="empty-state-content">
                                <h3 className="empty-state-title">No experience added</h3>
                                <p className="empty-state-text">Add your internships, jobs, or volunteer work.</p>
                            </div>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={(data.experience || []).map((_, i) => `exp-${i}`)}
                                strategy={verticalListSortingStrategy}
                            >
                                {(data.experience || []).map((exp, idx) => (
                                    <SortableExperienceItem
                                        key={`exp-${idx}`}
                                        id={`exp-${idx}`}
                                        exp={exp}
                                        idx={idx}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        formatDates={formatDates}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </div>

                <button className="btn-add-another dashed" onClick={handleAddNew}><Plus size={16} /> Add another position</button>

                <div className="form-footer" style={{
                    display: 'flex',
                    justifyContent: isMobile ? 'center' : 'flex-end',
                    width: '100%',
                    marginTop: '30px',
                    paddingTop: '32px',
                    borderTop: '1px solid var(--gap-border)'
                }}>
                    <button
                        className="btn-next primary"
                        onClick={isQuickEdit ? onReturnToDashboard : onNext}
                        style={{ width: isMobile ? '100%' : 'auto', minWidth: '240px' }}
                    >
                        {isQuickEdit ? 'Save & Return' : 'Continue to Skills'}
                    </button>
                </div>
            </div>
        );
    }

    return null;
}