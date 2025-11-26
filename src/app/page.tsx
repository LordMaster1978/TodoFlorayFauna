import Image from 'next/image';
import { Header } from '@/components/header';
import { SpeciesIdentifier } from '@/components/species-identifier';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { UploadCloud, MapPin, Sparkles, Leaf, PawPrint } from 'lucide-react';
import { MushroomIcon } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

  const steps = [
    {
      icon: <UploadCloud className="h-10 w-10 text-primary" />,
      title: '1. Sube una Foto',
      description: 'Selecciona o arrastra una imagen clara de la especie que quieres identificar.',
    },
    {
      icon: <MapPin className="h-10 w-10 text-primary" />,
      title: '2. Ubicación Automática',
      description: 'Permite el acceso a tu ubicación para mejorar la precisión de la identificación.',
    },
    {
      icon: <Sparkles className="h-10 w-10 text-primary" />,
      title: '3. Recibe Resultados',
      description: 'Nuestra IA analizará la imagen y te dará información detallada sobre la especie.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="relative text-center py-20 md:py-32 bg-primary/20">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover opacity-20"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          
          <div className="relative z-10 container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary mb-4">
              Todo Sobre Flora y Fauna
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-3xl mx-auto">
              Descubre el mundo natural que te rodea. Sube una foto para identificar plantas, animales y setas.
            </p>
            <div className="flex justify-center items-center space-x-4 md:space-x-8">
              <div className="flex items-center space-x-2 text-foreground/90">
                <Leaf className="w-6 h-6 text-primary" />
                <span className="font-semibold text-sm md:text-base">Plantas</span>
              </div>
              <div className="flex items-center space-x-2 text-foreground/90">
                <PawPrint className="w-6 h-6 text-primary" />
                <span className="font-semibold text-sm md:text-base">Animales</span>
              </div>
              <div className="flex items-center space-x-2 text-foreground/90">
                <MushroomIcon className="w-6 h-6 text-primary" />
                <span className="font-semibold text-sm md:text-base">Setas</span>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 -mt-16 relative z-20 pb-16">
          <SpeciesIdentifier />
        </section>

        <section className="bg-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center text-primary mb-12">
              Cómo Funciona
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <Card key={index} className="text-center bg-card/80 backdrop-blur-sm">
                  <CardHeader className="items-center">
                    {step.icon}
                    <CardTitle className="font-headline text-2xl mt-4 text-primary/90">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/70">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        <p>© 2025 Todo Sobre Flora y Fauna. Creado por Lord Master con ❤️ para exploradores de la naturaleza.</p>
      </footer>
    </div>
  );
}
