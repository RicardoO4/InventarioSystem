-- Migración: corregir el stock de productos que registraron movimientos
-- antes de que la aplicación actualizara el stock automáticamente.
-- Suma a cada producto el efecto neto de sus movimientos registrados.
-- Ejecuta esto en el SQL Editor de Supabase UNA SOLA VEZ.
-- Advertencia: si corregiste manualmente el stock de algún producto
-- después de registrar sus movimientos, ese producto se ajustaría dos veces.

update productos p
set stock = p.stock + coalesce(
  (
    select sum(case when m.tipo = 'entrada' then m.cantidad else -m.cantidad end)
    from movimientos m
    where m.producto_id = p.id
  ),
  0
);
