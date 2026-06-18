import { useTranslations } from 'next-intl';

/**
 * Visually-hidden-by-default skip link. Becomes visible and focusable when
 * the user tabs into it (keyboard navigation). Jumps to `#main-content`.
 * Rendered at the top of the layout, outside the main flow, so it's the
 * first focusable element on the page.
 */
export function SkipLink() {
  const t = useTranslations('a11y');
  return (
    <a
      href="#main-content"
      data-testid="skip-link"
      className="bg-primary text-primary-foreground focus:ring-ring focus:ring-offset-background sr-only fixed top-2 left-2 z-[var(--z-intro)] -translate-y-2 px-4 py-2 text-sm font-semibold tracking-wide uppercase shadow-lg transition-transform focus:not-sr-only focus:translate-y-0 focus:ring-2 focus:ring-offset-2 focus:outline-none motion-reduce:transition-none"
    >
      {t('skip_to_content')}
    </a>
  );
}
