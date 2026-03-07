/**
 * Module Session Client
 * Handles tracking of user sessions within specific app modules
 */

import { supabaseClient } from './supabaseClient';

const STORAGE_KEY = 'rs_module_session_id';

/**
 * Fetch a session from localStorage
 */
export const getStoredSessionId = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
};

/**
 * Clear session from localStorage
 */
export const clearStoredSessionId = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
};

/**
 * Start a new module session
 */
export const startModuleSession = async (moduleName: string): Promise<string> => {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session?.access_token) {
            throw new Error('401: Unauthorized');
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/user/module-session/start`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ moduleName }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to start session: ${error}`);
        }

        const { sessionId } = await response.json();
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, sessionId);
        }
        return sessionId;
    } catch (error) {
        console.error('startModuleSession error:', error);
        throw error;
    }
};

/**
 * Stop an existing module session
 */
export const stopModuleSession = async (sessionId: string): Promise<void> => {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session?.access_token) {
            // If no auth, we can't tell the backend, but we should clear local state
            clearStoredSessionId();
            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/user/module-session/stop`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
            console.warn('Failed to stop module session on backend');
        }

        clearStoredSessionId();
    } catch (error) {
        console.error('stopModuleSession error:', error);
        clearStoredSessionId();
    }
};
