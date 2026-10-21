-- Migración: partidas (líneas) de las órdenes de compra.
-- Cada orden puede tener N partidas con producto, cantidad y precio unitario;
-- el total de la orden es la suma de cantidad * precio.
-- Ejecuta esto en el SQL Editor de Supabase UNA SOLA VEZ.

create table if not exists public.orden_partidas (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid not null references public.ordenes(id) on delete cascade,
  producto_id uuid references public.productos(id) on delete set null,
  producto_nombre text not null,
  cantidad integer not null check (cantidad > 0),
  precio numeric(12, 2) not null default 0,
  subtotal numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_orden_partidas_orden on public.orden_partidas(orden_id);

alter table public.orden_partidas enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['orden_partidas']
  loop
    execute format('create policy "publico select %1$s" on %1$s for select to anon, authenticated using (true)', t);
    execute format('create policy "publico insert %1$s" on %1$s for insert to anon, authenticated with check (true)', t);
    execute format('create policy "publico update %1$s" on %1$s for update to anon, authenticated using (true) with check (true)', t);
    execute format('create policy "publico delete %1$s" on %1$s for delete to anon, authenticated using (true)', t);
  end loop;
end $$;
