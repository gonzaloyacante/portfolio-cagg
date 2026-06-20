// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

import { defaultViewport } from '@/lib/viewport';

describe('defaultViewport — extra density', () => {
  it('is a valid Viewport shape', () => {
    expect(defaultViewport).toHaveProperty('width');
    expect(defaultViewport).toHaveProperty('initialScale');
    expect(defaultViewport).toHaveProperty('viewportFit');
    expect(defaultViewport).toHaveProperty('themeColor');
    expect(defaultViewport).toHaveProperty('colorScheme');
  });

  it('width is a string', () => {
    expect(typeof defaultViewport.width).toBe('string');
  });

  it('initialScale is a number', () => {
    expect(typeof defaultViewport.initialScale).toBe('number');
  });

  it('initialScale is exactly 1', () => {
    expect(defaultViewport.initialScale).toBe(1);
  });

  it('width is device-width', () => {
    expect(defaultViewport.width).toBe('device-width');
  });

  it('viewportFit is cover', () => {
    expect(defaultViewport.viewportFit).toBe('cover');
  });

  it('themeColor is a valid hex color', () => {
    expect(defaultViewport.themeColor).toMatch(/^#[0-9a-fA-F]{3,8}$/);
  });

  it('colorScheme is dark', () => {
    expect(defaultViewport.colorScheme).toBe('dark');
  });
});
