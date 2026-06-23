import { Suspense } from 'react';

import { Activity } from 'lucide-react';

import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { PageHeader } from '@/components/admin/PageHeader';

export default function AnalyticsPage() {
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrowIcon={<Activity size={11} />}
        eyebrow="Sistema · Analytics"
        title="Analytics"
        description="Visitas, mensajes y eventos del sitio. La fuente principal sigue siendo GA4 (este panel refleja el tracking interno vía PageViewTracker)."
      />
      <Suspense fallback={null}>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  );
}
