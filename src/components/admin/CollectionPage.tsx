'use client';

import { useMemo, useState } from 'react';

import {
  Building2,
  Calendar,
  FileText,
  GraduationCap,
  GripVertical,
  Hash,
  HelpCircle,
  Layers,
  type LucideIcon,
  Mail,
  MessageSquareQuote,
  Pencil,
  Plus,
  Quote,
  Search,
  Star,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { CollectionItemForm } from '@/components/admin/CollectionItemForm';
import { EmptyState } from '@/components/admin/EmptyState';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CollectionConfig, CollectionFieldDef } from '@/constants/admin-config';
import type { CollectionItem } from '@/hooks/use-collection';
import { useCollection } from '@/hooks/use-collection';
import { cn } from '@/lib/utils';

type CollectionPageProps = {
  slug: string;
  config: CollectionConfig;
  initialItems: CollectionItem[];
  /** Optional URL to preview this collection on the public site */
  previewUrl?: string;
};

const ICON_BY_SLUG: Record<string, LucideIcon> = {
  brands: Building2,
  experience: Wrench,
  process: Layers,
  services: Star,
  projects: FileText,
  results: Calendar,
  testimonials: Quote,
  timeline: GraduationCap,
  faqs: HelpCircle,
  messages: MessageSquareQuote,
  contact: Mail,
};

const SLUG_DESCRIPTION: Record<string, string> = {
  brands:
    'Acá cargás los nombres de las empresas y clientes con los que colaboraste. Se muestran en un marquee horizontal en la landing.',
  experience:
    'Cada item es un puesto o experiencia profesional. Aparece como tarjeta con código, título y descripción en la sección "Experiencia".',
  process:
    'Cada item es un paso de tu proceso de trabajo. Aparecen numerados en la sección "Proceso".',
  services:
    'Cada item es un servicio individual que ofrecés. Aparecen como bullets en la sección "Servicios".',
  projects:
    'Cada item es un proyecto o caso de éxito. Aparece como tarjeta con tag, período, título, desafío, lo que hiciste y el resultado.',
  results:
    'Cada item es una métrica o número clave de tu carrera. Aparece como tarjeta grande con valor y etiqueta.',
  testimonials:
    'Cada item es un testimonio de un cliente. Aparece como cita con el rol y el sector de quien lo dijo.',
  timeline:
    'Cada item es un hito cronológico de tu carrera. Aparece con su período, título y descripción.',
  faqs: 'Cada item es una pregunta frecuente con su respuesta. Aparece como accordion expandible en la sección "FAQ".',
};

