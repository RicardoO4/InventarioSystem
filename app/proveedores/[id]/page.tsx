import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, TruckIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getOrdenes, getProveedores } from "@/lib/data";

export default async function ProveedorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [proveedores, ordenes, admin] = await Promise.all([
    getProveedores(),
    getOrdenes(),
    esAdmin(),
  ]);
  const proveedor = proveedores.find((p) => p.id === id);

  if (!proveedor) {
    notFound();
  }

  const ordenesDelProveedor = ordenes
    .filter((o) => o.proveedorId === id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div>
      <div className="mb-5">
        <ButtonLink href="/proveedores" variant="ghost" size="sm" className="mb-3 -ml-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a proveedores
        </ButtonLink>
        <PageHeader
          title={proveedor.nombre}
          description={proveedor.rfc}
          actions={
            admin ? (
              <ButtonLink href={`/ordenes/nuevo?proveedor=${proveedor.id}`}>
                Crear orden de compra
              </ButtonLink>
            ) : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                <TruckIcon className="h-5 w-5" />
              </span>
              <div>
                <CardTitle>Información de contacto</CardTitle>
                <CardDescription>Datos del proveedor</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Contacto</dt>
                <dd className="font-medium text-zinc-900">{proveedor.contacto}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Teléfono</dt>
                <dd className="font-medium text-zinc-900">{proveedor.telefono}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Correo</dt>
                <dd className="truncate font-medium text-zinc-900">{proveedor.correo}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-3">
                <dt className="text-zinc-500">RFC</dt>
                <dd className="font-mono text-xs font-medium text-zinc-900">{proveedor.rfc}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Tiempo de entrega</dt>
                <dd className="font-medium text-zinc-900">{proveedor.diasEntrega} días</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Órdenes de compra</CardTitle>
              <CardDescription>
                {ordenesDelProveedor.length} órdenes · {formatCurrency(proveedor.valorTotal)} en total
              </CardDescription>
            </div>
          </CardHeader>
          <TableContainer className="rounded-none border-x-0 border-b-0 shadow-none">
            <Table>
              <THead>
                <Tr>
                  <Th>Folio</Th>
                  <Th>Fecha</Th>
                  <Th>Estado</Th>
                  <Th className="text-right">Partidas</Th>
                  <Th className="text-right">Total</Th>
                </Tr>
              </THead>
              <TBody>
                {ordenesDelProveedor.map((orden) => (
                  <Tr key={orden.id}>
                    <Td>
                      <Link
                        href={`/ordenes/${orden.id}`}
                        className="font-mono text-xs font-medium text-zinc-500 hover:text-indigo-600"
                      >
                        {orden.folio}
                      </Link>
                    </Td>
                    <Td className="text-zinc-500">{formatDate(orden.fecha)}</Td>
                    <Td>
                      <OrdenEstadoBadge estado={orden.estado} />
                    </Td>
                    <Td className="text-right text-zinc-900">{orden.partidas}</Td>
                    <Td className="text-right font-medium text-zinc-900">{formatCurrency(orden.total)}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </TableContainer>
        </Card>
      </div>
    </div>
  );
}
