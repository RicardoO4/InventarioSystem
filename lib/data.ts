import { cookies } from "next/headers";
import type {
  Categoria,
  Movimiento,
  Orden,
  OrdenPartida,
  Perfil,
  Producto,
  Proveedor,
  RolUsuario,
} from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { completarEAN13 } from "@/lib/barcode";

async function getSupabase() {
  return createClient(await cookies());
}

function nombreRelacionado(rel: unknown): string {
  const item = Array.isArray(rel) ? rel[0] : rel;
  return (item as { nombre?: string } | null)?.nombre ?? "";
}

function unidadRelacionada(rel: unknown): string | null {
  const item = Array.isArray(rel) ? rel[0] : rel;
  return (item as { unidad?: string } | null)?.unidad ?? null;
}

type PartidaOrdenRow = {
  id: string;
  orden_id: string;
  producto_id: string | null;
  producto_nombre: string;
  proveedor_id: string | null;
  proveedor_nombre: string | null;
  cantidad: number;
  cantidad_recibida: number | null;
  precio: number | null;
  subtotal: number | null;
  productos: unknown;
};

type PartidaOrdenRows = PartidaOrdenRow[];

export async function getCategorias(productos?: Producto[]): Promise<Categoria[]> {
  const supabase = await getSupabase();
  const { data: categorias, error } = await supabase
    .from("categorias")
    .select("id, nombre, descripcion, icono")
    .order("nombre");
  if (error) throw error;

  let filas: { categoria_id: string | null; stock: number | null; precio_costo: number | null }[];
  if (productos) {
    filas = productos.map((p) => ({
      categoria_id: p.categoriaId || null,
      stock: p.stock,
      precio_costo: p.precioCosto,
    }));
  } else {
    const { data } = await supabase
      .from("productos")
      .select("categoria_id, stock, precio_costo");
    filas = data ?? [];
  }

  const resumen = filas.reduce<Record<string, { productos: number; valor: number }>>(
    (acc, p) => {
      if (!p.categoria_id) return acc;
      acc[p.categoria_id] ??= { productos: 0, valor: 0 };
      acc[p.categoria_id].productos += 1;
      acc[p.categoria_id].valor += (p.stock ?? 0) * Number(p.precio_costo ?? 0);
      return acc;
    },
    {}
  );

  return (categorias ?? []).map((c) => ({
    id: c.id,
    nombre: c.nombre,
    descripcion: c.descripcion ?? "",
    icono: c.icono ?? "box",
    productos: resumen[c.id]?.productos ?? 0,
    valor: resumen[c.id]?.valor ?? 0,
  }));
}

export async function getProductos(): Promise<Producto[]> {
  const supabase = await getSupabase();
  const { data: productos, error } = await supabase
    .from("productos")
    .select(
      "id, sku, nombre, categoria_id, codigo_barra, stock, stock_minimo, precio_costo, precio_venta, ubicacion, estado, unidad, categorias(nombre)"
    )
    .order("nombre");

  if (error) throw error;

  return (productos ?? []).map((p) => ({
    id: p.id,
    sku: p.sku,
    nombre: p.nombre,
    categoriaId: p.categoria_id ?? "",
    categoria: nombreRelacionado(p.categorias),
    codigoBarra: p.codigo_barra ?? "",
    stock: p.stock,
    stockMinimo: p.stock_minimo,
    precioCosto: Number(p.precio_costo ?? 0),
    precioVenta: Number(p.precio_venta ?? 0),
    ubicacion: p.ubicacion ?? "",
    estado: p.estado,
    unidad: p.unidad,
  }));
}

export async function getMovimientos(): Promise<Movimiento[]> {
  const supabase = await getSupabase();
  const { data: movimientos, error } = await supabase
    .from("movimientos")
    .select(
      "id, folio, tipo, producto_id, cantidad, unidad, fecha, responsable, contraparte, referencia, productos(nombre)"
    )
    .order("fecha", { ascending: false });

  if (error) throw error;

  return (movimientos ?? []).map((m) => ({
    id: m.id,
    folio: m.folio,
    tipo: m.tipo,
    producto: nombreRelacionado(m.productos),
    productoId: m.producto_id ?? "",
    cantidad: m.cantidad,
    unidad: m.unidad,
    fecha: m.fecha,
    responsable: m.responsable ?? "",
    contraparte: m.contraparte ?? "",
    referencia: m.referencia ?? "",
  }));
}

