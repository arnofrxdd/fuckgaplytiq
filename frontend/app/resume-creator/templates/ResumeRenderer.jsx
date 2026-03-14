"use client";
import React, { Suspense, useEffect } from 'react';
import './ResumeRenderer.css'; // Global reset for resume previews
// --- IMPORTS FOR UNIFIED TEMPLATE ---
import Placeholder from './Placeholder';
import { templatesConfig } from './TemplateManager';
import TemplateRegistryMap from './TemplateRegistry';
import { ResumeContext } from './ResumeContext';
import { RESUME_FONTS } from '@/lib/fonts.config';

import { getMockDataForTemplate } from '../components/MockProfiles';
import { ZETY_MOCK_DATA } from '../utils/zetyMockData';



// --- HELPER TO GET GOOGLE FONT LINK ---
const getFontImportLink = (fontFamily) => {
  if (!fontFamily) return null;
  // Extract font name from string like "'Roboto', sans-serif" -> "Roboto"
  const fontName = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
  // Replace spaces with plus signs for URL
  const formattedName = fontName.replace(/\s+/g, '+');
  return `https://fonts.googleapis.com/css2?family=${formattedName}:wght@300;400;500;600;700;800;900&display=swap`;
};

// --- DATA MERGING HELPER ---
// --- DATA MERGING HELPER ---
const getRenderData = (userData, templateId, isFormPanel = false, currentStep = 1) => {
  const templateConfig = templatesConfig.find(t => t.id === templateId) || {};
  const mockData = isFormPanel ? ZETY_MOCK_DATA : getMockDataForTemplate(templateConfig);

  const defaultExtraSections = {
    personalDetails: true,
    websites: true,
    custom: true,
    languages: true,
    certifications: true,
    keyAchievements: true,
    accomplishments: true,
    affiliations: true,
    awards: true,
    interests: true,
    software: true,
    projects: true,
    publications: true,
    volunteering: true,
    references: true,
    additionalInfo: true
  };

  const hasSavedSelections = userData.selectedExtraSections && Object.keys(userData.selectedExtraSections).length > 0;
  const ses = hasSavedSelections ? { ...userData.selectedExtraSections } : { ...defaultExtraSections };

  const personalVisited = userData.visitedSections?.['personal'];

  // Mapping of section IDs to their Step ID in FormPanel
  const SECTION_STEP_MAP = {
    'personal': 1,
    'education': 2,
    'experience': 3,
    'skills': 4,
    'strengths': 4,
    'additionalSkills': 4,
    'summary': 5,
    'extra': 6
  };

  // Helper: Pick value based on content existence and navigation context
  const getSectionData = (key, fallbackValue, isExtra = false) => {
    const userValue = userData[key];
    const hasContent = Array.isArray(userValue) ? userValue.length > 0 : !!(userValue && userValue.trim && userValue.trim());
    const hasVisited = userData.visitedSections?.[key];

    if (hasContent) return userValue; // User has typed something

    if (isFormPanel) {
      const sectionTargetStep = SECTION_STEP_MAP[key];

      // If the user has moved PAST this section's step (and it's empty), hide the mock.
      // This creates a "clean" look for parts the user chose to skip.
      if (sectionTargetStep && currentStep > sectionTargetStep) {
        return Array.isArray(userValue) ? [] : "";
      }

      // Special case for ExtraSections (usually step 6 and onwards)
      // If we are at step 6 (choosing) or later, we show/hide based on their own dynamic steps.
      // For now, if we are at step 7+ (any dynamic extra), we hide the "generic extra" mock.
      if (isExtra && currentStep > 6) {
        return Array.isArray(userValue) ? [] : "";
      }

      // If they are on or BEFORE the section's step, show the mock (Zety specimen)
      // to keep the template looking professional while they work.
      return fallbackValue;
    }

    // In final rendering / print mode
    if (hasVisited) return Array.isArray(userValue) ? [] : "";
    return userValue;
  };

  const pickPersonal = (val, mockVal, isExtra = false) => {
    if (val && val.toString().trim()) return val;

    if (isFormPanel) {
      // If user moved past step 1 (Header), hide the mock labels for empty fields
      if (currentStep > 1) return "";
      return mockVal;
    }

    if (personalVisited) return val || "";
    return val || "";
  };

  const up = userData?.personal || {};
  const mp = mockData?.personal || {};

  const mergedPersonal = {
    ...up,
    name: pickPersonal(up.name, mp.name),
    profession: pickPersonal(up.profession, mp.profession),
    email: pickPersonal(up.email, mp.email),
    city: pickPersonal(up.city, mp.city),
    country: pickPersonal(up.country, mp.country),
    state: pickPersonal(up.state, mp.state),
    zipCode: pickPersonal(up.zipCode, mp.zipCode),
    phoneCode: up.phoneCode || "",
    phone: (() => {
      const rawPhone = up.phone || "";
      const code = up.phoneCode || "";
      if (code && rawPhone) {
        // Only combine if rawPhone doesn't already start with the code to avoid duplication
        if (rawPhone.startsWith(code)) return rawPhone;
        return `${code} ${rawPhone}`;
      }
      return pickPersonal(rawPhone, mp.phone);
    })(),
    photo: up.photo ? up.photo : (isFormPanel && currentStep <= 1 ? mp.photo : null),

    // Website and Portfolio core links (always shown if present in Step 1)
    linkedin: pickPersonal(up.linkedin, mp.linkedin),
    github: pickPersonal(up.github, mp.github),
    website: pickPersonal(up.website, mp.website),

    // Personal Details extra section (mask if 'personalDetails' is explicitly false)
    dob: ses.personalDetails ? pickPersonal(up.dob, mp.dob, true) : "",
    nationality: ses.personalDetails ? pickPersonal(up.nationality, mp.nationality, true) : "",
    maritalStatus: ses.personalDetails ? pickPersonal(up.maritalStatus, mp.maritalStatus, true) : "",
    visaStatus: ses.personalDetails ? pickPersonal(up.visaStatus, mp.visaStatus, true) : "",
    gender: ses.personalDetails ? pickPersonal(up.gender, mp.gender, true) : "",
    religion: ses.personalDetails ? pickPersonal(up.religion, mp.religion, true) : "",
    passport: ses.personalDetails ? pickPersonal(up.passport, mp.passport, true) : "",
    otherPersonal: ses.personalDetails ? pickPersonal(up.otherPersonal, mp.otherPersonal, true) : ""
  };

  const mergedData = {
    ...userData,
    personal: mergedPersonal,
    summary: getSectionData('summary', mockData?.summary || "", false),
    experience: getSectionData('experience', mockData?.experience || [], false),
    education: getSectionData('education', mockData?.education || [], false),
    skills: getSectionData('skills', mockData?.skills || [], false),
    strengths: getSectionData('strengths', mockData?.strengths || [], false),
    additionalSkills: getSectionData('additionalSkills', mockData?.additionalSkills || [], false),

    // Mask optional extra sections based on the 'ses' configuration
    projects: ses.projects ? getSectionData('projects', mockData?.projects || [], true) : [],
    keyAchievements: ses.keyAchievements ? getSectionData('keyAchievements', mockData?.keyAchievements || [], true) : [],
    languages: ses.languages ? getSectionData('languages', mockData?.languages || [], true) : [],
    interests: ses.interests ? getSectionData('interests', mockData?.interests || [], true) : [],
    certifications: ses.certifications ? getSectionData('certifications', mockData?.certifications || [], true) : [],
    software: ses.software ? getSectionData('software', mockData?.software || [], true) : [],
    accomplishments: ses.accomplishments ? getSectionData('accomplishments', mockData?.accomplishments || [], true) : [],
    affiliations: ses.affiliations ? getSectionData('affiliations', mockData?.affiliations || [], true) : [],
    additionalInfo: ses.additionalInfo ? getSectionData('additionalInfo', mockData?.additionalInfo || "", true) : "",
    volunteering: ses.volunteering ? getSectionData('volunteering', mockData?.volunteering || [], true) : [],
    references: ses.references ? getSectionData('references', mockData?.references || [], true) : [],
    awards: ses.awards ? getSectionData('awards', mockData?.awards || [], true) : [],
    publications: ses.publications ? getSectionData('publications', mockData?.publications || [], true) : [],
    websites: ses.websites ? getSectionData('websites', mockData?.websites || [], true) : [],
    customSection: ses.custom ? getSectionData('customSection', mockData?.customSection || { title: "", description: "", isVisible: false }, true) : { title: "", description: "", isVisible: false },

    selectedExtraSections: ses,
    themeColor: userData.themeColor,
    sectionsOrder: userData.sectionsOrder
  };

  return mergedData;
};


