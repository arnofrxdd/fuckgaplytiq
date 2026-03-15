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
import {
    Mail, Phone, MapPin, Globe, Linkedin, Github,
    User, Briefcase, GraduationCap, Award, Monitor,
    Layout, Heart, BookOpen, Trophy, Users, Star, Globe2
} from "lucide-react";
import { getCompleteLayout, getSavedLayout } from "../common/TemplateUtils";

/**
 * ArtisticGraphic Template
 * Inspired by the Morgan Maxwell resume design:
 * - Dark olive/forest-green left sidebar (~38%) with:
 *     • Large bold name at top (white)
 *     • Profession subtitle
 *     • Circular photo in upper-right corner of sidebar
 *     • Sections: About Me, Skills (with % bars), Education, Languages, Contact
 * - Light warm-beige/off-white right column (~62%):
 *     • "Professional Experience:" heading
 *     • Experience entries with dates, company, bullets
 *     • Projects, Awards, Volunteer, Publications, Custom
 * - Full pagination, section continuation, drag-and-drop, spell-check, all CSS spacing vars
 */
const ArtisticGraphic = ({
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

    // ─── THEME ──────────────────────────────────────────────────────────────────
    // Dark olive-green sidebar: var(--theme-color, #3d5a3e)
    const sidebarBg = "var(--theme-color, #3d5a3e)";
    const sidebarText = "#ffffff";
    const sidebarSubtext = "rgba(255,255,255,0.75)";
    const sidebarAccent = "rgba(255,255,255,0.18)"; // for section title underlines / bars bg
    const rightBg = "#f5f2ec"; // warm off-white / parchment
    const rightText = "#2c2c2c";
    const rightAccent = "var(--theme-color, #3d5a3e)";

    // ─── LAYOUT ENGINE ──────────────────────────────────────────────────────────
    const TEMPLATE_ID = 'artistic-graphic';
    const savedLayout = getSavedLayout(data, TEMPLATE_ID, {});
    const initialLayout = {
        sidebar: savedLayout.sidebar || savedLayout.left || ["summary", "skills", "strengths", "additionalSkills", "education", "languages", "certifications", "software", "interests", "contact", "websites", "personalDetails"],
        main: savedLayout.main || savedLayout.right || ["experience", "projects", "awards", "volunteer", "publications", "custom", "additionalInfo"]
    };

    const completeLayout = getCompleteLayout(data, initialLayout, "main");
    const activeSidebarSections = completeLayout.sidebar || [];
    const activeMainSections = completeLayout.main || [];

    // ─── DRAG & DROP ────────────────────────────────────────────────────────────
    const { dndContextProps, activeId } = useResumeDragAndDrop({
        data,
        onReorder,
        scale,
        containers: { sidebar: activeSidebarSections, main: activeMainSections }
    });

    // ─── PAGINATION ─────────────────────────────────────────────────────────────
    const pages = useAutoPagination({
        columns: { sidebar: activeSidebarSections, main: activeMainSections },
        data,
        enabled: showPageBreaks,
        containerRef,
        scale
    });

    // ─── STYLES ─────────────────────────────────────────────────────────────────
    const styles = {
        page: {
            width: "210mm",
            height: "297mm",
            backgroundColor: rightBg,
            boxSizing: "border-box",
            position: "relative",
            margin: "0 auto 30px auto",
            color: rightText,
            fontFamily: "var(--theme-font, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "row",
            WebkitPrintColorAdjust: "exact",
        },
        // ── Sidebar ─────────────────────────────────────────────────────────────
        sidebar: {
            width: "38%",
            background: sidebarBg,
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            position: "relative",
            height: "100%",
            WebkitPrintColorAdjust: "exact",
        },
        sidebarHeader: {
            padding: "36px 24px 20px 28px",
            position: "relative",
        },
        // Name block
        firstName: {
            fontSize: "calc(42px * var(--theme-font-scale, 1))",
            fontWeight: "900",
            color: sidebarText,
            margin: 0,
            lineHeight: "1.0",
            textTransform: "uppercase",
            letterSpacing: "1px",
        },
        lastName: {
            fontSize: "calc(30px * var(--theme-font-scale, 1))",
            fontWeight: "400",
            color: sidebarText,
            margin: 0,
            lineHeight: "1.2",
            letterSpacing: "0.5px",
            // Fix BaseComponents coloring in dark sidebar
            "--theme-text-primary": sidebarText,
            "--theme-text-muted": sidebarSubtext,
            "--theme-text-body": sidebarSubtext,
            "--theme-text-header": sidebarText,
        },
        profession: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            fontWeight: "400",
            color: sidebarSubtext,
            marginTop: "10px",
            letterSpacing: "2px",
            textTransform: "uppercase",
        },

        sidebarBody: {
            flex: 1,
            padding: "0 24px var(--theme-page-margin, 36px) 28px",
            display: "flex",
            flexDirection: "column",
            gap: "calc(20px * var(--theme-section-margin, 1))",
        },
        // Sidebar section title
        sidebarSectionTitle: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: sidebarText,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            marginTop: "0",
            marginBottom: "12px",
            paddingBottom: "5px",
            borderBottom: "1px solid rgba(255,255,255,0.25)",
            boxSizing: "border-box",
        },
        // Sidebar body text
        sidebarText: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: sidebarSubtext,
            lineHeight: "var(--theme-line-height, 1.6)",
        },
        // Skill bar
        skillBarWrap: {
            marginBottom: "calc(10px * var(--theme-paragraph-margin, 1))",
        },
        skillBarLabel: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "4px",
        },
        skillBarName: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: sidebarText,
            fontWeight: "500",
        },
        skillBarPct: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            color: sidebarSubtext,
        },
        skillBarTrack: {
            height: "5px",
            background: "rgba(255,255,255,0.18)",
            borderRadius: "3px",
            overflow: "hidden",
        },
        // Education item in sidebar
        eduItem: {
            marginBottom: "calc(12px * var(--theme-paragraph-margin, 1))",
        },
        eduDegree: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: sidebarText,
            fontWeight: "600",
            lineHeight: "1.4",
        },
        eduSchool: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: sidebarSubtext,
            marginTop: "2px",
        },
        eduDate: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            color: "rgba(255,255,255,0.55)",
            marginTop: "1px",
        },
        // Contact in sidebar
        contactRow: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "calc(8px * var(--theme-paragraph-margin, 1))",
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: sidebarSubtext,
            wordBreak: "break-all",
        },
        contactIcon: {
            width: "13px",
            height: "13px",
            color: "rgba(255,255,255,0.7)",
            flexShrink: 0,
        },
        // Language circular badge
        langBadgeRow: {
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
        },
        langBadge: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "5px",
        },
        langBadgeLabel: {
            fontSize: "calc(10.5px * var(--theme-font-scale, 1))",
            color: sidebarSubtext,
        },
        // ── Main Column ─────────────────────────────────────────────────────────
        mainCol: {
            width: "62%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "calc(22px * var(--theme-section-margin, 1))",
            padding: "36px 36px var(--theme-page-margin, 40px) 30px",
        },
        // Main section title
        mainSectionTitle: {
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: rightAccent,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            marginTop: "0",
            marginBottom: "14px",
            paddingBottom: "5px",
            borderBottom: `2px solid var(--theme-color, #3d5a3e)`,
            boxSizing: "border-box",
        },
        // Experience item
        expCompany: {
            fontSize: "calc(13.5px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: rightText,
            marginBottom: "1px",
        },
        expDate: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: "#6b7280",
            marginBottom: "7px",
        },
        expRole: {
            fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
            fontWeight: "600",
            color: rightAccent,
            marginBottom: "6px",
        },
        expDesc: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.6)",
            color: "#3d3d3d",
        },
    };

    // ════════════════════════════════════════════════════════════════════════════
    //  SIDEBAR SECTION TITLE
    // ════════════════════════════════════════════════════════════════════════════
    const SidebarSectionTitle = ({ title, zoneId }) => {
        const { isContinued } = useSectionContext();
        const displayTitle = isContinued ? `${title} (Cont.)` : title;
        return <div style={styles.sidebarSectionTitle}>{displayTitle}</div>;
    };

    const MainSectionTitle = ({ title, zoneId }) => {
        const { isContinued } = useSectionContext();
        const displayTitle = isContinued ? `${title} (Cont.)` : title;
        return <div style={styles.mainSectionTitle}>{displayTitle}</div>;
    };

    // ────────────────────────────────────────────────────────────────────────────
    // Skill progress bar (percentage-based from level 1-5 or raw %)
    // ────────────────────────────────────────────────────────────────────────────
    const SkillBar = ({ name, level, originalIdx, dataKey, onReplace }) => {
        // level: 1-5 → convert to percent; or treat as percent directly if > 5
        let pct = 0;
        if (level != null && level > 0) {
            pct = level > 5 ? Math.min(level, 100) : Math.round((level / 5) * 100);
        } else {
            pct = 80; // default display
        }
        const pctLabel = `${pct}%`;
        return (
            <div style={styles.skillBarWrap} data-item-index={originalIdx}>
                <div style={styles.skillBarLabel}>
                    <span style={styles.skillBarName}>
                        <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={onReplace} />
                    </span>
                    <span style={styles.skillBarPct}>{pctLabel}</span>
                </div>
                <div style={styles.skillBarTrack}>
                    <div style={{ height: "100%", width: pctLabel, background: "rgba(255,255,255,0.75)", borderRadius: "3px" }} />
                </div>
            </div>
        );
    };

    // ────────────────────────────────────────────────────────────────────────────
    // Language circular SVG badge
    // ────────────────────────────────────────────────────────────────────────────
    const LangCircle = ({ name, level }) => {
        let pct = 80;
        if (level != null && level > 0) {
            pct = level > 5 ? Math.min(level, 100) : Math.round((level / 5) * 100);
        }
        const r = 22;
        const circ = 2 * Math.PI * r;
        const dash = (pct / 100) * circ;
        return (
            <div style={styles.langBadge}>
                <svg width="58" height="58" viewBox="0 0 58 58">
                    <circle cx="29" cy="29" r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="5" />
                    <circle cx="29" cy="29" r={r} fill="none"
                        stroke="rgba(255,255,255,0.8)" strokeWidth="5"
                        strokeDasharray={`${dash} ${circ}`}
                        strokeLinecap="round"
                        transform="rotate(-90 29 29)"
                    />
                    <text x="29" y="34" textAnchor="middle" fontSize="11" fontWeight="700" fill="white">{pct}%</text>
                </svg>
                <span style={styles.langBadgeLabel}>{name}</span>
            </div>
        );
    };

    // ════════════════════════════════════════════════════════════════════════════
    //  CUSTOM RENDERERS
    // ════════════════════════════════════════════════════════════════════════════
    const customRenderers = {

        // ── SIDEBAR: SUMMARY / ABOUT ME ───────────────────────────────────────
        summary: ({ isContinued, subItemRanges, zoneId }) => {
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="summary" onSectionClick={onSectionClick} isInteractive={isInteractive} label="About Me">
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar
                                ? <SidebarSectionTitle title="About Me" zoneId={zoneId} />
                                : <MainSectionTitle title="About Me" zoneId={zoneId} />
                            }
                            <div className="resume-rich-text" style={isSidebar ? styles.sidebarText : { fontSize: "calc(12.5px * var(--theme-font-scale, 1))", lineHeight: "var(--theme-line-height, 1.6)", color: rightText }}>
                                <SplittableRichText
                                    html={data.summary}
                                    range={subItemRanges?.summary}
                                    isActive={isSpellCheckActive}
                                    onIgnore={onSpellCheckIgnore}
                                    onReplace={(val) => onSpellCheckReplace('summary', 'summary', val)}
                                />
                            </div>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── SIDEBAR: SKILLS with progress bars ────────────────────────────────
        skills: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.skills?.[idx]).filter(Boolean) : (data.skills || []);
            const hasDescription = data.skillsDescription && data.skillsDescription.trim();
            const isSidebar = zoneId?.includes("sidebar");

            if (items.length > 0) {
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <div style={{ paddingBottom: "1px" }}>
                            <div>
                                {isSidebar
                                    ? <SidebarSectionTitle title="Skills:" zoneId={zoneId} />
                                    : <MainSectionTitle title="Skills" zoneId={zoneId} />
                                }
                                <div style={isSidebar ? {} : { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px 20px" }}>
                                    {items.map((skill, i) => {
                                        const originalIdx = itemIndices ? itemIndices[i] : i;
                                        const name = typeof skill === 'object' ? skill.name : skill;
                                        const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                        if (isSidebar) {
                                            return (
                                                <SkillBar key={originalIdx} name={name} level={lvl} originalIdx={originalIdx}
                                                    onReplace={(val) => onSpellCheckReplace('skills', originalIdx, val, 'name')} />
                                            );
                                        }
                                        return (
                                            <div key={originalIdx} style={{ display: "flex", alignItems: "center", marginBottom: "calc(6px * var(--theme-paragraph-margin, 1))" }} data-item-index={originalIdx}>
                                                <span style={{ fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: rightText, flex: 1 }}>
                                                    <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                        onReplace={(val) => onSpellCheckReplace('skills', originalIdx, val, 'name')} />
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </SectionWrapper>
                );
            }
            if (hasDescription) {
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Skills:" zoneId={zoneId} /> : <MainSectionTitle title="Skills" zoneId={zoneId} />}
                            <div className="resume-rich-text" style={isSidebar ? styles.sidebarText : { fontSize: "calc(12.5px * var(--theme-font-scale, 1))" }}>
                                <SplittableRichText html={data.skillsDescription} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                    onReplace={(val) => onSpellCheckReplace && onSpellCheckReplace('skills', 'skillsDescription', val)} />
                            </div>
                        </div>
                    </SectionWrapper>
                );
            }
            return null;
        },

        // ── SIDEBAR: STRENGTHS ────────────────────────────────────────────────
        strengths: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.strengths?.[idx]).filter(Boolean) : (data.strengths || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="strengths" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Strengths">
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Key Strengths:" zoneId={zoneId} /> : <MainSectionTitle title="Key Strengths" zoneId={zoneId} />}
                            <div style={isSidebar ? {} : { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px 20px" }}>
                                {items.map((skill, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    const name = typeof skill === 'object' ? skill.name : skill;
                                    const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                    if (isSidebar) {
                                        return <SkillBar key={originalIdx} name={name} level={lvl} originalIdx={originalIdx}
                                            onReplace={(val) => onSpellCheckReplace('strengths', originalIdx, val, 'name')} />;
                                    }
                                    return (
                                        <div key={originalIdx} style={{ marginBottom: "calc(5px * var(--theme-paragraph-margin, 1))", fontSize: "calc(12.5px * var(--theme-font-scale, 1))" }} data-item-index={originalIdx}>
                                            <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('strengths', originalIdx, val, 'name')} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── ADDITIONAL SKILLS ─────────────────────────────────────────────────
        additionalSkills: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.additionalSkills?.[idx]).filter(Boolean) : (data.additionalSkills || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="additionalSkills" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Skills">
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Additional Skills:" zoneId={zoneId} /> : <MainSectionTitle title="Additional Skills" zoneId={zoneId} />}
                            <div style={isSidebar ? {} : { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px 20px" }}>
                                {items.map((skill, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    const name = typeof skill === 'object' ? skill.name : skill;
                                    const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                    if (isSidebar) {
                                        return <SkillBar key={originalIdx} name={name} level={lvl} originalIdx={originalIdx}
                                            onReplace={(val) => onSpellCheckReplace('additionalSkills', originalIdx, val, 'name')} />;
                                    }
                                    return (
                                        <div key={originalIdx} style={{ marginBottom: "calc(5px * var(--theme-paragraph-margin, 1))", fontSize: "calc(12.5px * var(--theme-font-scale, 1))" }} data-item-index={originalIdx}>
                                            <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('additionalSkills', originalIdx, val, 'name')} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── SIDEBAR: EDUCATION ────────────────────────────────────────────────
        education: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.education?.[idx]) : data.education;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Education:" zoneId={zoneId} /> : <MainSectionTitle title="Education" zoneId={zoneId} />}
                            {items.map((edu, i) => {
                                if (!edu) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const school = edu.institution || edu.school || "";
                                const dateStr = edu.year || edu.date || (edu.startYear ? `${edu.startYear} - ${edu.isCurrent ? "Present" : edu.endYear}` : edu.endYear || "");
                                const locationStr = edu.location ? `, ${edu.location}` : "";
                                if (isSidebar) {
                                    return (
                                        <div key={i} style={styles.eduItem} data-item-index={originalIdx}>
                                            <div style={styles.eduDegree}>
                                                <RichTextSpellCheck html={edu.degree || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'degree')} />
                                            </div>
                                            <div style={styles.eduSchool}>
                                                <RichTextSpellCheck html={`${school}${locationStr}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'institution')} />
                                            </div>
                                            {dateStr && <div style={styles.eduDate}>{dateStr}</div>}
                                            {edu.grade && <div style={{ ...styles.eduDate, marginTop: "2px" }}>GPA: {edu.grade}</div>}
                                            {edu.description && (
                                                <div className="resume-rich-text" style={{ ...styles.sidebarText, marginTop: "5px" }}>
                                                    <SplittableRichText html={edu.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                        onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'description')} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                // Main column version
                                return (
                                    <div key={i} style={{ marginBottom: "calc(14px * var(--theme-paragraph-margin, 1))" }} data-item-index={originalIdx}>
                                        <div style={{ fontWeight: "700", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: rightText }}>
                                            <RichTextSpellCheck html={`${school}${locationStr}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'institution')} />
                                        </div>
                                        {dateStr && <div style={{ fontSize: "calc(11.5px * var(--theme-font-scale, 1))", color: "#6b7280" }}>{dateStr}</div>}
                                        {edu.degree && <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#4b5563", fontStyle: "italic" }}>
                                            <RichTextSpellCheck html={edu.degree} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'degree')} />
                                        </div>}
                                        {edu.grade && <div style={{ fontSize: "calc(11.5px * var(--theme-font-scale, 1))", color: "#6b7280" }}>GPA: {edu.grade}</div>}
                                        {edu.description && (
                                            <div className="resume-rich-text" style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", marginTop: "5px", lineHeight: "var(--theme-line-height, 1.6)" }}>
                                                <SplittableRichText html={edu.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'description')} />
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

        // ── SIDEBAR: LANGUAGES (circular badges) ──────────────────────────────
        languages: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.languages?.[idx]) : data.languages;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="languages" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Languages">
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Language:" zoneId={zoneId} /> : <MainSectionTitle title="Languages" zoneId={zoneId} />}
                            {isSidebar ? (
                                <div style={styles.langBadgeRow}>
                                    {items.map((lang, i) => {
                                        const originalIdx = itemIndices ? itemIndices[i] : i;
                                        const name = typeof lang === 'object' ? lang.name : lang;
                                        const lvl = typeof lang === 'object' ? (lang.level ?? lang.rating ?? 4) : 4;
                                        return <LangCircle key={i} name={name} level={lvl} />;
                                    })}
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "calc(8px * var(--theme-paragraph-margin, 1))" }}>
                                    {items.map((lang, i) => {
                                        const originalIdx = itemIndices ? itemIndices[i] : i;
                                        return (
                                            <LanguageItem key={i} item={lang} index={originalIdx}
                                                isSpellCheckActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                onSpellCheckReplace={(field, val) => onSpellCheckReplace('languages', originalIdx, val, field)} />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── SIDEBAR: CONTACT ──────────────────────────────────────────────────
        contact: ({ zoneId }) => {
            const isSidebar = zoneId?.includes("sidebar");
            const websiteItems = data.websites || [];
            const extraLinks = [
                personal?.linkedin && { label: 'LinkedIn', value: personal.linkedin, icon: Linkedin },
                personal?.github && { label: 'GitHub', value: personal.github, icon: Github },
                personal?.website && { label: 'Website', value: personal.website, icon: Globe },
            ].filter(Boolean);
            const headerWebsites = websiteItems
                .map((link, idx) => ({ ...link, originalIdx: idx }))
                .filter(link => link.addToHeader && link.url)
                .map(link => ({ label: link.label || 'Website', value: link.url, icon: Globe2, idx: link.originalIdx }));

            const ContactItem = ({ icon: Icon, value, href, onReplace }) => (
                <div style={isSidebar ? styles.contactRow : { display: "flex", alignItems: "center", gap: "8px", marginBottom: "calc(6px * var(--theme-paragraph-margin, 1))", fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: rightText }}>
                    <Icon style={isSidebar ? styles.contactIcon : { width: "13px", height: "13px", color: rightAccent, flexShrink: 0 }} strokeWidth={2} />
                    <ResumeLink href={href}>
                        <SpellCheckText text={value} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={onReplace} />
                    </ResumeLink>
                </div>
            );

            return (
                <SectionWrapper sectionId="contact" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Contact">
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Contact:" zoneId={zoneId} /> : <MainSectionTitle title="Contact" zoneId={zoneId} />}
                            {personal?.phone && <ContactItem icon={Phone} value={personal.phone} href={personal.phone} onReplace={(val) => onSpellCheckReplace('personal', 'phone', val)} />}
                            {personal?.email && <ContactItem icon={Mail} value={personal.email} href={personal.email} onReplace={(val) => onSpellCheckReplace('personal', 'email', val)} />}
                            {(personal?.city || personal?.country || personal?.zipCode || personal?.zip) && (
                                <div style={isSidebar ? styles.contactRow : { display: "flex", alignItems: "center", gap: "8px", marginBottom: "calc(6px * var(--theme-paragraph-margin, 1))", fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: rightText }}>
                                    <MapPin style={isSidebar ? styles.contactIcon : { width: "13px", height: "13px", color: rightAccent, flexShrink: 0 }} strokeWidth={2} />
                                    <SpellCheckText
                                        text={[personal?.city, personal?.state, personal?.zipCode || personal?.zip, personal?.country].filter(Boolean).join(", ")}
                                        isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                        onReplace={(val) => onSpellCheckReplace('personal', 'city', val)} />
                                </div>
                            )}
                            {[...extraLinks, ...headerWebsites].map((link, i) => (
                                <ContactItem key={i} icon={link.icon} value={link.value} href={link.value}
                                    onReplace={(val) => onSpellCheckReplace('personal', link.label?.toLowerCase(), val)} />
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── PERSONAL DETAILS ──────────────────────────────────────────────────
        personalDetails: ({ zoneId }) => {
            const isSidebar = zoneId?.includes("sidebar");
            const { personal: p = {} } = data;
            const details = [
                { label: 'Date of Birth', value: p.dob || p.dateOfBirth || p.birthDate, icon: User },
                { label: 'Nationality', value: p.nationality, icon: Globe },
                { label: 'Marital Status', value: p.maritalStatus || p.marital_status, icon: User },
                { label: 'Gender', value: p.gender, icon: User },
                { label: 'Religion', value: p.religion, icon: User },
                { label: 'Visa Status', value: p.visaStatus || p.visa_status, icon: User },
                { label: 'Passport', value: p.passport || p.passportNumber, icon: User },
                { label: 'Place of Birth', value: p.placeOfBirth, icon: MapPin },
                { label: 'Driving License', value: p.drivingLicense, icon: User },
                { label: 'Other', value: p.otherPersonal || p.otherInformation, icon: User }
            ].filter(d => d.value);

            if (details.length === 0) return null;

            return (
                <SectionWrapper sectionId="personalDetails" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Personal Details">
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Personal Details:" zoneId={zoneId} /> : <MainSectionTitle title="Personal Details" zoneId={zoneId} />}
                            {details.map((d, i) => (
                                <div key={i} style={isSidebar ? styles.contactRow : { display: "flex", alignItems: "center", gap: "8px", marginBottom: "calc(8px * var(--theme-paragraph-margin, 1))", fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: rightText }}>
                                    <d.icon style={isSidebar ? styles.contactIcon : { width: "13px", height: "13px", color: rightAccent, flexShrink: 0 }} strokeWidth={2} />
                                    <div>
                                        <div style={{ fontSize: "10px", color: isSidebar ? sidebarSubtext : "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>{d.label}</div>
                                        <SpellCheckText
                                            text={d.value}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace('personal', d.label.toLowerCase().replace(/ /g, ''), val)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── WEBSITES ──────────────────────────────────────────────────────────
        websites: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.websites?.[idx]) : data.websites;
            const portfolioLinks = (items || [])
                .map((link, idx) => ({ ...link, originalIdx: itemIndices ? itemIndices[idx] : idx }))
                .filter(link => !link.addToHeader && link.url);
            if (portfolioLinks.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="websites" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Websites">
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Websites:" zoneId={zoneId} /> : <MainSectionTitle title="Websites" zoneId={zoneId} />}
                            {portfolioLinks.map((site, i) => (
                                <div key={i} style={isSidebar ? styles.contactRow : { display: "flex", alignItems: "center", gap: "8px", marginBottom: "calc(6px * var(--theme-paragraph-margin, 1))", fontSize: "calc(12.5px * var(--theme-font-scale, 1))" }}>
                                    <Globe style={isSidebar ? styles.contactIcon : { width: "13px", height: "13px", color: rightAccent }} strokeWidth={2} />
                                    <ResumeLink href={site.url}>
                                        <SpellCheckText text={site.url} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace('websites', site.originalIdx, val, 'url')} />
                                    </ResumeLink>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── CERTIFICATIONS ────────────────────────────────────────────────────
        certifications: ({ itemIndices, isContinued, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.certifications?.[idx]) : data.certifications;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Certifications:" zoneId={zoneId} /> : <MainSectionTitle title="Certifications" zoneId={zoneId} />}
                            <div style={isSidebar ? { display: "flex", flexDirection: "column", gap: "calc(6px * var(--theme-paragraph-margin, 1))" } : { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px 20px" }}>
                                {items.map((cert, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    if (isSidebar) {
                                        return (
                                            <div key={i} style={styles.eduItem} data-item-index={originalIdx}>
                                                <div style={styles.eduDegree}>
                                                    <RichTextSpellCheck html={typeof cert === 'object' ? cert.name : cert} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                        onReplace={(val) => onSpellCheckReplace('certifications', originalIdx, val, 'name')} />
                                                </div>
                                                {(cert.issuer || cert.authority) && (
                                                    <div style={styles.eduSchool}>
                                                        <SpellCheckText text={cert.issuer || cert.authority} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                            onReplace={(val) => onSpellCheckReplace('certifications', originalIdx, val, cert.issuer ? 'issuer' : 'authority')} />
                                                    </div>
                                                )}
                                                {cert.date && <div style={styles.eduDate}>{cert.date}</div>}
                                            </div>
                                        );
                                    }
                                    return (
                                        <CertificationItem key={i} item={cert} index={originalIdx}
                                            isSpellCheckActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                            onSpellCheckReplace={(field, val) => onSpellCheckReplace('certifications', originalIdx, val, field)}
                                            variant={undefined} subItemRange={renderSubItemRanges?.[originalIdx]} />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── SOFTWARE ──────────────────────────────────────────────────────────
        software: ({ itemIndices, isContinued, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.software?.[idx]) : data.software;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="software" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Software">
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Software:" zoneId={zoneId} /> : <MainSectionTitle title="Software" zoneId={zoneId} />}
                            <div style={isSidebar ? { display: "flex", flexDirection: "column", gap: "calc(6px * var(--theme-paragraph-margin, 1))" } : { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px 20px" }}>
                                {items.map((item, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    if (isSidebar) {
                                        const name = typeof item === 'object' ? item.name : item;
                                        const lvl = typeof item === 'object' ? (item.level ?? item.rating) : null;
                                        return (
                                            <div key={i} style={styles.eduItem} data-item-index={originalIdx}>
                                                <div style={styles.eduDegree}>
                                                    <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                        onReplace={(val) => onSpellCheckReplace('software', originalIdx, val, 'name')} />
                                                </div>
                                                {item.description && (
                                                    <div style={{ ...styles.sidebarText, fontSize: "11px", marginTop: "2px" }}>
                                                        <RichTextSpellCheck html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                            onReplace={(val) => onSpellCheckReplace('software', originalIdx, val, 'description')} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                    return (
                                        <SoftwareItem key={i} item={item} index={originalIdx}
                                            isSpellCheckActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                            onSpellCheckReplace={(field, val) => onSpellCheckReplace('software', originalIdx, val, field)}
                                            variant={undefined} subItemRange={renderSubItemRanges?.[originalIdx]} />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── INTERESTS ─────────────────────────────────────────────────────────
        interests: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.interests?.[idx]) : data.interests;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="interests" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Interests">
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Interests:" zoneId={zoneId} /> : <MainSectionTitle title="Interests" zoneId={zoneId} />}
                            <ul style={{ paddingLeft: isSidebar ? "0" : "14px", margin: 0, listStyle: isSidebar ? "none" : "disc", display: isSidebar ? "flex" : "block", flexWrap: "wrap", gap: "6px" }}>
                                {items.map((item, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    const name = typeof item === 'object' ? item.name : item;
                                    return (
                                        <li key={originalIdx} data-item-index={originalIdx} style={{
                                            fontSize: "calc(12px * var(--theme-font-scale, 1))",
                                            color: isSidebar ? sidebarSubtext : rightText,
                                            marginBottom: isSidebar ? "0" : "calc(5px * var(--theme-paragraph-margin, 1))",
                                            background: isSidebar ? "rgba(255,255,255,0.1)" : "transparent",
                                            padding: isSidebar ? "3px 10px" : "0",
                                            borderRadius: "12px"
                                        }}>
                                            <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('interests', originalIdx, val, 'name')} />
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── MAIN: EXPERIENCE ──────────────────────────────────────────────────
        experience: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.experience?.[idx]) : data.experience;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="experience" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Professional Experience">
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Experience:" zoneId={zoneId} /> : <MainSectionTitle title="Professional Experience:" zoneId={zoneId} />}
                            {items.map((exp, i) => {
                                if (!exp) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const dateStr = exp.year || exp.date || (exp.startYear ? `${exp.startYear} - ${exp.isCurrent ? "Present" : exp.endYear}` : "");
                                const companyAndDate = isSidebar ? dateStr : [dateStr, [exp.company, exp.location].filter(Boolean).join(", ")].filter(Boolean).join("  |  ");
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(18px * var(--theme-paragraph-margin, 1))", paddingBottom: "1px" }}>
                                        <div style={isSidebar ? styles.eduDegree : styles.expCompany}>
                                            <RichTextSpellCheck html={exp.title || exp.role || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'title')} />
                                        </div>
                                        <div style={isSidebar ? styles.eduSchool : styles.expDate}>
                                            <RichTextSpellCheck html={isSidebar ? exp.company || "" : companyAndDate} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'company')} />
                                            {!isSidebar && exp.isRemote && <span> • Remote</span>}
                                        </div>
                                        {isSidebar && dateStr && <div style={styles.eduDate}>{dateStr}</div>}
                                        {exp.description && (
                                            <div className="resume-rich-text" style={isSidebar ? styles.sidebarText : styles.expDesc}>
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
                    </div>
                </SectionWrapper>
            );
        },

        // ── MAIN: PROJECTS ────────────────────────────────────────────────────
        projects: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.projects?.[idx]) : data.projects;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Projects:" zoneId={zoneId} /> : <MainSectionTitle title="Projects:" zoneId={zoneId} />}
                            {items.map((proj, i) => {
                                if (!proj) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const dateStr = proj.year || (proj.startYear ? `${proj.startYear} - ${proj.isCurrent ? 'Present' : (proj.endYear || 'Present')}` : "");
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(16px * var(--theme-paragraph-margin, 1))", paddingBottom: "1px" }}>
                                        <div style={isSidebar ? {} : { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
                                            <div style={isSidebar ? styles.eduDegree : styles.expCompany}>
                                                <RichTextSpellCheck html={proj.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'title')} />
                                            </div>
                                            {dateStr && <span style={isSidebar ? styles.eduDate : styles.expDate}>{dateStr}</span>}
                                        </div>
                                        {proj.link && (
                                            <div style={{ fontSize: isSidebar ? "calc(10.5px * var(--theme-font-scale, 1))" : "calc(11.5px * var(--theme-font-scale, 1))", color: isSidebar ? sidebarText : rightAccent, marginBottom: "5px" }}>
                                                <ResumeLink href={proj.link}>
                                                    <RichTextSpellCheck html={proj.link} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                        onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'link')} />
                                                </ResumeLink>
                                            </div>
                                        )}
                                        {proj.technologies?.length > 0 && (
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "6px" }}>
                                                {proj.technologies.map((tech, tIdx) => (
                                                    <span key={tIdx} style={{ fontSize: "calc(10.5px * var(--theme-font-scale, 1))", padding: "2px 7px", background: isSidebar ? "rgba(255,255,255,0.15)" : "rgba(61,90,62,0.12)", borderRadius: "10px", color: isSidebar ? sidebarText : rightAccent }}>
                                                        <RichTextSpellCheck html={tech} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                            onReplace={(val) => {
                                                                const updated = [...proj.technologies];
                                                                updated[tIdx] = val;
                                                                onSpellCheckReplace('projects', originalIdx, updated, 'technologies');
                                                            }} />
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {proj.description && (
                                            <div className="resume-rich-text" style={isSidebar ? styles.sidebarText : styles.expDesc}>
                                                <SplittableRichText html={proj.description} range={subItemRanges?.[originalIdx]}
                                                    isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'description')} />
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

        // ── KEY ACHIEVEMENTS ──────────────────────────────────────────────────
        keyAchievements: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.keyAchievements?.[idx]) : data.keyAchievements;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="keyAchievements" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Achievements">
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Key Achievements:" zoneId={zoneId} /> : <MainSectionTitle title="Key Achievements" zoneId={zoneId} />}
                            <div style={isSidebar ? { display: "flex", flexDirection: "column", gap: "6px" } : { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px 20px" }}>
                                {items.map((item, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    const name = typeof item === 'object' ? item.name : item;
                                    if (isSidebar) {
                                        return <SkillBar key={i} name={name} originalIdx={originalIdx}
                                            onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIdx, val, 'name')} />;
                                    }
                                    return (
                                        <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(6px * var(--theme-paragraph-margin, 1))", fontSize: "calc(12px * var(--theme-font-scale, 1))", color: rightText }}>
                                            • <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIdx, val, 'name')} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── ACCOMPLISHMENTS ───────────────────────────────────────────────────
        accomplishments: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.accomplishments?.[idx]) : data.accomplishments;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="accomplishments" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Accomplishments">
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Accomplishments:" zoneId={zoneId} /> : <MainSectionTitle title="Accomplishments" zoneId={zoneId} />}
                            <div style={isSidebar ? { display: "flex", flexDirection: "column", gap: "6px" } : { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px 20px" }}>
                                {items.map((item, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    const name = typeof item === 'object' ? item.name : item;
                                    if (isSidebar) {
                                        return <SkillBar key={i} name={name} originalIdx={originalIdx}
                                            onReplace={(val) => onSpellCheckReplace('accomplishments', originalIdx, val, 'name')} />;
                                    }
                                    return (
                                        <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(6px * var(--theme-paragraph-margin, 1))", fontSize: "calc(12px * var(--theme-font-scale, 1))", color: rightText }}>
                                            • <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('accomplishments', originalIdx, val, 'name')} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── AFFILIATIONS ──────────────────────────────────────────────────────
        affiliations: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.affiliations?.[idx]) : data.affiliations;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="affiliations" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Affiliations">
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Affiliations:" zoneId={zoneId} /> : <MainSectionTitle title="Affiliations" zoneId={zoneId} />}
                            <div style={isSidebar ? { display: "flex", flexDirection: "column", gap: "6px" } : { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px 20px" }}>
                                {items.map((item, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    const name = typeof item === 'object' ? item.name : item;
                                    if (isSidebar) {
                                        return (
                                            <div key={i} style={styles.eduItem} data-item-index={originalIdx}>
                                                <div style={styles.eduDegree}>
                                                    <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                        onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, 'name')} />
                                                </div>
                                                {item.role && <div style={{ ...styles.eduSchool, fontStyle: "italic" }}>{item.role}</div>}
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                                            <div style={{ fontWeight: "600", fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: rightText }}>
                                                <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, 'name')} />
                                            </div>
                                            {item.role && <div style={{ fontSize: "calc(11.5px * var(--theme-font-scale, 1))", color: "#6b7280" }}>{item.role}</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── PERSONAL DETAILS ──────────────────────────────────────────────────
        personalDetails: ({ zoneId }) => {
            const fields = [
                { label: "DOB", value: personal?.dob, path: 'dob' },
                { label: "Nationality", value: personal?.nationality, path: 'nationality' },
                { label: "Status", value: personal?.maritalStatus, path: 'maritalStatus' },
                { label: "Visa", value: personal?.visaStatus, path: 'visaStatus' },
                { label: "Gender", value: personal?.gender, path: 'gender' },
                { label: "Religion", value: personal?.religion, path: 'religion' }
            ].filter(f => f.value && f.value !== "");
            if (fields.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="personalDetails" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Personal Details">
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Personal Info:" zoneId={zoneId} /> : <MainSectionTitle title="Personal Details" zoneId={zoneId} />}
                            <div style={isSidebar ? { display: "flex", flexDirection: "column", gap: "6px" } : { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px 20px" }}>
                                {fields.map((field, i) => (
                                    <div key={i} style={{ display: "flex", gap: "6px", fontSize: "calc(12px * var(--theme-font-scale, 1))" }}>
                                        <span style={{ fontWeight: "600", color: isSidebar ? sidebarText : rightAccent }}>{field.label}:</span>
                                        <span style={{ color: isSidebar ? sidebarSubtext : rightText }}>
                                            <RichTextSpellCheck html={field.value} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('personal', field.path, val)} />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── ADDITIONAL INFO ───────────────────────────────────────────────────
        additionalInfo: ({ isContinued, subItemRanges: renderSubItemRanges, zoneId }) => {
            const html = data.additionalInfo || "";
            if (!html || html.trim() === "" || html === "<p><br></p>") return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="additionalInfo" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Information">
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Additional Information:" zoneId={zoneId} /> : <MainSectionTitle title="Additional Information" zoneId={zoneId} />}
                            <div className="resume-rich-text" style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", lineHeight: "1.6", color: isSidebar ? sidebarSubtext : rightText }}>
                                <SplittableRichText html={html} range={renderSubItemRanges?.additionalInfo}
                                    isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                    onReplace={(val) => onSpellCheckReplace('additionalInfo', 'additionalInfo', val)} />
                            </div>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── CUSTOM SECTION ────────────────────────────────────────────────────
        custom: ({ isContinued, subItemRanges: renderSubItemRanges, zoneId }) => {
            if (!data.customSection?.isVisible || !data.customSection?.content) return null;
            const content = data.customSection.content;
            if (!content || content.trim() === "" || content === "<p><br></p>") return null;
            const title = data.customSection.title || "Additional Information";
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="custom" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <div style={{ paddingBottom: "1px" }}>
                        <div>
                            {isSidebar ? <SidebarSectionTitle title={`${title}:`} zoneId={zoneId} /> : <MainSectionTitle title={title} zoneId={zoneId} />}
                            <div className="resume-rich-text" style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", lineHeight: "1.6", color: isSidebar ? sidebarSubtext : rightText }}>
                                <SplittableRichText html={content} range={renderSubItemRanges?.custom}
                                    isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                    onReplace={(val) => onSpellCheckReplace('customSection', 'content', val)} />
                            </div>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
    };

    // ════════════════════════════════════════════════════════════════════════════
    //  HEADER — integrated into sidebar top (rendered only on page 0)
    // ════════════════════════════════════════════════════════════════════════════
    const Header = () => {
        const nameParts = (personal?.name || "YOUR NAME").split(" ");
        const firstName = nameParts[0] || "";
        const rest = nameParts.slice(1).join(" ");
        return (
            <SectionWrapper sectionId="personal" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Header">
                <div style={styles.sidebarHeader}>

                    <h1 style={{ margin: 0 }}>
                        <div style={styles.firstName}>
                            <SpellCheckText text={firstName} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                onReplace={(val) => onSpellCheckReplace('personal', 'name', val)} />
                        </div>
                        {rest && (
                            <div style={styles.lastName}>
                                <SpellCheckText text={rest} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                    onReplace={(val) => onSpellCheckReplace('personal', 'name', val)} />
                            </div>
                        )}
                    </h1>
                    {personal?.profession && (
                        <div style={styles.profession}>
                            <SpellCheckText text={personal.profession} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore}
                                onReplace={(val) => onSpellCheckReplace('personal', 'profession', val)} />
                        </div>
                    )}
                </div>
            </SectionWrapper>
        );
    };

    // ════════════════════════════════════════════════════════════════════════════
    //  ZONE RENDERER
    // ════════════════════════════════════════════════════════════════════════════
    const renderZone = (id, items, colStyle) => (
        <DroppableZone id={id} style={colStyle}>
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

    // ════════════════════════════════════════════════════════════════════════════
    //  MEASURER
    // ════════════════════════════════════════════════════════════════════════════
    const Measurer = () => (
        <div className="resume-measurer" style={{ position: "absolute", top: -10000, left: -10000, width: "210mm", visibility: "hidden" }}>
            <div className="page-height-marker" style={{ height: "297mm", width: "1px", position: "absolute", left: 0, top: 0 }} />
            <div style={{ ...styles.page, minHeight: "100%", height: "auto" }}>
                <div style={{ ...styles.sidebar, height: "100%" }}>
                    <Header />
                    <div data-column-id="sidebar" style={{ ...styles.sidebarBody }}>
                        {activeSidebarSections.map(sid => (
                            <div key={sid} style={{ paddingBottom: "1px" }}>
                                <SectionRenderer sectionId={sid} data={data} customRenderers={customRenderers} zoneId="sidebar" />
                            </div>
                        ))}
                    </div>
                </div>
                <div data-column-id="main" style={styles.mainCol}>
                    {activeMainSections.map(sid => (
                        <div key={sid} style={{ paddingBottom: "1px" }}>
                            <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="main" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const sidebarGap = { display: "flex", flexDirection: "column", gap: "calc(20px * var(--theme-section-margin, 1))", flex: 1 };
    const mainGap = { display: "flex", flexDirection: "column", gap: "calc(22px * var(--theme-section-margin, 1))", flex: 1 };

    // ════════════════════════════════════════════════════════════════════════════
    //  RENDER
    // ════════════════════════════════════════════════════════════════════════════
    return (
        <div ref={containerRef} className="artistic-graphic-root">
            <style>{`
                .artistic-graphic-root .resume-page {
                    background-color: ${rightBg} !important;
                    background: ${rightBg} !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            `}</style>
            <Measurer />
            <DndContext {...dndContextProps}>
                <SortableContext items={[...activeSidebarSections, ...activeMainSections]} strategy={verticalListSortingStrategy}>
                    {showPageBreaks && pages ? (
                        pages.map((page, i) => (
                            <div key={i} className="resume-page" style={{ ...styles.page, height: "297mm", backgroundColor: rightBg, WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
                                {/* Sidebar */}
                                <div style={{ ...styles.sidebar, height: "100%" }}>
                                    {i === 0 && <Header />}
                                    <div style={styles.sidebarBody}>
                                        {renderZone(`sidebar-p${i}`, page.sidebar, sidebarGap)}
                                    </div>
                                </div>
                                {/* Main */}
                                <div style={styles.mainCol}>
                                    {renderZone(`main-p${i}`, page.main, mainGap)}
                                </div>
                                <div style={{ position: "absolute", bottom: "12px", right: "16px", fontSize: "10px", opacity: 0.35, color: "#666" }}>
                                    Page {i + 1}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="resume-page" style={{ ...styles.page, height: "auto", backgroundColor: rightBg, WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
                            {/* Sidebar */}
                            <div style={{ ...styles.sidebar, height: "100%" }}>
                                <Header />
                                <div style={styles.sidebarBody}>
                                    {renderZone('sidebar', activeSidebarSections, sidebarGap)}
                                </div>
                            </div>
                            {/* Main */}
                            <div style={styles.mainCol}>
                                {renderZone('main', activeMainSections, mainGap)}
                            </div>
                        </div>
                    )}
                </SortableContext>
                <StableResumeDragOverlay
                    activeId={activeId}
                    scale={scale}
                    renderSection={(id) => (
                        <div style={{ background: "white", padding: "10px", border: "1px solid #d1d5db", borderRadius: "4px", width: "260px" }}>
                            <SectionRenderer sectionId={id} data={data} customRenderers={customRenderers} />
                        </div>
                    )}
                />
            </DndContext>
        </div>
    );
};

ArtisticGraphic.templateId = 'artistic-graphic';

export default ArtisticGraphic;