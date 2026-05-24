import { Suspense } from 'react';

import AuthLayout from '@/components/admin/AuthLayout';
import ResetPasswordForm from '@/components/admin/ResetPasswordForm';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

async function ResetContent({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  return (
    <AuthLayout
      title="Nueva contraseña"
      subtitle="Admin · Restablecimiento"
      backHref="/admin/login"
      backLabel="Volver al inicio de sesión"
    >
      <ResetPasswordForm token={token ?? ''} />
    </AuthLayout>
  );
}

export default function ResetPasswordPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={null}>
      <ResetContent searchParams={searchParams} />
    </Suspense>
  );
}
