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
import { Mail, MapPin, Phone, Linkedin, Github, Globe, User } from "lucide-react";
import { getCompleteLayout, getSavedLayout } from "../common/TemplateUtils";

/**
 * SilverSerif Template
 * Matches the clean B&W finance/executive layout:
 * - Header: "NAME" (light gray) + "SURNAME" (dark bold) side-by-side, circular photo top-right
 * - Profession in red/coral italic cursive, summary paragraph, contact icons row with borders
 * - Section headers: full-width silver/gray filled bar with uppercase bold dark text
 * - Languages: 3-col name + short progress bar
 * - Education: left date col (small gray) + right content (degree bold, institution bold larger)
 * - Skills: "Hard:" + "Soft:" inline comma-separated
 * - Experience: left date+location col + right company ALLCAPS bold, role italic, bullet description
 * - Full CSS variable spacing support
 */
const SilverSerif = ({
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

    // --- LAYOUT ENGINE (single column like ClassicExecutive) ---
    const templateId = "silver-serif";
    const initialLayout = getSavedLayout(data, templateId, {
        main: [
            "languages",
            "education",
            "skills",
            "experience",
            "certifications",
            "personalDetails",
            "projects",
            "strengths",
            "additionalSkills",
            "software",
            "interests",
            "custom",
            "additionalInfo",
        ],
    });

    const completeLayout = getCompleteLayout(data, initialLayout, "main");
    const activeSections = completeLayout.main || [];

    const { dndContextProps, activeId } = useResumeDragAndDrop({
        data,
        onReorder,
        scale,
        containers: { main: activeSections },
    });

    const pages = useAutoPagination({
        columns: { main: activeSections },
        data,
        enabled: showPageBreaks,
        containerRef,
        scale,
    });

    // --- COLORS ---
    const DARK = "#1a1a1a";
    const MEDIUM = "#333";
    const LIGHT = "#666";
    const GRAY_NAME = "#aaaaaa"; // light gray for first name
    const RED_ACCENT = "var(--theme-color, #c0392b)"; // red/coral for profession
    const SECTION_BAR_BG = "#d4d4d4"; // silver/gray section header bar
    const DATE_COL_W = "110px";
    const PAGE_MARGIN = "var(--theme-page-margin, 36px)";

    // Helper: split name into first + last (or first-words + last-word)
    const splitName = (name) => {
        if (!name) return { first: "NAME", last: "SURNAME" };
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return { first: "", last: parts[0] };
        const last = parts[parts.length - 1];
        const first = parts.slice(0, -1).join(" ");
        return { first, last };
    };

    // --- STYLES ---
    const styles = {
        page: {
            width: "210mm",
            height: "297mm",
            background: "white",
            padding: `${PAGE_MARGIN} ${PAGE_MARGIN} ${PAGE_MARGIN} ${PAGE_MARGIN}`,
            boxSizing: "border-box",
            position: "relative",
            margin: "0 auto 30px auto",
            color: DARK,
            fontFamily: "var(--theme-font, 'Arial', 'Helvetica', sans-serif)",
            overflow: "visible",
            display: "flex",
            flexDirection: "column",
        },

        // ===== HEADER =====
        headerWrap: {
            marginBottom: "calc(10px * var(--theme-section-margin, 1))",
            position: "relative",
        },
        headerTopRow: {
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
        },
        headerNameBlock: {
            flex: 1,
        },
        nameRow: {
            display: "flex",
            alignItems: "baseline",
            gap: "10px",
            marginBottom: "2px",
            flexWrap: "wrap",
        },
        nameFirst: {
            fontSize: "calc(36px * var(--theme-font-scale, 1))",
            fontWeight: "400",
            color: GRAY_NAME,
            lineHeight: 1.1,
            fontFamily: "var(--theme-font, 'Georgia', serif)",
        },
        nameLast: {
            fontSize: "calc(36px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: DARK,
            lineHeight: 1.1,
            fontFamily: "var(--theme-font, 'Georgia', serif)",
        },
        profession: {
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            color: RED_ACCENT,
            fontStyle: "italic",
            marginBottom: "8px",
            fontFamily: "var(--theme-font, 'Georgia', serif)",
        },
        summaryText: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.6)",
            color: MEDIUM,
            maxWidth: "68%",
        },
        // Circular photo top-right
        photoWrap: {
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            marginLeft: "16px",
            border: "1px solid #ccc",
            background: "#ddd",
        },
        photoImg: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
        },
        photoPlaceholder: {
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ccc",
            color: "#888",
        },
        // Contact row: thick top border + thick bottom border, icons + text centered in 3 cols
        contactBar: {
            marginTop: "12px",
            borderTop: `2px solid ${DARK}`,
            borderBottom: `2px solid ${DARK}`,
            padding: "6px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
        },
        contactItem: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            flex: 1,
        },
        contactIcon: {
            color: DARK,
            width: "14px",
            height: "14px",
        },
        contactText: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            color: MEDIUM,
            textAlign: "center",
            wordBreak: "break-word",
        },
        contactDivider: {
            width: "1px",
            height: "30px",
            background: "#bbb",
            flexShrink: 0,
        },

        // ===== SECTION BAR HEADER =====
        sectionBar: {
            background: SECTION_BAR_BG,
            padding: "4px 8px",
            marginBottom: "calc(10px * var(--theme-paragraph-margin, 1))",
            display: "flex",
            alignItems: "center",
        },
        sectionBarText: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: DARK,
            textTransform: "uppercase",
            letterSpacing: "1px",
        },

        // ===== SECTION WRAPPER =====
        sectionWrap: {
            // marginBottom removed — spacing handled by CSS gap on the column container
            // so the paginator cursor is exact (no phantom trailing margin after last section)
        },

        // ===== LEFT DATE COL + RIGHT CONTENT layout =====
        dateContentRow: {
            display: "flex",
            alignItems: "flex-start",
            marginBottom: "calc(12px * var(--theme-paragraph-margin, 1))",
            gap: "10px",
        },
        dateCol: {
            width: DATE_COL_W,
            flexShrink: 0,
        },
        dateText: {
            fontSize: "calc(10.5px * var(--theme-font-scale, 1))",
            color: LIGHT,
            lineHeight: "var(--theme-line-height, 1.4)",
        },
        contentCol: {
            flex: 1,
            minWidth: 0,
        },

        // ===== EXPERIENCE =====
        expCompany: {
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: DARK,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            lineHeight: 1.2,
        },
        expRole: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: LIGHT,
            fontStyle: "italic",
            marginBottom: "5px",
        },
        expDesc: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.6)",
            color: MEDIUM,
        },

        // ===== EDUCATION =====
        eduDegree: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: DARK,
            lineHeight: "var(--theme-line-height, 1.35)",
        },
        eduInstitution: {
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: DARK,
        },

        // ===== LANGUAGES =====
        langGrid: {
            display: "flex",
            flexWrap: "wrap",
            gap: "calc(8px * var(--theme-paragraph-margin, 1)) 0",
            padding: "4px 0",
        },
        langItem: {
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flex: "1 1 30%",
            minWidth: "120px",
        },
        langName: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: DARK,
            minWidth: "55px",
        },
        langBar: {
            height: "4px",
            background: "#ccc",
            borderRadius: "2px",
            overflow: "hidden",
            flex: 1,
            maxWidth: "80px",
        },
        langFill: (pct) => ({
            height: "100%",
            width: `${pct}%`,
            background: DARK,
            borderRadius: "2px",
        }),

        // ===== SKILLS =====
        skillLine: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.6)",
            color: MEDIUM,
            marginBottom: "calc(4px * var(--theme-paragraph-margin, 1))",
        },
        skillLabel: {
            fontWeight: "700",
            color: DARK,
            marginRight: "4px",
        },

        // ===== CERTIFICATIONS, MISC =====
        miscRow: {
            display: "flex",
            alignItems: "baseline",
            gap: "16px",
            marginBottom: "calc(8px * var(--theme-paragraph-margin, 1))",
            flexWrap: "wrap",
        },
        miscTitle: {
            fontWeight: "700",
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: DARK,
        },
        miscSub: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: LIGHT,
            fontStyle: "italic",
        },
        miscDate: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            color: LIGHT,
            marginLeft: "auto",
        },

        // ===== GENERIC RICH TEXT =====
        richText: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.6)",
            color: MEDIUM,
        },

        // Bullet list
        bulletItem: {
            display: "flex",
            alignItems: "flex-start",
            gap: "6px",
            marginBottom: "calc(4px * var(--theme-paragraph-margin, 1))",
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: MEDIUM,
            lineHeight: "var(--theme-line-height, 1.6)",
        },
        bullet: {
            flexShrink: 0,
            marginTop: "4px",
            fontSize: "10px",
        },
    };

    // --- LANGUAGE LEVEL → PERCENT ---
    const langLevelToPct = (lang) => {
        if (!lang) return 60;
        const l = String(lang.level || "").toLowerCase();
        const r = lang.rating || lang.level_num;
        if (r) return Math.min(100, (r / 5) * 100);
        if (l.includes("native") || l.includes("fluent")) return 100;
        if (l.includes("advanced") || l.includes("c1") || l.includes("c2")) return 85;
        if (l.includes("intermediate") || l.includes("b")) return 60;
        if (l.includes("basic") || l.includes("beginner") || l.includes("a")) return 30;
        return 65;
    };

    // --- SECTION BAR ---
    const SectionBar = ({ title }) => {
        const { isContinued } = useSectionContext();
        return (
            <div style={styles.sectionBar}>
                <span style={styles.sectionBarText}>
                    {isContinued ? `${title} (cont.)` : title}
                </span>
            </div>
        );
    };

    // --- HEADER ---
    const Header = () => {
        const { first: nameFst, last: nameLst } = splitName(personal?.name);

        // Contact items: email | location | phone (3-col icon layout)
        const col1 = { icon: <Mail style={styles.contactIcon} />, value: personal?.email, href: personal?.email };
        const col2 = { icon: <MapPin style={styles.contactIcon} />, value: [personal?.city, personal?.state, personal?.country, personal?.zipCode].filter(Boolean).join(", ") || "City, Country", href: null };
        const col3 = { icon: <Phone style={styles.contactIcon} />, value: personal?.phone, href: personal?.phone };

        const extraLinks = [];
        if (personal?.linkedin) extraLinks.push({ icon: <Linkedin style={styles.contactIcon} />, value: personal.linkedin, href: personal.linkedin });
        if (personal?.github) extraLinks.push({ icon: <Globe style={styles.contactIcon} />, value: personal.github, href: personal.github });
        if (personal?.website) extraLinks.push({ icon: <Globe style={styles.contactIcon} />, value: personal.website, href: personal.website });

        (data.websites || []).forEach((site) => {
            if (site.addToHeader && site.url) {
                extraLinks.push({ icon: <Globe style={styles.contactIcon} />, value: site.label || site.url, href: site.url });
            }
        });

        const contactCols = [col1, col2, col3, ...extraLinks].filter((c) => c.value);

        return (
            <SectionWrapper sectionId="personal" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Header">
                <div style={styles.headerWrap}>
                    <div style={styles.headerTopRow}>
                        {/* Left: name + profession + summary */}
                        <div style={styles.headerNameBlock}>
                            <div style={styles.nameRow}>
                                {nameFst && (
                                    <span style={styles.nameFirst}>
                                        <SpellCheckText
                                            text={nameFst}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace("personal", "name", `${val} ${nameLst}`)}
                                        />
                                    </span>
                                )}
                                <span style={styles.nameLast}>
                                    <SpellCheckText
                                        text={nameLst || "SURNAME"}
                                        isActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onReplace={(val) => onSpellCheckReplace("personal", "name", nameFst ? `${nameFst} ${val}` : val)}
                                    />
                                </span>
                            </div>
                            {personal?.profession && (
                                <div style={styles.profession}>
                                    <SpellCheckText
                                        text={personal.profession}
                                        isActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onReplace={(val) => onSpellCheckReplace("personal", "profession", val)}
                                    />
                                </div>
                            )}
                            {data.summary && (
                                <div className="resume-rich-text" style={styles.summaryText}>
                                    <SplittableRichText
                                        html={data.summary}
                                        isActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onReplace={(val) => onSpellCheckReplace("summary", "summary", val)}
                                    />
                                </div>
                            )}
                        </div>
                        {/* Right: circular photo */}
                        <div style={styles.photoWrap}>
                            {personal?.photo ? (
                                <img src={personal.photo} style={styles.photoImg} alt="profile" />
                            ) : (
                                <div style={styles.photoPlaceholder}>
                                    <User style={{ width: "36px", height: "36px", color: "#aaa" }} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact bar: thick borders, icon + text, 3-col */}
                    <div style={styles.contactBar}>
                        {contactCols.map((col, i) => (
                            <React.Fragment key={i}>
                                <div style={styles.contactItem}>
                                    {col.icon}
                                    <span style={styles.contactText}>
                                        {col.href ? (
                                            <ResumeLink href={col.href}>{col.value}</ResumeLink>
                                        ) : (
                                            col.value
                                        )}
                                    </span>
                                </div>
                                {i < contactCols.length - 1 && <div style={styles.contactDivider} />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </SectionWrapper>
        );
    };

    // --- CUSTOM RENDERERS ---
    const customRenderers = {
        // Summary is in header → hide here
        summary: () => null,

        languages: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.languages?.[idx]) : data.languages;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="languages" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Languages">
                    <div style={styles.sectionWrap}>
                        <SectionBar title="Languages" />
                        <div style={styles.langGrid}>
                            {items.map((lang, i) => {
                                if (!lang) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const pct = langLevelToPct(lang);
                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.langItem}>
                                        <span style={styles.langName}>
                                            <RichTextSpellCheck
                                                html={lang.name || ""}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace("languages", originalIdx, val, "name")}
                                            />
                                        </span>
                                        <div style={styles.langBar}>
                                            <div style={styles.langFill(pct)} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        education: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.education?.[idx]) : data.education;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
                    <div style={styles.sectionWrap}>
                        <SectionBar title="Education" />
                        {items.map((edu, i) => {
                            if (!edu) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr = edu.year || edu.date || (edu.startYear ? `${edu.startYear}–${edu.isCurrent ? "Present" : edu.endYear}` : edu.endYear || "");
                            const locationStr = [edu.city, edu.location].filter(Boolean).join(", ");
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.dateContentRow}>
                                    {/* Left: date + location */}
                                    <div style={styles.dateCol}>
                                        {dateStr && (
                                            <div style={styles.dateText}>
                                                <RichTextSpellCheck
                                                    html={dateStr}
                                                    isActive={isSpellCheckActive}
                                                    onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "year")}
                                                />
                                            </div>
                                        )}
                                        {locationStr && (
                                            <div style={styles.dateText}>{locationStr}</div>
                                        )}
                                    </div>
                                    {/* Right: degree + institution */}
                                    <div style={styles.contentCol}>
                                        {edu.degree && (
                                            <div style={styles.eduDegree}>
                                                <RichTextSpellCheck
                                                    html={edu.degree}
                                                    isActive={isSpellCheckActive}
                                                    onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "degree")}
                                                />
                                            </div>
                                        )}
                                        {(edu.institution || edu.school) && (
                                            <div style={styles.eduInstitution}>
                                                <RichTextSpellCheck
                                                    html={edu.institution || edu.school}
                                                    isActive={isSpellCheckActive}
                                                    onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "institution")}
                                                />
                                            </div>
                                        )}
                                        {edu.grade && (
                                            <div style={styles.richText}>GPA: {edu.grade}</div>
                                        )}
                                        {edu.description && (
                                            <div className="resume-rich-text" style={{ ...styles.richText, marginTop: "4px" }}>
                                                <SplittableRichText
                                                    html={edu.description}
                                                    isActive={isSpellCheckActive}
                                                    onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "description")}
                                                />
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

        skills: ({ itemIndices, isContinued, zoneId }) => {
            const hardItems = itemIndices
                ? itemIndices.map((idx) => data.skills?.[idx]).filter(Boolean)
                : (data.skills || []);
            const softItems = data.strengths || [];
            const hasDescription = data.skillsDescription && data.skillsDescription.trim();

            if (hardItems.length === 0 && softItems.length === 0 && !hasDescription) return null;

            const hardNames = hardItems.map((s) => (typeof s === "object" ? s.name : s)).filter(Boolean);
            const softNames = softItems.map((s) => (typeof s === "object" ? s.name : s)).filter(Boolean);

            return (
                <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                    <div style={styles.sectionWrap}>
                        <SectionBar title="Skills" />
                        {hardNames.length > 0 && (
                            <div style={styles.skillLine}>
                                <span style={styles.skillLabel}>Hard:</span>
                                {hardNames.join(", ")}.
                            </div>
                        )}
                        {softNames.length > 0 && (
                            <div style={styles.skillLine}>
                                <span style={styles.skillLabel}>Soft:</span>
                                {softNames.join(" ")}
                            </div>
                        )}
                        {hasDescription && (
                            <div className="resume-rich-text" style={styles.richText}>
                                <SplittableRichText
                                    html={data.skillsDescription}
                                    isActive={isSpellCheckActive}
                                    onIgnore={onSpellCheckIgnore}
                                    onReplace={(val) => onSpellCheckReplace("skills", "skillsDescription", val)}
                                />
                            </div>
                        )}
                    </div>
                </SectionWrapper>
            );
        },

        // Hide strengths as standalone (merged into skills above)
        strengths: () => null,

        additionalSkills: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices
                ? itemIndices.map((idx) => data.additionalSkills?.[idx]).filter(Boolean)
                : (data.additionalSkills || []);
            if (items.length === 0) return null;
            const names = items.map((s) => (typeof s === "object" ? s.name : s)).filter(Boolean);
            return (
                <SectionWrapper sectionId="additionalSkills" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Skills">
                    <div style={styles.sectionWrap}>
                        <SectionBar title="Additional Skills" />
                        <div style={styles.skillLine}>
                            {names.join(", ")}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        experience: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.experience?.[idx]) : data.experience;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="experience" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Experience">
                    <div style={styles.sectionWrap}>
                        <SectionBar title="Professional Experience" />
                        {items.map((exp, i) => {
                            if (!exp) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr =
                                exp.year ||
                                exp.date ||
                                (exp.startYear
                                    ? `${exp.startYear} – ${exp.isCurrent ? "Present" : exp.endYear}`
                                    : "");
                            const locationStr = exp.location || "";
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.dateContentRow}>
                                    {/* Left: date + location */}
                                    <div style={styles.dateCol}>
                                        {dateStr && (
                                            <div style={styles.dateText}>
                                                <RichTextSpellCheck
                                                    html={dateStr}
                                                    isActive={isSpellCheckActive}
                                                    onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace("experience", originalIdx, val, "date")}
                                                />
                                            </div>
                                        )}
                                        {locationStr && (
                                            <div style={styles.dateText}>{locationStr}</div>
                                        )}
                                    </div>
                                    {/* Right: company + role + description */}
                                    <div style={styles.contentCol}>
                                        <div style={styles.expCompany}>
                                            <RichTextSpellCheck
                                                html={exp.company || ""}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace("experience", originalIdx, val, "company")}
                                            />
                                        </div>
                                        {(exp.title || exp.role) && (
                                            <div style={styles.expRole}>
                                                <RichTextSpellCheck
                                                    html={exp.title || exp.role}
                                                    isActive={isSpellCheckActive}
                                                    onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace("experience", originalIdx, val, "title")}
                                                />
                                            </div>
                                        )}
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
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        certifications: ({ itemIndices, isContinued, zoneId, subItemRanges: rSIR }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.certifications?.[idx]) : data.certifications;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
                    <div style={styles.sectionWrap}>
                        <SectionBar title="Certifications" />
                        {items.map((cert, i) => {
                            if (!cert) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr = cert.date || cert.year || "";
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.dateContentRow}>
                                    <div style={styles.dateCol}>
                                        {dateStr && <div style={styles.dateText}>{dateStr}</div>}
                                    </div>
                                    <div style={styles.contentCol}>
                                        <div style={styles.miscTitle}>
                                            <RichTextSpellCheck html={cert.name || cert.title || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("certifications", originalIdx, val, "name")} />
                                        </div>
                                        {(cert.issuer || cert.issuingOrganization) && (
                                            <div style={styles.miscSub}>
                                                {cert.issuer || cert.issuingOrganization}
                                            </div>
                                        )}
                                        {cert.description && (
                                            <div className="resume-rich-text" style={{ ...styles.richText, marginTop: "3px" }}>
                                                <SplittableRichText html={cert.description} range={rSIR?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("certifications", originalIdx, val, "description")} />
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

        projects: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.projects?.[idx]) : data.projects;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
                    <div style={styles.sectionWrap}>
                        <SectionBar title="Projects" />
                        {items.map((proj, i) => {
                            if (!proj) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr = proj.year || (proj.startYear && `${proj.startYear}–${proj.isCurrent ? "Present" : proj.endYear || "Present"}`);
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.dateContentRow}>
                                    <div style={styles.dateCol}>
                                        {dateStr && <div style={styles.dateText}>{dateStr}</div>}
                                    </div>
                                    <div style={styles.contentCol}>
                                        <div style={styles.miscTitle}>
                                            <RichTextSpellCheck html={proj.title || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("projects", originalIdx, val, "title")} />
                                        </div>
                                        {proj.link && (
                                            <div style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", color: RED_ACCENT, marginBottom: "3px" }}>
                                                <ResumeLink href={proj.link}>
                                                    <RichTextSpellCheck html={proj.link} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("projects", originalIdx, val, "link")} />
                                                </ResumeLink>
                                            </div>
                                        )}
                                        {proj.technologies && proj.technologies.length > 0 && (
                                            <div style={{ ...styles.richText, marginBottom: "3px" }}>
                                                <span style={styles.skillLabel}>Technologies: </span>
                                                {proj.technologies.map((t, ti) => (
                                                    <span key={ti}>
                                                        <RichTextSpellCheck html={t} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => { const u = [...proj.technologies]; u[ti] = val; onSpellCheckReplace("projects", originalIdx, u, "technologies"); }} />
                                                        {ti < proj.technologies.length - 1 && " · "}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="resume-rich-text" style={styles.richText}>
                                            <SplittableRichText html={proj.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("projects", originalIdx, val, "description")} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        software: ({ itemIndices, isContinued, zoneId, subItemRanges: rSIR }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.software?.[idx]) : data.software;
            if (!items || items.length === 0) return null;
            const names = items.map((s) => (typeof s === "object" ? s?.name : s)).filter(Boolean);
            return (
                <SectionWrapper sectionId="software" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Software">
                    <div style={styles.sectionWrap}>
                        <SectionBar title="Software" />
                        <div style={styles.skillLine}>
                            {names.join(", ")}
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

            return (
                <SectionWrapper sectionId="personalDetails" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Personal Details">
                    <div style={styles.sectionWrap}>
                        <SectionBar title="Personal Information" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
                            {details.map((d, i) => (
                                <div key={i} style={styles.dateContentRow}>
                                    <div style={{ ...styles.dateCol, width: "120px" }}>
                                        <div style={styles.dateText}>{d.label}</div>
                                    </div>
                                    <div style={styles.contentCol}>
                                        <div style={styles.eduDegree}>
                                            <SpellCheckText
                                                text={d.value}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace("personal", d.label.toLowerCase().replace(/ /g, ""), val)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // removed awards, volunteer, publications renderers to match schema
        custom: ({ isContinued, subItemRanges: rSIR, zoneId }) => {
            if (!data.customSection?.isVisible || !data.customSection?.content) return null;
            const content = data.customSection.content;
            if (!content || content.trim() === "" || content === "<p><br></p>") return null;
            const title = data.customSection.title || "Additional Information";
            return (
                <SectionWrapper sectionId="custom" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <div style={styles.sectionWrap}>
                        <SectionBar title={title} />
                        <div className="resume-rich-text" style={styles.richText}>
                            <SplittableRichText html={content} range={rSIR?.custom} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("customSection", "content", val)} />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        additionalInfo: ({ isContinued, subItemRanges: rSIR, zoneId }) => {
            const html = data.additionalInfo || "";
            if (!html || html.trim() === "" || html === "<p><br></p>") return null;
            return (
                <SectionWrapper sectionId="additionalInfo" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Information">
                    <div style={styles.sectionWrap}>
                        <SectionBar title="Additional Information" />
                        <div className="resume-rich-text" style={styles.richText}>
                            <SplittableRichText html={html} range={rSIR?.additionalInfo} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("additionalInfo", "additionalInfo", val)} />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
    };

    // --- RENDER ZONE ---
    const renderZone = (id, items, columnStyle = {}) => (
        <DroppableZone id={id} style={{ ...columnStyle, flex: 1, minHeight: "100px" }}>
            {items.map((sid, idx) => {
                const isContinued = typeof sid === "object" && sid.isContinued;
                const sectionId = typeof sid === "string" ? sid : sid.id;
                const dragId = isContinued ? `${id}-cont-${sectionId}-${idx}` : sectionId;
                return (
                    <DraggableSection key={dragId} id={dragId} isEnabled={canReorder && !isContinued}>
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
                    </DraggableSection>
                );
            })}
        </DroppableZone>
    );

    const ZONE_STYLE = { flex: 1, display: "flex", flexDirection: "column", gap: "calc(16px * var(--theme-section-margin, 1))" };

    // --- MEASURER ---
    const Measurer = () => (
        <div className="resume-measurer" style={{ position: "absolute", top: -10000, left: -10000, width: "210mm", visibility: "hidden" }}>
            <div className="page-height-marker" style={{ height: "297mm", width: "1px", position: "absolute", left: 0, top: 0 }} />
            <div style={{ ...styles.page, height: "auto" }}>
                <Header />
                <div data-column-id="main" style={{ display: "flex", flexDirection: "column", gap: "calc(16px * var(--theme-section-margin, 1))" }}>
                    {activeSections.map((sid) => (
                        <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="main" />
                    ))}
                </div>
            </div>
        </div>
    );

    // --- MAIN RENDER ---
    return (
        <div ref={containerRef} className="silver-serif-root" >
            <Measurer />
            <DndContext {...dndContextProps}>
                <SortableContext items={activeSections} strategy={verticalListSortingStrategy}>
                    {showPageBreaks && pages ? (
                        pages.map((page, i) => (
                            <div key={i} style={styles.page}>
                                {i === 0 && <Header />}
                                {renderZone(`main-p${i}`, page.main, ZONE_STYLE)}
                                <div style={{ position: "absolute", bottom: "15px", right: "36px", fontSize: "10px", opacity: 0.4 }}>
                                    Page {i + 1}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ ...styles.page, height: "auto", minHeight: "100%" }}>
                            <Header />
                            {renderZone("main", activeSections, ZONE_STYLE)}
                        </div>
                    )}
                </SortableContext>
                <StableResumeDragOverlay
                    activeId={activeId}
                    scale={scale}
                    renderSection={(id) => (
                        <div style={{ background: "white", padding: "10px", border: "1px solid #ddd", width: "300px" }}>
                            <SectionRenderer sectionId={id} data={data} customRenderers={customRenderers} />
                        </div>
                    )}
                />
            </DndContext>
        </div >
    );
};

export default SilverSerif;
