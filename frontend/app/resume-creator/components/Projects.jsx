import React, { useState } from "react";
import { ArrowLeft, Check, Search, Plus, Loader2, Edit2, Trash2, Lightbulb, PenLine, ChevronDown, GripVertical } from "lucide-react";
import { fetchAuthenticatedAI } from "../utils/aiApi";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Editor, EditorProvider, Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnBulletList } from 'react-simple-wysiwyg';
import "./form.css";
import CompatibilityWarning from "./CompatibilityWarning";

// Reusable Minimalist Input Component
const StudioInput = ({ label, value, onChange, placeholder, type = "text", isSupported, templateName, isRequired = false, style = {}, error }) => (
    <div className="zety-input-wrap" style={style}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label className="zety-label">
                {label} {isRequired && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
            </label>
            <CompatibilityWarning isSupported={isSupported} templateName={templateName} />
        </div>
        <div className="input-container">
            <input
                className="zety-input-field"
                style={error ? { borderColor: '#ef4444', background: '#fef2f2' } : {}}
                type={type}
                value={value || ""}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
        {error && <p className="input-error-text" style={{ marginTop: '6px', color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>{error}</p>}
    </div>
);

const StudioSelect = ({ label, value, onChange, options, isSupported, templateName, disabled, error }) => (
    <div className="zety-input-wrap">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label className="zety-label">{label}</label>
            <CompatibilityWarning isSupported={isSupported} templateName={templateName} />
        </div>
        <div className="input-container">
            <select className="zety-select" style={error ? { borderColor: '#ef4444', background: '#fef2f2' } : {}} value={value || ""} onChange={onChange} disabled={disabled}>
                <option value="">Select</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="select-arrow" style={{ right: '12px' }}>▼</div>
        </div>
        {error && <p className="input-error-text" style={{ marginTop: '6px', color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>{error}</p>}
    </div>
);

const SortableProjectItem = ({ id, proj, idx, onEdit, onDelete, isMobile }) => {
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

    return (
        <div ref={setNodeRef} style={style} className={`summary-card ${isDragging ? 'dragging' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, overflow: 'hidden' }}>
                <div {...attributes} {...listeners} className="drag-handle" style={{ cursor: 'grab', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                    <GripVertical size={20} />
                </div>
                <div className="summary-number-col">
                    <div className="summary-number">{idx + 1}</div>
                </div>
                <div style={{ overflow: 'hidden' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{proj.title}</h4>
                    {proj.technologies && proj.technologies.length > 0 && (
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                        </p>
                    )}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => onEdit(idx)} style={{ padding: '8px', color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}><Edit2 size={18} /></button>
                <button onClick={() => onDelete(idx)} style={{ padding: '8px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
            </div>
        </div>
    );
};

export default function Projects({ data, setData, templateId, onBack, onNext, onPreview, isQuickEdit, onReturnToDashboard, isFieldSupported, currentTemplateName, isMobile }) {

    // 1. Direct Read
    const projects = Array.isArray(data.projects) ? data.projects : [];

    // Safely Initialize View based on initial data (no useEffect needed)
    const [view, setView] = useState(projects.length > 0 ? 'list' : 'form');

    // Form UI State
    const [editIndex, setEditIndex] = useState(-1);
    const [errors, setErrors] = useState({});
    const [currentProject, setCurrentProject] = useState({
        title: "",
        link: "",
        startYear: "",
        endYear: "",
        isCurrent: false,
        technologies: [],
        description: ""
    });

    // Store tech input as a string for easy editing
    const [techInput, setTechInput] = useState("");
    const [aiSearchTerm, setAiSearchTerm] = useState("");
    const [aiSuggestions, setAiSuggestions] = useState([
        "Developed a full-stack e-commerce platform using React and Node.js.",
        "Implemented a real-time chat application with Socket.io.",
        "Created a portfolio website showcasing various UI/UX projects.",
        "Built a RESTful API using Express and integrated with MongoDB.",
        "Automated deployment processes using Docker and Jenkins."
    ]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

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
            const oldIndex = projects.findIndex((_, i) => `proj-${i}` === active.id);
            const newIndex = projects.findIndex((_, i) => `proj-${i}` === over.id);

            const newList = arrayMove(projects, oldIndex, newIndex);
            setData(prev => ({ ...prev, projects: newList }));
        }
    };

    // --- HANDLERS ---

    const handleAddNew = () => {
        setEditIndex(-1);
        setErrors({});
        setCurrentProject({ title: "", link: "", startYear: "", endYear: "", isCurrent: false, technologies: [], description: "" });
        setTechInput("");
        setView('form');
    };

    const handleEdit = (index) => {
        setEditIndex(index);
        setErrors({});
        const item = projects[index];
        setCurrentProject({
            ...item,
            description: item.description || "",
            technologies: item.technologies || []
        });
        setTechInput(Array.isArray(item.technologies) ? item.technologies.join(", ") : (item.technologies || ""));
        setView('form');
    };

    // 2. Direct Updates via setData
    const handleDelete = (index) => {
        const newList = projects.filter((_, i) => i !== index);
        setData(prev => ({
            ...prev,
            projects: newList
        }));

        if (newList.length === 0) {
            setView('form');
        }
    };

    const handleSave = () => {
        let newErrors = {};

        if (!currentProject.title?.trim()) {
            newErrors.title = "Project Title is required.";
        }

        if (currentProject.startYear && currentProject.endYear && !currentProject.isCurrent) {
            if (parseInt(currentProject.endYear) < parseInt(currentProject.startYear)) {
                newErrors.endYear = "End year cannot be before start year.";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            if (isMobile) {
                setTimeout(() => {
                    const firstError = document.querySelector('.input-error-text, .error');
                    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
            return;
        }

        // Process technologies from input string
        let processedTechs = [];
        if (techInput.trim()) {
            processedTechs = techInput.split(',').map(t => t.trim()).filter(t => t);
        }

        const projectToSave = {
            ...currentProject,
            technologies: processedTechs,
            startYear: currentProject.startYear ? String(currentProject.startYear) : '',
            endYear: currentProject.endYear ? String(currentProject.endYear) : ''
        };
        let newList = [...projects];

        if (editIndex >= 0) {
            newList[editIndex] = projectToSave;
        } else {
            newList.push(projectToSave);
        }

        setData(prev => ({
            ...prev,
            projects: newList
        }));

        setView('list');
    };

    const fetchAiSuggestions = async (term) => {
        if (!term) return;
        setIsLoadingSuggestions(true);
        try {
            const res = await fetchAuthenticatedAI('/resumy/api/ai/generate', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'project_bullet_points',
                    input: { title: term }
                })
            });
            if (res.ok) {
                const result = await res.json();
                if (result.choices && result.choices.length > 0) {
                    setAiSuggestions(result.choices);
                }
            }
        } catch (err) {
            console.error("Error fetching project suggestions:", err);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const appendSuggestion = (text) => {
        const currentDesc = currentProject.description || "";
        const bullet = `<li>${text}</li>`;
        const newDesc = currentDesc.includes('<ul>')
            ? currentDesc.replace('</ul>', `${bullet}</ul>`)
            : `<ul>${bullet}</ul>`;
        setCurrentProject({ ...currentProject, description: newDesc });
    };

    const stripHtml = (html) => {
        if (typeof window === 'undefined') return html;
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    const handleLocalChange = (updates) => {
        setCurrentProject(prev => ({ ...prev, ...updates }));
    };

    // --- VIEW: FORM ---
    if (view === 'form') {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        return (
            <div className="animate-fade education-container" style={{ maxWidth: isMobile ? '100%' : '900px', margin: '0 auto' }}>
                {/* Header */}
                <div className={`ai-header ${isMobile ? 'mobile-mode' : ''}`} style={{ marginBottom: isMobile ? '24px' : '40px', padding: isMobile ? '0 16px' : '0' }}>
                    <button className="back-link" onClick={() => projects.length > 0 ? setView('list') : onBack()} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ArrowLeft size={14} /> {projects.length > 0 ? 'Back to Projects' : 'Back to Sections'}
                    </button>
                    <h1 className="form-title" style={{ fontSize: isMobile ? '24px' : '28px', marginBottom: '8px' }}>Project Details</h1>
                    <p className="form-subtitle" style={{ fontSize: isMobile ? '14px' : '15px' }}>Highlight relevant projects to showcase your practical skills.</p>
                </div>

                <div style={{ padding: isMobile ? '0 16px' : '0' }}>
                    {/* Basic Info */}
                    <div className="zety-form-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '24px', marginBottom: '24px' }}>
                        <StudioInput
                            label="Project Title"
                            isRequired={true}
                            value={currentProject.title}
                            onChange={e => {
                                handleLocalChange({ title: e.target.value });
                                if (errors.title) setErrors(p => ({ ...p, title: null }));
                            }}
                            placeholder="e.g. E-commerce Website"
                            isSupported={isFieldSupported('projects.title')}
                            templateName={currentTemplateName}
                            error={errors.title}
                        />
                        <StudioInput
                            label="Project Link"
                            value={currentProject.link}
                            onChange={e => handleLocalChange({ link: e.target.value })}
                            placeholder="e.g. github.com/username/project"
                            isSupported={isFieldSupported('projects.link')}
                            templateName={currentTemplateName}
                        />
                        <div style={{ gridColumn: '1 / -1' }}>
                            <StudioInput
                                label="Technologies Used"
                                value={techInput}
                                onChange={e => setTechInput(e.target.value)}
                                placeholder="e.g. React, Node.js, MongoDB"
                                isSupported={isFieldSupported('projects.technologies')}
                                templateName={currentTemplateName}
                            />
                        </div>
                    </div>

                    {/* Date Row */}
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '16px' : '24px', marginBottom: '32px' }}>
                        <div style={{ flex: 1 }}>
                            <StudioSelect
                                label="Start Year"
                                value={currentProject.startYear || ""}
                                onChange={e => handleLocalChange({ startYear: e.target.value })}
                                options={Array.from({ length: 30 }, (_, i) => 2025 - i)}
                                isSupported={isFieldSupported('projects.startYear')}
                                templateName={currentTemplateName}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <StudioSelect
                                label="End Year"
                                value={currentProject.endYear || ""}
                                onChange={e => {
                                    handleLocalChange({ endYear: e.target.value });
                                    if (errors.endYear) setErrors(p => ({ ...p, endYear: null }));
                                }}
                                options={Array.from({ length: 30 }, (_, i) => 2025 - i)}
                                disabled={currentProject.isCurrent}
                                isSupported={isFieldSupported('projects.endYear')}
                                templateName={currentTemplateName}
                                error={errors.endYear}
                            />
                            <div style={{ marginTop: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={currentProject.isCurrent || false}
                                        onChange={e => handleLocalChange({ isCurrent: e.target.checked, endYear: e.target.checked ? "" : currentProject.endYear })}
                                        style={{ accentColor: '#635bff' }}
                                    />
                                    Currently working on this
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STUDIO WORKSTATION */}
                <div className={`studio-workstation ${isMobile ? 'mobile-mode' : ''}`} style={{ height: isMobile ? '750px' : '580px', marginBottom: '32px', gap: 0, overflowY: 'hidden' }}>
                    <div className="studio-ws-sidebar" style={{
                        width: isMobile ? '100%' : '320px',
                        maxHeight: isMobile ? '300px' : 'none',
                        borderRight: isMobile ? 'none' : '1px solid #f1f5f9',
                        borderBottom: isMobile ? '1px solid #f1f5f9' : 'none'
                    }}>
                        <div className="studio-ws-sidebar-header">
                            <div className="ai-search-box-studio">
                                <Search size={14} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search project types..."
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
                            <div style={{ padding: '0 0 16px 4px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                AI Project Suggestions
                            </div>
                            <div className="studio-suggestion-list">
                                {isLoadingSuggestions ? (
                                    <div style={{ padding: '20px', textAlign: 'center' }}><Loader2 size={20} className="spin" color="#635bff" /></div>
                                ) : (
                                    aiSuggestions.map((text, idx) => {
                                        const isSelected = stripHtml(currentProject.description).includes(stripHtml(text));
                                        return (
                                            <button key={idx} className={`studio-example-pill ${isSelected ? 'added' : ''}`} onClick={() => appendSuggestion(text)} disabled={isSelected}>
                                                <span className="studio-pill-icon">{isSelected ? <Check size={12} /> : <Plus size={12} />}</span>
                                                <span className="studio-pill-text">{text}</span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="studio-ws-editor" style={{ height: isMobile ? '400px' : 'none', flex: 1 }}>
                        <div className="studio-ws-editor-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="studio-ws-editor-label">PROJECT DESCRIPTION</span>
                                <CompatibilityWarning isSupported={isFieldSupported('projects.description')} templateName={currentTemplateName} />
                            </div>
                        </div>
                        <div className="studio-editor-canvas" style={{ flex: 1, overflow: 'hidden' }}>
                            <EditorProvider>
                                <Editor
                                    value={currentProject.description || ''}
                                    onChange={(e) => handleLocalChange({ description: e.target.value })}
                                    containerProps={{ style: { height: '100%', border: 'none', outline: 'none', overflowY: 'auto' } }}
                                >
                                    <Toolbar><BtnBold /><BtnItalic /><BtnUnderline /><BtnBulletList /></Toolbar>
                                </Editor>
                            </EditorProvider>
                        </div>
                    </div>
                </div>

                <div className="form-footer" style={{
                    marginTop: '20px',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'flex-end',
                    width: '100%',
                    gap: '12px',
                    padding: isMobile ? '0 16px 40px' : '0'
                }}>
                    <button className="btn-cancel" onClick={() => projects.length > 0 ? setView('list') : onBack()} style={{ width: isMobile ? '100%' : 'auto' }}>Cancel</button>
                    <button className="btn-next primary" onClick={handleSave} style={{ width: isMobile ? '100%' : 'auto', minWidth: isMobile ? '0' : '200px' }}>
                        {editIndex >= 0 ? 'Save Project' : 'Add Project'}
                    </button>
                </div>
            </div>
        );
    }

    // --- VIEW: LIST ---
    if (view === 'list') {
        return (
            <div className="animate-fade education-container" style={{ maxWidth: isMobile ? '100%' : '800px', margin: '0 auto' }}>
                <div style={{ padding: isMobile ? '0 16px' : '0' }}>
                    <button className="back-link" onClick={onBack} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ArrowLeft size={14} /> Back to Sections
                    </button>

                    <div className="ai-header" style={{ marginBottom: '32px' }}>
                        <h1 className="form-title" style={{ fontSize: isMobile ? '24px' : '28px', marginBottom: '8px' }}>Projects Highlights</h1>
                        <p className="form-subtitle" style={{ fontSize: isMobile ? '14px' : '15px' }}>Review and manage the projects you've showcased.</p>
                    </div>

                    <div className="summary-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={projects.map((_, i) => `proj-${i}`)}
                                strategy={verticalListSortingStrategy}
                            >
                                {projects.map((proj, idx) => (
                                    <SortableProjectItem
                                        key={`proj-${idx}`}
                                        id={`proj-${idx}`}
                                        proj={proj}
                                        idx={idx}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        isMobile={isMobile}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>

                    <button
                        onClick={handleAddNew}
                        style={{
                            marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px',
                            color: '#635bff', fontWeight: 700, fontSize: '14px',
                            background: '#f8faff', border: '1.5px dashed #635bff', borderRadius: '12px',
                            cursor: 'pointer', padding: '14px', width: '100%', justifyContent: 'center'
                        }}
                    >
                        <Plus size={18} /> Add another project
                    </button>

                    <div className="form-footer" style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'stretch' : 'flex-end',
                        width: '100%',
                        marginTop: '40px',
                        gap: '12px',
                        paddingBottom: '40px'
                    }}>
                        {projects.length === 0 && (
                            <p style={{ color: '#ef4444', fontSize: '13px', fontWeight: 500, marginBottom: isMobile ? '0' : '-5px', textAlign: 'center' }}>Please add at least one project to continue.</p>
                        )}
                        <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row', width: '100%', justifyContent: 'flex-end' }}>
                            {isQuickEdit && (
                                <button className="btn-next outlined" onClick={onReturnToDashboard} style={{ width: isMobile ? '100%' : 'auto' }}>Dashboard</button>
                            )}
                            <button
                                className="btn-next primary"
                                onClick={() => {
                                    if (projects.length === 0) {
                                        if (isMobile) {
                                            setTimeout(() => {
                                                const addBtn = document.querySelector('.add-one-more-btn');
                                                if (addBtn) addBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }, 100);
                                        }
                                        return;
                                    }
                                    isQuickEdit ? onReturnToDashboard() : onNext();
                                }}
                                style={{
                                    opacity: projects.length === 0 ? 0.6 : 1,
                                    cursor: projects.length === 0 ? 'not-allowed' : 'pointer',
                                    width: isMobile ? '100%' : 'auto',
                                    minWidth: isMobile ? '0' : '200px'
                                }}
                            >
                                {isQuickEdit ? 'Save & Return' : 'Next Step'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}