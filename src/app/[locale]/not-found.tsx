import Link from 'next/link';

import { ArrowLeft, Home } from 'lucide-react';

export default function LocaleNotFound() {
  return (
    <div className="admin-mesh bg-background text-foreground flex min-h-[80vh] flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="admin-hairline admin-glass bg-card/60 relative w-full max-w-md space-y-4 overflow-hidden rounded-[var(--admin-radius-xl)] p-8 shadow-[var(--shadow-admin-lg)] backdrop-blur-md">
        <p className="text-muted-foreground/80 relative font-mono text-[10px] tracking-[0.18em] uppercase">
          404
        </p>
        <h1 className="text-foreground relative text-2xl font-semibold tracking-tight">
          Página no encontrada
        </h1>
        <p className="text-muted-foreground relative text-sm leading-relaxed">
          La sección que buscás no existe o se movió. Volvé al inicio y navegá desde el menú.
        </p>
        <div className="relative flex flex-wrap justify-center gap-2 pt-2">
          <Link
            href="/es"
            className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center gap-1.5 rounded-[var(--admin-radius)] px-4 py-2 text-sm font-semibold transition-colors"
          >
            <Home size={13} />
            Ir al inicio
          </Link>
          <Link
            href="/es#contact"
            className="border-border bg-background text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-[var(--admin-radius)] border px-4 py-2 text-sm font-semibold transition-colors"
          >
            <ArrowLeft size={13} />
            Contacto
          </Link>
        </div>
      </div>
    </div>
  );
}
