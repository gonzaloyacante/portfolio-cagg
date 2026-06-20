// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST as mediaPOST } from '@/app/api/admin/media/route';

const { prismaMock, cloudinary } = vi.hoisted(() => ({
  prismaMock: {
    mediaFile: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
  cloudinary: {
    uploader: {
      upload: vi.fn().mockResolvedValue({
        public_id: 'p',
        url: 'u',
        secure_url: 's',
        format: 'png',
        width: 100,
        height: 100,
        bytes: 1234,
      }),
      destroy: vi.fn().mockResolvedValue({ result: 'ok' }),
    },
  },
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/lib/cloudinary', () => ({ cloudinary }));
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Headers()) }));
vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn().mockResolvedValue({ user: { id: 'u' } }) } },
}));

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.mediaFile.findUnique.mockResolvedValue(null);
  prismaMock.mediaFile.create.mockImplementation(async ({ data }) => ({ id: 'm1', ...data }));
});

/**
 * Media upload is the only file ingestion path. It must reject:
 * - Files that claim to be image/png but contain a script body
 * - Files larger than 10MB
 * - Files with unsupported MIME types
 * - Empty / missing files
 *
 * The current implementation only checks the Content-Type header (line 42).
 * A more robust implementation would verify magic bytes. These tests
 * document the current behavior and pin the magic byte gap so any future
 * change to add byte-level verification is caught.
 */

describe('media upload: MIME type validation', () => {
  // Real magic bytes / signatures for each allowed MIME. The route
  // performs a body-level consistency check on top of the Content-Type
  // header (see src/lib/magic-bytes.ts), so happy-path tests must
  // send real signatures.
  const REAL_BYTES: Record<string, Uint8Array> = {
    'image/jpeg': new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]),
    'image/png': new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    'image/gif': new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]),
    'image/webp': new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]),
    'image/svg+xml': new TextEncoder().encode(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>'
    ),
  };
  const allowed = Object.keys(REAL_BYTES);
  const denied = [
    'image/jpg',
    'image/bmp',
    'image/tiff',
    'text/html',
    'text/plain',
    'application/octet-stream',
    'application/javascript',
    'application/x-php',
    'application/x-msdownload',
    'application/x-sh',
    'application/zip',
    'video/mp4',
    'audio/mpeg',
  ];

  for (const mime of allowed) {
    it(`accepts ${mime} with valid body signature`, async () => {
      const formData = new FormData();
      formData.append('file', new Blob([Buffer.from(REAL_BYTES[mime]!)], { type: mime }));
      const req = new Request('https://x.com', { method: 'POST', body: formData });
      const res = await mediaPOST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(201);
    });
  }

  for (const mime of denied) {
    it(`rejects ${mime} with 415`, async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['fake content'], { type: mime }));
      const req = new Request('https://x.com', { method: 'POST', body: formData });
      const res = await mediaPOST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(415);
    });
  }
});

