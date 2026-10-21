import { AuthCard } from "@/components/auth/auth-card";
import { NuevaContrasenaForm } from "@/components/auth/nueva-contrasena-form";

export default function NuevaContrasenaPage() {
  return (
    <AuthCard
      titulo="Nueva contraseña"
      descripcion="Define la contraseña de tu cuenta."
    >
      <NuevaContrasenaForm />
    </AuthCard>
  );
}
