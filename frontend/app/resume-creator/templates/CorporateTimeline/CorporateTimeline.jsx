import React, { useRef } from "react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SectionWrapper from "../../components/SectionWrapper";
import { useResumeDragAndDrop, DroppableZone, StableResumeDragOverlay } from "../../hooks/useResumeDragAndDrop";
import DraggableSection from "../../components/dnd/DraggableSection";
import SectionRenderer from "../common/SectionRenderer";
import { useSectionContext } from "../common/SectionContext";
import { useAutoPagination } from "../../hooks/useAutoPagination";
import { SpellCheckText, SplittableRichText, RichTextSpellCheck, ResumeLink } from "../common/BaseComponents";
import { getCompleteLayout, getSavedLayout } from "../common/TemplateUtils";
import { Globe, Mail, Phone, MapPin, Linkedin, Github } from "lucide-react";

/**
 * CorporateTimeline Template
 * A corporate single-column template with a blue accent bar header,
 * profile photo support, and a vertical timeline for work experience.
 * Inspired by executive marketing leader resume designs.
 */
const CorporateTimeline = ({
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

    const templateId = 'corporate-timeline';
    const initialLayout = getSavedLayout(data, templateId, {
        main: ['summary', 'skills', 'strengths', 'additionalSkills', 'experience', 'education', 'keyAchievements', 'accomplishments', 'projects', 'certifications', 'languages', 'software', 'interests', 'affiliations', 'websites', 'personalDetails', 'additionalInfo', 'custom']
    });

    const completeLayout = getCompleteLayout(data, initialLayout, 'main');
    const activeSections = completeLayout.main || [];

    const { dndContextProps, activeId } = useResumeDragAndDrop({
        data, onReorder, scale,
        containers: { main: activeSections }
    });

    const pages = useAutoPagination({
        columns: { main: activeSections },
        data, enabled: showPageBreaks, containerRef, scale
    });

    // --- COLORS ---
    const primaryBlue = "var(--theme-color, #0047AB)";
    const darkText = "#1a1a2e";
    const lightText = "#475569";
    const borderLight = "#d1d5db";

    const styles = {
        page: {
            width: "210mm", height: "297mm", background: "white",
            paddingTop: "var(--theme-page-margin, 40px)",
            paddingLeft: "var(--theme-page-margin, 40px)",
            paddingRight: "var(--theme-page-margin, 40px)",
            paddingBottom: "var(--theme-page-margin, 40px)",
            boxSizing: "border-box", position: "relative",
            margin: "0 auto 30px auto", color: darkText,
            fontFamily: "var(--theme-font, 'Inter', sans-serif)",
            letterSpacing: "var(--theme-letter-spacing, 0px)",
            overflow: "hidden", display: "flex", flexDirection: "column",
        },
        headerWrap: {
            display: "flex", alignItems: "flex-start", gap: "20px",
            marginBottom: "calc(20px * var(--theme-section-margin, 1))",
        },
        accentBar: {
            width: "5px", minHeight: "80px", background: primaryBlue,
            borderRadius: "3px", flexShrink: 0, alignSelf: "stretch",
        },
        headerText: { flex: 1 },
        name: {
            fontSize: "calc(30px * var(--theme-font-scale, 1))",
            fontWeight: "800", color: darkText, lineHeight: "1.15", marginBottom: "4px",
        },
        profession: {
            fontSize: "calc(16px * var(--theme-font-scale, 1))",
            fontWeight: "700", color: primaryBlue, marginBottom: "4px", lineHeight: "1.3",
        },
        subtitle: {
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            color: lightText, marginBottom: "10px", lineHeight: "1.4",
        },
        contactBar: {
            display: "flex", flexWrap: "wrap", alignItems: "center",
            gap: "6px", fontSize: "calc(12px * var(--theme-font-scale, 1))", color: lightText,
        },
        contactItem: { display: "flex", alignItems: "center", gap: "4px" },
        photo: {
            width: "100px", height: "110px", borderRadius: "6px",
            objectFit: "cover", flexShrink: 0, border: `2px solid ${borderLight}`,
        },
        sectionHeading: {
            display: "flex", alignItems: "center", gap: "12px",
            marginBottom: "calc(12px * var(--theme-paragraph-margin, 1))",
        },
        sectionHeadingLine: {
            flex: 1, height: "3.5px", background: primaryBlue,
        },
        sectionHeadingText: {
            fontSize: "calc(16px * var(--theme-font-scale, 1))",
            fontWeight: "800", color: "#0a1e3d",
            whiteSpace: "nowrap", lineHeight: "1.3",
        },
        sectionLabel: {
            fontSize: "calc(14px * var(--theme-font-scale, 1))",
            fontWeight: "800", color: primaryBlue, marginBottom: "6px",
        },

        contentWrapper: { marginBottom: "calc(24px * var(--theme-section-margin, 1))" },
        itemSpacing: { marginBottom: "calc(14px * var(--theme-paragraph-margin, 1))" },
        richText: {
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.55)", color: lightText,
        },
        infoLabel: { fontWeight: "700", color: darkText, marginRight: "6px" },
        bullet: { fontSize: "14px", marginRight: "8px", color: primaryBlue },
        // Timeline
        timelineWrap: { position: "relative", paddingLeft: "30px" },
        timelineLine: {
            position: "absolute", left: "14px", top: "12px", bottom: "12px",
            width: "2px", background: primaryBlue,
            WebkitPrintColorAdjust: "exact",
        },
        timelineDot: {
            position: "absolute",
            left: "-25px", // Center = 30 - 25 + 10 = 15. Spine at 14 (width 2) has center at 15. PERFECT.
            top: "3px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "white",
            border: `1.5px solid ${primaryBlue}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            boxSizing: "border-box",
            overflow: "visible",
            WebkitPrintColorAdjust: "exact",
        },
        timelineDotInner: {
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: primaryBlue,
            WebkitPrintColorAdjust: "exact",
        },
        timelineItem: { position: "relative", paddingLeft: "10px" },
        historyRow: {
            display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr",
            alignItems: "baseline", gap: "12px",
            marginBottom: "calc(6px * var(--theme-paragraph-margin, 1))",
        },
    };

    // --- HEADER ---
    const Header = () => (
        <SectionWrapper sectionId="personal" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Header">
            <div style={styles.headerWrap}>
                <div style={styles.accentBar} />
                <div style={styles.headerText}>
                    <h1 style={styles.name}>
                        <SpellCheckText text={personal?.name || "YOUR NAME"} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'name', val)} />
                    </h1>
                    {personal?.profession && (
                        <div style={styles.profession}>
                            <SpellCheckText text={personal.profession} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'profession', val)} />
                        </div>
                    )}
                    {(personal?.city || personal?.state || personal?.country || personal?.zipCode) && (
                        <div style={styles.subtitle}>
                            <SpellCheckText text={[personal.city, personal.state, personal.country, personal.zipCode].filter(Boolean).join(", ")} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'city', val)} />
                        </div>
                    )}
                    <div style={styles.contactBar}>
                        {personal?.linkedin && (
                            <div style={styles.contactItem}>
                                <Linkedin size={12} style={{ color: primaryBlue }} />
                                <ResumeLink href={personal.linkedin}>
                                    <SpellCheckText text={personal.linkedin} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'linkedin', val)} />
                                </ResumeLink>
                            </div>
                        )}
                        {personal?.email && (
                            <div style={styles.contactItem}>
                                <Mail size={12} style={{ color: primaryBlue }} />
                                <ResumeLink href={personal.email}>
                                    <SpellCheckText text={personal.email} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'email', val)} />
                                </ResumeLink>
                            </div>
                        )}
                        {personal?.phone && (
                            <div style={styles.contactItem}>
                                <Phone size={12} style={{ color: primaryBlue }} />
                                <ResumeLink href={personal.phone}>
                                    <SpellCheckText text={personal.phone} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'phone', val)} />
                                </ResumeLink>
                            </div>
                        )}
                        {personal?.github && (
                            <div style={styles.contactItem}>
                                <Github size={12} style={{ color: primaryBlue }} />
                                <ResumeLink href={personal.github}>
                                    <SpellCheckText text={personal.github} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'github', val)} />
                                </ResumeLink>
                            </div>
                        )}
                        {personal?.website && (
                            <div style={styles.contactItem}>
                                <Globe size={12} style={{ color: primaryBlue }} />
                                <ResumeLink href={personal.website}>
                                    <SpellCheckText text={personal.website} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'website', val)} />
                                </ResumeLink>
                            </div>
                        )}
                        {data.websites && data.websites.filter(site => site.addToHeader).map((site, i) => (
                            <div key={i} style={styles.contactItem}>
                                <Globe size={12} style={{ color: primaryBlue }} />
                                <ResumeLink href={site.url}>
                                    <SpellCheckText text={site.label || site.url} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('websites', i, val, 'url')} />
                                </ResumeLink>
                            </div>
                        ))}
                    </div>
                </div>
                {personal?.photo && (
                    <img src={personal.photo} alt="Profile" style={styles.photo} />
                )}
            </div>
        </SectionWrapper>
    );

    const SectionHeader = ({ title }) => {
        const { isContinued } = useSectionContext();
        return (
            <div style={styles.sectionHeading}>
                <div style={{ ...styles.sectionHeadingLine, flex: 1 }} />
                <div style={styles.sectionHeadingText}>
                    {isContinued ? `${title} (cont.)` : title}
                </div>
                <div style={{ ...styles.sectionHeadingLine, flex: 3 }} />
            </div>
        );
    };

    // --- CUSTOM RENDERERS ---
    const customRenderers = {
        summary: ({ isContinued, subItemRanges }) => (
            <SectionWrapper sectionId="summary" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Professional Summary">
                <div style={styles.contentWrapper}>
                    <SectionHeader title="Professional Summary" />
                    <div className="resume-rich-text" style={styles.richText}>
                        <SplittableRichText html={data.summary} range={subItemRanges?.summary} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('summary', 'summary', val)} />
                    </div>
                </div>
            </SectionWrapper>
        ),
        skills: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.skills?.[idx]).filter(Boolean) : (data.skills || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Skills">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Key Skills" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 30px" }}>
                            {items.map((skill, i) => {
                                const originalIndex = itemIndices ? itemIndices[i] : i;
                                const name = typeof skill === 'object' ? skill.name : skill;
                                const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                return (
                                    <div key={originalIndex} data-item-index={originalIndex} style={{ display: "flex", alignItems: "flex-start", fontSize: "calc(13px * var(--theme-font-scale, 1))", marginBottom: "calc(3px * var(--theme-paragraph-margin, 1))" }}>
                                        <span style={styles.bullet}>•</span>
                                        <RichTextSpellCheck html={name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('skills', originalIndex, val, 'name')} />
                                        {lvl > 0 && <span style={{ display: "flex", gap: "3px", marginLeft: "auto", paddingLeft: "8px" }}>{[...Array(5)].map((_, di) => <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? primaryBlue : "rgba(120,120,120,0.15)" }} />)}</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        experience: ({ itemIndices, subItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.experience?.[idx]).filter(Boolean) : (data.experience || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="experience" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Work Experience">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Work Experience Summary" />
                        <div style={styles.timelineWrap}>
                            <div style={styles.timelineLine} />
                            {items.map((exp, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const startDate = [exp.startMonth, exp.startYear].filter(Boolean).join(" ");
                                const endDate = exp.isCurrent ? "Present" : [exp.endMonth, exp.endYear].filter(Boolean).join(" ");
                                const dates = startDate && endDate ? `${startDate} – ${endDate}` : (startDate || endDate || "");
                                const locationStr = [exp.location, exp.isRemote ? "(Remote)" : null].filter(Boolean).join(" ");
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{ ...styles.timelineItem, ...styles.itemSpacing }}>
                                        <div style={styles.timelineDot}>
                                            <div style={styles.timelineDotInner} />
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.5fr 0.7fr", gap: "8px", alignItems: "baseline", marginBottom: "calc(4px * var(--theme-paragraph-margin, 1))" }}>
                                            <div style={{ fontWeight: "700", color: primaryBlue, fontSize: "calc(13px * var(--theme-font-scale, 1))" }}>
                                                <RichTextSpellCheck html={exp.company || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'company')} />
                                            </div>
                                            <div style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: darkText }}>
                                                <RichTextSpellCheck html={exp.title || exp.role || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'title')} />
                                            </div>
                                            <div style={{ textAlign: "right", fontSize: "calc(12px * var(--theme-font-scale, 1))", color: lightText }}>
                                                <RichTextSpellCheck html={dates} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'year')} />
                                            </div>
                                        </div>
                                        {locationStr && (
                                            <div style={{ ...styles.richText, marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                                                <MapPin size={11} style={{ color: primaryBlue, flexShrink: 0 }} />
                                                <span>{locationStr}</span>
                                            </div>
                                        )}
                                        {exp.description && (
                                            <div className="resume-rich-text" style={styles.richText}>
                                                <SplittableRichText html={exp.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'description')} />
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
        education: ({ itemIndices, subItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.education?.[idx]).filter(Boolean) : (data.education || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Education" />
                        {items.map((edu, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const startDate = [edu.startMonth, edu.startYear].filter(Boolean).join(" ");
                            const endDate = [edu.endMonth, edu.endYear].filter(Boolean).join(" ");
                            const dates = startDate && endDate ? `${startDate} – ${endDate}` : (startDate || endDate || "");
                            const degreeStr = [edu.degree, edu.field].filter(Boolean).join(" — ");
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.itemSpacing}>
                                    <div style={styles.historyRow}>
                                        <div style={{ fontWeight: "700", fontSize: "calc(13.5px * var(--theme-font-scale, 1))" }}>
                                            <RichTextSpellCheck html={degreeStr || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'degree')} />
                                        </div>
                                        <div style={{ textAlign: "center", fontSize: "calc(13px * var(--theme-font-scale, 1))" }}>
                                            <RichTextSpellCheck html={`${edu.school || ""}${edu.city ? `, ${edu.city}` : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'school')} />
                                        </div>
                                        <div style={{ textAlign: "right", fontSize: "calc(13px * var(--theme-font-scale, 1))" }}>
                                            <RichTextSpellCheck html={dates} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'year')} />
                                        </div>
                                    </div>
                                    {edu.grade && (
                                        <div style={{ ...styles.richText, marginBottom: "4px" }}>
                                            <span style={styles.infoLabel}>GPA / Grade:</span>
                                            <SpellCheckText text={edu.grade} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'grade')} />
                                        </div>
                                    )}
                                    {edu.description && (
                                        <div className="resume-rich-text" style={styles.richText}>
                                            <SplittableRichText html={edu.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'description')} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },
        keyAchievements: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.keyAchievements?.[idx]).filter(Boolean) : (data.keyAchievements || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="keyAchievements" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Achievements">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Key Achievements" />
                        {items.map((item, i) => {
                            const originalIndex = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIndex} style={{ ...styles.itemSpacing, display: "flex", alignItems: "flex-start" }}>
                                    <span style={styles.bullet}>•</span>
                                    <div>
                                        {item.name && <div style={{ fontWeight: "700", color: darkText, marginBottom: "2px" }}><RichTextSpellCheck html={item.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIndex, val, 'name')} /></div>}
                                        {item.description && <RichTextSpellCheck html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIndex, val, 'description')} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },
        projects: ({ itemIndices, subItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.projects?.[idx]).filter(Boolean) : (data.projects || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Key Projects" />
                        {items.map((proj, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dates = proj.year || (proj.startYear && `${proj.startYear} - ${proj.isCurrent ? 'Present' : (proj.endYear || '')}`);
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.itemSpacing}>
                                    <div style={styles.historyRow}>
                                        <div style={{ fontWeight: "700", display: "flex", alignItems: "center" }}><span style={styles.bullet}>•</span><RichTextSpellCheck html={proj.title || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'title')} /></div>
                                        <div style={{ textAlign: "center" }}>
                                            {proj.link ? (
                                                <ResumeLink href={proj.link}>
                                                    <RichTextSpellCheck html={proj.link} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'link')} />
                                                </ResumeLink>
                                            ) : ""}
                                        </div>
                                        <div style={{ textAlign: "right" }}><RichTextSpellCheck html={dates || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'year')} /></div>
                                    </div>
                                    {proj.technologies && proj.technologies.length > 0 && (<div style={{ ...styles.richText, marginLeft: "18px", marginBottom: "4px" }}><span style={styles.infoLabel}>Tech:</span>{proj.technologies.join(" · ")}</div>)}
                                    {proj.description && (<div className="resume-rich-text" style={{ ...styles.richText, marginLeft: "18px" }}><SplittableRichText html={proj.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'description')} /></div>)}
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },
        languages: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.languages?.[idx]).filter(Boolean) : (data.languages || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="languages" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Languages">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Languages" />
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                            {items.map((lang, i) => { const originalIdx = itemIndices ? itemIndices[i] : i; const levelLabels = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native']; const levelDisplay = typeof lang.level === 'number' ? (levelLabels[lang.level] || '') : (lang.level || ''); return (<div key={i} data-item-index={originalIdx} style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))" }}><span style={styles.infoLabel}><RichTextSpellCheck html={lang.name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('languages', originalIdx, val, 'name')} />:</span> {levelDisplay}</div>); })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        certifications: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.certifications?.[idx]).filter(Boolean) : (data.certifications || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Certifications" />
                        {items.map((cert, i) => { const originalIdx = itemIndices ? itemIndices[i] : i; return (<div key={i} data-item-index={originalIdx} style={styles.itemSpacing}><div style={styles.historyRow}><div style={{ fontWeight: "700", display: "flex", alignItems: "center" }}><span style={styles.bullet}>•</span><RichTextSpellCheck html={cert.name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('certifications', originalIdx, val, 'name')} /></div><div style={{ textAlign: "center" }}><RichTextSpellCheck html={cert.issuer || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('certifications', originalIdx, val, 'issuer')} /></div><div style={{ textAlign: "right" }}><RichTextSpellCheck html={cert.date || cert.year || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('certifications', originalIdx, val, 'date')} /></div></div>{cert.description && (<div className="resume-rich-text" style={{ ...styles.richText, marginLeft: "18px" }}><RichTextSpellCheck html={cert.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('certifications', originalIdx, val, 'description')} /></div>)}</div>); })}
                    </div>
                </SectionWrapper>
            );
        },
        // Removed awards and volunteering renderers to match schema
        interests: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.interests?.[idx]).filter(Boolean) : (data.interests || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="interests" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Interests">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Interests" />
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {items.map((item, i) => { const originalIndex = itemIndices ? itemIndices[i] : i; return (<div key={i} data-item-index={originalIndex} style={{ display: "flex", alignItems: "center", fontSize: "calc(13px * var(--theme-font-scale, 1))" }}><span style={styles.bullet}>•</span><RichTextSpellCheck html={typeof item === 'object' ? item.name : item} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('interests', originalIndex, val, 'name')} />{i < items.length - 1 && <span style={{ marginLeft: "8px", color: "#cbd5e1" }}>|</span>}</div>); })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        personalDetails: () => {
            const { personal: p = {} } = data;
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
                { label: 'City', value: p.city },
                { label: 'State', value: p.state },
                { label: 'Country', value: p.country },
                { label: 'Zip Code', value: p.zipCode },
                { label: 'Other', value: p.otherPersonal || p.otherInformation }
            ].filter(d => d.value);
            if (!details.length) return null;
            return (
                <SectionWrapper sectionId="personalDetails" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Personal Details">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Personal Information" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                            {details.map((d, i) => (<div key={i} style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))" }}><span style={styles.infoLabel}>{d.label}:</span><SpellCheckText text={d.value} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', d.label.toLowerCase().replace(/ /g, ''), val)} /></div>))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        software: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.software?.[idx]).filter(Boolean) : (data.software || []);
            if (items.length === 0) return null;
            const ratingLabels = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
            return (
                <SectionWrapper sectionId="software" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Software">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Software Proficiency" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px" }}>
                            {items.map((item, i) => { const originalIndex = itemIndices ? itemIndices[i] : i; return (<div key={i} data-item-index={originalIndex} style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><div style={{ display: "flex", alignItems: "center" }}><span style={styles.bullet}>•</span><RichTextSpellCheck html={item.name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('software', originalIndex, val, 'name')} /></div>{item.rating > 0 && <span style={{ color: lightText, fontSize: "calc(11px * var(--theme-font-scale, 1))", fontStyle: "italic" }}>{ratingLabels[item.rating] || ""}</span>}</div>{item.description && (<div className="resume-rich-text" style={{ ...styles.richText, marginLeft: "18px", fontSize: "calc(12px * var(--theme-font-scale, 1))" }}><RichTextSpellCheck html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('software', originalIndex, val, 'description')} /></div>)}</div>); })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        // Removed publications and references renderers to match schema
        affiliations: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.affiliations?.[idx]).filter(Boolean) : (data.affiliations || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="affiliations" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Affiliations">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Professional Affiliations" />
                        {items.map((aff, i) => { const originalIdx = itemIndices ? itemIndices[i] : i; return (<div key={i} data-item-index={originalIdx} style={styles.itemSpacing}><div style={{ display: "flex", alignItems: "flex-start" }}><span style={styles.bullet}>•</span><div><div style={{ fontWeight: "700", color: darkText }}><RichTextSpellCheck html={aff.name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, 'name')} /></div>{aff.description && (<div className="resume-rich-text" style={styles.richText}><RichTextSpellCheck html={aff.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, 'description')} /></div>)}</div></div></div>); })}
                    </div>
                </SectionWrapper>
            );
        },
        strengths: ({ itemIndices }) => {
            const strengths = itemIndices ? itemIndices.map(idx => data.strengths?.[idx]).filter(Boolean) : (data.strengths || []);
            if (strengths.length === 0) return null;
            return (
                <SectionWrapper sectionId="strengths" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Strengths">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Key Strengths" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px" }}>{strengths.map((s, i) => { const originalIndex = itemIndices ? itemIndices[i] : i; return (<div key={i} data-item-index={originalIndex} style={{ display: "flex", alignItems: "flex-start", fontSize: "calc(13px * var(--theme-font-scale, 1))" }}><span style={styles.bullet}>•</span><RichTextSpellCheck html={typeof s === 'object' ? s.name : s} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('strengths', originalIndex, val, 'name')} /></div>); })}</div>
                    </div>
                </SectionWrapper>
            );
        },
        additionalSkills: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.additionalSkills?.[idx]).filter(Boolean) : (data.additionalSkills || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="additionalSkills" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Skills">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Additional Skills" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px" }}>{items.map((s, i) => { const originalIndex = itemIndices ? itemIndices[i] : i; return (<div key={i} data-item-index={originalIndex} style={{ display: "flex", alignItems: "flex-start", fontSize: "calc(13px * var(--theme-font-scale, 1))" }}><span style={styles.bullet}>•</span><RichTextSpellCheck html={typeof s === 'object' ? s.name : s} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalSkills', originalIndex, val, 'name')} /></div>); })}</div>
                    </div>
                </SectionWrapper>
            );
        },
        accomplishments: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.accomplishments?.[idx]).filter(Boolean) : (data.accomplishments || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="accomplishments" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Accomplishments">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Accomplishments" />
                        {items.map((item, i) => { const originalIndex = itemIndices ? itemIndices[i] : i; return (<div key={i} data-item-index={originalIndex} style={{ ...styles.itemSpacing, display: "flex", alignItems: "flex-start" }}><span style={styles.bullet}>•</span><div>{item.name && (<div style={{ fontWeight: "700", color: darkText, marginBottom: "2px" }}><RichTextSpellCheck html={item.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('accomplishments', originalIndex, val, 'name')} /></div>)}{item.description && (<div className="resume-rich-text" style={styles.richText}><RichTextSpellCheck html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('accomplishments', originalIndex, val, 'description')} /></div>)}</div></div>); })}
                    </div>
                </SectionWrapper>
            );
        },
        additionalInfo: ({ subItemRanges }) => {
            if (!data.additionalInfo) return null;
            return (
                <SectionWrapper sectionId="additionalInfo" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Information">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Additional Information" />
                        <div className="resume-rich-text" style={styles.richText}><SplittableRichText html={data.additionalInfo} range={subItemRanges?.additionalInfo} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalInfo', 'additionalInfo', val)} /></div>
                    </div>
                </SectionWrapper>
            );
        },
        websites: ({ itemIndices }) => {
            const allWebsites = data.websites || [];
            const items = itemIndices
                ? itemIndices.map(i => ({ item: allWebsites[i], originalIdx: i })).filter(e => e.item)
                : allWebsites.map((item, i) => ({ item, originalIdx: i }));
            if (!items.length) return null;
            const contactItems = [];
            if (personal?.city || personal?.country) contactItems.push({ value: [personal.city, personal.state, personal.country].filter(Boolean).join(", "), isLink: false });
            if (personal?.phone) contactItems.push({ value: personal.phone, isLink: true });
            if (personal?.email) contactItems.push({ value: personal.email, isLink: true });
            if (personal?.linkedin) contactItems.push({ value: personal.linkedin, isLink: true });
            if (personal?.github) contactItems.push({ value: personal.github, isLink: true });
            if (personal?.website) contactItems.push({ value: personal.website, isLink: true });

            const portfolioItems = items.filter(({ item: w }) => !w.addToHeader);
            return (
                <>
                    {contactItems.length > 0 && (
                        <SectionWrapper sectionId="websites" navigationId="websites" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Contact">
                            <div style={styles.contentWrapper}><SectionHeader title="Contact" />
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 22px", fontSize: "calc(13px * var(--theme-font-scale, 1))" }}>
                                    {contactItems.map((c, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                            <span style={styles.bullet}>•</span>
                                            {c.isLink ? (
                                                <ResumeLink href={c.value}>
                                                    <span>{c.value}</span>
                                                </ResumeLink>
                                            ) : (
                                                <span>{c.value}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SectionWrapper>
                    )}
                    {portfolioItems.length > 0 && (
                        <SectionWrapper sectionId="portfolios" navigationId="websites" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Portfolios">
                            <div style={styles.contentWrapper}><SectionHeader title="Websites & Portfolios" />
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 22px", fontSize: "calc(13px * var(--theme-font-scale, 1))" }}>
                                    {portfolioItems.map(({ item: w, originalIdx }) => (
                                        <div key={originalIdx} data-item-index={originalIdx} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                            <Globe size={12} style={{ color: primaryBlue, flexShrink: 0 }} />
                                            <ResumeLink href={w.url}>
                                                <span style={{ fontWeight: "600" }}>{w.label || w.url}</span>
                                            </ResumeLink>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SectionWrapper>
                    )}
                </>
            );
        },
        custom: ({ subItemRanges }) => {
            if (!data.customSection?.isVisible || !data.customSection?.content) return null;
            const title = data.customSection.title || "Additional Information";
            return (
                <SectionWrapper sectionId="custom" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <div style={styles.contentWrapper}>
                        <SectionHeader title={title} />
                        <div className="resume-rich-text" style={styles.richText}><SplittableRichText html={data.customSection.content} range={subItemRanges?.custom} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('customSection', 'content', val)} /></div>
                    </div>
                </SectionWrapper>
            );
        }
    };

    // --- RENDER ZONE ---
    const renderZone = (id, items, columnStyle = {}) => (
        <DroppableZone id={id} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "calc(20px * var(--theme-section-margin, 1))", minHeight: '100px', ...columnStyle }}>
            {items.map((sid, idx) => {
                const isContinued = typeof sid === 'object' && sid.isContinued;
                const sectionId = typeof sid === 'string' ? sid : sid.id;
                const dragId = isContinued ? `${id}-cont-${sectionId}-${idx}` : sectionId;
                return (
                    <DraggableSection key={dragId} id={dragId} isEnabled={canReorder && !isContinued}>
                        <SectionRenderer sectionId={sectionId} data={data} onSectionClick={onSectionClick} isContinued={isContinued} itemIndices={typeof sid === 'object' ? sid.itemIndices : undefined} subItemRanges={typeof sid === 'object' ? sid.subItemRanges : undefined} customRenderers={customRenderers} zoneId={id} />
                    </DraggableSection>
                );
            })}
        </DroppableZone>
    );

    const Measurer = () => (
        <div className="resume-measurer" style={{ position: "absolute", top: -10000, left: -10000, width: "210mm", visibility: "hidden" }}>
            <div className="page-height-marker" style={{ height: "297mm", width: "1px", position: "absolute", left: 0, top: 0 }} />
            <div style={{ ...styles.page, height: "auto" }}>
                <Header />
                <div data-column-id="main" style={{ display: "flex", flexDirection: "column", gap: "calc(20px * var(--theme-section-margin, 1))" }}>
                    {activeSections.map(sid => (
                        <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="main" />
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="corporate-timeline-root">
            <Measurer />
            <DndContext {...dndContextProps}>
                <SortableContext items={activeSections} strategy={verticalListSortingStrategy}>
                    {showPageBreaks && pages ? (
                        pages.map((page, i) => (
                            <div key={i} style={styles.page}>
                                {i === 0 && <Header />}
                                {renderZone(`main-p${i}`, page.main, { flex: 1 })}
                                <div style={{ position: "absolute", bottom: "15px", right: "35px", fontSize: "10px", opacity: 0.5 }}>Page {i + 1}</div>
                            </div>
                        ))
                    ) : (
                        <div style={{ ...styles.page, height: "auto", minHeight: "100%" }}>
                            <Header />
                            {renderZone('main', activeSections, { flex: 1 })}
                        </div>
                    )}
                </SortableContext>
                <StableResumeDragOverlay activeId={activeId} scale={scale} renderSection={(id) => (
                    <div className="dragging-preview" style={{ background: "white", padding: "10px", border: "1px solid #e2e8f0" }}>
                        <SectionRenderer sectionId={id} data={data} customRenderers={customRenderers} />
                    </div>
                )} />
            </DndContext>
        </div>
    );
};

export default CorporateTimeline;
