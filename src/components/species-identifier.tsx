"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { identifySpeciesFromImage, type IdentifySpeciesFromImageOutput } from "@/ai/flows/identify-species-from-image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadCloud, Search, Loader2, AlertCircle, MapPin, Camera, RefreshCcw } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { SpeciesCard } from "./species-card";
import { FavoritesSheet } from "./favorites-sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


type Favorites = {
  data: IdentifySpeciesFromImageOutput;
  image: string;
};

export function SpeciesIdentifier() {
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifySpeciesFromImageOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<IdentifySpeciesFromImageOutput[]>([]);
  const [favoriteImages, setFavoriteImages] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState("file");
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem("natureid-favorites");
      const storedImages = localStorage.getItem("natureid-favorite-images");
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      if (storedImages) {
        setFavoriteImages(JSON.parse(storedImages));
      }
    } catch (e) {
      console.error("Failed to parse favorites from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("natureid-favorites", JSON.stringify(favorites));
      localStorage.setItem("natureid-favorite-images", JSON.stringify(favoriteImages));
    } catch (e) {
      console.error("Failed to save favorites to localStorage", e);
    }
  }, [favorites, favoriteImages]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'camera') {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
  
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Acceso a la cámara denegado',
            description: 'Por favor, habilita los permisos de la cámara en la configuración de tu navegador para usar esta aplicación.',
          });
          setActiveTab('file'); // Fallback to file upload
        }
      };
      getCameraPermission();
    } else {
      stopCamera();
    }
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [activeTab, toast, stopCamera]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
          setLocationError(null);
        },
        (err) => {
          setLocationError(`Error de ubicación: ${err.message}. La identificación puede ser menos precisa.`);
        }
      );
    } else {
      setLocationError("La geolocalización no es compatible con este navegador.");
    }
  }, []);

  const handleFileChange = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setImage(dataUrl);
        setResult(null);
        setError(null);
        setActiveTab("file"); // Switch back to see the preview
      }
    }
  };

  const handleIdentify = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const result = await identifySpeciesFromImage({
        photoDataUri: image,
        location: location || "Unknown",
      });
      setResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error de Identificación",
        description: "No se pudo identificar la especie. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const toggleFavorite = useCallback((species: IdentifySpeciesFromImageOutput | null, currentImage: string | null) => {
    if (!species || !currentImage) return;

    setFavorites(prev => {
      const isFav = prev.some(fav => fav.speciesName === species.speciesName);
      if (isFav) {
        return prev.filter(fav => fav.speciesName !== species.speciesName);
      } else {
        return [...prev, species];
      }
    });

    setFavoriteImages(prev => {
      const newImages = { ...prev };
      const isFav = Object.keys(newImages).includes(species.speciesName);
      if (isFav) {
        delete newImages[species.speciesName];
      } else {
        newImages[species.speciesName] = currentImage;
      }
      return newImages;
    });
  }, []);

  const selectFavorite = (species: IdentifySpeciesFromImageOutput, favImage: string | null) => {
    setResult(species);
    setImage(favImage);
  }

  const isCurrentResultFavorite = result ? favorites.some(fav => fav.speciesName === result.speciesName) : false;

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <Tabs value={activeTab} onValueChange={(value) => {
        setImage(null);
        setResult(null);
        setError(null);
        setActiveTab(value);
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">
            <UploadCloud className="mr-2 h-4 w-4" />
            Subir archivo
          </TabsTrigger>
          <TabsTrigger value="camera">
            <Camera className="mr-2 h-4 w-4" />
            Usar cámara
          </TabsTrigger>
        </TabsList>
        <TabsContent value="file">
          <CardContent
            className={`p-6 border-2 border-dashed rounded-b-lg transition-colors ${
              isDragOver ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              handleFileChange(e.dataTransfer.files);
            }}
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 w-full text-center md:text-left">
                <div className="flex flex-col items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 font-semibold">Arrastra una imagen o haz clic para subir</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, WEBP hasta 10MB</p>
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => handleFileChange(e.target.files)}
                />
              </div>
              {image && (
                <div className="relative w-48 h-48 rounded-md overflow-hidden border shadow-sm">
                  <Image src={image} alt="Vista previa" fill className="object-cover" />
                </div>
              )}
            </div>
            {locationError && (
                <div className="mt-4 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {locationError}
                </div>
              )}
              {location && !locationError && (
                <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Ubicación activada para mayor precisión.
                </div>
              )}
          </CardContent>
        </TabsContent>
        <TabsContent value="camera">
          <CardContent className="p-6 rounded-b-lg">
            <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
              {!hasCameraPermission && (
                <div className="absolute text-center text-white p-4">
                  <Camera className="h-12 w-12 mx-auto mb-2"/>
                  <p>Esperando permiso de la cámara...</p>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            {hasCameraPermission && (
              <Button onClick={handleCapture} className="w-full mt-4">
                <Camera className="mr-2 h-4 w-4" />
                Capturar Foto
              </Button>
            )}
            {!hasCameraPermission && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Se requiere acceso a la cámara</AlertTitle>
                <AlertDescription>
                  Por favor, permite el acceso a la cámara para usar esta función.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
        <CardFooter className="flex flex-col md:flex-row gap-4 p-6 bg-muted/30 rounded-b-lg">
          <Button onClick={handleIdentify} disabled={!image || loading} className="w-full md:w-auto flex-grow bg-primary hover:bg-primary/90">
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Identificando...</>
            ) : (
              <><Search className="mr-2 h-4 w-4" /> Identificar Especie</>
            )}
          </Button>
          <FavoritesSheet 
            favorites={favorites} 
            onRemoveFavorite={(species) => toggleFavorite(species, favoriteImages[species.speciesName])}
            onSelectFavorite={selectFavorite}
            favoriteImages={favoriteImages}
          />
        </CardFooter>
      </Card>
      
      <div className="max-w-4xl mx-auto">
        {loading && (
          <Card className="w-full">
            <CardHeader>
              <Skeleton className="h-8 w-3/5" />
              <Skeleton className="h-4 w-2/5" />
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && image && (
          <SpeciesCard 
            species={result} 
            image={image}
            isFavorite={isCurrentResultFavorite}
            onToggleFavorite={() => toggleFavorite(result, image)}
          />
        )}
      </div>
    </div>
  );
}

    