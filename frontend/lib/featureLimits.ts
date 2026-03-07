/**
 * Feature Limits Configuration
 * Defines types and limits for different user plans
 */

export type PlanType = 'free' | 'basic' | 'pro' | 'Free' | 'Basic' | 'Pro';

export type FeatureType =
    | 'resumeBuilds'
    | 'jdMatching'
    | 'roadmaps'
    | 'skillTests'
    | 'skillGapAnalysis'
    | 'saves'
    | 'downloads'
    | 'aiSuggestions';

export const PLAN_LIMITS: Record<PlanType, Record<FeatureType, number>> = {
    free: {
        resumeBuilds: 5,
        jdMatching: 3,
        roadmaps: 2,
        skillTests: 2,
        skillGapAnalysis: 3,
        saves: Infinity,
        downloads: 2,
        aiSuggestions: 10
    },
    Free: {
        resumeBuilds: 5,
        jdMatching: 3,
        roadmaps: 2,
        skillTests: 2,
        skillGapAnalysis: 3,
        saves: Infinity,
        downloads: 2,
        aiSuggestions: 10
    },
    basic: {
        resumeBuilds: 20,
        jdMatching: 50,
        roadmaps: 20,
        skillTests: 50,
        skillGapAnalysis: 50,
        saves: Infinity,
        downloads: 50,
        aiSuggestions: 100
    },
    Basic: {
        resumeBuilds: 20,
        jdMatching: 50,
        roadmaps: 20,
        skillTests: 50,
        skillGapAnalysis: 50,
        saves: Infinity,
        downloads: 50,
        aiSuggestions: 100
    },
    pro: {
        resumeBuilds: Infinity,
        jdMatching: Infinity,
        roadmaps: Infinity,
        skillTests: Infinity,
        skillGapAnalysis: Infinity,
        saves: Infinity,
        downloads: Infinity,
        aiSuggestions: Infinity
    },
    Pro: {
        resumeBuilds: Infinity,
        jdMatching: Infinity,
        roadmaps: Infinity,
        skillTests: Infinity,
        skillGapAnalysis: Infinity,
        saves: Infinity,
        downloads: Infinity,
        aiSuggestions: Infinity
    }
};
