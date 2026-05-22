import { headers } from 'next/headers';

import SecurityForm from '@/components/admin/SecurityForm';
import { auth } from '@/lib/auth';

export default async function SecurityPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const twoFactorEnabled = Boolean((session?.user as Record<string, unknown>)?.twoFactorEnabled);

  return (
    <main className="max-w-xl p-6">
      <div className="mb-8">
        <p className="text-label tracking-label text-muted-foreground mb-1 font-mono uppercase">
          Admin · Seguridad
        </p>
        <h1 className="text-xl font-semibold">Seguridad de la cuenta</h1>
      </div>
      <SecurityForm twoFactorEnabled={twoFactorEnabled} />
    </main>
  );
}
