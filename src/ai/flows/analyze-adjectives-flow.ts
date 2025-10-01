'use server';

/**
 * @fileOverview Analyzes journal entries to extract adjectives and their frequencies.
 *
 * - analyzeAdjectives - A function to analyze adjectives from journal entries.
 * - AdjectiveAnalysisInput - The input type for the analyzeAdjectives function.
 * - AdjectiveAnalysisOutput - The return type for the analyzeAdjectives function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdjectiveAnalysisInputSchema = z.object({
  entries: z.array(z.string()).describe('An array of journal entry text.'),
});
export type AdjectiveAnalysisInput = z.infer<typeof AdjectiveAnalysisInputSchema>;

const AdjectiveAnalysisOutputSchema = z.object({
  adjectives: z
    .array(
      z.object({
        adjective: z.string().describe('The adjective extracted from the text.'),
        count: z.number().describe('The frequency of the adjective.'),
      })
    )
    .describe('A list of adjectives and their frequencies.'),
});
export type AdjectiveAnalysisOutput = z.infer<typeof AdjectiveAnalysisOutputSchema>;


export async function analyzeAdjectives(
  input: AdjectiveAnalysisInput
): Promise<AdjectiveAnalysisOutput> {
  // Filter out empty or short entries to improve analysis quality
  const nonEmptyEntries = input.entries.filter(text => text && text.trim().length > 10);

  if (nonEmptyEntries.length === 0) {
    return { adjectives: [] };
  }

  // To avoid overwhelming the model, we might sample or truncate long entries
  // For this example, we'll join them. Consider a more robust strategy for very large datasets.
  const combinedText = nonEmptyEntries.join('\n\n');

  try {
    return await analyzeAdjectivesFlow({ entries: [combinedText] });
  } catch (error) {
    console.error('Error analyzing adjectives:', error);
    // Return an empty list if the AI call fails
    return { adjectives: [] };
  }
}

const prompt = ai.definePrompt({
  name: 'analyzeAdjectivesPrompt',
  input: { schema: AdjectiveAnalysisInputSchema },
  output: { schema: AdjectiveAnalysisOutputSchema },
  prompt: `You are a linguistic analyst. I will provide you with a collection of journal entries. Your task is to identify the top 15 most frequently used adjectives.

Analyze the following text:
---
{{#each entries}}
{{this}}
{{/each}}
---

Instructions:
1. Read through all the provided text.
2. Identify all adjectives (positive, neutral, and negative).
3. Count the occurrences of each adjective.
4. Return a JSON object containing a list of the top 15 adjectives, sorted from most frequent to least frequent. Each item in the list should include the adjective and its count.
`,
});

const analyzeAdjectivesFlow = ai.defineFlow(
  {
    name: 'analyzeAdjectivesFlow',
    inputSchema: AdjectiveAnalysisInputSchema,
    outputSchema: AdjectiveAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
