'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { AlertTriangle, RefreshCw } from 'lucide-react';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[admin error]', error);
  }, [error]);

  return (
    <div className="admin-mesh bg-background text-foreground flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8">
      <div className="admin-hairline admin-glass bg-card/60 relative w-full max-w-md space-y-5 overflow-hidden rounded-[var(--admin-radius-xl)] p-8 shadow-[var(--shadow-admin-lg)] backdrop-blur-md">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--destructive)_10%,transparent),transparent_60%)]"
        />
        <div className="relative flex items-center gap-3">
          <div className="border-destructive/40 bg-destructive/10 text-destructive flex h-9 w-9 items-center justify-center rounded-md border">
            <AlertTriangle size={15} />
          </div>
          <p className="text-muted-foreground/80 font-mono text-[10px] tracking-[0.18em] uppercase">
            Error del servidor
          </p>
        </div>
        <h1 className="text-foreground relative text-xl font-semibold tracking-tight">
          No se pudo cargar la página
        </h1>
        <p className="text-muted-foreground relative text-sm leading-relaxed">
          Ocurrió un error interno. Intentá recargar la página. Si persiste, contactá al
          administrador.
        </p>
        {error.digest && (
          <p className="text-muted-foreground/50 font-mono text-[10px] tracking-wider uppercase">
            Código · {error.digest}
          </p>
        )}
        <div className="relative flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={reset}
            className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center gap-1.5 rounded-[var(--admin-radius)] px-4 py-2 text-sm font-semibold transition-colors"
          >
            <RefreshCw size={13} />
            Reintentar
          </button>
          <Link
            href="/admin"
            className="border-border bg-background text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-[var(--admin-radius)] border px-4 py-2 text-sm font-semibold transition-colors"
          >
            Volver al panel
          </Link>
        </div>
      </div>
    </div>
  );
}
