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
    <div className="bg-background text-foreground flex min-h-dvh flex-col items-center justify-center gap-6 p-8">
      <div className="border-border bg-card w-full max-w-md space-y-6 border p-8">
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="text-destructive shrink-0" />
          <p className="text-label tracking-label text-muted-foreground font-mono uppercase">
            Error del servidor
          </p>
        </div>
        <h1 className="text-foreground text-xl font-semibold">No se pudo cargar la página</h1>
        <p className="text-muted-foreground text-sm">
          Ocurrió un error interno. Intentá recargar la página.
        </p>
        {error.digest && (
          <p className="text-muted-foreground/50 font-mono text-xs">Código: {error.digest}</p>
        )}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="bg-foreground text-background inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
          >
            <RefreshCw size={14} /> Reintentar
          </button>
          <Link
            href="/admin"
            className="border-border text-foreground inline-flex items-center gap-2 border px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
          >
            Volver al panel
          </Link>
        </div>
      </div>
    </div>
  );
}
