import { Suspense } from 'react';

import { MediaBrowser } from '@/components/admin/MediaBrowser';

function MediaContent() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-label tracking-label text-muted-foreground mb-1 font-mono uppercase">
          Contenido · Imágenes
        </p>
        <h1 className="text-foreground text-xl font-semibold">Galería de imágenes</h1>
      </div>

      <MediaBrowser />
    </div>
  );
}

export default function MediaPage() {
  return (
    <Suspense fallback={null}>
      <MediaContent />
    </Suspense>
  );
}
