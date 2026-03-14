import React, { useState, useRef, useEffect, useMemo } from "react";
import ResumyLogo from './Logo';
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "@/lib/supabaseClient";
import {
    GraduationCap, Briefcase, FileText,
    Image as ImageIcon, Sparkles, Check,
    ArrowRight, ArrowLeft, ChevronRight, LayoutTemplate,
    Cpu, PenTool, Wand2, LogOut, Layout, Star,
    Search, SlidersHorizontal, LayoutGrid, Info,
    Award, Rocket, Zap, Target, Lock, X, CheckCircle2, Trash2, Plus,
    MoreHorizontal, Edit2, CheckCircle, Brain
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { useAnalytics } from "@/lib/analytics";
import "./OnboardingRedesign.css";

// --- CONFIG & DATA ---
import { templatesConfig } from "../templates/TemplateManager";
import TemplatePreview from "./TemplatePreview";
import AIGreeting from "./AIGreeting";
import FunLoader from "./FunLoader";
import ResumeImportLoader from "./ResumeImportLoader";
import ResumeCreatorArt from "@/components/landing-redesign/features/ResumeCreatorArt";
import PremiumTemplateSelection from "./PremiumTemplateSelection";
import OnboardingLogin from "./OnboardingLogin";
import FAQSection from "./FAQSection";

// --- CONSTANTS ---
const STEPS = {
    WELCOME: "welcome",
    PROJECTS: "projects",
    PROJECT_DETAILS: "project_details",
    SOURCE_CHOICE: "source_choice",
    SOURCE_SELECTION: "source_selection",
    ANALYZE: "analyze",
    ROLE: "role",
    DEGREE: "degree",
    LAYOUT: "layout",
    PHOTO: "photo",
    THEME: "theme",
    SELECTION: "selection",
    LOGIN: "login",
};

// --- DATA REFORMATTING HELPER ---
const reformatResumeData = (parsedData, resumeId = null) => {
    const personalSource = parsedData.personal || parsedData;
    return {
        resume_id: resumeId,
        personal: {
            name: personalSource.name || personalSource.full_name || "",
            email: personalSource.email || "",
            phone: personalSource.phone || "",
            profession: personalSource.profession || (parsedData.experience?.[0]?.title) || "",
            linkedin: personalSource.linkedin || "",
            github: personalSource.github || "",
            website: personalSource.website || "",
            city: personalSource.city || "",
            country: personalSource.country || "",
            state: personalSource.state || "",
            zipCode: personalSource.zipCode || personalSource.pincode || "",
            dob: personalSource.dob || "",
            nationality: personalSource.nationality || "",
            maritalStatus: personalSource.maritalStatus || "",
            visaStatus: personalSource.visaStatus || "",
            gender: personalSource.gender || "",
            religion: personalSource.religion || "",
            passport: personalSource.passport || "",
            otherPersonal: personalSource.otherPersonal || "",
        },
        summary: parsedData.summary || "",
        skills: Array.isArray(parsedData.skills) ? parsedData.skills.map(s =>
            typeof s === 'string' ? { name: s, level: 3 } : s
        ) : [],
        strengths: Array.isArray(parsedData.strengths) ? parsedData.strengths : [],
        languages: Array.isArray(parsedData.languages) ? parsedData.languages : [],
        software: Array.isArray(parsedData.software) ? parsedData.software : [],
        experience: Array.isArray(parsedData.experience) ? parsedData.experience.map(e => ({
            title: e.title || "",
            company: e.company || "",
            location: e.location || "",
            isRemote: !!e.isRemote,
            startMonth: e.startMonth || "",
            startYear: e.startYear || "",
            isCurrent: !!e.isCurrent,
            endMonth: e.endMonth || "",
            endYear: e.endYear || "",
            description: e.description || ""
        })) : [],
        education: Array.isArray(parsedData.education) ? parsedData.education.map(ed => ({
            degree: ed.degree || "",
            school: ed.school || "",
            city: ed.city || "",
            field: ed.field || "",
            grade: ed.grade || "",
            startMonth: ed.startMonth || "",
            startYear: ed.startYear || "",
            endMonth: ed.endMonth || "",
            endYear: ed.endYear || "",
            description: ed.description || ""
        })) : [],
        projects: Array.isArray(parsedData.projects) ? parsedData.projects.map(p => ({
            title: p.name || p.title || "",
            description: p.description || "",
            technologies: Array.isArray(p.technologies) ? p.technologies : [],
            startYear: p.startYear || "",
            endYear: p.endYear || "",
            isCurrent: !!p.isCurrent,
            link: p.url || p.link || ""
        })) : [],
        certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications : [],
        keyAchievements: Array.isArray(parsedData.keyAchievements) ? parsedData.keyAchievements : [],
        affiliations: Array.isArray(parsedData.affiliations) ? parsedData.affiliations : [],
        interests: Array.isArray(parsedData.interests) ? parsedData.interests : [],
        additionalInfo: parsedData.additionalInfo || "",
        awards: Array.isArray(parsedData.awards) ? parsedData.awards : [],
        initial_analysis: parsedData.initial_analysis || {
            sections_found: [],
            strengths: [],
            improvements: []
        },
        references: Array.isArray(parsedData.references) ? parsedData.references : [],
        accomplishments: Array.isArray(parsedData.accomplishments) ? parsedData.accomplishments : [],
        websites: Array.isArray(parsedData.websites) ? parsedData.websites : [],
        customSection: parsedData.customSection || { title: "", description: "" },
        designSettings: {
            fontSize: 1,
            fontFamily: undefined,
            sectionSpacing: 1,
            paragraphSpacing: 1,
            lineHeight: 1.5,
            letterSpacing: 0,
            pageMargin: 40,
        },
        visitedSections: {}
    };
};

export default function OnboardingRedesign({ onComplete, onBack, mode = "new", data = {}, onUpdateData }) {
    const { trackEvent } = useAnalytics();
    const { userId, userEmail, isAuthenticated } = useAuth();

    // Navigation State
    const [step, setStep] = useState(STEPS.WELCOME);
    const [stepBeforeLogin, setStepBeforeLogin] = useState(STEPS.WELCOME);
    const [pendingAction, setPendingAction] = useState(null);
    const [direction, setDirection] = useState(1);
    const [isExiting, setIsExiting] = useState(false);

    // Logic State
    const [drafts, setDrafts] = useState([]);
    const [loadingDrafts, setLoadingDrafts] = useState(false);
    const [careerDna, setCareerDna] = useState(null);
    const [isLoadingDna, setIsLoadingDna] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    const [projectTitle, setProjectTitle] = useState("Untitled Resume");
    const [nextStepAfterTitle, setNextStepAfterTitle] = useState(STEPS.SELECTION);
    const [hasNamedProject, setHasNamedProject] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedDrafts, setSelectedDrafts] = useState([]);
    const galleryRef = useRef(null);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Core App State
    const [isInitializing, setIsInitializing] = useState(true);

    // 'checking' | 'available' | 'unavailable' | 'limitReached'
    const [aiImportStatus, setAiImportStatus] = useState('checking');
    const [aiLimitInfo, setAiLimitInfo] = useState(null);
    const [renameId, setRenameId] = useState(null);
    const [renamingTitle, setRenamingTitle] = useState("");
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [studentName, setStudentName] = useState("");
    const [uploadError, setUploadError] = useState(null);

    const fileInputRef = useRef(null);
    const dropdownRef = useRef(null);

    const [formData, setFormData] = useState({
        isStudent: false,
        degree: "",
        hasPhoto: true,
        columns: 2,
        stylePreference: "All",
    });

    const [jobId, setJobId] = useState(null);
    useEffect(() => {
        if (isAuthenticated && step === STEPS.LOGIN) {
            if (pendingAction) {
                pendingAction();
                setPendingAction(null);
            } else {
                setStep(stepBeforeLogin || STEPS.WELCOME);
            }
        }
    }, [isAuthenticated, step, pendingAction, stepBeforeLogin]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const jId = params.get('jobId');
            setJobId(jId);

            // Fetch student name from DB if in placement drive
            if (jId) {
                (async () => {
                    try {
                        const { data: { user } } = await supabaseClient.auth.getUser();
                        if (!user) return;
                        const { data, error } = await supabaseClient
                            .from('students')
                            .select('name')
                            .eq('auth_user_id', user.id)
                            .eq('job_id', jId)
                            .single();
                        if (!error && data?.name) {
                            setStudentName(data.name.split(' ')[0]); // First name
                        }
                    } catch (e) {
                        // Silently fail — no name will be shown
                    }
                })();
            }
        }
    }, []);

    // Track initial view
    useEffect(() => {
        trackEvent('resume_creator_view', 'Resume creator opened', {
            feature_module: 'resume_creator',
            funnel_stage: 'viewed'
        });
    }, []);

    // Handle URL params and mode
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('step') === 'initial') {
                setStep(STEPS.SOURCE_CHOICE);
            } else if (mode === "improve") {
                setStep(STEPS.ANALYZE);
            }
        }
    }, [mode]);

    // ── CENTRALIZED DATA LOADING (Prevents flashing or wrong steps) ──
    useEffect(() => {
        if (!userId || !isAuthenticated) {
            setIsInitializing(false);
            return;
        }

        let isMounted = true;
        const loadEverything = async () => {
            setIsInitializing(true);
            const backendUrl = '/resumy';

            try {
                const { data: { session } } = await supabaseClient.auth.getSession();
                const token = session?.access_token;

                // 1. Fetch Drafts
                const draftsRes = await supabaseClient
                    .from('builder_resumes')
                    .select('id, title, template_id, updated_at, data, slot_id, last_step_index, design_settings')
                    .eq('profile_id', userId)
                    .order('updated_at', { ascending: false });

                if (draftsRes.data && isMounted) {
                    setDrafts(draftsRes.data);
                }

                const dnaRes = await fetch(`${backendUrl}/api/user/career-dna`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (dnaRes.ok && isMounted) {
                    const dnaData = await dnaRes.json();
                    if (dnaData && dnaData.career_dna) {
                        let parsedDna = dnaData.career_dna;
                        if (typeof parsedDna === 'string') {
                            try {
                                parsedDna = JSON.parse(parsedDna);
                            } catch (e) {
                                console.warn("Failed to parse career_dna string");
                            }
                        }

                        if (parsedDna && Object.keys(parsedDna).length > 2) {
                            // Update the dnaData object to have the parsed version before setting state
                            setCareerDna({ ...dnaData, career_dna: parsedDna });
                        }
                    }
                }

                // 3. Check AI limits & Availability
                setAiImportStatus('checking');
                if (token) {
                    // Check if AI service is overall down (429)
                    const statusRes = await fetch(`${backendUrl}/api/resumes/ai-status`, { headers: { 'Authorization': `Bearer ${token}` } });
                    if (statusRes.status === 429) {
                        if (isMounted) setAiImportStatus('unavailable');
                    } else {
                        // Check daily limits
                        const limitRes = await fetch(`${backendUrl}/api/resumes/ai-upload-limit`, { headers: { 'Authorization': `Bearer ${token}` } });
                        if (limitRes.ok) {
                            const limitData = await limitRes.json();
                            if (isMounted) {
                                setAiLimitInfo(limitData);
                                setAiImportStatus(limitData.allowed ? 'available' : 'limitReached');
                            }
                        } else {
                            if (isMounted) setAiImportStatus('available');
                        }
                    }
                }

            } catch (err) {
                console.warn("Initialization loading error:", err);
                if (isMounted) setAiImportStatus('available'); // default
            } finally {
                if (isMounted) setIsInitializing(false);
            }
        };

        loadEverything();

        return () => { isMounted = false; };
    }, [isAuthenticated, userId]);

    // Click Outside for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handlers
    const nextStep = (next) => {
        setDirection(1);
        setStep(next);
        trackEvent(`resume_funnel_${next}`, `Moved to ${next}`);
    };

    const performWithAuth = (action) => {
        if (isAuthenticated) {
            action();
        } else {
            setPendingAction(() => action);
            setStepBeforeLogin(step);
            nextStep(STEPS.LOGIN);
        }
    };

    const prevStep = (prev) => {
        setDirection(-1);
        setStep(prev);
    };

    const handleSignOut = async () => {
        await supabaseClient.auth.signOut();
        window.location.reload();
    };

    const handleSelectDraft = (draft) => {
        setIsExiting(true);
        setTimeout(() => {
            let parsedDesign = draft.design_settings;
            if (typeof parsedDesign === 'string') {
                try { parsedDesign = JSON.parse(parsedDesign); } catch (e) { parsedDesign = {}; }
            }
            onComplete({
                ...draft.data,
                builder_resume_id: draft.id,
                template: draft.template_id,
                title: draft.title,
                last_step_index: draft.last_step_index,
                designSettings: parsedDesign
            });
        }, 400);
    };

    const handleDeleteDraft = async (draftId) => {
        try {
            const { error } = await supabaseClient
                .from('builder_resumes')
                .delete()
                .eq('id', draftId);
            if (error) throw error;
            setDrafts(prev => prev.filter(d => d.id !== draftId));
            setActiveMenuId(null);
            setDeleteConfirmId(null);
        } catch (err) {
            alert("Failed to delete draft.");
        }
    };

    const handleBulkDelete = async () => {
        try {
            const { error } = await supabaseClient
                .from('builder_resumes')
                .delete()
                .in('id', selectedDrafts);
            if (error) throw error;
            setDrafts(prev => prev.filter(d => !selectedDrafts.includes(d.id)));
            setSelectedDrafts([]);
            setIsSelectionMode(false);
            setDeleteConfirmId(null);
        } catch (err) {
            alert("Failed to delete selected drafts.");
        }
    };

    const handleRenameDraft = async (e, draftId) => {
        if (e) e.stopPropagation();
        if (!renamingTitle.trim()) { setRenameId(null); return; }
        try {
            const { error } = await supabaseClient
                .from('builder_resumes')
                .update({ title: renamingTitle })
                .eq('id', draftId);
            if (error) throw error;
            setDrafts(prev => prev.map(d => d.id === draftId ? { ...d, title: renamingTitle } : d));
            setRenameId(null);
            setActiveMenuId(null);
        } catch (err) {
            alert("Failed to rename draft.");
        }
    };

    const handleCompleteOnboarding = (finalData = data) => {
        // Final Security Gate: Required login before entering into form panel
        if (!isAuthenticated) {
            setPendingAction(() => () => handleCompleteOnboarding(finalData));
            setStepBeforeLogin(step);
            nextStep(STEPS.LOGIN);
            return;
        }

        if (!selectedTemplate) {
            nextStep(STEPS.SELECTION);
            return;
        }
        setIsExiting(true);
        setTimeout(() => {
            onComplete({
                ...finalData,
                title: projectTitle,
                template: selectedTemplate
            });
        }, 400);
    };

    const useMasterDna = () => {
        if (!careerDna?.career_dna) return;
        setLoading(true);
        setLoadingText("Importing your Career DNA...");
        setTimeout(() => {
            const parsedData = careerDna.career_dna;
            const reformatted = reformatResumeData(parsedData, careerDna.master_resume_id);
            if (onUpdateData) onUpdateData(reformatted);
            trackEvent('resume_creator_use_master_dna', 'Using Career DNA');
            setLoading(false);
            handleCompleteOnboarding(reformatted);
        }, 1000);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);
        setLoadingText("Uploading resume...");

        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            const token = session?.access_token;
            const backendUrl = '/resumy';
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`${backendUrl}/api/resumes/upload`, {
                method: "POST",
                body: formData,
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) {
                let errorMsg = "Upload failed";
                try {
                    const errorData = await response.json();
                    if (errorData.message) errorMsg = errorData.message;
                    else if (errorData.error) errorMsg = errorData.error;
                } catch (e) { }
                throw new Error(errorMsg);
            }

            const { resume_id } = await response.json();
            setLoadingText("AI Analyzing your profile...");

            let attempts = 0;
            const maxAttempts = 50;
            let parsedData = null;

            while (attempts < maxAttempts) {
                attempts++;
                const statusRes = await fetch(`${backendUrl}/api/resumes/${resume_id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (statusRes.ok) {
                    const resume = await statusRes.json();
                    if (resume.status === 'completed' && resume.parsed_json) {
                        parsedData = resume.parsed_json;
                        break;
                    }
                    if (resume.status === 'failed') throw new Error("AI Analysis failed");
                }
                await new Promise(r => setTimeout(r, 2000));
            }

            if (!parsedData) throw new Error("Analysis timed out");
            setLoading(false);
            const reformatted = reformatResumeData(parsedData, resume_id);
            if (onUpdateData) onUpdateData(reformatted);
            nextStep(STEPS.ANALYZE);
        } catch (error) {
            console.error(error);
            setLoading(false);

            // If the error message is our custom backend warning (like daily limit)
            if (error.message && (error.message.toLowerCase().includes('limit') || error.message.toLowerCase().includes('plan'))) {
                setUploadError(error.message);
                return;
            }

            alert("Analysis failed. Let's start from scratch!");
            handleCompleteOnboarding();
        }
    };

    const handleTemplateSelectedFromGallery = (templateId) => {
        setSelectedTemplate(templateId);
        nextStep(STEPS.SOURCE_CHOICE);
    };

    if (isInitializing) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-stone-50">
                <FunLoader text="Initializing Workspace..." />
            </div>
        );
    }

    return (
        <div className={`onboarding-redesign ${isExiting ? 'exiting' : ''}`}>
            {/* BACKGROUND ELEMENTS FROM OLD ONBOARDING */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[100%] bg-emerald-100/30 blur-[100px] rounded-none pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[80%] bg-orange-50/40 blur-[100px] rounded-none pointer-events-none" />
            <div className="grid-overlay" style={{ backgroundImage: 'radial-gradient(circle, #10B981 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.1, position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} />



            {!jobId && step !== STEPS.SELECTION && (
                <header className="onboarding-header">
                    <Link href="/resume-creator" className="logo-container">
                        <ResumyLogo size={28} />
                    </Link>

                    {step === STEPS.WELCOME && (
                        <nav className="header-nav-faq hidden md:flex">
                            <button 
                                onClick={() => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="nav-link-faq"
                            >
                                FAQ
                            </button>
                        </nav>
                    )}

                    <div className="user-profile" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {isAuthenticated ? (
                            <>
                                {step === STEPS.PROJECTS && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {isSelectionMode ? (
                                            <>
                                                <button className="btn-secondary" style={{ color: '#e11d48', border: '1px solid #e11d48', borderRadius: '99px', fontSize: '11px', padding: '6px 12px' }} onClick={() => setDeleteConfirmId('bulk')}>Delete Selected ({selectedDrafts.length})</button>
                                                <button className="btn-secondary" style={{ borderRadius: '99px', fontSize: '11px', padding: '6px 12px' }} onClick={() => { setIsSelectionMode(false); setSelectedDrafts([]); }}>Cancel</button>
                                            </>
                                        ) : (
                                            <button className="btn-secondary" style={{ borderRadius: '4px', fontSize: '11px', padding: '6px 14px', background: '#f8fafc', fontWeight: 700 }} onClick={() => setIsSelectionMode(true)}>
                                                <SlidersHorizontal size={12} className="mr-1.5" /> Manage Drafts
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Avatar + dropdown for all screen sizes */}
                                <button
                                    onClick={() => setShowProfileMenu(p => !p)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '4px',
                                        background: '#2563eb', color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 13, fontWeight: 700,
                                        boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)'
                                    }}>
                                        {userEmail?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                </button>

                                {showProfileMenu && (
                                    <div
                                        style={{
                                            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                                            width: 200, background: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 4, padding: '12px 0',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                            zIndex: 9999
                                        }}
                                    >
                                        <div style={{ padding: '0 16px 10px', borderBottom: '1px solid #f1f5f9', marginBottom: 8 }}>
                                            <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Signed in as</div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
                                        </div>
                                        <Link
                                            href="/dashboard"
                                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#334155', textDecoration: 'none' }}
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <Layout size={15} /> Dashboard
                                        </Link>
                                        <button
                                            onClick={() => { setShowProfileMenu(false); handleSignOut(); }}
                                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#ef4444', background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}
                                        >
                                            <LogOut size={15} /> Sign Out
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            step !== STEPS.LOGIN && (
                                <button
                                    onClick={() => {
                                        setStepBeforeLogin(step);
                                        nextStep(STEPS.LOGIN);
                                    }}
                                    className="btn-primary-dark"
                                >
                                    Sign In
                                </button>
                            )
                        )}
                    </div>
                </header>
            )}

            <main className="onboarding-main">
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".pdf,.doc,.docx" onChange={handleFileChange} />

                <AnimatePresence>
                    {loading && (
                        loadingText.toLowerCase().includes("resume") || loadingText.toLowerCase().includes("analyzing") ? (
                            <ResumeImportLoader text={loadingText} />
                        ) : (
                            <FunLoader text={loadingText} />
                        )
                    )}
                </AnimatePresence>

                <div className="step-wrapper">
                    <AnimatePresence mode="wait">

                        {/* The rest of the steps... */}

                        {/* WELCOME */}
                        {step === STEPS.WELCOME && (
                            <motion.div key="welcome" className="welcome-grid fade-in" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="welcome-content">
                                    {jobId && (
                                        <div className="welcome-tagline bg-emerald-600 text-white border-none px-4 py-1.5">
                                            <Lock className="w-3.5 h-3.5 inline-block mr-2 -mt-1" />
                                            OFFICIAL PLACEMENT PROTOCOL
                                        </div>
                                    )}
                                    <h1 className="welcome-title">
                                        {jobId ? (
                                            <>
                                                Unlock Your <br />
                                                <span className="italic text-emerald-600">
                                                    Career Potential.
                                                </span>
                                            </>
                                        ) : drafts.length > 0 ? (
                                            <>
                                                <span className="italic">
                                                    Continue
                                                </span>
                                                <br />
                                                Where you left off.
                                            </>
                                        ) : (
                                            <>
                                                Architect Your <br />
                                                <span className="italic">
                                                    Future.
                                                </span>
                                            </>
                                        )}
                                    </h1>
                                    <p className="welcome-description">
                                        {jobId ? (
                                            <>
                                                Welcome to your <span className="text-emerald-600 font-black uppercase tracking-widest text-[10px]">Official Placement Journey</span>{studentName && <>, <span className="font-black text-emerald-600">{studentName}</span></>}. We've built this environment to help you showcase your best self to recruiters. Let's build a profile that gets you noticed.
                                            </>
                                        ) : drafts.length > 0 ? (
                                            <>
                                                Resume editing <span className="text-stone-900 font-black">{drafts[0].title || "Untitled Resume"}</span> or start a new project instantly.
                                            </>
                                        ) : (
                                            <>
                                                The most intuitive way to build a professional resume. <span className="text-stone-900 font-black">Fill, Customize, and Export</span> with AI-powered precision.
                                            </>
                                        )}
                                    </p>
                                    <div className="welcome-actions">
                                        <button className="main-cta group" onClick={() => nextStep(STEPS.SOURCE_CHOICE)}>
                                            Start Building <ArrowRight className="transition-transform group-hover:translate-x-1" />
                                        </button>
                                        {drafts.length > 0 && (
                                            <button className="secondary-cta hover:border-violet-600 hover:text-violet-600 transition-all active:scale-95" onClick={() => nextStep(STEPS.PROJECTS)}>
                                                Saved Drafts <Layout size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="welcome-preview">
                                    {drafts.length > 0 ? (
                                        <div className="preview-container-mock group/preview relative">
                                            <TemplatePreview
                                                templateId={drafts[0].template_id || 'berlin-sleek'}
                                                data={drafts[0].data || {}}
                                                designSettings={typeof drafts[0].design_settings === 'string' ? JSON.parse(drafts[0].design_settings || '{}') : drafts[0].design_settings}
                                                isFormPanel={true}
                                            />
                                            <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover/preview:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                                <button
                                                    className="bg-white text-stone-900 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform"
                                                    onClick={() => handleSelectDraft(drafts[0])}
                                                >
                                                    Continue Editing
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="welcome-preview-placeholder-art-wrapper">
                                            <ResumeCreatorArt />
                                        </div>
                                    )}
                                </div>

                                {/* SCROLLABLE GALLERY SECTION - HIDDEN ON MOBILE */}
                                <div ref={galleryRef} className="gallery-section hidden md:block">
                                    <div className="gallery-inner">
                                        <PremiumTemplateSelection
                                            userId={userId}
                                            data={data}
                                            onUpdateData={onUpdateData}
                                            onComplete={handleTemplateSelectedFromGallery}
                                            inline={true}
                                        />
                                    </div>
                                </div>

                                {/* FAQ SECTION */}
                                <FAQSection />
                            </motion.div>
                        )}

                        {/* SOURCE CHOICE */}
                        {step === STEPS.SOURCE_CHOICE && (
                            <motion.div key="source" className="fade-in" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <button className="btn-back" onClick={() => prevStep(STEPS.WELCOME)}><ArrowLeft size={16} /> Back</button>
                                <h2 className="selection-title">How do you want to start?</h2>
                                <p className="selection-subtitle">Choose the method that works best for you.</p>

                                <div className="selection-grid-integrated">
                                    {/* 1. CAREER DNA (The Flagship) */}
                                    {careerDna && (
                                        <motion.div
                                            whileHover={{ y: -10 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="choice-premium-card colored-dna-premium group"
                                            onClick={() => {
                                                if (drafts.length >= 5) {
                                                    alert("Draft limit reached! You can have a maximum of 5 drafts. Please delete an existing draft.");
                                                    return;
                                                }
                                                performWithAuth(() => {
                                                    setNextStepAfterTitle('DNA');
                                                    nextStep(STEPS.PROJECT_DETAILS);
                                                });
                                            }}
                                        >
                                            <div className="card-top-tag">Most Popular</div>
                                            <div className="card-icon-modern">
                                                <Brain size={32} />
                                            </div>
                                            <div className="card-info-modern">
                                                <h3 className="card-title-modern">Career DNA</h3>
                                                <p className="card-desc-modern">Build instantly using your verified professional profile.</p>
                                            </div>
                                            <div className="card-footer-modern">
                                                <span>Fastest</span>
                                                <ArrowRight size={18} />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* 2. IMPORT WITH AI */}
                                    <motion.div
                                        whileHover={(aiImportStatus !== 'unavailable' && aiImportStatus !== 'limitReached') ? { y: -10 } : {}}
                                        whileTap={(aiImportStatus !== 'unavailable' && aiImportStatus !== 'limitReached') ? { scale: 0.98 } : {}}
                                        className={`choice-premium-card colored-ai-premium group ${(aiImportStatus === 'unavailable' || aiImportStatus === 'limitReached') ? 'ai-card-unavailable' : ''}`}
                                        onClick={() => {
                                            if (aiImportStatus === 'unavailable' || aiImportStatus === 'limitReached') return;
                                            if (drafts.length >= 5) {
                                                alert("Draft limit reached! You can have a maximum of 5 drafts. Please delete an existing draft.");
                                                return;
                                            }
                                            performWithAuth(() => {
                                                setNextStepAfterTitle(STEPS.SOURCE_SELECTION);
                                                nextStep(STEPS.PROJECT_DETAILS);
                                            });
                                        }}
                                        style={(aiImportStatus === 'unavailable' || aiImportStatus === 'limitReached') ? { opacity: 0.65, cursor: 'not-allowed', filter: 'grayscale(0.2)' } : {}}
                                    >
                                        {/* Unavailable badge */}
                                        {aiImportStatus === 'unavailable' && (
                                            <div style={{
                                                position: 'absolute', top: 12, right: 12,
                                                background: 'rgba(0,0,0,0.55)', color: '#fca5a5',
                                                fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
                                                textTransform: 'uppercase', padding: '3px 8px',
                                                borderRadius: 99, backdropFilter: 'blur(4px)',
                                                display: 'flex', alignItems: 'center', gap: 5
                                            }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', display: 'inline-block', flexShrink: 0 }} />
                                                Temporarily Unavailable
                                            </div>
                                        )}
                                        {/* Limit Reached badge */}
                                        {aiImportStatus === 'limitReached' && (
                                            <div style={{
                                                position: 'absolute', top: 12, right: 12,
                                                background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
                                                textTransform: 'uppercase', padding: '3px 8px',
                                                borderRadius: 99, backdropFilter: 'blur(4px)',
                                                display: 'flex', alignItems: 'center', gap: 5
                                            }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', flexShrink: 0 }} />
                                                Daily Limit Reached
                                            </div>
                                        )}
                                        {/* Checking badge */}
                                        {aiImportStatus === 'checking' && (
                                            <div style={{
                                                position: 'absolute', top: 12, right: 12,
                                                background: 'rgba(0,0,0,0.35)', color: '#d1fae5',
                                                fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
                                                textTransform: 'uppercase', padding: '3px 8px',
                                                borderRadius: 99, backdropFilter: 'blur(4px)',
                                            }}>
                                                Checking...
                                            </div>
                                        )}
                                        <div className="card-icon-modern">
                                            <Wand2 size={32} />
                                        </div>
                                        <div className="card-info-modern">
                                            <h3 className="card-title-modern">Import with AI</h3>
                                            <p className="card-desc-modern">
                                                {aiImportStatus === 'unavailable'
                                                    ? 'AI service is temporarily at capacity. Try again later.'
                                                    : aiImportStatus === 'limitReached'
                                                        ? `You hit your limit of ${aiLimitInfo?.limit || 2} AI uploads today on the Free plan.`
                                                        : "Upload your old resume and we'll modernize it perfectly."
                                                }
                                            </p>
                                        </div>
                                        <div className="card-footer-modern">
                                            <span>
                                                {aiImportStatus === 'unavailable' ? 'Unavailable'
                                                    : aiImportStatus === 'limitReached' ? 'Try tomorrow'
                                                        : 'Smart'}
                                            </span>
                                            {(aiImportStatus !== 'unavailable' && aiImportStatus !== 'limitReached') && <ArrowRight size={18} />}
                                        </div>
                                    </motion.div>

                                    {/* 3. START FRESH (The 35% 'Quieter' option) */}
                                    <motion.div
                                        whileHover={{ y: -10 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="choice-classic-card group"
                                        onClick={() => {
                                            if (drafts.length >= 5) {
                                                alert("Draft limit reached! You can have a maximum of 5 drafts. Please delete an existing draft.");
                                                return;
                                            }
                                            setNextStepAfterTitle('COMPLETE');
                                            nextStep(STEPS.PROJECT_DETAILS);
                                        }}
                                    >
                                        <div className="card-icon-modern-classic">
                                            <PenTool size={32} />
                                        </div>
                                        <div className="card-info-modern">
                                            <h3 className="card-title-modern">Start Fresh</h3>
                                            <p className="card-desc-modern">Build your resume from scratch with our step-by-step builder.</p>
                                        </div>
                                        <div className="card-footer-modern text-stone-400">
                                            <span>Manual</span>
                                            <ArrowRight size={18} />
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}

                        {/* PROJECT DETAILS */}
                        {step === STEPS.PROJECT_DETAILS && (
                            <motion.div key="details" className="naming-step-container fade-in" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                <div className="naming-card">
                                    <button className="btn-back-floating" onClick={() => prevStep(STEPS.SOURCE_CHOICE)}>
                                        <ArrowLeft size={18} />
                                    </button>

                                    <div className="naming-icon-box">
                                        <Edit2 size={32} />
                                    </div>
                                    <h2 className="naming-title">Name your project</h2>
                                    <p className="naming-subtitle">Think of this as your resume's title. You can change it anytime.</p>

                                    <div className="input-premium-group">
                                        <input
                                            type="text"
                                            className="input-premium"
                                            value={projectTitle}
                                            onChange={(e) => setProjectTitle(e.target.value)}
                                            autoFocus
                                            placeholder="e.g. Senior Developer - Google"
                                        />
                                        <div className="input-focus-line" />
                                    </div>

                                    <button className="premium-submit-btn group" onClick={() => {
                                        setHasNamedProject(true);
                                        if (nextStepAfterTitle === 'COMPLETE') {
                                            handleCompleteOnboarding();
                                        } else if (nextStepAfterTitle === 'DNA') {
                                            useMasterDna();
                                        } else {
                                            nextStep(nextStepAfterTitle);
                                        }
                                    }}>
                                        Continue to {nextStepAfterTitle === 'COMPLETE' ? 'Editor' : 'Next Step'}
                                        <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* SOURCE SELECTION (FILE UPLOAD) */}
                        {step === STEPS.SOURCE_SELECTION && (
                            <motion.div key="upload" className="container-narrow fade-in" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <button className="btn-back" onClick={() => prevStep(STEPS.PROJECT_DETAILS)}><ArrowLeft size={16} /> Back</button>
                                <h2 className="selection-title" style={{ textAlign: 'left' }}>Upload your current resume</h2>
                                <p className="selection-subtitle" style={{ textAlign: 'left' }}>We support PDF, DOC, and DOCX formats.</p>

                                <div
                                    className="new-draft-card"
                                    style={{ minHeight: '300px', cursor: 'pointer', marginTop: '32px' }}
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <FileText size={48} strokeWidth={1.5} />
                                    <span className="font-bold">Click to upload or drag & drop</span>
                                    <span className="text-xs">Max file size: 10MB</span>
                                </div>

                                {uploadError && (
                                    <div style={{
                                        marginTop: '20px',
                                        padding: '16px',
                                        background: '#fef2f2',
                                        color: '#ef4444',
                                        borderRadius: '8px',
                                        border: '1px solid #fee2e2',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px'
                                    }}>
                                        <Info size={20} className="flex-shrink-0 mt-0.5" />
                                        <span>{uploadError}</span>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* PROJECTS (DRAFTS) */}
                        {step === STEPS.PROJECTS && (
                            <motion.div key="projects" className="drafts-container fade-in">
                                <button className="btn-back" onClick={() => prevStep(STEPS.WELCOME)}><ArrowLeft size={16} /> Back</button>

                                <div className="draft-header-actions">
                                    <div className="draft-title-group">
                                        <h2 className="selection-title" style={{ textAlign: 'left', marginBottom: 0 }}>Resume your work</h2>
                                        <p className="selection-subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>You have {drafts.length} drafts in progress.</p>
                                    </div>
                                </div>

                                <div className="drafts-grid">
                                    <div className="new-draft-card" onClick={() => {
                                        setHasNamedProject(false);
                                        setProjectTitle("Untitled Resume");
                                        nextStep(STEPS.SOURCE_CHOICE);
                                    }}>
                                        <Plus size={32} />
                                        <span className="font-bold">New Resume</span>
                                    </div>

                                    {drafts.map((draft) => (
                                        <div
                                            key={draft.id}
                                            className={`draft-card ${selectedDrafts.includes(draft.id) ? 'selected' : ''}`}
                                            onClick={() => {
                                                if (isSelectionMode) {
                                                    setSelectedDrafts(prev => prev.includes(draft.id) ? prev.filter(id => id !== draft.id) : [...prev, draft.id]);
                                                } else {
                                                    handleSelectDraft(draft);
                                                }
                                            }}
                                        >
                                            <div className="draft-preview">
                                                <TemplatePreview
                                                    templateId={draft.template_id || 'berlin-sleek'}
                                                    data={draft.data || {}}
                                                    designSettings={typeof draft.design_settings === 'string' ? JSON.parse(draft.design_settings || '{}') : draft.design_settings}
                                                    isFormPanel={true}
                                                />
                                                {isSelectionMode && (
                                                    <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
                                                        <div style={{ width: 24, height: 24, background: selectedDrafts.includes(draft.id) ? '#2d5cf7' : 'white', border: '2px solid #2d5cf7', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                            {selectedDrafts.includes(draft.id) && <Check size={16} />}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="draft-info" style={{ position: 'relative' }}>
                                                {renameId === draft.id ? (
                                                    <input
                                                        type="text"
                                                        value={renamingTitle}
                                                        onChange={(e) => setRenamingTitle(e.target.value)}
                                                        onBlur={(e) => handleRenameDraft(e, draft.id)}
                                                        autoFocus
                                                        className="font-bold"
                                                        style={{ border: 'none', borderBottom: '2px solid #2d5cf7', outline: 'none' }}
                                                    />
                                                ) : (
                                                    <span className="draft-name">{draft.title || "Untitled Resume"}</span>
                                                )}
                                                <div className="draft-meta">
                                                    <span>{new Date(draft.updated_at).toLocaleDateString()}</span>
                                                    {!isSelectionMode && (
                                                        <MoreHorizontal size={14} style={{ cursor: 'pointer' }} onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenuId(draft.id);
                                                        }} />
                                                    )}
                                                </div>

                                                {activeMenuId === draft.id && (
                                                    <div ref={dropdownRef} style={{ position: 'absolute', top: '100%', right: 0, background: 'white', border: '1px solid #e1e4e8', borderRadius: 12, boxShadow: '0 15px 35px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden', minWidth: '160px', marginTop: 8 }}>
                                                        <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', width: '100%', border: 'none', background: 'none', fontSize: '0.75rem', fontWeight: 800, color: '#1a1a1b', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }} onClick={(e) => { e.stopPropagation(); setRenameId(draft.id); setRenamingTitle(draft.title || ""); setActiveMenuId(null); }}>
                                                            <Edit2 size={14} /> Rename
                                                        </button>
                                                        <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', width: '100%', border: 'none', background: 'none', fontSize: '0.75rem', fontWeight: 800, color: '#e11d48', textAlign: 'left' }} onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(draft.id); setActiveMenuId(null); }}>
                                                            <Trash2 size={14} /> Delete Draft
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}



                        {/* ANALYZE (AI Greeting/Processing) */}
                        {step === STEPS.ANALYZE && (
                            <motion.div key="analyze" className="fade-in">
                                <AIGreeting
                                    data={data}
                                    onContinue={() => handleCompleteOnboarding()}
                                    onBack={() => prevStep(STEPS.SOURCE_SELECTION)}
                                />
                            </motion.div>
                        )}

                        {/* TEMPLATE SELECTION (Dedicated Window) */}
                        {step === STEPS.SELECTION && (
                            <PremiumTemplateSelection
                                userId={userId}
                                data={data}
                                onUpdateData={onUpdateData}
                                projectTitle={projectTitle}
                                onUpdateTitle={setProjectTitle}
                                onComplete={(templateId) => {
                                    setSelectedTemplate(templateId);
                                    setIsExiting(true);
                                    setTimeout(() => {
                                        onComplete({
                                            ...data,
                                            template: templateId,
                                            title: projectTitle
                                        });
                                    }, 400);
                                }}
                                onBack={() => prevStep(STEPS.SOURCE_CHOICE)}
                            />
                        )}

                    </AnimatePresence>
                </div>
            </main>

            {/* LOGIN MODAL OVERLAY */}
            <AnimatePresence>
                {step === STEPS.LOGIN && (
                    <OnboardingLogin
                        onLoginSuccess={() => { }}
                        onBack={() => prevStep(stepBeforeLogin || STEPS.WELCOME)}
                    />
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <AnimatePresence>
                {deleteConfirmId && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="bg-white p-8 rounded-lg max-w-sm w-full mx-4 border border-slate-200 shadow-xl">
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>Confirm Action</h3>
                            <p style={{ color: '#5e6c84', fontSize: '0.9rem', marginBottom: '24px' }}>
                                This action cannot be undone. All your progress will be lost.
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    style={{ flex: 1, padding: '12px', borderRadius: 4, border: 'none', background: '#e11d48', color: 'white', fontWeight: 700 }}
                                    onClick={() => deleteConfirmId === 'bulk' ? handleBulkDelete() : handleDeleteDraft(deleteConfirmId)}
                                >
                                    Delete
                                </button>
                                <button
                                    style={{ flex: 1, padding: '12px', borderRadius: 4, border: '1px solid #e1e4e8', background: 'white', fontWeight: 700 }}
                                    onClick={() => setDeleteConfirmId(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}
