import { supabase } from './supabase';

export interface AIConsumptionLog {
    userId?: string;
    userEmail?: string;
    sessionId?: string;
    featureName: string;
    modelName: string;
    provider: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
    metadata?: any;
}

export class AIConsumptionTracker {
    private static pricing: Record<string, { prompt: number; completion: number }> = {
        'mistral-large-2411': { prompt: 2 / 1000000, completion: 6 / 1000000 },
        'mistral-large-latest': { prompt: 2 / 1000000, completion: 6 / 1000000 },
        'llama-3.1-8b-instant': { prompt: 0.05 / 1000000, completion: 0.1 / 1000000 },
        'llama-3.1-70b-versatile': { prompt: 0.59 / 1000000, completion: 0.79 / 1000000 },
        'llama-3.1-405b-reasoning': { prompt: 5 / 1000000, completion: 12 / 1000000 },
        'grok-2-1212': { prompt: 2 / 1000000, completion: 10 / 1000000 },
        'grok-beta': { prompt: 5 / 1000000, completion: 15 / 1000000 },
        'gpt-4o': { prompt: 2.5 / 1000000, completion: 10 / 1000000 },
        'gpt-4o-mini': { prompt: 0.15 / 1000000, completion: 0.6 / 1000000 },
    };

    static calculateCost(model: string, promptTokens: number, completionTokens: number): number {
        const rates = this.pricing[model] || this.pricing['llama-3.1-8b-instant'];
        return (promptTokens * rates.prompt) + (completionTokens * rates.completion);
    }

    static async logUsage(log: AIConsumptionLog) {
        try {
            const { error } = await supabase
                .from('ai_consumption_logs')
                .insert([{
                    user_id: log.userId,
                    user_email: log.userEmail,
                    session_id: log.sessionId,
                    feature_name: log.featureName,
                    model_name: log.modelName,
                    provider: log.provider,
                    prompt_tokens: log.promptTokens,
                    completion_tokens: log.completionTokens,
                    total_tokens: log.totalTokens,
                    estimated_cost_usd: log.estimatedCostUsd,
                    metadata: log.metadata || {}
                }]);

            if (error) {
                console.error('[AIConsumptionTracker] Supabase Error:', error.message);
            } else {
                console.log(`[AIConsumptionTracker] Logged ${log.totalTokens} tokens for ${log.modelName} ($${log.estimatedCostUsd.toFixed(6)})`);
            }
        } catch (err) {
            console.error('[AIConsumptionTracker] Unexpected Error:', err);
        }
    }
}
