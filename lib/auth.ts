import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Perfil, RolUsuario } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export const getUserId = cache(async (): Promise<string | null> => {
  try {
    const supabase = createClient(await cookies());
    const { data } = await supabase.auth.getClaims();
    const sub = data?.claims?.sub;
    return typeof sub === "string" ? sub : null;
  } catch {
    return null;
  }
});

export const getPerfil = cache(async (): Promise<Perfil | null> => {
  try {
    const supabase = createClient(await cookies());
    const { data: claims } = await supabase.auth.getClaims();
    const id = claims?.claims?.sub;
    if (typeof id !== "string") return null;

    const { data, error } = await supabase
      .from("perfiles")
      .select("id, nombre, email, rol, activo")
      .eq("id", id)
      .maybeSingle();

    if (error || !data || !data.activo) return null;

    return {
      id: data.id,
      nombre: data.nombre ?? "",
      email: data.email ?? "",
      rol: data.rol as RolUsuario,
      activo: data.activo,
    };
  } catch {
    return null;
  }
});

export async function esAdmin(): Promise<boolean> {
  const perfil = await getPerfil();
  return perfil?.rol === "admin";
}

export async function requirePerfil(): Promise<Perfil> {
  const perfil = await getPerfil();
  if (!perfil) redirect("/login");
  return perfil;
}

export async function requireAdmin(): Promise<Perfil> {
  const perfil = await requirePerfil();
  if (perfil.rol !== "admin") redirect("/");
  return perfil;
}
