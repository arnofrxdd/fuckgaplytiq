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
    AchievementItem,
    AccomplishmentItem,
    AffiliationItem,
    ResumeLink
} from "../common/BaseComponents";
import { getCompleteLayout, getSavedLayout } from "../common/TemplateUtils";

/**
 * SlateBlue Template
 * Sidebar-dominant layout: colored left sidebar with photo, name, contact, skills.
 * Right main column: summary (no heading), then work history and education with date | content rows.
 * Matches the provided screenshot design.
 */
const OnyxModern = ({
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
    const templateId = 'onyx-modern';
    const initialLayout = getSavedLayout(data, templateId, {
        sidebar: ['contact', 'skills', 'strengths', 'additionalSkills', 'languages', 'certifications', 'interests', 'websites', 'personalDetails'],
        main: ['summary', 'experience', 'education', 'projects', 'awards', 'volunteer', 'publications', 'software', 'keyAchievements', 'accomplishments', 'affiliations', 'additionalInfo', 'custom']
    });

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

    // --- STYLES ---
    const SIDEBAR_COLOR = "var(--theme-color, #5b9ec9)";
    const SIDEBAR_BG = "var(--theme-color, #5b9ec9)";

    const ZONE_STYLE = {
        display: "flex",
        flexDirection: "column",
        gap: "calc(20px * var(--theme-section-margin, 1))",
        flex: 1
    };

    const styles = {
        ZONE_STYLE: {
            gap: "calc(20px * var(--theme-section-margin, 1))"
        },
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
            width: "32%",
            background: SIDEBAR_BG,
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
            color: "white",
            "--theme-text-primary": "#ffffff",
            "--theme-text-muted": "rgba(255,255,255,0.85)",
            "--theme-text-dim": "rgba(255,255,255,0.65)",
            "--theme-border-color": "rgba(255,255,255,0.15)",
        },
        photoWrapper: {
            width: "100%",
            aspectRatio: "1/1",
            overflow: "hidden",
            flexShrink: 0,
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
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.5)",
            fontSize: "40px",
        },
        nameBlock: {
            paddingTop: "var(--theme-page-margin, 40px)",
            paddingLeft: "var(--theme-page-margin, 40px)", // Align with page margin
            paddingRight: "22px",
            paddingBottom: "18px",
            borderBottom: "1px solid rgba(255,255,255,0.2)",
            boxSizing: "border-box",
        },
        nameText: {
            fontSize: "calc(28px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "white",
            lineHeight: "1.15",
            margin: 0,
        },
        professionText: {
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            fontWeight: "400",
            color: "rgba(255,255,255,0.8)",
            marginTop: "4px",
        },
        sidebarSectionsWrapper: {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "calc(16px * var(--theme-section-margin, 1))",
            paddingBottom: "var(--theme-page-margin, 40px)",
            boxSizing: "border-box",
        },
        sidebarSectionHeader: {
            background: "rgba(255,255,255,0.22)",
            padding: "7px var(--theme-page-margin, 40px)", // Consistent header indent
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "white",
            marginTop: "0",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            marginBottom: "10px",
            boxSizing: "border-box",
            WebkitPrintColorAdjust: "exact",
        },
        sidebarSectionContent: {
            padding: "0 var(--theme-page-margin, 40px)", // Content should follow page margin
            boxSizing: "border-box",
        },
        contactLabel: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "white",
            marginBottom: "2px",
            display: "block",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
        },
        contactValue: {
            fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
            color: "rgba(255,255,255,0.9)",
            marginBottom: "10px",
            display: "block",
            wordBreak: "break-all",
            overflowWrap: "break-word",
        },
        skillBullet: {
            fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
            color: "rgba(255,255,255,0.92)",
            marginBottom: "6px",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
        },
        bulletDot: {
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "white",
            flexShrink: 0,
            marginTop: "5px",
        },
        // RIGHT MAIN COLUMN
        mainColumn: {
            width: "68%",
            paddingTop: "var(--theme-page-margin, 40px)",
            paddingLeft: "30px", // Internal gap
            paddingRight: "var(--theme-page-margin, 40px)",
            paddingBottom: "var(--theme-page-margin, 40px)",
            display: "flex",
            flexDirection: "column",
            gap: "0px",
            background: "white",
            boxSizing: "border-box",
        },
        summaryText: {
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.7)",
            color: "var(--theme-text-muted, #374151)",
        },
        mainSectionTitle: {
            fontSize: "calc(17px * var(--theme-font-scale, 1))",
            fontWeight: "600",
            color: SIDEBAR_COLOR,
            borderBottom: "1.5px solid #e5e7eb",
            paddingBottom: "6px",
            marginBottom: "16px",
            fontFamily: "var(--theme-font, 'Georgia', serif)",
        },
        itemRow: {
            display: "flex",
            gap: "0px",
            marginBottom: "calc(20px * var(--theme-paragraph-margin, 1))",
        },
        dateCol: {
            width: "105px",
            flexShrink: 0,
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: "var(--theme-text-dim, #6b7280)",
            paddingTop: "3px",
            lineHeight: "1.4",
        },
        contentCol: {
            flex: 1,
        },
        jobTitle: {
            fontWeight: "700",
            fontSize: "calc(14.5px * var(--theme-font-scale, 1))",
            color: "var(--theme-text-primary, #111827)",
            marginBottom: "2px",
        },
        jobCompany: {
            fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
            color: "var(--theme-text-muted, #6b7280)",
            fontStyle: "italic",
            marginBottom: "8px",
        },
        descriptionText: {
            fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.65)",
            color: "var(--theme-text-muted, #374151)",
        },
        sidebarZone: {
            display: "flex",
            flexDirection: "column",
            gap: "calc(20px * var(--theme-section-margin, 1))",
            flex: 1
        },
        mainZone: {
            display: "flex",
            flexDirection: "column",
            gap: "calc(20px * var(--theme-section-margin, 1))",
            flex: 1
        }
    };

    const MAIN_ZONE_STYLE = ZONE_STYLE;
    const SIDEBAR_ZONE_STYLE = ZONE_STYLE;

    // --- SECTION TITLE (sidebar) ---
    const SidebarSectionTitle = ({ title }) => {
        const { isContinued } = useSectionContext();
        return (
            <div style={styles.sidebarSectionHeader}>
                {isContinued ? `${title} (Cont.)` : title}
            </div>
        );
    };

    // --- SECTION TITLE (main) ---
    const MainSectionTitle = ({ title }) => {
        const { isContinued } = useSectionContext();
        return (
            <div style={styles.mainSectionTitle}>
                {isContinued ? `${title} (Cont.)` : title}
            </div>
        );
    };

    // --- CUSTOM RENDERERS ---
    const customRenderers = {

        // SIDEBAR: Contact
        contact: ({ zoneId }) => {
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            const contactLinks = [
                { label: 'LinkedIn', value: personal?.linkedin, field: 'linkedin' },
                { label: 'GitHub', value: personal?.github, field: 'github' },
                { label: 'Website', value: personal?.website, field: 'website' },
                ...(data.websites || []).filter(s => s.addToHeader && s.url).map(s => ({ label: s.label || 'Website', value: s.url, field: 'url' }))
            ].filter(l => l.value);

            return (
                <SectionWrapper sectionId="contact" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Contact">
                    <div style={isSidebar ? {} : { marginBottom: "calc(20px * var(--theme-section-margin, 1))" }}>
                        {isSidebar ? <SidebarSectionTitle title="Contact" /> : <MainSectionTitle title="Contact Information" />}
                        <div style={isSidebar ? styles.sidebarSectionContent : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                            {(personal?.city || personal?.country) && (
                                <div style={isSidebar ? {} : { marginBottom: "8px" }}>
                                    <span style={isSidebar ? styles.contactLabel : { fontWeight: "700", fontSize: "calc(12px * var(--theme-font-scale, 1))", color: SIDEBAR_COLOR, textTransform: "uppercase", display: "block", marginBottom: "2px" }}>Address</span>
                                    <span style={isSidebar ? styles.contactValue : { fontSize: "calc(13.5px * var(--theme-font-scale, 1))", color: "#374151" }}>
                                        <SpellCheckText
                                            text={[personal?.city, personal?.state, personal?.zipCode, personal?.country].filter(Boolean).join(", ")}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace('personal', 'city', val)}
                                        />
                                    </span>
                                </div>
                            )}
                            {personal?.phone && (
                                <div style={isSidebar ? {} : { marginBottom: "8px" }}>
                                    <span style={isSidebar ? styles.contactLabel : { fontWeight: "700", fontSize: "calc(12px * var(--theme-font-scale, 1))", color: SIDEBAR_COLOR, textTransform: "uppercase", display: "block", marginBottom: "2px" }}>Phone</span>
                                    <span style={isSidebar ? styles.contactValue : { fontSize: "calc(13.5px * var(--theme-font-scale, 1))", color: "#374151" }}>
                                        <ResumeLink href={personal.phone}>
                                            <SpellCheckText text={personal.phone} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'phone', val)} />
                                        </ResumeLink>
                                    </span>
                                </div>
                            )}
                            {personal?.email && (
                                <div style={isSidebar ? {} : { marginBottom: "8px" }}>
                                    <span style={isSidebar ? styles.contactLabel : { fontWeight: "700", fontSize: "calc(12px * var(--theme-font-scale, 1))", color: SIDEBAR_COLOR, textTransform: "uppercase", display: "block", marginBottom: "2px" }}>E-mail</span>
                                    <span style={isSidebar ? styles.contactValue : { fontSize: "calc(13.5px * var(--theme-font-scale, 1))", color: "#374151" }}>
                                        <ResumeLink href={personal.email}>
                                            <SpellCheckText text={personal.email} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'email', val)} />
                                        </ResumeLink>
                                    </span>
                                </div>
                            )}
                            {contactLinks.map((link, i) => (
                                <div key={i} style={isSidebar ? {} : { marginBottom: "8px" }}>
                                    <span style={isSidebar ? styles.contactLabel : { fontWeight: "700", fontSize: "calc(12px * var(--theme-font-scale, 1))", color: SIDEBAR_COLOR, textTransform: "uppercase", display: "block", marginBottom: "2px" }}>{link.label}</span>
                                    <span style={isSidebar ? styles.contactValue : { fontSize: "calc(13.5px * var(--theme-font-scale, 1))", color: "#374151" }}>
                                        <ResumeLink href={link.value}>
                                            <SpellCheckText text={link.value} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', link.field, val)} />
                                        </ResumeLink>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // SIDEBAR/MAIN: Skills
        skills: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.skills?.[idx]).filter(Boolean) : (data.skills || []);
            const hasDescription = data.skillsDescription && data.skillsDescription.trim();
            if (items.length === 0 && !hasDescription) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');

            return (
                <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                    <div style={isSidebar ? {} : { marginBottom: "calc(20px * var(--theme-section-margin, 1))" }}>
                        {isSidebar ? <SidebarSectionTitle title="Skills" /> : <MainSectionTitle title="Skills" />}
                        <div style={isSidebar ? styles.sidebarSectionContent : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 30px" }}>
                            {items.length > 0 ? items.map((skill, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const name = typeof skill === 'object' ? skill.name : skill;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={isSidebar ? styles.skillBullet : { display: "flex", alignItems: "center", gap: "8px", fontSize: "calc(13.5px * var(--theme-font-scale, 1))", color: "#374151" }}>
                                        <span style={isSidebar ? styles.bulletDot : { width: "4px", height: "4px", borderRadius: "50%", background: SIDEBAR_COLOR, flexShrink: 0 }} />
                                        <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('skills', originalIdx, val, 'name')} />
                                    </div>
                                );
                            }) : (
                                <div className="resume-rich-text" style={isSidebar ? { fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: "rgba(255,255,255,0.9)" } : styles.descriptionText}>
                                    <SplittableRichText html={data.skillsDescription} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('skills', 'skillsDescription', val)} />
                                </div>
                            )}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // SIDEBAR/MAIN: Key Strengths
        strengths: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.strengths?.[idx]).filter(Boolean) : (data.strengths || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="strengths" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Strengths">
                    <div style={isSidebar ? {} : { marginBottom: "calc(20px * var(--theme-section-margin, 1))" }}>
                        {isSidebar ? <SidebarSectionTitle title="Key Strengths" /> : <MainSectionTitle title="Key Strengths" />}
                        <div style={isSidebar ? styles.sidebarSectionContent : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 30px" }}>
                            {items.map((skill, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const name = typeof skill === 'object' ? skill.name : skill;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={isSidebar ? styles.skillBullet : { display: "flex", alignItems: "center", gap: "8px", fontSize: "calc(13.5px * var(--theme-font-scale, 1))", color: "#374151" }}>
                                        <span style={isSidebar ? styles.bulletDot : { width: "4px", height: "4px", borderRadius: "50%", background: SIDEBAR_COLOR, flexShrink: 0 }} />
                                        <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('strengths', originalIdx, val, 'name')} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // SIDEBAR/MAIN: Additional Skills
        additionalSkills: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.additionalSkills?.[idx]).filter(Boolean) : (data.additionalSkills || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="additionalSkills" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Skills">
                    <div style={isSidebar ? {} : { marginBottom: "calc(20px * var(--theme-section-margin, 1))" }}>
                        {isSidebar ? <SidebarSectionTitle title="Additional Skills" /> : <MainSectionTitle title="Additional Skills" />}
                        <div style={isSidebar ? styles.sidebarSectionContent : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 30px" }}>
                            {items.map((skill, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const name = typeof skill === 'object' ? skill.name : skill;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={isSidebar ? styles.skillBullet : { display: "flex", alignItems: "center", gap: "8px", fontSize: "calc(13.5px * var(--theme-font-scale, 1))", color: "#374151" }}>
                                        <span style={isSidebar ? styles.bulletDot : { width: "4px", height: "4px", borderRadius: "50%", background: SIDEBAR_COLOR, flexShrink: 0 }} />
                                        <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalSkills', originalIdx, val, 'name')} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // SIDEBAR/MAIN: Languages
        languages: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.languages?.[idx]) : data.languages;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="languages" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Languages">
                    <div style={isSidebar ? {} : { marginBottom: "calc(20px * var(--theme-section-margin, 1))" }}>
                        {isSidebar ? <SidebarSectionTitle title="Languages" /> : <MainSectionTitle title="Languages" />}
                        <div style={isSidebar ? styles.sidebarSectionContent : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 30px" }}>
                            {items.map((lang, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const name = typeof lang === 'object' ? lang.name : lang;
                                const level = typeof lang === 'object' ? lang.level : null;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{ marginBottom: isSidebar ? "8px" : "4px" }}>
                                        <div style={{ fontSize: isSidebar ? "calc(12.5px * var(--theme-font-scale, 1))" : "calc(14px * var(--theme-font-scale, 1))", fontWeight: "600", color: isSidebar ? "white" : "#111827" }}>
                                            <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('languages', originalIdx, val, 'name')} />
                                        </div>
                                        {level && <div style={{ fontSize: isSidebar ? "calc(11px * var(--theme-font-scale, 1))" : "calc(12px * var(--theme-font-scale, 1))", color: isSidebar ? "rgba(255,255,255,0.75)" : "#6b7280" }}>{level}</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // SIDEBAR/MAIN: Certifications
        certifications: ({ itemIndices, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.certifications?.[idx]) : data.certifications;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
                    <div style={isSidebar ? {} : { marginBottom: "calc(20px * var(--theme-section-margin, 1))" }}>
                        {isSidebar ? <SidebarSectionTitle title="Certifications" /> : <MainSectionTitle title="Certifications" />}
                        <div style={isSidebar ? styles.sidebarSectionContent : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
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
                                        variant={isSidebar ? "compact" : "default"}
                                        subItemRange={renderSubItemRanges?.[originalIdx]}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // SIDEBAR/MAIN: Interests
        interests: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.interests?.[idx]) : data.interests;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="interests" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Interests">
                    <div style={isSidebar ? {} : { marginBottom: "calc(20px * var(--theme-section-margin, 1))" }}>
                        {isSidebar ? <SidebarSectionTitle title="Interests" /> : <MainSectionTitle title="Interests" />}
                        <div style={isSidebar ? styles.sidebarSectionContent : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 30px" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const name = typeof item === 'object' ? item.name : item;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={isSidebar ? styles.skillBullet : { display: "flex", alignItems: "center", gap: "8px", fontSize: "calc(13.5px * var(--theme-font-scale, 1))", color: "#374151" }}>
                                        <span style={isSidebar ? styles.bulletDot : { width: "4px", height: "4px", borderRadius: "50%", background: SIDEBAR_COLOR, flexShrink: 0 }} />
                                        <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('interests', originalIdx, val, 'name')} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // SIDEBAR/MAIN: Websites
        websites: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.websites?.[idx]) : data.websites;
            const portfolioLinks = (items || [])
                .map((link, idx) => ({ ...link, originalIdx: itemIndices ? itemIndices[idx] : idx }))
                .filter(link => link.url);
            if (portfolioLinks.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');

            return (
                <SectionWrapper sectionId="websites" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Websites">
                    <div style={isSidebar ? {} : { marginBottom: "calc(20px * var(--theme-section-margin, 1))" }}>
                        {isSidebar ? <SidebarSectionTitle title="Websites" /> : <MainSectionTitle title="Links & Portfolios" />}
                        <div style={isSidebar ? styles.sidebarSectionContent : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 30px" }}>
                            {portfolioLinks.map((site, i) => (
                                <div key={i} style={isSidebar ? { display: "flex", flexDirection: "column", marginBottom: "8px" } : { marginBottom: "4px" }}>
                                    <span style={isSidebar ? styles.contactLabel : { fontWeight: "700", fontSize: "calc(12px * var(--theme-font-scale, 1))", color: SIDEBAR_COLOR, textTransform: "uppercase", display: "block", marginBottom: "2px" }}>{site.label || 'Portfolio'}</span>
                                    <span style={isSidebar ? styles.contactValue : { fontSize: "calc(13.5px * var(--theme-font-scale, 1))", color: "#374151" }}>
                                        <ResumeLink href={site.url}>
                                            <SpellCheckText text={site.url} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('websites', site.originalIdx, val, 'url')} />
                                        </ResumeLink>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // MAIN: Summary (no title)
        summary: ({ isContinued, subItemRanges, zoneId }) => (
            <SectionWrapper sectionId="summary" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Summary">
                <div style={styles.summaryText}>
                    <div className="resume-rich-text">
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
        ),

        // MAIN: Experience
        experience: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.experience?.[idx]) : data.experience;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');

            return (
                <SectionWrapper sectionId="experience" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Experience">
                    <div style={isSidebar ? styles.sidebarSectionsWrapper : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Work History" /> : <MainSectionTitle title="Work History" />}
                        <div style={isSidebar ? styles.sidebarSectionContent : {}}>
                            {items.map((exp, i) => {
                                if (!exp) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const dateStr = exp.year || exp.date || (exp.startYear ? `${exp.startYear} - ${exp.isCurrent ? "Current" : exp.endYear}` : "");

                                if (isSidebar) {
                                    return (
                                        <div key={i} data-item-index={originalIdx} style={{ marginBottom: "16px" }}>
                                            <div style={{ ...styles.jobTitle, fontSize: "calc(13px * var(--theme-font-scale, 1))" }}>
                                                <RichTextSpellCheck html={exp.title || exp.role || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'title')} />
                                            </div>
                                            <div style={{ ...styles.jobCompany, fontSize: "calc(11.5px * var(--theme-font-scale, 1))", marginBottom: "2px" }}>
                                                <RichTextSpellCheck html={`${exp.company || ""}${exp.location ? `, ${exp.location}` : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'company')} />
                                            </div>
                                            <div style={{ ...styles.dateCol, width: "auto", fontSize: "calc(11px * var(--theme-font-scale, 1))", marginBottom: "6px" }}>
                                                <RichTextSpellCheck html={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'date')} />
                                            </div>
                                            <div className="resume-rich-text" style={{ ...styles.descriptionText, fontSize: "calc(11px * var(--theme-font-scale, 1))" }}>
                                                <SplittableRichText html={exp.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'description')} />
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.itemRow}>
                                        <div style={styles.dateCol}>
                                            <RichTextSpellCheck html={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'date')} />
                                        </div>
                                        <div style={styles.contentCol}>
                                            <div style={styles.jobTitle}>
                                                <RichTextSpellCheck html={exp.title || exp.role || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'title')} />
                                            </div>
                                            <div style={styles.jobCompany}>
                                                <RichTextSpellCheck html={`${exp.company || ""}${exp.location ? `, ${exp.location}` : ""}${exp.isRemote ? " • Remote" : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'company')} />
                                            </div>
                                            <div className="resume-rich-text" style={styles.descriptionText}>
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
                    </div>
                </SectionWrapper>
            );
        },

        // MAIN: Education
        education: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.education?.[idx]) : data.education;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');

            return (
                <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
                    <div style={isSidebar ? styles.sidebarSectionsWrapper : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Education" /> : <MainSectionTitle title="Education" />}
                        <div style={isSidebar ? styles.sidebarSectionContent : {}}>
                            {items.map((edu, i) => {
                                if (!edu) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;

                                if (isSidebar) {
                                    return (
                                        <div key={i} data-item-index={originalIdx} style={{ marginBottom: "16px" }}>
                                            <div style={{ ...styles.jobTitle, fontSize: "calc(13px * var(--theme-font-scale, 1))" }}>
                                                <RichTextSpellCheck html={edu.degree} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'degree')} />
                                            </div>
                                            <div style={{ ...styles.jobCompany, fontSize: "calc(11.5px * var(--theme-font-scale, 1))", marginBottom: "2px" }}>
                                                <RichTextSpellCheck html={`${edu.institution || edu.school || ""}${edu.location ? `, ${edu.location}` : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'institution')} />
                                            </div>
                                            <div style={{ ...styles.dateCol, width: "auto", fontSize: "calc(11px * var(--theme-font-scale, 1))", marginBottom: "6px" }}>
                                                <RichTextSpellCheck html={edu.year || edu.date || edu.endYear || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'year')} />
                                            </div>
                                            {edu.description && (
                                                <div className="resume-rich-text" style={{ ...styles.descriptionText, fontSize: "calc(11px * var(--theme-font-scale, 1))" }}>
                                                    <SplittableRichText html={edu.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'description')} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.itemRow}>
                                        <div style={styles.dateCol}>
                                            <RichTextSpellCheck html={edu.year || edu.date || edu.endYear || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'year')} />
                                        </div>
                                        <div style={styles.contentCol}>
                                            <div style={styles.jobTitle}>
                                                <RichTextSpellCheck html={edu.degree} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'degree')} />
                                            </div>
                                            <div style={styles.jobCompany}>
                                                <RichTextSpellCheck html={`${edu.institution || edu.school || ""}${edu.location ? `, ${edu.location}` : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'institution')} />
                                            </div>
                                            {edu.grade && <div style={{ fontSize: "calc(11.5px * var(--theme-font-scale, 1))", color: "var(--theme-text-muted, #6b7280)", marginTop: "2px" }}>GPA: {edu.grade}</div>}
                                            {edu.description && (
                                                <div className="resume-rich-text" style={{ ...styles.descriptionText, marginTop: "6px" }}>
                                                    <SplittableRichText html={edu.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'description')} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // MAIN: Projects
        projects: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.projects?.[idx]) : data.projects;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');

            return (
                <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
                    <div style={isSidebar ? styles.sidebarSectionsWrapper : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Projects" /> : <MainSectionTitle title="Projects" />}
                        <div style={isSidebar ? styles.sidebarSectionContent : {}}>
                            {items.map((proj, i) => {
                                if (!proj) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const dateStr = proj.year || (proj.startYear && `${proj.startYear} - ${proj.isCurrent ? 'Present' : (proj.endYear || 'Present')}`);

                                if (isSidebar) {
                                    return (
                                        <div key={i} data-item-index={originalIdx} style={{ marginBottom: "16px" }}>
                                            <div style={{ ...styles.jobTitle, fontSize: "calc(13px * var(--theme-font-scale, 1))" }}>
                                                <RichTextSpellCheck html={proj.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'title')} />
                                            </div>
                                            {proj.link && (
                                                <div style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", color: "var(--theme-text-primary)", marginBottom: "4px", opacity: 0.8 }}>
                                                    <ResumeLink href={proj.link}>
                                                        <RichTextSpellCheck html={proj.link} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'link')} />
                                                    </ResumeLink>
                                                </div>
                                            )}
                                            <div style={{ ...styles.dateCol, width: "auto", fontSize: "calc(11px * var(--theme-font-scale, 1))", marginBottom: "6px" }}>
                                                {dateStr}
                                            </div>
                                            <div className="resume-rich-text" style={{ ...styles.descriptionText, fontSize: "calc(11px * var(--theme-font-scale, 1))" }}>
                                                <SplittableRichText html={proj.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'description')} />
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.itemRow}>
                                        <div style={styles.dateCol}>
                                            {dateStr && <span style={{ color: "var(--theme-text-dim, #6b7280)" }}>{dateStr}</span>}
                                        </div>
                                        <div style={styles.contentCol}>
                                            <div style={styles.jobTitle}>
                                                <RichTextSpellCheck html={proj.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'title')} />
                                            </div>
                                            {proj.link && (
                                                <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: SIDEBAR_COLOR, marginBottom: "6px" }}>
                                                    <ResumeLink href={proj.link}>
                                                        <RichTextSpellCheck html={proj.link} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'link')} />
                                                    </ResumeLink>
                                                </div>
                                            )}
                                            <div className="resume-rich-text" style={styles.descriptionText}>
                                                <SplittableRichText
                                                    html={proj.description}
                                                    range={subItemRanges?.[originalIdx]}
                                                    isActive={isSpellCheckActive}
                                                    onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'description')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // MAIN: Awards
        awards: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.awards?.[idx]) : data.awards;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="awards" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Awards">
                    <div style={isSidebar ? styles.sidebarSectionsWrapper : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Awards" /> : <MainSectionTitle title="Awards" />}
                        <div style={isSidebar ? styles.sidebarSectionContent : {}}>
                            {items.map((award, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{ marginBottom: isSidebar ? "12px" : "calc(12px * var(--theme-paragraph-margin, 1))" }}>
                                        <div style={{ fontWeight: "700", fontSize: isSidebar ? "calc(13px * var(--theme-font-scale, 1))" : "calc(13.5px * var(--theme-font-scale, 1))", color: isSidebar ? "white" : "#111827" }}>
                                            <RichTextSpellCheck html={award.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', originalIdx, val, 'title')} />
                                        </div>
                                        <div style={{ fontSize: isSidebar ? "calc(11.5px * var(--theme-font-scale, 1))" : "calc(12px * var(--theme-font-scale, 1))", color: isSidebar ? "rgba(255,255,255,0.8)" : SIDEBAR_COLOR, fontStyle: "italic" }}>
                                            <RichTextSpellCheck html={award.issuer} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', originalIdx, val, 'issuer')} />
                                            {award.year && <span> • {award.year}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // MAIN/SIDEBAR: Volunteering
        volunteering: ({ itemIndices, zoneId, subItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.volunteering?.[idx] || data.volunteer?.[idx]) : (data.volunteering || data.volunteer);
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');

            return (
                <SectionWrapper sectionId="volunteering" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Volunteering">
                    <div style={isSidebar ? styles.sidebarSectionsWrapper : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Volunteering" /> : <MainSectionTitle title="Volunteering" />}
                        <div style={isSidebar ? styles.sidebarSectionContent : {}}>
                            {items.map((item, i) => {
                                if (!item) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const dateStr = [item.startDate, item.isCurrent ? "Present" : item.endDate].filter(Boolean).join(" - ");

                                if (isSidebar) {
                                    return (
                                        <div key={i} data-item-index={originalIdx} style={{ marginBottom: "16px" }}>
                                            <div style={{ ...styles.jobTitle, fontSize: "calc(13px * var(--theme-font-scale, 1))" }}>
                                                <RichTextSpellCheck html={item.organization || item.company} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'organization')} />
                                            </div>
                                            <div style={{ ...styles.jobCompany, fontSize: "calc(11.5px * var(--theme-font-scale, 1))", marginBottom: "2px" }}>
                                                <RichTextSpellCheck html={item.role || item.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'role')} />
                                            </div>
                                            <div style={{ ...styles.dateCol, width: "auto", fontSize: "calc(11px * var(--theme-font-scale, 1))", marginBottom: "4px" }}>
                                                {dateStr}
                                            </div>
                                            {item.description && (
                                                <div className="resume-rich-text" style={{ ...styles.descriptionText, fontSize: "calc(11px * var(--theme-font-scale, 1))" }}>
                                                    <SplittableRichText html={item.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'description')} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.itemRow}>
                                        <div style={styles.dateCol}>
                                            <span style={{ fontSize: "calc(11.5px * var(--theme-font-scale, 1))", color: "var(--theme-text-dim, #6b7280)" }}>
                                                {dateStr}
                                            </span>
                                        </div>
                                        <div style={styles.contentCol}>
                                            <div style={styles.jobTitle}>
                                                <RichTextSpellCheck html={item.organization || item.company} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'organization')} />
                                            </div>
                                            <div style={styles.jobCompany}>
                                                <RichTextSpellCheck html={item.role || item.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'role')} />
                                            </div>
                                            {item.description && (
                                                <div className="resume-rich-text" style={styles.descriptionText}>
                                                    <SplittableRichText html={item.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'description')} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // MAIN/SIDEBAR: Publications
        publications: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.publications?.[idx]) : data.publications;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');

            return (
                <SectionWrapper sectionId="publications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Publications">
                    <div style={isSidebar ? styles.sidebarSectionsWrapper : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Publications" /> : <MainSectionTitle title="Publications" />}
                        <div style={isSidebar ? styles.sidebarSectionContent : {}}>
                            {items.map((pub, i) => (
                                <div key={i} style={{ marginBottom: isSidebar ? "12px" : "calc(12px * var(--theme-paragraph-margin, 1))" }}>
                                    <div style={{ fontWeight: "700", fontSize: isSidebar ? "calc(13px * var(--theme-font-scale, 1))" : "calc(13.5px * var(--theme-font-scale, 1))", color: isSidebar ? "white" : "#111827" }}>
                                        <RichTextSpellCheck html={pub.name || pub.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('publications', itemIndices ? itemIndices[i] : i, val, 'name')} />
                                    </div>
                                    <div style={{ fontSize: isSidebar ? "calc(11.5px * var(--theme-font-scale, 1))" : "calc(12px * var(--theme-font-scale, 1))", color: isSidebar ? "rgba(255,255,255,0.8)" : SIDEBAR_COLOR }}>
                                        <RichTextSpellCheck html={pub.publisher} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('publications', itemIndices ? itemIndices[i] : i, val, 'publisher')} />
                                        {pub.releaseDate && <span> • {pub.releaseDate}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        // MAIN/SIDEBAR: References
        references: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.references?.[idx]) : data.references;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');

            return (
                <SectionWrapper sectionId="references" onSectionClick={onSectionClick} isInteractive={isInteractive} label="References">
                    <div style={isSidebar ? styles.sidebarSectionsWrapper : {}}>
                        {isSidebar ? <SidebarSectionTitle title="References" /> : <MainSectionTitle title="References" />}
                        <div style={isSidebar ? styles.sidebarSectionContent : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                            {items.map((ref, i) => (
                                <div key={i} style={{ marginBottom: isSidebar ? "12px" : "0" }}>
                                    <div style={{ fontWeight: "700", fontSize: isSidebar ? "calc(13px * var(--theme-font-scale, 1))" : "calc(14px * var(--theme-font-scale, 1))", color: isSidebar ? "white" : "#111827" }}>
                                        <RichTextSpellCheck html={ref.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('references', itemIndices ? itemIndices[i] : i, val, 'name')} />
                                    </div>
                                    <div style={{ fontSize: isSidebar ? "calc(11.5px * var(--theme-font-scale, 1))" : "calc(12.5px * var(--theme-font-scale, 1))", color: isSidebar ? "rgba(255,255,255,0.85)" : SIDEBAR_COLOR }}>
                                        <RichTextSpellCheck html={ref.company || ref.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('references', itemIndices ? itemIndices[i] : i, val, 'company')} />
                                    </div>
                                    {ref.contact && (
                                        <div style={{ fontSize: isSidebar ? "calc(11px * var(--theme-font-scale, 1))" : "calc(12px * var(--theme-font-scale, 1))", color: isSidebar ? "rgba(255,255,255,0.7)" : "#64748b", marginTop: "2px" }}>
                                            <RichTextSpellCheck html={ref.contact} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('references', itemIndices ? itemIndices[i] : i, val, 'contact')} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // MAIN: Software
        software: ({ itemIndices, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.software?.[idx]) : data.software;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="software" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Software">
                    <div style={isSidebar ? styles.sidebarSectionsWrapper : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Software" /> : <MainSectionTitle title="Software" />}
                        <div style={isSidebar ? styles.sidebarSectionContent : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
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
                                        subItemRange={renderSubItemRanges?.[originalIdx]}
                                        variant={isSidebar ? "compact" : "default"}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // MAIN: Key Achievements
        keyAchievements: ({ itemIndices, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.keyAchievements?.[idx]) : data.keyAchievements;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="keyAchievements" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Achievements">
                    <div style={isSidebar ? styles.sidebarSectionsWrapper : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Achievements" /> : <MainSectionTitle title="Key Achievements" />}
                        <div style={{ ...styles.sidebarSectionContent, padding: isSidebar ? "0 22px" : "0" }}>
                            <ul className="resume-rich-text" style={{ listStyleType: 'disc', paddingLeft: '18px', margin: 0, fontSize: isSidebar ? "calc(12px * var(--theme-font-scale, 1))" : "inherit", color: isSidebar ? "rgba(255,255,255,0.9)" : "inherit" }}>
                                {items.map((item, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <AchievementItem
                                            key={i}
                                            item={item}
                                            index={originalIdx}
                                            isSpellCheckActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onSpellCheckReplace={(field, val) => onSpellCheckReplace('keyAchievements', originalIdx, val, field)}
                                            subItemRange={renderSubItemRanges?.[originalIdx]}
                                        />
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // MAIN: Accomplishments
        accomplishments: ({ itemIndices, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.accomplishments?.[idx]) : data.accomplishments;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="accomplishments" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Accomplishments">
                    <div style={isSidebar ? styles.sidebarSectionsWrapper : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Accomplishments" /> : <MainSectionTitle title="Accomplishments" />}
                        <div style={{ ...styles.sidebarSectionContent, padding: isSidebar ? "0 22px" : "0" }}>
                            <ul className="resume-rich-text" style={{ listStyleType: 'disc', paddingLeft: '18px', margin: 0, fontSize: isSidebar ? "calc(12px * var(--theme-font-scale, 1))" : "inherit", color: isSidebar ? "rgba(255,255,255,0.9)" : "inherit" }}>
                                {items.map((item, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <AccomplishmentItem
                                            key={i}
                                            item={item}
                                            index={originalIdx}
                                            isSpellCheckActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onSpellCheckReplace={(field, val) => onSpellCheckReplace('accomplishments', originalIdx, val, field)}
                                            subItemRange={renderSubItemRanges?.[originalIdx]}
                                        />
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // MAIN: Affiliations
        affiliations: ({ itemIndices, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.affiliations?.[idx]) : data.affiliations;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="affiliations" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Affiliations">
                    <div style={isSidebar ? styles.sidebarSectionsWrapper : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Affiliations" /> : <MainSectionTitle title="Affiliations" />}
                        <div style={{ ...styles.sidebarSectionContent, padding: isSidebar ? "0 22px" : "0" }}>
                            <ul className="resume-rich-text" style={{ listStyleType: 'disc', paddingLeft: '18px', margin: 0, fontSize: isSidebar ? "calc(12px * var(--theme-font-scale, 1))" : "inherit", color: isSidebar ? "rgba(255,255,255,0.9)" : "inherit" }}>
                                {items.map((item, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <AffiliationItem
                                            key={i}
                                            item={item}
                                            index={originalIdx}
                                            isSpellCheckActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onSpellCheckReplace={(field, val) => onSpellCheckReplace('affiliations', originalIdx, val, field)}
                                            subItemRange={renderSubItemRanges?.[originalIdx]}
                                        />
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // MAIN: Additional Info
        additionalInfo: ({ zoneId, subItemRanges: renderSubItemRanges }) => {
            if (!data.additionalInfo) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="additionalInfo" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Info">
                    <div style={isSidebar ? styles.sidebarSectionsWrapper : {}}>
                        {isSidebar ? <SidebarSectionTitle title="Information" /> : <MainSectionTitle title="Additional Info" />}
                        <div className="resume-rich-text" style={isSidebar ? { padding: "0 22px", fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "rgba(255,255,255,0.9)" } : styles.descriptionText}>
                            <SplittableRichText
                                html={data.additionalInfo}
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

        // SIDEBAR: Personal Details
        personalDetails: ({ zoneId }) => {
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            const details = [
                { label: 'DOB', value: personal?.dob, field: 'dob' },
                { label: 'Nationality', value: personal?.nationality, field: 'nationality' },
                { label: 'Gender', value: personal?.gender, field: 'gender' },
                { label: 'Marital', value: personal?.maritalStatus, field: 'maritalStatus' },
                { label: 'Visa Status', value: personal?.visaStatus, field: 'visaStatus' },
                { label: 'Religion', value: personal?.religion, field: 'religion' },
                { label: 'Passport', value: personal?.passport, field: 'passport' },
                { label: 'Place of Birth', value: personal?.placeOfBirth, field: 'placeOfBirth' },
                { label: 'Driving License', value: personal?.drivingLicense, field: 'drivingLicense' },
                { label: 'Other', value: personal?.otherPersonal, field: 'otherPersonal' },
            ].filter(d => d.value);

            if (details.length === 0) return null;

            return (
                <SectionWrapper sectionId="personalDetails" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Personal">
                    <div style={isSidebar ? {} : { marginBottom: "calc(20px * var(--theme-section-margin, 1))" }}>
                        {isSidebar ? <SidebarSectionTitle title="Personal Details" /> : <MainSectionTitle title="Personal Details" />}
                        <div style={isSidebar ? styles.sidebarSectionContent : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                            {details.map((detail, i) => (
                                <div key={i} style={{ marginBottom: isSidebar ? "8px" : "4px" }}>
                                    <span style={isSidebar ? styles.contactLabel : { fontWeight: "700", fontSize: "calc(12px * var(--theme-font-scale, 1))", color: SIDEBAR_COLOR, textTransform: "uppercase", marginRight: "8px" }}>{detail.label}:</span>
                                    <span style={isSidebar ? styles.contactValue : { fontSize: "calc(13.5px * var(--theme-font-scale, 1))", color: "#374151" }}>
                                        <SpellCheckText
                                            text={detail.value}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace('personal', detail.field, val)}
                                        />
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // MAIN: Custom
        custom: ({ isContinued, subItemRanges: renderSubItemRanges, zoneId }) => {
            if (!data.customSection?.isVisible || !data.customSection?.content) return null;
            const content = data.customSection.content;
            if (!content || content.trim() === "" || content === "<p><br></p>") return null;
            const title = data.customSection.title || "Additional Information";
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="custom" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <div style={isSidebar ? styles.sidebarSectionsWrapper : {}}>
                        {isSidebar ? <SidebarSectionTitle title={title} /> : <MainSectionTitle title={title} />}
                        <div className="resume-rich-text" style={isSidebar ? { padding: "0 22px", fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "rgba(255,255,255,0.9)" } : styles.descriptionText}>
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
    };

    // --- HEADER (photo + name) ---
    const Header = () => (
        <SectionWrapper sectionId="personal" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Header">
            <div>
                {personal?.photo ? (
                    <div style={styles.photoWrapper}>
                        <img src={personal.photo} style={styles.photo} alt="profile" />
                    </div>
                ) : (
                    <div style={styles.photoPlaceholder}>
                        <span>👤</span>
                    </div>
                )}
                <div style={styles.nameBlock}>
                    <h1 style={styles.nameText}>
                        <SpellCheckText
                            text={personal?.name || "YOUR NAME"}
                            isActive={isSpellCheckActive}
                            onIgnore={onSpellCheckIgnore}
                            onReplace={(val) => onSpellCheckReplace('personal', 'name', val)}
                        />
                    </h1>
                    {personal?.profession && (
                        <div style={styles.professionText}>
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

    // --- RENDER ZONE HELPER ---
    const renderZone = (id, items, columnStyle = {}) => (
        <DroppableZone id={id} style={{ ...columnStyle }}>
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
            <div style={{ ...styles.page, height: "auto", overflow: "visible" }}>
                <div style={styles.sidebarColumn}>
                    <Header />
                    <div data-column-id="sidebar" style={{ ...styles.ZONE_STYLE }}>
                        {activeSidebarSections.map(sid => (
                            <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="sidebar" />
                        ))}
                    </div>
                </div>
                <div data-column-id="main" style={{ ...styles.mainColumn, ...styles.ZONE_STYLE }}>
                    {activeMainSections.map(sid => (
                        <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="main" />
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="onyx-modern-root">
            <Measurer />
            <DndContext {...dndContextProps}>
                <SortableContext items={[...activeSidebarSections, ...activeMainSections]} strategy={verticalListSortingStrategy}>
                    {showPageBreaks && pages ? (
                        pages.map((page, i) => (
                            <div key={i} className="resume-page" style={styles.page}>
                                <div style={styles.sidebarColumn}>
                                    {i === 0 && <Header />}
                                    {renderZone(`sidebar-p${i}`, page.sidebar, SIDEBAR_ZONE_STYLE)}
                                </div>
                                <div style={styles.mainColumn}>
                                    {renderZone(`main-p${i}`, page.main, MAIN_ZONE_STYLE)}
                                </div>
                                <div style={{ position: "absolute", bottom: "15px", right: "20px", fontSize: "10px", opacity: 0.4 }}>Page {i + 1}</div>
                            </div>
                        ))
                    ) : (
                        <div className="resume-page" style={{ ...styles.page, height: "auto", minHeight: "100%" }}>
                            <div style={styles.sidebarColumn}>
                                <Header />
                                {renderZone('sidebar', activeSidebarSections, SIDEBAR_ZONE_STYLE)}
                            </div>
                            <div style={styles.mainColumn}>
                                {renderZone('main', activeMainSections, MAIN_ZONE_STYLE)}
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

export default OnyxModern;