function ItemCardPreview({ item, slug }: { item: CollectionItem; slug: string }) {
  const str = (k: string) => (typeof item[k] === 'string' ? (item[k] as string) : '');

  if (slug === 'brands') {
    return (
      <div className="space-y-1.5">
        <p className="text-foreground line-clamp-1 text-base font-semibold tracking-tight">
          {str('name')}
        </p>
        <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
          Marca
        </p>
      </div>
    );
  }
  if (slug === 'results') {
    return (
      <div className="space-y-2">
        <p className="text-foreground admin-text-gradient text-3xl leading-none font-bold tabular-nums">
          {str('vEs')}
        </p>
        <div className="space-y-0.5">
          <p className="text-foreground line-clamp-1 text-sm font-medium">{str('kEs')}</p>
          <p className="text-muted-foreground line-clamp-1 text-xs">{str('kEn')}</p>
        </div>
      </div>
    );
  }
  if (slug === 'testimonials') {
    return (
      <div className="space-y-3">
        <Quote size={14} className="text-muted-foreground/30" />
        <p className="text-foreground line-clamp-4 text-sm leading-relaxed italic">
          &ldquo;{str('quoteEs')}&rdquo;
        </p>
        <div className="border-border space-y-0.5 border-t pt-2">
          <p className="text-foreground text-xs font-semibold">{str('roleEs')}</p>
          <p className="text-muted-foreground text-xs">{str('sectorEs')}</p>
        </div>
      </div>
    );
  }
  if (slug === 'faqs') {
    return (
      <div className="space-y-2">
        <p className="text-foreground line-clamp-2 text-sm leading-snug font-medium">
          {str('qEs')}
        </p>
        <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">{str('aEs')}</p>
      </div>
    );
  }
  if (slug === 'timeline') {
    return (
      <div className="space-y-2">
        <p className="text-muted-foreground flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] uppercase">
          <Hash size={10} />
          {str('period')}
        </p>
        <p className="text-foreground line-clamp-1 text-sm font-semibold">{str('titleEs')}</p>
        <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
          {str('bodyEs')}
        </p>
      </div>
    );
  }
  if (slug === 'process') {
    return (
      <div className="space-y-2.5">
        <p className="text-muted-foreground flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] uppercase">
          <Hash size={10} />
          {str('code')}
        </p>
        <p className="text-foreground line-clamp-1 text-sm font-semibold">{str('titleEs')}</p>
        <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
          {str('bodyEs')}
        </p>
        <p className="text-foreground/80 border-border mt-2 flex items-center gap-1.5 border-t pt-2 text-[11px]">
          <span className="text-muted-foreground/60 font-mono text-[9px] tracking-widest uppercase">
            Entregable
          </span>
          <span className="line-clamp-1">{str('deliverableEs')}</span>
        </p>
      </div>
    );
  }
  if (slug === 'projects') {
    return (
      <div className="space-y-2.5">
        <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] tracking-[0.18em] uppercase">
          <Hash size={9} />
          {str('tag')}
        </span>
        <p className="text-foreground line-clamp-1 text-sm font-semibold">{str('titleEs')}</p>
        <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
          {str('challengeEs')}
        </p>
      </div>
    );
  }
  // default / experience / services
  return (
    <div className="space-y-1">
      <p className="text-foreground line-clamp-2 text-sm leading-snug font-medium">
        {item._summary}
      </p>
    </div>
  );
}

function SortableItemCard(props: {
  item: CollectionItem;
  slug: string;
  index: number;
  confirming: boolean;
  saving: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDeleteConfirm: () => void;
  onCancelDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.item.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ItemCard
        {...props}
        isDragging={isDragging}
        dragHandleProps={{}}
        dragHandleListeners={listeners}
      />
    </div>
  );
}

function buildInitial(fields: CollectionFieldDef[], item?: CollectionItem): Record<string, string> {
  const result: Record<string, string> = {};
  for (const field of fields) {
    if (field.kind === 'single') {
      result[field.name] = item ? String(item[field.name] ?? '') : '';
    } else {
      result[`${field.baseName}Es`] = item ? String(item[`${field.baseName}Es`] ?? '') : '';
      result[`${field.baseName}En`] = item ? String(item[`${field.baseName}En`] ?? '') : '';
    }
  }
  return result;
}