// --- SANITIZATION HELPER ---
const sanitizeForTemplate = (data) => {
  const sanitized = { ...data };

  // Date formatting helper for months/years
  const formatMonthYearStr = (m, y) => (m && y) ? `${m} ${y}` : (y || "");

  if (Array.isArray(sanitized.experience)) {
    sanitized.experience = sanitized.experience.map(job => {
      const startStr = formatMonthYearStr(job.startMonth, job.startYear);
      const endStr = job.isCurrent ? "Present" : formatMonthYearStr(job.endMonth, job.endYear);
      const combinedDate = startStr ? `${startStr} - ${endStr}` : (job.endYear || "");

      return {
        ...job,
        title: job.title || job.role,
        role: job.role || job.title,
        date: job.date || job.year || combinedDate,
        year: job.year || job.date || combinedDate,
        duration: job.duration || job.date || combinedDate
      };
    });
  }

  if (Array.isArray(sanitized.education)) {
    sanitized.education = sanitized.education.map(edu => {
      const startStr = formatMonthYearStr(edu.startMonth, edu.startYear);
      const endStr = edu.isCurrent ? "Present" : formatMonthYearStr(edu.endMonth, edu.endYear);
      const combinedDate = startStr ? `${startStr} - ${endStr}` : (edu.isCurrent ? "Present" : (edu.endYear || ""));

      return {
        ...edu,
        institution: edu.institution || edu.school,
        school: edu.school || edu.institution,
        year: edu.year || edu.date || combinedDate,
        date: edu.date || edu.year || combinedDate
      };
    });
  }

  if (Array.isArray(sanitized.projects)) {
    sanitized.projects = sanitized.projects.map(proj => ({
      ...proj,
      name: proj.name || proj.title,
      title: proj.title || proj.name
    }));
  }

  if (Array.isArray(sanitized.skills)) {
    // Keep skills as objects if they are objects, to preserve 'level'
    // sanitized.skills = sanitized.skills.map(s => typeof s === 'object' ? s.name : s);
  }

  if (Array.isArray(sanitized.languages)) {
    // Keep languages as objects
    // sanitized.languageNames = sanitized.languages.map(l => typeof l === 'object' ? l.name : l);
  }

  if (Array.isArray(sanitized.strengths)) {
    // Keep strengths as objects
  }

  if (Array.isArray(sanitized.additionalSkills)) {
    // Keep additionalSkills as objects
  }

  return sanitized;
};

