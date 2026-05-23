import type { ReactNode } from 'react';

type BilingualFieldProps = {
  label: string;
  children: ReactNode;
};

export function BilingualField({ label, children }: BilingualFieldProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-label tracking-label text-muted-foreground font-mono uppercase">{label}</p>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}
