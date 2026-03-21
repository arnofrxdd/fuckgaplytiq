'use client';

// Nudge to force rebuild of Aria imports after extension change
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Layout, 
    Briefcase, 
    FilePlus, 
    Search, 
    ChevronRight, 
    LogOut, 
    Clock, 
    Plus,
    Wand2,
    CheckCircle2,
    Home,
    BarChart2,
    Sparkles,
    Target,
    LayoutDashboard,
    Moon,
    Sun,
    Bell,
    ArrowRight,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseClient } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/authContext";
import { useAria } from "@/lib/AriaContext";
import DashboardTemplateSelection from './components/DashboardTemplateSelection';
import AriaCommandHub from './components/AriaCommandHub';
import AriaInlineInput from './components/AriaInlineInput';
import TemplatePreview from '../resume-creator/components/TemplatePreview';
import './dashboard.css';

const AnyTemplatePreview = TemplatePreview as any;

// --- DATA REFORMATTING HELPER (SYNCCD WITH ONBOARDING) ---
const reformatResumeData = (parsedData: any, resumeId: string | null = null) => {
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
        skills: Array.isArray(parsedData.skills) ? parsedData.skills.map((s: any) =>
            typeof s === 'string' ? { name: s, level: 3 } : s
        ) : [],
        strengths: Array.isArray(parsedData.strengths) ? parsedData.strengths : [],
        languages: Array.isArray(parsedData.languages) ? parsedData.languages : [],
        software: Array.isArray(parsedData.software) ? parsedData.software : [],
        experience: Array.isArray(parsedData.experience) ? parsedData.experience.map((e: any) => ({
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
        education: Array.isArray(parsedData.education) ? parsedData.education.map((ed: any) => ({
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
        projects: Array.isArray(parsedData.projects) ? parsedData.projects.map((p: any) => ({
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

export default function Dashboard() {
    const router = useRouter();
    const { userId, userEmail, isAuthenticated } = useAuth();
    const [drafts, setDrafts] = useState<any[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [loadingDrafts, setLoadingDrafts] = useState(true);
    
    // Modal states
    const [showBuildModal, setShowBuildModal] = useState(false);
    const [selectedMode, setSelectedMode] = useState<'new' | 'import' | 'dna' | null>(null);
    const [buildStep, setBuildStep] = useState<'choice' | 'naming' | 'templates'>('choice');
    const [projectTitle, setProjectTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    const [importId, setImportId] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<any>(null);
    const [careerDna, setCareerDna] = useState<any>(null);
    const [dnaSummary, setDnaSummary] = useState<string>("Loading your profile...");
    const [isOnboardingResolved, setIsOnboardingResolved] = useState(false);
    const [canRenderDashboard, setCanRenderDashboard] = useState(false);

    const { uiState, setUiState } = useAria();

    // Fetch Career DNA and Onboarding Status on load
    useEffect(() => {
        if (!userId || !isAuthenticated) return;
        
        const fetchUserData = async () => {
            try {
                // Check Onboarding Status first
                const { data: profile, error: profileErr } = await supabaseClient
                    .from('profiles')
                    .select('onboarding_status')
                    .eq('id', userId)
                    .single();
                
                if (!profileErr && profile && profile.onboarding_status !== 'completed') {
                    console.log("User not onboarded, redirecting...");
                    setCanRenderDashboard(false);
                    setIsOnboardingResolved(true);
                    router.replace('/onboarding');
                    return;
                }

                setCanRenderDashboard(true);

                const { data: { session } } = await supabaseClient.auth.getSession();
                const token = session?.access_token;
                const response = await fetch('/resumy/api/user/career-dna', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const dnaData = await response.json();
                    if (dnaData && dnaData.career_dna) {
                        let parsed = dnaData.career_dna;
                        if (typeof parsed === 'string') {
                            try { parsed = JSON.parse(parsed); } catch (e) {}
                        }
                        if (parsed && Object.keys(parsed).length > 2) {
                            setCareerDna({ ...dnaData, career_dna: parsed });
                            
                            // Build a nice summary
                            const skillsCount = parsed.skills?.length || 0;
                            const expCount = parsed.experience?.length || 0;
                            setDnaSummary(`${expCount} experience items and ${skillsCount} skills saved.`);
                        } else {
                            setDnaSummary("No Career DNA found yet.");
                        }
                    } else {
                        setDnaSummary("No Career DNA found yet.");
                    }
                } else {
                    setDnaSummary("Could not load your Career DNA.");
                }
                setIsOnboardingResolved(true);
            } catch (err) {
                console.warn("Failed to fetch Career DNA:", err);
                setCanRenderDashboard(true);
                setIsOnboardingResolved(true);
                setDnaSummary("Could not load your Career DNA.");
            }
        };
        fetchUserData();
    }, [userId, isAuthenticated]);

    // Handle Mode Changes -> Auto-populate Data
    useEffect(() => {
        if (selectedMode === 'dna' && careerDna?.career_dna) {
            const reformatted = reformatResumeData(careerDna.career_dna, careerDna.master_resume_id);
            setParsedData(reformatted);
        } else if (selectedMode === 'new') {
            setParsedData(null);
        }
        // 'import' mode handles its own data population via handleFileChange
    }, [selectedMode, careerDna]);

    const buildStepRef = React.useRef(buildStep);
    useEffect(() => {
        buildStepRef.current = buildStep;
    }, [buildStep]);

    const lastUploadTrigger = React.useRef<number | undefined>(undefined);
    const lastNavTrigger = React.useRef<number | undefined>(undefined);
    const lastStagedTrigger = React.useRef<number | undefined>(undefined);

    // 1. Sync AriaContext -> Local State (Aria controls UI)
    useEffect(() => {
        // Process Navigation Commands First
        if (uiState.navigationTs && uiState.navigationTs !== lastNavTrigger.current) {
            lastNavTrigger.current = uiState.navigationTs;
            if (uiState.navigation === 'close') {
                if (showBuildModal) setShowBuildModal(false);
                setUiState({ activeModal: null, navigationTs: undefined });
            } else if (uiState.navigation === 'back') {
                const currentStep = buildStepRef.current;
                if (currentStep === 'templates') {
                    setBuildStep('naming');
                    setUiState({ activeModal: 'name', navigationTs: undefined });
                } else if (currentStep === 'naming') {
                    setBuildStep('choice');
                    setUiState({ activeModal: 'start', navigationTs: undefined });
                } else if (currentStep === 'choice') {
                    if (showBuildModal) setShowBuildModal(false);
                    setUiState({ activeModal: null, navigationTs: undefined });
                }
            }
            return; // If we navigated, let the local state re-sync naturally
        }
    
        if (uiState.activeModal) {
            if (!showBuildModal) setShowBuildModal(true);
            const targetStep = uiState.activeModal === 'start' ? 'choice' : uiState.activeModal === 'name' ? 'naming' : 'templates';
            if (buildStep !== targetStep) setBuildStep(targetStep);
        } else if (uiState.activeModal === null && showBuildModal) {
            setShowBuildModal(false);
        }
        
        if (uiState.draftMode && uiState.draftMode !== selectedMode) setSelectedMode(uiState.draftMode);
        if (uiState.draftName && uiState.draftName !== projectTitle) setProjectTitle(uiState.draftName);
        
        // Aria requested to open the file browser OR a file was dropped directly
        const hasTrigger = uiState.triggerUploadTs && uiState.triggerUploadTs !== lastUploadTrigger.current;
        const hasDropped = uiState.droppedFile;

        if ((hasTrigger || hasDropped) && fileInputRef.current) {
            lastUploadTrigger.current = uiState.triggerUploadTs;
            
            if (hasDropped) {
                // Handle the dropped file immediately
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(uiState.droppedFile!);
                fileInputRef.current.files = dataTransfer.files;
                handleFileChange({ target: { files: dataTransfer.files } } as any);
                // Clear the dropped file so it doesn't re-trigger
                setUiState({ droppedFile: undefined });
            } else {
                fileInputRef.current.click();
            }
        }

        // Aria requested the final execution of a staged upload
        if (uiState.executeUploadTs && uiState.executeUploadTs !== lastStagedTrigger.current) {
            lastStagedTrigger.current = uiState.executeUploadTs;
            if (uiState.stagedFile) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(uiState.stagedFile);
                if (fileInputRef.current) fileInputRef.current.files = dataTransfer.files;
                handleFileChange({ target: { files: dataTransfer.files } } as any);
                setUiState({ stagedFile: undefined });
            }
        }

    }, [uiState.activeModal, uiState.draftMode, uiState.draftName, uiState.triggerUploadTs, uiState.droppedFile, uiState.executeUploadTs, uiState.stagedFile, uiState.navigationTs, uiState.navigation]); // Intentionally removed local state deps to prevent circular loops

    // 2. Sync Local State -> AriaContext (Aria is aware of manual clicks)
    useEffect(() => {
        const modalMap: Record<string, 'start' | 'name' | 'template'> = { 
            'choice': 'start', 'naming': 'name', 'templates': 'template' 
        };
        const activeModal = showBuildModal ? modalMap[buildStep] : null;

        // ONLY update uiState if there is a real difference AND the modal is open OR we just closed it.
        // If modal is closed, we shouldn't force our local state into the context.
        if (
            uiState.activeModal !== activeModal ||
            (showBuildModal && uiState.draftMode !== selectedMode) ||
            (showBuildModal && uiState.draftName !== projectTitle)
        ) {
            setUiState({
                activeModal,
                draftMode: showBuildModal ? selectedMode : uiState.draftMode,
                // Only override draftName if showBuildModal is true and title represents a user input
                draftName: showBuildModal ? (projectTitle || '') : uiState.draftName
            });
        }
    }, [showBuildModal, buildStep, selectedMode, projectTitle, uiState.activeModal, uiState.draftMode, uiState.draftName, setUiState]);

    const handleDeleteDraft = async (e: React.MouseEvent, draftId: string) => {
        e.stopPropagation(); // Don't trigger the click handler for the card
        if (!confirm("Are you sure you want to delete this draft? This cannot be undone.")) return;

        try {
            const { error } = await supabaseClient
                .from('builder_resumes')
                .delete()
                .eq('id', draftId);

            if (error) throw error;
            setDrafts(prev => prev.filter(d => d.id !== draftId));
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete draft.");
        }
    };

    // Fetch User Drafts
    const fetchDrafts = async () => {
        if (!userId) return;
        const { data, error } = await supabaseClient
            .from('builder_resumes')
            .select('id, title, template_id, updated_at, data, slot_id, last_step_index, design_settings, onboarding_metadata')
            .eq('profile_id', userId)
            .order('updated_at', { ascending: false });

        if (!error && data) setDrafts(data);
        setLoadingDrafts(false);
    };

    useEffect(() => {
        fetchDrafts();
    }, [userId]);

    // Poll for processing drafts
    useEffect(() => {
        const hasProcessing = drafts.some(d => d.onboarding_metadata?.status === 'ai_processing');
        setUiState({ isProcessing: hasProcessing });
        
        if (hasProcessing) {
            const interval = setInterval(fetchDrafts, 5000);
            return () => clearInterval(interval);
        }
    }, [drafts, setUiState]);

    const handleSignOut = async () => {
        await supabaseClient.auth.signOut();
        router.push('/landing');
    };

    const handleCreateNew = () => {
        setSelectedMode('new');
        setBuildStep('choice');
        setProjectTitle('Untitled Resume');
        setImportId(null);
        setShowBuildModal(true);
    };

    const handleSelectDraft = (draft: any) => {
        if (draft.onboarding_metadata?.status === 'ai_processing') {
            return; // Still analyzing
        }
        
        // If it was an AI import but hasn't finished the onboarding naming/template step
        if (draft.onboarding_metadata?.status === 'completed' && !draft.template_id) {
            setParsedData(draft.data);
            setImportId(draft.onboarding_metadata.import_id);
            setProjectTitle(draft.title);
            setSelectedMode('import');
            setBuildStep('naming');
            setShowBuildModal(true);
            return;
        }

        router.push(`/resume-creator?resumeId=${draft.id}&view=editor`);
    };

    const handleTemplateSelected = (templateId: string, color?: string) => {
        // Create new resume URL with template and mode
        const url = `/resume-creator?mode=${selectedMode}&template=${templateId}&view=onboarding&title=${encodeURIComponent(projectTitle)}${color ? `&color=${encodeURIComponent(color)}` : ''}${importId ? `&importId=${importId}&flow=ai` : ''}`;
        router.push(url);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        setLoadingText("Uploading resume...");

        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            const token = session?.access_token;
            
            // 1. Create a skeleton draft row in Supabase
            const { data: newDraft, error: draftErr } = await supabaseClient
                .from('builder_resumes')
                .insert({
                    profile_id: userId,
                    title: "Aria is analyzing...",
                    onboarding_metadata: { status: 'ai_processing' }
                })
                .select()
                .single();

            if (draftErr || !newDraft) throw new Error("Failed to create draft");

            // Update UI list immediately
            setDrafts(prev => [newDraft, ...prev]);
            setShowBuildModal(false); // Close modal so they can "sit back"

            const backendUrl = '/resumy';
            const formData = new FormData();
            formData.append("file", file);
            formData.append("builder_id", newDraft.id); // Sync them!
            
            // NEW: Inject Aria's memory! If Aria already asked for a name or template, send it.
            if (uiState.draftName) formData.append("pre_selected_name", uiState.draftName);
            if (uiState.templateId) formData.append("pre_selected_template", uiState.templateId);

            const response = await fetch(`${backendUrl}/api/resumes/upload`, {
                method: "POST",
                body: formData,
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Upload failed");
            
            console.log("Background upload started...");
            // We don't wait for analysis here anymore! 
            // The backend update + polling will handle the rest.
            setLoading(false);
            
        } catch (error) {
            console.error(error);
            setLoading(false);
            alert("Analysis failed. Please try again.");
        }
    };

    if (!isOnboardingResolved || !canRenderDashboard || loadingDrafts || userId === undefined) {
        return (
            <div className="dash-container" style={{ alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="dash-logo" style={{ marginBottom: '20px', fontSize: '24px', fontFamily: 'DM Serif Display, serif' }}>Gaply<span>tiq</span></div>
                    <div style={{ color: 'var(--text3)', fontSize: '13px', fontWeight: 600 }}>Syncing your workspace...</div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        router.push('/login');
        return null;
    }

    const startBuildFlow = () => {
        setShowBuildModal(true);
        setBuildStep('choice');
        setSelectedMode('new');
        setProjectTitle('Untitled Resume');
    };

    return (
        <div className="dash-container">
            {/* ─ DASHBOARD TOPBAR (CENTERED SEARCH) ─ */}
            <header className="dash-topbar">
                <div className="dash-logo-wrap">
                    <div className="dash-logo">Gaply<span>tiq</span></div>
                </div>
                
                <AriaCommandHub />

                <div className="dash-tr">
                    <button className="theme-toggle">
                        <Sun size={18} />
                    </button>
                    <button 
                        className="logout-btn" 
                        onClick={handleSignOut}
                        title="Sign Out"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                    >
                        <LogOut size={18} />
                    </button>
                    <div className="avatar" title={userEmail || "User"}>
                        {userEmail?.[0]?.toUpperCase() || 'U'}
                    </div>
                </div>
            </header>

            <div className="dash-body">
                <aside className="sidebar">
                    <div className="sb-item active">
                        <Home size={20} />
                        <span className="sb-tip">Home</span>
                    </div>
                    <div className="sb-item">
                        <FilePlus size={20} />
                        <span className="sb-tip">Resumes</span>
                    </div>
                    <div className="sb-item">
                        <BarChart2 size={20} />
                        <span className="sb-tip">Analytics</span>
                    </div>
                </aside>

                <main className="dash-main">
                    <div className="dash-header-row">
                        <div className="dash-greeting">
                            <div className="g-label">Good Morning</div>
                            <h2>{userEmail?.split('@')[0]}</h2>
                        </div>
                        <button className="btn btn-primary" onClick={startBuildFlow}>
                            <Plus size={16} /> New Resume
                        </button>
                    </div>

                    <div className="section-title">Quick Actions</div>
                    <div className="qa-grid">
                        <div className="qa-card feat" onClick={startBuildFlow}>
                            <div className="qa-header">
                                <div className="qc-icon-wrap">
                                    <FilePlus size={18} strokeWidth={2.5} />
                                </div>
                                <div className="qc-title">Build Resume</div>
                            </div>
                            <div className="qc-sub">Start from scratch, import, or use your Career DNA.</div>
                        </div>
                        <div className="qa-card dim">
                            <span className="soon-tag">Soon</span>
                            <div className="qa-header">
                                <div className="qc-icon-wrap">
                                    <Target size={18} strokeWidth={2.5} />
                                </div>
                                <div className="qc-title">ATS Optimizer</div>
                            </div>
                            <div className="qc-sub">Score and improve for ATS filters.</div>
                        </div>
                        <div className="qa-card dim">
                            <span className="soon-tag">Soon</span>
                            <div className="qa-header">
                                <div className="qc-icon-wrap">
                                    <Sparkles size={18} strokeWidth={2.5} />
                                </div>
                                <div className="qc-title">Resume Enhancer</div>
                            </div>
                            <div className="qc-sub">Rewrite weak bullets into strong ones.</div>
                        </div>
                    </div>

                    <div className="section-title">Your Drafts</div>
                    
                    <div className="drafts-grid">
                        {drafts.length === 0 ? (
                            <div className="new-draft-card empty" onClick={startBuildFlow} style={{ border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', minHeight: '280px', borderRadius: '12px', cursor: 'pointer' }}>
                                <Plus size={32} />
                                <span style={{ fontWeight: 700, fontSize: '14px' }}>Create First Resume</span>
                            </div>
                        ) : (
                            drafts.map((draft) => (
                                <div key={draft.id} className="draft-card" onClick={() => handleSelectDraft(draft)}>
                                    <button className="draft-delete-btn" onClick={(e) => handleDeleteDraft(e, draft.id)}>
                                        <Trash2 size={14} />
                                    </button>
                                    <div className="draft-preview-wrap">
                                        {draft.onboarding_metadata?.status === 'ai_processing' ? (
                                            <div className="draft-processing-loader" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)', borderRadius: 12 }}>
                                                <div className="analyzing-badge"><span></span> Analyzing</div>
                                                <div className="premium-loader-ring"></div>
                                                <div className="analysis-status-text">Aria is working...</div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="draft-preview-overlay">
                                                    {draft.onboarding_metadata?.status === 'completed' && !draft.template_id && (
                                                        <div className="draft-ready-badge">Ready to Setup</div>
                                                    )}
                                                </div>
                                                <AnyTemplatePreview 
                                                    templateId={draft.template_id || 'meridian'}
                                                    data={draft.data || {}}
                                                    designSettings={draft.design_settings || null}
                                                    isFormPanel={true}
                                                />
                                            </>
                                        )}
                                    </div>
                                    <div className="draft-info">
                                        <div className="draft-title" style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{draft.title || 'Untitled Resume'}</div>
                                        <div className="draft-meta" style={{ fontSize: '11px', color: 'var(--text3)' }}>
                                            Last edited {new Date(draft.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
                <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange} 
            />
            </div>

            {/* Removed Legacy Fullscreen Loader */}

            {/* BUILD RESUME MODAL FLOW */}
            <AnimatePresence mode="wait">
                {showBuildModal && (
                    <div className="modal-overlay">
                        {buildStep === 'choice' ? (
                            <motion.div 
                                key="choice"
                                className="modal"
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            >
                                <div className="modal-head">
                                    <div className="modal-title">How do you want to start?</div>
                                    <div className="modal-sub">Aria will guide you through the rest.</div>
                                </div>
                                <div className="modal-body">
                                    {importId && (
                                        <div style={{ background: 'var(--bg2)', padding: '12px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, border: '1px solid var(--accent-glow)' }}>
                                            <div style={{ color: 'var(--accent)', fontSize: 20 }}>✓</div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Analysis Complete!</div>
                                                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Aria has successfully parsed your professional history.</div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="mode-cards">
                                        <div 
                                            className={`mode-card ${selectedMode === 'new' ? 'selected' : ''}`}
                                            onClick={() => setSelectedMode('new')}
                                        >
                                            <div className="mc-icon">✦</div>
                                            <div className="mc-title">Start Fresh</div>
                                            <div className="mc-sub">Blank slate. Fill in details step by step.</div>
                                        </div>
                                        <div 
                                            className={`mode-card ${selectedMode === 'import' ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedMode('import');
                                                fileInputRef.current?.click();
                                            }}
                                        >
                                            <div className="mc-icon">📎</div>
                                            <div className="mc-title">Import Existing</div>
                                            <div className="mc-sub">Upload a PDF or paste your old resume.</div>
                                        </div>
                                        <div 
                                            className={`mode-card ${selectedMode === 'dna' ? 'selected' : ''}`}
                                            onClick={() => setSelectedMode('dna')}
                                        >
                                            <div className="mc-icon">🧬</div>
                                            <div className="mc-title">Career DNA</div>
                                            <div className="mc-sub">Pull from your saved profile and skills.</div>
                                        </div>
                                    </div>

                                    {selectedMode === 'import' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="import-box"
                                            style={{ marginTop: 20, cursor: 'pointer' }}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Drop your resume PDF here, or <strong style={{color: 'var(--accent)'}}>browse</strong>
                                        </motion.div>
                                    )}

                                    {selectedMode === 'dna' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="dna-box"
                                            style={{ marginTop: 20 }}
                                        >
                                            <div className="dna-avatar">{userEmail?.[0]?.toUpperCase()}</div>
                                            <div className="dna-info">
                                                <div className="dna-name">{userEmail?.split('@')[0]}</div>
                                                <div className="dna-meta">{dnaSummary}</div>
                                            </div>
                                            <div className="dna-status">Ready</div>
                                        </motion.div>
                                    )}
                                </div>
                                <div className="modal-foot">
                                    <button className="btn-ghost" onClick={() => setShowBuildModal(false)}>Cancel</button>
                                    <button className="btn btn-primary" onClick={() => setBuildStep('naming')}>Continue →</button>
                                </div>
                            </motion.div>
                        ) : buildStep === 'naming' ? (
                            <motion.div 
                                key="naming"
                                className="modal"
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                style={{ textAlign: 'center', padding: '48px 32px' }}
                            >
                                <div className="qc-icon" style={{ fontSize: '40px', marginBottom: '20px' }}>🖋️</div>
                                <div className="modal-title">Name your project</div>
                                <div className="modal-sub" style={{ marginBottom: '32px' }}>Think of this as your resume's title. You can change it anytime.</div>
                                
                                {importId && (
                                    <div style={{ background: 'var(--bg2)', padding: '12px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, border: '1px solid var(--accent-glow)', maxWidth: '400px', margin: '0 auto 32px' }}>
                                        <div style={{ color: 'var(--accent)', fontSize: 20 }}>✓</div>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Analysis Complete!</div>
                                            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Aria has successfully parsed your professional history.</div>
                                        </div>
                                    </div>
                                )}
                                
                                <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto 40px' }}>
                                    <input 
                                        type="text" 
                                        className="dash-search" 
                                        style={{ textAlign: 'center', padding: '16px', fontSize: '20px', fontWeight: 800, background: 'transparent', border: 'none', borderBottom: '2px solid var(--accent)' }}
                                        value={projectTitle}
                                        onChange={(e) => setProjectTitle(e.target.value)}
                                        autoFocus
                                        placeholder="e.g. Senior Developer - Google"
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                    <button className="btn-ghost" onClick={() => setBuildStep('choice')}>Back</button>
                                    <button className="btn btn-primary" onClick={() => setBuildStep('templates')}>
                                        Choose Template <ArrowRight size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="templates"
                                className="modal" 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                style={{ width: '1100px', maxWidth: '95vw', height: '85vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}
                            >
                                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                    <DashboardTemplateSelection 
                                        onComplete={handleTemplateSelected}
                                        onBack={() => setBuildStep('naming')}
                                        projectTitle={projectTitle}
                                        data={parsedData}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
