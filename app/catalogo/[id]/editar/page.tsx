import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { ProductoForm } from "@/components/catalogo/producto-form";
import { requireAdmin } from "@/lib/auth";
import { getCategorias, getProductos } from "@/lib/data";

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [categorias, productos] = await Promise.all([getCategorias(), getProductos()]);
  const producto = productos.find((p) => p.id === id);

  if (!producto) {
    notFound();
  }

  return (
    <div>
      <div className="mb-5">
        <ButtonLink
          href={`/catalogo/${producto.id}`}
          variant="ghost"
          size="sm"
          className="mb-3 -ml-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver al producto
        </ButtonLink>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Editar producto</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Actualiza la información de {producto.nombre}.
        </p>
      </div>

      <ProductoForm categorias={categorias} producto={producto} />
    </div>
  );
}
