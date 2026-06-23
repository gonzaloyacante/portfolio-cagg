import { NextResponse } from 'next/server';

import { withAdminAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

type DailyBucket = { date: string; views: number };
type PathBucket = { path: string; views: number };
type LocaleBucket = { locale: string; views: number };

/**
 * Aggregated analytics for the admin dashboard.
 *
 * Returns:
 *  - total views (all time, last 7d, last 30d)
 *  - daily views for the last 30 days
 *  - top 10 paths by views (last 30d)
 *  - views by locale (last 30d)
 *  - messages count (total + unread)
 *  - csp reports count (last 7d)
 *  - GA4 ID (from env, null if not set)
 *
 * All numbers come from the `page_views` table. CspReport and ContactMessage
 * are joined for cross-section context.
 */
export const GET = withAdminAuth(async () => {
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;
  const sevenDaysAgo = new Date(now.getTime() - 7 * day);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * day);

  const [
    totalAllTime,
    totalLast7d,
    totalLast30d,
    daily,
    topPaths,
    byLocale,
    messagesTotal,
    messagesUnread,
    cspLast7d,
  ] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.$queryRaw<Array<{ date: string; views: bigint }>>`
      SELECT
        to_char("createdAt"::date, 'YYYY-MM-DD') AS date,
        COUNT(*)::bigint AS views
      FROM "page_views"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY "createdAt"::date
      ORDER BY date ASC
    `,
    prisma.pageView.groupBy({
      by: ['path'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { _all: true },
      orderBy: { _count: { path: 'desc' } },
      take: 10,
    }),
    prisma.pageView.groupBy({
      by: ['locale'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { _all: true },
    }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.cspReport.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ]);

  const dailyBuckets: DailyBucket[] = daily.map((r) => ({
    date: r.date,
    views: Number(r.views),
  }));

  const topPathBuckets: PathBucket[] = topPaths.map((p) => ({
    path: p.path,
    views: p._count._all,
  }));

  const localeBuckets: LocaleBucket[] = byLocale.map((l) => ({
    locale: l.locale,
    views: l._count._all,
  }));

  return NextResponse.json({
    totals: {
      allTime: totalAllTime,
      last7d: totalLast7d,
      last30d: totalLast30d,
    },
    daily: dailyBuckets,
    topPaths: topPathBuckets,
    byLocale: localeBuckets,
    messages: { total: messagesTotal, unread: messagesUnread },
    cspReportsLast7d: cspLast7d,
    ga4Id: process.env.NEXT_PUBLIC_GA4_ID ?? null,
  });
});
