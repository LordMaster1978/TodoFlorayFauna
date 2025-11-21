"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Leaf, Globe, ShieldCheck, Info, Sparkles } from "lucide-react";
import type { IdentifySpeciesFromImageOutput } from "@/ai/flows/identify-species-from-image";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

type SpeciesCardProps = {
  species: IdentifySpeciesFromImageOutput;
  image: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export function SpeciesCard({ species, image, isFavorite, onToggleFavorite }: SpeciesCardProps) {
  const confidencePercentage = (species.confidence * 100).toFixed(0);

  const getConfidenceVariant = (confidence: number) => {
    if (confidence > 0.85) return "default";
    if (confidence > 0.6) return "secondary";
    return "destructive";
  }

  return (
    <Card className="w-full animate-in fade-in-50 duration-500 overflow-hidden">
      <div className="relative aspect-video w-full">
        <Image
          src={image}
          alt={`Imagen de ${species.commonName}`}
          fill
          className="object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
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
          <TabsList className="grid w-full grid-cols-4 rounded-none h-16 bg-muted/30">
            <TabsTrigger value="info" className="h-full rounded-none text-xs sm:text-sm"><Info className="h-5 w-5 mr-2 hidden sm:inline-block"/>General</TabsTrigger>
            <TabsTrigger value="geo" className="h-full rounded-none text-xs sm:text-sm"><Globe className="h-5 w-5 mr-2 hidden sm:inline-block"/>Distribución</TabsTrigger>
            <TabsTrigger value="eco" className="h-full rounded-none text-xs sm:text-sm"><Leaf className="h-5 w-5 mr-2 hidden sm:inline-block"/>Ecología</TabsTrigger>
            <TabsTrigger value="extra" className="h-full rounded-none text-xs sm-text-sm"><Sparkles className="h-5 w-5 mr-2 hidden sm:inline-block"/>Extras</TabsTrigger>
          </TabsList>
          
          <div className="p-6">
            <ScrollArea className="h-[300px] w-full">
              <div className="pr-6">
                <TabsContent value="info">
                  <div className="space-y-4">
                    <h3 className="font-headline text-2xl font-bold text-primary">Descripción</h3>
                    <p className="text-foreground/80 whitespace-pre-wrap">{species.description}</p>
                  </div>
                </TabsContent>

                <TabsContent value="geo">
                  <div className="space-y-4">
                    <h3 className="font-headline text-2xl font-bold text-primary">Distribución Geográfica</h3>
                    <p className="text-foreground/80 whitespace-pre-wrap">{species.geographicDistribution}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="eco">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-headline text-xl font-bold text-primary mb-2">Hábitat</h3>
                      <p className="text-foreground/80 whitespace-pre-wrap">{species.characteristics.habitat}</p>
                    </div>
                    {species.characteristics.diet && (
                       <div>
                        <h3 className="font-headline text-xl font-bold text-primary mb-2">Alimentación</h3>
                        <p className="text-foreground/80 whitespace-pre-wrap">{species.characteristics.diet}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="font-headline text-xl font-bold text-primary mb-2">Tamaño</h3>
                      <p className="text-foreground/80 whitespace-pre-wrap">{species.characteristics.size}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="extra">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-headline text-xl font-bold text-primary mb-3">Estado de Conservación</h3>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-primary"/>
                        <span className="font-semibold text-foreground/90">{species.conservationStatus}</span>
                      </div>
                    </div>

                     <div>
                      <h3 className="font-headline text-xl font-bold text-primary mb-3">Curiosidades</h3>
                      <ul className="list-disc list-inside space-y-2 text-foreground/80">
                        {species.interestingFacts.map((fact, index) => (
                          <li key={index}>{fact}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-headline text-xl font-bold text-primary mb-3">Confianza del Análisis</h3>
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
