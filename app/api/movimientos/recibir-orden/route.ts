import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { recibirOrden } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.ordenId) {
      return NextResponse.json({ error: "La orden de compra es obligatoria" }, { status: 400 });
    }
    if (!Array.isArray(body.partidas)) {
      return NextResponse.json({ error: "Las partidas son obligatorias" }, { status: 400 });
    }
    for (const p of body.partidas) {
      if (!p.partidaId || !Number.isFinite(p.cantidad)) {
        return NextResponse.json(
          { error: "Cada partida debe tener un id y una cantidad válida" },
          { status: 400 }
        );
      }
    }
    const data = await recibirOrden({
      ordenId: body.ordenId,
      partidas: body.partidas.map((p: { partidaId: string; cantidad: number }) => ({
        partidaId: p.partidaId,
        cantidad: p.cantidad,
      })),
    });
    revalidatePath("/");
    revalidatePath("/movimientos");
    revalidatePath("/ordenes");
    revalidatePath(`/ordenes/${body.ordenId}`);
    revalidatePath("/catalogo");
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? ((error as { status?: unknown }).status ?? 500)
        : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al recibir la mercancía" },
      { status: typeof status === "number" ? status : 500 }
    );
  }
}
