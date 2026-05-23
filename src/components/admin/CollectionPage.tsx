'use client';

import { useState } from 'react';

import { Pencil, Plus, Trash2 } from 'lucide-react';

import { CollectionItemForm } from '@/components/admin/CollectionItemForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CollectionConfig, CollectionFieldDef } from '@/constants/admin-config';
import type { CollectionItem } from '@/hooks/use-collection';
import { useCollection } from '@/hooks/use-collection';

type CollectionPageProps = {
  slug: string;
  config: CollectionConfig;
  initialItems: CollectionItem[];
};

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

export function CollectionPage({ slug, config, initialItems }: CollectionPageProps) {
  const { saving, create, update, remove } = useCollection(slug);
  const [dialogState, setDialogState] = useState<
    { mode: 'add' } | { mode: 'edit'; item: CollectionItem } | null
  >(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label tracking-label text-muted-foreground mb-1 font-mono uppercase">
            Contenido · {config.label}
          </p>
          <h1 className="text-foreground text-xl font-semibold">{config.label}</h1>
        </div>
        <Button onClick={() => setDialogState({ mode: 'add' })} className="gap-2">
          <Plus size={14} /> Agregar
        </Button>
      </div>

      {initialItems.length === 0 && (
        <p className="text-muted-foreground text-sm">Sin registros. Agregá el primero.</p>
      )}

      {initialItems.length > 0 && (
        <div className="border-border divide-border divide-y border">
          {initialItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-foreground min-w-0 flex-1 truncate text-sm">
                {config.summarize(item)}
              </span>

              {confirmDeleteId === item.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">¿Eliminar?</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                    disabled={saving}
                  >
                    Sí
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>
                    No
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDialogState({ mode: 'edit', item })}
                    className="text-muted-foreground hover:text-foreground p-1.5 transition-colors"
                    aria-label="Editar"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(item.id)}
                    className="text-muted-foreground hover:text-destructive p-1.5 transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogState !== null} onOpenChange={(open) => !open && setDialogState(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogState?.mode === 'edit'
                ? `Editar — ${config.label}`
                : `Agregar — ${config.label}`}
            </DialogTitle>
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
