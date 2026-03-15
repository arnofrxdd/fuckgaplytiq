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
import { Globe, Linkedin, Github } from "lucide-react";
import { getCompleteLayout, getSavedLayout } from "../common/TemplateUtils";

/**
 * AuraPastel Template
 * Clean, white-background resume with a decorative blob behind the name,
 * a left sidebar separated by a dashed vertical line, and a main content column.
 * Dark charcoal color scheme with lowercase section headings.
 */
const AuraPastel = ({
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
    const templateId = 'aura-pastel';
    const initialLayout = getSavedLayout(data, templateId, {
        main: ['experience', 'education', 'projects', 'custom', 'volunteering', 'publications', 'references', 'awards', 'affiliations', 'additionalInfo'],
        sidebar: ['contact', 'websites', 'summary', 'skills', 'strengths', 'additionalSkills', 'languages', 'certifications', 'interests', 'personalDetails']
    });

    const completeLayout = getCompleteLayout(data, initialLayout, 'main');
    const activeMainSections = completeLayout.main || [];
    const activeSidebarSections = completeLayout.sidebar || [];

    // --- DRAG & DROP HOOK ---
    const { dndContextProps, activeId } = useResumeDragAndDrop({
        data,
        onReorder,
        scale,
        containers: { main: activeMainSections, sidebar: activeSidebarSections }
    });

    // --- PAGINATION HOOK ---
    const pages = useAutoPagination({
        columns: { main: activeMainSections, sidebar: activeSidebarSections },
        data,
        enabled: showPageBreaks,
        containerRef,
        scale
    });

    // --- STYLES ---
    const themeColor = "var(--theme-color, #3d4a5c)";
    const styles = {
        page: {
            width: "210mm",
            height: "297mm",
            background: "white",
            boxSizing: "border-box",
            position: "relative",
            margin: "0 auto 30px auto",
            color: "#3d4a5c",
            fontFamily: "var(--theme-font, 'Georgia', serif)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
        },
        headerArea: {
            position: "relative",
            paddingTop: "var(--theme-page-margin, 40px)",
            paddingLeft: "var(--theme-page-margin, 40px)",
            paddingRight: "var(--theme-page-margin, 40px)",
            paddingBottom: "20px",
            overflow: "hidden",
            minHeight: "110px",
            boxSizing: "border-box",
        },
        blobShape: {
            position: "absolute",
            top: "calc(var(--theme-page-margin, 40px) - 70px)", // Float with name
            left: "calc(var(--theme-page-margin, 40px) - 70px)", // Float with name
            width: "200px",
            height: "190px",
            background: "#e8eaed",
            borderRadius: "62% 38% 54% 46% / 60% 44% 56% 40%",
            zIndex: 0,
            opacity: 0.8,
            WebkitPrintColorAdjust: "exact",
        },
        headerContent: {
            position: "relative",
            zIndex: 1,
        },
        name: {
            fontSize: "calc(38px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "#1a2332",
            margin: "0",
            lineHeight: "1.1",
            fontFamily: "var(--theme-font, 'Georgia', serif)",
            letterSpacing: "-0.5px",
        },
        profession: {
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            fontWeight: "400",
            color: "#6b7a8d",
            marginTop: "8px",
            letterSpacing: "0.3px",
        },
        layoutBody: {
            display: "flex",
            flex: 1,
            minHeight: 0,
            paddingTop: "0",
            paddingLeft: "0",
            paddingRight: "0",
            paddingBottom: "var(--theme-page-margin, 40px)",
            boxSizing: "border-box",
        },
        sidebarColumn: {
            width: "31%",
            paddingTop: "0",
            paddingLeft: "var(--theme-page-margin, 40px)",
            paddingRight: "30px",
            paddingBottom: "0",
            display: "flex",
            flexDirection: "column",
            gap: "calc(22px * var(--theme-section-margin, 1))",
            borderRight: "1px dashed #c5cdd8",
            boxSizing: "border-box",
        },
        mainColumn: {
            flex: 1,
            paddingTop: "0",
            paddingLeft: "30px",
            paddingRight: "var(--theme-page-margin, 40px)",
            paddingBottom: "0",
            display: "flex",
            flexDirection: "column",
            gap: "calc(24px * var(--theme-section-margin, 1))",
            boxSizing: "border-box",
        },
        sectionTitle: {
            fontSize: "calc(17px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "#1a2332",
            marginTop: "0",
            marginBottom: "14px",
            fontFamily: "var(--theme-font, 'Georgia', serif)",
            textTransform: "lowercase",
            letterSpacing: "0",
        },
        sidebarSectionTitle: {
            fontSize: "calc(15px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "#1a2332",
            marginTop: "0",
            marginBottom: "12px",
            fontFamily: "var(--theme-font, 'Georgia', serif)",
            textTransform: "lowercase",
        },
        expRow: {
            marginBottom: "calc(24px * var(--theme-paragraph-margin, 1))",
        },
        expHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "2px",
        },
        expTitle: {
            fontWeight: "700",
            fontSize: "calc(14px * var(--theme-font-scale, 1))",
            color: "#1a2332",
        },
        expDate: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: "#8a96a3",
            fontStyle: "normal",
            whiteSpace: "nowrap",
            marginLeft: "12px",
        },
        expCompany: {
            fontWeight: "700",
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            color: "#3d4a5c",
            marginBottom: "8px",
        },
        expDesc: {
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            lineHeight: "var(--theme-line-height, 1.6)",
            color: "#4a5568",
        },
        contactItem: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "calc(13px * var(--theme-font-scale, 1))",
            color: "#4a5568",
            marginBottom: "8px",
            wordBreak: "break-all",
        },
        contactIcon: {
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "#e8eaed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
        },
        skillDot: {
            width: "8px",
            height: "8px",
            borderRadius: "50%",
        },

    };

    const Header = () => (
        <SectionWrapper sectionId="personal" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Header">
            <div style={styles.headerArea}>
                <div style={styles.blobShape} />
                <div style={styles.headerContent}>
                    <h1 style={styles.name}>
                        <SpellCheckText
                            text={personal?.name || "Your Name"}
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
            </div>
        </SectionWrapper>
    );

    const SectionTitle = ({ title, isSidebar }) => {
        const { isContinued } = useSectionContext();
        const displayTitle = isContinued ? `${title} (cont.)` : title;
        return (
            <h3 style={isSidebar ? styles.sidebarSectionTitle : styles.sectionTitle}>
                {displayTitle}
            </h3>
        );
    };

    const customRenderers = {
        summary: ({ isContinued, subItemRanges, zoneId }) => {
            if (!data.summary) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="summary" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Profile">
                    <div>
                        <SectionTitle title="profile" isSidebar={isSidebar} />
                        <div className="resume-rich-text" style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", lineHeight: "var(--theme-line-height, 1.65)", color: "#4a5568" }}>
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
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="experience" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Work History">
                    <div>
                        <SectionTitle title="work history" isSidebar={isSidebar} />
                        {items.map((exp, i) => {
                            if (!exp) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr = exp.year || exp.date || (exp.startYear ? `${exp.startYear} – ${exp.isCurrent ? "present" : exp.endYear}` : "");
                            const companyStr = `${exp.company || ""}${exp.location ? ` | ${exp.location}` : ""}${exp.isRemote ? " | Remote" : ""}`;
                            return (
                                <div key={i} data-item-index={originalIdx} style={styles.expRow}>
                                    <div style={styles.expHeader}>
                                        <div style={styles.expTitle}>
                                            <RichTextSpellCheck html={exp.title || exp.role || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'title')} />
                                        </div>
                                        {dateStr && (
                                            <div style={styles.expDate}>
                                                <RichTextSpellCheck html={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'date')} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={styles.expCompany}>
                                        <RichTextSpellCheck html={companyStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', originalIdx, val, 'company')} />
                                    </div>
                                    <div className="resume-rich-text" style={styles.expDesc}>
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
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
                    <div>
                        <SectionTitle title="education" isSidebar={isSidebar} />
                        {items.map((edu, i) => {
                            if (!edu) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            return (
                                <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(18px * var(--theme-paragraph-margin, 1))" }}>
                                    <div style={styles.expHeader}>
                                        <div style={styles.expTitle}>
                                            <RichTextSpellCheck html={`${edu.degree || ""}${edu.field ? ` in ${edu.field}` : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'degree')} />
                                        </div>
                                        {(edu.year || edu.endYear) && (
                                            <div style={styles.expDate}>
                                                <RichTextSpellCheck html={edu.year || edu.endYear || ""} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'year')} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#6b7a8d", marginBottom: "4px" }}>
                                        <RichTextSpellCheck html={`${edu.institution || edu.school || ""}${(edu.city || edu.location) ? `, ${edu.city || edu.location}` : ""}`} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'institution')} />
                                    </div>
                                    {edu.grade && <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#8a96a3" }}>GPA: {edu.grade}</div>}
                                    {edu.description && (
                                        <div className="resume-rich-text" style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", lineHeight: "1.6", color: "#4a5568", marginTop: "6px" }}>
                                            <SplittableRichText html={edu.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', originalIdx, val, 'description')} />
                                        </div>
                                    )}
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
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
                    <div>
                        <SectionTitle title="projects" isSidebar={isSidebar} />
                        {items.map((proj, i) => {
                            if (!proj) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr = proj.year || (proj.startYear && `${proj.startYear} – ${proj.isCurrent ? 'Present' : (proj.endYear || 'Present')}`);
                            return (
                                <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(20px * var(--theme-paragraph-margin, 1))" }}>
                                    <div style={styles.expHeader}>
                                        <div style={styles.expTitle}>
                                            <RichTextSpellCheck html={proj.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'title')} />
                                        </div>
                                        {dateStr && <div style={styles.expDate}>{dateStr}</div>}
                                    </div>
                                    {proj.link && (
                                        <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#6b7a8d", marginBottom: "6px" }}>
                                            <ResumeLink href={proj.link}>{proj.link}</ResumeLink>
                                        </div>
                                    )}
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "6px" }}>
                                            {proj.technologies.map((tech, tIdx) => (
                                                <span key={tIdx} style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", padding: "2px 7px", background: "#f0f2f5", borderRadius: "10px", color: "#6b7a8d" }}>{tech}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="resume-rich-text" style={styles.expDesc}>
                                        <SplittableRichText html={proj.description} range={subItemRanges?.[originalIdx]} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'description')} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            );
        },

        contact: ({ zoneId }) => {
            const isSidebar = zoneId?.includes("sidebar");
            const contactLinks = [
                { label: 'LinkedIn', value: personal?.linkedin, icon: 'linkedin', field: 'linkedin', type: 'personal' },
                { label: 'GitHub', value: personal?.github, icon: 'github', field: 'github', type: 'personal' },
                { label: 'Website', value: personal?.website, icon: 'globe', field: 'website', type: 'personal' },
                ...(data.websites || []).map((s, idx) => ({ ...s, idx })).filter(s => s.addToHeader && s.url).map(s => ({
                    label: s.label || 'Website',
                    value: s.url,
                    icon: 'globe',
                    field: 'url',
                    type: 'websites',
                    idx: s.idx
                }))
            ].filter(l => l.value);

            const IconCircle = ({ type }) => {
                const icons = {
                    linkedin: <Linkedin size={10} color="#3d4a5c" />,
                    github: <Github size={10} color="#3d4a5c" />,
                    globe: <Globe size={10} color="#3d4a5c" />,
                };
                return (
                    <div style={styles.contactIcon}>{icons[type] || <Globe size={10} color="#3d4a5c" />}</div>
                );
            };

            return (
                <SectionWrapper sectionId="contact" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Contact">
                    <div>
                        <SectionTitle title="contact" isSidebar={isSidebar} />
                        <div style={isSidebar ? { display: "flex", flexDirection: "column", gap: "8px" } : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
                            {personal?.city && (
                                <div style={styles.contactItem}>
                                    <div style={{ ...styles.contactIcon, fontSize: "10px" }}>📍</div>
                                    <span style={{ wordBreak: "break-word" }}>
                                        <SpellCheckText
                                            text={[personal?.city, personal?.state, personal?.country, personal?.zipCode].filter(Boolean).join(", ")}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace('personal', 'city', val)}
                                        />
                                    </span>
                                </div>
                            )}

                            {personal?.phone && (
                                <div style={styles.contactItem}>
                                    <div style={{ ...styles.contactIcon, fontSize: "10px" }}>📞</div>
                                    <ResumeLink href={personal.phone}>
                                        <SpellCheckText text={personal.phone} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'phone', val)} />
                                    </ResumeLink>
                                </div>
                            )}

                            {personal?.email && (
                                <div style={styles.contactItem}>
                                    <div style={{ ...styles.contactIcon, fontSize: "10px" }}>✉</div>
                                    <ResumeLink href={personal.email}>
                                        <SpellCheckText text={personal.email} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', 'email', val)} />
                                    </ResumeLink>
                                </div>
                            )}

                            {contactLinks.map((link, i) => (
                                <div key={i} style={styles.contactItem}>
                                    <IconCircle type={link.icon} />
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
            const items = itemIndices ? itemIndices.map(idx => data.websites?.[idx]) : data.websites;
            const links = (items || []).map((l, idx) => ({ ...l, originalIdx: itemIndices ? itemIndices[idx] : idx }));
            if (links.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="websites" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Portfolios">
                    <div>
                        <SectionTitle title="portfolios" isSidebar={isSidebar} />
                        {links.map((site, i) => (
                            <div key={i} style={styles.contactItem}>
                                <div style={styles.contactIcon}>
                                    <Globe size={10} color="#3d4a5c" />
                                </div>
                                <div>
                                    {site.label && <div style={{ fontSize: "calc(11px * var(--theme-font-scale, 1))", color: "#8a96a3", marginBottom: "2px" }}>{site.label}</div>}
                                    <ResumeLink href={site.url}>
                                        <SpellCheckText text={site.url} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('websites', site.originalIdx, val, 'url')} />
                                    </ResumeLink>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionWrapper>
            );
        },

        skills: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.skills?.[idx]).filter(Boolean) : (data.skills || []);
            const hasDescription = data.skillsDescription && data.skillsDescription.trim();
            const isSidebar = zoneId?.includes("sidebar");

            if (items.length > 0) {
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <div>
                            <SectionTitle title="skills" isSidebar={isSidebar} />
                            <ul className="resume-rich-text" style={{ paddingLeft: "16px", margin: 0, listStyleType: "disc" }}>
                                {items.map((skill, i) => {
                                    const originalIdx = itemIndices ? itemIndices[i] : i;
                                    const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                    const name = typeof skill === 'object' ? skill.name : skill;
                                    return (
                                        <li key={originalIdx} data-item-index={originalIdx} style={{ marginBottom: "6px", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#4a5568" }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <RichTextSpellCheck html={name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('skills', originalIdx, val, 'name')} />
                                                {lvl > 0 && (
                                                    <span style={{ display: "flex", gap: "3px", marginLeft: "8px" }}>
                                                        {[...Array(5)].map((_, di) => (
                                                            <div key={di} style={{ ...styles.skillDot, backgroundColor: di < lvl ? "#3d4a5c" : "#d1d8e0" }} />
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
            }

            if (hasDescription) {
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <div>
                            <SectionTitle title="skills" isSidebar={isSidebar} />
                            <div className="resume-rich-text" style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#4a5568" }}>
                                <SplittableRichText html={data.skillsDescription} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('skills', 'skillsDescription', val)} />
                            </div>
                        </div>
                    </SectionWrapper>
                );
            }
            return null;
        },

        strengths: ({ itemIndices, isContinued, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.strengths?.[idx]).filter(Boolean) : (data.strengths || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="strengths" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Strengths">
                    <div>
                        <SectionTitle title="key strengths" isSidebar={isSidebar} />
                        <ul className="resume-rich-text" style={{ paddingLeft: "16px", margin: 0 }}>
                            {items.map((skill, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                return (
                                    <li key={originalIdx} data-item-index={originalIdx} style={{ marginBottom: "6px", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#4a5568" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <RichTextSpellCheck html={typeof skill === 'object' ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('strengths', originalIdx, val, 'name')} />
                                            {lvl > 0 && (
                                                <span style={{ display: "flex", gap: "3px", marginLeft: "8px" }}>
                                                    {[...Array(5)].map((_, di) => (
                                                        <div key={di} style={{ ...styles.skillDot, backgroundColor: di < lvl ? "#3d4a5c" : "#d1d8e0" }} />
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
            const items = itemIndices ? itemIndices.map(idx => data.additionalSkills?.[idx]).filter(Boolean) : (data.additionalSkills || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="additionalSkills" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Skills">
                    <div>
                        <SectionTitle title="additional skills" isSidebar={isSidebar} />
                        <ul className="resume-rich-text" style={{ paddingLeft: "16px", margin: 0 }}>
                            {items.map((skill, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                const lvl = typeof skill === 'object' ? (skill.level ?? skill.rating) : null;
                                return (
                                    <li key={originalIdx} data-item-index={originalIdx} style={{ marginBottom: "6px", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#4a5568" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <RichTextSpellCheck html={typeof skill === 'object' ? skill.name : skill} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalSkills', originalIdx, val, 'name')} />
                                            {lvl > 0 && (
                                                <span style={{ display: "flex", gap: "3px", marginLeft: "8px" }}>
                                                    {[...Array(5)].map((_, di) => (
                                                        <div key={di} style={{ ...styles.skillDot, backgroundColor: di < lvl ? "#3d4a5c" : "#d1d8e0" }} />
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
            const items = itemIndices ? itemIndices.map(idx => data.languages?.[idx]) : data.languages;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="languages" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Languages">
                    <div>
                        <SectionTitle title="languages" isSidebar={isSidebar} />
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

        certifications: ({ itemIndices, isContinued, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.certifications?.[idx]) : data.certifications;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
                    <div>
                        <SectionTitle title="certifications" isSidebar={isSidebar} />
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
                </SectionWrapper>
            );
        },

        software: ({ itemIndices, isContinued, zoneId, subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => data.software?.[idx]) : data.software;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="software" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Software">
                    <div>
                        <SectionTitle title="software" isSidebar={isSidebar} />
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
                </SectionWrapper>
            );
        },

        interests: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.interests?.[idx]) : data.interests;
            if (!items || items.length === 0) return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="interests" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Interests">
                    <div>
                        <SectionTitle title="interests" isSidebar={isSidebar} />
                        <ul className="resume-rich-text" style={{ paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "5px" }}>
                            {items.map((item, i) => (
                                <li key={i} data-item-index={itemIndices ? itemIndices[i] : i} style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#4a5568" }}>
                                    <RichTextSpellCheck html={typeof item === 'object' ? item.name : item} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('interests', itemIndices ? itemIndices[i] : i, val, 'name')} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </SectionWrapper>
            );
        },


        keyAchievements: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.keyAchievements?.[idx]).filter(Boolean) : (data.keyAchievements || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');

            return (
                <SectionWrapper sectionId="keyAchievements" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Achievements">
                    <div>
                        <SectionTitle title="key achievements" isSidebar={isSidebar} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx}>
                                        <div style={{ fontWeight: "700", fontSize: isSidebar ? "calc(12px * var(--theme-font-scale, 1))" : "calc(14px * var(--theme-font-scale, 1))", color: "#1a2332" }}>
                                            <RichTextSpellCheck html={item.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIdx, val, 'name')} />
                                        </div>
                                        {item.description && (
                                            <div style={{ fontSize: isSidebar ? "calc(11.5px * var(--theme-font-scale, 1))" : "calc(13px * var(--theme-font-scale, 1))", color: "#6b7a8d" }}>
                                                <RichTextSpellCheck html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('keyAchievements', originalIdx, val, 'description')} />
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

        accomplishments: ({ itemIndices, zoneId }) => {
            const items = itemIndices ? itemIndices.map(idx => data.accomplishments?.[idx]).filter(Boolean) : (data.accomplishments || []);
            if (items.length === 0) return null;
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');

            return (
                <SectionWrapper sectionId="accomplishments" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Accomplishments">
                    <div>
                        <SectionTitle title="accomplishments" isSidebar={isSidebar} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx}>
                                        <div style={{ fontWeight: "700", fontSize: isSidebar ? "calc(12px * var(--theme-font-scale, 1))" : "calc(14px * var(--theme-font-scale, 1))", color: "#1a2332" }}>
                                            <RichTextSpellCheck html={item.name} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('accomplishments', originalIdx, val, 'name')} />
                                        </div>
                                        {item.description && (
                                            <div style={{ fontSize: isSidebar ? "calc(11.5px * var(--theme-font-scale, 1))" : "calc(13px * var(--theme-font-scale, 1))", color: "#6b7a8d" }}>
                                                <RichTextSpellCheck html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('accomplishments', originalIdx, val, 'description')} />
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
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');

            return (
                <SectionWrapper sectionId="affiliations" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Affiliations">
                    <div>
                        <SectionTitle title="affiliations" isSidebar={isSidebar} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <div key={i} data-item-index={originalIdx}>
                                        <div style={{ fontWeight: "700", fontSize: isSidebar ? "calc(12px * var(--theme-font-scale, 1))" : "calc(14px * var(--theme-font-scale, 1))", color: "#1a2332" }}>
                                            <RichTextSpellCheck html={typeof item === 'object' ? item.name : item} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, 'name')} />
                                        </div>
                                        {item.description && (
                                            <div style={{ fontSize: isSidebar ? "calc(11.5px * var(--theme-font-scale, 1))" : "calc(13px * var(--theme-font-scale, 1))", color: "#6b7a8d" }}>
                                                <RichTextSpellCheck html={item.description} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('affiliations', originalIdx, val, 'description')} />
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
            const isSidebar = zoneId?.toLowerCase().includes('sidebar');
            const details = [
                { label: 'dob', value: personal?.dob, field: 'dob' },
                { label: 'nationality', value: personal?.nationality, field: 'nationality' },
                { label: 'gender', value: personal?.gender, field: 'gender' },
                { label: 'marital', value: personal?.maritalStatus, field: 'maritalStatus' },
                { label: 'visa', value: personal?.visaStatus, field: 'visaStatus' },
                { label: 'religion', value: personal?.religion, field: 'religion' },
                { label: 'passport', value: personal?.passport, field: 'passport' },
                { label: 'place of birth', value: personal?.placeOfBirth, field: 'placeOfBirth' },
                { label: 'driving license', value: personal?.drivingLicense, field: 'drivingLicense' },
                { label: 'other', value: personal?.otherPersonal, field: 'otherPersonal' },
            ].filter(d => d.value);

            if (details.length === 0) return null;

            return (
                <SectionWrapper sectionId="personalDetails" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Personal Details">
                    <div>
                        <SectionTitle title="personal details" isSidebar={isSidebar} />
                        <div style={{ display: "grid", gridTemplateColumns: isSidebar ? "1fr" : "1fr 1fr", gap: "8px 16px" }}>
                            {details.map((detail, i) => (
                                <div key={i} style={{ fontSize: "calc(12.5px * var(--theme-font-scale, 1))", color: "#4a5568" }}>
                                    <span style={{ fontWeight: "700", color: "#1a2332", marginRight: "6px" }}>{detail.label}:</span>
                                    <SpellCheckText text={detail.value} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('personal', detail.field, val)} />
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },

        additionalInfo: ({ isContinued, subItemRanges: renderSubItemRanges, zoneId }) => {
            const html = data.additionalInfo || "";
            if (!html || html.trim() === "" || html === "<p><br></p>") return null;
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="additionalInfo" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Information">
                    <div>
                        <SectionTitle title="additional information" isSidebar={isSidebar} />
                        <div className="resume-rich-text" style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", lineHeight: "1.6", color: "#4a5568" }}>
                            <SplittableRichText html={html} range={renderSubItemRanges?.additionalInfo} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('additionalInfo', 'additionalInfo', val)} />
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
            const isSidebar = zoneId?.includes("sidebar");
            return (
                <SectionWrapper sectionId="custom" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <div>
                        <SectionTitle title={title.toLowerCase()} isSidebar={isSidebar} />
                        <div className="resume-rich-text" style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", lineHeight: "1.6", color: "#4a5568" }}>
                            <SplittableRichText html={content} range={renderSubItemRanges?.custom} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('customSection', 'content', val)} />
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
    };

    const renderZone = (id, items, columnStyle) => (
        <DroppableZone id={id} style={{ ...columnStyle, flex: 1 }}>
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
                    <div data-column-id="sidebar" style={styles.sidebarColumn}>

                        {activeSidebarSections.map(sid => (
                            <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="sidebar" />
                        ))}
                    </div>
                    <div data-column-id="main" style={styles.mainColumn}>
                        {activeMainSections.map(sid => (
                            <SectionRenderer key={sid} sectionId={sid} data={data} customRenderers={customRenderers} zoneId="main" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="aura-pastel-root">
            <Measurer />
            <DndContext {...dndContextProps}>
                <SortableContext items={[...activeMainSections, ...activeSidebarSections]} strategy={verticalListSortingStrategy}>
                    {showPageBreaks && pages ? (
                        pages.map((page, i) => (
                            <div key={i} className="resume-page" style={{ ...styles.page, height: "297mm", minHeight: "unset", overflow: "hidden" }}>
                                {i === 0 && <Header />}
                                <div style={{ ...styles.layoutBody, flex: 1 }}>
                                    <div style={{ ...styles.sidebarColumn, display: "flex", flexDirection: "column" }}>

                                        {renderZone(`sidebar-p${i}`, page.sidebar, { display: "flex", flexDirection: "column", gap: "calc(22px * var(--theme-section-margin, 1))", flex: 1 })}
                                    </div>
                                    <div style={{ ...styles.mainColumn, display: "flex", flexDirection: "column" }}>
                                        {renderZone(`main-p${i}`, page.main, { display: "flex", flexDirection: "column", gap: "calc(24px * var(--theme-section-margin, 1))", flex: 1 })}
                                    </div>
                                </div>
                                <div style={{ position: "absolute", bottom: "15px", right: "20px", fontSize: "10px", color: "#8a96a3" }}>Page {i + 1}</div>
                            </div>
                        ))
                    ) : (
                        <div className="resume-page" style={{ ...styles.page, height: "auto", minHeight: "100%" }}>
                            <Header />
                            <div style={styles.layoutBody}>
                                <div style={{ ...styles.sidebarColumn, display: "flex", flexDirection: "column" }}>

                                    {renderZone('sidebar', activeSidebarSections, { display: "flex", flexDirection: "column", gap: "calc(22px * var(--theme-section-margin, 1))", flex: 1 })}
                                </div>
                                <div style={{ ...styles.mainColumn, display: "flex", flexDirection: "column" }}>
                                    {renderZone('main', activeMainSections, { display: "flex", flexDirection: "column", gap: "calc(24px * var(--theme-section-margin, 1))", flex: 1 })}
                                </div>
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

export default AuraPastel;
