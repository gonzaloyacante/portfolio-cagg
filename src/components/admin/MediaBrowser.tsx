'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { ChevronLeft, ChevronRight, Copy, Trash2, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { type MediaFile, useMedia } from '@/hooks/use-media';

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type MediaCardProps = {
  item: MediaFile;
  onDelete: (publicId: string) => void;
};

function MediaCard({ item, onDelete }: MediaCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.secureUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const name = item.publicId.split('/').pop() ?? item.publicId;

  return (
    <div className="border-border group relative flex flex-col overflow-hidden border">
      <div className="bg-muted relative aspect-square overflow-hidden">
        <Image
          src={item.secureUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 17vw"
          className="object-contain"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-foreground min-w-0 truncate text-xs font-medium" title={name}>
          {name}
        </p>
        <p className="text-muted-foreground text-xs">
          {item.format.toUpperCase()}
          {item.width && item.height ? ` · ${item.width}×${item.height}` : ''}
          {item.bytes ? ` · ${formatBytes(item.bytes)}` : ''}
        </p>

        <div className="mt-auto flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            title="Copiar URL"
            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
          >
            <Copy size={13} />
          </button>
          {copied && <span className="text-muted-foreground text-xs">¡Copiado!</span>}

          <div className="ml-auto">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">¿Eliminar?</span>
                <Button size="sm" variant="destructive" onClick={() => onDelete(item.publicId)}>
                  Sí
                </Button>
                <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>
                  No
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                title="Eliminar"
                className="text-muted-foreground hover:text-destructive p-1 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MediaBrowser() {
  const { items, total, page, totalPages, loading, uploading, error, fetchPage, upload, remove } =
    useMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      await upload(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          {total} {total === 1 ? 'imagen' : 'imágenes'}
        </p>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            size="sm"
            className="gap-2"
          >
            <Upload size={14} />
            {uploading ? 'Subiendo…' : 'Subir imagen'}
          </Button>
        </div>
      </div>

      {error && (
        <p className="border-destructive text-destructive border px-4 py-2 text-sm">{error}</p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-muted border-border aspect-square animate-pulse border" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="border-border flex flex-col items-center justify-center border py-16">
          <p className="text-muted-foreground text-sm">Sin imágenes todavía.</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Sube tu primera imagen con el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} onDelete={remove} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => fetchPage(page - 1)}
            disabled={page <= 1 || loading}
            className="text-muted-foreground hover:text-foreground disabled:opacity-40"
            aria-label="Página anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-muted-foreground text-sm">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => fetchPage(page + 1)}
            disabled={page >= totalPages || loading}
            className="text-muted-foreground hover:text-foreground disabled:opacity-40"
            aria-label="Página siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
