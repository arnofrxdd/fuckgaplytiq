import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type } = body;

        // --- Use Backend AI (which handles OpenAI keys) ---
        const isDev = process.env.NODE_ENV === 'development';
        const backendBaseUrl = isDev ? 'http://localhost:3001' : 'http://resumy-backend:3001';
        const backendUrl = `${backendBaseUrl}/api/ai/header-intelligence`;

        console.log(`[AI PROXY] Forwarding to backend: ${backendUrl} (Type: ${type})`);

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[AI PROXY ERROR]:', response.status, errorData);
            return NextResponse.json({ error: 'AI API Error', details: errorData }, { status: response.status });
        }

        const dataRes = await response.json();
        return NextResponse.json({ result: dataRes.result });
    } catch (error: any) {
        console.error('[AI PROXY INTERNAL ERROR]:', error);
        return NextResponse.json({ error: 'Failed to process intelligence', message: error.message }, { status: 500 });
    }
}
