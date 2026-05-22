import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import AdminLayout from '@/components/admin/AdminLayout';
import { auth } from '@/lib/auth';

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <AdminLayout>
      <main className="p-6">
        <p className="text-label tracking-label text-muted-foreground mb-1 font-mono uppercase">
          Admin · Dashboard
        </p>
        <h1 className="text-xl font-semibold">Panel de administración</h1>
      </main>
    </AdminLayout>
  );
}
