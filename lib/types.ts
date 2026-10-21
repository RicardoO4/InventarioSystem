export type RolUsuario = "admin" | "operador";

export type Perfil = {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
};

export type Categoria = {
  id: string;
  nombre: string;
  descripcion: string;
  productos: number;
  valor: number;
  icono?: string;
};

export type EstadoProducto = "activo" | "inactivo" | "agotado";

export type Producto = {
  id: string;
  sku: string;
  nombre: string;
  categoriaId: string;
  categoria: string;
  codigoBarra: string;
  stock: number;
  stockMinimo: number;
  precioCosto: number;
  precioVenta: number;
  ubicacion: string;
  estado: EstadoProducto;
  unidad: string;
};

export type TipoMovimiento = "entrada" | "salida";

export type Movimiento = {
  id: string;
  folio: string;
  tipo: TipoMovimiento;
  producto: string;
  productoId: string;
  cantidad: number;
  unidad: string;
  fecha: string;
  responsable: string;
  contraparte: string;
  referencia: string;
};

export type EstadoOrden = "pendiente" | "recibida" | "recibida_parcial" | "cancelada";

export type Orden = {
  id: string;
  folio: string;
  proveedorId: string;
  proveedor: string;
  fecha: string;
  estado: EstadoOrden;
  partidas: number;
  total: number;
};

export type OrdenPartida = {
  id: string;
  ordenId: string;
  productoId: string;
  producto: string;
  proveedorId: string;
  proveedor: string;
  cantidad: number;
  cantidadRecibida: number;
  precio: number;
  subtotal: number;
};

export type Proveedor = {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  correo: string;
  rfc: string;
  ordenes: number;
  valorTotal: number;
  diasEntrega: number;
};
