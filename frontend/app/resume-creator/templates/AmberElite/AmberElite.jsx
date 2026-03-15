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
 * AmberElite Template
 * A high-fidelity reconstruction of the dark navy/yellow sidebar resume design.
 * Features: dark navy left sidebar, white main content area, yellow accent color,
 * photo at top of sidebar, bullet-list style sidebar sections.
 * Full pagination, section splitting, drag-and-drop, spell check support.
 */
const AmberElite = ({
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

    // --- DYNAMIC LAYOUT ENGINE ---
    const templateId = 'amber-elite';
    const savedLayout = data.templateLayouts?.[templateId] || {};
    const initialLayout = {
        sidebar: savedLayout.sidebar || savedLayout.left || ['contact', 'education', 'skills', 'strengths', 'additionalSkills', 'certifications', 'languages', 'software', 'interests', 'awards', 'websites', 'personalDetails'],
        main: savedLayout.main || savedLayout.right || ['summary', 'experience', 'projects', 'keyAchievements', 'accomplishments', 'volunteer', 'publications', 'affiliations', 'references', 'additionalInfo', 'custom']
    };

    const completeLayout = getCompleteLayout(data, initialLayout, 'main');
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

    // --- DESIGN TOKENS ---
    const NAVY = "#1a2234";
    const NAVY_DARK = "#141b2b";
    const YELLOW = "var(--theme-color, #f5c842)";
    const YELLOW_RAW = "#f5c842";
    const WHITE = "#ffffff";
    const BODY_TEXT = "#2d3748";
    const LIGHT_GRAY = "#e8ecf0";
    const MUTED = "#718096";

    // --- STYLES ---
    const styles = {
        page: {
            width: "210mm",
            height: "297mm",
            background: WHITE,
            boxSizing: "border-box",
            position: "relative",
            margin: "0 auto 30px auto",
            color: BODY_TEXT,
            fontFamily: "var(--theme-font, 'Georgia', serif)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "row",
        },
        // LEFT SIDEBAR
        sidebar: {
            width: "34%",
            background: NAVY,
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
            position: "relative",
        },
        sidebarInner: {
            padding: "var(--theme-page-margin, 40px)",
            display: "flex",
            flexDirection: "column",
            flex: 1,
        },
        // Photo block at top of sidebar
        photoBlock: {
            width: "100%",
            aspectRatio: "1/1",
            overflow: "hidden",
            position: "relative",
            marginBottom: "0px",
        },
        photo: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
        },
        photoPlaceholder: {
            width: "100%",
            aspectRatio: "1/1",
            background: "#2a3550",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        // Name block in sidebar (below photo)
        nameBlock: {
            background: NAVY_DARK,
            padding: "16px calc(var(--theme-page-margin, 40px) * 0.6) 18px calc(var(--theme-page-margin, 40px) * 0.6)",
            borderBottom: `3px solid ${YELLOW_RAW}`,
        },
        name: {
            fontSize: "calc(22px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: WHITE,
            margin: 0,
            letterSpacing: "2px",
            textTransform: "uppercase",
            lineHeight: "1.1",
            fontFamily: "var(--theme-font, 'Georgia', serif)",
        },
        profession: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            fontWeight: "400",
            color: YELLOW_RAW,
            marginTop: "5px",
            letterSpacing: "3px",
            textTransform: "uppercase",
        },
        // Sidebar section
        sidebarSection: {
            padding: "18px calc(var(--theme-page-margin, 40px) * 0.6) calc(14px * var(--theme-section-margin, 1)) calc(var(--theme-page-margin, 40px) * 0.6)",
        },
        sidebarSectionTitle: {
            fontSize: "calc(10px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: YELLOW_RAW,
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
        },
        sidebarSectionTitleBar: {
            width: "18px",
            height: "2px",
            background: YELLOW_RAW,
            display: "inline-block",
            flexShrink: 0,
        },
        sidebarText: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: "#c8d2e0",
            lineHeight: "var(--theme-line-height, 1.55)",
        },
        sidebarLabel: {
            fontSize: "calc(9px * var(--theme-font-scale, 1))",
            color: YELLOW_RAW,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "2px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
        },
        sidebarValue: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            color: "#c8d2e0",
            marginBottom: "calc(10px * var(--theme-paragraph-margin, 1))",
            wordBreak: "break-all",
            overflowWrap: "break-word",
            paddingLeft: "2px",
        },
        sidebarBullet: {
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            marginBottom: "calc(8px * var(--theme-paragraph-margin, 1))",
        },
        bulletDot: {
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: YELLOW_RAW,
            flexShrink: 0,
            marginTop: "5px",
        },
        bulletText: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: "#c8d2e0",
            lineHeight: "var(--theme-line-height, 1.5)",
            flex: 1,
        },
        // Education in sidebar
        eduItem: {
            marginBottom: "calc(14px * var(--theme-paragraph-margin, 1))",
        },
        eduYear: {
            fontSize: "calc(10px * var(--theme-font-scale, 1))",
            color: YELLOW_RAW,
            fontWeight: "700",
            marginBottom: "2px",
        },
        eduDegree: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: WHITE,
            lineHeight: "1.3",
        },
        eduSchool: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            color: "#a0b0c8",
            fontStyle: "italic",
            marginTop: "2px",
        },
        eduGrade: {
            fontSize: "calc(10px * var(--theme-font-scale, 1))",
            color: "#7a90ac",
            marginTop: "2px",
        },
        // Language item
        langItem: {
            marginBottom: "calc(8px * var(--theme-paragraph-margin, 1))",
        },
        langName: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: "#c8d2e0",
            marginBottom: "3px",
        },
        langLevel: {
            fontSize: "calc(10px * var(--theme-font-scale, 1))",
            color: "#7a90ac",
        },

        // RIGHT MAIN AREA
        main: {
            width: "66%",
            background: WHITE,
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
        },
        mainInner: {
            padding: "var(--theme-page-margin, 40px)",
            display: "flex",
            flexDirection: "column",
            gap: "calc(24px * var(--theme-section-margin, 1))",
            flex: 1,
        },
        ZONE_STYLE: {
            display: "flex",
            flexDirection: "column",
            gap: "calc(24px * var(--theme-section-margin, 1))",
        },
        mainSectionTitle: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: NAVY,
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
        },
        mainSectionTitleBar: {
            width: "30px",
            height: "3px",
            background: YELLOW_RAW,
            display: "inline-block",
            flexShrink: 0,
        },
        // Experience item
        expItem: {
            display: "flex",
            marginBottom: "calc(18px * var(--theme-paragraph-margin, 1))",
        },
        expDateCol: {
            minWidth: "80px",
            fontSize: "calc(10.5px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: NAVY,
            paddingTop: "2px",
            flexShrink: 0,
        },
        expYellowBar: {
            width: "2px",
            background: YELLOW_RAW,
            marginRight: "14px",
            flexShrink: 0,
        },
        expContent: {
            flex: 1,
        },
        expTitle: {
            fontSize: "calc(15px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: NAVY,
            lineHeight: "1.2",
        },
        expCompany: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: YELLOW_RAW,
            fontWeight: "600",
            fontStyle: "italic",
            marginBottom: "6px",
            marginTop: "2px",
        },
        expDescription: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: BODY_TEXT,
            lineHeight: "var(--theme-line-height, 1.6)",
            marginTop: "2px",
        },
        // Summary
        summaryText: {
            fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
            color: BODY_TEXT,
            lineHeight: "var(--theme-line-height, 1.7)",
        },
        // Generic main text block
        mainRichText: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: BODY_TEXT,
            lineHeight: "var(--theme-line-height, 1.6)",
        },
        // Project
        projItem: {
            marginBottom: "calc(18px * var(--theme-paragraph-margin, 1))",
        },
        projTitle: {
            fontSize: "calc(14px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: NAVY,
        },
        projLink: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            color: YELLOW_RAW,
            marginBottom: "5px",
        },
        techBadge: {
            fontSize: "calc(10px * var(--theme-font-scale, 1))",
            padding: "2px 8px",
            background: "#f0f4f8",
            borderRadius: "3px",
            color: NAVY,
            border: `1px solid ${LIGHT_GRAY}`,
        },
        // Divider between sidebar sections
        sidebarDivider: {
            height: "1px",
            background: "rgba(255,255,255,0.08)",
            margin: "0 24px",
        },
        pageNumber: {
            position: "absolute",
            bottom: "12px",
            right: "16px",
            fontSize: "9px",
            color: "#9aa5b4",
            letterSpacing: "0.5px",
        },
    };

    // --- SECTION TITLE COMPONENTS ---
    const SidebarSectionTitle = ({ title }) => {
        const { isContinued } = useSectionContext();
        const display = isContinued ? `${title} (Cont.)` : title;
        return (
            <div style={styles.sidebarSectionTitle}>
                <span style={styles.sidebarSectionTitleBar}></span>
                {display}
            </div>
        );
    };

    const MainSectionTitle = ({ title }) => {
        const { isContinued } = useSectionContext();
        const display = isContinued ? `${title} (Cont.)` : title;
        return (
            <div style={styles.mainSectionTitle}>
                <span style={styles.mainSectionTitleBar}></span>
                {display}
            </div>
        );
    };

    // --- HEADER (inside sidebar top) ---
    const Header = () => (
        <SectionWrapper sectionId="personal" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Header">
            <div>
                {/* Photo */}
                {personal?.photo ? (
                    <div style={styles.photoBlock}>
                        <img src={personal.photo} style={styles.photo} alt="profile" />
                    </div>
                ) : (
                    <div style={styles.photoPlaceholder}>
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                )}
                {/* Name block */}
                <div style={styles.nameBlock}>
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
                </div>
            </div>
        </SectionWrapper>
    );

    // --- CUSTOM RENDERERS ---
    const customRenderers = {
        // SIDEBAR SECTIONS
        contact: ({ zoneId }) => {
            const isSidebar = zoneId?.toLowerCase()?.includes('sidebar');
            const items = data.websites || [];
            const contactLinks = [
                { label: 'LinkedIn', value: personal?.linkedin, type: 'personal', field: 'linkedin' },
                { label: 'GitHub', value: personal?.github, type: 'personal', field: 'github' },
                { label: 'Website', value: personal?.website, type: 'personal', field: 'website' },
                ...items
                    .map((link, idx) => ({ ...link, originalIdx: idx }))
                    .filter(link => link.addToHeader && link.url)
                    .map(link => ({ label: link.label || 'Website', value: link.url, type: 'websites', field: 'url', idx: link.originalIdx }))
            ];

            return (
                <SectionWrapper sectionId="contact" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Contact">
                    <div style={isSidebar ? styles.sidebarSection : { marginBottom: "calc(10px * var(--theme-section-margin, 1))" }}>
                        {isSidebar ? <SidebarSectionTitle title="Contact" /> : <MainSectionTitle title="Contact Information" />}
                        <div style={isSidebar ? {} : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>

                            {personal?.phone && (
                                <div style={isSidebar ? {} : { display: "flex", gap: "8px", alignItems: "baseline" }}>
                                    <div style={isSidebar ? styles.sidebarLabel : { fontSize: "calc(11px * var(--theme-font-scale, 1))", fontWeight: "700", color: MUTED, minWidth: "90px" }}>
                                        {isSidebar && <span>📞</span>} Phone
                                    </div>
                                    <div style={isSidebar ? styles.sidebarValue : { fontSize: "calc(12px * var(--theme-font-scale, 1))", color: BODY_TEXT }}>
                                        <ResumeLink href={personal.phone}>
                                            <SpellCheckText text={personal.phone} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'phone', val)} />
                                        </ResumeLink>
                                    </div>
                                </div>
                            )}

                            {personal?.email && (
                                <div style={isSidebar ? {} : { display: "flex", gap: "8px", alignItems: "baseline" }}>
                                    <div style={isSidebar ? styles.sidebarLabel : { fontSize: "calc(11px * var(--theme-font-scale, 1))", fontWeight: "700", color: MUTED, minWidth: "90px" }}>
                                        {isSidebar && "✉"} Email
                                    </div>
                                    <div style={isSidebar ? styles.sidebarValue : { fontSize: "calc(12px * var(--theme-font-scale, 1))", color: BODY_TEXT }}>
                                        <ResumeLink href={personal.email}>
                                            <SpellCheckText text={personal.email} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'email', val)} />
                                        </ResumeLink>
                                    </div>
                                </div>
                            )}

                            {(personal?.city || personal?.state) && (
                                <div style={isSidebar ? {} : { display: "flex", gap: "8px", alignItems: "baseline" }}>
                                    <div style={isSidebar ? styles.sidebarLabel : { fontSize: "calc(11px * var(--theme-font-scale, 1))", fontWeight: "700", color: MUTED, minWidth: "90px" }}>
                                        {isSidebar && "📍"} Location
                                    </div>
                                    <div style={isSidebar ? styles.sidebarValue : { fontSize: "calc(12px * var(--theme-font-scale, 1))", color: BODY_TEXT }}>
                                        <SpellCheckText
                                            text={[personal?.city, personal?.state, personal?.country, personal?.zipCode].filter(Boolean).join(", ")}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace('personal', 'city', val)}
                                        />
                                    </div>
                                </div>
                            )}

                            {personal?.summary2 && (
                                <>
                                    <div style={styles.sidebarLabel}>ℹ Info</div>
                                    <div style={styles.sidebarValue}>{personal.summary2}</div>
                                </>
                            )}

                            {contactLinks.map((link, i) => link.value && (
                                <div key={i} style={isSidebar ? {} : { display: "flex", gap: "8px", alignItems: "baseline" }}>
                                    <div style={isSidebar ? styles.sidebarLabel : { fontSize: "calc(11px * var(--theme-font-scale, 1))", fontWeight: "700", color: MUTED, minWidth: "90px" }}>
                                        {link.label}
                                    </div>
                                    <div style={isSidebar ? styles.sidebarValue : { fontSize: "calc(12px * var(--theme-font-scale, 1))", color: BODY_TEXT }}>
                                        <ResumeLink href={link.value}>
                                            <SpellCheckText
                                                text={link.value}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace(link.type, link.type === 'personal' ? link.field : link.idx, val, link.type === 'websites' ? 'url' : null)}
                                            />
                                        </ResumeLink>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        education: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.education?.[idx]) : data.education;
            if (!items || items.length === 0) return null;
            const isSidebar = !zoneId?.toLowerCase().includes('main');
            return (
                <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
                    {isSidebar ? (
                        <div style={styles.sidebarSection}>
                            <SidebarSectionTitle title="Education" />
                            {items.map((edu, i) => {
                                if (!edu) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const eduDate = edu.endYear || edu.startYear
                                    ? [edu.startYear, edu.isCurrent ? 'Present' : edu.endYear].filter(Boolean).join(' – ')
                                    : (edu.year || edu.date || '');
                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.eduItem}>
                                        <div style={styles.eduYear}>
                                            <RichTextSpellCheck html={eduDate} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'year')} />
                                        </div>
                                        <div style={styles.eduDegree}>
                                            <RichTextSpellCheck html={edu.degree} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'degree')} />
                                        </div>
                                        <div style={styles.eduSchool}>
                                            <RichTextSpellCheck html={[edu.institution || edu.school, edu.location].filter(Boolean).join(", ")} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'institution')} />
                                        </div>
                                        {edu.grade && <div style={styles.eduGrade}>GPA: {edu.grade}</div>}
                                        {edu.description && (
                                            <div className="resume-rich-text" style={{ ...styles.sidebarText, marginTop: "4px" }}>
                                                <SplittableRichText html={edu.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'description')} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div>
                            <MainSectionTitle title="Education" />
                            {items.map((edu, i) => {
                                if (!edu) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const dateStr = edu.endYear || edu.startYear
                                    ? [edu.startYear, edu.isCurrent ? 'Present' : edu.endYear].filter(Boolean).join(' – ')
                                    : (edu.year || edu.date || '');
                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.expItem}>
                                        <div style={styles.expDateCol}>
                                            <RichTextSpellCheck html={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'year')} />
                                        </div>
                                        <div style={styles.expYellowBar}></div>
                                        <div style={styles.expContent}>
                                            <div style={styles.expTitle}>
                                                <RichTextSpellCheck html={edu.degree} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'degree')} />
                                            </div>
                                            <div style={styles.expCompany}>
                                                <RichTextSpellCheck html={[edu.institution || edu.school, edu.location].filter(Boolean).join(", ")} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'institution')} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </SectionWrapper>
            );
        },

        skills: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.skills?.[idx]).filter(Boolean) : (data.skills || []);
            const hasDescription = data.skillsDescription && data.skillsDescription.trim();
            const isSidebar = !zoneId?.toLowerCase().includes('main');

            if (items.length === 0 && !hasDescription) return null;

            return (
                <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                    <div style={isSidebar ? styles.sidebarSection : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Key Skills" /> : <MainSectionTitle title="Skills" />}
                        {items.length > 0 ? (
                            <div>
                                {items.map((skill, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    const name = typeof skill === 'object' ? skill.name : skill;
                                    const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                    return (
                                        <div key={originalIdx} data-item-index={originalIdx} style={isSidebar ? styles.sidebarBullet : { marginBottom: "calc(8px * var(--theme-paragraph-margin, 1))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            {isSidebar && <div style={styles.bulletDot}></div>}
                                            <div style={isSidebar ? styles.bulletText : { fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: BODY_TEXT }}>
                                                <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('skills', originalIdx, val, 'name')} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : hasDescription ? (
                            <div className="resume-rich-text" style={isSidebar ? styles.sidebarText : styles.summaryText}>
                                <SplittableRichText
                                    html={data.skillsDescription}
                                    isActive={isSpellCheckActive}
                                    onIgnore={onSpellCheckIgnore}
                                    onReplace={(val) => onSpellCheckReplace && onSpellCheckReplace('skills', 'skillsDescription', val)}
                                />
                            </div>
                        ) : null}
                    </div>
                </SectionWrapper>
            );
        },

        strengths: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.strengths?.[idx]).filter(Boolean) : (data.strengths || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase()?.includes('sidebar');
            return (
                <SectionWrapper sectionId="strengths" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Strengths">
                    <div style={isSidebar ? styles.sidebarSection : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Key Strengths" /> : <MainSectionTitle title="Key Strengths" />}
                        {items.map((skill, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const name = typeof skill === 'object' ? skill.name : skill;
                            const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                            return (
                                <div key={originalIdx} data-item-index={originalIdx} style={isSidebar ? styles.sidebarBullet : { marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    {isSidebar && <div style={styles.bulletDot}></div>}
                                    <div style={isSidebar ? styles.bulletText : { fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: BODY_TEXT }}>
                                        <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('strengths', originalIdx, val, 'name')} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        additionalSkills: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.additionalSkills?.[idx]).filter(Boolean) : (data.additionalSkills || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase()?.includes('sidebar');
            return (
                <SectionWrapper sectionId="additionalSkills" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Skills">
                    <div style={isSidebar ? styles.sidebarSection : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Additional Skills" /> : <MainSectionTitle title="Additional Skills" />}
                        {items.map((skill, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const name = typeof skill === 'object' ? skill.name : skill;
                            const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                            return (
                                <div key={originalIdx} data-item-index={originalIdx} style={isSidebar ? styles.sidebarBullet : { marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    {isSidebar && <div style={styles.bulletDot}></div>}
                                    <div style={isSidebar ? styles.bulletText : { fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: BODY_TEXT }}>
                                        <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalSkills', originalIdx, val, 'name')} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        certifications: ({ itemIndices, isContinued, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.certifications?.[idx]) : data.certifications;
            if (!items || items.length === 0) return null;
            const isSidebar = !zoneId?.toLowerCase().includes('main');
            return (
                <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
                    <div style={isSidebar ? styles.sidebarSection : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Certification" /> : <MainSectionTitle title="Certifications" />}
                        {isSidebar ? (
                            items.map((cert, i) => {
                                if (!cert) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.sidebarBullet}>
                                        <div style={styles.bulletDot}></div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ ...styles.eduDegree, fontSize: "calc(11.5px * var(--theme-font-scale, 1))" }}>
                                                <RichTextSpellCheck html={cert.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('certifications', originalIdx, val, 'name')} />
                                            </div>
                                            {cert.issuer && (
                                                <div style={styles.eduSchool}>
                                                    <RichTextSpellCheck html={cert.issuer} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('certifications', originalIdx, val, 'issuer')} />
                                                </div>
                                            )}
                                            {cert.date && <div style={styles.eduGrade}>{cert.date}</div>}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                                {items.map((cert, i) => {
                                    if (!cert) return null;
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <CertificationItem
                                            key={i}
                                            item={cert}
                                            index={originalIdx}
                                            isSpellCheckActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onSpellCheckReplace={(field, val) => onSpellCheckReplace('certifications', originalIdx, val, field)}
                                            subItemRange={renderSubItemRanges?.[originalIdx]}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </SectionWrapper>
            );
        },

        languages: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.languages?.[idx]) : data.languages;
            if (!items || items.length === 0) return null;
            const isSidebar = !zoneId?.toLowerCase().includes('main');
            return (
                <SectionWrapper sectionId="languages" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Languages">
                    <div style={isSidebar ? styles.sidebarSection : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Language" /> : <MainSectionTitle title="Languages" />}
                        {isSidebar ? (
                            items.map((lang, i) => {
                                if (!lang) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const name = typeof lang === 'object' ? lang.name : lang;
                                const level = typeof lang === 'object' ? lang.level : null;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.sidebarBullet}>
                                        <div style={styles.bulletDot}></div>
                                        <div>
                                            <div style={styles.bulletText}>
                                                <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('languages', originalIdx, val, 'name')} />
                                            </div>
                                            {level && <div style={styles.langLevel}>{level}</div>}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </SectionWrapper>
            );
        },

        interests: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.interests?.[idx]) : data.interests;
            if (!items || items.length === 0) return null;
            const isSidebar = !zoneId?.toLowerCase().includes('main');
            return (
                <SectionWrapper sectionId="interests" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Interests">
                    <div style={isSidebar ? styles.sidebarSection : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Interests" /> : <MainSectionTitle title="Interests" />}
                        <div>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const name = typeof item === 'object' ? item.name : item;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={isSidebar ? styles.sidebarBullet : { marginBottom: "6px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                                        <div style={styles.bulletDot}></div>
                                        <div style={isSidebar ? styles.bulletText : { fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: BODY_TEXT }}>
                                            <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('interests', originalIdx, val, 'name')} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        awards: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.awards?.[idx]) : data.awards;
            if (!items || items.length === 0) return null;
            const isSidebar = !zoneId?.toLowerCase().includes('main');
            return (
                <SectionWrapper sectionId="awards" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Awards">
                    <div style={isSidebar ? styles.sidebarSection : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Awards" /> : <MainSectionTitle title="Awards" />}
                        {items.map((award, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIdx} style={isSidebar ? { ...styles.eduItem } : { marginBottom: "calc(12px * var(--theme-paragraph-margin, 1))", fontSize: "calc(13px * var(--theme-font-scale, 1))" }}>
                                    <div style={isSidebar ? { ...styles.eduDegree, fontSize: "calc(11.5px * var(--theme-font-scale, 1))" } : { fontWeight: "700", color: NAVY }}>
                                        <RichTextSpellCheck html={award.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', originalIdx, val, 'title')} />
                                    </div>
                                    {award.issuer && (
                                        <div style={isSidebar ? styles.eduSchool : { color: YELLOW_RAW, fontStyle: "italic" }}>
                                            <RichTextSpellCheck html={award.issuer} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', originalIdx, val, 'issuer')} />
                                            {award.year && <span> • {award.year}</span>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        websites: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.websites?.[idx]) : data.websites;
            const portfolioLinks = (items || [])
                .map((link, idx) => ({ ...link, originalIdx: itemIndices ? itemIndices[idx] : idx }))
                .filter(link => !link.addToHeader && link.url);
            if (portfolioLinks.length === 0) return null;
            const isSidebar = !zoneId?.toLowerCase().includes('main');
            return (
                <SectionWrapper sectionId="websites" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Websites & Portfolios">
                    <div style={isSidebar ? styles.sidebarSection : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Websites" /> : <MainSectionTitle title="Websites & Portfolios" />}
                        {portfolioLinks.map((site, i) => (
                            <React.Fragment key={i}>
                                <div style={isSidebar ? styles.sidebarLabel : { fontWeight: "700", fontSize: "calc(11px * var(--theme-font-scale, 1))", color: NAVY, marginBottom: "2px" }}>{site.label || 'Portfolio'}</div>
                                <div style={isSidebar ? styles.sidebarValue : { fontSize: "calc(12px * var(--theme-font-scale, 1))", color: YELLOW_RAW, marginBottom: "8px" }}>
                                    <ResumeLink href={site.url}>
                                        <SpellCheckText text={site.url} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('websites', site.originalIdx, val, 'url')} />
                                    </ResumeLink>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </SectionWrapper>
            );
        },

        // MAIN SECTIONS
        summary: ({ isContinued, subItemRanges, zoneId }) => {
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="summary" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Summary">
                    <div style={isSidebar ? styles.sidebarSection : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Summary" /> : <MainSectionTitle title="Profile Summary" />}
                        <div className="resume-rich-text" style={isSidebar ? styles.sidebarText : styles.summaryText}>
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

        experience: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.experience?.[idx]) : data.experience;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="experience" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Experience">
                    <div style={isSidebar ? styles.sidebarSection : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Experience" /> : <MainSectionTitle title="Work Experience" />}
                        {items.map((exp, i) => {
                            if (!exp) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr = exp.year || exp.date || (exp.startYear ? `${exp.startYear} - ${exp.isCurrent ? "Current" : (exp.endYear || "Current")}` : "");

                            if (isSidebar) {
                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.eduItem}>
                                        <div style={styles.eduYear}>{dateStr}</div>
                                        <div style={styles.eduDegree}>{exp.title || exp.role}</div>
                                        <div style={styles.eduSchool}>{exp.company}</div>
                                        <div className="resume-rich-text" style={{ ...styles.sidebarText, marginTop: "4px" }}>
                                            <SplittableRichText
                                                html={exp.description}
                                                range={subItemRanges?.[originalIdx]}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'description')}
                                            />
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.expItem}>
                                    <div style={styles.expDateCol}>
                                        <RichTextSpellCheck html={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'date')} />
                                    </div>
                                    <div style={styles.expYellowBar}></div>
                                    <div style={styles.expContent}>
                                        <div style={styles.expTitle}>
                                            <RichTextSpellCheck html={exp.title || exp.role || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'title')} />
                                        </div>
                                        <div style={styles.expCompany}>
                                            <RichTextSpellCheck html={`${exp.company || ""}${exp.location ? `, ${exp.location}` : ""}${exp.isRemote ? " • Remote" : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'company')} />
                                        </div>
                                        <div className="resume-rich-text" style={styles.expDescription}>
                                            <SplittableRichText
                                                html={exp.description}
                                                range={subItemRanges?.[originalIdx]}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'description')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        projects: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.projects?.[idx]) : data.projects;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
                    <div style={isSidebar ? styles.sidebarSection : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Projects" /> : <MainSectionTitle title="Projects" />}
                        {items.map((proj, i) => {
                            if (!proj) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr = proj.year || (proj.startYear && `${proj.startYear} - ${proj.isCurrent ? 'Present' : (proj.endYear || 'Present')}`);

                            if (isSidebar) {
                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.eduItem}>
                                        <div style={styles.eduYear}>{dateStr}</div>
                                        <div style={styles.eduDegree}>{proj.title}</div>
                                        <div className="resume-rich-text" style={{ ...styles.sidebarText, marginTop: "4px" }}>
                                            <SplittableRichText
                                                html={proj.description}
                                                range={subItemRanges?.[originalIdx]}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'description')}
                                            />
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.projItem}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                                        <div style={styles.projTitle}>
                                            <RichTextSpellCheck html={proj.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'title')} />
                                        </div>
                                        {dateStr && (
                                            <div style={{ fontSize: "calc(10.5px * var(--theme-font-scale, 1))", color: MUTED, fontWeight: "500" }}>
                                                <SpellCheckText text={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, proj.year ? 'year' : 'date')} />
                                            </div>
                                        )}
                                    </div>
                                    {proj.link && (
                                        <div style={styles.projLink}>
                                            <ResumeLink href={proj.link}>
                                                <RichTextSpellCheck html={proj.link} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'link')} />
                                            </ResumeLink>
                                        </div>
                                    )}
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "6px" }}>
                                            {proj.technologies.map((tech, tIdx) => (
                                                <div key={tIdx} style={styles.techBadge}>
                                                    <RichTextSpellCheck html={tech} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => {
                                                        const updated = [...proj.technologies];
                                                        updated[tIdx] = val;
                                                        onSpellCheckReplace('projects', originalIdx, updated, 'technologies');
                                                    }} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="resume-rich-text" style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", lineHeight: "var(--theme-line-height, 1.6)", color: BODY_TEXT }}>
                                        <SplittableRichText
                                            html={proj.description}
                                            range={subItemRanges?.[originalIdx]}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'description')}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        additionalInfo: ({ isContinued, subItemRanges: renderSubItemRanges, zoneId }) => {
            const html = data.additionalInfo || "";
            if (!html || html.trim() === "" || html === "<p><br></p>") return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="additionalInfo" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Information">
                    <div style={isSidebar ? styles.sidebarSection : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Information" /> : <MainSectionTitle title="Additional Information" />}
                        <div className="resume-rich-text" style={isSidebar ? styles.sidebarText : styles.mainRichText}>
                            <SplittableRichText
                                html={html}
                                range={renderSubItemRanges?.additionalInfo}
                                isActive={isSpellCheckActive}
                                onIgnore={onSpellCheckIgnore}
                                onReplace={(val) => onSpellCheckReplace('additionalInfo', 'additionalInfo', val)}
                            />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        custom: ({ isContinued, subItemRanges: renderSubItemRanges, zoneId }) => {
            if (!data.customSection?.isVisible || !data.customSection?.content) return null;
            const content = data.customSection.content;
            if (!content || content.trim() === "" || content === "<p><br></p>") return null;
            const title = data.customSection.title || data.customSectionTitle || "Additional Information";
            const isSidebar = zoneId?.toLowerCase()?.includes('sidebar');
            return (
                <SectionWrapper sectionId="custom" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <div style={isSidebar ? styles.sidebarSection : {}}>
                        {isSidebar ? <SidebarSectionTitle title={title} /> : <MainSectionTitle title={title} />}
                        <div className="resume-rich-text" style={isSidebar ? styles.sidebarText : styles.mainRichText}>
                            <SplittableRichText
                                html={content}
                                range={renderSubItemRanges?.custom}
                                isActive={isSpellCheckActive}
                                onIgnore={onSpellCheckIgnore}
                                onReplace={(val) => onSpellCheckReplace('customSection', 'content', val)}
                            />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },


        software: ({ itemIndices, isContinued, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.software?.[idx]) : data.software;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase()?.includes('sidebar');
            return (
                <SectionWrapper sectionId="software" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Software">
                    <div style={isSidebar ? styles.sidebarSection : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Software" /> : <MainSectionTitle title="Software" />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                if (isSidebar) {
                                    return (
                                        <div key={i} data-item-index={originalIdx} style={styles.sidebarBullet}>
                                            <div style={styles.bulletDot}></div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ ...styles.eduDegree, fontSize: "calc(11.5px * var(--theme-font-scale, 1))" }}>
                                                    <RichTextSpellCheck html={typeof item === 'object' ? item.name : item} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('software', originalIdx, val, 'name')} />
                                                </div>
                                                {item.description && (
                                                    <div className="resume-rich-text" style={{ ...styles.sidebarText, marginTop: "2px" }}>
                                                        <SplittableRichText
                                                            html={item.description}
                                                            range={renderSubItemRanges?.[originalIdx]}
                                                            isActive={isSpellCheckActive}
                                                            onIgnore={onSpellCheckIgnore}
                                                            onReplace={(val) => onSpellCheckReplace('software', originalIdx, val, 'description')}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <SoftwareItem
                                        key={i}
                                        item={item}
                                        index={originalIdx}
                                        isSpellCheckActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onSpellCheckReplace={(field, val) => onSpellCheckReplace('software', originalIdx, val, field)}
                                        subItemRange={renderSubItemRanges?.[originalIdx]}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        keyAchievements: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.keyAchievements?.[idx]).filter(Boolean) : (data.keyAchievements || []);
            if (items.length === 0) return null;
            const isSidebar = !zoneId?.toLowerCase().includes('main');
            return (
                <SectionWrapper sectionId="keyAchievements" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Achievements">
                    <div style={isSidebar ? styles.sidebarSection : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Key Achievements" /> : <MainSectionTitle title="Key Achievements" />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={isSidebar ? styles.sidebarBullet : { marginBottom: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                                        {isSidebar && <div style={styles.bulletDot}></div>}
                                        <div style={isSidebar ? { flex: 1 } : {}}>
                                            {item.name && <div style={isSidebar ? { ...styles.bulletText, fontWeight: "700" } : { fontWeight: "700", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: NAVY, marginBottom: "3px" }}>
                                                <RichTextSpellCheck html={item.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIdx, val, 'name')} />
                                            </div>}
                                            {item.description && <div className="resume-rich-text" style={isSidebar ? styles.sidebarText : styles.mainRichText}>
                                                <RichTextSpellCheck html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIdx, val, 'description')} />
                                            </div>}
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
            const items = itemIndices ? itemIndices.map(idx => data.accomplishments?.[idx]).filter(Boolean) : (data.accomplishments || []);
            if (items.length === 0) return null;
            const isSidebar = !zoneId?.toLowerCase().includes('main');
            return (
                <SectionWrapper sectionId="accomplishments" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Accomplishments">
                    <div style={isSidebar ? styles.sidebarSection : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Accomplishments" /> : <MainSectionTitle title="Accomplishments" />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={isSidebar ? styles.sidebarBullet : { marginBottom: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                                        {isSidebar && <div style={styles.bulletDot}></div>}
                                        <div style={isSidebar ? { flex: 1 } : {}}>
                                            {item.name && <div style={isSidebar ? { ...styles.bulletText, fontWeight: "700" } : { fontWeight: "700", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: NAVY, marginBottom: "3px" }}>
                                                <RichTextSpellCheck html={item.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('accomplishments', originalIdx, val, 'name')} />
                                            </div>}
                                            {item.description && <div className="resume-rich-text" style={isSidebar ? styles.sidebarText : styles.mainRichText}>
                                                <RichTextSpellCheck html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('accomplishments', originalIdx, val, 'description')} />
                                            </div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        affiliations: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.affiliations?.[idx]).filter(Boolean) : (data.affiliations || []);
            if (items.length === 0) return null;
            const isSidebar = !zoneId?.toLowerCase()?.includes('main');
            return (
                <SectionWrapper sectionId="affiliations" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Affiliations">
                    <div style={isSidebar ? styles.sidebarSection : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Affiliations" /> : <MainSectionTitle title="Affiliations" />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={isSidebar ? styles.sidebarBullet : { marginBottom: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                                        {isSidebar && <div style={styles.bulletDot}></div>}
                                        <div style={isSidebar ? { flex: 1 } : {}}>
                                            {item.name && <div style={isSidebar ? { ...styles.bulletText, fontWeight: "700" } : { fontWeight: "700", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: NAVY, marginBottom: "3px" }}>
                                                <RichTextSpellCheck html={item.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, 'name')} />
                                            </div>}
                                            {item.description && <div className="resume-rich-text" style={isSidebar ? styles.sidebarText : styles.mainRichText}>
                                                <RichTextSpellCheck html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, 'description')} />
                                            </div>}
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
            const p = data.personal || {};
            const fields = [
                { label: 'Date of Birth', value: p.dob || p.dateOfBirth || p.birthDate },
                { label: 'Nationality', value: p.nationality },
                { label: 'Gender', value: p.gender },
                { label: 'Marital Status', value: p.maritalStatus || p.marital_status },
                { label: 'Visa Status', value: p.visaStatus || p.visa_status },
                { label: 'Religion', value: p.religion },
                { label: 'Passport', value: p.passport || p.passportNumber },
                { label: 'Place of Birth', value: p.placeOfBirth },
                { label: 'Driving License', value: p.drivingLicense },
                { label: 'Other', value: p.otherPersonal || p.otherInformation },
            ].filter(f => f.value);
            if (fields.length === 0) return null;
            const isSidebar = !zoneId?.toLowerCase().includes('main');
            return (
                <SectionWrapper sectionId="personalDetails" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Personal Details">
                    <div style={isSidebar ? styles.sidebarSection : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Personal Details" /> : <MainSectionTitle title="Personal Details" />}
                        {fields.map((f, i) => (
                            <div key={i} style={isSidebar ? {} : { display: "flex", gap: "8px", marginBottom: "calc(6px * var(--theme-paragraph-margin, 1))" }}>
                                <div style={isSidebar ? styles.sidebarLabel : { fontSize: "calc(11px * var(--theme-font-scale, 1))", fontWeight: "700", color: MUTED, minWidth: "110px" }}>{f.label}</div>
                                <div style={isSidebar ? styles.sidebarValue : { fontSize: "calc(12px * var(--theme-font-scale, 1))", color: BODY_TEXT }}>{f.value}</div>
                            </div>
                        ))}
                    </div>
                </SectionWrapper>
            );
        },
    };

    // --- RENDER ZONE ---
    const renderZone = (id, items, columnStyle, extraContent) => (
        <DroppableZone id={id} style={{ ...columnStyle }}>
            {extraContent}
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

    // --- MEASURER ---
    const Measurer = () => (
        <div className="resume-measurer" style={{ position: "absolute", top: -10000, left: -10000, width: "210mm", visibility: "hidden" }}>
            <div className="page-height-marker" style={{ height: "297mm", width: "1px", position: "absolute", left: 0, top: 0 }}></div>
            <div style={{ ...styles.page, height: "auto" }}>
                <div style={{ ...styles.sidebar }}>
                    <div style={styles.sidebarInner} data-column-id="sidebar">
                        <Header />
                        {activeSidebarSections.map(sid => (
                            <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="sidebar" />
                        ))}
                    </div>
                </div>
                <div style={styles.main}>
                    <div style={{ ...styles.mainInner, ...styles.ZONE_STYLE }} data-column-id="main">
                        {activeMainSections.map(sid => (
                            <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="main" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="amber-elite-root">
            <Measurer />
            <DndContext {...dndContextProps}>
                <SortableContext items={[...activeSidebarSections, ...activeMainSections]} strategy={verticalListSortingStrategy}>
                    {showPageBreaks && pages ? (
                        pages.map((page, i) => (
                            <div key={i} className="resume-page" style={styles.page}>
                                {/* SIDEBAR */}
                                <div style={styles.sidebar}>
                                    <div style={styles.sidebarInner} data-column-id="sidebar">
                                        {i === 0 && <Header />}
                                        {renderZone(
                                            `sidebar-p${i}`,
                                            page.sidebar,
                                            { display: "flex", flexDirection: "column", flex: 1 },
                                            null
                                        )}
                                    </div>
                                </div>
                                {/* MAIN */}
                                <div style={styles.main}>
                                    <div style={styles.mainInner} data-column-id="main">
                                        {renderZone(
                                            `main-p${i}`,
                                            page.main,
                                            { ...styles.ZONE_STYLE, flex: 1 },
                                            null
                                        )}
                                    </div>
                                </div>
                                <div style={styles.pageNumber}>Page {i + 1}</div>
                            </div>
                        ))
                    ) : (
                        <div className="resume-page" style={{ ...styles.page, height: "auto", minHeight: "297mm" }}>
                            {/* SIDEBAR */}
                            <div style={{ ...styles.sidebar, minHeight: "100%" }}>
                                <div style={styles.sidebarInner} data-column-id="sidebar">
                                    <Header />
                                    {renderZone(
                                        'sidebar',
                                        activeSidebarSections,
                                        { display: "flex", flexDirection: "column", flex: 1 },
                                        null
                                    )}
                                </div>
                            </div>
                            {/* MAIN */}
                            <div style={styles.main}>
                                <div style={styles.mainInner} data-column-id="main">
                                    {renderZone(
                                        'main',
                                        activeMainSections,
                                        { ...styles.ZONE_STYLE, flex: 1 },
                                        null
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </SortableContext>
                <StableResumeDragOverlay activeId={activeId} scale={scale} renderSection={(id) => (
                    <div style={{ background: "white", padding: "10px", border: "1px solid #ddd", width: "300px" }}>
                        <SectionRenderer sectionId={id} data={data} customRenderers={customRenderers} />
                    </div>
                )} />
            </DndContext>
        </div>
    );
};

export default AmberElite;