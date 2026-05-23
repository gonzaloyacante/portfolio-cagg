import { useEffect, useRef, useState } from 'react';

type Options = { rootMargin?: string; threshold?: number };

export function useReveal<T extends HTMLElement = HTMLElement>(
  options: Options = {}
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(entry.target);
        }
      },
      {
        rootMargin: options.rootMargin ?? '0px 0px -10% 0px',
        threshold: options.threshold ?? 0.12,
      }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [options.rootMargin, options.threshold]);

  return [ref, visible];
}