export type CostoReal = {
  costoPromedio: number;
  cantidad: number;
  valor: number;
};

export async function getCostosReales(): Promise<Record<string, CostoReal>> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("movimientos")
    .select("producto_id, cantidad, costo_unitario")
    .eq("tipo", "entrada")
    .not("costo_unitario", "is", null)
    .not("producto_id", "is", null);

  if (error) throw error;

  const acumulado: Record<string, { cantidad: number; valor: number }> = {};
  for (const m of data ?? []) {
    const id = m.producto_id;
    if (!id) continue;
    const costo = Number(m.costo_unitario);
    if (!(costo > 0)) continue;
    acumulado[id] ??= { cantidad: 0, valor: 0 };
    acumulado[id].cantidad += m.cantidad;
    acumulado[id].valor += m.cantidad * costo;
  }

  const resultado: Record<string, CostoReal> = {};
  for (const [id, valor] of Object.entries(acumulado)) {
    if (valor.cantidad > 0) {
      resultado[id] = {
        cantidad: valor.cantidad,
        valor: valor.valor,
        costoPromedio: valor.valor / valor.cantidad,
      };
    }
  }
  return resultado;
}

export async function getProveedores(): Promise<Proveedor[]> {
  const supabase = await getSupabase();
  const [proveedoresRes, ordenesRes] = await Promise.all([
    supabase
      .from("proveedores")
      .select("id, nombre, contacto, telefono, correo, rfc, dias_entrega")
      .order("nombre"),
    supabase.from("ordenes").select("proveedor_id, total"),
  ]);

  if (proveedoresRes.error) throw proveedoresRes.error;

  const resumen = (ordenesRes.data ?? []).reduce<Record<string, { ordenes: number; valorTotal: number }>>(
    (acc, o) => {
      if (!o.proveedor_id) return acc;
      acc[o.proveedor_id] ??= { ordenes: 0, valorTotal: 0 };
      acc[o.proveedor_id].ordenes += 1;
      acc[o.proveedor_id].valorTotal += Number(o.total ?? 0);
      return acc;
    },
    {}
  );

  return (proveedoresRes.data ?? []).map((p) => ({
    id: p.id,
    nombre: p.nombre,
    contacto: p.contacto ?? "",
    telefono: p.telefono ?? "",
    correo: p.correo ?? "",
    rfc: p.rfc ?? "",
    diasEntrega: p.dias_entrega ?? 0,
    ordenes: resumen[p.id]?.ordenes ?? 0,
    valorTotal: resumen[p.id]?.valorTotal ?? 0,
  }));
}

export async function getOrdenes(): Promise<Orden[]> {
  const supabase = await getSupabase();
  const { data: ordenes, error } = await supabase
    .from("ordenes")
    .select("id, folio, proveedor_id, fecha, estado, partidas, total, proveedores(nombre)")
    .order("fecha", { ascending: false });

  if (error) throw error;

  return (ordenes ?? []).map((o) => ({
    id: o.id,
    folio: o.folio,
    proveedorId: o.proveedor_id ?? "",
    proveedor: nombreRelacionado(o.proveedores),
    fecha: o.fecha,
    estado: o.estado,
    partidas: o.partidas,
    total: Number(o.total ?? 0),
  }));
}

export async function getOrden(id: string): Promise<Orden | null> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("ordenes")
    .select("id, folio, proveedor_id, fecha, estado, partidas, total, proveedores(nombre)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    folio: data.folio,
    proveedorId: data.proveedor_id ?? "",
    proveedor: nombreRelacionado(data.proveedores),
    fecha: data.fecha,
    estado: data.estado,
    partidas: data.partidas,
    total: Number(data.total ?? 0),
  };
}

