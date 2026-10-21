import Link from "next/link";
import {
  ArrowDownToLineIcon,
  ArrowLeftRightIcon,
  ArrowUpFromLineIcon,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
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
import { formatDate } from "@/lib/format";
import { getMovimientos } from "@/lib/data";

type Tab = "todos" | "entrada" | "salida";

const tabs: { key: Tab; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "entrada", label: "Entradas" },
  { key: "salida", label: "Salidas" },
];

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const active: Tab = tipo === "entrada" || tipo === "salida" ? tipo : "todos";

  const movimientos = await getMovimientos();

  const filtrados = active === "todos" ? movimientos : movimientos.filter((m) => m.tipo === active);
  const ordenados = [...filtrados].sort((a, b) => b.fecha.localeCompare(a.fecha));

  const entradas = movimientos.filter((m) => m.tipo === "entrada");
  const salidas = movimientos.filter((m) => m.tipo === "salida");

  return (
    <div>
      <PageHeader
        title="Entradas y salidas"
        description="Controla todos los movimientos de inventario."
        actions={
          <>
            <ButtonLink href="/movimientos/entradas">
              <ArrowDownToLineIcon className="h-4 w-4" />
              Entradas
            </ButtonLink>
            <ButtonLink href="/movimientos/salidas" variant="secondary">
              <ArrowUpFromLineIcon className="h-4 w-4" />
              Salidas
            </ButtonLink>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total de movimientos"
          value={String(movimientos.length)}
          icon={<ArrowLeftRightIcon className="h-5 w-5" />}
          tone="indigo"
        />
        <StatCard
          label="Entradas"
          value={String(entradas.length)}
          icon={<ArrowDownToLineIcon className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard
          label="Salidas"
          value={String(salidas.length)}
          icon={<ArrowUpFromLineIcon className="h-5 w-5" />}
          tone="amber"
        />
      </div>

      <div className="mb-4 flex items-center gap-1 border-b border-zinc-200">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "todos" ? "/movimientos" : `/movimientos?tipo=${tab.key}`}
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
          {ordenados.length} movimientos
        </span>
      </div>

      {ordenados.length === 0 ? (
        <EmptyState
          icon={<ArrowLeftRightIcon className="h-5 w-5" />}
          title="Sin movimientos"
          description="No hay movimientos de este tipo. Registra el primero."
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <Tr>
                <Th>Folio</Th>
                <Th>Tipo</Th>
                <Th>Producto</Th>
                <Th>Fecha</Th>
                <Th>Responsable</Th>
                <Th className="text-right">Cantidad</Th>
                <Th>Contraparte</Th>
              </Tr>
            </THead>
            <TBody>
              {ordenados.map((movimiento) => (
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
                  <Td className="font-medium text-zinc-900">
                    <Link href={`/catalogo/${movimiento.productoId}`} className="hover:text-indigo-600">
                      {movimiento.producto}
                    </Link>
                  </Td>
                  <Td className="text-zinc-500">{formatDate(movimiento.fecha)}</Td>
                  <Td className="text-zinc-500">{movimiento.responsable}</Td>
                  <Td className="text-right font-medium text-zinc-900">
                    {movimiento.cantidad} {movimiento.unidad}
                  </Td>
                  <Td className="text-zinc-500">{movimiento.contraparte}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
