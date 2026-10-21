"use client";

import { useActionState, useState } from "react";
import { invitarUsuario } from "@/app/auth/actions";
import { PlusIcon, UsersIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

const selectClasses =
  "mt-1.5 h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400";

export function InvitarUsuarioForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(invitarUsuario, null);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <PlusIcon className="h-4 w-4" />
        Agregar usuario
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Agregar usuario"
        description="Se enviará un correo con un enlace para establecer su contraseña."
        icon={<UsersIcon className="h-5 w-5" />}
        footer={
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        }
      >
        <form action={formAction} className="space-y-4">
          <label className="block text-sm font-medium text-zinc-700">
            Nombre
            <Input name="nombre" placeholder="Nombre completo" className="mt-1.5" />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Correo *
            <Input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="usuario@dominio.mx"
              className="mt-1.5"
              required
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Rol
            <select name="rol" defaultValue="operador" className={selectClasses}>
              <option value="operador">Operador</option>
              <option value="admin">Administrador</option>
            </select>
          </label>

          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>
          )}
          {state?.ok && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{state.ok}</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Agregando…" : "Agregar usuario"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
