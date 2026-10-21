-- Migración: recepción de mercancía desde una orden de compra.
-- 1) La orden puede quedar "recibida_parcial" cuando se recibe parte del pedido.
-- 2) Cada partida registra cuánto se ha recibido, para permitir re-recepciones.
-- Ejecuta esto en el SQL Editor de Supabase UNA SOLA VEZ.

alter table public.ordenes
  drop constraint if exists ordenes_estado_check;

alter table public.ordenes
  add constraint ordenes_estado_check
  check (estado in ('pendiente', 'recibida', 'recibida_parcial', 'cancelada'));

alter table public.orden_partidas
  add column if not exists cantidad_recibida integer not null default 0;
