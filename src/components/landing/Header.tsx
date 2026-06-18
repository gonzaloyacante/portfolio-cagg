'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Menu, X } from 'lucide-react';

import { LangSwitch } from '@/components/ui/lang-switch';
import { useActiveSection } from '@/hooks/use-active-section';
import { routing } from '@/i18n/routing';

import { MobileMenu } from './MobileMenu';

export function Header() {
  const t = useTranslations('nav');
  const tHeader = useTranslations('header');
  const tA11y = useTranslations('a11y');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const links = [
    { href: '#experience', label: t('experience') },
    { href: '#process', label: t('process') },
    { href: '#services', label: t('services') },
    { href: '#projects', label: t('projects') },
    { href: '#testimonials', label: t('testimonials') },
    { href: '#faq', label: t('faq') },
    { href: '#contact', label: t('contact') },
  ];

  const activeSection = useActiveSection(links.map((l) => l.href.slice(1)));

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 right-0 left-0 z-[var(--z-header)] border-b transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 border-border backdrop-blur-md'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:h-20 lg:px-8">
        <a
          href="#top"
          data-testid="logo-link"
          className="group flex items-center gap-3"
          aria-label={tHeader('logo_label')}
        >
          <span className="border-border font-display text-foreground group-hover:border-foreground group-hover:bg-primary group-hover:text-primary-foreground flex h-9 w-9 items-center justify-center border text-sm font-bold tracking-tight transition-all duration-300">
            CG
          </span>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-foreground text-sm font-semibold tracking-tight">
              C. A. Guerra
            </span>
            <span className="text-label tracking-overline text-muted-foreground uppercase">
              {tHeader('role')}
            </span>
          </div>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {links.map((l) => {
            const sectionId = l.href.slice(1);
            const isActive = activeSection === sectionId;
            return (
              <a
                key={l.href}
                href={l.href}
                data-testid={`nav-${sectionId}`}
                aria-current={isActive ? 'location' : undefined}
                className={`text-sm font-medium tracking-wide transition-colors duration-300 ${
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {l.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <LangSwitch
            locales={routing.locales}
            current={locale}
            onSwitch={switchLocale}
            label={tA11y('lang_switcher')}
            testId="lang-toggle"
            className="hidden sm:flex"
          />
          <a
            href="#contact"
            data-testid="header-cta"
            className="bg-primary text-primary-foreground hover:bg-primary/90 hidden px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 active:scale-[0.98] md:inline-block"
          >
            {t('cta')}
          </a>
          <button
            type="button"
            className="text-foreground -mr-2 p-2 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            data-testid="mobile-menu-toggle"
            aria-label={open ? tA11y('close_menu') : tA11y('open_menu')}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <MobileMenu
        open={open}
        onClose={() => setOpen(false)}
        links={links}
        locales={routing.locales}
        currentLocale={locale}
        onLocaleSwitch={switchLocale}
        langLabel={tA11y('lang_switcher')}
      />
    </header>
  );
}
