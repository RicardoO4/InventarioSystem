import { ArrowLeftIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { ProductoForm } from "@/components/catalogo/producto-form";
import { requireAdmin } from "@/lib/auth";
import { getCategorias } from "@/lib/data";

export default async function NuevoProductoPage() {
  await requireAdmin();
  const categorias = await getCategorias();

  return (
    <div>
      <div className="mb-5">
        <ButtonLink href="/catalogo" variant="ghost" size="sm" className="mb-3 -ml-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Volver al catálogo
        </ButtonLink>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Nuevo producto</h1>
        <p className="mt-1 text-sm text-zinc-500">Registra un nuevo producto en el catálogo.</p>
      </div>

      <ProductoForm categorias={categorias} />
    </div>
  );
}
