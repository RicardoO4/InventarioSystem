"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { actualizarProducto, crearProducto } from "@/app/catalogo/actions";
import { PackageIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Barcode } from "@/components/ui/barcode";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { completarEAN13 } from "@/lib/barcode";
import { formatCurrency } from "@/lib/format";
import type { Categoria, Producto } from "@/lib/types";

const selectClasses =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

const unidades = ["pieza", "caja", "rollo", "juego", "resma", "kilogramo", "litro"];

export function ProductoForm({
  categorias,
  producto,
}: {
  categorias: Categoria[];
  producto?: Producto;
}) {
  const router = useRouter();
  const esEdicion = Boolean(producto);

  const [nombre, setNombre] = useState(producto?.nombre ?? "");
  const [sku, setSku] = useState(producto?.sku ?? "");
  const [categoriaId, setCategoriaId] = useState(producto?.categoriaId ?? "");
  const [codigoBarra, setCodigoBarra] = useState(producto?.codigoBarra ?? "");
  const [unidad, setUnidad] = useState(producto?.unidad ?? "");
  const [precioCosto, setPrecioCosto] = useState(
    producto ? String(producto.precioCosto) : ""
  );
  const [precioVenta, setPrecioVenta] = useState(
    producto ? String(producto.precioVenta) : ""
  );
  const [stock, setStock] = useState("");
  const [ubicacion, setUbicacion] = useState(producto?.ubicacion ?? "");
  const [estado, setEstado] = useState<"activo" | "inactivo">(
    producto?.estado === "inactivo" ? "inactivo" : "activo"
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const resultado = esEdicion
        ? await actualizarProducto({
            id: producto!.id,
            nombre: nombre.trim(),
            sku: sku.trim(),
            categoriaId: categoriaId || null,
            codigoBarra: codigoBarra.trim(),
            unidad: unidad || "pieza",
            precioCosto: Number(precioCosto) || 0,
            precioVenta: Number(precioVenta) || 0,
            ubicacion: ubicacion.trim(),
            stock: producto!.stock,
            estado,
          })
        : await crearProducto({
            nombre: nombre.trim(),
            sku: sku.trim(),
            categoriaId: categoriaId || null,
            codigoBarra: codigoBarra.trim(),
            unidad: unidad || "pieza",
            precioCosto: Number(precioCosto) || 0,
            precioVenta: Number(precioVenta) || 0,
            ubicacion: ubicacion.trim(),
            stock: Number(stock) || 0,
          });
      if (!resultado.ok) {
        setError(resultado.error);
        setEnviando(false);
        return;
      }
      router.push(esEdicion ? `/catalogo/${producto!.id}` : "/catalogo");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el producto");
      setEnviando(false);
    }
  }

  const precioCostoNum = parseFloat(precioCosto) || 0;
  const precioVentaNum = parseFloat(precioVenta) || 0;
  const categoriaNombre = categorias.find((c) => c.id === categoriaId)?.nombre ?? "";
  const eanValido = codigoBarra.trim() ? completarEAN13(codigoBarra) : null;
  const eanInvalido = codigoBarra.trim() !== "" && !eanValido;
  const estadoPreview = esEdicion ? estado : "activo";
  const stockMostrado = esEdicion ? producto!.stock : stock;

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <PackageIcon className="h-4 w-4" />
            </span>
            <div>
              <CardTitle>Información general</CardTitle>
              <CardDescription>Los campos marcados con * son obligatorios</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-zinc-700">
              Nombre *
              <Input
                name="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Multímetro digital"
                className="mt-1.5"
                required
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              SKU *
              <Input
                name="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Ej. ELE-0012"
                className="mt-1.5"
                required
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Código de barras (EAN-13)
              <Input
                name="codigoBarra"
                value={codigoBarra}
                onChange={(e) => setCodigoBarra(e.target.value)}
                placeholder="Ej. 7501234567890"
                inputMode="numeric"
                className="mt-1.5"
              />
              <span className="mt-1 block text-xs text-zinc-400">
                Opcional. Si tecleas 12 dígitos, el verificador se calcula solo.
              </span>
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Categoría
              <select
                name="categoriaId"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className={`mt-1.5 ${selectClasses}`}
                suppressHydrationWarning
              >
                <option value="">Sin categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Unidad de medida
              <select
                name="unidad"
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                className={`mt-1.5 ${selectClasses}`}
                suppressHydrationWarning
              >
                <option value="" disabled>
                  Selecciona la unidad
                </option>
                {unidades.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Precio de costo
              <Input
                name="precioCosto"
                type="number"
                step="0.01"
                min="0"
                value={precioCosto}
                onChange={(e) => setPrecioCosto(e.target.value)}
                placeholder="0.00"
                className="mt-1.5"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Precio de venta
              <Input
                name="precioVenta"
                type="number"
                step="0.01"
                min="0"
                value={precioVenta}
                onChange={(e) => setPrecioVenta(e.target.value)}
                placeholder="0.00"
                className="mt-1.5"
              />
            </label>
            {esEdicion ? (
              <>
                <label className="block text-sm font-medium text-zinc-700">
                  Stock actual
                  <Input
                    name="stock"
                    type="number"
                    value={producto!.stock}
                    className="mt-1.5 bg-zinc-50 text-zinc-500"
                    disabled
                    readOnly
                  />
                  <span className="mt-1 block text-xs text-zinc-400">
                    El stock se modifica con Entradas y Salidas, no se edita aquí.
                  </span>
                </label>
                <label className="block text-sm font-medium text-zinc-700">
                  Estado
                  <select
                    name="estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as "activo" | "inactivo")}
                    className={`mt-1.5 ${selectClasses}`}
                    suppressHydrationWarning
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </label>
              </>
            ) : (
              <label className="block text-sm font-medium text-zinc-700">
                Stock inicial
                <Input
                  name="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  className="mt-1.5"
                />
              </label>
            )}
            <label className={`block text-sm font-medium text-zinc-700 ${esEdicion ? "sm:col-span-2" : ""}`}>
              Ubicación
              <Input
                name="ubicacion"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ej. Bodega A · Estante 1"
                className="mt-1.5"
              />
            </label>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 sm:col-span-2">{error}</p>
            )}
            <div className="flex items-center justify-end gap-2 sm:col-span-2">
              <ButtonLink href={esEdicion ? `/catalogo/${producto!.id}` : "/catalogo"} variant="secondary">
                Cancelar
              </ButtonLink>
              <Button type="submit" disabled={enviando}>
                {enviando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Guardar producto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="self-start">
        <CardHeader>
          <CardTitle>Vista previa</CardTitle>
          <CardDescription>Así se verá en el catálogo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <PackageIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-zinc-900">{nombre || "Nuevo producto"}</p>
              <p className="truncate font-mono text-xs text-zinc-400">{sku || "SKU-0000"}</p>
            </div>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">SKU</dt>
              <dd className="truncate font-mono font-medium text-zinc-900">{sku || "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">EAN-13</dt>
              <dd className="truncate font-medium text-zinc-900">{eanValido || "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">Categoría</dt>
              <dd className="truncate font-medium text-zinc-900">{categoriaNombre || "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">Unidad</dt>
              <dd className="font-medium text-zinc-900">{unidad || "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">P. costo</dt>
              <dd className="font-medium text-zinc-900">{formatCurrency(precioCostoNum)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">P. venta</dt>
              <dd className="font-medium text-zinc-900">{formatCurrency(precioVentaNum)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">Stock</dt>
              <dd className="font-medium text-zinc-900">
                {stockMostrado || "0"} {unidad}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">Ubicación</dt>
              <dd className="truncate font-medium text-zinc-900">{ubicacion || "—"}</dd>
            </div>
          </dl>
          <div className="mt-4 border-t border-zinc-100 pt-3">
            <p className="mb-2 text-xs font-medium text-zinc-500">
              Código de barras {eanValido ? "EAN-13" : "generado desde el SKU"}
            </p>
            <div className="flex justify-center">
              {eanValido || sku.trim() ? (
                <Barcode value={eanValido ?? sku} format={eanValido ? "ean13" : "code128"} height={52} />
              ) : (
                <p className="py-4 text-center text-xs text-zinc-400">
                  Ingresa el SKU o el EAN-13 para generar el código
                </p>
              )}
            </div>
            {eanInvalido && (
              <p className="mt-2 text-center text-xs text-red-600">
                El EAN debe tener 12 o 13 dígitos válidos.
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
            <span className="text-sm text-zinc-500">Estado</span>
            <Badge tone={estadoPreview === "activo" ? "green" : "gray"}>
              {estadoPreview === "activo" ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
