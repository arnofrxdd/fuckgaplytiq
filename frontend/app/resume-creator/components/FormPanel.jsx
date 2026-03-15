"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ResumyLogo from './Logo';
import Link from "next/link";
import Image from "next/image";
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import {
    Plus, Trash2, Camera, User, Mail, Phone, MapPin,
    Globe, Linkedin, Github, ChevronDown, Check, Save,
    Layout, FileText, Download, Briefcase, GraduationCap,
    Wand2, Search, Trash, Eye, Settings, LogOut, ChevronRight,
    Zap, Star, Award, MessageSquare, Menu, X, ArrowLeft, ArrowRight,
    Layers, Grid, List, Type, Palette, MoreHorizontal, Shield, Clock,
    AlertCircle, Cpu, UploadCloud, Maximize2, RefreshCw, Info, Users, Heart,
    BarChart2, Sparkles, ChevronLeft, Loader2, Cloud, CheckCircle2, RefreshCcw, ShieldCheck, Navigation,
    Square, Circle, Hexagon, Diamond
} from 'lucide-react';
import { supabaseClient } from "@/lib/supabaseClient";
import { templatesConfig } from '../templates/TemplateManager';
import ResumeRenderer from '../templates/ResumeRenderer';
import Education from './Education';
import Experience from './Experience';
import Skills from './Skills';
import Summary from './Summary';
import ExtraSections from './ExtraSections';
import PersonalDetails from './PersonalDetails';
import Websites from './Websites';
import Certifications from './Certifications';
import Software from './Software';
import Accomplishments from './Accomplishments';
import AdditionalInfo from './AdditionalInfo';
import Affiliations from './Affiliations';
import Interests from './Interests';
import Languages from './Languages';
import Projects from './Projects';
import KeyAchievements from './KeyAchievements';
import CustomSection from './CustomSection';
import { motion, AnimatePresence } from "framer-motion";
import { useAnalytics } from "@/lib/analytics";
import { CircleDoodle, UnderlineDoodle, SparkleDoodle, ScribbleDoodle, StarDoodle } from '@/components/landing-redesign/DoodleAnimations';
import SuccessStep from './SuccessStep';
import Finalize from './Finalize';
import FunLoader from './FunLoader';
import PremiumTemplateSelection from "./PremiumTemplateSelection";
import DraftExplorer from "./DraftExplorer";
import DraftSwitchLoader from "./DraftSwitchLoader";
import OnboardingGuide from "./OnboardingGuide";
import {
    LOCATION_DATA, TITLE_SUGGESTIONS, toTitleCase,
    auditEmail, suggestEmail, formatSocialLink, reverseGeocode, getAIHeaderAdvice,
    fetchAllCountries, fetchStatesForCountry, fetchCitiesForState, findCountryByPhone
} from "./HeaderIntelligence";
import "./form.css";
import "./form-header.css";



// Shared client used from @/lib/supabaseClient

// --- VALIDATED INPUT COMPONENT (AI ENHANCED) ---
const ValidatedInput = ({ label, value = "", onChange, onBlur, onFocus, placeholder = "", type = "text", error, required, aiSuggestion, isLoading, compactAi }) => {
    const validate = (val) => {
        if (!val || val.toString().trim().length === 0) return false;
        if (type === "email" || label.toLowerCase().includes("email")) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(val);
        }
        if (type === "tel" || label.toLowerCase().includes("phone")) {
            return val.toString().trim().length >= 5 && /[\d]/.test(val);
        }
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes("linkedin") || lowerLabel.includes("github") || lowerLabel.includes("website")) {
            const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            return urlRegex.test(val);
        }
        return true;
    };

    const strValue = value?.toString() || "";
    const isValid = validate(strValue) && !error;
    const hasError = !!error;

    const aiStr = aiSuggestion?.toString() || "";
    // A suggestion is active ONLY if it's not already typed (fully or as a prefix) 
    // AND it's not exactly what's already in the box.
    const hasActiveAISuggestion = aiStr &&
        strValue.toLowerCase() !== aiStr.toLowerCase() &&
        !strValue.toLowerCase().startsWith(aiStr.toLowerCase());

    const showGhost = hasActiveAISuggestion && aiStr.toLowerCase().startsWith(strValue.toLowerCase());

    return (
        <div className="zety-input-wrap group" style={{ position: 'relative' }}>
            <div className="flex items-center justify-between mb-1.5 min-h-[16px] gap-1.5 overflow-hidden">
                <label className="label m-0 text-stone-900 truncate flex-1">{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
                {hasActiveAISuggestion && (
                    <div className="flex items-center gap-1.5 animate-pulse bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100 shadow-sm shrink-0 max-w-[50%]">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-600 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                        {!compactAi && <span className="text-[9px] font-black text-violet-600 uppercase tracking-widest truncate">AI SUGGESTED</span>}
                    </div>
                )}
            </div>
            <div className="zety-relative-container" style={{ position: 'relative' }}>
                <input
                    className={`zety-input transition-all duration-300 relative z-10 ${hasActiveAISuggestion ? 'ai-glow-border' : ''}`}
                    type={type}
                    value={strValue}
                    onChange={onChange}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    placeholder={hasActiveAISuggestion ? "" : placeholder}
                    style={{
                        ...(error ? { borderColor: '#ef4444', backgroundColor: '#fff5f5' } : {}),
                        paddingRight: '64px',
                        background: 'transparent !important',
                        fontFamily: "'Inter', sans-serif"
                    }}
                />

                {showGhost && (
                    <div
                        className="absolute left-[17px] top-1/2 -translate-y-1/2 pointer-events-none z-20 whitespace-pre overflow-hidden pr-20"
                        style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px' }}
                    >
                        <span className="opacity-0">{strValue}</span>
                        <span className="text-violet-500/50 font-medium">{aiStr.substring(strValue.length)}</span>
                    </div>
                )}

                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-30 pointer-events-auto">
                    {hasActiveAISuggestion && (
                        <button
                            onMouseDown={(e) => {
                                e.preventDefault();
                                onChange({ target: { value: aiStr } });
                            }}
                            className="bg-gradient-to-br from-violet-600 to-pink-500 text-white p-1.5 rounded-lg shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer border-0 ring-4 ring-white flex items-center justify-center"
                            title="Accept AI"
                        >
                            <Sparkles size={13} fill="currentColor" />
                        </button>
                    )}
                    {isValid && !hasActiveAISuggestion && strValue.trim().length > 0 && (
                        <div className="text-emerald-500 bg-emerald-50 p-1 rounded-full">
                            <Check size={14} strokeWidth={3} />
                        </div>
                    )}
                    {hasError && (
                        <div className="text-rose-500 bg-rose-50 p-1 rounded-full animate-shake">
                            <AlertCircle size={14} strokeWidth={3} />
                        </div>
                    )}
                </div>
            </div>
            {error && <p className="text-rose-500 text-[10px] mt-1.5 font-bold input-error-message">{error}</p>}
        </div>
    );
};