function ItemCard({
  item,
  slug,
  index,
  confirming,
  saving,
  onEdit,
  onDelete,
  onDeleteConfirm,
  onCancelDelete,
  isDragging,
  dragHandleProps,
  dragHandleListeners,
}: {
  item: CollectionItem;
  slug: string;
  index: number;
  confirming: boolean;
  saving: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDeleteConfirm: () => void;
  onCancelDelete: () => void;
  isDragging: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  dragHandleListeners?: Record<string, unknown>;
}) {
  return (
    <article
      data-testid={`collection-item-${item.id}`}
      className={cn(
        'admin-hairline admin-card-hover group bg-card/50 relative flex flex-col gap-4 overflow-hidden rounded-[var(--admin-radius-lg)] p-5',
        confirming && 'ring-destructive/40 ring-1',
        isDragging && 'ring-foreground/30 opacity-50 ring-2'
      )}
    >
      {/* Card header with drag handle + actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="border-border bg-muted/40 text-muted-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-md border font-mono text-[10px] tracking-wider tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </div>
          <button
            type="button"
            aria-label="Arrastrar para reordenar"
            title="Arrastrar para reordenar"
            data-testid={`collection-item-drag-${item.id}`}
            className="text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/40 flex h-7 w-7 cursor-grab items-center justify-center rounded-md transition-colors active:cursor-grabbing"
            {...(dragHandleProps ?? {})}
            {...(dragHandleListeners ?? {})}
          >
            <GripVertical size={12} />
          </button>
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            data-testid={`collection-item-edit-${item.id}`}
            className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors"
          >
            <Pencil size={11} />
            Editar
          </button>
          {confirming ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onDeleteConfirm}
                disabled={saving}
                data-testid={`collection-item-confirm-${item.id}`}
                className="bg-destructive/15 text-destructive hover:bg-destructive/25 border-destructive/30 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Trash2 size={11} />
                {saving ? 'Eliminando…' : 'Eliminar'}
              </button>
              <button
                type="button"
                onClick={onCancelDelete}
                data-testid={`collection-item-cancel-${item.id}`}
                className="text-muted-foreground hover:text-foreground border-border hover:bg-muted inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition-colors"
              >
                <X size={11} />
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onDelete}
              data-testid={`collection-item-delete-${item.id}`}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors"
              aria-label="Eliminar"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="min-h-[60px] flex-1">
        <ItemCardPreview item={item} slug={slug} />
      </div>

      {/* Card footer */}
      <div className="border-border text-muted-foreground/60 flex items-center justify-between border-t pt-3 font-mono text-[10px] tracking-[0.18em] uppercase">
        <span className="flex items-center gap-1.5">
          <span className="bg-muted-foreground/40 inline-block h-1 w-1 rounded-full" />
          ID · {item.id.slice(-6)}
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Abrir →
        </button>
      </div>
    </article>
  );
}

