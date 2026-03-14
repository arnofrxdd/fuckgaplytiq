import React, { useState } from "react";
import { ArrowLeft, Plus, Search, Trash2, Calendar, FileText, Award, Loader2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Editor, EditorProvider, Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnBulletList } from 'react-simple-wysiwyg';
import "./form.css";

import CompatibilityWarning from "./CompatibilityWarning";
import { supabaseClient } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/authContext";

export default function Certifications({ data, setData, onBack, onNext, isQuickEdit, onReturnToDashboard, isFieldSupported, currentTemplateName, isMobile }) {
    // 1. Direct Read
    const certifications =
        Array.isArray(data.certifications) && data.certifications.length > 0
            ? data.certifications
            : [{ date: '', name: '', issuer: '', description: '' }];

    // Keep UI states
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([
        "PMP (Project Management Professional)",
        "Certified Scrum Master (CSM)",
        "AWS Certified Solutions Architect",
        "Google Data Analytics Certificate",
        "Certified Public Accountant (CPA)"
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [expandedDetails, setExpandedDetails] = useState({});

    const toggleDetails = (idx) => {
        setExpandedDetails(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const fetchAiCertifications = async () => {
        if (!searchTerm) return;
        setIsLoading(true);
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            const token = session?.access_token;

            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const API_URL = '/resumy';
            const res = await fetch(`${API_URL}/api/ai/generate`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    type: 'suggest_certifications',
                    input: { role: searchTerm }
                })
            });

            if (!res.ok) throw new Error('Failed to fetch suggestions');
            const dataResponse = await res.json();
            if (dataResponse.choices && Array.isArray(dataResponse.choices)) {
                setSuggestions(dataResponse.choices);
            }
        } catch (error) {
            console.error("Error fetching AI certifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Direct Update
    const updateCert = (index, field, value) => {
        if (errors[index]) setErrors(prev => ({ ...prev, [index]: null }));
        const updated = certifications.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );

        setData(prev => ({
            ...prev,
            certifications: updated
        }));
    };

    // 3. Add
    const addCert = () => {
        setData(prev => ({
            ...prev,
            certifications: [
                ...(prev.certifications || []),
                { date: '', name: '', issuer: '', description: '' }
            ]
        }));
    };

    // 4. Remove
    const removeCert = (index) => {
        const filtered = certifications.filter((_, i) => i !== index);

        setData(prev => ({
            ...prev,
            certifications:
                filtered.length > 0
                    ? filtered
                    : [{ date: '', name: '', issuer: '', description: '' }]
        }));
    };

    const handleNext = () => {
        let newErrors = {};

        certifications.forEach((cert, index) => {
            if (!cert.name?.trim()) {
                newErrors[index] = "Certification name is required.";
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (isQuickEdit && onReturnToDashboard) {
            onReturnToDashboard();
        } else {
            onNext();
        }
    };

    return (
        <div className="animate-fade" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div className={`ai-header ${isMobile ? 'mobile-mode' : ''}`} style={{ marginBottom: isMobile ? '24px' : '40px', padding: isMobile ? '0 16px' : '0' }}>
                <button className="back-link" onClick={onBack} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 500 }}>
                    <ArrowLeft size={14} /> Back to Sections
                </button>
                <h1 className="form-title" style={{ fontSize: isMobile ? '24px' : '28px', marginBottom: '8px' }}>Certifications</h1>
                <p className="form-subtitle" style={{ fontSize: isMobile ? '14px' : '15px' }}>Add relevant certifications to validate your expertise.</p>
            </div>

            {/* AI Workstation Layout */}
            <div className={`studio-workstation ${isMobile ? 'mobile-mode' : ''}`} style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '340px 1fr',
                gap: isMobile ? '24px' : '32px',
                alignItems: 'start',
                margin: isMobile ? '0 16px' : '0'
            }}>

                {/* Left: AI Suggestions Sidebar */}
                <div className="studio-ws-sidebar" style={{
                    maxHeight: isMobile ? '350px' : 'none',
                    height: isMobile ? 'auto' : '100%',
                    borderRight: isMobile ? 'none' : '1px solid #f1f5f9',
                    borderBottom: isMobile ? '1px solid #f1f5f9' : 'none'
                }}>
                    <div className="studio-ws-sidebar-header">
                        <div className="ai-search-box-studio">
                            <Search size={14} className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search roles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchAiCertifications()}
                            />
                            <button className="search-arrow-btn" onClick={fetchAiCertifications}>
                                <div className="arrow-right">→</div>
                            </button>
                        </div>
                    </div>

                    <div className="studio-ws-sidebar-scroll">
                        <div style={{ padding: '0 0 16px 4px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            AI Recommended Certifications
                        </div>
                        <div className="studio-suggestion-list">
                            {isLoading ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 size={24} className="spin" color="#635bff" /></div>
                            ) : (
                                suggestions.map((s, idx) => {
                                    const isAlreadyAdded = certifications.some(c => c.name?.toLowerCase().trim() === s.toLowerCase().trim());
                                    
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (isAlreadyAdded) {
                                                    const certIndex = certifications.findIndex(c => c.name?.toLowerCase().trim() === s.toLowerCase().trim());
                                                    if (certIndex !== -1) removeCert(certIndex);
                                                    return;
                                                }
                                                
                                                // If there's only one item and it's empty, use it
                                                if (certifications.length === 1 && !certifications[0].name && !certifications[0].issuer) {
                                                    updateCert(0, 'name', s);
                                                } else {
                                                    setData(prev => ({
                                                        ...prev,
                                                        certifications: [
                                                            ...(prev.certifications || []),
                                                            { date: '', name: s, issuer: '', description: '' }
                                                        ]
                                                    }));
                                                }
                                            }}
                                            className={`studio-example-pill ${isAlreadyAdded ? 'checked' : ''}`}
                                            style={{
                                                opacity: isAlreadyAdded ? 0.7 : 1,
                                                cursor: isAlreadyAdded ? 'default' : 'pointer',
                                                borderColor: isAlreadyAdded ? '#10b981' : '#e2e8f0',
                                                background: isAlreadyAdded ? '#f0fdf4' : 'white'
                                            }}
                                        >
                                            <div style={{
                                                width: '18px',
                                                height: '18px',
                                                borderRadius: '4px',
                                                border: `1.5px solid ${isAlreadyAdded ? '#10b981' : '#cbd5e1'}`,
                                                background: isAlreadyAdded ? '#10b981' : 'transparent',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: '10px'
                                            }}>
                                                {isAlreadyAdded ? <Check size={12} color="white" strokeWidth={3} /> : <Plus size={12} color="#635bff" />}
                                            </div>
                                            <span className="studio-pill-text" style={{ color: isAlreadyAdded ? '#065f46' : '#475569' }}>{s}</span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
                {/* Right: Certifications Form List */}
                <div>
                    {certifications.map((cert, idx) => (
                        <div key={idx} style={{
                            marginBottom: '32px',
                            background: '#fff',
                            padding: '24px',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', alignItems: isMobile ? 'stretch' : 'flex-start', marginBottom: '20px' }}>
                                <div className="zety-input-wrap" style={{ flex: isMobile ? '1' : '0 0 140px', marginBottom: 0 }}>
                                    <label className="zety-label" style={{ marginBottom: '8px', display: 'block' }}>Date</label>
                                    <div className="input-container">
                                        <input
                                            className="zety-input-field"
                                            placeholder="e.g. 2023"
                                            value={cert.date || ''}
                                            onChange={(e) => updateCert(idx, 'date', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="zety-input-wrap" style={{ flex: 1, marginBottom: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', minHeight: '24px' }}>
                                        <label className="zety-label" style={{ marginBottom: 0 }}>Certification Name <span style={{ color: '#ef4444' }}>*</span></label>
                                        <CompatibilityWarning isSupported={isFieldSupported('certifications.name')} templateName={currentTemplateName} />
                                    </div>
                                    <div className="input-container">
                                        <input
                                            className="zety-input-field"
                                            style={errors[idx] ? { borderColor: '#ef4444', background: '#fef2f2' } : {}}
                                            placeholder="AWS Solutions Architect"
                                            value={cert.name || ''}
                                            onChange={(e) => updateCert(idx, 'name', e.target.value)}
                                        />
                                    </div>
                                    {errors[idx] && <p className="input-error-text" style={{ marginTop: '6px', color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>{errors[idx]}</p>}
                                </div>

                                {certifications.length > 1 && (
                                    <button
                                        onClick={() => removeCert(idx)}
                                        style={{ marginTop: isMobile ? '0' : '28px', padding: '8px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', alignSelf: isMobile ? 'flex-end' : 'auto' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={() => toggleDetails(idx)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: '#635bff',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0',
                                    marginBottom: expandedDetails[idx] ? '20px' : '0'
                                }}
                            >
                                {expandedDetails[idx] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                {expandedDetails[idx] ? 'Hide details' : 'Add authority & description'}
                            </button>

                            {expandedDetails[idx] && (
                                <div className="animate-fade-down">
                                    <div className="zety-input-wrap" style={{ marginBottom: '20px' }}>
                                        <label className="zety-label" style={{ marginBottom: '8px', display: 'block' }}>Authority / Issuer</label>
                                        <div className="input-container">
                                            <input
                                                className="zety-input-field"
                                                placeholder="e.g. Amazon Web Services"
                                                value={cert.issuer || ''}
                                                onChange={(e) => updateCert(idx, 'issuer', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="zety-input-wrap">
                                        <label className="zety-label" style={{ marginBottom: '8px', display: 'block' }}>Description (Optional)</label>
                                        <div className="studio-ws-editor" style={{ height: '300px', display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                            <div className="studio-editor-canvas" style={{ flex: 1, overflow: 'hidden' }}>
                                                <EditorProvider>
                                                    <Editor
                                                        value={cert.description || ''}
                                                        onChange={(e) => updateCert(idx, 'description', e.target.value)}
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
                                </div>
                            )}
                        </div>
                    ))}

                    <button
                        className="add-one-more-btn"
                        onClick={addCert}
                        style={{
                            marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                            color: '#635bff', fontWeight: 700, fontSize: '13px',
                            background: '#f8faff', border: '1.5px dashed #635bff', borderRadius: '12px',
                            cursor: 'pointer', padding: '14px', width: '100%', justifyContent: 'center'
                        }}
                    >
                        <Plus size={16} /> Add another certification
                    </button>

                    <div className="form-footer" style={{
                        marginTop: '50px',
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        paddingBottom: '40px'
                    }}>
                        {isQuickEdit && (
                            <button className="btn-next outlined" onClick={onReturnToDashboard} style={{ width: '100%' }}>Dashboard</button>
                        )}
                        <button className="btn-next primary" onClick={handleNext} style={{ width: isMobile ? '100%' : 'auto', minWidth: isMobile ? '0' : '200px' }}>
                            {isQuickEdit ? 'Save & Return' : 'Next Step'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}