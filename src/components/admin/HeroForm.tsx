'use client';

import {
  BarChart3,
  Globe,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Trash2,
  Type,
  User,
} from 'lucide-react';

import { BilingualField } from '@/components/admin/BilingualField';
import { CollapsibleSection } from '@/components/admin/CollapsibleSection';
import { FieldHelp, SectionHelp } from '@/components/admin/FieldHelp';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { type HeroFormValues, useHeroForm } from '@/hooks/use-hero-form';
import { cn } from '@/lib/utils';

type HeroFormProps = {
  initial: HeroFormValues;
};

function FieldStatus({ value }: { value: string | undefined }) {
  const filled = (value ?? '').trim().length > 0;
  return (
    <span
      className={cn(
        'inline-flex h-4 w-4 items-center justify-center rounded-full border text-[9px]',
        filled
          ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400'
          : 'border-border bg-muted/30 text-muted-foreground/40'
      )}
      title={filled ? 'Completo' : 'Pendiente'}
    >
      {filled ? '✓' : '·'}
    </span>
  );
}

export function HeroForm({ initial }: HeroFormProps) {
  const { form, fields, addStat, remove, onSubmit, status } = useHeroForm(initial);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Top-level help: explains what the Hero section is */}
        <SectionHelp
          title="¿Qué es esta sección?"
          description="Acá definís todo lo que se ve cuando alguien entra a tu sitio. El nombre, el titular, el resumen, los tres botones de contacto, las estadísticas y la foto de portada. Cada cambio se refleja arriba de todo en la landing pública."
          appearsIn="Sección principal de la landing (Hero), visible apenas alguien entra al sitio."
          tips={[
            'Mantené el titular corto (hasta 12 palabras) para que entre bien en una sola línea.',
            'La foto de portada es opcional — si no la subís, la sección se centra sin imagen.',
            'Las tres estadísticas son números cortos (ej: 15+, 50, 8) más una etiqueta corta en cada idioma.',
          ]}
        />

        {/* Identificación */}
        <CollapsibleSection
          icon={<User size={14} />}
          title="Identificación"
          description="Cómo se identifica la marca: nombre y overline (eyebrow)."
          defaultOpen
          badge={
            <span className="border-border bg-muted/30 text-muted-foreground inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[9px] tracking-[0.18em] uppercase">
              1/4
            </span>
          }
        >
          <BilingualField
            label="Overline (etiqueta arriba del nombre)"
            icon={<Sparkles size={12} />}
            description="Una etiqueta chiquita arriba del nombre. Sirve para identificar tu rol o especialidad."
          >
            <FormField
              control={form.control}
              name="overlineEs"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                      Español
                    </FormLabel>
                    <FieldStatus value={field.value} />
                  </div>
                  <FormControl>
                    <Input
                      placeholder="Diseñador industrial"
                      className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                      {...field}
                    />
                  </FormControl>
                  <FieldHelp
                    description="Etiqueta corta arriba del nombre. Aparece en la esquina superior izquierda del Hero."
                    tips={[
                      'Ejemplos: "Diseñador industrial", "Ingeniero mecánico", "Consultor de producto".',
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="overlineEn"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                      English
                    </FormLabel>
                    <FieldStatus value={field.value} />
                  </div>
                  <FormControl>
                    <Input
                      placeholder="Industrial designer"
                      className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                      {...field}
                    />
                  </FormControl>
                  <FieldHelp description="Versión en inglés de la etiqueta. Aparece en la landing cuando el usuario elige idioma inglés." />
                  <FormMessage />
                </FormItem>
              )}
            />
          </BilingualField>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Nombre mostrado</FormLabel>
                  <FieldStatus value={field.value} />
                </div>
                <FormControl>
                  <Input
                    placeholder="Carlos Armando Guerra"
                    className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                    {...field}
                  />
                </FormControl>
                <FieldHelp
                  description="Tu nombre completo. Se muestra grande en el Hero."
                  appearsIn="Bloque principal del Hero, en mayúsculas, en la tipografía display."
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </CollapsibleSection>

        {/* Contenido principal */}
        <CollapsibleSection
          icon={<Type size={14} />}
          title="Contenido principal"
          description="Titular y resumen. Es el contenido que ve primero quien entra al sitio."
          defaultOpen
          badge={
            <span className="border-border bg-muted/30 text-muted-foreground inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[9px] tracking-[0.18em] uppercase">
              2/4
            </span>
          }
        >
          <BilingualField
            label="Titular (la frase principal)"
            icon={<Type size={12} />}
            description="La frase principal de la sección. Es lo que la gente lee después de tu nombre. Tiene que enganchar en una línea."
          >
            <FormField
              control={form.control}
              name="headlineEs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                    Español
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Diseño productos que se fabrican en serie."
                      className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                      {...field}
                    />
                  </FormControl>
                  <FieldHelp
                    description="Frase principal del Hero. Aparece debajo del nombre, en tamaño grande."
                    tips={[
                      'Evitá frases genéricas como "Bienvenido".',
                      'Mejor: "Diseño productos que se fabrican en serie".',
                      'Mantenelo entre 6 y 14 palabras para que no se corte.',
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="headlineEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                    English
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="I design products that are manufactured at scale."
                      className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                      {...field}
                    />
                  </FormControl>
                  <FieldHelp description="Versión en inglés del titular." />
                  <FormMessage />
                </FormItem>
              )}
            />
          </BilingualField>

          <BilingualField
            label="Resumen"
            icon={<Globe size={12} />}
            description="Dos o tres frases que cuentan quién sos, qué hacés y por qué te importa."
          >
            <FormField
              control={form.control}
              name="summaryEs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                    Español
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Resumen en español…"
                      className="admin-focus-ring border-border bg-background/40 min-h-[120px] resize-y rounded-[var(--admin-radius)]"
                      {...field}
                    />
                  </FormControl>
                  <FieldHelp
                    description="Párrafo extendido del titular. Aparece debajo del titular, en un párrafo más largo."
                    tips={[
                      'Escribilo en segunda persona cuando puedas: "Te ayudo a...".',
                      '3 frases como máximo.',
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="summaryEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                    English
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Summary in English…"
                      className="admin-focus-ring border-border bg-background/40 min-h-[120px] resize-y rounded-[var(--admin-radius)]"
                      {...field}
                    />
                  </FormControl>
                  <FieldHelp description="Versión en inglés del resumen." />
                  <FormMessage />
                </FormItem>
              )}
            />
          </BilingualField>
        </CollapsibleSection>

        {/* Foto de portada */}
        <CollapsibleSection
          icon={<ImageIcon size={14} />}
          title="Foto de portada"
          description="Tu foto personal. Aparece en el Hero, al lado del nombre y titular."
          defaultOpen
          badge={
            <span className="border-border bg-muted/30 text-muted-foreground inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[9px] tracking-[0.18em] uppercase">
              3/5
            </span>
          }
        >
          <FormField
            control={form.control}
            name="portraitUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <MediaPicker
                    value={field.value ?? null}
                    onChange={(url) => field.onChange(url)}
                    label="Imagen de portada"
                    appearsIn="Hero, columna derecha"
                    aspect="portrait"
                    testId="hero-portrait-picker"
                    description="Tu foto personal. Se muestra en el Hero, al lado del nombre y titular. Si no subís ninguna, el Hero se centra sin imagen."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CollapsibleSection>

        {/* CTAs */}
        <CollapsibleSection
          icon={<Sparkles size={14} />}
          title="Botones de acción (CTAs)"
          description="Textos de los tres CTAs principales: WhatsApp, Email y LinkedIn."
          defaultOpen
          badge={
            <span className="border-border bg-muted/30 text-muted-foreground inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[9px] tracking-[0.18em] uppercase">
              4/5
            </span>
          }
        >
          <BilingualField
            label="CTA WhatsApp"
            icon={<Sparkles size={12} />}
            description="El texto del botón verde de WhatsApp."
          >
            <FormField
              control={form.control}
              name="ctaWhatsappEs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                    Español
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Hablemos por WhatsApp"
                      className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                      {...field}
                    />
                  </FormControl>
                  <FieldHelp
                    description="Texto del botón de WhatsApp. Aparece en el Hero y en la sección de Contacto."
                    tips={[
                      'Que sea claro y motive la acción: "Hablemos por WhatsApp" mejor que "WhatsApp".',
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ctaWhatsappEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                    English
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Let's chat on WhatsApp"
                      className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                      {...field}
                    />
                  </FormControl>
                  <FormHelpInline text="Versión en inglés del texto del botón de WhatsApp." />
                  <FormMessage />
                </FormItem>
              )}
            />
          </BilingualField>

          <BilingualField
            label="CTA Email"
            icon={<Globe size={12} />}
            description="El texto del botón de email."
          >
            <FormField
              control={form.control}
              name="ctaEmailEs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                    Español
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Escribirme por email"
                      className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                      {...field}
                    />
                  </FormControl>
                  <FormHelpInline text="Texto del botón de email. Aparece en el Hero y en la sección de Contacto." />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ctaEmailEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                    English
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email me"
                      className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                      {...field}
                    />
                  </FormControl>
                  <FormHelpInline text="Versión en inglés del texto del botón de email." />
                  <FormMessage />
                </FormItem>
              )}
            />
          </BilingualField>

          <BilingualField
            label="CTA LinkedIn"
            icon={<Globe size={12} />}
            description="El texto del botón de LinkedIn."
          >
            <FormField
              control={form.control}
              name="ctaLinkedinEs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                    Español
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Conectar en LinkedIn"
                      className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                      {...field}
                    />
                  </FormControl>
                  <FormHelpInline text="Texto del botón de LinkedIn. Aparece en el Hero y en la sección de Contacto." />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ctaLinkedinEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                    English
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Connect on LinkedIn"
                      className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                      {...field}
                    />
                  </FormControl>
                  <FormHelpInline text="Versión en inglés del texto del botón de LinkedIn." />
                  <FormMessage />
                </FormItem>
              )}
            />
          </BilingualField>
        </CollapsibleSection>

        {/* Stats */}
        <CollapsibleSection
          icon={<BarChart3 size={14} />}
          title="Estadísticas"
          description="Métricas clave que se muestran debajo del titular."
          defaultOpen
          badge={
            <span className="border-border bg-muted/30 text-muted-foreground inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[9px] tracking-[0.18em] uppercase">
              5/5
            </span>
          }
        >
          <SectionHelp
            title="Estadísticas del Hero"
            description="Cada stat es un número grande con una etiqueta corta, en ambos idiomas."
            appearsIn="Debajo del titular y el resumen, en una fila horizontal."
            tips={[
              'Tres es un buen número.',
              'Usá números que importen: años de experiencia, proyectos entregados, clientes.',
            ]}
          />
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="admin-hairline bg-card/30 grid grid-cols-12 items-end gap-3 rounded-[var(--admin-radius-lg)] p-4"
              >
                <div className="col-span-12 sm:col-span-3">
                  <FormField
                    control={form.control}
                    name={`stats.${index}.value`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                          Valor
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="15+"
                            className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)] text-center font-mono text-base"
                            {...f}
                          />
                        </FormControl>
                        <FormHelpInline text="El número grande. Ej: 15+, 50, 8." />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12 sm:col-span-4">
                  <FormField
                    control={form.control}
                    name={`stats.${index}.labelEs`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                          Etiqueta ES
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Años de experiencia"
                            className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                            {...f}
                          />
                        </FormControl>
                        <FormHelpInline text="Etiqueta en español debajo del número." />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-11 sm:col-span-4">
                  <FormField
                    control={form.control}
                    name={`stats.${index}.labelEn`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                          Etiqueta EN
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Years of experience"
                            className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                            {...f}
                          />
                        </FormControl>
                        <FormHelpInline text="Etiqueta en inglés debajo del número." />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-1 flex items-end justify-end pb-1">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
                    aria-label="Eliminar esta estadística"
                    title="Eliminar esta estadística"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addStat} className="gap-1.5">
            <Plus size={13} />
            Agregar estadística
          </Button>
        </CollapsibleSection>

        {/* Sticky save bar */}
        <div className="admin-glass border-border sticky bottom-0 z-10 -mx-4 mt-8 flex items-center justify-between gap-3 rounded-[var(--admin-radius-lg)] border px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
          <div className="flex items-center gap-2 text-xs">
            {status === 'success' && (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="admin-status-dot" />
                Guardado correctamente. Los cambios ya se ven en la landing.
              </span>
            )}
            {status === 'error' && (
              <span className="text-destructive">Error al guardar. Reintentá.</span>
            )}
            {status === 'idle' && (
              <span className="text-muted-foreground">
                Cuando guardes, los cambios se ven inmediatamente en la landing pública.
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/#top"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="hero-preview-link"
              className="text-muted-foreground hover:text-foreground border-border bg-muted/30 hover:bg-muted/60 inline-flex items-center gap-1.5 rounded-[var(--admin-radius)] border px-3 py-1.5 text-xs font-medium transition-colors"
            >
              Ver Hero en vivo
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>
            <Button type="submit" disabled={status === 'saving'} className="admin-glow gap-1.5">
              {status === 'saving' ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

/** Inline single-line help text — used for short field descriptions. */
function FormHelpInline({ text }: { text: string }) {
  return (
    <p className="text-muted-foreground flex items-start gap-1.5 text-[11px] leading-relaxed">
      <span className="bg-muted-foreground/50 mt-1 inline-block h-1 w-1 shrink-0 rounded-full" />
      {text}
    </p>
  );
}
