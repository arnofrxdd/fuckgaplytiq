// --- TEMPLATE CONFIGURATION MANAGER ---
// acts as the single source of truth for all template metadata

export const templatesConfig = [
  /*
    {
      id: "modern-minimalist",
      name: "Modern Minimalist (1-Column Skeleton)",
      thumbnail: "/templates/modern.png",
      description: "A clean, single-column design skeleton.",
      tags: ["Minimal", "1-Column", "Skeleton"],
      defaultColor: "#1e293b",
      defaultFont: "'Inter', sans-serif",
      recommendedColors: ["#1e293b", "#2563eb", "#475569"],
      theme: { background: "#ffffff", text: "#1e293b" },
      layout: {
        main: [
          "summary", "experience", "education", "skills", "projects",
          "certifications", "languages", "software", "keyAchievements",
          "accomplishments", "additionalInfo", "affiliations", "interests", "custom"
        ]
      },
      defaults: { fontSize: 1, fontFamily: "Inter", sectionSpacing: 1, paragraphSpacing: 1, lineHeight: 1.6, letterSpacing: 0, pageMargin: 40 },
      useRootPadding: false
    },
    {
      id: "modern-sidebar",
      name: "Modern Sidebar (2-Column Skeleton)",
      thumbnail: "/templates/sidebar.png",
      description: "A professional 2-column layout skeleton.",
      tags: ["2-Column", "Modern", "Skeleton"],
      defaultColor: "#1e293b",
      defaultFont: "'Inter', sans-serif",
      recommendedColors: ["#1e293b", "#2563eb", "#334155"],
      theme: { background: "#ffffff", text: "#1e293b", sidebarBackground: "#f8fafc" },
      layout: {
        main: ["summary", "experience", "projects", "education", "custom"],
        sidebar: ["skills", "languages", "certifications", "interests", "websites"]
      },
      defaults: { fontSize: 1, fontFamily: "Inter", sectionSpacing: 1, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
      useRootPadding: false
    },
    {
      id: "modern-three-column",
      name: "Modern Three Column (3-Column Skeleton)",
      thumbnail: "/templates/three-column.png",
      description: "A high-density 3-column layout skeleton.",
      tags: ["3-Column", "Modern", "Skeleton"],
      defaultColor: "#1e293b",
      defaultFont: "'Inter', sans-serif",
      recommendedColors: ["#1e293b", "#2563eb", "#6366f1"],
      theme: { background: "#ffffff", text: "#1e293b" },
      layout: {
        left: ["skills", "languages"],
        main: ["summary", "experience", "projects", "custom"],
        right: ["education", "certifications", "interests"]
      },
      defaults: { fontSize: 0.9, fontFamily: "Inter", sectionSpacing: 0.8, paragraphSpacing: 1, lineHeight: 1.4, letterSpacing: 0, pageMargin: 40 },
      useRootPadding: false
    },
  */
  {
    id: "creative-marketing",
    name: "Creative Marketing (Split Dot)",
    thumbnail: "/templates/marketing.png",
    description: "A premium 2-column layout with timeline dots and skill bars, inspired by marketing expert designs.",
    tags: ["2-Column", "Creative", "Premium"],
    defaultColor: "#2d5a7b",
    defaultFont: "'Lora', serif",
    recommendedColors: ["#2d5a7b", "#1e293b", "#0f172a"],
    theme: { background: "#ffffff", text: "#334155" },
    layout: {
      left: ["summary", "education", "skills"],
      right: ["websites", "experience", "projects", "custom"]
    },
    defaults: { fontSize: 0.95, fontFamily: "Lora", sectionSpacing: 1.2, paragraphSpacing: 1, lineHeight: 1.6, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  /*
    {
      id: "executive-sidebar",
      name: "Executive Sidebar (Premium)",
      thumbnail: "/templates/executive.png",
      description: "A bold, professional sidebar layout with high-contrast elements and premium typography.",
      tags: ["2-Column", "Executive", "Premium"],
      defaultColor: "#1e293b",
      defaultFont: "'Inter', sans-serif",
      recommendedColors: ["#252b33", "#1e293b", "#0f172a", "#334155"],
      theme: { background: "#ffffff", text: "#1e293b", sidebarBackground: "#252b33", sidebarText: "#ffffff" },
      layout: {
        left: ["websites", "skills", "languages", "interests"],
        right: ["summary", "experience", "education", "projects", "custom"]
      },
      defaults: { fontSize: 0.95, fontFamily: "Inter", sectionSpacing: 1.1, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
      useRootPadding: false
    },
  */
  {
    id: "jade-heritage",
    name: "Jade Heritage",
    thumbnail: "/templates/jade-heritage.png",
    description: "A clean, modern professional template featuring a timeline career spine and a dedicated quadrant for key achievements.",
    tags: ["Modern", "Timeline", "Premium", "1-Column"],
    defaultColor: "#055052",
    defaultFont: "Outfit",
    recommendedColors: ["#055052", "#0d9488", "#0f766e", "#334155"],
    theme: { background: "#ffffff", text: "#1e293b" },
    layout: {
      main: ["summary", "experience", "education", "projects", "skills", "languages", "interests", "custom"],
    },
    defaults: { fontSize: 0.95, fontFamily: "Outfit", sectionSpacing: 1.2, paragraphSpacing: 1.1, lineHeight: 1.55, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  /*
  {
    id: "iconic-timeline",
    name: "Iconic Timeline (Marketing Expert)",
    thumbnail: "/templates/iconic.png",
    description: "A bold, award-winning 2-column layout featuring integrated iconography and a vertical timeline spine.",
    tags: ["2-Column", "Creative", "Premium"],
    defaultColor: "#1f2937",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#1f2937", "#374151", "#1e293b", "#0f172a"],
    theme: { background: "#ffffff", text: "#374151" },
    layout: {
      left: ["websites", "skills", "languages", "additionalInfo"],
      right: ["summary", "experience", "education", "projects", "custom"]
    },
    defaults: { fontSize: 0.95, fontFamily: "Inter", sectionSpacing: 1.2, paragraphSpacing: 1, lineHeight: 1.6, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  */
  {
    id: "azure-modern",
    name: "Azure Modern (Shaded Sidebar)",
    thumbnail: "/templates/azure.png",
    description: "A clean, modern layout featuring a full-width colored header and a high-contrast shaded sidebar for contact and skills.",
    tags: ["2-Column", "Modern", "Shaded", "Professional"],
    defaultColor: "#70b1e8",
    defaultFont: "Urbanist",
    recommendedColors: ["#70b1e8", "#3b82f6", "#1e40af", "#0f172a"],
    theme: { background: "#ffffff", text: "#334155" },
    layout: {
      main: ["experience", "education", "projects", "custom"],
      sidebar: ["websites", "skills", "languages", "certifications"]
    },
    defaults: { fontSize: 0.95, fontFamily: "Urbanist", sectionSpacing: 1.1, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },

  {
    id: "onyx-modern",
    name: "Onyx Modern (Dark Sidebar)",
    thumbnail: "/templates/onyx.png",
    description: "A high-contrast professional layout with a charcoal sidebar, large profile focus, and clean horizontal section dividers.",
    tags: ["2-Column", "Corporate", "Classic", "Professional"],
    defaultColor: "#3e3e3e",
    defaultFont: "Montserrat",
    recommendedColors: ["#3e3e3e", "#1e293b", "#27272a", "#09090b"],
    theme: { background: "#ffffff", text: "#334155", backgroundShade: "#d9e9f7" },
    layout: {
      sidebar: ["websites", "education", "languages", "certifications"],
      main: ["summary", "skills", "experience", "projects", "custom"]
    },
    defaults: { fontSize: 0.95, fontFamily: "Montserrat", sectionSpacing: 1.1, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "sapphire-grid",
    name: "Sapphire Grid (Lateral Sidebar)",
    thumbnail: "/templates/sapphire.png",
    description: "A unique layout where section titles form a colored left spine, featuring a tri-segment contact bar and two-tone header.",
    tags: ["1-Column", "Modern", "Grid"],
    defaultColor: "#70b1e8",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#70b1e8", "#3b82f6", "#ef4444", "#10b981"],
    theme: { background: "#ffffff", text: "#334155", colorLight: "#70b1e8", colorDark: "#444444" },
    layout: {
      main: ["summary", "skills", "experience", "education", "projects", "custom"]
    },
    defaults: { fontSize: 0.95, fontFamily: "Inter", sectionSpacing: 1.2, paragraphSpacing: 1, lineHeight: 1.6, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "aura-pastel",
    name: "Aura Pastel (Blob Modern)",
    thumbnail: "/templates/aura.png",
    description: "A soft, creative 2-column layout featuring an organic blob header, thick pastel side borders, and a dashed vertical timeline spine.",
    tags: ["2-Column", "Creative", "Minimal", "Simple"],
    defaultColor: "#60a5fa",
    defaultFont: "Manrope",
    recommendedColors: ["#60a5fa", "#fbcfe8", "#34d399", "#f87171"],
    theme: { background: "#ffffff", text: "#1e293b", sidebarBackground: "#ffffff" },
    layout: {
      sidebar: ["contact", "websites", "summary", "skills"],
      main: ["experience", "education", "projects", "custom"]
    },
    defaults: { fontSize: 0.95, fontFamily: "Manrope", sectionSpacing: 1.2, paragraphSpacing: 1, lineHeight: 1.6, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "strategic-leader",
    name: "Strategic Leader (Executive Focus)",
    thumbnail: "/templates/strategic.png",
    description: "A high-end executive template with a centered header and clean table-style layout, perfect for senior leadership roles.",
    tags: ["1-Column", "Executive", "Premium"],
    defaultColor: "#1e293b",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#1e293b", "#0f172a", "#334155", "#1e40af"],
    theme: { background: "#ffffff", text: "#1e293b" },
    layout: {
      main: ["summary", "skills", "experience", "education", "keyAchievements", "projects", "custom"]
    },
    defaults: { fontSize: 1, fontFamily: "Inter", sectionSpacing: 1.1, paragraphSpacing: 1, lineHeight: 1.6, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "corporate-timeline",
    name: "Corporate Timeline (Photo Header)",
    thumbnail: "/templates/corporate-timeline.png",
    description: "A corporate single-column template with a blue accent bar header, profile photo, and a vertical timeline for work experience.",
    tags: ["1-Column", "Corporate", "Timeline", "Professional"],
    defaultColor: "#0047AB",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#0047AB", "#003087", "#1e40af", "#1e293b"],
    theme: { background: "#ffffff", text: "#1a1a2e" },
    layout: {
      main: ["summary", "skills", "strengths", "experience", "education", "keyAchievements", "accomplishments", "projects", "certifications", "languages", "software", "interests", "awards", "volunteering", "publications", "references", "affiliations", "websites", "personalDetails", "additionalInfo", "custom"]
    },
    defaults: { fontSize: 1, fontFamily: "Inter", sectionSpacing: 1, paragraphSpacing: 1, lineHeight: 1.55, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "classic-executive",
    name: "Classic Executive",
    thumbnail: "/templates/classic-executive.png",
    description: "A clean, minimal, black-and-white executive resume with serif typography, thin separators, and justified text. Inspired by traditional corporate layouts.",
    tags: ["1-Column", "Classic", "Executive", "Professional"],
    defaultColor: "#333333",
    defaultFont: "'Georgia', 'Times New Roman', serif",
    recommendedColors: ["#333333", "#1a1a1a", "#2c3e50", "#4a4a4a"],
    theme: { background: "#ffffff", text: "#1a1a1a" },
    layout: {
      main: ["summary", "experience", "education", "skills", "strengths", "keyAchievements", "accomplishments", "projects", "certifications", "languages", "software", "interests", "awards", "volunteering", "publications", "references", "affiliations", "personalDetails", "additionalInfo", "custom"]
    },
    defaults: { fontSize: 1, fontFamily: "Georgia", sectionSpacing: 1, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "obsidian-edge",
    name: "Obsidian Edge",
    thumbnail: "/templates/obsidian-edge.png",
    description: "A premium dark-header resume with warm gold accents, circular photo, uppercase section labels, elegant skill bars, and a refined two-tone layout.",
    tags: ["1-Column", "Premium", "Dark Header", "Modern"],
    defaultColor: "#c8a24e",
    defaultFont: "'Inter', 'Segoe UI', sans-serif",
    recommendedColors: ["#c8a24e", "#d4a853", "#b08d3e", "#a67c38", "#3b82f6", "#6366f1", "#10b981", "#f43f5e"],
    theme: { background: "#ffffff", text: "#1a1a2e" },
    layout: {
      main: ["summary", "skills", "strengths", "experience", "education", "keyAchievements", "accomplishments", "projects", "certifications", "languages", "software", "interests", "awards", "volunteering", "publications", "references", "affiliations", "websites", "personalDetails", "additionalInfo", "custom"]
    },
    defaults: { fontSize: 1, fontFamily: "Inter", sectionSpacing: 1, paragraphSpacing: 1, lineHeight: 1.55, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "navy-professional",
    name: "Navy Professional (Executive Diamond)",
    thumbnail: "/templates/navy-professional.png",
    description: "A premium executive template with bold navy branding, diamond bullet points, ALL-CAPS section headers, 3-column competencies grid, and a clean side-by-side domain/accomplishments layout. Ideal for senior leadership and VP-level roles.",
    tags: ["1-Column", "Executive", "Premium", "Professional"],
    defaultColor: "#1a3a5c",
    defaultFont: "'Calibri', 'Arial', sans-serif",
    recommendedColors: ["#1a3a5c", "#0f2d4a", "#1e3a5f", "#1e293b", "#0f172a", "#1e40af"],
    theme: { background: "#ffffff", text: "#1a1a1a" },
    layout: {
      main: [
        "summary", "skills", "strengths", "additionalSkills",
        "experience", "education", "keyAchievements", "accomplishments",
        "projects", "certifications", "languages", "software",
        "interests", "awards", "volunteering", "publications",
        "references", "affiliations", "personalDetails", "additionalInfo", "custom"
      ]
    },
    defaults: { fontSize: 1, fontFamily: "Calibri", sectionSpacing: 1, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  /*
  {
    id: "executive-teal",
    name: "Executive Teal (Timeline Focus)",
    thumbnail: "/templates/executive-teal.png",
    description: "A dual-column executive layout featuring a distinct teal color scheme, horizontal career timeline, and ribbon-style skills list.",
    tags: ["2-Column", "Executive", "Creative", "Timeline"],
    defaultColor: "#17a2b8",
    defaultFont: "'Roboto', 'Arial', sans-serif",
    recommendedColors: ["#17a2b8", "#2c3e50", "#009688", "#20c997"],
    theme: { background: "#ffffff", text: "#333333" },
    layout: {
      left: ["education", "skills", "additionalSkills", "certifications", "previousExperience", "languages", "volunteering"],
      right: ["summary", "keyAchievements", "careerTimeline", "experience", "projects", "interests"]
    },
    defaults: { fontSize: 0.95, fontFamily: "Roboto", sectionSpacing: 1, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  */
  {
    id: "dark-edge",
    name: "Dark Edge",
    thumbnail: "/templates/onyx.png",
    description: "A premium 2-column layout with a dark charcoal sidebar and overlapping profile focus.",
    tags: ["2-Column", "Premium", "Dark Sidebar", "Modern"],
    defaultColor: "#b8d4e8",
    defaultFont: "'Arial', sans-serif",
    recommendedColors: ["#b8d4e8", "#1e293b"],
    theme: { background: "#ffffff", text: "#333333" },
    layout: {
      main: ['summary', 'skills', 'experience', 'projects', 'additionalInfo', 'custom', 'awards', 'volunteer', 'publications'],
      sidebar: ['contact', 'websites', 'education', 'languages', 'certifications', 'strengths', 'additionalSkills', 'software', 'interests']
    },
    defaults: { fontSize: 1, fontFamily: "Arial", sectionSpacing: 1, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "clear-vista",
    name: "Clear Vista",
    thumbnail: "/templates/placeholder.png",
    description: "A clean and clear template for a modern professional look.",
    tags: ["Modern", "Professional", "Custom", "2-Column", "Simple"],
    defaultColor: "#2563eb",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#2563eb", "#1e293b", "#0f172a"],
    theme: { background: "#ffffff", text: "#1e293b" },
    layout: {
      main: ["summary", "experience", "education", "projects", "custom"],
      sidebar: ["skills", "languages", "certifications"]
    },
    defaults: { fontSize: 1, fontFamily: "Inter", sectionSpacing: 1, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "emerald-elite",
    name: "Emerald Elite",
    thumbnail: "/templates/placeholder.png",
    description: "A premium emerald-themed template with a sophisticated layout.",
    tags: ["Premium", "Modern", "Emerald", "2-Column", "Professional"],
    defaultColor: "#10b981",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#10b981", "#064e3b", "#065f46"],
    theme: { background: "#ffffff", text: "#1e293b" },
    layout: {
      main: ["summary", "experience", "education", "projects", "custom"],
      sidebar: ["skills", "languages", "certifications"]
    },
    defaults: { fontSize: 1, fontFamily: "Inter", sectionSpacing: 1, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "ruby-ribbon",
    name: "Ruby Ribbon",
    thumbnail: "/templates/placeholder.png",
    description: "A bold, high-contrast layout with maroon panels and golden accents, featuring a dedicated side-bar for core competencies.",
    tags: ["High Contrast", "Premium", "Panel", "2-Column", "Creative"],
    defaultColor: "#80303d",
    defaultFont: "Fraunces",
    recommendedColors: ["#80303d", "#0F172A", "#1E293B"],
    theme: { background: "#ffffff", text: "#1e293b" },
    layout: {
      sidebar: ["contact", "education", "skills"],
      main: ["summary", "experience", "certifications", "projects", "custom"]
    },
    defaults: { fontSize: 1, fontFamily: "Fraunces", sectionSpacing: 1.2, paragraphSpacing: 1, lineHeight: 1.6, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  /*
  {
    id: "amber-graphite",
    name: "Amber Graphite",
    thumbnail: "/templates/placeholder.png",
    description: "A bold, modern design with a dark sidebar, yellow accents, and a distinctive vertical timeline separator.",
    tags: ["Modern", "Creative", "Graphite", "2-Column"],
    defaultColor: "#f59e0b", // Amber yellow
    defaultFont: "'Outfit', sans-serif",
    recommendedColors: ["#f59e0b", "#111827", "#374151"],
    theme: { background: "#ffffff", text: "#111827" },
    layout: {
      sidebar: ["contact", "references", "education"],
      main: ["summary", "experience", "skills"]
    },
    defaults: { fontSize: 0.95, fontFamily: "Outfit", sectionSpacing: 1.5, paragraphSpacing: 1, lineHeight: 1.6, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  */
  {
    id: "silver-serif",
    name: "Silver Serif",
    thumbnail: "/templates/placeholder.png",
    description: "A professional 1-column executive layout with silver headers, bold typography, and a clean structured feel.",
    tags: ["Classic", "1-Column", "Finance", "Professional", "Executive"],
    defaultColor: "#c0392b",
    defaultFont: "'Georgia', serif",
    recommendedColors: ["#c0392b", "#2c3e50", "#1a1a1a"],
    theme: { background: "#ffffff", text: "#1a1a1a" },
    layout: {
      main: ["languages", "education", "skills", "experience", "certifications", "projects", "strengths", "additionalSkills", "software", "awards", "interests", "volunteer", "publications", "custom", "additionalInfo"]
    },
    defaults: { fontSize: 0.9, fontFamily: "Georgia", sectionSpacing: 1.2, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "azure-skyline",
    name: "Azure Skyline",
    thumbnail: "/templates/azure-skyline.png",
    description: "A professional corporate design with sky-blue accents, horizontal section lines, and a structured date-left layout.",
    tags: ["Corporate", "Modern", "1-Column", "Professional"],
    defaultColor: "#1E9FD4",
    defaultFont: "'Calibri', 'Segoe UI', Arial, sans-serif",
    recommendedColors: ["#1E9FD4", "#3498db", "#2980b9", "#2c3e50"],
    theme: { background: "#ffffff", text: "#1a1a1a" },
    layout: {
      main: ["summary", "education", "skills", "experience", "strengths", "additionalSkills", "keyAchievements", "accomplishments", "projects", "certifications", "languages", "software", "interests", "awards", "volunteering", "publications", "references", "affiliations", "personalDetails", "additionalInfo", "custom"]
    },
    defaults: { fontSize: 1, fontFamily: "Calibri", sectionSpacing: 1, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "lavender-luxe",
    name: "Lavender Luxe",
    thumbnail: "/templates/lavender-luxe.png",
    description: "A stylish two-column layout with a soft lavender sidebar and a clean executive look.",
    tags: ["Stylish", "Creative", "2-Column", "Modern"],
    defaultColor: "#E0BBE4",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#E0BBE4", "#D291BC", "#957DAD", "#FEC8D8"],
    theme: { background: "#ffffff", text: "#333333" },
    layout: {
      sidebar: ["summary", "contact", "references", "languages", "software", "personalDetails", "websites"],
      main: ["experience", "education", "skills", "strengths", "additionalSkills", "projects", "certifications", "awards", "publications", "volunteering", "affiliations", "interests", "additionalInfo", "custom"]
    },
    defaults: { fontSize: 1, fontFamily: "Inter", sectionSpacing: 1.2, paragraphSpacing: 1.2, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  /*
  {
    id: "crimson-professional",
    name: "Crimson Professional",
    thumbnail: "/templates/placeholder.png",
    description: "A bold, modern professional layout with a crimson header and structured two-column content area.",
    tags: ["Modern", "Professional", "2-Column"],
    defaultColor: "#c0392b",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#c0392b", "#e74c3c", "#96281b", "#1a1a1a"],
    theme: { background: "#ffffff", text: "#1a1a1a" },
    layout: {
      sidebar: ["summary", "skills", "personalDetails"],
      main: ["experience", "education", "projects", "certifications", "additionalInfo", "custom"]
    },
    defaults: { fontSize: 1, fontFamily: "Inter", sectionSpacing: 1.1, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  */
  /*
  {
    id: "emerald-prestige",
    name: "Emerald Prestige",
    thumbnail: "/templates/emerald-prestige.png",
    description: "A premium high-contrast template with a deep emerald sidebar, featuring dedicated blocks for key achievements and training.",
    tags: ["Premium", "Executive", "2-Column"],
    defaultColor: "#055052",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#055052", "#003b46", "#072e33", "#2c3e50"],
    theme: { background: "#ffffff", text: "#1a1a1a", sidebarBackground: "#055052", sidebarText: "#ffffff" },
    layout: {
      main: ["summary", "experience", "languages", "interests", "custom"],
      sidebar: ["keyAchievements", "education", "skills", "certifications"]
    },
    defaults: { fontSize: 0.95, fontFamily: "Inter", sectionSpacing: 1.2, paragraphSpacing: 1.1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  */
  {
    id: "sage-split",
    name: "Sage Split",
    thumbnail: "/templates/sage-split.png",
    description: "A serene 2-column layout with a soft sage-green sidebar and elegant circular photo header.",
    tags: ["2-Column", "Modern", "Creative", "Simple"],
    defaultColor: "#7d9070",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#7d9070", "#6b8e23", "#556b2f", "#2c3e50"],
    theme: { background: "#ffffff", text: "#333333", sidebarBackground: "#e3eadd" },
    layout: {
      sidebar: ["summary", "contact", "skills", "strengths", "additionalSkills", "languages", "interests", "certifications"],
      main: ["education", "experience", "projects", "awards", "volunteer", "publications", "custom"]
    },
    defaults: { fontSize: 0.95, fontFamily: "Inter", sectionSpacing: 1.2, paragraphSpacing: 1.1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "emerald-insight",
    name: "Emerald Insight",
    thumbnail: "/templates/emerald-insight.png",
    description: "A professional and serene 2-column layout with a distinct emerald header and light-tinted sidebar for clear navigation.",
    tags: ["2-Column", "Modern", "Creative", "Professional"],
    defaultColor: "#687c68",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#687c68", "#556b2f", "#4f7942", "#2e8b57"],
    theme: { background: "#ffffff", text: "#333333", sidebarBackground: "#e4f0e4" },
    layout: {
      left: ["summary", "experience", "projects", "awards", "volunteer", "publications", "custom", "additionalInfo"],
      right: ["education", "skills", "strengths", "additionalSkills", "contact", "websites", "languages", "certifications", "software", "interests"]
    },
    defaults: { fontSize: 0.95, fontFamily: "Inter", sectionSpacing: 1.2, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "artistic-graphic",
    name: "Artistic Graphic",
    thumbnail: "/templates/artistic-graphic.png",
    description: "A bold, high-contrast creative design featuring a dark forest green sidebar, rounded labels, and uniquely overlapping layout elements.",
    tags: ["2-Column", "Creative", "Bold"],
    defaultColor: "#0b201a",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#0b201a", "#1a3a3a", "#2d2d2d", "#3b2f2f"],
    theme: { background: "#ffffff", text: "#1a1a1a", sidebarBackground: "#0b201a", sidebarText: "#ffffff", accent: "#b8c4a4" },
    layout: {
      sidebar: ["summary", "skills", "strengths", "additionalSkills", "education", "languages", "certifications", "software", "interests", "contact", "websites"],
      main: ["experience", "projects", "awards", "volunteer", "publications", "custom", "additionalInfo"]
    },
    defaults: { fontSize: 0.95, fontFamily: "Inter", sectionSpacing: 1.2, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "majestic-plum",
    name: "Majestic Plum",
    thumbnail: "/templates/majestic-plum.png",
    description: "A professional 2-column layout with a deep plum sidebar, serif typography, and clear section iconography.",
    tags: ["2-Column", "Corporate", "Serif", "Professional"],
    defaultColor: "#5a2d6e",
    defaultFont: "Playfair Display",
    recommendedColors: ["#5a2d6e", "#4A154B", "#1e293b", "#2d2d2d"],
    theme: { background: "#ffffff", text: "#222222", sidebarBackground: "#5a2d6e", sidebarText: "#ffffff" },
    layout: {
      left: ['contact', 'skills', 'additionalSkills', 'strengths', 'languages', 'certifications', 'software', 'interests', 'websites'],
      right: ['summary', 'education', 'experience', 'projects', 'awards', 'volunteer', 'publications', 'custom', 'additionalInfo']
    },
    defaults: { fontSize: 0.9, fontFamily: "Playfair Display", sectionSpacing: 1.1, paragraphSpacing: 1, lineHeight: 1.6, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "amber-circles",
    name: "Amber Circles",
    thumbnail: "/templates/amber-circles.png",
    description: "A playful yet professional geometric design featuring amber accents, circular motifs, and a dynamic 2-column layout.",
    tags: ["2-Column", "Creative", "Geometric"],
    defaultColor: "#f59e0b",
    defaultFont: "'Outfit', sans-serif",
    recommendedColors: ["#f59e0b", "#f97316", "#ef4444", "#8b5cf6"],
    theme: { background: "#ffffff", text: "#1c1917", sidebarBackground: "#ffffff", sidebarText: "#1c1917", accent: "#f59e0b" },
    layout: {
      left: ['summary', 'education', 'languages', 'contact', 'websites'],
      right: ['skills', 'experience', 'projects', 'references', 'awards', 'volunteer', 'publications', 'certifications', 'strengths', 'additionalSkills', 'software', 'interests', 'custom', 'additionalInfo']
    },
    defaults: { fontSize: 0.95, fontFamily: "Outfit", sectionSpacing: 1.2, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  /*
  {
    id: "nude-harmony",
    name: "Nude Harmony",
    thumbnail: "/templates/nude-harmony.png",
    description: "A soft, elegant 2-column layout with a sophisticated beige and nude color palette, perfect for modern creative roles.",
    tags: ["2-Column", "Minimalist", "Elegant", "Simple", "Modern"],
    defaultColor: "#d6b6a4",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#d6b6a4", "#e0c3fc", "#b9fbc0", "#fbf8cc"],
    theme: { background: "#ffffff", text: "#1a1a1a", sidebarBackground: "#f5f5f5", sidebarText: "#1a1a1a", accent: "#d6b6a4" },
    layout: {
      left: ['contact', 'languages', 'skills', 'certifications', 'software', 'interests', 'websites'],
      right: ['summary', 'education', 'experience', 'projects', 'awards', 'volunteer', 'publications', 'custom', 'additionalInfo']
    },
    defaults: { fontSize: 0.95, fontFamily: "Inter", sectionSpacing: 1.2, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  */
  /*
  {
    id: "cerulean-circle",
    name: "Cerulean Circle",
    thumbnail: "/templates/cerulean-circle.png",
    description: "A professional two-column design with a striking dark teal sidebar and a modern circular profile picture slot.",
    tags: ["2-Column", "Modern", "Creative"],
    defaultColor: "#105a74",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#105a74", "#1e293b", "#0f172a"],
    theme: { background: "#ffffff", text: "#1e293b", sidebarBackground: "#105a74", sidebarText: "#ffffff", accent: "#105a74" },
    layout: {
      left: ['education', 'skills', 'references', 'awards', 'languages', 'certifications'],
      right: ['summary', 'experience', 'projects', 'volunteer', 'publications', 'custom', 'additionalInfo']
    },
    defaults: { fontSize: 0.95, fontFamily: "Inter", sectionSpacing: 1.2, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  */
  {
    id: "ochre-executive",
    name: "Ochre Executive (Timeline Spine)",
    thumbnail: "/templates/placeholder.png",
    description: "A professional executive layout featuring a rich ochre accent palette and a unique dual-column timeline structure.",
    tags: ["2-Column", "Executive", "Timeline", "Premium"],
    defaultColor: "#c29b40",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#c29b40", "#1e293b", "#0f172a", "#334155"],
    theme: { background: "#ffffff", text: "#1a1a1a" },
    layout: {
      left: ["summary", "experience", "education"],
      right: ["skills", "careerTimeline", "projects", "languages"]
    },
    defaults: { fontSize: 0.95, fontFamily: "Inter", sectionSpacing: 1.2, paragraphSpacing: 1.1, lineHeight: 1.55, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "azure-executive",
    name: "Azure Executive (Modern Pro)",
    thumbnail: "/templates/placeholder.png",
    description: "A clean, high-impact executive layout featuring cobalt blue accents, a structured side-spine career timeline, and high-visibility header typography.",
    tags: ["2-Column", "Executive", "Modern", "Professional"],
    defaultColor: "#1e40af",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#1e40af", "#2563eb", "#1e293b", "#0f172a"],
    theme: { background: "#ffffff", text: "#1a1a1a" },
    layout: {
      left: ["skills", "careerTimeline", "languages"],
      right: ["summary", "experience", "education", "projects", "certifications"]
    },
    defaults: { fontSize: 0.95, fontFamily: "Inter", sectionSpacing: 1.3, paragraphSpacing: 1.2, lineHeight: 1.6, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "amber-elite",
    name: "Amber Elite (Corporate Sidebar)",
    thumbnail: "/templates/placeholder.png",
    description: "A premium high-contrast template featuring a dark navy sidebar, bold amber accents, and a distinctive timeline-inspired work experience layout.",
    tags: ["2-Column", "Corporate", "Premium", "Sidebar"],
    defaultColor: "#ffc107",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#ffc107", "#ff9800", "#1e293b", "#0f172a"],
    theme: { background: "#ffffff", text: "#1a1a1a" },
    layout: {
      left: ["contact", "education", "skills", "certifications", "languages"],
      right: ["summary", "experience", "projects", "volunteer"]
    },
    defaults: { fontSize: 0.95, fontFamily: "Inter", sectionSpacing: 1.4, paragraphSpacing: 1.2, lineHeight: 1.6, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "academic-latex",
    name: "Academic LaTeX",
    thumbnail: "/templates/placeholder.png",
    description: "A clean, academic-focused template inspired by LaTeX formatting.",
    tags: ["Academic", "LaTeX", "Clean", "Professional"],
    defaultColor: "#1a1a1a",
    defaultFont: "'EB Garamond', serif",
    recommendedColors: ["#1a1a1a", "#2c3e50", "#333333"],
    theme: { background: "#ffffff", text: "#1a1a1a" },
    layout: {
      main: ["summary", "experience", "education", "projects", "skills", "certifications", "custom"]
    },
    defaults: { fontSize: 0.95, fontFamily: "EB Garamond", sectionSpacing: 1.1, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "academic-two-column",
    name: "Academic Two Column",
    thumbnail: "/templates/placeholder.png",
    description: "A professional academic template with a clean two-column layout.",
    tags: ["Academic", "2-Column", "Clean", "Professional"],
    defaultColor: "#1a1a1a",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#1a1a1a", "#2c3e50", "#334155"],
    theme: { background: "#ffffff", text: "#1a1a1a" },
    layout: {
      left: ["education", "skills"],
      main: ["experience", "projects", "awards", "custom"]
    },
    defaults: { fontSize: 1, fontFamily: "Inter", sectionSpacing: 1, paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  },
  {
    id: "slate-classic",
    name: "Slate Classic",
    thumbnail: "/templates/placeholder.png",
    description: "A professional 1-column layout with a slate color palette and clean typography.",
    tags: ["1-Column", "Slate", "Classic", "Professional"],
    defaultColor: "#334155",
    defaultFont: "'Inter', sans-serif",
    recommendedColors: ["#334155", "#475569", "#1e293b", "#0f172a"],
    theme: { background: "#ffffff", text: "#334155" },
    layout: {
      sidebar: ["summary", "contact", "personalDetails", "websites", "skills", "strengths", "additionalSkills", "languages", "software", "interests", "affiliations", "additionalInfo"],
      main: ["experience", "education", "projects", "certifications", "awards", "volunteering", "publications", "references", "custom"]
    },
    defaults: { fontSize: 1, fontFamily: "Inter", sectionSpacing: 1, paragraphSpacing: 1, lineHeight: 1.6, letterSpacing: 0, pageMargin: 40 },
    useRootPadding: false
  }
];


export const getTemplateById = (id) => templatesConfig.find(t => t.id === id);
