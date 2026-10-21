import { MovimientoSection } from "@/components/movimientos/movimiento-section";
import { getMovimientos, getProductos, getProveedores } from "@/lib/data";

export default async function EntradasPage() {
  const [movimientos, productos, proveedores] = await Promise.all([
    getMovimientos(),
    getProductos(),
    getProveedores(),
  ]);
  return (
    <MovimientoSection
      tipo="entrada"
      movimientos={movimientos}
      productos={productos}
      proveedores={proveedores}
    />
  );
}
