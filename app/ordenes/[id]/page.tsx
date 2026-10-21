import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDownToLineIcon, ArrowLeftIcon, PackageIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CancelarOrdenButton } from "@/components/ordenes/cancelar-orden-button";
import { EmptyState } from "@/components/ui/empty-state";
import { OrdenEstadoBadge } from "@/components/ordenes/orden-estado-badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableContainer,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { esAdmin } from "@/lib/auth";
import { getOrden, getOrdenPartidas } from "@/lib/data";

export default async function OrdenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [orden, partidas, admin] = await Promise.all([
    getOrden(id),
    getOrdenPartidas(id),
    esAdmin(),
  ]);

  if (!orden) {
    notFound();
  }

  const esPendiente = orden.estado === "pendiente" || orden.estado === "recibida_parcial";
  const faltanteTotal = partidas.reduce(
    (sum, p) => sum + Math.max(0, p.cantidad - p.cantidadRecibida),
    0
  );

  return (
    <div>
      <div className="mb-5">
        <ButtonLink href="/ordenes" variant="ghost" size="sm" className="mb-3 -ml-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a órdenes
        </ButtonLink>
        <PageHeader
          title={`Orden ${orden.folio}`}
          description={`Emitida el ${formatDate(orden.fecha)} · ${orden.proveedor}`}
          actions={
            esPendiente && (
              <div className="flex items-center gap-2">
                <ButtonLink href={`/movimientos/entradas/recibir/${orden.id}`}>
                  <ArrowDownToLineIcon className="h-4 w-4" />
                  Recibir mercancía
                </ButtonLink>
                {admin && <CancelarOrdenButton ordenId={orden.id} folio={orden.folio} />}
              </div>
            )
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Datos de la orden</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Estado</dt>
                <dd>
                  <OrdenEstadoBadge estado={orden.estado} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Proveedor</dt>
                <dd className="text-right font-medium text-zinc-900">
                  {orden.proveedorId ? (
                    <Link
                      href={`/proveedores/${orden.proveedorId}`}
                      className="hover:text-indigo-600"
                    >
                      {orden.proveedor}
                    </Link>
                  ) : (
                    orden.proveedor
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Fecha</dt>
                <dd className="font-medium text-zinc-900">{formatDate(orden.fecha)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Partidas</dt>
                <dd className="font-medium text-zinc-900">{orden.partidas}</dd>
              </div>
              {esPendiente && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-500">Por recibir</dt>
                  <dd
                    className={
                      faltanteTotal > 0
                        ? "font-medium text-amber-600"
                        : "font-medium text-emerald-600"
                    }
                  >
                    {faltanteTotal}
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-3">
                <dt className="text-zinc-500">Total</dt>
                <dd className="text-base font-semibold text-zinc-900">{formatCurrency(orden.total)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Partidas de la orden</CardTitle>
              <CardDescription>Productos solicitados al proveedor</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {partidas.length === 0 ? (
              <EmptyState
                icon={<PackageIcon className="h-5 w-5" />}
                title="Sin partidas"
                description="Esta orden no tiene productos registrados."
              />
            ) : (
              <TableContainer>
                <Table>
                  <THead>
                    <Tr>
                      <Th>Producto</Th>
                      <Th>Proveedor</Th>
                      <Th className="text-right">Cantidad</Th>
                      {esPendiente && (
                        <>
                          <Th className="text-right">Recibido</Th>
                          <Th className="text-right">Faltante</Th>
                        </>
                      )}
                      <Th className="text-right">Precio</Th>
                      <Th className="text-right">Subtotal</Th>
                    </Tr>
                  </THead>
                  <TBody>
                    {partidas.map((partida) => (
                      <Tr key={partida.id}>
                        <Td className="font-medium text-zinc-900">
                          {partida.productoId ? (
                            <Link
                              href={`/catalogo/${partida.productoId}`}
                              className="hover:text-indigo-600"
                            >
                              {partida.producto}
                            </Link>
                          ) : (
                            partida.producto
                          )}
                        </Td>
                        <Td className="text-zinc-500">
                          {partida.proveedorId ? (
                            <Link
                              href={`/proveedores/${partida.proveedorId}`}
                              className="hover:text-indigo-600"
                            >
                              {partida.proveedor}
                            </Link>
                          ) : (
                            partida.proveedor
                          )}
                        </Td>
                        <Td className="text-right text-zinc-900">{partida.cantidad}</Td>
                        {esPendiente && (
                          <>
                            <Td className="text-right text-zinc-500">
                              {partida.cantidadRecibida}
                            </Td>
                            <Td className="text-right">
                              {partida.cantidad - partida.cantidadRecibida > 0 ? (
                                <span className="font-medium text-amber-600">
                                  {partida.cantidad - partida.cantidadRecibida}
                                </span>
                              ) : (
                                <span className="text-emerald-600">Completo</span>
                              )}
                            </Td>
                          </>
                        )}
                        <Td className="text-right text-zinc-500">{formatCurrency(partida.precio)}</Td>
                        <Td className="text-right font-medium text-zinc-900">
                          {formatCurrency(partida.subtotal)}
                        </Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
