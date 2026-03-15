import React, { useState, useEffect, useMemo, useRef } from 'react';
import ResumyLogo from './Logo';
import Link from 'next/link';
import Image from 'next/image';
import {
    Download, Printer, Mail, DownloadCloud,
    Layout, Palette, Plus, Search, X,
    Undo, Redo, ZoomIn, ZoomOut, Maximize2,
    ChevronDown, Edit3, CheckCircle, Sliders,
    User, Globe, Award, FileText, Cpu, Users, Heart, Briefcase, Info, Check, Filter, Target,
    Zap, Monitor, Eye, Copy, Move, Settings, Sparkles, ChevronRight, LogOut, Share2,
    Shield, AlertCircle, ArrowLeft, ArrowRight, Home, Loader2, SpellCheck2,
    PanelRightClose, PanelRightOpen, Cloud, CheckCircle2, RefreshCcw, ShieldCheck, Star
} from 'lucide-react';
import { useAnalytics } from '@/lib/analytics';
import { supabaseClient } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/authContext';
import { motion, AnimatePresence } from 'framer-motion';
import './FinalDashboard.css';
import ResumeRenderer from '../templates/ResumeRenderer';
import { templatesConfig } from '../templates/TemplateManager';
import DesignPanel from './DesignPanel';
import { spellChecker } from '../utils/SpellCheckManager';
import { calculateDeterministicScore } from '../utils/scoring';
import { useRouter } from 'next/navigation';
import PremiumTemplateSelection from './PremiumTemplateSelection';
import OnboardingGuide from './OnboardingGuide';
import { useResumeHistory } from '../hooks/useResumeHistory';
import { RESUME_FONTS } from '@/lib/fonts.config';

