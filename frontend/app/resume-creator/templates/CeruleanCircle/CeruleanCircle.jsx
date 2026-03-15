import React, { useRef } from "react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SectionWrapper from "../../components/SectionWrapper";
import { useResumeDragAndDrop, DroppableZone, StableResumeDragOverlay } from "../../hooks/useResumeDragAndDrop";
import DraggableSection from "../../components/dnd/DraggableSection";
import SectionRenderer from "../common/SectionRenderer";
import { useSectionContext } from "../common/SectionContext";
import { useAutoPagination } from "../../hooks/useAutoPagination";
import {
    SpellCheckText,
    SplittableRichText,
    RichTextSpellCheck,
    LanguageItem,
    CertificationItem,
    SoftwareItem,
    ResumeLink
} from "../common/BaseComponents";
import { getCompleteLayout, getSavedLayout } from "../common/TemplateUtils";

/**
 * SuriModern Template
 * A professional resume template with:
 * - Left sidebar: dark teal (#1a3a4a) with circular photo, education, skills, reference
 * - Right main area: white background with name/title header, about me, work experience
 * - Full section breaking, pagination, drag-and-drop, spell check support
 */
const CeruleanCircle = ({
    data,
    onSectionClick,
    onReorder,
    scale = 1,
    isSpellCheckActive,
    onSpellCheckIgnore,
    onSpellCheckReplace,
    layoutConfig,
    showPageBreaks
}) => {
    const containerRef = useRef(null);

    if (!data) return null;
    const { personal } = data;
    const isInteractive = !!onSectionClick && !isSpellCheckActive;
    const canReorder = !!onReorder && !isSpellCheckActive;

    // --- THEME COLORS ---
    const SIDEBAR_BG = "var(--theme-color, #1a3a4a)";
    const SIDEBAR_TEXT = "#ffffff";
    const SIDEBAR_LABEL_COLOR = "#7ec8c8";
    const ACCENT = "var(--theme-color, #1a3a4a)";
    const DIVIDER = "rgba(255,255,255,0.15)";

    // --- DYNAMIC LAYOUT ENGINE ---
    const templateId = 'cerulean-circle';
    const savedLayout = data.templateLayouts?.[templateId] || {};
    const initialLayout = {
        sidebar: savedLayout.sidebar || savedLayout.left || ['contact', 'education', 'skills', 'additionalSkills', 'strengths', 'languages', 'certifications', 'software', 'interests', 'awards'],
        main: savedLayout.main || savedLayout.right || ['summary', 'experience', 'projects', 'volunteer', 'publications', 'custom', 'additionalInfo']
    };

    const completeLayout = getCompleteLayout(data, initialLayout, 'sidebar');
    const activeSidebarSections = completeLayout.sidebar || [];
    const activeMainSections = completeLayout.main || [];

    // --- DRAG & DROP ---
    const { dndContextProps, activeId } = useResumeDragAndDrop({
        data,
        onReorder,
        scale,
        containers: { sidebar: activeSidebarSections, main: activeMainSections }
    });

    // --- PAGINATION ---
    const pages = useAutoPagination({
        columns: { sidebar: activeSidebarSections, main: activeMainSections },
        data,
        enabled: showPageBreaks,
        containerRef,
        scale
    });

    // --- STYLES ---
    const styles = {
        page: {
            width: "210mm",
            height: "297mm",
            background: "white",
            boxSizing: "border-box",
            position: "relative",
            margin: "0 auto 30px auto",
            color: "#334155",
            fontFamily: "var(--theme-font, 'Georgia', serif)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "row",
        },
        // LEFT SIDEBAR
        sidebarColumn: {
            width: "34%",
            background: SIDEBAR_BG,
            color: SIDEBAR_TEXT,
            display: "flex",
            flexDirection: "column",
            paddingTop: "var(--theme-page-margin, 52px)",
            paddingBottom: "var(--theme-page-margin, 52px)",
            paddingLeft: "var(--theme-page-margin, 35px)",
            paddingRight: "var(--theme-page-margin, 35px)",
            minHeight: "100%",
            position: "relative",
        },
        photoArea: {
            width: "100%",
            aspectRatio: "1/1",
            position: "relative",
            overflow: "hidden",
            background: "#0d2535",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
        },
        photoCircle: {
            width: "78%",
            aspectRatio: "1/1",
            borderRadius: "50%",
            objectFit: "cover",
            border: "4px solid rgba(255,255,255,0.15)",
        },
        photoPlaceholder: {
            width: "78%",
            aspectRatio: "1/1",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            color: "rgba(255,255,255,0.3)",
        },
        sidebarContent: {
            paddingTop: "28px", // Fixed internal spacing
            paddingRight: "26px",
            paddingBottom: "var(--theme-page-margin, 40px)",
            paddingLeft: "26px",
            display: "flex",
            flexDirection: "column",
            gap: "calc(22px * var(--theme-section-margin, 1))",
            flex: 1,
        },
        sidebarSectionTitle: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: SIDEBAR_LABEL_COLOR,
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "12px",
            paddingBottom: "8px",
            borderBottom: `1px solid ${DIVIDER}`,
        },
        sidebarText: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: "rgba(255,255,255,0.85)",
            lineHeight: "var(--theme-line-height, 1.5)",
        },
        contactRow: {
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            marginBottom: "calc(10px * var(--theme-paragraph-margin, 1))",
        },
        contactIcon: {
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: SIDEBAR_LABEL_COLOR,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: "1px",
        },
        contactValue: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: "rgba(255,255,255,0.85)",
            wordBreak: "break-all",
            lineHeight: "1.4",
        },

        // RIGHT MAIN AREA
        mainColumn: {
            width: "66%",
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
        },
        // NAME HEADER (top of main area)
        headerArea: {
            paddingTop: "var(--theme-page-margin, 50px)",
            paddingBottom: "35px", // Fixed internal divider spacing
            paddingLeft: "var(--theme-page-margin, 40px)",
            paddingRight: "var(--theme-page-margin, 40px)",
            borderBottom: "2px solid #e8ecf0",
        },
        name: {
            fontSize: "calc(38px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "#0f1f2e",
            lineHeight: "1.1",
            margin: 0,
            letterSpacing: "-0.5px",
        },
        profession: {
            fontSize: "calc(15px * var(--theme-font-scale, 1))",
            fontWeight: "400",
            fontStyle: "italic",
            color: "#64748b",
            marginTop: "6px",
        },
        contactBar: {
            display: "flex",
            gap: "20px",
            marginTop: "16px",
            flexWrap: "wrap",
        },
        contactBarItem: {
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: "#475569",
        },
        contactBarDot: {
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: ACCENT,
            flexShrink: 0,
        },
        // MAIN SECTIONS
        mainContent: {
            paddingTop: "28px", // Fixed internal spacing
            paddingRight: "var(--theme-page-margin, 40px)",
            paddingBottom: "var(--theme-page-margin, 40px)",
            paddingLeft: "40px",
            display: "flex",
            flexDirection: "column",
            gap: "calc(28px * var(--theme-section-margin, 1))",
            flex: 1,
        },
        mainSectionTitle: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: ACCENT,
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            marginBottom: "16px",
            paddingBottom: "8px",
            borderBottom: `2px solid #e8ecf0`,
        },
        // EXPERIENCE ITEM
        expItem: {
            marginBottom: "calc(20px * var(--theme-paragraph-margin, 1))",
        },
        expHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "3px",
        },
        expCompany: {
            fontSize: "calc(14px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "#0f1f2e",
        },
        expDate: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: "#94a3b8",
            fontWeight: "500",
            whiteSpace: "nowrap",
            marginLeft: "10px",
        },
        expRole: {
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            fontStyle: "italic",
            color: "#64748b",
            marginBottom: "8px",
        },
        expDesc: {
            fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.6)",
            color: "#475569",
        },
        // EDUCATION ITEM (sidebar)
        eduItem: {
            marginBottom: "calc(14px * var(--theme-paragraph-margin, 1))",
        },
        eduDeg: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "#ffffff",
            marginBottom: "2px",
        },
        eduInst: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            fontStyle: "italic",
            color: "rgba(255,255,255,0.65)",
            marginBottom: "2px",
        },
        eduYear: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            color: SIDEBAR_LABEL_COLOR,
        },
        // SKILL LIST
        skillBullet: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "calc(8px * var(--theme-paragraph-margin, 1))",
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: "rgba(255,255,255,0.85)",
        },
        skillDot: {
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: SIDEBAR_LABEL_COLOR,
            flexShrink: 0,
        },
        // REFERENCE ITEM
        refItem: {
            marginBottom: "calc(16px * var(--theme-paragraph-margin, 1))",
        },
        refName: {
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "#ffffff",
            marginBottom: "2px",
        },
        refOrg: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            fontStyle: "italic",
            color: "rgba(255,255,255,0.65)",
            marginBottom: "6px",
        },
        refContact: {
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            color: SIDEBAR_LABEL_COLOR,
            marginBottom: "3px",
        },
        // PROJECTS
        projItem: {
            marginBottom: "calc(18px * var(--theme-paragraph-margin, 1))",
        },
        projTitle: {
            fontSize: "calc(14px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "#0f1f2e",
        },
        projDate: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: "#94a3b8",
        },
    };

    // ──────────────────────────────────────────
    // SECTION TITLE HELPER
    // ──────────────────────────────────────────
    const SectionTitle = ({ title, zoneId }) => {
        const { isContinued } = useSectionContext();
        const isSidebar = zoneId?.includes("sidebar");
        const displayTitle = isContinued ? `${title} (Cont.)` : title;
        return (
            <h3 style={isSidebar ? styles.sidebarSectionTitle : styles.mainSectionTitle}>
                {displayTitle}
            </h3>
        );
    };

    // ──────────────────────────────────────────
    // CUSTOM RENDERERS
    // ──────────────────────────────────────────
    const customRenderers = {
        // CONTACT (sidebar only)
        contact: ({ zoneId }) => {
            const isSidebar = zoneId?.includes("sidebar");
            if (!isSidebar) return null;
            return (
                <SectionWrapper sectionId="contact" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Contact">
                    <div>
                        <SectionTitle title="Contact" zoneId={zoneId} />
                        {personal?.phone && (
                            <div style={styles.contactRow}>
                                <div style={styles.contactIcon}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" /></svg>
                                </div>
                                <span style={styles.contactValue}>
                                    <ResumeLink href={personal.phone}>
                                        <SpellCheckText text={personal.phone} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'phone', val)} />
                                    </ResumeLink>
                                </span>
                            </div>
                        )}
                        {(personal?.city || personal?.state || personal?.country) && (
                            <div style={styles.contactRow}>
                                <div style={styles.contactIcon}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                                </div>
                                <span style={styles.contactValue}>
                                    <SpellCheckText
                                        text={[personal?.city, personal?.state, personal?.zipCode, personal?.country].filter(Boolean).join(", ")}
                                        isActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onReplace={(val) => onSpellCheckReplace('personal', 'city', val)}
                                    />
                                </span>
                            </div>
                        )}
                        {personal?.email && (
                            <div style={styles.contactRow}>
                                <div style={styles.contactIcon}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                                </div>
                                <span style={styles.contactValue}>
                                    <ResumeLink href={personal.email}>
                                        <SpellCheckText text={personal.email} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'email', val)} />
                                    </ResumeLink>
                                </span>
                            </div>
                        )}
                        {personal?.linkedin && (
                            <div style={styles.contactRow}>
                                <div style={styles.contactIcon}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
                                </div>
                                <span style={styles.contactValue}>
                                    <ResumeLink href={personal.linkedin}>
                                        <SpellCheckText text={personal.linkedin} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'linkedin', val)} />
                                    </ResumeLink>
                                </span>
                            </div>
                        )}
                        {personal?.github && (
                            <div style={styles.contactRow}>
                                <div style={styles.contactIcon}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                                </div>
                                <span style={styles.contactValue}>
                                    <ResumeLink href={personal.github}>
                                        <SpellCheckText text={personal.github} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'github', val)} />
                                    </ResumeLink>
                                </span>
                            </div>
                        )}
                        {personal?.website && (
                            <div style={styles.contactRow}>
                                <div style={styles.contactIcon}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.06-7.44 7-7.93v15.86zm2 0V4.07c3.94.49 7 3.85 7 7.93s-3.06 7.44-7 7.93z" /></svg>
                                </div>
                                <span style={styles.contactValue}>
                                    <ResumeLink href={personal.website}>
                                        <SpellCheckText text={personal.website} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'website', val)} />
                                    </ResumeLink>
                                </span>
                            </div>
                        )}
                    </div>
                </SectionWrapper>
            );
        },

        // EDUCATION (sidebar)
        education: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.education?.[idx]) : data.education;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");

            if (isSidebar) {
                return (
                    <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
                        <div>
                            <SectionTitle title="Education" zoneId={zoneId} />
                            {items.map((edu, i) => {
                                if (!edu) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const dateStr = edu.year || edu.date || edu.endYear || "";
                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.eduItem}>
                                        <div style={styles.eduDeg}>
                                            <RichTextSpellCheck html={edu.degree} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'degree')} />
                                        </div>
                                        <div style={styles.eduInst}>
                                            <RichTextSpellCheck html={`${edu.institution || edu.school || ""}${edu.location ? `, ${edu.location}` : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'institution')} />
                                        </div>
                                        <div style={styles.eduYear}>
                                            <RichTextSpellCheck html={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'year')} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </SectionWrapper>
                );
            }

            // Main column education (full layout)
            return (
                <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
                    <div>
                        <SectionTitle title="Education" zoneId={zoneId} />
                        {items.map((edu, i) => {
                            if (!edu) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr = edu.year || edu.date || edu.endYear || "";
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.expItem}>
                                    <div style={styles.expHeader}>
                                        <div style={styles.expCompany}>
                                            <RichTextSpellCheck html={`${edu.institution || edu.school || ""}${edu.location ? `, ${edu.location}` : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'institution')} />
                                        </div>
                                        <div style={styles.expDate}>
                                            <RichTextSpellCheck html={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'year')} />
                                        </div>
                                    </div>
                                    <div style={styles.expRole}>
                                        <RichTextSpellCheck html={edu.degree} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'degree')} />
                                    </div>
                                    {edu.description && (
                                        <div className="resume-rich-text" style={styles.expDesc}>
                                            <SplittableRichText html={edu.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'description')} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        // SKILLS (sidebar and main)
        skills: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.skills?.[idx]).filter(Boolean) : (data.skills || []);
            const hasDescription = data.skillsDescription && data.skillsDescription.trim();
            const isSidebar = zoneId?.includes("sidebar");

            if (items.length > 0) {
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <div>
                            <SectionTitle title="Skill" zoneId={zoneId} />
                            {isSidebar ? (
                                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                    {items.map((skill, i) => {
                                        const originalIdx = itemIndices ? itemIndices[i] : i;
                                        const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                        return (
                                            <li key={originalIdx} data-item-index={originalIdx} style={styles.skillBullet}>
                                                <div style={styles.skillDot} />
                                                <div style={{ flex: 1 }}>
                                                    <RichTextSpellCheck html={typeof skill === 'object' ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('skills', originalIdx, val, 'name')} />
                                                </div>
                                                {lvl > 0 && (
                                                    <span style={{ display: "flex", gap: "3px" }}>
                                                        {[...Array(5)].map((_, di) => (
                                                            <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? SIDEBAR_LABEL_COLOR : "rgba(255,255,255,0.15)" }} />
                                                        ))}
                                                    </span>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <ul style={{ paddingLeft: "16px", margin: 0 }}>
                                    {items.map((skill, i) => {
                                        const originalIdx = itemIndices ? itemIndices[i] : i;
                                        const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                        return (
                                            <li key={originalIdx} data-item-index={originalIdx} style={{ marginBottom: "6px", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#475569" }}>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                    <RichTextSpellCheck html={typeof skill === 'object' ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('skills', originalIdx, val, 'name')} />
                                                    {lvl > 0 && <span style={{ display: "flex", gap: "3px", marginLeft: "8px" }}>{[...Array(5)].map((_, di) => <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? ACCENT : "#e2e8f0" }} />)}</span>}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </SectionWrapper>
                );
            }

            if (hasDescription) {
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <div>
                            <SectionTitle title="Skill" zoneId={zoneId} />
                            <div className="resume-rich-text" style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: isSidebar ? "rgba(255,255,255,0.85)" : "#475569" }}>
                                <SplittableRichText html={data.skillsDescription} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace && onSpellCheckReplace('skills', 'skillsDescription', val)} />
                            </div>
                        </div>
                    </SectionWrapper>
                );
            }
            return null;
        },

        // STRENGTHS (sidebar)
        strengths: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.strengths?.[idx]).filter(Boolean) : (data.strengths || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="strengths" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Strengths">
                    <div>
                        <SectionTitle title="Key Strengths" zoneId={zoneId} />
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {items.map((skill, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                return (
                                    <li key={originalIdx} data-item-index={originalIdx} style={isSidebar ? styles.skillBullet : { marginBottom: "6px", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#475569" }}>
                                        {isSidebar && <div style={styles.skillDot} />}
                                        <div style={{ flex: 1 }}>
                                            <RichTextSpellCheck html={typeof skill === 'object' ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('strengths', originalIdx, val, 'name')} />
                                        </div>
                                        {lvl > 0 && <span style={{ display: "flex", gap: "3px", marginLeft: "8px" }}>{[...Array(5)].map((_, di) => <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? (isSidebar ? SIDEBAR_LABEL_COLOR : ACCENT) : (isSidebar ? "rgba(255,255,255,0.15)" : "#e2e8f0") }} />)}</span>}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </SectionWrapper>
            );
        },

        // ADDITIONAL SKILLS (sidebar)
        additionalSkills: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.additionalSkills?.[idx]).filter(Boolean) : (data.additionalSkills || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="additionalSkills" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Skills">
                    <div>
                        <SectionTitle title="Additional Skills" zoneId={zoneId} />
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {items.map((skill, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                return (
                                    <li key={originalIdx} data-item-index={originalIdx} style={isSidebar ? styles.skillBullet : { marginBottom: "6px", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#475569" }}>
                                        {isSidebar && <div style={styles.skillDot} />}
                                        <div style={{ flex: 1 }}>
                                            <RichTextSpellCheck html={typeof skill === 'object' ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalSkills', originalIdx, val, 'name')} />
                                        </div>
                                        {lvl > 0 && <span style={{ display: "flex", gap: "3px", marginLeft: "8px" }}>{[...Array(5)].map((_, di) => <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? (isSidebar ? SIDEBAR_LABEL_COLOR : ACCENT) : (isSidebar ? "rgba(255,255,255,0.15)" : "#e2e8f0") }} />)}</span>}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </SectionWrapper>
            );
        },

        // LANGUAGES
        languages: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.languages?.[idx]) : data.languages;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="languages" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Languages">
                    <div>
                        <SectionTitle title="Languages" zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {items.map((lang, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <LanguageItem
                                        key={i}
                                        item={lang}
                                        index={originalIdx}
                                        isSpellCheckActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onSpellCheckReplace={(field, val) => onSpellCheckReplace('languages', originalIdx, val, field)}
                                        style={isSidebar ? { color: "rgba(255,255,255,0.85)", fontSize: "calc(12px * var(--theme-font-scale, 1))" } : {}}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // CERTIFICATIONS
        certifications: ({ itemIndices, isContinued, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.certifications?.[idx]) : data.certifications;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
                    <div>
                        <SectionTitle title="Certifications" zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((cert, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <CertificationItem
                                        key={i}
                                        item={cert}
                                        index={originalIdx}
                                        isSpellCheckActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onSpellCheckReplace={(field, val) => onSpellCheckReplace('certifications', originalIdx, val, field)}
                                        variant={isSidebar ? 'compact' : undefined}
                                        subItemRange={renderSubItemRanges?.[originalIdx]}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // SOFTWARE
        software: ({ itemIndices, isContinued, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.software?.[idx]) : data.software;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="software" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Software">
                    <div>
                        <SectionTitle title="Software" zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <SoftwareItem
                                        key={i}
                                        item={item}
                                        index={originalIdx}
                                        isSpellCheckActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onSpellCheckReplace={(field, val) => onSpellCheckReplace('software', originalIdx, val, field)}
                                        variant={isSidebar ? 'compact' : undefined}
                                        subItemRange={renderSubItemRanges?.[originalIdx]}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // INTERESTS (sidebar)
        interests: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.interests?.[idx]) : data.interests;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="interests" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Interests">
                    <div>
                        <SectionTitle title="Interests" zoneId={zoneId} />
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {items.map((item, i) => (
                                <li key={i} data-item-index={itemIndices ? itemIndices[i] : i} style={isSidebar ? styles.skillBullet : { marginBottom: "6px", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#475569" }}>
                                    {isSidebar && <div style={styles.skillDot} />}
                                    <RichTextSpellCheck html={typeof item === 'object' ? item.name : item} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('interests', itemIndices ? itemIndices[i] : i, val, 'name')} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </SectionWrapper>
            );
        },

        // AWARDS
        awards: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.awards?.[idx]) : data.awards;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="awards" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Awards">
                    <div>
                        <SectionTitle title="Awards" zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(12px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((award, i) => (
                                <div key={i} style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))" }}>
                                    <div style={{ fontWeight: "700", color: isSidebar ? "#fff" : "#0f1f2e" }}>
                                        <RichTextSpellCheck html={award.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', itemIndices ? itemIndices[i] : i, val, 'title')} />
                                    </div>
                                    <div style={{ color: isSidebar ? SIDEBAR_LABEL_COLOR : ACCENT, fontStyle: "italic" }}>
                                        <RichTextSpellCheck html={award.issuer} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', itemIndices ? itemIndices[i] : i, val, 'issuer')} />
                                        {award.year && <span> • {award.year}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // WEBSITES (sidebar)
        websites: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.websites?.[idx]) : data.websites;
            const portfolioLinks = (items || [])
                .map((link, idx) => ({ ...link, originalIdx: itemIndices ? itemIndices[idx] : idx }))
                .filter(link => link.url);
            if (portfolioLinks.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="websites" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Websites & Portfolios">
                    <div>
                        <SectionTitle title="Websites & Portfolios" zoneId={zoneId} />
                        {portfolioLinks.map((site, i) => (
                            <div key={i} style={styles.contactRow}>
                                <span style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: isSidebar ? "rgba(255,255,255,0.85)" : "#475569" }}>
                                    <ResumeLink href={site.url}>
                                        <SpellCheckText text={site.url} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('websites', site.originalIdx, val, 'url')} />
                                    </ResumeLink>
                                </span>
                            </div>
                        ))}
                    </div>
                </SectionWrapper>
            );
        },

        // SUMMARY (main / about me)
        summary: ({ isContinued, subItemRanges, zoneId }) => {
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="summary" onSectionClick={onSectionClick} isInteractive={isInteractive} label="About Me">
                    <div>
                        <SectionTitle title="About Me" zoneId={zoneId} />
                        <div className="resume-rich-text" style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", lineHeight: "var(--theme-line-height, 1.65)", color: isSidebar ? "rgba(255,255,255,0.85)" : "#475569" }}>
                            <SplittableRichText
                                html={data.summary}
                                range={subItemRanges?.summary}
                                isActive={isSpellCheckActive}
                                onIgnore={onSpellCheckIgnore}
                                onReplace={(val) => onSpellCheckReplace('summary', 'summary', val)}
                            />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // EXPERIENCE (main)
        experience: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.experience?.[idx]) : data.experience;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="experience" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Work Experience">
                    <div>
                        <SectionTitle title="Work Experience" zoneId={zoneId} />
                        {items.map((exp, i) => {
                            if (!exp) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr = exp.year || exp.date || (exp.startYear ? `${exp.startYear} - ${exp.isCurrent ? "Now" : exp.endYear}` : "");
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.expItem}>
                                    <div style={styles.expHeader}>
                                        <div style={isSidebar ? styles.eduDeg : styles.expCompany}>
                                            <RichTextSpellCheck html={exp.company || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'company')} />
                                        </div>
                                        {!isSidebar && (
                                            <div style={styles.expDate}>
                                                <RichTextSpellCheck html={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'date')} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={isSidebar ? styles.eduInst : styles.expRole}>
                                        <RichTextSpellCheck html={`${exp.title || exp.role || ""}${exp.location ? `, ${exp.location}` : ""}${exp.isRemote ? " • Remote" : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'title')} />
                                    </div>
                                    {isSidebar && (
                                        <div style={styles.eduYear}>
                                            <RichTextSpellCheck html={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'date')} />
                                        </div>
                                    )}
                                    {!isSidebar && (
                                        <div className="resume-rich-text" style={styles.expDesc}>
                                            <SplittableRichText
                                                html={exp.description}
                                                range={subItemRanges?.[originalIdx]}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'description')}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        // PROJECTS (main)
        projects: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.projects?.[idx]) : data.projects;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
                    <div>
                        <SectionTitle title="Projects" zoneId={zoneId} />
                        {items.map((proj, i) => {
                            if (!proj) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr = proj.year || (proj.startYear && `${proj.startYear} - ${proj.isCurrent ? 'Present' : (proj.endYear || 'Present')}`);
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.projItem}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                                        <div style={isSidebar ? styles.eduDeg : styles.projTitle}>
                                            <RichTextSpellCheck html={proj.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'title')} />
                                        </div>
                                        {!isSidebar && dateStr && <div style={styles.projDate}>{dateStr}</div>}
                                    </div>
                                    {isSidebar && dateStr && <div style={styles.eduYear}>{dateStr}</div>}
                                    {proj.technologies && proj.technologies.length > 0 && !isSidebar && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "6px" }}>
                                            {proj.technologies.map((tech, tIdx) => (
                                                <span key={tIdx} style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", padding: "2px 7px", background: "#f1f5f9", borderRadius: "12px", color: "#64748b" }}>
                                                    <RichTextSpellCheck html={tech} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => { const updated = [...proj.technologies]; updated[tIdx] = val; onSpellCheckReplace('projects', originalIdx, updated, 'technologies'); }} />
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {!isSidebar && (
                                        <div className="resume-rich-text" style={styles.expDesc}>
                                            <SplittableRichText html={proj.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'description')} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        // VOLUNTEER (main)
        volunteer: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.volunteer?.[idx]) : data.volunteer;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="volunteer" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Volunteer">
                    <div>
                        <SectionTitle title="Volunteer" zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(15px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((item, i) => (
                                <div key={i}>
                                    <div style={styles.expCompany}><RichTextSpellCheck html={item.organization} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteer', itemIndices ? itemIndices[i] : i, val, 'organization')} /></div>
                                    <div style={styles.expRole}><RichTextSpellCheck html={item.role} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteer', itemIndices ? itemIndices[i] : i, val, 'role')} /></div>
                                    <div style={{ fontSize: "calc(11.5px * var(--theme-font-scale, 1))", color: "#94a3b8" }}>{item.startDate} - {item.isCurrent ? "Present" : item.endDate}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // PUBLICATIONS (main)
        publications: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.publications?.[idx]) : data.publications;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="publications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Publications">
                    <div>
                        <SectionTitle title="Publications" zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(12px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((pub, i) => (
                                <div key={i}>
                                    <div style={{ fontWeight: "700", fontSize: "calc(13.5px * var(--theme-font-scale, 1))", color: "#0f1f2e" }}><RichTextSpellCheck html={pub.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('publications', itemIndices ? itemIndices[i] : i, val, 'name')} /></div>
                                    <div style={{ fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: ACCENT }}><RichTextSpellCheck html={pub.publisher} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('publications', itemIndices ? itemIndices[i] : i, val, 'publisher')} />{pub.releaseDate && <span> • {pub.releaseDate}</span>}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ADDITIONAL INFO (main)
        additionalInfo: ({ isContinued, subItemRanges: renderSubItemRanges, zoneId }) => {
            const html = data.additionalInfo || "";
            if (!html || html.trim() === "" || html === "<p><br></p>") return null;
            return (
                <SectionWrapper sectionId="additionalInfo" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Information">
                    <div>
                        <SectionTitle title="Additional Information" zoneId={zoneId} />
                        <div className="resume-rich-text" style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", lineHeight: "1.6", color: "#475569" }}>
                            <SplittableRichText html={html} range={renderSubItemRanges?.additionalInfo} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalInfo', 'additionalInfo', val)} />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // CUSTOM (main)
        custom: ({ isContinued, subItemRanges: renderSubItemRanges, zoneId }) => {
            if (!data.customSection?.isVisible || !data.customSection?.content) return null;
            const content = data.customSection.content;
            if (!content || content.trim() === "" || content === "<p><br></p>") return null;
            const title = data.customSection.title || "Additional Information";
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="custom" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <div>
                        <SectionTitle title={title} zoneId={zoneId} />
                        <div className="resume-rich-text" style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", lineHeight: "1.6", color: isSidebar ? "rgba(255,255,255,0.85)" : "#475569" }}>
                            <SplittableRichText html={content} range={renderSubItemRanges?.custom} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('customSection', 'content', val)} />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        keyAchievements: ({ itemIndices, zoneId, subItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.keyAchievements?.[idx]) : data.keyAchievements;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="keyAchievements" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Achievements">
                    <div>
                        <SectionTitle title="Key Achievements" zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: isSidebar ? "rgba(255,255,255,0.85)" : "#475569" }}>
                                        <div style={{ fontWeight: "700", color: isSidebar ? "#fff" : "#0f1f2e" }}>
                                            <RichTextSpellCheck html={item.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIdx, val, 'title')} />
                                        </div>
                                        <div className="resume-rich-text">
                                            <SplittableRichText html={item.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIdx, val, 'description')} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        accomplishments: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.accomplishments?.[idx]) : data.accomplishments;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="accomplishments" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Accomplishments">
                    <div>
                        <SectionTitle title="Accomplishments" zoneId={zoneId} />
                        <ul style={{ paddingLeft: "16px", margin: 0, color: isSidebar ? "rgba(255,255,255,0.85)" : "#475569" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <li key={i} data-item-index={originalIdx} style={{ marginBottom: "6px" }}>
                                        <RichTextSpellCheck html={typeof item === 'object' ? item.name : item} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('accomplishments', originalIdx, val, 'name')} />
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </SectionWrapper>
            );
        },
        affiliations: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.affiliations?.[idx]) : data.affiliations;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="affiliations" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Affiliations">
                    <div>
                        <SectionTitle title="Affiliations" zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: isSidebar ? "rgba(255,255,255,0.85)" : "#475569" }}>
                                        <div style={{ fontWeight: "700", color: isSidebar ? "#fff" : "#0f1f2e" }}>
                                            <RichTextSpellCheck html={item.organization} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, 'organization')} />
                                        </div>
                                        <div>
                                            <RichTextSpellCheck html={item.role} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, 'role')} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        personalDetails: ({ zoneId }) => {
            const isSidebar = zoneId?.includes("sidebar");
            const fields = [
                { label: 'Date of Birth', value: personal?.dob, field: 'dob' },
                { label: 'Nationality', value: personal?.nationality, field: 'nationality' },
                { label: 'Marital Status', value: personal?.maritalStatus, field: 'maritalStatus' },
                { label: 'Gender', value: personal?.gender, field: 'gender' },
                { label: 'Visa Status', value: personal?.visaStatus, field: 'visaStatus' },
                { label: 'Religion', value: personal?.religion, field: 'religion' },
                { label: 'Passport', value: personal?.passport, field: 'passport' },
                { label: 'Place of Birth', value: personal?.placeOfBirth, field: 'placeOfBirth' },
                { label: 'Driving License', value: personal?.drivingLicense, field: 'drivingLicense' },
                { label: 'Other Info', value: personal?.otherPersonal, field: 'otherPersonal' }
            ].filter(f => f.value);
            if (fields.length === 0) return null;
            return (
                <SectionWrapper sectionId="personalDetails" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Personal Details">
                    <div>
                        <SectionTitle title="Personal Details" zoneId={zoneId} />
                        <div style={{ display: "grid", gridTemplateColumns: isSidebar ? "1fr" : "repeat(2, 1fr)", gap: "10px 20px" }}>
                            {fields.map((f, i) => (
                                <div key={i} style={isSidebar ? styles.contactRow : { marginBottom: "5px" }}>
                                    <div style={{ fontWeight: "600", color: isSidebar ? SIDEBAR_LABEL_COLOR : ACCENT, fontSize: "calc(11px * var(--theme-font-scale, 1))", textTransform: "uppercase" }}>{f.label}</div>
                                    <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: isSidebar ? "#fff" : "#475569" }}>
                                        <SpellCheckText text={f.value} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', f.field, val)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
    };

    // ──────────────────────────────────────────
    // HEADER (right panel top, name + profession + contact bar)
    // ──────────────────────────────────────────
    const Header = ({ showContactBar = true }) => (
        <SectionWrapper sectionId="personal" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Header">
            <div style={styles.headerArea}>
                <h1 style={styles.name}>
                    <SpellCheckText
                        text={personal?.name || "YOUR NAME"}
                        isActive={isSpellCheckActive}
                        onIgnore={onSpellCheckIgnore}
                        onReplace={(val) => onSpellCheckReplace('personal', 'name', val)}
                    />
                </h1>
                {personal?.profession && (
                    <div style={styles.profession}>
                        <SpellCheckText
                            text={personal.profession}
                            isActive={isSpellCheckActive}
                            onIgnore={onSpellCheckIgnore}
                            onReplace={(val) => onSpellCheckReplace('personal', 'profession', val)}
                        />
                    </div>
                )}
                {showContactBar && (
                    <div style={styles.contactBar}>
                        {personal?.phone && (
                            <div style={styles.contactBarItem}>
                                <div style={{ ...styles.contactBarDot, background: ACCENT }} />
                                <ResumeLink href={personal.phone}>
                                    <SpellCheckText text={personal.phone} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'phone', val)} />
                                </ResumeLink>
                            </div>
                        )}
                        {(personal?.city || personal?.country) && (
                            <div style={styles.contactBarItem}>
                                <div style={{ ...styles.contactBarDot, background: ACCENT }} />
                                <SpellCheckText text={[personal?.city, personal?.state, personal?.country].filter(Boolean).join(", ")} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'city', val)} />
                            </div>
                        )}
                        {personal?.email && (
                            <div style={styles.contactBarItem}>
                                <div style={{ ...styles.contactBarDot, background: ACCENT }} />
                                <ResumeLink href={personal.email}>
                                    <SpellCheckText text={personal.email} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'email', val)} />
                                </ResumeLink>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </SectionWrapper>
    );

    // ──────────────────────────────────────────
    // ZONE RENDERER
    // ──────────────────────────────────────────
    const renderZone = (id, items, columnStyle) => (
        <DroppableZone id={id} style={{ ...columnStyle, flex: 1 }}>
            {items.map((sid, idx) => {
                const isContinued = typeof sid === 'object' && sid.isContinued;
                const sectionId = typeof sid === 'string' ? sid : sid.id;
                const dragId = isContinued ? `${id}-cont-${sectionId}-${idx}` : sectionId;
                return (
                    <DraggableSection key={dragId} id={dragId} isEnabled={canReorder && !isContinued}>
                        <div style={{ paddingBottom: "1px" }}>
                            <SectionRenderer
                                sectionId={sectionId}
                                data={data}
                                onSectionClick={onSectionClick}
                                isContinued={isContinued}
                                itemIndices={typeof sid === 'object' ? sid.itemIndices : undefined}
                                subItemRanges={typeof sid === 'object' ? sid.subItemRanges : undefined}
                                customRenderers={customRenderers}
                                zoneId={id}
                            />
                        </div>
                    </DraggableSection>
                );
            })}
        </DroppableZone>
    );

    // ──────────────────────────────────────────
    // MEASURER (for auto-pagination height calc)
    // ──────────────────────────────────────────
    const Measurer = () => (
        <div className="resume-measurer" style={{ position: "absolute", top: -10000, left: -10000, width: "210mm", visibility: "hidden" }}>
            <div className="page-height-marker" style={{ height: "297mm", width: "1px", position: "absolute", left: 0, top: 0 }} />
            <div style={{ ...styles.page, height: "auto" }}>
                {/* SIDEBAR */}
                <div data-column-id="sidebar" style={styles.sidebarColumn}>
                    {personal?.photo ? (
                        <div style={styles.photoArea}>
                            <img src={personal.photo} style={styles.photoCircle} alt="profile" />
                        </div>
                    ) : (
                        <div style={styles.photoArea}>
                            <div style={styles.photoPlaceholder}>👤</div>
                        </div>
                    )}
                    <div style={styles.sidebarContent}>
                        {activeSidebarSections.map(sid => (
                            <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="sidebar" />
                        ))}
                    </div>
                </div>
                {/* MAIN */}
                <div data-column-id="main" style={styles.mainColumn}>
                    <Header />
                    <div style={styles.mainContent}>
                        {activeMainSections.map(sid => (
                            <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="main" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // ──────────────────────────────────────────
    // PAGE RENDERER
    // ──────────────────────────────────────────
    const renderPage = (page, i) => (
        <div key={i} style={styles.page}>
            {/* SIDEBAR */}
            <div data-column-id="sidebar" style={styles.sidebarColumn}>
                {i === 0 && (
                    <div style={styles.photoArea}>
                        {personal?.photo ? (
                            <img src={personal.photo} style={styles.photoCircle} alt="profile" />
                        ) : (
                            <div style={styles.photoPlaceholder}>👤</div>
                        )}
                    </div>
                )}
                <div style={styles.sidebarContent}>
                    {renderZone(
                        `sidebar-p${i}`,
                        page.sidebar || [],
                        { display: "flex", flexDirection: "column", gap: "calc(22px * var(--theme-section-margin, 1))", flex: 1 }
                    )}
                </div>
            </div>
            {/* MAIN */}
            <div data-column-id="main" style={styles.mainColumn}>
                {i === 0 && <Header />}
                <div style={styles.mainContent}>
                    {renderZone(
                        `main-p${i}`,
                        page.main || [],
                        { display: "flex", flexDirection: "column", gap: "calc(28px * var(--theme-section-margin, 1))", flex: 1 }
                    )}
                </div>
                <div style={{ position: "absolute", bottom: "12px", right: "16px", fontSize: "9px", color: "#cbd5e1", opacity: 0.7 }}>
                    Page {i + 1}
                </div>
            </div>
        </div>
    );

    const renderSinglePage = () => (
        <div style={{ ...styles.page, height: "auto", minHeight: "297mm" }}>
            {/* SIDEBAR */}
            <div data-column-id="sidebar" style={{ ...styles.sidebarColumn, minHeight: "297mm" }}>
                <div style={styles.photoArea}>
                    {personal?.photo ? (
                        <img src={personal.photo} style={styles.photoCircle} alt="profile" />
                    ) : (
                        <div style={styles.photoPlaceholder}>👤</div>
                    )}
                </div>
                <div style={styles.sidebarContent}>
                    {renderZone(
                        'sidebar',
                        activeSidebarSections,
                        { display: "flex", flexDirection: "column", gap: "calc(22px * var(--theme-section-margin, 1))", flex: 1 }
                    )}
                </div>
            </div>
            {/* MAIN */}
            <div data-column-id="main" style={styles.mainColumn}>
                <Header />
                <div style={styles.mainContent}>
                    {renderZone(
                        'main',
                        activeMainSections,
                        { display: "flex", flexDirection: "column", gap: "calc(28px * var(--theme-section-margin, 1))", flex: 1 }
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="suri-modern-root">
            <Measurer />
            <DndContext {...dndContextProps}>
                <SortableContext items={[...activeSidebarSections, ...activeMainSections]} strategy={verticalListSortingStrategy}>
                    {showPageBreaks && pages
                        ? pages.map((page, i) => renderPage(page, i))
                        : renderSinglePage()
                    }
                </SortableContext>
                <StableResumeDragOverlay
                    activeId={activeId}
                    scale={scale}
                    renderSection={(id) => (
                        <div style={{ background: "white", padding: "10px", border: "1px solid #ddd", width: "280px" }}>
                            <SectionRenderer sectionId={id} data={data} customRenderers={customRenderers} />
                        </div>
                    )}
                />
            </DndContext>
        </div>
    );
};

export default CeruleanCircle;