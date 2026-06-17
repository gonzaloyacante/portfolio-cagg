'use client';

import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';

import { Check, Image as ImageIcon, Search, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type MediaFile, useMedia } from '@/hooks/use-media';
import { cn } from '@/lib/utils';

type MediaPickerProps = {
  /** Currently selected URL (or null/undefined) */
  value: string | null | undefined;
  /** Called when a new image is picked */
  onChange: (url: string | null) => void;
  /** Optional label shown above the field */
  label?: string;
  /** Optional detailed description shown below the label */
  description?: string;
  /** Where this image will appear in the public site */
  appearsIn?: string;
  /** data-testid for the trigger button */
  testId?: string;
  /** Aspect ratio for the preview (default: "portrait" — 3:4) */
  aspect?: 'portrait' | 'square' | 'wide';
  /** Class name for the outer wrapper */
  className?: string;
};

/**
 * MediaPicker — field that lets the admin pick an image from the media
 * library, or upload a new one on the fly. Shows a clear preview of the
 * currently selected image with a "change" / "remove" action.
 */
export function MediaPicker({
  value,
  onChange,
  label = 'Imagen',
  description,
  appearsIn,
  testId,
  aspect = 'portrait',
  className,
}: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClass = {
    portrait: 'aspect-[3/4]',
    square: 'aspect-square',
    wide: 'aspect-[16/9]',
  }[aspect];

  return (
    <div className={cn('space-y-2', className)}>
      {/* Field label + where it appears */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-foreground text-xs font-semibold tracking-tight">{label}</label>
        {appearsIn && (
          <span
            className="border-border bg-muted/30 text-muted-foreground inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.18em] uppercase"
            title="Dónde se muestra esta imagen en el sitio público"
          >
            <ImageIcon size={9} />
            {appearsIn}
          </span>
        )}
      </div>
      {description && (
        <p className="text-muted-foreground text-[11px] leading-relaxed">{description}</p>
      )}

      {/* Preview or empty state */}
      {value ? (
        <div
          className={cn(
            'admin-hairline group bg-card/40 relative overflow-hidden rounded-[var(--admin-radius-lg)]',
            aspectClass
          )}
        >
          <Image
            src={value}
            alt="Vista previa"
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 flex items-end justify-end gap-1.5 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Button
              type="button"
              size="xs"
              variant="secondary"
              onClick={() => setOpen(true)}
              data-testid={testId ? `${testId}-change` : undefined}
              className="admin-glass border-border/40 border backdrop-blur-md"
            >
              Cambiar
            </Button>
            <Button
              type="button"
              size="xs"
              variant="destructive"
              onClick={() => onChange(null)}
              data-testid={testId ? `${testId}-remove` : undefined}
              className="backdrop-blur-md"
            >
              Quitar
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-testid={testId}
          className={cn(
            'admin-hairline border-border/70 bg-card/30 hover:border-foreground/30 hover:bg-card/50 relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-[var(--admin-radius-lg)] border-2 border-dashed p-6 text-center transition-colors',
            aspectClass
          )}
        >
          <div className="border-border bg-muted/30 text-muted-foreground flex h-10 w-10 items-center justify-center rounded-md border">
            <ImageIcon size={16} />
          </div>
          <div className="space-y-0.5">
            <p className="text-foreground text-sm font-medium">Elegí una imagen</p>
            <p className="text-muted-foreground text-[11px]">
              Hacé click para abrir la galería o subir una nueva.
            </p>
          </div>
        </button>
      )}

      {/* Picker dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="border-border border-b px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="border-border bg-muted/40 text-muted-foreground flex h-9 w-9 items-center justify-center rounded-[var(--admin-radius)] border">
                <ImageIcon size={15} />
              </div>
              <div className="space-y-0.5">
                <DialogTitle>Galería de imágenes</DialogTitle>
                <p className="text-muted-foreground text-xs">
                  Elegí una imagen subida o subí una nueva. Quedará guardada en tu biblioteca.
                </p>
              </div>
            </div>
          </DialogHeader>
          <MediaPickerLibrary
            onPick={(url) => {
              onChange(url);
              setOpen(false);
            }}
            onUploadClick={() => fileInputRef.current?.click()}
            fileInputRef={fileInputRef}
            onUploaded={(file) => {
              onChange(file.secureUrl);
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MediaPickerLibrary({
  onPick,
  onUploadClick,
  onUploaded,
  fileInputRef,
}: {
  onPick: (url: string) => void;
  onUploadClick: () => void;
  onUploaded: (file: MediaFile) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const { items, total, loading, uploading, error, fetchPage, upload } = useMedia();
  const [query, setQuery] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;
    const uploaded = await upload(file);
    if (uploaded) onUploaded(uploaded);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filtered = query
    ? items.filter((m) => m.publicId.toLowerCase().includes(query.toLowerCase()))
    : items;

  return (
    <div className="max-h-[calc(90vh-90px)] overflow-y-auto p-5">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="border-border bg-muted/30 flex items-center gap-2 rounded-[var(--admin-radius)] border px-2.5 py-1.5">
          <Search size={12} className="text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar por nombre…"
            className="placeholder:text-muted-foreground/70 w-40 bg-transparent text-xs outline-none"
            data-testid="media-picker-search"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={11} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
            {total} {total === 1 ? 'imagen' : 'imágenes'}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            onClick={onUploadClick}
            disabled={uploading}
            className="admin-glow gap-1.5"
            size="sm"
          >
            <Upload size={12} />
            {uploading ? 'Subiendo…' : 'Subir nueva'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive mb-3 flex items-center gap-2 rounded-[var(--admin-radius)] border px-3 py-2 text-xs">
          <X size={12} />
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="admin-shimmer aspect-square rounded-[var(--admin-radius-lg)]"
              style={{ animationDelay: `${i * 40}ms` }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border-border flex flex-col items-center justify-center gap-3 rounded-[var(--admin-radius-lg)] border border-dashed py-10 text-center">
          <div className="border-border bg-muted/30 text-muted-foreground flex h-10 w-10 items-center justify-center rounded-md border">
            <ImageIcon size={15} />
          </div>
          <div className="space-y-1">
            <p className="text-foreground text-sm font-medium">Sin imágenes todavía</p>
            <p className="text-muted-foreground text-[11px]">
              Subí tu primera imagen con el botón &ldquo;Subir nueva&rdquo;.
            </p>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {filtered.map((item) => {
            const hovered = hoveredId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onPick(item.secureUrl)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  data-testid={`media-picker-item-${item.id}`}
                  className="admin-hairline group bg-card/40 relative block aspect-square w-full overflow-hidden rounded-[var(--admin-radius-lg)] transition-transform hover:scale-[1.02]"
                >
                  <Image
                    src={item.secureUrl}
                    alt={item.publicId}
                    fill
                    sizes="(max-width: 640px) 33vw, 20vw"
                    className="object-cover"
                    unoptimized
                  />
                  {hovered && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <span className="bg-foreground text-background flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold">
                        <Check size={12} />
                        Elegir
                      </span>
                    </div>
                  )}
                </button>
                <p
                  className="text-muted-foreground mt-1 truncate text-[10px]"
                  title={item.publicId}
                >
                  {item.publicId.split('/').pop()}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
