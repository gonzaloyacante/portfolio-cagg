import AuthLayout from '@/components/admin/AuthLayout';
import ResetPasswordForm from '@/components/admin/ResetPasswordForm';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
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
