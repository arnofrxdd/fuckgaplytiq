export interface AiraChoice {
    label: string;       // Button label shown to user
    value: string;       // Message sent when user clicks
}

export interface AiraResult {
    type: 'text' | 'tool_call';
    content: string;
    statusUpdates: string[];
    patch?: any;
    navigation?: number;
    choices?: AiraChoice[];   // Optional quick-reply buttons
}

export const SECTION_SCHEMAS = {

    // ── Step 1 ───────────────────────────────────────────────────────────────
    personal: {
        description: "Personal information and contact details (also known as Header). Also includes optional personal details like DOB, nationality, gender etc.",
        isListSection: false,
        fields: {
            // Core header
            name: "Full name",
            jobTitle: "Profession / job title (e.g. Sales Manager)",
            email: "Email address",
            phone: "Contact phone number",
            city: "City of residence",
            state: "State or province",
            country: "Country",
            zipCode: "Postal or zip code",
            linkedin: "LinkedIn profile URL or handle",
            github: "GitHub profile URL or handle",
            website: "Personal website or portfolio URL",
            photo: "Profile photo (base64 string)",
            // Extended personal details
            dob: "Date of birth (DD/MM/YYYY)",
            nationality: "Nationality (e.g. Indian)",
            maritalStatus: "Marital status (Single / Married / Divorced / etc.)",
            visaStatus: "Visa status (e.g. Full working capabilities)",
            gender: "Gender (Male / Female / Non-binary / etc.)",
            religion: "Religion",
            passport: "Passport number",
            otherPersonal: "Other personal information",
        },
        validators: {
            email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            linkedin: (v: string) => v.includes('linkedin.com') || v.startsWith('@') || v.length > 2,
            github: (v: string) => v.includes('github.com') || v.startsWith('@') || v.length > 2,
            website: (v: string) => v.startsWith('http') || v.includes('.'),
            phone: (v: string) => /[\d\s\-\+\(\)]{7,}/.test(v),
        }
    },

    // ── Step 2 ───────────────────────────────────────────────────────────────
    education: {
        description: "Education history, degrees, and institutions. LIST section.",
        isListSection: true,
        fields: {
            school: "Name of the school or university",
            degree: "Type of degree (e.g. Bachelor of Science)",
            field: "Major or field of study",
            city: "City/location of the institution",
            grade: "Percentage or GPA (e.g. 3.8 GPA)",
            startMonth: "Month started (e.g. September)",
            startYear: "Year started (e.g. 2018)",
            endMonth: "Month graduated (e.g. May)",
            endYear: "Year graduated (e.g. 2022)",
            description: "Additional details, honors, coursework (HTML string)",
        }
    },

    // ── Step 3 ───────────────────────────────────────────────────────────────
    experience: {
        description: "Work experience and professional history. LIST section.",
        isListSection: true,
        fields: {
            title: "Job title (e.g. Graphic Designer)",
            company: "Employer / company name",
            location: "Job location (e.g. New York, NY)",
            isRemote: "Boolean: remote position?",
            startMonth: "Month started (e.g. January)",
            startYear: "Year started (e.g. 2020)",
            isCurrent: "Boolean: currently working here?",
            endMonth: "Month ended",
            endYear: "Year ended",
            description: "Achievements and responsibilities (HTML string)",
        }
    },

    // ── Step 4 ───────────────────────────────────────────────────────────────
    skills: {
        description: "Technical and soft skills. LIST section — each item has a name and level (1–5).",
        isListSection: true,
        fields: {
            name: "Skill name",
            level: "Proficiency level (1–5)",
        }
    },

    strengths: {
        description: "Key strengths. LIST section — each item has a name and level (1–5).",
        isListSection: true,
        fields: {
            name: "Strength name",
            level: "Proficiency level (1–5)",
        }
    },

    additionalSkills: {
        description: "Additional skills beyond the main skills list. LIST section.",
        isListSection: true,
        fields: {
            name: "Skill name",
            level: "Proficiency level (1–5)",
        }
    },

    // ── Step 5 ───────────────────────────────────────────────────────────────
    summary: {
        description: "Professional summary / elevator pitch. Single HTML string field, NOT a list.",
        isListSection: false,
        fields: {
            content: "Professional summary text (HTML string)",
        }
    },

    // ── Extra sections (Step 11+) ─────────────────────────────────────────────
    projects: {
        description: "Personal or professional projects. LIST section.",
        isListSection: true,
        fields: {
            title: "Project title",
            link: "Project URL or repo link",
            startYear: "Year started",
            endYear: "Year ended",
            isCurrent: "Boolean: currently working on this?",
            technologies: "Technologies used (array of strings, e.g. ['React', 'Node.js'])",
            description: "Project description, features, achievements (HTML string)",
        }
    },

    languages: {
        description: "Language proficiency. LIST section — each item has a name and level (1–5).",
        isListSection: true,
        fields: {
            name: "Language name (e.g. English, French)",
            level: "Proficiency level: 1 (Beginner) to 5 (Native)",
        }
    },

    certifications: {
        description: "Professional certifications and licenses. LIST section.",
        isListSection: true,
        fields: {
            name: "Certification name (e.g. AWS Solutions Architect)",
            date: "Date obtained (e.g. 2023)",
            issuer: "Issuing authority (e.g. Amazon Web Services)",
            description: "Key topics or achievements (HTML string)",
        }
    },

    software: {
        description: "Software tools and technical proficiency. LIST section.",
        isListSection: true,
        fields: {
            name: "Software or tool name (e.g. Microsoft Excel)",
            rating: "Proficiency rating (1–5)",
            description: "Details or key projects (HTML string)",
        }
    },

    keyAchievements: {
        description: "High-impact career wins and accolades. LIST section.",
        isListSection: true,
        fields: {
            name: "Achievement or award name (e.g. Employee of the Month)",
            description: "Context about the achievement (HTML string)",
        }
    },

    accomplishments: {
        description: "Unique achievements and recognition. LIST section.",
        isListSection: true,
        fields: {
            name: "Title (e.g. Employee of the Month)",
            description: "Context or details — optional (HTML string)",
        }
    },

    affiliations: {
        description: "Professional memberships and organizations. LIST section.",
        isListSection: true,
        fields: {
            name: "Organization name (e.g. Rotary International)",
            description: "Membership details or your role (HTML string)",
        }
    },

    interests: {
        description: "Personal hobbies and interests. LIST section — array of plain strings.",
        isListSection: true,
        fields: {
            name: "Interest or hobby (e.g. Photography, Travelling)",
        }
    },

    websites: {
        description: "Additional web links and portfolios. LIST section.",
        isListSection: true,
        fields: {
            url: "The actual link/URL",
            label: "Label for the link (e.g. Portfolio)",
            addToHeader: "Boolean: display this link in the main header?",
        }
    },

    // ── Scalar extra fields ───────────────────────────────────────────────────
    additionalInfo: {
        description: "Miscellaneous additional information. Single HTML string field, NOT a list.",
        isListSection: false,
        fields: {
            content: "Flexible text area for optional content (HTML string)",
        }
    },

    customSection: {
        description: "User-defined custom section with a title and free-form content.",
        isListSection: false,
        fields: {
            title: "User-defined section title (e.g. Publications)",
            content: "Body of the custom section (HTML string)",
            isVisible: "Boolean: whether the section is visible",
        }
    },

} as const;

