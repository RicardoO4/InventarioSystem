"use client";

import { useMemo, useState } from "react";
import { SearchIcon, TagsIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Categoria } from "@/lib/types";
import { iconosCategoria } from "@/components/categorias/categoria-iconos";

export function CategoriaGrid({ categorias }: { categorias: Categoria[] }) {
  const [query, setQuery] = useState("");

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categorias;
    return categorias.filter(
      (c) => c.nombre.toLowerCase().includes(q) || c.descripcion.toLowerCase().includes(q)
    );
  }, [categorias, query]);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar categoría…"
            className="pl-9"
            aria-label="Buscar categorías"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="font-medium text-zinc-900">{filtradas.length}</span>
          {query.trim() ? `de ${categorias.length} categorías` : "categorías"}
        </div>
      </div>

      {filtradas.length === 0 ? (
        <EmptyState
          icon={<TagsIcon className="h-5 w-5" />}
          title={categorias.length === 0 ? "Sin categorías" : "Sin resultados"}
          description={
            categorias.length === 0
              ? "Aún no hay categorías registradas. Crea la primera."
              : `No se encontraron categorías con “${query.trim()}”.`
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtradas.map((categoria) => {
            const Icon = iconosCategoria[categoria.icono ?? "box"] ?? TagsIcon;
            return (
              <div key={categoria.id} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                    {formatNumber(categoria.productos)} productos
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-zinc-900">{categoria.nombre}</h3>
                <p className="mt-1 text-sm text-zinc-500">{categoria.descripcion}</p>
                <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-sm">
                  <span className="text-zinc-500">Valor en inventario</span>
                  <span className="font-semibold text-zinc-900">{formatCurrency(categoria.valor)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
