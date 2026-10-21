"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { crearOrden } from "@/app/ordenes/actions";
import { ClipboardListIcon, PlusIcon, XIcon } from "@/components/icons";
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
import { formatCurrency } from "@/lib/format";
import type { Producto, Proveedor } from "@/lib/types";

type Partida = {
  key: number;
  productoId: string | null;
  producto: string;
  proveedorId: string;
  proveedor: string;
  cantidad: number;
  precio: number;
};

function toItem(p: Proveedor): ComboboxItem {
  return {
    id: p.id,
    label: p.nombre,
    detail: p.contacto || undefined,
    hint: p.rfc || undefined,
    searchText: `${p.nombre} ${p.rfc} ${p.correo} ${p.contacto}`.toLowerCase(),
  };
}

function toProductoItem(p: Producto): ComboboxItem {
  return {
    id: p.id,
    label: p.nombre,
    detail: p.sku,
    hint: p.codigoBarra || undefined,
    searchText: `${p.nombre} ${p.sku} ${p.codigoBarra}`.toLowerCase(),
  };
}

export function NuevaOrdenForm({
  proveedores,
  productos,
  proveedorInicialId,
}: {
  proveedores: Proveedor[];
  productos: Producto[];
  proveedorInicialId?: string;
}) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proveedorNuevo, setProveedorNuevo] = useState<ComboboxItem | null>(() => {
    if (!proveedorInicialId) return null;
    const p = proveedores.find((prov) => prov.id === proveedorInicialId);
    return p ? toItem(p) : null;
  });
  const [productoSeleccionado, setProductoSeleccionado] = useState<ComboboxItem | null>(null);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const [lineaError, setLineaError] = useState<string | null>(null);
  const notasRef = useRef<HTMLTextAreaElement>(null);
  const cantidadRef = useRef<HTMLInputElement>(null);
  const precioRef = useRef<HTMLInputElement>(null);
  const nextKeyRef = useRef(0);

  const proveedorItems = useMemo<ComboboxItem[]>(() => proveedores.map(toItem), [proveedores]);
  const productoItems = useMemo<ComboboxItem[]>(() => productos.map(toProductoItem), [productos]);

  const proveedoresEnPartidas = useMemo(
    () => [...new Set(partidas.map((p) => p.proveedorId).filter(Boolean))],
    [partidas]
  );
  const sinProveedor = partidas.some((p) => !p.proveedorId);
  const proveedoresDistintos = proveedoresEnPartidas.length > 1;
  const proveedorUnico = proveedoresEnPartidas.length === 1 ? proveedoresEnPartidas[0] : null;

  const total = useMemo(
    () => partidas.reduce((sum, p) => sum + p.cantidad * p.precio, 0),
    [partidas]
  );

  function agregarPartida() {
    const producto = productoSeleccionado;
    if (!producto) {
      setLineaError("Selecciona un producto");
      return;
    }
    const proveedor = proveedorNuevo;
    if (!proveedor) {
      setLineaError("Selecciona el proveedor de la partida");
      return;
    }
    const cantidad = Math.floor(Number(cantidadRef.current?.value) || 0);
    const precio = Number(precioRef.current?.value) || 0;
    if (cantidad <= 0) {
      setLineaError("La cantidad debe ser mayor a cero");
      cantidadRef.current?.focus();
      return;
    }
    if (precio < 0) {
      setLineaError("El precio no puede ser negativo");
      precioRef.current?.focus();
      return;
    }
    if (partidas.some((p) => p.productoId && p.productoId === producto.id)) {
      setLineaError("Ese producto ya está en la orden");
      return;
    }
    nextKeyRef.current += 1;
    setPartidas([
      ...partidas,
      {
        key: nextKeyRef.current,
        productoId: producto.id,
        producto: producto.label,
        proveedorId: proveedor.id,
        proveedor: proveedor.label,
        cantidad,
        precio,
      },
    ]);
    setProductoSeleccionado(null);
    setProveedorNuevo(proveedor);
    setLineaError(null);
    if (cantidadRef.current) cantidadRef.current.value = "";
    if (precioRef.current) precioRef.current.value = "";
    setResetKey((k) => k + 1);
  }

  function quitarPartida(key: number) {
    setPartidas((prev) => prev.filter((p) => p.key !== key));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sinProveedor) {
      setError("Cada partida debe tener un proveedor seleccionado");
      return;
    }
    if (proveedoresDistintos) {
      setError("Todas las partidas de la orden deben ser del mismo proveedor");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const resultado = await crearOrden({
        notas: String(new FormData(e.currentTarget).get("notas") ?? "").trim(),
        partidas: partidas.map((p) => ({
          productoId: p.productoId,
          producto: p.producto,
          proveedorId: p.proveedorId,
          proveedor: p.proveedor,
          cantidad: p.cantidad,
          precio: p.precio,
        })),
      });
      if (!resultado.ok) {
        setError(resultado.error);
        setEnviando(false);
        return;
      }
      router.push("/ordenes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la orden");
      setEnviando(false);
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <ClipboardListIcon className="h-4 w-4" />
            </span>
            <div>
              <CardTitle>Información de la orden</CardTitle>
              <CardDescription>Los campos marcados con * son obligatorios</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset>
              <legend className="text-sm font-medium text-zinc-700">Partidas *</legend>
              <div className="mt-2 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-zinc-700">Producto *</label>
                    <Combobox
                      key={`producto-${resetKey}`}
                      items={productoItems}
                      value={productoSeleccionado?.id ?? ""}
                      onChange={(id) =>
                        setProductoSeleccionado(productoItems.find((i) => i.id === id) ?? null)
                      }
                      onSelect={(item) => {
                        const p = productos.find((prod) => prod.id === item.id);
                        if (p && precioRef.current) {
                          precioRef.current.value = String(p.precioCosto ?? 0);
                        }
                        cantidadRef.current?.focus();
                      }}
                      placeholder="Buscar producto por nombre, SKU o código…"
                      emptyMessage="No se encontró ningún producto"
                      detailPrefix="SKU"
                      hintPrefix="EAN"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-zinc-700">Proveedor *</label>
                    <Combobox
                      items={proveedorItems}
                      value={proveedorNuevo?.id ?? ""}
                      onChange={(id) =>
                        setProveedorNuevo(proveedorItems.find((i) => i.id === id) ?? null)
                      }
                      onSelect={() => cantidadRef.current?.focus()}
                      placeholder="Buscar proveedor por nombre, RFC o correo…"
                      emptyMessage="No se encontró ningún proveedor"
                      detailPrefix="Contacto"
                      hintPrefix="RFC"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">Cantidad</label>
                    <Input
                      ref={cantidadRef}
                      type="number"
                      min="1"
                      step="1"
                      placeholder="0"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">Precio</label>
                    <Input
                      ref={precioRef}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  {lineaError && <p className="text-xs text-red-600">{lineaError}</p>}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={agregarPartida}
                    className="shrink-0"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Agregar partida
                  </Button>
                </div>
              </div>
            </fieldset>

            {partidas.length === 0 ? (
              <EmptyState
                icon={<ClipboardListIcon className="h-5 w-5" />}
                title="Sin partidas"
                description="Agrega al menos una partida para crear la orden."
              />
            ) : (
              <TableContainer>
                <Table>
                  <THead>
                    <Tr>
                      <Th>Producto</Th>
                      <Th>Proveedor</Th>
                      <Th className="text-right">Cantidad</Th>
                      <Th className="text-right">Precio</Th>
                      <Th className="text-right">Subtotal</Th>
                      <Th className="w-10" />
                    </Tr>
                  </THead>
                  <TBody>
                    {partidas.map((p) => (
                      <Tr key={p.key}>
                        <Td className="font-medium text-zinc-900">{p.producto}</Td>
                        <Td className="text-zinc-500">{p.proveedor}</Td>
                        <Td className="text-right text-zinc-900">{p.cantidad}</Td>
                        <Td className="text-right text-zinc-500">{formatCurrency(p.precio)}</Td>
                        <Td className="text-right font-medium text-zinc-900">
                          {formatCurrency(p.cantidad * p.precio)}
                        </Td>
                        <Td className="text-right">
                          <button
                            type="button"
                            onClick={() => quitarPartida(p.key)}
                            aria-label={`Quitar ${p.producto}`}
                            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-600"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </TableContainer>
            )}

            <label className="block text-sm font-medium text-zinc-700">
              Notas
              <textarea
                ref={notasRef}
                name="notas"
                rows={3}
                placeholder="Condiciones de pago, entrega, etc."
                suppressHydrationWarning
                className="mt-1.5 block w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
            )}
            <div className="flex items-center justify-end gap-2">
              <ButtonLink href="/ordenes" variant="secondary">
                Cancelar
              </ButtonLink>
              <Button
                type="submit"
                disabled={
                  enviando ||
                  partidas.length === 0 ||
                  sinProveedor ||
                  proveedoresDistintos
                }
              >
                {enviando ? "Creando…" : "Crear orden"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="self-start">
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
          <CardDescription>Total de la orden</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-zinc-500">Proveedor</dt>
              <dd className="truncate font-medium text-zinc-900">
                {proveedorUnico
                  ? proveedorItems.find((i) => i.id === proveedorUnico)?.label ?? "—"
                  : partidas.length === 0
                    ? "—"
                    : "Varios"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-zinc-500">Partidas</dt>
              <dd className="font-medium text-zinc-900">{partidas.length}</dd>
            </div>
            {proveedoresDistintos && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Todas las partidas deben ser del mismo proveedor.
              </p>
            )}
            <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-3">
              <dt className="text-zinc-500">Total</dt>
              <dd className="text-base font-semibold text-zinc-900">{formatCurrency(total)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
