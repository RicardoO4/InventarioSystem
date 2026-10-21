import { notFound } from "next/navigation";
import { CheckCircleIcon, XIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { RecibirMercanciaForm } from "@/components/movimientos/recibir-mercancia-form";
import { getOrden, getOrdenPartidas, getProductos } from "@/lib/data";

export default async function RecibirMercanciaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [orden, partidas, productos] = await Promise.all([
    getOrden(id),
    getOrdenPartidas(id),
    getProductos(),
  ]);

  if (!orden) {
    notFound();
  }

  if (orden.estado === "recibida") {
    return (
      <div className="mx-auto max-w-md py-16">
        <EmptyState
          icon={<CheckCircleIcon className="h-5 w-5" />}
          title="Orden ya recibida"
          description={`La orden ${orden.folio} ya fue recibida por completo.`}
          action={
            <ButtonLink href={`/ordenes/${orden.id}`} variant="secondary">
              Ver orden
            </ButtonLink>
          }
        />
      </div>
    );
  }

  if (orden.estado === "cancelada") {
    return (
      <div className="mx-auto max-w-md py-16">
        <EmptyState
          icon={<XIcon className="h-5 w-5" />}
          title="Orden cancelada"
          description={`La orden ${orden.folio} fue cancelada y no puede recibirse.`}
          action={
            <ButtonLink href={`/ordenes/${orden.id}`} variant="secondary">
              Ver orden
            </ButtonLink>
          }
        />
      </div>
    );
  }

  return (
    <RecibirMercanciaForm
      orden={{
        id: orden.id,
        folio: orden.folio,
        proveedor: orden.proveedor,
        fecha: orden.fecha,
      }}
      partidas={partidas}
      productos={productos}
    />
  );
}