describe('media upload: size validation', () => {
  // Build a buffer of `n` bytes prefixed with a valid PNG signature,
  // so size tests are not accidentally caught by the magic-byte check.
  function pngBuffer(n: number): Uint8Array {
    const out = new Uint8Array(n);
    out.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
    return out;
  }

  it('rejects files over 10 MB with 413', async () => {
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([Buffer.from(pngBuffer(11 * 1024 * 1024))], { type: 'image/png' })
    );
    const req = new Request('https://x.com', { method: 'POST', body: formData });
    const res = await mediaPOST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(413);
  });

  it('accepts files exactly at 10 MB (boundary)', async () => {
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([Buffer.from(pngBuffer(10 * 1024 * 1024))], { type: 'image/png' })
    );
    const req = new Request('https://x.com', { method: 'POST', body: formData });
    const res = await mediaPOST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(201);
  });

  it('accepts files just under 10 MB', async () => {
    const formData = new FormData();
    formData.append('file', new Blob([Buffer.from(pngBuffer(1024 * 1024))], { type: 'image/png' }));
    const req = new Request('https://x.com', { method: 'POST', body: formData });
    const res = await mediaPOST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(201);
  });

  it('rejects zero-byte files with 400 (File is empty)', async () => {
    // The route has a dedicated size-zero check that runs before
    // MIME allowlist and magic-byte checks, so an empty file is
    // rejected with a clear "File is empty" 400 instead of a
    // misleading 415 from the magic-byte verifier.
    const formData = new FormData();
    formData.append('file', new Blob([], { type: 'image/png' }));
    const req = new Request('https://x.com', { method: 'POST', body: formData });
    const res = await mediaPOST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('File is empty');
    // Cloudinary must never be called for an empty file.
    const { cloudinary } = await import('@/lib/cloudinary');
    expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
  });

  it('rejects zero-byte files even with an allowed MIME', async () => {
    // Boundary: even when the declared MIME is in the allowlist, a
    // 0-byte file is rejected with the same explicit error. The
    // check is on size, not on MIME.
    for (const mime of ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']) {
      const formData = new FormData();
      formData.append('file', new Blob([], { type: mime }));
      const req = new Request('https://x.com', { method: 'POST', body: formData });
      const res = await mediaPOST(req, { params: Promise.resolve({}) });
      expect(res.status, `${mime} empty file should be 400`).toBe(400);
    }
  });
});

describe('media upload: file presence', () => {
  it('rejects request with no file field with 400', async () => {
    const formData = new FormData();
    const req = new Request('https://x.com', { method: 'POST', body: formData });
    const res = await mediaPOST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(400);
  });

  it('rejects file field that is not a Blob with 400', async () => {
    const formData = new FormData();
    formData.append('file', 'just a string');
    const req = new Request('https://x.com', { method: 'POST', body: formData });
    const res = await mediaPOST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(400);
  });

  it('rejects invalid form data with 400', async () => {
    const req = new Request('https://x.com', {
      method: 'POST',
      body: 'not form data',
    });
    const res = await mediaPOST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(400);
  });
});

