"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ResumyLogo from './Logo';
import Link from "next/link";
import Image from "next/image";
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import {
    Plus, Trash2, Camera, User, Mail, Phone, MapPin,
    Globe, Linkedin, Github, ChevronDown, ChevronUp, Check, Save,
    Layout, FileText, Download, Briefcase, GraduationCap,
    Wand2, Search, Trash, Eye, Settings, LogOut, ChevronRight,
    Zap, Star, Award, MessageSquare, Menu, X, ArrowLeft, ArrowRight,
    Layers, Grid, List, Type, Palette, MoreHorizontal, Shield, Clock,
    AlertCircle, Cpu, UploadCloud, Maximize2, RefreshCw, Info, Users, Heart,
    BarChart2, Sparkles, ChevronLeft, Loader2, Cloud, CheckCircle2, RefreshCcw, ShieldCheck, Navigation,
    Square, Circle, Hexagon, Diamond, Sun, Moon
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    LOCATION_DATA, TITLE_SUGGESTIONS, toTitleCase,
    auditEmail, suggestEmail, formatSocialLink, reverseGeocode, getAIHeaderAdvice,
    fetchAllCountries, fetchStatesForCountry, fetchCitiesForState, findCountryByPhone
} from "./HeaderIntelligence";
import "./form.css";
import "./form-header.css";
import "./form-v2.css";



// Shared client used from @/lib/supabaseClient

