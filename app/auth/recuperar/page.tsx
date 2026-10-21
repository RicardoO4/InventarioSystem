import { AuthCard } from "@/components/auth/auth-card";
import { RecuperarForm } from "@/components/auth/recuperar-form";

export default function RecuperarPage() {
  return (
    <AuthCard
      titulo="Recuperar contraseña"
      descripcion="Te enviaremos un enlace para restablecer tu contraseña."
    >
      <RecuperarForm />
    </AuthCard>
  );
}
