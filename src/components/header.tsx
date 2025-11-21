import Link from 'next/link';
import { TreePine } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="flex items-center gap-2" aria-label="NatureID Home">
          <TreePine className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold font-headline text-primary">
            NatureID
          </span>
        </Link>
      </div>
    </header>
  );
}