const scrollToFirstError = () => {
    // Small delay to ensure errors are rendered in the DOM
    setTimeout(() => {
        const firstError = document.querySelector('.input-error-message, .validation-error, [data-error="true"], .input-error-text');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
};

const normalizeData = (d) => {
    if (!d) return d;
    const arrayFields = [
        'experience', 'education', 'skills', 'projects', 'languages',
        'certifications', 'keyAchievements', 'accomplishments', 'software',
        'interests', 'websites', 'strengths', 'additionalSkills', 'affiliations'
    ];
    const normalized = { ...d };
    arrayFields.forEach(field => {
        if (!Array.isArray(normalized[field])) {
            normalized[field] = [];
        }
    });
    if (!Array.isArray(normalized.visitedSteps)) {
        normalized.visitedSteps = [1];
    }
    return normalized;
};

export default function FormPanel({ data, setData, templateId, onChangeTemplate, resume_id: propResumeId, builder_resume_id, jobId, title: propTitle, onSwitchProject, onRenameProject, onIdCreated, onSyncUrl }) {
    const { trackEvent } = useAnalytics();
    const [step, setStep] = useState(1);

    // 1. Centralized Source of Truth for Extra Sections
    // This ensures that Finalize.jsx and ExtraSections.jsx always agree.
    useEffect(() => {
        if (!data.selectedExtraSections || Object.keys(data.selectedExtraSections).length === 0) {
            const autoDetected = {};
            if (data.languages?.length > 0) autoDetected.languages = true;
            if (data.certifications?.length > 0) autoDetected.certifications = true;
            if (data.websites?.length > 0 || data.personal?.linkedin || data.personal?.github || data.personal?.website) {
                autoDetected.websites = true;
            }
            if (data.personal && (data.personal.gender || data.personal.dob || data.personal.nationality || data.personal.maritalStatus || data.personal.visaStatus || data.personal.passport || data.personal.religion || data.personal.otherPersonal)) {
                autoDetected.personalDetails = true;
            }
            if (data.customSection?.isVisible) autoDetected.custom = true;

            if (Object.keys(autoDetected).length > 0) {
                console.log("[FormPanel] Auto-initialized selectedExtraSections:", autoDetected);
                setData(prev => ({
                    ...prev,
                    selectedExtraSections: autoDetected
                }));
            }
        }
    }, [data.personal, data.languages, data.certifications, data.websites, data.projects, data.customSection]);

    const [isQuickEdit, setIsQuickEdit] = useState(false);
    const [pdfMode, setPdfMode] = useState('paged'); // 'paged' or 'full'
    const fileInputRef = useRef(null);
    const [expandedFields, setExpandedFields] = useState({});

    // Supabase State
    const [resumeId, setResumeId] = useState(builder_resume_id || null);
    const [backendResumeId, setBackendResumeId] = useState(propResumeId || null);
    const [isLoadedFromDB, setIsLoadedFromDB] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true); // Prevents auto-save on mount
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [navTarget, setNavTarget] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null); // { message: string, type: 'error' | 'success' | 'info' }

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
        // Auto-hide after 4 seconds
        setTimeout(() => setToast(null), 4000);
    };

    // Track changes for exit warning
    useEffect(() => {
        if (!isInitialLoad) {
            setHasUnsavedChanges(true);
        }
    }, [data, isInitialLoad]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            // Only show legacy browser warning if we are NOT already showing
            // our custom inbuilt "Leave Editor" message (navTarget).
            if (hasUnsavedChanges && !navTarget) {
                e.preventDefault();
                e.returnValue = ''; // Standard way to show confirmation
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges, navTarget]);
    const [hasSeenSuccess, setHasSeenSuccess] = useState(false);
    const isInitializing = useRef(false); // Prevents double-initialization in strict mode
    const lastInitializedId = useRef(null); // Tracks which ID was last successfully loaded
    const [drafts, setDrafts] = useState([]);
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
    const [editingDraftId, setEditingDraftId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [isSwitching, setIsSwitching] = useState(false);
    const [isDraftExplorerOpen, setIsDraftExplorerOpen] = useState(false);
    const [userId, setUserId] = useState(null);
    const [headerErrors, setHeaderErrors] = useState({});
    const [isExplorerLoading, setIsExplorerLoading] = useState(false);
    
    const [tempPhoto, setTempPhoto] = useState(null);
    const [isCropping, setIsCropping] = useState(false);
    const [pixelCrop, setPixelCrop] = useState(null);


    // Smart Intelligence State
    const [suggestedTitles, setSuggestedTitles] = useState([]);
    const [emailTip, setEmailTip] = useState(null);
    const [socialStates, setSocialStates] = useState({});
    const [countriesList, setCountriesList] = useState(Object.keys(LOCATION_DATA));
    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);
    const [locationSuggestions, setLocationSuggestions] = useState({ country: null, state: null, city: null, phoneCode: null, zipCode: null });
    const [isAiThinking, setIsAiThinking] = useState({ title: false, phone: false, city: false, state: false, country: false, zipCode: false });

    // Mobile Responsive State
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // FIX: iOS Keyboard Black Cutoff Issue
    // When an input is blurred and no other input is focused, reset window scroll
    // to prevent the browser from leaving a gap at the bottom (common on mobile Safari).
    useEffect(() => {
        if (!isMobile) return;

        const handleFocusOut = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                // Check if focus is moving to another input immediately
                setTimeout(() => {
                    const activeElement = document.activeElement;
                    const isStillEditing = activeElement && (
                        activeElement.tagName === 'INPUT' ||
                        activeElement.tagName === 'TEXTAREA' ||
                        activeElement.isContentEditable ||
                        activeElement.closest('.rsw-editor')
                    );

                    if (!isStillEditing) {
                        // Reset the window scroll to fix mobile layout shifts
                        window.scrollTo(0, 0);

                        // Force a layout reflow on the body
                        document.body.style.height = '100.1%';
                        setTimeout(() => { document.body.style.height = '100%'; }, 50);
                    }
                }, 100);
            }
        };

        window.addEventListener('focusout', handleFocusOut);
        return () => window.removeEventListener('focusout', handleFocusOut);
    }, [isMobile]);
    useEffect(() => {
        const loadCountries = async () => {
            const list = await fetchAllCountries();
            if (list.length > 0) setCountriesList(list);
        };
        loadCountries();
    }, []);

    // Load states when country changes
    useEffect(() => {
        const loadStates = async () => {
            if (data.personal?.country) {
                const states = await fetchStatesForCountry(data.personal.country);
                setStatesList(states);
            }
        };
        loadStates();
    }, [data.personal?.country]);

    // Load cities when state changes
    useEffect(() => {
        const loadCities = async () => {
            if (data.personal?.country && data.personal?.state) {
                const cities = await fetchCitiesForState(data.personal.country, data.personal.state);
                setCitiesList(cities);
            } else {
                setCitiesList([]);
            }
        };
        loadCities();
    }, [data.personal?.country, data.personal?.state]);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (user) setUserId(user.id);
        };
        fetchUser();
    }, []);



    useEffect(() => {
        if (propResumeId !== backendResumeId) {
            setBackendResumeId(propResumeId || null);
        }
    }, [propResumeId]);

    const toggleField = (field) => {
        setExpandedFields(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const removeField = (field) => {
        setExpandedFields(prev => ({ ...prev, [field]: false }));
        setData(prev => ({
            ...prev,
            personal: {
                ...(prev.personal || {}),
                [field]: ""
            }
        }));
    };

    const safeTemplateId = templateId || (templatesConfig[0] ? templatesConfig[0].id : "creative-marketing");

    useEffect(() => {
        const initResume = async () => {
            // Detect if we are switching to a DIFFERENT project than what's currently loaded
            const hasIdChanged = builder_resume_id && builder_resume_id !== lastInitializedId.current;

            // Guard against concurrent initialization
            if (isInitializing.current) return;
            // Only skip if already loaded AND we aren't switching to a new ID
            if (isLoadedFromDB && !hasIdChanged) return;

            isInitializing.current = true;
            if (hasIdChanged) {
                setIsSwitching(true);
                setIsLoadedFromDB(false);
                setIsInitialLoad(true);
            }

            const { data: userData } = await supabaseClient.auth.getUser();
            if (!userData?.user) {
                isInitializing.current = false;
                setIsSwitching(false);
                return;
            }

            // 1. Try to load Existing Draft (Source of Truth)
            if (builder_resume_id) {
                const { data: existing, error } = await supabaseClient
                    .from('builder_resumes')
                    .select('*')
                    .eq('id', builder_resume_id)
                    .single();

                if (existing && !error) {
                    setResumeId(existing.id);
                    if (onIdCreated) onIdCreated(existing.id);

                    // Load the draft's data
                    // We prioritize draft data but keep the resume_id link if it exists
                    const normalized = normalizeData({
                        ...data,
                        ...existing.data,
                        onboarding_metadata: existing.onboarding_metadata || (data.onboarding_metadata || {}),
                        designSettings: existing.design_settings || data.designSettings
                    });

                    setData(normalized);

                    if (existing.template_id) {
                        const isValid = templatesConfig.some(t => t.id === existing.template_id);
                        if (isValid) onChangeTemplate(existing.template_id);
                    }

                    // Hydrate Step from URL or DB
                    if (typeof window !== 'undefined') {
                        const params = new URLSearchParams(window.location.search);
                        const urlStep = parseInt(params.get('step'));
                        const urlView = params.get('view');

                        if (urlView === 'finalize') {
                            setStep(finalizeStepId);
                        } else if (!isNaN(urlStep) && urlStep > 0 && urlStep <= finalizeStepId) {
                            setStep(urlStep);
                        } else if (existing.last_step_index) {
                            if (existing.last_step_index === 7) setStep(finalizeStepId);
                            else setStep(existing.last_step_index);
                        }
                    }

                    setIsLoadedFromDB(true);
                    setTimeout(() => {
                        setIsInitialLoad(false);
                        setIsSwitching(false);
                        lastInitializedId.current = existing.id;
                    }, 800);
                    isInitializing.current = false;
                    return;
                } else if (error) {
                    console.error("[FormPanel] Error loading resume ID from URL:", error);
                    showToast("Resume not found or access denied.", "error");
                    setTimeout(() => {
                        window.location.href = '/resumy/resume-creator?view=onboarding&mode=welcome';
                    }, 2000);
                    return;
                }
            }


            // --- STRICT DRAFT LIMIT CHECK BEFORE ANY INSERTIONS ---
            if (!builder_resume_id) {
                const { count, error: countError } = await supabaseClient
                    .from('builder_resumes')
                    .select('*', { count: 'exact', head: true })
                    .eq('profile_id', userData.user.id);

                if (!countError && count >= 3) {
                    showToast("You have reached the maximum limit of 3 drafts. Please delete an existing draft to create a new one.");
                    setIsSwitching(false);
                    isInitializing.current = false;
                    window.location.href = '/resumy/resume-creator'; // Prevent form render, send back to hub
                    return;
                }
            }

            // 2. Load from BACKEND 'resumes' table (Import Flow)
            // This runs ONLY IF we don't have a builder_resume_id or the draft wasn't found
            if (backendResumeId) {
                const { data: backendResume, error: backendError } = await supabaseClient
                    .from('resumes')
                    .select('*')
                    .eq('id', backendResumeId)
                    .single();

                if (backendResume && !backendError) {
                    const isLocalDataEmpty = !data?.personal?.name && (!data?.experience || data?.experience.length === 0);
                    if ((isLocalDataEmpty || hasIdChanged) && backendResume.parsed_json) {
                        const normalized = normalizeData({ ...data, ...backendResume.parsed_json });
                        setData(normalized);
                        if (backendResume.template) {
                            const isValid = templatesConfig.some(t => t.id === backendResume.template);
                            if (isValid) onChangeTemplate(backendResume.template);
                        }
                    }

                    // Create a NEW draft
                    const { data: newResume, error: insertError } = await supabaseClient
                        .from('builder_resumes')
                        .insert({
                            profile_id: userData.user.id,
                            template_id: safeTemplateId || (templatesConfig.some(t => t.id === backendResume.template) ? backendResume.template : (templatesConfig[0]?.id || "creative-marketing")),
                            title: propTitle || backendResume.title || "AI Generated Resume",
                            data: data,
                            design_settings: data.designSettings || {}
                        })
                        .select()
                        .single();

                    if (newResume && !insertError) {
                        setResumeId(newResume.id);
                        if (onIdCreated) onIdCreated(newResume.id);
                        setIsLoadedFromDB(true);
                        setTimeout(() => {
                            setIsInitialLoad(false);
                            setIsSwitching(false);
                            lastInitializedId.current = newResume.id;
                        }, 800);
                        isInitializing.current = false;
                        return;
                    }
                }
            }

            // 3. CREATE NEW FRESH Draft
            if (!builder_resume_id && !backendResumeId) {
                const { data: newResume, error: insertError } = await supabaseClient
                    .from('builder_resumes')
                    .insert({
                        profile_id: userData.user.id,
                        template_id: safeTemplateId,
                        title: propTitle || "Untitled Resume",
                        design_settings: data.designSettings || {},
                        data: data || {}
                    })
                    .select()
                    .single();

                if (!insertError && newResume) {
                    setResumeId(newResume.id);
                    if (onIdCreated) onIdCreated(newResume.id);
                    setIsLoadedFromDB(true);
                    setTimeout(() => {
                        setIsInitialLoad(false);
                        setIsSwitching(false);
                        lastInitializedId.current = newResume.id;
                    }, 800);
                } else {
                    setIsSwitching(false);
                }
            }

            isInitializing.current = false;
        };

        initResume();
    }, [safeTemplateId, backendResumeId, propResumeId, builder_resume_id]);

    // Helper to map current internal step to a stable 1-7 DB index
    const getDBStepIndex = (currentStep) => {
        if (currentStep < 6) return currentStep; // 1-5: Header, Edu, Exp, Skills, Summary
        if (currentStep === finalizeStepId) return 7; // Finalize
        return 6; // Anything else (Hub or sub-sections) maps to 6
    };

    // Auto Save (Debounced)
    const saveTimeout = useRef(null);
    useEffect(() => {
        // Prevent saving immediately after load
        if (!isLoadedFromDB || isInitialLoad) return;

        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(async () => {
            setIsSaving(true);
            try {
                // Update builder_resumes
                if (resumeId) {
                    // Simplify data: Exclude metadata already stored in columns
                    const { title, template, resume_id, builder_resume_id, last_step_index, designSettings, ...cleanData } = data;

                    await supabaseClient
                        .from('builder_resumes')
                        .update({
                            data: cleanData,
                            onboarding_metadata: data.onboarding_metadata || {},
                            design_settings: designSettings || data.designSettings || {},
                            template_id: safeTemplateId,
                            title: propTitle || "Untitled Resume",
                            last_step_index: getDBStepIndex(step) // Save normalized 1-7 step
                        })
                        .eq('id', resumeId);
                }

                // Update backend resumes table if linked
                if (backendResumeId) {
                    await supabaseClient
                        .from('resumes')
                        .update({
                            parsed_json: data,
                            template: safeTemplateId,
                            updated_at: new Date()
                        })
                        .eq('id', backendResumeId);
                }

                // Sync to Career DNA
                if (userId) {
                    const { title, template, resume_id, builder_resume_id, last_step_index, designSettings, onboarding_metadata, ...cleanForDna } = data;
                    await supabaseClient
                        .from('profiles')
                        .update({
                            career_dna: JSON.stringify(cleanForDna),
                            dna_last_synced: new Date().toISOString()
                        })
                        .eq('id', userId);
                }

                // REFRESH DRAFT LIST in background (auto-save)
                await fetchDrafts();
            } finally {
                // Short delay to let user see "Saved" state
                setTimeout(() => setIsSaving(false), 800);
            }
        }, 1500);

        return () => {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
        };
    }, [data, safeTemplateId, isLoadedFromDB, isInitialLoad, resumeId, backendResumeId, propTitle, step, userId]);

    const handleSaveDraft = async () => {
        if (!isLoadedFromDB || !resumeId) return;

        const { title: dTitle, template, resume_id: drId, builder_resume_id: bId, last_step_index, designSettings, ...cleanData } = data;

        await supabaseClient
            .from('builder_resumes')
            .update({
                data: cleanData,
                onboarding_metadata: data.onboarding_metadata || {},
                design_settings: designSettings || data.designSettings || {},
                template_id: safeTemplateId,
                title: propTitle || "Untitled Resume",
                last_step_index: getDBStepIndex(step)
            })
            .eq('id', resumeId);

        if (backendResumeId) {
            await supabaseClient
                .from('resumes')
                .update({
                    parsed_json: data,
                    template: safeTemplateId,
                    updated_at: new Date()
                })
                .eq('id', backendResumeId);
        }

        if (userId) {
            const { title: _t, template: _tmpl, resume_id: _rId, builder_resume_id: _bId, last_step_index: _lsi, designSettings: _ds, onboarding_metadata: _om, ...cleanForDna } = data;
            await supabaseClient
                .from('profiles')
                .update({
                    career_dna: JSON.stringify(cleanForDna),
                    dna_last_synced: new Date().toISOString()
                })
                .eq('id', userId);
        }

        // REFRESH DRAFT LIST to ensure Explorer has latest data
        await fetchDrafts();
    };

    // Fetch drafts
    const fetchDrafts = async () => {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;
        const { data: list } = await supabaseClient
            .from('builder_resumes')
            .select('*')
            .eq('profile_id', user.id)
            .order('updated_at', { ascending: false });
        if (list) setDrafts(list);
    };

    useEffect(() => {
        fetchDrafts();
    }, [resumeId]);

    const handleRenameDraft = async (id, newTitle) => {
        if (!newTitle.trim()) return;
        const { error } = await supabaseClient.from('builder_resumes').update({ title: newTitle }).eq('id', id);
        if (!error) {
            if (id === resumeId) {
                onRenameProject(id, newTitle);
            }
            await fetchDrafts(); // Refresh to ensure all metadata is sync
        }
        setEditingDraftId(null);
    };

    const handleDeleteDraft = async (id) => {
        const { error } = await supabaseClient.from('builder_resumes').delete().eq('id', id);
        if (!error) {
            setDrafts(prev => prev.filter(d => d.id !== id));
            if (id === resumeId) window.location.href = '/resumy/resume-creator'; // Simple way to handle deleted active draft
            await fetchDrafts(); // Refresh sync
        }
    };

    const renderDraftSwitcher = () => (
        <div className="draft-switcher-sidebar">
            <button
                className={`draft-explorer-compact-btn ${isExplorerLoading ? 'loading' : ''}`}
                onClick={async () => {
                    setIsExplorerLoading(true);
                    try {
                        await handleSaveDraft();
                        await fetchDrafts();
                        if (isMobile) setIsMobileMenuOpen(false);
                        setIsDraftExplorerOpen(true);
                    } finally {
                        setIsExplorerLoading(false);
                    }
                }}
                disabled={isExplorerLoading}
            >
                <div className="draft-indicator-container">
                    {isExplorerLoading ? (
                        <Loader2 size={14} className="animate-spin text-blue-400" />
                    ) : isSaving ? (
                        <RefreshCcw size={14} className="animate-spin text-stone-400" />
                    ) : (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                    )}
                </div>
                <div className="draft-info-content">
                    <span className="draft-label-mini">
                        {isExplorerLoading ? 'Loading...' : isSaving ? 'Saving Changes' : 'Current Project'}
                    </span>
                    <span className="draft-title-text">{propTitle || 'Untitled Resume'}</span>
                </div>
                <ChevronRight size={14} className="draft-chevron" />
            </button>
        </div>
    );

    // Modal States
    const [isPreviewOpen, setPreviewOpen] = useState(false);
    const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
    const [modalScale, setModalScale] = useState(1);
    const [scaledHeight, setScaledHeight] = useState('auto');
    const previewContentRef = useRef(null);

    // Sync scaled height to eliminate bottom ghost space
    useEffect(() => {
        if (!isPreviewOpen || !previewContentRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const actualHeight = entry.target.scrollHeight;
                setScaledHeight(`${actualHeight * modalScale}px`);
            }
        });

        observer.observe(previewContentRef.current);
        // Initial sync
        setScaledHeight(`${previewContentRef.current.scrollHeight * modalScale}px`);

        return () => observer.disconnect();
    }, [isPreviewOpen, modalScale, data, safeTemplateId]);

    // Calculate Modal Scale to fit width
    useEffect(() => {
        if (!isPreviewOpen) return;

        const calculateScale = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const resumeWidth = 794; // 210mm in px at 96dpi

            // Target width with some padding (92% of screen width)
            let newScale = (viewportWidth * 0.92) / resumeWidth;

            // Don't upscale beyond 1.1
            if (newScale > 1.1) newScale = 1.1;

            console.log(`[FormPanel] Calculated Preview Scale: ${newScale} for viewport: ${viewportWidth}x${viewportHeight}`);
            setModalScale(newScale);
        };

        calculateScale();
        // Use a slight delay to ensure the modal layout is settled
        const timer = setTimeout(calculateScale, 100);
        window.addEventListener('resize', calculateScale);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', calculateScale);
        };
    }, [isPreviewOpen]);

    const currentTemplate = templatesConfig.find(t => t.id === safeTemplateId);
    const hasPhotoSupport = !['sapphire-grid', 'aura-pastel', 'artistic-graphic'].includes(safeTemplateId);

    const extraSectionConfig = [
        { id: 'personalDetails', label: 'Personal Details', icon: User, component: PersonalDetails },
        { id: 'websites', label: 'Websites', icon: Globe, component: Websites },
        { id: 'keyAchievements', label: 'Key Achievements', icon: Award, component: KeyAchievements },
        { id: 'certifications', label: 'Certifications', icon: FileText, component: Certifications },
        { id: 'software', label: 'Software', icon: Cpu, component: Software },
        { id: 'accomplishments', label: 'Accomplishments', icon: Award, component: Accomplishments },
        { id: 'affiliations', label: 'Affiliations', icon: Users, component: Affiliations },
        { id: 'interests', label: 'Interests', icon: Heart, component: Interests },
        { id: 'projects', label: 'Projects', icon: Briefcase, component: Projects },
        { id: 'languages', label: 'Languages', icon: Globe, component: Languages },
        { id: 'additionalInfo', label: 'Additional Information', icon: Info, component: AdditionalInfo },
        { id: 'custom', label: 'Custom Section', icon: Plus, component: CustomSection },
    ];

    const activeExtraSteps = [];
    if (data.selectedExtraSections) {
        extraSectionConfig.forEach(section => {
            if (data.selectedExtraSections[section.id]) {
                activeExtraSteps.push({ ...section });
            }
        });
    }

    // --- STEP DEFINITIONS ---
    const baseSteps = [
        { id: 1, label: "Header", icon: User },
        { id: 2, label: "Education", icon: GraduationCap },
        { id: 3, label: "Experience", icon: Briefcase },
        { id: 4, label: "Skills", icon: Star },
        { id: 5, label: "Summary", icon: Layout },
        { id: 6, label: "Add Sections", icon: Plus },
    ];

    // Logical internal steps (including dynamic sections)
    const allSteps = [...baseSteps];
    activeExtraSteps.forEach((s, i) => {
        allSteps.push({ id: 7 + i, sectionId: s.id, label: s.label, icon: s.icon, component: s.component });
    });

    // Finalize is always the LAST logical step
    const finalizeStepId = 7 + activeExtraSteps.length + 1;
    const successStepId = 7 + activeExtraSteps.length; // Keep internal for legacy, but we'll skip it

    allSteps.push({ id: successStepId, label: "Success", component: SuccessStep });
    allSteps.push({ id: finalizeStepId, label: "Finalize", icon: Check });

    // FIXED SIDEBAR (Exactly 7 Steps)
    const sidebarSteps = [
        ...baseSteps,
        { id: finalizeStepId, label: "Finalize", icon: Check }
    ];

    console.log(`[FormPanel] Step Lifecycle: currentStep=${step}, finalizeId=${finalizeStepId}, totalSteps=${allSteps.length}`);


    // Ensure sectionsOrder exists in data AFTER DB load
    useEffect(() => {
        if (isLoadedFromDB && !data.sectionsOrder) {
            setData(prev => ({
                ...prev,
                sectionsOrder: [
                    'summary',
                    'experience',
                    'projects',
                    'education',
                    'certifications',
                    'accomplishments',
                    'affiliations',
                    'additionalInfo',
                    'software',
                    'keyAchievements'
                ]
            }));
        }
    }, [isLoadedFromDB, data.sectionsOrder]);

    const validateStep1 = () => {
        const p = data.personal || {};
        const errors = {};
        if (!p.name?.trim()) errors.name = "Full name is required.";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!p.email?.trim()) errors.email = "Email is required.";
        else if (!emailRegex.test(p.email)) errors.email = "Invalid email format.";

        if (p.phone?.trim()) {
            const cleanPhone = p.phone.trim();
            if (cleanPhone.length < 5) {
                errors.phone = "Phone number is too short (min 5 characters).";
            } else if (!/^[+]?[\d\s-()]+$/.test(cleanPhone)) {
                errors.phone = "Invalid phone number format.";
            }
        }

        if (p.zipCode?.trim() && !/^[\d\s-]+$/i.test(p.zipCode)) {
            errors.zipCode = "Invalid zip code format (numbers only).";
        }

        const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

        if (expandedFields.linkedin || p.linkedin?.trim()) {
            if (!p.linkedin?.trim()) errors.linkedin = "LinkedIn is required if added.";
            else if (!urlRegex.test(p.linkedin)) errors.linkedin = "Invalid LinkedIn URL.";
        }

        if (expandedFields.github || p.github?.trim()) {
            if (!p.github?.trim()) errors.github = "GitHub is required if added.";
            else if (!urlRegex.test(p.github)) errors.github = "Invalid GitHub URL.";
        }

        if (expandedFields.website || p.website?.trim()) {
            if (!p.website?.trim()) errors.website = "Website is required if added.";
            else if (!urlRegex.test(p.website)) errors.website = "Invalid Website URL.";
        }

        if (Object.keys(errors).length > 0) {
            setHeaderErrors(errors);
            if (isMobile) scrollToFirstError();
            return false;
        }
        setHeaderErrors({});
        return true;
    };

    const nextStep = () => {
        if (step === 1) {
            if (!validateStep1()) return;
        }

        if (step < finalizeStepId) {
            markCurrentStepVisited();
            // If on Hub (6), check if there are any active extra sections to go through
            if (step === 6) {
                if (activeExtraSteps.length > 0) {
                    setStep(7); // Go to first extra section
                } else {
                    setStep(finalizeStepId); // Skip to finalize
                }
            } else if (step >= 7 && step < successStepId) {
                // If we are in the middle of extra sections, go to next one OR skip to finalize
                const nextLogicalStep = step + 1;
                if (nextLogicalStep >= successStepId) {
                    setStep(finalizeStepId);
                } else {
                    setStep(nextLogicalStep);
                }
            } else {
                setStep(prev => prev + 1);
            }
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        if (step > 1) {
            markCurrentStepVisited();
            if (step === finalizeStepId) {
                // From Finalize, go back to the Hub OR the last active extra section
                if (activeExtraSteps.length > 0) {
                    setStep(successStepId - 1);
                } else {
                    setStep(6);
                }
            } else if (step > 7 && step < successStepId) {
                // Move backwards through extra sections
                setStep(prev => prev - 1);
            } else if (step === 7) {
                // From first extra section, go back to Hub
                setStep(6);
            } else {
                setStep(prev => prev - 1);
            }
            window.scrollTo(0, 0);
        }
    };

    // Sidebar highlights correctly for sub-steps
    const isStepActive = (sidebarStepId) => {
        if (sidebarStepId === step) return true;
        // Step 6 (Hub) is active if we are in ANY dynamic section (7, 8, 9...)
        if (sidebarStepId === 6 && step > 6 && step < finalizeStepId) return true;
        return false;
    };

    const isStepCompleted = (sidebarStepId) => {
        if (step > sidebarStepId && sidebarStepId !== 6) return true;
        // Hub is completed only if we are on Finalize
        if (sidebarStepId === 6 && step === finalizeStepId) return true;
        return false;
    };

    // --- STEP SYNCHRONIZATION ---
    // Dynamic sections shift the IDs of Success and Finalize steps.
    // If a section is removed while on the FinalDashboard, we must snap 'step' to the new finalizeStepId.
    useEffect(() => {
        if (step > finalizeStepId) {
            console.log(`[FormPanel] Step ${step} is out of bounds after section removal. Snapping to Finalize (${finalizeStepId}).`);
            setStep(finalizeStepId);
        }

        // Sync TO URL (Push state)
        if (onSyncUrl && isLoadedFromDB && !isSwitching) {
            const isFinalize = step === finalizeStepId;
            onSyncUrl(isFinalize ? 'finalize' : 'editor', null, resumeId || builder_resume_id, isFinalize ? null : step);
        }
    }, [finalizeStepId, step, resumeId, isLoadedFromDB, isSwitching]);
;

    // React to URL changes (Pop state / Path updates)
    useEffect(() => {
        const handleUrlChange = () => {
            const params = new URLSearchParams(window.location.search);
            const urlStep = parseInt(params.get('step'));
            const urlView = params.get('view');

            if (urlView === 'finalize') {
                if (step !== finalizeStepId) setStep(finalizeStepId);
            } else if (!isNaN(urlStep) && urlStep > 0 && urlStep <= finalizeStepId) {
                if (step !== urlStep) setStep(urlStep);
            }
        };

        window.addEventListener('popstate', handleUrlChange);
        return () => window.removeEventListener('popstate', handleUrlChange);
    }, [step, finalizeStepId]);


    // Helper for Section Clicking (Hover-to-Edit)
    const getStepBySectionId = (sectionId) => {
        // Base mapping
        const basicMap = {
            'personal': 1,
            'education': 2,
            'experience': 3,
            'skills': 4,
            'summary': 5,
            'extra': 6,
            'websites': 6, // Fallback to extra sections if not active as dynamic step
            'certifications': 6,
            'languages': 6,
            // 'projects' mapping removed as it's now a dynamic extra section
        };

        // If it's a dynamic extra step, find its ID
        const dynamicStep = allSteps.find(s => s.sectionId === sectionId);
        if (dynamicStep) return dynamicStep.id;

        // Fallback for grouped sections or common aliases
        if (sectionId === 'accomplishments' || sectionId === 'awards') {
            const found = allSteps.find(s => s.sectionId === 'accomplishments' || s.sectionId === 'certifications');
            if (found) return found.id;
        }

        return basicMap[sectionId] || 6;
    };


    const isSectionMissing = (id) => {
        if (id === 1) {
            const hasName = data.personal?.name && data.personal?.name.trim().length > 0;
            const email = data.personal?.email || "";
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isEmailValid = emailRegex.test(email);
            return !hasName || !isEmailValid;
        }
        if (id === 2) return !data.education || data.education.length === 0;
        if (id === 3) return !data.experience || data.experience.length === 0;
        return false;
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempPhoto(reader.result);
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
            e.target.value = ''; // Reset file input so the same file can be uploaded again
        }
    };


    const handleUncrop = () => {
        if (data.personal?.originalPhoto) {
            setTempPhoto(data.personal.originalPhoto);
            setIsCropping(true);
        }
    };

    const markCurrentStepVisited = () => {
        const currentStepObj = allSteps.find(s => s.id === step);
        let sectionId = null;

        if (currentStepObj) {
            if (currentStepObj.sectionId) {
                sectionId = currentStepObj.sectionId;
            } else {
                // Map base steps
                const basicMap = {
                    1: 'personal',
                    2: 'education',
                    3: 'experience',
                    4: 'skills',
                    5: 'summary',
                };
                sectionId = basicMap[step];
            }
        }

        // Always track visitedSteps array for sequential navigation control
        const currentVisitedSteps = data.visitedSteps || [1];
        if (!currentVisitedSteps.includes(step)) {
            setData(prev => ({
                ...prev,
                visitedSteps: [...(prev.visitedSteps || [1]), step]
            }));
        }

        if (sectionId) {
            trackEvent('resume_builder_section_visited', `Visited ${sectionId}`, {
                feature_module: 'resume_creator',
                metadata: {
                    section_id: sectionId,
                    step_number: step
                }
            });
            if (sectionId === 'skills') {
                setData(prev => ({
                    ...prev,
                    visitedSections: {
                        ...prev.visitedSections,
                        skills: true,
                        strengths: true,
                        additionalSkills: true
                    }
                }));
            } else {
                setData(prev => ({
                    ...prev,
                    visitedSections: {
                        ...prev.visitedSections,
                        [sectionId]: true
                    }
                }));
            }
        }
    };


    const handleJumpToStep = (targetStep) => {
        markCurrentStepVisited();
        const stepObj = allSteps.find(s => s.id === targetStep);
        trackEvent('resume_builder_quick_jump', `Jumped to ${stepObj?.label || targetStep}`, {
            feature_module: 'resume_creator',
            metadata: {
                target_step: targetStep,
                target_label: stepObj?.label
            }
        });
        setStep(targetStep);
        setIsQuickEdit(true);
    };

    const handleReturnToDashboard = () => {
        markCurrentStepVisited();
        setStep(finalizeStepId);
        setIsQuickEdit(false);
    };

    const navigateToSection = (sectionId) => {
        console.log(`[FormPanel] navigateToSection called for: ${sectionId}`);
        markCurrentStepVisited();

        // 1. Check Core Sections
        const basicMap = {
            'personal': 1,
            'education': 2,
            'experience': 3,
            'skills': 4,
            'summary': 5,
        };
        if (basicMap[sectionId]) {
            console.log(`[FormPanel] Found basic section match: ${sectionId} -> step ${basicMap[sectionId]}`);
            setStep(basicMap[sectionId]);
            setIsQuickEdit(true);
            return;
        }

        // 2. Check Extra Sections
        const sectionConfig = extraSectionConfig.find(s => s.id === sectionId);
        if (sectionConfig) {
            console.log(`[FormPanel] Handling navigateToSection for EXTRA: ${sectionId}`);
            // Determine the FUTURE selected state
            const currentSelected = data.selectedExtraSections || {};
            const isAlreadyActive = currentSelected[sectionId];
            console.log(`[FormPanel] Extra section ${sectionId} is ${isAlreadyActive ? 'ALREADY active' : 'NOT active'}`);

            // If we need to activate it, we must simulate the future list to find the index
            const futureSelected = { ...currentSelected, [sectionId]: true };

            // Activate in data if not already
            if (!isAlreadyActive) {
                console.log(`[FormPanel] Force-activating extra section: ${sectionId}`);
                setData(prev => ({
                    ...prev,
                    selectedExtraSections: futureSelected
                }));
            }

            // Calculate the step ID based on FUTURE state
            // Re-run the same logic used in render to build 'activeExtraSteps'
            const futureActiveSteps = [];
            extraSectionConfig.forEach(section => {
                if (futureSelected[section.id]) {
                    futureActiveSteps.push(section);
                }
            });

            const index = futureActiveSteps.findIndex(s => s.id === sectionId);
            console.log(`[FormPanel] Future active steps length: ${futureActiveSteps.length}, Section index: ${index}`);
            if (index !== -1) {
                const targetStepId = 7 + index;
                console.log(`[FormPanel] Jumping to step: ${targetStepId}`);
                setStep(targetStepId);
                setIsQuickEdit(true);
            }
        } else {
            console.error(`[FormPanel] FAILED to find sectionId ${sectionId} in extraSectionConfig`);
        }
    };



    const activeStepObj = allSteps.find(s => s.id === step) ||
        (step >= successStepId ? allSteps.find(s => s.label === "Finalize") : allSteps[0]);

    const isFullScreenStep = activeStepObj?.label === "Success" || activeStepObj?.label === "Finalize";
    const showSidebar = !isFullScreenStep;

    // --- SMART INTELLIGENCE HANDLERS ---
    const handleTitleIntelligence = async (val) => {
        setData(prev => ({ ...prev, personal: { ...(prev.personal || {}), profession: val } }));

        if (!val || val.length < 2) {
            setSuggestedTitles([]);
            return;
        }
        const lower = val.toLowerCase();

        let localSuggestions = [];
        Object.keys(TITLE_SUGGESTIONS).forEach(key => {
            if (key.startsWith(lower) || lower.startsWith(key)) {
                localSuggestions = [...localSuggestions, ...TITLE_SUGGESTIONS[key]];
            }
        });
        localSuggestions = [...new Set(localSuggestions)].slice(0, 4);
        if (localSuggestions.length > 0) setSuggestedTitles(localSuggestions);

        if (val.length >= 3) {
            setIsAiThinking(prev => ({ ...prev, title: true }));
            const aiSuggestions = await getAIHeaderAdvice("title", val);
            setIsAiThinking(prev => ({ ...prev, title: false }));
            if (aiSuggestions) {
                const parts = aiSuggestions.split(',').map(s => s.trim());
                setSuggestedTitles(prev => [...new Set([...prev, ...parts])].slice(0, 6));
            }
        }
    };

    const handleCountryIntelligence = async (countryName) => {
        const formatted = toTitleCase(countryName);
        const entry = LOCATION_DATA[formatted] || LOCATION_DATA[countryName];

        setData(prev => {
            const currentCountry = prev.personal?.country || "";
            const shouldClearState = currentCountry && currentCountry !== formatted;
            return {
                ...prev,
                personal: {
                    ...(prev.personal || {}),
                    country: formatted,
                    state: shouldClearState ? "" : (prev.personal?.state || "")
                }
            };
        });

        // Local fast check
        if (entry?.phoneCode) {
            setLocationSuggestions(prev => ({ ...prev, phoneCode: entry.phoneCode }));
        } else if (formatted.length >= 3) {
            setIsAiThinking(prev => ({ ...prev, country: true }));
            const aiRes = await getAIHeaderAdvice("location", formatted);
            setIsAiThinking(prev => ({ ...prev, country: false }));
            if (aiRes) {
                try {
                    const parsed = (typeof aiRes === 'string') ? JSON.parse(aiRes) : aiRes;
                    if (parsed.phoneCode) {
                        setLocationSuggestions(prev => ({ ...prev, phoneCode: parsed.phoneCode }));
                    }
                } catch (e) { }
            }
        }
    };

    const handleZipIntelligence = async (zip) => {
        const country = data.personal?.country;

        // India: Only digits, max 6
        if (country === "India") {
            if (zip !== "" && !/^\d+$/.test(zip)) return;
            if (zip.length > 6) return;
        }
        // US/General: Usually numeric with dashes/spaces.
        // We'll block alphabets by default UNLESS it's a country known for them (like UK)
        else if (country !== "United Kingdom" && zip !== "" && /[a-zA-Z]/.test(zip)) {
            return;
        }

        setData(prev => ({ ...prev, personal: { ...(prev.personal || {}), zipCode: zip } }));

        if (zip.length >= 5) {
            setIsAiThinking(prev => ({ ...prev, zipCode: true, city: true, state: true }));
            let loc = await reverseGeocode(zip, data.personal?.country);

            if (!loc || !loc.city || !loc.state) {
                const aiRes = await getAIHeaderAdvice("location", zip);
                if (aiRes) {
                    try {
                        const parsed = (typeof aiRes === 'string') ? JSON.parse(aiRes) : aiRes;
                        loc = {
                            city: parsed.city || loc?.city || null,
                            state: parsed.state || loc?.state || null,
                            country: parsed.country || loc?.country || null,
                            phoneCode: parsed.phoneCode || null
                        };
                    } catch (e) { }
                }
            }
            setIsAiThinking(prev => ({ ...prev, zipCode: false, city: false, state: false }));

            if (loc && (loc.city || loc.state || loc.country)) {
                const countryName = toTitleCase(loc.country || "");
                const countryEntry = countryName ? (LOCATION_DATA[countryName] || LOCATION_DATA[loc.country]) : null;

                setLocationSuggestions(prev => ({
                    ...prev,
                    city: loc.city ? toTitleCase(loc.city) : null,
                    state: loc.state ? toTitleCase(loc.state) : null,
                    country: countryName || null,
                    phoneCode: countryEntry?.phoneCode || loc.phoneCode || null
                }));
            }
        } else if (zip.length === 0) {
            setLocationSuggestions(prev => ({ ...prev, city: null, state: null, country: null, phoneCode: null, zipCode: null }));
        }
    };

    const handleGeolocation = async () => {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`[GEO DEBUG] User Coords: ${latitude}, ${longitude}`);

            // Ask AI to reverse geocode these coordinates
            const aiRes = await getAIHeaderAdvice("location", `latitude: ${latitude}, longitude: ${longitude}`);
            if (aiRes) {
                try {
                    const parsed = (typeof aiRes === 'string') ? JSON.parse(aiRes) : aiRes;
                    if (parsed) {
                        const countryName = toTitleCase(parsed.country || "");
                        const countryEntry = countryName ? (LOCATION_DATA[countryName] || LOCATION_DATA[parsed.country]) : null;
                        const phoneCode = countryEntry?.phoneCode || parsed.phoneCode || null;

                        // FILL IN THE FORM DIRECTLY
                        setData(prev => ({
                            ...prev,
                            personal: {
                                ...(prev.personal || {}),
                                city: parsed.city ? toTitleCase(parsed.city) : (prev.personal?.city || ""),
                                state: parsed.state ? toTitleCase(parsed.state) : (prev.personal?.state || ""),
                                country: countryName || (prev.personal?.country || ""),
                                zipCode: parsed.zipCode || (prev.personal?.zipCode || ""),
                                phone: phoneCode || (prev.personal?.phone || "")
                            }
                        }));

                        // Clear suggestions as they are now the actual values
                        setLocationSuggestions({ city: null, state: null, country: null, zipCode: null, phoneCode: null });

                        console.log(`[GEO DEBUG] Populated Fields:`, parsed);
                    }
                } catch (e) { }
            }
        }, (err) => {
            console.error("[GEO DEBUG] Error getting location:", err);
        });
    };

    const handleCityIntelligence = async (city) => {
        const formatted = toTitleCase(city);
        setData(prev => ({ ...prev, personal: { ...(prev.personal || {}), city: formatted } }));

        if (formatted.length >= 3) {
            setIsAiThinking(prev => ({ ...prev, city: true }));
            const aiRes = await getAIHeaderAdvice("location", formatted);
            setIsAiThinking(prev => ({ ...prev, city: false }));
            if (aiRes) {
                try {
                    const parsed = (typeof aiRes === 'string') ? JSON.parse(aiRes) : aiRes;
                    if (parsed) {
                        const countryName = toTitleCase(parsed.country || "");
                        const countryEntry = countryName ? (LOCATION_DATA[countryName] || LOCATION_DATA[parsed.country]) : null;

                        // FORWARD-ONLY: city → state, country, phoneCode (never zipCode - that's upstream)
                        setLocationSuggestions(prev => ({
                            ...prev,
                            city: null,             // don't suggest city when user is typing city
                            state: parsed.state || null,
                            country: countryName || null,
                            phoneCode: countryEntry?.phoneCode || parsed.phoneCode || null
                        }));
                    }
                } catch (e) { }
            }
        } else if (formatted.length === 0) {
            // Only clear downstream fields
            setLocationSuggestions(prev => ({ ...prev, state: null, country: null, phoneCode: null }));
        }
    };

    const handleStateIntelligence = async (state) => {
        const formatted = toTitleCase(state);
        setData(prev => ({ ...prev, personal: { ...(prev.personal || {}), state: formatted } }));

        if (formatted.length >= 3) {
            setIsAiThinking(prev => ({ ...prev, state: true }));
            const aiRes = await getAIHeaderAdvice("location", formatted);
            setIsAiThinking(prev => ({ ...prev, state: false }));
            if (aiRes) {
                try {
                    const parsed = (typeof aiRes === 'string') ? JSON.parse(aiRes) : aiRes;
                    if (parsed) {
                        const countryName = toTitleCase(parsed.country || "");
                        const countryEntry = countryName ? (LOCATION_DATA[countryName] || LOCATION_DATA[parsed.country]) : null;

                        // FORWARD-ONLY: state → country, phoneCode (never city or zipCode - those are upstream)
                        setLocationSuggestions(prev => ({
                            ...prev,
                            state: null,            // don't suggest state when user is typing state
                            city: null,             // never backtrack to city
                            zipCode: null,          // never backtrack to zipCode
                            country: countryName || null,
                            phoneCode: countryEntry?.phoneCode || parsed.phoneCode || null
                        }));
                    }
                } catch (e) { }
            }
        } else if (formatted.length === 0) {
            // Only clear downstream fields
            setLocationSuggestions(prev => ({ ...prev, country: null, phoneCode: null }));
        }
    };

    const applySuggestion = (field, value) => {
        setData(prev => ({
            ...prev,
            personal: { ...prev.personal, [field]: value }
        }));
        setLocationSuggestions(prev => ({ ...prev, [field]: null }));
    };

    const handleEmailIntelligence = async (email) => {
        setData(prev => ({ ...prev, personal: { ...(prev.personal || {}), email } }));

        // Local fast check
        const localTip = auditEmail(email, data.personal?.name);
        setEmailTip(localTip);

        // AI Professionalism Audit on Blur/Length
        if (email.includes('@') && email.includes('.')) {
            const aiTip = await getAIHeaderAdvice("audit", email, { name: data.personal?.name });
            if (aiTip && aiTip !== "Professional Email") {
                setEmailTip(aiTip);
            }
        }
    };
    const handleSocialIntelligence = (platform, val) => {
        setData(prev => ({ ...prev, personal: { ...(prev.personal || {}), [platform]: val } }));
    };

    const handlePhoneIntelligence = async (phoneValue) => {
        // This function now primarily handles identifying country from phone pattern
        if (phoneValue.length >= 1) {
            const codeToMatch = phoneValue.startsWith('+') ? phoneValue : `+${phoneValue}`;
            const country = findCountryByPhone(codeToMatch);

            if (country) {
                const countryCode = LOCATION_DATA[country]?.phoneCode;
                setLocationSuggestions(prev => ({
                    ...prev,
                    country,
                    phoneCode: countryCode
                }));
            } else if (phoneValue.startsWith('+')) {
                // Background AI check for unknown codes
                setIsAiThinking(prev => ({ ...prev, phone: true }));
                const aiRes = await getAIHeaderAdvice("location", phoneValue);
                setIsAiThinking(prev => ({ ...prev, phone: false }));
                if (aiRes) {
                    try {
                        const parsed = (typeof aiRes === 'string') ? JSON.parse(aiRes) : aiRes;
                        if (parsed.country && !data.personal.country) {
                            setLocationSuggestions(prev => ({
                                ...prev,
                                country: toTitleCase(parsed.country),
                                phoneCode: parsed.phoneCode || null
                            }));
                        }
                    } catch (e) { }
                }
            }
        } else if (phoneValue.length === 0) {
            setLocationSuggestions(prev => ({ ...prev, country: null, phoneCode: null }));
        }
    };

    const applySocialFormatting = (platform) => {
        const val = data.personal?.[platform];
        if (val && !val.startsWith('http')) {
            const formatted = formatSocialLink(platform, val);
            setData(prev => ({
                ...prev,
                personal: { ...prev.personal, [platform]: formatted }
            }));
            setSocialStates(prev => ({ ...prev, [platform]: 'verified' }));
        }
    };

    const renderStep = () => {
        // ID-Shift Safety: Find the step object. Fallback to "Finalize" if we are in the high-step range
        // but the exact ID is missing (common during section removal).
        const currentStepObj = allSteps.find(s => s.id === step) ||
            (step >= successStepId ? allSteps.find(s => s.label === "Finalize") : null);

        if (!currentStepObj) return null;

        // 1. DYNAMIC STEP HANDLING (Success & Finalize)
        // We handle these by label to ensure they don't unmount when 'step' index shifts
        if (currentStepObj.label === "Success") {
            return <SuccessStep data={data} templateId={safeTemplateId} onBack={prevStep} onNext={nextStep} />;
        }

        if (currentStepObj.label === "Finalize") {
            return (
                <Finalize
                    data={data}
                    setData={setData}
                    templateId={safeTemplateId}
                    onChangeTemplate={onChangeTemplate}
                    onBack={prevStep}
                    jumpToStep={handleJumpToStep}
                    getStepBySectionId={getStepBySectionId}
                    navigateToSection={navigateToSection}
                    builder_resume_id={resumeId}
                    jobId={jobId}
                    title={propTitle}
                    onSwitchProject={onSwitchProject}
                    isSaving={isSaving}
                    isMobile={isMobile}
                    DraftSwitcher={renderDraftSwitcher}
                    onOpenDraftExplorer={async () => {
                        try {
                            await handleSaveDraft();
                            await fetchDrafts();
                            if (isMobile) setIsMobileMenuOpen(false);
                            setIsDraftExplorerOpen(true);
                        } catch (err) {
                            console.error("Error in onOpenDraftExplorer:", err);
                        }
                    }}
                    isDraftExplorerOpen={isDraftExplorerOpen}
                    navTarget={navTarget}
                    setNavTarget={setNavTarget}
                />
            );
        }

        // 2. CORE FLOW STEPS
        switch (step) {
            case 1:
                return (
                    <div className="zety-form-content">
                        {jobId && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded"
                            >
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Active Session</p>
                                    <h4 className="text-sm font-black text-emerald-900 tracking-tight">Placement Verification Mode</h4>
                                </div>
                                <div className="px-3 py-1 bg-white rounded-full border border-emerald-100 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                                    Official
                                </div>
                            </motion.div>
                        )}
                        <div className="form-header" style={{
                            marginBottom: isMobile ? '24px' : '40px'
                        }}>
                            <h1 className="form-title flex items-center gap-2">
                                Personal Header
                            </h1>
                            <p className="form-subtitle">Start with your basic contact information.</p>
                        </div>

                        <div className="zety-form-body animate-in fade-in duration-200">
                            {/* 1. PHOTO & NAME SECTION */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : '140px 1fr',
                                gap: isMobile ? '24px' : '32px',
                                marginBottom: '40px',
                                alignItems: isMobile ? 'center' : 'start'
                            }}>
                                {/* Photo Side */}
                                <div style={{
                                    position: 'relative',
                                    width: isMobile ? '120px' : '140px',
                                    margin: isMobile ? '0 auto' : '0'
                                }}>
                                    <div style={{
                                        width: isMobile ? '120px' : '140px',
                                        height: isMobile ? '120px' : '140px',
                                        borderRadius: '24px',
                                        background: '#f8fafc',
                                        border: '2px dashed #e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        {data.personal?.photo ? (
                                            <img src={data.personal.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                                <User size={40} strokeWidth={1.5} />
                                                <div style={{ fontSize: '10px', fontWeight: 700, marginTop: '8px', textTransform: 'uppercase' }}>Add Photo</div>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        style={{
                                            position: 'absolute',
                                            bottom: '-10px',
                                            right: '-10px',
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: 'var(--gap-primary)',
                                            color: 'white',
                                            border: '3px solid #ffffff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                        title="Change Photo"
                                    >
                                        <Camera size={16} />
                                    </button>
                                    <input type="file" ref={fileInputRef} hidden onChange={handleImageUpload} accept="image/*" />
                                    {data.personal?.photo && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                                            <button
                                                onClick={handleUncrop}
                                                style={{
                                                    color: 'var(--gap-primary)',
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    background: 'rgba(59, 130, 246, 0.05)',
                                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                                    borderRadius: '6px',
                                                    padding: '6px 0',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <Maximize2 size={12} /> Crop / Adjust
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setData(prev => ({ ...prev, personal: { ...prev.personal, photo: '', originalPhoto: '' } }));
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }}
                                                style={{
                                                    color: '#ef4444',
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Remove Photo
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Name & Title Side */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                        gap: isMobile ? '20px' : '24px'
                                    }}>
                                        <ValidatedInput
                                            label="Full Name"
                                            required
                                            error={headerErrors.name}
                                            value={data.personal?.name}
                                            onChange={(e) => {
                                                setHeaderErrors(p => ({ ...p, name: null }));
                                                setData(prev => ({ ...prev, personal: { ...prev.personal, name: e.target.value } }))
                                            }}
                                            onBlur={(e) => {
                                                const fixed = toTitleCase(e.target.value);
                                                setData(prev => ({ ...prev, personal: { ...prev.personal, name: fixed } }));
                                            }}
                                            placeholder="e.g. Subrat Kumar"
                                        />
                                        <div style={{ position: 'relative' }}>
                                            <ValidatedInput
                                                label="Job Title"
                                                value={data.personal?.profession}
                                                onChange={(e) => handleTitleIntelligence(e.target.value)}
                                                onBlur={(e) => {
                                                    const fixed = toTitleCase(e.target.value);
                                                    setData(prev => ({ ...prev, personal: { ...prev.personal, profession: fixed } }));
                                                    setTimeout(() => setSuggestedTitles([]), 200);
                                                }}
                                                placeholder="e.g. Technical Lead"
                                                aiSuggestion={suggestedTitles.length > 0 ? suggestedTitles[0] : null}
                                                isLoading={isAiThinking.title}
                                            />
                                            {suggestedTitles.length > 0 && (
                                                <div className="absolute top-full left-0 w-full z-[200] bg-white border border-slate-200 rounded shadow-sm p-4 mt-2 animate-in fade-in slide-in-from-top-3 duration-300">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="p-1.5 bg-violet-100 rounded-lg text-violet-600">
                                                                <Sparkles size={14} className="animate-pulse" />
                                                            </div>
                                                            <span className="text-[11px] font-black text-stone-500 uppercase tracking-[0.15em]">Premium Suggestions</span>
                                                        </div>
                                                        <button
                                                            onClick={() => setSuggestedTitles([])}
                                                            className="p-1.5 text-stone-300 hover:text-stone-600 hover:bg-stone-50 rounded-full transition-all"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2.5 max-h-[220px] overflow-y-auto custom-scrollbar p-0.5">
                                                        {suggestedTitles.map(t => (
                                                            <button
                                                                key={t}
                                                                onClick={() => {
                                                                    setData(prev => ({ ...prev, personal: { ...prev.personal, profession: t } }));
                                                                    setSuggestedTitles([]);
                                                                }}
                                                                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-sm font-semibold transition-all text-slate-700 flex items-center gap-2 group/title"
                                                            >
                                                                <div className="w-1 h-1 rounded-full bg-slate-400" />
                                                                {t}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {/* Smart Advisor Tip */}
                                        {!data.personal?.email && data.personal?.name && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded flex items-start gap-4 shadow-sm"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-white border border-violet-100 flex items-center justify-center shadow-sm flex-shrink-0">
                                                    <Sparkles size={18} className="text-violet-500 animate-pulse" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-1">Smart Advisor</p>
                                                    <p className="text-[13px] font-bold text-stone-700 leading-snug">
                                                        Professional Check: Use <span className="text-violet-600 underline decoration-violet-200 decoration-2 underline-offset-4">{suggestEmail(data.personal.name)}</span> to look more credible to recruiters.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 2. CONTACT & LOCATION MIXED SECTION */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                gap: isMobile ? '32px' : '40px'
                            }}>
                                {/* Left: Core Contact */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifySelf: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Mail size={16} />
                                        </div>
                                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--gap-text-main)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Communication</h4>
                                    </div>
                                    <ValidatedInput
                                        label="Email Address"
                                        required
                                        error={headerErrors.email}
                                        value={data.personal?.email}
                                        type="email"
                                        onChange={(e) => {
                                            setHeaderErrors(p => ({ ...p, email: null }));
                                            handleEmailIntelligence(e.target.value);
                                        }}
                                        placeholder="hello@resumy.com"
                                        aiSuggestion={!data.personal?.email && data.personal?.name ? suggestEmail(data.personal.name) : null}
                                    />
                                    {emailTip && (
                                        <div className="p-2 bg-amber-50 border border-amber-100 rounded-lg text-[10px] font-bold text-amber-700 leading-tight">
                                            {emailTip}
                                        </div>
                                    )}
                                    <div className="flex gap-5">
                                        <div style={{ width: isMobile ? '80px' : '110px' }}>
                                            <ValidatedInput
                                                label="Code"
                                                value={data.personal?.phoneCode}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setData(prev => ({
                                                        ...prev,
                                                        personal: { ...prev.personal, phoneCode: val }
                                                    }));
                                                    handlePhoneIntelligence(val);
                                                    if (val === locationSuggestions.phoneCode) setLocationSuggestions(p => ({ ...p, phoneCode: null }));
                                                }}
                                                placeholder="+91"
                                                aiSuggestion={locationSuggestions.phoneCode}
                                                compactAi
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <ValidatedInput
                                                label="Phone Number"
                                                error={headerErrors.phone}
                                                value={data.personal?.phone}
                                                type="tel"
                                                onChange={(e) => {
                                                    const val = e.target.value;

                                                    // IF Pincoded / Pasted with country code (starts with +)
                                                    if (val.startsWith('+')) {
                                                        const spaceIdx = val.indexOf(' ');
                                                        if (spaceIdx > 1) {
                                                            const newCode = val.substring(0, spaceIdx);
                                                            const newNum = val.substring(spaceIdx + 1);
                                                            setData(prev => ({
                                                                ...prev,
                                                                personal: { ...prev.personal, phoneCode: newCode, phone: newNum }
                                                            }));
                                                            handlePhoneIntelligence(newNum);
                                                            return;
                                                        }
                                                    }

                                                    // Allow only numbers and common phone characters for the main part
                                                    if (val === '' || /^[\d\s-()]*$/.test(val)) {
                                                        setHeaderErrors(p => ({ ...p, phone: null }));
                                                        setData(prev => ({ ...prev, personal: { ...(prev.personal || {}), phone: val } }));
                                                        handlePhoneIntelligence(val);
                                                    }
                                                }}
                                                placeholder="98765-43210"
                                                isLoading={isAiThinking.phone}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Location Details */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3f2', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <MapPin size={16} />
                                        </div>
                                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--gap-text-main)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</h4>

                                        <button
                                            onClick={handleGeolocation}
                                            className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-all border border-violet-100"
                                            title="Use my device location"
                                        >
                                            <Navigation size={12} className="rotate-[45deg]" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Use Current</span>
                                        </button>
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                        gap: '16px'
                                    }}>
                                        <div className="flex-1 relative group">
                                            <ValidatedInput
                                                label="City"
                                                value={data.personal?.city}
                                                onChange={(e) => handleCityIntelligence(e.target.value)}
                                                placeholder="City"
                                                aiSuggestion={locationSuggestions.city}
                                                isLoading={isAiThinking.city}
                                            />
                                            {citiesList.length > 0 && (
                                                <div className="hidden group-focus-within:block absolute top-[100%] left-0 w-full z-[100] bg-white border border-stone-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto mt-2 p-1 custom-scrollbar pointer-events-auto">
                                                    {citiesList.filter(c => !data.personal.city || c.toLowerCase().includes(data.personal.city.toLowerCase()))
                                                        .sort((a, b) => {
                                                            const s = data.personal.city?.toLowerCase();
                                                            if (!s) return a.localeCompare(b);
                                                            const aS = a.toLowerCase().startsWith(s);
                                                            const bS = b.toLowerCase().startsWith(s);
                                                            if (aS && !bS) return -1;
                                                            if (!aS && bS) return 1;
                                                            return a.localeCompare(b);
                                                        })
                                                        .slice(0, 200).map(c => (
                                                            <button
                                                                key={c}
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault(); // Prevents blur before click
                                                                    setData(prev => ({ ...prev, personal: { ...prev.personal, city: c } }));
                                                                }}
                                                                className="w-full text-left px-3 py-2 hover:bg-violet-50 hover:text-violet-600 text-xs font-bold rounded-lg transition-colors border-b border-stone-50 last:border-0"
                                                            >
                                                                {c}
                                                            </button>
                                                        ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 relative group">
                                            <ValidatedInput
                                                label={isMobile ? "State" : "State / Province"}
                                                value={data.personal?.state}
                                                onChange={(e) => handleStateIntelligence(e.target.value)}
                                                placeholder="State"
                                                aiSuggestion={locationSuggestions.state}
                                                isLoading={isAiThinking.state}
                                            />
                                            {statesList.length > 0 && (
                                                <div className="hidden group-focus-within:block absolute top-[100%] left-0 w-full z-[100] bg-white border border-stone-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto mt-2 p-1 custom-scrollbar pointer-events-auto">
                                                    {statesList.filter(s => !data.personal.state || s.toLowerCase().includes(data.personal.state.toLowerCase()))
                                                        .sort((a, b) => {
                                                            const s = data.personal.state?.toLowerCase();
                                                            if (!s) return a.localeCompare(b);
                                                            const aS = a.toLowerCase().startsWith(s);
                                                            const bS = b.toLowerCase().startsWith(s);
                                                            if (aS && !bS) return -1;
                                                            if (!aS && bS) return 1;
                                                            return a.localeCompare(b);
                                                        })
                                                        .slice(0, 100).map(s => (
                                                            <button
                                                                key={s}
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    setData(prev => ({ ...prev, personal: { ...prev.personal, state: s } }));
                                                                }}
                                                                className="w-full text-left px-3 py-2 hover:bg-violet-50 hover:text-violet-600 text-xs font-bold rounded-lg transition-colors border-b border-stone-50 last:border-0"
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                        gap: '16px'
                                    }}>
                                        <ValidatedInput
                                            label="Zip Code"
                                            error={headerErrors.zipCode}
                                            value={data.personal?.zipCode}
                                            onChange={(e) => handleZipIntelligence(e.target.value)}
                                            placeholder="Zip"
                                            aiSuggestion={locationSuggestions.zipCode}
                                            isLoading={isAiThinking.zipCode}
                                        />
                                        <div className="flex-1 relative group">
                                            <ValidatedInput
                                                label="Country"
                                                value={data.personal?.country}
                                                onChange={(e) => handleCountryIntelligence(e.target.value)}
                                                placeholder="Country"
                                                aiSuggestion={locationSuggestions.country}
                                                isLoading={isAiThinking.country}
                                            />
                                            {countriesList.length > 0 && (
                                                <div className="hidden group-focus-within:block absolute top-[100%] left-0 w-full z-[100] bg-white border border-stone-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto mt-2 p-1 custom-scrollbar pointer-events-auto">
                                                    {countriesList.filter(c => !data.personal.country || c.toLowerCase().includes(data.personal.country.toLowerCase()))
                                                        .sort((a, b) => {
                                                            const s = data.personal.country?.toLowerCase();
                                                            if (!s) return a.localeCompare(b);
                                                            const aS = a.toLowerCase().startsWith(s);
                                                            const bS = b.toLowerCase().startsWith(s);
                                                            if (aS && !bS) return -1;
                                                            if (!aS && bS) return 1;
                                                            return a.localeCompare(b);
                                                        })
                                                        .slice(0, 300).map(c => (
                                                            <button
                                                                key={c}
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    handleCountryIntelligence(c);
                                                                }}
                                                                className="w-full text-left px-3 py-2 hover:bg-violet-50 hover:text-violet-600 text-xs font-bold rounded-lg transition-colors border-b border-stone-50 last:border-0"
                                                            >
                                                                {c}
                                                            </button>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. SOCIAL PRESENCE (FULL WIDTH BOTTOM) */}
                            <div style={{
                                padding: isMobile ? '20px' : '32px',
                                background: '#fafafb',
                                borderRadius: '16px',
                                border: '1px solid #eef2f6',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '24px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Globe size={16} className="text-stone-400" />
                                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--gap-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Links & Presence</h4>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer group" title="Clean up your header by showing 'LinkedIn' instead of the full URL">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                            checked={data.personal?.shortenHeaderLinks || false}
                                            onChange={(e) => setData(prev => ({
                                                ...prev,
                                                personal: { ...(prev.personal || {}), shortenHeaderLinks: e.target.checked }
                                            }))}
                                        />
                                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest group-hover:text-stone-600 transition-colors">Simplify Labels</span>
                                    </label>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {(!expandedFields.linkedin && !data.personal?.linkedin) && <button className="btn-add-info" onClick={() => toggleField('linkedin')} style={{ padding: '8px 16px', background: '#ffffff', border: '1px dashed #cbd5e1' }}><Linkedin size={14} /> Add LinkedIn</button>}
                                    {(!expandedFields.github && !data.personal?.github) && <button className="btn-add-info" onClick={() => toggleField('github')} style={{ padding: '8px 16px', background: '#ffffff', border: '1px dashed #cbd5e1' }}><Github size={14} /> Add GitHub</button>}
                                    {(!expandedFields.website && !data.personal?.website) && <button className="btn-add-info" onClick={() => toggleField('website')} style={{ padding: '8px 16px', background: '#ffffff', border: '1px dashed #cbd5e1' }}><Globe size={14} /> Add Website</button>}
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '20px'
                                }}>
                                    {(expandedFields.linkedin || data.personal?.linkedin) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1 }}>
                                                <ValidatedInput
                                                    label="LinkedIn"
                                                    error={headerErrors.linkedin}
                                                    value={data.personal?.linkedin}
                                                    onChange={(e) => {
                                                        setHeaderErrors(p => ({ ...p, linkedin: null }));
                                                        handleSocialIntelligence('linkedin', e.target.value);
                                                    }}
                                                    onBlur={() => applySocialFormatting('linkedin')}
                                                    placeholder="e.g. subrat-kumar"
                                                />
                                                {socialStates.linkedin === 'verified' && <div className="text-[10px] font-bold text-emerald-500 mt-1 flex items-center gap-1"><CheckCircle2 size={10} /> Link Formatted & Verified</div>}
                                            </div>
                                            <button onClick={() => removeField('linkedin')} style={{ padding: '8px', color: '#ef4444', background: '#fee2e2', borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '14px' }}><Trash2 size={16} /></button>
                                        </div>
                                    )}
                                    {(expandedFields.github || data.personal?.github) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1 }}>
                                                <ValidatedInput
                                                    label="GitHub"
                                                    error={headerErrors.github}
                                                    value={data.personal?.github}
                                                    onChange={(e) => {
                                                        setHeaderErrors(p => ({ ...p, github: null }));
                                                        handleSocialIntelligence('github', e.target.value);
                                                    }}
                                                    onBlur={() => applySocialFormatting('github')}
                                                    placeholder="e.g. subrat"
                                                />
                                                {socialStates.github === 'verified' && <div className="text-[10px] font-bold text-emerald-500 mt-1 flex items-center gap-1"><CheckCircle2 size={10} /> Link Formatted & Verified</div>}
                                            </div>
                                            <button onClick={() => removeField('github')} style={{ padding: '8px', color: '#ef4444', background: '#fee2e2', borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '14px' }}><Trash2 size={16} /></button>
                                        </div>
                                    )}
                                    {(expandedFields.website || data.personal?.website) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1 }}>
                                                <ValidatedInput
                                                    label="Website"
                                                    error={headerErrors.website}
                                                    value={data.personal?.website}
                                                    onChange={(e) => {
                                                        setHeaderErrors(p => ({ ...p, website: null }));
                                                        handleSocialIntelligence('website', e.target.value);
                                                    }}
                                                    onBlur={() => applySocialFormatting('website')}
                                                    placeholder="portfolio.com"
                                                />
                                            </div>
                                            <button onClick={() => removeField('website')} style={{ padding: '8px', color: '#ef4444', background: '#fee2e2', borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '14px' }}><Trash2 size={16} /></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="form-footer" style={{ marginTop: '60px', padding: '32px 0', borderTop: '2px solid var(--gap-border)', justifyContent: 'flex-end' }}>
                            {isQuickEdit && (
                                <button className="btn-next outlined" onClick={handleReturnToDashboard}>Cancel Changes</button>
                            )}
                            <button className="btn-next primary" onClick={isQuickEdit ? handleReturnToDashboard : nextStep}>
                                {isQuickEdit ? 'Save Changes' : 'Next: Education'}
                            </button>
                        </div>
                    </div>
                );
            case 2: return <Education data={data} setData={setData} templateId={safeTemplateId} onBack={prevStep} onNext={nextStep} onPreview={() => setPreviewOpen(true)} isQuickEdit={isQuickEdit} onReturnToDashboard={handleReturnToDashboard} isFieldSupported={() => true} currentTemplateName={currentTemplate?.name} isMobile={isMobile} />;
            case 3: return <Experience data={data} setData={setData} templateId={safeTemplateId} onBack={prevStep} onNext={nextStep} onPreview={() => setPreviewOpen(true)} isQuickEdit={isQuickEdit} onReturnToDashboard={handleReturnToDashboard} isFieldSupported={() => true} currentTemplateName={currentTemplate?.name} isMobile={isMobile} />;
            case 4: return <Skills data={data} setData={setData} templateId={safeTemplateId} onBack={prevStep} onNext={nextStep} onPreview={() => setPreviewOpen(true)} isQuickEdit={isQuickEdit} onReturnToDashboard={handleReturnToDashboard} isFieldSupported={() => true} currentTemplateName={currentTemplate?.name} isMobile={isMobile} />;
            case 5: return <Summary data={data} setData={setData} templateId={safeTemplateId} onBack={prevStep} onNext={nextStep} onPreview={() => setPreviewOpen(true)} isQuickEdit={isQuickEdit} onReturnToDashboard={handleReturnToDashboard} isFieldSupported={() => true} currentTemplateName={currentTemplate?.name} isMobile={isMobile} />;
            case 6: return <ExtraSections data={data} setData={setData} templateId={safeTemplateId} onBack={prevStep} onNext={nextStep} isQuickEdit={isQuickEdit} onReturnToDashboard={handleReturnToDashboard} onPreview={() => setPreviewOpen(true)} isMobile={isMobile} />;
            default:
                // For dynamic steps and Finalize
                if (currentStepObj.component) {
                    const Component = currentStepObj.component;
                    return <Component data={data} setData={setData} templateId={safeTemplateId} onBack={prevStep} onNext={nextStep} onPreview={() => setPreviewOpen(true)} isQuickEdit={isQuickEdit} onReturnToDashboard={handleReturnToDashboard} isFieldSupported={() => true} currentTemplateName={currentTemplate?.name} isMobile={isMobile} />;
                }
                if (step === successStepId) return <SuccessStep data={data} templateId={safeTemplateId} onBack={prevStep} onNext={nextStep} />;
                if (step === finalizeStepId) return (
                    <Finalize
                        data={data}
                        setData={setData}
                        templateId={safeTemplateId}
                        onChangeTemplate={onChangeTemplate}
                        onBack={prevStep}
                        jumpToStep={handleJumpToStep}

                        getStepBySectionId={getStepBySectionId}
                        navigateToSection={navigateToSection}

                        // Pass Draft Switcher props
                        builder_resume_id={resumeId}
                        title={propTitle}
                        onSwitchProject={onSwitchProject}
                        DraftSwitcher={renderDraftSwitcher}
                        onOpenDraftExplorer={async () => {
                            console.log("onOpenDraftExplorer triggered in FormPanel.jsx");
                            try {
                                console.log("Saving draft...");
                                await handleSaveDraft();
                                console.log("Fetching drafts...");
                                await fetchDrafts();
                                console.log("Opening explorer modal...");
                                if (isMobile) setIsMobileMenuOpen(false);
                                setIsDraftExplorerOpen(true);
                            } catch (err) {
                                console.error("Error in onOpenDraftExplorer:", err);
                            }
                        }}
                        isDraftExplorerOpen={isDraftExplorerOpen}
                    />
                );
                return null;
        }
    };



    return (
        <div className="form-panel-root-container" style={{ position: 'relative', width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* UI MESSAGING (TOAST) */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ y: 50, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 20, opacity: 0, scale: 0.9 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[11000] flex items-center gap-3 bg-stone-900 text-white px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 min-w-[320px]"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${toast.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold leading-tight">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(null)} className="text-white/40 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {(isSwitching || !isLoadedFromDB) && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
                        {lastInitializedId.current ? (
                            <DraftSwitchLoader text="Switching Draft" />
                        ) : (
                            <FunLoader text="Assembling Workspace" />
                        )}
                    </div>
                )}
            </AnimatePresence>

            <div key={resumeId} className={`main-ui-transition ${(!isLoadedFromDB || isSwitching) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ transition: 'opacity 0.4s ease-in-out', width: '100%', height: '100%' }}>
                {/* Modal: Live Preview (Fullscreen) */}

                {isPreviewOpen && (
                    <div className="modal-overlay-fixed zen-mode-overlay" onClick={() => setPreviewOpen(false)}>
                        <div className="full-screen-wrapper" onClick={(e) => e.stopPropagation()}>
                            <div className="preview-actions">
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: '#475569',
                                    cursor: 'pointer',
                                    padding: '0 16px',
                                    borderRight: '1px solid #e2e8f0'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={pdfMode === 'paged'}
                                        onChange={(e) => setPdfMode(e.target.checked ? 'paged' : 'full')}
                                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                    />
                                    Page Breaks
                                </label>
                                <button className="btn-modal-action" onClick={() => setTemplateModalOpen(true)}>
                                    <Layout size={14} /> Templates
                                </button>
                            </div>
                            <button className="close-btn-fixed" onClick={() => setPreviewOpen(false)} title="Exit Fullscreen">
                                <X size={20} />
                            </button>
                            <div className="resume-view-container zen-preview-container"
                                style={{
                                    width: `${794 * modalScale}px`,
                                    height: scaledHeight,
                                    margin: '0 auto',
                                    position: 'relative',
                                    WebkitTextSizeAdjust: 'none',
                                    textSizeAdjust: 'none',
                                    display: 'block',
                                    overflow: 'visible',
                                    transition: 'height 0.2s ease-out'
                                }}>
                                <div ref={previewContentRef} style={{
                                    transform: `scale(${modalScale})`,
                                    transformOrigin: 'top left',
                                    width: '210mm',
                                    background: 'transparent'
                                }}>
                                    <ResumeRenderer
                                        data={data}
                                        templateId={safeTemplateId}
                                        showPageBreaks={pdfMode === 'paged'}
                                        hidePageGuides={true}
                                        scale={modalScale}
                                        currentStep={step}
                                        forceDesktop={true}
                                        onSectionClick={(sectionId) => {
                                            const targetStep = getStepBySectionId(sectionId);
                                            if (targetStep) {
                                                setStep(targetStep);
                                                setPreviewOpen(false);
                                            }
                                        }}
                                        isFormPanel={true}
                                        highlightSection={
                                            step === 1 ? 'personal' :
                                                step === 2 ? 'education' :
                                                    step === 3 ? 'experience' :
                                                        step === 4 ? 'skills' :
                                                            step === 5 ? 'summary' :
                                                                step >= 7 ? allSteps.find(s => s.id === step)?.sectionId : null
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isTemplateModalOpen && (
                    <PremiumTemplateSelection
                        userId={userId}
                        data={data}
                        onUpdateData={(newData) => setData(prev => ({ ...prev, ...newData }))}
                        onComplete={(id) => {
                            onChangeTemplate(id);
                            setTemplateModalOpen(false);
                        }}
                        onBack={() => setTemplateModalOpen(false)}
                        backLabel="Back to Editor"
                    />
                )}

                <AnimatePresence>
                    {isDraftExplorerOpen && (
                        <DraftExplorer
                            drafts={drafts}
                            onClose={() => setIsDraftExplorerOpen(false)}
                            onSwitch={onSwitchProject}
                            onRename={handleRenameDraft}
                            onDelete={handleDeleteDraft}
                            currentId={resumeId}
                        />
                    )}
                </AnimatePresence>



                {isFullScreenStep ? (
                    <div key={resumeId} style={{ width: '100%', minHeight: '100vh', background: '#ffffff' }}>
                        <div style={{ width: '100%', height: '100%' }}>
                            {renderStep()}
                        </div>
                    </div>
                ) : (
                    <div className={`zety-layout-wrapper ${isMobile ? 'mobile-mode' : ''} ${(isMobile && isMobileMenuOpen) ? 'nav-open' : ''}`}>
                        <AnimatePresence>
                            {isMobile && isMobileMenuOpen && !isDraftExplorerOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="mobile-nav-backdrop"
                                    style={{
                                        position: 'fixed',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'rgba(15, 23, 42, 0.4)',
                                        zIndex: 4000
                                    }}
                                />
                            )}
                        </AnimatePresence>
                        <AnimatePresence mode="wait">
                            {((!isMobile) || (isMobile && isMobileMenuOpen && !isDraftExplorerOpen)) && (
                                <motion.aside
                                    initial={isMobile ? { x: -320 } : { x: -100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={isMobile ? { x: -320 } : { x: -100, opacity: 0 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className={`zety-left-nav ${isMobile ? 'mobile-sidebar' : ''}`}
                                >
                                    {isMobile && (
                                        <button
                                            className="close-mobile-menu"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <X size={24} />
                                        </button>
                                    )}
                                    <div 
                                        className="brand-logo cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => setNavTarget('/')}
                                    >
                                        <ResumyLogo size={32} />
                                    </div>

                                    <div className="sidebar-section-label">Resume Progress</div>
                                    <div className="nav-items-container">
                                        {sidebarSteps.map((s, index) => {
                                            const isActive = isStepActive(s.id);
                                            const isCompleted = isStepCompleted(s.id);
                                            const stepNumber = index + 1;

                                            return (
                                                <motion.div
                                                    key={s.id}
                                                    className={`nav-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${(!data.visitedSteps?.includes(s.id) && !isActive && !isCompleted) ? 'disabled' : ''}`}
                                                    onClick={() => {
                                                        // Basic validation: moving forward from step 1
                                                        if (step === 1 && s.id > 1) {
                                                            if (!validateStep1()) {
                                                                if (isMobile) {
                                                                    setIsMobileMenuOpen(false);
                                                                    scrollToFirstError();
                                                                }
                                                                return;
                                                            }
                                                        }

                                                        // Only allow navigation to visited steps OR current step OR completed steps
                                                        const isVisited = data.visitedSteps?.includes(s.id);
                                                        if (isVisited || isActive || isCompleted) {
                                                            setStep(s.id);
                                                            setIsQuickEdit(false);
                                                            if (isMobile) setIsMobileMenuOpen(false);
                                                        }
                                                    }}
                                                    whileHover={!(isActive || isCompleted || data.visitedSteps?.includes(s.id)) ? {} : { x: 4 }}
                                                    style={{
                                                        cursor: (data.visitedSteps?.includes(s.id) || isActive || isCompleted) ? 'pointer' : 'not-allowed',
                                                        opacity: (data.visitedSteps?.includes(s.id) || isActive || isCompleted) ? 1 : 0.5
                                                    }}
                                                >
                                                    <div className="icon-box">
                                                        {isCompleted ? <Check size={18} strokeWidth={3} /> : <s.icon size={18} strokeWidth={isActive ? 2.5 : 2} />}
                                                    </div>
                                                    <div className="flex flex-col items-start leading-tight">
                                                        <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: isActive ? 0.9 : 0.4, color: isActive ? 'var(--gap-primary)' : 'inherit' }}>Step 0{stepNumber}</span>
                                                        <span className="nav-label" style={{ fontWeight: isActive ? 800 : 600 }}>{s.label}</span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    <div style={{ flex: 1 }} />

                                    <div className="secondary-nav">
                                        {!jobId && (
                                            <button onClick={() => setNavTarget('/resumy/resume-creator')} className="secondary-nav-btn">
                                                <User size={14} strokeWidth={2.5} /> <span>Home</span>
                                            </button>
                                        )}
                                        {jobId && (
                                            <div className="px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-2">
                                                <ShieldCheck size={14} className="text-emerald-600" />
                                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Drive Active</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="sidebar-section-label">Active Project</div>
                                    {renderDraftSwitcher()}



                                </motion.aside>
                            )}
                        </AnimatePresence>

                        {/* NEW PREMIUM MOBILE NAVBAR (MOVED OUTSIDE MAIN) */}
                        {isMobile && !isDraftExplorerOpen && (
                            <div className="mobile-form-navbar">
                                <div className="mobile-navbar-content">
                                    <button className="navbar-btn menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
                                        <Menu size={20} />
                                    </button>
                                    <div className="navbar-title-container">
                                        <span className="navbar-step-text">Step 0{sidebarSteps.findIndex(s => isStepActive(s.id)) + 1} of 07</span>
                                        <div className="navbar-title">
                                            {allSteps.find(s => s.id === step)?.label || "Header"}
                                        </div>
                                    </div>
                                    <button className="navbar-btn preview-btn" onClick={() => setPreviewOpen(true)}>
                                        <Eye size={20} />
                                    </button>
                                </div>
                                <div className="navbar-progress-track">
                                    <motion.div
                                        className="navbar-progress-bar"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((sidebarSteps.findIndex(s => isStepActive(s.id)) + 1) / sidebarSteps.length) * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        )}

                        <main className={`zety-center-form ${(isMobile && isMobileMenuOpen) ? 'pointer-events-none' : ''} ${(isMobile && isDraftExplorerOpen) ? 'opacity-0 pointer-events-none' : ''}`} style={{ position: 'relative' }}>
                            {isSaving && (
                                <div style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    color: '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    zIndex: 50,
                                    background: 'rgba(255,255,255,0.8)',
                                    padding: '4px 8px',
                                    borderRadius: '4px'
                                }}>
                                    <RefreshCcw size={10} className="animate-spin" />
                                    Saving changes...
                                </div>
                            )}
                            <AnimatePresence mode="wait">
                                {(() => {
                                    const currentStepObj = allSteps.find(s => s.id === step) || allSteps.find(s => s.label === "Finalize");
                                    const stepKey = currentStepObj?.sectionId || currentStepObj?.label || step;
                                    console.log(`[FormPanel] Rendering Step: id=${step}, label=${currentStepObj?.label}, key=${stepKey}`);

                                    return (
                                        <motion.div
                                            key={`${resumeId}-${stepKey}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.15, ease: "linear" }}
                                        >
                                            {renderStep()}
                                        </motion.div>
                                    );
                                })()}
                            </AnimatePresence>
                        </main>

                        {/* Right Preview */}
                        {!isFullScreenStep && !isMobile && (
                            <div className="zety-right-preview">
                                <div className="preview-header">
                                    <div className="preview-label" style={{ whiteSpace: 'nowrap' }}>
                                        <BarChart2 size={14} /> LIVE PREVIEW
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '10px', // Slightly smaller font
                                            fontWeight: 800,
                                            color: 'var(--gap-text-muted)',
                                            cursor: 'pointer',
                                            padding: '5px 8px',
                                            background: '#f1f5f9',
                                            borderRadius: '6px',
                                            whiteSpace: 'nowrap' // Prevent wrapping
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={pdfMode === 'paged'}
                                                onChange={(e) => setPdfMode(e.target.checked ? 'paged' : 'full')}
                                                style={{ width: '13px', height: '13px', cursor: 'pointer' }}
                                            />
                                            PAGE BREAKS
                                        </label>
                                        <button className="btn-change-template" onClick={() => setTemplateModalOpen(true)}>
                                            <Layout size={14} /> Templates
                                        </button>
                                    </div>
                                </div>

                                <div className="preview-card" onClick={() => setPreviewOpen(true)}>
                                    <div className="scale-wrapper">
                                        <ResumeRenderer
                                            data={data}
                                            templateId={safeTemplateId}
                                            showPageBreaks={pdfMode === 'paged'}
                                            scale={0.42}
                                            currentStep={step}
                                            isFormPanel={true}
                                            hidePageGuides={true}
                                            highlightSection={
                                                step === 1 ? 'personal' :
                                                    step === 2 ? 'education' :
                                                        step === 3 ? 'experience' :
                                                            step === 4 ? 'skills' :
                                                                step === 5 ? 'summary' :
                                                                    step >= 7 ? allSteps.find(s => s.id === step)?.sectionId : null
                                            }
                                        />
                                    </div>
                                    <div className="preview-hover-overlay">
                                        <div className="preview-hover-content">
                                            <Maximize2 size={18} />
                                            <span>Full Screen Preview</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: 32, width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <button className="btn-next outlined" style={{ width: '100%' }} onClick={() => setPreviewOpen(true)}>
                                        <Maximize2 size={16} /> Fullscreen View
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
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

                {/* FIRST TIME USER ONBOARDING */}
                {resumeId && step === 1 && !isQuickEdit && isLoadedFromDB && !isSwitching && !isDraftExplorerOpen && (
                    <OnboardingGuide
                        isMobile={isMobile}
                        resumeId={resumeId}
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
                    />
                )}
                                {isCropping && tempPhoto && (
                    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 100000 }}>
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-stone-900/90 backdrop-blur-xl"
                            onClick={() => {
                                setIsCropping(false);
                                setTempPhoto(null);
                            }}
                        />
                        
                        {/* Nuclear Image Reset - Injected into Head */}
                        <style dangerouslySetInnerHTML={{ __html: `
                            .react-easy-crop_image {
                                max-width: none !important;
                                max-height: none !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                border: none !important;
                                box-shadow: none !important;
                                object-fit: none !important;
                            }
                        `}} />

                        <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col h-[700px] max-h-[90vh]">
                            {/* Header */}
                            <div className="p-6 border-bottom border-stone-100 flex items-center justify-between bg-white">
                                <div>
                                    <h3 className="text-xl font-black text-stone-900 tracking-tighter">Premium Photo Editor</h3>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">Refine your professional appearance</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        setIsCropping(false);
                                        setTempPhoto(null);
                                    }}
                                    className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-stone-400" />
                                </button>
                            </div>

                            {/* Viewport - Explicit Fixed Height */}
                            <div className="flex-1 relative bg-black overflow-hidden">
                                <Cropper
                                    image={tempPhoto}
                                    crop={data.personal?.crop || { x: 0, y: 0 }}
                                    zoom={data.personal?.zoom || 1}
                                    aspect={1}
                                    onCropChange={(c) => setData(prev => ({ 
                                        ...prev, 
                                        personal: { ...(prev.personal || {}), crop: c } 
                                    }))}
                                    onZoomChange={(z) => setData(prev => ({ 
                                        ...prev, 
                                        personal: { ...(prev.personal || {}), zoom: z } 
                                    }))}
                                    onCropComplete={(_, pc) => setPixelCrop(pc)}
                                    cropShape={data.personal?.cropShape === 'circle' ? 'round' : 'rect'}
                                    showGrid={false}
                                />
                            </div>

                            {/* Controls */}
                            <div className="p-8 bg-white border-top border-stone-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end mb-8">
                                    {/* Frame Shape Toggle */}
                                    <div>
                                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 block">Frame Style</label>
                                        <div className="flex bg-stone-50 p-1 rounded-xl border border-stone-100">
                                            <button
                                                onClick={() => setData(prev => ({ 
                                                    ...prev, 
                                                    personal: { ...(prev.personal || {}), cropShape: 'square' } 
                                                }))}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${(!data.personal?.cropShape || data.personal?.cropShape === 'square') ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-400'}`}
                                            >
                                                <Square size={14} /> Square
                                            </button>
                                            <button
                                                onClick={() => setData(prev => ({ 
                                                    ...prev, 
                                                    personal: { ...(prev.personal || {}), cropShape: 'circle' } 
                                                }))}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${(data.personal?.cropShape === 'circle') ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-400'}`}
                                            >
                                                <Circle size={14} /> Circle
                                            </button>
                                        </div>
                                    </div>

                                    {/* Zoom Control */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Zoom Level</label>
                                            <span className="text-xs font-black text-blue-600">
                                                {Math.round((data.personal?.zoom || 1) * 100)}%
                                            </span>
                                        </div>
                                        <input 
                                            type="range"
                                            min={1}
                                            max={3}
                                            step={0.01}
                                            value={data.personal?.zoom || 1}
                                            onChange={(e) => setData(prev => ({ 
                                                ...prev, 
                                                personal: { ...(prev.personal || {}), zoom: parseFloat(e.target.value) } 
                                            }))}
                                            className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => {
                                            setIsCropping(false);
                                            setTempPhoto(null);
                                        }}
                                        className="flex-1 py-4 text-stone-500 font-bold text-sm bg-stone-50 hover:bg-stone-100 rounded-2xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            if (!pixelCrop) return;
                                            try {
                                                const cropped = await getCroppedImg(
                                                    tempPhoto,
                                                    pixelCrop,
                                                    0,
                                                    { horizontal: false, vertical: false },
                                                    data.personal?.cropShape || 'square'
                                                );
                                                setData(prev => ({ 
                                                    ...prev, 
                                                    personal: { 
                                                        ...(prev.personal || {}), 
                                                        photo: cropped,
                                                        originalPhoto: tempPhoto
                                                    } 
                                                }));
                                                setIsCropping(false);
                                                setTempPhoto(null);
                                            } catch (e) { console.error(e); }
                                        }}
                                        className="flex-[1.5] py-4 bg-stone-900 text-white font-black text-sm rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                                    >
                                        <Sparkles size={18} fill="currentColor" />
                                        Save Changes
                                    </button>
                                </div>
                                <div className="flex items-center justify-center gap-1.5 mt-6 text-[9px] font-black text-stone-300 uppercase tracking-widest">
                                    <ShieldCheck size={12} className="text-emerald-400" /> AI-Optimized Image Processing
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Modal for Template Selection */}
                <AnimatePresence>
                    {isTemplateModalOpen && (
                        <PremiumTemplateSelection
                            userId={userId}
                            data={data}
                            onUpdateData={setData}
                            onComplete={(id) => {
                                onChangeTemplate(id);
                                setTemplateModalOpen(false);
                            }}
                            onBack={() => setTemplateModalOpen(false)}
                            projectTitle={propTitle}
                            onUpdateTitle={(newTitle) => onRenameProject(resumeId, newTitle)}
                            backLabel="Resume Builder"
                        />
                    )}
                </AnimatePresence>

                {/* Draft Explorer Modal */}
                <DraftExplorer
                    isOpen={isDraftExplorerOpen}
                    onClose={() => setIsDraftExplorerOpen(false)}
                    drafts={drafts}
                    currentResumeId={resumeId}
                    onSelectDraft={(draft) => onSwitchProject(draft)}
                    onRenameDraft={handleRenameDraft}
                    onDeleteDraft={handleDeleteDraft}
                    onStartNew={() => window.location.href = '/resumy/resume-creator'}
                    isMobile={isMobile}
                />

                {/* Switching Loader */}
                <AnimatePresence>
                    {isSwitching && <DraftSwitchLoader text="Switching Draft" />}
                </AnimatePresence>
            </div>
        </div>
    );
};