describe('media upload: magic byte enforcement (body vs Content-Type)', () => {
  /**
   * The route performs a body-level consistency check on top of the
   * Content-Type header (see src/lib/magic-bytes.ts). A file whose
   * declared MIME does not match its first bytes is rejected with 415
   * before the body ever reaches Cloudinary. This closes the gap
   * documented in the previous revision of this test file.
   *
   * For SVG (no fixed magic number) the check is content-based: the
   * body is scanned for `<script>`, `<foreignObject>`, `javascript:`,
   * and `data:text/html`.
   */
  const mismatches: Array<{ mime: string; body: Uint8Array | string; label: string }> = [
    { mime: 'image/png', body: '<?php echo "hello"; ?>', label: 'PHP body with image/png header' },
    {
      mime: 'image/png',
      body: '<script>alert(1)</script>',
      label: 'JS body with image/png header',
    },
    {
      mime: 'image/jpeg',
      body: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      label: 'PNG bytes with image/jpeg header',
    },
    {
      mime: 'image/gif',
      body: new Uint8Array([0xff, 0xd8, 0xff, 0xe0]),
      label: 'JPEG bytes with image/gif header',
    },
    {
      mime: 'image/webp',
      body: new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]),
      label: 'GIF bytes with image/webp header',
    },
    {
      mime: 'image/png',
      body: new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]),
      label: 'GIF bytes with image/png header',
    },
  ];

  for (const { mime, body, label } of mismatches) {
    it(`rejects ${label} with 415`, async () => {
      const formData = new FormData();
      // Normalize: string bodies go in as-is, Uint8Array bodies get
      // copied into a fresh ArrayBuffer so the BlobPart type union
      // resolves cleanly under strict TS.
      const part: BlobPart = typeof body === 'string' ? body : new Uint8Array(body); // copy — satisfies BlobPart's ArrayBuffer-backed view
      formData.append('file', new Blob([part], { type: mime }));
      const req = new Request('https://x.com', { method: 'POST', body: formData });
      const res = await mediaPOST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(415);
      // Cloudinary must never be called for a mismatched body.
      const { cloudinary } = await import('@/lib/cloudinary');
      expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
    });
  }

  it('rejects SVG with embedded <script> tag', async () => {
    const evil = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';
    const formData = new FormData();
    formData.append('file', new Blob([evil], { type: 'image/svg+xml' }));
    const req = new Request('https://x.com', { method: 'POST', body: formData });
    const res = await mediaPOST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(415);
  });

  it('rejects SVG with <foreignObject>', async () => {
    const evil =
      '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><body onload="alert(1)"></body></foreignObject></svg>';
    const formData = new FormData();
    formData.append('file', new Blob([evil], { type: 'image/svg+xml' }));
    const req = new Request('https://x.com', { method: 'POST', body: formData });
    const res = await mediaPOST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(415);
  });

  it('rejects SVG with javascript: URL', async () => {
    const evil =
      '<svg xmlns="http://www.w3.org/2000/svg"><a xlink:href="javascript:alert(1)"><text>x</text></a></svg>';
    const formData = new FormData();
    formData.append('file', new Blob([evil], { type: 'image/svg+xml' }));
    const req = new Request('https://x.com', { method: 'POST', body: formData });
    const res = await mediaPOST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(415);
  });

  it('rejects SVG with data:text/html URI', async () => {
    const evil =
      '<svg xmlns="http://www.w3.org/2000/svg"><a xlink:href="data:text/html,<script>alert(1)</script>"><text>x</text></a></svg>';
    const formData = new FormData();
    formData.append('file', new Blob([evil], { type: 'image/svg+xml' }));
    const req = new Request('https://x.com', { method: 'POST', body: formData });
    const res = await mediaPOST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(415);
  });

  it('strips XML comments before SVG content scan', async () => {
    // Payload hidden in a comment is harmless — comments are stripped first.
    const benign =
      '<svg xmlns="http://www.w3.org/2000/svg"><!-- <script>alert(1)</script> --></svg>';
    const formData = new FormData();
    formData.append('file', new Blob([benign], { type: 'image/svg+xml' }));
    const req = new Request('https://x.com', { method: 'POST', body: formData });
    const res = await mediaPOST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(201);
  });

  it('strips CDATA blocks before SVG content scan', async () => {
    const benign =
      '<svg xmlns="http://www.w3.org/2000/svg"><![CDATA[ <script>alert(1)</script> ]]></svg>';
    const formData = new FormData();
    formData.append('file', new Blob([benign], { type: 'image/svg+xml' }));
    const req = new Request('https://x.com', { method: 'POST', body: formData });
    const res = await mediaPOST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(201);
  });
});

describe('media upload: idempotency on duplicate public_id', () => {
  const realPng = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);

  it('returns the existing record (200) instead of creating a new one', async () => {
    const existing = { id: 'm1', publicId: 'p', url: 'u', secureUrl: 's', format: 'png' };
    prismaMock.mediaFile.findUnique.mockResolvedValueOnce(existing);
    const formData = new FormData();
    formData.append('file', new Blob([realPng], { type: 'image/png' }));
    const req = new Request('https://x.com', { method: 'POST', body: formData });
    const res = await mediaPOST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);
    expect(prismaMock.mediaFile.create).not.toHaveBeenCalled();
    const body = (await res.json()) as { id: string; publicId: string };
    expect(body.id).toBe(existing.id);
    expect(body.publicId).toBe(existing.publicId);
  });

  it('creates a new record when public_id is new', async () => {
    prismaMock.mediaFile.findUnique.mockResolvedValueOnce(null);
    const formData = new FormData();
    formData.append('file', new Blob([realPng], { type: 'image/png' }));
    const req = new Request('https://x.com', { method: 'POST', body: formData });
    const res = await mediaPOST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(201);
    expect(prismaMock.mediaFile.create).toHaveBeenCalledOnce();
  });
});
