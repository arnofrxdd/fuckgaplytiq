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
import { getCompleteLayout } from "../common/TemplateUtils";

/**
 * SlateClassic Template
 * Dark navy left sidebar (~35%) with name, photo, profile, contact, personal info, skills.
 * Clean white right main column (~65%) with experience, education, projects, etc.
 * Section titles use small-caps editorial style with a ruled underline.
 * Closely mirrors the attached reference image.
 */
const SlateClassic = ({
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

    // ─── DYNAMIC LAYOUT ENGINE ───────────────────────────────────────────────
    const templateId = 'slate-classic';
    const savedLayout = data.templateLayouts?.[templateId] || {};
    const initialLayout = {
        sidebar: savedLayout.sidebar || savedLayout.left || [
            'summary', 'contact', 'personalDetails', 'websites',
            'skills', 'strengths', 'additionalSkills', 'languages',
            'software', 'interests', 'affiliations', 'additionalInfo'
        ],
        main: savedLayout.main || savedLayout.right || [
            'experience', 'education', 'projects', 'certifications',
            'awards', 'volunteering', 'publications', 'references', 'custom'
        ]
    };

    const completeLayout = getCompleteLayout(data, initialLayout, 'main');
    const activeSidebarSections = completeLayout.sidebar || [];
    const activeMainSections = completeLayout.main || [];

    // ─── DRAG & DROP ─────────────────────────────────────────────────────────
    const { dndContextProps, activeId } = useResumeDragAndDrop({
        data,
        onReorder,
        scale,
        containers: { sidebar: activeSidebarSections, main: activeMainSections }
    });

    // ─── PAGINATION ──────────────────────────────────────────────────────────
    const pages = useAutoPagination({
        columns: { sidebar: activeSidebarSections, main: activeMainSections },
        data,
        enabled: showPageBreaks,
        containerRef,
        scale
    });

    // ─── DESIGN TOKENS ───────────────────────────────────────────────────────
    const SIDEBAR_BG = "var(--theme-color, #2c3e55)";
    const SIDEBAR_TEXT = "#d4dde8";
    const SIDEBAR_HEAD = "#ffffff";
    const ACCENT = "var(--theme-color, #2c3e55)";
    const BODY_TEXT = "var(--theme-text-color, #2d3748)";
    const MUTED_TEXT = "#64748b";
    const RULE_COLOR = "#cbd5e1";
    const SIDEBAR_RULE = "rgba(255,255,255,0.18)";
    const FONT = "var(--theme-font, 'Georgia', serif)";

    // ─── STYLES ──────────────────────────────────────────────────────────────
    const styles = {
        page: {
            width: "210mm",
            height: "297mm",
            background: "white",
            boxSizing: "border-box",
            position: "relative",
            margin: "0 auto 30px auto",
            color: BODY_TEXT,
            fontFamily: FONT,
            overflow: "visible",
            display: "flex",
            flexDirection: "row",
        },
        sidebarColumn: {
            width: "35%",
            background: SIDEBAR_BG,
            padding: "0",
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
            flexShrink: 0,
        },
        sidebarInner: {
            padding: "30px 22px 30px 22px",
            display: "flex",
            flexDirection: "column",
            gap: "calc(20px * var(--theme-section-margin, 1))",
            flex: 1,
        },
        mainColumn: {
            flex: 1,
            padding: "36px 32px 36px 32px",
            display: "flex",
            flexDirection: "column",
            gap: "calc(22px * var(--theme-section-margin, 1))",
            overflowWrap: "break-word",
            wordBreak: "break-word",
        },

        // Sidebar name block
        nameBlock: {
            borderBottom: `1px solid ${SIDEBAR_RULE}`,
            paddingBottom: "20px",
            marginBottom: "4px",
        },
        firstName: {
            fontSize: "calc(22px * var(--theme-font-scale, 1))",
            fontWeight: "400",
            color: SIDEBAR_HEAD,
            letterSpacing: "0.5px",
            lineHeight: "1.2",
            fontFamily: FONT,
        },
        lastName: {
            fontSize: "calc(22px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: SIDEBAR_HEAD,
            letterSpacing: "1px",
            textTransform: "uppercase",
            lineHeight: "1.2",
            fontFamily: FONT,
        },
        profession: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            color: "rgba(255,255,255,0.65)",
            marginTop: "6px",
            letterSpacing: "0.5px",
            fontStyle: "italic",
        },

        // Profile photo
        photo: {
            width: "100%",
            aspectRatio: "1/1",
            objectFit: "cover",
            objectPosition: "center top",
            display: "block",
            marginBottom: "0",
        },

        // Sidebar section title
        sidebarSectionTitle: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: SIDEBAR_HEAD,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            borderBottom: `1px solid ${SIDEBAR_RULE}`,
            paddingBottom: "6px",
            marginBottom: "12px",
            fontFamily: FONT,
        },

        // Main section title — small-caps editorial style
        mainSectionTitle: {
            fontSize: "calc(15px * var(--theme-font-scale, 1))",
            fontWeight: "400",
            color: BODY_TEXT,
            fontVariant: "small-caps",
            letterSpacing: "0.5px",
            borderBottom: `1.5px solid ${RULE_COLOR}`,
            paddingBottom: "5px",
            marginBottom: "14px",
            fontFamily: FONT,
        },

        // Contact items in sidebar
        contactItem: {
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            marginBottom: "calc(8px * var(--theme-paragraph-margin, 1))",
        },
        contactIcon: {
            color: "rgba(255,255,255,0.55)",
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            marginTop: "1px",
            flexShrink: 0,
            width: "14px",
            textAlign: "center",
        },
        contactText: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: SIDEBAR_TEXT,
            lineHeight: "1.4",
            wordBreak: "break-all",
            overflowWrap: "break-word",
            flex: 1,
        },

        // Personal detail label/value
        detailLabel: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            color: "rgba(255,255,255,0.5)",
            marginBottom: "1px",
            letterSpacing: "0.3px",
        },
        detailValue: {
            fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
            color: SIDEBAR_TEXT,
            fontWeight: "600",
            marginBottom: "calc(8px * var(--theme-paragraph-margin, 1))",
        },

        // Skill list in sidebar
        skillItem: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: SIDEBAR_TEXT,
            marginBottom: "calc(5px * var(--theme-paragraph-margin, 1))",
            paddingLeft: "12px",
            position: "relative",
            lineHeight: "1.5",
        },
        skillBullet: {
            position: "absolute",
            left: "0",
            top: "6px",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.4)",
        },

        // Main column experience/education entry
        entryRow: {
            display: "flex",
            gap: "0",
            marginBottom: "calc(16px * var(--theme-paragraph-margin, 1))",
        },
        entryContent: {
            flex: 1,
        },
        entryTitle: {
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: BODY_TEXT,
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            lineHeight: "1.3",
            fontVariant: "small-caps",
            fontFamily: FONT,
        },
        entryMeta: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: MUTED_TEXT,
            fontStyle: "italic",
            marginBottom: "4px",
            lineHeight: "1.4",
        },
        entryDate: {
            fontSize: "calc(11px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: BODY_TEXT,
            whiteSpace: "nowrap",
            textAlign: "right",
            minWidth: "80px",
            paddingTop: "2px",
        },
        entryDesc: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: BODY_TEXT,
            lineHeight: "var(--theme-line-height, 1.55)",
        },
        entryHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "8px",
            marginBottom: "2px",
        },
    };

    // ─── SECTION TITLE COMPONENTS ────────────────────────────────────────────
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

    // ─── SIDEBAR HEADER (name + profession) ──────────────────────────────────
    const SidebarHeader = () => {
        const nameParts = (personal?.name || "YOUR NAME").split(" ");
        const first = nameParts.slice(0, -1).join(" ") || nameParts[0];
        const last = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

        return (
            <SectionWrapper sectionId="personal" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Header">
                <div style={styles.nameBlock}>
                    <div>
                        <span style={styles.firstName}>
                            <SpellCheckText
                                text={first}
                                isActive={isSpellCheckActive}
                                onIgnore={onSpellCheckIgnore}
                                onReplace={(val) => onSpellCheckReplace('personal', 'name', val + (last ? " " + last : ""))}
                            />
                        </span>
                        {last && (
                            <>
                                {" "}
                                <span style={styles.lastName}>
                                    <SpellCheckText
                                        text={last}
                                        isActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onReplace={(val) => onSpellCheckReplace('personal', 'name', (first ? first + " " : "") + val)}
                                    />
                                </span>
                            </>
                        )}
                    </div>
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
    };

    // ─── CUSTOM RENDERERS ─────────────────────────────────────────────────────
    const customRenderers = {

        // ── SUMMARY ──────────────────────────────────────────────────────────
        summary: ({ isContinued, subItemRanges, zoneId }) => (
            <SectionWrapper sectionId="summary" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Profile">
                <div>
                    <SidebarTitle title="Profile" />
                    <div style={{
                        fontSize: "calc(12px * var(--theme-font-scale, 1))",
                        color: SIDEBAR_TEXT,
                        lineHeight: "var(--theme-line-height, 1.6)"
                    }} className="resume-rich-text">
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

        // ── CONTACT ──────────────────────────────────────────────────────────
        contact: ({ zoneId }) => {
            const websiteItems = data.websites || [];
            const extraLinks = websiteItems
                .map((link, idx) => ({ ...link, originalIdx: idx }))
                .filter(link => link.addToHeader && link.url);

            const hasAny = personal?.city || personal?.phone || personal?.email
                || personal?.linkedin || personal?.github || personal?.website
                || extraLinks.length > 0;
            if (!hasAny) return null;

            const contactRows = [
                personal?.city && {
                    icon: "⌂",
                    value: [personal?.city, personal?.state, personal?.zipCode, personal?.country].filter(Boolean).join(", "),
                    field: 'city', type: 'personal', href: null
                },
                personal?.phone && {
                    icon: "☎",
                    value: personal.phone,
                    field: 'phone', type: 'personal', href: `tel:${personal.phone}`
                },
                personal?.email && {
                    icon: "@",
                    value: personal.email,
                    field: 'email', type: 'personal', href: `mailto:${personal.email}`
                },
                personal?.linkedin && {
                    icon: "in",
                    value: personal.linkedin,
                    field: 'linkedin', type: 'personal', href: personal.linkedin
                },
                personal?.github && {
                    icon: "⑂",
                    value: personal.github,
                    field: 'github', type: 'personal', href: personal.github
                },
                personal?.website && {
                    icon: "⊕",
                    value: personal.website,
                    field: 'website', type: 'personal', href: personal.website
                },
                ...extraLinks.map(link => ({
                    icon: "⊕",
                    value: link.url,
                    field: 'url', type: 'websites', idx: link.originalIdx, href: link.url
                }))
            ].filter(Boolean);

            return (
                <SectionWrapper sectionId="contact" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Contact">
                    <div>
                        <SidebarTitle title="Contact Details" />
                        {contactRows.map((row, i) => (
                            <div key={i} style={styles.contactItem}>
                                <span style={styles.contactIcon}>{row.icon}</span>
                                <span style={styles.contactText}>
                                    {row.href ? (
                                        <ResumeLink href={row.href}>
                                            <SpellCheckText
                                                text={row.value}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace(row.type, row.type === 'websites' ? row.idx : row.field, val, row.type === 'websites' ? 'url' : null)}
                                            />
                                        </ResumeLink>
                                    ) : (
                                        <SpellCheckText
                                            text={row.value}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace(row.type, row.field, val)}
                                        />
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </SectionWrapper>
            );
        },

        // ── WEBSITES ─────────────────────────────────────────────────────────
        websites: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.websites?.[idx]) : data.websites;
            const portfolioLinks = (items || [])
                .map((link, idx) => ({ ...link, originalIdx: itemIndices ? itemIndices[idx] : idx }))
                .filter(link => !link.addToHeader && link.url);
            if (portfolioLinks.length === 0) return null;

            return (
                <SectionWrapper sectionId="websites" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Websites">
                    <div>
                        <SidebarTitle title="Websites & Portfolios" />
                        {portfolioLinks.map((site, i) => (
                            <div key={i} style={styles.contactItem}>
                                <span style={styles.contactIcon}>⊕</span>
                                <span style={styles.contactText}>
                                    <ResumeLink href={site.url}>
                                        <SpellCheckText
                                            text={site.url}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace('websites', site.originalIdx, val, 'url')}
                                        />
                                    </ResumeLink>
                                </span>
                            </div>
                        ))}
                    </div>
                </SectionWrapper>
            );
        },

        // ── PERSONAL DETAILS ─────────────────────────────────────────────────
        personalDetails: ({ zoneId }) => {
            const details = [
                { label: "Citizenship", value: personal?.nationality, field: 'nationality' },
                { label: "Date of Birth", value: personal?.dob, field: 'dob' },
                { label: "Gender", value: personal?.gender, field: 'gender' },
                { label: "Family", value: personal?.maritalStatus, field: 'maritalStatus' },
                { label: "Languages", value: personal?.languagesSummary, field: 'languagesSummary' },
                { label: "Visa Status", value: personal?.visaStatus, field: 'visaStatus' },
                { label: "Religion", value: personal?.religion, field: 'religion' },
                { label: "Driving License", value: personal?.drivingLicense, field: 'drivingLicense' },
                { label: "Place of Birth", value: personal?.placeOfBirth, field: 'placeOfBirth' },
                { label: "Other", value: personal?.otherPersonal, field: 'otherPersonal' },
            ].filter(d => d.value);
            if (details.length === 0) return null;

            return (
                <SectionWrapper sectionId="personalDetails" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Personal Information">
                    <div>
                        <SidebarTitle title="Personal Information" />
                        {details.map((d, i) => (
                            <div key={i}>
                                <div style={styles.detailLabel}>{d.label}:</div>
                                <div style={styles.detailValue}>
                                    <SpellCheckText
                                        text={d.value}
                                        isActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onReplace={(val) => onSpellCheckReplace('personal', d.field, val)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionWrapper>
            );
        },

        // ── SKILLS (sidebar) ─────────────────────────────────────────────────
        skills: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.skills?.[idx]).filter(Boolean) : (data.skills || []);
            const hasDesc = data.skillsDescription && data.skillsDescription.trim();
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');

            if (items.length > 0) {
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <div>
                            {isSidebar ? <SidebarTitle title="Skills" /> : <MainTitle title="Skills" />}
                            {items.map((skill, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const name = typeof skill === 'object' ? skill.name : skill;
                                const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                return (
                                    <div key={originalIdx} data-item-index={originalIdx} style={isSidebar ? styles.skillItem : { marginBottom: "6px", fontSize: "calc(13px * var(--theme-font-scale, 1))" }}>
                                        {isSidebar && <span style={styles.skillBullet} />}
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <RichTextSpellCheck
                                                html={name}
                                                isActive={isSpellCheckActive}
                                                onIgnore={onSpellCheckIgnore}
                                                onReplace={(val) => onSpellCheckReplace('skills', originalIdx, val, 'name')}
                                            />
                                            {lvl > 0 && (
                                                <span style={{ display: "flex", gap: "3px", marginLeft: "8px" }}>
                                                    {[...Array(5)].map((_, di) => (
                                                        <div key={di} style={{
                                                            width: "6px", height: "6px", borderRadius: "50%",
                                                            backgroundColor: di < lvl
                                                                ? (isSidebar ? "rgba(255,255,255,0.7)" : ACCENT)
                                                                : (isSidebar ? "rgba(255,255,255,0.15)" : "rgba(120,120,120,0.15)")
                                                        }} />
                                                    ))}
                                                </span>
                                            )}
                                        </div>
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
                            {isSidebar ? <SidebarTitle title="Skills" /> : <MainTitle title="Skills" />}
                            <div className="resume-rich-text" style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: isSidebar ? SIDEBAR_TEXT : BODY_TEXT }}>
                                <SplittableRichText html={data.skillsDescription} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace && onSpellCheckReplace('skills', 'skillsDescription', val)} />
                            </div>
                        </div>
                    </SectionWrapper>
                );
            }
            return null;
        },

        // ── STRENGTHS / ADDITIONAL SKILLS (sidebar) ───────────────────────────
        strengths: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.strengths?.[idx]).filter(Boolean) : (data.strengths || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="strengths" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Strengths">
                    <div>
                        {isSidebar ? <SidebarTitle title="Key Strengths" /> : <MainTitle title="Key Strengths" />}
                        {items.map((skill, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const name = typeof skill === 'object' ? skill.name : skill;
                            const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                            return (
                                <div key={originalIdx} data-item-index={originalIdx} style={isSidebar ? styles.skillItem : { marginBottom: "6px", fontSize: "calc(13px * var(--theme-font-scale, 1))" }}>
                                    {isSidebar && <span style={styles.skillBullet} />}
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('strengths', originalIdx, val, 'name')} />
                                        {lvl > 0 && (
                                            <span style={{ display: "flex", gap: "3px", marginLeft: "8px" }}>
                                                {[...Array(5)].map((_, di) => (
                                                    <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.15)" }} />
                                                ))}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        additionalSkills: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.additionalSkills?.[idx]).filter(Boolean) : (data.additionalSkills || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="additionalSkills" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Skills">
                    <div>
                        {isSidebar ? <SidebarTitle title="Additional Skills" /> : <MainTitle title="Additional Skills" />}
                        {items.map((skill, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const name = typeof skill === 'object' ? skill.name : skill;
                            const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                            return (
                                <div key={originalIdx} data-item-index={originalIdx} style={isSidebar ? styles.skillItem : { marginBottom: "6px", fontSize: "calc(13px * var(--theme-font-scale, 1))" }}>
                                    {isSidebar && <span style={styles.skillBullet} />}
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalSkills', originalIdx, val, 'name')} />
                                        {lvl > 0 && (
                                            <span style={{ display: "flex", gap: "3px", marginLeft: "8px" }}>
                                                {[...Array(5)].map((_, di) => (
                                                    <div key={di} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: di < lvl ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.15)" }} />
                                                ))}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        // ── LANGUAGES ────────────────────────────────────────────────────────
        languages: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.languages?.[idx]) : data.languages;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="languages" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Languages">
                    <div>
                        {isSidebar ? <SidebarTitle title="Languages" /> : <MainTitle title="Languages" />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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

        // ── INTERESTS ────────────────────────────────────────────────────────
        interests: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.interests?.[idx]) : data.interests;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="interests" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Interests">
                    <div>
                        {isSidebar ? <SidebarTitle title="Interests" /> : <MainTitle title="Interests" />}
                        <ul className="resume-rich-text" style={{ paddingLeft: "16px", margin: 0 }}>
                            {items.map((item, i) => (
                                <li key={i} data-item-index={itemIndices ? itemIndices[i] : i} style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: isSidebar ? SIDEBAR_TEXT : BODY_TEXT, marginBottom: "4px" }}>
                                    <RichTextSpellCheck
                                        html={typeof item === 'object' ? item.name : item}
                                        isActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onReplace={(val) => onSpellCheckReplace('interests', itemIndices ? itemIndices[i] : i, val, 'name')}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </SectionWrapper>
            );
        },

        // ── ADDITIONAL INFO ───────────────────────────────────────────────────
        additionalInfo: ({ isContinued, subItemRanges, zoneId }) => {
            const html = data.additionalInfo || "";
            if (!html || html.trim() === "" || html === "<p><br></p>") return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="additionalInfo" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Information">
                    <div>
                        {isSidebar ? <SidebarTitle title="Additional Information" /> : <MainTitle title="Additional Information" />}
                        <div className="resume-rich-text" style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: isSidebar ? SIDEBAR_TEXT : BODY_TEXT, lineHeight: "1.6" }}>
                            <SplittableRichText html={html} range={subItemRanges?.additionalInfo} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalInfo', 'additionalInfo', val)} />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── AFFILIATIONS ─────────────────────────────────────────────────────
        affiliations: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.affiliations?.[idx]) : data.affiliations;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="affiliations" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Affiliations">
                    <div>
                        {isSidebar ? <SidebarTitle title="Affiliations" /> : <MainTitle title="Affiliations" />}
                        {items.map((aff, i) => (
                            <div key={i} style={{ marginBottom: "calc(8px * var(--theme-paragraph-margin, 1))" }}>
                                <div style={{ fontWeight: "700", fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: isSidebar ? SIDEBAR_HEAD : BODY_TEXT }}>
                                    <RichTextSpellCheck html={aff.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', itemIndices ? itemIndices[i] : i, val, 'name')} />
                                </div>
                                <div style={{ fontSize: "calc(11.5px * var(--theme-font-scale, 1))", color: isSidebar ? SIDEBAR_TEXT : MUTED_TEXT, fontStyle: "italic" }}>
                                    <RichTextSpellCheck html={aff.role || aff.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', itemIndices ? itemIndices[i] : i, val, 'role')} />
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionWrapper>
            );
        },

        // ── SOFTWARE ─────────────────────────────────────────────────────────
        software: ({ itemIndices, isContinued, zoneId, subItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.software?.[idx]) : data.software;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="software" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Software">
                    <div>
                        {isSidebar ? <SidebarTitle title="Software" /> : <MainTitle title="Software" />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
                                        subItemRange={subItemRanges?.[originalIdx]}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ══ MAIN COLUMN SECTIONS ═════════════════════════════════════════════

        // ── EXPERIENCE ───────────────────────────────────────────────────────
        experience: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.experience?.[idx]) : data.experience;
            if (!items || items.length === 0) return null;

            return (
                <SectionWrapper sectionId="experience" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Experience">
                    <div>
                        <MainTitle title="Experience" />
                        {items.map((exp, i) => {
                            if (!exp) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const isContinuedItem = subItemRanges?.[originalIdx]?.start > 0;
                            const dateStr = exp.year || exp.date || (exp.startYear
                                ? `${exp.startYear}–${exp.isCurrent ? "pres." : (exp.endYear || "")}`
                                : "");

                            return (
                                <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(14px * var(--theme-paragraph-margin, 1))", pageBreakInside: "avoid" }}>
                                    {!isContinuedItem && (
                                        <div style={styles.entryHeader}>
                                            <div style={{ flex: 1 }}>
                                                <div style={styles.entryTitle}>
                                                    <RichTextSpellCheck html={exp.title || exp.role || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'title')} />
                                                    {exp.company && (
                                                        <span style={{ fontWeight: "400", fontStyle: "italic" }}>
                                                            {" at "}
                                                            <RichTextSpellCheck html={`${exp.company}${exp.location ? ` (${exp.location})` : ""}${exp.isRemote ? " · Remote" : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'company')} />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {dateStr && (
                                                <div style={styles.entryDate}>
                                                    <RichTextSpellCheck html={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'date')} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="resume-rich-text" style={styles.entryDesc}>
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

        // ── EDUCATION ────────────────────────────────────────────────────────
        education: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.education?.[idx]) : data.education;
            if (!items || items.length === 0) return null;

            return (
                <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
                    <div>
                        <MainTitle title="Education" />
                        {items.map((edu, i) => {
                            if (!edu) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const isContinuedItem = subItemRanges?.[originalIdx]?.start > 0;
                            const dateStr = edu.year || edu.date || (edu.endYear ? `${edu.startYear ? edu.startYear + "–" : ""}${edu.endYear}` : "");

                            return (
                                <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(14px * var(--theme-paragraph-margin, 1))", pageBreakInside: "avoid" }}>
                                    {!isContinuedItem && (
                                        <div style={styles.entryHeader}>
                                            <div style={{ flex: 1 }}>
                                                <div style={styles.entryTitle}>
                                                    <RichTextSpellCheck html={edu.degree} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'degree')} />
                                                </div>
                                                <div style={styles.entryMeta}>
                                                    <RichTextSpellCheck html={`${edu.institution || edu.school || ""}${edu.location ? `, ${edu.location}` : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'institution')} />
                                                </div>
                                                {edu.grade && (
                                                    <div style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", color: MUTED_TEXT, marginBottom: "2px" }}>
                                                        GPA: {edu.grade}
                                                    </div>
                                                )}
                                            </div>
                                            {dateStr && (
                                                <div style={styles.entryDate}>
                                                    <RichTextSpellCheck html={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'year')} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {edu.description && (
                                        <div className="resume-rich-text" style={styles.entryDesc}>
                                            <SplittableRichText html={edu.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'description')} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        // ── PROJECTS ─────────────────────────────────────────────────────────
        projects: ({ itemIndices, isContinued, subItemRanges, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.projects?.[idx]) : data.projects;
            if (!items || items.length === 0) return null;

            return (
                <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
                    <div>
                        <MainTitle title="Projects" />
                        {items.map((proj, i) => {
                            if (!proj) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const isContinuedItem = subItemRanges?.[originalIdx]?.start > 0;
                            const dateStr = proj.year || (proj.startYear && `${proj.startYear}–${proj.isCurrent ? "Present" : (proj.endYear || "Present")}`);

                            return (
                                <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(14px * var(--theme-paragraph-margin, 1))", pageBreakInside: "avoid" }}>
                                    {!isContinuedItem && (
                                        <div style={styles.entryHeader}>
                                            <div style={{ flex: 1 }}>
                                                <div style={styles.entryTitle}>
                                                    <RichTextSpellCheck html={proj.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'title')} />
                                                </div>
                                                {proj.link && (
                                                    <div style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", color: ACCENT, marginBottom: "4px" }}>
                                                        <ResumeLink href={proj.link}>
                                                            <RichTextSpellCheck html={proj.link} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'link')} />
                                                        </ResumeLink>
                                                    </div>
                                                )}
                                                {proj.technologies && proj.technologies.length > 0 && (
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "6px" }}>
                                                        {proj.technologies.map((tech, tIdx) => (
                                                            <span key={tIdx} style={{ fontSize: "calc(10px * var(--theme-font-scale, 1))", padding: "1px 7px", background: "#f1f5f9", borderRadius: "10px", color: MUTED_TEXT }}>
                                                                <RichTextSpellCheck html={tech} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => { const updated = [...proj.technologies]; updated[tIdx] = val; onSpellCheckReplace('projects', originalIdx, updated, 'technologies'); }} />
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {dateStr && <div style={styles.entryDate}><SpellCheckText text={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, proj.year ? 'year' : 'date')} /></div>}
                                        </div>
                                    )}
                                    <div className="resume-rich-text" style={styles.entryDesc}>
                                        <SplittableRichText html={proj.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'description')} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        // ── CERTIFICATIONS ───────────────────────────────────────────────────
        certifications: ({ itemIndices, isContinued, zoneId, subItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.certifications?.[idx]) : data.certifications;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
                    <div>
                        {isSidebar ? <SidebarTitle title="Certifications" /> : <MainTitle title="Certifications" />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(8px * var(--theme-paragraph-margin, 1))" }}>
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
                                        subItemRange={subItemRanges?.[originalIdx]}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── AWARDS ───────────────────────────────────────────────────────────
        awards: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.awards?.[idx]) : data.awards;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="awards" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Awards">
                    <div>
                        {isSidebar ? <SidebarTitle title="Awards" /> : <MainTitle title="Awards" />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((award, i) => (
                                <div key={i}>
                                    <div style={{ fontWeight: "700", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: isSidebar ? SIDEBAR_HEAD : BODY_TEXT }}>
                                        <RichTextSpellCheck html={award.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', itemIndices ? itemIndices[i] : i, val, 'title')} />
                                    </div>
                                    <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: isSidebar ? SIDEBAR_TEXT : MUTED_TEXT, fontStyle: "italic" }}>
                                        <RichTextSpellCheck html={award.issuer} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('awards', itemIndices ? itemIndices[i] : i, val, 'issuer')} />
                                        {award.year && <span> · {award.year}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── VOLUNTEERING ─────────────────────────────────────────────────────
        volunteering: ({ itemIndices, zoneId, subItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.volunteering?.[idx] || data.volunteer?.[idx]) : (data.volunteering || data.volunteer);
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="volunteering" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Volunteering">
                    <div>
                        <MainTitle title="Volunteering" />
                        {items.map((item, i) => {
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(14px * var(--theme-paragraph-margin, 1))", pageBreakInside: "avoid" }}>
                                    <div style={styles.entryHeader}>
                                        <div style={{ flex: 1 }}>
                                            <div style={styles.entryTitle}>
                                                <RichTextSpellCheck html={item.role || item.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'role')} />
                                                {(item.organization || item.company) && (
                                                    <span style={{ fontWeight: "400", fontStyle: "italic" }}>
                                                        {" · "}
                                                        <RichTextSpellCheck html={item.organization || item.company} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'organization')} />
                                                    </span>
                                                )}
                                            </div>
                                            <div style={styles.entryMeta}>
                                                {[item.startDate, item.isCurrent ? "Present" : item.endDate].filter(Boolean).join(" – ")}
                                                {item.location && ` · ${item.location}`}
                                            </div>
                                        </div>
                                    </div>
                                    {item.description && (
                                        <div className="resume-rich-text" style={styles.entryDesc}>
                                            <SplittableRichText html={item.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('volunteering', originalIdx, val, 'description')} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        // ── PUBLICATIONS ─────────────────────────────────────────────────────
        publications: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.publications?.[idx]) : data.publications;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="publications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Publications">
                    <div>
                        {isSidebar ? <SidebarTitle title="Publications" /> : <MainTitle title="Publications" />}
                        <div style={{ display: "flex", flexDirection: "column", gap: "calc(10px * var(--theme-paragraph-margin, 1))" }}>
                            {items.map((pub, i) => (
                                <div key={i}>
                                    <div style={{ fontWeight: "700", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: isSidebar ? SIDEBAR_HEAD : BODY_TEXT }}>
                                        <RichTextSpellCheck html={pub.name || pub.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('publications', itemIndices ? itemIndices[i] : i, val, 'name')} />
                                    </div>
                                    <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: isSidebar ? SIDEBAR_TEXT : MUTED_TEXT, fontStyle: "italic" }}>
                                        <RichTextSpellCheck html={pub.publisher} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('publications', itemIndices ? itemIndices[i] : i, val, 'publisher')} />
                                        {pub.releaseDate && <span> · {pub.releaseDate}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── REFERENCES ───────────────────────────────────────────────────────
        references: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.references?.[idx]) : data.references;
            if (!items || items.length === 0) return null;
            return (
                <SectionWrapper sectionId="references" onSectionClick={onSectionClick} isInteractive={isInteractive} label="References">
                    <div>
                        <MainTitle title="References" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            {items.map((ref, i) => (
                                <div key={i}>
                                    <div style={{ fontWeight: "700", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: BODY_TEXT }}>
                                        <RichTextSpellCheck html={ref.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('references', itemIndices ? itemIndices[i] : i, val, 'name')} />
                                    </div>
                                    <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: MUTED_TEXT, fontStyle: "italic" }}>
                                        <RichTextSpellCheck html={ref.company || ref.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('references', itemIndices ? itemIndices[i] : i, val, 'company')} />
                                    </div>
                                    {ref.contact && (
                                        <div style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", color: MUTED_TEXT }}>
                                            <RichTextSpellCheck html={ref.contact} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('references', itemIndices ? itemIndices[i] : i, val, 'contact')} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        // ── CUSTOM ───────────────────────────────────────────────────────────
        custom: ({ isContinued, subItemRanges, zoneId }) => {
            if (!data.customSection?.isVisible || !data.customSection?.content) return null;
            const content = data.customSection.content;
            if (!content || content.trim() === "" || content === "<p><br></p>") return null;
            const title = data.customSection.title || "Additional Information";
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            return (
                <SectionWrapper sectionId="custom" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <div>
                        {isSidebar ? <SidebarTitle title={title} /> : <MainTitle title={title} />}
                        <div className="resume-rich-text" style={{ fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: isSidebar ? SIDEBAR_TEXT : BODY_TEXT, lineHeight: "1.6" }}>
                            <SplittableRichText html={content} range={subItemRanges?.custom} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('customSection', 'content', val)} />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
    };

    // ─── ZONE RENDERER ────────────────────────────────────────────────────────
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

    // ─── MEASURER (hidden, for pagination) ───────────────────────────────────
    const Measurer = () => (
        <div className="resume-measurer" style={{ position: "absolute", top: -10000, left: -10000, width: "210mm", visibility: "hidden" }}>
            <div className="page-height-marker" style={{ height: "297mm", width: "1px", position: "absolute", left: 0, top: 0 }} />
            <div style={{ ...styles.page, height: "auto" }}>
                {/* sidebar */}
                <div data-column-id="sidebar" style={styles.sidebarColumn}>
                    {personal?.photo && <img src={personal.photo} style={styles.photo} alt="profile" />}
                    <div style={styles.sidebarInner}>
                        <SidebarHeader />
                        {activeSidebarSections.map(sid => (
                            <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="sidebar" />
                        ))}
                    </div>
                </div>
                {/* main */}
                <div data-column-id="main" style={styles.mainColumn}>
                    {activeMainSections.map(sid => (
                        <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="main" />
                    ))}
                </div>
            </div>
        </div>
    );

    // ─── SINGLE PAGE LAYOUT ──────────────────────────────────────────────────
    const SinglePage = () => (
        <div style={{ ...styles.page, height: "auto", minHeight: "297mm" }}>
            {/* LEFT SIDEBAR */}
            <div style={styles.sidebarColumn}>
                {personal?.photo && (
                    <img src={personal.photo} style={styles.photo} alt="profile" />
                )}
                <div style={styles.sidebarInner}>
                    <SidebarHeader />
                    {renderZone('sidebar', activeSidebarSections, {
                        display: "flex",
                        flexDirection: "column",
                        gap: "calc(20px * var(--theme-section-margin, 1))"
                    })}
                </div>
            </div>
            {/* RIGHT MAIN */}
            <div style={styles.mainColumn}>
                {renderZone('main', activeMainSections, {
                    display: "flex",
                    flexDirection: "column",
                    gap: "calc(22px * var(--theme-section-margin, 1))"
                })}
            </div>
        </div>
    );

    // ─── PAGINATED LAYOUT ────────────────────────────────────────────────────
    const PaginatedLayout = () => (
        <>
            {pages.map((page, i) => (
                <div key={i} style={styles.page}>
                    {/* LEFT SIDEBAR */}
                    <div style={styles.sidebarColumn}>
                        {i === 0 && personal?.photo && (
                            <img src={personal.photo} style={styles.photo} alt="profile" />
                        )}
                        <div style={styles.sidebarInner}>
                            {i === 0 && <SidebarHeader />}
                            {renderZone(`sidebar-p${i}`, page.sidebar, {
                                display: "flex",
                                flexDirection: "column",
                                gap: "calc(20px * var(--theme-section-margin, 1))"
                            })}
                        </div>
                    </div>
                    {/* RIGHT MAIN */}
                    <div style={styles.mainColumn}>
                        {renderZone(`main-p${i}`, page.main, {
                            display: "flex",
                            flexDirection: "column",
                            gap: "calc(22px * var(--theme-section-margin, 1))"
                        })}
                    </div>
                    {/* Page number */}
                    <div style={{ position: "absolute", bottom: "12px", right: "16px", fontSize: "9px", opacity: 0.35, color: BODY_TEXT }}>
                        {i + 1}
                    </div>
                </div>
            ))}
        </>
    );

    // ─── ROOT ─────────────────────────────────────────────────────────────────
    return (
        <div ref={containerRef} className="slate-classic-root">
            <Measurer />
            <DndContext {...dndContextProps}>
                <SortableContext
                    items={[...activeSidebarSections, ...activeMainSections]}
                    strategy={verticalListSortingStrategy}
                >
                    {showPageBreaks && pages ? <PaginatedLayout /> : <SinglePage />}
                </SortableContext>
                <StableResumeDragOverlay
                    activeId={activeId}
                    scale={scale}
                    renderSection={(id) => (
                        <div style={{ background: "white", padding: "10px", border: "1px solid #ddd", width: "260px" }}>
                            <SectionRenderer sectionId={id} data={data} customRenderers={customRenderers} />
                        </div>
                    )}
                />
            </DndContext>
        </div>
    );
};

export default SlateClassic;