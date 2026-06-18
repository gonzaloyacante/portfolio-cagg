import { useEffect, useState } from 'react';

/**
 * Tracks which section element is currently "in view" using an
 * IntersectionObserver. Returns the id of the most-visible section.
 *
 * `rootMargin` is tuned so the active section flips to the one whose
 * midpoint is closest to the viewport center — same behavior as
 * scroll-spy style nav indicators. Plays nicely with `prefers-reduced-motion`
 * because it doesn't depend on scroll events.
 */
export function useActiveSection(ids: readonly string[], options?: { rootMargin?: string }) {
  const [active, setActive] = useState<string>(ids[0] ?? '');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const id = visible[0].target.id;
          setActive((prev) => (prev === id ? prev : id));
        }
      },
      {
        rootMargin: options?.rootMargin ?? '-40% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids, options?.rootMargin]);

  return active;
}
