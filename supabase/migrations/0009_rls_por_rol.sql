-- Migración: reemplaza las políticas públicas abiertas por políticas basadas en rol.
-- Requiere haber ejecutado 0008_perfiles_roles.sql.
-- Ejecuta esto en el SQL Editor de Supabase UNA SOLA VEZ.

-- 1) Eliminar todas las políticas existentes de las tablas del inventario.
do $$
declare
  t text;
  pol record;
begin
  foreach t in array array[
    'categorias', 'productos', 'movimientos', 'proveedores',
    'ordenes', 'orden_partidas', 'perfiles'
  ]
  loop
    for pol in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;
  end loop;
end $$;

-- 2) Perfiles: cada quien ve el suyo; el admin ve y administra todos.
create policy "perfiles lee propio o admin" on public.perfiles
  for select to authenticated
  using (id = (select auth.uid()) or public.es_admin());

create policy "perfiles admin inserta" on public.perfiles
  for insert to authenticated
  with check (public.es_admin());

create policy "perfiles admin actualiza" on public.perfiles
  for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());

create policy "perfiles admin borra" on public.perfiles
  for delete to authenticated
  using (public.es_admin());

-- 3) Catálogo y proveedores: leen los usuarios activos; solo admin escribe.
do $$
declare
  t text;
begin
  foreach t in array array['categorias', 'productos', 'proveedores']
  loop
    execute format(
      'create policy "activos leen" on public.%I for select to authenticated using (public.esta_activo())', t);
    execute format(
      'create policy "admin inserta" on public.%I for insert to authenticated with check (public.es_admin())', t);
    execute format(
      'create policy "admin actualiza" on public.%I for update to authenticated using (public.es_admin()) with check (public.es_admin())', t);
    execute format(
      'create policy "admin borra" on public.%I for delete to authenticated using (public.es_admin())', t);
  end loop;
end $$;

-- 4) Órdenes: solo admin las crea/borra, pero cualquier usuario activo puede
--    actualizarlas (la recepción cambia el estado de la orden y sus partidas).
do $$
declare
  t text;
begin
  foreach t in array array['ordenes', 'orden_partidas']
  loop
    execute format(
      'create policy "activos leen" on public.%I for select to authenticated using (public.esta_activo())', t);
    execute format(
      'create policy "admin inserta" on public.%I for insert to authenticated with check (public.es_admin())', t);
    execute format(
      'create policy "activos actualizan" on public.%I for update to authenticated using (public.esta_activo()) with check (public.esta_activo())', t);
    execute format(
      'create policy "admin borra" on public.%I for delete to authenticated using (public.es_admin())', t);
  end loop;
end $$;

-- 5) Movimientos: admin y operador registran; solo admin edita o borra.
create policy "activos leen" on public.movimientos
  for select to authenticated
  using (public.esta_activo());

create policy "activos insertan" on public.movimientos
  for insert to authenticated
  with check (public.esta_activo());

create policy "admin actualiza" on public.movimientos
  for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());

create policy "admin borra" on public.movimientos
  for delete to authenticated
  using (public.es_admin());
