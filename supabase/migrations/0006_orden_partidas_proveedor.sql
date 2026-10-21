-- Migración: cada partida de una orden registra su propio proveedor.
-- Al crear una orden, todas las partidas deben pertenecer al mismo proveedor,
-- y ese proveedor queda como proveedor de la orden.
-- Ejecuta esto en el SQL Editor de Supabase UNA SOLA VEZ.

alter table public.orden_partidas
  add column if not exists proveedor_id uuid references public.proveedores(id) on delete set null,
  add column if not exists proveedor_nombre text not null default '';
