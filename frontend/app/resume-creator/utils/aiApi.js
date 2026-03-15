import { supabaseClient } from '@/lib/supabaseClient';

/**
 * Centered utility for making authenticated AI requests.
 * Automatically handles JWT injection if the user is signed in.
 */
export const fetchAuthenticatedAI = async (endpoint, options = {}) => {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const token = session?.access_token;

        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {})
        };

        const response = await fetch(endpoint, {
            ...options,
            headers
        });

        return response;
    } catch (err) {
        console.error(`[AI API] Error fetching ${endpoint}:`, err);
        throw err;
    }
};

/**
 * Standardized Header Intelligence Caller
 */
export const getAIHeaderAdvice = async (type, value, context = {}) => {
    try {
        const response = await fetchAuthenticatedAI('/resumy/api/ai/header-intelligence', {
            method: 'POST',
            body: JSON.stringify({ type, value, context })
        });
        
        if (!response.ok) return value || null;

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) return value || null;

        const data = await response.json();
        return data.result;
    } catch (err) {
        console.error("[AI API] Header Intelligence Error:", err);
        return null;
    }
};
