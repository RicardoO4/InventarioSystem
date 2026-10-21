import { MovimientoSection } from "@/components/movimientos/movimiento-section";
import { getMovimientos, getProductos } from "@/lib/data";

export default async function SalidasPage() {
  const [movimientos, productos] = await Promise.all([getMovimientos(), getProductos()]);
  return <MovimientoSection tipo="salida" movimientos={movimientos} productos={productos} />;
}
