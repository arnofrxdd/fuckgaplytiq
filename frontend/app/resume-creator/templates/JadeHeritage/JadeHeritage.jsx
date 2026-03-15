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

/**
 * JadeHeritage Template
 * Matches the "Grace Jackson" Enhancv single-column timeline design:
 * - White header: very large bold teal name, teal pipe profession, 2-row icon contact, circular photo top-right
 * - Full-width single column body
 * - Section titles: bold uppercase teal text (no border)
 * - Experience/Education: 3-col timeline layout — date+location (narrow left) | teal dot | content (wide right)
 * - Experience content: title bold dark, company name in teal, chevron › bullet list
 * - Skills: pill/chip tags in light gray rounded rectangles
 * - Key Achievements: 2-col card grid with star icon + bold title + description
 */
const JadeHeritage = ({
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

    // --- LAYOUT (single column) ---
    const templateId = 'jade-heritage';
    const initialLayout = getSavedLayout(data, templateId, {
        main: [
            'summary', 'experience', 'education', 'skills',
            'keyAchievements', 'accomplishments', 'strengths', 'additionalSkills',
            'projects', 'certifications', 'languages', 'software',
            'interests', 'awards', 'volunteering', 'publications',
            'references', 'affiliations', 'personalDetails', 'additionalInfo', 'custom'
        ]
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
    const teal = "var(--theme-color, #2cbfad)";
    const tealDark = "var(--theme-color, #1aa896)";
    const darkText = "#1a1a2e";
    const bodyText = "#374151";
    const lightText = "#6b7280";

    // --- TIMELINE LAYOUT CONSTANTS ---
    const dateColW = "118px";
    const dotColW = "28px";

    // --- SECTION TITLE: bold uppercase teal ---
    const SectionTitle = ({ title }) => {
        const { isContinued } = useSectionContext();
        const display = isContinued ? `${title} (CONT.)` : title;
        return (
            <div style={{
                fontSize: "calc(13px * var(--theme-font-scale, 1))",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: teal,
                marginBottom: "calc(10px * var(--theme-paragraph-margin, 1))",
                fontFamily: "'Arial Black', 'Arial', sans-serif",
            }}>
                {display}
            </div>
        );
    };

    // Timeline dot
    const TimelineDot = ({ isFirst = false }) => (
        <div style={{
            width: dotColW,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "3px",
            flexShrink: 0,
        }}>
            <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: teal,
                flexShrink: 0,
            }} />
            <div style={{
                width: "1px",
                flex: 1,
                background: "rgba(44,191,173,0.25)",
                marginTop: "3px",
            }} />
        </div>
    );

    const formatDate = (m, y, isCurrent) => {
        if (isCurrent) return "Present";
        const parts = [m, y].filter(Boolean);
        return parts.join(" ");
    };
    const formatRange = (sm, sy, em, ey, cur, fall) => {
        if (fall) return fall;
        const start = formatDate(sm, sy);
        const end = formatDate(em, ey, cur);
        if (!start && !end) return "";
        if (start && !end) return start;
        return `${start} - ${end}`;
    };

    // Date column
    const DateCol = ({ dates, location }) => (
        <div style={{
            width: dateColW,
            flexShrink: 0,
            paddingRight: "8px",
            textAlign: "right",
        }}>
            {dates && (
                <div style={{
                    fontSize: "calc(9.5px * var(--theme-font-scale, 1))",
                    fontWeight: "700",
                    color: darkText,
                    lineHeight: "1.2",
                    wordBreak: "break-word",
                }}>
                    {dates}
                </div>
            )}
            {location && (
                <div style={{
                    fontSize: "calc(9.5px * var(--theme-font-scale, 1))",
                    color: lightText,
                    lineHeight: "1.3",
                    marginTop: "2px",
                }}>
                    {location}
                </div>
            )}
        </div>
    );

    // --- DECORATIVE BLOBS (Wavy background elements) ---
    const DecorativeBlobs = () => (
        <>
            {/* Top Right Blob */}
            <div style={{
                position: "absolute",
                top: "-40px",
                right: "-20px",
                width: "220px",
                height: "180px",
                zIndex: 0,
                opacity: 0.12,
                pointerEvents: "none",
            }}>
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path fill={teal} d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,76.4,-44.7C83.6,-31.3,86.9,-15.7,85.1,-0.8C83.3,14,76.4,28.1,68.2,40.5C60,53,50.5,63.9,38.7,71.5C26.9,79.1,13.4,83.4,-0.6,84.4C-14.7,85.5,-29.3,83.3,-42.6,76.5C-55.8,69.7,-67.6,58.3,-75.4,44.7C-83.1,31.2,-86.8,15.6,-85.9,0.5C-85,-14.6,-79.6,-29.2,-71.2,-42.1C-62.8,-55.1,-51.4,-66.4,-38.4,-73.9C-25.5,-81.4,-12.7,-85.1,0.9,-86.6C14.4,-88.2,28.8,-87.5,44.7,-76.4Z" transform="translate(100 100)" />
                </svg>
            </div>
            {/* Bottom Left Blob */}
            <div style={{
                position: "absolute",
                bottom: "-50px",
                left: "-30px",
                width: "250px",
                height: "220px",
                zIndex: 0,
                opacity: 0.1,
                pointerEvents: "none",
            }}>
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path fill={teal} d="M38.8,-63.4C51.2,-57.4,62.8,-48.5,70.6,-37C78.3,-25.6,82.3,-11.5,81.4,2.3C80.5,16,74.7,29.4,66,40.7C57.3,52,45.8,61.1,33,67C20.2,72.9,6.2,75.6,-8,75C-22.1,74.5,-36.4,70.8,-49,63.5C-61.6,56.2,-72.6,45.3,-78,32.4C-83.3,19.6,-83,4.8,-80.4,-9.4C-77.8,-23.5,-73,-37,-64.1,-48.4C-55.2,-59.8,-42.2,-69.1,-29,-73C-15.7,-77,2.1,-75.7,18.8,-71.8C35.5,-67.9,51.1,-61.3,38.8,-63.4Z" transform="translate(100 100)" />
                </svg>
            </div>
        </>
    );

    const styles = {
        page: {
            width: "210mm",
            height: "297mm",
            background: "white",
            boxSizing: "border-box",
            position: "relative",
            margin: "0 auto 30px auto",
            color: darkText,
            fontFamily: "var(--theme-font, 'Arial', 'Helvetica', sans-serif)",
            letterSpacing: "var(--theme-letter-spacing, 0px)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
        },
        header: {
            padding: "20px 24px 16px 28px",
            borderBottom: "none",
            position: "relative",
            background: "transparent",
        },
        name: {
            fontSize: "calc(34px * var(--theme-font-scale, 1))",
            fontWeight: "900",
            color: teal,
            lineHeight: "1.0",
            marginBottom: "4px",
            fontFamily: "'Arial Black', 'Arial', sans-serif",
            letterSpacing: "-0.5px",
        },
        profession: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: teal,
            fontWeight: "600",
            marginBottom: "10px",
            letterSpacing: "0.2px",
        },
        contactGrid: {
            display: "grid",
            gridTemplateColumns: "auto auto",
            gap: "2px 24px",
            width: "fit-content",
        },
        contactItem: {
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "calc(10.5px * var(--theme-font-scale, 1))",
            color: bodyText,
        },
        contactIcon: {
            color: teal,
            fontSize: "9px",
            flexShrink: 0,
            fontWeight: "700",
        },

        body: {
            padding: "16px 24px 24px 28px",
            flex: 1,
        },
        sectionWrap: {
            // marginBottom: "calc(16px * var(--theme-section-margin, 1))", // Spacing handled by ZONE_STYLE gap
        },
        // Timeline row
        timelineRow: {
            display: "flex",
            alignItems: "stretch",
            marginBottom: "calc(10px * var(--theme-paragraph-margin, 1))",
            minHeight: "40px",
        },
        // Experience content
        jobTitle: {
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: darkText,
            lineHeight: "1.3",
            marginBottom: "2px",
        },
        companyName: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: teal,
            marginBottom: "5px",
        },
        expDesc: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            color: bodyText,
            lineHeight: "var(--theme-line-height, 1.55)",
        },
        chevronBullet: {
            color: teal,
            marginRight: "5px",
            fontSize: "10px",
            flexShrink: 0,
        },
        // Skills chips
        skillChip: {
            display: "inline-block",
            padding: "3px 10px",
            background: "#f3f4f6",
            borderRadius: "4px",
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            color: darkText,
            margin: "3px 4px 3px 0",
            border: "1px solid #e5e7eb",
            fontWeight: "500",
        },
        // Achievement cards 2-col
        achieveGrid: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
        },
        achieveCard: {
            padding: "0",
        },
        achieveIconRow: {
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "4px",
        },
        achieveIcon: {
            fontSize: "14px",
            color: teal,
            flexShrink: 0,
        },
        achieveTitle: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: darkText,
            lineHeight: "1.3",
        },
        achieveDesc: {
            fontSize: "calc(10.5px * var(--theme-font-scale, 1))",
            color: bodyText,
            lineHeight: "var(--theme-line-height, 1.5)",
        },
        // Summary text
        summaryText: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: bodyText,
            lineHeight: "var(--theme-line-height, 1.6)",
        },
        // Divider between items in same section
        itemDivider: {
            height: "1px",
            background: "#f3f4f6",
            margin: "2px 0 calc(8px * var(--theme-paragraph-margin, 1)) 0",
        },
    };

    // Chevron-styled rich text bullets renderer
    // (the › chevron character replaces li bullet styling)
    const ChevronText = ({ html, range, ...spellProps }) => (
        <div className="resume-rich-text" style={{
            ...styles.expDesc,
            // Override ul/li to use › chevron
        }}>
            <style>{`
                .enhancv-clean-desc ul { list-style: none; padding-left: 0; margin: 0; }
                .enhancv-clean-desc li::before { content: "›"; color: var(--theme-color, #2cbfad); margin-right: 5px; font-weight: 700; }
                .enhancv-clean-desc li { display: flex; align-items: flex-start; margin-bottom: 2px; }
            `}</style>
            <div className="enhancv-clean-desc">
                <SplittableRichText html={html} range={range} {...spellProps} />
            </div>
        </div>
    );

    // --- HEADER ---
    const Header = () => {
        const profParts = personal?.profession
            ? personal.profession.split(/[|,]/).map(s => s.trim()).filter(Boolean)
            : [];

        const contactItems = [];
        if (personal?.phone) contactItems.push({ icon: "✆", value: personal.phone, href: personal.phone });
        if (personal?.email) contactItems.push({ icon: "✉", value: personal.email, href: personal.email });
        if (personal?.linkedin) contactItems.push({ icon: "in", value: personal.linkedin, href: personal.linkedin });
        if (personal?.github) contactItems.push({ icon: "⌥", value: personal.github, href: personal.github });
        if (personal?.website) contactItems.push({ icon: "⊕", value: personal.website, href: personal.website });
        if (personal?.city || personal?.state || personal?.country || personal?.zipCode) {
            contactItems.push({
                icon: "⌖",
                value: [personal.city, personal.state, personal.country, personal.zipCode].filter(Boolean).join(", "),
                href: null
            });
        }
        (data.websites || []).filter(s => s.url && s.addToHeader).forEach(s => contactItems.push({ icon: "⊕", value: s.label || s.url, href: s.url }));

        // Split into 2 rows
        const half = Math.ceil(contactItems.length / 2);
        const row1 = contactItems.slice(0, half);
        const row2 = contactItems.slice(half);

        return (
            <SectionWrapper sectionId="personal" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Header">
                <div style={styles.header}>
                    <div>
                        <div style={styles.name}>
                            <SpellCheckText text={personal?.name || "YOUR NAME"} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'name', val)} />
                        </div>
                        {personal?.profession && (
                            <div style={styles.profession}>
                                <SpellCheckText text={profParts.join("  |  ") || personal.profession} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'profession', val)} />
                            </div>
                        )}
                        {/* Contact in 2 rows, 2 items per row */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                            {[row1, row2].filter(r => r.length > 0).map((row, ri) => (
                                <div key={ri} style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                                    {row.map((item, i) => (
                                        <div key={i} style={styles.contactItem}>
                                            <span style={styles.contactIcon}>{item.icon}</span>
                                            {item.href ? (
                                                <ResumeLink href={item.href}>
                                                    <span>{item.value}</span>
                                                </ResumeLink>
                                            ) : (
                                                <span>{item.value}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SectionWrapper>
        );
    };

    // --- CUSTOM RENDERERS ---
    const customRenderers = {
        summary: ({ subItemRanges }) => {
            if (!data.summary) return null;
            return (
                <SectionWrapper sectionId="summary" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Summary">
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Summary" />
                        <div className="resume-rich-text" style={styles.summaryText}>
                            <SplittableRichText html={data.summary} range={subItemRanges?.summary} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('summary', 'summary', val)} />
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
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Experience" />
                        {items.map((exp, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dates = formatRange(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.isCurrent, exp.year || exp.date);
                            const locationStr = [exp.location, exp.isRemote ? "Remote" : null].filter(Boolean).join(", ");
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.timelineRow}>
                                    <DateCol dates={dates} location={locationStr} />
                                    <TimelineDot />
                                    {/* Content */}
                                    <div style={{ flex: 1, paddingBottom: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                                        <div style={styles.jobTitle}>
                                            <RichTextSpellCheck html={exp.title || exp.role || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'title')} />
                                        </div>
                                        {exp.company && (
                                            <div style={styles.companyName}>
                                                <RichTextSpellCheck html={exp.company} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'company')} />
                                            </div>
                                        )}
                                        {exp.description && (
                                            <ChevronText
                                                html={exp.description}
                                                range={subItemRanges?.[originalIdx]}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'description')}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        education: ({ itemIndices, subItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.education?.[idx]).filter(Boolean) : (data.education || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Education" />
                        {items.map((edu, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const displayDates = formatRange(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear, edu.isCurrent, edu.year || edu.date);
                            const locationStr = [edu.city, edu.country].filter(Boolean).join(", ");
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.timelineRow}>
                                    <DateCol dates={displayDates} location={locationStr} />
                                    <TimelineDot />
                                    <div style={{ flex: 1, paddingBottom: "calc(8px * var(--theme-paragraph-margin, 1))" }}>
                                        <div style={styles.jobTitle}>
                                            <RichTextSpellCheck
                                                html={edu.degree || ""}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'degree')}
                                            />
                                            {edu.field && (
                                                <>
                                                    {" in "}
                                                    <RichTextSpellCheck
                                                        html={edu.field}
                                                        isActive={isSpellCheckActive}
                                                        onIgnore={onSpellCheckIgnore}
                                                        onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'field')}
                                                    />
                                                </>
                                            )}
                                        </div>
                                        {(edu.institution || edu.school) && (
                                            <div style={styles.companyName}>
                                                <RichTextSpellCheck html={edu.institution || edu.school} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'institution')} />
                                            </div>
                                        )}
                                        {edu.grade && <div style={{ fontSize: "calc(10.5px * var(--theme-font-scale, 1))", color: lightText }}>GPA: {edu.grade}</div>}
                                        {edu.description && (
                                            <div className="resume-rich-text" style={{ ...styles.expDesc, marginTop: "4px" }}>
                                                <SplittableRichText html={edu.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'description')} />
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

        skills: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.skills?.[idx]).filter(Boolean) : (data.skills || []);
            if (items.length === 0 && !data.skillsDescription) return null;
            return (
                <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Skills" />
                        {items.length > 0 ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0" }}>
                                {items.map((skill, i) => {
                                    const originalIndex = itemIndices ? itemIndices[i] : i;
                                    const name = typeof skill === 'object' ? skill.name : skill;
                                    return (
                                        <span key={originalIndex} data-item-index={originalIndex} style={styles.skillChip}>
                                            <RichTextSpellCheck html={name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('skills', originalIndex, val, 'name')} />
                                        </span>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="resume-rich-text" style={styles.summaryText}>
                                <SplittableRichText html={data.skillsDescription} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('skills', 'skillsDescription', val)} />
                            </div>
                        )}
                    </div>
                </SectionWrapper>
            );
        },

        strengths: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.strengths?.[idx]).filter(Boolean) : (data.strengths || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="strengths" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Strengths">
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Key Strengths" />
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {items.map((s, i) => {
                                const originalIndex = itemIndices ? itemIndices[i] : i;
                                return (
                                    <span key={originalIndex} data-item-index={originalIndex} style={styles.skillChip}>
                                        <RichTextSpellCheck html={typeof s === 'object' ? s.name : s} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('strengths', originalIndex, val, 'name')} />
                                    </span>
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
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Additional Skills" />
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {items.map((s, i) => {
                                const originalIndex = itemIndices ? itemIndices[i] : i;
                                return (
                                    <span key={originalIndex} data-item-index={originalIndex} style={styles.skillChip}>
                                        <RichTextSpellCheck html={typeof s === 'object' ? s.name : s} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalSkills', originalIndex, val, 'name')} />
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // Key Achievements: 2-column card grid with star icon
        keyAchievements: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.keyAchievements?.[idx]).filter(Boolean) : (data.keyAchievements || []);
            if (items.length === 0) return null;
            const icons = ["☆", "⚑", "◈", "◉", "▲", "◆", "★", "✦"];
            return (
                <SectionWrapper sectionId="keyAchievements" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Achievements">
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Key Achievements" />
                        <div style={styles.achieveGrid}>
                            {items.map((item, i) => {
                                const originalIndex = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIndex} style={styles.achieveCard}>
                                        <div style={styles.achieveIconRow}>
                                            <span style={styles.achieveIcon}>{icons[i % icons.length]}</span>
                                            {item.name && (
                                                <div style={styles.achieveTitle}>
                                                    <RichTextSpellCheck html={item.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIndex, val, 'name')} />
                                                </div>
                                            )}
                                        </div>
                                        {item.description && (
                                            <div style={styles.achieveDesc}>
                                                <RichTextSpellCheck html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIndex, val, 'description')} />
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

        accomplishments: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.accomplishments?.[idx]).filter(Boolean) : (data.accomplishments || []);
            if (items.length === 0) return null;
            const icons = ["☆", "⚑", "◈", "◉", "▲", "◆", "★", "✦"];
            return (
                <SectionWrapper sectionId="accomplishments" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Accomplishments">
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Accomplishments" />
                        <div style={styles.achieveGrid}>
                            {items.map((item, i) => {
                                const originalIndex = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIndex} style={styles.achieveCard}>
                                        <div style={styles.achieveIconRow}>
                                            <span style={styles.achieveIcon}>{icons[i % icons.length]}</span>
                                            {item.name && <div style={styles.achieveTitle}><RichTextSpellCheck html={item.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('accomplishments', originalIndex, val, 'name')} /></div>}
                                        </div>
                                        {item.description && <div style={styles.achieveDesc}><RichTextSpellCheck html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('accomplishments', originalIndex, val, 'description')} /></div>}
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
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Projects" />
                        {items.map((proj, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dates = formatRange(proj.startMonth, proj.startYear, proj.endMonth, proj.endYear, proj.isCurrent, proj.year || proj.date);
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.timelineRow}>
                                    <DateCol dates={dates} />
                                    <TimelineDot />
                                    <div style={{ flex: 1, paddingBottom: "calc(8px * var(--theme-paragraph-margin, 1))" }}>
                                        <div style={styles.jobTitle}><RichTextSpellCheck html={proj.title || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'title')} /></div>
                                        {proj.link && <div style={{ fontSize: "calc(10px * var(--theme-font-scale, 1))", color: teal, marginBottom: "3px" }}><ResumeLink href={proj.link}><RichTextSpellCheck html={proj.link} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'link')} /></ResumeLink></div>}
                                        {proj.technologies?.length > 0 && <div style={{ fontSize: "calc(10px * var(--theme-font-scale, 1))", color: lightText, marginBottom: "3px" }}>{proj.technologies.join(" · ")}</div>}
                                        {proj.description && <ChevronText html={proj.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'description')} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        certifications: ({ itemIndices, subItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.certifications?.[idx]).filter(Boolean) : (data.certifications || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Certifications" />
                        {items.map((cert, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.timelineRow}>
                                    <DateCol dates={cert.date || cert.year || ""} />
                                    <TimelineDot />
                                    <div style={{ flex: 1, paddingBottom: "calc(6px * var(--theme-paragraph-margin, 1))" }}>
                                        <div style={styles.jobTitle}><RichTextSpellCheck html={cert.name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('certifications', originalIdx, val, 'name')} /></div>
                                        {cert.issuer && <div style={styles.companyName}><RichTextSpellCheck html={cert.issuer} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('certifications', originalIdx, val, 'issuer')} /></div>}
                                        {cert.description && <div className="resume-rich-text" style={{ ...styles.expDesc, marginTop: "3px" }}><SplittableRichText html={cert.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('certifications', originalIdx, val, 'description')} /></div>}
                                    </div>
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
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Languages" />
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0" }}>
                            {items.map((lang, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={{ ...styles.skillChip, display: "inline-flex", gap: "5px", alignItems: "baseline" }}>
                                        <span style={{ fontWeight: "700" }}>
                                            <RichTextSpellCheck html={lang.name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('languages', originalIdx, val, 'name')} />
                                        </span>
                                        {lang.level && (
                                            <span style={{ color: lightText, fontSize: "calc(9.5px * var(--theme-font-scale, 1))" }}>
                                                <RichTextSpellCheck html={lang.level} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('languages', originalIdx, val, 'level')} />
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        software: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.software?.[idx]).filter(Boolean) : (data.software || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="software" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Software">
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Software" />
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {items.map((item, i) => {
                                const originalIndex = itemIndices ? itemIndices[i] : i;
                                return (
                                    <span key={i} data-item-index={originalIndex} style={styles.skillChip}>
                                        <RichTextSpellCheck html={item.name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('software', originalIndex, val, 'name')} />
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        interests: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.interests?.[idx]).filter(Boolean) : (data.interests || []);
            if (items.length === 0) return null;
            const icons = ["◈", "◉", "★", "▲", "◆", "✦", "⬟", "◇"];
            return (
                <SectionWrapper sectionId="interests" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Interests">
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Interests" />
                        <div style={styles.achieveGrid}>
                            {items.map((item, i) => {
                                const originalIndex = itemIndices ? itemIndices[i] : i;
                                const name = typeof item === 'object' ? item.name : item;
                                const desc = typeof item === 'object' ? item.description : null;
                                return (
                                    <div key={i} data-item-index={originalIndex} style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                                        <span style={{ ...styles.achieveIcon, fontSize: "12px" }}>{icons[i % icons.length]}</span>
                                        <div>
                                            <div style={{ ...styles.achieveTitle, fontSize: "calc(11px * var(--theme-font-scale, 1))" }}>
                                                <RichTextSpellCheck html={name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('interests', originalIndex, val, 'name')} />
                                            </div>
                                            {desc && <div style={styles.achieveDesc}><RichTextSpellCheck html={desc} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('interests', originalIndex, val, 'description')} /></div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        awards: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.awards?.[idx]).filter(Boolean) : (data.awards || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="awards" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Awards">
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Honors & Awards" />
                        <div style={styles.achieveGrid}>
                            {items.map((award, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx} style={styles.achieveCard}>
                                        <div style={styles.achieveIconRow}>
                                            <span style={styles.achieveIcon}>★</span>
                                            <div style={styles.achieveTitle}><RichTextSpellCheck html={award.name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', originalIdx, val, 'name')} /></div>
                                        </div>
                                        {award.issuer && <div style={{ ...styles.achieveDesc, color: teal }}><RichTextSpellCheck html={[award.issuer, award.date].filter(Boolean).join(" · ")} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', originalIdx, val, 'issuer')} /></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        volunteering: ({ itemIndices, subItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.volunteering?.[idx]).filter(Boolean) : (data.volunteering || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="volunteering" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Volunteering">
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Volunteering" />
                        {items.map((vol, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dates = vol.year || vol.date || (vol.startYear ? `${vol.startYear} - ${vol.isCurrent ? "Present" : (vol.endYear || "")}` : "");
                            const locationStr = vol.location || "";
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.timelineRow}>
                                    <DateCol dates={dates} location={locationStr} />
                                    <TimelineDot />
                                    <div style={{ flex: 1, paddingBottom: "calc(8px * var(--theme-paragraph-margin, 1))" }}>
                                        <div style={styles.jobTitle}><RichTextSpellCheck html={vol.organization || vol.company || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'organization')} /></div>
                                        {(vol.cause || vol.title) && <div style={styles.companyName}><RichTextSpellCheck html={vol.cause || vol.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'title')} /></div>}
                                        {vol.description && <ChevronText html={vol.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'description')} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        publications: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.publications?.[idx]).filter(Boolean) : (data.publications || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="publications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Publications">
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Publications" />
                        {items.map((pub, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.timelineRow}>
                                    <DateCol dates={pub.date || ""} />
                                    <TimelineDot />
                                    <div style={{ flex: 1, paddingBottom: "calc(6px * var(--theme-paragraph-margin, 1))" }}>
                                        <div style={styles.jobTitle}><RichTextSpellCheck html={pub.title || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('publications', originalIdx, val, 'title')} /></div>
                                        {pub.publisher && <div style={styles.companyName}><RichTextSpellCheck html={pub.publisher} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('publications', originalIdx, val, 'publisher')} /></div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        affiliations: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.affiliations?.[idx]).filter(Boolean) : (data.affiliations || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="affiliations" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Affiliations">
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Professional Affiliations" />
                        {items.map((aff, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIdx} style={{ display: "flex", gap: "6px", marginBottom: "calc(6px * var(--theme-paragraph-margin, 1))", alignItems: "flex-start" }}>
                                    <span style={{ color: teal, marginTop: "2px" }}>◆</span>
                                    <div>
                                        <div style={{ fontWeight: "700", fontSize: "calc(11.5px * var(--theme-font-scale, 1))", color: darkText }}><RichTextSpellCheck html={aff.name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, 'name')} /></div>
                                        {aff.description && <div style={styles.expDesc}><RichTextSpellCheck html={aff.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, 'description')} /></div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        references: ({ itemIndices }) => {
            const items = itemIndices ? itemIndices.map(idx => data.references?.[idx]).filter(Boolean) : (data.references || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="references" onSectionClick={onSectionClick} isInteractive={isInteractive} label="References">
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="References" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            {items.map((ref, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx}>
                                        <div style={{ fontWeight: "700", fontSize: "calc(11.5px * var(--theme-font-scale, 1))", color: darkText }}><RichTextSpellCheck html={ref.name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('references', originalIdx, val, 'name')} /></div>
                                        {ref.title && <div style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", color: teal, fontStyle: "italic" }}><RichTextSpellCheck html={ref.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('references', originalIdx, val, 'title')} /></div>}
                                        {ref.contact && <div style={{ fontSize: "calc(10.5px * var(--theme-font-scale, 1))", color: lightText }}><RichTextSpellCheck html={ref.contact} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('references', originalIdx, val, 'contact')} /></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        personalDetails: () => {
            const details = [
                { label: "Date of Birth", value: personal?.dob, field: 'dob' },
                { label: "Nationality", value: personal?.nationality, field: 'nationality' },
                { label: "Gender", value: personal?.gender, field: 'gender' },
                { label: "Marital Status", value: personal?.maritalStatus, field: 'maritalStatus' },
                { label: "Visa Status", value: personal?.visaStatus, field: 'visaStatus' },
                { label: "Religion", value: personal?.religion, field: 'religion' },
                { label: "Passport", value: personal?.passport, field: 'passport' },
                { label: "Place of Birth", value: personal?.placeOfBirth, field: 'placeOfBirth' },
                { label: "Driving License", value: personal?.drivingLicense, field: 'drivingLicense' },
                { label: "Other", value: personal?.otherPersonal, field: 'otherPersonal' },
            ].filter(d => d.value);

            if (details.length === 0) return null;
            return (
                <SectionWrapper sectionId="personalDetails" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Personal Details">
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Personal Details" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px" }}>
                            {details.map((detail, i) => (
                                <div key={i} style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))" }}>
                                    <span style={{ fontWeight: "700", color: darkText }}>{detail.label}: </span>
                                    <SpellCheckText text={detail.value} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', detail.field, val)} />
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        additionalInfo: ({ subItemRanges }) => {
            if (!data.additionalInfo) return null;
            return (
                <SectionWrapper sectionId="additionalInfo" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Information">
                    <div style={styles.sectionWrap}>
                        <SectionTitle title="Additional Information" />
                        <div className="resume-rich-text" style={styles.summaryText}>
                            <SplittableRichText html={data.additionalInfo} range={subItemRanges?.additionalInfo} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalInfo', 'additionalInfo', val)} />
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
                    <div style={styles.sectionWrap}>
                        <SectionTitle title={title} />
                        <div className="resume-rich-text" style={styles.summaryText}>
                            <SplittableRichText html={data.customSection.content} range={subItemRanges?.custom} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('customSection', 'content', val)} />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
    };

    // --- RENDER ZONE ---
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

    const ZONE_STYLE = { display: "flex", flexDirection: "column", gap: "calc(16px * var(--theme-section-margin, 1))" };

    const Measurer = () => (
        <div className="resume-measurer" style={{ position: "absolute", top: -10000, left: -10000, width: "210mm", visibility: "hidden" }}>
            {/* MANDATORY — gives useAutoPagination the real DPI-aware A4 pixel height */}
            <div className="page-height-marker" style={{ height: "297mm", width: "1px", position: "absolute", left: 0, top: 0 }} />
            <div style={{ ...styles.page, height: "auto", overflow: "visible" }}>
                <Header />
                <div style={{ ...styles.body, ...ZONE_STYLE }} data-column-id="main">
                    {activeSections.map(sid => (
                        <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="main" />
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="enhancv-clean-root">
            <Measurer />
            <DndContext {...dndContextProps}>
                <SortableContext items={activeSections} strategy={verticalListSortingStrategy}>
                    {showPageBreaks && pages ? (
                        pages.map((page, i) => (
                            <div key={i} style={{ ...styles.page, height: "297mm", minHeight: "unset", overflow: "hidden" }}>
                                <DecorativeBlobs />
                                {i === 0 && <Header />}
                                <div style={styles.body}>
                                    {renderZone(`main-p${i}`, page.main, ZONE_STYLE)}
                                </div>
                                <div style={{ position: "absolute", bottom: "12px", right: "24px", fontSize: "10px", opacity: 0.4, fontFamily: "sans-serif", zIndex: 5 }}>Page {i + 1}</div>
                            </div>
                        ))
                    ) : (
                        <div style={{ ...styles.page, height: "auto", minHeight: "100%" }}>
                            <DecorativeBlobs />
                            <Header />
                            <div style={styles.body}>
                                {renderZone('main', activeSections, ZONE_STYLE)}
                            </div>
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

export default JadeHeritage;
