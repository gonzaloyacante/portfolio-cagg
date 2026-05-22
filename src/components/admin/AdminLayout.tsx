import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="bg-background min-h-dvh">{children}</div>;
}
