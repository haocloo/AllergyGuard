// ai sdk : https://sdk.vercel.ai/providers/ai-sdk-providers/google-generative-ai
// gemini: https://cloud.google.com/vertex-ai/generative-ai/docs/gemini-v2#2.0-flash
import { streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const taskResponseSchema = z.object({
  name: z.string(),
  category: z.enum(['work', 'personal', 'shopping', 'health', 'others']),
  primaryImage: z.string(),
  secondaryImage: z.string(),
});

export async function POST(req: Request) {
  try {
    const { systemPrompt, userPrompt } = await req.json();
    if (!systemPrompt || !userPrompt) {
      throw new Error('Prompt is required');
    }

    const result = await streamObject({
      model: google('gemini-2.0-flash-001'),
      schema: taskResponseSchema,
      maxTokens: 512,
      temperature: 0.3,
      maxRetries: 5,
      system: systemPrompt,
      prompt: userPrompt,
      onFinish: (message: any) => {},
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
