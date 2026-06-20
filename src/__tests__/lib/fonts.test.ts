import { describe, expect, it, vi } from 'vitest';

import { fontDisplay, fontMono, fontSans } from '@/lib/fonts';

vi.mock('next/font/google', () => ({
  IBM_Plex_Mono: () => ({
    className: 'mock-mono',
    variable: '--font-mono',
    style: { fontDisplay: 'swap' },
  }),
  IBM_Plex_Sans: () => ({
    className: 'mock-sans',
    variable: '--font-sans',
    style: { fontDisplay: 'swap' },
  }),
  Plus_Jakarta_Sans: () => ({
    className: 'mock-display',
    variable: '--font-display',
    style: { fontDisplay: 'swap' },
  }),
}));

describe('font configurations', () => {
  describe('fontDisplay', () => {
    it('exposes the --font-display CSS variable', () => {
      expect(fontDisplay.variable).toBe('--font-display');
    });

    it('returns a className', () => {
      expect(fontDisplay.className).toBeTruthy();
    });
  });

  describe('fontSans', () => {
    it('exposes the --font-sans CSS variable', () => {
      expect(fontSans.variable).toBe('--font-sans');
    });
  });

  describe('fontMono', () => {
    it('exposes the --font-mono CSS variable', () => {
      expect(fontMono.variable).toBe('--font-mono');
    });
  });
});
