'use client';

import { useState } from 'react';

import { AlertCircle, Check, Globe, Loader2, X } from 'lucide-react';

import { BilingualFieldTabs } from '@/components/admin/BilingualFieldTabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { CollectionFieldDef } from '@/constants/admin-config';
import { cn } from '@/lib/utils';

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
      if (!values[field.name]?.trim()) errors[field.name] = 'Requerido';
    } else {
      const nameEs = `${field.baseName}Es`;
      const nameEn = `${field.baseName}En`;
      if (!values[nameEs]?.trim()) errors[nameEs] = 'Requerido';
      if (!values[nameEn]?.trim()) errors[nameEn] = 'Requerido';
    }
  }
  return errors;
}

function FieldInput({
  name,
  type,
  values,
  set,
  fieldErrors,
  placeholder,
}: {
  name: string;
  type: 'text' | 'textarea';
  values: Record<string, string>;
  set: (name: string, value: string) => void;
  fieldErrors: Record<string, string>;
  placeholder?: string;
}) {
  const hasError = !!fieldErrors[name];
  const value = values[name] ?? '';
  const charCount = value.length;

  if (type === 'textarea') {
    return (
      <div className="space-y-1.5">
        <Textarea
          id={name}
          rows={4}
          value={value}
          onChange={(e) => set(name, e.target.value)}
          aria-invalid={hasError}
          placeholder={placeholder ?? 'Escribí acá…'}
          className={cn(
            'admin-focus-ring border-border bg-background/40 min-h-[96px] resize-y rounded-[var(--admin-radius)] text-sm',
            hasError && 'border-destructive/60 focus-visible:ring-destructive/30 bg-destructive/5'
          )}
        />
        <div className="text-muted-foreground/60 flex items-center justify-between text-[10px] tracking-wider uppercase">
          <span>{hasError && <span className="text-destructive">{fieldErrors[name]}</span>}</span>
          <span className="font-mono">{charCount} caracteres</span>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <Input
        id={name}
        value={value}
        onChange={(e) => set(name, e.target.value)}
        aria-invalid={hasError}
        placeholder={placeholder ?? '…'}
        className={cn(
          'admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)] text-sm',
          hasError && 'border-destructive/60 focus-visible:ring-destructive/30 bg-destructive/5'
        )}
      />
      {hasError && (
        <p className="text-destructive flex items-center gap-1 text-[11px]">
          <AlertCircle size={10} />
          {fieldErrors[name]}
        </p>
      )}
    </div>
  );
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
    if (!ok) setSubmitError('No se pudo guardar. Revisá los datos e intentá de nuevo.');
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <div className="max-h-[calc(90vh-160px)] flex-1 overflow-y-auto p-5">
        <div className="space-y-4">
          {fields.map((field) => {
            if (field.kind === 'single') {
              return (
                <div
                  key={field.name}
                  className="admin-hairline bg-card/40 space-y-2 rounded-[var(--admin-radius-lg)] p-4"
                >
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={field.name}
                      className="text-foreground flex items-center gap-2 text-xs font-semibold tracking-tight"
                    >
                      {field.label}
                      <span className="text-muted-foreground/60 font-mono text-[9px] tracking-widest uppercase">
                        ·{field.type === 'textarea' ? 'texto largo' : 'texto'}
                      </span>
                    </label>
                  </div>
                  <FieldInput
                    name={field.name}
                    type={field.type}
                    values={values}
                    set={set}
                    fieldErrors={fieldErrors}
                    placeholder={field.type === 'textarea' ? 'Empezá a escribir…' : 'Escribí acá…'}
                  />
                </div>
              );
            }

            return (
              <BilingualFieldTabs
                key={field.baseName}
                label={field.label}
                description={
                  field.type === 'textarea'
                    ? 'Texto largo — mostrá el valor en cada idioma.'
                    : 'Texto corto — mostrá el valor en cada idioma.'
                }
                icon={<Globe size={12} />}
                nameBase={field.baseName}
                esValue={values[`${field.baseName}Es`] ?? ''}
                enValue={values[`${field.baseName}En`] ?? ''}
                onEsChange={(v) => set(`${field.baseName}Es`, v)}
                onEnChange={(v) => set(`${field.baseName}En`, v)}
                esPlaceholder={field.type === 'textarea' ? 'Escribí en español…' : 'Español'}
                enPlaceholder={field.type === 'textarea' ? 'Write in English…' : 'English'}
                syncable
                renderEs={({ name, value, onChange, placeholder }) => (
                  <FieldInput
                    name={name}
                    type={field.type}
                    values={{ ...values, [name]: value }}
                    set={(_, v) => onChange(v)}
                    fieldErrors={fieldErrors}
                    placeholder={placeholder}
                  />
                )}
                renderEn={({ name, value, onChange, placeholder }) => (
                  <FieldInput
                    name={name}
                    type={field.type}
                    values={{ ...values, [name]: value }}
                    set={(_, v) => onChange(v)}
                    fieldErrors={fieldErrors}
                    placeholder={placeholder}
                  />
                )}
              />
            );
          })}

          {submitError && (
            <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-[var(--admin-radius)] border px-3 py-2 text-xs">
              <X size={13} />
              {submitError}
            </div>
          )}
        </div>
      </div>

      <div className="border-border bg-card/80 sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t px-5 py-3 backdrop-blur-md">
        <p className="text-muted-foreground hidden text-xs sm:block">
          Los cambios se guardan al confirmar.
        </p>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={saving}
            className="gap-1.5"
          >
            <X size={13} />
            Cancelar
          </Button>
          <Button type="submit" disabled={saving} className="admin-glow gap-1.5">
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                <Check size={13} />
                Guardar
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
