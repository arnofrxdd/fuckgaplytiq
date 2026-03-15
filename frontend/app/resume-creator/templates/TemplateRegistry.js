import dynamic from "next/dynamic";

// --- DYNAMIC LOAD TEMPLATE COMPONENTS ---
// Using next/dynamic for better Next.js integration and to resolve the "Component is not a function" error
const CreativeMarketing = dynamic(() => import("./CreativeMarketing/CreativeMarketing"), { ssr: false });
// const ExecutiveSidebar = dynamic(() => import("./ExecutiveSidebar/ExecutiveSidebar"), { ssr: false });
// const IconicTimeline = dynamic(() => import("./IconicTimeline/IconicTimeline"), { ssr: false });
const AzureModern = dynamic(() => import("./AzureModern/AzureModern"), { ssr: false });

const OnyxModern = dynamic(() => import("./OnyxModern/OnyxModern"), { ssr: false });
const SapphireGrid = dynamic(() => import("./SapphireGrid/SapphireGrid"), { ssr: false });
const AuraPastel = dynamic(() => import("./AuraPastel/AuraPastel"), { ssr: false });
const StrategicLeader = dynamic(() => import("./StrategicLeader/StrategicLeader"), { ssr: false });
const CorporateTimeline = dynamic(() => import("./CorporateTimeline/CorporateTimeline"), { ssr: false });
const ClassicExecutive = dynamic(() => import("./ClassicExecutive/ClassicExecutive"), { ssr: false });
const ObsidianEdge = dynamic(() => import("./ObsidianEdge/ObsidianEdge"), { ssr: false });
const NavyProfessional = dynamic(() => import("./NavyProfessional/NavyProfessional"), { ssr: false });
// const ExecutiveTeal = dynamic(() => import("./ExecutiveTeal/ExecutiveTeal"), { ssr: false });
const DarkEdge = dynamic(() => import("./DarkEdge/DarkEdge"), { ssr: false });
const ClearVista = dynamic(() => import("./ClearVista/ClearVista"), { ssr: false });
const EmeraldElite = dynamic(() => import("./EmeraldElite/EmeraldElite"), { ssr: false });
const RubyRibbon = dynamic(() => import("./RubyRibbon/RubyRibbon"), { ssr: false });
// const AmberGraphite = dynamic(() => import("./AmberGraphite/AmberGraphite"), { ssr: false });
const SilverSerif = dynamic(() => import("./SilverSerif/SilverSerif"), { ssr: false });
const AzureSkyline = dynamic(() => import("./AzureSkyline/AzureSkyline"), { ssr: false });
const LavenderLuxe = dynamic(() => import("./LavenderLuxe/LavenderLuxe"), { ssr: false });
// const CrimsonProfessional = dynamic(() => import("./CrimsonProfessional/CrimsonProfessional"), { ssr: false });
// const EmeraldPrestige = dynamic(() => import("./EmeraldPrestige/EmeraldPrestige"), { ssr: false });
const JadeHeritage = dynamic(() => import("./JadeHeritage/JadeHeritage"), { ssr: false });
const SageSplit = dynamic(() => import("./SageSplit/SageSplit"), { ssr: false });
const EmeraldInsight = dynamic(() => import("./EmeraldInsight/EmeraldInsight"), { ssr: false });
const MajesticPlum = dynamic(() => import("./MajesticPlum/MajesticPlum"), { ssr: false });
const ArtisticGraphic = dynamic(() => import("./ArtisticGraphic/ArtisticGraphic"), { ssr: false });
const AmberCircles = dynamic(() => import("./AmberCircles/AmberCircles"), { ssr: false });
const NudeHarmony = dynamic(() => import("./NudeHarmony/NudeHarmony"), { ssr: false });
const CeruleanCircle = dynamic(() => import("./CeruleanCircle/CeruleanCircle"), { ssr: false });
const OchreExecutive = dynamic(() => import("./OchreExecutive/OchreExecutive"), { ssr: false });
const AzureExecutive = dynamic(() => import("./AzureExecutive/AzureExecutive"), { ssr: false });
const AmberElite = dynamic(() => import("./AmberElite/AmberElite"), { ssr: false });
const AcademicLatex = dynamic(() => import("./AcademicLatex/AcademicLatex"), { ssr: false });
const AcademicTwoColumn = dynamic(() => import("./AcademicTwoColumn/AcademicTwoColumn"), { ssr: false });
const SlateClassic = dynamic(() => import("./SlateClassic/SlateClassic"), { ssr: false });



const TEMPLATE_COMPONENTS = {
    "creative-marketing": CreativeMarketing,
    // "iconic-timeline": IconicTimeline,
    "azure-modern": AzureModern,
    "onyx-modern": OnyxModern,
    "sapphire-grid": SapphireGrid,
    "aura-pastel": AuraPastel,
    "strategic-leader": StrategicLeader,
    "corporate-timeline": CorporateTimeline,
    "classic-executive": ClassicExecutive,
    "obsidian-edge": ObsidianEdge,
    "navy-professional": NavyProfessional,
    // "executive-teal": ExecutiveTeal,
    "dark-edge": DarkEdge,
    "clear-vista": ClearVista,
    "emerald-elite": EmeraldElite,
    "ruby-ribbon": RubyRibbon,
    // "amber-graphite": AmberGraphite,
    "silver-serif": SilverSerif,
    "azure-skyline": AzureSkyline,
    "lavender-luxe": LavenderLuxe,
    // "crimson-professional": CrimsonProfessional,
    // "emerald-prestige": EmeraldPrestige,
    "jade-heritage": JadeHeritage,
    "sage-split": SageSplit,
    "emerald-insight": EmeraldInsight,
    "artistic-graphic": ArtisticGraphic,
    "majestic-plum": MajesticPlum,
    "amber-circles": AmberCircles,
    "nude-harmony": NudeHarmony,
    "cerulean-circle": CeruleanCircle,
    "ochre-executive": OchreExecutive,
    "azure-executive": AzureExecutive,
    "amber-elite": AmberElite,
    "academic-latex": AcademicLatex,
    "academic-two-column": AcademicTwoColumn,
    "slate-classic": SlateClassic,


};

export default TEMPLATE_COMPONENTS;
