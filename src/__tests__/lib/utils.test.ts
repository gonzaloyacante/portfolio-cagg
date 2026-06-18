import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/utils';

describe('cn()', () => {
  it('returns single class', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('joins multiple classes with space', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('joins three classes', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('drops falsy values', () => {
    expect(cn('foo', false && 'bar', undefined, null, 'baz')).toBe('foo baz');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });

  it('handles all-falsy input', () => {
    expect(cn(undefined, null, false)).toBe('');
  });

  it('flattens arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('handles nested arrays', () => {
    expect(cn(['foo', ['bar', 'baz']])).toBe('foo bar baz');
  });

  it('handles object notation', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('dedupes conflicting tailwind classes via twMerge', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('keeps non-conflicting classes', () => {
    expect(cn('p-4', 'm-2', 'text-sm')).toBe('p-4 m-2 text-sm');
  });

  it('preserves ordering when no conflict', () => {
    const result = cn('font-bold', 'text-sm', 'rounded');
    expect(result).toContain('font-bold');
    expect(result).toContain('text-sm');
    expect(result).toContain('rounded');
  });

  it('handles complex mixed input', () => {
    const result = cn(
      'base-class',
      { active: true, disabled: false },
      ['array-class-1', 'array-class-2'],
      undefined,
      'last-class'
    );
    expect(result).toContain('base-class');
    expect(result).toContain('active');
    expect(result).not.toContain('disabled');
    expect(result).toContain('array-class-1');
    expect(result).toContain('array-class-2');
    expect(result).toContain('last-class');
  });

  it('handles numeric inputs (treated as falsy)', () => {
    // clsx treats 0 as falsy
    expect(cn('foo', 0)).toBe('foo');
    expect(cn('foo', 1)).toBe('foo 1');
  });

  it('works with conditional strings', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
  });
});
