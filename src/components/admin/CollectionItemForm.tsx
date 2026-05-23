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

function validate(
  fields: CollectionFieldDef[],
  values: Record<string, string>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    if (field.kind === 'single') {
      if (!values[field.name]?.trim()) errors[field.name] = 'Obligatorio.';
    } else {
      const nameEs = `${field.baseName}Es`;
      const nameEn = `${field.baseName}En`;
      if (!values[nameEs]?.trim()) errors[nameEs] = 'Obligatorio.';
      if (!values[nameEn]?.trim()) errors[nameEn] = 'Obligatorio.';
    }
  }
  return errors;
}

export function CollectionItemForm({
  fields,
  initial,
  saving,
  onSubmit,
  onCancel,
}: CollectionItemFormProps) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const errors = validate(fields, values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    const ok = await onSubmit(values);
    if (!ok) setSubmitError('Error al guardar. Revisá los datos e intentá de nuevo.');
  };

  const field_input = (name: string, type: 'text' | 'textarea') => (
    <div className="space-y-1">
      {type === 'textarea' ? (
        <Textarea
          id={name}
          rows={3}
          value={values[name] ?? ''}
          onChange={(e) => set(name, e.target.value)}
          aria-invalid={!!fieldErrors[name]}
          className={fieldErrors[name] ? 'border-destructive' : ''}
        />
      ) : (
        <Input
          id={name}
          value={values[name] ?? ''}
          onChange={(e) => set(name, e.target.value)}
          aria-invalid={!!fieldErrors[name]}
          className={fieldErrors[name] ? 'border-destructive' : ''}
        />
      )}
      {fieldErrors[name] && <p className="text-destructive text-xs">{fieldErrors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field) => {
        if (field.kind === 'single') {
          return (
            <div key={field.name} className="space-y-1.5">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field_input(field.name, field.type)}
            </div>
          );
        }

        const nameEs = `${field.baseName}Es`;
        const nameEn = `${field.baseName}En`;

        return (
          <BilingualField key={field.baseName} label={field.label}>
            <div className="space-y-1.5">
              <Label htmlFor={nameEs}>Español</Label>
              {field_input(nameEs, field.type)}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={nameEn}>English</Label>
              {field_input(nameEn, field.type)}
            </div>
          </BilingualField>
        );
      })}

      {submitError && <p className="text-destructive text-sm">{submitError}</p>}

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
