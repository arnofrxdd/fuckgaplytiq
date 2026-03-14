import React, { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Plus, Info } from "lucide-react";
import "./form.css";
import CompatibilityWarning from "./CompatibilityWarning";

// Minimalist Studio Input Component
const StudioInput = ({ label, value, onChange, placeholder, type = "text", isSupported, templateName, icon, error }) => (
    <div className="zety-input-wrap">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label className="zety-label">{label}</label>
            <CompatibilityWarning isSupported={isSupported} templateName={templateName} />
        </div>
        <div className="input-container">
            <input
                className="zety-input-field" // Using base minimalist class
                style={error ? { borderColor: '#ef4444', background: '#fef2f2' } : {}}
                type={type}
                value={value || ""}
                onChange={onChange}
                placeholder={placeholder}
            />
            {icon && <div className="input-check-icon" style={{ right: '12px', top: '35%', pointerEvents: 'none' }}>{icon}</div>}
        </div>
        {error && <p className="input-error-text" style={{ marginTop: '6px', color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>{error}</p>}
    </div>
);

// Minimalist Studio Select Component
const StudioSelect = ({ label, value, onChange, options, isSupported, templateName, error }) => (
    <div className="zety-input-wrap">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label className="zety-label">{label}</label>
            <CompatibilityWarning isSupported={isSupported} templateName={templateName} />
        </div>
        <div className="input-container">
            <select
                className="zety-select"
                style={error ? { borderColor: '#ef4444', background: '#fef2f2' } : {}}
                value={value || ""}
                onChange={onChange}
            >
                <option value="">Select</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="select-arrow" style={{ right: '12px' }}>▼</div>
        </div>
        {error && <p className="input-error-text" style={{ marginTop: '6px', color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>{error}</p>}
    </div>
);

export default function PersonalDetails({ data, setData, onBack, onNext, isQuickEdit, onReturnToDashboard, isFieldSupported, currentTemplateName, isMobile }) {

    // Direct assignment from parent data
    const personal = data.personal || {};

    const [errors, setErrors] = useState({});

    // UI state for expanding optional fields
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        setExpanded(prev => ({
            ...prev,
            gender: prev.gender ?? !!data.personal?.gender,
            religion: prev.religion ?? !!data.personal?.religion,
            passport: prev.passport ?? !!data.personal?.passport,
            other: prev.other ?? !!data.personal?.otherPersonal
        }));
    }, [data.personal]);

    // Handle updates directly to the parent's source of truth
    const handleChange = (field, value) => {
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
        setData(prev => ({
            ...prev,
            personal: {
                ...prev.personal,
                [field]: value
            }
        }));
    };

    const toggleField = (field) => {
        setExpanded(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleNext = () => {
        setErrors({});
        let newErrors = {};

        // Validation logic - Make default fields optional, but require explicitly expanded fields

        if (expanded.gender && !personal.gender?.trim()) newErrors.gender = "Gender is required.";
        if (expanded.religion && !personal.religion?.trim()) newErrors.religion = "Religion is required.";
        if (expanded.passport && !personal.passport?.trim()) newErrors.passport = "Passport is required.";
        if (expanded.other && !personal.otherPersonal?.trim()) newErrors.otherPersonal = "This field is required.";

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

        if (isQuickEdit && onReturnToDashboard) {
            onReturnToDashboard();
        } else {
            onNext();
        }
    };

    return (
        <div className="animate-fade" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header Section */}
            <div className={`ai-header ${isMobile ? 'mobile-mode' : ''}`} style={{ marginBottom: isMobile ? '24px' : '40px', padding: isMobile ? '0 16px' : '0' }}>
                <button className="back-link" onClick={onBack} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 500 }}>
                    <ArrowLeft size={14} /> Back to Sections
                </button>
                <h1 className="form-title" style={{ fontSize: isMobile ? '24px' : '28px', marginBottom: '8px' }}>Personal Details</h1>
                <p className="form-subtitle" style={{ fontSize: isMobile ? '14px' : '15px', color: '#64748b', lineHeight: '1.5' }}>
                    This is an optional section, and an excellent opportunity to add relevant information.
                </p>
            </div>

            {/* Main Form Grid */}
            <div className="zety-form-grid" style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? '20px' : '24px',
                padding: isMobile ? '0 16px' : '0'
            }}>
                <StudioInput
                    label="Date of Birth"
                    value={personal.dob}
                    onChange={(e) => handleChange('dob', e.target.value)}
                    placeholder="DD/MM/YYYY"
                    isSupported={isFieldSupported('personal.dob')}
                    templateName={currentTemplateName}
                    error={errors.dob}
                />
                <StudioInput
                    label="Nationality"
                    value={personal.nationality}
                    onChange={(e) => handleChange('nationality', e.target.value)}
                    placeholder="e.g. Indian"
                    isSupported={isFieldSupported('personal.nationality')}
                    templateName={currentTemplateName}
                    error={errors.nationality}
                />
                {/* <StudioSelect
                    label="Marital Status"
                    value={personal.maritalStatus}
                    onChange={(e) => handleChange('maritalStatus', e.target.value)}
                    options={['Single', 'Married', 'Divorced', 'Widowed', 'Other']}
                    isSupported={isFieldSupported('personal.maritalStatus')}
                    templateName={currentTemplateName}
                    error={errors.maritalStatus}
                />
                <StudioInput
                    label="Visa Status"
                    value={personal.visaStatus}
                    onChange={(e) => handleChange('visaStatus', e.target.value)}
                    placeholder="e.g. Full working capabilities"
                    isSupported={isFieldSupported('personal.visaStatus')}
                    templateName={currentTemplateName}
                    error={errors.visaStatus}
                /> */}
            </div>

            {/* Additional Information Section */}
            <div style={{ marginTop: '40px', borderTop: '1px solid #f1f5f9', paddingTop: '32px', padding: isMobile ? '32px 16px' : '32px 0' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '20px' }}>
                    Additional Information
                </h3>

                {/* Chip Selection for Adding Fields */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? '8px' : '10px', marginBottom: '24px' }}>
                    {['gender', 'religion', 'passport', 'other'].map(field => {
                        if (expanded[field]) return null;
                        const labels = { gender: 'Gender', religion: 'Religion', passport: 'Passport', other: 'Other' };
                        return (
                            <button
                                key={field}
                                onClick={() => toggleField(field)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: isMobile ? '6px 12px' : '8px 16px', background: 'white', border: '1.5px solid #e2e8f0',
                                    borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#475569',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <Plus size={14} /> {labels[field]}
                            </button>
                        );
                    })}
                </div>

                {/* Expanded Fields Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    {expanded.gender && (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                                <StudioSelect
                                    label="Gender"
                                    value={personal.gender}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    options={['Male', 'Female', 'Non-binary', 'Prefer not to say']}
                                    isSupported={isFieldSupported('personal.gender')}
                                    templateName={currentTemplateName}
                                    error={errors.gender}
                                />
                            </div>
                            <button onClick={() => { toggleField('gender'); handleChange('gender', ''); setErrors(p => ({ ...p, gender: null })); }} style={{ marginBottom: errors.gender ? '45px' : '25px', padding: '8px', color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                    )}

                    {expanded.religion && (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                                <StudioInput label="Religion" value={personal.religion} onChange={(e) => handleChange('religion', e.target.value)} isSupported={isFieldSupported('personal.religion')} templateName={currentTemplateName} error={errors.religion} />
                            </div>
                            <button onClick={() => { toggleField('religion'); handleChange('religion', ''); setErrors(p => ({ ...p, religion: null })); }} style={{ marginBottom: errors.religion ? '45px' : '25px', padding: '8px', color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                    )}

                    {expanded.passport && (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                                <StudioInput label="Passport Number" value={personal.passport} onChange={(e) => handleChange('passport', e.target.value)} isSupported={isFieldSupported('personal.passport')} templateName={currentTemplateName} error={errors.passport} />
                            </div>
                            <button onClick={() => { toggleField('passport'); handleChange('passport', ''); setErrors(p => ({ ...p, passport: null })); }} style={{ marginBottom: errors.passport ? '45px' : '25px', padding: '8px', color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                    )}

                    {expanded.other && (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                                <StudioInput label="Other Information" value={personal.otherPersonal} onChange={(e) => handleChange('otherPersonal', e.target.value)} isSupported={isFieldSupported('personal.otherPersonal')} templateName={currentTemplateName} error={errors.otherPersonal} />
                            </div>
                            <button onClick={() => { toggleField('other'); handleChange('otherPersonal', ''); setErrors(p => ({ ...p, otherPersonal: null })); }} style={{ marginBottom: errors.otherPersonal ? '45px' : '25px', padding: '8px', color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="form-footer" style={{
                marginTop: '50px',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'flex-end',
                gap: '12px',
                padding: isMobile ? '16px' : '0'
            }}>
                {isQuickEdit && (
                    <button className="btn-next outlined" onClick={onReturnToDashboard} style={{ width: '100%' }}>Dashboard</button>
                )}
                <button className="btn-next primary" onClick={handleNext} style={{ width: isMobile ? '100%' : 'auto', minWidth: isMobile ? '0' : '200px' }}>
                    {isQuickEdit ? 'Save & Return' : 'Next Step'}
                </button>
            </div>
        </div>
    );
}