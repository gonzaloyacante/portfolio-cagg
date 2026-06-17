import { Suspense } from 'react';

import { Image as ImageIcon } from 'lucide-react';

import { MediaBrowser } from '@/components/admin/MediaBrowser';
import { PageHeader } from '@/components/admin/PageHeader';

function MediaContent() {
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrowIcon={<ImageIcon size={11} />}
        eyebrow="Contenido · Imágenes"
        title="Galería de imágenes"
        description="Subí y administrá las imágenes del portfolio. Después podés usarlas en cualquier sección."
      />
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
