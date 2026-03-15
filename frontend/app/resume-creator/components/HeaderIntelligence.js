/**
 * HeaderIntelligence.js
 * 
 * Contains logic for "CEO-level" smart recommendations in the resume header:
 * - Location Sync (Country -> Phone Code / State Dropdown)
 * - Title Case & Impactful Title Suggestions
 * - Professionalism Audit & Link Formatting
 */

// --- API: World-wide Location Intelligence (Fetch real-time data) ---
export const fetchAllCountries = async () => {
    try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/iso');
        const data = await response.json();
        return data.data.map(c => c.name).sort();
    } catch (err) {
        console.error("Countries API Error:", err);
        return Object.keys(LOCATION_DATA); // Fallback to our hardcoded list
    }
};

export const fetchStatesForCountry = async (country) => {
    try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country })
        });
        const data = await response.json();
        return data.data.states.map(s => s.name).sort();
    } catch (err) {
        console.error("States API Error:", err);
        return LOCATION_DATA[country]?.states || [];
    }
};

export const fetchCitiesForState = async (country, state) => {
    try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country, state })
        });
        const data = await response.json();
        return data.data.sort();
    } catch (err) {
        console.error("Cities API Error:", err);
        return [];
    }
};

// --- DATA: Initial Common Countries (for fast loading) ---
export const LOCATION_DATA = {
    "India": {
        phoneCode: "+91",
        states: [
            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
            "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
            "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
            "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
        ],
        zipFormat: /^\d{6}$/
    },
    "United States": {
        phoneCode: "+1",
        states: [
            "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
            "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
            "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
            "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
            "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
            "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
            "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
        ],
        zipFormat: /^\d{5}(-\d{4})?$/
    },
    "United Kingdom": {
        phoneCode: "+44",
        states: ["England", "Scotland", "Wales", "Northern Ireland"],
        zipFormat: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i
    }
};

// --- DATA: Phone Code to Country Mapping ---
export const PHONE_TO_COUNTRY = {
    "+91": "India",
    "+1": "United States",
    "+44": "United Kingdom",
    "+61": "Australia",
    "+1-": "Canada", // Canada also uses +1
    "+971": "United Arab Emirates",
    "+65": "Singapore",
    "+49": "Germany",
    "+33": "France",
    "+81": "Japan",
    "+86": "China",
    "+55": "Brazil",
    "+27": "South Africa"
};

// --- DATA: Title Level-Up Suggestions ---
export const TITLE_SUGGESTIONS = {
    "developer": ["Full Stack Engineer", "Software Architect", "Frontend Specialist"],
    "software engineer": ["Senior Systems Engineer", "Tech Lead", "Backend Architect"],
    "manager": ["Operations Lead", "Strategic Manager", "Product Director"],
    "marketing": ["Growth Marketing Specialist", "Brand Strategist", "Market Analyst"],
    "sales": ["Business Development Lead", "Account Executive", "Revenue Growth Specialist"],
    "designer": ["Product Designer", "UX/UI Strategist", "Visual Experience Designer"],
    "student": ["Aspiring Professional", "Junior Associate", "Research Fellow"],
    "intern": ["Project Associate", "Junior Specialist", "Management Trainee"]
};

// --- UTILITY: String Helpers ---
export const toTitleCase = (str) => {
    if (!str) return "";
    return str.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

// --- UTILITY: Professionalism Audit ---
export const auditEmail = (email, fullName) => {
    if (!email) return null;

    const unprofessionalKeywords = ['cool', 'sexy', 'hot', 'guy', 'girl', 'boy', 'gamer', 'player', 'king', 'queen'];
    const lowerEmail = email.toLowerCase();

    // Check for excessive numbers
    const numberCount = (email.match(/\d/g) || []).length;
    if (numberCount > 3) {
        return "Tip: Professional emails usually avoid using more than 2-3 numbers.";
    }

    // Check for slang/unprofessional keywords
    if (unprofessionalKeywords.some(word => lowerEmail.includes(word))) {
        return "Tip: Use a clean email with your name for 20% higher response rates.";
    }

    return null; // All good
};

// --- UTILITY: Professional Email Suggestion ---
export const suggestEmail = (fullName) => {
    if (!fullName) return "";
    const cleanName = fullName.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(" ");
    if (cleanName.length < 2) return `${cleanName[0]}.job@gmail.com`;
    return `${cleanName[0]}.${cleanName[cleanName.length - 1]}@gmail.com`;
};

// --- UTILITY: Social Formatting ---
export const formatSocialLink = (platform, value) => {
    if (!value) return "";
    if (value.startsWith('http')) return value;

    const domains = {
        linkedin: "linkedin.com/in/",
        github: "github.com/",
        website: ""
    };

    return `https://${domains[platform]}${value.replace(/@/g, '')}`;
};

import { fetchAuthenticatedAI } from '../utils/aiApi';

// --- UTILITY: AI Smart Advice (GPT-4) ---
export const getAIHeaderAdvice = async (type, value, context = {}) => {
    try {
        console.log(`[AI DEBUG] Requesting: ${type} for "${value}"`, context);
        const response = await fetchAuthenticatedAI('/resumy/api/ai/header-intelligence', {
            method: 'POST',
            body: JSON.stringify({ type, value, context })
        });
        
        if (!response.ok) {
            console.error(`[AI DEBUG] HTTP Error: ${response.status}`);
            return value || null;
        }

        const data = await response.json();
        console.log(`[AI DEBUG] Received:`, data.result);
        return data.result;
    } catch (err) {
        console.error("AI Intelligence Error:", err);
        return null;
    }
};

// --- UTILITY: Reverse Geocode (Zippopotam.us API) ---
export const reverseGeocode = async (zip, country = "in") => {
    try {
        // Normalize country for Zippo
        let countryCode = "in";
        const lowerCountry = country?.toLowerCase() || "";

        if (lowerCountry === "india") countryCode = "in";
        else if (lowerCountry === "united states") countryCode = "us";
        else if (lowerCountry === "united kingdom") countryCode = "gb";
        else if (lowerCountry === "canada") countryCode = "ca";
        else if (lowerCountry === "australia") countryCode = "au";
        else countryCode = "in";

        const response = await fetch(`https://api.zippopotam.us/${countryCode}/${zip}`);
        if (!response.ok) return null;

        const data = await response.json();
        const place = data.places[0];

        return {
            city: place['place name'],
            state: place['state'],
            country: data.country
        };
    } catch (err) {
        console.error("Zippo API Error:", err);
        return null;
    }
};

export const findCountryByPhone = (phone) => {
    if (!phone || phone.length < 2) return null;
    const codes = Object.keys(PHONE_TO_COUNTRY).sort((a, b) => b.length - a.length); // Longest first
    for (const code of codes) {
        if (phone.startsWith(code)) return PHONE_TO_COUNTRY[code];
    }
    return null;
};
