"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import type { IdentifySpeciesFromImageOutput } from "@/ai/flows/identify-species-from-image";
import { Badge } from "@/components/ui/badge";

type SpeciesCardProps = {
  species: IdentifySpeciesFromImageOutput;
  image: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export function SpeciesCard({ species, image, isFavorite, onToggleFavorite }: SpeciesCardProps) {
  const confidencePercentage = (species.confidence * 100).toFixed(0);

  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader className="flex-row items-start justify-between">
        <div className="space-y-1.5">
          <CardTitle className="font-headline text-3xl">{species.speciesName}</CardTitle>
          <CardDescription>
            Confianza de identificación: <Badge variant={species.confidence > 0.7 ? "default" : "secondary"} className="bg-primary/80 text-primary-foreground">{confidencePercentage}%</Badge>
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="h-10 w-10"
        >
          <Star className={`h-6 w-6 transition-all duration-300 ${isFavorite ? "fill-accent text-accent" : "text-muted-foreground"}`} />
        </Button>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
          <Image
            src={image}
            alt={`Image of ${species.speciesName}`}
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-4">
          <h3 className="font-bold font-headline text-xl text-primary">Información de la Especie</h3>
          <p className="text-foreground/80 whitespace-pre-wrap">{species.speciesInformation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
