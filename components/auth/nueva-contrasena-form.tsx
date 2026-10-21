"use client";

import { useActionState, useState } from "react";
import { actualizarContrasena } from "@/app/auth/actions";
import { EyeIcon, EyeOffIcon, LockIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NuevaContrasenaForm() {
  const [state, formAction, pending] = useActionState(actualizarContrasena, null);
  const [mostrar, setMostrar] = useState(false);

  const tipo = mostrar ? "text" : "password";

  return (
    <form action={formAction} className="space-y-4">
      <label className="block text-sm font-medium text-zinc-700">
        Nueva contraseña
        <div className="relative mt-1.5">
          <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            name="password"
            type={tipo}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            className="pl-9 pr-10"
            minLength={8}
            required
          />
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setMostrar((v) => !v)}
            aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            {mostrar ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </button>
        </div>
      </label>

      <label className="block text-sm font-medium text-zinc-700">
        Confirmar contraseña
        <div className="relative mt-1.5">
          <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            name="confirmar"
            type={tipo}
            autoComplete="new-password"
            placeholder="Repite la contraseña"
            className="pl-9"
            minLength={8}
            required
          />
        </div>
      </label>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Guardando…" : "Actualizar contraseña"}
      </Button>
    </form>
  );
}
