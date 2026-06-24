import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import type { ReactNode } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
import { auth } from '@/lib/auth';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/admin/login');
  return (
    <>
      {/* PWA manifest + iOS icon — only mounted inside the authenticated
          admin scope so the public site never offers itself as installable.
          Next.js hoists <link> tags from any layout into <head>. */}
      <link rel="manifest" href="/admin/manifest.webmanifest" />
      <link rel="apple-touch-icon" href="/admin/apple-touch-icon.png" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#0a0a0a" />
      <AdminLayout userEmail={session.user.email}>{children}</AdminLayout>
    </>
  );
}
