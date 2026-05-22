import AuthLayout from '@/components/admin/AuthLayout';
import ForgotPasswordForm from '@/components/admin/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Admin · Recuperación"
      backHref="/admin/login"
      backLabel="Volver al inicio de sesión"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
