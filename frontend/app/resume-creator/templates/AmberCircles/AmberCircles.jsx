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
 * AmberCircles Template
 * Inspired by modern graphic design:
 * - White background with bold black/amber/orange typography
 * - Circular profile photo with decorative circles
 * - Left sidebar (narrower) + Right main column
 * - Bold underlined section headings
 * - Amber accent color for profession title and icons
 * - Clean two-column layout with decorative geometric elements
 */
const AmberCircles = ({
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
    const templateId = 'amber-circles';
    const savedLayout = data.templateLayouts?.[templateId] || {};
    const initialLayout = {
        sidebar: savedLayout.sidebar || savedLayout.left || ['profile', 'education', 'languages', 'contact', 'certifications', 'software', 'interests', 'awards'],
        main: savedLayout.main || savedLayout.right || ['skills', 'experience', 'projects', 'volunteer', 'publications', 'custom', 'additionalInfo']
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

    // --- STYLES ---
    const accentColor = "var(--theme-color, #f5a623)";
    const darkColor = "#1a1a1a";
    const mutedColor = "#555555";

    const styles = {
        page: {
            width: "210mm",
            height: "297mm",
            background: "white",
            boxSizing: "border-box",
            position: "relative",
            margin: "0 auto 30px auto",
            color: darkColor,
            fontFamily: "var(--theme-font, 'Georgia', serif)",
            display: "flex",
            flexDirection: "column",
        },

        // Top header area: left side has photo+circles, right has name/profession
        header: {
            display: "flex",
            alignItems: "center",
            paddingTop: "var(--theme-page-margin, 30px)",
            paddingLeft: "var(--theme-page-margin, 40px)",
            paddingRight: "var(--theme-page-margin, 40px)",
            paddingBottom: "20px", 
            position: "relative",
            minHeight: "160px",
            borderBottom: "3px solid #f0f0f0",
            marginBottom: "0",
            boxSizing: "border-box", 
        },
        // Decorative circles in header
        decorCircleLargeTopLeft: {
            position: "absolute",
            top: "calc(var(--theme-page-margin, 40px) - 50px)",
            left: "calc(var(--theme-page-margin, 40px) - 15px)",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: accentColor,
            zIndex: 0,
            WebkitPrintColorAdjust: "exact",
        },
        decorCircleSmallTopLeft: {
            position: "absolute",
            top: "calc(var(--theme-page-margin, 40px) - 10px)",
            left: "calc(var(--theme-page-margin, 40px) + 50px)",
            width: "35px",
            height: "35px",
            borderRadius: "50%",
            background: accentColor,
            zIndex: 0,
            WebkitPrintColorAdjust: "exact",
        },
        decorCircleTopRight: {
            position: "absolute",
            top: "calc(var(--theme-page-margin, 40px) - 50px)",
            right: "calc(var(--theme-page-margin, 40px) - 10px)",
            width: "55px",
            height: "55px",
            borderRadius: "50%",
            background: accentColor,
            zIndex: 0,
            WebkitPrintColorAdjust: "exact",
        },
        decorCircleSmallTopRight: {
            position: "absolute",
            top: "calc(var(--theme-page-margin, 40px) + 10px)",
            right: "calc(var(--theme-page-margin, 40px) + 45px)",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: accentColor,
            zIndex: 0,
        },
        // Photo area in header
        photoContainer: {
            position: "relative",
            zIndex: 1,
            marginRight: "30px",
            flexShrink: 0,
        },
        photo: {
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "4px solid white",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            display: "block",
        },
        photoPlaceholder: {
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "#e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "4px solid white",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        },
        // Name/Profession in header
        headerTextArea: {
            flex: 1,
            zIndex: 1,
        },
        name: {
            fontSize: "calc(36px * var(--theme-font-scale, 1))",
            fontWeight: "900",
            color: darkColor,
            margin: "0 0 6px 0",
            lineHeight: "1.1",
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontFamily: "var(--theme-font, 'Georgia', serif)",
        },
        profession: {
            fontSize: "calc(18px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: accentColor,
            margin: "0",
            textTransform: "uppercase",
            letterSpacing: "2px",
        },

        // Body: left sidebar + right main
        layoutBody: {
            display: "flex",
            flex: 1,
            minHeight: 0,
        },

        // Left sidebar (narrower ~38%)
        sidebarColumn: {
            width: "38%",
            paddingTop: "25px", 
            paddingLeft: "var(--theme-page-margin, 40px)",
            paddingRight: "20px", 
            paddingBottom: "var(--theme-page-margin, 40px)",
            display: "flex",
            flexDirection: "column",
            gap: "calc(22px * var(--theme-section-margin, 1))",
            boxSizing: "border-box",
            position: "relative",
        },

        // Right main column (~62%)
        mainColumn: {
            width: "62%",
            paddingTop: "25px", 
            paddingRight: "var(--theme-page-margin, 40px)",
            paddingBottom: "var(--theme-page-margin, 40px)",
            paddingLeft: "25px", 
            display: "flex",
            flexDirection: "column",
            gap: "calc(22px * var(--theme-section-margin, 1))",
            boxSizing: "border-box",
            borderLeft: "2px solid #f0f0f0",
        },

        // Section titles - bold with underline
        sectionTitle: {
            fontSize: "calc(17px * var(--theme-font-scale, 1))",
            fontWeight: "900",
            color: darkColor,
            borderBottom: "3px solid",
            borderColor: darkColor,
            marginTop: "0",
            paddingBottom: "5px",
            marginBottom: "calc(12px * var(--theme-paragraph-margin, 1))",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
        },

        // Contact items
        contactItem: {
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            marginBottom: "calc(8px * var(--theme-paragraph-margin, 1))",
            fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
            color: mutedColor,
            wordBreak: "break-all",
            overflowWrap: "break-word",
        },
        contactIcon: {
            color: accentColor,
            flexShrink: 0,
            marginTop: "2px",
        },

        // Education items
        eduItem: {
            marginBottom: "calc(14px * var(--theme-paragraph-margin, 1))",
        },
        eduDegree: {
            fontWeight: "700",
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            color: darkColor,
        },
        eduDate: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: accentColor,
            fontWeight: "600",
            marginBottom: "2px",
        },
        eduSchool: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: mutedColor,
        },
        eduBullet: {
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: accentColor,
            display: "inline-block",
            marginRight: "8px",
            flexShrink: 0,
        },

        // Experience items
        expItem: {
            marginBottom: "calc(18px * var(--theme-paragraph-margin, 1))",
            paddingLeft: "14px",
            borderLeft: `3px solid ${accentColor}`,
        },
        expTitle: {
            fontWeight: "700",
            fontSize: "calc(14px * var(--theme-font-scale, 1))",
            color: darkColor,
            marginBottom: "2px",
        },
        expCompany: {
            fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
            color: mutedColor,
            marginBottom: "6px",
            fontStyle: "italic",
        },
        expDesc: {
            fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.6)",
            color: mutedColor,
        },

        // Skills two-column list
        skillsGrid: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4px 20px",
        },
        skillItem: {
            fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
            color: mutedColor,
            padding: "3px 0",
            display: "flex",
            alignItems: "center",
            gap: "6px",
        },
        skillBullet: {
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: accentColor,
            flexShrink: 0,
        },

        // References (two-column)
        refGrid: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px 20px",
        },
        refName: {
            fontWeight: "700",
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            color: darkColor,
        },
        refDetail: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: mutedColor,
        },

        // Languages
        langItem: {
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "4px",
            fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
        },

        // Profile text
        profileText: {
            fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.65)",
            color: mutedColor,
        },

        // Bottom decorative circle
        decorCircleBottomRight: {
            position: "absolute",
            bottom: "15px",
            right: "calc(var(--theme-page-margin, 40px) - 20px)",
            width: "45px",
            height: "45px",
            borderRadius: "50%",
            background: accentColor,
            zIndex: 0,
        },
    };

    // --- SECTION TITLE COMPONENT ---
    const SectionTitle = ({ title, zoneId }) => {
        const { isContinued } = useSectionContext();
        const displayTitle = isContinued ? `${title} (Cont.)` : title;
        const isSidebar = zoneId?.toLowerCase().includes('sidebar');

        return (
            <h3 style={{
                ...styles.sectionTitle,
                fontSize: isSidebar
                    ? `calc(15px * var(--theme-font-scale, 1))`
                    : styles.sectionTitle.fontSize
            }}>
                {displayTitle}
            </h3>
        );
    };

    // --- CUSTOM RENDERERS ---
    const customRenderers = {
        // "Profile" = summary on the sidebar
        profile: ({ isContinued, subItemRanges, zoneId }) => {
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="summary" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Profile">
                    <div>
                        <SectionTitle title="Profile" zoneId={zoneId} />
                        <div className="resume-rich-text" style={{
                            ...styles.profileText,
                            fontSize: isSidebar ? "calc(11.5px * var(--theme-font-scale, 1))" : styles.profileText.fontSize
                        }}>
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

        summary: ({ isContinued, subItemRanges, zoneId }) => {
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="summary" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Profile">
                    <div>
                        <SectionTitle title="Profile" zoneId={zoneId} />
                        <div className="resume-rich-text" style={{
                            ...styles.profileText,
                            fontSize: isSidebar ? "calc(11.5px * var(--theme-font-scale, 1))" : styles.profileText.fontSize
                        }}>
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

        education: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.education?.[idx]) : data.education;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education History">
                    <div>
                        <SectionTitle title="Education History" zoneId={zoneId} />
                        {items.map((edu, i) => {
                            if (!edu) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr = edu.year || edu.date || (edu.endYear ? (edu.startYear ? `${edu.startYear} - ${edu.endYear}` : edu.endYear) : "");
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.eduItem}>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                                        <div style={{ paddingTop: "4px" }}>
                                            <div style={styles.eduBullet} />
                                        </div>
                                        <div>
                                            <div style={styles.eduDegree}>
                                                <RichTextSpellCheck html={edu.degree} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'degree')} />
                                            </div>
                                            {dateStr && (
                                                <div style={styles.eduDate}>
                                                    <RichTextSpellCheck html={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'year')} />
                                                </div>
                                            )}
                                            <div style={styles.eduSchool}>
                                                <RichTextSpellCheck html={`${edu.institution || edu.school || ""}${edu.location && !isSidebar ? `, ${edu.location}` : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'institution')} />
                                            </div>
                                            {edu.grade && !isSidebar && (
                                                <div style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", color: "#888", marginTop: "2px" }}>GPA: {edu.grade}</div>
                                            )}
                                            {edu.description && !isSidebar && (
                                                <div className="resume-rich-text" style={{ ...styles.profileText, marginTop: "6px" }}>
                                                    <SplittableRichText
                                                        html={edu.description}
                                                        range={subItemRanges?.[originalIdx]}
                                                        isActive={isSpellCheckActive}
                                                        onIgnore={onSpellCheckIgnore}
                                                        onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'description')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        contact: ({ zoneId }) => {
            const items = data.websites || [];
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            const contactLinks = [
                { label: 'LinkedIn', value: personal?.linkedin, icon: '🔗', field: 'linkedin' },
                { label: 'GitHub', value: personal?.github, icon: '💻', field: 'github' },
                { label: 'Website', value: personal?.website, icon: '🌐', field: 'website' },
                ...items.filter(l => l.addToHeader && l.url).map((l, idx) => ({ label: l.label || 'Link', value: l.url, icon: '🔗', field: 'url', idx }))
            ];

            return (
                <SectionWrapper sectionId="contact" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Contact Info">
                    <div>
                        <SectionTitle title="Contact Info" zoneId={zoneId} />
                        <div style={isSidebar ? {} : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 20px" }}>
                            {personal?.phone && (
                                <div style={styles.contactItem}>
                                    <span style={styles.contactIcon}>📞</span>
                                    <span>
                                        <ResumeLink href={personal.phone}>
                                            <SpellCheckText text={personal.phone} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'phone', val)} />
                                        </ResumeLink>
                                    </span>
                                </div>
                            )}
                            {personal?.email && (
                                <div style={styles.contactItem}>
                                    <span style={styles.contactIcon}>✉️</span>
                                    <span>
                                        <ResumeLink href={personal.email}>
                                            <SpellCheckText text={personal.email} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'email', val)} />
                                        </ResumeLink>
                                    </span>
                                </div>
                            )}
                            {personal?.city && (
                                <div style={styles.contactItem}>
                                    <span style={styles.contactIcon}>📍</span>
                                    <span>
                                        <SpellCheckText
                                            text={[personal.city, personal.state, personal.zipCode, personal.country].filter(Boolean).join(", ")}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace('personal', 'city', val)}
                                        />
                                    </span>
                                </div>
                            )}
                            {contactLinks.map((link, i) => link.value && (
                                <div key={i} style={styles.contactItem}>
                                    <span style={styles.contactIcon}>{link.icon}</span>
                                    <span style={{ wordBreak: "break-all" }}>
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

        websites: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.websites?.[idx]) : data.websites;
            const portfolioLinks = (items || [])
                .map((link, idx) => ({ ...link, originalIdx: itemIndices ? itemIndices[idx] : idx }))
                .filter(link => !link.addToHeader && link.url);
            if (portfolioLinks.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="websites" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Websites & Portfolios">
                    <div>
                        <SectionTitle title="Websites & Portfolios" zoneId={zoneId} />
                        <div style={isSidebar ? {} : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 20px" }}>
                            {portfolioLinks.map((site, i) => (
                                <div key={i} data-item-index={site.originalIdx} style={styles.contactItem}>
                                    <span style={styles.contactIcon}>🔗</span>
                                    <span style={{ wordBreak: "break-all" }}>
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

        languages: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.languages?.[idx]) : data.languages;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="languages" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Languages">
                    <div>
                        <SectionTitle title="Languages" zoneId={zoneId} />
                        <div style={{ display: "grid", gridTemplateColumns: isSidebar ? "1fr" : "1fr 1fr", gap: "4px 10px" }}>
                            {items.map((lang, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const name = typeof lang === 'object' ? (lang.language || lang.name) : lang;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.langItem}>
                                        <span style={{ ...styles.skillBullet, background: "var(--theme-color, #f5a623)" }} />
                                        <span style={{ fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: "#444" }}>
                                            <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('languages', originalIdx, val, 'language')} />
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        skills: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.skills?.[idx]).filter(Boolean) : (data.skills || []);
            const hasDescription = data.skillsDescription && data.skillsDescription.trim();
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            if (items.length > 0) {
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <div>
                            <SectionTitle title="Skills" zoneId={zoneId} />
                            <div style={{ ...styles.skillsGrid, gridTemplateColumns: isSidebar ? "1fr" : "1fr 1fr" }}>
                                {items.map((skill, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    const name = typeof skill === 'object' ? skill.name : skill;
                                    return (
                                        <div key={i} data-item-index={originalIdx} style={styles.skillItem}>
                                            <div style={styles.skillBullet} />
                                            <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('skills', originalIdx, val, 'name')} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </SectionWrapper>
                );
            }
            if (hasDescription) {
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <div>
                            <SectionTitle title="Skills" zoneId={zoneId} />
                            <div className="resume-rich-text" style={styles.profileText}>
                                <SplittableRichText html={data.skillsDescription} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace && onSpellCheckReplace('skills', 'skillsDescription', val)} />
                            </div>
                        </div>
                    </SectionWrapper>
                );
            }
            return null;
        },

        strengths: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.strengths?.[idx]).filter(Boolean) : (data.strengths || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="strengths" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Strengths">
                    <div>
                        <SectionTitle title="Key Strengths" zoneId={zoneId} />
                        <div style={{ ...styles.skillsGrid, gridTemplateColumns: isSidebar ? "1fr" : "1fr 1fr" }}>
                            {items.map((skill, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const name = typeof skill === 'object' ? skill.name : skill;
                                const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.skillItem}>
                                        <div style={styles.skillBullet} />
                                        <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('strengths', originalIdx, val, 'name')} />
                                            {lvl > 0 && !isSidebar && (
                                                <span style={{ display: "flex", gap: "2px", marginLeft: "6px" }}>
                                                    {[...Array(5)].map((_, di) => (
                                                        <div key={di} style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: di < lvl ? "var(--theme-color, #f5a623)" : "#ddd" }} />
                                                    ))}
                                                </span>
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

        additionalSkills: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.additionalSkills?.[idx]).filter(Boolean) : (data.additionalSkills || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="additionalSkills" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Skills">
                    <div>
                        <SectionTitle title="Additional Skills" zoneId={zoneId} />
                        <div style={{ ...styles.skillsGrid, gridTemplateColumns: isSidebar ? "1fr" : "1fr 1fr" }}>
                            {items.map((skill, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.skillItem}>
                                        <div style={styles.skillBullet} />
                                        <RichTextSpellCheck html={typeof skill === 'object' ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalSkills', originalIdx, val, 'name')} />
                                    </div>
                                );
                            })}
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
                <SectionWrapper sectionId="experience" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Work Experience">
                    <div>
                        <SectionTitle title="Work Experience" zoneId={zoneId} />
                        {items.map((exp, i) => {
                            if (!exp) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr = exp.year || exp.date || (exp.startYear ? `${exp.startYear} - ${exp.isCurrent ? "Current" : (exp.endYear || "Current")}` : "");
                            return (
                                <div key={i} data-item-index={originalIdx} style={{
                                    ...styles.expItem,
                                    paddingLeft: isSidebar ? "10px" : styles.expItem.paddingLeft,
                                    borderLeftWidth: isSidebar ? "2px" : styles.expItem.borderLeftWidth
                                }}>
                                    <div style={{
                                        ...styles.expTitle,
                                        fontSize: isSidebar ? "calc(13px * var(--theme-font-scale, 1))" : styles.expTitle.fontSize
                                    }}>
                                        <RichTextSpellCheck html={exp.title || exp.role || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'title')} />
                                    </div>
                                    <div style={{
                                        ...styles.expCompany,
                                        fontSize: isSidebar ? "calc(11.5px * var(--theme-font-scale, 1))" : styles.expCompany.fontSize
                                    }}>
                                        <RichTextSpellCheck
                                            html={isSidebar
                                                ? [exp.company, dateStr].filter(Boolean).join(" • ")
                                                : [exp.company, exp.location, dateStr ? dateStr : null, exp.isRemote ? "Remote" : null].filter(Boolean).join(" • ")
                                            }
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'company')}
                                        />
                                    </div>
                                    {(!isSidebar || items.length < 3) && exp.description && (
                                        <div className="resume-rich-text" style={{
                                            ...styles.expDesc,
                                            fontSize: isSidebar ? "calc(11.5px * var(--theme-font-scale, 1))" : styles.expDesc.fontSize
                                        }}>
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

        projects: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.projects?.[idx]) : data.projects;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
                    <div>
                        <SectionTitle title="Projects" zoneId={zoneId} />
                        {items.map((proj, i) => {
                            if (!proj) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr = proj.year || (proj.startYear && `${proj.startYear} - ${proj.isCurrent ? 'Present' : (proj.endYear || 'Present')}`);
                            return (
                                <div key={i} data-item-index={originalIdx} style={{
                                    ...styles.expItem,
                                    paddingLeft: isSidebar ? "10px" : styles.expItem.paddingLeft,
                                    borderLeftWidth: isSidebar ? "2px" : styles.expItem.borderLeftWidth
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                                        <div style={{
                                            ...styles.expTitle,
                                            fontSize: isSidebar ? "calc(13px * var(--theme-font-scale, 1))" : styles.expTitle.fontSize
                                        }}>
                                            <RichTextSpellCheck html={proj.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'title')} />
                                        </div>
                                        {dateStr && !isSidebar && (
                                            <span style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", color: "#888" }}>
                                                <SpellCheckText text={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'year')} />
                                            </span>
                                        )}
                                    </div>
                                    {proj.link && !isSidebar && (
                                        <div style={{ fontSize: "calc(11.5px * var(--theme-font-scale, 1))", color: "var(--theme-color, #f5a623)", marginBottom: "4px" }}>
                                            <ResumeLink href={proj.link}>
                                                <RichTextSpellCheck html={proj.link} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'link')} />
                                            </ResumeLink>
                                        </div>
                                    )}
                                    {proj.technologies && proj.technologies.length > 0 && !isSidebar && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "6px" }}>
                                            {proj.technologies.map((tech, tIdx) => (
                                                <span key={tIdx} style={{ fontSize: "calc(10.5px * var(--theme-font-scale, 1))", padding: "1px 7px", background: "#fff3e0", borderRadius: "10px", color: "#e65100", border: "1px solid #ffcc80" }}>
                                                    <RichTextSpellCheck html={tech} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => {
                                                        const updated = [...proj.technologies]; updated[tIdx] = val;
                                                        onSpellCheckReplace('projects', originalIdx, updated, 'technologies');
                                                    }} />
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {(!isSidebar || items.length < 3) && proj.description && (
                                        <div className="resume-rich-text" style={{
                                            ...styles.expDesc,
                                            fontSize: isSidebar ? "calc(11.5px * var(--theme-font-scale, 1))" : styles.expDesc.fontSize
                                        }}>
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

        certifications: ({ itemIndices, isContinued, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.certifications?.[idx]) : data.certifications;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
                    <div>
                        <SectionTitle title="Certifications" zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((cert, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <CertificationItem key={i} item={cert} index={originalIdx} isSpellCheckActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onSpellCheckReplace={(field, val) => onSpellCheckReplace('certifications', originalIdx, val, field)} variant={zoneId?.toLowerCase().includes('sidebar') ? 'compact' : undefined} subItemRange={renderSubItemRanges?.[originalIdx]} />
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        software: ({ itemIndices, isContinued, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.software?.[idx]) : data.software;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="software" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Software">
                    <div>
                        <SectionTitle title="Software" zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <SoftwareItem key={i} item={item} index={originalIdx} isSpellCheckActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onSpellCheckReplace={(field, val) => onSpellCheckReplace('software', originalIdx, val, field)} variant={zoneId?.toLowerCase().includes('sidebar') ? 'compact' : undefined} subItemRange={renderSubItemRanges?.[originalIdx]} />
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        interests: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.interests?.[idx]) : data.interests;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="interests" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Interests">
                    <div>
                        <SectionTitle title="Interests" zoneId={zoneId} />
                        <div style={{ ...styles.skillsGrid, gridTemplateColumns: isSidebar ? "1fr" : "1fr 1fr" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.skillItem}>
                                        <div style={styles.skillBullet} />
                                        <RichTextSpellCheck html={typeof item === 'object' ? item.name : item} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('interests', originalIdx, val, 'name')} />
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
            return (
                <SectionWrapper sectionId="awards" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Awards">
                    <div>
                        <SectionTitle title="Awards" zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((award, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx}>
                                        <div style={{ fontWeight: "700", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: darkColor }}>
                                            <RichTextSpellCheck html={award.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', originalIdx, val, 'title')} />
                                        </div>
                                        <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: mutedColor }}>
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

        volunteer: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.volunteer?.[idx]) : data.volunteer;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="volunteer" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Volunteer">
                    <div>
                        <SectionTitle title="Volunteer" zoneId={zoneId} />
                        {items.map((item, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.expItem}>
                                    <div style={styles.expTitle}>
                                        <RichTextSpellCheck html={item.organization} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteer', originalIdx, val, 'organization')} />
                                    </div>
                                    <div style={styles.expCompany}>
                                        <RichTextSpellCheck html={item.role} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteer', originalIdx, val, 'role')} />
                                        {(item.startDate || item.endDate) && <span> • {item.startDate} - {item.isCurrent ? "Present" : item.endDate}</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        publications: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.publications?.[idx]) : data.publications;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="publications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Publications">
                    <div>
                        <SectionTitle title="Publications" zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((pub, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx}>
                                        <div style={{ fontWeight: "700", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: darkColor }}>
                                            <RichTextSpellCheck html={pub.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('publications', originalIdx, val, 'name')} />
                                        </div>
                                        <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "var(--theme-color, #f5a623)" }}>
                                            <RichTextSpellCheck html={pub.publisher} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('publications', originalIdx, val, 'publisher')} />
                                            {pub.releaseDate && <span> • {pub.releaseDate}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        keyAchievements: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.keyAchievements?.[idx]) : data.keyAchievements;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="keyAchievements" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Achievements">
                    <div>
                        <SectionTitle title="Key Achievements" zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{
                                        ...styles.expItem,
                                        paddingLeft: isSidebar ? "10px" : styles.expItem.paddingLeft,
                                        borderLeftWidth: isSidebar ? "2px" : styles.expItem.borderLeftWidth
                                    }}>
                                        <div style={{
                                            ...styles.expTitle,
                                            fontSize: isSidebar ? "calc(13px * var(--theme-font-scale, 1))" : styles.expTitle.fontSize
                                        }}>
                                            <RichTextSpellCheck html={item.title || item.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIdx, val, item.title ? 'title' : 'name')} />
                                        </div>
                                        {(!isSidebar || items.length < 5) && item.description && (
                                            <div className="resume-rich-text" style={{
                                                ...styles.expDesc,
                                                fontSize: isSidebar ? "calc(11.5px * var(--theme-font-scale, 1))" : styles.expDesc.fontSize
                                            }}>
                                                <SplittableRichText html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIdx, val, 'description')} />
                                            </div>
                                        )}
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
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="accomplishments" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Accomplishments">
                    <div>
                        <SectionTitle title="Accomplishments" zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{
                                        ...styles.expItem,
                                        paddingLeft: isSidebar ? "10px" : styles.expItem.paddingLeft,
                                        borderLeftWidth: isSidebar ? "2px" : styles.expItem.borderLeftWidth
                                    }}>
                                        <div style={{
                                            ...styles.expTitle,
                                            fontSize: isSidebar ? "calc(13px * var(--theme-font-scale, 1))" : styles.expTitle.fontSize
                                        }}>
                                            <RichTextSpellCheck html={item.title || item.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('accomplishments', originalIdx, val, item.title ? 'title' : 'name')} />
                                        </div>
                                        {(!isSidebar || items.length < 5) && item.description && (
                                            <div className="resume-rich-text" style={{
                                                ...styles.expDesc,
                                                fontSize: isSidebar ? "calc(11.5px * var(--theme-font-scale, 1))" : styles.expDesc.fontSize
                                            }}>
                                                <SplittableRichText html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('accomplishments', originalIdx, val, 'description')} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        affiliations: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.affiliations?.[idx]) : data.affiliations;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="affiliations" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Affiliations">
                    <div>
                        <SectionTitle title="Affiliations" zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{
                                        ...styles.expItem,
                                        paddingLeft: isSidebar ? "10px" : styles.expItem.paddingLeft,
                                        borderLeftWidth: isSidebar ? "2px" : styles.expItem.borderLeftWidth
                                    }}>
                                        <div style={{
                                            ...styles.expTitle,
                                            fontSize: isSidebar ? "calc(13px * var(--theme-font-scale, 1))" : styles.expTitle.fontSize
                                        }}>
                                            <RichTextSpellCheck html={item.organization || item.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, item.organization ? 'organization' : 'name')} />
                                        </div>
                                        {item.role && <div style={{ ...styles.expCompany, fontSize: isSidebar ? "11px" : styles.expCompany.fontSize }}>{item.role}</div>}
                                        {(!isSidebar || items.length < 5) && item.description && (
                                            <div className="resume-rich-text" style={{
                                                ...styles.expDesc,
                                                fontSize: isSidebar ? "calc(11.5px * var(--theme-font-scale, 1))" : styles.expDesc.fontSize
                                            }}>
                                                <SplittableRichText html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, 'description')} />
                                            </div>
                                        )}
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
            const details = [
                { label: 'Date of Birth', value: p.dob || p.dateOfBirth || p.birthDate },
                { label: 'Nationality', value: p.nationality },
                { label: 'Marital Status', value: p.maritalStatus || p.marital_status },
                { label: 'Gender', value: p.gender },
                { label: 'Religion', value: p.religion },
                { label: 'Visa Status', value: p.visaStatus || p.visa_status },
                { label: 'Passport', value: p.passport || p.passportNumber },
                { label: 'Place of Birth', value: p.placeOfBirth },
                { label: 'Driving License', value: p.drivingLicense },
                { label: 'Other', value: p.otherPersonal || p.otherInformation },
            ].filter(d => d.value);

            if (details.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');

            return (
                <SectionWrapper sectionId="personalDetails" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Personal Details">
                    <div>
                        <SectionTitle title="Personal Details" zoneId={zoneId} />
                        <div style={isSidebar ? {} : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
                            {details.map((d, i) => (
                                <div key={i} style={{ marginBottom: isSidebar ? "8px" : "0" }}>
                                    <div style={{ ...styles.eduDegree, fontSize: "calc(12px * var(--theme-font-scale, 1))" }}>{d.label}:</div>
                                    <div style={styles.eduSchool}>{d.value}</div>
                                </div>
                            ))}
                        </div>
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
                    <div>
                        <SectionTitle title="Additional Information" zoneId={zoneId} />
                        <div className="resume-rich-text" style={{
                            ...styles.profileText,
                            fontSize: isSidebar ? "calc(11.5px * var(--theme-font-scale, 1))" : styles.profileText.fontSize
                        }}>
                            <SplittableRichText html={html} range={renderSubItemRanges?.additionalInfo} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalInfo', 'additionalInfo', val)} />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        custom: ({ isContinued, subItemRanges: renderSubItemRanges, zoneId }) => {
            if (!data.customSection?.isVisible || !data.customSection?.content) return null;
            const content = data.customSection.content;
            if (!content || content.trim() === "" || content === "<p><br></p>") return null;
            const title = data.customSection.title || "Additional Information";
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="custom" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <div>
                        <SectionTitle title={title} zoneId={zoneId} />
                        <div className="resume-rich-text" style={{
                            ...styles.profileText,
                            fontSize: isSidebar ? "calc(11.5px * var(--theme-font-scale, 1))" : styles.profileText.fontSize
                        }}>
                            <SplittableRichText html={content} range={renderSubItemRanges?.custom} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('customSection', 'content', val)} />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
    };

    // --- HEADER COMPONENT ---
    const Header = () => (
        <SectionWrapper sectionId="personal" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Header">
            <div style={styles.header}>
                {/* Decorative circles */}
                <div style={styles.decorCircleLargeTopLeft} />
                <div style={styles.decorCircleSmallTopLeft} />
                <div style={styles.decorCircleTopRight} />
                <div style={styles.decorCircleSmallTopRight} />

                {/* Photo */}
                <div style={styles.photoContainer}>
                    {personal?.photo ? (
                        <img src={personal.photo} style={styles.photo} alt="profile" />
                    ) : (
                        <div style={styles.photoPlaceholder}>
                            <span style={{ fontSize: "40px", color: "#aaa" }}>👤</span>
                        </div>
                    )}
                </div>

                {/* Name + Profession */}
                <div style={styles.headerTextArea}>
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

    // --- RENDER ZONE HELPER ---
    const renderZone = (id, items, columnStyle) => (
        <DroppableZone id={id} style={{ flex: 1, ...columnStyle }}>
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

    // --- MEASURER (for pagination) ---
    const Measurer = () => (
        <div className="resume-measurer" style={{ position: "absolute", top: -10000, left: -10000, width: "210mm", visibility: "hidden" }}>
            <div className="page-height-marker" style={{ height: "297mm", width: "1px", position: "absolute", left: 0, top: 0 }}></div>
            <div style={{ ...styles.page, height: "auto" }}>
                <Header />
                <div style={styles.layoutBody}>
                    <div data-column-id="sidebar" style={styles.sidebarColumn}>
                        {activeSidebarSections.map(sid => (
                            <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="sidebar" />
                        ))}
                    </div>
                    <div data-column-id="main" style={styles.mainColumn}>
                        {activeMainSections.map(sid => (
                            <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="main" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // --- RENDER ---
    return (
        <div ref={containerRef} className="amber-circles-root">
            <Measurer />
            <DndContext {...dndContextProps}>
                <SortableContext items={[...activeSidebarSections, ...activeMainSections]} strategy={verticalListSortingStrategy}>
                    {showPageBreaks && pages ? (
                        pages.map((page, i) => (
                            <div key={i} style={styles.page}>
                                {i === 0 && <Header />}
                                <div style={{ ...styles.layoutBody, flex: 1 }}>
                                    <div style={styles.sidebarColumn}>
                                        {renderZone(`sidebar-p${i}`, page.sidebar, { display: "flex", flexDirection: "column", gap: "calc(22px * var(--theme-section-margin, 1))" })}
                                    </div>
                                    <div style={styles.mainColumn}>
                                        {renderZone(`main-p${i}`, page.main, { display: "flex", flexDirection: "column", gap: "calc(22px * var(--theme-section-margin, 1))" })}
                                    </div>
                                </div>
                                {/* Bottom decorative circle on last page or every page */}
                                <div style={styles.decorCircleBottomRight} />
                                <div style={{ position: "absolute", bottom: "15px", right: "65px", fontSize: "10px", opacity: 0.4 }}>Page {i + 1}</div>
                            </div>
                        ))
                    ) : (
                        <div style={{ ...styles.page, height: "auto", minHeight: "100%", position: "relative" }}>
                            <Header />
                            <div style={styles.layoutBody}>
                                <div style={styles.sidebarColumn}>
                                    {renderZone('sidebar', activeSidebarSections, { display: "flex", flexDirection: "column", gap: "calc(22px * var(--theme-section-margin, 1))" })}
                                </div>
                                <div style={styles.mainColumn}>
                                    {renderZone('main', activeMainSections, { display: "flex", flexDirection: "column", gap: "calc(22px * var(--theme-section-margin, 1))" })}
                                </div>
                            </div>
                            <div style={styles.decorCircleBottomRight} />
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

export default AmberCircles;