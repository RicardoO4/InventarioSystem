"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion } from "@/app/auth/actions";
import { LogOutIcon, MenuIcon, XIcon } from "@/components/icons";
import { navItems } from "@/components/shell/nav";
import { cn } from "@/lib/cn";
import type { Perfil } from "@/lib/types";

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <Image
        src="/images.png"
        alt="InventarioPro"
        width={36}
        height={36}
        className="h-9 w-9 rounded-lg object-contain"
      />
      <span className="text-lg font-semibold tracking-tight text-white">
        Inventario<span className="text-zinc-500">Pro</span>
      </span>
    </Link>
  );
}

function NavItems({ items }: { items: typeof navItems }) {
  const pathname = usePathname();

  const activeHref = useMemo(() => {
    const sorted = [...items].sort((a, b) => b.href.length - a.href.length);
    const match = sorted.find((item) => {
      if (item.href === "/") return pathname === "/";
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    });
    return match?.href ?? null;
  }, [pathname, items]);

  return (
    <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-5">
      {items.map((item) => {
        const active = item.href === activeHref;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", active ? "text-indigo-400" : "text-zinc-500")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function iniciales(perfil: Perfil): string {
  const base = perfil.nombre.trim() || perfil.email;
  const partes = base.split(/\s+/).filter(Boolean);
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

function UserCard({ perfil }: { perfil: Perfil }) {
  return (
    <div className="border-t border-zinc-800 p-3">
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white">
          {iniciales(perfil)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-200">
            {perfil.nombre || perfil.email}
          </p>
          <p className="truncate text-xs text-zinc-500">
            {perfil.rol === "admin" ? "Administrador" : "Operador"}
          </p>
        </div>
        <form action={cerrarSesion}>
          <button
            type="submit"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
          >
            <LogOutIcon className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export function Sidebar({ perfil }: { perfil: Perfil }) {
  const [open, setOpen] = useState(false);
  const items = useMemo(
    () => navItems.filter((item) => !item.soloAdmin || perfil.rol === "admin"),
    [perfil.rol]
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <Image
            src="/images.png"
            alt="InventarioPro"
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg object-contain"
          />
          <span className="font-semibold tracking-tight text-zinc-900">
            Inventario<span className="text-zinc-400">Pro</span>
          </span>
        </div>
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100"
          aria-label="Abrir menú"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </header>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-zinc-800 bg-zinc-950 lg:flex">
        <div className="flex h-16 items-center border-b border-zinc-800 px-5">
          <Brand />
        </div>
        <NavItems items={items} />
        <UserCard perfil={perfil} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-zinc-950/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-zinc-950 shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-5">
              <Brand />
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                aria-label="Cerrar menú"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <NavItems items={items} />
            <UserCard perfil={perfil} />
          </aside>
        </div>
      )}
    </>
  );
}

