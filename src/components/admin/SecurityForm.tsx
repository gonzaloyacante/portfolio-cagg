'use client';

import { ArrowRight, Check, ShieldAlert, ShieldCheck, X } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="border-border bg-card border">
        <header className="border-border flex items-center justify-between border-b px-6 py-5 lg:px-8">
          <div>
            <p className="text-label tracking-label text-muted-foreground mb-1 font-mono uppercase">
              Autenticación de dos factores
            </p>
            <h2 className="text-card-foreground text-base font-semibold">
              {enabled ? 'Estado: Activo' : 'Estado: Inactivo'}
            </h2>
          </div>
          {enabled ? (
            <ShieldCheck className="text-foreground" />
          ) : (
            <ShieldAlert className="text-muted-foreground" />
          )}
        </header>

        <div className="px-6 py-6 lg:px-8">
          {step === 'idle' && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                {enabled
                  ? '2FA está activado. Tu cuenta requiere un código adicional al iniciar sesión.'
                  : 'Tu cuenta no usa 2FA. Activalo para mayor seguridad.'}
              </p>
              {enabled ? (
                <Button variant="destructive" size="sm" onClick={startDisable}>
                  Desactivar
                </Button>
              ) : (
                <Button size="sm" onClick={startEnable} className="gap-2">
                  Activar 2FA
                  <ArrowRight />
                </Button>
              )}
            </div>
          )}

          {step === 'enabling' && (
            <Form {...enableForm}>
              <form onSubmit={submitEnable} className="space-y-5">
                <p className="text-muted-foreground text-sm">
                  Confirmá tu contraseña para continuar.
                </p>
                <FormField
                  control={enableForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-label tracking-label text-muted-foreground font-mono uppercase">
                        Contraseña
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          autoFocus
                          className="h-11 rounded-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {enableForm.formState.errors.root && (
                  <p className="text-destructive text-sm">
                    {enableForm.formState.errors.root.message}
                  </p>
                )}
                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} size="sm" className="gap-2">
                    {loading ? 'Generando…' : 'Continuar'}
                    <ArrowRight />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={cancel}>
                    <X />
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {step === 'qr' && totpSetup && (
            <Form {...verifyForm}>
              <form onSubmit={submitVerify} className="space-y-6">
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm">
                    Abrí tu app de autenticación (Google Authenticator, Authy, 1Password) y agregá
                    una cuenta manualmente usando la clave secreta.
                  </p>
                  <div className="border-border bg-background space-y-3 border p-4">
                    <div>
                      <p className="text-label tracking-label text-muted-foreground mb-1 font-mono uppercase">
                        Clave secreta
                      </p>
                      <code className="text-foreground font-mono text-sm break-all select-all">
                        {totpSetup.secret}
                      </code>
                    </div>
                    <div>
                      <a
                        href={totpSetup.totpURI}
                        className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-4 transition-colors"
                      >
                        Abrir en app de autenticación
                      </a>
                    </div>
                  </div>
                </div>

                <FormField
                  control={verifyForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-label tracking-label text-muted-foreground font-mono uppercase">
                        Código de verificación
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          autoFocus
                          autoComplete="one-time-code"
                          placeholder="000000"
                          className="tracking-code h-14 rounded-none text-center font-mono text-2xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} size="sm" className="gap-2">
                    {loading ? 'Verificando…' : 'Confirmar activación'}
                    <Check />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={cancel}>
                    <X />
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {step === 'disabling' && (
            <Form {...disableForm}>
              <form onSubmit={submitDisable} className="space-y-5">
                <p className="text-muted-foreground text-sm">
                  Confirmá tu contraseña para desactivar 2FA.
                </p>
                <FormField
                  control={disableForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-label tracking-label text-muted-foreground font-mono uppercase">
                        Contraseña
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          autoFocus
                          className="h-11 rounded-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {disableForm.formState.errors.root && (
                  <p className="text-destructive text-sm">
                    {disableForm.formState.errors.root.message}
                  </p>
                )}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                  >
                    {loading ? 'Desactivando…' : 'Desactivar 2FA'}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={cancel}>
                    <X />
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
