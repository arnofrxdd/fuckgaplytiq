/**
 * Font Configuration for Resume Templates
 * Move this to a central file for easy extension.
 */

export const RESUME_FONTS = [
    // Professional Sans-Serif
    { name: "Plus Jakarta Sans", variable: "--font-jakarta", type: "sans" },
    { name: "Inter", variable: "--font-inter", type: "sans" },
    { name: "Outfit", variable: "--font-outfit", type: "sans" },
    { name: "Montserrat", variable: "--font-montserrat", type: "sans" },
    { name: "Manrope", variable: "--font-manrope", type: "sans" },
    { name: "Sora", variable: "--font-sora", type: "sans" },
    { name: "Urbanist", variable: "--font-urbanist", type: "sans" },
    { name: "Hanken Grotesk", variable: "--font-hanken", type: "sans" },
    { name: "Instrument Sans", variable: "--font-instrument", type: "sans" },
    { name: "Work Sans", variable: "--font-work", type: "sans" },
    { name: "DM Sans", variable: "--font-dm", type: "sans" },
    { name: "Poppins", variable: "--font-poppins", type: "sans" },
    { name: "Open Sans", variable: "--font-open-sans", type: "sans" },
    { name: "Roboto", variable: "--font-roboto", type: "sans" },
    { name: "Lato", variable: "--font-lato", type: "sans" },
    { name: "Source Sans 3", variable: "--font-source-sans", type: "sans" },
    
    // Elegant Serif
    { name: "Playfair Display", variable: "--font-playfair", type: "serif" },
    { name: "Lora", variable: "--font-lora", type: "serif" },
    { name: "Fraunces", variable: "--font-fraunces", type: "serif" },
    { name: "Merriweather", variable: "--font-merriweather", type: "serif" },
    { name: "EB Garamond", variable: "--font-eb-garamond", type: "serif" },
    { name: "Libre Baskerville", variable: "--font-libre-baskerville", type: "serif" },
    { name: "Cormorant Garamond", variable: "--font-cormorant", type: "serif" },
    { name: "Spectral", variable: "--font-spectral", type: "serif" },
    { name: "Crimson Pro", variable: "--font-crimson", type: "serif" },

    // Creative & Unique
    { name: "Bricolage Grotesque", variable: "--font-bricolage", type: "creative" },
    { name: "Space Grotesk", variable: "--font-space", type: "creative" },
    { name: "Josefin Sans", variable: "--font-josefin", type: "creative" },
    { name: "Cinzel", variable: "--font-cinzel", type: "creative" },
    
    // Monospace
    { name: "JetBrains Mono", variable: "--font-mono", type: "mono" },
];

export const fontNames = RESUME_FONTS.map(f => f.name);
