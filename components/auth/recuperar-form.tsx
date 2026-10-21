"use client";

import { useActionState } from "react";
import Link from "next/link";
import { recuperarContrasena } from "@/app/auth/actions";
import { MailIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RecuperarForm() {
  const [state, formAction, pending] = useActionState(recuperarContrasena, null);

  if (state?.ok) {
    return (
      <div className="space-y-4 text-center">
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.ok}</p>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <label className="block text-sm font-medium text-zinc-700">
        Correo
        <div className="relative mt-1.5">
          <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu-correo@dominio.mx"
            className="pl-9"
            required
          />
        </div>
      </label>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Enviando…" : "Enviar enlace de recuperación"}
      </Button>

      <div className="text-center">
        <Link
          href="/login"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    </form>
  );
}
