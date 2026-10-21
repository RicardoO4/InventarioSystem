import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowDownToLineIcon,
  ArrowLeftRightIcon,
  ArrowUpFromLineIcon,
  BarChart3Icon,
  ChevronRightIcon,
  CircleDollarSignIcon,
  ClipboardListIcon,
  PackageIcon,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { formatCurrency, formatDate } from "@/lib/format";
import { getCategorias, getMovimientos, getOrdenes, getProductos } from "@/lib/data";
import type { Categoria } from "@/lib/types";

const DIAS_SEMANA = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const colores = ["#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#8b5cf6", "#ef4444"];

function fechasUltimosDias(n: number): string[] {
  const fechas: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    fechas.push(d.toISOString().slice(0, 10));
  }
  return fechas;
}

function etiquetaDiaCorto(fecha: string): string {
  return DIAS_SEMANA[new Date(`${fecha}T12:00:00`).getDay()];
}

function clavesMesesUltimos(n: number): string[] {
  const claves: string[] = [];
  const ahora = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    claves.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return claves;
}

function etiquetaMes(clave: string): string {
  const mes = Number(clave.slice(5, 7));
  return MESES[mes - 1];
}

function MiniBars({ datos, etiquetas }: { datos: number[]; etiquetas: string[] }) {
  const max = Math.max(...datos) || 1;
  return (
    <div className="flex h-full min-h-40 items-end gap-2">
      {datos.map((value, i) => (
        <div key={etiquetas[i] ?? i} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md bg-indigo-500"
              style={{ height: `${Math.round((value / max) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] font-medium text-zinc-400">{etiquetas[i]}</span>
        </div>
      ))}
    </div>
  );
}

function Barras({
  entradas,
  salidas,
  etiquetas,
}: {
  entradas: number[];
  salidas: number[];
  etiquetas: string[];
}) {
  const max = Math.max(...entradas, ...salidas) || 1;
  return (
    <div className="flex h-full min-h-36 items-end gap-3">
      {etiquetas.map((mes, i) => (
        <div key={mes + i} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end justify-center gap-1">
            <div
              className="w-3 rounded-t-sm bg-indigo-500"
              style={{ height: `${(entradas[i] / max) * 100}%` }}
            />
            <div
              className="w-3 rounded-t-sm bg-amber-500"
              style={{ height: `${(salidas[i] / max) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-medium text-zinc-400">{mes}</span>
        </div>
      ))}
    </div>
  );
}

function Donut({ categorias }: { categorias: Categoria[] }) {
  const total = categorias.reduce((acc, c) => acc + c.valor, 0) || 1;

  const segments = categorias.reduce<Array<{ nombre: string; valor: number; pct: number; offset: number }>>(
    (list, c) => {
      const pct = (c.valor / total) * 100;
      const prev = list[list.length - 1];
      const offset = prev ? prev.offset + prev.pct : 0;
      return [...list, { nombre: c.nombre, valor: c.valor, pct, offset }];
    },
    []
  );

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <svg viewBox="0 0 100 100" className="h-44 w-44 shrink-0 -rotate-90">
        <circle cx="50" cy="50" r="15.9155" fill="none" stroke="#f4f4f5" strokeWidth="6.4" />
        {segments.map((seg, i) => (
          <circle
            key={seg.nombre}
            cx="50"
            cy="50"
            r="15.9155"
            fill="none"
            stroke={colores[i % colores.length]}
            strokeWidth="6.4"
            strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
            strokeDashoffset={-seg.offset}
          />
        ))}
      </svg>
      <ul className="w-full space-y-2.5">
        {segments.map((seg, i) => (
          <li key={seg.nombre} className="flex items-center gap-3 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: colores[i % colores.length] }}
            />
            <span className="min-w-0 flex-1 truncate font-medium text-zinc-700">{seg.nombre}</span>
            <span className="text-zinc-500">{seg.pct.toFixed(1)}%</span>
            <span className="w-24 text-right font-medium text-zinc-900">{formatCurrency(seg.valor)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function DashboardPage() {
  const [movimientos, ordenes, productos] = await Promise.all([
    getMovimientos(),
    getOrdenes(),
    getProductos(),
  ]);
  const categorias = await getCategorias(productos);

  const valorCosto = productos.reduce((acc, p) => acc + p.stock * p.precioCosto, 0);
  const valorVenta = productos.reduce((acc, p) => acc + p.stock * p.precioVenta, 0);
  const margen = valorVenta > 0 ? ((valorVenta - valorCosto) / valorVenta) * 100 : 0;
  const totalValor = categorias.reduce((acc, c) => acc + c.valor, 0);
  const pendientes = ordenes.filter((o) => o.estado === "pendiente");
  const recientes = [...movimientos]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 5);
  const stockBajo = productos
    .filter((p) => p.stock <= p.stockMinimo)
    .sort((a, b) => a.stock / a.stockMinimo - b.stock / b.stockMinimo);

  const entradas = movimientos.filter((m) => m.tipo === "entrada").length;
  const salidas = movimientos.filter((m) => m.tipo === "salida").length;

  const fechasSemana = fechasUltimosDias(7);
  const dias = fechasSemana.map(etiquetaDiaCorto);
  const semana = fechasSemana.map((f) => movimientos.filter((m) => m.fecha === f).length);

  const clavesMeses = clavesMesesUltimos(8);
  const meses = clavesMeses.map(etiquetaMes);
  const entradasSerie = clavesMeses.map(
    (clave) => movimientos.filter((m) => m.tipo === "entrada" && m.fecha.startsWith(clave)).length
  );
  const salidasSerie = clavesMeses.map(
    (clave) => movimientos.filter((m) => m.tipo === "salida" && m.fecha.startsWith(clave)).length
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Panel"
        description="Resumen del estado de tu inventario al día de hoy."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Productos en catálogo"
          value={String(productos.length)}
          hint={`${categorias.length} categorías`}
          icon={<PackageIcon className="h-5 w-5" />}
          tone="indigo"
        />
        <StatCard
          label="Valor del inventario"
          value={formatCurrency(valorCosto)}
          hint="a precio de costo"
          icon={<CircleDollarSignIcon className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard
          label="Valor a precio de venta"
          value={formatCurrency(valorVenta)}
          hint="precio de venta"
          icon={<BarChart3Icon className="h-5 w-5" />}
          tone="sky"
        />
        <StatCard
          label="Margen bruto potencial"
          value={`${margen.toFixed(1)}%`}
          hint="sobre valor de venta"
          icon={<CircleDollarSignIcon className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label="Movimientos del mes"
          value={String(movimientos.length)}
          hint={`${entradas} entradas · ${salidas} salidas`}
          icon={<ArrowLeftRightIcon className="h-5 w-5" />}
          tone="indigo"
        />
        <StatCard
          label="Órdenes pendientes"
          value={String(pendientes.length)}
          hint={formatCurrency(pendientes.reduce((acc, o) => acc + o.total, 0))}
          icon={<ClipboardListIcon className="h-5 w-5" />}
          tone="sky"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <div>
              <CardTitle>Movimientos de la semana</CardTitle>
              <CardDescription>Entradas y salidas registradas (últimos 7 días)</CardDescription>
            </div>
            <Badge tone="indigo">Últimos 7 días</Badge>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <MiniBars datos={semana} etiquetas={dias} />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div>
              <CardTitle>Entradas vs salidas</CardTitle>
              <CardDescription>Movimientos por mes (últimos 8 meses)</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" /> Entradas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" /> Salidas
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <Barras entradas={entradasSerie} salidas={salidasSerie} etiquetas={meses} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <div>
              <CardTitle>Valor por categoría</CardTitle>
              <CardDescription>Distribución del valor en inventario</CardDescription>
            </div>
            <Badge tone="indigo">{formatCurrency(totalValor)}</Badge>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {categorias.length === 0 ? (
              <p className="flex flex-1 items-center justify-center py-10 text-sm text-zinc-400">
                Sin categorías registradas
              </p>
            ) : (
              <Donut categorias={categorias} />
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div>
              <CardTitle>Alertas de stock</CardTitle>
              <CardDescription>Productos por debajo del mínimo</CardDescription>
            </div>
            <AlertTriangleIcon className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="flex flex-1 flex-col px-2 py-2">
            {stockBajo.length === 0 ? (
              <p className="flex flex-1 items-center justify-center px-3 py-6 text-sm text-zinc-400">
                Sin alertas de stock
              </p>
            ) : (
              <>
                <ul className="divide-y divide-zinc-100">
                  {stockBajo.slice(0, 4).map((producto) => (
                    <li key={producto.id}>
                      <Link
                        href={`/catalogo/${producto.id}`}
                        className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-zinc-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-900">{producto.nombre}</p>
                          <p className="truncate text-xs text-zinc-500">{producto.sku}</p>
                        </div>
                        <Badge tone={producto.stock === 0 ? "red" : "amber"}>
                          {producto.stock === 0 ? "Agotado" : `${producto.stock} restantes`}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/catalogo"
                  className="mt-auto flex items-center gap-1 px-3 py-2 text-xs font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Ver catálogo completo <ChevronRightIcon className="h-3 w-3" />
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="flex flex-col lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Movimientos recientes</CardTitle>
              <CardDescription>Últimas entradas y salidas registradas</CardDescription>
            </div>
            <ButtonLink href="/movimientos" variant="ghost" size="sm">
              Ver todos
            </ButtonLink>
          </CardHeader>
          {recientes.length === 0 ? (
            <CardContent className="flex flex-1 flex-col">
              <p className="flex flex-1 items-center justify-center py-10 text-sm text-zinc-400">
                Sin movimientos recientes
              </p>
            </CardContent>
          ) : (
            <TableContainer className="flex-1 rounded-none border-x-0 border-b-0 shadow-none">
              <Table>
                <THead>
                  <Tr>
                    <Th>Folio</Th>
                    <Th>Producto</Th>
                    <Th>Tipo</Th>
                    <Th>Fecha</Th>
                    <Th className="text-right">Cantidad</Th>
                  </Tr>
                </THead>
                <TBody>
                  {recientes.map((movimiento) => (
                    <Tr key={movimiento.id}>
                      <Td className="font-mono text-xs font-medium text-zinc-500">{movimiento.folio}</Td>
                      <Td className="font-medium text-zinc-900">{movimiento.producto}</Td>
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
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div>
              <CardTitle>Órdenes pendientes</CardTitle>
              <CardDescription>Órdenes de compra por recibir</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col px-2 py-2">
            {pendientes.length === 0 ? (
              <p className="flex flex-1 items-center justify-center px-3 py-6 text-sm text-zinc-400">
                Sin órdenes pendientes
              </p>
            ) : (
              <>
                <ul className="divide-y divide-zinc-100">
                  {pendientes.map((orden) => (
                    <li key={orden.id}>
                      <Link
                        href={`/ordenes/${orden.id}`}
                        className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-zinc-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-900">{orden.folio}</p>
                          <p className="truncate text-xs text-zinc-500">{orden.proveedor}</p>
                        </div>
                        <span className="text-sm font-medium text-zinc-900">{formatCurrency(orden.total)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/ordenes"
                  className="mt-auto flex items-center gap-1 px-3 py-2 text-xs font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Ver órdenes <ChevronRightIcon className="h-3 w-3" />
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">Reportes disponibles</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/reportes/valoracion"
            className="group flex flex-col items-start gap-2 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:shadow-md"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <CircleDollarSignIcon className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-600">
              Valoración del inventario
            </span>
            <span className="text-xs text-zinc-500">
              Valor por producto y por categoría a precio de costo y venta.
            </span>
          </Link>
          <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-zinc-300 bg-white p-5 opacity-60">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
              <BarChart3Icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-zinc-900">Rotación de inventario</span>
            <span className="text-xs text-zinc-500">Próximamente.</span>
          </div>
          <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-zinc-300 bg-white p-5 opacity-60">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
              <BarChart3Icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-zinc-900">Lento movimiento</span>
            <span className="text-xs text-zinc-500">Próximamente.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
