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
  speciesType: z.enum(['animal', 'plant', 'fungi', 'other']).describe("El tipo de especie (animal, planta, hongo, u otro)."),
  commonName: z.string().describe('El nombre común más aceptado para la especie identificada.'),
  scientificName: z.string().describe('El nombre científico (latino) completo de la especie (Género + especie).'),
  confidence: z.number().min(0).max(1).describe('El nivel de confianza general de la identificación (0-1).'),
  
  taxonomy: TaxonomySchema.describe('La clasificación taxonómica completa de la especie.'),
  taxonomyConfidence: TaxonomyConfidenceSchema.describe('Un desglose de la confianza de la IA en cada nivel taxonómico.'),

  description: z.string().describe('Una descripción general y detallada de la especie, abarcando su biología y apariencia.'),
  
  physicalDescription: z.string().describe('Un análisis detallado de las características físicas: tamaño, color, forma de las hojas, tipo de flor, pelaje, marcas distintivas, etc.'),

  distinctiveFeatures: z.string().describe('Un resumen de las características más distintivas y clave para la identificación rápida de la especie.'),

  characteristics: z.object({
    habitat: z.string().describe('El hábitat natural y los ecosistemas específicos donde se encuentra la especie.'),
    diet: z.string().optional().describe('La dieta principal de la especie (si aplica, para animales) o requerimientos nutricionales (para plantas/hongos).'),
    size: z.object({
      description: z.string().describe('El rango de tamaño promedio de la especie (altura, longitud, envergadura, etc.) en texto descriptivo.'),
      minCm: z.number().optional().describe('El tamaño mínimo del especimen en centímetros.'),
      maxCm: z.number().optional().describe('El tamaño máximo del especimen en centímetros.'),
    }),
  }).describe('Características clave de la especie.'),

  lifeCycle: z.string().describe('Una descripción del ciclo de vida de la especie, desde el nacimiento/germinación hasta la reproducción y la muerte.'),

  behaviorAndEcology: z.string().describe('Descripción del comportamiento (social, reproductivo, migratorio) y su rol ecológico (polinizador, presa, depredador, descomponedor).'),

  geographicDistribution: z.string().describe('Descripción detallada de la distribución geográfica mundial de la especie, incluyendo continentes, países y rangos de altitud o profundidad.'),
  
  conservationStatus: z.string().describe('El estado de conservación de la especie según la lista roja de la UICN u otras autoridades (Ej: Preocupación Menor, Vulnerable, En Peligro Crítico).'),
  
  threats: z.string().optional().describe('Las principales amenazas para la supervivencia de la especie (pérdida de hábitat, cambio climático, especies invasoras, etc.).'),

  humanUses: z.string().optional().describe('Usos de la especie por parte de los humanos (culinario, medicinal, ornamental, cultural, etc.).'),

  similarSpecies: z.string().optional().describe('Mención de 2-3 especies similares y las claves para diferenciarlas de la especie identificada.'),

  interestingFacts: z.array(z.string()).min(3).max(5).describe('Una lista de 3 a 5 curiosidades o hechos sorprendentes y poco conocidos sobre la especie.'),

  plantCare: z.object({
    watering: z.string().describe("Guía detallada sobre la frecuencia y método de riego."),
    sunlightDescription: z.string().describe("Descripción de las necesidades de luz: directa, indirecta, etc."),
    sunlight: z.number().min(0).max(10).describe("Nivel de luz ideal en una escala de 0 (sombra total) a 10 (sol directo pleno)."),
    soil: z.string().describe("Descripción del tipo de suelo, pH y drenaje preferido."),
    fertilizer: z.string().describe("Información sobre la fertilización: tipo, frecuencia y estacionalidad."),
    pruning: z.string().describe("Consejos sobre poda, incluyendo cuándo (época del año) y cómo hacerlo para fomentar el crecimiento o la floración."),
    humidity: z.string().describe("Necesidades de humedad ambiental."),
    floweringSeason: z.string().describe("Descripción de la época de floración, características de las flores (color, forma, aroma) y si es una planta que florece."),
    reproduction: z.string().describe("Guía detallada sobre los métodos de reproducción de la planta, como por esquejes, semillas, división de mata, etc."),
  }).optional().describe("Guía de cuidados detallada, SÓLO si la especie es una planta."),
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
1.  **Análisis Exhaustivo:** Analiza la imagen minuciosamente. Si se proporciona ubicación, úsala para acotar la identificación. Determina el tipo de especie ('animal', 'plant', 'fungi', 'other') y rellena el campo \`speciesType\`.
2.  **Estructura Perfecta:** Debes rellenar TODOS los campos del esquema de salida. La información debe ser rigurosa, detallada, y estar perfectamente estructurada. No dejes campos vacíos a menos que sean opcionales y realmente no aplique (ej. 'dieta' para una roca).
3.  **Datos Numéricos para Gráficos:**
    - Para el tamaño (\`size\`), además de la descripción textual, proporciona los valores \`minCm\` y \`maxCm\` en centímetros. Si es un rango, proporciona ambos. Si es un tamaño aproximado, pon el mismo valor en ambos.
    - **Si es una PLANTA**, para la luz solar (\`sunlight\`), además de la descripción textual, proporciona un valor numérico de 0 a 10, donde 0 es sombra total, 5 es luz indirecta brillante, y 10 es sol directo todo el día.
4.  **Guía de Cuidados para Plantas:** SI Y SOLO SI la especie es una planta (\`speciesType: 'plant'\`), debes rellenar COMPLETAMENTE el objeto \`plantCare\`. Proporciona información práctica y detallada para cada campo, incluyendo época y método de **poda**, descripción de la **floración** y métodos de **reproducción** (semillas, esquejes, división de mata, etc.). Si no es una planta, este campo debe omitirse.
5.  **Confianza Detallada:** Además de la confianza general, proporciona una estimación de confianza para cada nivel taxonómico. Si estás muy seguro de que es un 'Animal' pero no tanto del 'Género', refléjalo en los valores de 'taxonomyConfidence'. La confianza a nivel de especie debe ser la misma que la confianza general.
6.  **Rigor y Detalle:** Ve más allá de lo básico. En 'physicalDescription', describe el tono, la textura, la forma de las hojas. En 'geographicDistribution', menciona continentes, países y ecorregiones. En 'lifeCycle', describe las etapas de desarrollo.
7.  **Lenguaje Atractivo:** Usa un lenguaje que sea a la vez preciso y cautivador. El objetivo es educar y fascinar.
8.  **Curiosidades:** Incluye una lista de 3 a 5 hechos sorprendentes y poco conocidos en el campo 'interestingFacts'.

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

    