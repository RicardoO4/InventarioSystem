import { NextResponse } from "next/server";
import { esAdmin } from "@/lib/auth";
import { createCategoria } from "@/lib/data";

export async function POST(request: Request) {
  if (!(await esAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  try {
    const body = await request.json();
    if (!body.nombre?.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }
    const data = await createCategoria({
      nombre: body.nombre.trim(),
      descripcion: body.descripcion?.trim() ?? "",
      icono: body.icono ?? "box",
    });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear la categoría" },
      { status: 500 }
    );
  }
}
