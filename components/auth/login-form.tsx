"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { iniciarSesion } from "@/app/auth/actions";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({ errorInicial }: { errorInicial?: string }) {
  const [state, formAction, pending] = useActionState(iniciarSesion, null);
  const [mostrar, setMostrar] = useState(false);
  const mensajeError = state?.error ?? errorInicial;

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

      <label className="block text-sm font-medium text-zinc-700">
        Contraseña
        <div className="relative mt-1.5">
          <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            name="password"
            type={mostrar ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pl-9 pr-10"
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

      {mensajeError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{mensajeError}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Entrando…" : "Iniciar sesión"}
      </Button>

      <div className="text-center">
        <Link
          href="/auth/recuperar"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </form>
  );
}
