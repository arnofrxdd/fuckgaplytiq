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
import { Phone, Mail, Globe, Linkedin, MapPin, Star, Link } from "lucide-react";
import { getCompleteLayout, getSavedLayout } from "../common/TemplateUtils";

/**
 * CrimsonBold Template
 * Matches the bold two-tone resume layout:
 * - Header: light gray left (monogram initials box) + dark maroon right (name + summary)
 * - Sidebar (left ~32%): light gray bg, sections with small-caps serif titles, icon-badged contact
 * - Main (right ~68%): full dark maroon bg, section titles as gold/amber accent bars with small-caps white text
 * - All CSS variable spacing support
 */
const RubyRibbon = ({
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
    const templateId = "ruby-ribbon";
    const initialLayout = getSavedLayout(data, templateId, {
        main: ["experience", "certifications", "projects", "custom", "additionalInfo"],
        sidebar: ["contact", "personalDetails", "education", "skills", "strengths", "additionalSkills", "languages", "software", "interests", "awards", "websites"],
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

    // --- COLORS & CONSTANTS ---
    const MAROON = "var(--theme-color, #7b2d42)";
    const GOLD = "#c8860a";
    const SIDEBAR_BG = "#e8e8e4";
    const SIDEBAR_WIDTH = "32%";
    const MAIN_WIDTH = "68%";

    // Helper: get initials from name
    const getInitials = (name) => {
        if (!name) return "YN";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // --- STYLES ---
    const styles = {
        page: {
            width: "210mm",
            height: "297mm",
            background: "white",
            boxSizing: "border-box",
            position: "relative",
            margin: "0 auto 30px auto",
            fontFamily: "var(--theme-font, 'Georgia', serif)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
        },
        // ---- HEADER ----
        headerRow: {
            display: "flex",
            flexShrink: 0,
            minHeight: "160px",
        },
        headerLeft: {
            width: SIDEBAR_WIDTH,
            background: SIDEBAR_BG,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
        },
        monogramOuter: {
            // Gray outlined box containing the colored inner box
            border: "3px solid #a0a09c",
            padding: "6px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
        },
        monogramInner: {
            background: MAROON,
            width: "80px",
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        monogramText: {
            fontSize: "calc(32px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "white",
            letterSpacing: "2px",
            fontFamily: "var(--theme-font, 'Georgia', serif)",
            lineHeight: 1,
        },
        headerRight: {
            width: MAIN_WIDTH,
            background: MAROON,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "24px 32px 20px 28px",
            boxSizing: "border-box",
        },
        headerName: {
            fontSize: "calc(42px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "white",
            margin: 0,
            lineHeight: 1.1,
            fontFamily: "var(--theme-font, 'Georgia', serif)",
        },
        headerSummary: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: "rgba(255,255,255,0.82)",
            lineHeight: "var(--theme-line-height, 1.55)",
            marginTop: "10px",
            textAlign: "center",
        },
        headerDivider: {
            height: "1px",
            background: "rgba(255,255,255,0.3)",
            margin: "12px 0 0 0",
        },

        // ---- BODY ----
        bodyRow: {
            display: "flex",
            flex: 1,
            minHeight: 0,
        },

        // ---- SIDEBAR ----
        sidebarColumn: {
            width: SIDEBAR_WIDTH,
            background: SIDEBAR_BG,
            paddingTop: "22px", // Fixed internal spacing from header
            paddingLeft: "var(--theme-page-margin, 22px)",
            paddingRight: "18px", // Internal gutter
            paddingBottom: "var(--theme-page-margin, 40px)",
            display: "flex",
            flexDirection: "column",
            gap: "calc(22px * var(--theme-section-margin, 1))",
            boxSizing: "border-box",
        },
        sidebarSectionTitle: {
            // Small-caps style, bold serif, black
            fontSize: "calc(15px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "#1a1a1a",
            fontVariant: "small-caps",
            letterSpacing: "0.5px",
            marginBottom: "10px",
            fontFamily: "var(--theme-font, 'Georgia', serif)",
        },
        // Contact icon badge (orange square)
        iconBadge: {
            width: "26px",
            height: "26px",
            background: GOLD,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            borderRadius: "2px",
        },
        contactRow: {
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            marginBottom: "calc(8px * var(--theme-paragraph-margin, 1))",
        },
        contactText: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: "#2d2d2d",
            lineHeight: "var(--theme-line-height, 1.45)",
            wordBreak: "break-word",
            flex: 1,
            paddingTop: "4px",
        },

        // ---- MAIN COLUMN ----
        mainColumn: {
            width: MAIN_WIDTH,
            background: MAROON,
            paddingTop: "22px", // Fixed internal spacing from header
            paddingRight: "0",
            paddingBottom: "var(--theme-page-margin, 40px)",
            paddingLeft: "0",
            display: "flex",
            flexDirection: "column",
            gap: "calc(25px * var(--theme-section-margin, 1))",
            boxSizing: "border-box",
        },
        // Section title: gold/amber accent bar with fold effect
        mainSectionTitleBar: {
            background: GOLD,
            padding: "8px 24px",
            marginBottom: "0",
            position: "relative",
            marginLeft: "-12px", // Pull it left slightly
            zIndex: 10,
        },
        mainSectionTitleFold: {
            position: "absolute",
            top: "100%",
            left: "0",
            width: "0",
            height: "0",
            borderTop: `10px solid #9a6808`, // Darker gold for shadow effect
            borderLeft: "12px solid transparent",
            zIndex: 5,
        },
        mainSectionTitleText: {
            fontSize: "calc(15px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "white",
            fontVariant: "small-caps",
            letterSpacing: "1px",
            fontFamily: "var(--theme-font, 'Georgia', serif)",
            margin: 0,
        },
        // Content area inside each main section
        mainSectionContent: {
            padding: "12px 22px calc(18px * var(--theme-paragraph-margin, 1)) 22px",
        },
        // Experience item
        expJobLine: {
            fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
            color: "white",
            marginBottom: "6px",
            lineHeight: "var(--theme-line-height, 1.4)",
        },
        expJobTitle: {
            fontWeight: "700",
            color: "white",
        },
        expCompany: {
            fontWeight: "400",
            color: "rgba(255,255,255,0.85)",
        },
        expDesc: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.6)",
            color: "rgba(255,255,255,0.9)",
        },
        expDate: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            color: "rgba(255,255,255,0.65)",
            marginBottom: "4px",
        },
        // Bullet list on maroon bg
        mainBulletList: {
            paddingLeft: "18px",
            margin: 0,
            color: "rgba(255,255,255,0.9)",
        },
        mainBulletItem: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.6)",
            marginBottom: "calc(5px * var(--theme-paragraph-margin, 1))",
            color: "rgba(255,255,255,0.9)",
        },
        // Sidebar bullet list
        sidebarBulletList: {
            paddingLeft: "16px",
            margin: 0,
        },
        sidebarBulletItem: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.55)",
            marginBottom: "calc(5px * var(--theme-paragraph-margin, 1))",
            color: "#2d2d2d",
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

    // Main section title: gold bar + white small-caps text + folded ribbon effect
    const MainSectionTitle = ({ title }) => {
        const { isContinued } = useSectionContext();
        return (
            <div style={{ position: "relative", marginBottom: "15px" }}>
                <div style={styles.mainSectionTitleBar}>
                    <div style={styles.mainSectionTitleText}>
                        {isContinued ? `${title} (Cont.)` : title}
                    </div>
                </div>
                <div style={styles.mainSectionTitleFold} />
            </div>
        );
    };

    // --- HEADER ---
    const Header = () => {
        const initials = getInitials(personal?.name);
        return (
            <SectionWrapper sectionId="personal" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Header">
                <div style={styles.headerRow}>
                    {/* Left: Monogram or Photo */}
                    <div style={styles.headerLeft}>
                        {personal?.photo ? (
                            <div style={{ position: "relative" }}>
                                <img src={personal.photo} style={{ width: "100px", height: "100px", objectFit: "cover", border: "2px solid #a0a09c" }} alt="profile" />
                            </div>
                        ) : (
                            <div style={styles.monogramOuter}>
                                <div style={styles.monogramInner}>
                                    <span style={styles.monogramText}>{initials}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Right: Name + summary */}
                    <div style={styles.headerRight}>
                        <h1 style={styles.headerName}>
                            <SpellCheckText
                                text={personal?.name || "Your Name"}
                                isActive={isSpellCheckActive}
                                onIgnore={onSpellCheckIgnore}
                                onReplace={(val) => onSpellCheckReplace("personal", "name", val)}
                            />
                        </h1>
                        {data.summary && (
                            <>
                                <div style={styles.headerDivider} />
                                <div className="resume-rich-text" style={styles.headerSummary}>
                                    <SplittableRichText
                                        html={data.summary}
                                        range={useSectionContext()?.subItemRanges?.summary}
                                        isActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onReplace={(val) => onSpellCheckReplace("summary", "summary", val)}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </SectionWrapper>
        );
    };

    // --- CONTACT ICON HELPER ---
    const ContactIcon = ({ type }) => {
        const iconStyle = { color: "white", width: "14px", height: "14px" };
        switch (type) {
            case "phone": return <Phone style={iconStyle} />;
            case "email": return <Mail style={iconStyle} />;
            case "linkedin": return <Linkedin style={iconStyle} />;
            case "location": return <MapPin style={iconStyle} />;
            case "website": return <Globe style={iconStyle} />;
            default: return <Link style={iconStyle} />;
        }
    };

    // --- CUSTOM RENDERERS ---
    const customRenderers = {
        // Summary is rendered in the header, so hide it from main sections
        summary: () => null,

        // MAIN SECTIONS
        experience: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.experience?.[idx]) : data.experience;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="experience" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Experience">
                    <div>
                        <MainSectionTitle title="Professional Experience" />
                        <div style={styles.mainSectionContent}>
                            {items.map((exp, i) => {
                                if (!exp) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const dateStr =
                                    exp.year ||
                                    exp.date ||
                                    (exp.startYear
                                        ? `${exp.startYear} – ${exp.isCurrent ? "Present" : exp.endYear}`
                                        : "");
                                const companyStr = [exp.company, exp.location, exp.state]
                                    .filter(Boolean)
                                    .join(", ");
                                return (
                                    <div
                                        key={i}
                                        data-item-index={originalIdx}
                                        style={{ marginBottom: "calc(18px * var(--theme-paragraph-margin, 1))" }}
                                    >
                                        {dateStr && (
                                            <div style={styles.expDate}>
                                                <RichTextSpellCheck
                                                    html={dateStr}
                                                    isActive={isSpellCheckActive}
                                                    onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace("experience", originalIdx, val, "date")}
                                                />
                                            </div>
                                        )}
                                        <div style={styles.expJobLine}>
                                            <span style={styles.expJobTitle}>
                                                <RichTextSpellCheck
                                                    html={exp.title || exp.role || ""}
                                                    isActive={isSpellCheckActive}
                                                    onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace("experience", originalIdx, val, "title")}
                                                />
                                            </span>
                                            {companyStr && (
                                                <>
                                                    <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: "400" }}> | </span>
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
                    </div>
                </SectionWrapper>
            );
        },

        certifications: ({ itemIndices, isContinued, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.certifications?.[idx]) : data.certifications;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");

            if (isSidebar) {
                return (
                    <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
                        <div>
                            <SidebarTitle title="Certifications" />
                            <ul style={styles.sidebarBulletList}>
                                {items.map((cert, i) => {
                                    if (!cert) return null;
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <li key={i} data-item-index={originalIdx} style={styles.sidebarBulletItem}>
                                            <RichTextSpellCheck
                                                html={cert.name || cert.title || ""}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace("certifications", originalIdx, val, "name")}
                                            />
                                            {(cert.issuer || cert.issuingOrganization) && (
                                                <span style={{ color: "#555" }}>
                                                    {", "}{cert.issuer || cert.issuingOrganization}
                                                </span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </SectionWrapper>
                );
            }

            return (
                <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
                    <div>
                        <MainSectionTitle title="Certification" />
                        <div style={styles.mainSectionContent}>
                            <ul style={{ ...styles.mainBulletList }}>
                                {items.map((cert, i) => {
                                    if (!cert) return null;
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <li key={i} data-item-index={originalIdx} style={styles.mainBulletItem}>
                                            <RichTextSpellCheck
                                                html={`${cert.name || cert.title || ""}${cert.issuer || cert.issuingOrganization ? `, ${cert.issuer || cert.issuingOrganization}` : ""}`}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace("certifications", originalIdx, val, "name")}
                                            />
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        projects: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.projects?.[idx]) : data.projects;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");

            if (isSidebar) {
                return (
                    <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
                        <div>
                            <SidebarTitle title="Projects" />
                            {items.map((proj, i) => {
                                if (!proj) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                                        <div style={{ fontWeight: "700", fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#1a1a1a" }}>
                                            <RichTextSpellCheck html={proj.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("projects", originalIdx, val, "title")} />
                                        </div>
                                        <div className="resume-rich-text" style={{ fontSize: "calc(11.5px * var(--theme-font-scale, 1))", color: "#444", lineHeight: "var(--theme-line-height, 1.5)" }}>
                                            <SplittableRichText html={proj.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("projects", originalIdx, val, "description")} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </SectionWrapper>
                );
            }

            return (
                <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
                    <div>
                        <MainSectionTitle title="Projects" />
                        <div style={styles.mainSectionContent}>
                            {items.map((proj, i) => {
                                if (!proj) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const dateStr = proj.year || (proj.startYear && `${proj.startYear} – ${proj.isCurrent ? "Present" : proj.endYear || "Present"}`);
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(16px * var(--theme-paragraph-margin, 1))" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <div style={{ fontWeight: "700", fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: "white" }}>
                                                <RichTextSpellCheck html={proj.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("projects", originalIdx, val, "title")} />
                                            </div>
                                            {dateStr && <div style={styles.expDate}>{dateStr}</div>}
                                        </div>
                                        {proj.link && (
                                            <div style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", color: GOLD, marginBottom: "4px" }}>
                                                <ResumeLink href={proj.link}>
                                                    <RichTextSpellCheck html={proj.link} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("projects", originalIdx, val, "link")} />
                                                </ResumeLink>
                                            </div>
                                        )}
                                        {proj.technologies && proj.technologies.length > 0 && (
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "6px" }}>
                                                {proj.technologies.map((tech, tIdx) => (
                                                    <span key={tIdx} style={{ fontSize: "calc(10px * var(--theme-font-scale, 1))", padding: "2px 7px", background: "rgba(255,255,255,0.15)", borderRadius: "10px", color: "rgba(255,255,255,0.85)" }}>
                                                        <RichTextSpellCheck html={tech} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => { const u = [...proj.technologies]; u[tIdx] = val; onSpellCheckReplace("projects", originalIdx, u, "technologies"); }} />
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="resume-rich-text" style={styles.expDesc}>
                                            <SplittableRichText html={proj.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("projects", originalIdx, val, "description")} />
                                        </div>
                                    </div>
                                );
                            })}
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
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");
            return (
                <SectionWrapper sectionId="custom" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <div>
                        {isSidebar ? <SidebarTitle title={title} /> : <MainSectionTitle title={title} />}
                        <div
                            className="resume-rich-text"
                            style={isSidebar
                                ? { fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#2d2d2d", lineHeight: "var(--theme-line-height, 1.55)" }
                                : { ...styles.mainSectionContent, ...styles.expDesc }
                            }
                        >
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
                        {isSidebar ? <SidebarTitle title="Additional Information" /> : <MainSectionTitle title="Additional Information" />}
                        <div
                            className="resume-rich-text"
                            style={isSidebar
                                ? { fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#2d2d2d", lineHeight: "var(--theme-line-height, 1.55)" }
                                : { ...styles.mainSectionContent, ...styles.expDesc }
                            }
                        >
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

        // volunteer on main
        volunteer: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.volunteer?.[idx]) : data.volunteer;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");
            return (
                <SectionWrapper sectionId="volunteer" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Volunteer">
                    <div>
                        {isSidebar ? <SidebarTitle title="Volunteer" /> : <MainSectionTitle title="Volunteer" />}
                        {isSidebar ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                                {items.map((item, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <div key={i} data-item-index={originalIdx}>
                                            <div style={{ fontWeight: "700", fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#1a1a1a" }}>
                                                <RichTextSpellCheck html={item.organization} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("volunteer", originalIdx, val, "organization")} />
                                            </div>
                                            <div style={{ fontSize: "calc(11.5px * var(--theme-font-scale, 1))", color: "#444" }}>
                                                <RichTextSpellCheck html={item.role} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("volunteer", originalIdx, val, "role")} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={styles.mainSectionContent}>
                                {items.map((item, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(12px * var(--theme-paragraph-margin, 1))" }}>
                                            <div style={{ fontWeight: "700", fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: "white" }}>
                                                <RichTextSpellCheck html={item.organization} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("volunteer", originalIdx, val, "organization")} />
                                                {" "}
                                                <span style={{ fontWeight: "400", color: "rgba(255,255,255,0.75)" }}>| {item.role}</span>
                                            </div>
                                            <div style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", color: "rgba(255,255,255,0.6)" }}>
                                                {item.startDate} – {item.isCurrent ? "Present" : item.endDate}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
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
                        {isSidebar ? <SidebarTitle title="Publications" /> : <MainSectionTitle title="Publications" />}
                        {isSidebar ? (
                            <ul style={styles.sidebarBulletList}>
                                {items.map((pub, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <li key={i} data-item-index={originalIdx} style={styles.sidebarBulletItem}>
                                            <RichTextSpellCheck html={pub.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("publications", originalIdx, val, "name")} />
                                            {pub.publisher && <span style={{ color: "#555" }}>, {pub.publisher}</span>}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div style={styles.mainSectionContent}>
                                <ul style={styles.mainBulletList}>
                                    {items.map((pub, i) => {
                                        const originalIdx = itemIndices ? itemIndices[i] : i;
                                        return (
                                            <li key={i} data-item-index={originalIdx} style={styles.mainBulletItem}>
                                                <RichTextSpellCheck html={pub.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("publications", originalIdx, val, "name")} />
                                                {pub.publisher && <span style={{ color: "rgba(255,255,255,0.7)" }}>, {pub.publisher}</span>}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
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
                        {isSidebar ? <SidebarTitle title="Awards" /> : <MainSectionTitle title="Awards" />}
                        {isSidebar ? (
                            <ul style={styles.sidebarBulletList}>
                                {items.map((award, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <li key={i} data-item-index={originalIdx} style={styles.sidebarBulletItem}>
                                            <RichTextSpellCheck html={award.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("awards", originalIdx, val, "title")} />
                                            {award.issuer && <span style={{ color: "#555" }}>, {award.issuer}</span>}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div style={styles.mainSectionContent}>
                                {items.map((award, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                                            <div style={{ fontWeight: "700", fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: "white" }}>
                                                <RichTextSpellCheck html={award.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("awards", originalIdx, val, "title")} />
                                            </div>
                                            {award.issuer && <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: GOLD }}>{award.issuer}{award.year && ` • ${award.year}`}</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
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
                        {isSidebar ? <SidebarTitle title="Personal Info" /> : <MainSectionTitle title="Personal Information" />}
                        <div
                            style={isSidebar
                                ? { display: "flex", flexDirection: "column", gap: "8px" }
                                : { ...styles.mainSectionContent, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }
                            }
                        >
                            {details.map((d, i) => (
                                <div key={i} style={isSidebar ? styles.contactRow : { fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "white" }}>
                                    {isSidebar && (
                                        <div style={styles.iconBadge}>
                                            <ContactIcon type="personal" />
                                        </div>
                                    )}
                                    <div style={isSidebar ? styles.contactText : {}}>
                                        <span style={{ fontWeight: "700" }}>{d.label}: </span>
                                        <SpellCheckText
                                            text={d.value}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace("personal", d.label.toLowerCase().replace(/ /g, ""), val)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // SIDEBAR SECTIONS
        contact: ({ zoneId }) => {
            const websiteItems = data.websites || [];
            const contactLinks = [
                { type: "linkedin", label: "LinkedIn", value: personal?.linkedin },
                { type: "website", label: "Portfolio", value: personal?.website },
                { type: "website", label: "GitHub", value: personal?.github },
                ...websiteItems
                    .filter((l) => l.addToHeader && l.url)
                    .map((l, idx) => ({ type: "website", label: l.label || "Website", value: l.url, idx })),
            ];
            return (
                <SectionWrapper sectionId="contact" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Contact">
                    <div>
                        <SidebarTitle title="Contact" />
                        {personal?.phone && (
                            <div style={styles.contactRow}>
                                <div style={styles.iconBadge}><ContactIcon type="phone" /></div>
                                <div style={styles.contactText}>
                                    <ResumeLink href={personal.phone}>
                                        <SpellCheckText text={personal.phone} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("personal", "phone", val)} />
                                    </ResumeLink>
                                </div>
                            </div>
                        )}
                        {personal?.email && (
                            <div style={styles.contactRow}>
                                <div style={styles.iconBadge}><ContactIcon type="email" /></div>
                                <div style={styles.contactText}>
                                    <ResumeLink href={personal.email}>
                                        <SpellCheckText text={personal.email} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("personal", "email", val)} />
                                    </ResumeLink>
                                </div>
                            </div>
                        )}
                        {contactLinks.filter((l) => l.value).map((link, i) => (
                            <div key={i} style={styles.contactRow}>
                                <div style={styles.iconBadge}><ContactIcon type={link.type} /></div>
                                <div style={styles.contactText}>
                                    <ResumeLink href={link.value}>
                                        <SpellCheckText text={link.value} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("personal", link.type === "linkedin" ? "linkedin" : "website", val)} />
                                    </ResumeLink>
                                </div>
                            </div>
                        ))}
                        {personal?.city && (
                            <div style={styles.contactRow}>
                                <div style={styles.iconBadge}><ContactIcon type="location" /></div>
                                <div style={styles.contactText}>
                                    <SpellCheckText
                                        text={[personal?.city, personal?.state, personal?.zipCode, personal?.country].filter(Boolean).join(", ")}
                                        isActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onReplace={(val) => onSpellCheckReplace("personal", "city", val)}
                                    />
                                </div>
                            </div>
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
                            <div key={i} style={styles.contactRow}>
                                <div style={styles.iconBadge}><ContactIcon type="website" /></div>
                                <div style={styles.contactText}>
                                    <ResumeLink href={site.url}>
                                        <SpellCheckText text={site.label || site.url} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("websites", site.originalIdx, val, "url")} />
                                    </ResumeLink>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionWrapper>
            );
        },

        education: ({ itemIndices, isContinued, zoneId, subItemRanges }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.education?.[idx]) : data.education;
            if (!items || items.length === 0) return null;
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
                                    <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(12px * var(--theme-paragraph-margin, 1))" }}>
                                        <ul style={styles.sidebarBulletList}>
                                            <li style={styles.sidebarBulletItem}>
                                                <RichTextSpellCheck
                                                    html={edu.degree || ""}
                                                    isActive={isSpellCheckActive}
                                                    onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "degree")}
                                                />
                                            </li>
                                        </ul>
                                        <div style={{ paddingLeft: "16px", fontSize: "calc(11.5px * var(--theme-font-scale, 1))", color: "#444", lineHeight: "var(--theme-line-height, 1.4)" }}>
                                            <RichTextSpellCheck
                                                html={[edu.institution || edu.school, edu.location].filter(Boolean).join(", ")}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "institution")}
                                            />
                                        </div>
                                        {edu.year && (
                                            <div style={{ paddingLeft: "16px", fontSize: "calc(11px * var(--theme-font-scale, 1))", color: "#666" }}>{edu.year}</div>
                                        )}
                                        {edu.grade && (
                                            <div style={{ paddingLeft: "16px", fontSize: "calc(11px * var(--theme-font-scale, 1))", color: "#666", marginTop: "2px" }}>
                                                GPA: <SpellCheckText text={edu.grade} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "grade")} />
                                            </div>
                                        )}
                                        {edu.description && (
                                            <div className="resume-rich-text" style={{ paddingLeft: "16px", fontSize: "calc(11.5px * var(--theme-font-scale, 1))", color: "#444", marginTop: "4px", lineHeight: "1.5" }}>
                                                <SplittableRichText html={edu.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "description")} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </SectionWrapper>
                );
            }

            return (
                <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
                    <div>
                        <MainSectionTitle title="Education" />
                        <div style={styles.mainSectionContent}>
                            {items.map((edu, i) => {
                                if (!edu) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(14px * var(--theme-paragraph-margin, 1))" }}>
                                        <div style={{ fontWeight: "700", fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: "white" }}>
                                            <RichTextSpellCheck html={edu.degree || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "degree")} />
                                        </div>
                                        <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>
                                            <RichTextSpellCheck html={[edu.institution || edu.school, edu.location].filter(Boolean).join(", ")} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "institution")} />
                                        </div>
                                        {edu.grade && (
                                            <div style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", color: "rgba(255,255,255,0.6)", marginTop: "2px" }}>
                                                GPA: <SpellCheckText text={edu.grade} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "grade")} />
                                            </div>
                                        )}
                                        {edu.description && (
                                            <div className="resume-rich-text" style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "rgba(255,255,255,0.9)", marginTop: "6px", lineHeight: "1.6" }}>
                                                <SplittableRichText html={edu.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("education", originalIdx, val, "description")} />
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

        skills: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.skills?.[idx]).filter(Boolean) : (data.skills || []);
            const hasDescription = data.skillsDescription && data.skillsDescription.trim();
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");

            const titleComp = isSidebar ? <SidebarTitle title="Key Skills" /> : <MainSectionTitle title="Key Skills" />;

            if (items.length > 0) {
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <div>
                            {titleComp}
                            {isSidebar ? (
                                <ul style={styles.sidebarBulletList}>
                                    {items.map((skill, i) => {
                                        const originalIdx = itemIndices ? itemIndices[i] : i;
                                        const lvl = typeof skill === "object" ? skill.level ?? skill.rating : null;
                                        return (
                                            <li key={originalIdx} data-item-index={originalIdx} style={styles.sidebarBulletItem}>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                    <RichTextSpellCheck html={typeof skill === "object" ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("skills", originalIdx, val, "name")} />
                                                    {lvl > 0 && (
                                                        <span style={{ display: "flex", gap: "2px", marginLeft: "6px" }}>
                                                            {[...Array(5)].map((_, di) => (
                                                                <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? GOLD : "#bbb" }} />
                                                            ))}
                                                        </span>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <div style={styles.mainSectionContent}>
                                    <ul style={styles.mainBulletList}>
                                        {items.map((skill, i) => {
                                            const originalIdx = itemIndices ? itemIndices[i] : i;
                                            return (
                                                <li key={originalIdx} data-item-index={originalIdx} style={styles.mainBulletItem}>
                                                    <RichTextSpellCheck html={typeof skill === "object" ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("skills", originalIdx, val, "name")} />
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </SectionWrapper>
                );
            }

            if (hasDescription) {
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <div>
                            {titleComp}
                            <div className="resume-rich-text" style={isSidebar
                                ? { fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#2d2d2d", lineHeight: "var(--theme-line-height, 1.55)" }
                                : { ...styles.mainSectionContent, ...styles.expDesc }
                            }>
                                <SplittableRichText html={data.skillsDescription} range={useSectionContext()?.subItemRanges?.skillsDescription} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("skills", "skillsDescription", val)} />
                            </div>
                        </div>
                    </SectionWrapper>
                );
            }
            return null;
        },

        strengths: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.strengths?.[idx]).filter(Boolean) : (data.strengths || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");
            return (
                <SectionWrapper sectionId="strengths" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Strengths">
                    <div>
                        {isSidebar ? <SidebarTitle title="Key Strengths" /> : <MainSectionTitle title="Key Strengths" />}
                        {isSidebar ? (
                            <ul style={styles.sidebarBulletList}>
                                {items.map((skill, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    const lvl = typeof skill === "object" ? skill.level ?? skill.rating : null;
                                    return (
                                        <li key={originalIdx} data-item-index={originalIdx} style={styles.sidebarBulletItem}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <RichTextSpellCheck html={typeof skill === "object" ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("strengths", originalIdx, val, "name")} />
                                                {lvl > 0 && (
                                                    <span style={{ display: "flex", gap: "2px", marginLeft: "6px" }}>
                                                        {[...Array(5)].map((_, di) => <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? GOLD : "#bbb" }} />)}
                                                    </span>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div style={styles.mainSectionContent}>
                                <ul style={styles.mainBulletList}>
                                    {items.map((skill, i) => {
                                        const originalIdx = itemIndices ? itemIndices[i] : i;
                                        return <li key={originalIdx} data-item-index={originalIdx} style={styles.mainBulletItem}><RichTextSpellCheck html={typeof skill === "object" ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("strengths", originalIdx, val, "name")} /></li>;
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                </SectionWrapper>
            );
        },

        additionalSkills: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map((idx) => data.additionalSkills?.[idx]).filter(Boolean) : (data.additionalSkills || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes("sidebar");
            return (
                <SectionWrapper sectionId="additionalSkills" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Skills">
                    <div>
                        {isSidebar ? <SidebarTitle title="Additional Skills" /> : <MainSectionTitle title="Additional Skills" />}
                        {isSidebar ? (
                            <ul style={styles.sidebarBulletList}>
                                {items.map((skill, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return <li key={originalIdx} data-item-index={originalIdx} style={styles.sidebarBulletItem}><RichTextSpellCheck html={typeof skill === "object" ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("additionalSkills", originalIdx, val, "name")} /></li>;
                                })}
                            </ul>
                        ) : (
                            <div style={styles.mainSectionContent}>
                                <ul style={styles.mainBulletList}>
                                    {items.map((skill, i) => {
                                        const originalIdx = itemIndices ? itemIndices[i] : i;
                                        return <li key={originalIdx} data-item-index={originalIdx} style={styles.mainBulletItem}><RichTextSpellCheck html={typeof skill === "object" ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("additionalSkills", originalIdx, val, "name")} /></li>;
                                    })}
                                </ul>
                            </div>
                        )}
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
                        {isSidebar ? <SidebarTitle title="Languages" /> : <MainSectionTitle title="Languages" />}
                        <div style={isSidebar ? {} : styles.mainSectionContent}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "calc(8px * var(--theme-paragraph-margin, 1))" }}>
                                {items.map((lang, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <div key={i} data-item-index={originalIdx}>
                                            <LanguageItem
                                                item={lang}
                                                index={originalIdx}
                                                isSpellCheckActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onSpellCheckReplace={(field, val) => onSpellCheckReplace("languages", originalIdx, val, field)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
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
                        {isSidebar ? <SidebarTitle title="Software" /> : <MainSectionTitle title="Software" />}
                        <div style={isSidebar ? {} : styles.mainSectionContent}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "calc(8px * var(--theme-paragraph-margin, 1))" }}>
                                {items.map((item, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <div key={i} data-item-index={originalIdx}>
                                            <SoftwareItem
                                                item={item}
                                                index={originalIdx}
                                                isSpellCheckActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onSpellCheckReplace={(field, val) => onSpellCheckReplace("software", originalIdx, val, field)}
                                                variant={isSidebar ? "compact" : undefined}
                                                subItemRange={renderSubItemRanges?.[originalIdx]}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
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
                        {isSidebar ? <SidebarTitle title="Interests" /> : <MainSectionTitle title="Interests" />}
                        {isSidebar ? (
                            <ul style={styles.sidebarBulletList}>
                                {items.map((item, i) => (
                                    <li key={i} data-item-index={itemIndices ? itemIndices[i] : i} style={styles.sidebarBulletItem}>
                                        <RichTextSpellCheck html={typeof item === "object" ? item.name : item} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("interests", itemIndices ? itemIndices[i] : i, val, "name")} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div style={styles.mainSectionContent}>
                                <ul style={styles.mainBulletList}>
                                    {items.map((item, i) => (
                                        <li key={i} data-item-index={itemIndices ? itemIndices[i] : i} style={styles.mainBulletItem}>
                                            <RichTextSpellCheck html={typeof item === "object" ? item.name : item} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace("interests", itemIndices ? itemIndices[i] : i, val, "name")} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </SectionWrapper>
            );
        },
    };

    // --- RENDER ZONE ---
    const renderZone = (id, items, extraStyle = {}) => (
        <DroppableZone id={id} style={{ ...extraStyle, display: "flex", flexDirection: "column" }}>
            {items.map((sid, idx) => {
                const isContinued = typeof sid === "object" && sid.isContinued;
                const sectionId = typeof sid === "string" ? sid : sid.id;
                const dragId = isContinued ? `${id}-cont-${sectionId}-${idx}` : sectionId;
                const isSidebar = id?.toLowerCase().includes("sidebar");
                const spacing = isSidebar ? "22px" : "25px";
                return (
                    <DraggableSection key={dragId} id={dragId} isEnabled={canReorder && !isContinued}>
                        <div style={{ paddingBottom: `calc(${spacing} * var(--theme-section-margin, 1))` }}>
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
                        </div>
                    </DraggableSection>
                );
            })}
        </DroppableZone>
    );

    // --- MEASURER ---
    const Measurer = () => (
        <div className="resume-measurer" style={{ position: "absolute", top: -10000, left: -10000, width: "210mm", visibility: "hidden" }}>
            <div className="page-height-marker" style={{ height: "297mm", width: "1px", position: "absolute", left: 0, top: 0 }} />
            <div style={{ ...styles.page, height: "auto", overflow: "visible" }}>
                <Header />
                <div style={styles.bodyRow}>
                    <div data-column-id="sidebar" style={styles.sidebarColumn}>
                        {activeSidebarSections.map((sid) => (
                            <div key={sid} style={{ paddingBottom: "1px" }}>
                                <SectionRenderer sectionId={sid} data={data} customRenderers={customRenderers} zoneId="sidebar" />
                            </div>
                        ))}
                    </div>
                    <div data-column-id="main" style={styles.mainColumn}>
                        {activeMainSections.map((sid) => (
                            <div key={sid} style={{ paddingBottom: "1px" }}>
                                <SectionRenderer sectionId={sid} data={data} customRenderers={customRenderers} zoneId="main" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // --- MAIN RENDER ---
    return (
        <div ref={containerRef} className="ruby-ribbon-root">
            <Measurer />
            <DndContext {...dndContextProps}>
                <SortableContext items={[...activeMainSections, ...activeSidebarSections]} strategy={verticalListSortingStrategy}>
                    {showPageBreaks && pages ? (
                        pages.map((page, i) => (
                            <div key={i} style={{ ...styles.page, height: "297mm", overflow: "hidden" }}>
                                {i === 0 && <Header />}
                                <div style={{ ...styles.bodyRow, flex: 1 }}>
                                    <div style={styles.sidebarColumn}>
                                        {renderZone(`sidebar-p${i}`, page.sidebar)}
                                    </div>
                                    <div style={styles.mainColumn}>
                                        {renderZone(`main-p${i}`, page.main)}
                                    </div>
                                </div>
                                <div style={{ position: "absolute", bottom: "8px", right: "14px", fontSize: "9px", opacity: 0.4, color: "white" }}>
                                    Page {i + 1}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ ...styles.page, height: "auto", minHeight: "100%" }}>
                            <Header />
                            <div style={styles.bodyRow}>
                                <div style={styles.sidebarColumn}>
                                    {renderZone("sidebar", activeSidebarSections)}
                                </div>
                                <div style={styles.mainColumn}>
                                    {renderZone("main", activeMainSections)}
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

export default RubyRibbon;