export async function getOrdenPartidas(ordenId: string): Promise<OrdenPartida[]> {
  const supabase = await getSupabase();
  const { data: partidas, error } = await supabase
    .from("orden_partidas")
    .select(
      "id, orden_id, producto_id, producto_nombre, proveedor_id, proveedor_nombre, cantidad, cantidad_recibida, precio, subtotal, productos(nombre), proveedores(nombre)"
    )
    .eq("orden_id", ordenId)
    .order("created_at");

  if (error) throw error;

  return (partidas ?? []).map((p) => ({
    id: p.id,
    ordenId: p.orden_id,
    productoId: p.producto_id ?? "",
    producto: nombreRelacionado(p.productos) || p.producto_nombre,
    proveedorId: p.proveedor_id ?? "",
    proveedor: nombreRelacionado(p.proveedores) || p.proveedor_nombre,
    cantidad: p.cantidad,
    cantidadRecibida: p.cantidad_recibida ?? 0,
    precio: Number(p.precio ?? 0),
    subtotal: Number(p.subtotal ?? 0),
  }));
}

export async function getStockBajo(): Promise<Producto[]> {
  const productos = await getProductos();
  return productos
    .filter((p) => p.stock <= p.stockMinimo)
    .sort((a, b) => a.stock / a.stockMinimo - b.stock / b.stockMinimo);
}

export async function getPerfiles(): Promise<Perfil[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("perfiles")
    .select("id, nombre, email, rol, activo")
    .order("nombre");

  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id,
    nombre: p.nombre ?? "",
    email: p.email ?? "",
    rol: p.rol as RolUsuario,
    activo: p.activo,
  }));
}

