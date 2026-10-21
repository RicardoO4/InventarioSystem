import { requireAdmin } from "@/lib/auth";

export default async function ConfiguracionLayout({ children }: LayoutProps<"/configuracion">) {
  await requireAdmin();
  return children;
}
