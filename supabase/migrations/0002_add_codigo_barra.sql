-- Migración: agregar columna codigo_barra (EAN-13) a productos.
-- Ejecuta esto en el SQL Editor de Supabase si ya creaste las tablas con schema.sql.

alter table productos add column if not exists codigo_barra text;
create unique index if not exists idx_productos_codigo_barra on productos(codigo_barra);
