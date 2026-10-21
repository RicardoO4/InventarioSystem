import { NextResponse } from "next/server";
import { esAdmin } from "@/lib/auth";
import { createProveedor } from "@/lib/data";

export async function POST(request: Request) {
  if (!(await esAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  try {
    const body = await request.json();
    if (!body.nombre?.trim()) {
      return NextResponse.json({ error: "La razón social es obligatoria" }, { status: 400 });
    }
    const data = await createProveedor({
      nombre: body.nombre.trim(),
      contacto: body.contacto?.trim() ?? "",
      telefono: body.telefono?.trim() ?? "",
      correo: body.correo?.trim() ?? "",
      rfc: body.rfc?.trim() ?? "",
    });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear el proveedor" },
      { status: 500 }
    );
  }
}
