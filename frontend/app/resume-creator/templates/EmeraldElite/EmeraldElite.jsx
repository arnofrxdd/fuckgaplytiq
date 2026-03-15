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
    ResumeLink,
} from "../common/BaseComponents";
import { getCompleteLayout, getSavedLayout } from "../common/TemplateUtils";

/**
 * PicTemplate
 * Matches the "Pic" resume layout:
 * - Full-page blue border/frame
 * - White header: photo (left) + name/profession (right)
 * - Sidebar (left ~30%): light blue-gray bg, Contact, Education, etc.
 * - Main (right ~70%): white bg, Summary, Skills (2-col grid), Work History, etc.
 * - Uppercase bold section titles, accent blue color
 * - Full CSS variable support: --theme-color, --theme-font, --theme-font-scale,
 *   --theme-line-height, --theme-paragraph-margin, --theme-section-margin, --theme-page-margin
 */
const EmeraldElite = ({
    data,
    onSectionClick,
    onReorder,
    scale = 1,
    isSpellCheckActive,
    onSpellCheckIgnore,
    onSpellCheckReplace,
    layoutConfig,
    showPageBreaks,
}) => {
    const containerRef = useRef(null);

    if (!data) return null;
    const { personal } = data;
    const isInteractive = !!onSectionClick && !isSpellCheckActive;
    const canReorder = !!onReorder && !isSpellCheckActive;

    // --- LAYOUT ENGINE ---
    const templateId = "emerald-elite";
    const initialLayout = getSavedLayout(data, templateId, {
        main: ["summary", "skills", "experience", "education", "projects", "custom"],
        sidebar: ["contact", "personalDetails", "websites", "languages", "certifications", "strengths", "additionalSkills", "software", "interests", "awards"],
    });
    const completeLayout = getCompleteLayout(data, initialLayout, "main");
    const activeMainSections = completeLayout.main || [];
    const activeSidebarSections = completeLayout.sidebar || [];

    // --- DND ---
    const { dndContextProps, activeId } = useResumeDragAndDrop({
        data,
        onReorder,
        scale,
        containers: { main: activeMainSections, sidebar: activeSidebarSections },
    });

    // --- PAGINATION ---
    const pages = useAutoPagination({
        columns: { main: activeMainSections, sidebar: activeSidebarSections },
        data,
        enabled: showPageBreaks,
        containerRef,
        scale,
    });

    // --- STYLES ---
    const ACCENT = "var(--theme-color, #5b9bd5)";
    const SIDEBAR_BG = "#e8f0f7";
    const BORDER_COLOR = "var(--theme-color, #5b9bd5)";
    const BORDER_WIDTH = "18px";

    const styles = {
        page: {
            width: "210mm",
            height: "297mm",
            background: "white",
            boxSizing: "border-box",
            position: "relative",
            margin: "0 auto 30px auto",
            color: "#2d2d2d",
            fontFamily: "var(--theme-font, 'Georgia', serif)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            // Blue border frame
            border: `${BORDER_WIDTH} solid ${BORDER_COLOR}`,
        },
        // Header zone: white bg, photo left, name right
        headerZone: {
            display: "flex",
            alignItems: "stretch",
            background: "white",
            minHeight: "130px",
            borderBottom: `1px solid #d0dce8`,
            flexShrink: 0,
        },
        photoBox: {
            width: "130px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px 16px 16px 16px",
            background: "white",
        },
        photoImg: {
            width: "100px",
            height: "100px",
            objectFit: "cover",
            display: "block",
            border: "1px solid #c0cdd8",
        },
        photoPlaceholder: {
            width: "100px",
            height: "100px",
            background: "#e0e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #c0cdd8",
            color: "#8899aa",
            fontSize: "12px",
        },
        headerNameArea: {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "20px 30px 20px 10px",
            background: "white",
        },
        name: {
            fontSize: "calc(34px * var(--theme-font-scale, 1))",
            fontWeight: "900",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "#1a1a1a",
            margin: 0,
            fontFamily: "var(--theme-font, 'Georgia', serif)",
            lineHeight: 1.1,
        },
        nameAccentLine: {
            width: "48px",
            height: "3px",
            background: ACCENT,
            margin: "8px 0",
        },
        profession: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            fontWeight: "400",
            color: "#888",
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            fontFamily: "var(--theme-font, 'Georgia', serif)",
        },
        // Body: sidebar + main separated by vertical line
        bodyZone: {
            display: "flex",
            flex: 1,
            minHeight: 0,
        },
        sidebarColumn: {
            width: "30%",
            background: SIDEBAR_BG,
            paddingTop: "24px", // Fixed internal spacing from header
            paddingLeft: "var(--theme-page-margin, 24px)",
            paddingRight: "18px", // Internal gutter
            paddingBottom: "var(--theme-page-margin, 40px)",
            display: "flex",
            flexDirection: "column",
            gap: "calc(22px * var(--theme-section-margin, 1))",
            boxSizing: "border-box",
            borderRight: `1px solid #c8d8e8`,
        },
        mainColumn: {
            flex: 1,
            background: "white",
            paddingTop: "24px", // Fixed internal spacing from header
            paddingRight: "var(--theme-page-margin, 28px)",
            paddingBottom: "var(--theme-page-margin, 40px)",
            paddingLeft: "28px", // Fixed internal spacing from sidebar
            display: "flex",
            flexDirection: "column",
            gap: "calc(22px * var(--theme-section-margin, 1))",
            boxSizing: "border-box",
        },
        // Sidebar section title: uppercase bold, no border, just spacing
        sidebarSectionTitle: {
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            fontWeight: "800",
            color: "#1a1a1a",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginTop: "0",
            marginBottom: "10px",
            fontFamily: "var(--theme-font, 'Georgia', serif)",
            boxSizing: "border-box",
        },
        // Main section title: uppercase bold, slightly larger
        mainSectionTitle: {
            fontSize: "calc(14px * var(--theme-font-scale, 1))",
            fontWeight: "800",
            color: "#1a1a1a",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginTop: "0",
            marginBottom: "12px",
            fontFamily: "var(--theme-font, 'Georgia', serif)",
            boxSizing: "border-box",
        },
        // Contact items
        contactItem: {
            marginBottom: "calc(8px * var(--theme-paragraph-margin, 1))",
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: "#2d2d2d",
            lineHeight: "var(--theme-line-height, 1.5)",
            wordBreak: "break-word",
        },
        contactLabel: {
            fontWeight: "700",
            color: "#1a1a1a",
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
        },
        // Education items in sidebar
        eduDate: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            color: "#555",
            marginBottom: "2px",
        },
        eduDegree: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: "#555",
            marginBottom: "2px",
        },
        eduSchool: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "#1a1a1a",
            lineHeight: "var(--theme-line-height, 1.4)",
        },
        // Summary text
        summaryText: {
            fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.65)",
            color: "#333",
        },
        // Skills 2-column grid
        skillsGrid: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "calc(4px * var(--theme-paragraph-margin, 1)) 20px",
        },
        skillItem: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: "#2d2d2d",
            lineHeight: "var(--theme-line-height, 1.5)",
            display: "flex",
            alignItems: "flex-start",
            gap: "6px",
        },
        skillBullet: {
            color: ACCENT,
            marginTop: "3px",
            flexShrink: 0,
            fontSize: "10px",
        },
        // Work History
        expDateLine: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: "#444",
            marginBottom: "4px",
            lineHeight: "var(--theme-line-height, 1.4)",
        },
        expTitle: {
            fontWeight: "700",
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            color: "#1a1a1a",
        },
        expCompany: {
            fontStyle: "italic",
            fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
            color: "#333",
        },
        expDesc: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.6)",
            color: "#333",
            marginTop: "6px",
        },
        expItem: {
            marginBottom: "calc(18px * var(--theme-paragraph-margin, 1))",
        },
    };

    // --- SECTION TITLE COMPONENTS ---
    const SidebarTitle = ({ title }) => {
        const { isContinued } = useSectionContext();
        return (
            <div style={styles.sidebarSectionTitle}>
                {isContinued ? `${title} (Cont.)` : title}
            </div>
        );
    };

    const MainTitle = ({ title }) => {
        const { isContinued } = useSectionContext();
        return (
            <div style={styles.mainSectionTitle}>
                {isContinued ? `${title} (Cont.)` : title}
            </div>
        );
    };

    // --- HEADER COMPONENT ---
    const Header = () => (
        <SectionWrapper sectionId="personal" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Header">
            <div style={styles.headerZone}>
                {/* Photo box always rendered */}
                <div style={styles.photoBox}>
                    {personal?.photo ? (
                        <img src={personal.photo} style={styles.photoImg} alt="profile" />
                    ) : (
                        <div style={styles.photoPlaceholder}>
                            <span style={{ fontSize: "11px", textAlign: "center" }}>PHOTO</span>
                        </div>
                    )}
                </div>
                {/* Name + profession */}
                <div style={styles.headerNameArea}>
                    <h1 style={styles.name}>
                        <SpellCheckText
                            text={personal?.name || "YOUR NAME"}
                            isActive={isSpellCheckActive}
                            onIgnore={onSpellCheckIgnore}
                            onReplace={(val) => onSpellCheckReplace("personal", "name", val)}
                        />
                    </h1>
                    <div style={styles.nameAccentLine} />
                    <div style={styles.profession}>
                        <SpellCheckText
                            text={personal?.profession || "PROFESSION"}
                            isActive={isSpellCheckActive}
                            onIgnore={onSpellCheckIgnore}
                            onReplace={(val) => onSpellCheckReplace("personal", "profession", val)}
                        />
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );

    // --- CUSTOM RENDERERS ---
    const customRenderers = {
        // MAIN COLUMN SECTIONS
        summary: ({ isContinued, subItemRanges, zoneId }) => {
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");
            return (
                <SectionWrapper sectionId="summary" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Summary">
                    <div>
                        {isSidebar ? <SidebarTitle title="Summary" /> : <MainTitle title="Professional Summary" />}
                        <div className="resume-rich-text" style={isSidebar ? { fontSize: "calc(11.5px * var(--theme-font-scale, 1))", lineHeight: "1.5" } : styles.summaryText}>
                            <SplittableRichText
                                html={data.summary}
                                range={subItemRanges?.summary}
                                isActive={isSpellCheckActive}
                                onIgnore={onSpellCheckIgnore}
                                onReplace={(val) => onSpellCheckReplace("summary", "summary", val)}
                            />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        skills: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices
                ? itemIndices.map((idx) => data.skills?.[idx]).filter(Boolean)
                : data.skills || [];
            const hasDescription = data.skillsDescription && data.skillsDescription.trim();
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");

            if (items.length > 0) {
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <div>
                            {isSidebar ? <SidebarTitle title="Skills" /> : <MainTitle title="Skills" />}
                            <div style={isSidebar ? { display: "flex", flexDirection: "column", gap: "6px" } : styles.skillsGrid}>
                                {items.map((skill, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <div key={originalIdx} data-item-index={originalIdx} style={styles.skillItem}>
                                            <span style={styles.skillBullet}>●</span>
                                            <RichTextSpellCheck
                                                html={typeof skill === "object" ? skill.name : skill}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace("skills", originalIdx, val, "name")}
                                            />
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
                            {isSidebar ? <SidebarTitle title="Skills" /> : <MainTitle title="Skills" />}
                            <div className="resume-rich-text" style={isSidebar ? { fontSize: "calc(11.5px * var(--theme-font-scale, 1))", lineHeight: "1.5" } : styles.summaryText}>
                                <SplittableRichText
                                    html={data.skillsDescription}
                                    isActive={isSpellCheckActive}
                                    onIgnore={onSpellCheckIgnore}
                                    onReplace={(val) => onSpellCheckReplace("skills", "skillsDescription", val)}
                                />
                            </div>
                        </div>
                    </SectionWrapper>
                );
            }
            return null;
        },

        experience: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.experience?.[idx]) : data.experience;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");
            return (
                <SectionWrapper sectionId="experience" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Experience">
                    <div>
                        {isSidebar ? <SidebarTitle title="Experience" /> : <MainTitle title="Work History" />}
                        {items.map((exp, i) => {
                            if (!exp) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr =
                                exp.year ||
                                exp.date ||
                                (exp.startYear
                                    ? `${exp.startYear} - ${exp.isCurrent ? "Current" : exp.endYear}`
                                    : "");
                            const companyStr = [exp.company, exp.location]
                                .filter(Boolean)
                                .join(", ") + (exp.isRemote ? " • Remote" : "");

                            if (isSidebar) {
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(14px * var(--theme-paragraph-margin, 1))" }}>
                                        <div style={styles.eduDate}>
                                            <RichTextSpellCheck html={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("experience", originalIdx, val, "date")} />
                                        </div>
                                        <div style={styles.eduDegree}>
                                            <RichTextSpellCheck html={exp.title || exp.role || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("experience", originalIdx, val, "title")} />
                                        </div>
                                        <div style={styles.eduSchool}>
                                            <RichTextSpellCheck html={exp.company || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("experience", originalIdx, val, "company")} />
                                        </div>
                                        <div className="resume-rich-text" style={{ fontSize: "calc(11.5px * var(--theme-font-scale, 1))", lineHeight: "1.5", color: "#444", marginTop: "4px" }}>
                                            <SplittableRichText
                                                html={exp.description}
                                                range={subItemRanges?.[originalIdx]}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace("experience", originalIdx, val, "description")}
                                            />
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.expItem}>
                                    {dateStr && (
                                        <div style={styles.expDateLine}>
                                            <RichTextSpellCheck
                                                html={dateStr}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace("experience", originalIdx, val, "date")}
                                            />
                                        </div>
                                    )}
                                    <div style={{ lineHeight: "1.4", marginBottom: "4px" }}>
                                        <span style={styles.expTitle}>
                                            <RichTextSpellCheck
                                                html={exp.title || exp.role || ""}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace("experience", originalIdx, val, "title")}
                                            />
                                        </span>
                                        {companyStr && (
                                            <>
                                                <span style={{ color: "#555", fontWeight: "400", fontSize: "calc(12.5px * var(--theme-font-scale, 1))" }}>, </span>
                                                <span style={styles.expCompany}>
                                                    <RichTextSpellCheck
                                                        html={companyStr}
                                                        isActive={isSpellCheckActive}
                                                        onIgnore={onSpellCheckIgnore}
                                                        onReplace={(val) => onSpellCheckReplace("experience", originalIdx, val, "company")}
                                                    />
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <div className="resume-rich-text" style={styles.expDesc}>
                                        <SplittableRichText
                                            html={exp.description}
                                            range={subItemRanges?.[originalIdx]}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace("experience", originalIdx, val, "description")}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        education: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.education?.[idx]) : data.education;
            if (!items || items.length === 0) return null;

            // Check if education is in sidebar zone
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");

            if (isSidebar) {
                return (
                    <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
                        <div>
                            <SidebarTitle title="Education" />
                            {items.map((edu, i) => {
                                if (!edu) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(14px * var(--theme-paragraph-margin, 1))" }}>
                                        <div style={styles.eduDate}>
                                            <RichTextSpellCheck
                                                html={edu.year || edu.date || edu.endYear || ""}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "year")}
                                            />
                                        </div>
                                        <div style={styles.eduDegree}>
                                            <RichTextSpellCheck
                                                html={edu.degree || ""}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "degree")}
                                            />
                                        </div>
                                        <div style={styles.eduSchool}>
                                            <RichTextSpellCheck
                                                html={[edu.institution || edu.school, edu.location].filter(Boolean).join(", ")}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "institution")}
                                            />
                                        </div>
                                        {edu.grade && (
                                            <div style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", color: "#666", marginTop: "2px" }}>
                                                GPA: {edu.grade}
                                            </div>
                                        )}
                                        {edu.description && (
                                            <div className="resume-rich-text" style={{ fontSize: "calc(11.5px * var(--theme-font-scale, 1))", lineHeight: "var(--theme-line-height, 1.5)", color: "#444", marginTop: "4px" }}>
                                                <SplittableRichText
                                                    html={edu.description}
                                                    isActive={isSpellCheckActive}
                                                    onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "description")}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </SectionWrapper>
                );
            }

            // Main column layout: date col + content col
            return (
                <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
                    <div>
                        <MainTitle title="Education" />
                        {items.map((edu, i) => {
                            if (!edu) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.expItem}>
                                    <div style={styles.expDateLine}>
                                        <RichTextSpellCheck
                                            html={edu.year || edu.date || edu.endYear || ""}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "year")}
                                        />
                                    </div>
                                    <div style={{ fontWeight: "700", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#1a1a1a" }}>
                                        <RichTextSpellCheck
                                            html={edu.degree || ""}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "degree")}
                                        />
                                    </div>
                                    <div style={{ fontStyle: "italic", fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: ACCENT }}>
                                        <RichTextSpellCheck
                                            html={[edu.institution || edu.school, edu.location].filter(Boolean).join(", ")}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "institution")}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        projects: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.projects?.[idx]) : data.projects;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");
            return (
                <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
                    <div>
                        {isSidebar ? <SidebarTitle title="Projects" /> : <MainTitle title="Projects" />}
                        {items.map((proj, i) => {
                            if (!proj) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr =
                                proj.year ||
                                (proj.startYear && `${proj.startYear} - ${proj.isCurrent ? "Present" : proj.endYear || "Present"}`);

                            if (isSidebar) {
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(14px * var(--theme-paragraph-margin, 1))" }}>
                                        <div style={styles.eduDate}>
                                            <RichTextSpellCheck html={dateStr || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("projects", originalIdx, val, "year")} />
                                        </div>
                                        <div style={styles.eduSchool}>
                                            <RichTextSpellCheck html={proj.title || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("projects", originalIdx, val, "title")} />
                                        </div>
                                        <div className="resume-rich-text" style={{ fontSize: "calc(11.5px * var(--theme-font-scale, 1))", lineHeight: "1.5", color: "#444", marginTop: "4px" }}>
                                            <SplittableRichText
                                                html={proj.description}
                                                range={subItemRanges?.[originalIdx]}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace("projects", originalIdx, val, "description")}
                                            />
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.expItem}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                        <div style={{ fontWeight: "700", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#1a1a1a" }}>
                                            <RichTextSpellCheck
                                                html={proj.title}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace("projects", originalIdx, val, "title")}
                                            />
                                        </div>
                                        {dateStr && (
                                            <div style={{ fontSize: "calc(11.5px * var(--theme-font-scale, 1))", color: "#666" }}>
                                                <SpellCheckText
                                                    text={dateStr}
                                                    isActive={isSpellCheckActive}
                                                    onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace("projects", originalIdx, val, "year")}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {proj.link && (
                                        <div style={{ fontSize: "calc(11.5px * var(--theme-font-scale, 1))", color: ACCENT, marginBottom: "4px" }}>
                                            <ResumeLink href={proj.link}>
                                                <RichTextSpellCheck html={proj.link} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("projects", originalIdx, val, "link")} />
                                            </ResumeLink>
                                        </div>
                                    )}
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "6px" }}>
                                            {proj.technologies.map((tech, tIdx) => (
                                                <span key={tIdx} style={{ fontSize: "calc(10.5px * var(--theme-font-scale, 1))", padding: "2px 8px", background: "#e8f0f7", borderRadius: "10px", color: "#444" }}>
                                                    <RichTextSpellCheck html={tech} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => { const u = [...proj.technologies]; u[tIdx] = val; onSpellCheckReplace("projects", originalIdx, u, "technologies"); }} />
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="resume-rich-text" style={styles.expDesc}>
                                        <SplittableRichText
                                            html={proj.description}
                                            range={subItemRanges?.[originalIdx]}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace("projects", originalIdx, val, "description")}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        custom: ({ isContinued, subItemRanges: renderSubItemRanges, zoneId }) => {
            if (!data.customSection?.isVisible || !data.customSection?.content) return null;
            const content = data.customSection.content;
            if (!content || content.trim() === "" || content === "<p><br></p>") return null;
            const title = data.customSection.title || "Additional Information";
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");
            return (
                <SectionWrapper sectionId="custom" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <div>
                        {isSidebar ? <SidebarTitle title={title} /> : <MainTitle title={title} />}
                        <div className="resume-rich-text" style={isSidebar ? { fontSize: "calc(11.5px * var(--theme-font-scale, 1))", lineHeight: "1.5" } : styles.summaryText}>
                            <SplittableRichText
                                html={content}
                                range={renderSubItemRanges?.custom}
                                isActive={isSpellCheckActive}
                                onIgnore={onSpellCheckIgnore}
                                onReplace={(val) => onSpellCheckReplace("customSection", "content", val)}
                            />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        additionalInfo: ({ isContinued, subItemRanges: renderSubItemRanges, zoneId }) => {
            const html = data.additionalInfo || "";
            if (!html || html.trim() === "" || html === "<p><br></p>") return null;
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");
            return (
                <SectionWrapper sectionId="additionalInfo" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Information">
                    <div>
                        {isSidebar ? <SidebarTitle title="Information" /> : <MainTitle title="Additional Information" />}
                        <div className="resume-rich-text" style={isSidebar ? { fontSize: "calc(11.5px * var(--theme-font-scale, 1))", lineHeight: "1.5" } : styles.summaryText}>
                            <SplittableRichText
                                html={html}
                                range={renderSubItemRanges?.additionalInfo}
                                isActive={isSpellCheckActive}
                                onIgnore={onSpellCheckIgnore}
                                onReplace={(val) => onSpellCheckReplace("additionalInfo", "additionalInfo", val)}
                            />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // SIDEBAR SECTIONS
        contact: ({ zoneId }) => {
            const websiteItems = data.websites || [];
            const contactLinks = [
                { label: "LinkedIn", value: personal?.linkedin, field: "linkedin" },
                { label: "GitHub", value: personal?.github, field: "github" },
                { label: "Website", value: personal?.website, field: "website" },
                ...websiteItems
                    .map((link, idx) => ({ ...link, originalIdx: idx }))
                    .filter((link) => link.addToHeader && link.url)
                    .map((link) => ({ label: link.label || "Website", value: link.url, field: "url", type: "websites", idx: link.originalIdx })),
            ];

            return (
                <SectionWrapper sectionId="contact" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Contact">
                    <div>
                        <SidebarTitle title="Contact" />
                        {personal?.city && (
                            <div style={styles.contactItem}>
                                <SpellCheckText
                                    text={[personal?.city, personal?.state, personal?.zipCode, personal?.country].filter(Boolean).join(", ")}
                                    isActive={isSpellCheckActive}
                                    onIgnore={onSpellCheckIgnore}
                                    onReplace={(val) => onSpellCheckReplace("personal", "city", val)}
                                />
                            </div>
                        )}
                        {personal?.phone && (
                            <div style={styles.contactItem}>
                                <span style={styles.contactLabel}>Mobile: </span>
                                <ResumeLink href={personal.phone}>
                                    <SpellCheckText
                                        text={personal.phone}
                                        isActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onReplace={(val) => onSpellCheckReplace("personal", "phone", val)}
                                    />
                                </ResumeLink>
                            </div>
                        )}
                        {personal?.email && (
                            <div style={styles.contactItem}>
                                <ResumeLink href={personal.email}>
                                    <SpellCheckText
                                        text={personal.email}
                                        isActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onReplace={(val) => onSpellCheckReplace("personal", "email", val)}
                                    />
                                </ResumeLink>
                            </div>
                        )}
                        {contactLinks.map(
                            (link, i) =>
                                link.value && (
                                    <div key={i} style={styles.contactItem}>
                                        <span style={styles.contactLabel}>{link.label}: </span>
                                        <ResumeLink href={link.value}>
                                            <SpellCheckText
                                                text={link.value}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) =>
                                                    onSpellCheckReplace(
                                                        link.type || "personal",
                                                        link.type === "websites" ? link.idx : link.field,
                                                        val,
                                                        link.type === "websites" ? "url" : null
                                                    )
                                                }
                                            />
                                        </ResumeLink>
                                    </div>
                                )
                        )}
                    </div>
                </SectionWrapper>
            );
        },

        websites: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.websites?.[idx]) : data.websites;
            const portfolioLinks = (items || [])
                .map((link, idx) => ({ ...link, originalIdx: itemIndices ? itemIndices[idx] : idx }))
                .filter((link) => !link.addToHeader && link.url);
            if (portfolioLinks.length === 0) return null;
            return (
                <SectionWrapper sectionId="websites" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Websites & Portfolios">
                    <div>
                        <SidebarTitle title="Websites & Portfolios" />
                        {portfolioLinks.map((site, i) => (
                            <div key={i} style={styles.contactItem}>
                                <span style={styles.contactLabel}>{site.label || "Portfolio"}: </span>
                                <ResumeLink href={site.url}>
                                    <SpellCheckText
                                        text={site.url}
                                        isActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onReplace={(val) => onSpellCheckReplace("websites", site.originalIdx, val, "url")}
                                    />
                                </ResumeLink>
                            </div>
                        ))}
                    </div>
                </SectionWrapper>
            );
        },

        strengths: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices
                ? itemIndices.map((idx) => data.strengths?.[idx]).filter(Boolean)
                : data.strengths || [];
            if (items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");
            return (
                <SectionWrapper sectionId="strengths" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Strengths">
                    <div>
                        {isSidebar ? <SidebarTitle title="Key Strengths" /> : <MainTitle title="Key Strengths" />}
                        <ul className="resume-rich-text" style={{ paddingLeft: "14px", margin: 0 }}>
                            {items.map((skill, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const lvl = typeof skill === "object" ? skill.level ?? skill.rating : null;
                                return (
                                    <li key={originalIdx} data-item-index={originalIdx} style={{ marginBottom: "calc(6px * var(--theme-paragraph-margin, 1))", fontSize: "calc(12px * var(--theme-font-scale, 1))", lineHeight: "var(--theme-line-height, 1.5)" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <RichTextSpellCheck
                                                html={typeof skill === "object" ? skill.name : skill}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace("strengths", originalIdx, val, "name")}
                                            />
                                            {lvl > 0 && (
                                                <span style={{ display: "flex", gap: "2px", marginLeft: "6px" }}>
                                                    {[...Array(5)].map((_, di) => (
                                                        <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? ACCENT : "#c5d5e5" }} />
                                                    ))}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </SectionWrapper>
            );
        },

        additionalSkills: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices
                ? itemIndices.map((idx) => data.additionalSkills?.[idx]).filter(Boolean)
                : data.additionalSkills || [];
            if (items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");
            return (
                <SectionWrapper sectionId="additionalSkills" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Skills">
                    <div>
                        {isSidebar ? <SidebarTitle title="Additional Skills" /> : <MainTitle title="Additional Skills" />}
                        <ul className="resume-rich-text" style={{ paddingLeft: "14px", margin: 0 }}>
                            {items.map((skill, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const lvl = typeof skill === "object" ? skill.level ?? skill.rating : null;
                                return (
                                    <li key={originalIdx} data-item-index={originalIdx} style={{ marginBottom: "calc(6px * var(--theme-paragraph-margin, 1))", fontSize: "calc(12px * var(--theme-font-scale, 1))", lineHeight: "var(--theme-line-height, 1.5)" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <RichTextSpellCheck
                                                html={typeof skill === "object" ? skill.name : skill}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace("additionalSkills", originalIdx, val, "name")}
                                            />
                                            {lvl > 0 && (
                                                <span style={{ display: "flex", gap: "2px", marginLeft: "6px" }}>
                                                    {[...Array(5)].map((_, di) => (
                                                        <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? ACCENT : "#c5d5e5" }} />
                                                    ))}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </SectionWrapper>
            );
        },

        languages: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.languages?.[idx]) : data.languages;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");
            return (
                <SectionWrapper sectionId="languages" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Languages">
                    <div>
                        {isSidebar ? <SidebarTitle title="Languages" /> : <MainTitle title="Languages" />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((lang, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <LanguageItem
                                        key={i}
                                        item={lang}
                                        index={originalIdx}
                                        isSpellCheckActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onSpellCheckReplace={(field, val) => onSpellCheckReplace("languages", originalIdx, val, field)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        certifications: ({ itemIndices, isContinued, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.certifications?.[idx]) : data.certifications;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");
            return (
                <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
                    <div>
                        {isSidebar ? <SidebarTitle title="Certifications" /> : <MainTitle title="Certifications" />}
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
                                        onSpellCheckReplace={(field, val) => onSpellCheckReplace("certifications", originalIdx, val, field)}
                                        variant={isSidebar ? "compact" : undefined}
                                        subItemRange={renderSubItemRanges?.[originalIdx]}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        software: ({ itemIndices, isContinued, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.software?.[idx]) : data.software;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");
            return (
                <SectionWrapper sectionId="software" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Software">
                    <div>
                        {isSidebar ? <SidebarTitle title="Software" /> : <MainTitle title="Software" />}
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
                                        onSpellCheckReplace={(field, val) => onSpellCheckReplace("software", originalIdx, val, field)}
                                        variant={isSidebar ? "compact" : undefined}
                                        subItemRange={renderSubItemRanges?.[originalIdx]}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        interests: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.interests?.[idx]) : data.interests;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");
            return (
                <SectionWrapper sectionId="interests" navigationId="interests" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Interests">
                    <div>
                        {isSidebar ? <SidebarTitle title="Interests" /> : <MainTitle title="Interests" />}
                        <ul className="resume-rich-text" style={{ paddingLeft: "14px", margin: 0, display: "flex", flexDirection: "column", gap: "calc(5px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((item, i) => (
                                <li key={i} data-item-index={itemIndices ? itemIndices[i] : i} style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", lineHeight: "var(--theme-line-height, 1.5)" }}>
                                    <RichTextSpellCheck
                                        html={typeof item === "object" ? item.name : item}
                                        isActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onReplace={(val) => onSpellCheckReplace("interests", itemIndices ? itemIndices[i] : i, val, "name")}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </SectionWrapper>
            );
        },

        awards: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.awards?.[idx]) : data.awards;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");
            return (
                <SectionWrapper sectionId="awards" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Awards">
                    <div>
                        {isSidebar ? <SidebarTitle title="Awards" /> : <MainTitle title="Awards" />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((award, i) => (
                                <div key={i} style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))" }}>
                                    <div style={{ fontWeight: "700", color: "#1a1a1a" }}>
                                        <RichTextSpellCheck html={award.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("awards", itemIndices ? itemIndices[i] : i, val, "title")} />
                                    </div>
                                    <div style={{ color: ACCENT, fontStyle: "italic", fontSize: "calc(11.5px * var(--theme-font-scale, 1))" }}>
                                        <RichTextSpellCheck html={award.issuer} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("awards", itemIndices ? itemIndices[i] : i, val, "issuer")} />
                                        {award.year && <span> • {award.year}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        volunteer: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.volunteer?.[idx]) : data.volunteer;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");
            return (
                <SectionWrapper sectionId="volunteer" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Volunteer">
                    <div>
                        {isSidebar ? <SidebarTitle title="Volunteer" /> : <MainTitle title="Volunteer" />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(12px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((item, i) => (
                                <div key={i}>
                                    <div style={{ fontWeight: "700", fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: "#1a1a1a" }}>
                                        <RichTextSpellCheck html={item.organization} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("volunteer", itemIndices ? itemIndices[i] : i, val, "organization")} />
                                    </div>
                                    <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: ACCENT }}>
                                        <RichTextSpellCheck html={item.role} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("volunteer", itemIndices ? itemIndices[i] : i, val, "role")} />
                                    </div>
                                    <div style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", color: "#666" }}>
                                        {item.startDate} - {item.isCurrent ? "Present" : item.endDate}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        publications: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.publications?.[idx]) : data.publications;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");
            return (
                <SectionWrapper sectionId="publications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Publications">
                    <div>
                        {isSidebar ? <SidebarTitle title="Publications" /> : <MainTitle title="Publications" />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((pub, i) => (
                                <div key={i}>
                                    <div style={{ fontWeight: "700", fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: "#1a1a1a" }}>
                                        <RichTextSpellCheck html={pub.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("publications", itemIndices ? itemIndices[i] : i, val, "name")} />
                                    </div>
                                    <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: ACCENT }}>
                                        <RichTextSpellCheck html={pub.publisher} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("publications", itemIndices ? itemIndices[i] : i, val, "publisher")} />
                                        {pub.releaseDate && <span> • {pub.releaseDate}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        personalDetails: ({ zoneId }) => {
            const { personal: p = {} } = data;
            const details = [
                { label: "Date of Birth", value: p.dob || p.dateOfBirth || p.birthDate },
                { label: "Nationality", value: p.nationality },
                { label: "Marital Status", value: p.maritalStatus || p.marital_status },
                { label: "Gender", value: p.gender },
                { label: "Religion", value: p.religion },
                { label: "Visa Status", value: p.visaStatus || p.visa_status },
                { label: "Passport", value: p.passport || p.passportNumber },
                { label: "Place of Birth", value: p.placeOfBirth },
                { label: "Driving License", value: p.drivingLicense },
                { label: "Other", value: p.otherPersonal || p.otherInformation },
            ].filter((d) => d.value);

            if (details.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");

            return (
                <SectionWrapper sectionId="personalDetails" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Personal Details">
                    <div>
                        {isSidebar ? <SidebarTitle title="Personal Info" /> : <MainTitle title="Personal Information" />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {details.map((d, i) => (
                                <div key={i} style={styles.contactItem}>
                                    <span style={styles.contactLabel}>{d.label}: </span>
                                    <SpellCheckText
                                        text={d.value}
                                        isActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onReplace={(val) => onSpellCheckReplace("personal", d.label.toLowerCase().replace(/ /g, ""), val)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
    };

    // --- RENDER ZONE ---
    const renderZone = (id, items, columnStyle) => (
        <DroppableZone id={id} style={{ ...columnStyle, flex: 1 }}>
            {items.map((sid, idx) => {
                const isContinued = typeof sid === "object" && sid.isContinued;
                const sectionId = typeof sid === "string" ? sid : sid.id;
                const dragId = isContinued ? `${id}-cont-${sectionId}-${idx}` : sectionId;
                return (
                    <DraggableSection key={dragId} id={dragId} isEnabled={canReorder && !isContinued}>
                        <div style={{ paddingBottom: "1px" }}>
                            <SectionRenderer
                                sectionId={sectionId}
                                data={data}
                                onSectionClick={onSectionClick}
                                isContinued={isContinued}
                                itemIndices={typeof sid === "object" ? sid.itemIndices : undefined}
                                subItemRanges={typeof sid === "object" ? sid.subItemRanges : undefined}
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
        <div
            className="resume-measurer"
            style={{ position: "absolute", top: -10000, left: -10000, width: "210mm", visibility: "hidden" }}
        >
            <div className="page-height-marker" style={{ height: "297mm", width: "1px", position: "absolute", left: 0, top: 0 }} />
            <div style={{ ...styles.page, height: "auto" }}>
                <Header />
                <div style={styles.bodyZone}>
                    <div data-column-id="sidebar" style={styles.sidebarColumn}>
                        {activeSidebarSections.map((sid) => (
                            <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="sidebar" />
                        ))}
                    </div>
                    <div data-column-id="main" style={styles.mainColumn}>
                        {activeMainSections.map((sid) => (
                            <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="main" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // --- MAIN RENDER ---
    return (
        <div ref={containerRef} className="emerald-elite-root">
            <Measurer />
            <DndContext {...dndContextProps}>
                <SortableContext
                    items={[...activeMainSections, ...activeSidebarSections]}
                    strategy={verticalListSortingStrategy}
                >
                    {showPageBreaks && pages ? (
                        pages.map((page, i) => (
                            <div key={i} className="resume-page" style={styles.page}>
                                {i === 0 && <Header />}
                                <div style={{ ...styles.bodyZone, flex: 1 }}>
                                    <div style={styles.sidebarColumn}>
                                        {renderZone(`sidebar-p${i}`, page.sidebar, {
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "calc(22px * var(--theme-section-margin, 1))",
                                        })}
                                    </div>
                                    <div style={styles.mainColumn}>
                                        {renderZone(`main-p${i}`, page.main, {
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "calc(22px * var(--theme-section-margin, 1))",
                                        })}
                                    </div>
                                </div>
                                <div style={{ position: "absolute", bottom: "8px", right: "14px", fontSize: "9px", opacity: 0.4 }}>
                                    Page {i + 1}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ ...styles.page, height: "auto", minHeight: "100%" }}>
                            <Header />
                            <div style={styles.bodyZone}>
                                <div style={styles.sidebarColumn}>
                                    {renderZone("sidebar", activeSidebarSections, {
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "calc(22px * var(--theme-section-margin, 1))",
                                    })}
                                </div>
                                <div style={styles.mainColumn}>
                                    {renderZone("main", activeMainSections, {
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "calc(22px * var(--theme-section-margin, 1))",
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
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

export default EmeraldElite;
