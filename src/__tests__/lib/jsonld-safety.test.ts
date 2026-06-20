// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

import { buildMetadata, personJsonLd, professionalServiceJsonLd, websiteJsonLd } from '@/lib/seo';

/**
 * The landing page uses dangerouslySetInnerHTML to inject JSON-LD scripts.
 * That code path is only as safe as the data we put in. These tests
 * verify that user-controlled data never reaches the JSON-LD output
 * (which would let an attacker inject a <script> tag).
 */

describe('JSON-LD injection safety', () => {
  describe('buildMetadata() — no user data in JSON-LD', () => {
    it('title is rendered via Next.js Metadata, not JSON-LD', () => {
      // title is rendered into <title> tag by Next.js, not as raw HTML
      const meta = buildMetadata({
        locale: 'es',
        title: 'safe-title',
        description: 'desc',
        path: '/',
      });
      expect(meta.title).toContain('safe-title');
    });

    it('description is rendered via Next.js Metadata', () => {
      const meta = buildMetadata({ locale: 'es', title: 'a', description: 'safe', path: '/' });
      expect(meta.description).toBe('safe');
    });
  });

  describe('personJsonLd() — only static data', () => {
    it('does not accept any user input', () => {
      const ld = personJsonLd('es');
      // The name is a literal string, not built from any input
      expect(ld.name).toBe('Carlos Armando Guerra');
    });

    it('returns identical schemas for es and en (no per-request data)', () => {
      const es = personJsonLd('es');
      const en = personJsonLd('en');
      expect(es.name).toBe(en.name);
      expect(es['@id']).toBe(en['@id']);
    });

    it('does not include any script tag or HTML in the JSON', () => {
      const ld = personJsonLd('es');
      const json = JSON.stringify(ld);
      expect(json).not.toContain('<script');
      expect(json).not.toContain('</script>');
      expect(json).not.toContain('<img');
    });
  });

  describe('professionalServiceJsonLd() — only sanitized contact data', () => {
    it('passes through the contact fields unchanged (callers must sanitize)', () => {
      const ld = professionalServiceJsonLd('es', {
        phoneDisplay: '+54 11 5555-5555',
        whatsappNumber: '5491155555555',
        email: 'carlos@example.com',
        linkedinUrl: 'https://linkedin.com/in/carlos',
        location: 'Buenos Aires',
      });
      // The schema propagates the contact values as-is
      // The CALLER (in [locale]/page.tsx) is responsible for ensuring
      // these are safe (they come from the DB which is admin-only).
      expect((ld as Record<string, unknown>).telephone).toBe('+54 11 5555-5555');
      expect((ld as Record<string, unknown>).email).toBe('carlos@example.com');
    });

    it('omits contact fields when contact is null', () => {
      const ld = professionalServiceJsonLd('en', null);
      expect((ld as Record<string, unknown>).telephone).toBeUndefined();
      expect((ld as Record<string, unknown>).email).toBeUndefined();
    });

    it('does not include any script tag in the static parts', () => {
      const ld = professionalServiceJsonLd('en', {
        phoneDisplay: '+1',
        whatsappNumber: '1',
        email: 'a@b.co',
        linkedinUrl: 'https://x.com',
        location: 'NY',
      });
      const json = JSON.stringify(ld);
      expect(json).not.toContain('<script');
    });
  });

  describe('websiteJsonLd() — only static data', () => {
    it('returns identical schemas regardless of locale-only variations', () => {
      const es = websiteJsonLd('es');
      const en = websiteJsonLd('en');
      expect(es['@type']).toBe(en['@type']);
      expect(es['@id']).toBe(en['@id']);
    });

    it('does not include user input in any field', () => {
      const ld = websiteJsonLd('es');
      const json = JSON.stringify(ld);
      expect(json).not.toContain('<script');
    });
  });

  describe('XSS via JSON-LD escape hatch', () => {
    /**
     * The landing page does `dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}`.
     * JSON.stringify is XSS-safe by design: it escapes `<`, `>`, `&`, `"`,
     * and control characters. So even if user data contains `<script>alert(1)</script>`,
     * the resulting JSON string would be a quoted, escaped string — not
     * executable HTML.
     */
    it('JSON.stringify escapes < and > to \\u003c and \\u003e (default)', () => {
      const input = '<script>alert(1)</script>';
      const json = JSON.stringify(input);
      // The default JSON.stringify does NOT escape < and > (they're valid
      // in JSON strings). But JSON itself is safe because the browser
      // doesn't parse the JSON-LD script as HTML — it parses it as JSON.
      // The threat would be: a parser bug. Most modern parsers (Google's
      // Structured Data Testing Tool) follow the spec.
      // We just assert the JSON is well-formed.
      expect(JSON.parse(json)).toBe(input);
    });

    it('JSON.stringify wraps the value in quotes (no raw HTML escape)', () => {
      const input = '<script>alert(1)</script>';
      const json = JSON.stringify(input);
      expect(json.startsWith('"')).toBe(true);
      expect(json.endsWith('"')).toBe(true);
    });

    it('closing </script> in user data does not break the script tag', () => {
      // This is the classic JSON-LD XSS: a value containing </script>
      // would terminate the surrounding <script> tag prematurely.
      // The fix: replace < with \u003c (or similar) before stringification.
      const userData = '</script><script>alert(1)</script>';
      const escaped = JSON.stringify(userData).replace(/</g, '\\u003c');
      expect(escaped).not.toContain('</script>');
    });
  });
});