const ResumeRenderer = React.memo(({
  templateId,
  data,
  highlightSection,
  onSectionClick,
  onReorder,
  scale = 1,
  forceDefault = false,
  isFormPanel = false,
  currentStep = 1,
  designSettings = null,
  isSpellCheckActive,
  onSpellCheckIgnore,
  onSpellCheckReplace,
  showPageBreaks = false,
  hidePageGuides = false,
  debugHighlights = false,
  isReorderMode = false,
  setIsReorderMode = () => { },
  forceDesktop = false
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      if (forceDesktop) {
        setIsMobile(false);
      } else {
        setIsMobile(window.innerWidth < 1024);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [forceDesktop]);

  const mergedData = data || {};
  const actualDesignSettings = designSettings || mergedData.designSettings || {};

  const renderData = forceDefault ?
    sanitizeForTemplate(getMockDataForTemplate(templatesConfig.find(t => t.id === templateId))) :
    getRenderData(mergedData, templateId, isFormPanel, currentStep);

  const finalData = forceDefault ? renderData : sanitizeForTemplate(renderData);
  const TemplateComponent = (TemplateRegistryMap && templateId) ? TemplateRegistryMap[templateId] : null;

  // Get Template Config for Defaults
  const templateConfig = templatesConfig.find(t => t.id === templateId) || {};

  // --- THEME SYNCING & RESOLUTION ---
  const templateLayoutSettings = mergedData.templateLayouts?.[templateId] || {};

  // PRECEDENCE: 1. Per-template saved color (from metadata/designSettings)
  //             2. Global manual themeColor
  //             3. Template's built-in default color (fallback)
  const themeColor = forceDefault
    ? (templateConfig.defaultColor || '#3b82f6')
    : (templateLayoutSettings.designSettings?.themeColor || templateLayoutSettings.themeColor || mergedData.themeColor || templateConfig.defaultColor || '#3b82f6');

  // PRECEDENCE: 1. Per-template saved font (from designSettings)
  //             2. Global manual design panel font selection
  //             3. Template's unique DESIGNED font
  //             4. System fallback
  const rawFont = forceDefault
    ? (templateConfig.defaultFont || "Plus Jakarta Sans")
    : (templateLayoutSettings.designSettings?.fontFamily || templateLayoutSettings.fontFamily || actualDesignSettings.fontFamily || templateConfig.defaultFont || "Plus Jakarta Sans");

  // Map the font name to the CSS variable if it exists in our config
  const getEffectiveFont = (fontName) => {
    const fontConfig = RESUME_FONTS.find(f => f.name === fontName);
    if (fontConfig) {
      const fallback = fontConfig.type === 'serif' ? 'serif' : 'sans-serif';
      return `var(${fontConfig.variable}), ${fallback}`;
    }
    // Fallback if not in config (keeps compatibility with existing templates)
    return fontName.includes(',') ? fontName : `'${fontName}', sans-serif`;
  };

  const themeFont = getEffectiveFont(rawFont);

  // Helper for RGB color (to support RGBA in CSS)
  const hexToRgb = (hex) => {
    if (!hex || typeof hex !== 'string') return "59, 130, 246";
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(s => s + s).join('');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? "59, 130, 246" : `${r}, ${g}, ${b}`;
  };
  const themeColorRgb = hexToRgb(themeColor);



  // Dynamic Font Loading (Optimized for RAM/Network)
  useEffect(() => {
    // Only load if it's a custom font not in our pre-loaded RESUME_FONTS list
    const isPreloaded = RESUME_FONTS.some(f => f.name === rawFont);
    if (isPreloaded) return;

    const fontLink = getFontImportLink(rawFont);
    if (fontLink) {
      const linkId = `font-${rawFont.replace(/\s+/g, '-').replace(/['"]/g, '')}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.href = fontLink;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }
  }, [rawFont]);

  if (!TemplateComponent) {
    if (templateId) console.warn(`Template ID "${templateId}" not found in registry.`);
    return <Placeholder />;
  }

  // Calculate Effective Settings (User Settings > Template Defaults > Global Fallbacks)
  const baselineSettings = templateConfig.defaults || {
    fontSize: 1, sectionSpacing: 1, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40
  };

  const effectiveSettings = {
    // We prioritize per-template saved settings first.
    // AND: We only use the global actualDesignSettings if they have been explicitly changed from the default baseline (1.0 etc).
    fontSize: templateLayoutSettings.designSettings?.fontSize || (actualDesignSettings.fontSize !== 1 && actualDesignSettings.fontSize !== undefined ? actualDesignSettings.fontSize : baselineSettings.fontSize),
    sectionSpacing: templateLayoutSettings.designSettings?.sectionSpacing || (actualDesignSettings.sectionSpacing !== 1 && actualDesignSettings.sectionSpacing !== undefined ? actualDesignSettings.sectionSpacing : baselineSettings.sectionSpacing),
    paragraphSpacing: templateLayoutSettings.designSettings?.paragraphSpacing || (actualDesignSettings.paragraphSpacing !== 1 && actualDesignSettings.paragraphSpacing !== undefined ? actualDesignSettings.paragraphSpacing : baselineSettings.paragraphSpacing),
    lineHeight: templateLayoutSettings.designSettings?.lineHeight || (actualDesignSettings.lineHeight !== 1.5 && actualDesignSettings.lineHeight !== undefined ? actualDesignSettings.lineHeight : baselineSettings.lineHeight),
    letterSpacing: templateLayoutSettings.designSettings?.letterSpacing || (actualDesignSettings.letterSpacing !== 0 && actualDesignSettings.letterSpacing !== undefined ? actualDesignSettings.letterSpacing : baselineSettings.letterSpacing),
    pageMargin: templateLayoutSettings.designSettings?.pageMargin || (actualDesignSettings.pageMargin !== 40 && actualDesignSettings.pageMargin !== undefined ? actualDesignSettings.pageMargin : baselineSettings.pageMargin),

    background: actualDesignSettings.background || templateConfig.theme?.background || '#ffffff',
    text: actualDesignSettings.text || templateConfig.theme?.text || '#334155',
    sidebarBackground: actualDesignSettings.sidebarBackground || templateConfig.theme?.sidebarBackground || '#0a2540',
    sidebarText: actualDesignSettings.sidebarText || templateConfig.theme?.sidebarText || '#ffffff',
  };

  const fontScale = effectiveSettings.fontSize;
  const sectionGap = effectiveSettings.sectionSpacing;
  const paragraphGap = effectiveSettings.paragraphSpacing;
  const lineHeight = effectiveSettings.lineHeight;

  // --- PAGE BREAK RECOVERY ---
  // If showPageBreaks is enabled, we inject a helper overlay that marks 297mm intervals
  const PageGuideOverlay = () => {
    if (!showPageBreaks || hidePageGuides) return null;
    return (
      <div className="page-guides-overlay" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10
      }}>
        {[1, 2, 3, 4, 5].map(page => (
          <div key={page} style={{
            position: 'absolute',
            top: `${page * 297}mm`,
            left: '-60px',
            right: '-60px',
            height: '2px',
            borderTop: '2px dashed rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              background: '#ef4444',
              color: 'white',
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '0',
              fontWeight: '800',
              textTransform: 'uppercase'
            }}>Page {page} Break</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Suspense
      fallback={
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
          <div className="animate-pulse">Loading Template...</div>
        </div>
      }
    >
      <div
        className={`resume-theme-provider ${showPageBreaks ? 'paged-mode' : 'seamless-mode'} ${debugHighlights ? 'debug-highlights-enabled' : ''}`}
        style={{

          width: '210mm',
          minHeight: '297mm',
          height: 'auto',
          display: 'grid', // Force child to fill the area (crucial for dark templates)
          backgroundColor: 'var(--theme-background)',
          boxSizing: 'border-box',
          margin: '0 auto',
          position: 'relative',
          overflow: 'visible', // Always visible to ensure full content is captured in PDFs
          // CSS Variabless for Theming
          '--theme-color': themeColor,
          '--theme-color-rgb': themeColorRgb,
          '--theme-color-light': `rgba(${themeColorRgb}, 0.3)`,
          '--theme-font': themeFont,

          '--theme-font-scale': fontScale,
          '--theme-section-margin': sectionGap,
          '--theme-paragraph-margin': paragraphGap,
          '--theme-line-height': lineHeight,
          '--theme-letter-spacing': `${effectiveSettings.letterSpacing}px`,
          '--theme-page-margin': `${effectiveSettings.pageMargin}px`,

          // --- EXTENDED THEME VARIABLES ---
          '--theme-background': effectiveSettings.background,
          '--theme-text': effectiveSettings.text,
          '--theme-sidebar-bg': effectiveSettings.sidebarBackground,
          '--theme-sidebar-text': effectiveSettings.sidebarText,

          // --- TYPOGRAPHY & SPACING DEFAULTS ---
          '--main-base-size': '14px',
          '--main-title-size': '16px',
          '--main-subtitle-size': '13px',
          '--main-date-size': '13px',
          '--main-text-primary': 'var(--theme-text)',
          '--main-text-muted': '#475569',
          '--main-text-dim': '#64748b',

          '--sidebar-base-size': '12px',
          '--sidebar-title-size': '13px',
          '--sidebar-date-size': '11px',
          '--sidebar-text-primary': 'var(--theme-sidebar-text)',
          '--sidebar-text-muted': '#cbd5e1',
          '--sidebar-text-dim': '#94a3b8',

          // --- UNIVERSAL FALLBACKS (For any generic zone) ---
          '--section-title-size': 'var(--main-title-size)',
          '--section-title-color': 'var(--main-text-primary)',
          '--section-title-border': '2px solid var(--theme-color)',
          '--item-title-size': 'var(--main-title-size)',
          '--item-title-color': 'var(--main-text-primary)',
          '--item-subtitle-size': 'var(--main-subtitle-size)',
          '--item-subtitle-color': 'var(--main-text-muted)',
          '--item-base-size': 'var(--main-base-size)',
          '--item-body-color': 'var(--main-text-muted)',
          '--item-date-size': 'var(--main-date-size)',
          '--item-date-color': 'var(--main-text-dim)',
          '--item-location-size': 'calc(var(--main-base-size) * 0.9)',
          '--item-location-color': 'var(--main-text-dim)',
          '--section-flex-direction': 'row',
          '--section-item-gap': '20px',
          '--section-date-width': '100px',

          // --- DRAG HANDLE DEFAULTS (Unified Interface) ---
          '--drag-handle-left': '8px',
          '--drag-handle-top': '-14px',
          '--drag-handle-color': 'var(--theme-color)',
          '--drag-handle-bg': '#ffffff',
          '--drag-handle-border': '#e2e8f0',

          fontFamily: 'var(--theme-font)',
          lineHeight: 'var(--theme-line-height)',
          letterSpacing: 'var(--theme-letter-spacing)',
          padding: (showPageBreaks || templateConfig.useRootPadding === false) ? 0 : 'var(--theme-page-margin)',
          backgroundColor: 'var(--theme-background)',
          color: 'var(--theme-text)'
        }}
      >
        <PageGuideOverlay />
        <ResumeContext.Provider value={{ highlightSection, onSectionClick, onReorder, isReorderMode, setIsReorderMode, isMobile, resumeData: mergedData, templateId }}>
          <TemplateComponent
            data={{ ...finalData, themeColor }} // Ensure themeColor is passed down explicitly too
            highlightSection={highlightSection}
            onSectionClick={onSectionClick}
            onReorder={onReorder}
            scale={scale}
            isSpellCheckActive={isSpellCheckActive}
            onSpellCheckIgnore={onSpellCheckIgnore}
            onSpellCheckReplace={onSpellCheckReplace}
            layoutConfig={templateConfig.layout}
            showPageBreaks={showPageBreaks}
            isReorderMode={isReorderMode}
            setIsReorderMode={setIsReorderMode}
          />
        </ResumeContext.Provider>
      </div>
    </Suspense>
  );
});

export default ResumeRenderer;