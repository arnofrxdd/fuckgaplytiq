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
import { Mail, Phone, MapPin, Globe, Linkedin, Github, User, Briefcase, GraduationCap, Award, Monitor, Heart, BookOpen, Trophy, Star } from "lucide-react";
import { getCompleteLayout, getSavedLayout } from "../common/TemplateUtils";

/**
 * MajesticPlum Template
 * Matches the reference image: dark purple left sidebar with photo,
 * white right main content area, section icons, clean typography.
 * Full pagination, drag-and-drop, spell check, all spacing CSS variables.
 */
const MajesticPlum = ({
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
    const templateId = 'majestic-plum';
    const savedLayout = data.templateLayouts?.[templateId] || {};
    const initialLayout = {
        left: savedLayout.left || savedLayout.sidebar || ['contact', 'skills', 'additionalSkills', 'strengths', 'languages', 'certifications', 'software', 'interests', 'websites'],
        right: savedLayout.right || savedLayout.main || ['summary', 'education', 'experience', 'projects', 'keyAchievements', 'accomplishments', 'affiliations', 'awards', 'volunteer', 'publications', 'personalDetails', 'custom', 'additionalInfo']
    };

    const completeLayout = getCompleteLayout(data, initialLayout, 'right');
    const activeLeftSections = completeLayout.left || [];
    const activeRightSections = completeLayout.right || [];

    // --- DRAG & DROP ---
    const { dndContextProps, activeId } = useResumeDragAndDrop({
        data,
        onReorder,
        scale,
        containers: { left: activeLeftSections, right: activeRightSections }
    });

    // --- PAGINATION ---
    const pages = useAutoPagination({
        columns: { left: activeLeftSections, right: activeRightSections },
        data,
        enabled: showPageBreaks,
        containerRef,
        scale
    });

    // --- ACCENT COLOR ---
    const accentColor = "var(--theme-color, #4A154B)"; // Deep Plum
    const sidebarBg = "#F3F3F3"; // Light Gray

    // --- STYLES ---
    const styles = {
        page: {
            width: "210mm",
            height: "297mm",
            background: "white",
            boxSizing: "border-box",
            position: "relative",
            margin: "0 auto 30px auto",
            color: "#333",
            fontFamily: "var(--theme-font, 'Inter', sans-serif)",
            display: "flex",
            flexDirection: "row",
        },
        sidebar: {
            width: "32%",
            background: sidebarBg,
            paddingTop: "var(--theme-page-margin, 40px)",
            paddingLeft: "var(--theme-page-margin, 25px)",
            paddingRight: "var(--theme-page-margin, 25px)",
            paddingBottom: "var(--theme-page-margin, 40px)",
            display: "flex",
            flexDirection: "column",
            gap: "25px",
            height: "100%",
            boxSizing: "border-box",
        },
        sidebarPhotoWrap: {
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
        },
        photo: {
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            objectFit: "cover",
            border: `5px solid white`,
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        },
        sidebarSectionTitle: {
            fontSize: "calc(14px * var(--theme-font-scale, 1))",
            fontWeight: "800",
            color: accentColor,
            textTransform: "uppercase",
            letterSpacing: "calc(1.5px + var(--theme-letter-spacing, 0px))",
            marginTop: "0",
            marginBottom: "8px",
        },
        sidebarDivider: {
            width: "100%",
            height: "1px",
            background: "#D1D1D1",
            marginBottom: "15px",
        },
        contactLabel: {
            fontSize: "calc(10px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "#666",
            textTransform: "uppercase",
            marginBottom: "2px",
            display: "block",
        },
        contactValue: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: "#333",
            marginBottom: "12px",
            display: "block",
            lineHeight: "var(--theme-line-height, 1.4)",
        },
        skillItem: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: "#444",
            marginBottom: "6px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
        },
        bullet: {
            width: "4px",
            height: "4px",
            background: accentColor,
            borderRadius: "50%",
        },
        // Main column
        main: {
            flex: 1,
            background: "white",
            display: "flex",
            flexDirection: "column",
            position: "relative",
        },
        timelineLine: {
            position: "absolute",
            left: "54px",
            top: "0",
            bottom: "0",
            width: "2px",
            background: "#E0E0E0",
            zIndex: 0,
        },
        headerBlock: {
            background: accentColor,
            paddingTop: "var(--theme-page-margin, 50px)",
            paddingLeft: "var(--theme-page-margin, 40px)",
            paddingRight: "var(--theme-page-margin, 40px)",
            paddingBottom: "var(--theme-page-margin, 50px)",
            color: "white",
            marginBottom: "20px",
            position: "relative",
            zIndex: 1,
            boxSizing: "border-box",
            WebkitPrintColorAdjust: "exact",
        },
        name: {
            fontSize: "calc(36px * var(--theme-font-scale, 1))",
            fontWeight: "900",
            margin: 0,
            lineHeight: "1.1",
            textTransform: "uppercase",
            letterSpacing: "calc(2px + var(--theme-letter-spacing, 0px))",
        },
        profession: {
            fontSize: "calc(15px * var(--theme-font-scale, 1))",
            marginTop: "8px",
            textTransform: "uppercase",
            letterSpacing: "calc(2px + var(--theme-letter-spacing, 0px))",
            opacity: 0.9,
            fontWeight: "400",
        },
        mainContentPadding: {
            paddingTop: "0",
            paddingLeft: "var(--theme-page-margin, 40px)",
            paddingRight: "var(--theme-page-margin, 40px)",
            paddingBottom: "var(--theme-page-margin, 40px)",
            display: "flex",
            flexDirection: "column",
            gap: "25px",
            position: "relative",
            zIndex: 1,
            boxSizing: "border-box",
        },
        sectionTitleMain: {
            fontSize: "calc(16px * var(--theme-font-scale, 1))",
            fontWeight: "800",
            color: accentColor,
            textTransform: "uppercase",
            letterSpacing: "calc(1.5px + var(--theme-letter-spacing, 0px))",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "0",
            marginBottom: "15px",
            background: "white", // To cover the timeline line behind the text
            position: "relative",
            zIndex: 2,
        },
        sectionIconBox: {
            width: "28px",
            height: "28px",
            background: accentColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            flexShrink: 0,
            zIndex: 3,
        },
        mainDivider: {
            flex: 1,
            height: "1px",
            background: "#E0E0E0",
        },
        expItem: {
            marginBottom: "calc(15px * var(--theme-paragraph-margin, 1))",
            position: "relative",
            paddingLeft: "40px", // Increased to clear the icon area
        },
        expDot: {
            position: "absolute",
            left: "8px",
            top: "4px",
            width: "12px",
            height: "12px",
            backgroundColor: "white",
            border: "1.5px solid #A0A0A0",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
            boxSizing: "border-box",
        },
        expDotInner: {
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#A0A0A0",
            WebkitPrintColorAdjust: "exact",
        },
    };

    // --- SECTION TITLE COMPONENTS ---
    const SidebarSectionTitle = ({ title }) => {
        const { isContinued } = useSectionContext();
        return (
            <div>
                <div style={styles.sidebarSectionTitle}>
                    {isContinued ? `${title} (Cont.)` : title}
                </div>
                <div style={styles.sidebarDivider} />
            </div>
        );
    };

    const MainSectionTitle = ({ title, icon: Icon }) => {
        const { isContinued } = useSectionContext();
        return (
            <div style={styles.sectionTitleMain}>
                <div style={styles.sectionIconBox}>
                    {Icon ? <Icon size={16} /> : <User size={16} />}
                </div>
                {isContinued ? `${title} (Cont.)` : title}
                <div style={styles.mainDivider} />
            </div>
        );
    };

    // --- HEADER (Name + Profession) - rendered at top of main column ---
    const Header = () => (
        <SectionWrapper sectionId="personal" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Header">
            <div style={styles.headerBlock}>
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
        </SectionWrapper>
    );

    // --- CUSTOM RENDERERS ---
    const customRenderers = {
        // SIDEBAR SECTIONS
        contact: ({ zoneId }) => {
            const isSidebar = zoneId?.includes("left");
            const items = data.websites || [];
            const extraLinks = [
                personal?.linkedin && { label: 'LinkedIn', value: personal.linkedin },
                personal?.github && { label: 'GitHub', value: personal.github },
                personal?.website && { label: 'Website', value: personal.website },
                ...items.filter(l => l.addToHeader && l.url).map(l => ({ label: l.label || 'Link', value: l.url }))
            ].filter(Boolean);

            if (isSidebar) {
                return (
                    <SectionWrapper sectionId="contact" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Contact">
                        <div>
                            <SidebarSectionTitle title="Contact" />
                            {personal?.phone && (
                                <div style={{ marginBottom: "12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                                        <Phone size={12} color={accentColor} />
                                        <span style={styles.contactLabel}>Phone:</span>
                                    </div>
                                    <span style={styles.contactValue}>
                                        <ResumeLink href={personal.phone}>
                                            <SpellCheckText text={personal.phone} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'phone', val)} />
                                        </ResumeLink>
                                    </span>
                                </div>
                            )}
                            {personal?.email && (
                                <div style={{ marginBottom: "12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                                        <Mail size={12} color={accentColor} />
                                        <span style={styles.contactLabel}>Email Address:</span>
                                    </div>
                                    <span style={styles.contactValue}>
                                        <ResumeLink href={personal.email}>
                                            <SpellCheckText text={personal.email} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'email', val)} />
                                        </ResumeLink>
                                    </span>
                                </div>
                            )}
                            {(personal?.city || personal?.state || personal?.country) && (
                                <div style={{ marginBottom: "12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                                        <MapPin size={12} color={accentColor} />
                                        <span style={styles.contactLabel}>Address:</span>
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
                            {extraLinks.map((link, i) => {
                                const Icon = link.label?.toLowerCase().includes('github') ? Github : link.label?.toLowerCase().includes('linkedin') ? Linkedin : Globe;
                                return (
                                    <div key={i} style={{ marginBottom: "12px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                                            <Icon size={12} color={accentColor} />
                                            <span style={styles.contactLabel}>{link.label}:</span>
                                        </div>
                                        <span style={styles.contactValue}>
                                            <ResumeLink href={link.value}>
                                                <SpellCheckText text={link.value} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={() => { }} />
                                            </ResumeLink>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </SectionWrapper>
                );
            }
            // Fallback: main column contact
            return null;
        },

        websites: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.websites?.[idx]) : data.websites;
            const links = (items || [])
                .map((l, i) => ({ ...l, originalIdx: itemIndices ? itemIndices[i] : i }))
                .filter(l => !l.addToHeader && l.url);
            if (links.length === 0) return null;
            const isSidebar = zoneId?.includes("left");
            if (isSidebar) {
                return (
                    <SectionWrapper sectionId="websites" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Websites">
                        <div>
                            <SidebarSectionTitle title="Websites & Portfolios" />
                            {links.map((site, i) => (
                                <React.Fragment key={i}>
                                    <span style={styles.contactLabel}>{site.label || 'Portfolio'}</span>
                                    <span style={styles.contactValue}>
                                        <ResumeLink href={site.url}>
                                            <SpellCheckText text={site.url} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('websites', site.originalIdx, val, 'url')} />
                                        </ResumeLink>
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>
                    </SectionWrapper>
                );
            }
            return null;
        },

        skills: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.skills?.[idx]).filter(Boolean) : (data.skills || []);
            const hasDesc = data.skillsDescription?.trim();
            const isSidebar = zoneId?.includes("left");

            if (items.length > 0) {
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Tech Skills">
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Tech Skills" /> : <MainSectionTitle title="Skills" icon={Monitor} />}
                            {items.map((skill, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const name = typeof skill === 'object' ? skill.name : skill;
                                return (
                                    <div key={originalIdx} data-item-index={originalIdx} style={styles.skillItem}>
                                        {isSidebar && <div style={styles.bullet} />}
                                        <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('skills', originalIdx, val, 'name')} />
                                    </div>
                                );
                            })}
                        </div>
                    </SectionWrapper>
                );
            }
            if (hasDesc) {
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <div>
                            {isSidebar ? <SidebarSectionTitle title="Tech Skills" /> : <MainSectionTitle title="Skills" icon={Monitor} />}
                            <div className="resume-rich-text" style={{ fontSize: "12.5px", color: "#444" }}>
                                <SplittableRichText html={data.skillsDescription} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('skills', 'skillsDescription', val)} />
                            </div>
                        </div>
                    </SectionWrapper>
                );
            }
            return null;
        },

        strengths: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.strengths?.[idx]).filter(Boolean) : (data.strengths || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="strengths" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Soft Skills">
                    <div>
                        {isSidebar ? <SidebarSectionTitle title="Soft Skills" /> : <MainSectionTitle title="Key Strengths" icon={Star} />}
                        {items.map((skill, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const name = typeof skill === 'object' ? skill.name : skill;
                            return (
                                <div key={originalIdx} data-item-index={originalIdx} style={styles.skillItem}>
                                    {isSidebar && <div style={styles.bullet} />}
                                    <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('strengths', originalIdx, val, 'name')} />
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        additionalSkills: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.additionalSkills?.[idx]).filter(Boolean) : (data.additionalSkills || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="additionalSkills" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Skills">
                    <div>
                        {isSidebar ? <SidebarSectionTitle title="Additional Skills" /> : <MainSectionTitle title="Additional Skills" icon={Monitor} />}
                        {items.map((skill, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const name = typeof skill === 'object' ? skill.name : skill;
                            return (
                                <div key={originalIdx} data-item-index={originalIdx} style={styles.skillItem}>
                                    {isSidebar && <div style={styles.bullet} />}
                                    <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalSkills', originalIdx, val, 'name')} />
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        languages: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.languages?.[idx]) : data.languages;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="languages" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Languages">
                    <div>
                        {isSidebar ? <SidebarSectionTitle title="Languages" /> : <MainSectionTitle title="Languages" icon={Globe} />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {items.map((lang, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const name = typeof lang === 'object' ? lang.name : lang;
                                const level = typeof lang === 'object' ? lang.level : null;
                                return (
                                    <div key={originalIdx} style={styles.skillItem}>
                                        {isSidebar && <div style={styles.bullet} />}
                                        <RichTextSpellCheck html={`${name}${level ? ` (${level})` : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('languages', originalIdx, val, 'name')} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        certifications: ({ itemIndices, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.certifications?.[idx]) : data.certifications;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
                    <div>
                        {isSidebar ? <SidebarSectionTitle title="Certifications" /> : <MainSectionTitle title="Certifications" icon={Award} />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {items.map((cert, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} style={!isSidebar ? styles.expItem : {}}>
                                        {!isSidebar && <div style={styles.expDot} />}
                                        <CertificationItem
                                            item={cert}
                                            index={originalIdx}
                                            isSpellCheckActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onSpellCheckReplace={(field, val) => onSpellCheckReplace('certifications', originalIdx, val, field)}
                                            variant={isSidebar ? 'compact' : undefined}
                                            subItemRange={renderSubItemRanges?.[originalIdx]}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        software: ({ itemIndices, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.software?.[idx]) : data.software;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="software" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Software">
                    <div>
                        {isSidebar ? <SidebarSectionTitle title="Software" /> : <MainSectionTitle title="Software" icon={Monitor} />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} style={!isSidebar ? styles.expItem : {}}>
                                        {!isSidebar && <div style={styles.expDot} />}
                                        <SoftwareItem
                                            item={item}
                                            index={originalIdx}
                                            isSpellCheckActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onSpellCheckReplace={(field, val) => onSpellCheckReplace('software', originalIdx, val, field)}
                                            variant={isSidebar ? 'compact' : undefined}
                                            subItemRange={renderSubItemRanges?.[originalIdx]}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        interests: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.interests?.[idx]) : data.interests;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="interests" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Interests">
                    <div>
                        {isSidebar ? <SidebarSectionTitle title="Interests" /> : <MainSectionTitle title="Interests" />}
                        {items.map((item, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.skillItem}>
                                    {isSidebar && <div style={styles.bullet} />}
                                    <RichTextSpellCheck html={typeof item === 'object' ? item.name : item} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('interests', originalIdx, val, 'name')} />
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        // MAIN COLUMN SECTIONS
        summary: ({ isContinued, subItemRanges, zoneId }) => (
            <SectionWrapper sectionId="summary" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Profile">
                <div>
                    <MainSectionTitle title="Profile" icon={User} />
                    <div className="resume-rich-text" style={{ ...styles.summaryText, fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: "#444", lineHeight: "var(--theme-line-height, 1.6)" }}>
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

        experience: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.experience?.[idx]) : data.experience;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("left");

            return (
                <SectionWrapper sectionId="experience" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Work History">
                    <div>
                        {isSidebar ? <SidebarSectionTitle title="Work History" /> : <MainSectionTitle title="Work History" icon={Briefcase} />}
                        {items.map((exp, i) => {
                            if (!exp) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr = exp.year || exp.date || (exp.startYear ? `${exp.startYear} - ${exp.isCurrent ? "Present" : exp.endYear}` : "");
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.expItem}>
                                    <div style={styles.expDot}>
                                        <div style={styles.expDotInner} />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "4px" }}>
                                        <div style={{ ...styles.expTitle, fontSize: "14px", fontWeight: "700" }}>
                                            <RichTextSpellCheck html={exp.title || exp.role || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'title')} />
                                        </div>
                                        {dateStr && (
                                            <div style={{ fontSize: "11px", color: "#666", fontWeight: "600" }}>
                                                <RichTextSpellCheck html={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'date')} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: accentColor, fontWeight: "600", marginBottom: "5px" }}>
                                        <RichTextSpellCheck html={`${exp.company || ""}${exp.location ? `, ${exp.location}` : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'company')} />
                                    </div>
                                    <div className="resume-rich-text" style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#444", lineHeight: "var(--theme-line-height, 1.6)" }}>
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
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        education: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.education?.[idx]) : data.education;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("left");

            return (
                <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
                    <div>
                        {isSidebar ? <SidebarSectionTitle title="Education" /> : <MainSectionTitle title="Education" icon={GraduationCap} />}
                        {items.map((edu, i) => {
                            if (!edu) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const year = edu.year || edu.date || (edu.endYear || "");
                            const startYear = edu.startYear || "";
                            const dateStr = startYear ? `${startYear} - ${edu.isCurrent ? "Present" : year}` : year;
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.expItem}>
                                    <div style={styles.expDot}>
                                        <div style={styles.expDotInner} />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "4px" }}>
                                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a1a" }}>
                                            <RichTextSpellCheck html={edu.degree} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'degree')} />
                                        </div>
                                        {dateStr && (
                                            <div style={{ fontSize: "11px", color: "#666", fontWeight: "600" }}>
                                                <RichTextSpellCheck html={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'year')} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: accentColor, fontWeight: "600", marginBottom: "4px" }}>
                                        <RichTextSpellCheck html={`${edu.institution || edu.school || ""}${edu.location ? `, ${edu.location}` : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'institution')} />
                                    </div>
                                    {edu.grade && <div style={{ fontSize: "11.5px", color: "#666" }}>GPA: {edu.grade}</div>}
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
            const isSidebar = zoneId?.includes("left");

            return (
                <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
                    <div>
                        {isSidebar ? <SidebarSectionTitle title="Projects" /> : <MainSectionTitle title="Projects" icon={Monitor} />}
                        {items.map((proj, i) => {
                            if (!proj) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr = proj.year || (proj.startYear && `${proj.startYear} - ${proj.isCurrent ? 'Present' : (proj.endYear || 'Present')}`);
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.expItem}>
                                    <div style={styles.expDot}>
                                        <div style={styles.expDotInner} />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "4px", marginBottom: "3px" }}>
                                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a1a" }}>
                                            <RichTextSpellCheck html={proj.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'title')} />
                                        </div>
                                        {dateStr && (
                                            <div style={{ fontSize: "11px", color: "#666", fontWeight: "600" }}>
                                                <SpellCheckText text={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, proj.year ? 'year' : 'date')} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="resume-rich-text" style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#444", lineHeight: "var(--theme-line-height, 1.6)" }}>
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

        awards: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.awards?.[idx]) : data.awards;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="awards" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Awards">
                    <div>
                        {isSidebar ? <SidebarSectionTitle title="Awards" /> : <MainSectionTitle title="Achievements & Hackathons" icon={Trophy} />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {items.map((award, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.expItem}>
                                        <div style={styles.expDot} />
                                        <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>
                                            <RichTextSpellCheck html={award.title || award.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', originalIdx, val, award.title ? 'title' : 'name')} />
                                        </div>
                                        {award.issuer && (
                                            <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: accentColor, fontWeight: "600" }}>
                                                <RichTextSpellCheck html={award.issuer} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', originalIdx, val, 'issuer')} />
                                            </div>
                                        )}
                                        {award.description && (
                                            <div className="resume-rich-text" style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#444", marginTop: "3px" }}>
                                                <SplittableRichText html={award.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', originalIdx, val, 'description')} />
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

        keyAchievements: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.keyAchievements?.[idx]) : data.keyAchievements;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="keyAchievements" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Achievements">
                    <div>
                        {isSidebar ? <SidebarSectionTitle title="Key Achievements" /> : <MainSectionTitle title="Key Achievements" icon={Award} />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.expItem}>
                                        <div style={styles.expDot} />
                                        <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>
                                            <RichTextSpellCheck html={item.name || item.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIdx, val, item.name ? 'name' : 'title')} />
                                        </div>
                                        {item.description && (
                                            <div className="resume-rich-text" style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#444", marginTop: "3px" }}>
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

        volunteer: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.volunteer?.[idx]) : data.volunteer;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="volunteer" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Volunteer">
                    <div>
                        <MainSectionTitle title="Volunteer" icon={Heart} />
                        {items.map((item, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} style={styles.expItem}>
                                    <div style={styles.expDot} />
                                    <div style={{ ...styles.expTitle, fontSize: "14px", fontWeight: "700", color: "#1a1a1a" }}>
                                        <RichTextSpellCheck html={item.organization} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteer', originalIdx, val, 'organization')} />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", color: "#666", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>
                                        <RichTextSpellCheck html={item.role} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteer', originalIdx, val, 'role')} />
                                        <span>
                                            {item.startDate} - {item.isCurrent ? "Present" : item.endDate}
                                        </span>
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
                        <MainSectionTitle title="Publications" icon={BookOpen} />
                        {items.map((pub, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} style={styles.expItem}>
                                    <div style={styles.expDot} />
                                    <div style={{ ...styles.expTitle, fontSize: "14px", fontWeight: "700", color: "#1a1a1a" }}>
                                        <RichTextSpellCheck html={pub.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('publications', originalIdx, val, 'name')} />
                                    </div>
                                    <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: accentColor, fontWeight: "600" }}>
                                        <RichTextSpellCheck html={pub.publisher} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('publications', originalIdx, val, 'publisher')} />
                                        {pub.releaseDate && <span> • {pub.releaseDate}</span>}
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
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="additionalInfo" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Information">
                    <div>
                        {isSidebar ? <SidebarSectionTitle title="Additional Information" /> : <MainSectionTitle title="Additional Information" />}
                        <div className="resume-rich-text" style={styles.descText}>
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
            const title = data.customSection.title || "Additional Information";
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="custom" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <div>
                        {isSidebar ? <SidebarSectionTitle title={title} /> : <MainSectionTitle title={title} />}
                        <div className="resume-rich-text" style={styles.descText}>
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

        accomplishments: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.accomplishments?.[idx]) : data.accomplishments;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="accomplishments" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Accomplishments">
                    <div>
                        {isSidebar ? <SidebarSectionTitle title="Accomplishments" /> : <MainSectionTitle title="Accomplishments" icon={Trophy} />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.expItem}>
                                        <div style={styles.expDot} />
                                        <div style={{ fontWeight: "700", fontSize: "14.5px", color: "#1a1a1a" }}>
                                            <RichTextSpellCheck html={item.title || item.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('accomplishments', originalIdx, val, item.title ? 'title' : 'name')} />
                                        </div>
                                        {item.description && (
                                            <div className="resume-rich-text" style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#444", marginTop: "2px" }}>
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
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="affiliations" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Affiliations">
                    <div>
                        {isSidebar ? <SidebarSectionTitle title="Affiliations" /> : <MainSectionTitle title="Professional Affiliations" icon={User} />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.expItem}>
                                        <div style={styles.expDot} />
                                        <div style={{ fontWeight: "700", fontSize: "14.5px", color: "#1a1a1a" }}>
                                            <RichTextSpellCheck html={item.organization || item.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, item.organization ? 'organization' : 'name')} />
                                        </div>
                                        {item.role && <div style={{ fontSize: "12px", color: accentColor, fontWeight: "600" }}>{item.role}</div>}
                                        {item.description && (
                                            <div className="resume-rich-text" style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#444", marginTop: "2px" }}>
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
                { label: 'Other', value: p.otherPersonal || p.otherInformation }
            ].filter(d => d.value);

            if (details.length === 0) return null;
            const isSidebar = zoneId?.includes("left");

            return (
                <SectionWrapper sectionId="personalDetails" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Personal Details">
                    <div>
                        {isSidebar ? <SidebarSectionTitle title="Details" /> : <MainSectionTitle title="Personal Details" icon={User} />}
                        <div style={isSidebar ? {} : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
                            {details.map((d, i) => (
                                <div key={i} style={{ marginBottom: isSidebar ? "8px" : "0" }}>
                                    <div style={styles.contactLabel}>{d.label}:</div>
                                    <div style={styles.contactValue}>{d.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
    };

    // --- RENDER DROPPABLE ZONE ---
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

    // --- MEASURER (for auto-pagination calculations) ---
    const Measurer = () => (
        <div className="resume-measurer" style={{ position: "absolute", top: -10000, left: -10000, width: "210mm", visibility: "hidden" }}>
            <div className="page-height-marker" style={{ height: "297mm", width: "1px", position: "absolute", left: 0, top: 0 }} />
            <div style={{ ...styles.page, height: "auto" }}>
                <div data-column-id="left" style={{ ...styles.sidebar, height: "100%", gap: "calc(25px * var(--theme-section-margin, 1))" }}>
                    {personal?.photo && (
                        <div style={styles.sidebarPhotoWrap}>
                            <img src={personal.photo} style={styles.photo} alt="profile" />
                        </div>
                    )}
                    {activeLeftSections.map(sid => (
                        <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="left" />
                    ))}
                </div>
                <div data-column-id="right" style={{ ...styles.main, gap: "calc(25px * var(--theme-section-margin, 1))" }}>
                    <Header />
                    <div style={styles.mainContentPadding}>
                        {activeRightSections.map(sid => (
                            <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="right" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="majestic-plum-root">
            <Measurer />
            <DndContext {...dndContextProps}>
                <SortableContext items={[...activeLeftSections, ...activeRightSections]} strategy={verticalListSortingStrategy}>
                    {showPageBreaks && pages ? (
                        pages.map((page, i) => (
                            <div key={i} className="resume-page" style={{ ...styles.page, height: "297mm" }}>
                                {/* SIDEBAR */}
                                <div data-column-id="left" style={{ ...styles.sidebar, height: "100%" }}>
                                    {i === 0 && personal?.photo && (
                                        <div style={styles.sidebarPhotoWrap}>
                                            <img src={personal.photo} style={styles.photo} alt="profile" />
                                        </div>
                                    )}
                                    {renderZone(`left-p${i}`, page.left || [], {
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "calc(25px * var(--theme-section-margin, 1))"
                                    })}
                                </div>
                                {/* MAIN */}
                                <div data-column-id="right" style={{ ...styles.main, height: "100%" }}>
                                    <div style={styles.timelineLine} />
                                    {i === 0 && <Header />}
                                    <div style={{ ...styles.mainContentPadding, flex: 1, display: "flex", flexDirection: "column" }}>
                                        {renderZone(`right-p${i}`, page.right || [], {
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "calc(25px * var(--theme-section-margin, 1))"
                                        })}
                                    </div>
                                </div>
                                {i > 0 && (
                                    <div style={{ position: "absolute", bottom: "15px", right: "20px", fontSize: "10px", opacity: 0.4 }}>
                                        Page {i + 1}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="resume-page" style={{ ...styles.page, height: "auto", backgroundColor: "white" }}>
                            <div data-column-id="left" style={{ ...styles.sidebar, minHeight: "100%" }}>
                                {personal?.photo && (
                                    <div style={styles.sidebarPhotoWrap}>
                                        <img src={personal.photo} style={styles.photo} alt="profile" />
                                    </div>
                                )}
                                {renderZone('left', activeLeftSections, {
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "calc(25px * var(--theme-section-margin, 1))"
                                })}
                            </div>
                            <div data-column-id="right" style={styles.main}>
                                <div style={styles.timelineLine} />
                                <Header />
                                <div style={{ ...styles.mainContentPadding, flex: 1, display: "flex", flexDirection: "column" }}>
                                    {renderZone('right', activeRightSections, {
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "calc(25px * var(--theme-section-margin, 1))"
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

export default MajesticPlum;