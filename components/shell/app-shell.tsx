import { Sidebar } from "@/components/shell/sidebar";
import type { Perfil } from "@/lib/types";

export function AppShell({ perfil, children }: { perfil: Perfil; children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-zinc-50">
      <Sidebar perfil={perfil} />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
