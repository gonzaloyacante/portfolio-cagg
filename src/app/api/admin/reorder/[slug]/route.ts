import { NextResponse } from 'next/server';

import { z } from 'zod';

import { withAdminAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { revalidateLanding } from '@/lib/revalidate';

const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

type UpdateableModel = {
  update: (args: { where: { id: string }; data: { order: number } }) => Promise<unknown>;
};

const SLUG_TO_MODEL: Record<string, UpdateableModel> = {
  brands: prisma.brand as unknown as UpdateableModel,
  experience: prisma.experienceCard as unknown as UpdateableModel,
  process: prisma.processStep as unknown as UpdateableModel,
  services: prisma.service as unknown as UpdateableModel,
  projects: prisma.project as unknown as UpdateableModel,
  results: prisma.resultItem as unknown as UpdateableModel,
  testimonials: prisma.testimonial as unknown as UpdateableModel,
  timeline: prisma.timelineItem as unknown as UpdateableModel,
  faqs: prisma.faqItem as unknown as UpdateableModel,
};

export const PUT = withAdminAuth(async (req, { params }) => {
  const { slug } = await params;
  const model = SLUG_TO_MODEL[slug];
  if (!model) {
    return NextResponse.json({ error: 'Unknown collection' }, { status: 404 });
  }
  const body = await req.json().catch(() => null);
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', issues: parsed.error.issues },
      { status: 422 }
    );
  }
  const { ids } = parsed.data;

  // Update each item's order field. Done sequentially (not in a $transaction
  // array) so the typed `update` calls are accepted by TS.
  try {
    for (let i = 0; i < ids.length; i += 1) {
      const id = ids[i];
      if (!id) continue;
      await model.update({ where: { id }, data: { order: i } });
    }
    revalidateLanding();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Reorder failed' }, { status: 500 });
  }
});
