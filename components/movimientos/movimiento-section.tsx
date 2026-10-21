"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { registrarMovimiento } from "@/app/movimientos/actions";
import {
  ArrowDownToLineIcon,
  ArrowLeftIcon,
  ArrowUpFromLineIcon,
} from "@/components/icons";
import type { Movimiento, Producto, Proveedor, TipoMovimiento } from "@/lib/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox, type ComboboxItem } from "@/components/ui/combobox";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableContainer,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";

const config = {
  entrada: {
    titulo: "Registrar entrada",
    descripcion: "Ingresa mercancía al inventario.",
    icono: ArrowDownToLineIcon,
    tono: "green" as const,
  },
  salida: {
    titulo: "Registrar salida",
    descripcion: "Da salida a mercancía del inventario.",
    icono: ArrowUpFromLineIcon,
    tono: "amber" as const,
  },
};

export function MovimientoSection({
  tipo,
  movimientos,
  productos,
  proveedores = [],
}: {
  tipo: TipoMovimiento;
  movimientos: Movimiento[];
  productos: Producto[];
  proveedores?: Proveedor[];
}) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ComboboxItem | null>(null);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<ComboboxItem | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [cantidad, setCantidad] = useState("");
  const [costo, setCosto] = useState("");
  const [optimistas, setOptimistas] = useState<Movimiento[]>([]);
  const [movimientosPrevios, setMovimientosPrevios] = useState(movimientos);
  const cantidadRef = useRef<HTMLInputElement>(null);

  if (movimientos !== movimientosPrevios) {
    setMovimientosPrevios(movimientos);
    setOptimistas([]);
  }

  const esEntrada = tipo === "entrada";
  const conf = config[tipo];
  const Icono = conf.icono;
  const lista = useMemo(() => {
    const base = movimientos.filter(
      (m) => m.tipo === tipo && !optimistas.some((o) => o.id === m.id)
    );
    return [...optimistas.filter((o) => o.tipo === tipo), ...base].sort((a, b) =>
      b.fecha.localeCompare(a.fecha)
    );
  }, [movimientos, optimistas, tipo]);

  const productoSeleccionadoDetalle = productoSeleccionado
    ? productos.find((p) => p.id === productoSeleccionado.id) ?? null
    : null;
  const stockDisponible = productoSeleccionadoDetalle?.stock ?? null;
  const unidadProducto = productoSeleccionadoDetalle?.unidad ?? "pieza";
  const cantidadNum = Math.floor(Number(cantidad) || 0);

  const items = useMemo<ComboboxItem[]>(
    () =>
      productos.map((p) => ({
        id: p.id,
        label: p.nombre,
        detail: p.sku,
        hint: p.codigoBarra || undefined,
        searchText: `${p.nombre} ${p.sku} ${p.codigoBarra}`.toLowerCase(),
      })),
    [productos]
  );

  const proveedorItems = useMemo<ComboboxItem[]>(
    () =>
      proveedores.map((p) => ({
        id: p.id,
        label: p.nombre,
        searchText: p.nombre.toLowerCase(),
      })),
    [proveedores]
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setEnviando(true);
    setError(null);
    try {
      const resultado = await registrarMovimiento({
        tipo,
        producto: productoSeleccionado?.label ?? String(formData.get("producto") ?? "").trim(),
        productoId: productoSeleccionado?.id ?? null,
        cantidad: Number(formData.get("cantidad")) || 0,
        contraparte: String(formData.get("contraparte") ?? "").trim(),
        referencia: String(formData.get("referencia") ?? "").trim(),
        costoUnitario: esEntrada ? Number(costo) || null : null,
      });
      if (!resultado.ok) {
        setError(resultado.error);
        setEnviando(false);
        return;
      }
      setOptimistas((prev) => [resultado.movimiento, ...prev]);
      form.reset();
      setProductoSeleccionado(null);
      setProveedorSeleccionado(null);
      setCantidad("");
      setCosto("");
      setResetKey((k) => k + 1);
      setEnviando(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar el movimiento");
      setEnviando(false);
    }
  }

  return (
    <div>
      <div className="mb-5">
        <ButtonLink href="/movimientos" variant="ghost" size="sm" className="mb-3 -ml-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a movimientos
        </ButtonLink>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {esEntrada ? "Entradas" : "Salidas"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {esEntrada
            ? "Registra la mercancía que ingresa al inventario."
            : "Registra la mercancía que sale del inventario."}
        </p>
      </div>

      <Card className="mb-5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span
              className={
                esEntrada
                  ? "flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
                  : "flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600"
              }
            >
              <Icono className="h-4 w-4" />
            </span>
            <div>
              <CardTitle>{conf.titulo}</CardTitle>
              <CardDescription>{conf.descripcion}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label
              className={`block text-sm font-medium text-zinc-700 sm:col-span-2 ${
                esEntrada ? "lg:col-span-2" : "lg:col-span-3"
              }`}
            >
              Producto *
              <Combobox
                key={resetKey}
                className="mt-1.5"
                items={items}
                value={productoSeleccionado?.id ?? ""}
                onChange={(id) =>
                  setProductoSeleccionado(items.find((i) => i.id === id) ?? null)
                }
                onSelect={() => cantidadRef.current?.focus()}
                placeholder="Buscar por nombre, SKU o código de barras…"
                emptyMessage="No se encontró ningún producto"
                detailPrefix="SKU"
                hintPrefix="EAN"
                selectedInfo={
                  !esEntrada && stockDisponible !== null ? (
                    <span className="font-medium text-amber-600">
                      Stock: {stockDisponible} {unidadProducto}
                    </span>
                  ) : undefined
                }
              />
              <input type="hidden" name="producto" value={productoSeleccionado?.label ?? ""} />
              <input type="hidden" name="productoId" value={productoSeleccionado?.id ?? ""} />
            </label>
            <label className="block text-sm font-medium text-zinc-700 lg:col-span-1">
              Cantidad *
              <Input
                ref={cantidadRef}
                name="cantidad"
                type="number"
                min="1"
                max={!esEntrada && stockDisponible !== null ? stockDisponible : undefined}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="0"
                className="mt-1.5"
                required
              />
              {!esEntrada && stockDisponible !== null && (
                <span className="mt-1.5 block text-xs">
                  {cantidadNum > 0 && (
                    <>
                      {cantidadNum > stockDisponible ? (
                        <span className="font-medium text-red-600">
                          Supera el stock disponible ({stockDisponible})
                        </span>
                      ) : (
                        <span className="text-zinc-500">
                          Quedarán:{" "}
                          <span className="font-semibold text-zinc-700">
                            {stockDisponible - cantidadNum}
                          </span>{" "}
                          {unidadProducto}
                        </span>
                      )}
                    </>
                  )}
                </span>
              )}
            </label>
            {esEntrada && (
              <label className="block text-sm font-medium text-zinc-700 lg:col-span-1">
                Costo unitario
                <Input
                  name="costoUnitario"
                  type="number"
                  min="0"
                  step="0.01"
                  value={costo}
                  onChange={(e) => setCosto(e.target.value)}
                  placeholder="Opcional"
                  className="mt-1.5"
                />
                <span className="mt-1.5 block text-xs text-zinc-400">
                  Si se deja vacío se usa el costo del producto.
                </span>
              </label>
            )}
            <label className="block text-sm font-medium text-zinc-700 lg:col-span-2">
              {esEntrada ? "Proveedor / Origen" : "Destino / Área"}
              {esEntrada ? (
                <>
                  <Combobox
                    key={resetKey}
                    className="mt-1.5"
                    items={proveedorItems}
                    value={proveedorSeleccionado?.id ?? ""}
                    onChange={(id) =>
                      setProveedorSeleccionado(
                        proveedorItems.find((i) => i.id === id) ?? null
                      )
                    }
                    placeholder="Buscar proveedor por nombre…"
                    emptyMessage="No se encontró ningún proveedor"
                  />
                  <input
                    type="hidden"
                    name="contraparte"
                    value={proveedorSeleccionado?.label ?? ""}
                  />
                </>
              ) : (
                <Input
                  name="contraparte"
                  placeholder="Ej. Producción"
                  className="mt-1.5"
                />
              )}
            </label>
            <label className="block text-sm font-medium text-zinc-700 sm:col-span-2 lg:col-span-2">
              Referencia
              <Input name="referencia" placeholder="Ej. OC-0451, SURT-128…" className="mt-1.5" />
            </label>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 sm:col-span-2 lg:col-span-4">
                {error}
              </p>
            )}
            <div className="flex items-end sm:col-span-2 lg:col-span-4">
              <Button type="submit" disabled={enviando} className="w-full sm:w-auto">
                <Icono className="h-4 w-4" />
                {enviando ? "Registrando…" : `Confirmar ${esEntrada ? "entrada" : "salida"}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900">
          {lista.length} {esEntrada ? "entradas" : "salidas"} registradas
        </h2>
      </div>

      {lista.length === 0 ? (
        <EmptyState
          icon={<Icono className="h-5 w-5" />}
          title={esEntrada ? "Sin entradas" : "Sin salidas"}
          description={`No hay ${esEntrada ? "entradas" : "salidas"} registradas todavía.`}
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <Tr>
                <Th>Folio</Th>
                <Th>Producto</Th>
                <Th>Fecha</Th>
                <Th>Responsable</Th>
                <Th className="text-right">Cantidad</Th>
                <Th>Contraparte</Th>
              </Tr>
            </THead>
            <TBody>
              {lista.map((movimiento) => (
                <Tr key={movimiento.id}>
                  <Td className="font-mono text-xs font-medium text-zinc-500">{movimiento.folio}</Td>
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
