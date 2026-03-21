import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import OpenAI from 'openai';

// ── Kernel Level Global OpenAI Token Logger ──────────────────────────────────
let sessionTotalTokens = 0;
let sessionTotalCost = 0;

const PRICING = {
    'gpt-4o': { prompt: 2.50 / 1000000, completion: 10.00 / 1000000 },
    'gpt-4o-mini': { prompt: 0.15 / 1000000, completion: 0.60 / 1000000 },
    'gpt-4.1-mini': { prompt: 0.15 / 1000000, completion: 0.60 / 1000000 },
    'default': { prompt: 0.0, completion: 0.0 }
};

function logUsage(model: string, usage: any, durationMs: number) {
    if (!usage) return;
    const pTokens = usage.prompt_tokens || 0;
    const cTokens = usage.completion_tokens || 0;
    const total = usage.total_tokens || 0;
    
    let rates = PRICING['default'];
    if (model.includes('gpt-4o-mini') || model.includes('gpt-4.1-mini')) rates = PRICING['gpt-4o-mini'];
    else if (model.includes('gpt-4o')) rates = PRICING['gpt-4o'];

    const cost = (pTokens * rates.prompt) + (cTokens * rates.completion);
    
    sessionTotalTokens += total;
    sessionTotalCost += cost;

    console.log(`\n\x1b[36m[Kernel Logger] 🧠 OpenAI Request (${model})\x1b[0m`);
    console.log(`\x1b[90m ├─ Time:\x1b[0m ${durationMs}ms`);
    console.log(`\x1b[90m ├─ Tokens:\x1b[0m ${pTokens} in | ${cTokens} out = ${total} total`);
    console.log(`\x1b[90m ├─ Cost:\x1b[0m $${cost.toFixed(8)}`);
    console.log(`\x1b[90m └─ Session Total Cost:\x1b[0m \x1b[32m$${sessionTotalCost.toFixed(8)}\x1b[0m | \x1b[33m${sessionTotalTokens} tokens\x1b[0m\n`);
}

const originalCreate = OpenAI.Chat.Completions.prototype.create;
OpenAI.Chat.Completions.prototype.create = async function (this: any, body: any, options?: any) {
    const model = body.model || 'gpt-4o';
    let isStream = body.stream === true;
    
    if (isStream) {
        body.stream_options = { ...body.stream_options, include_usage: true };
    }

    const startTime = Date.now();
    const result = await originalCreate.call(this, body, options);

    if (isStream) {
        return (async function* () {
            let finalUsage: any = null;
            for await (const chunk of result as any) {
                if (chunk.usage) finalUsage = chunk.usage;
                yield chunk;
            }
            logUsage(model, finalUsage, Date.now() - startTime);
        })();
    } else {
        if ((result as any).usage) {
            logUsage(model, (result as any).usage, Date.now() - startTime);
        }
        return result;
    }
} as any;
// ─────────────────────────────────────────────────────────────────────────────

import resumeRoutes from './routes/resume';
import aiRoutes from './routes/ai';
import userRoutes from './routes/user';
import resumeBuilderRoutes from './routes/resumeBuilder.routes';
import pdfRoutes from './routes/pdfRoutes';
import templateRoutes from './routes/templates';
import ariaRoutes from './routes/aria';
import airaV2Routes from './routes/airaV2';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression());

const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://gaplytiq.com',
    'https://www.gaplytiq.com',
    'https://arnavcloud.co.in',
    'https://www.arnavcloud.co.in'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            callback(null, true);
        } else {
            console.error(`[CORS Error] Origin ${origin} not allowed`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req: Request, res: Response) => {
    res.send('Resume Builder Backend Running');
});

// Minimal routes for standalone Resume Builder
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/user', userRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/aria', ariaRoutes);
app.use('/api/aira-v2', airaV2Routes);
app.use('/api', resumeBuilderRoutes);
app.use('/api/pdf', pdfRoutes);

app.get('/api/health', (_: Request, res: Response) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
    console.log(' Resume Builder Backend running on http://localhost:' + PORT);
});
