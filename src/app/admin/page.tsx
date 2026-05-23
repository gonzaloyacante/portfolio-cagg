import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

import AdminLayout from '@/components/admin/AdminLayout';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/admin/login');

  const [unreadCount, recentMessages] = await Promise.all([
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return (
    <AdminLayout userEmail={session.user.email}>
      <div className="space-y-8">
        <div>
          <p className="text-label tracking-label text-muted-foreground mb-1 font-mono uppercase">
            Admin · Dashboard
          </p>
          <h1 className="text-xl font-semibold">Panel de administración</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="border-border bg-card rounded-none border p-6">
            <p className="text-label tracking-label text-muted-foreground mb-1 font-mono uppercase">
              Mensajes sin leer
            </p>
            <p className="text-foreground text-3xl font-bold">{unreadCount}</p>
          </div>
        </div>

        {/* Recent messages */}
        <div>
          <h2 className="text-foreground mb-4 text-sm font-semibold">Últimos mensajes</h2>
          {recentMessages.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sin mensajes todavía.</p>
          ) : (
            <div className="border-border overflow-hidden border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-border bg-card border-b">
                    <th className="text-label tracking-label text-muted-foreground px-4 py-3 text-left font-mono uppercase">
                      Nombre
                    </th>
                    <th className="text-label tracking-label text-muted-foreground hidden px-4 py-3 text-left font-mono uppercase sm:table-cell">
                      Email
                    </th>
                    <th className="text-label tracking-label text-muted-foreground hidden px-4 py-3 text-left font-mono uppercase md:table-cell">
                      Hace
                    </th>
                    <th className="text-label tracking-label text-muted-foreground px-4 py-3 text-left font-mono uppercase">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentMessages.map((msg) => (
                    <tr key={msg.id} className="border-border border-b last:border-0">
                      <td className="text-foreground px-4 py-3 font-medium">{msg.name}</td>
                      <td className="text-muted-foreground hidden px-4 py-3 sm:table-cell">
                        {msg.email}
                      </td>
                      <td className="text-muted-foreground hidden px-4 py-3 md:table-cell">
                        {formatDistanceToNow(msg.createdAt, { locale: es, addSuffix: true })}
                      </td>
                      <td className="px-4 py-3">
                        {msg.read ? (
                          <span className="text-muted-foreground text-xs">Leído</span>
                        ) : (
                          <span className="text-foreground bg-foreground/10 rounded-none px-2 py-0.5 text-xs font-semibold">
                            Nuevo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
