import { PackageIcon, PlusIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ProductTable } from "@/components/catalogo/product-table";
import { esAdmin } from "@/lib/auth";
import { getProductos } from "@/lib/data";

export default async function CatalogoPage() {
  const [productos, admin] = await Promise.all([getProductos(), esAdmin()]);

  return (
    <div>
      <PageHeader
        title="Catálogo"
        description="Consulta y administra los productos de tu inventario."
        actions={
          admin ? (
            <ButtonLink href="/catalogo/nuevo">
              <PlusIcon className="h-4 w-4" />
              Nuevo producto
            </ButtonLink>
          ) : undefined
        }
      />

      <ProductTable productos={productos} />

      <p className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
        <PackageIcon className="h-3.5 w-3.5" />
        {admin
          ? "Crea y edita productos; el stock se ajusta con Entradas y Salidas."
          : "Consulta el catálogo; el stock se ajusta con Entradas y Salidas."}
      </p>
    </div>
  );
}
