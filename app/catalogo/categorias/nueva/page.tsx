import { ArrowLeftIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { NuevaCategoriaForm } from "@/components/categorias/nueva-categoria-form";
import { requireAdmin } from "@/lib/auth";

export default async function NuevaCategoriaPage() {
  await requireAdmin();

  return (
    <div>
      <div className="mb-5">
        <ButtonLink href="/catalogo/categorias" variant="ghost" size="sm" className="mb-3 -ml-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a categorías
        </ButtonLink>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Nueva categoría</h1>
        <p className="mt-1 text-sm text-zinc-500">Crea una categoría para organizar tu catálogo.</p>
      </div>

      <NuevaCategoriaForm />
    </div>
  );
}
