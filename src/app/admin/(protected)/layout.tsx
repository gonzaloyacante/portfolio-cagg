import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import type { ReactNode } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
import { auth } from '@/lib/auth';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AuthGate>{children}</AuthGate>
    </Suspense>
  );
}

async function AuthGate({ children }: { children: ReactNode }) {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/admin/login');
  return <AdminLayout userEmail={session.user.email}>{children}</AdminLayout>;
}
