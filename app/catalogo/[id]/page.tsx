import { notFound } from "next/navigation";
import {
  ArrowDownToLineIcon,
  ArrowLeftIcon,
  ArrowUpFromLineIcon,
  MapPinIcon,
  PackageIcon,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Barcode } from "@/components/ui/barcode";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { AccionesEstadoProducto } from "@/components/catalogo/acciones-estado-producto";
import { getPerfil } from "@/lib/auth";
import {
  Table,
  TableContainer,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { getMovimientos, getProductos } from "@/lib/data";

export default async function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productos = await getProductos();
  const producto = productos.find((p) => p.id === id);

  if (!producto) {
    notFound();
  }

  const [movimientos, perfil] = await Promise.all([getMovimientos(), getPerfil()]);
  const historial = movimientos
    .filter((m) => m.productoId === id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  const esAdmin = perfil?.rol === "admin";

  return (
    <div>
      <div className="mb-5">
        <ButtonLink href="/catalogo" variant="ghost" size="sm" className="mb-3 -ml-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Volver al catálogo
        </ButtonLink>
        <PageHeader
          title={producto.nombre}
          description={`SKU ${producto.sku} · ${producto.categoria}`}
          actions={
            <>
              {esAdmin && (
                <ButtonLink href={`/catalogo/${producto.id}/editar`}>Editar</ButtonLink>
              )}
              {esAdmin && (
                <AccionesEstadoProducto productoId={producto.id} estado={producto.estado} />
              )}
              <ButtonLink href="/movimientos/entradas" variant="secondary">
                Entradas
              </ButtonLink>
              <ButtonLink href="/movimientos/salidas" variant="secondary">
                Salidas
              </ButtonLink>
            </>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <PackageIcon className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle>Información del producto</CardTitle>
                  <CardDescription>
                    {producto.estado === "inactivo"
                      ? "Producto inactivo"
                      : producto.estado === "agotado"
                        ? "Sin existencias"
                        : "En catálogo"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-500">Stock disponible</dt>
                  <dd className="font-semibold text-zinc-900">
                    {formatNumber(producto.stock)} {producto.unidad}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-500">Stock mínimo</dt>
                  <dd className="font-medium text-zinc-900">
                    {formatNumber(producto.stockMinimo)} {producto.unidad}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-500">Precio de costo</dt>
                  <dd className="font-medium text-zinc-900">{formatCurrency(producto.precioCosto)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-500">Precio de venta</dt>
                  <dd className="font-medium text-zinc-900">{formatCurrency(producto.precioVenta)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-500">Margen</dt>
                  <dd className="font-medium text-emerald-600">
                    {formatCurrency(producto.precioVenta - producto.precioCosto)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-500">Estado</dt>
                  <dd>
                    <Badge
                      tone={
                        producto.estado === "inactivo"
                          ? "gray"
                          : producto.estado === "agotado"
                            ? "red"
                            : producto.stock <= producto.stockMinimo
                              ? "amber"
                              : "green"
                      }
                    >
                      {producto.estado === "inactivo"
                        ? "Inactivo"
                        : producto.estado === "agotado"
                          ? "Agotado"
                          : producto.stock <= producto.stockMinimo
                            ? "Stock bajo"
                            : "Activo"}
                    </Badge>
                  </dd>
                </div>
                <div className="flex items-center gap-2 border-t border-zinc-100 pt-3">
                  <MapPinIcon className="h-4 w-4 text-zinc-400" />
                  <dt className="text-zinc-500">Ubicación</dt>
                  <dd className="ml-auto font-medium text-zinc-900">{producto.ubicacion}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Código de barras</CardTitle>
              <CardDescription>
                {producto.codigoBarra ? "EAN-13 del producto" : "Generado desde el SKU"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Barcode
                  value={producto.codigoBarra || producto.sku}
                  format={producto.codigoBarra ? "ean13" : "code128"}
                  height={56}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Historial de movimientos</CardTitle>
              <CardDescription>Entradas y salidas registradas para este producto</CardDescription>
            </div>
          </CardHeader>
          {historial.length === 0 ? (
            <CardContent>
              <EmptyState
                icon={<ArrowDownToLineIcon className="h-5 w-5" />}
                title="Sin movimientos"
                description="Este producto aún no tiene movimientos registrados."
              />
            </CardContent>
          ) : (
            <TableContainer className="rounded-none border-x-0 border-b-0 shadow-none">
              <Table>
                <THead>
                  <Tr>
                    <Th>Folio</Th>
                    <Th>Tipo</Th>
                    <Th>Fecha</Th>
                    <Th className="text-right">Cantidad</Th>
                    <Th>Referencia</Th>
                  </Tr>
                </THead>
                <TBody>
                  {historial.map((movimiento) => (
                    <Tr key={movimiento.id}>
                      <Td className="font-mono text-xs font-medium text-zinc-500">{movimiento.folio}</Td>
                      <Td>
                        <Badge tone={movimiento.tipo === "entrada" ? "green" : "amber"}>
                          {movimiento.tipo === "entrada" ? (
                            <ArrowDownToLineIcon className="h-3 w-3" />
                          ) : (
                            <ArrowUpFromLineIcon className="h-3 w-3" />
                          )}
                          {movimiento.tipo === "entrada" ? "Entrada" : "Salida"}
                        </Badge>
                      </Td>
                      <Td className="text-zinc-500">{formatDate(movimiento.fecha)}</Td>
                      <Td className="text-right font-medium text-zinc-900">
                        {movimiento.cantidad} {movimiento.unidad}
                      </Td>
                      <Td className="text-zinc-500">{movimiento.referencia}</Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
