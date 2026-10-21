import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { esAdmin } from "@/lib/auth";
import { cambiarEstadoProducto, updateProducto } from "@/lib/data";

const ESTADOS = ["activo", "inactivo", "agotado"] as const;
type Estado = (typeof ESTADOS)[number];

function esEstado(valor: unknown): valor is Estado {
  return typeof valor === "string" && (ESTADOS as readonly string[]).includes(valor);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await esAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { id } = await params;
  try {
    const body = await request.json();
    if (!body.nombre?.trim() || !body.sku?.trim()) {
      return NextResponse.json({ error: "Nombre y SKU son obligatorios" }, { status: 400 });
    }
    const data = await updateProducto(id, {
      nombre: body.nombre.trim(),
      sku: body.sku.trim(),
      categoriaId: body.categoriaId || null,
      codigoBarra: body.codigoBarra?.trim() ?? "",
      precioCosto: Number(body.precioCosto) || 0,
      precioVenta: Number(body.precioVenta) || 0,
      ubicacion: body.ubicacion?.trim() ?? "",
      unidad: body.unidad?.trim() || "pieza",
      estado: esEstado(body.estado) ? body.estado : "activo",
    });
    revalidatePath("/catalogo");
    revalidatePath(`/catalogo/${id}`);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar el producto" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await esAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { id } = await params;
  try {
    const body = await request.json();
    if (!esEstado(body.estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }
    await cambiarEstadoProducto(id, body.estado);
    revalidatePath("/catalogo");
    revalidatePath(`/catalogo/${id}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al cambiar el estado" },
      { status: 500 }
    );
  }
}
