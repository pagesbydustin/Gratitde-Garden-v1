'use server';

/**
 * @fileOverview Generates a daily gratitude prompt using Genkit.
 *
 * - generateDailyPrompt - A function to generate a daily gratitude prompt.
 * - DailyPromptOutput - The output type for the generateDailyPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyPromptOutputSchema = z.object({
  prompt: z.string().describe('A unique and thoughtful gratitude prompt for the day.'),
});
export type DailyPromptOutput = z.infer<typeof DailyPromptOutputSchema>;

export async function generateDailyPrompt(): Promise<DailyPromptOutput> {
  try {
    const result = await dailyGratitudePromptFlow();
    // Ensure there's a fallback if the result is empty for any reason
    return result || { prompt: 'What is something that made you smile today?' };
  } catch (error) {
    // In case of an error, return a generic, safe-to-use prompt
    return {
      prompt: 'What is something that made you smile today?',
    };
  }
}

const prompt = ai.definePrompt({
  name: 'dailyGratitudePrompt',
  output: {schema: DailyPromptOutputSchema},
  prompt: `You are a gratitude expert. Generate a unique and thoughtful prompt to inspire a user's daily gratitude entry. The prompt should encourage reflection on different aspects of life and avoid repetition.  Do not start the prompt with "Think about".

Example Prompts:
* What is a skill you are grateful to have learned?
* What is a place that brings you comfort and joy?
* What is a small act of kindness you witnessed or experienced today?
* What is a challenge you overcame recently, and what did you learn from it?
* What is a beautiful thing you saw in nature today?
`,
});

const dailyGratitudePromptFlow = ai.defineFlow({
  name: 'dailyGratitudePromptFlow',
  outputSchema: DailyPromptOutputSchema,
}, async () => {
  const {output} = await prompt({});
  return output!;
});
