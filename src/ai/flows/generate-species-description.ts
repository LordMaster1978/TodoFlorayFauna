'use server';

/**
 * @fileOverview Generates a short, informative description of a species using GenAI.
 *
 * - generateSpeciesDescription - A function that handles the species description generation.
 * - GenerateSpeciesDescriptionInput - The input type for the generateSpeciesDescription function.
 * - GenerateSpeciesDescriptionOutput - The return type for the generateSpeciesDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSpeciesDescriptionInputSchema = z.object({
  speciesName: z.string().describe('The name of the species to describe.'),
  speciesType: z
    .enum(['plant', 'animal', 'mushroom'])
    .describe('The type of species.'),
});
export type GenerateSpeciesDescriptionInput = z.infer<
  typeof GenerateSpeciesDescriptionInputSchema
>;

const GenerateSpeciesDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe('A short, informative description of the species.'),
});
export type GenerateSpeciesDescriptionOutput = z.infer<
  typeof GenerateSpeciesDescriptionOutputSchema
>;

export async function generateSpeciesDescription(
  input: GenerateSpeciesDescriptionInput
): Promise<GenerateSpeciesDescriptionOutput> {
  return generateSpeciesDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSpeciesDescriptionPrompt',
  input: {schema: GenerateSpeciesDescriptionInputSchema},
  output: {schema: GenerateSpeciesDescriptionOutputSchema},
  prompt: `You are a knowledgeable naturalist. Generate a concise description of the following {{speciesType}}, focusing on its key characteristics and interesting facts:\n\nSpecies Name: {{{speciesName}}}`,
});

const generateSpeciesDescriptionFlow = ai.defineFlow(
  {
    name: 'generateSpeciesDescriptionFlow',
    inputSchema: GenerateSpeciesDescriptionInputSchema,
    outputSchema: GenerateSpeciesDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
