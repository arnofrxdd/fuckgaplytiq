import React, { useState, useEffect } from "react";
import { Check, Lightbulb, Trash2, Edit2, ChevronDown, ChevronUp, Link as LinkIcon, Plus, ArrowLeft, GraduationCap, Zap, Sparkles, Loader2, GripVertical, Calendar, School, BookOpen, GraduationCap as DegreeIcon, MapPin, Award, ArrowRight } from "lucide-react";
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
import { Editor, EditorProvider, Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnBulletList } from 'react-simple-wysiwyg';
import "./education-v2.css";
import CompatibilityWarning from "./CompatibilityWarning";
import { getAIHeaderAdvice, toTitleCase } from "./HeaderIntelligence";

// --- DATA LISTS ---
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const years = Array.from({ length: 60 }, (_, i) => new Date().getFullYear() + 10 - i);

const QUICK_HIGHLIGHTS = [
  { label: "Honors/Awards", text: "Graduated with Honors, Received Academic Excellence Award" },
  { label: "Relevant Coursework", text: "Relevant Coursework: [Course 1], [Course 2]" },
  { label: "GPA/CGPA", text: "GPA: 3.8/4.0 or equivalent" },
  { label: "Class Rank", text: "Ranked in top 5% of graduating class" },
  { label: "Major Project", text: "Capstone Project: [Project Name] - [Brief Description]" }
];

// --- INPUT COMPONENTS ---
const ValidatedInput = ({ label, value = "", onChange, placeholder = "", error, required, aiSuggestion, isLoading, isAiraUpdating, disabled, icon: Icon }) => {
  const strValue = value?.toString() || "";
  const aiStr = aiSuggestion?.toString() || "";
  const hasActiveAISuggestion = aiStr && strValue.toLowerCase() !== aiStr.toLowerCase();
  const showGhost = hasActiveAISuggestion && aiStr.toLowerCase().startsWith(strValue.toLowerCase());

  return (
    <div className="input-wrap group" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label className="form-label">{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
        {hasActiveAISuggestion && (
          <div className="flex items-center gap-1.5 animate-pulse bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-100 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-600 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
            <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest">AI SUGGESTED</span>
          </div>
        )}
      </div>
      <div className="zety-relative-container" style={{ position: 'relative' }}>
        {Icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--accent)] transition-colors z-20"><Icon size={16} /></div>}
        <input
          className={`input-v2 transition-all duration-300 relative z-10 ${error ? 'error' : ''} ${hasActiveAISuggestion ? 'ai-glow-border' : ''} ${isAiraUpdating ? 'aira-field-glow' : ''}`}
          value={strValue}
          onChange={onChange}
          placeholder={hasActiveAISuggestion ? "" : placeholder}
          style={{ 
            paddingLeft: Icon ? '44px' : '16px',
            background: 'transparent' 
          }}
          disabled={disabled}
        />

        {showGhost && (
          <div className="absolute left-[44px] top-1/2 -translate-y-1/2 pointer-events-none z-20 whitespace-pre overflow-hidden pr-20" style={{ fontSize: '14px', left: Icon ? '44px' : '16px', fontFamily: "'Instrument Sans', sans-serif" }}>
            <span className="opacity-0">{strValue}</span>
            <span className="text-[var(--accent)] opacity-40 font-medium">{aiStr.substring(strValue.length)}</span>
          </div>
        )}

        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-30">
          {hasActiveAISuggestion && (
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                onChange({ target: { value: aiStr } });
              }}
              className="bg-[var(--accent)] text-white p-1.5 rounded-lg shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer border-0 ring-4 ring-white flex items-center justify-center"
              title="Accept AI"
            >
              <Sparkles size={12} fill="currentColor" />
            </button>
          )}
          {strValue && !error && !hasActiveAISuggestion && <Check size={14} className="text-emerald-500" />}
        </div>
      </div>
      {error && <p className="text-rose-500 text-[11px] mt-1.5 font-medium">{error}</p>}
    </div>
  );
};

