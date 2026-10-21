"use client";

import { useTransition } from "react";
import { cambiarActivo, cambiarRol, eliminarUsuario } from "@/app/auth/actions";
import { TrashIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import type { Perfil, RolUsuario } from "@/lib/types";

const selectClasses =
  "h-8 rounded-lg border border-zinc-300 bg-white px-2 text-xs text-zinc-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400";

export function UsuarioAcciones({
  usuario,
  esUnoMismo,
}: {
  usuario: Perfil;
  esUnoMismo: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function onRolChange(rol: RolUsuario) {
    if (rol === usuario.rol) return;
    const fd = new FormData();
    fd.set("usuarioId", usuario.id);
    fd.set("rol", rol);
    startTransition(async () => {
      await cambiarRol(fd);
    });
  }

  function onToggleActivo() {
    const fd = new FormData();
    fd.set("usuarioId", usuario.id);
    fd.set("activo", usuario.activo ? "false" : "true");
    startTransition(async () => {
      await cambiarActivo(fd);
    });
  }

  function onEliminar() {
    const nombre = usuario.nombre || usuario.email;
    if (!window.confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return;
    const fd = new FormData();
    fd.set("usuarioId", usuario.id);
    startTransition(async () => {
      await eliminarUsuario(fd);
    });
  }

  if (esUnoMismo) {
    return <span className="text-xs text-zinc-400">Tu cuenta</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <select
        value={usuario.rol}
        onChange={(e) => onRolChange(e.target.value as RolUsuario)}
        disabled={pending}
        aria-label={`Rol de ${usuario.nombre || usuario.email}`}
        className={selectClasses}
      >
        <option value="operador">Operador</option>
        <option value="admin">Administrador</option>
      </select>
      <button
        type="button"
        onClick={onToggleActivo}
        disabled={pending}
        className={cn(
          "h-8 rounded-lg border px-2.5 text-xs font-medium transition-colors disabled:opacity-50",
          usuario.activo
            ? "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50"
            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        )}
      >
        {usuario.activo ? "Desactivar" : "Activar"}
      </button>
      <button
        type="button"
        onClick={onEliminar}
        disabled={pending}
        aria-label="Eliminar usuario"
        title="Eliminar usuario"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
