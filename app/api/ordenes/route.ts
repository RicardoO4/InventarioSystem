import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { esAdmin } from "@/lib/auth";
import { createOrden } from "@/lib/data";

type PartidaInput = {
  productoId?: string | null;
  producto?: string;
  proveedorId?: string;
  proveedor?: string;
  cantidad?: number;
  precio?: number;
};

function statusDeError(error: unknown): number {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }
  return 500;
}

export async function POST(request: Request) {
  if (!(await esAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  try {
    const body = await request.json();

    const partidas: PartidaInput[] = Array.isArray(body.partidas) ? body.partidas : [];
    if (partidas.length === 0) {
      return NextResponse.json({ error: "Agrega al menos una partida" }, { status: 400 });
    }

    const proveedorIds = new Set<string>();
    for (const p of partidas) {
      if (!p.producto?.trim()) {
        return NextResponse.json({ error: "Cada partida debe tener un producto" }, { status: 400 });
      }
      if (!p.proveedorId) {
        return NextResponse.json(
          { error: "Cada partida debe tener un proveedor seleccionado" },
          { status: 400 }
        );
      }
      if (!Number.isFinite(p.cantidad) || p.cantidad! <= 0) {
        return NextResponse.json({ error: "La cantidad debe ser mayor a cero" }, { status: 400 });
      }
      if (!Number.isFinite(p.precio) || p.precio! < 0) {
        return NextResponse.json({ error: "El precio debe ser mayor o igual a cero" }, { status: 400 });
      }
      proveedorIds.add(p.proveedorId);
    }

    if (proveedorIds.size > 1) {
      return NextResponse.json(
        { error: "Todas las partidas de la orden deben ser del mismo proveedor" },
        { status: 400 }
      );
    }

    const data = await createOrden({
      notas: body.notas?.trim() ?? "",
      partidas: partidas.map((p) => ({
        producto: p.producto!.trim(),
        productoId: p.productoId ?? null,
        proveedorId: p.proveedorId!,
        proveedor: p.proveedor?.trim() ?? "",
        cantidad: p.cantidad!,
        precio: p.precio!,
      })),
    });
    revalidatePath("/");
    revalidatePath("/ordenes");
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear la orden" },
      { status: statusDeError(error) }
    );
  }
}
