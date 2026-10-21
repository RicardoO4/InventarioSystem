"use server";

import { revalidatePath } from "next/cache";
import { esAdmin } from "@/lib/auth";
import { createProveedor } from "@/lib/data";

export type CrearProveedorInput = {
  nombre: string;
  contacto: string;
  telefono: string;
  correo: string;
  rfc: string;
};

export async function crearProveedor(
  input: CrearProveedorInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await esAdmin())) {
    return { ok: false, error: "No autorizado" };
  }
  try {
    if (!input.nombre?.trim()) {
      return { ok: false, error: "La razón social es obligatoria" };
    }
    await createProveedor({
      nombre: input.nombre.trim(),
      contacto: input.contacto?.trim() ?? "",
      telefono: input.telefono?.trim() ?? "",
      correo: input.correo?.trim() ?? "",
      rfc: input.rfc?.trim() ?? "",
    });
    revalidatePath("/proveedores");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al crear el proveedor",
    };
  }
}
