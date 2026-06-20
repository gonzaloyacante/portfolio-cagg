import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DELETE, GET, POST } from '@/app/api/admin/media/route';

const { prisma, cloudinary, auth, headers } = vi.hoisted(() => ({
  prisma: {
    mediaFile: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
  cloudinary: { uploader: { upload: vi.fn(), destroy: vi.fn() } },
  auth: { api: { getSession: vi.fn() } },
  headers: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/cloudinary', () => ({ cloudinary }));
vi.mock('@/lib/auth', () => ({ auth }));
vi.mock('next/headers', () => ({ headers }));

const MEDIA = { id: 'm-1', publicId: 'pid', url: 'u', secureUrl: 'su', format: 'jpg' };

// Real magic bytes for each allowed MIME. The route verifies the
// body against the declared Content-Type, so tests must send real
// signatures for the happy path.
const REAL_BYTES = {
  'image/jpeg': new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]),
  'image/png': new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  'image/gif': new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]),
  'image/webp': new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  ]),
  'image/svg+xml': new TextEncoder().encode(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>'
  ),
} as const;

function makeFile(type: keyof typeof REAL_BYTES): Blob {
  return new Blob([REAL_BYTES[type]], { type });
}

describe('/api/admin/media', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Map());
    auth.api.getSession.mockResolvedValue({ user: { id: 'u1' } });
    prisma.mediaFile.findMany.mockResolvedValue([MEDIA]);
    prisma.mediaFile.count.mockResolvedValue(1);
    prisma.mediaFile.findUnique.mockResolvedValue(MEDIA);
    prisma.mediaFile.create.mockResolvedValue(MEDIA);
    prisma.mediaFile.delete.mockResolvedValue(MEDIA);
  });

  describe('GET', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const req = new Request('https://x.com');
      const res = await GET(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
    });

    it('returns paginated media', async () => {
      const req = new Request('https://x.com');
      const res = await GET(req, { params: Promise.resolve({}) });
      const body = await res.json();
      expect(body).toHaveProperty('items');
      expect(body).toHaveProperty('total');
      expect(body).toHaveProperty('page');
      expect(body).toHaveProperty('pageSize');
    });

    it('defaults to page 1 with pageSize 24', async () => {
      const req = new Request('https://x.com');
      await GET(req, { params: Promise.resolve({}) });
      expect(prisma.mediaFile.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 24,
      });
    });

    it('parses page from query string', async () => {
      const req = new Request('https://x.com?page=3');
      await GET(req, { params: Promise.resolve({}) });
      expect(prisma.mediaFile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 48, take: 24 })
      );
    });

    it('orders by createdAt desc', async () => {
      const req = new Request('https://x.com');
      await GET(req, { params: Promise.resolve({}) });
      expect(prisma.mediaFile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } })
      );
    });
  });

  describe('POST', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const fd = new FormData();
      fd.append('file', new Blob(['x'], { type: 'image/png' }));
      const req = new Request('https://x.com', { method: 'POST', body: fd });
      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
    });

    it('returns 400 on missing file', async () => {
      const fd = new FormData();
      const req = new Request('https://x.com', { method: 'POST', body: fd });
      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(400);
    });

    it('returns 400 on invalid form data', async () => {
      const req = new Request('https://x.com', { method: 'POST', body: 'not form data' });
      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(400);
    });

    it('returns 415 on unsupported file type', async () => {
      const fd = new FormData();
      fd.append('file', new Blob(['x'], { type: 'application/pdf' }));
      const req = new Request('https://x.com', { method: 'POST', body: fd });
      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(415);
    });

    it('returns 413 when file exceeds 10 MB', async () => {
      const fd = new FormData();
      // 10 MB + 1 byte
      const big = new Uint8Array(10 * 1024 * 1024 + 1);
      fd.append('file', new Blob([big], { type: 'image/jpeg' }));
      const req = new Request('https://x.com', { method: 'POST', body: fd });
      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(413);
    });

    it('accepts allowed image types', async () => {
      cloudinary.uploader.upload.mockResolvedValue({
        public_id: 'pid',
        url: 'u',
        secure_url: 'su',
        format: 'jpg',
      });
      // For each type, mock findUnique to return null so the create path is taken
      prisma.mediaFile.findUnique.mockReset();
      prisma.mediaFile.findUnique.mockResolvedValue(null);
      for (const type of [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml',
      ] as const) {
        const fd = new FormData();
        fd.append('file', makeFile(type));
        const req = new Request('https://x.com', { method: 'POST', body: fd });
        const res = await POST(req, { params: Promise.resolve({}) });
        expect(res.status, `${type} should be accepted`).toBe(201);
      }
    });

    it('uploads to Cloudinary and creates a media file', async () => {
      cloudinary.uploader.upload.mockResolvedValue({
        public_id: 'pid',
        url: 'u',
        secure_url: 'su',
        format: 'jpg',
        width: 800,
        height: 600,
        bytes: 12345,
      });
      prisma.mediaFile.findUnique.mockReset();
      prisma.mediaFile.findUnique.mockResolvedValue(null);
      const fd = new FormData();
      fd.append('file', makeFile('image/jpeg'));
      const req = new Request('https://x.com', { method: 'POST', body: fd });
      await POST(req, { params: Promise.resolve({}) });
      expect(cloudinary.uploader.upload).toHaveBeenCalled();
      expect(prisma.mediaFile.create).toHaveBeenCalled();
    });

    it('returns 200 (not 201) when media file already exists', async () => {
      cloudinary.uploader.upload.mockResolvedValue({
        public_id: 'pid',
        url: 'u',
        secure_url: 'su',
        format: 'jpg',
      });
      prisma.mediaFile.findUnique.mockResolvedValueOnce(MEDIA);
      const fd = new FormData();
      fd.append('file', makeFile('image/jpeg'));
      const req = new Request('https://x.com', { method: 'POST', body: fd });
      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
    });

    it('returns 502 when Cloudinary upload fails', async () => {
      cloudinary.uploader.upload.mockRejectedValueOnce(new Error('cloudinary down'));
      const fd = new FormData();
      fd.append('file', makeFile('image/jpeg'));
      const req = new Request('https://x.com', { method: 'POST', body: fd });
      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(502);
    });
  });

  describe('DELETE', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const req = new Request('https://x.com?publicId=pid', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
    });

    it('returns 400 when publicId is missing', async () => {
      const req = new Request('https://x.com', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(400);
    });

    it('returns 404 when media not found', async () => {
      prisma.mediaFile.findUnique.mockResolvedValueOnce(null);
      const req = new Request('https://x.com?publicId=missing', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(404);
    });

    it('returns 200 on success', async () => {
      const req = new Request('https://x.com?publicId=pid', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('pid', { resource_type: 'image' });
      expect(prisma.mediaFile.delete).toHaveBeenCalledWith({ where: { publicId: 'pid' } });
    });

    it('returns 502 when Cloudinary delete fails', async () => {
      cloudinary.uploader.destroy.mockRejectedValueOnce(new Error('cloudinary down'));
      const req = new Request('https://x.com?publicId=pid', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(502);
    });
  });
});
