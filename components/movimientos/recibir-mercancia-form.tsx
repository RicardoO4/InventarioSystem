"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { recibirMercancia } from "@/app/movimientos/actions";
import {
  ArrowDownToLineIcon,
  ArrowLeftIcon,
  PackageIcon,
  SearchIcon,
} from "@/components/icons";
import type { OrdenPartida, Producto } from "@/lib/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";

type Props = {
  orden: { id: string; folio: string; proveedor: string; fecha: string };
  partidas: OrdenPartida[];
  productos: Producto[];
};

export function RecibirMercanciaForm({ orden, partidas, productos }: Props) {
  const router = useRouter();
  const [cantidades, setCantidades] = useState<Record<string, number>>(() => {
    const inicial: Record<string, number> = {};
    for (const p of partidas) {
      inicial[p.id] = Math.max(0, p.cantidad - p.cantidadRecibida);
    }
    return inicial;
  });
  const [resaltada, setResaltada] = useState<string | null>(null);
  const [escaneo, setEscaneo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timersRef = useRef<number[]>([]);

  const productoMap = useMemo(() => new Map(productos.map((p) => [p.id, p])), [productos]);

  const totalFaltante = useMemo(
    () => partidas.reduce((sum, p) => sum + Math.max(0, p.cantidad - p.cantidadRecibida), 0),
    [partidas]
  );

  const totalRecibir = useMemo(
    () => partidas.reduce((sum, p) => sum + (cantidades[p.id] ?? 0), 0),
    [partidas, cantidades]
  );

  function setCantidad(id: string, raw: string) {
    setCantidades((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.floor(Number(raw) || 0)),
    }));
  }

  function manejarEscaneo(valor: string) {
    setEscaneo(valor);
    const q = valor.trim().toLowerCase();
    if (!q) return;
    const encontrada = partidas.find((p) => {
      const prod = p.productoId ? productoMap.get(p.productoId) : undefined;
      return (
        (prod?.sku ?? "").toLowerCase() === q || (prod?.codigoBarra ?? "").toLowerCase() === q
      );
    });
    if (encontrada) {
      setEscaneo("");
      setResaltada(encontrada.id);
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current.push(
        window.setTimeout(() => setResaltada(null), 1600)
      );
      document.getElementById(`cantidad-${encontrada.id}`)?.focus();
    }
  }

  async function confirmar() {
    const cuerpo = partidas.map((p) => ({ partidaId: p.id, cantidad: cantidades[p.id] ?? 0 }));
    if (cuerpo.every((c) => c.cantidad === 0)) {
      setError("Indica al menos una cantidad a recibir");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const resultado = await recibirMercancia({ ordenId: orden.id, partidas: cuerpo });
      if (!resultado.ok) {
        setError(resultado.error);
        setEnviando(false);
        return;
      }
      router.push(`/ordenes/${orden.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al recibir la mercancía");
      setEnviando(false);
    }
  }

  return (
    <div>
      <div className="mb-5">
        <ButtonLink href="/ordenes" variant="ghost" size="sm" className="mb-3 -ml-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a órdenes de compra
        </ButtonLink>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Recibir mercancía
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Verifica físicamente lo que llegó de la orden {orden.folio} y ajusta las cantidades.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <ArrowDownToLineIcon className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle>{orden.folio}</CardTitle>
                  <CardDescription>{orden.proveedor}</CardDescription>
                </div>
              </div>
              <p className="hidden text-sm text-zinc-500 sm:block">{formatDate(orden.fecha)}</p>
            </div>
          </CardHeader>
          <CardContent>
            <label className="mb-4 block text-sm font-medium text-zinc-700">
              Escanear EAN / SKU para localizar el producto
              <div className="relative mt-1.5">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={escaneo}
                  onChange={(e) => manejarEscaneo(e.target.value)}
                  placeholder="Escanea el código de barras o escribe el SKU…"
                  className="pl-9"
                />
              </div>
            </label>

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
                      <Th className="text-right">Cantidad pedida</Th>
                      <Th className="text-right">Cantidad recibida</Th>
                      <Th className="text-right">Por recibir</Th>
                      <Th className="text-right">Cantidad a recibir</Th>
                    </Tr>
                  </THead>
                  <TBody>
                    {partidas.map((p) => {
                      const prod = p.productoId ? productoMap.get(p.productoId) : undefined;
                      const faltante = Math.max(0, p.cantidad - p.cantidadRecibida);
                      const cantidad = cantidades[p.id] ?? 0;
                      return (
                        <Tr
                          key={p.id}
                          className={cn(
                            resaltada === p.id && "bg-indigo-50 ring-2 ring-inset ring-indigo-200"
                          )}
                        >
                          <Td className="min-w-0">
                            <span className="block font-medium text-zinc-900">{p.producto}</span>
                            <span className="block font-mono text-xs text-zinc-400">
                              {[prod?.sku && `SKU ${prod.sku}`, prod?.codigoBarra && `EAN ${prod.codigoBarra}`]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </Td>
                          <Td className="text-right text-zinc-900">{p.cantidad}</Td>
                          <Td className="text-right text-zinc-500">{p.cantidadRecibida}</Td>
                          <Td className="text-right text-zinc-500">{faltante}</Td>
                          <Td className="text-right">
                            <Input
                              id={`cantidad-${p.id}`}
                              type="number"
                              min="0"
                              step="1"
                              placeholder="0"
                              value={cantidad === 0 ? "" : cantidad}
                              onChange={(e) => setCantidad(p.id, e.target.value)}
                              className="h-9 w-24 text-right"
                            />
                            {cantidad !== faltante && (
                              <p
                                className={cn(
                                  "mt-1 text-xs",
                                  cantidad > faltante ? "text-sky-600" : "text-amber-600"
                                )}
                              >
                                {cantidad > faltante ? "Más de lo pedido" : "Menos de lo pedido"}
                              </p>
                            )}
                          </Td>
                        </Tr>
                      );
                    })}
                  </TBody>
                </Table>
              </TableContainer>
            )}

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <ButtonLink href={`/ordenes/${orden.id}`} variant="secondary">
                Cancelar
              </ButtonLink>
              <Button
                onClick={confirmar}
                disabled={enviando || partidas.length === 0}
              >
                <ArrowDownToLineIcon className="h-4 w-4" />
                {enviando ? "Registrando…" : "Confirmar entrada"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>Recepción de la orden</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Proveedor</dt>
                <dd className="truncate font-medium text-zinc-900">{orden.proveedor}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Referencia</dt>
                <dd className="font-mono text-xs font-medium text-zinc-900">{orden.folio}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Partidas</dt>
                <dd className="font-medium text-zinc-900">{partidas.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Faltante total</dt>
                <dd className="font-medium text-zinc-900">{totalFaltante}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-3">
                <dt className="text-zinc-500">A recibir</dt>
                <dd className="text-base font-semibold text-zinc-900">{totalRecibir}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