export type SectionKey = keyof typeof SECTION_SCHEMAS;

// ─────────────────────────────────────────────────────────────────────────────
// Important fields for completeness nudges
// ─────────────────────────────────────────────────────────────────────────────

export const IMPORTANT_FIELDS: Partial<Record<SectionKey, string[]>> = {
    personal: ['name', 'jobTitle', 'email', 'phone', 'city'],
    education: ['school', 'degree', 'field', 'endYear'],
    experience: ['title', 'company', 'startYear'],
    skills: ['name'],
    summary: ['content'],
    projects: ['title', 'description'],
    certifications: ['name', 'issuer'],
    languages: ['name', 'level'],
};

// ─────────────────────────────────────────────────────────────────────────────
// Section → stepper navigation mapping
// ─────────────────────────────────────────────────────────────────────────────

export const SECTION_TO_STEP: Record<string, number> = {
    personal: 1,
    education: 2,
    experience: 3,
    skills: 4,
    summary: 5,
    // All extra sections map to the extra step
    projects: 6,
    languages: 6,
    certifications: 6,
    software: 6,
    keyAchievements: 6,
    accomplishments: 6,
    affiliations: 6,
    interests: 6,
    websites: 6,
    additionalInfo: 6,
    customSection: 6,
    strengths: 6,
    additionalSkills: 6,
};