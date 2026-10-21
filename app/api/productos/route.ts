import { NextResponse } from "next/server";
import { esAdmin } from "@/lib/auth";
import { createProducto } from "@/lib/data";

export async function POST(request: Request) {
  if (!(await esAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  try {
    const body = await request.json();
    if (!body.nombre?.trim() || !body.sku?.trim()) {
      return NextResponse.json({ error: "Nombre y SKU son obligatorios" }, { status: 400 });
    }
    const data = await createProducto({
      nombre: body.nombre.trim(),
      sku: body.sku.trim(),
      categoriaId: body.categoriaId || null,
      codigoBarra: body.codigoBarra?.trim() ?? "",
      stock: Number(body.stock) || 0,
      stockMinimo: body.stockMinimo !== undefined ? Number(body.stockMinimo) : undefined,
      precioCosto: Number(body.precioCosto) || 0,
      precioVenta: Number(body.precioVenta) || 0,
      ubicacion: body.ubicacion?.trim() ?? "",
      unidad: body.unidad?.trim() || "pieza",
    });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear el producto" },
      { status: 500 }
    );
  }
}
