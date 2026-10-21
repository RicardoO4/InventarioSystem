"use server";

import { revalidatePath } from "next/cache";
import { esAdmin } from "@/lib/auth";
import { createCategoria } from "@/lib/data";

export type CrearCategoriaInput = {
  nombre: string;
  descripcion: string;
  icono: string;
};

export async function crearCategoria(
  input: CrearCategoriaInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await esAdmin())) {
    return { ok: false, error: "No autorizado" };
  }
  try {
    if (!input.nombre?.trim()) {
      return { ok: false, error: "El nombre es obligatorio" };
    }
    await createCategoria({
      nombre: input.nombre.trim(),
      descripcion: input.descripcion?.trim() ?? "",
      icono: input.icono ?? "box",
    });
    revalidatePath("/catalogo");
    revalidatePath("/catalogo/categorias");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al crear la categoría",
    };
  }
}
