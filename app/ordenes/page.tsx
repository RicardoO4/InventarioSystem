import Link from "next/link";
import { ArrowDownToLineIcon, ClipboardListIcon, PlusIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
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
import { cn } from "@/lib/cn";
import { esAdmin } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { getOrdenes } from "@/lib/data";

type EstadoTab = "todas" | "pendiente" | "recibida" | "parcial" | "cancelada";

const tabs: { key: EstadoTab; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "pendiente", label: "Pendientes" },
  { key: "recibida", label: "Recibidas" },
  { key: "parcial", label: "Parciales" },
  { key: "cancelada", label: "Canceladas" },
];

export default async function OrdenesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const active: EstadoTab =
    estado === "pendiente" ||
    estado === "recibida" ||
    estado === "parcial" ||
    estado === "cancelada"
      ? estado
      : "todas";

  const [ordenes, admin] = await Promise.all([getOrdenes(), esAdmin()]);

  const filtradas =
    active === "todas"
      ? ordenes
      : ordenes.filter((o) =>
          active === "parcial" ? o.estado === "recibida_parcial" : o.estado === active
        );
  const ordenadas = [...filtradas].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div>
      <PageHeader
        title="Órdenes de compra"
        description="Gestiona las órdenes enviadas a tus proveedores."
        actions={
          admin ? (
            <ButtonLink href="/ordenes/nuevo">
              <PlusIcon className="h-4 w-4" />
              Nueva orden
            </ButtonLink>
          ) : undefined
        }
      />

      <div className="mb-4 flex items-center gap-1 border-b border-zinc-200">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "todas" ? "/ordenes" : `/ordenes?estado=${tab.key}`}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active === tab.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            )}
          >
            {tab.label}
          </Link>
        ))}
        <span className="ml-auto hidden pb-2 text-sm text-zinc-500 sm:block">
          {ordenadas.length} órdenes
        </span>
      </div>

      {ordenadas.length === 0 ? (
        <EmptyState
          icon={<ClipboardListIcon className="h-5 w-5" />}
          title="Sin órdenes"
          description="Aún no hay órdenes de compra registradas."
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <Tr>
                <Th>Folio</Th>
                <Th>Proveedor</Th>
                <Th>Fecha</Th>
                <Th>Estado</Th>
                <Th className="text-right">Partidas</Th>
                <Th className="text-right">Total</Th>
                <Th className="w-10" />
              </Tr>
            </THead>
            <TBody>
              {ordenadas.map((orden) => (
                <Tr key={orden.id}>
                  <Td>
                    <Link
                      href={`/ordenes/${orden.id}`}
                      className="font-mono text-xs font-medium text-zinc-500 hover:text-indigo-600"
                    >
                      {orden.folio}
                    </Link>
                  </Td>
                  <Td className="font-medium text-zinc-900">
                    <Link href={`/proveedores/${orden.proveedorId}`} className="hover:text-indigo-600">
                      {orden.proveedor}
                    </Link>
                  </Td>
                  <Td className="text-zinc-500">{formatDate(orden.fecha)}</Td>
                  <Td>
                    <OrdenEstadoBadge estado={orden.estado} />
                  </Td>
                  <Td className="text-right text-zinc-900">{orden.partidas}</Td>
                  <Td className="text-right font-medium text-zinc-900">{formatCurrency(orden.total)}</Td>
                  <Td className="text-right">
                    {orden.estado === "pendiente" || orden.estado === "recibida_parcial" ? (
                      <ButtonLink
                        href={`/movimientos/entradas/recibir/${orden.id}`}
                        variant="secondary"
                        size="sm"
                      >
                        <ArrowDownToLineIcon className="h-3.5 w-3.5" />
                        Recibir
                      </ButtonLink>
                    ) : (
                      <span className="text-xs text-zinc-300">—</span>
                    )}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      )}

      <p className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
        <ArrowDownToLineIcon className="h-3.5 w-3.5" />
        Usa el botón &quot;Recibir&quot; en una orden pendiente para registrar la mercancía que llegó.
      </p>
    </div>
  );
}
