// This file is used to identify species from an image.

'use server';

/**
 * @fileOverview Identifies the species of a plant, animal, or mushroom from an image.
 *
 * - identifySpeciesFromImage - A function that handles the species identification process.
 * - IdentifySpeciesFromImageInput - The input type for the identifySpeciesFromImage function.
 * - IdentifySpeciesFromImageOutput - The return type for the identifySpeciesFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifySpeciesFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of a plant, animal, or mushroom, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
  location: z.string().optional().describe('The general location of the user.'),
});

export type IdentifySpeciesFromImageInput = z.infer<typeof IdentifySpeciesFromImageInputSchema>;

const IdentifySpeciesFromImageOutputSchema = z.object({
  speciesName: z.string().describe('The identified species name.'),
  confidence: z.number().describe('The confidence level of the identification (0-1).'),
  speciesInformation: z.string().describe('Detailed information about the identified species.'),
});

export type IdentifySpeciesFromImageOutput = z.infer<typeof IdentifySpeciesFromImageOutputSchema>;

export async function identifySpeciesFromImage(input: IdentifySpeciesFromImageInput): Promise<IdentifySpeciesFromImageOutput> {
  return identifySpeciesFromImageFlow(input);
}

const identifySpeciesPrompt = ai.definePrompt({
  name: 'identifySpeciesPrompt',
  input: {schema: IdentifySpeciesFromImageInputSchema},
  output: {schema: IdentifySpeciesFromImageOutputSchema},
  prompt: `You are an expert naturalist. You are provided with an image and asked to identify the species of plant, animal, or mushroom in the image.

  Analyze the image and provide the species name, your confidence in the identification (as a number between 0 and 1), and detailed information about the species.

  Location: {{location}}
  Image: {{media url=photoDataUri}}
  `,
});

const identifySpeciesFromImageFlow = ai.defineFlow(
  {
    name: 'identifySpeciesFromImageFlow',
    inputSchema: IdentifySpeciesFromImageInputSchema,
    outputSchema: IdentifySpeciesFromImageOutputSchema,
  },
  async input => {
    const {output} = await identifySpeciesPrompt(input);
    return output!;
  }
);
