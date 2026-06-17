import { headers } from 'next/headers';

import { ShieldCheck } from 'lucide-react';

import { PageHeader } from '@/components/admin/PageHeader';
import SecurityForm from '@/components/admin/SecurityForm';
import { auth } from '@/lib/auth';

export default async function SecurityPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const twoFactorEnabled = Boolean((session?.user as Record<string, unknown>)?.twoFactorEnabled);

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <PageHeader
        eyebrowIcon={<ShieldCheck size={11} />}
        eyebrow="Sistema · Seguridad"
        title="Seguridad de la cuenta"
        description="Activá la autenticación de dos factores para proteger el acceso al panel."
      />
      <SecurityForm twoFactorEnabled={twoFactorEnabled} />
    </div>
  );
}
