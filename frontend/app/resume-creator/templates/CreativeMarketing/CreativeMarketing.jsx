import React, { useRef } from "react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SectionWrapper from "../../components/SectionWrapper";
import { useResumeDragAndDrop, DroppableZone, StableResumeDragOverlay } from "../../hooks/useResumeDragAndDrop";
import DraggableSection from "../../components/dnd/DraggableSection";
import SectionRenderer from "../common/SectionRenderer";
import { useSectionContext } from "../common/SectionContext";
import { useAutoPagination } from "../../hooks/useAutoPagination";
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";
import {
    SpellCheckText,
    SplittableRichText,
    RichTextSpellCheck,
    LanguageItem,
    CertificationItem,
    SoftwareItem,
    AchievementItem,
    AccomplishmentItem,
    AffiliationItem,
    ResumeLink
} from "../common/BaseComponents";

import { getCompleteLayout, getSavedLayout } from "../common/TemplateUtils";

/**
 * CreativeMarketing Template - Updated
 * Fully covers all fields from ResumeRenderer including Pincode, Volunteering, References, etc.
 */
const CreativeMarketing = ({
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
    const templateId = 'creative-marketing';
    const initialLayout = getSavedLayout(data, templateId, {
        left: ['personalDetails', 'summary', 'education', 'skills', 'strengths', 'languages', 'interests', 'certifications', 'additionalSkills'],
        right: ['contact', 'websites', 'experience', 'projects', 'volunteering', 'publications', 'awards', 'references', 'keyAchievements', 'custom']
    });

    // Auto-complete the layout with any "orphaned" sections
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
            background: "var(--theme-background, white)",
            boxSizing: "border-box",
            position: "relative",
            margin: "0 0 30px 0",
            color: "var(--theme-text, #334155)",
            fontFamily: "var(--theme-font, 'Lora', serif)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
        },
        header: {
            background: "var(--theme-color, #2d5a7b)",
            padding: "50px 40px",
            textAlign: "center",
            color: "white",
            marginBottom: "0",
        },
        name: {
            fontSize: "calc(42px * var(--theme-font-scale, 1))",
            fontWeight: "400",
            margin: "0 0 10px 0",
            textTransform: "uppercase",
            letterSpacing: "4px",
            fontFamily: "var(--theme-font, 'Lora', serif)",
        },
        profession: {
            fontSize: "calc(14px * var(--theme-font-scale, 1))",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "2.5px",
            opacity: 0.9,
            fontFamily: "'Inter', sans-serif",
        },
        layoutBody: {
            display: "flex",
            flex: 1,
            minHeight: 0,
            padding: "0",
            position: "relative",
            marginTop: "20px", // Clear gap after header
        },
        leftColumn: {
            width: "50%",
            boxSizing: "border-box",
            paddingBottom: "var(--theme-page-margin, 40px)",
            paddingTop: "40px",
            paddingLeft: "var(--theme-page-margin, 40px)",
            paddingRight: "var(--theme-page-margin, 40px)",
            display: "flex",
            flexDirection: "column",
            gap: "calc(35px * var(--theme-section-margin, 1))",
            textAlign: "right",
        },
        rightColumn: {
            width: "50%",
            boxSizing: "border-box",
            paddingBottom: "var(--theme-page-margin, 40px)",
            paddingTop: "40px",
            paddingLeft: "var(--theme-page-margin, 40px)",
            paddingRight: "var(--theme-page-margin, 40px)",
            display: "flex",
            flexDirection: "column",
            gap: "calc(35px * var(--theme-section-margin, 1))",
            borderLeft: "2px solid #e2e8f0",
            position: "relative",
        },
        sectionTitle: {
            fontSize: "calc(18px * var(--theme-font-scale, 1))",
            fontWeight: "700",
            color: "var(--theme-color, #2d5a7b)",
            textTransform: "uppercase",
            letterSpacing: "2px",
            marginBottom: "calc(15px * var(--theme-paragraph-margin, 1))",
            position: "relative",
            fontFamily: "var(--theme-font, 'Lora', serif)",
        },
        skillBarContainer: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "15px",
            marginBottom: "calc(12px * var(--theme-paragraph-margin, 1))",
        },
        skillName: {
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            fontWeight: "600",
            color: "#475569",
        },
        skillBarBG: {
            width: "100px",
            height: "6px",
            background: "#f1f5f9",
            borderRadius: "3px",
            overflow: "hidden",
        },
        skillBarFill: (level) => {
            const percentage = level > 5 ? level : (level / 5) * 100;
            return {
                width: `${percentage}%`,
                height: "100%",
                background: "var(--theme-color, #2d5a7b)",
                borderRadius: "3px",
            };
        },
        contactItem: {
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "calc(12px * var(--theme-font-scale, 1))",
            color: "#475569",
            marginBottom: "calc(8px * var(--theme-paragraph-margin, 1))",
        },
        contactLabel: {
            fontWeight: "700",
            color: "var(--theme-color, #2d5a7b)",
            width: "60px",
        },

    };

    const Header = () => (
        <SectionWrapper sectionId="personal" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Header">
            <div style={styles.header}>
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

    const CustomSectionTitle = ({ title, showDot = false, zoneId = 'right' }) => {
        const { isContinued } = useSectionContext();
        const isLeft = zoneId.includes('left');
        const align = isLeft ? 'right' : 'left';
        const displayTitle = isContinued ? `${title} (Cont.)` : title;

        return (
            <div style={{ position: "relative" }}>
                {showDot && (
                    <div style={{
                        position: "absolute",
                        [align === 'right' ? 'right' : 'left']: isLeft
                            ? "calc(-1 * (var(--theme-page-margin, 40px) + 8px))"
                            : "calc(-1 * (var(--theme-page-margin, 40px) + 10px))",
                        top: isLeft ? "2px" : "8px",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "var(--theme-color, #2d5a7b)",
                        border: "4px solid white",
                        zIndex: 10,
                        boxShadow: "0 0 0 2px #e2e8f0"
                    }} />
                )}
                <h3 style={{ ...styles.sectionTitle, textAlign: align }}>{displayTitle}</h3>
            </div>
        );
    };

    // --- SHARED SUB-COMPONENTS ---

    const MarketingExperience = ({ item, index, subItemRange, zoneId = 'right' }) => {
        if (!item) return null;
        // Updated Date Logic to capture Start - End
        const startDate = item.startDate || item.startYear || "";
        const endDate = item.isCurrent ? "Present" : (item.endDate || item.endYear || "");
        const dateStr = item.date || item.year || (startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate);

        const isLeft = zoneId.includes('left');
        const textAlign = isLeft ? 'right' : 'left';

        return (
            <div data-item-index={index} style={{ marginBottom: "calc(25px * var(--theme-paragraph-margin, 1))", textAlign }}>
                <div style={{ color: "var(--theme-color, #2d5a7b)", fontSize: "calc(13px * var(--theme-font-scale, 1))", fontWeight: "600", marginBottom: "4px" }}>
                    <SpellCheckText text={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', index, val, 'date')} />
                </div>
                <div style={{ fontWeight: "700", fontSize: "calc(15px * var(--theme-font-scale, 1))", color: "#1e293b", marginBottom: "2px" }}>
                    <RichTextSpellCheck html={item.title || item.role} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', index, val, 'title')} />
                </div>
                <div style={{ fontWeight: "600", fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#475569", marginBottom: "calc(8px * var(--theme-paragraph-margin, 1))" }}>
                    <RichTextSpellCheck html={item.company} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', index, val, 'company')} />
                    {item.location && (
                        <span>
                            {" • "}
                            <RichTextSpellCheck html={item.location} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('experience', index, val, 'location')} />
                        </span>
                    )}
                    {item.isRemote && <span> • Remote</span>}
                </div>
                {item.description && (
                    <div className="resume-rich-text" style={{ fontSize: "calc(13.5px * var(--theme-font-scale, 1))", lineHeight: "var(--theme-line-height, 1.6)" }}>
                        <SplittableRichText
                            html={item.description}
                            range={subItemRange}
                            isActive={isSpellCheckActive}
                            onIgnore={onSpellCheckIgnore}
                            onReplace={(val) => onSpellCheckReplace('experience', index, val, 'description')}
                        />
                    </div>
                )}
            </div>
        );
    };

    const MarketingEducation = ({ item, index, zoneId = 'left' }) => {
        if (!item) return null;
        const isLeft = zoneId.includes('left');
        const textAlign = isLeft ? 'right' : 'left';

        // Updated Date Logic
        const startDate = item.startDate || item.startYear || "";
        const endDate = item.endDate || item.endYear || "";
        const dateStr = item.date || item.year || (startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate);

        return (
            <div data-item-index={index} style={{ marginBottom: "calc(20px * var(--theme-paragraph-margin, 1))", textAlign }}>
                <div style={{ color: "#64748b", fontSize: "calc(12px * var(--theme-font-scale, 1))", marginBottom: "4px" }}>
                    <SpellCheckText text={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', index, val, 'year')} />
                </div>
                <div style={{ fontWeight: "700", fontSize: "calc(14px * var(--theme-font-scale, 1))", color: "#1e293b" }}>
                    <RichTextSpellCheck html={item.degree} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', index, val, 'degree')} />
                    {item.field && <span>, <RichTextSpellCheck html={item.field} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', index, val, 'field')} /></span>}
                </div>
                <div style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#475569" }}>
                    <RichTextSpellCheck html={item.institution || item.school} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', index, val, 'institution')} />
                    {item.city && <span>, <SpellCheckText text={item.city} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('education', index, val, 'city')} /></span>}
                </div>
                {item.grade && <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", fontStyle: "italic", marginTop: "2px" }}>GPA: {item.grade}</div>}
                {item.description && (
                    <div className="resume-rich-text" style={{
                        fontSize: "calc(13px * var(--theme-font-scale, 1))",
                        lineHeight: "var(--theme-line-height, 1.6)",
                        marginTop: "calc(8px * var(--theme-paragraph-margin, 1))",
                        textAlign
                    }}>
                        <SplittableRichText
                            html={item.description}
                            isActive={isSpellCheckActive}
                            onIgnore={onSpellCheckIgnore}
                            onReplace={(val) => onSpellCheckReplace('education', index, val, 'description')}
                        />
                    </div>
                )}
            </div>
        );
    };

    const MarketingSkills = ({ items, itemIndices, zoneId = 'left' }) => {
        const isLeft = zoneId.includes('left');
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: isLeft ? 'flex-end' : 'flex-start' }}>
                {items.map((skill, i) => {
                    const name = typeof skill === 'object' ? skill.name : skill;
                    const level = typeof skill === 'object' ? (skill.level || skill.rating || 4) : 4;
                    return (
                        <div key={i} data-item-index={itemIndices ? itemIndices[i] : i} style={{ ...styles.skillBarContainer, flexDirection: isLeft ? 'row' : 'row-reverse' }}>
                            <span style={styles.skillName}>
                                <RichTextSpellCheck
                                    html={name}
                                    isActive={isSpellCheckActive}
                                    onIgnore={onSpellCheckIgnore}
                                    onReplace={(val) => onSpellCheckReplace('skills', itemIndices ? itemIndices[i] : i, val, 'name')}
                                />
                            </span>
                            <div style={styles.skillBarBG}>
                                <div style={styles.skillBarFill(level)} />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };


    const customRenderers = {
        contact: ({ zoneId = 'right' }) => {
            const items = data.websites || [];
            const isLeft = zoneId?.includes('left');
            const contactLinks = [
                { icon: Linkedin, label: 'linkedin', value: personal?.linkedin, type: 'personal', field: 'linkedin' },
                { icon: Github, label: 'github', value: personal?.github, type: 'personal', field: 'github' },
                { icon: Globe, label: 'website', value: personal?.website, type: 'personal', field: 'website' },
                ...items
                    .map((link, idx) => ({ ...link, originalIdx: idx }))
                    .filter(link => link.addToHeader && link.url)
                    .map(link => ({ icon: Globe, label: link.label || 'website', value: link.url, type: 'websites', field: 'url', idx: link.originalIdx }))
            ];

            // Address Logic: Combine City, State, Country, Pincode
            const addressParts = [
                personal?.city,
                personal?.state,
                personal?.country,
                personal?.zipCode || personal?.pincode
            ].filter(Boolean);
            const fullAddress = addressParts.join(", ");

            const renderRow = (Icon, label, text, field, type = 'personal', idx = null, keyProp = null) => {
                if (!text) return null;
                return (
                    <div key={keyProp} style={{ ...styles.contactItem, justifyContent: isLeft ? 'flex-end' : 'flex-start' }}>
                        {!isLeft && <Icon size={14} color="var(--theme-color, #2d5a7b)" />}
                        <span style={{ ...styles.contactLabel, textAlign: isLeft ? 'right' : 'left' }}>{label}</span>
                        <ResumeLink href={text}>
                            <SpellCheckText
                                text={text}
                                isActive={isSpellCheckActive}
                                onIgnore={onSpellCheckIgnore}
                                onReplace={(val) => onSpellCheckReplace(type, type === 'personal' ? field : idx, val, type === 'websites' ? 'url' : null)}
                            />
                        </ResumeLink>
                        {isLeft && <Icon size={14} color="var(--theme-color, #2d5a7b)" />}
                    </div>
                );
            };

            return (
                <SectionWrapper sectionId="contact" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Contact">
                    <div>
                        <CustomSectionTitle title="Contact" showDot zoneId={zoneId} />
                        {renderRow(Phone, "phone", personal?.phone, 'phone', 'personal', null, 'phone')}
                        {renderRow(Mail, "email", personal?.email, 'email', 'personal', null, 'email')}
                        {renderRow(MapPin, "address", fullAddress, 'city', 'personal', null, 'address')}

                        {contactLinks.map((link, i) => renderRow(link.icon, link.label, link.value, link.field, link.type, link.idx, `link-${i}`))}
                    </div>
                </SectionWrapper>
            );
        },
        summary: ({ isContinued, subItemRanges, zoneId = 'left' }) => data.summary && (
            <SectionWrapper sectionId="summary" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Summary">
                <div>
                    <CustomSectionTitle title="Summary" showDot zoneId={zoneId} />
                    <div className="resume-rich-text" style={{
                        fontSize: "calc(13.5px * var(--theme-font-scale, 1))",
                        lineHeight: "var(--theme-line-height, 1.7)",
                        marginTop: "calc(10px * var(--theme-paragraph-margin, 1))",
                        textAlign: zoneId.includes('left') ? 'right' : 'left'
                    }}>
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
        skills: ({ itemIndices, isContinued, zoneId = 'left' }) => {
            const items = itemIndices ? itemIndices.map(idx => data.skills?.[idx]).filter(Boolean) : (data.skills || []);
            const hasDescription = data.skillsDescription && data.skillsDescription.trim();
            const isLeft = zoneId.includes('left');

            if (items.length > 0) {
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <div>
                            <CustomSectionTitle title="Relevant Skills" showDot zoneId={zoneId} />
                            <MarketingSkills items={items} itemIndices={itemIndices} zoneId={zoneId} />
                        </div>
                    </SectionWrapper>
                );
            }

            if (hasDescription) {
                return (
                    <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Skills">
                        <div>
                            <CustomSectionTitle title="Relevant Skills" showDot zoneId={zoneId} />
                            <div className="resume-rich-text" style={{
                                fontSize: "calc(13px * var(--theme-font-scale, 1))",
                                lineHeight: "var(--theme-line-height, 1.6)",
                                textAlign: isLeft ? 'right' : 'left'
                            }}>
                                <SplittableRichText
                                    html={data.skillsDescription}
                                    isActive={isSpellCheckActive}
                                    onIgnore={onSpellCheckIgnore}
                                    onReplace={(val) => onSpellCheckReplace && onSpellCheckReplace('skills', 'skillsDescription', val)}
                                />
                            </div>
                        </div>
                    </SectionWrapper>
                );
            }

            return null;
        },
        strengths: ({ itemIndices, zoneId = 'left' }) => {
            const items = itemIndices ? itemIndices.map(idx => data.strengths?.[idx]).filter(Boolean) : (data.strengths || []);
            if (items.length === 0) return null;
            const isLeft = zoneId.includes('left');
            return (
                <SectionWrapper sectionId="strengths" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Strengths">
                    <div>
                        <CustomSectionTitle title="Key Strengths" showDot zoneId={zoneId} />
                        <MarketingSkills items={items} itemIndices={itemIndices} zoneId={zoneId} />
                    </div>
                </SectionWrapper>
            );
        },
        additionalSkills: ({ itemIndices, zoneId = 'left' }) => {
            const items = itemIndices ? itemIndices.map(idx => data.additionalSkills?.[idx]).filter(Boolean) : (data.additionalSkills || []);
            if (items.length === 0) return null;
            const isLeft = zoneId.includes('left');
            return (
                <SectionWrapper sectionId="additionalSkills" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Skills">
                    <div>
                        <CustomSectionTitle title="Additional Skills" showDot zoneId={zoneId} />
                        <MarketingSkills items={items} itemIndices={itemIndices} zoneId={zoneId} />
                    </div>
                </SectionWrapper>
            );
        },
        education: ({ itemIndices, isContinued, zoneId = 'left' }) => {
            const items = (itemIndices ? itemIndices.map(idx => data.education?.[idx]) : (data.education || [])).filter(Boolean);
            if (items.length === 0) return null;
            const isLeft = zoneId.includes('left');
            return (
                <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
                    <div>
                        <CustomSectionTitle title="Education" showDot zoneId={zoneId} />
                        {items.map((edu, i) => <MarketingEducation key={i} item={edu} index={itemIndices ? itemIndices[i] : i} zoneId={zoneId} />)}
                    </div>
                </SectionWrapper>
            );
        },
        experience: ({ itemIndices, isContinued, subItemRanges, zoneId = 'right' }) => {
            const items = (itemIndices ? itemIndices.map(idx => data.experience?.[idx]) : (data.experience || [])).filter(Boolean);
            if (items.length === 0) return null;
            const isLeft = zoneId.includes('left');
            return (
                <SectionWrapper sectionId="experience" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Experience">
                    <div>
                        <CustomSectionTitle title="Professional Experience" showDot zoneId={zoneId} />
                        {items.map((exp, i) => (
                            <MarketingExperience
                                key={i}
                                item={exp}
                                index={itemIndices ? itemIndices[i] : i}
                                subItemRange={subItemRanges?.[itemIndices ? itemIndices[i] : i]}
                                zoneId={zoneId}
                            />
                        ))}
                    </div>
                </SectionWrapper>
            );
        },
        volunteering: ({ itemIndices, isContinued, subItemRanges, zoneId = 'right' }) => {
            const items = (itemIndices ? itemIndices.map(idx => data.volunteering?.[idx]) : (data.volunteering || [])).filter(Boolean);
            if (items.length === 0) return null;

            // Reuse MarketingExperience for volunteering as structure is similar (Role, Org, Date, Desc)
            return (
                <SectionWrapper sectionId="volunteering" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Volunteering">
                    <div>
                        <CustomSectionTitle title="Volunteering" showDot zoneId={zoneId} />
                        {items.map((vol, i) => (
                            <div key={i} data-item-index={itemIndices ? itemIndices[i] : i}>
                                <MarketingExperience
                                    item={{ ...vol, title: vol.role, company: vol.organization }}
                                    index={itemIndices ? itemIndices[i] : i}
                                    subItemRange={subItemRanges?.[itemIndices ? itemIndices[i] : i]}
                                    zoneId={zoneId}
                                />
                            </div>
                        ))}
                    </div>
                </SectionWrapper>
            );
        },
        references: ({ itemIndices, zoneId = 'right' }) => {
            const items = (itemIndices ? itemIndices.map(idx => data.references?.[idx]) : (data.references || [])).filter(Boolean);
            if (items.length === 0) return null;
            const isLeft = zoneId.includes('left');

            return (
                <SectionWrapper sectionId="references" onSectionClick={onSectionClick} isInteractive={isInteractive} label="References">
                    <div>
                        <CustomSectionTitle title="References" showDot zoneId={zoneId} />
                        {items.map((ref, i) => (
                            <div key={i} style={{ marginBottom: "15px" }}>
                                <div style={{ fontWeight: "700", fontSize: "calc(14px * var(--theme-font-scale, 1))" }}>{ref.name}</div>
                                <div style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#64748b" }}>{ref.company}</div>
                                <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "#94a3b8" }}>{ref.phone} {ref.email && `• ${ref.email}`}</div>
                            </div>
                        ))}
                    </div>
                </SectionWrapper>
            );
        },
        publications: ({ itemIndices, zoneId = 'right' }) => {
            const items = (itemIndices ? itemIndices.map(idx => data.publications?.[idx]) : (data.publications || [])).filter(Boolean);
            if (items.length === 0) return null;
            const isLeft = zoneId.includes('left');

            return (
                <SectionWrapper sectionId="publications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Publications">
                    <div>
                        <CustomSectionTitle title="Publications" showDot zoneId={zoneId} />
                        {items.map((pub, i) => (
                            <div key={i} style={{ marginBottom: "12px" }}>
                                <div style={{ fontWeight: "700", fontSize: "calc(14px * var(--theme-font-scale, 1))" }}>
                                    {pub.url ? <ResumeLink href={pub.url}>{pub.title}</ResumeLink> : pub.title}
                                </div>
                                <div style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#64748b" }}>
                                    {pub.publisher} {pub.date && `• ${pub.date}`}
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionWrapper>
            );
        },
        awards: ({ itemIndices, zoneId = 'right', subItemRanges }) => {
            // Handle both 'awards' and 'honors' if your data uses distinct keys, or just one
            const items = (itemIndices ? itemIndices.map(idx => data.awards?.[idx]) : (data.awards || [])).filter(Boolean);
            if (items.length === 0) return null;
            const isLeft = zoneId.includes('left');

            return (
                <SectionWrapper sectionId="awards" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Awards">
                    <div>
                        <CustomSectionTitle title="Awards" showDot zoneId={zoneId} />
                        <ul className="resume-rich-text" style={{
                            margin: 0,
                            paddingLeft: isLeft ? 0 : "20px",
                            paddingRight: isLeft ? "20px" : 0,
                            listStyleType: "none"
                        }}>
                            {items.map((award, i) => (
                                <AchievementItem
                                    key={i}
                                    item={award}
                                    index={itemIndices ? itemIndices[i] : i}
                                    isSpellCheckActive={isSpellCheckActive}
                                    onIgnore={onSpellCheckIgnore}
                                    onSpellCheckReplace={(field, val) => onSpellCheckReplace('awards', itemIndices ? itemIndices[i] : i, val, field)}
                                />
                            ))}
                        </ul>
                    </div>
                </SectionWrapper>
            );
        },
        websites: ({ itemIndices, zoneId = 'right' }) => {
            const items = itemIndices ? itemIndices.map(idx => data.websites?.[idx]) : data.websites;
            const isLeft = zoneId?.includes('left');
            const portfolioLinks = (items || [])
                .map((link, idx) => ({ ...link, originalIdx: itemIndices ? itemIndices[idx] : idx }))
                .filter(link => !link.addToHeader && link.url);

            if (portfolioLinks.length === 0) return null;

            const renderRow = (Icon, label, text, field, type = 'personal', idx = null) => {
                if (!text) return null;
                return (
                    <div style={{ ...styles.contactItem, justifyContent: isLeft ? 'flex-end' : 'flex-start' }}>
                        {!isLeft && <Icon size={14} color="var(--theme-color, #2d5a7b)" />}
                        <span style={{ ...styles.contactLabel, textAlign: isLeft ? 'right' : 'left' }}>{label}</span>
                        <ResumeLink href={text}>
                            <SpellCheckText
                                text={text}
                                isActive={isSpellCheckActive}
                                onIgnore={onSpellCheckIgnore}
                                onReplace={(val) => onSpellCheckReplace(type, type === 'personal' ? field : idx, val, type === 'websites' ? 'url' : null)}
                            />
                        </ResumeLink>
                        {isLeft && <Icon size={14} color="var(--theme-color, #2d5a7b)" />}
                    </div>
                );
            };

            return (
                <SectionWrapper sectionId="websites" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Websites & Portfolios">
                    <div>
                        <CustomSectionTitle title="Websites & Portfolios" showDot zoneId={zoneId} />
                        {portfolioLinks.map((site, i) => renderRow(Globe, site.label || "portfolio", site.url, 'url', 'websites', site.originalIdx, `portfolio-${i}`))}
                    </div>
                </SectionWrapper>
            );
        },
        projects: ({ itemIndices, isContinued, subItemRanges, zoneId = 'right' }) => {
            const items = (itemIndices ? itemIndices.map(idx => data.projects?.[idx]) : (data.projects || [])).filter(Boolean);
            if (items.length === 0) return null;
            const isLeft = zoneId.includes('left');
            const textAlign = isLeft ? 'right' : 'left';

            return (
                <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
                    <div style={{ marginBottom: "calc(35px * var(--theme-section-margin, 1))", textAlign }}>
                        <CustomSectionTitle title="Projects" showDot zoneId={zoneId} />
                        {items.map((proj, i) => {
                            if (!proj) return null;
                            const originalIdx = itemIndices ? itemIndices[i] : i;
                            const dateStr = proj.year || (proj.startYear && `${proj.startYear} - ${proj.isCurrent ? 'Present' : (proj.endYear || 'Present')}`);

                            return (
                                <div key={i} data-item-index={originalIdx} style={{ marginBottom: "calc(25px * var(--theme-paragraph-margin, 1))" }}>
                                    <div style={{ display: "flex", flexDirection: isLeft ? "row-reverse" : "row", justifyContent: "space-between", alignItems: "baseline" }}>
                                        <div style={{ fontWeight: "700", fontSize: "calc(16px * var(--theme-font-scale, 1))" }}>
                                            <RichTextSpellCheck html={proj.title} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'title')} />
                                        </div>
                                        {dateStr && (
                                            <div style={{ fontSize: "calc(12px * var(--theme-font-scale, 1))", color: "var(--theme-color, #2d5a7b)", fontWeight: "600" }}>
                                                <SpellCheckText text={dateStr} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, proj.year ? 'year' : 'date')} />
                                            </div>
                                        )}
                                    </div>

                                    {proj.link && (
                                        <div style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#64748b", margin: "4px 0" }}>
                                            <ResumeLink href={proj.link}>
                                                <RichTextSpellCheck html={proj.link} isActive={isSpellCheckActive} onIgnore={onSpellCheckIgnore} onReplace={(val) => onSpellCheckReplace('projects', originalIdx, val, 'link')} />
                                            </ResumeLink>
                                        </div>
                                    )}

                                    {/* Technologies */}
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: isLeft ? "flex-end" : "flex-start" }}>
                                            {proj.technologies.map((tech, tIdx) => (
                                                <div key={tIdx} style={{ fontSize: "calc(10px * var(--theme-font-scale, 1))", padding: "1px 10px", border: "1px solid var(--theme-color, #2d5a7b)", borderRadius: "10px", color: "var(--theme-color, #2d5a7b)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
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

                                    <div className="resume-rich-text" style={{
                                        fontSize: "calc(13.5px * var(--theme-font-scale, 1))",
                                        lineHeight: "1.6",
                                        marginTop: "8px",
                                        color: "#475569"
                                    }}>
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
        keyAchievements: ({ itemIndices, subItemRanges, zoneId = 'right' }) => {
            const achievements = data.keyAchievements || [];
            const rawEntries = (itemIndices || achievements.map((_, i) => i)).map(idx => ({
                item: achievements[idx],
                originalIndex: idx
            })).filter(e => e.item);

            const entries = rawEntries.filter(e => {
                const name = typeof e.item === 'object' ? e.item.name : e.item;
                const desc = typeof e.item === 'object' ? e.item.description : null;
                return (name && name.trim() !== "" && name !== "<p><br></p>") || (desc && desc.trim() !== "" && desc !== "<p><br></p>");
            });

            if (entries.length === 0) return null;
            const isLeft = zoneId.includes('left');

            return (
                <SectionWrapper sectionId="keyAchievements" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Achievements">
                    <div>
                        <CustomSectionTitle title="Key Achievements" showDot zoneId={zoneId} />
                        <ul className="resume-rich-text" style={{
                            margin: 0,
                            paddingLeft: isLeft ? 0 : "20px",
                            paddingRight: isLeft ? "20px" : 0,
                            listStyleType: "none"
                        }}>
                            {entries.map((entry, index) => {
                                return (
                                    <AchievementItem
                                        key={entry.originalIndex}
                                        item={entry.item}
                                        index={entry.originalIndex}
                                        isSpellCheckActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onSpellCheckReplace={(field, val) => onSpellCheckReplace('keyAchievements', entry.originalIndex, val, field)}
                                        subItemRange={subItemRanges?.[entry.originalIndex]}
                                    />
                                );
                            })}
                        </ul>
                    </div>
                </SectionWrapper>
            );
        },
        accomplishments: ({ itemIndices, subItemRanges, zoneId = 'right' }) => {
            const accomplishments = Array.isArray(data.accomplishments) ? data.accomplishments : (data.accomplishments ? [data.accomplishments] : []);
            const rawEntries = (itemIndices || accomplishments.map((_, i) => i)).map(idx => ({
                item: accomplishments[idx],
                originalIndex: idx
            })).filter(e => e.item);

            const entries = rawEntries.filter(e => {
                const name = typeof e.item === 'object' ? e.item.name : e.item;
                const desc = typeof e.item === 'object' ? e.item.description : null;
                return (name && name.trim() !== "" && name !== "<p><br></p>") || (desc && desc.trim() !== "" && desc !== "<p><br></p>");
            });

            if (entries.length === 0) return null;
            const isLeft = zoneId.includes('left');

            return (
                <SectionWrapper sectionId="accomplishments" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Accomplishments">
                    <div>
                        <CustomSectionTitle title="Accomplishments" showDot zoneId={zoneId} />
                        <ul className="resume-rich-text" style={{
                            margin: 0,
                            paddingLeft: isLeft ? 0 : "20px",
                            paddingRight: isLeft ? "20px" : 0,
                            listStyleType: "none"
                        }}>
                            {entries.map((entry, index) => {
                                return (
                                    <AccomplishmentItem
                                        key={entry.originalIndex}
                                        item={entry.item}
                                        index={entry.originalIndex}
                                        isSpellCheckActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onSpellCheckReplace={(field, val) => onSpellCheckReplace('accomplishments', entry.originalIndex, val, field)}
                                        subItemRange={subItemRanges?.[entry.originalIndex]}
                                    />
                                );
                            })}
                        </ul>
                    </div>
                </SectionWrapper>
            );
        },
        affiliations: ({ itemIndices, subItemRanges, zoneId = 'right' }) => {
            const affiliations = Array.isArray(data.affiliations) ? data.affiliations : (data.affiliations ? [data.affiliations] : []);
            const rawEntries = (itemIndices || affiliations.map((_, i) => i)).map(idx => ({
                item: affiliations[idx],
                originalIndex: idx
            })).filter(e => e.item);

            const entries = rawEntries.filter(e => {
                const name = typeof e.item === 'object' ? e.item.name : e.item;
                const desc = typeof e.item === 'object' ? e.item.description : null;
                return (name && name.trim() !== "" && name !== "<p><br></p>") || (desc && desc.trim() !== "" && desc !== "<p><br></p>");
            });

            if (entries.length === 0) return null;
            const isLeft = zoneId.includes('left');

            return (
                <SectionWrapper sectionId="affiliations" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Affiliations">
                    <div>
                        <CustomSectionTitle title="Affiliations" showDot zoneId={zoneId} />
                        <ul className="resume-rich-text" style={{
                            margin: 0,
                            paddingLeft: isLeft ? 0 : "20px",
                            paddingRight: isLeft ? "20px" : 0,
                            listStyleType: "none"
                        }}>
                            {entries.map((entry, index) => {
                                return (
                                    <AffiliationItem
                                        key={entry.originalIndex}
                                        item={entry.item}
                                        index={entry.originalIndex}
                                        isSpellCheckActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onSpellCheckReplace={(field, val) => onSpellCheckReplace('affiliations', entry.originalIndex, val, field)}
                                        subItemRange={subItemRanges?.[entry.originalIndex]}
                                    />
                                );
                            })}
                        </ul>
                    </div>
                </SectionWrapper>
            );
        },
        languages: ({ itemIndices, isContinued, zoneId = 'left' }) => {
            const items = itemIndices ? itemIndices.map(idx => (data.languages || [])[idx]) : (data.languages || []);
            if (items.length === 0) return null;
            return (
                <SectionWrapper sectionId="languages" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Languages">
                    <div>
                        <CustomSectionTitle title="Languages" showDot zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", alignItems: zoneId.includes('left') ? 'flex-end' : 'flex-start' }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <LanguageItem
                                        key={i}
                                        item={item}
                                        index={originalIdx}
                                        isSpellCheckActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onSpellCheckReplace={(field, val) => onSpellCheckReplace('languages', originalIdx, val, field)}
                                        variant="compact"
                                    />
                                );
                            })}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        certifications: ({ itemIndices, isContinued, zoneId = 'left', subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => (data.certifications || [])[idx]) : (data.certifications || []);
            if (items.length === 0) return null;
            const isLeft = zoneId.includes('left');
            return (
                <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
                    <div>
                        <CustomSectionTitle title="Certifications" showDot zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", alignItems: isLeft ? 'flex-end' : 'flex-start' }}>
                            {items.map((item, i) => {
                                const originalIdx = itemIndices ? itemIndices[i] : i;
                                return (
                                    <CertificationItem
                                        key={i}
                                        item={item}
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
                    </div>
                </SectionWrapper>
            );
        },
        software: ({ itemIndices, isContinued, zoneId = 'left', subItemRanges: renderSubItemRanges }) => {
            const items = itemIndices ? itemIndices.map(idx => (data.software || [])[idx]) : (data.software || []);
            if (items.length === 0) return null;
            const isLeft = zoneId.includes('left');
            return (
                <SectionWrapper sectionId="software" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Software">
                    <div>
                        <CustomSectionTitle title="Software" showDot zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", alignItems: isLeft ? 'flex-end' : 'flex-start' }}>
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
                    </div>
                </SectionWrapper>
            );
        },
        interests: ({ itemIndices, isContinued, zoneId = 'left' }) => {
            const items = itemIndices ? itemIndices.map(idx => (data.interests || [])[idx]) : (data.interests || []);
            if (items.length === 0) return null;
            const isLeft = zoneId.includes('left');
            return (
                <SectionWrapper sectionId="interests" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Hobbies">
                    <div>
                        <CustomSectionTitle title="Hobbies" showDot zoneId={zoneId} />
                        <div style={{ display: "flex", flexDirection: "column", alignItems: isLeft ? 'flex-end' : 'flex-start' }}>
                            {items.map((item, i) => (
                                <div key={i} data-item-index={itemIndices ? itemIndices[i] : i} style={{ ...styles.skillBarContainer, justifyContent: isLeft ? 'flex-end' : 'flex-start' }}>
                                    <span style={styles.skillName}>
                                        <RichTextSpellCheck
                                            html={typeof item === 'object' ? item.name : item}
                                            isActive={isSpellCheckActive}
                                            onIgnore={onSpellCheckIgnore}
                                            onReplace={(val) => onSpellCheckReplace('interests', itemIndices ? itemIndices[i] : i, val, 'name')}
                                        />
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            );
        },
        personalDetails: ({ zoneId = 'left' }) => {
            const details = [
                { label: "Date of Birth", value: personal?.dob, field: 'dob' },
                { label: "Place of Birth", value: personal?.placeOfBirth, field: 'placeOfBirth' },
                { label: "Nationality", value: personal?.nationality, field: 'nationality' },
                { label: "Gender", value: personal?.gender, field: 'gender' },
                { label: "Marital Status", value: personal?.maritalStatus, field: 'maritalStatus' },
                { label: "Visa Status", value: personal?.visaStatus, field: 'visaStatus' },
                { label: "Religion", value: personal?.religion, field: 'religion' },
                { label: "Passport", value: personal?.passport, field: 'passport' },
                { label: "Driving License", value: personal?.drivingLicense, field: 'drivingLicense' },
                { label: "Other", value: personal?.otherPersonal, field: 'otherPersonal' },
            ].filter(d => d.value);

            if (details.length === 0) return null;
            const isLeft = zoneId.includes('left');

            return (
                <SectionWrapper sectionId="personalDetails" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Personal Details">
                    <div>
                        <CustomSectionTitle title="Personal Details" showDot zoneId={zoneId} />
                        {details.map((detail, i) => (
                            <div key={i} style={{ ...styles.contactItem, justifyContent: isLeft ? 'flex-end' : 'flex-start', marginBottom: "8px" }}>
                                {!isLeft && <span style={{ ...styles.contactLabel, width: "auto", marginRight: "10px" }}>{detail.label}:</span>}
                                <span style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#475569" }}>
                                    <SpellCheckText
                                        text={detail.value}
                                        isActive={isSpellCheckActive}
                                        onIgnore={onSpellCheckIgnore}
                                        onReplace={(val) => onSpellCheckReplace('personal', detail.field, val)}
                                    />
                                </span>
                                {isLeft && <span style={{ ...styles.contactLabel, width: "auto", marginLeft: "10px" }}>:{detail.label}</span>}
                            </div>
                        ))}
                    </div>
                </SectionWrapper>
            );
        },
        additionalInfo: ({ isContinued, subItemRanges: renderSubItemRanges, zoneId = 'right' }) => {
            const html = data.additionalInfo || "";
            if (!html || html.trim() === "" || html === "<p><br></p>") return null;
            const isLeft = zoneId.includes('left');
            const title = "Additional Information";
            return (
                <SectionWrapper sectionId="additionalInfo" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <div>
                        <CustomSectionTitle title={isContinued ? `${title} (Cont.)` : title} showDot zoneId={zoneId} />
                        <div className="resume-rich-text" style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#475569", lineHeight: "1.7", textAlign: isLeft ? 'right' : 'left' }}>
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
        custom: ({ isContinued, subItemRanges: renderSubItemRanges, zoneId = 'right' }) => {
            if (!data.customSection?.isVisible || !data.customSection?.content) return null;
            const content = data.customSection.content;
            if (!content || content.trim() === "" || content === "<p><br></p>") return null;

            const isLeft = zoneId.includes('left');
            const title = data.customSection.title || "Custom Section";
            return (
                <SectionWrapper sectionId="custom" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
                    <div>
                        <CustomSectionTitle title={isContinued ? `${title} (Cont.)` : title} showDot zoneId={zoneId} />
                        <div className="resume-rich-text" style={{ fontSize: "calc(13px * var(--theme-font-scale, 1))", color: "#475569", lineHeight: "1.7", textAlign: isLeft ? 'right' : 'left' }}>
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
                            <div key={sid} style={{ paddingBottom: "1px" }}>
                                <SectionRenderer sectionId={sid} data={data} customRenderers={customRenderers} zoneId="left" />
                            </div>
                        ))}
                    </div>
                    <div data-column-id="right" style={styles.rightColumn}>
                        {activeRightSections.map(sid => (
                            <div key={sid} style={{ paddingBottom: "1px" }}>
                                <SectionRenderer sectionId={sid} data={data} customRenderers={customRenderers} zoneId="right" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="creative-marketing-root" >
            <Measurer />
            <DndContext {...dndContextProps}>
                <SortableContext items={[...activeLeftSections, ...activeRightSections]} strategy={verticalListSortingStrategy}>
                    {showPageBreaks && pages ? (
                        pages.map((page, i) => (
                            <div key={i} style={styles.page}>
                                {i === 0 && <Header />}
                                <div style={{ ...styles.layoutBody, flex: 1, minHeight: 0 }}>
                                    <div style={styles.leftColumn}>

                                        {renderZone(`left-p${i}`, page.left, { display: "flex", flexDirection: "column", flex: 1, gap: "calc(35px * var(--theme-section-margin, 1))" })}
                                    </div>
                                    <div style={styles.rightColumn}>
                                        {renderZone(`right-p${i}`, page.right, { display: "flex", flexDirection: "column", flex: 1, gap: "calc(35px * var(--theme-section-margin, 1))" })}
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

                                    {renderZone('left', activeLeftSections, { display: "flex", flexDirection: "column", flex: 1, gap: "calc(35px * var(--theme-section-margin, 1))" })}
                                </div>
                                <div style={styles.rightColumn}>

                                    {renderZone('right', activeRightSections, { display: "flex", flexDirection: "column", flex: 1, gap: "calc(35px * var(--theme-section-margin, 1))" })}
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

export default CreativeMarketing;
