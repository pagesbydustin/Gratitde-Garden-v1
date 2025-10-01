'use server';

/**
 * @fileOverview AI-powered mood-based entry inspiration flow.
 *
 * - `getSimilarMoodEntries`: Retrieves previous entries with similar mood scores.
 * - `InspirationInput`: The input type for the `getSimilarMoodEntries` function, including the current mood score.
 * - `InspirationOutput`: The output type for the `getSimilarMoodEntries` function, listing similar entries.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InspirationInputSchema = z.object({
  currentMoodScore: z.number().describe('The mood score of the current entry.'),
  pastEntries: z.array(z.object({
    id: z.string(),
    moodScore: z.number(),
    text: z.string(),
  })).describe('An array of past entry objects, including their mood score and text.'),
});
export type InspirationInput = z.infer<typeof InspirationInputSchema>;

const InspirationOutputSchema = z.object({
  similarEntries: z.array(z.object({
    id: z.string(),
    text: z.string().describe('The text content of the similar entry.'),
  })).describe('An array of similar past entries.'),
});
export type InspirationOutput = z.infer<typeof InspirationOutputSchema>;

export async function getSimilarMoodEntries(input: InspirationInput): Promise<InspirationOutput> {
  return similarMoodEntriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'similarMoodEntriesPrompt',
  input: {schema: InspirationInputSchema},
  output: {schema: InspirationOutputSchema},
  prompt: `You are an AI assistant designed to find journal entries with similar mood scores.

You will be given a current mood score and a list of past entries with their mood scores.

Find the entries with mood scores that are most similar to the current mood score.

Return only the entries that are most similar, and nothing else.

Current Mood Score: {{{currentMoodScore}}}

Past Entries:{{#each pastEntries}}
Id: {{id}}
Mood Score: {{moodScore}}
Text: {{text}}
{{/each}}

Similar Entries:`, // No Handlebars await() calls in prompts.
});

const similarMoodEntriesFlow = ai.defineFlow(
  {
    name: 'similarMoodEntriesFlow',
    inputSchema: InspirationInputSchema,
    outputSchema: InspirationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
