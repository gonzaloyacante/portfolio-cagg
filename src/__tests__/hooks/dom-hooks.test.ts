// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import { useActiveSection } from '@/hooks/use-active-section';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

// ─── useReducedMotion ────────────────────────────────────────────────────────

describe('useReducedMotion()', () => {
  let listeners: Array<() => void> = [];

  const installMatchMedia = (initial: boolean) => {
    listeners = [];
    const holder = { value: initial };
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        get matches() {
          return holder.value;
        },
        set matches(v: boolean) {
          holder.value = v;
        },
        media: query,
        addEventListener: (event: string, cb: () => void) => {
          if (event === 'change') listeners.push(cb);
        },
        removeEventListener: (_event: string, cb: () => void) => {
          listeners = listeners.filter((l) => l !== cb);
        },
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      })),
    });
  };

  beforeEach(() => {
    installMatchMedia(false);
  });

  afterEach(() => {
    listeners = [];
  });

  it('starts as false', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('reflects matchMedia.matches=true initially', () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when media query change fires', () => {
    installMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)') as unknown as {
      matches: boolean;
    };
    mql.matches = true;
    act(() => {
      listeners.forEach((l) => l());
    });
    expect(result.current).toBe(true);
  });

  it('updates back to false', () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)') as unknown as {
      matches: boolean;
    };
    mql.matches = false;
    act(() => {
      listeners.forEach((l) => l());
    });
    expect(result.current).toBe(false);
  });

  it('handles missing matchMedia (SSR or unsupported env)', () => {
    Object.defineProperty(window, 'matchMedia', { value: undefined });
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('removes the event listener on unmount', () => {
    const { unmount } = renderHook(() => useReducedMotion());
    expect(listeners.length).toBeGreaterThan(0);
    const before = listeners.length;
    unmount();
    expect(listeners.length).toBeLessThan(before);
  });
});

// ─── useActiveSection ────────────────────────────────────────────────────────

describe('useActiveSection()', () => {
  let observerInstances: Array<{
    callback: IntersectionObserverCallback;
    options: IntersectionObserverInit | undefined;
    observed: Element[];
    disconnected: boolean;
  }> = [];

  beforeEach(() => {
    observerInstances = [];
    function MockObserver(
      this: {
        callback: IntersectionObserverCallback;
        options: IntersectionObserverInit | undefined;
        observed: Element[];
        disconnected: boolean;
      },
      cb: IntersectionObserverCallback,
      opts?: IntersectionObserverInit
    ): void {
      this.callback = cb;
      this.options = opts;
      this.observed = [];
      this.disconnected = false;
      observerInstances.push(this);
    }
    MockObserver.prototype.observe = function (el: Element) {
      this.observed.push(el);
    };
    MockObserver.prototype.unobserve = function (el: Element) {
      this.observed = this.observed.filter((e: Element) => e !== el);
    };
    MockObserver.prototype.disconnect = function () {
      this.disconnected = true;
    };
    MockObserver.prototype.takeRecords = function () {
      return [];
    };
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: MockObserver,
    });
  });

  it('returns first id by default', () => {
    const { result } = renderHook(() => useActiveSection(['a', 'b', 'c']));
    expect(result.current).toBe('a');
  });

  it('returns empty string when ids is empty', () => {
    const { result } = renderHook(() => useActiveSection([]));
    expect(result.current).toBe('');
  });

  it('observes only the elements that exist in the DOM', () => {
    document.body.innerHTML = '<div id="a"></div><div id="c"></div>';
    renderHook(() => useActiveSection(['a', 'b', 'c']));
    const obs = observerInstances[0];
    expect(obs?.observed.length).toBe(2);
  });

  it('does not create an observer when no elements exist', () => {
    document.body.innerHTML = '';
    renderHook(() => useActiveSection(['a', 'b', 'c']));
    expect(observerInstances.length).toBe(0);
  });

  it('uses default rootMargin -40% 0px -55% 0px', () => {
    document.body.innerHTML = '<div id="a"></div>';
    renderHook(() => useActiveSection(['a']));
    expect(observerInstances[0]?.options?.rootMargin).toBe('-40% 0px -55% 0px');
  });

  it('respects custom rootMargin', () => {
    document.body.innerHTML = '<div id="a"></div>';
    renderHook(() => useActiveSection(['a'], { rootMargin: '0px 0px -100% 0px' }));
    expect(observerInstances[0]?.options?.rootMargin).toBe('0px 0px -100% 0px');
  });

  it('uses threshold array [0, 0.25, 0.5, 0.75, 1]', () => {
    document.body.innerHTML = '<div id="a"></div>';
    renderHook(() => useActiveSection(['a']));
    expect(observerInstances[0]?.options?.threshold).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it('updates active when an intersection entry fires', () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
    const { result } = renderHook(() => useActiveSection(['a', 'b']));
    const elB = document.getElementById('b')!;
    act(() => {
      observerInstances[0]?.callback(
        [
          {
            isIntersecting: true,
            intersectionRatio: 0.5,
            target: elB,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });
    expect(result.current).toBe('b');
  });

  it('picks the entry with the highest intersection ratio', () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
    const { result } = renderHook(() => useActiveSection(['a', 'b']));
    const elA = document.getElementById('a')!;
    const elB = document.getElementById('b')!;
    act(() => {
      observerInstances[0]?.callback(
        [
          { isIntersecting: true, intersectionRatio: 0.3, target: elA },
          { isIntersecting: true, intersectionRatio: 0.8, target: elB },
        ] as unknown as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    expect(result.current).toBe('b');
  });

  it('ignores non-intersecting entries', () => {
    document.body.innerHTML = '<div id="a"></div>';
    const { result } = renderHook(() => useActiveSection(['a']));
    act(() => {
      observerInstances[0]?.callback(
        [
          {
            isIntersecting: false,
            intersectionRatio: 0,
            target: document.getElementById('a')!,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });
    expect(result.current).toBe('a');
  });

  it('does not set state if the active id has not changed', () => {
    document.body.innerHTML = '<div id="a"></div>';
    const { result } = renderHook(() => useActiveSection(['a']));
    act(() => {
      observerInstances[0]?.callback(
        [
          {
            isIntersecting: true,
            intersectionRatio: 0.5,
            target: document.getElementById('a')!,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });
    expect(result.current).toBe('a');
  });

  it('disconnects the observer on unmount', () => {
    document.body.innerHTML = '<div id="a"></div>';
    const { unmount } = renderHook(() => useActiveSection(['a']));
    expect(observerInstances[0]?.disconnected).toBe(false);
    unmount();
    expect(observerInstances[0]?.disconnected).toBe(true);
  });

  it('handles single id', () => {
    document.body.innerHTML = '<div id="only"></div>';
    const { result } = renderHook(() => useActiveSection(['only']));
    expect(result.current).toBe('only');
  });

  it('handles ids with special characters', () => {
    document.body.innerHTML = '<div id="a-b_c"></div>';
    const { result } = renderHook(() => useActiveSection(['a-b_c']));
    expect(result.current).toBe('a-b_c');
  });

  it('returns the first id when no intersection ever fires', () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
    const { result } = renderHook(() => useActiveSection(['a', 'b']));
    expect(result.current).toBe('a');
  });

  it('does not change when entries are all invisible (no visible[0])', () => {
    document.body.innerHTML = '<div id="a"></div>';
    const { result } = renderHook(() => useActiveSection(['a']));
    act(() => {
      observerInstances[0]?.callback([], {} as IntersectionObserver);
    });
    expect(result.current).toBe('a');
  });
});
