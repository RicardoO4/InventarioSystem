"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearCategoria } from "@/app/categorias/actions";
import { PlusIcon, TagsIcon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { iconosCategoria } from "@/components/categorias/categoria-iconos";

export function NuevaCategoriaForm() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [icono, setIcono] = useState("box");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nombreTrim = nombre.trim();
    if (!nombreTrim) return;

    setEnviando(true);
    setError(null);
    try {
      const resultado = await crearCategoria({
        nombre: nombreTrim,
        descripcion: descripcion.trim(),
        icono,
      });
      if (!resultado.ok) {
        setError(resultado.error);
        setEnviando(false);
        return;
      }
      router.push("/catalogo/categorias");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la categoría");
      setEnviando(false);
    }
  }

  const Icono = iconosCategoria[icono] ?? TagsIcon;

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <TagsIcon className="h-4 w-4" />
            </span>
            <div>
              <CardTitle>Información de la categoría</CardTitle>
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
                placeholder="Ej. Consumibles"
                className="mt-1.5"
                required
              />
            </label>
            <div className="block text-sm font-medium text-zinc-700">
              Icono
              <div className="mt-1.5 flex flex-wrap gap-2">
                {Object.entries(iconosCategoria).map(([key, Icon]) => (
                  <button
                    key={key}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setIcono(key)}
                    aria-pressed={icono === key}
                    aria-label={`Icono ${key}`}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
                      icono === key
                        ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                        : "border-zinc-300 bg-white text-zinc-500 hover:bg-zinc-50"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>
            <label className="block text-sm font-medium text-zinc-700 sm:col-span-2">
              Descripción
              <Input
                name="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe el tipo de productos que agrupa"
                className="mt-1.5"
              />
            </label>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 sm:col-span-2">{error}</p>
            )}
            <div className="flex items-center justify-end gap-2 sm:col-span-2">
              <ButtonLink href="/catalogo/categorias" variant="secondary">
                Cancelar
              </ButtonLink>
              <Button type="submit" disabled={enviando}>
                <PlusIcon className="h-4 w-4" />
                {enviando ? "Creando…" : "Crear categoría"}
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
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Icono className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                0 productos
              </span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-zinc-900">{nombre || "Nueva categoría"}</h3>
            <p className="mt-1 text-sm text-zinc-500">{descripcion || "Descripción de la categoría"}</p>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-sm">
              <span className="text-zinc-500">Valor en inventario</span>
              <span className="font-semibold text-zinc-900">{formatCurrency(0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