export async function createCategoria(datos: { nombre: string; descripcion: string; icono: string }) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("categorias")
    .insert({ nombre: datos.nombre, descripcion: datos.descripcion, icono: datos.icono })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createProducto(datos: {
  sku: string;
  nombre: string;
  categoriaId: string | null;
  codigoBarra?: string;
  stock: number;
  stockMinimo?: number;
  precioCosto: number;
  precioVenta: number;
  ubicacion: string;
  unidad: string;
}) {
  const supabase = await getSupabase();
  let codigoBarra: string | null = null;
  if (datos.codigoBarra?.trim()) {
    codigoBarra = completarEAN13(datos.codigoBarra);
    if (!codigoBarra) throw new Error("Código de barras EAN-13 inválido");
  }
  const { data, error } = await supabase
    .from("productos")
    .insert({
      sku: datos.sku,
      nombre: datos.nombre,
      categoria_id: datos.categoriaId || null,
      codigo_barra: codigoBarra,
      stock: datos.stock,
      stock_minimo: datos.stockMinimo ?? datos.stock,
      precio_costo: datos.precioCosto,
      precio_venta: datos.precioVenta,
      ubicacion: datos.ubicacion,
      unidad: datos.unidad,
      estado: "activo",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProducto(
  id: string,
  datos: {
    sku: string;
    nombre: string;
    categoriaId: string | null;
    codigoBarra?: string;
    precioCosto: number;
    precioVenta: number;
    ubicacion: string;
    unidad: string;
    estado: "activo" | "inactivo" | "agotado";
  }
) {
  const supabase = await getSupabase();
  let codigoBarra: string | null = null;
  if (datos.codigoBarra?.trim()) {
    codigoBarra = completarEAN13(datos.codigoBarra);
    if (!codigoBarra) throw new Error("Código de barras EAN-13 inválido");
  }
  const { data, error } = await supabase
    .from("productos")
    .update({
      sku: datos.sku,
      nombre: datos.nombre,
      categoria_id: datos.categoriaId || null,
      codigo_barra: codigoBarra,
      precio_costo: datos.precioCosto,
      precio_venta: datos.precioVenta,
      ubicacion: datos.ubicacion,
      unidad: datos.unidad,
      estado: datos.estado,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function cambiarEstadoProducto(
  id: string,
  estado: "activo" | "inactivo" | "agotado"
) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("productos")
    .update({ estado })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("No se pudo actualizar el producto (permisos insuficientes).");
  return data;
}

export async function createMovimiento(datos: {
  tipo: "entrada" | "salida";
  producto: string;
  productoId?: string | null;
  cantidad: number;
  contraparte: string;
  referencia: string;
  costoUnitario?: number | null;
}) {
  const supabase = await getSupabase();
  const productoQuery = supabase.from("productos").select("id, nombre, unidad, stock");
  const productoRes = await (datos.productoId
    ? productoQuery.eq("id", datos.productoId).limit(1).maybeSingle()
    : productoQuery.ilike("nombre", datos.producto).limit(1).maybeSingle());

  const producto = productoRes.data;
  if (!producto) throw new Error("Producto no encontrado");

  const stockActual = producto.stock ?? 0;
  const nuevoStock =
    datos.tipo === "entrada" ? stockActual + datos.cantidad : stockActual - datos.cantidad;
  if (datos.tipo === "salida" && nuevoStock < 0) {
    throw new Error(
      `Stock insuficiente: solo hay ${stockActual} ${producto.unidad ?? "pieza"}`
    );
  }

  const { data, error } = await supabase
    .from("movimientos")
    .insert({
      tipo: datos.tipo,
      producto_id: producto.id,
      cantidad: datos.cantidad,
      unidad: producto.unidad ?? "pieza",
      responsable: "",
      contraparte: datos.contraparte,
      referencia: datos.referencia,
      costo_unitario:
        datos.costoUnitario && datos.costoUnitario > 0 ? datos.costoUnitario : null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  return data;
}

export async function createOrden(datos: {
  notas: string;
  partidas: {
    productoId?: string | null;
    producto: string;
    proveedorId: string;
    proveedor: string;
    cantidad: number;
    precio: number;
  }[];
}) {
  const supabase = await getSupabase();
  if (datos.partidas.length === 0) {
    throw new Error("La orden debe tener al menos una partida");
  }

  const proveedorIds = [...new Set(datos.partidas.map((p) => p.proveedorId))];
  if (proveedorIds.length !== 1) {
    const err = new Error(
      "Todas las partidas de la orden deben ser del mismo proveedor"
    ) as Error & { status?: number };
    err.status = 400;
    throw err;
  }
  const proveedorId = proveedorIds[0];

  const proveedorRes = await supabase
    .from("proveedores")
    .select("id, nombre")
    .eq("id", proveedorId)
    .limit(1)
    .maybeSingle();

  const proveedor = proveedorRes.data;
  if (!proveedor) {
    throw new Error("El proveedor de la orden no está registrado");
  }

  const filas = datos.partidas.map((p) => {
    const cantidad = Math.max(1, Math.round(p.cantidad));
    const precio = Math.max(0, p.precio || 0);
    return {
      producto_id: p.productoId || null,
      producto_nombre: p.producto.trim(),
      proveedor_id: p.proveedorId,
      proveedor_nombre: proveedor.nombre,
      cantidad,
      precio,
      subtotal: cantidad * precio,
    };
  });
  const total = filas.reduce((sum, f) => sum + f.subtotal, 0);

  const { data, error } = await supabase
    .from("ordenes")
    .insert({
      proveedor_id: proveedor.id,
      estado: "pendiente",
      partidas: filas.length,
      total,
      notas: datos.notas,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const { error: partidasError } = await supabase
    .from("orden_partidas")
    .insert(filas.map((f) => ({ ...f, orden_id: data.id })));
  if (partidasError) {
    await supabase.from("ordenes").delete().eq("id", data.id);
    throw new Error(partidasError.message);
  }

  return data;
}

export async function cancelarOrden(ordenId: string) {
  const supabase = await getSupabase();

  const { data: orden } = await supabase
    .from("ordenes")
    .select("id, folio, estado")
    .eq("id", ordenId)
    .limit(1)
    .maybeSingle();
  if (!orden) throw new Error("Orden de compra no encontrada");

  if (orden.estado !== "pendiente" && orden.estado !== "recibida_parcial") {
    const err = new Error(
      orden.estado === "cancelada"
        ? "La orden ya está cancelada"
        : "Solo se pueden cancelar órdenes pendientes o parcialmente recibidas"
    ) as Error & { status?: number };
    err.status = 400;
    throw err;
  }

  const { data, error } = await supabase
    .from("ordenes")
    .update({ estado: "cancelada" })
    .eq("id", ordenId)
    .select()
    .single();
  if (error) throw new Error(error.message);

  return data;
}

export async function recibirOrden(datos: {
  ordenId: string;
  partidas: { partidaId: string; cantidad: number }[];
}) {
  const supabase = await getSupabase();

  const [ordenRes, partidasRes] = await Promise.all([
    supabase
      .from("ordenes")
      .select("id, folio, proveedor_id, estado")
      .eq("id", datos.ordenId)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("orden_partidas")
      .select(
        "id, orden_id, producto_id, producto_nombre, proveedor_id, proveedor_nombre, cantidad, cantidad_recibida, precio, subtotal, productos(unidad)"
      )
      .eq("orden_id", datos.ordenId),
  ]);

  const orden = ordenRes.data;
  if (!orden) throw new Error("Orden de compra no encontrada");

  if (orden.estado !== "pendiente" && orden.estado !== "recibida_parcial") {
    throw new Error("Esta orden ya fue recibida o cancelada");
  }

  const partidas = partidasRes.data as PartidaOrdenRows | null;
  if (!partidas) throw new Error("Error al leer las partidas de la orden");

  const partidaMap = new Map(partidas.map((p) => [p.id, p]));

  const recibos: { partida: PartidaOrdenRow; cantidad: number }[] = [];
  for (const item of datos.partidas) {
    const cantidad = Math.max(0, Math.floor(Number(item.cantidad) || 0));
    if (cantidad === 0) continue;

    const partida = partidaMap.get(item.partidaId);
    if (!partida) {
      const err = new Error("Partida no encontrada en la orden") as Error & { status?: number };
      err.status = 400;
      throw err;
    }
    if (!partida.producto_id) {
      throw new Error(`El producto de "${item.partidaId}" ya no está registrado`);
    }

    recibos.push({ partida, cantidad });
  }

  if (recibos.length > 0) {
    const proveedorRes = await supabase
      .from("proveedores")
      .select("nombre")
      .eq("id", orden.proveedor_id)
      .limit(1)
      .maybeSingle();

    const contraparte = proveedorRes.data?.nombre ?? "";

    const filasMovimiento = recibos.map((r) => ({
      tipo: "entrada" as const,
      producto_id: r.partida.producto_id,
      cantidad: r.cantidad,
      unidad: unidadRelacionada(r.partida.productos) ?? "pieza",
      responsable: "",
      contraparte,
      referencia: orden.folio,
      costo_unitario:
        r.partida.precio && Number(r.partida.precio) > 0 ? Number(r.partida.precio) : null,
    }));

    const { error: movError } = await supabase.from("movimientos").insert(filasMovimiento);
    if (movError) throw new Error(movError.message);

    const resultados = await Promise.all(
      recibos.map((r) => {
        const nuevaRecibida = (r.partida.cantidad_recibida ?? 0) + r.cantidad;
        r.partida.cantidad_recibida = nuevaRecibida;
        return supabase
          .from("orden_partidas")
          .update({ cantidad_recibida: nuevaRecibida })
          .eq("id", r.partida.id);
      })
    );
    const fallo = resultados.find((r) => r.error);
    if (fallo?.error) throw new Error(fallo.error.message);
  }

  let algunaRecibida = false;
  let todasCompletas = partidas.length > 0;
  for (const p of partidas) {
    const recibida = p.cantidad_recibida ?? 0;
    if (recibida > 0) algunaRecibida = true;
    if (recibida < p.cantidad) todasCompletas = false;
  }

  let nuevoEstado = orden.estado;
  if (todasCompletas && algunaRecibida) nuevoEstado = "recibida";
  else if (algunaRecibida) nuevoEstado = "recibida_parcial";

  if (nuevoEstado !== orden.estado) {
    const { error } = await supabase
      .from("ordenes")
      .update({ estado: nuevoEstado })
      .eq("id", orden.id);
    if (error) throw new Error(error.message);
  }

  return { estado: nuevoEstado, folio: orden.folio };
}

export async function createProveedor(datos: {
  nombre: string;
  contacto: string;
  telefono: string;
  correo: string;
  rfc: string;
}) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("proveedores")
    .insert({
      nombre: datos.nombre,
      contacto: datos.contacto,
      telefono: datos.telefono,
      correo: datos.correo,
      rfc: datos.rfc,
      dias_entrega: 0,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
