"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearProveedor } from "@/app/proveedores/actions";
import { TruckIcon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function NuevoProveedorForm() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setEnviando(true);
    setError(null);
    try {
      const resultado = await crearProveedor({
        nombre: String(formData.get("nombre") ?? "").trim(),
        rfc: String(formData.get("rfc") ?? "").trim(),
        contacto: String(formData.get("contacto") ?? "").trim(),
        telefono: String(formData.get("telefono") ?? "").trim(),
        correo: String(formData.get("correo") ?? "").trim(),
      });
      if (!resultado.ok) {
        setError(resultado.error);
        setEnviando(false);
        return;
      }
      router.push("/proveedores");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el proveedor");
      setEnviando(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
            <TruckIcon className="h-4 w-4" />
          </span>
          <div>
            <CardTitle>Datos del proveedor</CardTitle>
            <CardDescription>Los campos marcados con * son obligatorios</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-zinc-700">
            Razón social *
            <Input name="nombre" placeholder="Ej. Distribuidora Eléctrica MX" className="mt-1.5" required />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            RFC *
            <Input name="rfc" placeholder="Ej. DEM160101HXA" className="mt-1.5" required />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Contacto
            <Input name="contacto" placeholder="Nombre de la persona" className="mt-1.5" />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Teléfono
            <Input name="telefono" placeholder="55 0000 0000" className="mt-1.5" />
          </label>
          <label className="block text-sm font-medium text-zinc-700 sm:col-span-2">
            Correo electrónico
            <Input name="correo" type="email" placeholder="ventas@proveedor.mx" className="mt-1.5" />
          </label>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 sm:col-span-2">{error}</p>
          )}
          <div className="flex items-center justify-end gap-2 sm:col-span-2">
            <ButtonLink href="/proveedores" variant="secondary">
              Cancelar
            </ButtonLink>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Guardando…" : "Guardar proveedor"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
