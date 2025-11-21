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
      "A photo of a plant, animal, or mushroom, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  location: z.string().optional().describe('The general location of the user.'),
});

export type IdentifySpeciesFromImageInput = z.infer<typeof IdentifySpeciesFromImageInputSchema>;

const IdentifySpeciesFromImageOutputSchema = z.object({
  commonName: z.string().describe('El nombre común de la especie identificada.'),
  scientificName: z.string().describe('El nombre científico (latino) de la especie.'),
  confidence: z.number().describe('El nivel de confianza de la identificación (0-1).'),
  description: z.string().describe('Una descripción general y detallada de la especie.'),
  characteristics: z.object({
    habitat: z.string().describe('El hábitat natural y los ecosistemas donde se encuentra la especie.'),
    diet: z.string().optional().describe('La dieta de la especie (si aplica, para animales).'),
    size: z.string().describe('El tamaño promedio de la especie (altura, longitud, etc.).'),
  }).describe('Características físicas y de comportamiento de la especie.'),
  geographicDistribution: z.string().describe('Descripción de la distribución geográfica mundial de la especie, incluyendo continentes y países.'),
  conservationStatus: z.string().describe('El estado de conservación de la especie según la UICN u otras autoridades (Ej: Preocupación Menor, Vulnerable, En Peligro).'),
  interestingFacts: z.array(z.string()).describe('Una lista de 2 a 4 curiosidades o hechos interesantes sobre la especie.')
});


export type IdentifySpeciesFromImageOutput = z.infer<typeof IdentifySpeciesFromImageOutputSchema>;

export async function identifySpeciesFromImage(input: IdentifySpeciesFromImageInput): Promise<IdentifySpeciesFromImageOutput> {
  return identifySpeciesFromImageFlow(input);
}

const identifySpeciesPrompt = ai.definePrompt({
  name: 'identifySpeciesPrompt',
  input: {schema: IdentifySpeciesFromImageInputSchema},
  output: {schema: IdentifySpeciesFromImageOutputSchema},
  prompt: `Eres un naturalista experto y un divulgador científico. A partir de una imagen y una ubicación opcional, debes identificar la especie (planta, animal o hongo).

Analiza la imagen y proporciona un informe completo y perfectamente estructurado sobre la especie. La información debe ser rigurosa, detallada y fácil de entender para un público general.

Debes rellenar todos los campos del esquema de salida con la mayor cantidad de información relevante posible.

**Ubicación del avistamiento:** {{location}}
**Imagen para analizar:** {{media url=photoDataUri}}

Genera la salida en el formato JSON especificado.
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
