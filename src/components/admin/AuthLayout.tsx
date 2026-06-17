import Link from 'next/link';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle: string;
  backHref: string;
  backLabel: string;
  children: ReactNode;
}

export default function AuthLayout({ title, subtitle, backHref, backLabel, children }: Props) {
  return (
    <div className="admin-mesh bg-background text-foreground relative flex min-h-dvh items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
      <div className="w-full max-w-md">
        <Link
          href={backHref}
          className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] uppercase transition-colors"
        >
          <span className="text-muted-foreground/50">←</span>
          {backLabel}
        </Link>
        <div className="admin-hairline admin-glass bg-card/60 relative overflow-hidden rounded-[var(--admin-radius-xl)] shadow-[var(--shadow-admin-lg)] backdrop-blur-md">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--foreground)_8%,transparent),transparent_60%)]"
          />
          <header className="border-border relative border-b px-6 py-5 lg:px-8">
            <p className="text-muted-foreground/80 mb-1.5 font-mono text-[10px] tracking-[0.18em] uppercase">
              {subtitle}
            </p>
            <h1 className="text-foreground text-xl font-semibold tracking-tight">{title}</h1>
          </header>
          <div className="relative px-6 py-7 lg:px-8">{children}</div>
        </div>
        <p className="text-muted-foreground/60 mt-6 text-center font-mono text-[10px] tracking-[0.18em] uppercase">
          Carlos A. Guerra · Admin
        </p>
      </div>
    </div>
  );
}
