import { notFound } from 'next/navigation';

import { CollectionPage } from '@/components/admin/CollectionPage';
import { COLLECTION_CONFIG } from '@/constants/admin-config';
import type { CollectionItem } from '@/hooks/use-collection';
import { prisma } from '@/lib/prisma';

type Props = { params: Promise<{ slug: string }> };

async function fetchItems(slug: string): Promise<CollectionItem[]> {
  const order = { orderBy: { order: 'asc' } } as const;
  switch (slug) {
    case 'brands':
      return (await prisma.brand.findMany(order)) as CollectionItem[];
    case 'experience':
      return (await prisma.experienceCard.findMany(order)) as CollectionItem[];
    case 'process':
      return (await prisma.processStep.findMany(order)) as CollectionItem[];
    case 'services':
      return (await prisma.service.findMany(order)) as CollectionItem[];
    case 'projects':
      return (await prisma.project.findMany(order)) as CollectionItem[];
    case 'results':
      return (await prisma.resultItem.findMany(order)) as CollectionItem[];
    case 'testimonials':
      return (await prisma.testimonial.findMany(order)) as CollectionItem[];
    case 'timeline':
      return (await prisma.timelineItem.findMany(order)) as CollectionItem[];
    case 'faqs':
      return (await prisma.faqItem.findMany(order)) as CollectionItem[];
    default:
      return [];
  }
}

export default async function CollectionRoute({ params }: Props) {
  const { slug } = await params;
  const config = COLLECTION_CONFIG[slug];
  if (!config) notFound();

  const initialItems = await fetchItems(slug);

  return <CollectionPage slug={slug} config={config} initialItems={initialItems} />;
}
