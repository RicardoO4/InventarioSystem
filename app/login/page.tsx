import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthCard
      titulo="Inicia sesión"
      descripcion="Accede con tu cuenta para administrar el inventario."
    >
      <LoginForm
        errorInicial={
          error === "enlace-invalido"
            ? "El enlace no es válido o ya expiró. Solicita uno nuevo."
            : undefined
        }
      />
    </AuthCard>
  );
}
