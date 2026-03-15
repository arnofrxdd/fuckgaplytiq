import OpenAI from 'openai';
import { AIConsumptionTracker } from './aiConsumptionTracker';

// Initialize OpenAI with your environment variable
const apiKey = process.env.OPENAI_RESUME_API_KEY || process.env.ATS_BUILDER_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("❌ OpenAI API Key is MISSING in resumeBuilder.service.ts");
} else {
  console.log(`✅ OpenAI API Key Loaded: ...${apiKey.slice(-4)}`);
}

const openai = new OpenAI({
  apiKey: apiKey,
});

export const generateDescriptions = async (jobTitle: string, user?: { id?: string; email?: string }) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a professional resume writer. Generate 20 distinct, high-impact, action-oriented resume bullet points for the specific job title provided. Return the response strictly as a JSON object with a key 'descriptions' containing an array of strings."
      },
      { role: "user", content: `Job Title: ${jobTitle}` }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  if (completion.usage) {
    AIConsumptionTracker.logUsage({
      userId: user?.id,
      userEmail: user?.email,
      featureName: 'generate_descriptions',
      modelName: 'gpt-4o-mini',
      provider: 'openai',
      promptTokens: completion.usage.prompt_tokens,
      completionTokens: completion.usage.completion_tokens,
      totalTokens: completion.usage.total_tokens,
      estimatedCostUsd: AIConsumptionTracker.calculateCost('gpt-4o-mini', completion.usage.prompt_tokens, completion.usage.completion_tokens)
    });
  }

  return JSON.parse(completion.choices[0].message.content || '{}');
};

export const generateSkills = async (jobTitle: string, user?: { id?: string; email?: string }) => {
  console.log(`Attempting to generate skills for: ${jobTitle}`);
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a career expert. Generate a list of 20 relevant hard and soft skills for the job title provided. Return strictly a JSON object with a key 'skills' containing an array of short strings (1-3 words max)."
        },
        { role: "user", content: `Job Title: ${jobTitle}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    if (completion.usage) {
      AIConsumptionTracker.logUsage({
        userId: user?.id,
        userEmail: user?.email,
        featureName: 'generate_skills',
        modelName: 'gpt-4o-mini',
        provider: 'openai',
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
        estimatedCostUsd: AIConsumptionTracker.calculateCost('gpt-4o-mini', completion.usage.prompt_tokens, completion.usage.completion_tokens)
      });
    }

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    console.log(`✅ Skills generated successfully for ${jobTitle}, count: ${result.skills?.length}`);
    return result;
  } catch (error) {
    console.error("❌ Error in generateSkills:", error);
    throw error;
  }
};

export const enhanceSkill = async (skillText: string, user?: { id?: string; email?: string }) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert resume writer. Provide exactly 3 professional, concise synonyms or slightly rephrased versions of the provided skill to make it sound more impactful. Return strictly a JSON object with a key 'options' containing an array of 3 strings."
      },
      { role: "user", content: `Skill: "${skillText}"` }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  if (completion.usage) {
    AIConsumptionTracker.logUsage({
      userId: user?.id,
      userEmail: user?.email,
      featureName: 'enhance_skill',
      modelName: 'gpt-4o-mini',
      provider: 'openai',
      promptTokens: completion.usage.prompt_tokens,
      completionTokens: completion.usage.completion_tokens,
      totalTokens: completion.usage.total_tokens,
      estimatedCostUsd: AIConsumptionTracker.calculateCost('gpt-4o-mini', completion.usage.prompt_tokens, completion.usage.completion_tokens)
    });
  }

  return JSON.parse(completion.choices[0].message.content || '{}');
};

export const generateSummary = async (jobTitle: string, existingSummary?: string, type?: string, user?: { id?: string; email?: string }) => {
  let systemPrompt = "";
  let userContent = "";

  if (type === 'improve' && existingSummary) {
    systemPrompt = "You are a professional resume writer. Rewrite the provided summary in 20 distinct, professional styles (e.g., executive, creative, technical, concise). Return strictly a JSON object with a key 'summaries' containing an array of strings.";
    userContent = `Existing Summary: "${existingSummary}"`;
  } else {
    systemPrompt = "You are a professional resume writer. Generate 7 distinct, high-impact resume summaries for the specific job title provided. Return strictly a JSON object with a key 'summaries' containing an array of strings.";
    userContent = `Job Title: ${jobTitle}`;
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  if (completion.usage) {
    AIConsumptionTracker.logUsage({
      userId: user?.id,
      userEmail: user?.email,
      featureName: `generate_summary_${type || 'new'}`,
      modelName: 'gpt-4o-mini',
      provider: 'openai',
      promptTokens: completion.usage.prompt_tokens,
      completionTokens: completion.usage.completion_tokens,
      totalTokens: completion.usage.total_tokens,
      estimatedCostUsd: AIConsumptionTracker.calculateCost('gpt-4o-mini', completion.usage.prompt_tokens, completion.usage.completion_tokens)
    });
  }

  return JSON.parse(completion.choices[0].message.content || '{}');
};