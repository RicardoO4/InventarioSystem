"use server";

import { revalidatePath, refresh } from "next/cache";
import { esAdmin, getPerfil } from "@/lib/auth";
import {
  cambiarEstadoProducto,
  createProducto,
  updateProducto,
} from "@/lib/data";

type Resultado = { ok: true } | { ok: false; error: string };

export async function toggleEstadoProducto(
  productoId: string,
  nuevo: "activo" | "inactivo"
): Promise<Resultado> {
  const perfil = await getPerfil();
  if (!perfil || perfil.rol !== "admin") {
    return { ok: false, error: "No autorizado." };
  }

  try {
    await cambiarEstadoProducto(productoId, nuevo);
    revalidatePath("/catalogo");
    revalidatePath(`/catalogo/${productoId}`);
    refresh();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo cambiar el estado.",
    };
  }
}

export type CrearProductoInput = {
  nombre: string;
  sku: string;
  categoriaId: string | null;
  codigoBarra: string;
  unidad: string;
  precioCosto: number;
  precioVenta: number;
  stock: number;
  ubicacion: string;
};

export async function crearProducto(input: CrearProductoInput): Promise<Resultado> {
  if (!(await esAdmin())) {
    return { ok: false, error: "No autorizado" };
  }
  try {
    if (!input.nombre?.trim() || !input.sku?.trim()) {
      return { ok: false, error: "Nombre y SKU son obligatorios" };
    }
    await createProducto({
      nombre: input.nombre.trim(),
      sku: input.sku.trim(),
      categoriaId: input.categoriaId || null,
      codigoBarra: input.codigoBarra.trim(),
      stock: Number(input.stock) || 0,
      precioCosto: Number(input.precioCosto) || 0,
      precioVenta: Number(input.precioVenta) || 0,
      ubicacion: input.ubicacion.trim(),
      unidad: input.unidad || "pieza",
    });
    revalidatePath("/catalogo");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al crear el producto",
    };
  }
}

export type ActualizarProductoInput = CrearProductoInput & {
  id: string;
  estado: "activo" | "inactivo" | "agotado";
};

export async function actualizarProducto(input: ActualizarProductoInput): Promise<Resultado> {
  if (!(await esAdmin())) {
    return { ok: false, error: "No autorizado" };
  }
  try {
    if (!input.nombre?.trim() || !input.sku?.trim()) {
      return { ok: false, error: "Nombre y SKU son obligatorios" };
    }
    await updateProducto(input.id, {
      nombre: input.nombre.trim(),
      sku: input.sku.trim(),
      categoriaId: input.categoriaId || null,
      codigoBarra: input.codigoBarra.trim(),
      precioCosto: Number(input.precioCosto) || 0,
      precioVenta: Number(input.precioVenta) || 0,
      ubicacion: input.ubicacion.trim(),
      unidad: input.unidad || "pieza",
      estado: input.estado,
    });
    revalidatePath("/catalogo");
    revalidatePath(`/catalogo/${input.id}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al actualizar el producto",
    };
  }
}
