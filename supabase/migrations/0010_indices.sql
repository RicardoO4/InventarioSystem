-- Migración: índices de rendimiento (solo aditivo).
-- No modifica datos, políticas, triggers ni la estructura de las tablas.
-- Ejecuta esto en el SQL Editor de Supabase UNA SOLA VEZ.

-- Acelera el orden por nombre del catálogo.
create index if not exists idx_productos_nombre on public.productos(nombre);

-- Acelera los conteos y series del dashboard por tipo y fecha.
create index if not exists idx_movimientos_tipo_fecha on public.movimientos(tipo, fecha desc);

-- Acelera la búsqueda de partidas por producto.
create index if not exists idx_orden_partidas_producto on public.orden_partidas(producto_id);