const SelectInput = ({ label, value, onChange, options, placeholder = "Select", disabled = false, icon: Icon }) => (
  <div className="input-wrap" style={{ opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
    {label && <label className="form-label">{label}</label>}
    <div className="input-container relative">
      {Icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10"><Icon size={16} /></div>}
      <select 
        className="input-v2 appearance-none" 
        value={value || ""} 
        onChange={onChange} 
        disabled={disabled}
        style={{ paddingLeft: Icon ? '44px' : '16px' }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"><ChevronDown size={14} /></div>
    </div>
  </div>
);

// --- COMPONENT HELPERS ---
const formatDates = (startMonth, startYear, endMonth, endYear, isCurrent = false) => {
  if (!startYear && !endYear && !isCurrent) return "";
  const start = startMonth && startYear ? `${startMonth} ${startYear}` : (startYear || "");
  const end = isCurrent ? "Present" : (endMonth && endYear ? `${endMonth} ${endYear}` : (endYear || ""));
  if (!isCurrent && endYear && parseInt(endYear) > new Date().getFullYear()) return `Expected ${end}`;
  if (start && end) return `${start} – ${end}`;
  return end || start;
};

const SortableEducationItem = ({ id, edu, idx, onEdit, onDelete }) => {
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
  };

  const dates = formatDates(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear, edu.isCurrent);

  return (
    <div ref={setNodeRef} style={style} className={`edu-card-v2 ${isDragging ? 'dragging' : ''}`}>
      <div {...attributes} {...listeners} className="edu-drag-handle-v2">
        <GripVertical size={18} />
      </div>
      <div className="edu-card-info-v2" onClick={() => onEdit(idx)}>
        <h4 className="edu-card-title-v2">
          {edu.degree || 'Degree'} {edu.field ? `in ${edu.field}` : ''}
        </h4>
        <div className="edu-card-meta-v2">
          <span>{edu.school || 'School Name'}</span>
          {edu.city && <span>• {edu.city}</span>}
          {dates && <span>• {dates}</span>}
        </div>
      </div>
      <div className="edu-card-actions-v2">
        <button className="edu-btn-icon-v2" onClick={() => onEdit(idx)} title="Edit"><Edit2 size={14} /></button>
        <button className="edu-btn-icon-v2 delete" onClick={() => onDelete(idx)} title="Delete"><Trash2 size={14} /></button>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function Education({ data, setData, templateId, onBack, onNext, onPreview, isQuickEdit, onReturnToDashboard, isFieldSupported, currentTemplateName, isMobile, airaThinking, updatedFields }) {
  const educationList = Array.isArray(data.education) ? data.education : [];
  
  const [view, setView] = useState(() => {
    if (educationList.length > 0) return 'list';
    return 'form';
  });
  const [editIndex, setEditIndex] = useState(educationList.length === 0 ? 0 : -1);
  const [isAddingNew, setIsAddingNew] = useState(educationList.length === 0);

  useEffect(() => {
    if (educationList.length === 0 && !isAddingNew) {
      handleAddNew();
    }
  }, [educationList]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = educationList.findIndex((_, i) => `edu-${i}` === active.id);
      const newIndex = educationList.findIndex((_, i) => `edu-${i}` === over.id);
      setData(prev => ({ ...prev, education: arrayMove(educationList, oldIndex, newIndex) }));
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setIsAddingNew(false);
    setView('form');
  };

  const handleAddNew = () => {
    const newEntry = { school: "", degree: "", field: "", grade: "", city: "", startMonth: "", startYear: "", endMonth: "", endYear: "", isCurrent: false, description: "" };
    setData(prev => ({ ...prev, education: [...educationList, newEntry] }));
    setEditIndex(educationList.length);
    setIsAddingNew(true);
    setView('form');
  };

  const handleDelete = (index) => {
    const newList = educationList.filter((_, i) => i !== index);
    setData(prev => ({ ...prev, education: newList }));
    if (newList.length === 0) {
      handleAddNew();
    } else {
        setView('list');
    }
  };

  const handleSave = () => setView('list');
  const handleCancelForm = () => {
    if (isAddingNew && educationList.length > 0) {
      const currentEntry = educationList[editIndex];
      const isEmpty = !currentEntry || (!currentEntry.school && !currentEntry.degree);
      if (isEmpty) {
          setData(prev => ({ ...prev, education: educationList.filter((_, i) => i !== editIndex) }));
      }
    }
    setView(educationList.length > 1 || (educationList.length === 1 && educationList[0]?.school) ? 'list' : 'form');
  };

  if (view === 'list') {
    return (
      <div className="education-container-v2 form-section-page active">
        <div className="section-head-v2" style={{ marginBottom: '40px' }}>
          <div className="fsp-title">Education Summary</div>
          <div className="fsp-sub">Highlight your academic journey and professional foundations.</div>
        </div>

        <div className="edu-summary-list-v2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={educationList.map((_, i) => `edu-${i}`)} strategy={verticalListSortingStrategy}>
              {educationList.map((edu, idx) => (
                <SortableEducationItem 
                  key={`edu-${idx}`} 
                  id={`edu-${idx}`} 
                  edu={edu} 
                  idx={idx} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <button className="edu-btn-add-v2 mt-4" onClick={handleAddNew}>
          <Plus size={16} /> Add Another Education
        </button>
      </div>
    );
  }

  return (
    <EducationForm
      index={editIndex}
      data={data}
      setData={setData}
      onSave={handleSave}
      onCancel={handleCancelForm}
      isQuickEdit={isQuickEdit}
      onReturnToDashboard={onReturnToDashboard}
      isFieldSupported={isFieldSupported}
      currentTemplateName={currentTemplateName}
      isMobile={isMobile}
      airaThinking={airaThinking}
      updatedFields={updatedFields}
      isAddingNew={isAddingNew}
      onDelete={handleDelete}
    />
  );
}

// --- FORM COMPONENT ---
function EducationForm({ index, data, setData, onSave, onCancel, isQuickEdit, onReturnToDashboard, isFieldSupported, currentTemplateName, isMobile, airaThinking, updatedFields, isAddingNew, onDelete }) {
  const [errors, setErrors] = useState({});
  const [eduSuggestions, setEduSuggestions] = useState({ school: null, city: null, degree: null, field: null });
  const [isAiThinking, setIsAiThinking] = useState({ school: false, city: false, degree: false, field: false });

  const form = data.education[index] || {};

  const syncToParent = (updatedForm) => {
    const updatedList = [...(data.education || [])];
    updatedList[index] = updatedForm;
    setData(prev => ({ ...prev, education: updatedList }));
  };

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value };
    syncToParent(updated);
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    if (['school', 'degree', 'field', 'city'].includes(field)) {
      handleEduIntelligence(field, value, updated);
    }
  };

  const handleEduIntelligence = async (field, value, currentForm) => {
    if (value.length >= 3) {
      setIsAiThinking(prev => ({ ...prev, [field]: true }));
      const aiRes = await getAIHeaderAdvice("education", value, {
        userCity: data.personal?.city,
        userProfession: data.personal?.profession,
        currentEntry: currentForm,
        typingField: field
      });
      setIsAiThinking(prev => ({ ...prev, [field]: false }));

      if (aiRes) {
        try {
          let cleanJson = aiRes;
          const match = aiRes.match(/\{[\s\S]*\}/);
          if (match) cleanJson = match[0];
          
          const parsed = JSON.parse(cleanJson);
          if (parsed) {
            setEduSuggestions(prev => ({
              ...prev,
              [field]: parsed[field] || null,
              ...(field === 'school' ? { city: parsed.city, degree: parsed.degree, field: parsed.field } : {})
            }));
          }
        } catch (e) { console.error("AI intelligence parse error", e); }
      }
    } else if (value.length === 0) {
      setEduSuggestions(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.school?.trim()) e.school = "School Name is required";
    if (!form.degree?.trim()) e.degree = "Degree is required";
    if (form.startYear && form.endYear && !form.isCurrent) {
      if (parseInt(form.startYear) > parseInt(form.endYear)) e.dates = "End date cannot be before start date";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveInternal = () => {
    if (validate()) onSave();
    else {
        // Scroll to error
        const firstError = document.querySelector('.error, .text-rose-500');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const appendDescription = (text) => {
    const current = form.description || "";
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    if (current.includes(cleanText)) return;
    const bullet = `<li>${text}</li>`;
    const updated = current.includes("<ul>") ? current.replace("</ul>", `${bullet}</ul>`) : `<ul>${bullet}</ul>`;
    handleChange("description", updated);
  };

  return (
    <div className="education-container-v2 form-section-page active">
      <div className="flex items-center justify-between mb-8">
        <button className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[var(--accent)] transition-colors" onClick={onCancel}>
          <ArrowLeft size={16} /> Back to summary
        </button>
        {!isAddingNew && (
            <button className="text-rose-500 hover:text-rose-600 transition-colors" onClick={() => onDelete(index)}>
                <Trash2 size={18} />
            </button>
        )}
      </div>
      
      <div className="section-head-v2" style={{ marginBottom: '40px' }}>
        <div className="fsp-title">{isAddingNew ? "Add Education" : "Edit Education"}</div>
        <div className="fsp-sub">Share your academic milestones to build a stronger profile.</div>
      </div>

      <div className="edu-form-v2">
        <div className="edu-form-grid-v2">
          <div className="edu-form-full-v2">
            <ValidatedInput 
              label="School / University" 
              value={form.school} 
              onChange={e => handleChange("school", e.target.value)}
              required error={errors.school} icon={School}
              aiSuggestion={eduSuggestions.school} isLoading={isAiThinking.school}
              isAiraUpdating={updatedFields?.has('school')}
            />
          </div>
          
          <ValidatedInput 
            label="Degree" 
            value={form.degree} 
            onChange={e => handleChange("degree", e.target.value)}
            placeholder="e.g. Bachelor of Science" required error={errors.degree} icon={DegreeIcon}
            aiSuggestion={eduSuggestions.degree} isLoading={isAiThinking.degree}
            isAiraUpdating={updatedFields?.has('degree')}
          />

          <ValidatedInput 
            label="Field of Study" 
            value={form.field} 
            onChange={e => handleChange("field", e.target.value)}
            placeholder="e.g. Computer Science" icon={BookOpen}
            aiSuggestion={eduSuggestions.field} isLoading={isAiThinking.field}
            isAiraUpdating={updatedFields?.has('field')}
          />

          <ValidatedInput 
            label="School Location" 
            value={form.city} 
            onChange={e => handleChange("city", e.target.value)}
            placeholder="e.g. New York, NY" icon={MapPin}
            aiSuggestion={eduSuggestions.city} isLoading={isAiThinking.city}
            isAiraUpdating={updatedFields?.has('city')}
          />

          <ValidatedInput 
            label="GPA / Grade (Optional)" 
            value={form.grade} 
            onChange={e => handleChange("grade", e.target.value)}
            placeholder="e.g. 3.8/4.0 or Merit" icon={Award}
          />
        </div>

        <div className="edu-form-grid-v2 mt-8">
          <div className="input-wrap">
            <label className="form-label">Start Date</label>
            <div className="edu-date-grid-v2">
              <SelectInput placeholder="Month" value={form.startMonth} options={months} onChange={e => handleChange("startMonth", e.target.value)} />
              <SelectInput placeholder="Year" value={form.startYear} options={years} onChange={e => handleChange("startYear", e.target.value)} />
            </div>
          </div>

          <div className="input-wrap">
            <label className="form-label">End Date</label>
            <div className="edu-date-grid-v2">
              <SelectInput placeholder="Month" value={form.endMonth} options={months} onChange={e => handleChange("endMonth", e.target.value)} disabled={form.isCurrent} />
              <SelectInput placeholder="Year" value={form.endYear} options={years} onChange={e => handleChange("endYear", e.target.value)} disabled={form.isCurrent} />
            </div>
            
            <div className={`edu-toggle-v2 ${form.isCurrent ? 'active' : ''}`} onClick={() => handleChange("isCurrent", !form.isCurrent)}>
              <div className="edu-toggle-box-v2">{form.isCurrent && <Check size={12} strokeWidth={4} />}</div>
              <span className="edu-toggle-text-v2 font-semibold">I am currently studying here</span>
            </div>
          </div>
        </div>

        {errors.dates && <p className="text-rose-500 text-xs font-semibold mt-2">{errors.dates}</p>}

        <div className="input-wrap mt-8">
          <label className="form-label">Coursework & Honors</label>
          <div className="edu-highlights-wrap-v2">
            {QUICK_HIGHLIGHTS.map(h => (
              <div key={h.label} className="edu-tag-v2" onClick={() => appendDescription(h.text)}>{h.label}</div>
            ))}
          </div>
          
          <div className="rounded-xl border border-slate-200 overflow-hidden mt-4 bg-white shadow-sm">
            <EditorProvider>
              <Editor 
                value={form.description || ""} 
                onChange={e => handleChange("description", e.target.value)}
                containerProps={{ style: { minHeight: '160px', padding: '12px' } }}
              >
                <Toolbar><BtnBold /><BtnItalic /><BtnUnderline /><BtnBulletList /></Toolbar>
              </Editor>
            </EditorProvider>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-12 pt-8 border-t border-slate-100">
          <button className="bottom-continue-btn flex-1 justify-center" onClick={handleSaveInternal}>
            Save Education Details
          </button>
        </div>
      </div>
    </div>
  );
}