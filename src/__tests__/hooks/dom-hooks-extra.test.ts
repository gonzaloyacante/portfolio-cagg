// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import { useActiveSection } from '@/hooks/use-active-section';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

// More density for the DOM hooks

describe('useActiveSection() — extra density', () => {
  let observerInstances: Array<{
    callback: IntersectionObserverCallback;
    options: IntersectionObserverInit | undefined;
    observed: Element[];
    disconnected: boolean;
  }> = [];

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

  beforeEach(() => {
    observerInstances = [];
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: MockObserver,
    });
  });

  afterEach(() => {
    observerInstances = [];
  });

  it('handles 1 id', () => {
    document.body.innerHTML = '<div id="a"></div>';
    const { result } = renderHook(() => useActiveSection(['a']));
    expect(result.current).toBe('a');
  });

  it('handles 5 ids', () => {
    document.body.innerHTML =
      '<div id="a"></div><div id="b"></div><div id="c"></div><div id="d"></div><div id="e"></div>';
    const { result } = renderHook(() => useActiveSection(['a', 'b', 'c', 'd', 'e']));
    expect(result.current).toBe('a');
  });

  it('handles 10 ids', () => {
    const divs = Array.from({ length: 10 }, (_, i) => `<div id="id${i}"></div>`).join('');
    document.body.innerHTML = divs;
    const ids = Array.from({ length: 10 }, (_, i) => `id${i}`);
    const { result } = renderHook(() => useActiveSection(ids));
    expect(result.current).toBe('id0');
  });

  it('skips ids that do not exist in the DOM', () => {
    document.body.innerHTML = '<div id="a"></div>';
    const { result } = renderHook(() => useActiveSection(['nonexistent', 'a', 'alsogone']));
    expect(result.current).toBe('nonexistent'); // first id is returned even if not in DOM
    expect(observerInstances[0]?.observed.length).toBe(1);
  });

  it('skips all-missing ids without creating an observer', () => {
    document.body.innerHTML = '';
    renderHook(() => useActiveSection(['x', 'y', 'z']));
    expect(observerInstances.length).toBe(0);
  });

  it('handles ids with hyphens and underscores', () => {
    document.body.innerHTML = '<div id="a-b_c"></div>';
    const { result } = renderHook(() => useActiveSection(['a-b_c']));
    expect(result.current).toBe('a-b_c');
  });

  it('handles numeric ids', () => {
    document.body.innerHTML = '<div id="123"></div>';
    const { result } = renderHook(() => useActiveSection(['123']));
    expect(result.current).toBe('123');
  });

  it('handles very long ids', () => {
    const longId = 'a'.repeat(1000);
    document.body.innerHTML = `<div id="${longId}"></div>`;
    const { result } = renderHook(() => useActiveSection([longId]));
    expect(result.current).toBe(longId);
  });

  it('handles unicode ids', () => {
    document.body.innerHTML = '<div id="中文"></div>';
    const { result } = renderHook(() => useActiveSection(['中文']));
    expect(result.current).toBe('中文');
  });
});

describe('useReducedMotion() — extra density', () => {
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

  it('returns a boolean', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(typeof result.current).toBe('boolean');
  });

  it('handles many state changes', () => {
    const { result } = renderHook(() => useReducedMotion());
    for (let i = 0; i < 10; i += 1) {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)') as unknown as {
        matches: boolean;
      };
      mql.matches = i % 2 === 0;
      act(() => {
        listeners.forEach((l) => l());
      });
    }
    // After 10 iterations: i=0 (true), i=1 (false), ..., i=9 (false). Last set is false.
    expect(result.current).toBe(false);
  });

  it('handles many renders with same hook', () => {
    const { result, rerender } = renderHook(() => useReducedMotion());
    for (let i = 0; i < 5; i += 1) {
      rerender();
    }
    expect(result.current).toBe(false);
  });

  it('does not throw when many change events fire', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(() => {
      for (let i = 0; i < 100; i += 1) {
        listeners.forEach((l) => l());
      }
    }).not.toThrow();
    expect(result.current).toBe(false);
  });
});
