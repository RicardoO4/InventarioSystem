"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangleIcon, SearchIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
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
import type { Producto } from "@/lib/types";

export function ProductTable({ productos }: { productos: Producto[] }) {
  const [query, setQuery] = useState("");

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.codigoBarra.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
    );
  }, [productos, query]);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, SKU o categoría…"
            className="pl-9"
            aria-label="Buscar productos"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="font-medium text-zinc-900">{filtrados.length}</span>
          {query.trim() ? `de ${productos.length} productos` : "productos registrados"}
        </div>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          icon={<SearchIcon className="h-5 w-5" />}
          title={productos.length === 0 ? "Catálogo vacío" : "Sin resultados"}
          description={
            productos.length === 0
              ? "Aún no hay productos registrados en el catálogo."
              : `No se encontraron productos con “${query.trim()}”.`
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <Tr>
                <Th>Producto</Th>
                <Th>Categoría</Th>
                <Th>Ubicación</Th>
                <Th className="text-right">Stock</Th>
                <Th className="text-right">P. costo</Th>
                <Th className="text-right">P. venta</Th>
                <Th>Estado</Th>
              </Tr>
            </THead>
            <TBody>
              {filtrados.map((producto) => (
                <Tr key={producto.id}>
                  <Td>
                    <Link href={`/catalogo/${producto.id}`} className="block group">
                      <p className="font-medium text-zinc-900 group-hover:text-indigo-600">
                        {producto.nombre}
                      </p>
                      <p className="font-mono text-xs text-zinc-400">{producto.sku}</p>
                      {producto.codigoBarra && (
                        <p className="font-mono text-[11px] text-zinc-400">
                          EAN {producto.codigoBarra}
                        </p>
                      )}
                    </Link>
                  </Td>
                  <Td>{producto.categoria}</Td>
                  <Td className="text-zinc-500">{producto.ubicacion}</Td>
                  <Td className="text-right">
                    <span className="inline-flex items-center gap-1.5 font-medium text-zinc-900">
                      {producto.stock <= producto.stockMinimo && (
                        <AlertTriangleIcon className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      {producto.stock}
                    </span>
                  </Td>
                  <Td className="text-right text-zinc-500">{formatCurrency(producto.precioCosto)}</Td>
                  <Td className="text-right text-zinc-900">{formatCurrency(producto.precioVenta)}</Td>
                  <Td>
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
                          : "Activo"}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
