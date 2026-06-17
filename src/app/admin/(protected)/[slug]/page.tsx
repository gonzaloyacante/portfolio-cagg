import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';

import { CollectionPage } from '@/components/admin/CollectionPage';
import { COLLECTION_CONFIG, SUMMARIZERS } from '@/constants/admin-config';
import type { CollectionItem } from '@/hooks/use-collection';
import { prisma } from '@/lib/prisma';

type Props = { params: Promise<{ slug: string }> };

async function fetchItems(slug: string): Promise<Array<Record<string, unknown> & { id: string }>> {
  const order = { orderBy: { order: 'asc' } } as const;
  switch (slug) {
    case 'brands':
      return await prisma.brand.findMany(order);
    case 'experience':
      return await prisma.experienceCard.findMany(order);
    case 'process':
      return await prisma.processStep.findMany(order);
    case 'services':
      return await prisma.service.findMany(order);
    case 'projects':
      return await prisma.project.findMany(order);
    case 'results':
      return await prisma.resultItem.findMany(order);
    case 'testimonials':
      return await prisma.testimonial.findMany(order);
    case 'timeline':
      return await prisma.timelineItem.findMany(order);
    case 'faqs':
      return await prisma.faqItem.findMany(order);
    default:
      return [];
  }
}

async function CollectionContent({ slug }: { slug: string }) {
  await connection();
  const config = COLLECTION_CONFIG[slug];
  const summarize = SUMMARIZERS[slug];
  if (!config || !summarize) notFound();
  const rawItems = await fetchItems(slug);
  const initialItems: CollectionItem[] = rawItems.map((item) => ({
    ...item,
    _summary: summarize(item),
  }));
  return <CollectionPage slug={slug} config={config} initialItems={initialItems} />;
}

export default async function CollectionRoute({ params }: Props) {
  const { slug } = await params;
  return (
    <Suspense fallback={null}>
      <CollectionContent slug={slug} />
    </Suspense>
  );
}
