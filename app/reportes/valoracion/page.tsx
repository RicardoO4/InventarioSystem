import Link from "next/link";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  CircleDollarSignIcon,
  PackageIcon,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableContainer,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { getCategorias, getCostosReales, getProductos } from "@/lib/data";

export default async function ValoracionPage() {
  const productos = await getProductos();
  const [categorias, costosReales] = await Promise.all([
    getCategorias(productos),
    getCostosReales(),
  ]);

  const productosConCosto = productos.map((p) => {
    const real = costosReales[p.id];
    const tieneReal = Boolean(real);
    return {
      ...p,
      costoTieneReal: tieneReal,
      costoUnitario: real ? real.costoPromedio : p.precioCosto,
    };
  });

  const valorCosto = productosConCosto.reduce((acc, p) => acc + p.stock * p.costoUnitario, 0);
  const valorVenta = productosConCosto.reduce((acc, p) => acc + p.stock * p.precioVenta, 0);
  const margen = valorVenta > 0 ? ((valorVenta - valorCosto) / valorVenta) * 100 : 0;
  const conReal = productosConCosto.filter((p) => p.costoTieneReal).length;
  const estimados = productosConCosto.length - conReal;

  const filasCat = categorias.map((categoria) => {
    const productosCat = productosConCosto.filter((p) => p.categoriaId === categoria.id);
    const costo = productosCat.reduce((acc, p) => acc + p.stock * p.costoUnitario, 0);
    const venta = productosCat.reduce((acc, p) => acc + p.stock * p.precioVenta, 0);
    return {
      id: categoria.id,
      nombre: categoria.nombre,
      cantidad: productosCat.length,
      costo,
      venta,
      margen: venta > 0 ? (venta - costo) / venta : 0,
    };
  });

  const filasProd = [...productosConCosto].sort(
    (a, b) => b.stock * b.costoUnitario - a.stock * a.costoUnitario
  );

  return (
    <div>
      <PageHeader
        title="Valoración del inventario"
        description="Valor de tus existencias a costo real (promedio de compras) y a precio de venta."
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Valor a costo real</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight text-zinc-900">
              {formatCurrency(valorCosto)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Valor a venta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight text-zinc-900">
              {formatCurrency(valorVenta)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Margen potencial</CardTitle>
            <CardDescription>Ganancia bruta estimada</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight text-emerald-600">
              {margen.toFixed(1)}%
            </p>
            <p className="mt-1 text-sm text-zinc-500">{formatCurrency(valorVenta - valorCosto)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cobertura de costo real</CardTitle>
            <CardDescription>Productos con compras registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight text-zinc-900">
              {conReal}/{productosConCosto.length || 0}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {estimados > 0 ? `${estimados} con costo estimado` : "Todos con costo real"}
            </p>
          </CardContent>
        </Card>
      </div>

      {filasProd.length === 0 ? (
        <EmptyState
          icon={<CircleDollarSignIcon className="h-5 w-5" />}
          title="Sin datos para valorar"
          description="Registra productos y recibe compras para ver la valoración del inventario."
        />
      ) : (
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-sm font-semibold text-zinc-900">Resumen por categoría</h2>
            <TableContainer>
              <Table>
                <THead>
                  <Tr>
                    <Th>Categoría</Th>
                    <Th className="text-right">Productos</Th>
                    <Th className="text-right">Valor a costo real</Th>
                    <Th className="text-right">Valor a venta</Th>
                    <Th className="text-right">Margen</Th>
                  </Tr>
                </THead>
                <TBody>
                  {filasCat.map((fila) => (
                    <Tr key={fila.id}>
                      <Td className="font-medium text-zinc-900">{fila.nombre}</Td>
                      <Td className="text-right text-zinc-900">{fila.cantidad}</Td>
                      <Td className="text-right text-zinc-900">{formatCurrency(fila.costo)}</Td>
                      <Td className="text-right text-zinc-900">{formatCurrency(fila.venta)}</Td>
                      <Td className="text-right">
                        <Badge tone={fila.margen >= 0.2 ? "green" : "amber"}>
                          {(fila.margen * 100).toFixed(1)}%
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </TableContainer>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-zinc-900">Desglose por producto</h2>
            <TableContainer>
              <Table>
                <THead>
                  <Tr>
                    <Th>Producto</Th>
                    <Th>Categoría</Th>
                    <Th className="text-right">Stock</Th>
                    <Th className="text-right">Costo unitario</Th>
                    <Th className="text-right">Valor a costo</Th>
                    <Th className="text-right">Valor a venta</Th>
                    <Th className="text-right">Margen</Th>
                  </Tr>
                </THead>
                <TBody>
                  {filasProd.map((p) => {
                    const valorProducto = p.stock * p.costoUnitario;
                    const valorVentaProducto = p.stock * p.precioVenta;
                    const margenProducto =
                      valorVentaProducto > 0
                        ? (valorVentaProducto - valorProducto) / valorVentaProducto
                        : 0;
                    return (
                      <Tr key={p.id}>
                        <Td>
                          <Link href={`/catalogo/${p.id}`} className="group block">
                            <p className="font-medium text-zinc-900 group-hover:text-indigo-600">
                              {p.nombre}
                            </p>
                            <p className="font-mono text-xs text-zinc-400">{p.sku}</p>
                          </Link>
                        </Td>
                        <Td className="text-zinc-500">{p.categoria || "—"}</Td>
                        <Td className="text-right text-zinc-900">
                          {p.stock} {p.unidad}
                        </Td>
                        <Td className="text-right">
                          <span className="inline-flex items-center justify-end gap-2">
                            {formatCurrency(p.costoUnitario)}
                            {p.costoTieneReal ? (
                              <Badge tone="green">
                                <CheckCircleIcon className="h-3 w-3" />
                                Real
                              </Badge>
                            ) : (
                              <Badge tone="gray">
                                <AlertTriangleIcon className="h-3 w-3" />
                                Estimado
                              </Badge>
                            )}
                          </span>
                        </Td>
                        <Td className="text-right font-medium text-zinc-900">
                          {formatCurrency(valorProducto)}
                        </Td>
                        <Td className="text-right text-zinc-900">
                          {formatCurrency(valorVentaProducto)}
                        </Td>
                        <Td className="text-right">
                          <Badge tone={margenProducto >= 0.2 ? "green" : "amber"}>
                            {(margenProducto * 100).toFixed(1)}%
                          </Badge>
                        </Td>
                      </Tr>
                    );
                  })}
                </TBody>
              </Table>
            </TableContainer>
          </section>
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 text-xs text-zinc-400">
        <PackageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        El costo real es el promedio ponderado de las entradas con costo (recepción de órdenes y
        entradas manuales). Los productos sin compras registradas se valoran con su precio de costo
        y se marcan como «Estimado». Haz clic en un producto para abrir su ficha en el catálogo.
      </p>
    </div>
  );
}
