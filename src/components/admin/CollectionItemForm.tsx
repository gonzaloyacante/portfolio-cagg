'use client';

import { useState } from 'react';

import { BilingualField } from '@/components/admin/BilingualField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CollectionFieldDef } from '@/constants/admin-config';

type CollectionItemFormProps = {
  fields: CollectionFieldDef[];
  initial: Record<string, string>;
  saving: boolean;
  onSubmit: (data: Record<string, string>) => Promise<boolean>;
  onCancel: () => void;
};

export function CollectionItemForm({
  fields,
  initial,
  saving,
  onSubmit,
  onCancel,
}: CollectionItemFormProps) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [error, setError] = useState<string | null>(null);

  const set = (name: string, value: string) => setValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const ok = await onSubmit(values);
    if (!ok) setError('Error al guardar.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field) => {
        if (field.kind === 'single') {
          const InputEl = field.type === 'textarea' ? Textarea : Input;
          return (
            <div key={field.name} className="space-y-1.5">
              <Label htmlFor={field.name}>{field.label}</Label>
              <InputEl
                id={field.name}
                value={values[field.name] ?? ''}
                onChange={(e) => set(field.name, e.target.value)}
                rows={field.type === 'textarea' ? 3 : undefined}
              />
            </div>
          );
        }

        const nameEs = `${field.baseName}Es`;
        const nameEn = `${field.baseName}En`;
        const InputEl = field.type === 'textarea' ? Textarea : Input;

        return (
          <BilingualField key={field.baseName} label={field.label}>
            <div className="space-y-1.5">
              <Label htmlFor={nameEs}>Español</Label>
              <InputEl
                id={nameEs}
                value={values[nameEs] ?? ''}
                onChange={(e) => set(nameEs, e.target.value)}
                rows={field.type === 'textarea' ? 3 : undefined}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={nameEn}>English</Label>
              <InputEl
                id={nameEn}
                value={values[nameEn] ?? ''}
                onChange={(e) => set(nameEn, e.target.value)}
                rows={field.type === 'textarea' ? 3 : undefined}
              />
            </div>
          </BilingualField>
        );
      })}

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
