import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { esAdmin } from "@/lib/auth";
import { cancelarOrden } from "@/lib/data";

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
    if (!body.ordenId) {
      return NextResponse.json({ error: "La orden de compra es obligatoria" }, { status: 400 });
    }
    const data = await cancelarOrden(body.ordenId);
    revalidatePath("/");
    revalidatePath("/ordenes");
    revalidatePath(`/ordenes/${body.ordenId}`);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al cancelar la orden" },
      { status: statusDeError(error) }
    );
  }
}