// --- VALIDATED INPUT COMPONENT (AI ENHANCED) ---
const ValidatedInput = ({ label, value = "", onChange, onBlur, onFocus, placeholder = "", type = "text", error, required, aiSuggestion, isLoading, compactAi, isAiraUpdating, disabled }) => {
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
                <label className="form-label m-0 truncate flex-1">{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
                {hasActiveAISuggestion && (
                    <div className="flex items-center gap-1.5 animate-pulse bg-[var(--accent-light)] px-2 py-0.5 rounded-full border border-[var(--accent-glow)] shadow-sm shrink-0 max-w-[50%]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]" />
                        {!compactAi && <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest truncate">AI SUGGESTED</span>}
                    </div>
                )}
            </div>
            <div className="zety-relative-container" style={{ position: 'relative' }}>
                <input
                    className={`input-v2 transition-all duration-300 relative z-10 ${hasActiveAISuggestion ? 'ai-glow-border' : ''} ${isAiraUpdating ? 'aira-field-glow' : ''}`}
                    type={type}
                    value={strValue}
                    onChange={onChange}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    placeholder={hasActiveAISuggestion ? "" : placeholder}
                    style={{
                        ...(error ? { borderColor: '#ef4444', backgroundColor: '#fff5f5' } : {}),
                        paddingRight: '64px',
                        background: 'transparent'
                    }}
                    disabled={disabled}
                />

                {showGhost && (
                    <div
                        className="absolute left-[17px] top-1/2 -translate-y-1/2 pointer-events-none z-20 whitespace-pre overflow-hidden pr-20"
                        style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px' }}
                    >
                        <span className="opacity-0">{strValue}</span>
                        <span className="text-[var(--accent)] opacity-40 font-medium">{aiStr.substring(strValue.length)}</span>
                    </div>
                )}


                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-30 pointer-events-auto">
                    {hasActiveAISuggestion && (
                        <button
                            onMouseDown={(e) => {
                                e.preventDefault();
                                onChange({ target: { value: aiStr } });
                            }}
                            className="bg-[var(--accent)] text-white p-1.5 rounded-lg shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer border-0 ring-4 ring-white flex items-center justify-center"
                            title="Accept AI"
                        >
                            <Sparkles size={13} fill="currentColor" />
                        </button>
                    )}
                    {isValid && !hasActiveAISuggestion && strValue.trim().length > 0 && (
                        <div className="valid-tick">
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

const EXTRA_SECTION_CONFIG = [
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

export default function FormPanelV2({ data, setData, templateId, onChangeTemplate, resume_id: propResumeId, builder_resume_id, jobId, title: propTitle, onSwitchProject, onRenameProject, onIdCreated, onSyncUrl }) {
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
    const [isAiraExpanded, setIsAiraExpanded] = useState(false);
    const [toast, setToast] = useState(null); // { message: string, type: 'error' | 'success' | 'info' }
    
    // Aira Assistant State
    const [airaInput, setAiraInput] = useState("");
    const [airaMessages, setAiraMessages] = useState([
        { role: 'assistant', text: "Hi! I'm Aira. I can help you fill out your resume, improve your writing, or suggest better bullet points. What can I do for you?" }
    ]);
    const [airaStatus, setAiraStatus] = useState(""); // e.g., "Updating Header..."
    const [isAiraThinking, setIsAiraThinking] = useState(false);
    const [updatedFields, setUpdatedFields] = useState(new Set());
    const [airaChoices, setAiraChoices] = useState([]); // Quick-reply buttons
    const airaChatRef = useRef(null);

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
    const [isGeoLoading, setIsGeoLoading] = useState(false);
    const [isPresenceExpanded, setIsPresenceExpanded] = useState(false);
    const [removedBgUrl, setRemovedBgUrl] = useState(null);  // transparent PNG after bg removal
    const [isRemovingBg, setIsRemovingBg] = useState(false);

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

    // Auto-scroll Aira Chat
    useEffect(() => {
        if (airaChatRef.current) {
            airaChatRef.current.scrollTop = airaChatRef.current.scrollHeight;
        }
    }, [airaMessages, airaStatus]);



    const handleSendAiraMessage = async (overrideMessage = null) => {
        const userMsg = typeof overrideMessage === 'string' ? overrideMessage : airaInput;
        if (!userMsg.trim() || isAiraThinking) return;

        setAiraInput(""); // Clear immediately
        setAiraChoices([]); // Clear previous choices 
        setIsAiraThinking(true);
        setAiraStatus("Aira is thinking...");
        setAiraMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsAiraExpanded(true); // Open panel to show history/status

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/api/aira-v2/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    data: data, // Current resume state
                    history: airaMessages.slice(-5), // Send last 5 turns for context
                    stream: true
                })
            });

            if (!response.ok) throw new Error('Aira service failed');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let buffer = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                
                // Keep the last partial line in the buffer
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6).trim();
                        if (dataStr === '[DONE]') break;

                        try {
                            const parsed = JSON.parse(dataStr);
                            console.log("[Aira SSE] Parsed packet:", parsed);
                            
                                if (parsed.type === 'status') {
                                    setAiraStatus(parsed.message);
                                    if (parsed.navigation) setStep(parsed.navigation);
                                } else if (parsed.type === 'patch' || parsed.type === 'final') {
                                    if (parsed.navigation) setStep(parsed.navigation);
                                        if (parsed.choices) {
                                            setAiraChoices(parsed.choices);
                                        }

                                        if (parsed.patch) {
                                            console.log(`[Aira] Applying ${parsed.type} patch:`, JSON.stringify(parsed.patch, null, 2));
                                            
                                            // 1. Identify which section and fields to glow
                                            const sectionKey = Object.keys(parsed.patch)[0];
                                            let fieldsToGlow = [];
                                            
                                            if (sectionKey) {
                                                const subPatch = parsed.patch[sectionKey];
                                                if (subPatch.items && Array.isArray(subPatch.items)) {
                                                    // If it's a list update, glow all fields mentioned in the first new item
                                                    fieldsToGlow = subPatch.items[0] ? Object.keys(subPatch.items[0]) : [];
                                                } else {
                                                    fieldsToGlow = Object.keys(subPatch);
                                                }
                                            }
                                            
                                            setUpdatedFields(prev => new Set([...prev, ...fieldsToGlow]));
                                        
                                        // 2. Update data
                                        setData(prev => {
                                            const next = { ...prev };
                                            for (const [sec, p] of Object.entries(parsed.patch)) {
                                                if (Array.isArray(next[sec])) {
                                                    // List sections (Education, Experience)
                                                    if (p.items && Array.isArray(p.items)) {
                                                        // Aira returns the COMPLETE list for array sections now
                                                        // to support adding AND removing.
                                                        next[sec] = p.items;
                                                    } else {
                                                        // Single item update for a list section (MVP: update first)
                                                        if (next[sec].length === 0) next[sec] = [{}];
                                                        next[sec][0] = { ...next[sec][0], ...p };
                                                    }
                                                } else {
                                                    // Object sections (Personal)
                                                    next[sec] = { ...(next[sec] || {}), ...p };
                                                }
                                            }
                                            return next;
                                        });

                                        // 3. Remove glow after animation completes
                                        setTimeout(() => {
                                            setUpdatedFields(prev => {
                                                const next = new Set(prev);
                                                fieldsToGlow.forEach(f => next.delete(f));
                                                return next;
                                            });
                                        }, 3500);
                                    }

                                    if (parsed.type === 'final') {
                                        // Final prose from Supervisor
                                        setAiraMessages(prev => [...prev, { role: 'assistant', text: parsed.content || "I've updated those details for you!" }]);
                                        setAiraStatus(""); // Clear status on completion
                                    }
                                }
                        } catch (e) {
                            console.error("[Aira] Skip malformed SSE line:", dataStr, e);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("[Aira] Error:", err);
            setAiraMessages(prev => [...prev, { role: 'assistant', text: "I'm sorry, I hit a snag while processing that. Could you try again?" }]);
            setAiraStatus("");
        } finally {
            setIsAiraThinking(false);
        }
    };

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
                            // Calculate correct finalize ID for THIS specific data
                            const activeExtras = EXTRA_SECTION_CONFIG.filter(s => normalized.selectedExtraSections?.[s.id]);
                            setStep(7 + activeExtras.length);
                        } else if (!isNaN(urlStep) && urlStep > 0) {
                            // If we have a step, let's use it, but bound it
                            const activeExtras = EXTRA_SECTION_CONFIG.filter(s => normalized.selectedExtraSections?.[s.id]);
                            const maxStep = 7 + activeExtras.length;
                            setStep(Math.min(urlStep, maxStep));
                        } else if (existing.last_step_index) {
                            const activeExtras = EXTRA_SECTION_CONFIG.filter(s => normalized.selectedExtraSections?.[s.id]);
                            const maxStep = 7 + activeExtras.length;
                            if (existing.last_step_index === 7) setStep(maxStep);
                            else setStep(Math.min(existing.last_step_index, maxStep));
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
                            last_step_index: getDBStepIndex(step),
                            updated_at: new Date().toISOString()
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
                last_step_index: getDBStepIndex(step),
                updated_at: new Date().toISOString()
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
        const { error } = await supabaseClient.from('builder_resumes').update({ 
            title: newTitle,
            updated_at: new Date().toISOString()
        }).eq('id', id);
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

            // Don't upscale beyond 1.0 to keep it "true to size" relative to the design
            if (newScale > 1.0) newScale = 1.0;

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

    const activeExtraSteps = [];
    if (data.selectedExtraSections) {
        EXTRA_SECTION_CONFIG.forEach(section => {
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
    // NOTE: SuccessStep is DISABLED — successStepId === finalizeStepId so navigation skips it entirely
    const finalizeStepId = 7 + activeExtraSteps.length;
    const successStepId = finalizeStepId; // DISABLED: points directly to Finalize

    // SuccessStep intentionally NOT pushed to allSteps (disabled but not deleted)
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
            // User requested to keep extra sections (step > 6) as step=6 in URL
            const urlStepValue = (step > 6 && step < finalizeStepId) ? 6 : step;
            onSyncUrl(isFinalize ? 'finalize' : 'editor', null, resumeId || builder_resume_id, isFinalize ? null : urlStepValue);
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
        const sectionConfig = EXTRA_SECTION_CONFIG.find(s => s.id === sectionId);
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
            EXTRA_SECTION_CONFIG.forEach(section => {
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
            console.error(`[FormPanel] FAILED to find sectionId ${sectionId} in EXTRA_SECTION_CONFIG`);
        }
    };



    const activeStepObj = allSteps.find(s => s.id === step) ||
        (step >= finalizeStepId ? allSteps.find(s => s.label === "Finalize") : allSteps[0]);

    // SuccessStep is disabled — "Success" label will never be reached
    const isFullScreenStep = activeStepObj?.label === "Finalize";
    const showSidebar = !isFullScreenStep;

    // --- SMART INTELLIGENCE HANDLERS ---
    const handleTitleIntelligence = async (val) => {
        setData(prev => ({ ...prev, personal: { ...(prev.personal || {}), jobTitle: val } }));

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
            showToast('Geolocation is not supported by your browser.', 'error');
            return;
        }

        setIsGeoLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`[GEO] Coords: ${latitude}, ${longitude}`);

                try {
                    // Use BigDataCloud free reverse geocoding — no API key needed
                    const res = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );

                    if (!res.ok) throw new Error('Geocoding API failed');
                    const geo = await res.json();

                    console.log('[GEO] BigDataCloud response:', geo);

                    const city = geo.city || geo.locality || geo.localityInfo?.informative?.find(i => i.description === 'city')?.name || '';
                    const state = geo.principalSubdivision || '';
                    const countryName = toTitleCase(geo.countryName || '');
                    const countryCode = geo.countryCode || '';

                    // Look up phone code from our LOCATION_DATA
                    const countryEntry = LOCATION_DATA[countryName];
                    const phoneCode = countryEntry?.phoneCode || null;

                    setData(prev => ({
                        ...prev,
                        personal: {
                            ...(prev.personal || {}),
                            city: city ? toTitleCase(city) : (prev.personal?.city || ''),
                            state: state ? toTitleCase(state) : (prev.personal?.state || ''),
                            country: countryName || (prev.personal?.country || ''),
                            ...(phoneCode ? { phoneCode } : {})
                        }
                    }));

                    // Trigger state/city list loading for the detected country
                    if (countryName) {
                        const states = await fetchStatesForCountry(countryName);
                        setStatesList(states);
                    }

                    setLocationSuggestions({ city: null, state: null, country: null, zipCode: null, phoneCode: null });
                    showToast(`📍 Location detected: ${city ? `${toTitleCase(city)}, ` : ''}${countryName}`, 'success');
                } catch (err) {
                    console.error('[GEO] Reverse geocoding failed:', err);
                    showToast('Could not detect your location. Please try again or enter manually.', 'error');
                } finally {
                    setIsGeoLoading(false);
                }
            },
            (err) => {
                console.error('[GEO] Permission/Error:', err);
                const msg = err.code === 1
                    ? 'Location access denied. Please allow location access in your browser settings.'
                    : 'Could not retrieve your location. Please enter it manually.';
                showToast(msg, 'error');
                setIsGeoLoading(false);
            },
            { timeout: 10000, maximumAge: 60000 }
        );
    };

    const handleRemoveBg = async (photoSrc) => {
        if (isRemovingBg) return;
        if (removedBgUrl) return;
        setIsRemovingBg(true);
        try {
            // Explicitly fetch and convert to blob to ensure compatibility
            const res = await fetch(photoSrc);
            const inputBlob = await res.blob();
            // Using local models at version 1.4.5 for guaranteed compatibility.
            // Pointing directly to our /resumy/models folder.
            const { removeBackground } = await import('@imgly/background-removal');
            
            const resultBlob = await removeBackground(inputBlob, { 
                output: { format: 'image/png', quality: 0.9 },
                publicPath: `${window.location.origin}/resumy/models/`
            });
            
            setRemovedBgUrl(URL.createObjectURL(resultBlob));
        } catch (err) {
            console.error('[BG REMOVE] Failed:', err);
            // Fallback: search for the error message or common issues
            const errorMessage = err?.message || String(err);
            if (errorMessage.includes('replace') || errorMessage.includes('URL')) {
                showToast('Background removal setup error. Please try again.', 'error');
            } else {
                showToast('Background removal failed. Please try again.', 'error');
            }
        } finally {
            setIsRemovingBg(false);
        }
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
                            city: null,
                            state: parsed.state || null,
                            country: countryName || null,
                            phoneCode: countryEntry?.phoneCode || parsed.phoneCode || null
                        }));
                    }
                } catch (e) { }
            }
        } else if (formatted.length === 0) {
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
            (step >= finalizeStepId ? allSteps.find(s => s.label === "Finalize") : null);

        if (!currentStepObj) return null;

        // 1. DYNAMIC STEP HANDLING (Finalize)
        // SuccessStep is disabled — "Success" label will never be reached
        // if (currentStepObj.label === "Success") { /* DISABLED */ }

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
                    designSettings={data.designSettings}
                />
            );
        }

        // 2. CORE FLOW STEPS
        switch (step) {
            case 1:
                return (
                    <div className="form-section-page active">
                        <div className="section-head-v2" style={{ marginBottom: '40px' }}>
                            <div className="fsp-title">Basics</div>
                            <div className="fsp-sub">Professional identity and contact information.</div>
                        </div>

                        <div className="basics-grid">
                            {/* BLOCK 1: IDENTITY */}
                            <div className="form-card-v2">
                                <div className="card-header-v2">
                                    <User className="card-icon-v2" size={14} />
                                    <span className="card-title-v2">Identity</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            width: '90px', height: '90px', borderRadius: '12px',
                                            background: 'var(--bg2)', border: '1px solid var(--border)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            overflow: 'hidden', cursor: 'pointer'
                                        }} onClick={() => fileInputRef.current.click()}>
                                            {data.personal?.photo ? (
                                                <img src={data.personal.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ textAlign: 'center', color: 'var(--text3)' }}>
                                                    <Camera size={24} strokeWidth={1.5} />
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                                            style={{
                                                position: 'absolute', bottom: '-4px', right: '-4px',
                                                width: '24px', height: '24px', borderRadius: '50%',
                                                background: 'var(--text)', color: 'white', border: '1.5px solid white',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            <Plus size={12} />
                                        </button>
                                        <input type="file" ref={fileInputRef} hidden onChange={handleImageUpload} accept="image/*" />
                                    </div>
                                    <ValidatedInput 
                                        label="Full Name" 
                                        value={data.personal?.name} 
                                        required 
                                        error={headerErrors.name}
                                        onChange={(e) => { setHeaderErrors(p => ({ ...p, name: null })); setData(prev => ({ ...prev, personal: { ...prev.personal, name: e.target.value } })) }}
                                        onBlur={(e) => { const fixed = toTitleCase(e.target.value); setData(prev => ({ ...prev, personal: { ...prev.personal, name: fixed } })); }}
                                        placeholder="Arjun Kapoor"
                                        isAiraUpdating={updatedFields.has('name')}
                                        disabled={isAiraThinking}
                                    />
                                </div>
                                <ValidatedInput 
                                    label="Professional Title" 
                                    value={data.personal?.jobTitle} 
                                    onChange={(e) => handleTitleIntelligence(e.target.value)}
                                    onBlur={(e) => { const fixed = toTitleCase(e.target.value); setData(prev => ({ ...prev, personal: { ...prev.personal, jobTitle: fixed } })); setTimeout(() => setSuggestedTitles([]), 200); }}
                                    placeholder="e.g. Technical Lead"
                                    aiSuggestion={suggestedTitles.length > 0 ? suggestedTitles[0] : null}
                                    isLoading={isAiThinking.title}
                                    isAiraUpdating={updatedFields.has('jobTitle')}
                                    disabled={isAiraThinking}
                                />
                            </div>

                            {/* BLOCK 2: COMMUNICATION */}
                            <div className="form-card-v2">
                                <div className="card-header-v2">
                                    <Mail className="card-icon-v2" size={14} />
                                    <span className="card-title-v2">Communication</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <ValidatedInput label="Email Address" required error={headerErrors.email} value={data.personal?.email} type="email" onChange={(e) => { setHeaderErrors(p => ({ ...p, email: null })); handleEmailIntelligence(e.target.value); }} placeholder="arjun@email.com" isAiraUpdating={updatedFields.has('email')} disabled={isAiraThinking} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '16px' }}>
                                        <ValidatedInput label="Code" value={data.personal?.phoneCode} onChange={(e) => { setData(prev => ({ ...prev, personal: { ...prev.personal, phoneCode: e.target.value } })); handlePhoneIntelligence(e.target.value); }} placeholder="+91" compactAi isAiraUpdating={updatedFields.has('phoneCode')} disabled={isAiraThinking} />
                                        <ValidatedInput label="Phone Number" value={data.personal?.phone} type="tel" onChange={(e) => { const val = e.target.value; if (val === '' || /^[\d\s-()]*$/.test(val)) { setData(prev => ({ ...prev, personal: { ...prev.personal, phone: val } })); handlePhoneIntelligence(val); } }} placeholder="98765 43210" isAiraUpdating={updatedFields.has('phone')} disabled={isAiraThinking} />
                                    </div>
                                </div>
                            </div>

                            {/* BLOCK 3: LOCATION */}
                            <div className="form-card-v2">
                                <div className="card-header-v2">
                                    <MapPin className="card-icon-v2" size={14} />
                                    <span className="card-title-v2" style={{ flex: 1 }}>Location</span>
                                    <button onClick={handleGeolocation} disabled={isGeoLoading} style={{ background: 'var(--bg2)', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 900, color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {isGeoLoading ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
                                        {isGeoLoading ? 'Detecting...' : 'Auto Detect'}
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div className="relative group">
                                        <ValidatedInput label="City" value={data.personal?.city} onChange={(e) => handleCityIntelligence(e.target.value)} placeholder="Mumbai" isLoading={isAiThinking.city} isAiraUpdating={updatedFields.has('city')} disabled={isAiraThinking} />
                                        {citiesList.length > 0 && <div className="hidden group-focus-within:block absolute top-[100%] left-0 w-full z-[100] bg-white border border-stone-200 rounded-lg shadow-2xl max-h-40 overflow-y-auto mt-1 p-1">
                                            {citiesList.filter(c => !data.personal.city || c.toLowerCase().includes(data.personal.city.toLowerCase())).slice(0, 30).map(c => (
                                                <button key={c} onMouseDown={() => setData(prev => ({ ...prev, personal: { ...prev.personal, city: c } }))} className="w-full text-left px-3 py-1.5 hover:bg-stone-50 text-[11px] font-bold rounded-md">{c}</button>
                                            ))}
                                        </div>}
                                    </div>
                                    <div className="relative group">
                                        <ValidatedInput label="State / Province" value={data.personal?.state} onChange={(e) => handleStateIntelligence(e.target.value)} placeholder="Maharashtra" isLoading={isAiThinking.state} isAiraUpdating={updatedFields.has('state')} disabled={isAiraThinking} />
                                        {statesList.length > 0 && <div className="hidden group-focus-within:block absolute top-[100%] left-0 w-full z-[100] bg-white border border-stone-200 rounded-lg shadow-2xl max-h-40 overflow-y-auto mt-1 p-1">
                                            {statesList.filter(s => !data.personal.state || s.toLowerCase().includes(data.personal.state.toLowerCase())).slice(0, 30).map(s => (
                                                <button key={s} onMouseDown={() => setData(prev => ({ ...prev, personal: { ...prev.personal, state: s } }))} className="w-full text-left px-3 py-1.5 hover:bg-stone-50 text-[11px] font-bold rounded-md">{s}</button>
                                            ))}
                                        </div>}
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '20px' }}>
                                    <ValidatedInput label="Zip Code" value={data.personal?.zipCode} onChange={(e) => handleZipIntelligence(e.target.value)} placeholder="400001" isAiraUpdating={updatedFields.has('zipCode')} disabled={isAiraThinking} />
                                    <div className="relative group">
                                        <ValidatedInput label="Country" value={data.personal?.country} onChange={(e) => handleCountryIntelligence(e.target.value)} placeholder="India" isLoading={isAiThinking.country} isAiraUpdating={updatedFields.has('country')} disabled={isAiraThinking} />
                                        {countriesList.length > 0 && <div className="hidden group-focus-within:block absolute top-[100%] left-0 w-full z-[100] bg-white border border-stone-200 rounded-lg shadow-2xl max-h-40 overflow-y-auto mt-1 p-1">
                                            {countriesList.filter(c => !data.personal.country || c.toLowerCase().includes(data.personal.country.toLowerCase())).slice(0, 30).map(c => (
                                                <button key={c} onMouseDown={() => handleCountryIntelligence(c)} className="w-full text-left px-3 py-1.5 hover:bg-stone-50 text-[11px] font-bold rounded-md">{c}</button>
                                            ))}
                                        </div>}
                                    </div>
                                </div>
                            </div>

                            {/* BLOCK 4: WEB PRESENCE */}
                            <div className="form-card-v2">
                                <div className="card-header-v2" style={{ justifyContent: 'space-between' }}>
                                    <div className="flex items-center gap-3">
                                        <Globe className="card-icon-v2" size={14} />
                                        <span className="card-title-v2">Socials</span>
                                    </div>
                                    <div 
                                        className={`pill-toggle ${data.personal?.shortenHeaderLinks ? 'active' : ''}`}
                                        onClick={() => setData(prev => ({ ...prev, personal: { ...prev.personal, shortenHeaderLinks: !prev.personal.shortenHeaderLinks } }))}
                                    >
                                        <span className="pill-toggle-text">Simplify</span>
                                        <div className="pill-toggle-track">
                                            <div className="pill-toggle-thumb"></div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <ValidatedInput label="LinkedIn" value={data.personal?.linkedin} onChange={(e) => setData(prev => ({ ...prev, personal: { ...prev.personal, linkedin: e.target.value } }))} placeholder="linkedin.com/in/..." isAiraUpdating={updatedFields.has('linkedin')} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <ValidatedInput label="GitHub" value={data.personal?.github} onChange={(e) => setData(prev => ({ ...prev, personal: { ...prev.personal, github: e.target.value } }))} placeholder="github.com/..." isAiraUpdating={updatedFields.has('github')} />
                                        <ValidatedInput label="Portfolio" value={data.personal?.website} onChange={(e) => setData(prev => ({ ...prev, personal: { ...prev.personal, website: e.target.value } }))} placeholder="myportfolio.com" isAiraUpdating={updatedFields.has('website')} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2: return <Education data={data} setData={setData} templateId={safeTemplateId} onBack={prevStep} onNext={nextStep} onPreview={() => setPreviewOpen(true)} isQuickEdit={isQuickEdit} onReturnToDashboard={handleReturnToDashboard} isFieldSupported={() => true} currentTemplateName={currentTemplate?.name} isMobile={isMobile} airaThinking={isAiraThinking} updatedFields={updatedFields} />;
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
                // SuccessStep DISABLED: successStepId === finalizeStepId, so this branch is never hit
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
                        designSettings={data.designSettings}
                    />
                );
                return null;
        }
    };



    return (
        <div className="form-panel-v2">
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
                            <FunLoader text="Just a second.." />
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
                                        designSettings={data.designSettings}
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
                    <>
                        {/* HEADING TOPBAR (Modern Redesign) */}
                        <header className="builder-topbar">
                    <button 
                        className="btn-v2 btn-v2-ghost btn-v2-sm" 
                        onClick={() => setNavTarget('/resumy/resume-creator')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="builder-divider" />
                        <div className="builder-project-info">
                            <strong>{data.personal?.jobTitle || "Product Manager"}</strong>
                            <span style={{ margin: '0 8px', opacity: 0.3 }}>—</span>
                            <span style={{ opacity: 0.7 }}>{propTitle || data.personal?.name || "Untitled Resume"}</span>
                            <span style={{ margin: '0 8px', opacity: 0.3 }}>·</span>
                            <span style={{ opacity: 0.7 }}>{templatesConfig.find(t => t.id === safeTemplateId)?.name || "Meridian"}</span>
                        </div>
                        
                        <div className="builder-actions">
                            {!isMobile && (
                                <>
                                    <div className="builder-progress-wrap" style={{ marginRight: '16px' }}>
                                        <span className="label-caps" style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {Math.round(((sidebarSteps.findIndex(s => (s.id === step || (s.id === 6 && step > 6 && step < finalizeStepId) || (s.id === finalizeStepId && step >= finalizeStepId))) + 1) / sidebarSteps.length) * 100)}% done
                                        </span>
                                        <div className="builder-progress-bar" style={{ width: '80px', height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div 
                                                className="builder-progress-fill" 
                                                style={{ width: `${Math.round(((sidebarSteps.findIndex(s => (s.id === step || (s.id === 6 && step > 6 && step < finalizeStepId) || (s.id === finalizeStepId && step >= finalizeStepId))) + 1) / sidebarSteps.length) * 100)}%`, height: '100%', background: 'var(--accent)' }} 
                                            />
                                        </div>
                                    </div>
                                    <div 
                                        className={`pill-toggle ${pdfMode === 'paged' ? 'active' : ''}`}
                                        onClick={() => setPdfMode(pdfMode === 'paged' ? 'full' : 'paged')}
                                        style={{ marginLeft: '12px' }}
                                    >
                                        <span className="pill-toggle-text">Page Breaks</span>
                                        <div className="pill-toggle-track">
                                            <div className="pill-toggle-thumb"></div>
                                        </div>
                                    </div>
                                    <button className="btn-v2 btn-v2-ghost btn-v2-sm" onClick={() => {
                                        handleSaveDraft();
                                        showToast("Saved ✓", "success");
                                    }} style={{ fontWeight: 600 }}>Save</button>
                                    <button className="btn-v2 btn-v2-primary btn-v2-sm" onClick={() => setStep(finalizeStepId)} style={{ padding: '0 16px', background: 'var(--accent)', color: 'white', borderRadius: '8px', fontWeight: 600, height: '36px' }}>
                                        Finalise <ArrowRight size={14} style={{ marginLeft: '6px' }} />
                                    </button>
                                </>
                            )}
                        <button className="tt" onClick={() => {
                            const html = document.documentElement;
                            const currentTheme = html.getAttribute('data-theme');
                            html.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
                        }}>
                            {typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </header>

                <div className="builder-body">
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
                                    {/* Groups: RESUME SECTIONS, OPTIONAL */}
                                    <div className="sidebar-section-label">RESUME SECTIONS</div>
                                    <div className="nav-items-container">
                                        {sidebarSteps.filter(s => s.id <= 5).map((s, index) => {
                                            const isActive = isStepActive(s.id);
                                            const isCompleted = isStepCompleted(s.id);

                                            return (
                                                <div
                                                    key={s.id}
                                                    className={`nav-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                                    onClick={() => {
                                                        if (step === 1 && s.id > 1 && !validateStep1()) return;
                                                        setStep(s.id);
                                                    }}
                                                >
                                                    <div className="icon-box">
                                                        <s.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                                    </div>
                                                    <span className="nav-label">{s.label === 'Header' ? 'Basics' : s.label}</span>
                                                    {isCompleted && (
                                                        <div className="ml-auto text-emerald-500">
                                                            <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="sidebar-section-label">OPTIONAL</div>
                                    <div className="nav-items-container">
                                        {activeExtraSteps.map((s, index) => {
                                            const isActive = step === (7 + index);
                                            return (
                                                <div
                                                    key={s.id}
                                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                                    onClick={() => setStep(7 + index)}
                                                >
                                                    <div className="icon-box">
                                                        <s.icon size={18} />
                                                    </div>
                                                    <span className="nav-label">{s.label}</span>
                                                </div>
                                            );
                                        })}
                                        <div
                                            className={`nav-item ${step === 6 ? 'active' : ''}`}
                                            onClick={() => setStep(6)}
                                        >
                                            <div className="icon-box">
                                                <Plus size={18} />
                                            </div>
                                            <span className="nav-label">Add Sections</span>
                                        </div>
                                    </div>

                                    <div style={{ flex: 1 }} />

                                    {/* Progress at Bottom */}
                                    <div className="sidebar-progress-bottom">
                                        <div className="sidebar-progress-label">
                                            <span>Progress</span>
                                            <span>{Math.round(((sidebarSteps.findIndex(s => (s.id === step || (s.id === 6 && step > 6 && step < finalizeStepId) || (s.id === finalizeStepId && step >= finalizeStepId))) + 1) / sidebarSteps.length) * 100)}%</span>
                                        </div>
                                        <div className="sidebar-progress-track">
                                            <div 
                                                className="sidebar-progress-fill" 
                                                style={{ width: `${Math.round(((sidebarSteps.findIndex(s => (s.id === step || (s.id === 6 && step > 6 && step < finalizeStepId) || (s.id === finalizeStepId && step >= finalizeStepId))) + 1) / sidebarSteps.length) * 100)}%` }} 
                                            />
                                        </div>
                                    </div>
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
                                    <div className="preview-label">
                                        LIVE PREVIEW
                                    </div>
                                </div>

                                <div className="preview-card" onClick={() => setPreviewOpen(true)}>
                                    <div className="scale-wrapper">
                                        <ResumeRenderer
                                            data={data}
                                            templateId={safeTemplateId}
                                            showPageBreaks={pdfMode === 'paged'}
                                            scale={0.68}
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
                            </div>
                        )}

                        {!isFullScreenStep && !isMobile && (
                            <div className="bottom-bar-v2">
                                {/* Left Side: Aira Chat Area */}
                                <div className="aira-container">
                                    <div className={`aira-search-trigger ${isAiraThinking ? 'thinking' : ''}`}>
                                        <Sparkles size={16} className="aira-search-icon" />
                                        <input 
                                            type="text"
                                            className="aira-search-input"
                                            placeholder="Ask Aira assistant..."
                                            value={airaInput}
                                            onChange={(e) => setAiraInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendAiraMessage()}
                                            onClick={(e) => { e.stopPropagation(); setIsAiraExpanded(true); }}
                                            disabled={isAiraThinking}
                                        />
                                        <div className="aira-send-button" onClick={handleSendAiraMessage}>
                                            {isAiraThinking ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                                        </div>
                                    </div>


                                    {/* UI-Only Chat Panel (Floating) */}
                                    {isAiraExpanded && (
                                        <div className="aira-floating-panel">
                                            <div className="aira-panel-header">
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Aira Assistant</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => setIsAiraExpanded(false)}
                                                        className="p-1 hover:bg-slate-100 rounded-md text-slate-400 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="aira-panel-body" ref={airaChatRef}>
                                                <div className="flex flex-col gap-3">
                                                    {airaMessages.map((msg, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            className={`aira-message ${msg.role}`}
                                                        >
                                                            {msg.role === 'assistant' ? (
                                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                    {msg.text}
                                                                </ReactMarkdown>
                                                            ) : msg.text}
                                                        </div>
                                                    ))}
                                                    {airaStatus && (
                                                        <div className="aira-status-bubble">
                                                            <Loader2 size={12} className="animate-spin" />
                                                            {airaStatus}
                                                        </div>
                                                    )}
                                                    
                                                    {airaChoices.length > 0 && !isAiraThinking && (
                                                        <div className="flex flex-wrap gap-2 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                            {airaChoices.map((choice, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => handleSendAiraMessage(choice.value)}
                                                                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[9px] font-black rounded-full border border-stone-200 transition-all uppercase tracking-widest shadow-sm active:scale-95"
                                                                >
                                                                    {choice.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Right Side: Unified Continue Button */}
                                <div>
                                    {isQuickEdit ? (
                                        <button className="bottom-continue-btn" onClick={handleReturnToDashboard}>
                                            <span>Save & Return</span>
                                            <Check size={16} />
                                        </button>
                                    ) : step < finalizeStepId ? (
                                        <button className="bottom-continue-btn" onClick={nextStep}>
                                            <span>Continue to {allSteps.find(s => s.id === step + 1)?.label || 'Next'}</span>
                                            <ArrowRight size={16} />
                                        </button>
                                    ) : (
                                        <button className="bottom-continue-btn" style={{ background: '#059669' }} onClick={() => setStep(finalizeStepId)}>
                                            <span>Finish Resume</span>
                                            <Check size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </>
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
                 {isCropping && tempPhoto && (() => {
                    const templateAccent = templatesConfig.find(t => t.id === safeTemplateId)?.defaultColor || '#1e293b';
                    const bgSwatches = [
                        { label: 'Template', color: templateAccent, isAccent: true },
                        { label: 'White', color: '#ffffff' },
                        { label: 'Light Gray', color: '#f1f5f9' },
                        { label: 'Warm Gray', color: '#e7e5e4' },
                        { label: 'Navy', color: '#1e3a5f' },
                        { label: 'Charcoal', color: '#1e293b' },
                        { label: 'None', color: null },
                    ];
                    const activeBg = data.personal?.photoBg !== undefined ? data.personal.photoBg : null;
                    const cropShape = data.personal?.cropShape || 'square';

                    return (
                    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 100000 }}>
                        <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-xl"
                            onClick={() => { setIsCropping(false); setTempPhoto(null); setRemovedBgUrl(null); }}
                        />
                        <style dangerouslySetInnerHTML={{ __html: `
                            .react-easy-crop_image {
                                max-width: none !important; max-height: none !important;
                                margin: 0 !important; padding: 0 !important;
                                border: none !important; box-shadow: none !important;
                                object-fit: none !important;
                            }
                        `}} />

                        <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col" style={{ maxHeight: '92vh' }}>

                            {/* ── Header ── */}
                            <div className="px-5 pt-5 pb-3 flex items-center justify-between bg-white border-b border-stone-100 flex-shrink-0">
                                <div>
                                    <h3 className="text-lg font-black text-stone-900 tracking-tight">Edit Photo</h3>
                                    <p className="text-[11px] text-stone-400 mt-0.5">Crop · Shape · Background</p>
                                </div>
                                <button onClick={() => { setIsCropping(false); setTempPhoto(null); setRemovedBgUrl(null); }}
                                    className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                                    <X size={18} className="text-stone-400" />
                                </button>
                            </div>

                            {/* ── Cropper (always visible) ── */}
                            <div className="relative flex-shrink-0 overflow-hidden" style={{ 
                                height: 300, 
                                background: removedBgUrl ? (activeBg || 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 20px 20px') : '#000' 
                            }}>
                                <Cropper
                                    image={removedBgUrl || tempPhoto}
                                    crop={data.personal?.crop || { x: 0, y: 0 }}
                                    zoom={data.personal?.zoom || 1}
                                    aspect={1}
                                    onCropChange={(c) => setData(prev => ({ ...prev, personal: { ...(prev.personal || {}), crop: c } }))}
                                    onZoomChange={(z) => setData(prev => ({ ...prev, personal: { ...(prev.personal || {}), zoom: z } }))}
                                    onCropComplete={(_, pc) => setPixelCrop(pc)}
                                    cropShape={cropShape === 'circle' ? 'round' : 'rect'}
                                    showGrid={false}
                                />
                            </div>

                            {/* ── Scrollable controls ── */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-5">

                                {/* Shape + Size in a row */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Shape */}
                                    <div>
                                        <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">Shape</p>
                                        <div className="flex bg-stone-50 p-0.5 rounded-xl border border-stone-100">
                                            {[{ v: 'square', icon: Square, label: 'Square' }, { v: 'circle', icon: Circle, label: 'Circle' }].map(({ v, icon: Icon, label }) => (
                                                <button key={v}
                                                    onClick={() => setData(prev => ({ ...prev, personal: { ...(prev.personal || {}), cropShape: v } }))}
                                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all ${cropShape === v ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-400'}`}
                                                >
                                                    <Icon size={12} /> {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Zoom */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Zoom</p>
                                            <span className="text-[11px] font-black text-blue-600">{Math.round((data.personal?.zoom || 1) * 100)}%</span>
                                        </div>
                                        <input type="range" min={1} max={3} step={0.01}
                                            value={data.personal?.zoom || 1}
                                            onChange={(e) => setData(prev => ({ ...prev, personal: { ...(prev.personal || {}), zoom: parseFloat(e.target.value) } }))}
                                            className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                                        />
                                    </div>
                                </div>

                                {/* ── Background divider ── */}
                                <div className="border-t border-stone-100 pt-4">
                                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-3">Background</p>

                                    {/* Remove / Restore row */}
                                    <div className="flex gap-2 mb-3">
                                        <button
                                            onClick={() => handleRemoveBg(tempPhoto)}
                                            disabled={isRemovingBg || !!removedBgUrl}
                                            className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all
                                                ${removedBgUrl
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-600 cursor-default'
                                                    : 'border-dashed border-stone-200 text-stone-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50 disabled:cursor-not-allowed'
                                                }`}
                                        >
                                            {isRemovingBg
                                                ? <><Loader2 size={13} className="animate-spin" /> Removing…</>
                                                : removedBgUrl
                                                    ? <><CheckCircle2 size={13} /> Background Removed</>
                                                    : <><Sparkles size={13} /> Remove Background</>
                                            }
                                        </button>

                                        {/* Restore original bg */}
                                        {removedBgUrl && (
                                            <button
                                                onClick={() => { setRemovedBgUrl(null); }}
                                                className="px-3 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-500 hover:bg-stone-50 transition-all flex items-center gap-1.5"
                                                title="Restore original background"
                                            >
                                                <RefreshCcw size={13} /> Restore
                                            </button>
                                        )}
                                    </div>

                                    {/* Color swatches — always visible */}
                                    <p className="text-[10px] font-semibold text-stone-400 mb-2">
                                        {removedBgUrl ? 'Choose fill color:' : 'Background color on save:'}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {bgSwatches.map(({ label, color, isAccent }) => {
                                            const isActive = activeBg === color;
                                            return (
                                                <button key={label}
                                                    onClick={() => setData(prev => ({ ...prev, personal: { ...(prev.personal || {}), photoBg: color } }))}
                                                    title={label}
                                                    className="flex flex-col items-center gap-1 group"
                                                >
                                                    <div className={`w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center ${isActive ? 'border-blue-500 scale-110 shadow-md' : 'border-stone-200 hover:border-stone-400'}`}
                                                        style={{ background: color || 'transparent', backgroundImage: !color ? 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 10px 10px' : undefined }}
                                                    >
                                                        {isAccent && <span className="text-[7px] font-black text-white/90" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>✦</span>}
                                                    </div>
                                                    <span className={`text-[9px] font-semibold ${isActive ? 'text-blue-600' : 'text-stone-400'}`}>{label}</span>
                                                </button>
                                            );
                                        })}
                                        {/* Custom picker */}
                                        <div className="flex flex-col items-center gap-1">
                                            <label className={`w-9 h-9 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-center overflow-hidden relative ${!bgSwatches.some(s => s.color === activeBg) && activeBg !== null ? 'border-blue-500 scale-110' : 'border-stone-200 hover:border-stone-400'}`}>
                                                <input type="color" value={activeBg || '#ffffff'}
                                                    onChange={(e) => setData(prev => ({ ...prev, personal: { ...(prev.personal || {}), photoBg: e.target.value } }))}
                                                    className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                                                />
                                                <div className="w-full h-full" style={{ background: (activeBg && !bgSwatches.some(s => s.color === activeBg)) ? activeBg : 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }} />
                                            </label>
                                            <span className="text-[9px] font-semibold text-stone-400">Custom</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Actions ── */}
                                <div className="flex gap-3 pt-1">
                                    <button onClick={() => { setIsCropping(false); setTempPhoto(null); setRemovedBgUrl(null); }}
                                        className="flex-1 py-3 text-stone-500 font-bold text-sm bg-stone-50 hover:bg-stone-100 rounded-2xl transition-colors">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!pixelCrop) return;
                                            try {
                                                const finalPhoto = await getCroppedImg(
                                                    removedBgUrl || tempPhoto, 
                                                    pixelCrop, 0,
                                                    { horizontal: false, vertical: false },
                                                    cropShape,
                                                    activeBg
                                                );

                                                setData(prev => ({
                                                    ...prev,
                                                    personal: { ...(prev.personal || {}), photo: finalPhoto, originalPhoto: tempPhoto }
                                                }));
                                                setRemovedBgUrl(null);
                                                setIsCropping(false);
                                                setTempPhoto(null);
                                            } catch (e) { console.error(e); }
                                        }}
                                        className="flex-[1.5] py-3 bg-stone-900 text-white font-black text-sm rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                                    >
                                        <Check size={15} strokeWidth={3} /> Save Photo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    );
                })()}

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
                    onSelectDraft={(draft) => {
                        onSwitchProject(draft);
                        setIsDraftExplorerOpen(false);
                    }}
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
