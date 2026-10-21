import Link from "next/link";
import { SlidersIcon } from "@/components/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const secciones = [
  {
    titulo: "Usuarios y permisos",
    descripcion: "Administra los accesos y roles del sistema.",
    href: "/configuracion/usuarios",
  },
  { titulo: "Datos de la empresa", descripcion: "Nombre, RFC y dirección que aparecen en documentos." },
  { titulo: "Unidades y moneda", descripcion: "Configuración regional, unidades de medida y formato de moneda." },
  { titulo: "Umbrales de stock", descripcion: "Definir mínimos y máximos para alertas de inventario." },
  { titulo: "Notificaciones", descripcion: "Alertas de stock bajo y órdenes pendientes." },
  { titulo: "Apariencia", descripcion: "Marca personalizada y color de acento." },
];

export default function ConfiguracionPage() {
  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Ajustes generales de la aplicación."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {secciones.map((item) => {
          const contenido = (
            <Card className={item.href ? "h-full transition-colors hover:border-indigo-200" : "h-full"}>
              <CardHeader className="border-none">
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                    <SlidersIcon className="h-4 w-4" />
                  </span>
                  {item.titulo}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription>{item.descripcion}</CardDescription>
              </CardContent>
            </Card>
          );

          if (!item.href) return <div key={item.titulo}>{contenido}</div>;

          return (
            <Link key={item.titulo} href={item.href} className="block">
              {contenido}
            </Link>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-zinc-400">
        Las secciones sin enlace aún no están disponibles.
      </p>
    </div>
  );
}
