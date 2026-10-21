import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createMovimiento } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.producto?.trim() || !body.cantidad || body.cantidad < 1) {
      return NextResponse.json({ error: "Producto y cantidad son obligatorios" }, { status: 400 });
    }
    if (body.tipo !== "entrada" && body.tipo !== "salida") {
      return NextResponse.json({ error: "Tipo de movimiento inválido" }, { status: 400 });
    }
    const data = await createMovimiento({
      tipo: body.tipo,
      producto: body.producto?.trim() ?? "",
      productoId: body.productoId ?? null,
      cantidad: Math.floor(Number(body.cantidad)),
      contraparte: body.contraparte?.trim() ?? "",
      referencia: body.referencia?.trim() ?? "",
    });
    revalidatePath("/");
    revalidatePath("/movimientos");
    revalidatePath("/catalogo");
    revalidatePath("/reportes/valoracion");
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al registrar el movimiento" },
      { status: 500 }
    );
  }
}
