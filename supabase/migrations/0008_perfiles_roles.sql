-- Migración: perfiles de usuario con rol (admin / operador).
-- Crea la tabla `perfiles` ligada a auth.users, la mantiene sincronizada con un
-- trigger y expone helpers de autorización para las políticas RLS.
-- Ejecuta esto en el SQL Editor de Supabase UNA SOLA VEZ.

create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null default '',
  email text not null default '',
  rol text not null default 'operador' check (rol in ('admin', 'operador')),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.perfiles enable row level security;

-- Crea el perfil automáticamente cuando se registra/invita un usuario.
create or replace function public.crear_perfil_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre, email, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.email, ''),
    case when coalesce(new.raw_app_meta_data ->> 'rol', '') = 'admin' then 'admin' else 'operador' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_crear_perfil on auth.users;
create trigger trg_crear_perfil
  after insert on auth.users
  for each row execute function public.crear_perfil_usuario();

-- Backfill de usuarios que ya existían.
insert into public.perfiles (id, nombre, email, rol)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'nombre', split_part(coalesce(u.email, ''), '@', 1)),
  coalesce(u.email, ''),
  case when coalesce(u.raw_app_meta_data ->> 'rol', '') = 'admin' then 'admin' else 'operador' end
from auth.users u
on conflict (id) do nothing;

-- Helpers de autorización. `security definer` para poder leer `perfiles` sin
-- entrar en recursión de RLS; endurecidos para no ser ejecutables por anon.
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid()) and rol = 'admin' and activo
  );
$$;

create or replace function public.esta_activo()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid()) and activo
  );
$$;

revoke execute on function public.es_admin() from public, anon;
revoke execute on function public.esta_activo() from public, anon;
grant execute on function public.es_admin() to authenticated;
grant execute on function public.esta_activo() to authenticated;

-- IMPORTANTE: nombra al primer administrador. Todos los usuarios existentes y
-- nuevos quedan como 'operador'. Ejecuta (cambiando el correo):
--   update public.perfiles set rol = 'admin' where email = 'tu-correo@dominio.mx';
-- Ese usuario debe cerrar sesión y volver a entrar para reflejar los permisos.
