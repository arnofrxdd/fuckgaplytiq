import express from 'express';
import { handleAriaCommand } from '../services/ariaAgent';
import { supabase } from '../services/supabase'; // Assuming standard auth check
import { loadOrCreateSession } from '../services/ariaHistory.service';
import { OnboardingContext } from '../services/brains/onboardingBrain';

const router = express.Router();

/**
 * GET /api/aria/history
 * Fetches the user's conversation history for a specific context.
 */
router.get('/history', async (req, res) => {
    try {
        const context = req.query.context as string || 'dashboard';
        
        let userId = null;
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        
        userId = user.id;

        const session = await loadOrCreateSession(userId, context);
        if (!session) return res.status(500).json({ error: 'Failed to load history' });

        res.json({ messages: session.messages, last_ui_state: session.last_ui_state });
    } catch (e) {
        console.error("Error fetching aria history", e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * POST /api/aria/command
 * Connects the AriaCommandHub with the AI Agent backend.
 */
router.post('/command', async (req, res) => {
    try {
        const { message, context, history, stream } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let userId = null;
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (token) {
            const { data: { user } } = await supabase.auth.getUser(token);
            userId = user?.id;
        }

        if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache, no-transform'); // no-transform disables compression
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no'); // for nginx
            
            const flush = () => {
                if ((res as any).flush) (res as any).flush();
            };

            const onChunk = async (text: string) => {
                console.log(`[Aria SSE] Sending chunk: "${text.slice(0, 10)}${text.length > 10 ? '...' : ''}"`);
                res.write(`data: ${JSON.stringify({ type: 'text_chunk', content: text })}\n\n`);
                flush();
                await new Promise(resolve => setTimeout(resolve, 15));
            };

            const onWidget = async (widget: string, choices?: string[], showChatbox?: boolean) => {
                console.log(`[Aria SSE] Sending widget: ${widget}`);
                res.write(`data: ${JSON.stringify({ type: 'widget_chunk', widget, choices, showChatbox })}\n\n`);
                flush();
            };

            const onProfile = async (profile: OnboardingContext['profile'] | undefined) => {
                console.log(`[Aria SSE] Sending profile chunk`);
                res.write(`data: ${JSON.stringify({ type: 'profile_chunk', ...profile })}\n\n`);
                flush();
            };

            const aiResponse = await handleAriaCommand(message, context, history, userId, onChunk, onWidget, onProfile);
            console.log(`[Aria SSE] FINAL AI RESPONSE OBJECT:`, JSON.stringify(aiResponse, null, 2));
            res.write(`data: ${JSON.stringify(aiResponse)}\n\n`);
            res.write(`data: [DONE]\n\n`);
            if ((res as any).flush) (res as any).flush();
            res.end();
            return;
        } else {
            const aiResponse = await handleAriaCommand(message, context, history, userId);
            res.json(aiResponse);
        }

    } catch (error: any) {
        console.error("Error in /api/aria/command:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.end();
        }
    }
});

export default router;
