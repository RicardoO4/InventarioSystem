import Link from "next/link";
import { ChevronRightIcon, PlusIcon, TruckIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { esAdmin } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { getProveedores } from "@/lib/data";

export default async function ProveedoresPage() {
  const [proveedores, admin] = await Promise.all([getProveedores(), esAdmin()]);

  return (
    <div>
      <PageHeader
        title="Proveedores"
        description="Administra a tus proveedores y su historial de compras."
        actions={
          admin ? (
            <ButtonLink href="/proveedores/nuevo">
              <PlusIcon className="h-4 w-4" />
              Nuevo proveedor
            </ButtonLink>
          ) : undefined
        }
      />

      {proveedores.length === 0 ? (
        <EmptyState
          icon={<TruckIcon className="h-5 w-5" />}
          title="Sin proveedores"
          description="Aún no hay proveedores registrados."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {proveedores.map((proveedor) => (
          <Link
            key={proveedor.id}
            href={`/proveedores/${proveedor.id}`}
            className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                  <TruckIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-zinc-900 group-hover:text-indigo-600">
                    {proveedor.nombre}
                  </h3>
                  <p className="truncate text-sm text-zinc-500">{proveedor.rfc}</p>
                </div>
              </div>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-zinc-300 group-hover:text-indigo-500" />
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-500">Contacto</dt>
                <dd className="truncate font-medium text-zinc-900">{proveedor.contacto}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-500">Teléfono</dt>
                <dd className="font-medium text-zinc-900">{proveedor.telefono}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-500">Correo</dt>
                <dd className="truncate font-medium text-zinc-900">{proveedor.correo}</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-sm">
              <div>
                <p className="text-xs text-zinc-500">Órdenes</p>
                <p className="font-semibold text-zinc-900">{proveedor.ordenes}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Valor total</p>
                <p className="font-semibold text-zinc-900">{formatCurrency(proveedor.valorTotal)}</p>
              </div>
              <Badge tone="blue">Entrega {proveedor.diasEntrega} días</Badge>
            </div>
          </Link>
        ))}
        </div>
      )}
    </div>
  );
}
