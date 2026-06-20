import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/utils';

describe('cn() — extra density', () => {
  it('handles arrays at top level', () => {
    expect(cn(['a', 'b', 'c'])).toBe('a b c');
  });

  it('handles mixed arrays and strings', () => {
    expect(cn('a', ['b', 'c'], 'd')).toBe('a b c d');
  });

  it('handles nested arrays', () => {
    expect(cn(['a', ['b', ['c']]])).toBe('a b c');
  });

  it('handles objects with boolean values', () => {
    expect(cn({ a: true, b: false, c: true })).toBe('a c');
  });

  it('merges tailwind padding conflicts', () => {
    expect(cn('p-1', 'p-2', 'p-3')).toBe('p-3');
  });

  it('merges tailwind margin conflicts', () => {
    expect(cn('m-1', 'm-2')).toBe('m-2');
  });

  it('merges tailwind color conflicts', () => {
    expect(cn('text-red-500', 'text-blue-500', 'text-green-500')).toBe('text-green-500');
  });

  it('merges tailwind background conflicts', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('merges tailwind display conflicts', () => {
    expect(cn('block', 'inline-block', 'flex')).toBe('flex');
  });

  it('keeps non-conflicting classes', () => {
    expect(cn('p-2', 'm-2', 'text-sm', 'font-bold')).toBe('p-2 m-2 text-sm font-bold');
  });

  it('keeps all non-conflicting classes in order', () => {
    const result = cn('a-1', 'b-2', 'c-3', 'd-4');
    expect(result).toContain('a-1');
    expect(result).toContain('b-2');
    expect(result).toContain('c-3');
    expect(result).toContain('d-4');
  });

  it('handles very long strings', () => {
    const longClass = 'a'.repeat(10000);
    expect(cn(longClass)).toBe(longClass);
  });

  it('handles unicode', () => {
    expect(cn('class-é', 'class-ü')).toBe('class-é class-ü');
  });

  it('handles classes with numbers', () => {
    expect(cn('w-1', 'h-2', 'p-3', 'm-4')).toBe('w-1 h-2 p-3 m-4');
  });

  it('handles classes with slashes', () => {
    expect(cn('w-1/2', 'h-1/3')).toBe('w-1/2 h-1/3');
  });

  it('handles classes with colons (responsive prefixes)', () => {
    expect(cn('sm:p-2', 'md:p-4', 'lg:p-8')).toBe('sm:p-2 md:p-4 lg:p-8');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
  });

  it('handles all-empty inputs', () => {
    expect(cn('', null, undefined, false)).toBe('');
  });

  it('handles repeated classes (twMerge does not dedupe non-conflicting)', () => {
    // twMerge only dedupes conflicting tailwind classes; identical non-conflicting
    // strings are kept as-is by clsx.
    expect(cn('a', 'a', 'a')).toBe('a a a');
  });

  it('handles variants', () => {
    expect(cn('hover:p-2', 'focus:p-4')).toBe('hover:p-2 focus:p-4');
  });
});
