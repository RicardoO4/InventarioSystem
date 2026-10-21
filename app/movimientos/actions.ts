"use server";

import { revalidatePath, refresh } from "next/cache";
import { createMovimiento, recibirOrden } from "@/lib/data";
import type { Movimiento } from "@/lib/types";

export type RegistrarMovimientoInput = {
  tipo: "entrada" | "salida";
  producto: string;
  productoId?: string | null;
  cantidad: number;
  contraparte: string;
  referencia: string;
  costoUnitario?: number | null;
};

export async function registrarMovimiento(
  input: RegistrarMovimientoInput
): Promise<{ ok: true; movimiento: Movimiento } | { ok: false; error: string }> {
  try {
    if (!input.producto?.trim() || !input.cantidad || input.cantidad < 1) {
      return { ok: false, error: "Producto y cantidad son obligatorios" };
    }
    if (input.tipo !== "entrada" && input.tipo !== "salida") {
      return { ok: false, error: "Tipo de movimiento inválido" };
    }
    const data = await createMovimiento({
      tipo: input.tipo,
      producto: input.producto.trim(),
      productoId: input.productoId ?? null,
      cantidad: Math.floor(Number(input.cantidad)),
      contraparte: input.contraparte.trim(),
      referencia: input.referencia.trim(),
      costoUnitario:
        input.tipo === "entrada" && input.costoUnitario && input.costoUnitario > 0
          ? input.costoUnitario
          : null,
    });
    revalidatePath("/");
    revalidatePath("/movimientos");
    revalidatePath("/catalogo");
    revalidatePath("/reportes/valoracion");
    refresh();
    return {
      ok: true,
      movimiento: {
        id: data.id,
        folio: data.folio,
        tipo: data.tipo,
        producto: input.producto.trim(),
        productoId: data.producto_id ?? "",
        cantidad: data.cantidad,
        unidad: data.unidad,
        fecha: data.fecha,
        responsable: data.responsable ?? "",
        contraparte: data.contraparte ?? "",
        referencia: data.referencia ?? "",
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al registrar el movimiento",
    };
  }
}

export type RecibirMercanciaInput = {
  ordenId: string;
  partidas: { partidaId: string; cantidad: number }[];
};

export async function recibirMercancia(
  input: RecibirMercanciaInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    if (!input.ordenId) {
      return { ok: false, error: "La orden de compra es obligatoria" };
    }
    if (!Array.isArray(input.partidas)) {
      return { ok: false, error: "Las partidas son obligatorias" };
    }
    for (const p of input.partidas) {
      if (!p.partidaId || !Number.isFinite(p.cantidad)) {
        return { ok: false, error: "Cada partida debe tener un id y una cantidad válida" };
      }
    }
    await recibirOrden({ ordenId: input.ordenId, partidas: input.partidas });
    revalidatePath("/");
    revalidatePath("/movimientos");
    revalidatePath("/ordenes");
    revalidatePath(`/ordenes/${input.ordenId}`);
    revalidatePath("/catalogo");
    refresh();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al recibir la mercancía",
    };
  }
}
