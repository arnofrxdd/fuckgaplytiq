"use client";
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Filter, CheckCircle2, LayoutTemplate, 
    ArrowLeft, LayoutGrid, ChevronRight, Zap, Sparkles
} from 'lucide-react';
import { templatesConfig } from '../../resume-creator/templates/TemplateManager';
import TemplatePreview from '../../resume-creator/components/TemplatePreview';
import "./DashboardTemplateSelection.css";

const AnyTemplatePreview = TemplatePreview;

const CATEGORIES = ["All", "Modern", "Professional", "Creative", "Minimalist"];

export default function DashboardTemplateSelection({
    onComplete,
    onBack,
    projectTitle,
    data = {}
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [selectedId, setSelectedId] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);

    const templates = useMemo(() => {
        return templatesConfig.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === "All" || (t.tags && t.tags.includes(activeCategory));
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, activeCategory]);

    const selectedTemplate = useMemo(() => {
        const t = templatesConfig.find(t => t.id === selectedId);
        if (t && !selectedColor) {
            setSelectedColor(t.recommendedColors?.[0] || t.defaultColor || "#000000");
        }
        return t;
    }, [selectedId, selectedColor]);

    const handleSelectTemplate = (id) => {
        setSelectedId(id);
        const t = templatesConfig.find(x => x.id === id);
        if (t) setSelectedColor(t.recommendedColors?.[0] || t.defaultColor || "#000000");
    };

    return (
        <div className="d-ts-container">
            {/* Header Area */}
            <div className="d-ts-header">
                <div className="d-ts-nav">
                    <button className="d-ts-back" onClick={onBack}>
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>
                    <div className="d-ts-title-group">
                        <h2 className="d-ts-main-title">Choose a design</h2>
                        <p className="d-ts-sub">{projectTitle}</p>
                    </div>
                </div>

                <div className="d-ts-controls">
                    <div className="d-ts-search">
                        <Search size={16} />
                        <input 
                            type="text" 
                            placeholder="Search templates..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="d-ts-cats">
                        {CATEGORIES.map(cat => (
                            <button 
                                key={cat}
                                className={`d-ts-cat ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid Area */}
            <div className="d-ts-grid-wrap">
                <div className="d-ts-grid">
                    {templates.map(t => (
                        <motion.div 
                            key={t.id}
                            className={`d-ts-card ${selectedId === t.id ? 'selected' : ''}`}
                            onClick={() => handleSelectTemplate(t.id)}
                            whileHover={{ y: -4 }}
                        >
                            <div className="d-ts-preview">
                                <div className="d-ts-preview-inner">
                                    <AnyTemplatePreview 
                                        templateId={t.id}
                                        data={{ ...data, themeColor: selectedId === t.id ? selectedColor : (t.recommendedColors?.[0] || t.defaultColor) }}
                                        isFormPanel={true}
                                    />
                                </div>
                                {selectedId === t.id && (
                                    <div className="d-ts-selected-overlay">
                                        <div className="d-ts-check">
                                            <CheckCircle2 size={24} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="d-ts-info">
                                <div className="d-ts-name">{t.name}</div>
                                <div className="d-ts-tags">
                                    {t.tags?.slice(0, 2).map(tag => (
                                        <span key={tag} className="d-ts-tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footer Action Area */}
            <AnimatePresence>
                {selectedId && (
                    <motion.div 
                        className="d-ts-footer"
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                    >
                        <div className="d-ts-footer-content">
                            <div className="d-ts-footer-info">
                                <div className="d-ts-chosen-meta">
                                    <span className="d-ts-chosen-label">Selected Design:</span>
                                    <span className="d-ts-chosen-name">{selectedTemplate?.name}</span>
                                </div>
                                <div className="d-ts-color-picker">
                                    <span className="d-ts-chosen-label">Color Accent:</span>
                                    <div className="d-ts-color-list">
                                        {selectedTemplate?.recommendedColors?.map(c => (
                                            <button 
                                                key={c}
                                                className={`d-ts-color-swatch ${selectedColor === c ? 'active' : ''}`}
                                                style={{ background: c }}
                                                onClick={() => setSelectedColor(c)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-primary" onClick={() => onComplete(selectedId, selectedColor)}>
                                Start Building <Zap size={16} style={{ marginLeft: 8 }} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
