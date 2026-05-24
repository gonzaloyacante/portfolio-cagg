import { NextResponse } from 'next/server';

import { withAdminAuth } from '@/lib/auth-guard';
import { cloudinary } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

const FOLDER = 'portfolio-cag';
const PAGE_SIZE = 24;

export const GET = withAdminAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const skip = (page - 1) * PAGE_SIZE;

  const [items, total] = await Promise.all([
    prisma.mediaFile.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.mediaFile.count(),
  ]);

  return NextResponse.json({ items, total, page, pageSize: PAGE_SIZE });
});

export const POST = withAdminAuth(async (req) => {
  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });

  const file = formData.get('file');
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const MAX_BYTES = 10 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 413 });
  }

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

  let result: {
    public_id: string;
    url: string;
    secure_url: string;
    format: string;
    width?: number;
    height?: number;
    bytes?: number;
  };

  try {
    result = await cloudinary.uploader.upload(base64, {
      folder: FOLDER,
      resource_type: 'image',
    });
  } catch {
    return NextResponse.json({ error: 'Upload to Cloudinary failed' }, { status: 502 });
  }

  const existing = await prisma.mediaFile.findUnique({ where: { publicId: result.public_id } });
  if (existing) return NextResponse.json(existing, { status: 200 });

  const media = await prisma.mediaFile.create({
    data: {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      format: result.format,
      width: result.width ?? null,
      height: result.height ?? null,
      bytes: result.bytes ?? null,
      folder: FOLDER,
    },
  });

  return NextResponse.json(media, { status: 201 });
});

export const DELETE = withAdminAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const publicId = searchParams.get('publicId');
  if (!publicId) return NextResponse.json({ error: 'Missing publicId' }, { status: 400 });

  const record = await prisma.mediaFile.findUnique({ where: { publicId } });
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch {
    return NextResponse.json({ error: 'Cloudinary delete failed' }, { status: 502 });
  }

  await prisma.mediaFile.delete({ where: { publicId } });
  return NextResponse.json({ ok: true });
});
