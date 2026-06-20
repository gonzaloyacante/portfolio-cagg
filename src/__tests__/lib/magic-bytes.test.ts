import { describe, expect, it } from 'vitest';

import { isBufferConsistentWithMime } from '@/lib/magic-bytes';

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
const GIF87 = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]);
const GIF89 = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
const WEBP = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x1a, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);
const BENIGN_SVG = new TextEncoder().encode(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle r="5"/></svg>'
);

describe('isBufferConsistentWithMime: PNG', () => {
  it('accepts a real PNG header', () => {
    expect(isBufferConsistentWithMime(PNG, 'image/png')).toBe(true);
  });

  it('rejects a body that is not PNG', () => {
    expect(isBufferConsistentWithMime(JPEG, 'image/png')).toBe(false);
    expect(isBufferConsistentWithMime(GIF89, 'image/png')).toBe(false);
    expect(isBufferConsistentWithMime(new TextEncoder().encode('not png'), 'image/png')).toBe(
      false
    );
  });

  it('rejects an empty buffer', () => {
    expect(isBufferConsistentWithMime(new Uint8Array(0), 'image/png')).toBe(false);
  });

  it('rejects a truncated PNG header (7 bytes instead of 8)', () => {
    expect(isBufferConsistentWithMime(PNG.slice(0, 7), 'image/png')).toBe(false);
  });
});

describe('isBufferConsistentWithMime: JPEG', () => {
  it('accepts a real JPEG header', () => {
    expect(isBufferConsistentWithMime(JPEG, 'image/jpeg')).toBe(true);
  });

  it('rejects a body that is not JPEG', () => {
    expect(isBufferConsistentWithMime(PNG, 'image/jpeg')).toBe(false);
  });

  it('rejects an empty buffer', () => {
    expect(isBufferConsistentWithMime(new Uint8Array(0), 'image/jpeg')).toBe(false);
  });

  it('rejects a truncated JPEG header (2 bytes)', () => {
    expect(isBufferConsistentWithMime(new Uint8Array([0xff, 0xd8]), 'image/jpeg')).toBe(false);
  });
});

describe('isBufferConsistentWithMime: GIF', () => {
  it('accepts GIF87a', () => {
    expect(isBufferConsistentWithMime(GIF87, 'image/gif')).toBe(true);
  });

  it('accepts GIF89a', () => {
    expect(isBufferConsistentWithMime(GIF89, 'image/gif')).toBe(true);
  });

  it('rejects a body that does not start with GIF8', () => {
    expect(isBufferConsistentWithMime(PNG, 'image/gif')).toBe(false);
  });

  it('rejects GIF with invalid version byte (not 87 or 89)', () => {
    const bad = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x38, 0x61]);
    expect(isBufferConsistentWithMime(bad, 'image/gif')).toBe(false);
  });
});

describe('isBufferConsistentWithMime: WEBP', () => {
  it('accepts a real WEBP signature', () => {
    expect(isBufferConsistentWithMime(WEBP, 'image/webp')).toBe(true);
  });

  it('rejects when the second magic (WEBP at offset 8) is missing', () => {
    const noWebp = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x41, 0x42, 0x43, 0x44,
    ]);
    expect(isBufferConsistentWithMime(noWebp, 'image/webp')).toBe(false);
  });

  it('rejects when the buffer is shorter than 12 bytes', () => {
    expect(isBufferConsistentWithMime(new Uint8Array(11), 'image/webp')).toBe(false);
  });

  it('rejects an empty buffer', () => {
    expect(isBufferConsistentWithMime(new Uint8Array(0), 'image/webp')).toBe(false);
  });
});

describe('isBufferConsistentWithMime: SVG (content scan)', () => {
  it('accepts a benign SVG', () => {
    expect(isBufferConsistentWithMime(BENIGN_SVG, 'image/svg+xml')).toBe(true);
  });

  it('rejects an SVG with a <script> tag', () => {
    const evil = new TextEncoder().encode('<svg><script>alert(1)</script></svg>');
    expect(isBufferConsistentWithMime(evil, 'image/svg+xml')).toBe(false);
  });

  it('rejects <script> even with leading whitespace inside the tag', () => {
    const evil = new TextEncoder().encode('<svg ><script   src="x"></script></svg>');
    expect(isBufferConsistentWithMime(evil, 'image/svg+xml')).toBe(false);
  });

  it('rejects an SVG with <foreignObject>', () => {
    const evil = new TextEncoder().encode(
      '<svg><foreignObject><body onload="alert(1)"></body></foreignObject></svg>'
    );
    expect(isBufferConsistentWithMime(evil, 'image/svg+xml')).toBe(false);
  });

  it('rejects an SVG with a javascript: URL', () => {
    const evil = new TextEncoder().encode(
      '<svg><a xlink:href="javascript:alert(1)"><text>x</text></a></svg>'
    );
    expect(isBufferConsistentWithMime(evil, 'image/svg+xml')).toBe(false);
  });

  it('rejects an SVG with a data:text/html URI', () => {
    const evil = new TextEncoder().encode(
      '<svg><a xlink:href="data:text/html,<script>alert(1)</script>"><text>x</text></a></svg>'
    );
    expect(isBufferConsistentWithMime(evil, 'image/svg+xml')).toBe(false);
  });

  it('strips XML comments before scanning (comment-hidden payload passes)', () => {
    const benign = new TextEncoder().encode('<svg><!-- <script>alert(1)</script> --></svg>');
    expect(isBufferConsistentWithMime(benign, 'image/svg+xml')).toBe(true);
  });

  it('strips CDATA before scanning (CDATA-hidden payload passes)', () => {
    const benign = new TextEncoder().encode('<svg><![CDATA[ <script>alert(1)</script> ]]></svg>');
    expect(isBufferConsistentWithMime(benign, 'image/svg+xml')).toBe(true);
  });

  it('is case-insensitive for both the tag name and the URI scheme', () => {
    const upperScript = new TextEncoder().encode('<svg><SCRIPT>alert(1)</SCRIPT></svg>');
    expect(isBufferConsistentWithMime(upperScript, 'image/svg+xml')).toBe(false);

    const upperJs = new TextEncoder().encode('<svg><a xlink:href="JaVaScRiPt:alert(1)"/></svg>');
    expect(isBufferConsistentWithMime(upperJs, 'image/svg+xml')).toBe(false);
  });

  it('rejects an empty buffer', () => {
    expect(isBufferConsistentWithMime(new Uint8Array(0), 'image/svg+xml')).toBe(false);
  });
});

describe('isBufferConsistentWithMime: unknown / fail-closed', () => {
  it('rejects any undeclared MIME (defense in depth)', () => {
    expect(isBufferConsistentWithMime(PNG, 'application/octet-stream')).toBe(false);
    expect(isBufferConsistentWithMime(PNG, 'text/html')).toBe(false);
    expect(isBufferConsistentWithMime(PNG, '')).toBe(false);
    expect(isBufferConsistentWithMime(PNG, 'image/avif')).toBe(false);
  });
});