export function CollectionPage({ slug, config, initialItems, previewUrl }: CollectionPageProps) {
  const { saving, create, update, remove, reorder } = useCollection(slug);
  const [dialogState, setDialogState] = useState<
    { mode: 'add' } | { mode: 'edit'; item: CollectionItem } | null
  >(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [localOrder, setLocalOrder] = useState<string[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const Icon = ICON_BY_SLUG[slug] ?? FileText;

  const filtered = useMemo(() => {
    const source = localOrder
      ? (localOrder
          .map((id) => initialItems.find((i) => i.id === id))
          .filter(Boolean) as CollectionItem[])
      : initialItems;
    if (!query.trim()) return source;
    const q = query.toLowerCase();
    return source.filter((item) =>
      Object.values(item).some((v) => typeof v === 'string' && v.toLowerCase().includes(q))
    );
  }, [initialItems, query, localOrder]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const currentOrder = localOrder ?? initialItems.map((i) => i.id);
    const oldIndex = currentOrder.indexOf(String(active.id));
    const newIndex = currentOrder.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
    setLocalOrder(newOrder);
    await reorder(newOrder);
  };

  const handleSubmit = async (data: Record<string, string>): Promise<boolean> => {
    const ok =
      dialogState?.mode === 'edit'
        ? await update(dialogState.item.id, data)
        : await create({ ...data, order: initialItems.length });
    if (ok) setDialogState(null);
    return ok;
  };

  const handleDelete = async (id: string) => {
    const ok = await remove(id);
    if (ok) setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrowIcon={<Icon size={11} />}
        eyebrow={`Contenido · ${config.label}`}
        title={config.label}
        description={
          SLUG_DESCRIPTION[slug] ??
          `Administrá los registros de ${config.label.toLowerCase()}. Cada cambio se ve inmediatamente en la landing pública.`
        }
        previewUrl={previewUrl}
        previewLabel="Ver sección en vivo"
        meta={
          <>
            <span className="border-border bg-muted/30 text-muted-foreground inline-flex items-center gap-1.5 rounded-[var(--admin-radius)] border px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] uppercase">
              <span className="admin-status-dot text-emerald-400" />
              {initialItems.length} {initialItems.length === 1 ? 'registro' : 'registros'}
            </span>
            {query && (
              <span className="border-border bg-muted/30 text-muted-foreground inline-flex items-center gap-1.5 rounded-[var(--admin-radius)] border px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] uppercase">
                {filtered.length} resultado{filtered.length === 1 ? '' : 's'}
              </span>
            )}
          </>
        }
        actions={
          <>
            {initialItems.length > 3 && (
              <div className="border-border bg-muted/30 flex items-center gap-2 rounded-[var(--admin-radius)] border px-2.5 py-1.5">
                <Search size={12} className="text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filtrar…"
                  className="placeholder:text-muted-foreground/70 w-32 bg-transparent text-xs outline-none"
                  data-testid="collection-search"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Limpiar filtro"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            )}
            <Button
              onClick={() => setDialogState({ mode: 'add' })}
              data-testid="collection-add-btn"
              className="admin-glow gap-1.5"
            >
              <Plus size={13} />
              Agregar
            </Button>
          </>
        }
      />

      {initialItems.length === 0 ? (
        <EmptyState
          icon={Icon}
          title={`Sin ${config.label.toLowerCase()} todavía`}
          description={`Empezá creando tu primer registro. Después podés editarlo o reordenarlo cuando quieras.`}
          action={
            <Button
              onClick={() => setDialogState({ mode: 'add' })}
              variant="outline"
              className="gap-1.5"
            >
              <Plus size={13} />
              Crear primero
            </Button>
          }
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item, index) => (
                <SortableItemCard
                  key={item.id}
                  item={item}
                  slug={slug}
                  index={index}
                  saving={saving}
                  confirming={confirmDeleteId === item.id}
                  onEdit={() => setDialogState({ mode: 'edit', item })}
                  onDelete={() => setConfirmDeleteId(item.id)}
                  onDeleteConfirm={() => {
                    void handleDelete(item.id);
                  }}
                  onCancelDelete={() => setConfirmDeleteId(null)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Search no results */}
      {query && filtered.length === 0 && initialItems.length > 0 && (
        <EmptyState
          icon={Search}
          title="Sin resultados"
          description={`No encontramos coincidencias para "${query}". Probá con otro término.`}
          action={
            <Button variant="outline" onClick={() => setQuery('')} className="gap-1.5">
              <X size={12} />
              Limpiar filtro
            </Button>
          }
        />
      )}

      {/* Dialog */}
      <Dialog open={dialogState !== null} onOpenChange={(open) => !open && setDialogState(null)}>
        <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-border border-b px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="border-border bg-muted/40 text-muted-foreground flex h-9 w-9 items-center justify-center rounded-[var(--admin-radius)] border">
                <Icon size={15} />
              </div>
              <div className="space-y-0.5">
                <DialogTitle>
                  {dialogState?.mode === 'edit'
                    ? `Editar — ${config.label}`
                    : `Nuevo — ${config.label}`}
                </DialogTitle>
                <p className="text-muted-foreground text-xs">
                  {dialogState?.mode === 'edit'
                    ? 'Modificá los datos y guardá los cambios.'
                    : 'Completá los datos para crear un nuevo registro.'}
                </p>
              </div>
            </div>
          </DialogHeader>
          {dialogState && (
            <CollectionItemForm
              key={dialogState.mode === 'edit' ? dialogState.item.id : 'new'}
              fields={config.fields}
              initial={buildInitial(
                config.fields,
                dialogState.mode === 'edit' ? dialogState.item : undefined
              )}
              saving={saving}
              onSubmit={handleSubmit}
              onCancel={() => setDialogState(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
