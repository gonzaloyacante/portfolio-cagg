'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ImageIcon,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

import { EmptyState } from '@/components/admin/EmptyState';
import { SectionHelp } from '@/components/admin/FieldHelp';
import { Button } from '@/components/ui/button';
import { type MediaFile, useMedia } from '@/hooks/use-media';
import { cn } from '@/lib/utils';

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type MediaCardProps = {
  item: MediaFile;
  onDelete: (publicId: string) => void;
  pending: boolean;
};

function MediaCard({ item, onDelete, pending }: MediaCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.secureUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const name = item.publicId.split('/').pop() ?? item.publicId;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="admin-hairline admin-card-hover group bg-card/40 relative flex flex-col overflow-hidden rounded-[var(--admin-radius-lg)]"
    >
      <div className="bg-muted relative aspect-square overflow-hidden">
        <Image
          src={item.secureUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 17vw"
          className={cn('object-contain transition-transform duration-300', hovered && 'scale-105')}
        />
        {confirmDelete && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/70 p-2 backdrop-blur-sm">
            <Button
              size="xs"
              variant="destructive"
              onClick={() => onDelete(item.publicId)}
              disabled={pending}
            >
              Eliminar
            </Button>
            <Button size="xs" variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-foreground min-w-0 truncate text-xs font-medium" title={name}>
          {name}
        </p>
        <p className="text-muted-foreground flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] uppercase">
          <span>{item.format.toUpperCase()}</span>
          {item.width && item.height ? (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="tabular-nums">
                {item.width}×{item.height}
              </span>
            </>
          ) : null}
          {item.bytes ? (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="tabular-nums">{formatBytes(item.bytes)}</span>
            </>
          ) : null}
        </p>

        <div className="mt-auto flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            title="Copiar URL"
            className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors"
          >
            {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            {copied ? '¡Copiado!' : 'Copiar URL'}
          </button>

          {!confirmDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              title="Eliminar"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-auto rounded-md p-1 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          )}
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
    <div className="space-y-5">
      <SectionHelp
        title="¿Qué es la galería de imágenes?"
        description="Acá subís todas las imágenes que usás en el sitio (fotos, logos, etc.). Las imágenes se guardan en Cloudinary (un servicio de hosting de imágenes) y quedan disponibles para usar en otras secciones del sitio, por ejemplo la foto de portada del Hero."
        appearsIn="Las imágenes que subís acá se pueden elegir desde otros formularios (ej: Hero → Foto de portada)."
        tips={[
          'Tamaño máximo por imagen: 10 MB.',
          'Formatos soportados: JPG, PNG, WebP, GIF, SVG.',
          'Una vez subida, podés elegir la imagen en cualquier campo de tipo "imagen" del admin.',
        ]}
      />

      {/* File type breakdown */}
      {total > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {Object.entries(
            items.reduce<Record<string, number>>((acc, m) => {
              const fmt = m.format.toUpperCase();
              acc[fmt] = (acc[fmt] ?? 0) + 1;
              return acc;
            }, {})
          ).map(([fmt, count]) => (
            <span
              key={fmt}
              className="border-border bg-muted/30 text-muted-foreground inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase"
              title={`${count} imagen${count === 1 ? '' : 'es'} en formato ${fmt}`}
            >
              {fmt}
              <span className="text-foreground/70 tabular-nums">{count}</span>
            </span>
          ))}
        </div>
      )}

      <div className="admin-hairline bg-card/40 flex flex-wrap items-center justify-between gap-4 rounded-[var(--admin-radius-lg)] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="border-border bg-muted/30 text-muted-foreground flex h-9 w-9 items-center justify-center rounded-md border">
            <ImageIcon size={14} />
          </div>
          <div>
            <p className="text-foreground text-sm font-semibold tracking-tight">
              {total} {total === 1 ? 'imagen' : 'imágenes'} en la galería
            </p>
            <p className="text-muted-foreground text-[11px]">
              JPEG, PNG, WebP, GIF y SVG — máximo 10 MB por archivo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalPages > 1 && (
            <div className="border-border bg-muted/30 flex items-center gap-1 rounded-[var(--admin-radius)] border p-1">
              <button
                type="button"
                onClick={() => fetchPage(page - 1)}
                disabled={page <= 1 || loading}
                className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors disabled:opacity-40"
                aria-label="Página anterior"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="text-muted-foreground px-2 font-mono text-[10px] tabular-nums">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => fetchPage(page + 1)}
                disabled={page >= totalPages || loading}
                className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors disabled:opacity-40"
                aria-label="Página siguiente"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}

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
            className="admin-glow gap-1.5"
          >
            <Upload size={13} />
            {uploading ? 'Subiendo…' : 'Subir imagen'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-[var(--admin-radius)] border px-3 py-2 text-xs">
          <X size={12} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="admin-shimmer aspect-square rounded-[var(--admin-radius-lg)]"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Sin imágenes todavía"
          description="Subí tu primera imagen con el botón de arriba. Después podés copiarla o eliminarla."
          action={
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5"
            >
              <Upload size={13} />
              Subir primera
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} onDelete={remove} pending={false} />
          ))}
        </div>
      )}
    </div>
  );
}
