import { ArrowLeftIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { NuevoProveedorForm } from "@/components/proveedores/nuevo-proveedor-form";
import { requireAdmin } from "@/lib/auth";

export default async function NuevoProveedorPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5">
        <ButtonLink href="/proveedores" variant="ghost" size="sm" className="mb-3 -ml-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a proveedores
        </ButtonLink>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Nuevo proveedor</h1>
        <p className="mt-1 text-sm text-zinc-500">Registra un nuevo proveedor en el sistema.</p>
      </div>

      <NuevoProveedorForm />
    </div>
  );
}
