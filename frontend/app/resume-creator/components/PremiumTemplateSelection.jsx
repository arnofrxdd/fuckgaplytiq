"use client";
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
    Search, SlidersHorizontal, ArrowLeft, ArrowRight,
    Sparkles, Lock, CheckCircle2, LayoutGrid, LayoutTemplate,
    Star, Info, Briefcase, Filter, X, Zap, Target, Award, Rocket,
    Edit2
} from 'lucide-react';
import { templatesConfig } from '../templates/TemplateManager';
import TemplatePreview from './TemplatePreview';
import { useAnalytics } from '@/lib/analytics';
import { getMockDataForTemplate, MOCK_PROFILES } from './MockProfiles';
import { ScribbleDoodle, HighlightDoodle, BoxDoodle, BurstDoodle, StarDoodle, UnderlineDoodle, SparkleDoodle, SparkleDoodle as Sparkle } from "@/components/landing-redesign/DoodleAnimations";
import "./PremiumTemplateSelection.css";
import PremiumTemplateMobile from './PremiumTemplateMobile';

// --- SUB-COMPONENTS ---

const TemplateFader = ({ templates, data, showMockData }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % templates.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [templates.length]);

    const t = templates[index];

    return (
        <div className="relative w-full max-w-[260px] mx-auto group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                    className="flex flex-col items-center"
                >
                    {/* THE TEMPLATE - NO BOX, JUST THE PAPER */}
                    <div className="relative w-full aspect-[210/297] bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] rounded-none overflow-hidden border border-stone-100 transition-all duration-700 group-hover:shadow-[0_60px_120px_-30px_rgba(0,0,0,0.18)] group-hover:scale-[1.02]">
                        <div className="absolute inset-0 origin-top transform">
                            <TemplatePreview
                                templateId={t.id}
                                data={showMockData ? getMockDataForTemplate(t) : data}
                                isFormPanel={true}
                            />
                        </div>

                        {/* OVERLAY ON HOVER */}
                        <div className="absolute inset-0 bg-stone-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* TEXT DOWN THERE */}
                    <div className="mt-6 text-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            <h4 className="text-3xl font-black text-stone-900 tracking-tighter mb-3" style={{ fontFamily: 'Outfit' }}>
                                {t.name}
                            </h4>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-3 py-1 rounded-none uppercase tracking-widest border border-violet-100 italic">Featured Design</span>
                                <div className="w-1 h-1 bg-stone-300 rounded-full" />
                                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t.tags?.slice(0, 1)} Edition</span>
                            </div>
                        </motion.div>

                        {/* PROGRESS DOTS */}
                        <div className="mt-4 flex items-center justify-center gap-2">
                            {templates.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'bg-violet-600 w-8' : 'bg-stone-100 w-2'}`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const PromoBanner = () => (
    <div className="relative w-full overflow-hidden rounded bg-indigo-600 p-8 md:p-12 text-white mb-20 shadow-md">
        <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-widest">Premium Collection</div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
                Increase interview callbacks by <span className="text-indigo-100">300%</span> with professional themes.
            </h2>
            <p className="text-indigo-100 font-medium text-base mb-10 leading-relaxed">
                Our designs align with industry standards, built from successful professional applications.
            </p>
            <button className="bg-white text-indigo-600 px-8 py-3 rounded font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                Explore Pro Themes <ArrowRight size={16} />
            </button>
        </div>
    </div>
);

const StoryReel = ({ title, slogan, templates, onSelect, data, showMockData, icon: Icon, onViewAll }) => (
    <div className="mb-24 last:mb-0">
        <div className="flex items-end justify-between mb-10 px-2">
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-violet-100 rounded-none flex items-center justify-center text-violet-600">
                        <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-black text-violet-600 tracking-widest uppercase">Curated Story</span>
                </div>
                <h2 className="text-5xl font-black text-stone-900 tracking-tighter leading-none mb-4" style={{ fontFamily: 'Outfit' }}>{title}</h2>
                <p className="text-stone-400 font-bold text-lg max-w-lg leading-snug">{slogan}</p>
            </div>
            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-2 text-stone-300 font-bold text-sm">
                    Drag to explore
                </div>
                {onViewAll && (
                    <button
                        onClick={onViewAll}
                        className="px-6 py-3 bg-white border border-stone-200 text-stone-900 rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all shadow-sm flex items-center gap-2 group/btn active:scale-95"
                    >
                        Explore All <LayoutGrid size={14} className="text-violet-600 group-hover/btn:text-violet-400 transition-colors" />
                    </button>
                )}
            </div>
        </div>

        <div className="flex gap-8 overflow-x-auto pb-10 scrollbar-hide snap-x px-2 -mx-2">
            {templates.map((t, idx) => (
                <div key={t.id} className="min-w-[340px] snap-start">
                    <PremiumTemplateCard
                        t={t}
                        isSelected={false}
                        onSelect={onSelect}
                        data={data}
                        showMockData={showMockData}
                    />
                </div>
            ))}
        </div>
    </div>
);

// --- SKELETON COMPONENT ---
const TemplateSkeleton = () => (
    <div className="flex flex-col w-full h-full">
        <div className="relative w-full aspect-[210/297] bg-white rounded-none overflow-hidden border border-stone-100 shadow-[0_15px_35px_rgba(0,0,0,0.08)]">
            <div className="w-full h-full skeleton-shine opacity-40" />
            <div className="absolute inset-0 p-8 flex flex-col gap-6">
                <div className="w-2/3 h-8 bg-stone-100 rounded-md skeleton-shine" />
                <div className="w-full h-4 bg-stone-100 rounded-none skeleton-shine opacity-60" />
                <div className="w-full h-4 bg-stone-100 rounded-none skeleton-shine opacity-60" />
                <div className="w-4/5 h-4 bg-stone-100 rounded-none skeleton-shine opacity-60" />
                <div className="mt-auto w-1/2 h-10 bg-stone-100 rounded-md skeleton-shine" />
            </div>
        </div>
        <div className="mt-5 px-1 space-y-3">
            <div className="w-3/4 h-5 bg-stone-100 rounded-md skeleton-shine" />
            <div className="w-1/2 h-4 bg-stone-100 rounded-md skeleton-shine opacity-60" />
        </div>
    </div>
);

// --- TEMPLATE CARD COMPONENT ---
const PremiumTemplateCard = ({ t, i, isSelected, onSelect, data, showMockData }) => {
    const isPremium = t.tags?.includes("Premium");
    const cardRef = useRef(null);
    const isInView = useInView(cardRef, { once: true, margin: "200px" });
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (isInView) {
            // Small delay to ensure smooth transition
            const timer = setTimeout(() => setIsLoaded(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isInView]);

    return (
        <div
            ref={cardRef}
            className={`group relative flex flex-col transition-all duration-500 min-h-[400px]
                ${isSelected
                    ? 'ring-4 ring-violet-500/10'
                    : 'hover:translate-y-[-8px]'
                }
            `}
            onClick={() => onSelect(t)}
        >
            {!isLoaded ? (
                <TemplateSkeleton />
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* A4 WRAPPER */}
                    <div className={`relative w-full aspect-[210/297] bg-white overflow-hidden transition-all duration-500 rounded-none
                ${isSelected
                            ? 'shadow-[20px_40px_80px_rgba(124,58,237,0.15)] ring-2 ring-violet-500'
                            : 'shadow-[0_15px_35px_rgba(0,0,0,0.08)] group-hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)] border border-stone-100'
                        }
            `}>
                        {/* PREVIEW CONTAINER */}
                        <div className="absolute inset-0 z-0">
                            <div className="w-full h-full transform transition-transform duration-700 group-hover:scale-105">
                                <TemplatePreview
                                    templateId={t.id}
                                    data={showMockData ? getMockDataForTemplate(t) : data}
                                />
                            </div>
                        </div>

                        {/* OVERLAYS */}
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* STATUS BADGES */}
                        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                            {/* {isPremium && (
                                <div className="bg-violet-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl shadow-violet-500/20">
                                    <Sparkles size={10} fill="currentColor" /> Pro
                                </div>
                            )} */}
                        </div>

                        {/* HOVER ACTION */}
                        <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="bg-white text-stone-900 rounded-full px-6 py-3 font-bold text-xs flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-2xl" style={{ fontFamily: 'Outfit' }}>
                                {/* {isPremium ? <Lock size={14} className="text-violet-600" /> : <LayoutTemplate size={14} className="text-violet-600" />} */}
                                <LayoutTemplate size={14} className="text-violet-600" />
                                {isSelected ? "Selected" : "Preview Design"}
                            </div>
                        </div>

                        {isSelected && (
                            <div className="absolute top-4 left-4 z-40 bg-violet-600 text-white p-2 rounded-none shadow-2xl">
                                <CheckCircle2 size={18} strokeWidth={3} />
                            </div>
                        )}
                    </div>

                    {/* METADATA - DETACHED */}
                    <div className="mt-5 px-1">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-base font-bold text-stone-900 tracking-tight transition-colors group-hover:text-violet-600" style={{ fontFamily: 'Outfit' }}>
                                {t.name}
                            </h3>
                            <div className="flex gap-1.5">
                                {t.recommendedColors?.slice(0, 3).map((c, idx) => (
                                    <div key={idx} className="w-2.5 h-2.5 rounded-full border border-black/5 shadow-sm" style={{ background: c }} />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {t.tags?.slice(0, 2).map((tag, idx) => (
                                <span key={idx} className="text-[10px] font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};


// --- MAIN SELECTION COMPONENT ---
export default function PremiumTemplateSelection({
    userId,
    data,
    onUpdateData,
    onComplete,
    onBack,
    projectTitle,
    onUpdateTitle,
    backLabel = "Onboarding",
    inline = false
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [activeLayout, setActiveLayout] = useState("All");
    const [showProOnly, setShowProOnly] = useState(false);
    const [viewMode, setViewMode] = useState("discovery"); // discovery or grid
    const [showMockData, setShowMockData] = useState(true);
    const { trackEvent } = useAnalytics();

    // Track initial view
    useEffect(() => {
        trackEvent('resume_gallery_view', 'Opened template gallery', {
            feature_module: 'resume_creator',
            funnel_stage: 'aesthetic_selection'
        });
    }, []);

    // Determine if the user has substantial personal data
    const hasSubstantialData = useMemo(() => {
        return (data?.experience && data.experience.length > 0) ||
            (data?.summary && data.summary.length > 50) ||
            (data?.education && data.education.length > 0);
    }, [data?.experience?.length, data?.education?.length, data?.summary]);

    // Auto-switch to personal data if it exists (e.g. after AI Upgrade)
    useEffect(() => {
        if (hasSubstantialData) {
            setShowMockData(false);
        }
    }, [hasSubstantialData]);

    const [selectedTemplateObj, setSelectedTemplateObj] = useState(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewColor, setPreviewColor] = useState(null);

    // Filters setup
    const categories = ["All", "Modern", "Creative", "Executive", "Classic", "Minimalist"];
    const layouts = ["All", "1-Column", "2-Column"];

    // Filter Logic
    const visibleTemplates = useMemo(() => {
        return templatesConfig.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = activeCategory === "All" || t.tags?.includes(activeCategory);
            const matchesLayout = activeLayout === "All" || t.tags?.includes(activeLayout);
            const matchesPro = showProOnly ? t.tags?.includes("Premium") : true;

            return matchesSearch && matchesCategory && matchesLayout && matchesPro;
        });
    }, [searchTerm, activeCategory, activeLayout, showProOnly]);

    // Discovery Sections
    const executiveTemplates = useMemo(() => templatesConfig.filter(t => t.tags?.includes("Executive")).slice(0, 5), []);
    const creativeTemplates = useMemo(() => templatesConfig.filter(t => t.tags?.includes("Creative")).slice(0, 5), []);
    const modernTemplates = useMemo(() => templatesConfig.filter(t => t.tags?.includes("Modern")).slice(0, 5), []);

    const handleCardClick = (template) => {
        trackEvent('resume_template_preview_open', `Previewed ${template.name}`, {
            feature_module: 'resume_creator',
            metadata: {
                template_id: template.id,
                is_premium: template.tags?.includes('Premium')
            }
        });
        setSelectedTemplateObj(template);
        setPreviewColor(template.recommendedColors?.[0] || "#3b82f6");
        setIsPreviewModalOpen(true);
    };

    const handleConfirmTemplate = () => {
        trackEvent('resume_template_confirmed', `Selected ${selectedTemplateObj.name}`, {
            feature_module: 'resume_creator',
            funnel_stage: 'aesthetic_confirmed',
            metadata: {
                template_id: selectedTemplateObj.id,
                theme_color: previewColor
            }
        });
        setIsPreviewModalOpen(false);
        // Save color as PER-TEMPLATE only (into templateLayouts[id].themeColor).
        // Never write to data.themeColor globally — that would bleed to all templates.
        if (onUpdateData && selectedTemplateObj && previewColor) {
            const templateId = selectedTemplateObj.id;
            const defaultColor = selectedTemplateObj.defaultColor;
            // Only persist if user picked a non-default color
            if (previewColor !== defaultColor) {
                const existingLayouts = data?.templateLayouts || {};
                const existingForTemplate = existingLayouts[templateId] || {};
                onUpdateData({
                    templateLayouts: {
                        ...existingLayouts,
                        [templateId]: {
                            ...existingForTemplate,
                            themeColor: previewColor
                        }
                    }
                });
            }
        }
        setTimeout(() => {
            onComplete(selectedTemplateObj.id);
        }, 300);
    };

    const handleMobileComplete = (templateId, color) => {
        const template = templatesConfig.find(t => t.id === templateId);
        if (onUpdateData && template && color) {
            const defaultColor = template.defaultColor;
            if (color !== defaultColor) {
                const existingLayouts = data?.templateLayouts || {};
                const existingForTemplate = existingLayouts[templateId] || {};
                onUpdateData({
                    templateLayouts: {
                        ...existingLayouts,
                        [templateId]: {
                            ...existingForTemplate,
                            themeColor: color
                        }
                    }
                });
            }
        }
        onComplete(templateId);
    };

    return (
        <>
            {/* MOBILE ONLY VIEW */}
            <div className="fixed inset-0 z-[99999] bg-white md:hidden">
                <PremiumTemplateMobile
                    userId={userId}
                    data={data}
                    onUpdateData={onUpdateData}
                    onComplete={handleMobileComplete}
                    projectTitle={projectTitle}
                    onUpdateTitle={onUpdateTitle}
                    templates={templatesConfig}
                    showMockData={showMockData}
                    onBack={onBack}
                />
            </div>

            {/* DESKTOP ONLY VIEW */}
            <motion.div
                className={inline ? "relative bg-white w-full hidden md:block" : "fixed inset-0 bg-white z-[99999] hidden md:flex flex-col h-screen overflow-hidden"}
                initial={inline ? {} : { opacity: 0 }}
                animate={inline ? {} : { opacity: 1 }}
                exit={inline ? {} : { opacity: 0 }}
            >
                {/* AMBIENT BACKGROUND */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                </div>

                {/* TOP BAR */}
                {!inline && (
                    <header className="h-24 flex items-center justify-between px-10 shrink-0 z-50 border-b border-stone-100 bg-white/80 backdrop-blur-xl">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={onBack}
                                className="group flex items-center gap-3 text-stone-500 hover:text-stone-900 transition-colors"
                            >
                                <div className="w-10 h-10 bg-stone-50 flex items-center justify-center rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                                    <ArrowLeft size={18} />
                                </div>
                            </button>
                            <div className="h-10 w-[1px] bg-stone-200" />

                            <div className="flex flex-col min-w-0">
                                <h1 className="text-[10px] font-black text-violet-600 uppercase tracking-[0.2em] mb-0.5 whitespace-nowrap overflow-hidden">
                                    The Gallery &bull; Active Project
                                </h1>
                                <div className="flex items-center gap-3 group/title cursor-text">
                                    <input
                                        type="text"
                                        value={projectTitle}
                                        onChange={(e) => onUpdateTitle(e.target.value)}
                                        className="text-lg md:text-2xl font-black text-stone-900 bg-transparent border-none outline-none focus:ring-0 p-0 w-auto tracking-tighter"
                                        style={{ fontFamily: 'Outfit' }}
                                        placeholder="Untitled Resume"
                                    />
                                    <Edit2 size={14} className="text-stone-300 group-hover/title:text-violet-500 transition-colors hidden md:block" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            {/* TAB SWITCHER */}
                            <div className="flex bg-slate-100 p-1.5 rounded">
                                <button
                                    onClick={() => {
                                        setViewMode("discovery");
                                        trackEvent('resume_gallery_mode_switch', 'Switched to discovery', { feature_module: 'resume_creator' });
                                    }}
                                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === "discovery" ? 'bg-white text-stone-900 shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
                                >
                                    Deep Discovery
                                </button>
                                <button
                                    onClick={() => {
                                        setViewMode("grid");
                                        trackEvent('resume_gallery_mode_switch', 'Switched to grid', { feature_module: 'resume_creator' });
                                    }}
                                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === "grid" ? 'bg-white text-stone-900 shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
                                >
                                    Full Archives
                                </button>
                            </div>

                            <div className="flex bg-indigo-50/50 p-1 rounded border border-indigo-100">
                                <button
                                    onClick={() => setShowMockData(true)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${showMockData ? 'bg-white text-violet-600 shadow-sm' : 'text-stone-400 hover:text-stone-500'}`}
                                >
                                    Samples
                                </button>
                                <div className="relative group">
                                    <button
                                        onClick={() => {
                                            if (hasSubstantialData) setShowMockData(false);
                                        }}
                                        disabled={!hasSubstantialData}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all h-full ${!hasSubstantialData ? 'text-stone-300 opacity-50 cursor-not-allowed' : (!showMockData ? 'bg-white text-violet-600 shadow-sm' : 'text-stone-400 hover:text-stone-500')}`}
                                    >
                                        My Content
                                    </button>
                                    {!hasSubstantialData && (
                                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-stone-900 text-white text-[10px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl pointer-events-none">
                                            Add more info or use AI Upgrade
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="relative w-80 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 transition-colors group-focus-within:text-violet-600" />
                                <input
                                    type="text"
                                    placeholder="Find themes, roles..."
                                    value={searchTerm}
                                    onClick={() => setViewMode("grid")}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setViewMode("grid");
                                    }}
                                    className="w-full bg-slate-50 border border-transparent focus:border-indigo-100 focus:bg-white py-3 pl-12 pr-4 text-sm font-medium placeholder:text-slate-400 outline-none transition-all rounded"
                                />
                            </div>
                        </div>
                    </header>
                )}

                {/* MAIN CONTENT AREA */}
                <main className={inline ? "flex flex-col" : "flex flex-1 overflow-hidden"}>
                    {/* SIDEBAR FILTERS (Only in Grid Mode) */}
                    <AnimatePresence>
                        {viewMode === "grid" && (
                            <motion.aside
                                initial={{ x: -320, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -320, opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="w-80 border-r border-stone-100 flex flex-col p-10 overflow-y-auto shrink-0 z-40 bg-white"
                            >
                                <div className="space-y-12">
                                    {/* STYLE FILTER */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-6">
                                            <Filter size={16} className="text-violet-600" />
                                            <label className="text-sm font-black tracking-tight text-stone-900" style={{ fontFamily: 'Outfit' }}>Categories</label>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => {
                                                        setActiveCategory(cat);
                                                        trackEvent('resume_gallery_filter_category', `Category: ${cat}`, { feature_module: 'resume_creator' });
                                                    }}
                                                    className={`group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all
                                                    ${activeCategory === cat
                                                            ? 'bg-violet-600 text-white shadow-xl shadow-violet-600/20'
                                                            : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                                                        }`}
                                                >
                                                    <span>{cat}</span>
                                                    {activeCategory === cat && <ChevronRight size={16} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* PRO SWITCH COMMENTED OUT */}
                                    {/* <div
                                        className={`p-6 cursor-pointer transition-all border rounded relative overflow-hidden group
                                        ${showProOnly
                                                ? 'bg-indigo-50 border-indigo-200'
                                                : 'bg-white border-slate-100 hover:border-indigo-100'
                                            }`}
                                        onClick={() => {
                                            const newProOnly = !showProOnly;
                                            setShowProOnly(newProOnly);
                                            trackEvent('resume_gallery_pro_toggle', `Pro Toggle: ${newProOnly}`, {
                                                feature_module: 'resume_creator',
                                                is_premium_intent: newProOnly
                                            });
                                        }}
                                    >
                                        ...
                                    </div> */}

                                    {/* LAYOUT FILTER */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-6">
                                            <LayoutGrid size={16} className="text-violet-600" />
                                            <label className="text-sm font-black tracking-tight text-stone-900" style={{ fontFamily: 'Outfit' }}>Layout Type</label>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {layouts.map(layout => (
                                                <button
                                                    key={layout}
                                                    onClick={() => setActiveLayout(layout)}
                                                    className={`px-4 py-3 text-left text-sm font-bold border rounded-xl transition-all
                                                    ${activeLayout === layout
                                                            ? 'border-violet-600 bg-violet-50 text-violet-700'
                                                            : 'border-stone-100 text-stone-500 hover:border-stone-300 hover:text-stone-900'
                                                        }`}
                                                >
                                                    {layout}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    {/* CONTENT AREA */}
                    <div className="flex-1 overflow-y-auto bg-[#f6f6f7] p-6 md:p-10 relative scroll-smooth h-full">
                        <div className="max-w-[1440px] mx-auto">

                            {viewMode === "discovery" ? (
                                <div className="py-6">
                                    {/* STORY: CREATIVE */}
                                    <StoryReel
                                        title="Creative Vanguard"
                                        slogan="Break the mold. For designers, marketers, and visionaries who need their personality to breathe through the paper."
                                        icon={Rocket}
                                        templates={creativeTemplates}
                                        onSelect={handleCardClick}
                                        data={data}
                                        showMockData={showMockData}
                                        onViewAll={inline ? null : () => setViewMode("grid")}
                                    />

                                    {/* ADWARE BANNER */}
                                    {/* <PromoBanner /> */}

                                    {/* STORY: EXECUTIVE */}
                                    <StoryReel
                                        title="The Executive Suite"
                                        slogan="Built for commanders. High-density designs with a focus on metrics, impact, and boardroom-ready aesthetics."
                                        icon={Award}
                                        templates={executiveTemplates}
                                        onSelect={handleCardClick}
                                        data={data}
                                        showMockData={showMockData}
                                        onViewAll={inline ? null : () => setViewMode("grid")}
                                    />

                                    {/* STORY: MODERN */}
                                    <StoryReel
                                        title="Modern Standard"
                                        slogan="Sleek, responsive, and timeless. The professional's choice for a balanced, clear, and efficient narrative."
                                        icon={Target}
                                        templates={modernTemplates}
                                        onSelect={handleCardClick}
                                        data={data}
                                        showMockData={showMockData}
                                        onViewAll={inline ? null : () => setViewMode("grid")}
                                    />

                                    {!inline && (
                                        <div className="mt-40 text-center border-t border-stone-100 pt-32 pb-60">
                                            <h2 className="text-6xl font-black text-stone-900 tracking-tighter mb-8" style={{ fontFamily: 'Outfit' }}>Still haven't found <br />the one?</h2>
                                            <button
                                                onClick={() => setViewMode("grid")}
                                                className="px-12 py-6 bg-violet-600 text-white rounded-[32px] font-black text-xl hover:scale-105 transition-transform shadow-2xl"
                                            >
                                                Browse all 50+ Themes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-baseline gap-6 mb-16 border-b border-stone-100 pb-12 relative">
                                        <h2 className="text-6xl font-black text-stone-900 tracking-tighter relative z-10" style={{ fontFamily: 'Outfit' }}>
                                            {searchTerm || activeCategory !== "All" ? 'Selected' : 'Library'}
                                        </h2>
                                        <span className="text-stone-400 font-bold text-lg">
                                            &mdash; {visibleTemplates.length} Designs
                                        </span>
                                    </div>

                                    {visibleTemplates.length > 0 ? (
                                        <div
                                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-20 pb-40"
                                        >
                                            {visibleTemplates.map((t, i) => (
                                                <PremiumTemplateCard
                                                    key={t.id}
                                                    t={t}
                                                    i={i}
                                                    isSelected={selectedTemplateObj?.id === t.id}
                                                    onSelect={handleCardClick}
                                                    data={data}
                                                    showMockData={showMockData}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                                            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center text-stone-300 mb-8"><Search size={40} /></div>
                                            <h3 className="text-2xl font-black text-stone-900 tracking-tight mb-2" style={{ fontFamily: 'Outfit' }}>No designs found</h3>
                                            <p className="text-stone-500 font-medium max-w-sm mb-10">
                                                We couldn't find any templates matching your current criteria. Consider adjusting your filters.
                                            </p>
                                            <button
                                                onClick={() => { setSearchTerm(""); setActiveCategory("All"); setActiveLayout("All"); setShowProOnly(false); }}
                                                className="px-8 py-4 bg-indigo-600 text-white rounded font-bold text-sm hover:scale-105 transition-transform shadow-xl shadow-indigo-600/20"
                                            >
                                                Reset Discovery
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </main>

                {/* MODAL SYSTEM */}
                <AnimatePresence>
                    {isPreviewModalOpen && selectedTemplateObj && (
                        <motion.div
                            className="fixed inset-0 z-[100000] flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-white rounded-3xl w-full max-w-[1300px] h-full max-h-[92vh] flex flex-col overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.3)] relative border border-stone-100"
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 50, opacity: 0 }}
                                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            >
                                {/* CLOSE BUTTON */}
                                <button
                                    onClick={() => setIsPreviewModalOpen(false)}
                                    className="absolute top-8 right-8 z-[100001] w-12 h-12 bg-white rounded flex items-center justify-center text-slate-400 hover:text-slate-900 border border-slate-100 transition-all shadow-sm hover:scale-110 active:scale-95"
                                >
                                    <X size={24} />
                                </button>

                                <div className="flex flex-col md:flex-row h-full">
                                    {/* LEFT: THE PREVIEW */}
                                    <div className="w-full md:w-[65%] bg-stone-50 relative flex items-center justify-center p-16 overflow-y-auto">
                                        <div className="w-full max-w-[85%] aspect-[210/297] bg-white shadow-2xl relative">
                                            <TemplatePreview
                                                templateId={selectedTemplateObj.id}
                                                isFormPanel={true}
                                                data={{
                                                    ...(showMockData ? getMockDataForTemplate(selectedTemplateObj) : data),
                                                    themeColor: previewColor,
                                                    templateLayouts: {
                                                        ...((showMockData ? getMockDataForTemplate(selectedTemplateObj) : data)?.templateLayouts || {}),
                                                        [selectedTemplateObj.id]: {
                                                            ...((showMockData ? getMockDataForTemplate(selectedTemplateObj) : data)?.templateLayouts?.[selectedTemplateObj.id] || {}),
                                                            themeColor: previewColor
                                                        }
                                                    }
                                                }}
                                            />

                                            {/* PRO OVERLAY COMMENTED OUT */}
                                            {/* {selectedTemplateObj.tags?.includes("Premium") && (
                                                <div className="absolute inset-0 z-50 bg-stone-900/10 backdrop-blur-[4px] flex items-center justify-center p-12">
                                                    ...
                                                </div>
                                            )} */}
                                        </div>
                                    </div>

                                    {/* RIGHT: THE SPECS */}
                                    <div className="w-full md:w-[35%] bg-white p-12 flex flex-col h-full border-l border-stone-100">
                                        <div className="mb-12">
                                            <span className="text-xs font-bold text-violet-600 mb-4 block tracking-tight">
                                                Signature Collection &bull; {selectedTemplateObj.id}
                                            </span>
                                            <h2 className="text-5xl font-black text-stone-900 tracking-tighter leading-[0.95] mb-8" style={{ fontFamily: 'Outfit' }}>
                                                {selectedTemplateObj.name}
                                            </h2>
                                            <div className="flex flex-wrap gap-2 mb-10">
                                                {selectedTemplateObj.tags?.map((tag, idx) => (
                                                    <span key={idx} className="text-[10px] font-bold px-4 py-2 rounded-full border border-stone-100 text-stone-400">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-12 mb-auto">
                                            <div>
                                                <h4 className="text-sm font-black text-stone-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
                                                    <Info size={16} className="text-violet-600" /> Style Rationale
                                                </h4>
                                                <p className="text-stone-500 font-medium leading-relaxed">
                                                    {selectedTemplateObj.description}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-black text-stone-900 mb-6" style={{ fontFamily: 'Outfit' }}>Color Palettes</h4>
                                                <div className="flex gap-4">
                                                    {selectedTemplateObj.recommendedColors?.map((color, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() => setPreviewColor(color)}
                                                            className={`w-12 h-12 rounded border cursor-pointer hover:scale-110 transition-all shadow-sm relative group ${previewColor === color ? 'border-transparent' : 'border-black/5'}`}
                                                            style={{ backgroundColor: color }}
                                                        >
                                                            <div className={`absolute inset-0 rounded transition-all scale-110 ${previewColor === color ? 'ring-2 ring-indigo-500 opacity-100' : 'ring-2 ring-indigo-500 opacity-0 group-hover:opacity-50'}`} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-20">
                                            <button
                                                onClick={handleConfirmTemplate}
                                                className="w-full py-6 bg-indigo-600 text-white rounded font-bold text-lg tracking-tight hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-4 group active:scale-[0.98]"
                                                style={{ fontFamily: 'Outfit' }}
                                            >
                                                Select Design <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
};

const ChevronRight = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
);
