import React, { useRef } from "react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SectionWrapper from "../../components/SectionWrapper";
import { useResumeDragAndDrop, DroppableZone, StableResumeDragOverlay } from "../../hooks/useResumeDragAndDrop";
import DraggableSection from "../../components/dnd/DraggableSection";
import SectionRenderer from "../common/SectionRenderer";
import { useSectionContext } from "../common/SectionContext";
import { useAutoPagination } from "../../hooks/useAutoPagination";
import { SpellCheckText, SplittableRichText, RichTextSpellCheck, LanguageItem, CertificationItem, SoftwareItem, ResumeLink } from "../common/BaseComponents";
import { getCompleteLayout, getSavedLayout } from "../common/TemplateUtils";
import { Linkedin, Github, Globe } from "lucide-react";

/**
 * SapphireGrid Template
 * Features a unique "Lateral Sidebar" where the sidebar and main content 
 * are unified in horizontal rows, but the sidebar forms a continuous colored spine on the left.
 * Includes a multi-color name header and a three-segment contact bar.
 */
const SapphireGrid = ({
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
    const templateId = 'sapphire-grid';
    const initialLayout = getSavedLayout(data, templateId, {
        main: ['summary', 'personalDetails', 'experience', 'education', 'skills', 'strengths', 'projects', 'certifications', 'software', 'languages', 'volunteering', 'publications', 'references', 'awards', 'interests', 'affiliations', 'additionalInfo', 'custom']
    });

    // Auto-complete the layout with any "orphaned" sections (e.g. Certifications, Languages)
    const completeLayout = getCompleteLayout(data, initialLayout, 'main');
    const activeSections = completeLayout.main || [];

    // --- 3. DRAG & DROP HOOK ---
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
    const accentLight = "var(--theme-color-light, #70b1e8)";
    const accentDark = "var(--theme-color-dark, #444444)";
    const sidebarWidth = "180px";

    const styles = {
        page: {
            width: "210mm",
            height: "297mm",
            background: "white",
            boxSizing: "border-box",
            position: "relative",
            margin: "0 auto 30px auto",
            color: "#334155",
            fontFamily: "var(--theme-font, 'Inter', sans-serif)",
            overflow: "hidden", // Prevent content from bleeding into margins
            display: "flex",
            flexDirection: "column",
        },
        headerArea: {
            paddingTop: "var(--theme-page-margin, 50px)",
            paddingLeft: "40px",
            paddingRight: "40px",
            paddingBottom: "30px",
            textAlign: "center",
            boxSizing: "border-box",
        },
        nameContainer: {
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            fontSize: "calc(42px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            textTransform: "uppercase",
            lineHeight: "1.1",
        },
        nameFirst: {
            color: accentLight,
        },
        nameLast: {
            color: accentDark,
        },
        profession: {
            fontSize: "calc(18px * var(--theme-font-scale, 1))",
            color: "#94a3b8",
            marginTop: "8px",
        },

        contactBar: {
            display: "flex",
            height: "auto",
            minHeight: "45px",
            width: "100%",
            color: "white",
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            fontWeight: "600",
            marginBottom: "2px",
            flexWrap: "wrap",
        },
        contactSegmentLeft: {
            width: sidebarWidth,
            background: accentLight,
            display: "flex",
            alignItems: "center",
            padding: "10px 20px",
        },
        contactSegmentMiddle: {
            flex: 1,
            background: accentDark,
            display: "flex",
            alignItems: "center",
            padding: "10px 30px",
            borderRight: "1px solid rgba(255,255,255,0.1)",
        },
        contactSegmentRight: {
            flex: 1,
            background: accentDark,
            display: "flex",
            alignItems: "center",
            padding: "10px 30px",
        },
        sectionRow: {
            display: "flex",
            width: "100%",
        },
        sidebarSpine: {
            width: sidebarWidth,
            background: "#f8fafc",
            paddingTop: "calc(25px * var(--theme-section-margin, 1))",
            paddingLeft: "var(--theme-page-margin, 20px)",
            paddingRight: "20px",
            paddingBottom: "25px",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid #e2e8f0",
            minHeight: "100%",
            boxSizing: "border-box",
        },
        sidebarTitle: {
            fontSize: "calc(14px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: accentLight,
            marginTop: "0",
            lineHeight: "1.2",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
        },
        mainContent: {
            flex: 1,
            paddingTop: "calc(25px * var(--theme-section-margin, 1))",
            paddingLeft: "30px",
            paddingRight: "var(--theme-page-margin, 40px)",
            paddingBottom: "25px",
            borderBottom: "1px solid #e2e8f0",
            background: "transparent", // Let the pageBody gradient show through
            boxSizing: "border-box",
        },
        pageBody: {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: `linear-gradient(to right, #f8fafc ${sidebarWidth}, #ffffff ${sidebarWidth})`,
            position: "relative",
            minHeight: 0,
            paddingBottom: "var(--theme-page-margin, 40px)",
            boxSizing: "border-box",
        },
        historyItem: {
            marginBottom: "calc(25px * var(--theme-paragraph-margin, 1))",
        },
        historyHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "5px",
            lineHeight: "var(--theme-line-height, 1.4)",
        },
        roleTitle: {
            fontSize: "calc(15px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            textTransform: "uppercase",
            color: "#1e293b",
        },
        metaText: {
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            color: accentLight,
            fontWeight: "600",
        },
        companyText: {
            fontSize: "calc(14px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "#475569",
            marginBottom: "10px",
            lineHeight: "var(--theme-line-height, 1.4)",
        },
        lineText: {
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.6)",
        },
        bulletItem: {
            display: "flex",
            alignItems: "baseline",
            gap: "10px",
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.6)",
        }
    };

    const ZONE_STYLE_MAIN = {
        display: "flex",
        flexDirection: "column",
        gap: "calc(25px * var(--theme-section-margin, 1))",
    };

    const Header = () => {
        const nameParts = (personal?.name || "SAANVI PATEL").split(" ");
        const first = nameParts[0];
        const last = nameParts.slice(1).join(" ");

        return (
            <SectionWrapper sectionId="personal" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Header">
                <div style={styles.headerArea}>

                    <div style={styles.nameContainer}>
                        <span style={styles.nameFirst}>
                            <SpellCheckText text={first} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'name', val)} />
                        </span>
                        <span style={styles.nameLast}>
                            <SpellCheckText text={last} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'name', val)} />
                        </span>
                    </div>
                    {personal?.profession && (
                        <div style={styles.profession}>
                            <SpellCheckText text={personal.profession} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'profession', val)} />
                        </div>
                    )}
                </div>
            </SectionWrapper>
        );
    };

    const ContactBar = () => (
        <div style={styles.contactBar}>
            <div style={styles.contactSegmentLeft}>
                <ResumeLink href={personal?.phone}>
                    <SpellCheckText text={personal?.phone || "+91 22 1234 5677"} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'phone', val)} />
                </ResumeLink>
            </div>
            <div style={styles.contactSegmentMiddle}>
                <SpellCheckText text={[personal?.city, personal?.state, personal?.zipCode, personal?.country].filter(Boolean).join(", ") || "City, State"} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'city', val)} />
            </div>


            <div style={styles.contactSegmentRight}>
                <ResumeLink href={personal?.email}>
                    <SpellCheckText text={personal?.email || "hello@sample.com"} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'email', val)} />
                </ResumeLink>
            </div>
        </div>
    );

    const SocialBar = () => {
        const links = [
            { icon: Linkedin, field: 'linkedin', value: personal?.linkedin, type: 'personal' },
            { icon: Github, field: 'github', value: personal?.github, type: 'personal' },
            { icon: Globe, field: 'website', value: personal?.website, type: 'personal' },
            ...(data.websites || [])
                .map((link, idx) => ({ ...link, idx }))
                .filter(link => link.addToHeader && link.url)
                .map(link => ({ icon: Globe, field: 'url', value: link.url, type: 'websites', idx: link.idx }))
        ].filter(l => l.value);

        if (links.length === 0) return null;

        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "25px",
                padding: "8px 0",
                fontSize: "calc(13px * var(--theme-font-scale, 1))",
                color: "#64748b",
                borderBottom: "1px solid #f1f5f9",
                marginBottom: "calc(20px * var(--theme-section-margin, 1))"
            }}>
                {links.map((link, i) => {
                    const Icon = link.icon;
                    return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Icon size={12} color="#94a3b8" />
                            <ResumeLink href={link.value}>
                                <SpellCheckText
                                    text={link.value}
                                    isActive={isSpellCheckActive}
                                    onIgnore={onSpellCheckIgnore}
                                    onReplace={(val) => onSpellCheckReplace(link.type, link.type === 'personal' ? link.field : link.idx, val, link.type === 'websites' ? 'url' : null)}
                                />
                            </ResumeLink>
                        </div>
                    );
                })}
            </div>
        );
    };

    const LateralSection = ({ title, content }) => {
        const { isContinued } = useSectionContext();
        return (
            <div style={{ ...styles.sectionRow, paddingBottom: 0 }}>
                <div style={styles.sidebarSpine}>
                    <h3 style={styles.sidebarTitle}>{isContinued ? `${title} (Cont.)` : title}</h3>
                </div>
                <div style={styles.mainContent}>
                    {content}
                </div>
            </div>
        );
    };

    const customRenderers = {
        summary: ({ isContinued, subItemRanges }) => (
            <SectionWrapper sectionId="summary" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Professional Summary">
                <LateralSection
                    title="Summary"
                    content={
                        <div className="resume-rich-text" style={{ fontSize: "calc(14px * var(--theme-font-scale, 1))", lineHeight: "var(--theme-line-height, 1.6)", color: "#475569" }}>
                            <SplittableRichText
                                html={data.summary}
                                range={subItemRanges?.summary}
                                isActive={isSpellCheckActive}
                                onIgnore={onSpellCheckIgnore}
                                onReplace={(val) => onSpellCheckReplace('summary', 'summary', val)}
                            />
                        </div>
                    }
                />
            </SectionWrapper>
        ),
        strengths: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.strengths?.[idx]).filter(Boolean) : (data.strengths || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="strengths" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Strengths">
                    <LateralSection
                        title="Strengths"
                        content={
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "calc(10px * var(--theme-item-margin, 1)) 40px" }}>
                                {items.map((skill, i) => {
                                    const originalIndex = itemIndices ? itemIndices[i] : i;
                                    const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                    return (
                                        <div key={originalIndex} data-item-index={originalIndex} style={styles.bulletItem}>
                                            <span style={{ color: accentLight }}>•</span>
                                            <RichTextSpellCheck html={typeof skill === 'object' ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('strengths', originalIndex, val, 'name')} />
                                            {lvl > 0 && <span style={{ display: "flex", gap: "3px", marginLeft: "auto" }}>{[...Array(5)].map((_, di) => <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? "var(--theme-color, #635bff)" : "rgba(120,120,120,0.15)" }} />)}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        }
                    />
                </SectionWrapper>
            );
        },
        additionalSkills: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.additionalSkills?.[idx]).filter(Boolean) : (data.additionalSkills || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="additionalSkills" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Skills">
                    <LateralSection
                        title="More Skills"
                        content={
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "calc(10px * var(--theme-item-margin, 1)) 40px" }}>
                                {items.map((skill, i) => {
                                    const originalIndex = itemIndices ? itemIndices[i] : i;
                                    const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                    return (
                                        <div key={originalIndex} data-item-index={originalIndex} style={styles.bulletItem}>
                                            <span style={{ color: accentLight }}>•</span>
                                            <RichTextSpellCheck html={typeof skill === 'object' ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalSkills', originalIndex, val, 'name')} />
                                            {lvl > 0 && <span style={{ display: "flex", gap: "3px", marginLeft: "auto" }}>{[...Array(5)].map((_, di) => <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? "var(--theme-color, #635bff)" : "rgba(120,120,120,0.15)" }} />)}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        }
                    />
                </SectionWrapper>
            );
        },
        skills: ({ isContinued, itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.skills?.[idx]).filter(Boolean) : (data.skills || []);
            const hasDescription = data.skillsDescription && data.skillsDescription.trim();

            if (items.length > 0) {
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <LateralSection
                            title="Skills"
                            content={
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "calc(10px * var(--theme-item-margin, 1)) 40px" }}>
                                    {items.map((skill, i) => {
                                        const originalIndex = itemIndices ? itemIndices[i] : i;
                                        const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                        return (
                                            <div key={originalIndex} data-item-index={originalIndex} style={styles.bulletItem}>
                                                <span style={{ color: accentLight }}>•</span>
                                                <RichTextSpellCheck html={typeof skill === 'object' ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('skills', originalIndex, val, 'name')} />
                                                {lvl > 0 && <span style={{ display: "flex", gap: "3px", marginLeft: "auto" }}>{[...Array(5)].map((_, di) => <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? "var(--theme-color, #635bff)" : "rgba(120,120,120,0.15)" }} />)}</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            }
                        />
                    </SectionWrapper>
                );
            }

            if (hasDescription) {
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <LateralSection
                            title="Skills"
                            content={
                                <div className="resume-rich-text" style={{ fontSize: "calc(13.5px * var(--theme-font-scale, 1))" }}>
                                    <SplittableRichText
                                        html={data.skillsDescription}
                                        isActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onReplace={(val) => onSpellCheckReplace && onSpellCheckReplace('skills', 'skillsDescription', val)}
                                    />
                                </div>
                            }
                        />
                    </SectionWrapper>
                );
            }

            return null;
        },
        experience: ({ itemIndices, isContinued, subItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.experience?.[idx]) : data.experience;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="experience" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Work History">
                    <LateralSection
                        title="Experience"
                        content={
                            items.map((exp, i) => {
                                if (!exp) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const dateStr = exp.year || exp.date || (exp.startYear ? `${exp.startYear} - ${exp.isCurrent ? "Current" : (exp.endYear || "Present")}` : "");
                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.historyItem}>
                                        <div style={styles.historyHeader}>
                                            <div style={styles.roleTitle}>
                                                <RichTextSpellCheck html={exp.title || exp.role || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'title')} />
                                            </div>
                                            <div style={styles.metaText}>
                                                <RichTextSpellCheck html={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'date')} />
                                            </div>
                                        </div>
                                        <div style={styles.companyText}>
                                            <RichTextSpellCheck html={`${exp.company || ""}${exp.location ? `, ${exp.location}` : ""}${exp.isRemote ? " • Remote" : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'company')} />
                                        </div>
                                        <div className="resume-rich-text" style={{ fontSize: "calc(13.2px * var(--theme-font-scale, 1))", lineHeight: "var(--theme-line-height, 1.6)", color: "#475569" }}>
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
                            })
                        }
                    />
                </SectionWrapper>
            );
        },
        education: ({ itemIndices, isContinued }) => {
            const items = itemIndices ? itemIndices.map(idx => data.education?.[idx]) : data.education;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
                    <LateralSection
                        title="Education"
                        content={
                            items.map((edu, i) => {
                                if (!edu) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const dateStr = edu.year || edu.date || edu.endYear;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(20px * var(--theme-paragraph-margin, 1))" }}>
                                        <div style={{ fontWeight: "700", fontSize: "calc(14.5px * var(--theme-font-scale, 1))", color: "#1e293b", marginBottom: "4px", lineHeight: "var(--theme-line-height, 1.4)" }}>
                                            <RichTextSpellCheck html={edu.degree || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'degree')} />
                                        </div>
                                        <div style={{ fontSize: "calc(13.5px * var(--theme-font-scale, 1))", color: "#475569", lineHeight: "var(--theme-line-height, 1.4)" }}>
                                            <RichTextSpellCheck html={`${edu.institution || edu.school || ""}${edu.city ? ` - ${edu.city}` : ""}${dateStr ? `, ${dateStr}` : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'institution')} />
                                        </div>
                                        {edu.grade && <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", fontStyle: "italic", marginTop: "2px", color: accentLight, fontWeight: "600" }}>GPA: {edu.grade}</div>}
                                        {edu.description && (
                                            <div className="resume-rich-text" style={{
                                                fontSize: "calc(13.2px * var(--theme-font-scale, 1))",
                                                lineHeight: "var(--theme-line-height, 1.6)",
                                                marginTop: "8px",
                                                color: "#475569"
                                            }}>
                                                <SplittableRichText
                                                    html={edu.description}
                                                    isActive={isSpellCheckActive}
                                                    onIgnore={onSpellCheckIgnore}
                                                    onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'description')}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        }
                    />
                </SectionWrapper>
            );
        },
        languages: ({ itemIndices, isContinued }) => {
            const items = itemIndices ? itemIndices.map(idx => data.languages?.[idx]) : data.languages;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="languages" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Languages">
                    <LateralSection
                        title="Languages"
                        content={
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "calc(10px * var(--theme-item-margin, 1)) calc(20px * var(--theme-item-margin, 1))" }}>
                                {items.map((lang, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <LanguageItem
                                            key={i}
                                            item={lang}
                                            index={originalIdx}
                                            isSpellCheckActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onSpellCheckReplace={(field, val) => onSpellCheckReplace('languages', originalIdx, val, field)}
                                            variant="compact"
                                        />
                                    );
                                })}
                            </div>
                        }
                    />
                </SectionWrapper>
            );
        },
        certifications: ({ itemIndices, isContinued, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.certifications?.[idx]) : data.certifications;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
                    <LateralSection
                        title="Certifications"
                        content={
                            <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-item-margin, 1))" }}>
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
                                            variant="compact"
                                            subItemRange={renderSubItemRanges?.[originalIdx]}
                                        />
                                    );
                                })}
                            </div>
                        }
                    />
                </SectionWrapper>
            );
        },
        software: ({ itemIndices, isContinued, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.software?.[idx]) : data.software;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="software" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Software">
                    <LateralSection
                        title="Software"
                        content={
                            <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-item-margin, 1))" }}>
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
                                            variant="compact"
                                            subItemRange={renderSubItemRanges?.[originalIdx]}
                                        />
                                    );
                                })}
                            </div>
                        }
                    />
                </SectionWrapper>
            );
        },
        websites: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.websites?.[idx]) : data.websites;
            const portfolioLinks = (items || [])
                .map((link, idx) => ({ ...link, originalIdx: itemIndices ? itemIndices[idx] : idx }))
                .filter(link => !link.addToHeader && link.url);

            if (portfolioLinks.length === 0) return null;

            return (
                <SectionWrapper sectionId="websites" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Websites & Portfolios">
                    <LateralSection
                        title="Websites"
                        content={
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "calc(10px * var(--theme-item-margin, 1)) calc(20px * var(--theme-item-margin, 1))" }}>
                                {portfolioLinks.map((site, i) => (
                                    <div key={i} data-item-index={site.originalIdx} style={{ fontSize: "calc(13.5px * var(--theme-font-scale, 1))", color: "#475569" }}>
                                        <span style={{ fontWeight: "700", color: "#1e293b" }}>
                                            <ResumeLink href={site.url}>
                                                <RichTextSpellCheck html={site.label || "Link"} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('websites', site.originalIdx, val, 'label')} />
                                            </ResumeLink>:{" "}
                                        </span>
                                        <ResumeLink href={site.url}>
                                            <RichTextSpellCheck html={site.url || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('websites', site.originalIdx, val, 'url')} />
                                        </ResumeLink>
                                    </div>
                                ))}
                            </div>
                        }
                    />
                </SectionWrapper>
            );
        },
        projects: ({ itemIndices, isContinued, subItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.projects?.[idx]) : data.projects;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
                    <LateralSection
                        title="Projects"
                        content={
                            items.map((proj, i) => {
                                if (!proj) return null;
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const dateStr = proj.year || (proj.startYear && `${proj.startYear} - ${proj.isCurrent ? 'Present' : (proj.endYear || 'Present')}`);

                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.historyItem}>
                                        <div style={styles.historyHeader}>
                                            <div style={styles.roleTitle}>
                                                <RichTextSpellCheck html={proj.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'title')} />
                                            </div>
                                            {dateStr && (
                                                <div style={styles.metaText}>
                                                    <SpellCheckText text={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, proj.year ? 'year' : 'date')} />
                                                </div>
                                            )}
                                        </div>

                                        {proj.link && (
                                            <div style={{ fontSize: "12px", color: accentLight, marginBottom: "8px" }}>
                                                <ResumeLink href={proj.link}>
                                                    <RichTextSpellCheck html={proj.link} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'link')} />
                                                </ResumeLink>
                                            </div>
                                        )}

                                        {/* Technologies */}
                                        {proj.technologies && proj.technologies.length > 0 && (
                                            <div style={{ marginBottom: "8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                                {proj.technologies.map((tech, tIdx) => (
                                                    <div key={tIdx} style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", padding: "1px 8px", background: "rgba(0,0,0,0.05)", borderRadius: "4px", color: "#475569" }}>
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

                                        <div className="resume-rich-text" style={{ fontSize: "calc(13.2px * var(--theme-font-scale, 1))", lineHeight: "var(--theme-line-height, 1.6)", color: "#475569" }}>
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
                            })
                        }
                    />
                </SectionWrapper>
            );
        },
        additionalInfo: ({ isContinued, subItemRanges: renderSubItemRanges }) => {
            const html = data.additionalInfo || "";
            if (!html || html.trim() === "" || html === "<p><br></p>") return null;
            return (
                <SectionWrapper sectionId="additionalInfo" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Information">
                    <LateralSection
                        title="Information"
                        isContinued={isContinued}
                        content={
                            <div className="resume-rich-text" style={{ fontSize: "calc(13.5px * var(--theme-font-scale, 1))", lineHeight: "1.7", color: "#475569" }}>
                                <SplittableRichText
                                    html={html}
                                    range={renderSubItemRanges?.additionalInfo}
                                    isActive={isSpellCheckActive}
                                    onIgnore={onSpellCheckIgnore}
                                    onReplace={(val) => onSpellCheckReplace('additionalInfo', 'additionalInfo', val)}
                                />
                            </div>
                        }
                    />
                </SectionWrapper>
            );
        },
        custom: ({ isContinued, subItemRanges: renderSubItemRanges }) => {
            if (!data.customSection?.isVisible || !data.customSection?.content) return null;
            const content = data.customSection.content;
            if (!content || content.trim() === "" || content === "<p><br></p>") return null;

            const title = data.customSection.title || "Additional";
            return (
                <SectionWrapper sectionId="custom" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <LateralSection
                        title={title}
                        isContinued={isContinued}
                        content={
                            <div className="resume-rich-text" style={{ fontSize: "calc(13.5px * var(--theme-font-scale, 1))", lineHeight: "var(--theme-line-height, 1.7)", color: "#475569" }}>
                                <SplittableRichText
                                    html={content}
                                    range={renderSubItemRanges?.custom}
                                    isActive={isSpellCheckActive}
                                    onIgnore={onSpellCheckIgnore}
                                    onReplace={(val) => onSpellCheckReplace('customSection', 'content', val)}
                                />
                            </div>
                        }
                    />
                </SectionWrapper>
            );
        },
        interests: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.interests?.[idx]) : data.interests;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="interests" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Interests">
                    <LateralSection
                        title="Interests"
                        content={
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "calc(10px * var(--theme-item-margin, 1)) calc(20px * var(--theme-item-margin, 1))" }}>
                                {items.map((item, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <div key={i} style={styles.bulletItem}>
                                            <span style={{ color: accentLight }}>•</span>
                                            <RichTextSpellCheck
                                                html={typeof item === 'object' ? item.name : item}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('interests', originalIdx, val, 'name')}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        }
                    />
                </SectionWrapper>
            );
        },
        awards: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.awards?.[idx]) : data.awards;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="awards" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Awards">
                    <LateralSection
                        title="Awards"
                        content={
                            <div style={{ display: "flex", flexDirection: "column", gap: "calc(15px * var(--theme-paragraph-margin, 1))" }}>
                                {items.map((award, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <div key={i} data-item-index={originalIdx}>
                                            <div style={{ fontWeight: "700", fontSize: "calc(14.5px * var(--theme-font-scale, 1))", color: "#1e293b" }}>
                                                <RichTextSpellCheck html={award.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', originalIdx, val, 'title')} />
                                            </div>
                                            <div style={{ fontSize: "calc(13.5px * var(--theme-font-scale, 1))", color: "#475569" }}>
                                                <RichTextSpellCheck html={award.issuer} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', originalIdx, val, 'issuer')} />
                                                {award.year && <span> • {award.year}</span>}
                                            </div>
                                            {award.description && (
                                                <div className="resume-rich-text" style={{ ...styles.lineText, marginTop: "4px", color: "#64748b" }}>
                                                    <RichTextSpellCheck html={award.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', originalIdx, val, 'description')} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        }
                    />
                </SectionWrapper>
            );
        },
        volunteering: ({ itemIndices, subItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.volunteering?.[idx] || data.volunteer?.[idx]) : (data.volunteering || data.volunteer);
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="volunteering" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Volunteering">
                    <LateralSection
                        title="Volunteer"
                        content={
                            <div style={{ display: "flex", flexDirection: "column", gap: "calc(20px * var(--theme-paragraph-margin, 1))" }}>
                                {items.map((item, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    const dateStr = [item.startDate, item.isCurrent ? "Present" : item.endDate].filter(Boolean).join(" - ");
                                    return (
                                        <div key={i} data-item-index={originalIdx}>
                                            <div style={styles.historyHeader}>
                                                <div style={styles.roleTitle}>
                                                    <RichTextSpellCheck html={item.organization || item.company} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'organization')} />
                                                </div>
                                                <div style={styles.metaText}>{dateStr}</div>
                                            </div>
                                            <div style={styles.companyText}>
                                                <RichTextSpellCheck html={item.role || item.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'role')} />
                                            </div>
                                            {item.description && (
                                                <div className="resume-rich-text" style={{ ...styles.lineText, color: "#475569" }}>
                                                    <SplittableRichText html={item.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'description')} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        }
                    />
                </SectionWrapper>
            );
        },
        references: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.references?.[idx]) : data.references;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="references" onSectionClick={onSectionClick} isInteractive={isInteractive} label="References">
                    <LateralSection
                        title="References"
                        content={
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                {items.map((ref, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <div key={i} data-item-index={originalIdx}>
                                            <div style={{ fontWeight: "700", fontSize: "calc(14px * var(--theme-font-scale, 1))", color: "#1e293b" }}>
                                                <RichTextSpellCheck html={ref.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('references', originalIdx, val, 'name')} />
                                            </div>
                                            <div style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: accentLight, fontWeight: "600" }}>
                                                <RichTextSpellCheck html={ref.company || ref.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('references', originalIdx, val, 'company')} />
                                            </div>
                                            {ref.contact && (
                                                <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#64748b", marginTop: "2px" }}>
                                                    <RichTextSpellCheck html={ref.contact} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('references', originalIdx, val, 'contact')} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        }
                    />
                </SectionWrapper>
            );
        },
        publications: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.publications?.[idx]) : data.publications;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="publications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Publications">
                    <LateralSection
                        title="Publications"
                        content={
                            <div style={{ display: "flex", flexDirection: "column", gap: "calc(15px * var(--theme-paragraph-margin, 1))" }}>
                                {items.map((pub, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <div key={i} data-item-index={originalIdx}>
                                            <div style={{ fontWeight: "700", fontSize: "calc(14.5px * var(--theme-font-scale, 1))", color: "#1e293b" }}>
                                                <RichTextSpellCheck html={pub.name || pub.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('publications', originalIdx, val, 'name')} />
                                            </div>
                                            <div style={{ fontSize: "calc(13.5px * var(--theme-font-scale, 1))", color: "#475569" }}>
                                                <RichTextSpellCheck html={pub.publisher} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('publications', originalIdx, val, 'publisher')} />
                                                {pub.releaseDate && <span> • {pub.releaseDate}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        }
                    />
                </SectionWrapper>
            );
        },
        affiliations: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.affiliations?.[idx]) : data.affiliations;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="affiliations" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Affiliations">
                    <LateralSection
                        title="Affiliations"
                        content={
                            <ul className="resume-rich-text" style={{ paddingLeft: "16px", margin: 0, fontSize: "calc(13.5px * var(--theme-font-scale, 1))", color: "#475569" }}>
                                {items.map((item, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <li key={i} data-item-index={originalIdx} style={{ marginBottom: "6px" }}>
                                            <RichTextSpellCheck html={typeof item === 'object' ? item.name : item} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, 'name')} />
                                        </li>
                                    );
                                })}
                            </ul>
                        }
                    />
                </SectionWrapper>
            );
        },
        keyAchievements: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.keyAchievements?.[idx]) : data.keyAchievements;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="keyAchievements" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Achievements">
                    <LateralSection
                        title="Achievements"
                        content={
                            <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-item-margin, 1))" }}>
                                {items.map((item, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <div key={i} style={styles.bulletItem}>
                                            <span style={{ color: accentLight }}>•</span>
                                            <RichTextSpellCheck
                                                html={typeof item === 'object' ? item.name : item}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIdx, val, 'name')}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        }
                    />
                </SectionWrapper>
            );
        },
        accomplishments: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.accomplishments?.[idx]) : data.accomplishments;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="accomplishments" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Accomplishments">
                    <LateralSection
                        title="Accomplishments"
                        content={
                            <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-item-margin, 1))" }}>
                                {items.map((item, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    return (
                                        <div key={i} style={styles.bulletItem}>
                                            <span style={{ color: accentLight }}>•</span>
                                            <RichTextSpellCheck
                                                html={typeof item === 'object' ? item.name : item}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('accomplishments', originalIdx, val, 'name')}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        }
                    />
                </SectionWrapper>
            );
        },

        personalDetails: () => {
            const details = [
                { label: 'Date of Birth', value: personal?.dob, field: 'dob' },
                { label: 'Nationality', value: personal?.nationality, field: 'nationality' },
                { label: 'Marital Status', value: personal?.maritalStatus, field: 'maritalStatus' },
                { label: 'Gender', value: personal?.gender, field: 'gender' },
                { label: 'Religion', value: personal?.religion, field: 'religion' },
                { label: 'Visa Status', value: personal?.visaStatus, field: 'visaStatus' },
                { label: 'Passport', value: personal?.passport, field: 'passport' },
                { label: 'Place of Birth', value: personal?.placeOfBirth, field: 'placeOfBirth' },
                { label: 'Driving License', value: personal?.drivingLicense, field: 'drivingLicense' },
                { label: 'Other', value: personal?.otherPersonal, field: 'otherPersonal' }
            ].filter(d => d.value);

            if (details.length === 0) return null;

            return (
                <SectionWrapper sectionId="personalDetails" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Personal Details">
                    <LateralSection
                        title="Personal"
                        content={
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "calc(10px * var(--theme-item-margin, 1)) 20px" }}>
                                {details.map((detail, idx) => (
                                    <div key={idx} style={styles.lineText}>
                                        <span style={{ fontWeight: 700, opacity: 0.8, marginRight: "8px" }}>{detail.label}:</span>
                                        <SpellCheckText
                                            text={detail.value}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace('personal', detail.field, val)}
                                        />
                                    </div>
                                ))}
                            </div>
                        }
                    />
                </SectionWrapper>
            );
        },
    };

    const renderZone = (id, items, columnStyle = {}) => (
        <DroppableZone id={id} style={{ ...columnStyle }}>
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
            <div className="page-height-marker" style={{ height: "297mm", width: "1px", position: "absolute", left: 0, top: 0 }}></div>
            <div style={{ ...styles.page, height: "auto", overflow: "visible" }}>
                <Header />
                <ContactBar />
                <SocialBar />
                <div data-column-id="main" style={{ ...styles.pageBody, ...ZONE_STYLE_MAIN }}>
                    {activeSections.map(sid => (
                        <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="main" />
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="sapphire-grid-root" >
            <Measurer />
            <DndContext {...dndContextProps}>
                <SortableContext items={activeSections} strategy={verticalListSortingStrategy}>
                    {showPageBreaks && pages ? (
                        pages.map((page, i) => (
                            <div key={i} style={{ ...styles.page, height: "297mm", minHeight: "unset", overflow: "hidden" }}>
                                <div className="page-height-marker" style={{ height: "297mm", width: "1px", position: "absolute", left: 0, top: 0 }}></div>
                                {i === 0 && <Header />}
                                {i === 0 && <ContactBar />}
                                {i === 0 && <SocialBar />}
                                <div style={styles.pageBody}>
                                    {renderZone(`main-p${i}`, page.main, ZONE_STYLE_MAIN)}
                                </div>
                                <div style={{ position: "absolute", bottom: "15px", right: "20px", fontSize: "10px", opacity: 0.5 }}>Page {i + 1}</div>
                            </div>
                        ))
                    ) : (
                        <div style={{ ...styles.page, height: "auto", minHeight: "297mm" }}>
                            <Header />
                            <ContactBar />
                            <SocialBar />
                            <div style={styles.pageBody}>
                                {renderZone('main', activeSections, ZONE_STYLE_MAIN)}
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

export default SapphireGrid;
