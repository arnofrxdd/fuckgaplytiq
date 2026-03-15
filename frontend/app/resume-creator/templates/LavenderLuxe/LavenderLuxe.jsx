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

/**
 * LavenderLuxe Template
 * Matches the "Sandra Barnes" design:
 * - Full-width header: bordered box, lavender left panel with circular photo,
 *   white right panel with bold uppercase name + profession
 * - Body: ~28% lavender sidebar | ~72% white main column
 * - Sidebar: "About Me", "Contact", "References", etc. — bold uppercase titles, short underline bar
 * - Main: "Employment", "Education", "Skills" — same title style
 * - Employment/Education rows: right-aligned date+title left col, company right col
 * - Skills: name right-aligned, wide segmented progress bar
 */
const LavenderLuxe = ({
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

    // --- LAYOUT ---
    const templateId = 'lavender-luxe';
    const initialLayout = getSavedLayout(data, templateId, {
        main: ['experience', 'education', 'skills', 'strengths', 'additionalSkills', 'projects', 'certifications', 'awards', 'publications', 'volunteering', 'affiliations', 'interests', 'keyAchievements', 'accomplishments', 'additionalInfo', 'custom'],
        sidebar: ['summary', 'contact', 'references', 'languages', 'software', 'personalDetails', 'websites']
    });

    const completeLayout = getCompleteLayout(data, initialLayout, 'main');
    const activeMainSections = completeLayout.main || [];
    const activeSidebarSections = completeLayout.sidebar || [];

    const { dndContextProps, activeId } = useResumeDragAndDrop({
        data, onReorder, scale,
        containers: { main: activeMainSections, sidebar: activeSidebarSections }
    });

    const pages = useAutoPagination({
        columns: { main: activeMainSections, sidebar: activeSidebarSections },
        data, enabled: showPageBreaks, containerRef, scale
    });

    // --- THEME ---
    const sidebarBg = "var(--theme-color, #E3C7FF)"; // Slightly warmer lavender for Sandra Barnes look
    const accentDark = "#1a1a1a";
    const mainBg = "#ffffff";
    const sidebarW = "30%";
    const pagePadding = "var(--theme-page-margin, 32px)";
    const headerBorderW = "4px";

    // Section title style: bold uppercase, small colored underline bar
    // Section title style: bold uppercase, small colored underline bar
    const SectionTitle = ({ title, zoneId }) => {
        const { isContinued } = useSectionContext();
        const display = isContinued ? `${title} (cont.)` : title;
        const inSidebar = zoneId?.includes('sidebar');
        return (
            <div style={{ marginBottom: "calc(12px * var(--theme-paragraph-margin, 1))" }}>
                <div style={{
                    fontSize: "calc(13px * var(--theme-font-scale, 1))",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: accentDark,
                    fontFamily: "var(--theme-font, 'Arial', sans-serif)",
                    marginBottom: "5px",
                }}>
                    {display}
                </div>
                {/* Short thick underline accent */}
                <div style={{
                    width: "32px",
                    height: "4px",
                    background: inSidebar ? "rgba(0,0,0,0.15)" : sidebarBg,
                    borderRadius: "2px",
                }} />
            </div>
        );
    };

    // --- STYLES ---
    const styles = {
        page: {
            width: "210mm",
            height: "297mm",
            background: mainBg,
            boxSizing: "border-box",
            position: "relative",
            margin: "0 auto 30px auto",
            color: accentDark,
            fontFamily: "var(--theme-font, 'Arial', 'Helvetica', sans-serif)",
            letterSpacing: "var(--theme-letter-spacing, 0px)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            WebkitPrintColorAdjust: "exact",
        },
        // HEADER: full-width bordered box
        headerOuter: {
            border: `${headerBorderW} solid #1a1a1a`,
            margin: `${pagePadding} ${pagePadding} 0 ${pagePadding}`,
            display: "flex",
            alignItems: "stretch",
            minHeight: "140px",
            overflow: "hidden",
            flexShrink: 0,
            boxSizing: "border-box",
            WebkitPrintColorAdjust: "exact",
        },
        headerSidePanel: {
            width: sidebarW,
            background: sidebarBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            flexShrink: 0,
            boxSizing: "border-box",
            WebkitPrintColorAdjust: "exact",
        },
        headerPhoto: {
            width: "94px",
            height: "94px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "4px solid white",
            background: "white",
            boxSizing: "border-box",
        },
        headerPhotoPlaceholder: {
            width: "94px",
            height: "94px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.5)",
            border: "4px solid white",
        },
        headerNamePanel: {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "20px 32px",
            background: mainBg,
            boxSizing: "border-box",
            WebkitPrintColorAdjust: "exact",
        },
        name: {
            fontSize: "calc(40px * var(--theme-font-scale, 1))",
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: "2.5px",
            color: "#1a1a1a",
            lineHeight: "0.95",
            marginTop: "0",
            marginBottom: "10px",
            fontFamily: "'Inter', 'Arial Black', sans-serif",
        },
        profession: {
            fontSize: "calc(16px * var(--theme-font-scale, 1))",
            fontWeight: "400",
            textTransform: "uppercase",
            letterSpacing: "5px",
            color: "#666666",
            fontFamily: "var(--theme-font, sans-serif)",
        },
        // BODY
        body: {
            display: "flex",
            flex: 1,
            minHeight: 0,
            marginLeft: `calc(${pagePadding} + ${headerBorderW})`,
            marginRight: `calc(${pagePadding} + ${headerBorderW})`,
            marginBottom: pagePadding,
            boxSizing: "border-box",
        },
        sidebar: {
            width: sidebarW,
            background: sidebarBg,
            padding: `calc(var(--theme-page-margin, 30px)) 24px calc(var(--theme-page-margin, 40px)) 24px`,
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            flexShrink: 0,
            WebkitPrintColorAdjust: "exact",
        },
        main: {
            flex: 1,
            background: mainBg,
            padding: `calc(var(--theme-page-margin, 30px)) 30px calc(var(--theme-page-margin, 40px)) 24px`,
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
        },
        // SIDEBAR text styles
        sidebarText: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: "#1a1a1a",
            lineHeight: "var(--theme-line-height, 1.55)",
        },
        sidebarLabel: {
            fontSize: "calc(10.5px * var(--theme-font-scale, 1))",
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "#1a1a1a",
            marginBottom: "2px",
        },
        sidebarValue: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            color: "#1a1a1a",
            marginBottom: "calc(10px * var(--theme-paragraph-margin, 1))",
            wordBreak: "break-all",
        },
        // MAIN: employment row — 3 cols: [date+position right-aligned] | [company+desc]
        jobRow: {
            display: "grid",
            gridTemplateColumns: "120px 1fr",
            gap: "12px",
            marginBottom: "calc(14px * var(--theme-paragraph-margin, 1))",
            alignItems: "start",
        },
        jobLeft: {
            textAlign: "right",
        },
        jobTitle: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "#1a1a1a",
            lineHeight: "1.3",
        },
        jobDates: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            color: "#555",
            lineHeight: "1.4",
        },
        jobCompany: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            textTransform: "uppercase",
            color: "#1a1a1a",
            marginBottom: "4px",
        },
        jobDesc: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: "#333",
            lineHeight: "var(--theme-line-height, 1.55)",
        },
        // EDUCATION row similar
        eduLeft: {
            textAlign: "right",
        },
        eduDegree: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "#1a1a1a",
        },
        eduDates: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            color: "#555",
        },
        eduSchool: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "#1a1a1a",
        },
        // SKILLS: name right-aligned, bar chart
        skillRow: {
            display: "grid",
            gridTemplateColumns: "110px 1fr",
            gap: "10px",
            alignItems: "center",
            marginBottom: "calc(6px * var(--theme-paragraph-margin, 1))",
        },
        skillName: {
            textAlign: "right",
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: "#1a1a1a",
        },
        skillBarTrack: {
            display: "flex",
            gap: "2px",
            height: "12px",
        },
    };

    // Segmented skill bar (Standardized to 5 levels as requested)
    const SkillBar = ({ level = 3, max = 5, segments = 5 }) => {
        // Handle input normalization: if level is > 5, it's likely a 10-point scale
        const effectiveLevel = (level > 5 && max === 5) ? level : level;
        const effectiveMax = (level > 5 && max === 5) ? 10 : max;

        const filled = Math.round((effectiveLevel / effectiveMax) * segments);
        return (
            <div style={styles.skillBarTrack}>
                {[...Array(segments)].map((_, i) => (
                    <div key={i} style={{
                        flex: 1,
                        height: "10px",
                        backgroundColor: i < filled ? "#2a2a2a" : "#e5e7eb",
                        borderRadius: "1px",
                    }} />
                ))}
            </div>
        );
    };

    // --- HEADER ---
    const Header = () => (
        <SectionWrapper sectionId="personal" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Header">
            <div style={styles.headerOuter}>
                {/* Left lavender panel with photo */}
                <div style={styles.headerSidePanel}>
                    {personal?.photo ? (
                        <img src={personal.photo} alt="Profile" style={styles.headerPhoto} />
                    ) : (
                        <div style={styles.headerPhotoPlaceholder} />
                    )}
                </div>
                {/* Right name panel */}
                <div style={styles.headerNamePanel}>
                    <div style={styles.name}>
                        <SpellCheckText text={personal?.name || "YOUR NAME"} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'name', val)} />
                    </div>
                    {personal?.profession && (
                        <div style={styles.profession}>
                            <SpellCheckText text={personal.profession} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'profession', val)} />
                        </div>
                    )}
                </div>
            </div>
        </SectionWrapper>
    );

    // --- CUSTOM RENDERERS ---
    const customRenderers = {
        // SIDEBAR sections
        summary: ({ subItemRanges, zoneId }) => {
            if (!data.summary) return null;
            return (
                <SectionWrapper sectionId="summary" onSectionClick={onSectionClick} isInteractive={isInteractive} label="About Me">
                    <div>
                        <SectionTitle title="About Me" zoneId={zoneId} />
                        <div className="resume-rich-text" style={styles.sidebarText}>
                            <SplittableRichText html={data.summary} range={subItemRanges?.summary} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('summary', 'summary', val)} />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        contact: ({ zoneId }) => {
            return (
                <SectionWrapper sectionId="contact" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Contact">
                    <div>
                        <SectionTitle title="Contact" zoneId={zoneId} />
                        {personal?.phone && (
                            <>
                                <div style={styles.sidebarLabel}>Phone</div>
                                <div style={styles.sidebarValue}>
                                    <ResumeLink href={personal.phone}>
                                        <SpellCheckText text={personal.phone} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'phone', val)} />
                                    </ResumeLink>
                                </div>
                            </>
                        )}
                        {personal?.email && (
                            <>
                                <div style={styles.sidebarLabel}>Email</div>
                                <div style={styles.sidebarValue}>
                                    <ResumeLink href={personal.email}>
                                        <SpellCheckText text={personal.email} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'email', val)} />
                                    </ResumeLink>
                                </div>
                            </>
                        )}
                        {(personal?.city || personal?.state || personal?.country) && (
                            <>
                                <div style={styles.sidebarLabel}>Location</div>
                                <div style={styles.sidebarValue}>
                                    <SpellCheckText text={[personal.city, personal.state, personal.country, personal.zipCode].filter(Boolean).join(", ")} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'city', val)} />
                                </div>
                            </>
                        )}
                        {personal?.linkedin && (
                            <>
                                <div style={styles.sidebarLabel}>LinkedIn</div>
                                <div style={styles.sidebarValue}><ResumeLink href={personal.linkedin}><SpellCheckText text={personal.linkedin} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'linkedin', val)} /></ResumeLink></div>
                            </>
                        )}
                        {personal?.github && (
                            <>
                                <div style={styles.sidebarLabel}>GitHub</div>
                                <div style={styles.sidebarValue}><ResumeLink href={personal.github}><SpellCheckText text={personal.github} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'github', val)} /></ResumeLink></div>
                            </>
                        )}
                        {personal?.website && (
                            <>
                                <div style={styles.sidebarLabel}>Website</div>
                                <div style={styles.sidebarValue}><ResumeLink href={personal.website}><SpellCheckText text={personal.website} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'website', val)} /></ResumeLink></div>
                            </>
                        )}
                        {(data.websites || []).map((site, i) => site.url && (
                            <React.Fragment key={i}>
                                <div style={styles.sidebarLabel}>{site.label || 'Website'}</div>
                                <div style={styles.sidebarValue}><ResumeLink href={site.url}><SpellCheckText text={site.url} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('websites', i, val, 'url')} /></ResumeLink></div>
                            </React.Fragment>
                        ))}
                    </div>
                </SectionWrapper>
            );
        },

        websites: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.websites?.[idx]).filter(Boolean) : (Array.isArray(data.websites) ? data.websites : []);
            const filtered = items.filter(s => s.url && !s.addToHeader);
            if (filtered.length === 0) return null;
            return (
                <SectionWrapper sectionId="websites" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Links">
                    <div>
                        <SectionTitle title="Links" zoneId={zoneId} />
                        {filtered.map((site, i) => (
                            <React.Fragment key={i}>
                                <div style={styles.sidebarLabel}>{site.label || 'Portfolio'}</div>
                                <div style={styles.sidebarValue}><ResumeLink href={site.url}><SpellCheckText text={site.url} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('websites', itemIndices ? itemIndices[i] : i, val, 'url')} /></ResumeLink></div>
                            </React.Fragment>
                        ))}
                    </div>
                </SectionWrapper>
            );
        },

        references: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.references?.[idx]).filter(Boolean) : (Array.isArray(data.references) ? data.references : []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="references" onSectionClick={onSectionClick} isInteractive={isInteractive} label="References">
                    <div>
                        <SectionTitle title="References" zoneId={zoneId} />
                        {items.map((ref, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                                    <div style={{ ...styles.sidebarLabel, fontSize: "calc(11px * var(--theme-font-scale, 1))" }}>
                                        <RichTextSpellCheck html={ref.name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('references', originalIdx, val, 'name')} />
                                    </div>
                                    {ref.title && <div style={{ ...styles.sidebarText, fontSize: "calc(10.5px * var(--theme-font-scale, 1))", fontStyle: "italic" }}><RichTextSpellCheck html={ref.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('references', originalIdx, val, 'title')} /></div>}
                                    {ref.contact && <div style={{ ...styles.sidebarText, fontSize: "calc(10.5px * var(--theme-font-scale, 1))" }}><RichTextSpellCheck html={ref.contact} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('references', originalIdx, val, 'contact')} /></div>}
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        languages: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.languages?.[idx]).filter(Boolean) : (Array.isArray(data.languages) ? data.languages : []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="languages" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Languages">
                    <div>
                        <SectionTitle title="Languages" zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                                    />
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        software: ({ itemIndices, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.software?.[idx]).filter(Boolean) : (Array.isArray(data.software) ? data.software : []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="software" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Software">
                    <div>
                        <SectionTitle title="Software" zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                                        variant={zoneId?.toLowerCase().includes('sidebar') ? 'compact' : undefined}
                                        subItemRange={renderSubItemRanges?.[originalIdx]}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        personalDetails: ({ zoneId }) => {
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
                { label: 'Other', value: p.otherPersonal || p.otherInformation }
            ].filter(d => d.value);

            if (details.length === 0) return null;

            return (
                <SectionWrapper sectionId="personalDetails" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Personal Details">
                    <div>
                        <SectionTitle title="Personal Details" zoneId={zoneId} />
                        {details.map((d, i) => (
                            <div key={i} style={{ marginBottom: "calc(6px * var(--theme-paragraph-margin, 1))" }}>
                                <div style={styles.sidebarLabel}>{d.label}</div>
                                <div style={styles.sidebarText}>
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
                </SectionWrapper>
            );
        },

        // MAIN sections
        experience: ({ itemIndices, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.experience?.[idx]).filter(Boolean) : (Array.isArray(data.experience) ? data.experience : []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="experience" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Employment">
                    <div>
                        <SectionTitle title="Employment" zoneId={zoneId} />
                        {items.map((exp, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dates = exp.year || exp.date || (exp.startYear ? `${exp.startYear} - ${exp.isCurrent ? "Present" : (exp.endYear || "")}` : "");
                            const locationStr = [exp.location, exp.isRemote ? "(Remote)" : null].filter(Boolean).join(" ");
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.jobRow}>
                                    {/* Left: position + date right-aligned */}
                                    <div style={styles.jobLeft}>
                                        <div style={styles.jobTitle}>
                                            <RichTextSpellCheck html={exp.title || exp.role || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'title')} />
                                        </div>
                                        <div style={styles.jobDates}>
                                            <RichTextSpellCheck html={dates} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'year')} />
                                        </div>
                                    </div>
                                    {/* Right: company + description */}
                                    <div>
                                        {exp.company && (
                                            <div style={styles.jobCompany}>
                                                <RichTextSpellCheck html={[exp.company, locationStr].filter(Boolean).join(", ")} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'company')} />
                                            </div>
                                        )}
                                        {exp.description && (
                                            <div className="resume-rich-text" style={styles.jobDesc}>
                                                <SplittableRichText html={exp.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'description')} />
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

        education: ({ itemIndices, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.education?.[idx]).filter(Boolean) : (Array.isArray(data.education) ? data.education : []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
                    <div>
                        <SectionTitle title="Education" zoneId={zoneId} />
                        {items.map((edu, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dates = edu.year || edu.date || (edu.endYear ? `${edu.startYear ? edu.startYear + " - " : ""}${edu.endYear}` : edu.startYear || "");
                            const degreeStr = [edu.degree, edu.field].filter(Boolean).join(" of ");
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.jobRow}>
                                    <div style={styles.eduLeft}>
                                        <div style={styles.eduDegree}>
                                            <RichTextSpellCheck html={degreeStr || edu.degree || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'degree')} />
                                        </div>
                                        <div style={styles.eduDates}>{dates}</div>
                                    </div>
                                    <div>
                                        <div style={styles.eduSchool}>
                                            <RichTextSpellCheck html={[edu.institution || edu.school || "", edu.city].filter(Boolean).join(", ")} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'institution')} />
                                        </div>
                                        {edu.grade && <div style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", color: "#555" }}>GPA: <SpellCheckText text={edu.grade} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'grade')} /></div>}
                                        {edu.description && (
                                            <div className="resume-rich-text" style={{ ...styles.jobDesc, marginTop: "4px" }}>
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

        skills: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.skills?.[idx]).filter(Boolean) : (Array.isArray(data.skills) ? data.skills : []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                    <div>
                        <SectionTitle title="Skills" zoneId={zoneId} />
                        {items.map((skill, i) => {
                            const originalIndex = itemIndices ? itemIndices[i] : i;
                            const name = typeof skill === 'object' ? skill.name : skill;
                            const rawLvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                            const lvl = rawLvl !== null ? Number(rawLvl) : null;
                            return (
                                <div key={originalIndex} data-item-index={originalIndex} style={styles.skillRow}>
                                    <div style={styles.skillName}>
                                        <RichTextSpellCheck html={name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('skills', originalIndex, val, 'name')} />
                                    </div>
                                    <SkillBar level={lvl !== null ? lvl : 3} />
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        strengths: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.strengths?.[idx]).filter(Boolean) : (Array.isArray(data.strengths) ? data.strengths : []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="strengths" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Strengths">
                    <div>
                        <SectionTitle title="Key Strengths" zoneId={zoneId} />
                        {items.map((s, i) => {
                            const originalIndex = itemIndices ? itemIndices[i] : i;
                            const rawLvl = typeof s === 'object' ? (s.level ?? s.rating) : null;
                            const lvl = rawLvl !== null ? Number(rawLvl) : null;
                            return (
                                <div key={originalIndex} data-item-index={originalIndex} style={styles.skillRow}>
                                    <div style={styles.skillName}>
                                        <RichTextSpellCheck html={typeof s === 'object' ? s.name : s} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('strengths', originalIndex, val, 'name')} />
                                    </div>
                                    <SkillBar level={lvl !== null ? lvl : 3} />
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        additionalSkills: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.additionalSkills?.[idx]).filter(Boolean) : (Array.isArray(data.additionalSkills) ? data.additionalSkills : []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="additionalSkills" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Skills">
                    <div>
                        <SectionTitle title="Additional Skills" zoneId={zoneId} />
                        {items.map((s, i) => {
                            const originalIndex = itemIndices ? itemIndices[i] : i;
                            const rawLvl = typeof s === 'object' ? (s.level ?? s.rating) : null;
                            const lvl = rawLvl !== null ? Number(rawLvl) : null;
                            return (
                                <div key={originalIndex} data-item-index={originalIndex} style={styles.skillRow}>
                                    <div style={styles.skillName}>
                                        <RichTextSpellCheck html={typeof s === 'object' ? s.name : s} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalSkills', originalIndex, val, 'name')} />
                                    </div>
                                    <SkillBar level={lvl !== null ? lvl : 3} />
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        projects: ({ itemIndices, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.projects?.[idx]).filter(Boolean) : (Array.isArray(data.projects) ? data.projects : []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
                    <div>
                        <SectionTitle title="Projects" zoneId={zoneId} />
                        {items.map((proj, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dates = proj.year || (proj.startYear ? `${proj.startYear} - ${proj.isCurrent ? 'Present' : (proj.endYear || '')}` : "");
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.jobRow}>
                                    <div style={styles.jobLeft}>
                                        <div style={styles.jobTitle}><RichTextSpellCheck html={proj.title || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'title')} /></div>
                                        {dates && <div style={styles.jobDates}>{dates}</div>}
                                    </div>
                                    <div>
                                        {proj.link && <div style={{ fontSize: "calc(10.5px * var(--theme-font-scale, 1))", color: "#555", marginBottom: "3px" }}><ResumeLink href={proj.link}><RichTextSpellCheck html={proj.link} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'link')} /></ResumeLink></div>}
                                        {proj.technologies?.length > 0 && <div style={{ fontSize: "calc(10.5px * var(--theme-font-scale, 1))", color: "#555", marginBottom: "3px" }}>{proj.technologies.join(" · ")}</div>}
                                        {proj.description && <div className="resume-rich-text" style={styles.jobDesc}><SplittableRichText html={proj.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'description')} /></div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        certifications: ({ itemIndices, subItemRanges: renderSubItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.certifications?.[idx]).filter(Boolean) : (Array.isArray(data.certifications) ? data.certifications : []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
                    <div>
                        <SectionTitle title="Certifications" zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                                        variant={zoneId?.toLowerCase().includes('sidebar') ? 'compact' : undefined}
                                        subItemRange={renderSubItemRanges?.[originalIdx]}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        awards: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.awards?.[idx]).filter(Boolean) : (Array.isArray(data.awards) ? data.awards : []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="awards" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Awards">
                    <div>
                        <SectionTitle title="Awards" zoneId={zoneId} />
                        {items.map((award, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.jobRow}>
                                    <div style={styles.jobLeft}><div style={styles.jobDates}>{award.date || ""}</div></div>
                                    <div>
                                        <div style={styles.jobTitle}><RichTextSpellCheck html={award.name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', originalIdx, val, 'name')} /></div>
                                        {award.issuer && <div style={styles.jobDesc}><RichTextSpellCheck html={award.issuer} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', originalIdx, val, 'issuer')} /></div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        interests: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.interests?.[idx]).filter(Boolean) : (Array.isArray(data.interests) ? data.interests : []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="interests" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Interests">
                    <div>
                        <SectionTitle title="Interests" zoneId={zoneId} />
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", fontSize: "calc(11.5px * var(--theme-font-scale, 1))" }}>
                            {items.map((item, i) => {
                                const originalIndex = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIndex} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <span>•</span>
                                        <RichTextSpellCheck html={typeof item === 'object' ? item.name : item} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('interests', originalIndex, val, 'name')} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        volunteering: ({ itemIndices, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.volunteering?.[idx]).filter(Boolean) : (Array.isArray(data.volunteering) ? data.volunteering : []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="volunteering" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Volunteering">
                    <div>
                        <SectionTitle title="Community & Volunteering" zoneId={zoneId} />
                        {items.map((vol, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dates = vol.year || vol.date || (vol.startYear ? `${vol.startYear} - ${vol.isCurrent ? "Present" : (vol.endYear || "")}` : "");
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.jobRow}>
                                    <div style={styles.jobLeft}>
                                        <div style={styles.jobTitle}><RichTextSpellCheck html={vol.organization || vol.company || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'organization')} /></div>
                                        <div style={styles.jobDates}>{dates}</div>
                                    </div>
                                    <div>
                                        {(vol.cause || vol.title) && <div style={styles.jobCompany}><RichTextSpellCheck html={vol.cause || vol.title || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'title')} /></div>}
                                        {vol.description && <div className="resume-rich-text" style={styles.jobDesc}><SplittableRichText html={vol.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'description')} /></div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        publications: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.publications?.[idx]).filter(Boolean) : (data.publications || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="publications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Publications">
                    <div>
                        <SectionTitle title="Publications" zoneId={zoneId} />
                        {items.map((pub, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.jobRow}>
                                    <div style={styles.jobLeft}><div style={styles.jobDates}>{pub.date || ""}</div></div>
                                    <div>
                                        <div style={styles.jobTitle}><RichTextSpellCheck html={pub.title || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('publications', originalIdx, val, 'title')} /></div>
                                        {pub.publisher && <div style={styles.jobDesc}><RichTextSpellCheck html={pub.publisher} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('publications', originalIdx, val, 'publisher')} /></div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        affiliations: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.affiliations?.[idx]).filter(Boolean) : (data.affiliations || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="affiliations" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Affiliations">
                    <div>
                        <SectionTitle title="Professional Affiliations" zoneId={zoneId} />
                        {items.map((aff, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIdx} style={{ display: "flex", gap: "6px", marginBottom: "calc(6px * var(--theme-paragraph-margin, 1))", fontSize: "calc(11.5px * var(--theme-font-scale, 1))" }}>
                                    <span>•</span>
                                    <div>
                                        <div style={{ fontWeight: "700" }}><RichTextSpellCheck html={aff.name || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, 'name')} /></div>
                                        {aff.description && <div style={{ color: "#555" }}><RichTextSpellCheck html={aff.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, 'description')} /></div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        keyAchievements: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.keyAchievements?.[idx]).filter(Boolean) : (data.keyAchievements || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="keyAchievements" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Achievements">
                    <div>
                        <SectionTitle title="Key Achievements" zoneId={zoneId} />
                        {items.map((item, i) => {
                            const originalIndex = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIndex} style={{ display: "flex", gap: "6px", marginBottom: "calc(6px * var(--theme-paragraph-margin, 1))", fontSize: "calc(11.5px * var(--theme-font-scale, 1))" }}>
                                    <span>•</span>
                                    <div>
                                        {item.name && <span style={{ fontWeight: "700" }}><RichTextSpellCheck html={item.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIndex, val, 'name')} /></span>}
                                        {item.description && <span><RichTextSpellCheck html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIndex, val, 'description')} /></span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        accomplishments: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.accomplishments?.[idx]).filter(Boolean) : (data.accomplishments || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="accomplishments" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Accomplishments">
                    <div>
                        <SectionTitle title="Accomplishments" zoneId={zoneId} />
                        {items.map((item, i) => {
                            const originalIndex = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIndex} style={{ display: "flex", gap: "6px", marginBottom: "calc(6px * var(--theme-paragraph-margin, 1))", fontSize: "calc(11.5px * var(--theme-font-scale, 1))" }}>
                                    <span>•</span>
                                    <div>
                                        {item.name && <span style={{ fontWeight: "700" }}><RichTextSpellCheck html={item.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('accomplishments', originalIndex, val, 'name')} /></span>}
                                        {item.description && <span><RichTextSpellCheck html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('accomplishments', originalIndex, val, 'description')} /></span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        additionalInfo: ({ subItemRanges, zoneId }) => {
            if (!data.additionalInfo) return null;
            return (
                <SectionWrapper sectionId="additionalInfo" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Information">
                    <div>
                        <SectionTitle title="Additional Information" zoneId={zoneId} />
                        <div className="resume-rich-text" style={styles.jobDesc}>
                            <SplittableRichText html={data.additionalInfo} range={subItemRanges?.additionalInfo} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalInfo', 'additionalInfo', val)} />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        custom: ({ subItemRanges, zoneId }) => {
            if (!data.customSection?.isVisible || !data.customSection?.content) return null;
            const title = data.customSection.title || "Additional Information";
            return (
                <SectionWrapper sectionId="custom" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <div>
                        <SectionTitle title={title} zoneId={zoneId} />
                        <div className="resume-rich-text" style={styles.jobDesc}>
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
            {/* MANDATORY — gives useAutoPagination the real DPI-aware A4 pixel height */}
            <div className="page-height-marker" style={{ height: "297mm", width: "1px", position: "absolute", left: 0, top: 0 }} />
            <div style={{ ...styles.page, height: "auto", overflow: "visible" }}>
                <Header />
                <div style={styles.body}>
                    <div data-column-id="sidebar" style={styles.sidebar}>
                        {activeSidebarSections.map(sid => (
                            <div key={sid} style={{ paddingBottom: "calc(25px * var(--theme-section-margin, 1))" }}>
                                <SectionRenderer sectionId={sid} data={data} customRenderers={customRenderers} zoneId="sidebar" />
                            </div>
                        ))}
                    </div>
                    <div data-column-id="main" style={styles.main}>
                        {activeMainSections.map(sid => (
                            <div key={sid} style={{ paddingBottom: "calc(25px * var(--theme-section-margin, 1))" }}>
                                <SectionRenderer sectionId={sid} data={data} customRenderers={customRenderers} zoneId="main" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const PageContent = ({ pageIndex, mainItems, sidebarItems }) => {
        const zoneStyle = {
            display: "flex",
            flexDirection: "column",
            gap: "calc(25px * var(--theme-section-margin, 1))"
        };
        const isFirstPage = pageIndex === 0;
        return (
            <div style={{ ...styles.body, marginTop: isFirstPage ? 0 : pagePadding }}>
                <div style={styles.sidebar}>
                    {renderZone(showPageBreaks ? `sidebar-p${pageIndex}` : 'sidebar', sidebarItems, zoneStyle)}
                </div>
                <div style={styles.main}>
                    {renderZone(showPageBreaks ? `main-p${pageIndex}` : 'main', mainItems, zoneStyle)}
                </div>
            </div>
        );
    };

    return (
        <div ref={containerRef} className="lavender-luxe-root">
            <Measurer />
            <DndContext {...dndContextProps}>
                <SortableContext items={[...activeMainSections, ...activeSidebarSections]} strategy={verticalListSortingStrategy}>
                    {showPageBreaks && pages ? (
                        pages.map((page, i) => (
                            <div key={i} style={{ ...styles.page, height: "297mm", minHeight: "unset", overflow: "hidden" }}>
                                {i === 0 && <Header />}
                                <PageContent pageIndex={i} mainItems={page.main} sidebarItems={page.sidebar} />
                                <div style={{ position: "absolute", bottom: "12px", right: "20px", fontSize: "10px", opacity: 0.4, fontFamily: "sans-serif" }}>Page {i + 1}</div>
                            </div>
                        ))
                    ) : (
                        <div style={{ ...styles.page, height: "auto", minHeight: "100%" }}>
                            <Header />
                            <PageContent pageIndex={0} mainItems={activeMainSections} sidebarItems={activeSidebarSections} />
                        </div>
                    )}
                </SortableContext>
                <StableResumeDragOverlay activeId={activeId} scale={scale} renderSection={(id) => (
                    <div style={{ background: "white", padding: "10px", border: "1px solid #ddd", width: "280px" }}>
                        <SectionRenderer sectionId={id} data={data} customRenderers={customRenderers} />
                    </div>
                )} />
            </DndContext>
        </div>
    );
};

export default LavenderLuxe;
