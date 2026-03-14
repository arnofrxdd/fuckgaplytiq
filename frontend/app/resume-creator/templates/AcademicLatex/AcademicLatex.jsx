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
 * AcademicLatex Template
 * A clean, LaTeX-inspired academic resume with:
 *  - Left-aligned header with photo/logo, name, degree info, and right-aligned contact
 *  - Small-caps section titles with a full-width rule
 *  - Table-style Education section
 *  - Dash-indented descriptions for Experience & Projects
 *  - Inline Technical Skills
 *  - Full support for pagination, DnD reorder, spell-check, all CSS theme vars
 */
const AcademicLatex = ({
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

  // ─── LAYOUT ────────────────────────────────────────────────────────────────
  const templateId = "academic-latex";
  const initialLayout = getSavedLayout(data, templateId, {
    main: [
      "education",
      "experience",
      "projects",
      "skills",
      "additionalSkills",
      "strengths",
      "software",
      "keyAchievements",
      "accomplishments",
      "certifications",
      "languages",
      "interests",
      "affiliations",
      "personalDetails",
      "additionalInfo",
      "summary",
      "custom",
    ],
  });
  const completeLayout = getCompleteLayout(data, initialLayout, "main");
  const activeSections = completeLayout.main || [];

  // ─── DnD ───────────────────────────────────────────────────────────────────
  const { dndContextProps, activeId } = useResumeDragAndDrop({
    data,
    onReorder,
    scale,
    containers: { main: activeSections },
  });

  // ─── PAGINATION ────────────────────────────────────────────────────────────
  const pages = useAutoPagination({
    columns: { main: activeSections },
    data,
    enabled: showPageBreaks,
    containerRef,
    scale,
  });

  // ─── STYLE TOKENS ──────────────────────────────────────────────────────────
  const serif = "var(--theme-font, 'EB Garamond', 'Georgia', serif)";
  const ink = "var(--theme-color, #111111)";
  const lightText = "#444444";
  const ruleColor = "#555555";

  const S = {
    page: {
      width: "210mm",
      height: "297mm",
      background: "white",
      padding:
        "var(--theme-page-margin, 36px) var(--theme-page-margin, 42px) var(--theme-page-margin, 36px) var(--theme-page-margin, 42px)",
      boxSizing: "border-box",
      position: "relative",
      margin: "0 auto 30px auto",
      color: ink,
      fontFamily: serif,
      letterSpacing: "var(--theme-letter-spacing, 0px)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    // Header ----------------------------------------------------------------
    headerGrid: {
      display: "grid",
      gridTemplateColumns: "auto 1fr auto",
      alignItems: "flex-start",
      gap: "0 14px",
      marginBottom: "calc(18px * var(--theme-section-margin, 1))",
      paddingBottom: "10px",
    },
    photo: {
      width: "68px",
      height: "68px",
      borderRadius: "50%",
      objectFit: "cover",
      border: `1.5px solid ${ink}`,
    },
    photoPlaceholder: {
      width: "68px",
      height: "68px",
      borderRadius: "50%",
      border: `1.5px solid ${ink}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "9px",
      color: lightText,
    },
    nameBlock: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
    name: {
      fontSize: "calc(22px * var(--theme-font-scale, 1))",
      fontWeight: "700",
      color: ink,
      lineHeight: "1.15",
      marginBottom: "3px",
      letterSpacing: "0.5px",
    },
    profession: {
      fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
      fontWeight: "400",
      fontStyle: "italic",
      color: ink,
      lineHeight: "1.4",
    },
    subInfo: {
      fontSize: "calc(12px * var(--theme-font-scale, 1))",
      color: ink,
      lineHeight: "1.5",
    },
    contactBlock: {
      textAlign: "right",
      fontSize: "calc(11.5px * var(--theme-font-scale, 1))",
      color: ink,
      lineHeight: "1.6",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
    contactLine: {
      display: "block",
    },
    // Section header --------------------------------------------------------
    sectionTitleWrap: {
      marginBottom: "calc(8px * var(--theme-paragraph-margin, 1))",
    },
    sectionTitle: {
      fontSize: "calc(13.5px * var(--theme-font-scale, 1))",
      fontWeight: "700",
      fontVariant: "small-caps",
      textTransform: "uppercase",
      letterSpacing: "1.5px",
      color: ink,
      display: "block",
      marginBottom: "3px",
    },
    rule: {
      width: "100%",
      height: "1px",
      backgroundColor: ruleColor,
      border: "none",
      margin: "0",
    },
    // Table (Education) -----------------------------------------------------
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
      lineHeight: "var(--theme-line-height, 1.5)",
    },
    th: {
      border: `1px solid ${ink}`,
      padding: "4px 10px",
      fontWeight: "700",
      textAlign: "center",
      backgroundColor: "transparent",
    },
    td: {
      border: `1px solid ${ink}`,
      padding: "4px 10px",
      textAlign: "center",
      color: lightText,
    },
    tdLeft: {
      border: `1px solid ${ink}`,
      padding: "4px 10px",
      textAlign: "left",
      color: lightText,
    },
    // Experience / Projects row ---------------------------------------------
    expHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: "1px",
    },
    expCompany: {
      fontWeight: "700",
      fontSize: "calc(13px * var(--theme-font-scale, 1))",
      color: ink,
      display: "flex",
      alignItems: "baseline",
      gap: "6px",
    },
    expRole: {
      fontStyle: "italic",
      fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
      color: ink,
    },
    expDate: {
      fontStyle: "italic",
      fontSize: "calc(12px * var(--theme-font-scale, 1))",
      color: ink,
      whiteSpace: "nowrap",
      textAlign: "right",
    },
    expLocation: {
      fontSize: "calc(12px * var(--theme-font-scale, 1))",
      fontStyle: "italic",
      color: lightText,
      textAlign: "right",
    },
    descIndent: {
      marginLeft: "14px",
      fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
      color: lightText,
      lineHeight: "var(--theme-line-height, 1.55)",
    },
    // Skills inline ---------------------------------------------------------
    skillLine: {
      fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
      color: ink,
      lineHeight: "var(--theme-line-height, 1.6)",
      marginBottom: "calc(4px * var(--theme-paragraph-margin, 1))",
      display: "flex",
      flexWrap: "wrap",
    },
    skillLabel: {
      fontWeight: "700",
      marginRight: "6px",
      whiteSpace: "nowrap",
    },
    // Bullet lists ----------------------------------------------------------
    bulletWrap: {
      display: "flex",
      alignItems: "flex-start",
      fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
      marginBottom: "calc(4px * var(--theme-paragraph-margin, 1))",
      lineHeight: "var(--theme-line-height, 1.55)",
      color: ink,
    },
    bullet: {
      marginRight: "8px",
      flexShrink: 0,
      color: ink,
    },
    // Positions of Responsibility / Miscellaneous ---------------------------
    posRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
      marginBottom: "calc(3px * var(--theme-paragraph-margin, 1))",
    },
    posLeft: {
      display: "flex",
      alignItems: "baseline",
      gap: "0",
    },
    posDate: {
      fontStyle: "italic",
      color: ink,
      fontSize: "calc(12px * var(--theme-font-scale, 1))",
    },
    itemSpacing: {
      marginBottom: "calc(12px * var(--theme-paragraph-margin, 1))",
    },
    richText: {
      fontSize: "calc(12.5px * var(--theme-font-scale, 1))",
      lineHeight: "var(--theme-line-height, 1.55)",
      color: lightText,
    },
  };

  // ─── SECTION HEADER COMPONENT ──────────────────────────────────────────────
  const SectionHeader = ({ title }) => {
    const { isContinued } = useSectionContext();
    return (
      <div style={S.sectionTitleWrap}>
        <span style={S.sectionTitle}>{isContinued ? `${title} (cont.)` : title}</span>
        <hr style={S.rule} />
      </div>
    );
  };

  // ─── HEADER ────────────────────────────────────────────────────────────────
  const Header = () => {
    const locationStr = [personal?.city, personal?.state, personal?.zipCode, personal?.country]
      .filter(Boolean)
      .join(", ");

    return (
      <SectionWrapper
        sectionId="personal"
        onSectionClick={onSectionClick}
        isInteractive={isInteractive}
        label="Header"
      >
        <div style={S.headerGrid}>
          {/* Column 1: Photo or placeholder */}
          <div>
            {personal?.photo ? (
              <img src={personal.photo} alt="Profile" style={S.photo} />
            ) : (
              <div style={S.photoPlaceholder}>
                <span>LOGO</span>
              </div>
            )}
          </div>

          {/* Column 2: Name + degree info */}
          <div style={S.nameBlock}>
            <div style={S.name}>
              <SpellCheckText
                text={personal?.name || "First Name Last Name"}
                isActive={isSpellCheckActive}
                onIgnore={onSpellCheckIgnore}
                onReplace={(v) => onSpellCheckReplace("personal", "name", v)}
              />
            </div>
            {personal?.profession && (
              <div style={S.profession}>
                <SpellCheckText
                  text={personal.profession}
                  isActive={isSpellCheckActive}
                  onIgnore={onSpellCheckIgnore}
                  onReplace={(v) => onSpellCheckReplace("personal", "profession", v)}
                />
              </div>
            )}
            {/* Show first education entry as sub-info (institution + city) */}
            {data.education?.[0]?.institution && (
              <div style={S.subInfo}>
                <SpellCheckText
                  text={[data.education[0].institution, data.education[0].city]
                    .filter(Boolean)
                    .join(", ")}
                  isActive={isSpellCheckActive}
                  onIgnore={onSpellCheckIgnore}
                  onReplace={(v) => onSpellCheckReplace("education", 0, v, "institution")}
                />
              </div>
            )}
            {locationStr && (
              <div style={S.subInfo}>
                <SpellCheckText
                  text={locationStr}
                  isActive={isSpellCheckActive}
                  onIgnore={onSpellCheckIgnore}
                  onReplace={(v) => onSpellCheckReplace("personal", "city", v)}
                />
              </div>
            )}
          </div>

          {/* Column 3: Contact info — right aligned */}
          <div style={S.contactBlock}>
            {personal?.phone && (
              <ResumeLink href={personal.phone}>
                <span style={S.contactLine}>
                  <SpellCheckText
                    text={personal.phone}
                    isActive={isSpellCheckActive}
                    onIgnore={onSpellCheckIgnore}
                    onReplace={(v) => onSpellCheckReplace("personal", "phone", v)}
                  />
                </span>
              </ResumeLink>
            )}
            {personal?.email && (
              <ResumeLink href={personal.email}>
                <span style={S.contactLine}>
                  <SpellCheckText
                    text={personal.email}
                    isActive={isSpellCheckActive}
                    onIgnore={onSpellCheckIgnore}
                    onReplace={(v) => onSpellCheckReplace("personal", "email", v)}
                  />
                </span>
              </ResumeLink>
            )}
            {personal?.linkedin && (
              <ResumeLink href={personal.linkedin}>
                <span style={S.contactLine}>
                  <SpellCheckText
                    text={personal.linkedin}
                    isActive={isSpellCheckActive}
                    onIgnore={onSpellCheckIgnore}
                    onReplace={(v) => onSpellCheckReplace("personal", "linkedin", v)}
                  />
                </span>
              </ResumeLink>
            )}
            {personal?.github && (
              <ResumeLink href={personal.github}>
                <span style={S.contactLine}>
                  <SpellCheckText
                    text={personal.github}
                    isActive={isSpellCheckActive}
                    onIgnore={onSpellCheckIgnore}
                    onReplace={(v) => onSpellCheckReplace("personal", "github", v)}
                  />
                </span>
              </ResumeLink>
            )}
            {personal?.website && (
              <ResumeLink href={personal.website}>
                <span style={S.contactLine}>
                  <SpellCheckText
                    text={personal.website}
                    isActive={isSpellCheckActive}
                    onIgnore={onSpellCheckIgnore}
                    onReplace={(v) => onSpellCheckReplace("personal", "website", v)}
                  />
                </span>
              </ResumeLink>
            )}
            {data.websites?.map((site, i) => (
              <ResumeLink key={i} href={site.url}>
                <span style={S.contactLine}>
                  <SpellCheckText
                    text={site.label || site.url}
                    isActive={isSpellCheckActive}
                    onIgnore={onSpellCheckIgnore}
                    onReplace={(v) => onSpellCheckReplace("websites", i, v, "url")}
                  />
                </span>
              </ResumeLink>
            ))}
          </div>
        </div>
        {/* Full-width header rule */}
        <hr style={{ ...S.rule, marginBottom: "0" }} />
      </SectionWrapper>
    );
  };

  // ─── CUSTOM RENDERERS ──────────────────────────────────────────────────────
  const customRenderers = {

    // EDUCATION — table layout
    education: ({ itemIndices }) => {
      const items = itemIndices
        ? itemIndices.map((idx) => data.education?.[idx]).filter(Boolean)
        : data.education || [];
      if (!items.length) return null;
      return (
        <SectionWrapper sectionId="education" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Education">
          <SectionHeader title="Education" />
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.th, width: "14%" }}>Year</th>
                <th style={{ ...S.th, width: "28%" }}>Degree/Certificate</th>
                <th style={{ ...S.th, width: "38%" }}>Institute</th>
                <th style={{ ...S.th, width: "20%" }}>CGPA/Percentage</th>
              </tr>
            </thead>
            <tbody>
              {items.map((edu, i) => {
                const originalIdx = itemIndices ? itemIndices[i] : i;
                const yearStr =
                  edu.year ||
                  edu.date ||
                  (edu.endYear
                    ? edu.startYear
                      ? `${edu.startYear}-${edu.endYear}`
                      : edu.endYear
                    : "");
                const degreeStr = [edu.degree, edu.field]
                  .filter(Boolean)
                  .join(" ");
                const instStr = [edu.institution || edu.school, edu.city]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <tr key={i} data-item-index={originalIdx}>
                    <td style={S.td}>
                      <RichTextSpellCheck
                        html={yearStr}
                        isActive={isSpellCheckActive}
                        onIgnore={onSpellCheckIgnore}
                        onReplace={(v) => onSpellCheckReplace("education", originalIdx, v, "year")}
                      />
                    </td>
                    <td style={S.td}>
                      <RichTextSpellCheck
                        html={degreeStr}
                        isActive={isSpellCheckActive}
                        onIgnore={onSpellCheckIgnore}
                        onReplace={(v) => onSpellCheckReplace("education", originalIdx, v, "degree")}
                      />
                    </td>
                    <td style={S.td}>
                      <RichTextSpellCheck
                        html={instStr}
                        isActive={isSpellCheckActive}
                        onIgnore={onSpellCheckIgnore}
                        onReplace={(v) => onSpellCheckReplace("education", originalIdx, v, "institution")}
                      />
                    </td>
                    <td style={S.td}>
                      <RichTextSpellCheck
                        html={edu.grade || edu.gpa || ""}
                        isActive={isSpellCheckActive}
                        onIgnore={onSpellCheckIgnore}
                        onReplace={(v) => onSpellCheckReplace("education", originalIdx, v, "grade")}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </SectionWrapper>
      );
    },

    // EXPERIENCE
    experience: ({ itemIndices, subItemRanges }) => {
      const items = itemIndices
        ? itemIndices.map((idx) => data.experience?.[idx]).filter(Boolean)
        : data.experience || [];
      if (!items.length) return null;
      return (
        <SectionWrapper sectionId="experience" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Experience">
          <SectionHeader title="Experience" />
          {items.map((exp, i) => {
            const originalIdx = itemIndices ? itemIndices[i] : i;
            const dates =
              exp.year ||
              exp.date ||
              (exp.startYear
                ? `${exp.startYear} - ${exp.isCurrent ? "Present" : exp.endYear || ""}`
                : "");
            const locationStr = [exp.location, exp.isRemote ? "(Remote)" : null]
              .filter(Boolean)
              .join(" ");
            return (
              <div key={i} data-item-index={originalIdx} style={S.itemSpacing}>
                {/* Row: • Company   Role   Date / Location */}
                <div style={S.expHeader}>
                  <div style={S.expCompany}>
                    <span style={{ marginRight: "6px", color: ink }}>•</span>
                    <RichTextSpellCheck
                      html={exp.company || ""}
                      isActive={isSpellCheckActive}
                      onIgnore={onSpellCheckIgnore}
                      onReplace={(v) => onSpellCheckReplace("experience", originalIdx, v, "company")}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={S.expDate}>
                      <RichTextSpellCheck
                        html={dates}
                        isActive={isSpellCheckActive}
                        onIgnore={onSpellCheckIgnore}
                        onReplace={(v) => onSpellCheckReplace("experience", originalIdx, v, "year")}
                      />
                    </span>
                    {locationStr && (
                      <span style={S.expLocation}>
                        {locationStr}
                      </span>
                    )}
                  </div>
                </div>
                {/* Role / title italic */}
                {(exp.title || exp.role) && (
                  <div style={{ ...S.expRole, marginLeft: "18px", marginBottom: "3px" }}>
                    <RichTextSpellCheck
                      html={exp.title || exp.role || ""}
                      isActive={isSpellCheckActive}
                      onIgnore={onSpellCheckIgnore}
                      onReplace={(v) => onSpellCheckReplace("experience", originalIdx, v, "title")}
                    />
                  </div>
                )}
                {/* Description with dash-style bullets */}
                {exp.description && (
                  <div className="resume-rich-text" style={{ ...S.descIndent }}>
                    <SplittableRichText
                      html={exp.description}
                      range={subItemRanges?.[originalIdx]}
                      isActive={isSpellCheckActive}
                      onIgnore={onSpellCheckIgnore}
                      onReplace={(v) => onSpellCheckReplace("experience", originalIdx, v, "description")}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </SectionWrapper>
      );
    },

    // PROJECTS
    projects: ({ itemIndices, subItemRanges }) => {
      const items = itemIndices
        ? itemIndices.map((idx) => data.projects?.[idx]).filter(Boolean)
        : data.projects || [];
      if (!items.length) return null;
      return (
        <SectionWrapper sectionId="projects" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Projects">
          <SectionHeader title="Projects" />
          {items.map((proj, i) => {
            const originalIdx = itemIndices ? itemIndices[i] : i;
            const dates =
              proj.year ||
              (proj.startYear &&
                `${proj.startYear} - ${proj.isCurrent ? "Present" : proj.endYear || ""}`);
            return (
              <div key={i} data-item-index={originalIdx} style={S.itemSpacing}>
                <div style={S.expHeader}>
                  <div style={S.expCompany}>
                    <span style={{ marginRight: "6px" }}>•</span>
                    <RichTextSpellCheck
                      html={proj.title || ""}
                      isActive={isSpellCheckActive}
                      onIgnore={onSpellCheckIgnore}
                      onReplace={(v) => onSpellCheckReplace("projects", originalIdx, v, "title")}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={S.expDate}>
                      <RichTextSpellCheck
                        html={dates || ""}
                        isActive={isSpellCheckActive}
                        onIgnore={onSpellCheckIgnore}
                        onReplace={(v) => onSpellCheckReplace("projects", originalIdx, v, "year")}
                      />
                    </span>
                    {proj.link && (
                      <span style={{ ...S.expLocation }}>
                        <ResumeLink href={proj.link}>
                          <RichTextSpellCheck
                            html={proj.link}
                            isActive={isSpellCheckActive}
                            onIgnore={onSpellCheckIgnore}
                            onReplace={(v) => onSpellCheckReplace("projects", originalIdx, v, "link")}
                          />
                        </ResumeLink>
                      </span>
                    )}
                  </div>
                </div>
                {/* Course / faculty as italic sub-line */}
                {(proj.subtitle || proj.course || proj.faculty) && (
                  <div style={{ ...S.expRole, marginLeft: "18px", marginBottom: "3px" }}>
                    <SpellCheckText
                      text={proj.subtitle || proj.course || proj.faculty || ""}
                      isActive={isSpellCheckActive}
                      onIgnore={onSpellCheckIgnore}
                      onReplace={(v) => onSpellCheckReplace("projects", originalIdx, v, "subtitle")}
                    />
                  </div>
                )}
                {proj.technologies && proj.technologies.length > 0 && (
                  <div style={{ ...S.expRole, marginLeft: "18px", marginBottom: "2px", fontStyle: "normal", fontSize: "calc(12px * var(--theme-font-scale, 1))", color: lightText }}>
                    <strong style={{ color: ink }}>Tech: </strong>
                    {proj.technologies.join(" · ")}
                  </div>
                )}
                {proj.description && (
                  <div className="resume-rich-text" style={S.descIndent}>
                    <SplittableRichText
                      html={proj.description}
                      range={subItemRanges?.[originalIdx]}
                      isActive={isSpellCheckActive}
                      onIgnore={onSpellCheckIgnore}
                      onReplace={(v) => onSpellCheckReplace("projects", originalIdx, v, "description")}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </SectionWrapper>
      );
    },

    // SKILLS — inline label: value style (Technical Skills)
    skills: ({ itemIndices }) => {
      const items = itemIndices
        ? itemIndices.map((idx) => data.skills?.[idx]).filter(Boolean)
        : data.skills || [];
      if (!items.length) return null;

      // Group by category if available, else show as bullet list
      const grouped = {};
      items.forEach((s, i) => {
        const category = (typeof s === "object" && s.category) ? s.category : "Skills";
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push({ item: s, originalIndex: itemIndices ? itemIndices[i] : i });
      });

      const categories = Object.keys(grouped);
      const isGrouped = categories.length > 1 || categories[0] !== "Skills";

      return (
        <SectionWrapper sectionId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Technical Skills">
          <SectionHeader title="Technical Skills" />
          {isGrouped ? (
            categories.map((cat) => (
              <div key={cat} style={S.skillLine}>
                <span style={S.skillLabel}>{cat}:</span>
                <span style={{ color: lightText }}>
                  {grouped[cat].map((e, ci) => (
                    <React.Fragment key={ci}>
                      <RichTextSpellCheck
                        html={typeof e.item === "object" ? e.item.name : e.item}
                        isActive={isSpellCheckActive}
                        onIgnore={onSpellCheckIgnore}
                        onReplace={(v) => onSpellCheckReplace("skills", e.originalIndex, v, "name")}
                      />
                      {ci < grouped[cat].length - 1 && ", "}
                    </React.Fragment>
                  ))}
                </span>
              </div>
            ))
          ) : (
            items.map((skill, i) => {
              const originalIndex = itemIndices ? itemIndices[i] : i;
              return (
                <div key={i} data-item-index={originalIndex} style={S.bulletWrap}>
                  <span style={S.bullet}>•</span>
                  <RichTextSpellCheck
                    html={typeof skill === "object" ? skill.name : skill}
                    isActive={isSpellCheckActive}
                    onIgnore={onSpellCheckIgnore}
                    onReplace={(v) => onSpellCheckReplace("skills", originalIndex, v, "name")}
                  />
                </div>
              );
            })
          )}
        </SectionWrapper>
      );
    },

    // ADDITIONAL SKILLS
    additionalSkills: ({ itemIndices }) => {
      const items = itemIndices
        ? itemIndices.map((idx) => data.additionalSkills?.[idx]).filter(Boolean)
        : data.additionalSkills || [];
      if (!items.length) return null;
      return (
        <SectionWrapper sectionId="additionalSkills" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Skills">
          <SectionHeader title="Additional Skills" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0 8px" }}>
            {items.map((s, i) => {
              const originalIndex = itemIndices ? itemIndices[i] : i;
              return (
                <div key={i} data-item-index={originalIndex} style={S.bulletWrap}>
                  <span style={S.bullet}>•</span>
                  <RichTextSpellCheck
                    html={typeof s === "object" ? s.name : s}
                    isActive={isSpellCheckActive}
                    onIgnore={onSpellCheckIgnore}
                    onReplace={(v) => onSpellCheckReplace("additionalSkills", originalIndex, v, "name")}
                  />
                </div>
              );
            })}
          </div>
        </SectionWrapper>
      );
    },

    // STRENGTHS — same bullet list style
    strengths: ({ itemIndices }) => {
      const items = itemIndices
        ? itemIndices.map((idx) => data.strengths?.[idx]).filter(Boolean)
        : data.strengths || [];
      if (!items.length) return null;
      return (
        <SectionWrapper sectionId="strengths" navigationId="skills" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Key Strengths">
          <SectionHeader title="Key Strengths" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 30px" }}>
            {items.map((s, i) => {
              const originalIndex = itemIndices ? itemIndices[i] : i;
              return (
                <div key={i} data-item-index={originalIndex} style={S.bulletWrap}>
                  <span style={S.bullet}>•</span>
                  <RichTextSpellCheck
                    html={typeof s === "object" ? s.name : s}
                    isActive={isSpellCheckActive}
                    onIgnore={onSpellCheckIgnore}
                    onReplace={(v) => onSpellCheckReplace("strengths", originalIndex, v, "name")}
                  />
                </div>
              );
            })}
          </div>
        </SectionWrapper>
      );
    },

    // SOFTWARE
    software: ({ itemIndices }) => {
      const items = itemIndices
        ? itemIndices.map((idx) => data.software?.[idx]).filter(Boolean)
        : data.software || [];
      if (!items.length) return null;
      const labels = ["", "Beginner", "Elementary", "Intermediate", "Advanced", "Expert"];
      return (
        <SectionWrapper sectionId="software" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Software">
          <SectionHeader title="Technical Proficiency" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 30px" }}>
            {items.map((item, i) => {
              const originalIndex = itemIndices ? itemIndices[i] : i;
              return (
                <div key={i} data-item-index={originalIndex} style={{ ...S.bulletWrap, justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <span style={S.bullet}>•</span>
                    <RichTextSpellCheck
                      html={item.name || ""}
                      isActive={isSpellCheckActive}
                      onIgnore={onSpellCheckIgnore}
                      onReplace={(v) => onSpellCheckReplace("software", originalIndex, v, "name")}
                    />
                  </div>
                  {item.rating > 0 && (
                    <span style={{ fontStyle: "italic", fontSize: "calc(11px * var(--theme-font-scale, 1))", color: lightText }}>
                      {labels[item.rating] || ""}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </SectionWrapper>
      );
    },

    // CERTIFICATIONS
    certifications: ({ itemIndices }) => {
      const items = itemIndices
        ? itemIndices.map((idx) => data.certifications?.[idx]).filter(Boolean)
        : data.certifications || [];
      if (!items.length) return null;
      return (
        <SectionWrapper sectionId="certifications" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Certifications">
          <SectionHeader title="Certifications" />
          {items.map((cert, i) => {
            const originalIdx = itemIndices ? itemIndices[i] : i;
            return (
              <div key={i} data-item-index={originalIdx} style={S.posRow}>
                <div style={S.posLeft}>
                  <span style={{ ...S.bullet, marginRight: "8px" }}>•</span>
                  <RichTextSpellCheck
                    html={cert.name || ""}
                    isActive={isSpellCheckActive}
                    onIgnore={onSpellCheckIgnore}
                    onReplace={(v) => onSpellCheckReplace("certifications", originalIdx, v, "name")}
                  />
                  {cert.issuer && (
                    <span style={{ marginLeft: "6px", color: lightText, fontSize: "calc(12px * var(--theme-font-scale, 1))" }}>
                      {" "}
                      <RichTextSpellCheck
                        html={cert.issuer}
                        isActive={isSpellCheckActive}
                        onIgnore={onSpellCheckIgnore}
                        onReplace={(v) => onSpellCheckReplace("certifications", originalIdx, v, "issuer")}
                      />
                    </span>
                  )}
                </div>
                {(cert.date || cert.year) && (
                  <span style={S.posDate}>
                    <RichTextSpellCheck
                      html={cert.date || cert.year || ""}
                      isActive={isSpellCheckActive}
                      onIgnore={onSpellCheckIgnore}
                      onReplace={(v) => onSpellCheckReplace("certifications", originalIdx, v, "date")}
                    />
                  </span>
                )}
              </div>
            );
          })}
        </SectionWrapper>
      );
    },

    // KEY ACHIEVEMENTS — used as "Positions of Responsibility"
    keyAchievements: ({ itemIndices }) => {
      const items = itemIndices
        ? itemIndices.map((idx) => data.keyAchievements?.[idx]).filter(Boolean)
        : data.keyAchievements || [];
      if (!items.length) return null;
      return (
        <SectionWrapper sectionId="keyAchievements" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Positions of Responsibility">
          <SectionHeader title="Positions of Responsibility" />
          {items.map((item, i) => {
            const originalIndex = itemIndices ? itemIndices[i] : i;
            return (
              <div key={i} data-item-index={originalIndex} style={S.posRow}>
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <span style={{ ...S.bullet, marginRight: "6px" }}>•</span>
                  <span>
                    {item.name && (
                      <span style={{ fontWeight: "700", color: ink }}>
                        <RichTextSpellCheck
                          html={item.name}
                          isActive={isSpellCheckActive}
                          onIgnore={onSpellCheckIgnore}
                          onReplace={(v) => onSpellCheckReplace("keyAchievements", originalIndex, v, "name")}
                        />
                      </span>
                    )}
                    {item.description && (
                      <span style={{ color: lightText, fontSize: "calc(12.5px * var(--theme-font-scale, 1))" }}>
                        {" "}
                        <RichTextSpellCheck
                          html={item.description}
                          isActive={isSpellCheckActive}
                          onIgnore={onSpellCheckIgnore}
                          onReplace={(v) => onSpellCheckReplace("keyAchievements", originalIndex, v, "description")}
                        />
                      </span>
                    )}
                  </span>
                </div>
                {item.year && (
                  <span style={S.posDate}>
                    <RichTextSpellCheck
                      html={item.year}
                      isActive={isSpellCheckActive}
                      onIgnore={onSpellCheckIgnore}
                      onReplace={(v) => onSpellCheckReplace("keyAchievements", originalIndex, v, "year")}
                    />
                  </span>
                )}
              </div>
            );
          })}
        </SectionWrapper>
      );
    },

    // ACCOMPLISHMENTS — "Miscellaneous" style
    accomplishments: ({ itemIndices }) => {
      const items = itemIndices
        ? itemIndices.map((idx) => data.accomplishments?.[idx]).filter(Boolean)
        : data.accomplishments || [];
      if (!items.length) return null;
      return (
        <SectionWrapper sectionId="accomplishments" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Accomplishments">
          <SectionHeader title="Miscellaneous" />
          {items.map((item, i) => {
            const originalIndex = itemIndices ? itemIndices[i] : i;
            return (
              <div key={i} data-item-index={originalIndex} style={S.posRow}>
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <span style={{ ...S.bullet, marginRight: "6px" }}>•</span>
                  <span>
                    {item.name && (
                      <span style={{ fontWeight: "700", color: ink }}>
                        <RichTextSpellCheck
                          html={item.name}
                          isActive={isSpellCheckActive}
                          onIgnore={onSpellCheckIgnore}
                          onReplace={(v) => onSpellCheckReplace("accomplishments", originalIndex, v, "name")}
                        />
                      </span>
                    )}
                    {item.description && (
                      <span style={{ color: lightText, fontSize: "calc(12.5px * var(--theme-font-scale, 1))" }}>
                        {", "}
                        <RichTextSpellCheck
                          html={item.description}
                          isActive={isSpellCheckActive}
                          onIgnore={onSpellCheckIgnore}
                          onReplace={(v) => onSpellCheckReplace("accomplishments", originalIndex, v, "description")}
                        />
                      </span>
                    )}
                  </span>
                </div>
                {item.year && (
                  <span style={{ ...S.posDate }}>
                    <RichTextSpellCheck
                      html={item.year}
                      isActive={isSpellCheckActive}
                      onIgnore={onSpellCheckIgnore}
                      onReplace={(v) => onSpellCheckReplace("accomplishments", originalIndex, v, "year")}
                    />
                  </span>
                )}
              </div>
            );
          })}
        </SectionWrapper>
      );
    },

    // SUMMARY — "Profile" / "Objective"
    summary: ({ isContinued, subItemRanges }) => (
      <SectionWrapper sectionId="summary" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Professional Summary">
        <SectionHeader title="Profile" />
        <div className="resume-rich-text" style={S.richText}>
          <SplittableRichText
            html={data.summary}
            range={subItemRanges?.summary}
            isActive={isSpellCheckActive}
            onIgnore={onSpellCheckIgnore}
            onReplace={(v) => onSpellCheckReplace("summary", "summary", v)}
          />
        </div>
      </SectionWrapper>
    ),

    // LANGUAGES
    languages: ({ itemIndices }) => {
      const items = itemIndices
        ? itemIndices.map((idx) => data.languages?.[idx]).filter(Boolean)
        : data.languages || [];
      if (!items.length) return null;
      return (
        <SectionWrapper sectionId="languages" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Languages">
          <SectionHeader title="Languages" />
          <div style={S.skillLine}>
            {items.map((lang, i) => {
              const originalIdx = itemIndices ? itemIndices[i] : i;
              return (
                <span key={i} data-item-index={originalIdx} style={{ marginRight: "18px", fontSize: "calc(12.5px * var(--theme-font-scale, 1))" }}>
                  <span style={S.skillLabel}>
                    <RichTextSpellCheck
                      html={lang.name || ""}
                      isActive={isSpellCheckActive}
                      onIgnore={onSpellCheckIgnore}
                      onReplace={(v) => onSpellCheckReplace("languages", originalIdx, v, "name")}
                    />:
                  </span>
                  <span style={{ color: lightText }}>
                    <RichTextSpellCheck
                      html={lang.level || ""}
                      isActive={isSpellCheckActive}
                      onIgnore={onSpellCheckIgnore}
                      onReplace={(v) => onSpellCheckReplace("languages", originalIdx, v, "level")}
                    />
                  </span>
                </span>
              );
            })}
          </div>
        </SectionWrapper>
      );
    },

    // INTERESTS
    interests: ({ itemIndices }) => {
      const items = itemIndices
        ? itemIndices.map((idx) => data.interests?.[idx]).filter(Boolean)
        : data.interests || [];
      if (!items.length) return null;
      return (
        <SectionWrapper sectionId="interests" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Interests">
          <SectionHeader title="Interests & Hobbies" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0 4px", fontSize: "calc(12.5px * var(--theme-font-scale, 1))" }}>
            {items.map((item, i) => {
              const originalIndex = itemIndices ? itemIndices[i] : i;
              return (
                <React.Fragment key={i}>
                  <RichTextSpellCheck
                    html={typeof item === "object" ? item.name : item}
                    isActive={isSpellCheckActive}
                    onIgnore={onSpellCheckIgnore}
                    onReplace={(v) => onSpellCheckReplace("interests", originalIndex, v, "name")}
                  />
                  {i < items.length - 1 && <span style={{ color: ruleColor, margin: "0 4px" }}>·</span>}
                </React.Fragment>
              );
            })}
          </div>
        </SectionWrapper>
      );
    },

    // AFFILIATIONS
    affiliations: ({ itemIndices }) => {
      const items = itemIndices
        ? itemIndices.map((idx) => data.affiliations?.[idx]).filter(Boolean)
        : data.affiliations || [];
      if (!items.length) return null;
      return (
        <SectionWrapper sectionId="affiliations" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Affiliations">
          <SectionHeader title="Affiliations" />
          {items.map((aff, i) => {
            const originalIdx = itemIndices ? itemIndices[i] : i;
            return (
              <div key={i} data-item-index={originalIdx} style={S.bulletWrap}>
                <span style={S.bullet}>•</span>
                <div>
                  <span style={{ fontWeight: "700", color: ink }}>
                    <RichTextSpellCheck
                      html={aff.name || ""}
                      isActive={isSpellCheckActive}
                      onIgnore={onSpellCheckIgnore}
                      onReplace={(v) => onSpellCheckReplace("affiliations", originalIdx, v, "name")}
                    />
                  </span>
                  {aff.description && (
                    <div className="resume-rich-text" style={S.richText}>
                      <RichTextSpellCheck
                        html={aff.description}
                        isActive={isSpellCheckActive}
                        onIgnore={onSpellCheckIgnore}
                        onReplace={(v) => onSpellCheckReplace("affiliations", originalIdx, v, "description")}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </SectionWrapper>
      );
    },

    // PERSONAL DETAILS
    personalDetails: () => {
      const p = data.personal || {};
      const details = [
        { label: "Date of Birth", value: p.dob || p.dateOfBirth || p.birthDate },
        { label: "Place of Birth", value: p.placeOfBirth },
        { label: "Nationality", value: p.nationality },
        // { label: "Marital Status", value: p.maritalStatus || p.marital_status },
        { label: "Gender", value: p.gender },
        { label: "Religion", value: p.religion },
        // { label: "Visa Status", value: p.visaStatus || p.visa_status },
        { label: "Driving License", value: p.drivingLicense },
        { label: "Other", value: p.otherPersonal || p.otherInformation },
      ].filter((d) => d.value);
      if (!details.length) return null;
      return (
        <SectionWrapper sectionId="personalDetails" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Personal Details">
          <SectionHeader title="Personal Information" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 30px", fontSize: "calc(12.5px * var(--theme-font-scale, 1))" }}>
            {details.map((d, i) => (
              <div key={i}>
                <span style={S.skillLabel}>{d.label}: </span>
                <span style={{ color: lightText }}>
                  <SpellCheckText
                    text={d.value}
                    isActive={isSpellCheckActive}
                    onIgnore={onSpellCheckIgnore}
                    onReplace={(v) =>
                      onSpellCheckReplace("personal", d.label.toLowerCase().replace(/ /g, ""), v)
                    }
                  />
                </span>
              </div>
            ))}
          </div>
        </SectionWrapper>
      );
    },

    // ADDITIONAL INFO
    additionalInfo: ({ subItemRanges }) => {
      if (!data.additionalInfo) return null;
      return (
        <SectionWrapper sectionId="additionalInfo" onSectionClick={onSectionClick} isInteractive={isInteractive} label="Additional Information">
          <SectionHeader title="Additional Information" />
          <div className="resume-rich-text" style={S.richText}>
            <SplittableRichText
              html={data.additionalInfo}
              range={subItemRanges?.additionalInfo}
              isActive={isSpellCheckActive}
              onIgnore={onSpellCheckIgnore}
              onReplace={(v) => onSpellCheckReplace("additionalInfo", "additionalInfo", v)}
            />
          </div>
        </SectionWrapper>
      );
    },

    // CUSTOM SECTION
    custom: ({ subItemRanges }) => {
      if (!data.customSection?.isVisible || !data.customSection?.content) return null;
      const title = data.customSection.title || "Additional Information";
      return (
        <SectionWrapper sectionId="custom" onSectionClick={onSectionClick} isInteractive={isInteractive} label={title}>
          <SectionHeader title={title} />
          <div className="resume-rich-text" style={S.richText}>
            <SplittableRichText
              html={data.customSection.content}
              range={subItemRanges?.custom}
              isActive={isSpellCheckActive}
              onIgnore={onSpellCheckIgnore}
              onReplace={(v) => onSpellCheckReplace("customSection", "content", v)}
            />
          </div>
        </SectionWrapper>
      );
    },
  };

  // ─── RENDER ZONE ───────────────────────────────────────────────────────────
  const renderZone = (id, items, columnStyle = {}) => (
    <DroppableZone
      id={id}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "calc(22px * var(--theme-section-margin, 1))",
        minHeight: "100px",
        ...columnStyle,
      }}
    >
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

  // ─── MEASURER (hidden, for pagination calculation) ─────────────────────────
  const Measurer = () => (
    <div
      className="resume-measurer"
      style={{ position: "absolute", top: -10000, left: -10000, width: "210mm", visibility: "hidden" }}
    >
      <div
        className="page-height-marker"
        style={{ height: "297mm", width: "1px", position: "absolute", left: 0, top: 0 }}
      />
      <div style={{ ...S.page, height: "auto" }}>
        <Header />
        <div
          data-column-id="main"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "calc(22px * var(--theme-section-margin, 1))",
          }}
        >
          {activeSections.map((sid) => (
            <SectionRenderer
              key={sid}
              sectionId={sid}
              data={data}
              customRenderers={customRenderers}
              zoneId="main"
            />
          ))}
        </div>
      </div>
    </div>
  );

  // ─── MAIN RENDER ───────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="academic-latex-root">
      {/* Google Fonts — EB Garamond for authentic LaTeX feel */}
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap');
                .academic-latex-root .resume-rich-text ul,
                .academic-latex-root .resume-rich-text ol { margin: 0; padding-left: 0; list-style: none; }
                .academic-latex-root .resume-rich-text li::before { content: "– "; }
                .academic-latex-root .resume-rich-text li { margin-bottom: 2px; }
                .academic-latex-root .resume-rich-text p { margin: 0 0 4px 0; }
            `}</style>

      <Measurer />

      <DndContext {...dndContextProps}>
        <SortableContext items={activeSections} strategy={verticalListSortingStrategy}>
          {showPageBreaks && pages ? (
            pages.map((page, i) => (
              <div key={i} style={S.page}>
                {i === 0 && <Header />}
                {renderZone(`main-p${i}`, page.main, { flex: 1 })}
                <div
                  style={{
                    position: "absolute",
                    bottom: "14px",
                    right: "42px",
                    fontSize: "9px",
                    color: lightText,
                    fontFamily: serif,
                    fontStyle: "italic",
                  }}
                >
                  Page {i + 1}
                </div>
              </div>
            ))
          ) : (
            <div style={{ ...S.page, height: "auto", minHeight: "100%", overflow: "hidden" }}>
              <Header />
              {renderZone("main", activeSections, { flex: 1 })}
            </div>
          )}
        </SortableContext>

        <StableResumeDragOverlay
          activeId={activeId}
          scale={scale}
          renderSection={(id) => (
            <div
              className="dragging-preview"
              style={{ background: "white", padding: "10px", border: "1px solid #ccc" }}
            >
              <SectionRenderer
                sectionId={id}
                data={data}
                customRenderers={customRenderers}
              />
            </div>
          )}
        />
      </DndContext>
    </div>
  );
};

export default AcademicLatex;