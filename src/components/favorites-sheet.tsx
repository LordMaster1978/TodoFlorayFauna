"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Star, X } from "lucide-react";
import type { IdentifySpeciesFromImageOutput } from "@/ai/flows/identify-species-from-image";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

type FavoritesSheetProps = {
  favorites: IdentifySpeciesFromImageOutput[];
  onRemoveFavorite: (species: IdentifySpeciesFromImageOutput) => void;
  onSelectFavorite: (species: IdentifySpeciesFromImageOutput, image: string | null) => void;
  favoriteImages: Record<string, string>;
};

export function FavoritesSheet({ favorites, onRemoveFavorite, onSelectFavorite, favoriteImages }: FavoritesSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Star className="mr-2 h-4 w-4" />
          Favoritos ({favorites.length})
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">Mis Favoritos</SheetTitle>
          <SheetDescription>
            Aquí están las especies que has guardado.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 h-[calc(100%-80px)]">
          {favorites.length > 0 ? (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {favorites.map((fav) => (
                  <div key={fav.scientificName} className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <button 
                      className="flex items-center gap-4 flex-grow text-left"
                      onClick={() => onSelectFavorite(fav, favoriteImages[fav.scientificName] || null)}
                    >
                      {favoriteImages[fav.scientificName] && (
                        <Image
                          src={favoriteImages[fav.scientificName]}
                          alt={fav.commonName}
                          width={64}
                          height={64}
                          className="rounded-md object-cover h-16 w-16"
                        />
                      )}
                      <div className="flex-grow">
                        <p className="font-semibold text-card-foreground">{fav.commonName}</p>
                        <p className="text-sm text-muted-foreground italic">{fav.scientificName}</p>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveFavorite(fav)}
                      aria-label={`Quitar ${fav.commonName} de favoritos`}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Star className="w-16 h-16 mb-4" />
              <p className="font-semibold">Aún no tienes favoritos.</p>
              <p className="text-sm">Identifica una especie y pulsa la estrella para guardarla.</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
