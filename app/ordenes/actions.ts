"use server";

import { revalidatePath, refresh } from "next/cache";
import { esAdmin } from "@/lib/auth";
import {
  cancelarOrden as cancelarOrdenData,
  createOrden as createOrdenData,
} from "@/lib/data";

type Resultado = { ok: true } | { ok: false; error: string };

export type PartidaOrdenInput = {
  productoId?: string | null;
  producto: string;
  proveedorId: string;
  proveedor: string;
  cantidad: number;
  precio: number;
};

export type CrearOrdenInput = {
  notas: string;
  partidas: PartidaOrdenInput[];
};

export async function crearOrden(input: CrearOrdenInput): Promise<Resultado> {
  if (!(await esAdmin())) {
    return { ok: false, error: "No autorizado" };
  }
  try {
    const partidas = Array.isArray(input.partidas) ? input.partidas : [];
    if (partidas.length === 0) {
      return { ok: false, error: "Agrega al menos una partida" };
    }

    const proveedorIds = new Set<string>();
    for (const p of partidas) {
      if (!p.producto?.trim()) {
        return { ok: false, error: "Cada partida debe tener un producto" };
      }
      if (!p.proveedorId) {
        return { ok: false, error: "Cada partida debe tener un proveedor seleccionado" };
      }
      if (!Number.isFinite(p.cantidad) || p.cantidad <= 0) {
        return { ok: false, error: "La cantidad debe ser mayor a cero" };
      }
      if (!Number.isFinite(p.precio) || p.precio < 0) {
        return { ok: false, error: "El precio debe ser mayor o igual a cero" };
      }
      proveedorIds.add(p.proveedorId);
    }

    if (proveedorIds.size > 1) {
      return {
        ok: false,
        error: "Todas las partidas de la orden deben ser del mismo proveedor",
      };
    }

    await createOrdenData({
      notas: input.notas?.trim() ?? "",
      partidas: partidas.map((p) => ({
        producto: p.producto.trim(),
        productoId: p.productoId ?? null,
        proveedorId: p.proveedorId,
        proveedor: p.proveedor?.trim() ?? "",
        cantidad: p.cantidad,
        precio: p.precio,
      })),
    });
    revalidatePath("/");
    revalidatePath("/ordenes");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al crear la orden",
    };
  }
}

export async function cancelarOrden(ordenId: string): Promise<Resultado> {
  if (!(await esAdmin())) {
    return { ok: false, error: "No autorizado" };
  }
  try {
    if (!ordenId) {
      return { ok: false, error: "La orden de compra es obligatoria" };
    }
    await cancelarOrdenData(ordenId);
    revalidatePath("/");
    revalidatePath("/ordenes");
    revalidatePath(`/ordenes/${ordenId}`);
    refresh();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al cancelar la orden",
    };
  }
}
