"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Leaf, Globe, ShieldCheck, Info, Sparkles, BrainCircuit, Microscope, Users, Sprout, TriangleAlert } from "lucide-react";
import type { IdentifySpeciesFromImageOutput } from "@/ai/flows/identify-species-from-image";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type SpeciesCardProps = {
  species: IdentifySpeciesFromImageOutput;
  image: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="space-y-3">
    <h3 className="font-headline text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
      {icon}
      {title}
    </h3>
    <div className="text-foreground/80 whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none">
      {children}
    </div>
  </div>
);


export function SpeciesCard({ species, image, isFavorite, onToggleFavorite }: SpeciesCardProps) {
  const confidencePercentage = (species.confidence * 100).toFixed(0);

  const getConfidenceVariant = (confidence: number) => {
    if (confidence > 0.85) return "default";
    if (confidence > 0.6) return "secondary";
    return "destructive";
  }
  
  const taxonomyConfidenceData = [
    { level: 'Reino', confidence: species.taxonomyConfidence.kingdom, fullMark: 1 },
    { level: 'Filo', confidence: species.taxonomyConfidence.phylum, fullMark: 1 },
    { level: 'Clase', confidence: species.taxonomyConfidence.class, fullMark: 1 },
    { level: 'Orden', confidence: species.taxonomyConfidence.order, fullMark: 1 },
    { level: 'Familia', confidence: species.taxonomyConfidence.family, fullMark: 1 },
    { level: 'Género', confidence: species.taxonomyConfidence.genus, fullMark: 1 },
    { level: 'Especie', confidence: species.taxonomyConfidence.species, fullMark: 1 },
  ];

  const chartConfig = {
    confidence: {
      label: "Confianza",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="w-full animate-in fade-in-50 duration-500 overflow-hidden">
      <div className="relative aspect-video w-full">
        <Image
          src={image}
          alt={`Imagen de ${species.commonName}`}
          fill
          className="object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/90 to-transparent p-6 flex flex-col justify-end">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-white shadow-lg">{species.commonName}</h2>
          <p className="text-lg text-white/90 italic">{species.scientificName}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
          className="absolute top-4 right-4 h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
        >
          <Star className={`h-7 w-7 transition-all duration-300 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
        </Button>
      </div>

      <CardContent className="p-0">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 rounded-none h-16 bg-muted/30">
            <TabsTrigger value="info" className="h-full rounded-none text-xs sm:text-sm"><Info className="h-5 w-5 mr-2 hidden sm:inline-block"/>General</TabsTrigger>
            <TabsTrigger value="taxonomy" className="h-full rounded-none text-xs sm:text-sm"><Microscope className="h-5 w-5 mr-2 hidden sm:inline-block"/>Taxonomía</TabsTrigger>
            <TabsTrigger value="eco" className="h-full rounded-none text-xs sm:text-sm"><Leaf className="h-5 w-5 mr-2 hidden sm:inline-block"/>Ecología</TabsTrigger>
            <TabsTrigger value="extra" className="h-full rounded-none text-xs sm-text-sm"><Sparkles className="h-5 w-5 mr-2 hidden sm:inline-block"/>Extras</TabsTrigger>
          </TabsList>
          
          <div className="p-6">
            <ScrollArea className="h-[450px] w-full">
              <div className="pr-6 space-y-8">
                <TabsContent value="info">
                  <div className="space-y-6">
                    <Section title="Descripción General" icon={<Info className="h-6 w-6"/>}>
                      {species.description}
                    </Section>
                    <Section title="Descripción Física" icon={<Sprout className="h-6 w-6"/>}>
                      {species.physicalDescription}
                    </Section>
                  </div>
                </TabsContent>

                <TabsContent value="taxonomy">
                    <div className="space-y-6">
                      <Section title="Clasificación Taxonómica" icon={<Microscope className="h-6 w-6"/>}>
                        <ul className="list-none space-y-1">
                          <li><strong>Reino:</strong> {species.taxonomy.kingdom}</li>
                          <li><strong>Filo:</strong> {species.taxonomy.phylum}</li>
                          <li><strong>Clase:</strong> {species.taxonomy.class}</li>
                          <li><strong>Orden:</strong> {species.taxonomy.order}</li>
                          <li><strong>Familia:</strong> {species.taxonomy.family}</li>
                          <li><strong>Género:</strong> <em>{species.taxonomy.genus}</em></li>
                          <li><strong>Especie:</strong> <em>{species.taxonomy.species}</em></li>
                        </ul>
                      </Section>
                      <Section title="Confianza Taxonómica de la IA" icon={<BrainCircuit className="h-6 w-6"/>}>
                         <p>Este gráfico muestra qué tan segura está la IA en su clasificación en cada nivel taxonómico.</p>
                         <div className="w-full h-80">
                           <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                            <ResponsiveContainer>
                              <RadarChart data={taxonomyConfidenceData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                <PolarAngleAxis dataKey="level" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
                                <PolarGrid />
                                <Radar
                                  name="Confianza"
                                  dataKey="confidence"
                                  stroke="hsl(var(--primary))"
                                  fill="hsl(var(--primary))"
                                  fillOpacity={0.6}
                                />
                              </RadarChart>
                              </ResponsiveContainer>
                           </ChartContainer>
                         </div>
                      </Section>
                    </div>
                </TabsContent>
                
                <TabsContent value="eco">
                  <div className="space-y-6">
                    <Section title="Hábitat" icon={<Globe className="h-6 w-6"/>}>
                      <p>{species.characteristics.habitat}</p>
                    </Section>
                    <Section title="Distribución Geográfica" icon={<Globe className="h-6 w-6"/>}>
                      <p>{species.geographicDistribution}</p>
                    </Section>
                    {species.characteristics.diet && (
                       <Section title="Alimentación" icon={<Sprout className="h-6 w-6"/>}>
                        <p>{species.characteristics.diet}</p>
                      </Section>
                    )}
                    <Section title="Comportamiento y Ecología" icon={<Users className="h-6 w-6"/>}>
                       <p>{species.behaviorAndEcology}</p>
                    </Section>
                  </div>
                </TabsContent>

                <TabsContent value="extra">
                  <div className="space-y-6">
                    <Section title="Estado de Conservación" icon={<ShieldCheck className="h-6 w-6"/>}>
                      <p className="font-semibold text-foreground/90">{species.conservationStatus}</p>
                    </Section>

                    {species.threats && (
                      <Section title="Amenazas" icon={<TriangleAlert className="h-6 w-6"/>}>
                        <p>{species.threats}</p>
                      </Section>
                    )}

                    {species.humanUses && (
                      <Section title="Usos Humanos" icon={<Users className="h-6 w-6"/>}>
                        <p>{species.humanUses}</p>
                      </Section>
                    )}
                    
                    <Section title="Curiosidades" icon={<Sparkles className="h-6 w-6"/>}>
                      <ul className="list-disc list-inside space-y-2">
                        {species.interestingFacts.map((fact, index) => (
                          <li key={index}>{fact}</li>
                        ))}
                      </ul>
                    </Section>
                    
                    {species.similarSpecies && (
                      <Section title="Especies Similares" icon={<Users className="h-6 w-6"/>}>
                          <p>{species.similarSpecies}</p>
                      </Section>
                    )}

                    <div>
                       <h3 className="font-headline text-xl font-bold text-primary mb-3">Confianza del Análisis General</h3>
                      <Badge variant={getConfidenceVariant(species.confidence)}>
                        {confidencePercentage}%
                      </Badge>
                       <p className="text-xs text-muted-foreground mt-1">Nivel de confianza de la IA en esta identificación.</p>
                    </div>

                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
