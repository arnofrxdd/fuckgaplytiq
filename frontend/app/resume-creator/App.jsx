"use client";
import React, { useState } from "react";
import Onboarding from "./components/OnboardingRedesign"; // Using the new professional design
import FormPanel from "./components/FormPanelV2";   // Using the new V2 design with Gaplytiq aesthetics
import { useAnalytics } from "@/lib/analytics";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import "./App.css";
import "./native-highlight.css";

function App() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // 1. View State: 'onboarding' | 'editor'
  const [currentView, setCurrentView] = useState("onboarding");
  const [onboardingMode, setOnboardingMode] = useState("welcome"); // 'welcome' | 'new' | 'improve'
  const { trackEvent } = useAnalytics();

  // URL State Synced to Component State
  const jobId = searchParams.get('jobId');

  // Load Initial State from URL
  React.useEffect(() => {
    const view = searchParams.get('view') || 'onboarding';
    const mode = searchParams.get('mode') || 'welcome';
    const resumeId = searchParams.get('resumeId');

    console.log("[App] Syncing from URL:", { view, mode, resumeId });

    if ((view === 'editor' || view === 'finalize') && resumeId) {
      setResumeData(prev => ({ ...prev, builder_resume_id: resumeId }));
      setCurrentView("editor");
    } else {
      setCurrentView("onboarding");
      setOnboardingMode(mode);
    }

    // Replace current history entry with normalized state to ensure a stable baseline
    syncUrl(view, mode, resumeId, view === 'editor' ? searchParams.get('step') : null, true);

    trackEvent('resume_creator_view', 'Resume creator opened', {
      feature_module: 'resume_creator',
      funnel_stage: 'viewed',
      view: view
    });
  }, []);

  // Listen to Browser Back/Forward Buttons
  React.useEffect(() => {
    const handlePopState = (e) => {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view') || 'onboarding';
      const mode = params.get('mode') || 'welcome';
      const resumeId = params.get('resumeId');

      if ((view === 'editor' || view === 'finalize') && resumeId) {
        setResumeData(prev => ({ 
          ...prev, 
          builder_resume_id: resumeId,
        }));
        setCurrentView("editor");
      } else {
        setCurrentView("onboarding");
        setOnboardingMode(mode);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync state TO URL without triggering a reload
  const syncUrl = (view, mode, id, step, replace = false) => {
    const params = new URLSearchParams();
    
    // Core URL logic: View determines what high level page we are on
    params.set('view', view); 

    if (view === 'onboarding' && mode) params.set('mode', mode);
    if (id) params.set('resumeId', id);
    if (view === 'editor' && step) params.set('step', step);
    if (jobId) params.set('jobId', jobId);

    // Flow tracking for onboarding
    const flow = searchParams.get('flow');
    const importId = searchParams.get('importId');
    if (view === 'onboarding') {
      if (flow) params.set('flow', flow);
      if (importId) params.set('importId', importId);
    }

    // Normalize comparison to prevent redundant pushes
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.sort();
    const newParams = new URLSearchParams(params.toString());
    newParams.sort();

    const newUrl = `/resumy${pathname}?${params.toString()}`;
    
    if (currentParams.toString() !== newParams.toString()) {
      if (replace) {
        window.history.replaceState({ path: newUrl }, '', newUrl);
      } else {
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    }
  };


  // Lock page scroll for the entire resume creator session and restore on exit
  React.useEffect(() => {
    // We add 'lock-scroll' to the <html> tag. 
    // The CSS in globals.css will also apply it to the body.
    document.documentElement.classList.add('lock-scroll');

    return () => {
      // Forcefully remove it on unmount. 
      // This is much safer than capturing and restoring previous styles.
      document.documentElement.classList.remove('lock-scroll');
    };
  }, []);

  // 2. State for the selected template (Defaulting to 'creative-marketing')
  const [selectedTemplate, setSelectedTemplate] = useState("creative-marketing");

  // 3. Resume Data State
  const [resumeData, setResumeData] = useState({
    personal: {
      name: "", profession: "", email: "", phone: "", city: "", country: "", state: "", zipCode: "",
      linkedin: "", github: "", website: "", photo: null
    },
    summary: "",
    education: [],
    experience: [],
    skills: [],
    additionalSkills: [],
    strengths: [],
    projects: [],
    certifications: [],
    accomplishments: [],
    languages: [],
    interests: [],
    customSection: { title: "", description: "" },
    keyAchievements: [],
    software: [],

    themeColor: undefined,
    selectedExtraSections: {},
    mainSectionsOrder: [
      'summary', 'experience', 'projects', 'education',
      'certifications', 'keyAchievements', 'accomplishments',
      'software', 'affiliations', 'additionalInfo', 'custom', 'websites'
    ],
    sidebarSectionsOrder: ['skills', 'strengths', 'additionalSkills', 'languages', 'interests'],
    designSettings: {
      fontSize: undefined,
      fontFamily: undefined,
      sectionSpacing: undefined,
      paragraphSpacing: undefined,
      lineHeight: undefined,
      letterSpacing: undefined,
      pageMargin: 40,
    },
    visitedSections: {}, // Tracks which sections have been visited/edited
    initial_analysis: { sections_found: [], strengths: [], improvements: [] },
    resume_id: null, // Track the backend resumes table ID
    builder_resume_id: null, // Track the specific builder_resumes draft ID
    title: "Untitled Resume"
  });

  // --- Handlers ---
  const handleUpdateData = (parsedData) => {
    setResumeData(prev => {
      const newState = { ...prev };

      // Merge top-level fields only if they exist in parsedData
      Object.keys(parsedData).forEach(key => {
        if (key === 'personal') {
          newState.personal = { ...prev.personal, ...parsedData.personal };
        } else if (key === 'selectedExtraSections') {
          newState.selectedExtraSections = { ...prev.selectedExtraSections, ...parsedData.selectedExtraSections };
        } else if (key === 'templateLayouts') {
          // Deep-merge templateLayouts to prevent wiping other templates' saved data
          newState.templateLayouts = {
            ...(prev.templateLayouts || {}),
            ...Object.fromEntries(
              Object.entries(parsedData.templateLayouts || {}).map(([tid, tData]) => [
                tid,
                { ...(prev.templateLayouts?.[tid] || {}), ...tData }
              ])
            )
          };
        } else if (parsedData[key] !== undefined) {
          newState[key] = parsedData[key];
        }
      });

      // Special handling for section visibility based on content
      const ses = { ...newState.selectedExtraSections };
      const sectionsToCheck = ['languages', 'certifications', 'projects', 'software', 'interests', 'websites'];

      sectionsToCheck.forEach(s => {
        if (Array.isArray(parsedData[s]) && parsedData[s].length > 0) {
          ses[s] = true;
        }
      });

      if (parsedData.accomplishments && parsedData.accomplishments.length > 0) {
        ses.accomplishments = true;
      }

      newState.selectedExtraSections = ses;
      return newState;
    });
  };



  // Onboarding Complete (or step update)
  const handleOnboardingComplete = (updatedData, shouldFinish = true) => {
    // 1. Update Resume Data
    setResumeData(prev => ({ ...prev, ...updatedData }));

    // 2. Update Selected Template if it came in the message
    if (updatedData.template) {
      setSelectedTemplate(updatedData.template);
    }

    // 3. Optional Finish
    if (shouldFinish) {
      setCurrentView("editor");
      syncUrl('editor', null, updatedData.builder_resume_id || resumeData.builder_resume_id, 1);
      trackEvent('resume_editor_started', 'Switched from onboarding to editor', {
        feature_module: 'resume_creator',
        funnel_stage: 'started'
      });
    }
  };

  return (
    <div className="app-container">

      {/* VIEW 1: ONBOARDING */}
      {currentView === "onboarding" && (
        <Onboarding
          mode={onboardingMode}
          flow={searchParams.get('flow')}
          importId={searchParams.get('importId')}
          data={resumeData}
          onComplete={handleOnboardingComplete}
          onUpdateData={handleUpdateData}
          onBack={null}
          onModeChange={(newMode, extra = {}) => {
            setOnboardingMode(newMode);
            
            // Build final params for sync
            const flow = extra.flow || searchParams.get('flow');
            const importId = extra.importId || searchParams.get('importId');
            
            const params = new URLSearchParams(window.location.search);
            params.set('view', 'onboarding');
            params.set('mode', newMode);
            if (flow) params.set('flow', flow);
            else params.delete('flow');
            if (importId) params.set('importId', importId);
            else params.delete('importId');
            if (jobId) params.set('jobId', jobId);

            const newUrl = `/resumy${pathname}?${params.toString()}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
          }}
        />
      )}

      {/* VIEW 3: EDITOR (FormPanel) */}
      {currentView === "editor" && (
        <FormPanel
          data={resumeData}
          setData={setResumeData}
          resume_id={resumeData.resume_id}
          builder_resume_id={resumeData.builder_resume_id}
          jobId={jobId}
          title={resumeData.title}
          templateId={selectedTemplate}
          onChangeTemplate={(newTemplateId) => setSelectedTemplate(newTemplateId)}
          onRenameProject={(id, newTitle) => {
            if (id === resumeData.builder_resume_id) {
              setResumeData(prev => ({ ...prev, title: newTitle }));
            }
          }}
          onIdCreated={(newId) => {
            setResumeData(prev => ({ ...prev, builder_resume_id: newId }));
          }}
          onSwitchProject={(project) => {
            // Reset state for new project
            setResumeData({
              personal: {
                name: "",
                email: "",
                phone: "",
                profession: "",
                linkedin: "",
                github: "",
                website: "",
                city: "",
                country: "",
                state: "",
                zipCode: "",
                photo: ""
              },
              summary: "",
              experience: [],
              education: [],
              skills: [],
              projects: [],
              languages: [],
              certifications: [],
              accomplishments: [],
              interests: [],
              software: [],
              keyAchievements: [],
              strengths: [],
              themeColor: undefined,
              designSettings: {
                fontSize: 1,
                fontFamily: undefined,
                sectionSpacing: 1,
                paragraphSpacing: 1,
                lineHeight: 1.5,
                letterSpacing: 0,
                pageMargin: 40,
              },
              visitedSections: {},
              initial_analysis: { sections_found: [], strengths: [], improvements: [] },
              resume_id: null,
              builder_resume_id: project.id,
              title: project.title
            });
            if (project.template_id) setSelectedTemplate(project.template_id);
            syncUrl('editor', null, project.id, 1);
          }}
          onSyncUrl={syncUrl}
        />
      )}

    </div>
  );
}

export default App;