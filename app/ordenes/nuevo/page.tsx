import { ArrowLeftIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { NuevaOrdenForm } from "@/components/ordenes/nueva-orden-form";
import { requireAdmin } from "@/lib/auth";
import { getProductos, getProveedores } from "@/lib/data";

export default async function NuevaOrdenPage({
  searchParams,
}: {
  searchParams: Promise<{ proveedor?: string }>;
}) {
  await requireAdmin();
  const { proveedor } = await searchParams;
  const [proveedores, productos] = await Promise.all([getProveedores(), getProductos()]);

  return (
    <div>
      <div className="mb-5">
        <ButtonLink href="/ordenes" variant="ghost" size="sm" className="mb-3 -ml-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a órdenes
        </ButtonLink>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Nueva orden de compra
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Agrega las partidas de la orden. Todas las partidas deben ser del mismo proveedor.
        </p>
      </div>

      <NuevaOrdenForm
        proveedores={proveedores}
        productos={productos}
        proveedorInicialId={proveedor}
      />
    </div>
  );
}
