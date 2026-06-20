import { describe, expect, it } from 'vitest';

import { escapeHtml } from '@/lib/escape-html';

describe('escapeHtml: dangerous characters', () => {
  it('escapes < and > (the script tag delimiters)', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('escapes & (must be first, otherwise downstream entities double-escape)', () => {
    expect(escapeHtml('&amp;')).toBe('&amp;amp;');
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });

  it('escapes " and \' (attribute delimiters)', () => {
    expect(escapeHtml(`he said "hi" and it's fine`)).toBe(
      'he said &quot;hi&quot; and it&#39;s fine'
    );
  });

  it('escapes event handler attribute injection', () => {
    expect(escapeHtml(`<img src=x onerror="alert(1)">`)).toBe(
      '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'
    );
  });

  it('escapes a javascript: URL inside a link', () => {
    expect(escapeHtml(`<a href="javascript:alert(1)">x</a>`)).toBe(
      '&lt;a href=&quot;javascript:alert(1)&quot;&gt;x&lt;/a&gt;'
    );
  });
});

describe('escapeHtml: pass-through characters', () => {
  it('leaves plain text untouched', () => {
    expect(escapeHtml('Hola Carlos, todo bien.')).toBe('Hola Carlos, todo bien.');
  });

  it('leaves newlines alone (caller decides how to render them, e.g. <br/>)', () => {
    expect(escapeHtml('line 1\nline 2\nline 3')).toBe('line 1\nline 2\nline 3');
  });

  it('leaves slashes alone (only matter inside <script> bodies, which we never emit)', () => {
    expect(escapeHtml('https://example.com/path')).toBe('https://example.com/path');
  });

  it('returns empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });
});

describe('escapeHtml: realistic payloads from /api/messages', () => {
  // The four user-controlled fields. None of them, after escaping,
  // should contain any character that can start or end an HTML tag.
  const cases: Array<{ field: string; payload: string }> = [
    { field: 'name', payload: 'Carlos <img src=x onerror=alert(1)>' },
    { field: 'name', payload: '"><script>alert(1)</script>' },
    { field: 'email', payload: 'a@b.com"><svg/onload=alert(1)>' },
    { field: 'phone', payload: '+1 (555) 0100&ext=1337' },
    { field: 'message', payload: 'I want a quote.\n<script>steal_cookies()</script>\nThanks.' },
    { field: 'message', payload: 'Check this out: <a href="javascript:alert(1)">click</a>' },
  ];

  for (const { field, payload } of cases) {
    it(`escapes a malicious ${field} payload`, () => {
      const out = escapeHtml(payload);
      // After escaping, no raw angle brackets remain in the
      // user-supplied portion.
      expect(out).not.toMatch(/[<>]/);
      // No raw quotes that could escape an attribute.
      expect(out).not.toMatch(/"/);
      // No raw ampersand that could start a new entity.
      expect(out).not.toMatch(/&(?!amp;|lt;|gt;|quot;|#39;)/);
    });
  }
});
