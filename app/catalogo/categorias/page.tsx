import { PlusIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { CategoriaGrid } from "@/components/categorias/categoria-grid";
import { esAdmin } from "@/lib/auth";
import { getCategorias } from "@/lib/data";

export default async function CategoriasPage() {
  const [categorias, admin] = await Promise.all([getCategorias(), esAdmin()]);

  return (
    <div>
      <PageHeader
        title="Categorías"
        description="Organiza tu catálogo en categorías para un mejor control."
        actions={
          admin ? (
            <ButtonLink href="/catalogo/categorias/nueva">
              <PlusIcon className="h-4 w-4" />
              Nueva categoría
            </ButtonLink>
          ) : undefined
        }
      />

      <CategoriaGrid categorias={categorias} />
    </div>
  );
}
