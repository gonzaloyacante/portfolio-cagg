'use client';

import { ArrowRight, Check, KeyRound, ShieldAlert, ShieldCheck, X } from 'lucide-react';

import { FieldHelp, SectionHelp } from '@/components/admin/FieldHelp';
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
import { useSecurity } from '@/hooks/use-security';
import { cn } from '@/lib/utils';

interface Props {
  twoFactorEnabled: boolean;
}

export default function SecurityForm({ twoFactorEnabled }: Props) {
  const {
    enabled,
    step,
    loading,
    totpSetup,
    enableForm,
    verifyForm,
    disableForm,
    startEnable,
    startDisable,
    cancel,
    submitEnable,
    submitVerify,
    submitDisable,
  } = useSecurity(twoFactorEnabled);

  return (
    <div className="space-y-5">
      <SectionHelp
        title="¿Qué es esta sección?"
        description="Activá la autenticación de dos factores (2FA) para que el login pida un código de 6 dígitos además de la contraseña. Recomendado."
        appearsIn="Afecta el proceso de login en /admin/login."
        tips={[
          'Hacé una captura de los códigos de respaldo cuando los veas. Son tu única forma de entrar si perdés el teléfono.',
        ]}
      />

      <div
        className={cn(
          'admin-hairline bg-card/40 relative overflow-hidden rounded-[var(--admin-radius-lg)]',
          enabled && 'ring-1 ring-emerald-400/20'
        )}
      >
        <header className="border-border flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-md border',
                enabled
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400'
                  : 'border-border bg-muted/40 text-muted-foreground'
              )}
            >
              {enabled ? <ShieldCheck size={15} /> : <ShieldAlert size={15} />}
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold tracking-tight">
                Autenticación de dos factores
              </p>
              <p className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                <span
                  className={cn(
                    'admin-status-dot',
                    enabled ? 'text-emerald-400' : 'text-muted-foreground/50'
                  )}
                />
                {enabled ? 'Activo' : 'Inactivo'}
              </p>
            </div>
          </div>
        </header>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          {step === 'idle' && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <FieldHelp
                description={
                  enabled
                    ? '2FA está activado. Tu cuenta requiere un código adicional al iniciar sesión.'
                    : 'Tu cuenta no usa 2FA. Activalo para mayor seguridad.'
                }
              />
              {enabled ? (
                <Button variant="destructive" size="sm" onClick={startDisable} className="gap-1.5">
                  Desactivar 2FA
                </Button>
              ) : (
                <Button onClick={startEnable} className="admin-glow gap-1.5">
                  Activar 2FA
                  <ArrowRight size={13} />
                </Button>
              )}
            </div>
          )}

          {step === 'enabling' && (
            <Form {...enableForm}>
              <form onSubmit={submitEnable} className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="border-border bg-muted/40 text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-md border">
                    <KeyRound size={14} />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-semibold tracking-tight">
                      Paso 1 de 2: Confirmá tu contraseña
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Para generar la clave secreta, primero verificá que sos vos.
                    </p>
                  </div>
                </div>
                <FormField
                  control={enableForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                        Contraseña actual
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          autoFocus
                          placeholder="••••••••"
                          className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {enableForm.formState.errors.root && (
                  <p className="text-destructive text-xs">
                    {enableForm.formState.errors.root.message}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="admin-glow gap-1.5">
                    {loading ? 'Generando…' : 'Continuar'}
                    <ArrowRight size={13} />
                  </Button>
                  <Button type="button" variant="ghost" onClick={cancel} className="gap-1.5">
                    <X size={13} />
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {step === 'qr' && totpSetup && (
            <Form {...verifyForm}>
              <form onSubmit={submitVerify} className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="border-border bg-muted/40 text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-md border">
                      <KeyRound size={14} />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-semibold tracking-tight">
                        Paso 2 de 2: Configurá tu app y verificá
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Escaneá el código QR o ingresá la clave secreta en 1Password, Authy o Google
                        Authenticator. Después ingresá el código de 6 dígitos que te muestra la app.
                      </p>
                    </div>
                  </div>
                  <div className="admin-hairline bg-background/40 space-y-3 rounded-[var(--admin-radius)] p-4">
                    <div>
                      <p className="text-muted-foreground/80 mb-1.5 font-mono text-[10px] tracking-[0.18em] uppercase">
                        Clave secreta (manual setup)
                      </p>
                      <code className="text-foreground bg-foreground/5 block rounded-md px-2.5 py-2 font-mono text-sm break-all select-all">
                        {totpSetup.secret}
                      </code>
                    </div>
                    <div>
                      <a
                        href={totpSetup.totpURI}
                        className="text-foreground hover:text-foreground/80 inline-flex items-center gap-1.5 text-xs font-medium underline underline-offset-4 transition-colors"
                      >
                        Abrir en app de autenticación
                        <ArrowRight size={11} />
                      </a>
                    </div>
                  </div>
                </div>

                <FormField
                  control={verifyForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                        Código de 6 dígitos de tu app
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          autoFocus
                          autoComplete="one-time-code"
                          placeholder="000000"
                          className="border-border bg-background/40 h-14 rounded-[var(--admin-radius)] text-center font-mono text-2xl tracking-[0.5em]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="admin-glow gap-1.5">
                    {loading ? 'Verificando…' : 'Confirmar activación'}
                    <Check size={13} />
                  </Button>
                  <Button type="button" variant="ghost" onClick={cancel} className="gap-1.5">
                    <X size={13} />
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {step === 'disabling' && (
            <Form {...disableForm}>
              <form onSubmit={submitDisable} className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="border-destructive/40 bg-destructive/10 text-destructive flex h-8 w-8 shrink-0 items-center justify-center rounded-md border">
                    <ShieldAlert size={14} />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-semibold tracking-tight">
                      Desactivar 2FA
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Tu cuenta va a quedar menos protegida. Confirmá tu contraseña para continuar.
                    </p>
                  </div>
                </div>
                <FormField
                  control={disableForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                        Contraseña actual
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          autoFocus
                          placeholder="••••••••"
                          className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {disableForm.formState.errors.root && (
                  <p className="text-destructive text-xs">
                    {disableForm.formState.errors.root.message}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    variant="destructive"
                    className="gap-1.5"
                  >
                    {loading ? 'Desactivando…' : 'Desactivar 2FA'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={cancel} className="gap-1.5">
                    <X size={13} />
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
