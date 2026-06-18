import { describe, expect, it } from 'vitest';

import { defaultViewport } from '@/lib/viewport';

describe('defaultViewport', () => {
  it('has width=device-width', () => {
    expect(defaultViewport.width).toBe('device-width');
  });

  it('has initialScale=1', () => {
    expect(defaultViewport.initialScale).toBe(1);
  });

  it('has viewportFit=cover', () => {
    expect(defaultViewport.viewportFit).toBe('cover');
  });

  it('has themeColor set to a hex color', () => {
    expect(defaultViewport.themeColor).toMatch(/^#[0-9a-fA-F]{3,8}$/);
  });

  it('has colorScheme=dark', () => {
    expect(defaultViewport.colorScheme).toBe('dark');
  });
});
