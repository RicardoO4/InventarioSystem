-- Migración: costo unitario real en los movimientos (solo aditivo).
-- Permite valorar el inventario a costo real (promedio ponderado de compras
-- y entradas manuales). No modifica datos existentes salvo el backfill
-- de entradas generadas por órdenes de compra.
-- Ejecuta esto en el SQL Editor de Supabase UNA VEZ.

alter table public.movimientos
  add column if not exists costo_unitario numeric(12, 2);

-- Backfill: las entradas creadas al recibir una orden copian el precio de su partida.
-- Se identifican por la referencia (folio de la orden) y el producto.
update public.movimientos m
set costo_unitario = op.precio
from public.orden_partidas op
join public.ordenes o on o.id = op.orden_id
where m.tipo = 'entrada'
  and m.costo_unitario is null
  and m.producto_id = op.producto_id
  and m.referencia = o.folio
  and op.precio > 0;
