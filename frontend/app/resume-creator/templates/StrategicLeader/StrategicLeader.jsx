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
import { Globe, Mail, Phone, MapPin, Linkedin, Github, Award, BookOpen, Users, Briefcase, Info, Code } from "lucide-react";

/**
 * StrategicLeader Template
 * A high-end executive template with a centered header, 
 * clean single-column layout, and "table-style" work and education sections.
 * Inspired by professional C-level resumes.
 */
const StrategicLeader = ({
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

    // --- 1. DATA PREP ---
    if (!data) return null;
    const { personal } = data;
    const isInteractive = !!onSectionClick && !isSpellCheckActive;
    const canReorder = !!onReorder && !isSpellCheckActive;

    // --- 2. DYNAMIC LAYOUT ---
    const templateId = 'strategic-leader';
    const initialLayout = getSavedLayout(data, templateId, {
        main: ['summary', 'skills', 'strengths', 'additionalSkills', 'experience', 'education', 'keyAchievements', 'accomplishments', 'projects', 'certifications', 'languages', 'software', 'interests', 'personalDetails', 'additionalInfo', 'custom']
    });

    const completeLayout = getCompleteLayout(data, initialLayout, 'main');
    const activeSections = completeLayout.main || [];

    // --- 3. D&D HOOK ---
    const { dndContextProps, activeId } = useResumeDragAndDrop({
        data,
        onReorder,
        scale,
        containers: { main: activeSections }
    });

    // --- 4. PAGINATION HOOK ---
    const pages = useAutoPagination({
        columns: { main: activeSections },
        data,
        enabled: showPageBreaks,
        containerRef,
        scale
    });

    // --- 5. STYLES ---
    const themeColor = "var(--theme-color, #1e293b)";
    const lightText = "#475569";
    const darkText = themeColor; // Use theme color for "dark" executive elements
    const accentColor = "var(--theme-color, #1e293b)";

    const styles = {
        page: {
            width: "210mm",
            height: "297mm",
            background: "white",
            padding: "var(--theme-page-margin, 40px) var(--theme-page-margin, 40px) var(--theme-page-margin, 40px) var(--theme-page-margin, 40px)",
            boxSizing: "border-box",
            position: "relative",
            margin: "0 auto 30px auto",
            color: darkText,
            fontFamily: "var(--theme-font, 'Inter', sans-serif)",
            letterSpacing: "var(--theme-letter-spacing, 0px)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
        },
        headerArea: {
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "calc(25px * var(--theme-section-margin, 1))",
        },
        photo: {
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "15px",
            border: `2.5px solid ${themeColor}`,
            padding: "2px",
        },
        name: {
            fontSize: "calc(32px * var(--theme-font-scale, 1))",
            fontWeight: "800",
            color: darkText,
            marginBottom: "8px",
            lineHeight: "1.1",
        },
        profession: {
            fontSize: "calc(18px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: darkText,
            marginBottom: "12px",
        },
        contactBar: {
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            color: lightText,
        },
        contactItem: {
            display: "flex",
            alignItems: "center",
        },
        pipe: {
            margin: "0 4px",
            color: "#cbd5e1",
            fontWeight: "300"
        },
        sectionLabel: {
            fontSize: "calc(16px * var(--theme-font-scale, 1))",
            fontWeight: "800",
            color: darkText,
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
        },
        sectionDivider: {
            width: "100%",
            height: "1.5px",
            backgroundColor: "#cbd5e1",
            marginTop: "8px",
            marginBottom: "calc(15px * var(--theme-paragraph-margin, 1))"
        },
        contentWrapper: {
            // marginBottom: 0 — spacing handled by DroppableZone/Measurer gap
        },
        itemSpacing: {
            marginBottom: "calc(15px * var(--theme-paragraph-margin, 1))"
        },
        historyRow: {
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 0.8fr",
            alignItems: "baseline",
            marginBottom: "calc(8px * var(--theme-paragraph-margin, 1))",
            gap: "15px"
        },
        bullet: {
            fontSize: "14px",
            marginRight: "8px",
            color: accentColor
        },
        richText: {
            fontSize: "calc(13.5px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.6)",
            color: lightText
        },
        infoLabel: {
            fontWeight: "700",
            color: darkText,
            marginRight: "8px"
        }
    };

    // --- RENDERERS ---

    const Header = () => (
        <SectionWrapper sectionId="personal" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Header">
            <div style={styles.headerArea}>
                {personal?.photo && (
                    <img src={personal.photo} alt="Profile" style={styles.photo} />
                )}
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
                <div style={styles.contactBar}>
                    {[personal?.city, personal?.state, personal?.country, personal?.zipCode].filter(Boolean).join(", ") && (
                        <div style={styles.contactItem}>
                            <MapPin size={12} style={{ marginRight: "4px", color: accentColor }} />
                            <SpellCheckText text={[personal.city, personal.state, personal.country, personal.zipCode].filter(Boolean).join(", ")} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'city', val)} />
                        </div>
                    )}
                    {personal?.phone && (
                        <>
                            <span style={styles.pipe}>|</span>
                            <div style={styles.contactItem}>
                                <Phone size={12} style={{ marginRight: "4px", color: accentColor }} />
                                <ResumeLink href={personal.phone}>
                                    <SpellCheckText text={personal.phone} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'phone', val)} />
                                </ResumeLink>
                            </div>
                        </>
                    )}
                    {personal?.email && (
                        <>
                            <span style={styles.pipe}>|</span>
                            <div style={styles.contactItem}>
                                <Mail size={12} style={{ marginRight: "4px", color: accentColor }} />
                                <ResumeLink href={personal.email}>
                                    <SpellCheckText text={personal.email} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'email', val)} />
                                </ResumeLink>
                            </div>
                        </>
                    )}
                    {personal?.linkedin && (
                        <>
                            <span style={styles.pipe}>|</span>
                            <div style={styles.contactItem}>
                                <Linkedin size={12} style={{ marginRight: "4px", color: accentColor }} />
                                <ResumeLink href={personal.linkedin}>
                                    <SpellCheckText text={personal.linkedin} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'linkedin', val)} />
                                </ResumeLink>
                            </div>
                        </>
                    )}
                    {personal?.github && (
                        <>
                            <span style={styles.pipe}>|</span>
                            <div style={styles.contactItem}>
                                <Github size={12} style={{ marginRight: "4px", color: accentColor }} />
                                <ResumeLink href={personal.github}>
                                    <SpellCheckText text={personal.github} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'github', val)} />
                                </ResumeLink>
                            </div>
                        </>
                    )}
                    {data.websites && data.websites.filter(w => !w.addToHeader).map((site, i) => {
                        const Icon = site.label?.toLowerCase().includes('github') ? Github : site.label?.toLowerCase().includes('linkedin') ? Linkedin : Globe;
                        return (
                            <React.Fragment key={i}>
                                <span style={styles.pipe}>|</span>
                                <div style={styles.contactItem}>
                                    <Icon size={12} style={{ marginRight: "4px", color: accentColor }} />
                                    <ResumeLink href={site.url}>
                                        <SpellCheckText text={site.label || site.url} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('websites', i, val, 'url')} />
                                    </ResumeLink>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
                <div style={{ ...styles.sectionDivider, marginTop: "15px", marginBottom: "0" }} />
            </div>
        </SectionWrapper>
    );

    const SectionHeader = ({ title, showLine = false }) => {
        const { isContinued } = useSectionContext();
        return (
            <div style={{ marginBottom: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                <div style={styles.sectionLabel}>
                    {isContinued ? `${title}: (cont.)` : `${title}:`}
                </div>
                {showLine && <div style={styles.sectionDivider} />}
            </div>
        );
    };

    const customRenderers = {
        summary: ({ isContinued, subItemRanges }) => (
            <SectionWrapper sectionId="summary" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Professional Summary">
                <div style={styles.contentWrapper}>
                    {!isContinued && <SectionHeader title="Executive Summary" />}
                    <div className="resume-rich-text" style={styles.richText}>
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
        skills: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.skills?.[idx]).filter(Boolean) : (data.skills || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Areas of Expertise">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Key Expertise" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 30px" }}>
                            {items.map((skill, i) => {
                                const originalIndex = itemIndices ? itemIndices[i] : i;
                                const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                return (
                                    <div key={originalIndex} data-item-index={originalIndex} style={{ display: "flex", alignItems: "flex-start", fontSize: "calc(13.5px * var(--theme-font-scale, 1))", marginBottom: "calc(4px * var(--theme-paragraph-margin, 1))" }}>
                                        <span style={styles.bullet}>•</span>
                                        <RichTextSpellCheck html={typeof skill === 'object' ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('skills', originalIndex, val, 'name')} />
                                        {lvl > 0 && <span style={{ display: "flex", gap: "3px", marginLeft: "auto", paddingLeft: "8px" }}>{[...Array(5)].map((_, di) => <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? "var(--theme-color, #1a365d)" : "rgba(120,120,120,0.15)" }} />)}</span>}
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
                <SectionWrapper sectionId="experience" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Experience">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Work Experience" showLine={true} />
                        {items.map((exp, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dates = exp.year || exp.date || (exp.startYear ? `${exp.startYear} - ${exp.isCurrent ? "Present" : (exp.endYear || "")}` : "");
                            const locationStr = [exp.location, exp.isRemote ? "(Remote)" : null].filter(Boolean).join(" ");
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.itemSpacing}>
                                    <div style={styles.historyRow}>
                                        <div style={{ fontWeight: "700", display: "flex", alignItems: "center" }}>
                                            <span style={styles.bullet}>•</span>
                                            <RichTextSpellCheck html={exp.company || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'company')} />
                                        </div>
                                        <div style={{ fontWeight: "700", textAlign: "center" }}>
                                            <RichTextSpellCheck html={exp.title || exp.role || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'title')} />
                                        </div>
                                        <div style={{ fontWeight: "700", textAlign: "right" }}>
                                            <RichTextSpellCheck html={dates} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'year')} />
                                        </div>
                                    </div>
                                    {locationStr && (
                                        <div style={{ ...styles.richText, marginLeft: "18px", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                                            <MapPin size={11} style={{ color: accentColor, flexShrink: 0 }} />
                                            <span>{locationStr}</span>
                                        </div>
                                    )}
                                    {exp.description && (
                                        <div className="resume-rich-text" style={{ ...styles.richText, marginLeft: "18px" }}>
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
        education: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.education?.[idx]).filter(Boolean) : (data.education || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Education" showLine={true} />
                        {items.map((edu, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dates = edu.year || edu.date || (edu.endYear ? `${edu.startYear ? edu.startYear + " - " : ""}${edu.endYear}` : "");
                            const degreeStr = [edu.degree, edu.field].filter(Boolean).join(" — ");
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.itemSpacing}>
                                    <div style={styles.historyRow}>
                                        <div style={{ fontSize: "calc(14px * var(--theme-font-scale, 1))", fontWeight: "700" }}>
                                            <RichTextSpellCheck html={degreeStr || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'degree')} />
                                        </div>
                                        <div style={{ textAlign: "center", fontSize: "calc(14px * var(--theme-font-scale, 1))" }}>
                                            <RichTextSpellCheck html={`${edu.institution || edu.school || ""}${edu.city ? `, ${edu.city}` : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'institution')} />
                                        </div>
                                        <div style={{ textAlign: "right", fontSize: "calc(14px * var(--theme-font-scale, 1))" }}>
                                            <RichTextSpellCheck html={dates} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'year')} />
                                        </div>
                                    </div>
                                    {edu.grade && (
                                        <div style={{ ...styles.richText, marginLeft: "18px", marginBottom: "4px" }}>
                                            <span style={styles.infoLabel}>GPA / Grade:</span>
                                            <SpellCheckText text={edu.grade} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'grade')} />
                                        </div>
                                    )}
                                    {edu.description && (
                                        <div className="resume-rich-text" style={{ ...styles.richText, marginLeft: "18px" }}>
                                            <RichTextSpellCheck html={edu.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'description')} />
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
                        <SectionHeader title="Career Highlights" showLine={true} />
                        <div style={styles.richText}>
                            {items.map((item, i) => {
                                const originalIndex = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIndex} style={{ marginBottom: "calc(12px * var(--theme-paragraph-margin, 1))", display: "flex", alignItems: "flex-start" }}>
                                        <span style={styles.bullet}>•</span>
                                        <div>
                                            {item.name && (
                                                <div style={{ fontWeight: "700", color: darkText, marginBottom: "2px" }}>
                                                    <RichTextSpellCheck html={item.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIndex, val, 'name')} />
                                                </div>
                                            )}
                                            {item.description && (
                                                <RichTextSpellCheck html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIndex, val, 'description')} />
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
        projects: ({ itemIndices, subItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.projects?.[idx]).filter(Boolean) : (data.projects || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Relevant Projects" showLine={true} />
                        {items.map((proj, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dates = proj.year || (proj.startYear && `${proj.startYear} - ${proj.isCurrent ? 'Present' : (proj.endYear || '')}`);
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.itemSpacing}>
                                    <div style={styles.historyRow}>
                                        <div style={{ fontWeight: "700", display: "flex", alignItems: "center" }}>
                                            <span style={styles.bullet}>•</span>
                                            <RichTextSpellCheck html={proj.title || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'title')} />
                                        </div>
                                        <div style={{ fontWeight: "700", textAlign: "center" }}>
                                            {proj.link ? <ResumeLink href={proj.link}><RichTextSpellCheck html={proj.link} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'link')} /></ResumeLink> : ""}
                                        </div>
                                        <div style={{ fontWeight: "700", textAlign: "right" }}>
                                            <RichTextSpellCheck html={dates || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'year')} />
                                        </div>
                                    </div>
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <div style={{ ...styles.richText, marginLeft: "18px", marginBottom: "4px" }}>
                                            <span style={styles.infoLabel}>Tech:</span>
                                            {proj.technologies.join(" · ")}
                                        </div>
                                    )}
                                    {proj.description && (
                                        <div className="resume-rich-text" style={{ ...styles.richText, marginLeft: "18px" }}>
                                            <SplittableRichText
                                                html={proj.description}
                                                range={subItemRanges?.[originalIdx]}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'description')}
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
        languages: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.languages?.[idx]).filter(Boolean) : (data.languages || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="languages" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Languages">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Languages" />
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                            {items.map((lang, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{ fontSize: "calc(13.5px * var(--theme-font-scale, 1))" }}>
                                        <span style={styles.infoLabel}>
                                            <RichTextSpellCheck html={lang.name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('languages', originalIdx, val, 'name')} />:
                                        </span>
                                        <RichTextSpellCheck html={lang.level || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('languages', originalIdx, val, 'level')} />
                                    </div>
                                );
                            })}
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
                        <SectionHeader title="Certifications" showLine={true} />
                        {items.map((cert, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.itemSpacing}>
                                    <div style={styles.historyRow}>
                                        <div style={{ fontWeight: "700", display: "flex", alignItems: "center" }}>
                                            <span style={styles.bullet}>•</span>
                                            <RichTextSpellCheck html={cert.name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('certifications', originalIdx, val, 'name')} />
                                        </div>
                                        <div style={{ textAlign: "center" }}>
                                            <RichTextSpellCheck html={cert.issuer || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('certifications', originalIdx, val, 'issuer')} />
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <RichTextSpellCheck html={cert.date || cert.year || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('certifications', originalIdx, val, 'date')} />
                                        </div>
                                    </div>
                                    {cert.description && (
                                        <div className="resume-rich-text" style={{ ...styles.richText, marginLeft: "18px" }}>
                                            <RichTextSpellCheck html={cert.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('certifications', originalIdx, val, 'description')} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },
        // removed awards renderer to match schema
        // removed volunteering renderer to match schema
        interests: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.interests?.[idx]).filter(Boolean) : (data.interests || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="interests" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Interests">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Interests" />
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {items.map((item, i) => {
                                const originalIndex = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIndex} style={{ display: "flex", alignItems: "center", fontSize: "calc(13.5px * var(--theme-font-scale, 1))" }}>
                                        <span style={styles.bullet}>•</span>
                                        <RichTextSpellCheck html={typeof item === 'object' ? item.name : item} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('interests', originalIndex, val, 'name')} />
                                        {i < items.length - 1 && <span style={{ marginLeft: "10px", color: "#cbd5e1" }}>|</span>}
                                    </div>
                                );
                            })}
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
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 30px" }}>
                            {details.map((d, i) => (
                                <div key={i} style={{ fontSize: "calc(13.5px * var(--theme-font-scale, 1))" }}>
                                    <span style={styles.infoLabel}>{d.label}:</span>
                                    <SpellCheckText text={d.value} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', d.label.toLowerCase().replace(/ /g, ''), val)} />
                                </div>
                            ))}
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
                        <SectionHeader title="Technical Proficiency" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 30px" }}>
                            {items.map((item, i) => {
                                const originalIndex = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIndex} style={{ fontSize: "calc(13.5px * var(--theme-font-scale, 1))" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <span style={styles.bullet}>•</span>
                                                <RichTextSpellCheck html={item.name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('software', originalIndex, val, 'name')} />
                                            </div>
                                            {item.rating > 0 && (
                                                <span style={{ color: lightText, fontSize: "calc(11px * var(--theme-font-scale, 1))", fontStyle: "italic" }}>
                                                    {ratingLabels[item.rating] || ""}
                                                </span>
                                            )}
                                        </div>
                                        {item.description && (
                                            <div className="resume-rich-text" style={{ ...styles.richText, marginLeft: "18px", fontSize: "calc(12px * var(--theme-font-scale, 1))" }}>
                                                <RichTextSpellCheck html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('software', originalIndex, val, 'description')} />
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
        // removed publications renderer to match schema
        // removed references renderer to match schema
        affiliations: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.affiliations?.[idx]).filter(Boolean) : (data.affiliations || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="affiliations" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Affiliations">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Professional Affiliations" showLine={true} />
                        {items.map((aff, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.itemSpacing}>
                                    <div style={{ display: "flex", alignItems: "flex-start" }}>
                                        <span style={styles.bullet}>•</span>
                                        <div>
                                            <div style={{ fontWeight: "700", color: darkText }}>
                                                <RichTextSpellCheck html={aff.name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, 'name')} />
                                            </div>
                                            {aff.description && (
                                                <div className="resume-rich-text" style={styles.richText}>
                                                    <RichTextSpellCheck html={aff.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, 'description')} />
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
        strengths: ({ itemIndices }) => {
            const strengths = itemIndices ? itemIndices.map(idx => data.strengths?.[idx]).filter(Boolean) : (data.strengths || []);
            if (strengths.length === 0) return null;
            return (
                <SectionWrapper sectionId="strengths" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Strengths">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Key Strengths" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 30px" }}>
                            {strengths.map((s, i) => {
                                const originalIndex = itemIndices ? itemIndices[i] : i;
                                const lvl = typeof s === 'object' ? (s.level ?? s.rating) : null;
                                return (
                                    <div key={originalIndex} data-item-index={originalIndex} style={{ display: "flex", alignItems: "flex-start", fontSize: "calc(13.5px * var(--theme-font-scale, 1))" }}>
                                        <span style={styles.bullet}>•</span>
                                        <RichTextSpellCheck html={typeof s === 'object' ? s.name : s} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('strengths', originalIndex, val, 'name')} />
                                        {lvl > 0 && <span style={{ display: "flex", gap: "3px", marginLeft: "auto", paddingLeft: "8px" }}>{[...Array(5)].map((_, di) => <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? "var(--theme-color, #1a365d)" : "rgba(120,120,120,0.15)" }} />)}</span>}
                                    </div>
                                );
                            })}
                        </div>
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
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 30px" }}>
                            {items.map((s, i) => {
                                const originalIndex = itemIndices ? itemIndices[i] : i;
                                const lvl = typeof s === 'object' ? (s.level ?? s.rating) : null;
                                return (
                                    <div key={originalIndex} data-item-index={originalIndex} style={{ display: "flex", alignItems: "flex-start", fontSize: "calc(13.5px * var(--theme-font-scale, 1))" }}>
                                        <span style={styles.bullet}>•</span>
                                        <RichTextSpellCheck html={typeof s === 'object' ? s.name : s} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalSkills', originalIndex, val, 'name')} />
                                        {lvl > 0 && <span style={{ display: "flex", gap: "3px", marginLeft: "auto", paddingLeft: "8px" }}>{[...Array(5)].map((_, di) => <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? "var(--theme-color, #1a365d)" : "rgba(120,120,120,0.15)" }} />)}</span>}
                                    </div>
                                );
                            })}
                        </div>
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
                        <SectionHeader title="Accomplishments" showLine={true} />
                        {items.map((item, i) => {
                            const originalIndex = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIndex} style={{ ...styles.itemSpacing, display: "flex", alignItems: "flex-start" }}>
                                    <span style={styles.bullet}>•</span>
                                    <div>
                                        {item.name && (
                                            <div style={{ fontWeight: "700", color: darkText, marginBottom: "2px" }}>
                                                <RichTextSpellCheck html={item.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('accomplishments', originalIndex, val, 'name')} />
                                            </div>
                                        )}
                                        {item.description && (
                                            <div className="resume-rich-text" style={styles.richText}>
                                                <RichTextSpellCheck html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('accomplishments', originalIndex, val, 'description')} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },
        additionalInfo: ({ subItemRanges }) => {
            if (!data.additionalInfo) return null;
            return (
                <SectionWrapper sectionId="additionalInfo" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Information">
                    <div style={styles.contentWrapper}>
                        <SectionHeader title="Additional Information" showLine={true} />
                        <div className="resume-rich-text" style={styles.richText}>
                            <SplittableRichText
                                html={data.additionalInfo}
                                range={subItemRanges?.additionalInfo}
                                isActive={isSpellCheckActive}
                                onIgnore={onSpellCheckIgnore}
                                onReplace={(val) => onSpellCheckReplace('additionalInfo', 'additionalInfo', val)}
                            />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        custom: ({ subItemRanges }) => {
            if (!data.customSection?.isVisible || !data.customSection?.content) return null;
            const title = data.customSection.title || "Additional Information";
            return (
                <SectionWrapper sectionId="custom" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <div style={styles.contentWrapper}>
                        <SectionHeader title={title} showLine={true} />
                        <div className="resume-rich-text" style={styles.richText}>
                            <SplittableRichText
                                html={data.customSection.content}
                                range={subItemRanges?.custom}
                                isActive={isSpellCheckActive}
                                onIgnore={onSpellCheckIgnore}
                                onReplace={(val) => onSpellCheckReplace('customSection', 'content', val)}
                            />
                        </div>
                    </div>
                </SectionWrapper>
            )
        }
    };

    const renderZone = (id, items, columnStyle = {}) => (
        <DroppableZone id={id} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "calc(30px * var(--theme-section-margin, 1))", minHeight: '100px', ...columnStyle }}>
            {items.map((sid, idx) => {
                const isContinued = typeof sid === 'object' && sid.isContinued;
                const sectionId = typeof sid === 'string' ? sid : sid.id;
                const dragId = isContinued ? `${id}-cont-${sectionId}-${idx}` : sectionId;

                return (
                    <DraggableSection key={dragId} id={dragId} isEnabled={canReorder && !isContinued}>
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
                <div data-column-id="main" style={{ display: "flex", flexDirection: "column", gap: "calc(30px * var(--theme-section-margin, 1))" }}>
                    {activeSections.map(sid => (
                        <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="main" />
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="strategic-leader-root">
            <Measurer />
            <DndContext {...dndContextProps}>
                <SortableContext items={activeSections} strategy={verticalListSortingStrategy}>
                    {showPageBreaks && pages ? (
                        pages.map((page, i) => (
                            <div key={i} className="resume-page" style={styles.page}>
                                {i === 0 && <Header />}
                                {renderZone(`main-p${i}`, page.main, { flex: 1 })}
                                <div style={{ position: "absolute", bottom: "15px", right: "40px", fontSize: "10px", opacity: 0.5 }}>Page {i + 1}</div>
                            </div>
                        ))
                    ) : (
                        <div style={{ ...styles.page, height: "auto", minHeight: "100%", overflow: "hidden" }}>
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

export default StrategicLeader;
