"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getPerfil } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export type AuthState = { error?: string; ok?: string } | null;

async function verificarAdmin() {
  const perfil = await getPerfil();
  if (!perfil || perfil.rol !== "admin") {
    throw new Error("No autorizado");
  }
  return perfil;
}

export async function iniciarSesion(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Correo o contraseña incorrectos." };
  }

  redirect("/");
}

export async function cerrarSesion(): Promise<void> {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut();
  redirect("/login");
}

export async function recuperarContrasena(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Ingresa tu correo." };

  const supabase = createClient(await cookies());
  await supabase.auth.resetPasswordForEmail(email);

  return { ok: "Si el correo existe, recibirás un enlace para restablecer tu contraseña." };
}

export async function actualizarContrasena(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (password !== confirmar) {
    return { error: "Las contraseñas no coinciden." };
  }

  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/");
}

export async function invitarUsuario(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  try {
    await verificarAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const rol = formData.get("rol") === "admin" ? "admin" : "operador";

  if (!email) return { error: "Ingresa el correo del usuario." };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      error:
        "Falta configurar SUPABASE_SERVICE_ROLE_KEY en .env.local. Reinicia el servidor después de agregarla.",
    };
  }

  try {
    const admin = createAdminClient();

    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { nombre: nombre || email.split("@")[0] },
    });
    if (error) return { error: error.message };

    const userId = data.user?.id;
    if (!userId) return { error: "No se pudo crear la invitación." };

    await admin.auth.admin.updateUserById(userId, { app_metadata: { rol } });
    await admin
      .from("perfiles")
      .update({ rol, nombre: nombre || email.split("@")[0] })
      .eq("id", userId);

    revalidatePath("/configuracion/usuarios");
    return { ok: `Invitación enviada a ${email}.` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo completar la operación." };
  }
}

export async function cambiarRol(formData: FormData): Promise<void> {
  await verificarAdmin();
  const userId = String(formData.get("usuarioId") ?? "");
  const rol = formData.get("rol") === "admin" ? "admin" : "operador";
  if (!userId) return;

  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(userId, { app_metadata: { rol } });
  await admin.from("perfiles").update({ rol }).eq("id", userId);
  revalidatePath("/configuracion/usuarios");
}

export async function cambiarActivo(formData: FormData): Promise<void> {
  const perfil = await verificarAdmin();
  const userId = String(formData.get("usuarioId") ?? "");
  const activo = String(formData.get("activo") ?? "") === "true";
  if (!userId || userId === perfil.id) return;

  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(userId, {
    ban_duration: activo ? "none" : "876000h",
  });
  await admin.from("perfiles").update({ activo }).eq("id", userId);
  revalidatePath("/configuracion/usuarios");
}

export async function eliminarUsuario(formData: FormData): Promise<void> {
  const perfil = await verificarAdmin();
  const userId = String(formData.get("usuarioId") ?? "");
  if (!userId || userId === perfil.id) return;

  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(userId);
  revalidatePath("/configuracion/usuarios");
}
