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
    <div className="bg-background text-foreground flex min-h-dvh items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
      <div className="w-full max-w-md">
        <Link
          href={backHref}
          className="text-overline tracking-overline text-muted-foreground hover:text-foreground mb-10 inline-flex items-center gap-2 font-mono uppercase transition-colors"
        >
          ← {backLabel}
        </Link>
        <div className="border-border bg-card border">
          <header className="border-border border-b px-6 py-5 lg:px-8">
            <p className="text-overline tracking-overline text-muted-foreground mb-1 font-mono uppercase">
              {subtitle}
            </p>
            <h1 className="text-card-foreground text-xl font-semibold tracking-tight">{title}</h1>
          </header>
          <div className="px-6 py-7 lg:px-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
