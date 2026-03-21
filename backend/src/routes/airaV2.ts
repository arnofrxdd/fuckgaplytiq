import express from 'express';
import { handleAiraCommand } from '../services/brains/airaBrain';
import { ariaClient } from '../services/ariaAgent';

const router = express.Router();

/**
 * POST /api/aira-v2/command
 * 
 * The v2 endpoint for the Resume Creator "Aira" assistant.
 * Supports Supervisor-Worker architecture with live status updates.
 */
router.post('/command', async (req, res) => {
    try {
        const { message, data, history, stream } = req.body;
        console.log(`[AiraV2] Received command: "${message}" (Stream: ${!!stream})`);
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (stream) {
            // Server-Sent Events for live status + prose
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache, no-transform');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no');

            const flush = () => {
                if ((res as any).flush) (res as any).flush();
            };

            const onStatus = (status: string, patch?: any, navigation?: number) => {
                console.log(`[AiraV2 SSE] Status: ${status} (Patch: ${!!patch}, Nav: ${navigation})`);
                const payload: any = { type: 'status', message: status };
                if (patch) {
                    payload.type = 'patch';
                    payload.patch = patch;
                }
                if (navigation) {
                    payload.navigation = navigation;
                }
                res.write(`data: ${JSON.stringify(payload)}\n\n`);
                flush();
            };

            // Call the Aira Brain
            const result = await handleAiraCommand(ariaClient, message, data, history, onStatus);
            const { type: responseType, content, statusUpdates, patch, navigation, choices } = result;
            
            const finalPayload = { type: 'final', responseType, content, patch, statusUpdates, navigation, choices };
            console.log(`[AiraV2 SSE] Sending Final Payload:`, JSON.stringify(finalPayload, null, 2));

            // Send final result object (includes patch and final prose)
            res.write(`data: ${JSON.stringify(finalPayload)}\n\n`);
            res.write(`data: [DONE]\n\n`);
            flush();
            res.end();
        } else {
            // Standard JSON response
            const result = await handleAiraCommand(ariaClient, message, data, history);
            res.json(result);
        }

    } catch (error) {
        console.error("Error in /api/aira-v2/command:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.end();
        }
    }
});

export default router;
