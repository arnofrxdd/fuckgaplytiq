import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config();

// The user provided an OpenAI key for Aria
const ARIA_KEY = process.env.ARIA_API_KEY || process.env.OPENAI_API_KEY || process.env.ATS_BUILDER_OPENAI_API_KEY;

export const ariaClient = new OpenAI({
    apiKey: ARIA_KEY,
});

import { handleDashboardCommand } from './brains/dashboardBrain';
import { handleOnboardingCommand, OnboardingContext } from './brains/onboardingBrain';

export const handleAriaCommand = async (
    message: string,
    uiContext: any,
    history: any[] = [],
    userId: string | null = null,
    onChunk?: (text: string) => void,
    onWidget?: (widget: string, choices?: string[], showChatbox?: boolean) => void,
    onProfile?: (profile: OnboardingContext['profile']) => void
) => {
    if (!ARIA_KEY) {
        console.warn("⚠️ ERROR: Aria API key is missing.");
        return { type: 'text', content: "Aria is currently offline (API Key missing)." };
    }

    try {
        // ==========================================
        // THE MASTER ROUTER
        // ==========================================
        const currentRoute = uiContext.currentRoute || '/dashboard';

        console.log(`[Aria Router] Routing request from route: ${currentRoute} | Intent: "${message}"`);

        // route: /onboarding (Fullscreen Experience)
        if (currentRoute.includes('/onboarding')) {
            return await handleOnboardingCommand(ariaClient, message, uiContext, history, userId, onChunk, onWidget, onProfile);
        }

        // route: /resume-creator (The Editor)
        if (currentRoute.includes('/resume-creator')) {
            // FUTURE IMPLEMENTATION:
            // return await handleEditorCommand(ariaClient, message, uiContext, history, userId);
            
            // Fallback for now:
            return {
                type: 'text',
                content: "I see you're in the Resume Editor! I am still learning how to read and write directly to your draft here. Check back soon for my Editor Brain update!"
            };
        }

        // route: /interview (AI Interview Prep)
        else if (currentRoute.includes('/interview')) {
            // FUTURE IMPLEMENTATION:
            // return await handleInterviewCommand(ariaClient, message, uiContext, history, userId);
        }

        // DEFAULT: Dashboard / Template Selection Brain
        return await handleDashboardCommand(ariaClient, message, uiContext, history, userId, onChunk, onWidget, onProfile);

    } catch (error) {
        console.error("Aria Master Router Error:", error);
        return {
            type: 'text',
            content: "My routing system experienced a hiccup. Please try again."
        };
    }
};
