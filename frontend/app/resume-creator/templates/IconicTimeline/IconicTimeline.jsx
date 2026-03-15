import React, { useRef } from "react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SectionWrapper from "../../components/SectionWrapper";
import { useResumeDragAndDrop, DroppableZone, StableResumeDragOverlay } from "../../hooks/useResumeDragAndDrop";
import DraggableSection from "../../components/dnd/DraggableSection";
import SectionRenderer from "../common/SectionRenderer";
import { useSectionContext } from "../common/SectionContext";
import { useAutoPagination } from "../../hooks/useAutoPagination";
import { Mail, Phone, MapPin, Globe, Linkedin, Github, User, Briefcase, GraduationCap, Award, Monitor, Layout, Heart, BookOpen, Trophy, Users } from "lucide-react";
import { SpellCheckText, SplittableRichText, RichTextSpellCheck, LanguageItem, CertificationItem, SoftwareItem, ResumeLink } from "../common/BaseComponents";
import { getCompleteLayout, getSavedLayout } from "../common/TemplateUtils";

/**
 * IconicTimeline Template
 * A high-fidelity reconstruction of the user-provided "marketing manager" template.
 * Features a bold header, thin lines, and a vertical icon-connected timeline.
 */
const IconicTimeline = ({
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

    // --- 2. DYNAMIC LAYOUT ENGINE ---
    const templateId = 'iconic-timeline';
    const initialLayout = getSavedLayout(data, templateId, {
        left: ['personalDetails', 'contact', 'websites', 'skills', 'strengths', 'additionalSkills', 'languages', 'additionalInfo'],
        right: ['summary', 'experience', 'education', 'projects', 'certifications', 'volunteering', 'awards', 'publications', 'references', 'affiliations', 'custom']
    });

    // Auto-complete the layout with any "orphaned" sections (e.g. Certifications, Languages)
    const completeLayout = getCompleteLayout(data, initialLayout, 'right');
    const activeLeftSections = completeLayout.left || [];
    const activeRightSections = completeLayout.right || [];

    // --- 3. DRAG & DROP HOOK ---
    const { dndContextProps, activeId } = useResumeDragAndDrop({
        data,
        onReorder,
        scale,
        containers: { left: activeLeftSections, right: activeRightSections }
    });

    // --- 4. PAGINATION HOOK ---
    const pages = useAutoPagination({
        columns: { left: activeLeftSections, right: activeRightSections },
        data,
        enabled: showPageBreaks,
        containerRef,
        scale
    });

    // --- 5. STYLES ---
    const styles = {
        page: {
            width: "210mm",
            height: "297mm",
            background: "white",
            boxSizing: "border-box",
            position: "relative",
            margin: "0 auto 30px auto",
            color: "#374151",
            fontFamily: "var(--theme-font, 'Inter', sans-serif)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
        },
        header: {
            paddingTop: "var(--theme-page-margin, 50px)",
            paddingLeft: "var(--theme-page-margin, 50px)",
            paddingRight: "var(--theme-page-margin, 50px)",
            paddingBottom: "20px",
            boxSizing: "border-box",
        },
        name: {
            fontSize: "calc(48px * var(--theme-font-scale, 1))",
            fontWeight: "900",
            margin: "0",
            textTransform: "uppercase",
            color: "var(--theme-color, #374151)",
            lineHeight: "1",
        },
        profession: {
            fontSize: "calc(16px * var(--theme-font-scale, 1))",
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: "2px",
            color: "#6b7280",
            marginTop: "8px",
        },
        headerLine: {
            height: "4px",
            background: "#9ca3af", // Grayish-blue accent
            marginTop: "20px",
            width: "100%",
        },
        layoutBody: {
            display: "flex",
            flex: 1,
            minHeight: 0,
            paddingTop: "20px",
            paddingLeft: "var(--theme-page-margin, 50px)",
            paddingRight: "var(--theme-page-margin, 50px)",
            paddingBottom: "var(--theme-page-margin, 50px)",
            boxSizing: "border-box",
        },
        leftColumn: {
            width: "30%",
            minWidth: "30%",
            maxWidth: "30%",
            paddingRight: "30px",
            display: "flex",
            flexDirection: "column",
            gap: "calc(30px * var(--theme-section-margin, 1))",
        },
        rightColumn: {
            width: "70%",
            minWidth: "70%",
            maxWidth: "70%",
            paddingLeft: "0",
            display: "flex",
            flexDirection: "column",
            gap: "calc(35px * var(--theme-section-margin, 1))",
            position: "relative",
            flex: 1,
        },
        verticalSpine: {
            position: "absolute",
            left: "35px",
            top: "0px",
            bottom: "0px",
            width: "1.5px", // Slightly thicker for better visibility
            background: "#9ca3af", // Darker gray
            WebkitPrintColorAdjust: "exact",
        },
        spineCircle: {
            position: "absolute",
            left: "-40.25px", // Center on 1.5px spine: 70 - 40.25 = 29.75. 29.75 + 6 (half of 12) = 35.75. Spine at 35 with 1.5 width has center at 35.75. PERFECT.
            top: "5px",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            border: "2px solid #9ca3af", // Darker border
            background: "white",
            zIndex: 1,
            boxSizing: "border-box",
            WebkitPrintColorAdjust: "exact",
        },
        sectionTitleSidebar: {
            fontSize: "calc(18px * var(--theme-font-scale, 1))",
            fontWeight: "800",
            color: "var(--theme-color, #374151)",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            marginBottom: "8px",
        },
        sectionTitleMain: {
            fontSize: "calc(20px * var(--theme-font-scale, 1))",
            fontWeight: "800",
            color: "var(--theme-color, #374151)",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            marginLeft: "0",
            display: "flex",
            alignItems: "center",
        },
        titleUnderline: {
            height: "1px",
            background: "#374151",
            marginTop: "2px",
            marginBottom: "15px",
            width: "100%",
        },
        contactItem: {
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: "#4b5563",
            marginBottom: "calc(12px * var(--theme-paragraph-margin, 1))",
        },
        skillList: {
            listStyleType: "disc",
            paddingLeft: "18px",
            margin: 0,
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.6)",
            display: "flex",
            flexDirection: "column",
            gap: "calc(8px * var(--theme-paragraph-margin, 1))",
        },
    };

    const Header = () => (
        <SectionWrapper sectionId="personal" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Header">
            <div style={{ ...styles.header, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }}>
                    <h1 style={styles.name}>
                        <SpellCheckText
                            text={personal?.name || "NAME SURNAME"}
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
                {personal?.photo && (
                    <img
                        src={personal.photo}
                        alt="Profile"
                        style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "8px",
                            objectFit: "cover",
                            border: "1px solid #d1d5db"
                        }}
                    />
                )}
            </div>
            <div style={{ padding: "0 var(--theme-page-margin, 50px)" }}>
                <div style={styles.headerLine} />
            </div>
        </SectionWrapper>
    );

    const MainSectionHeader = ({ title, Icon }) => {
        const { isContinued } = useSectionContext();
        const displayTitle = isContinued ? `${title} (Cont.)` : title;
        return (
            <div style={{ position: "relative", marginBottom: "15px" }}>
                <div style={{
                    position: "absolute",
                    left: "-53px", // Centered at 35px relative to 70px padding
                    top: "-2px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#1f2937",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                    color: "white"
                }}>
                    <Icon size={18} />
                </div>
                <h3 style={styles.sectionTitleMain}>{displayTitle}</h3>
                <div style={styles.titleUnderline} />
            </div>
        );
    };

    const SidebarSectionHeader = ({ title }) => {
        const { isContinued } = useSectionContext();
        const displayTitle = isContinued ? `${title} (Cont.)` : title;
        return (
            <>
                <h3 style={styles.sectionTitleSidebar}>{displayTitle}</h3>
                <div style={styles.titleUnderline} />
            </>
        );
    };

    const customRenderers = {
        contact: ({ zoneId }) => {
            const isSidebar = zoneId?.includes("left");
            const items = data.websites || [];
            const contactLinks = [
                { icon: Linkedin, label: 'LinkedIn', value: personal?.linkedin, type: 'personal', field: 'linkedin' },
                { icon: Github, label: 'GitHub', value: personal?.github, type: 'personal', field: 'github' },
                { icon: Globe, label: 'Website', value: personal?.website, type: 'personal', field: 'website' },
                ...items
                    .map((link, idx) => ({ ...link, originalIdx: idx }))
                    .filter(link => link.addToHeader && link.url)
                    .map(link => ({ icon: Globe, label: link.label || 'Website', value: link.url, type: 'websites', field: 'url', idx: link.originalIdx }))
            ];

            return (
                <SectionWrapper sectionId="contact" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Contact">
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>
                        {isSidebar ? (
                            <SidebarSectionHeader title="Contact" />
                        ) : (
                            <MainSectionHeader title="Contact" Icon={Phone} />
                        )}
                        <div style={isSidebar ? {} : { position: "relative" }}>
                            {!isSidebar && <div style={styles.spineCircle} />}
                            <div style={styles.contactItem}>
                                <Phone size={14} style={{ marginTop: "2px" }} />
                                <ResumeLink href={personal?.phone}>
                                    <SpellCheckText text={personal?.phone || "+000 000 000"} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'phone', val)} />
                                </ResumeLink>
                            </div>
                            <div style={styles.contactItem}>
                                <Mail size={14} style={{ marginTop: "2px" }} />
                                <ResumeLink href={personal?.email}>
                                    <SpellCheckText text={personal?.email || "hello@address.com"} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'email', val)} />
                                </ResumeLink>
                            </div>
                            <div style={styles.contactItem}>
                                <MapPin size={14} style={{ marginTop: "2px" }} />
                                <SpellCheckText text={[personal?.city, personal?.state, personal?.zipCode, personal?.country].filter(Boolean).join(", ") || "City, Country"} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'city', val)} />
                            </div>

                            {contactLinks.map((link, i) => link.value && (
                                <div key={i} style={styles.contactItem}>
                                    <link.icon size={14} style={{ marginTop: "2px" }} />
                                    <ResumeLink href={link.value}>
                                        <SpellCheckText
                                            text={link.value}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace(link.type, link.type === 'personal' ? link.field : link.idx, val, link.type === 'websites' ? 'url' : null)}
                                        />
                                    </ResumeLink>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        websites: ({ itemIndices, zoneId }) => {
            const isSidebar = zoneId?.includes("left");
            const items = itemIndices ? itemIndices.map(idx => data.websites?.[idx]) : data.websites;
            const portfolioLinks = (items || [])
                .map((link, idx) => ({ ...link, originalIdx: itemIndices ? itemIndices[idx] : idx }))
                .filter(link => !link.addToHeader && link.url);

            if (portfolioLinks.length === 0) return null;

            return (
                <SectionWrapper sectionId="websites" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Websites & Portfolios">
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>
                        {isSidebar ? (
                            <SidebarSectionHeader title="Websites & Portfolios" />
                        ) : (
                            <MainSectionHeader title="Websites & Portfolios" Icon={Globe} />
                        )}
                        <div style={isSidebar ? {} : { position: "relative" }}>
                            {!isSidebar && <div style={styles.spineCircle} />}
                            {portfolioLinks.map((site, i) => (
                                <div key={i} style={styles.contactItem}>
                                    <Globe size={14} style={{ marginTop: "2px" }} />
                                    <ResumeLink href={site.url}>
                                        <SpellCheckText
                                            text={site.url}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace('websites', site.originalIdx, val, 'url')}
                                        />
                                    </ResumeLink>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        skills: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.skills?.[idx]).filter(Boolean) : (data.skills || []);
            const hasDescription = data.skillsDescription && data.skillsDescription.trim();
            const useStructured = items.length > 0;

            if (useStructured) {
                const isSidebar = zoneId?.includes("left");
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>
                            {isSidebar ? (
                                <SidebarSectionHeader title="Skills" />
                            ) : (
                                <MainSectionHeader title="Skills" Icon={Award} />
                            )}
                            <div style={{ position: "relative" }}>
                                {!isSidebar && <div style={styles.spineCircle} />}
                                <ul style={styles.skillList}>
                                    {items.map((skill, i) => {
                                        const originalIndex = itemIndices ? itemIndices[i] : i;
                                        const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                        return (
                                            <li key={originalIndex} data-item-index={originalIndex}>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                    <RichTextSpellCheck html={typeof skill === 'object' ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('skills', originalIndex, val, 'name')} />
                                                    {lvl > 0 && <span style={{ display: "flex", gap: "3px", marginLeft: "8px" }}>{[...Array(5)].map((_, di) => <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? "var(--theme-color, #635bff)" : "rgba(120,120,120,0.15)" }} />)}</span>}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </SectionWrapper>
                );
            }

            if (hasDescription) {
                const isSidebar = zoneId?.includes("left");
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>
                            {isSidebar ? (
                                <SidebarSectionHeader title="Skills" />
                            ) : (
                                <MainSectionHeader title="Skills" Icon={Award} />
                            )}
                            <div style={{ position: "relative" }}>
                                {!isSidebar && <div style={styles.spineCircle} />}
                                <div className="resume-rich-text" style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", lineHeight: "var(--theme-line-height, 1.6)" }}>
                                    <SplittableRichText
                                        html={data.skillsDescription}
                                        isActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onReplace={(val) => onSpellCheckReplace && onSpellCheckReplace('skills', 'skillsDescription', val)}
                                    />
                                </div>
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
                <SectionWrapper sectionId="strengths" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Strengths">
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>
                        {isSidebar ? (
                            <SidebarSectionHeader title="Key Strengths" />
                        ) : (
                            <MainSectionHeader title="Key Strengths" Icon={Award} />
                        )}
                        <div style={{ position: "relative" }}>
                            {!isSidebar && <div style={styles.spineCircle} />}
                            <ul style={styles.skillList}>
                                {items.map((skill, i) => {
                                    const originalIndex = itemIndices ? itemIndices[i] : i;
                                    const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                    return (
                                        <li key={originalIndex} data-item-index={originalIndex}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <RichTextSpellCheck html={typeof skill === 'object' ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('strengths', originalIndex, val, 'name')} />
                                                {lvl > 0 && <span style={{ display: "flex", gap: "3px", marginLeft: "8px" }}>{[...Array(5)].map((_, di) => <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? "var(--theme-color, #635bff)" : "rgba(120,120,120,0.15)" }} />)}</span>}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
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
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>
                        {isSidebar ? (
                            <SidebarSectionHeader title="Additional Skills" />
                        ) : (
                            <MainSectionHeader title="Additional Skills" Icon={Award} />
                        )}
                        <div style={{ position: "relative" }}>
                            {!isSidebar && <div style={styles.spineCircle} />}
                            <ul style={styles.skillList}>
                                {items.map((skill, i) => {
                                    const originalIndex = itemIndices ? itemIndices[i] : i;
                                    const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                    return (
                                        <li key={originalIndex} data-item-index={originalIndex}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <RichTextSpellCheck html={typeof skill === 'object' ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalSkills', originalIndex, val, 'name')} />
                                                {lvl > 0 && <span style={{ display: "flex", gap: "3px", marginLeft: "8px" }}>{[...Array(5)].map((_, di) => <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? "var(--theme-color, #635bff)" : "rgba(120,120,120,0.15)" }} />)}</span>}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
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
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>
                        {isSidebar ? (
                            <SidebarSectionHeader title="Languages" />
                        ) : (
                            <MainSectionHeader title="Languages" Icon={Globe} />
                        )}
                        <div style={{ position: "relative" }}>
                            {!isSidebar && <div style={styles.spineCircle} />}
                            <ul style={styles.skillList}>
                                {items.map((lang, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <li key={i} data-item-index={originalIdx}>
                                            <LanguageItem
                                                item={lang}
                                                index={originalIdx}
                                                isSpellCheckActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onSpellCheckReplace={(field, val) => onSpellCheckReplace('languages', originalIdx, val, field)}
                                                variant="compact"
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
        certifications: ({ itemIndices, isContinued, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.certifications?.[idx]) : data.certifications;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>
                        {isSidebar ? (
                            <SidebarSectionHeader title="Certifications" />
                        ) : (
                            <MainSectionHeader title="Certifications" Icon={Award} />
                        )}
                        <div style={{ position: "relative" }}>
                            {!isSidebar && <div style={styles.spineCircle} />}
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
                                            onSpellCheckReplace={(field, val) => onSpellCheckReplace('certifications', originalIdx, val, field)}
                                            variant={isSidebar ? 'compact' : undefined}
                                            subItemRange={renderSubItemRanges?.[originalIdx]}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        software: ({ itemIndices, isContinued, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.software?.[idx]) : data.software;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="software" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Software">
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>
                        {isSidebar ? (
                            <SidebarSectionHeader title="Software" />
                        ) : (
                            <MainSectionHeader title="Software" Icon={Monitor} />
                        )}
                        <div style={{ position: "relative" }}>
                            {!isSidebar && <div style={styles.spineCircle} />}
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
                                            onSpellCheckReplace={(field, val) => onSpellCheckReplace('software', originalIdx, val, field)}
                                            variant={isSidebar ? 'compact' : undefined}
                                            subItemRange={renderSubItemRanges?.[originalIdx]}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        summary: ({ isContinued, zoneId, subItemRanges }) => {
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="summary" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Profile">
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>

                        {isSidebar ? (
                            <SidebarSectionHeader title="Profile" />
                        ) : (
                            <MainSectionHeader title="Profile" Icon={User} />
                        )}
                        <div className="resume-rich-text" style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", lineHeight: "var(--theme-line-height, 1.6)", color: "#4b5563" }}>
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
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="experience" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Experience">
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>

                        {isSidebar ? (
                            <SidebarSectionHeader title="Work Experience" />
                        ) : (
                            <MainSectionHeader title="Work Experience" Icon={Briefcase} />
                        )}
                        {items.map((exp, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr = exp.year || exp.date || (exp.startYear ? `${exp.startYear} - ${exp.isCurrent ? "Present" : exp.endYear}` : "");
                            return (
                                <div key={i} data-item-index={originalIdx} style={{ position: "relative", marginBottom: "calc(25px * var(--theme-paragraph-margin, 1))" }}>
                                    {!isSidebar && <div style={styles.spineCircle} />}
                                    <div style={{ display: "flex", flexDirection: isSidebar ? "column" : "row", justifyContent: "space-between", marginBottom: "4px" }}>
                                        <div style={{ fontWeight: "800", fontSize: "calc(16px * var(--theme-font-scale, 1))" }}>
                                            <RichTextSpellCheck html={exp.company} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'company')} />
                                        </div>
                                        <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", fontWeight: "600", color: "#6b7280", marginTop: isSidebar ? "2px" : "0" }}>
                                            <RichTextSpellCheck html={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'date')} />
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: "700", fontSize: "calc(14px * var(--theme-font-scale, 1))", color: "var(--theme-color, #374151)", marginBottom: "8px" }}>
                                        <RichTextSpellCheck html={exp.title || exp.role} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'title')} />
                                    </div>
                                    {(exp.location || exp.isRemote) && (
                                        <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#6b7280", marginBottom: "8px" }}>
                                            {exp.location && <RichTextSpellCheck html={exp.location} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'location')} />}
                                            {exp.location && exp.isRemote && <span> • </span>}
                                            {exp.isRemote && <span>Remote</span>}
                                        </div>
                                    )}
                                    <div className="resume-rich-text" style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", lineHeight: "var(--theme-line-height, 1.6)" }}>
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
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>

                        {isSidebar ? (
                            <SidebarSectionHeader title="Education" />
                        ) : (
                            <MainSectionHeader title="Education" Icon={GraduationCap} />
                        )}
                        {items.map((edu, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIdx} style={{ position: "relative", marginBottom: "calc(25px * var(--theme-paragraph-margin, 1))" }}>
                                    {!isSidebar && <div style={styles.spineCircle} />}
                                    <div style={{ display: "flex", flexDirection: isSidebar ? "column" : "row", justifyContent: "space-between", marginBottom: "4px" }}>
                                        <div style={{ fontWeight: "800", fontSize: "calc(16px * var(--theme-font-scale, 1))" }}>
                                            <RichTextSpellCheck html={edu.degree} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'degree')} />
                                        </div>
                                        <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", fontWeight: "600", color: "#6b7280", marginTop: isSidebar ? "2px" : "0" }}>
                                            <RichTextSpellCheck html={edu.year || edu.date || (edu.endYear ? `${edu.startYear ? edu.startYear + "-" : ""}${edu.endYear}` : "")} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'year')} />
                                        </div>
                                    </div>
                                    <div style={{ fontSize: "calc(14px * var(--theme-font-scale, 1))", color: "#4b5563" }}>
                                        <RichTextSpellCheck html={`${edu.institution || edu.school}${edu.field ? ` | ${edu.field}` : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'institution')} />
                                    </div>
                                    {edu.grade && <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", fontStyle: "italic", marginTop: "2px", color: "#6b7280" }}>GPA: {edu.grade}</div>}
                                    <div className="resume-rich-text" style={{
                                        fontSize: "calc(13px * var(--theme-font-scale, 1))",
                                        lineHeight: "var(--theme-line-height, 1.6)",
                                        marginTop: "8px",
                                        color: "#4b5563"
                                    }}>
                                        <SplittableRichText
                                            html={edu.description}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'description')}
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
            const items = itemIndices ? itemIndices.map(idx => data.projects?.[idx]) : data.projects;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>

                        {isSidebar ? (
                            <SidebarSectionHeader title="Projects" />
                        ) : (
                            <MainSectionHeader title="Projects" Icon={Briefcase} />
                        )}
                        {items?.map((proj, i) => {
                            if (!proj) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr = proj.year || (proj.startYear && `${proj.startYear} - ${proj.isCurrent ? 'Present' : (proj.endYear || 'Present')}`);

                            return (
                                <div key={i} data-item-index={originalIdx} style={{ position: "relative", marginBottom: "calc(25px * var(--theme-paragraph-margin, 1))" }}>
                                    {!isSidebar && <div style={styles.spineCircle} />}
                                    <div style={{ display: "flex", flexDirection: isSidebar ? "column" : "row", justifyContent: "space-between", marginBottom: "4px" }}>
                                        <div style={{ fontWeight: "800", fontSize: "calc(16px * var(--theme-font-scale, 1))" }}>
                                            <RichTextSpellCheck html={proj.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'title')} />
                                        </div>
                                        {dateStr && (
                                            <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", fontWeight: "600", color: "#6b7280", marginTop: isSidebar ? "2px" : "0" }}>
                                                <SpellCheckText text={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, proj.year ? 'year' : 'date')} />
                                            </div>
                                        )}
                                    </div>

                                    {proj.link && (
                                        <div style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "var(--theme-color, #2d5a7b)", marginBottom: "8px" }}>
                                            <ResumeLink href={proj.link}>
                                                <RichTextSpellCheck html={proj.link} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'link')} />
                                            </ResumeLink>
                                        </div>
                                    )}

                                    {/* Technologies */}
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <div style={{ marginBottom: "8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                            {proj.technologies.map((tech, tIdx) => (
                                                <div key={tIdx} style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", padding: "1px 8px", background: "#f3f4f6", borderRadius: "4px", color: "#475569" }}>
                                                    <RichTextSpellCheck
                                                        html={tech}
                                                        isActive={isSpellCheckActive}
                                                        onIgnore={onSpellCheckIgnore}
                                                        onReplace={(val) => {
                                                            const updated = [...proj.technologies];
                                                            updated[tIdx] = val;
                                                            onSpellCheckReplace('projects', originalIdx, updated, 'technologies');
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="resume-rich-text" style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", lineHeight: "var(--theme-line-height, 1.6)", color: "#4b5563" }}>
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
        additionalInfo: ({ isContinued, zoneId, subItemRanges: renderSubItemRanges }) => {
            const isSidebar = zoneId?.includes("left");
            const html = data.additionalInfo || "";
            if (!html || html.trim() === "" || html === "<p><br></p>") return null;
            const title = "Additional Information";
            return (
                <SectionWrapper sectionId="additionalInfo" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>
                        {isSidebar ? (
                            <SidebarSectionHeader title={title} />
                        ) : (
                            <MainSectionHeader title={title} Icon={Award} />
                        )}
                        <div style={{ position: "relative" }}>
                            {!isSidebar && <div style={styles.spineCircle} />}
                            <div className="resume-rich-text" style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#4b5563", lineHeight: "var(--theme-line-height, 1.6)" }}>
                                <SplittableRichText
                                    html={html}
                                    range={renderSubItemRanges?.additionalInfo}
                                    isActive={isSpellCheckActive}
                                    onIgnore={onSpellCheckIgnore}
                                    onReplace={(val) => onSpellCheckReplace('additionalInfo', 'additionalInfo', val)}
                                />
                            </div>
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        custom: ({ isContinued, zoneId, subItemRanges: renderSubItemRanges }) => {
            if (!data.customSection?.isVisible || !data.customSection?.content) return null;
            const content = data.customSection.content;
            if (!content || content.trim() === "" || content === "<p><br></p>") return null;

            const isSidebar = zoneId?.includes("left");
            const title = data.customSection.title || "Custom Section";
            return (
                <SectionWrapper sectionId="custom" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>
                        {isSidebar ? (
                            <SidebarSectionHeader title={title} />
                        ) : (
                            <MainSectionHeader title={title} Icon={Layout} />
                        )}
                        <div style={{ position: "relative" }}>
                            {!isSidebar && <div style={styles.spineCircle} />}
                            <div className="resume-rich-text" style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#4b5563", lineHeight: "var(--theme-line-height, 1.6)" }}>
                                <SplittableRichText
                                    html={content}
                                    range={renderSubItemRanges?.custom}
                                    isActive={isSpellCheckActive}
                                    onIgnore={onSpellCheckIgnore}
                                    onReplace={(val) => onSpellCheckReplace('customSection', 'content', val)}
                                />
                            </div>
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
                <SectionWrapper sectionId="interests" navigationId="interests" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Hobbies & Interests">
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>
                        {isSidebar ? (
                            <SidebarSectionHeader title="Interests" />
                        ) : (
                            <MainSectionHeader title="Interests" Icon={Heart} />
                        )}
                        <div style={{ position: "relative" }}>
                            {!isSidebar && <div style={styles.spineCircle} />}
                            <ul style={styles.skillList}>
                                {items.map((item, i) => (
                                    <li key={i} data-item-index={itemIndices ? itemIndices[i] : i}>
                                        <RichTextSpellCheck html={typeof item === 'object' ? item.name : item} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('interests', itemIndices ? itemIndices[i] : i, val, 'name')} />
                                    </li>
                                ))}
                            </ul>
                        </div>
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
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>
                        {isSidebar ? (
                            <SidebarSectionHeader title="Awards" />
                        ) : (
                            <MainSectionHeader title="Awards" Icon={Trophy} />
                        )}
                        <div style={{ position: "relative" }}>
                            {!isSidebar && <div style={styles.spineCircle} />}
                            {items.map((award, i) => (
                                <div key={i} style={{ marginBottom: "calc(15px * var(--theme-paragraph-margin, 1))" }}>
                                    <div style={{ fontWeight: "700", fontSize: "calc(14px * var(--theme-font-scale, 1))" }}>
                                        <RichTextSpellCheck html={award.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', itemIndices ? itemIndices[i] : i, val, 'title')} />
                                    </div>
                                    <div style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#6b7280" }}>
                                        <RichTextSpellCheck html={award.issuer} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', itemIndices ? itemIndices[i] : i, val, 'issuer')} />
                                        {award.year && <span> • {award.year}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        personalDetails: ({ zoneId }) => {
            const details = [
                { label: "Date of Birth", value: personal?.dob, field: 'dob' },
                { label: "Nationality", value: personal?.nationality, field: 'nationality' },
                { label: "Gender", value: personal?.gender, field: 'gender' },
                { label: "Marital Status", value: personal?.maritalStatus, field: 'maritalStatus' },
                { label: "Visa Status", value: personal?.visaStatus, field: 'visaStatus' },
                { label: "Religion", value: personal?.religion, field: 'religion' },
                { label: "Passport", value: personal?.passport, field: 'passport' },
                { label: "Other", value: personal?.otherPersonal, field: 'otherPersonal' },
            ].filter(d => d.value);

            if (details.length === 0) return null;
            const isSidebar = zoneId?.includes("left");

            return (
                <SectionWrapper sectionId="personalDetails" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Personal Details">
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>
                        {isSidebar ? <SidebarSectionHeader title="Personal Details" /> : <MainSectionHeader title="Personal Details" Icon={User} />}
                        <div style={{ position: "relative" }}>
                            {!isSidebar && <div style={styles.spineCircle} />}
                            {details.map((detail, i) => (
                                <div key={i} style={styles.contactItem}>
                                    <div style={{ fontWeight: "700", minWidth: "100px" }}>{detail.label}</div>
                                    <SpellCheckText text={detail.value} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', detail.field, val)} />
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        volunteering: ({ itemIndices, zoneId, subItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.volunteering?.[idx]) : data.volunteering;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="volunteering" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Volunteering">
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>
                        {isSidebar ? (
                            <SidebarSectionHeader title="Volunteering" />
                        ) : (
                            <MainSectionHeader title="Volunteering" Icon={Users} />
                        )}
                        <div style={{ position: "relative" }}>
                            {!isSidebar && <div style={styles.spineCircle} />}
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} style={{ marginBottom: "calc(15px * var(--theme-paragraph-margin, 1))" }}>
                                        <div style={{ fontWeight: "700", fontSize: "calc(14px * var(--theme-font-scale, 1))" }}>
                                            <RichTextSpellCheck html={item.organization || item.company} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'organization')} />
                                        </div>
                                        <div style={{ fontWeight: "600", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "var(--theme-color, #374151)" }}>
                                            <RichTextSpellCheck html={item.role || item.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'role')} />
                                        </div>
                                        <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#6b7280" }}>
                                            {[item.startDate, item.isCurrent ? "Present" : item.endDate].filter(Boolean).join(" - ")}
                                            {item.location && ` • ${item.location}`}
                                        </div>
                                        {item.description && (
                                            <div className="resume-rich-text" style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", lineHeight: "var(--theme-line-height, 1.6)", marginTop: "5px" }}>
                                                <SplittableRichText html={item.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'description')} />
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
        publications: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.publications?.[idx]) : data.publications;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="publications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Publications">
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>
                        {isSidebar ? (
                            <SidebarSectionHeader title="Publications" />
                        ) : (
                            <MainSectionHeader title="Publications" Icon={BookOpen} />
                        )}
                        <div style={{ position: "relative" }}>
                            {!isSidebar && <div style={styles.spineCircle} />}
                            {items.map((pub, i) => (
                                <div key={i} style={{ marginBottom: "calc(15px * var(--theme-paragraph-margin, 1))" }}>
                                    <div style={{ fontWeight: "700", fontSize: "calc(14px * var(--theme-font-scale, 1))" }}>
                                        <RichTextSpellCheck html={pub.name || pub.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('publications', itemIndices ? itemIndices[i] : i, val, 'name')} />
                                    </div>
                                    <div style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#6b7280" }}>
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
        references: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.references?.[idx]) : data.references;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("left");
            return (
                <SectionWrapper sectionId="references" onSectionClick={onSectionClick} isInteractive={isInteractive} label="References">
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>
                        {isSidebar ? <SidebarSectionHeader title="References" /> : <MainSectionHeader title="References" Icon={Users} />}
                        <div style={{ position: "relative" }}>
                            {!isSidebar && <div style={styles.spineCircle} />}
                            <div style={{ display: "grid", gridTemplateColumns: isSidebar ? "1fr" : "1fr 1fr", gap: "15px" }}>
                                {items.map((ref, i) => (
                                    <div key={i}>
                                        <div style={{ fontWeight: "700", fontSize: "calc(14px * var(--theme-font-scale, 1))" }}>
                                            <RichTextSpellCheck html={ref.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('references', itemIndices ? itemIndices[i] : i, val, 'name')} />
                                        </div>
                                        <div style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "var(--theme-color, #374151)" }}>
                                            <RichTextSpellCheck html={ref.company || ref.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('references', itemIndices ? itemIndices[i] : i, val, 'company')} />
                                        </div>
                                        {ref.contact && (
                                            <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#6b7280" }}>
                                                <RichTextSpellCheck html={ref.contact || ref.phone || ref.email} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('references', itemIndices ? itemIndices[i] : i, val, 'contact')} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
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
                    <div style={{ paddingLeft: isSidebar ? "0" : "70px" }}>
                        {isSidebar ? <SidebarSectionHeader title="Affiliations" /> : <MainSectionHeader title="Affiliations" Icon={Users} />}
                        <div style={{ position: "relative" }}>
                            {!isSidebar && <div style={styles.spineCircle} />}
                            {items.map((aff, i) => (
                                <div key={i} style={{ marginBottom: "10px" }}>
                                    <div style={{ fontWeight: "700", fontSize: "calc(14px * var(--theme-font-scale, 1))" }}>
                                        <RichTextSpellCheck html={aff.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', itemIndices ? itemIndices[i] : i, val, 'name')} />
                                    </div>
                                    <div style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#6b7280" }}>
                                        <RichTextSpellCheck html={aff.role || aff.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', itemIndices ? itemIndices[i] : i, val, 'role')} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        }
    };

    const renderZone = (id, items, columnStyle) => (
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

    const Measurer = () => (
        <div className="resume-measurer" style={{ position: "absolute", top: -10000, left: -10000, width: "210mm", visibility: "hidden" }}>
            <div className="page-height-marker" style={{ height: "297mm", width: "1px", position: "absolute", left: 0, top: 0 }}></div>
            <div style={{ ...styles.page, height: "auto" }}>
                <Header />
                <div style={styles.layoutBody}>
                    <div data-column-id="left" style={styles.leftColumn}>
                        {activeLeftSections.map(sid => (
                            <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} />
                        ))}
                    </div>
                    <div data-column-id="right" style={{ ...styles.rightColumn, borderLeft: "1px solid #d1d5db" }}>
                        {activeRightSections.map(sid => (
                            <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="iconic-timeline-root" >
            <Measurer />
            <DndContext {...dndContextProps}>
                <SortableContext items={[...activeLeftSections, ...activeRightSections]} strategy={verticalListSortingStrategy}>
                    {showPageBreaks && pages ? (
                        pages.map((page, i) => (
                            <div key={i} style={{ ...styles.page, height: "297mm", minHeight: "unset", overflow: "hidden" }}>
                                {i === 0 && <Header />}
                                <div style={{ ...styles.layoutBody, flex: 1 }}>
                                    <div style={styles.leftColumn}>
                                        {renderZone(`left-p${i}`, page.left, { display: "flex", flexDirection: "column", gap: "calc(30px * var(--theme-section-margin, 1))" })}
                                    </div>
                                    <div style={styles.rightColumn}>
                                        <div style={styles.verticalSpine} />
                                        {renderZone(`right-p${i}`, page.right, { display: "flex", flexDirection: "column", gap: "calc(35px * var(--theme-section-margin, 1))" })}
                                    </div>
                                </div>
                                <div style={{ position: "absolute", bottom: "15px", right: "20px", fontSize: "10px", opacity: 0.5 }}>Page {i + 1}</div>
                            </div>
                        ))
                    ) : (
                        <div style={{ ...styles.page, height: "auto", minHeight: "100%" }}>
                            <Header />
                            <div style={styles.layoutBody}>
                                <div style={styles.leftColumn}>
                                    {renderZone('left', activeLeftSections, { display: "flex", flexDirection: "column", gap: "calc(30px * var(--theme-section-margin, 1))" })}
                                </div>
                                <div style={{ ...styles.rightColumn }}>
                                    <div style={styles.verticalSpine} />
                                    {renderZone('right', activeRightSections, { display: "flex", flexDirection: "column", gap: "calc(35px * var(--theme-section-margin, 1))" })}
                                </div>
                            </div>
                        </div>
                    )}
                </SortableContext>
                <StableResumeDragOverlay activeId={activeId} scale={scale} renderSection={(id) => (
                    <div className="dragging-preview">
                        <SectionRenderer sectionId={id} data={data} customRenderers={customRenderers} />
                    </div>
                )} />
            </DndContext>
        </div >
    );
};

export default IconicTimeline;