const VirtualTemplateCard = React.memo(({ t, data, isActive, isLoading, onClick }) => {
    const [isInView, setIsInView] = useState(false);
    const cardRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);
            },
            { rootMargin: '400px 0px', threshold: 0 }
        );

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={cardRef}
            className={`template-card ${isActive ? 'active' : ''} ${isLoading ? 'loading-state' : ''}`}
            onClick={() => !isLoading && onClick(t.id)}
            style={{ minHeight: '240px' }}
        >
            <div className="template-card-preview">
                <div className="mini-resume-scale">
                    {isInView ? (
                        <ResumeRenderer
                            data={{ ...data, themeColor: t.defaultColor || data.themeColor }}
                            templateId={t.id}
                            designSettings={data.templateLayouts?.[t.id]?.designSettings || t.defaults || {}}
                            scale={0.1865}
                        />
                    ) : (
                        <div className="template-card-placeholder-shimmer">
                            <div className="shimmer-pulse-content"></div>
                        </div>
                    )}
                </div>

                {isLoading && (
                    <div className="load-shine-badge"></div>
                )}

                {isActive && !isLoading && (
                    <div className="selected-badge">
                        <Check size={14} strokeWidth={3} />
                    </div>
                )}

                {!isLoading && (
                    <div className="template-hover-overlay">
                        <button className="select-template-btn">Use Template</button>
                    </div>
                )}
            </div>
            <div className="template-card-info">
                <div className="template-card-header">
                    <span className="template-name">{t.name}</span>
                    {t.tags.includes('Popular') && <span className="tag-popular">Popular</span>}
                </div>
                <div className="template-tags-row">
                    {t.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="template-mini-tag">{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default function Finalize({ data, setData, onChangeTemplate, onDownloadPDF, templateId, onBack, navigateToSection, jobId, builder_resume_id, DraftSwitcher, title, isSaving, isMobile, onOpenDraftExplorer = () => { }, isDraftExplorerOpen = false }) {
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const [activeTab, setActiveTab] = useState(isMobile ? null : 'templates'); // 'templates', 'design', 'add', 'spell'
    const [designPanelSubTab, setDesignPanelSubTab] = useState('main');

    useEffect(() => {
        if (isMobile) {
            setScale(0.45);
        } else {
            setScale(0.85);
        }
    }, [isMobile]);

    // Track initial load of Finalize step
    useEffect(() => {
        trackEvent('resume_finalize_view', 'Entered finalization dashboard', {
            feature_module: 'resume_creator',
            funnel_stage: 'finalization'
        });

        // Set placement finalize flag if in drive
        if (jobId) {
            document.documentElement.setAttribute('data-placement-finalize', 'true');
        }

        return () => {
            document.documentElement.removeAttribute('data-placement-finalize');
        };
    }, [jobId]);

    // FIX: iOS Keyboard Visual Bug (same as FormPanel)
    useEffect(() => {
        if (!isMobile) return;

        const handleFocusOut = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                setTimeout(() => {
                    const activeElement = document.activeElement;
                    const isStillEditing = activeElement && (
                        activeElement.tagName === 'INPUT' ||
                        activeElement.tagName === 'TEXTAREA' ||
                        activeElement.isContentEditable ||
                        activeElement.closest('.rsw-editor')
                    );

                    if (!isStillEditing) {
                        window.scrollTo(0, 0);
                        document.body.style.height = '100.1%';
                        setTimeout(() => { document.body.style.height = '100%'; }, 50);
                    }
                }, 100);
            }
        };

        window.addEventListener('focusout', handleFocusOut);
        return () => window.removeEventListener('focusout', handleFocusOut);
    }, [isMobile]);

    const handleTabChange = (tab) => {
        if (activeTab === tab) {
            // Mobile optimization: If already in a design sub-setting, 
            // clicking the icon again should go back to the main design menu rather than closing.
            if (isMobile && tab === 'design' && designPanelSubTab !== 'main') {
                setDesignPanelSubTab('main');
            } else {
                setActiveTab(null);
                setDesignPanelSubTab('main');
                if (isMobile) setIsActionsVisible(false); // Ensure export panel is also closed
            }
            return;
        }
        setActiveTab(tab);
        setDesignPanelSubTab('main');
        if (isMobile) setIsActionsVisible(false); // Close export if switching to a config tab on mobile
        trackEvent('resume_finalize_tab_switch', `Switched to ${tab} tab`, {
            feature_module: 'resume_creator',
            metadata: { active_tab: tab }
        });
    };

    const [isDownloading, setIsDownloading] = useState(false);
    const [isCopying, setIsCopying] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [showAha, setShowAha] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [scale, setScale] = useState(0.85);
    const [themeColor, setThemeColor] = useState(data.themeColor || '#3b82f6');
    const [designSettings, setDesignSettings] = useState(data.designSettings || {});
    const [spellCheckErrors, setSpellCheckErrors] = useState(0);
    const [isSpellScanning, setIsSpellScanning] = useState(false);
    const [isDictionaryLoaded, setIsDictionaryLoaded] = useState(false);
    const [spellCheckTick, setSpellCheckTick] = useState(0);
    const [spellCheckDraft, setSpellCheckDraft] = useState(null);
    const [canvasTheme, setCanvasTheme] = useState('classic'); // 'studio', 'pure', 'classic'
    const [user, setUser] = useState(null);
    const [sidebarPreviewData, setSidebarPreviewData] = useState(data);
    const [isExplorerLoading, setIsExplorerLoading] = useState(false);
    const [isActionsVisible, setIsActionsVisible] = useState(!isMobile);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileRef = useRef(null);
    const [studentName, setStudentName] = useState("");

    // Fetch student name if in placement drive
    useEffect(() => {
        if (jobId) {
            (async () => {
                try {
                    const { data: { user } } = await supabaseClient.auth.getUser();
                    if (!user) return;
                    const { data, error } = await supabaseClient
                        .from('students')
                        .select('name')
                        .eq('auth_user_id', user.id)
                        .eq('job_id', jobId)
                        .single();
                    if (data && data.name) {
                        setStudentName(data.name);
                    }
                } catch (e) {
                    console.error("Error fetching student name for briefing:", e);
                }
            })();
        }
    }, [jobId]);

    // Track initial load of Finalize step
    const previewAreaRef = useRef(null);
    const templatesEndRef = useRef(null);



    // --- PINCH TO ZOOM ---
    // Handles both: real touch devices (touchstart/touchmove) AND
    // Chrome DevTools mobile emulator (wheel + ctrlKey, sent when pinching trackpad in device mode)
    useEffect(() => {
        const el = previewAreaRef.current;
        if (!el) return;

        // ── Real touch pinch (physical mobile devices) ──
        let lastDist = null;

        const getDistance = (touches) => {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.sqrt(dx * dx + dy * dy);
        };

        const onTouchStart = (e) => {
            if (e.touches.length === 2) {
                lastDist = getDistance(e.touches);
                e.preventDefault();
            } else {
                lastDist = null;
            }
        };

        const onTouchMove = (e) => {
            if (e.touches.length !== 2 || lastDist === null) return;
            e.preventDefault();
            const newDist = getDistance(e.touches);
            const delta = newDist / lastDist;
            lastDist = newDist;
            setScale(s => Math.min(2.5, Math.max(0.25, s * delta)));
        };

        const onTouchEnd = () => { lastDist = null; };

        // ── Chrome DevTools emulator pinch (wheel + ctrlKey) ──
        // When you pinch on a trackpad while in device emulation mode,
        // Chrome sends wheel events with ctrlKey=true — this is the standard
        // way all web zoom implementations handle emulator testing
        const onWheel = (e) => {
            if (!e.ctrlKey) return; // only intercept pinch-zoom, not normal scroll
            e.preventDefault();
            // deltaY is negative when spreading (zoom in), positive when pinching (zoom out)
            const zoomFactor = 1 - e.deltaY * 0.01;
            setScale(s => Math.min(2.5, Math.max(0.25, s * zoomFactor)));
        };

        el.addEventListener('touchstart', onTouchStart, { passive: false });
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        el.addEventListener('touchend', onTouchEnd);
        el.addEventListener('wheel', onWheel, { passive: false });

        return () => {
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchmove', onTouchMove);
            el.removeEventListener('touchend', onTouchEnd);
            el.removeEventListener('wheel', onWheel);
        };
    }, [setScale]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [isScoringScan, setIsScoringScan] = useState(false);
    const [displayScore, setDisplayScore] = useState(0);
    const [isReorderMode, setIsReorderMode] = useState(false);

    const activeTemplateId = templateId || data.templateId || 'unified-template';

    // -- Deterministic Scoring --
    const deterministicScore = useMemo(() => {
        return calculateDeterministicScore(data, templatesConfig, activeTemplateId);
    }, [data, activeTemplateId]);

    const [scanMessage, setScanMessage] = useState("Initializing Scan...");
    const [animatedScore, setAnimatedScore] = useState(0);

    // Triggers a "Fake Scan" for professional feel - triggers on score OR template change
    useEffect(() => {
        setIsScoringScan(true);
        setAnimatedScore(0);
        setScanMessage("Checking your resume...");

        // Higher "Heavy Duty" delay (3.2s - 5.5s)
        const totalCharFactor = Math.min((JSON.stringify(data).length / 2000) * 800, 1500);
        const baseDelay = 3200 + Math.random() * 2000 + totalCharFactor;

        const timer = setTimeout(() => {
            setIsScoringScan(false);
            setDisplayScore(deterministicScore);

            // Count up animation for the score
            let start = Math.max(0, deterministicScore.score - 20);
            const duration = 800;
            const startTime = performance.now();

            const animate = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const current = Math.floor(start + progress * (deterministicScore.score - start));
                setAnimatedScore(current);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            requestAnimationFrame(animate);

        }, baseDelay);

        return () => clearTimeout(timer);
    }, [JSON.stringify(deterministicScore), activeTemplateId]);

    // -- Sync Template-Specific Settings --
    useEffect(() => {
        const config = templatesConfig.find(t => t.id === activeTemplateId);
        const layoutSettings = data.templateLayouts?.[activeTemplateId];

        // 1. Sync Theme Color
        const savedColor = layoutSettings?.themeColor || config?.defaultColor || data.themeColor || '#3b82f6';
        if (savedColor !== themeColor) setThemeColor(savedColor);

        // 2. Sync Design Settings
        // Order of precedence:
        // 1. baseline (hardcoded fallbacks)
        // 2. data.designSettings (global carryover) 
        // 3. config.defaults (TEMPLATE UNIQUE IDENTITY - Wins over global)
        // 4. layoutSettings.designSettings (USER'S EXPLICIT CHANGE - Final word)
        const baseline = {
            fontSize: 1, sectionSpacing: 1, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40
        };
        const savedDesign = {
            ...baseline,
            ...(data.designSettings || {}),
            ...(config?.defaults || {}),
            ...(layoutSettings?.designSettings || {})
        };
        // Remove undefined keys to prevent them from causing issues
        Object.keys(savedDesign).forEach(key => (savedDesign[key] === undefined) && delete savedDesign[key]);

        if (JSON.stringify(savedDesign) !== JSON.stringify(designSettings)) {
            setDesignSettings(savedDesign);
        }
    }, [activeTemplateId, data]);

    const { isAuthenticated } = useAuth();

    // Fetch user on mount or when auth state changes
    useEffect(() => {
        if (isAuthenticated) {
            supabaseClient.auth.getUser().then(({ data: { user } }) => {
                setUser(user ?? null);
            });
        } else {
            setUser(null);
        }
    }, [isAuthenticated]);

    const handleSignOut = async () => {
        await supabaseClient.auth.signOut();
        window.location.href = '/resumy/';
    };

    // -- Export Settings --
    const [pdfMode, setPdfMode] = useState('paged'); // 'paged' or 'full'

    // -- Template Filters --
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [templatesVisibleCount, setTemplatesVisibleCount] = useState(4);
    const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
    const colorInputRef = useRef(null);

    const categories = ['All', 'Professional', 'Modern', 'Creative', 'Simple', 'Executive', '1-Column', '2-Column', 'Premium'];

    const [navTarget, setNavTarget] = useState(null);

    // Filter templates based on search and category
    const filteredTemplates = useMemo(() => {
        return templatesConfig.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = selectedCategory === 'All' || t.tags.includes(selectedCategory);
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    // Handle search/filter changes with artificial loading for UX
    useEffect(() => {
        setIsTemplatesLoading(true);
        setTemplatesVisibleCount(4); // Reset pagination on filter change
        const timer = setTimeout(() => setIsTemplatesLoading(false), 800);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedCategory]);

    const handleShowMore = () => {
        // We still use a small timeout for the "Loading" state/shimmer UX
        setIsTemplatesLoading(true);
        setTimeout(() => {
            setTemplatesVisibleCount(prev => prev + 6); // Load 6 at a time for better infinity feel
            setIsTemplatesLoading(false);
        }, 400);
    };

    // Infinite Scroll for Templates
    useEffect(() => {
        if (!templatesEndRef.current || activeTab !== 'templates') return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && filteredTemplates.length > templatesVisibleCount && !isTemplatesLoading) {
                console.log("[InfiniteScroll] Loading more templates...");
                handleShowMore();
            }
        }, { threshold: 0.1 });

        observer.observe(templatesEndRef.current);
        return () => observer.disconnect();
    }, [activeTab, templatesVisibleCount, filteredTemplates.length, isTemplatesLoading]);

    // Load dictionary on mount (no auto-scan — too many API calls)
    useEffect(() => {
        // if (!spellChecker.isLoaded) {
        //     spellChecker.loadDictionary();
        // }
        setIsDictionaryLoaded(true);
        setIsSpellScanning(false);
    }, []);

    // Synchronize draft with data when spell check tab is opened
    useEffect(() => {
        if (activeTab === 'spell' && !spellCheckDraft) {
            setSpellCheckDraft({ ...data });
        } else if (activeTab !== 'spell') {
            setSpellCheckDraft(null);
        }
    }, [activeTab, data]);

    const handleSaveChanges = () => {
        if (spellCheckDraft) {
            setData(spellCheckDraft);
            setActiveTab('templates');
            setSpellCheckDraft(null);
        }
    };

    const handleCancelChanges = () => {
        setSpellCheckDraft(null);
        setActiveTab('templates');
    };

    // Use draft data if in spell check mode, otherwise use actual data
    const activeData = activeTab === 'spell' && spellCheckDraft ? spellCheckDraft : data;

    // Construct currentData with template-specific overrides for the renderer
    const currentData = useMemo(() => {
        return {
            ...activeData,
            themeColor: themeColor,
            designSettings: designSettings
        };
    }, [activeData, themeColor, designSettings]);

    // Force re-render when a word is ignored
    const handleSpellCheckIgnore = () => {
        setSpellCheckTick(prev => prev + 1);
    };

    // Handle real replacement of words in the draft state
    const handleSpellCheckReplace = (sectionKey, fieldOrIndex, value, fieldInObject) => {
        setSpellCheckDraft(prev => {
            if (!prev) return prev;
            const updated = { ...prev };

            // Branch 1: Simple top-level field (summary, personal.name)
            if (typeof fieldOrIndex === 'string' && !fieldInObject) {
                if (sectionKey === 'personal') {
                    updated.personal = { ...updated.personal, [fieldOrIndex]: value };
                } else {
                    updated[sectionKey] = value;
                }
            }
            // Branch 2: Array field (experience, education, or simple string arrays)
            else if (typeof fieldOrIndex === 'number') {
                if (Array.isArray(updated[sectionKey])) {
                    const newArray = [...updated[sectionKey]];
                    if (fieldInObject) {
                        // Object in array (experience[0].title)
                        newArray[fieldOrIndex] = { ...newArray[fieldOrIndex], [fieldInObject]: value };
                    } else {
                        // String in array (skills[0])
                        newArray[fieldOrIndex] = value;
                    }
                    updated[sectionKey] = newArray;
                }
            }
            // Branch 3: Nested object (customSection)
            else if (sectionKey === 'custom' && typeof fieldOrIndex === 'string') {
                updated.customSection = { ...updated.customSection, [fieldOrIndex]: value };
            }

            return updated;
        });
    };

    // Helper: Safely update templateLayouts with new metadata (themeColor/designSettings)
    // without disturbing existing layout zone arrays (main/sidebar/left/right) saved by DnD.
    // NOTE: Templates now use getSavedLayout() which safely strips non-layout metadata,
    // so saving { themeColor } alone is safe — getSavedLayout will fall back to defaults.
    const safeUpdateTemplateLayout = (prev, templateLayoutId, updates) => {
        const updated = { ...prev };
        if (!updated.templateLayouts) updated.templateLayouts = {};

        // Merge updates into existing data — never overwrite layout arrays
        updated.templateLayouts[templateLayoutId] = {
            ...(updated.templateLayouts[templateLayoutId] || {}),
            ...updates
        };

        return updated;
    };


    // Map section IDs to FormPanel steps (Hover-to-Edit)
    const handleSectionClick = (sectionId) => {
        if (navigateToSection) {
            navigateToSection(sectionId);
        }
    };

    const baseColors = [
        '#3b82f6', '#10b981', '#1e293b', '#8b5cf6',
        '#ef4444', '#f97316', '#2563eb', '#db2777',
        '#7c3aed', '#0891b2', '#059669', '#ca8a04',
        '#475569', '#14b8a6', '#f43f5e', '#84cc16'
    ];

    // Merge with template default color if valid
    // Use activeTemplateId (defined on line 133) for consistency
    const templateConfig = templatesConfig.find(t => t.id === activeTemplateId);

    let colors = [...baseColors];
    if (templateConfig && templateConfig.defaultColor && !colors.includes(templateConfig.defaultColor)) {
        colors = [templateConfig.defaultColor, ...baseColors];
    }

    const handleColorClick = (color) => {
        // Record the old color BEFORE applying the change
        const oldColor = themeColor;
        recordDataChange(`Color: ${oldColor} → ${color}`,
            (prev) => safeUpdateTemplateLayout({ ...prev, themeColor: color }, activeTemplateId, { themeColor: color }),
            data
        );
        setThemeColor(color);
        trackEvent('resume_design_color_change', `Changed theme color to ${color}`, {
            feature_module: 'resume_creator',
            metadata: { theme_color: color }
        });
        setData(prev => safeUpdateTemplateLayout(prev, activeTemplateId, { themeColor: color }));
    };

    const handleCustomColorClick = () => {
        if (colorInputRef.current) {
            colorInputRef.current.click();
        }
    };

    const handleCustomColorChange = (e) => {
        handleColorClick(e.target.value);
    };

    const handleTemplateClick = (id) => {
        const config = templatesConfig.find(t => t.id === id);
        // Record the template change command BEFORE applying
        recordTemplateChange(activeTemplateId, id);
        trackEvent('resume_finalize_template_change', `Changed template to ${config?.name || id}`, {
            feature_module: 'resume_creator',
            metadata: {
                template_id: id,
                template_name: config?.name,
                is_premium: config?.tags?.includes('Premium')
            }
        });
        if (onChangeTemplate) onChangeTemplate(id);
        setData(prev => ({ ...prev, templateId: id }));
    };

    // handleDownload removed as it was a window.print fallback 

    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [hasProvidedFeedback, setHasProvidedFeedback] = useState(false);

    const handleDownloadPDF = async (arg = null) => {
        // Reliable check: Is this a React Event/MouseEvent or actual feedback data?
        const isEvent = arg && (arg.nativeEvent || typeof arg.preventDefault === 'function');
        const isFeedbackData = arg && typeof arg.rating === 'number' && !isEvent;

        console.log("[Feedback] Interaction:", { isEvent: !!isEvent, isFeedbackData, hasProvidedFeedback });

        // If it's a direct click (Event) and we haven't asked yet, show modal
        if (!isFeedbackData && !hasProvidedFeedback) {
            setShowFeedbackModal(true);
            return;
        }

        setIsDownloading(true);
        setShowFeedbackModal(false);

        // Extract feedback if it's the real deal
        if (isFeedbackData) {
            try {
                const { error: feedbackError } = await supabaseClient
                    .from('resume_feedback')
                    .insert([{
                        user_id: user?.id || null,
                        resume_id: builder_resume_id || null,
                        rating: arg.rating,
                        comment: arg.comment || "",
                        template_used: activeTemplateId,
                        source_context: jobId ? 'placement-drive' : 'general-use'
                    }]);

                if (feedbackError) console.error("Error saving feedback:", feedbackError);
                else setHasProvidedFeedback(true);
            } catch (err) {
                console.error("Feedback submission error:", err);
            }
        }

        trackEvent('resume_download_started', 'Started PDF generation', {
            feature_module: 'resume_creator',
            metadata: {
                template_id: data.templateId,
                pdf_mode: pdfMode
            }
        });
          try {
            // ── 0. Find the live resume element ──────────────────────────────────────
            let resumeElement = document.querySelector('.dashboard-preview-area .resume-theme-provider');
            if (!resumeElement) resumeElement = document.querySelector('.resume-theme-provider');
            if (!resumeElement) throw new Error('Resume preview element not found');

            // ── 1. Detect rendering mode from the DOM class ───────────────────────────
            // ResumeRenderer adds 'paged-mode' when showPageBreaks=true, 'seamless-mode' when false.
            const isPagedMode = resumeElement.classList.contains('paged-mode');
            const childCount = resumeElement.children?.length || 0;
            console.log(`[PDF-FRONTEND] Mode detected: ${isPagedMode ? 'PAGED' : 'SEAMLESS'}. Root children: ${childCount}`);

            // ── 2. Clone the element (don't mutate live DOM) ──────────────────────────
            const clone = resumeElement.cloneNode(true);

            // ── 3. Convert any blob: image URLs to base64 (required for Puppeteer) ────
            const images = Array.from(clone.querySelectorAll('img'));
            for (const img of images) {
                if (img.src.startsWith('blob:')) {
                    try {
                        const res = await fetch(img.src);
                        const blob = await res.blob();
                        const reader = new FileReader();
                        const base64 = await new Promise((resolve) => {
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });
                        img.src = base64;
                    } catch (e) {
                        console.warn('[PDF-FRONTEND] Blob image conversion failed', e);
                    }
                }
            }

            // ── 4. Capture inline <style> tags only ───────────────────────────────────
            // We skip <link rel="stylesheet"> intentionally: those point to the Next.js
            // app CSS (editor layout) which sets body { overflow: hidden } and breaks
            // multi-page PDF rendering in Puppeteer.
            const styleTags = Array.from(document.querySelectorAll('style'))
                .map(s => s.outerHTML)
                .join('\n');

            // ── 5. Determine active font and inject Google Fonts link ─────────────────
            const activeTemplateIdForPdf = templateId || data.templateId || 'unified-template';
            const templateLayoutSettings = data.templateLayouts?.[activeTemplateIdForPdf] || {};
            const templateConfig = templatesConfig.find(t => t.id === activeTemplateIdForPdf) || {};

            const rawFont =
                templateLayoutSettings.designSettings?.fontFamily ||
                templateLayoutSettings.fontFamily ||
                designSettings.fontFamily ||
                templateConfig.defaultFont ||
                'Plus Jakarta Sans';

            const fontName = rawFont.split(',')[0].replace(/['\"]/g, '').trim();

            const fontVariable = `--font-${fontName.toLowerCase().replace(/\s+/g, '-')}`;
            const googleFontLink = `<link href="https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">`;

            // ── 6. Build PDF Engine V3 Styles ────────────────────────────────────────
            // Instead of hardcoding print-media fixes, we use Screen-Fidelity rules.
            const pagedModeCSS = `
                /* ── V3 PAGED MODE (A4 Pages) ── */
                @page { margin: 0; size: A4; }

                .resume-page, 
                [style*="height: 297mm"], 
                [style*="height:297mm"],
                [style*="height: 297mm;"],
                [style*="height:297mm;"] {
                    height: 297mm !important;
                    min-height: 297mm !important;
                    max-height: 297mm !important;
                    width: 210mm !important;
                    box-shadow: none !important;
                    page-break-after: always !important;
                    break-after: page !important;
                    overflow: hidden !important;
                    position: relative !important;
                    background: white !important;
                }

                /* Ensure the last page doesn't cause an extra empty page */
                .resume-page:last-child {
                    page-break-after: avoid !important;
                    break-after: avoid !important;
                }
            `;

            const seamlessModeCSS = `
                /* V3 SEAMLESS MODE */
                .resume-theme-provider {
                    display: block !important;
                    width: 210mm !important;
                    height: auto !important;
                }
            `;

            const pdfStyles = `
                <style>
                    :root { ${fontVariable}: '${fontName}', sans-serif; }
                    
                    /* Universal Screen-Fidelity Resets */
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        width: 210mm !important;
                        height: auto !important;
                        display: block !important;
                        overflow: visible !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .resume-theme-provider {
                        display: block !important;
                        width: 210mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        background: white !important;
                        height: auto !important;
                        overflow: visible !important;
                        position: relative !important;
                    }

                    ${isPagedMode ? pagedModeCSS : seamlessModeCSS}

                    /* Advanced UI Stripping */
                    .edit-overlay, .drag-handle-overlay, .add-section-btn, .section-controls,
                    .page-guides-overlay, .page-height-marker, .spell-popup, .resume-measurer,
                    [class*="DragOverlay"], button, [class*="drag-handle"],
                    [class*="AddSection"], [class*="SectionControls"], .page-height-marker {
                        display: none !important;
                        opacity: 0 !important;
                        visibility: hidden !important;
                    }
                    
                    .spell-error-word {
                        text-decoration: none !important;
                        border: none !important;
                        background: transparent !important;
                    }

                    .draggable-section {
                        transform: none !important;
                        transition: none !important;
                    }
                </style>
            `;

            const fullHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Resume Export</title>
                    <base href="${window.location.origin}/" />
                    ${googleFontLink}
                    ${styleTags}
                    ${pdfStyles}
                </head>
                <body class="pdf-export-body">
                    ${clone.outerHTML}
                </body>
                </html>
            `;

            // ── 8. PDF options  ───────────────────────────────────────────────────────
            // Paged   → format: A4   (Puppeteer paginates content into A4 pages)
            // Seamless → height: auto (backend measures content height → single-page PDF)
            const pdfOptions = isPagedMode
                ? { format: 'A4' }
                : { height: 'auto' };

            console.log(`[PDF-FRONTEND] Sending to backend — mode: ${isPagedMode ? 'PAGED' : 'SEAMLESS'}, HTML: ${fullHtml.length} bytes`);

            // 6. Request Generation
            const response = await fetch('/resumy/api/pdf/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    html: fullHtml,
                    options: pdfOptions,
                    score: deterministicScore?.score // Pass the numeric score for the watermark
                })
            });

            if (!response.ok) {
                const err = await response.json();
                console.error('Backend Error:', err);
                throw new Error(err.error || `Backend failed with status ${response.status}`);
            }

            // 7. Trigger Download
            const blob = await response.blob();
            const fileName = (data.personal?.name || 'Resume').replace(/\s+/g, '_');
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}_Resumy.pdf`;
            document.body.appendChild(a);
            a.click();
            setShowAha(true);
            trackEvent('aha_moment', 'User downloaded their resume', {
                feature_module: 'resume_creator',
                funnel_stage: 'conversion',
                metadata: {
                    action: 'pdf_download',
                    template_id: data.templateId
                }
            });
            trackEvent('resume_download_success', 'PDF downloaded successfully', {
                feature_module: 'resume_creator',
                metadata: {
                    template_id: data.templateId,
                    file_name: `${fileName}_Resumy.pdf`
                }
            });
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 100);

        } catch (error) {
            console.error('PDF Export Error:', error);
            trackEvent('resume_download_failed', error.message, {
                feature_module: 'resume_creator',
                error: error.message
            });
            alert(`High-fidelity export failed: ${error.message}. Please check your internet connection and try again.`);
        } finally {
            setIsDownloading(false);
        }
    };



    const handleCopyShareLink = async () => {
        setIsSharing(true);
        trackEvent('resume_share_link_copied', 'Copied share link to clipboard', {
            feature_module: 'resume_creator',
            is_referral: true
        });
        try {
            const url = window.location.href;
            await navigator.clipboard.writeText(url);
            alert('Resume link copied to clipboard!');
        } catch (e) {
            console.error('Failed to copy share link:', e);
            alert('Failed to copy link. Please try again.');
        } finally {
            setTimeout(() => setIsSharing(false), 1500);
        }
    };

    const handleCopyPlainText = () => {
        setIsCopying(true);
        try {
            const d = data;
            trackEvent('resume_copy_plain_text', 'Copied plain text resume', {
                feature_module: 'resume_creator'
            });
            const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

            const sections = [
                d.personal?.name?.toUpperCase(),
                d.personal?.profession,
                [d.personal?.email, d.personal?.phone, d.personal?.city, d.personal?.state].filter(Boolean).join(' | '),
                d.personal?.linkedin || d.personal?.github || d.personal?.website ? `Links: ${[d.personal?.linkedin, d.personal?.github, d.personal?.website].filter(Boolean).join(' • ')}` : '',
                '',
                'EXECUTIVE SUMMARY',
                '-----------------',
                d.summary ? stripHtml(d.summary) : 'Not provided',
                '',
                'PROFESSIONAL EXPERIENCE',
                '-----------------------',
                ...(d.experience || []).flatMap(e => [
                    `${e.title?.toUpperCase()} | ${e.company}`,
                    `${e.startMonth || ''} ${e.startYear || ''} – ${e.isCurrent ? 'Present' : `${e.endMonth || ''} ${e.endYear || ''}`}`,
                    stripHtml(e.description),
                    ''
                ]),
                'EDUCATION',
                '---------',
                ...(d.education || []).flatMap(e => [
                    `${e.degree}${e.field ? ' in ' + e.field : ''}`,
                    `${e.school || e.institution || ''} | ${e.endYear || ''}`,
                    e.description ? stripHtml(e.description) : '',
                    ''
                ]),
                'SKILLS',
                '------',
                (d.skills || []).map(s => typeof s === 'object' ? s.name : s).join(', '),
                '',
                ...(d.projects && d.projects.length > 0 ? [
                    'PROJECTS',
                    '--------',
                    ...(d.projects || []).flatMap(p => [
                        `${p.title?.toUpperCase()}${p.link ? ` (${p.link})` : ''}`,
                        stripHtml(p.description),
                        ''
                    ])
                ] : []),
                ...(d.certifications && d.certifications.length > 0 ? [
                    'CERTIFICATIONS',
                    '--------------',
                    ...(d.certifications || []).map(c => `• ${c.name}${c.issuer ? ` — ${c.issuer}` : ''} (${c.date || ''})`),
                    ''
                ] : []),
            ].filter(l => l !== null && l !== undefined).join('\n');

            navigator.clipboard.writeText(sections);
            alert('✅ ATS-friendly plain text copied to clipboard!');
        } catch (e) {
            console.error(e);
            alert('Failed to copy text. Please try again.');
        } finally {
            setTimeout(() => setIsCopying(false), 1500);
        }
    };

    const handleUpdateDesignSettings = (newSettingsOrUpdater) => {
        setDesignSettings(prev => {
            const next = typeof newSettingsOrUpdater === 'function'
                ? newSettingsOrUpdater(prev)
                : newSettingsOrUpdater;

            // Record the design change BEFORE applying it
            recordDataChange('Design Settings',
                (d) => safeUpdateTemplateLayout({ ...d, designSettings: next }, activeTemplateId, { designSettings: next }),
                data
            );

            // Persist to data using safe helper to preserve section layout arrays
            setData(d => safeUpdateTemplateLayout(
                { ...d, designSettings: next }, // update global fallback too
                activeTemplateId,
                { designSettings: next }
            ));
            return next;
        });
    };

    const handleReorder = (newOrder) => {
        // Record the old order snapshot BEFORE the reorder
        recordDataChange('Section Reorder',
            (prev) => {
                const currentTemplateId = prev.templateId || templateId || 'unified-template';
                const updated = { ...prev };
                if (!updated.templateLayouts) updated.templateLayouts = {};
                updated.templateLayouts[currentTemplateId] = { ...(updated.templateLayouts[currentTemplateId] || {}), ...newOrder };
                const mainOrder = newOrder.mainSectionsOrder || newOrder.main;
                const sidebarOrder = newOrder.sidebarSectionsOrder || newOrder.sidebar;
                if (mainOrder) updated.mainSectionsOrder = mainOrder;
                if (sidebarOrder) updated.sidebarSectionsOrder = sidebarOrder;
                return updated;
            },
            data
        );

        setData(prev => {
            const currentTemplateId = prev.templateId || templateId || 'unified-template';
            const updated = { ...prev };
            if (!updated.templateLayouts) updated.templateLayouts = {};
            updated.templateLayouts[currentTemplateId] = {
                ...(updated.templateLayouts[currentTemplateId] || {}),
                ...newOrder
            };
            const mainOrder = newOrder.mainSectionsOrder || newOrder.main;
            const sidebarOrder = newOrder.sidebarSectionsOrder || newOrder.sidebar;
            if (mainOrder) updated.mainSectionsOrder = mainOrder;
            if (sidebarOrder) updated.sidebarSectionsOrder = sidebarOrder;
            if (!mainOrder && !sidebarOrder && Array.isArray(newOrder)) {
                updated.sectionsOrder = newOrder;
            }
            return updated;
        });
    };


    const [resumeName, setResumeName] = useState(data.personal?.name ? `${data.personal.name}'s Resume` : 'Untitled Resume');
    const [isEditingName, setIsEditingName] = useState(false);
    const [saveStatus, setSaveStatus] = useState('Saved');

    const resetZoom = () => setScale(0.85);

    // ── Command-pattern Undo/Redo ────────────────────────────────────────
    const {
        canUndo,
        canRedo,
        undo: handleUndo,
        redo: handleRedo,
        recordDataChange,
        recordTemplateChange,
    } = useResumeHistory({ data, setData, activeTemplateId, onChangeTemplate });

    // Note: Auto-syncing of data.themeColor has been removed to preserve template-specific isolation.
    // data.themeColor is now only updated when the user explicitly interacts with the design panel, 
    // adhering to the "isolated colors" design choice.

    // Sync themeColor when data is updated (externally)
    useEffect(() => {
        if (data.themeColor && data.themeColor !== themeColor) {
            setThemeColor(data.themeColor);
        }
    }, [data.themeColor]);

    const handleSaveName = () => {
        setIsEditingName(false);
        if (resumeName.trim()) {
            setData(prev => ({
                ...prev,
                personal: { ...prev.personal, name: resumeName }
            }));
            setSaveStatus('All changes saved');
        }
    };

    const zoomBtnStyle = {
        background: '#f1f5f9',
        border: '1px solid #e2e8f0',
        color: '#1e293b',
        cursor: 'pointer',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        borderRadius: '0'
    };

    const historyBtnStyle = {
        ...zoomBtnStyle,
        background: jobId ? 'rgba(255,255,255,0.15)' : 'white'
    };

    return (
        <div
            className="final-dashboard-wrapper animate-fade"
            onContextMenu={(e) => isMobile ? e.preventDefault() : null}
        >
            {/* TOP BAR - REDESIGNED MODERN v3 */}
            <header className={`dashboard-top-bar ${jobId ? 'placement-mode' : ''} ${isMobile && (activeTab || isActionsVisible) ? 'mobile-hidden' : ''}`}>
                {/* 1. BRANDING / MOBILE BACK */}
                {isMobile ? (
                    isReorderMode ? null : (
                        <motion.button
                            onClick={() => onBack()}
                            className="editor-back-btn"
                            style={jobId ? { background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' } : {}}
                        >
                            <Edit3 size={18} />
                        </motion.button>
                    )
                ) : (
                    <div className="top-left-branding">
                        <motion.button
                            onClick={() => onBack()}
                            className="editor-back-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={jobId ? { background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' } : {}}
                        >
                            <Edit3 size={16} /> Edit Content
                        </motion.button>
                    </div>
                )}

                {/* 2. CENTER / TOOLS */}
                {isMobile ? (
                    isReorderMode ? (
                        <div className="flex-1 flex justify-center items-center py-2">
                            <motion.button
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                onClick={() => setIsReorderMode(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: '#7c3aed',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 48px',
                                    borderRadius: '99px',
                                    fontSize: '12px',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    boxShadow: '0 12px 30px rgba(124, 58, 237, 0.4)',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <Check size={18} strokeWidth={3} /> Done Reordering
                            </motion.button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3">
                                <button disabled={!canUndo} onClick={handleUndo} className={`p-1.5 transition-colors ${canUndo ? (jobId ? 'text-white' : 'text-slate-600') : 'opacity-10'}`}><Undo size={18} /></button>
                                <button disabled={!canRedo} onClick={handleRedo} className={`p-1.5 transition-colors ${canRedo ? (jobId ? 'text-white' : 'text-slate-600') : 'opacity-10'}`}><Redo size={18} /></button>
                            </div>

                            <div className={`p-1.5 ${isSaving ? 'text-amber-500' : (jobId ? 'text-emerald-200' : 'text-emerald-500')}`}>
                                {isSaving ? <RefreshCcw size={18} className="animate-spin" /> : <Cloud size={20} />}
                            </div>

                            <div className="flex items-center gap-3">
                                <button onClick={() => setScale(s => Math.max(0.4, s - 0.1))} className={`p-1.5 transition-colors ${jobId ? 'text-white' : 'text-slate-600'}`}><ZoomOut size={18} /></button>
                                <button onClick={() => setScale(s => Math.min(1.5, s + 0.1))} className={`p-1.5 transition-colors ${jobId ? 'text-white' : 'text-slate-600'}`}><ZoomIn size={18} /></button>
                            </div>
                        </>
                    )
                ) : (
                    <>
                        <div className="top-center-status hidden md:flex items-center justify-center gap-4">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isSaving ? 'bg-amber-50 text-amber-600' : (jobId ? 'bg-white/10 text-white' : 'bg-emerald-50 text-emerald-600')} border ${jobId ? 'border-white/10' : 'border-current/10'}`}>
                                {isSaving ? (
                                    <>
                                        <RefreshCcw size={12} className="animate-spin" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Saving</span>
                                    </>
                                ) : (
                                    <>
                                        <Cloud size={12} className={jobId ? "text-emerald-200" : "text-emerald-500"} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Saved to Cloud</span>
                                    </>
                                )}
                            </div>

                            {jobId && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/20 animate-pulse">
                                    <ShieldCheck size={12} className="text-emerald-200" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-50">Monitoring Active</span>
                                </div>
                            )}
                        </div>

                        <div className="user-action-group">
                            <div className="flex items-center bg-gray-50/50 p-1 rounded-xl border border-gray-100/50 mr-4" style={jobId ? { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' } : {}}>
                                <div className="flex items-center gap-1 border-r border-gray-200/50 pr-2 mr-2" style={jobId ? { borderColor: 'rgba(255,255,255,0.1)' } : {}}>
                                    <button onClick={() => setScale(s => Math.max(0.4, s - 0.1))} className="p-1.5 hover:bg-white rounded-lg transition-colors" style={jobId ? { color: 'white' } : {}}><ZoomOut size={16} /></button>
                                    <span className="text-[11px] font-bold w-10 text-center" style={{ color: jobId ? 'white' : '#1e293b' }}>{Math.round(scale * 100)}%</span>
                                    <button onClick={() => setScale(s => Math.min(1.5, s + 0.1))} className="p-1.5 hover:bg-white rounded-lg transition-colors" style={jobId ? { color: 'white' } : {}}><ZoomIn size={16} /></button>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button disabled={!canUndo} onClick={handleUndo} className={`p-1.5 rounded-lg transition-colors ${canUndo ? 'hover:bg-white' : 'opacity-30 cursor-not-allowed'}`} style={jobId ? { color: 'white' } : {}}><Undo size={16} /></button>
                                    <button disabled={!canRedo} onClick={handleRedo} className={`p-1.5 rounded-lg transition-colors ${canRedo ? 'hover:bg-white' : 'opacity-30 cursor-not-allowed'}`} style={jobId ? { color: 'white' } : {}}><Redo size={16} /></button>
                                </div>
                            </div>

                            <button
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold transition-all mr-4 export-tour-btn ${isActionsVisible ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white text-indigo-600 border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50/50'}`}
                                onClick={() => { setIsActionsVisible(!isActionsVisible); if (isMobile) setActiveTab(null); }}
                                style={jobId ? { background: isActionsVisible ? '#059669' : 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' } : {}}
                            >
                                <Sparkles size={16} />
                                <span className="text-xs uppercase tracking-wider">Export</span>
                            </button>

                            <button
                                className="user-profile-trigger"
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                style={{ background: jobId ? 'rgba(255,255,255,0.1)' : '#f8fafc', border: jobId ? '1px solid rgba(255,255,255,0.2)' : '1px solid #f1f5f9' }}
                            >
                                <span className={`text-[11px] font-black uppercase tracking-wider hidden sm:inline ${jobId ? 'text-white' : 'text-stone-600'}`}>
                                    {jobId && studentName ? studentName.split(' ')[0] : (user?.email?.split('@')[0] || 'Member')}
                                </span>
                                <div className="user-avatar-mini" style={jobId ? { background: 'white', color: '#047857', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } : {}}>
                                    {jobId && studentName ? studentName[0].toUpperCase() : (user?.email?.[0].toUpperCase() || 'U')}
                                </div>
                            </button>

                            {showProfileMenu && (
                                <div
                                    className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 shadow-2xl rounded py-3 z-[100] overflow-hidden"
                                    style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
                                >
                                    <div className="px-5 pb-3 mb-2 border-b border-slate-50">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account</div>
                                        <div className="text-xs font-bold text-slate-800 truncate">{user?.email}</div>
                                    </div>

                                    {!jobId && (
                                        <div className="px-2">
                                            <button onClick={() => router.push('/dashboard')} className="w-full px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-3 rounded-xl transition-colors">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <Layout size={16} />
                                                </div>
                                                My Resumes
                                            </button>
                                        </div>
                                    )}

                                    <div className="my-2 border-t border-slate-50" />

                                    <div className="px-2">
                                        <button
                                            onClick={() => handleSignOut()}
                                            className="w-full px-3 py-2 text-left text-sm font-semibold text-rose-500 hover:bg-rose-50 flex items-center gap-3 rounded-xl transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                                                <LogOut size={16} />
                                            </div>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </header>

            <div className="dashboard-main">
                {/* Mobile Backdrop for both sidebars - Conditional dimming */}
                {isMobile && (activeTab || isActionsVisible) && (
                    <div
                        onClick={() => {
                            setActiveTab(null);
                            setIsActionsVisible(false);
                            setDesignPanelSubTab('main');
                        }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: (activeTab === 'design' && designPanelSubTab !== 'main') ? 'transparent' : 'rgba(15, 23, 42, 0.4)',
                            backdropFilter: 'none',
                            zIndex: 990,
                            pointerEvents: (activeTab === 'design' && designPanelSubTab !== 'main') ? 'none' : 'auto',
                            transition: 'all 0.3s ease'
                        }}
                    />
                )}

                {/* LEFT NAVIGATION - Hide on extreme mobile if redundant, but our CSS handles it */}
                {!isMobile && (
                    <nav className="dashboard-left-nav">
                        <div
                            className={`nav-btn ${activeTab === 'templates' ? 'active' : ''}`}
                            onClick={() => handleTabChange('templates')}
                        >
                            <Layout size={20} className="sidebar-icon" />
                            <span className="nav-label">Templates</span>
                        </div>
                        <div
                            className={`nav-btn ${activeTab === 'design' ? 'active' : ''}`}
                            onClick={() => handleTabChange('design')}
                        >
                            <Sliders size={20} className="sidebar-icon" />
                            <span className="nav-label">Design & formatting</span>
                        </div>
                        <div
                            className={`nav-btn ${activeTab === 'add' ? 'active' : ''}`}
                            onClick={() => handleTabChange('add')}
                        >
                            <Plus size={20} className="sidebar-icon" />
                            <span className="nav-label">Add section</span>
                        </div>
                        {/* 
                        <div
                            className={`nav-btn ${activeTab === 'spell' ? 'active' : ''}`}
                            onClick={() => handleTabChange('spell')}
                            style={{ position: 'relative' }}
                        >
                            <SpellCheck2 size={20} className="sidebar-icon" />
                            <span className="nav-label">Spell check</span>
                            {isDictionaryLoaded && (
                                <div style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '15px',
                                    background: isSpellScanning ? '#94a3b8' : '#ef4444',
                                    color: 'white',
                                    borderRadius: '50%',
                                    padding: '0 5px',
                                    minWidth: '18px',
                                    height: '18px',
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '700',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {isSpellScanning ? (
                                        <RefreshCcw size={10} className="animate-spin" />
                                    ) : (
                                        spellCheckErrors
                                    )}
                                </div>
                            )}
                        </div>
                        */}
                    </nav>
                )}

                {/* This is the mobile bottom nav - hidden when Draft Explorer is open */}
                {isMobile && !isDraftExplorerOpen && (
                    <nav className="dashboard-left-nav mobile-bottom-nav">
                        <div
                            className={`nav-btn ${activeTab === 'templates' ? 'active' : ''}`}
                            onClick={() => { handleTabChange('templates'); setIsActionsVisible(false); }}
                        >
                            <Layout size={20} className="sidebar-icon" />
                            <span className="nav-label">Templates</span>
                        </div>
                        <div
                            className={`nav-btn ${activeTab === 'design' ? 'active' : ''}`}
                            onClick={() => { handleTabChange('design'); setIsActionsVisible(false); }}
                        >
                            <Sliders size={20} className="sidebar-icon" />
                            <span className="nav-label">Style</span>
                        </div>
                        <div
                            className={`nav-btn ${activeTab === 'add' ? 'active' : ''}`}
                            onClick={() => { handleTabChange('add'); setIsActionsVisible(false); }}
                        >
                            <Plus size={20} className="sidebar-icon" />
                            <span className="nav-label">Add</span>
                        </div>
                        {/* 
                        <div
                            className={`nav-btn ${activeTab === 'spell' ? 'active' : ''}`}
                            onClick={() => { handleTabChange('spell'); setIsActionsVisible(false); }}
                            style={{ position: 'relative' }}
                        >
                            <SpellCheck2 size={20} className="sidebar-icon" />
                            <span className="nav-label">Spell</span>
                            {isDictionaryLoaded && spellCheckErrors > 0 && (
                                <div style={{
                                    position: 'absolute', top: '8px', right: 'calc(50% - 14px)',
                                    background: '#ef4444', color: 'white', borderRadius: '50%',
                                    width: '16px', height: '16px', fontSize: '9px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900'
                                }}>
                                    {spellCheckErrors}
                                </div>
                            )}
                        </div>
                        */}
                        <div
                            className={`nav-btn ${isActionsVisible ? 'active' : ''}`}
                            onClick={() => { setIsActionsVisible(!isActionsVisible); setActiveTab(null); }}
                        >
                            <Sparkles size={20} className="sidebar-icon" />
                            <span className="nav-label">Export</span>
                        </div>
                        <div
                            className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => handleTabChange('profile')}
                        >
                            <User size={20} className="sidebar-icon" />
                            <span className="nav-label">Profile</span>
                        </div>
                    </nav>
                )}

                {/* SECONDARY PANE: CONFIGURATION */}
                {activeTab && (
                    <aside className={`dashboard-config-pane ${(activeTab === 'templates' || activeTab === 'add' || activeTab === 'profile') ? 'is-templates' : 'is-half-sheet'}`}>
                        {activeTab === 'profile' && (
                            <div className="templates-config">
                                <div className="pane-header-with-close">
                                    <h2 className="pane-title relative">
                                        Account
                                    </h2>
                                    <button className="pane-close-btn" onClick={() => setActiveTab(null)}>
                                        <X size={20} className="top-bar-icon" />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded mb-6">
                                        <div className="w-12 h-12 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                                            {user?.email?.[0].toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-slate-800">{user?.email?.split('@')[0]}</div>
                                            <div className="text-[10px] font-bold text-slate-400 truncate max-w-[180px]">{user?.email}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {!jobId && (
                                            <>
                                                <button
                                                    onClick={async () => {
                                                        setIsExplorerLoading(true);
                                                        try {
                                                            await onOpenDraftExplorer();
                                                        } finally {
                                                            setIsExplorerLoading(false);
                                                            setActiveTab(null);
                                                        }
                                                    }}
                                                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded transition-all group"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        {isExplorerLoading ? <RefreshCcw size={18} className="animate-spin" /> : <FileText size={18} />}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-sm font-bold text-slate-700">My Drafts</div>
                                                        <div className="text-[10px] text-slate-400">Open your drafts & explorer</div>
                                                    </div>
                                                    <ChevronRight size={14} className="ml-auto text-slate-300" />
                                                </button>
                                            </>
                                        )}

                                        <button onClick={() => router.push('/dashboard')} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Home size={18} />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-bold text-slate-700">Dashboard</div>
                                                <div className="text-[10px] text-slate-400">Back to main overview</div>
                                            </div>
                                            <ChevronRight size={14} className="ml-auto text-slate-300" />
                                        </button>

                                        <div className="my-4 border-t border-slate-100" />

                                        <button onClick={() => handleSignOut()} className="w-full flex items-center gap-4 p-4 hover:bg-rose-50 rounded transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <LogOut size={18} />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-bold text-rose-600">Sign Out</div>
                                                <div className="text-[10px] text-rose-300">Exit your current session</div>
                                            </div>
                                            <ChevronRight size={14} className="ml-auto text-rose-200" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'templates' && (
                            <div className="templates-config">
                                <div className="pane-header-with-close">
                                    <h2 className="pane-title relative">
                                        Templates
                                    </h2>
                                    <button className="pane-close-btn" onClick={() => setActiveTab(null)}>
                                        <X size={20} className="top-bar-icon" />
                                    </button>
                                </div>

                                {/* Search & Filters */}
                                <div className="templates-filter-section">
                                    <div className="template-search-wrapper search-input-wrapper">
                                        <Search size={16} className="search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Find your perfect template..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="template-search-input"
                                        />
                                    </div>
                                    <div className="category-pills-scroll" style={{ marginTop: '10px' }}>
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                                                onClick={() => setSelectedCategory(cat)}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="templates-content-scroll">
                                    {/* Discovery Gallery - visible in scroll area (good for mobile) */}
                                    <button
                                        onClick={() => setIsGalleryOpen(true)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            width: '100%',
                                            padding: '12px 16px',
                                            background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: 800,
                                            fontSize: '11px',
                                            cursor: 'pointer',
                                            marginBottom: '16px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            boxShadow: '0 8px 20px -5px rgba(124, 58, 237, 0.35)'
                                        }}
                                    >
                                        <Sparkles size={14} fill="currentColor" /> Discovery Gallery
                                    </button>

                                    {/* Color Theme Section */}
                                    <div className="templates-section">
                                        <h3 className="section-label-mid">Color Theme</h3>
                                        <div className="color-picker-grid">
                                            <div
                                                className={`color-wheel-swatch ${!colors.includes(themeColor) ? 'active' : ''}`}
                                                title="Custom Color"
                                                onClick={handleCustomColorClick}
                                            >
                                                <div className="gradient-sweep"></div>
                                                <input
                                                    type="color"
                                                    ref={colorInputRef}
                                                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0, padding: 0, border: 'none', pointerEvents: 'none' }}
                                                    onChange={handleCustomColorChange}
                                                    value={themeColor}
                                                />
                                            </div>
                                            {colors.map(c => (
                                                <div
                                                    key={c}
                                                    className={`color-circle ${themeColor === c ? 'active' : ''}`}
                                                    style={{ backgroundColor: c }}
                                                    onClick={() => handleColorClick(c)}
                                                    title={c}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Templates Grid Section */}
                                    <div className="templates-section">
                                        <h3 className="section-label-mid">
                                            {selectedCategory === 'All' ? 'Available Templates' : `${selectedCategory} Templates`}
                                            <span className="count-badge">{filteredTemplates.length}</span>
                                        </h3>

                                        <div className="templates-grid-wrapper">
                                            <div className={`templates-grid ${isTemplatesLoading ? 'loading-shimmer' : ''}`}>
                                                {filteredTemplates.length > 0 ? filteredTemplates.slice(0, templatesVisibleCount).map(t => (
                                                    <VirtualTemplateCard
                                                        key={t.id}
                                                        t={t}
                                                        data={sidebarPreviewData}
                                                        isActive={activeTemplateId === t.id}
                                                        isLoading={isTemplatesLoading}
                                                        onClick={handleTemplateClick}
                                                    />
                                                )) : !isTemplatesLoading && (
                                                    <div className="no-results">
                                                        <div className="no-results-icon"><Search size={32} /></div>
                                                        <p>No templates found.</p>
                                                        <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>Show all templates</button>
                                                    </div>
                                                )}

                                                {/* Infinite Scroll Trigger */}
                                                <div ref={templatesEndRef} style={{ height: '20px', width: '100%', gridColumn: '1 / -1' }} />

                                                {isTemplatesLoading && (
                                                    <div style={{ gridColumn: '1 / -1', padding: '10px', textAlign: 'center', color: '#7c3aed', fontSize: '10px', fontWeight: 700 }}>
                                                        Finding more designs...
                                                    </div>
                                                )}
                                            </div>

                                            {filteredTemplates.length <= templatesVisibleCount && filteredTemplates.length > 0 && (
                                                <div style={{ textAlign: 'center', padding: '24px 0 40px', color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    You've seen all our designs ✨
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Render Design Panel */}
                        {activeTab === 'design' && (
                            <DesignPanel
                                data={currentData}
                                setData={setData}
                                settings={designSettings}
                                setSettings={handleUpdateDesignSettings}
                                templateId={activeTemplateId}
                                onColorChange={handleColorClick}
                                onClose={() => setActiveTab(null)}
                                isMobile={isMobile}
                                onSubTabChange={setDesignPanelSubTab}
                            />
                        )}

                        {/* Render Add Section Panel */}
                        {activeTab === 'add' && (
                            <div className="add-section-config" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                                <div className="pane-header-with-close" style={{ padding: '24px 24px 16px' }}>
                                    <h2 className="pane-title">Add Section</h2>
                                    <button className="pane-close-btn" onClick={() => setActiveTab(null)}>
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="add-section-content" style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
                                    <p className="pane-subtitle" style={{ marginBottom: '24px', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
                                        Enhance your resume with extra sections that highlight your unique qualifications.
                                    </p>

                                    <div className="sections-grid" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {[
                                            { id: 'personalDetails', label: 'Personal Details', icon: User, desc: 'Date of birth, nationality, etc.' },
                                            { id: 'projects', label: 'Projects', icon: Briefcase, desc: 'Showcase your best work' },
                                            { id: 'languages', label: 'Languages', icon: Globe, desc: 'List your linguistic skills' },
                                            { id: 'certifications', label: 'Certifications', icon: FileText, desc: 'Professional credentials' },
                                            { id: 'software', label: 'Software', icon: Cpu, desc: 'Technical tools & apps' },
                                            { id: 'keyAchievements', label: 'Key Achievements', icon: Award, desc: 'Major career highlights' },
                                            { id: 'accomplishments', label: 'Accomplishments', icon: Award, desc: 'Academic or personal' },
                                            { id: 'affiliations', label: 'Affiliations', icon: Users, desc: 'Groups and organizations' },
                                            { id: 'websites', label: 'Websites & Links', icon: Globe, desc: 'Portfolio or social profiles' },
                                            { id: 'interests', label: 'Interests', icon: Heart, desc: 'Hobbies and activities' },
                                            { id: 'additionalInfo', label: 'Additional Info', icon: Info, desc: 'Extra details if needed' },
                                            { id: 'custom', label: 'Custom Section', icon: Plus, desc: 'Define your own category' },
                                        ].map((section) => {
                                            // 1. ABSOLUTE SOURCE OF TRUTH: ONLY what's in selectedExtraSections
                                            const isSelected = !!data.selectedExtraSections?.[section.id];

                                            const toggleSection = (e) => {
                                                e.stopPropagation();
                                                console.log(`[Finalize] Toggling section: ${section.id}. Current selected: ${isSelected}`);

                                                setData(prev => {
                                                    const updated = { ...prev };
                                                    // Create the object if missing
                                                    if (!updated.selectedExtraSections) updated.selectedExtraSections = {};

                                                    // Flip the boolean
                                                    const nextState = !isSelected;
                                                    updated.selectedExtraSections = {
                                                        ...updated.selectedExtraSections,
                                                        [section.id]: nextState
                                                    };

                                                    // 2. Section-specific side effects (visibility toggles for Custom/Personal)
                                                    if (section.id === 'custom') {
                                                        updated.customSection = { ...(prev.customSection || {}), isVisible: nextState };
                                                    }

                                                    return updated;
                                                });

                                                // 3. Navigation: Only jump to the section if we are ACTIVATING it
                                                if (!isSelected && navigateToSection) {
                                                    console.log(`[Finalize] Navigating to newly activated section: ${section.id}`);
                                                    navigateToSection(section.id);
                                                }
                                            };

                                            return (
                                                <div
                                                    key={section.id}
                                                    className="section-add-card"
                                                    onClick={() => navigateToSection(section.id)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '16px',
                                                        padding: '16px',
                                                        background: isSelected ? '#f8fafc' : '#ffffff',
                                                        border: `1px solid ${isSelected ? '#7c3aed' : '#e2e8f0'}`,
                                                        borderRadius: '0', // Sharp corners
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: isSelected ? '#7c3aed' : '#f1f5f9',
                                                        color: isSelected ? '#ffffff' : '#64748b',
                                                        borderRadius: '0'
                                                    }}>
                                                        <section.icon size={20} />
                                                    </div>

                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{section.label}</div>
                                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{section.desc}</div>
                                                    </div>

                                                    <button
                                                        onClick={toggleSection}
                                                        style={{
                                                            background: isSelected ? '#1c1917' : 'transparent',
                                                            color: isSelected ? '#ffffff' : '#7c3aed',
                                                            border: isSelected ? 'none' : '1px solid #7c3aed',
                                                            borderRadius: '0',
                                                            padding: '6px 10px',
                                                            fontSize: '10px',
                                                            fontWeight: 800,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em'
                                                        }}
                                                    >
                                                        {isSelected ? 'REMOVE' : 'ADD'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 
                        {activeTab === 'spell' && (
                            <div className="spell-check-config" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                                <div className="pane-header-with-close" style={{ padding: '24px 24px 16px' }}>
                                    <h2 className="pane-title relative">
                                        Spell Check
                                    </h2>
                                    <button className="pane-close-btn" onClick={() => setActiveTab(null)}>
                                        <X size={20} className="top-bar-icon" />
                                    </button>
                                </div>

                                <div className="spell-check-content-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px 24px' }}>
                                    <p className="pane-subtitle" style={{ marginBottom: '32px', color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                                        We've automatically scanned your resume for spelling errors. Click any highlighted word in the preview to fix it.
                                    </p>

                                    {isDictionaryLoaded ? (
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{
                                                background: '#f5f3ff',
                                                padding: '16px',
                                                borderLeft: '4px solid #7c3aed',
                                                marginBottom: 'auto'
                                            }}>
                                                <div style={{ fontWeight: 800, fontSize: '13px', color: '#1c1917', marginBottom: '4px', fontFamily: 'Outfit' }}>Live Scanning Active</div>
                                                <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 500 }}>Dictionary loaded successfully. All sections are being monitored.</div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '32px' }}>
                                                <button
                                                    onClick={handleSaveChanges}
                                                    style={{
                                                        width: '100%',
                                                        padding: '14px',
                                                        background: '#1c1917',
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        borderRadius: '0',
                                                        fontWeight: 700,
                                                        fontSize: '13px',
                                                        cursor: 'pointer',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    Save all changes
                                                </button>
                                                <button
                                                    onClick={handleCancelChanges}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        background: 'transparent',
                                                        color: '#64748b',
                                                        border: 'none',
                                                        borderRadius: '0',
                                                        fontWeight: 600,
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        textDecoration: 'underline'
                                                    }}
                                                >
                                                    Discard draft
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#a8a29e', gap: '16px' }}>
                                            <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid #f1f5f9', borderTopColor: '#7c3aed', borderRadius: '50%' }}></div>
                                            <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'Outfit' }}>Initializing dictionary...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        */}
                    </aside>
                )}

                <main ref={previewAreaRef} className={`dashboard-preview-area theme-${canvasTheme}`}>
                    {/* 
                        Layout stable container (logical width).
                        By making THIS box exactly the width of the scaled resume, 
                        'margin: auto' works horizontally to center it on PC.
                    */}
                    <div
                        style={{
                            width: `calc(210.1mm * ${scale})`, // Extra 0.1 to prevent subpixel rounding gaps
                            margin: '0 auto',
                            position: 'relative',
                            minHeight: `calc(297mm * ${scale})`
                        }}
                    >
                        {/* 
                            Visual visual scaling (aligned to top-left of the box above).
                            Because the box above is exactly the visual width, 
                            top-left origin here results in perfect centering.
                        */}
                        <div
                            className="preview-container"
                            style={{
                                transform: `scale(${scale})`,
                                transformOrigin: 'top left',
                                width: '210mm'
                            }}
                        >
                            <div style={
                                (isMobile && (activeTab === 'templates' || activeTab === 'add' || isActionsVisible))
                                    ? { position: 'absolute', top: 0, left: '-9999px', visibility: 'hidden', pointerEvents: 'none' }
                                    : {}
                            }>
                                <ResumeRenderer
                                    data={currentData}
                                    templateId={templateId || data.templateId || 'template4'}
                                    onSectionClick={handleSectionClick}
                                    onReorder={handleReorder}
                                    scale={scale}
                                    designSettings={designSettings}
                                    isSpellCheckActive={false} // activeTab === 'spell' && isDictionaryLoaded
                                    onSpellCheckIgnore={handleSpellCheckIgnore}
                                    onSpellCheckReplace={handleSpellCheckReplace}
                                    showPageBreaks={pdfMode === 'paged'}
                                    hidePageGuides={true}
                                    debugHighlights={false}
                                    isReorderMode={isReorderMode}
                                    setIsReorderMode={setIsReorderMode}
                                />
                            </div>
                            {(isMobile && (activeTab === 'templates' || activeTab === 'add' || isActionsVisible)) && (
                                <div style={{
                                    height: '100%',
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#94a3b8',
                                    padding: '40px',
                                    textAlign: 'center'
                                }}>
                                    <div className="animate-pulse">Resume rendering paused. Close the panel to view.</div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* RIGHT SIDEBAR: ACTIONS */}
                {isActionsVisible && (
                    <aside className="dashboard-right-actions" style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                        {/* ── HEADER ── */}
                        <div style={{
                            padding: isMobile ? '20px 20px 16px' : '28px 24px 20px',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexShrink: 0,
                            background: '#ffffff'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ width: '38px', height: '38px', background: '#eff6ff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(37,99,235,0.1)' }}>
                                        <Sparkles className="w-5 h-5 text-indigo-600" />
                                    </div>
                                </div>
                                <div>
                                    <h2 style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontFamily: 'Outfit', color: '#0f172a' }}>Export Studio</h2>
                                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginTop: '1px' }}>Download & Review</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsActionsVisible(false)}
                                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}
                                title="Close Panel"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* ── SCROLLABLE CONTENT ── */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px' : '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {/* Page Layout Toggle */}
                            <label style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '14px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={pdfMode === 'paged'}
                                    onChange={(e) => setPdfMode(e.target.checked ? 'paged' : 'full')}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6', flexShrink: 0 }}
                                />
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Outfit' }}>
                                        <Monitor size={14} /> Page Layout
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '2px', fontWeight: 500 }}>Enable A4 strict pagination</div>
                                </div>
                            </label>

                            {/* Download Button */}
                            <button
                                style={{
                                    width: '100%',
                                    height: isMobile ? '58px' : '64px',
                                    background: isDownloading ? '#cbd5e1' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    border: 'none',
                                    borderRadius: '16px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: isDownloading ? 'none' : '0 8px 24px -4px rgba(16,185,129,0.35)',
                                    cursor: isDownloading ? 'wait' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    flexShrink: 0
                                }}
                                onClick={handleDownloadPDF}
                                disabled={isDownloading}
                            >
                                {isDownloading && (
                                    <div style={{ position: 'absolute', left: 0, bottom: 0, height: '3px', background: 'rgba(255,255,255,0.5)', width: '100%', animation: 'progress-loading 2s infinite' }} />
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    {isDownloading ? (
                                        <Loader2 size={18} className="animate-spin text-white/70" />
                                    ) : (
                                        <Download size={20} className="text-white" strokeWidth={3} />
                                    )}
                                    <span style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '0.06em', color: 'white', fontFamily: 'Outfit' }}>
                                        {isDownloading ? 'GENERATING PDF...' : 'DOWNLOAD RESUME'}
                                    </span>
                                </div>
                            </button>

                            {jobId && (
                                <button
                                    style={{
                                        width: '100%', height: '52px',
                                        background: '#ffffff', border: '2px solid #7c3aed', color: '#7c3aed',
                                        borderRadius: '14px', fontWeight: 800, fontSize: '13px',
                                        textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(124,58,237,0.1)', flexShrink: 0
                                    }}
                                    onClick={() => { sessionStorage.setItem('preloadedResume', JSON.stringify(data)); router.push(`/skill-gap?jobId=${jobId}&preloaded=true`); }}
                                >
                                    <ArrowRight size={16} /> Continue to Analysis
                                </button>
                            )}

                            {/* Divider */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                                <span style={{ fontSize: '10px', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Resume Health</span>
                                <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                            </div>

                            {/* ATS Deep Scan Card */}
                            <div style={{
                                borderRadius: '20px',
                                overflow: 'hidden',
                                background: 'linear-gradient(165deg, #0f172a 0%, #1e293b 100%)',
                                boxShadow: '0 16px 40px -8px rgba(0,0,0,0.35)',
                                position: 'relative',
                                flexShrink: 0
                            }}>
                                {/* Scanner beam */}
                                {isScoringScan && (
                                    <motion.div
                                        initial={{ top: '-30%' }}
                                        animate={{ top: '110%' }}
                                        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                                        style={{ position: 'absolute', left: 0, width: '100%', height: '50px', background: 'linear-gradient(180deg, transparent 0%, rgba(139,92,246,0.12) 50%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }}
                                    />
                                )}

                                <div style={{ padding: isMobile ? '20px 16px' : '24px', position: 'relative', zIndex: 3 }}>
                                    {/* ATS Label */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <div style={{ width: '3px', height: '12px', background: '#10b981', borderRadius: '2px', flexShrink: 0 }} />
                                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ATS Deep Scan</span>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {isScoringScan ? (
                                            <motion.div
                                                key="scanning"
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' }}
                                            >
                                                <Loader2 size={16} className="animate-spin text-violet-400" style={{ flexShrink: 0 }} />
                                                <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, margin: 0 }}>Checking your resume…</p>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="score"
                                                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                                style={{ display: 'flex', gap: '16px', alignItems: 'center' }}
                                            >
                                                {/* Score ring - compact */}
                                                <div style={{ position: 'relative', width: '72px', height: '72px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <svg width="72" height="72" viewBox="0 0 72 72">
                                                        <circle cx="36" cy="36" r="30" fill="none" stroke="#1e293b" strokeWidth="6" />
                                                        <motion.circle
                                                            cx="36" cy="36" r="30" fill="none" strokeWidth="6" strokeLinecap="round"
                                                            stroke={(displayScore?.score || 0) >= 75 ? '#10b981' : (displayScore?.score || 0) >= 50 ? '#f59e0b' : '#f43f5e'}
                                                            strokeDasharray="188"
                                                            initial={{ strokeDashoffset: 188 }}
                                                            animate={{ strokeDashoffset: 188 - (188 * (displayScore?.score || 0) / 100) }}
                                                            transition={{ duration: 1, ease: 'easeOut' }}
                                                            transform="rotate(-90 36 36)"
                                                        />
                                                    </svg>
                                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                        <span style={{ fontSize: '20px', fontWeight: 900, color: 'white', fontFamily: 'Outfit', lineHeight: 1 }}>{animatedScore}</span>
                                                        <span style={{ fontSize: '8px', color: '#64748b', fontWeight: 700 }}>/100</span>
                                                    </div>
                                                </div>

                                                {/* Score details */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'white', fontFamily: 'Outfit', marginBottom: '4px' }}>
                                                        {(displayScore?.score || 0) >= 75 ? '✓ Looking good!' : (displayScore?.score || 0) >= 50 ? 'Almost there' : 'Needs work'}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, lineHeight: 1.5 }}>
                                                        {(displayScore?.score || 0) >= 75 ? 'Ready to send out.' : 'A few tweaks will help.'}
                                                    </div>
                                                    {displayScore?.warnings?.length > 0 ? (
                                                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            {displayScore.warnings.slice(0, 2).map((warn, i) => (
                                                                <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                                                                    <AlertCircle size={10} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                                                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, lineHeight: 1.4 }}>{warn}</span>
                                                                </div>
                                                            ))}
                                                            {displayScore.warnings.length > 2 && (
                                                                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>+{displayScore.warnings.length - 2} more</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div style={{ marginTop: '10px', display: 'flex', gap: '6px', alignItems: 'center', background: 'rgba(16,185,129,0.1)', padding: '6px 10px', borderRadius: '8px' }}>
                                                            <CheckCircle size={12} color="#10b981" style={{ flexShrink: 0 }} />
                                                            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>No issues — good to go!</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Back to Editor */}
                            <button
                                onClick={onBack}
                                style={{
                                    width: '100%', padding: '14px',
                                    background: '#f8fafc', color: '#475569',
                                    fontWeight: 700, fontSize: '12px',
                                    border: '1px solid #e2e8f0', borderRadius: '12px',
                                    cursor: 'pointer', textTransform: 'uppercase',
                                    letterSpacing: '0.05em', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    transition: 'all 0.2s', flexShrink: 0
                                }}
                            >
                                <Edit3 size={14} /> Back to Editor
                            </button>

                            {/* Bottom safe area padding for mobile */}
                            {isMobile && <div style={{ height: '8px', flexShrink: 0 }} />}
                        </div>
                    </aside>
                )
                }
            </div >
            {/* AHA MOMENT OVERLAY */}
            <AnimatePresence>
                {showAha && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-stone-900/40 backdrop-blur-xl"
                        style={{ padding: isMobile ? '0' : '24px' }}
                        onClick={() => setShowAha(false)}
                    >
                        <motion.div
                            initial={{ scale: isMobile ? 1 : 0.8, opacity: 0, y: isMobile ? 80 : 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: isMobile ? 1 : 0.8, opacity: 0, y: isMobile ? 80 : 40 }}
                            transition={{ type: "spring", damping: 25, stiffness: 400 }}
                            style={{
                                background: '#ffffff',
                                borderRadius: isMobile ? '32px 32px 0 0' : '32px',
                                boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
                                maxWidth: isMobile ? '100%' : '520px',
                                width: '100%',
                                overflow: 'hidden',
                                position: 'relative',
                                border: '1px solid #f1f5f9',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div style={{ background: '#0f172a', padding: isMobile ? '40px 24px 32px' : '56px 40px 44px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(124,58,237,0.15)', borderRadius: '50%', filter: 'blur(60px)' }} />
                                <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'rgba(16,185,129,0.08)', borderRadius: '50%', filter: 'blur(80px)' }} />
                                <motion.div
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.3, type: "spring", damping: 12 }}
                                    style={{ width: isMobile ? '72px' : '88px', height: isMobile ? '72px' : '88px', background: '#2563eb', borderRadius: '4px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.2)', position: 'relative' }}
                                >
                                    <CheckCircle size={isMobile ? 36 : 44} style={{ color: 'white' }} strokeWidth={2.5} />
                                </motion.div>
                                <h2 style={{ fontSize: isMobile ? '32px' : '44px', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', textTransform: 'uppercase', margin: '0 0 8px', fontFamily: 'Outfit' }}>
                                    {jobId ? 'Well Done!' : "It's All Set!"}
                                </h2>
                                <p style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 12px' }}>
                                    {jobId ? 'Official Profile Finalized' : 'Professional Document Exported'}
                                </p>
                                <div style={{ height: '3px', width: '40px', background: '#7c3aed', margin: '0 auto', borderRadius: '2px' }} />
                            </div>

                            {/* Cards */}
                            <div style={{ padding: isMobile ? '20px 20px 16px' : '32px 32px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                                        style={{ flex: 1, background: '#f0fdf4', borderRadius: '16px', padding: isMobile ? '14px' : '20px', border: '1px solid #dcfce7' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', flexShrink: 0 }}>
                                                <Target size={16} color="#10b981" />
                                            </div>
                                            <span style={{ fontSize: '11px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'Outfit' }}>ATS-Ready</span>
                                        </div>
                                        <p style={{ fontSize: '11px', color: '#475569', fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
                                            Hidden metadata <span style={{ color: '#059669', fontWeight: 700 }}>automatically optimized</span> for recruiters.
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
                                        style={{ flex: 1, background: '#f5f3ff', borderRadius: '16px', padding: isMobile ? '14px' : '20px', border: '1px solid #ede9fe' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', flexShrink: 0 }}>
                                                <Zap size={16} color="#7c3aed" />
                                            </div>
                                            <span style={{ fontSize: '11px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'Outfit' }}>{jobId ? 'Assessment' : 'Next Move'}</span>
                                        </div>
                                        <p style={{ fontSize: '11px', color: '#475569', fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
                                            {jobId ? 'Registered. Now analyze your alignment with the role.' : 'Check your Growth Plan for skill mastery.'}
                                        </p>
                                    </motion.div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                                    {jobId ? (
                                        <button
                                            style={{ width: '100%', height: isMobile ? '52px' : '56px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                            onClick={() => { sessionStorage.setItem('preloadedResume', JSON.stringify(data)); router.push(`/skill-gap?jobId=${jobId}&preloaded=true`); }}
                                        >
                                            Next: Skill Prep <ArrowRight size={18} />
                                        </button>
                                    ) : (
                                        <button
                                            style={{ width: '100%', height: isMobile ? '52px' : '56px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}
                                            onClick={() => setShowAha(false)}
                                        >
                                            Return to Dashboard
                                        </button>
                                    )}
                                    <button
                                        style={{ width: '100%', height: isMobile ? '48px' : '52px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '14px', fontWeight: 700, fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }}
                                        onClick={() => window.location.href = '/resumy/dashboard'}
                                    >
                                        View All Projects
                                    </button>
                                </div>

                                {/* Footer */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid #f1f5f9', marginTop: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                                        <span style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Saved to Cloud</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {[Globe, Share2].map((Icon, i) => (
                                            <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                <Icon size={14} color="#64748b" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                style={{ position: 'absolute', top: isMobile ? '16px' : '24px', right: isMobile ? '16px' : '24px', width: '36px', height: '36px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
                                onClick={() => setShowAha(false)}
                            >
                                <X size={18} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {
                isGalleryOpen && (
                    <PremiumTemplateSelection
                        userId={user?.id || userId}
                        data={data}
                        onUpdateData={(newData) => setData(prev => ({ ...prev, ...newData }))}
                        onComplete={(id) => {
                            handleTemplateClick(id);
                            setIsGalleryOpen(false);
                        }}
                        onBack={() => setIsGalleryOpen(false)}
                        backLabel="Back to Dashboard"
                    />
                )
            }

            {/* Custom Navigation Confirmation Modal */}
            <AnimatePresence>
                {navTarget && (
                    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
                            onClick={() => setNavTarget(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white p-8 w-full max-w-md relative z-10 shadow-2xl border border-stone-100"
                        >
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 flex items-center justify-center mb-6">
                                <LogOut size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-stone-900 tracking-tighter mb-2">Leave Editor?</h3>
                            <p className="text-stone-500 font-medium text-sm mb-8 leading-relaxed">
                                Are you sure you want to {navTarget === '/' ? 'leave the app' : navTarget === '/resumy/resume-creator' ? 'go back to Onboarding' : 'return to your Dashboard'}? <strong>All your progress is automatically saved to your drafts.</strong>
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        window.location.href = navTarget === '/' ? '/resumy/' : navTarget;
                                    }}
                                    className="w-full py-4 bg-stone-900 text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-colors"
                                >
                                    Yes, Leave the Editor
                                </button>
                                <button
                                    onClick={() => setNavTarget(null)}
                                    className="w-full py-4 bg-stone-50 text-stone-900 font-black text-xs uppercase tracking-widest hover:bg-stone-100 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* FINALIZE DASHBOARD ONBOARDING */}
            {builder_resume_id && (
                <OnboardingGuide
                    isMobile={isMobile}
                    resumeId={builder_resume_id}
                    scene="finalize"
                    metadata={data.onboarding_metadata}
                    onUpdateMetadata={(newMetadata) => {
                        setData(prev => ({
                            ...prev,
                            onboarding_metadata: {
                                ...(prev.onboarding_metadata || {}),
                                ...newMetadata
                            }
                        }));
                    }}
                    onStepChange={(step) => {
                        // On mobile, don't open panels as they obscure the target nav buttons
                        if (isMobile) return;

                        if (step.id === 'templates') { setActiveTab('templates'); }
                        if (step.id === 'design') { setActiveTab('design'); }
                        if (step.id === 'add-section') { setActiveTab('add'); }
                        if (step.id === 'edit' || step.id === 'reorder') { setActiveTab('templates'); }
                        if (step.id === 'export') { setIsActionsVisible(true); }
                    }}
                    onComplete={() => {
                        // Keep everything open, just ensure a default tab is selected if needed
                        if (!isMobile) {
                            setActiveTab('templates');
                        }
                    }}
                />
            )}
            {/* FEEDBACK MODAL - REDESIGNED FOR MOBILE BOTTOM SHEET */}
            <AnimatePresence>
                {showFeedbackModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-md p-0 sm:p-4"
                        onClick={(e) => {
                            // Disabled backdrop close to force feedback
                            e.stopPropagation();
                        }}
                    >
                        <motion.div
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh] relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Mobile handle */}
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2 sm:hidden" />

                            <div className="p-5 sm:p-10 text-center">
                                <div className="w-12 h-12 sm:w-20 sm:h-20 bg-indigo-50 rounded flex items-center justify-center mx-auto mb-4 sm:mb-6 text-indigo-600 relative group">
                                    <div className="absolute inset-0 bg-indigo-100 rounded scale-90 group-hover:scale-100 transition-transform opacity-0 group-hover:opacity-100" />
                                    <Star className="w-6 h-6 sm:w-10 sm:h-10 relative z-10" />
                                </div>

                                <h3 className="text-xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-3 leading-tight">
                                    How's your <span className="text-indigo-600 sm:block">Resume Creator?</span>
                                </h3>
                                <p className="text-[11px] sm:text-base text-slate-500 font-medium mb-5 sm:mb-8 px-4 sm:px-0">Your feedback helps us build a better tool.</p>

                                <FeedbackForm
                                    onSubmit={(feedback) => handleDownloadPDF(feedback)}
                                    onClose={() => {
                                        setHasProvidedFeedback(true);
                                        handleDownloadPDF();
                                    }}
                                    isDownloading={isDownloading}
                                    isMobile={isMobile}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}

// Sub-component for the feedback form to keep things clean
function FeedbackForm({ onSubmit, onClose, isDownloading, isMobile }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);

    const tags = ["Easy to use", "Great designs", "AI was helpful", "Fast export", "Clean UI"];

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (rating === 0) return;

        const finalComment = [
            comment,
            selectedTags.length > 0 ? `Tags: ${selectedTags.join(", ")}` : ""
        ].filter(Boolean).join(" | ");

        onSubmit({ rating, comment: finalComment });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-8">
            {/* Rating Stars - Larger for touch but compact container */}
            <div className="flex justify-center gap-2 sm:gap-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className="transition-all active:scale-90 outline-none p-1"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                    >
                        <Sparkles
                            size={isMobile ? 40 : 48}
                            fill={(hover || rating) >= star ? "#fbbf24" : "none"}
                            className={`${(hover || rating) >= star ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "text-slate-200"} transition-all duration-300`}
                            strokeWidth={1.2}
                        />
                    </button>
                ))}
            </div>

            {/* Quick Tags - Modern Pills (More compact on mobile) */}
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-3 px-1">
                {tags.map(tag => (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[9px] sm:text-[11px] font-black uppercase tracking-[0.05em] sm:tracking-[0.1em] transition-all border-2 ${selectedTags.includes(tag)
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                            }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Textarea - Shorter on mobile */}
            <div className="relative">
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Anything else we'd love to know?"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-3 sm:p-5 text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none h-20 sm:h-32 text-slate-700 placeholder:text-slate-400"
                />
            </div>

            {/* Buttons - Premium Action Bar */}
            <div className="flex flex-col gap-3 pt-1">
                <button
                    type="submit"
                    disabled={rating === 0 || isDownloading}
                    className={`w-full py-4 rounded font-bold text-white text-sm flex items-center justify-center gap-2 transition-all ${rating === 0
                        ? "bg-slate-300 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                        }`}
                >
                    {isDownloading ? (
                        <>
                            <RefreshCcw size={16} className="animate-spin" />
                            Prepping PDF...
                        </>
                    ) : (
                        <>
                            {rating > 0 ? 'Send & Download' : 'Pick a rating to download'}
                            <Download size={16} strokeWidth={3} />
                        </>
                    )}
                </button>

                {/* 
                <button
                    type="button"
                    onClick={() => {
                        setRating(0);
                        onClose();
                    }}
                    className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-slate-800 transition-all py-2"
                >
                    Maybe later
                </button>
                */}
            </div>
        </form>
    );
}
