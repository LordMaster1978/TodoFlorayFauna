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

const TaxonomySchema = z.object({
  kingdom: z.string().describe('El reino al que pertenece la especie (Ej: Animalia, Plantae, Fungi).'),
  phylum: z.string().describe('El filo (o división para plantas) de la especie.'),
  class: z.string().describe('La clase de la especie.'),
  order: z.string().describe('El orden de la especie.'),
  family: z.string().describe('La familia de la especie.'),
  genus: z.string().describe('El género de la especie.'),
  species: z.string().describe('El nombre específico de la especie.'),
});

const TaxonomyConfidenceSchema = z.object({
  kingdom: z.number().min(0).max(1).describe('Confianza de identificación para el Reino.'),
  phylum: z.number().min(0).max(1).describe('Confianza de identificación para el Filo/División.'),
  class: z.number().min(0).max(1).describe('Confianza de identificación para la Clase.'),
  order: z.number().min(0).max(1).describe('Confianza de identificación para el Orden.'),
  family: z.number().min(0).max(1).describe('Confianza de identificación para la Familia.'),
  genus: z.number().min(0).max(1).describe('Confianza de identificación para el Género.'),
  species: z.number().min(0).max(1).describe('Confianza de identificación para la Especie.'),
});

const IdentifySpeciesFromImageOutputSchema = z.object({
  commonName: z.string().describe('El nombre común más aceptado para la especie identificada.'),
  scientificName: z.string().describe('El nombre científico (latino) completo de la especie (Género + especie).'),
  confidence: z.number().min(0).max(1).describe('El nivel de confianza general de la identificación (0-1).'),
  
  taxonomy: TaxonomySchema.describe('La clasificación taxonómica completa de la especie.'),
  taxonomyConfidence: TaxonomyConfidenceSchema.describe('Un desglose de la confianza de la IA en cada nivel taxonómico.'),

  description: z.string().describe('Una descripción general y detallada de la especie, abarcando su biología y apariencia.'),
  
  physicalDescription: z.string().describe('Un análisis detallado de las características físicas: tamaño, color, forma de las hojas, tipo de flor, pelaje, marcas distintivas, etc.'),

  characteristics: z.object({
    habitat: z.string().describe('El hábitat natural y los ecosistemas específicos donde se encuentra la especie.'),
    diet: z.string().optional().describe('La dieta principal de la especie (si aplica, para animales) o requerimientos nutricionales (para plantas/hongos).'),
    size: z.string().describe('El rango de tamaño promedio de la especie (altura, longitud, envergadura, etc.).'),
  }).describe('Características clave de la especie.'),

  behaviorAndEcology: z.string().describe('Descripción del comportamiento (social, reproductivo, migratorio) y su rol ecológico (polinizador, presa, depredador, descomponedor).'),

  geographicDistribution: z.string().describe('Descripción detallada de la distribución geográfica mundial de la especie, incluyendo continentes, países y rangos de altitud o profundidad.'),
  
  conservationStatus: z.string().describe('El estado de conservación de la especie según la lista roja de la UICN u otras autoridades (Ej: Preocupación Menor, Vulnerable, En Peligro Crítico).'),
  
  threats: z.string().optional().describe('Las principales amenazas para la supervivencia de la especie (pérdida de hábitat, cambio climático, especies invasoras, etc.).'),

  humanUses: z.string().optional().describe('Usos de la especie por parte de los humanos (culinario, medicinal, ornamental, cultural, etc.).'),

  similarSpecies: z.string().optional().describe('Mención de 2-3 especies similares y las claves para diferenciarlas de la especie identificada.'),

  interestingFacts: z.array(z.string()).min(3).max(5).describe('Una lista de 3 a 5 curiosidades o hechos sorprendentes y poco conocidos sobre la especie.')
});


export type IdentifySpeciesFromImageOutput = z.infer<typeof IdentifySpeciesFromImageOutputSchema>;

export async function identifySpeciesFromImage(input: IdentifySpeciesFromImageInput): Promise<IdentifySpeciesFromImageOutput> {
  return identifySpeciesFromImageFlow(input);
}

const identifySpeciesPrompt = ai.definePrompt({
  name: 'identifySpeciesPrompt',
  input: {schema: IdentifySpeciesFromImageInputSchema},
  output: {schema: IdentifySpeciesFromImageOutputSchema},
  prompt: `Eres un naturalista experto, biólogo y taxónomo de renombre mundial, con una habilidad excepcional para la divulgación científica. Tu misión es analizar una imagen y, opcionalmente, una ubicación para identificar una especie (planta, animal u hongo) y generar un informe de nivel enciclopédico pero accesible para un público general.

**Instrucciones Clave:**
1.  **Análisis Exhaustivo:** Analiza la imagen minuciosamente. Si se proporciona ubicación, úsala para acotar la identificación.
2.  **Estructura Perfecta:** Debes rellenar TODOS los campos del esquema de salida. La información debe ser rigurosa, detallada, y estar perfectamente estructurada. No dejes campos vacíos a menos que sean opcionales y realmente no aplique (ej. 'dieta' para una roca).
3.  **Confianza Detallada:** Además de la confianza general, proporciona una estimación de confianza para cada nivel taxonómico. Si estás muy seguro de que es un 'Animal' pero no tanto del 'Género', refléjalo en los valores de 'taxonomyConfidence'. La confianza a nivel de especie debe ser la misma que la confianza general.
4.  **Rigor y Detalle:** Ve más allá de lo básico. En 'physicalDescription', no digas solo "es verde"; describe el tono, la textura, la forma de las hojas. En 'geographicDistribution', menciona continentes, países y ecorregiones.
5.  **Lenguaje Atractivo:** Usa un lenguaje que sea a la vez preciso y cautivador. El objetivo es educar y fascinar.

**Ubicación del avistamiento:** {{location}}
**Imagen para analizar:** {{media url=photoDataUri}}

Genera la salida en el formato JSON especificado, asegurando que cada campo está completo y es de la más alta calidad.`,
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
