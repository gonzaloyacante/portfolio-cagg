import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { authClient } from '@/lib/auth-client';
import {
  disableTotpSchema,
  enableTotpSchema,
  verifyTotpSetupSchema,
  type DisableTotpData,
  type EnableTotpData,
  type VerifyTotpSetupData,
} from '@/validations/security';

type Step = 'idle' | 'enabling' | 'qr' | 'disabling';

interface TotpSetupData {
  totpURI: string;
  secret: string;
  backupCodes: string[];
}

export function useSecurity(initialEnabled: boolean) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [step, setStep] = useState<Step>('idle');
  const [loading, setLoading] = useState(false);
  const [totpSetup, setTotpSetup] = useState<TotpSetupData | null>(null);

  const enableForm = useForm<EnableTotpData>({ resolver: zodResolver(enableTotpSchema) });
  const verifyForm = useForm<VerifyTotpSetupData>({
    resolver: zodResolver(verifyTotpSetupSchema),
  });
  const disableForm = useForm<DisableTotpData>({ resolver: zodResolver(disableTotpSchema) });

  const startEnable = () => {
    enableForm.reset();
    setStep('enabling');
  };

  const startDisable = () => {
    disableForm.reset();
    setStep('disabling');
  };

  const cancel = () => {
    setStep('idle');
    setTotpSetup(null);
    enableForm.reset();
    verifyForm.reset();
    disableForm.reset();
  };

  const submitEnable = enableForm.handleSubmit(async ({ password }) => {
    enableForm.clearErrors();
    setLoading(true);
    try {
      const { data, error } = await authClient.twoFactor.enable({ password });
      if (error) {
        enableForm.setError('root', { message: 'Contraseña incorrecta.' });
      } else if (data) {
        const secret = new URL(data.totpURI).searchParams.get('secret') ?? '';
        setTotpSetup({ totpURI: data.totpURI, secret, backupCodes: data.backupCodes });
        setStep('qr');
      }
    } catch {
      enableForm.setError('root', { message: 'Error de conexión. Intentá de nuevo.' });
    } finally {
      setLoading(false);
    }
  });

  const submitVerify = verifyForm.handleSubmit(async ({ code }) => {
    verifyForm.clearErrors();
    setLoading(true);
    try {
      const { error } = await authClient.twoFactor.verifyTotp({ code });
      if (error) {
        verifyForm.setError('code', { message: 'Código incorrecto o expirado.' });
      } else {
        setEnabled(true);
        setTotpSetup(null);
        setStep('idle');
        verifyForm.reset();
      }
    } catch {
      verifyForm.setError('code', { message: 'Error de conexión. Intentá de nuevo.' });
    } finally {
      setLoading(false);
    }
  });

  const submitDisable = disableForm.handleSubmit(async ({ password }) => {
    disableForm.clearErrors();
    setLoading(true);
    try {
      const { error } = await authClient.twoFactor.disable({ password });
      if (error) {
        disableForm.setError('root', { message: 'Contraseña incorrecta.' });
      } else {
        setEnabled(false);
        setStep('idle');
        disableForm.reset();
      }
    } catch {
      disableForm.setError('root', { message: 'Error de conexión. Intentá de nuevo.' });
    } finally {
      setLoading(false);
    }
  });

  return {
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
  };
}
