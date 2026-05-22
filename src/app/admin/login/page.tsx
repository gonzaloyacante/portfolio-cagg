import AuthLayout from '@/components/admin/AuthLayout';
import LoginForm from '@/components/admin/LoginForm';
import TotpForm from '@/components/admin/TotpForm';

interface PageProps {
  searchParams: Promise<{ step?: string }>;
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { step } = await searchParams;
  const is2fa = step === '2fa';

  return (
    <AuthLayout
      title={is2fa ? 'Verificación en dos pasos' : 'Acceso administrativo'}
      subtitle={is2fa ? 'Admin · 2FA' : 'Admin · Inicio de sesión'}
      backHref="/"
      backLabel="Volver al sitio"
    >
      {is2fa ? <TotpForm /> : <LoginForm />}
    </AuthLayout>
  );
}
