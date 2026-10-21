-- Esquema del inventario.
-- Ejecuta este script en el SQL Editor de Supabase (o como migración).
-- Acceso público por ahora: políticas RLS abiertas para anon y authenticated.
-- TODO: endurecer RLS cuando se implemente autenticación por usuarios.

create extension if not exists pgcrypto;

create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text not null default '',
  icono text not null default 'box',
  created_at timestamptz not null default now()
);

create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  nombre text not null,
  categoria_id uuid references categorias(id) on delete set null,
  codigo_barra text,
  stock integer not null default 0,
  stock_minimo integer not null default 0,
  precio_costo numeric(12, 2) not null default 0,
  precio_venta numeric(12, 2) not null default 0,
  ubicacion text not null default '',
  estado text not null default 'activo' check (estado in ('activo', 'inactivo', 'agotado')),
  unidad text not null default 'pieza',
  created_at timestamptz not null default now()
);

create table if not exists movimientos (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique,
  tipo text not null check (tipo in ('entrada', 'salida')),
  producto_id uuid references productos(id) on delete set null,
  cantidad integer not null check (cantidad > 0),
  unidad text not null default 'pieza',
  fecha date not null default current_date,
  responsable text not null default '',
  contraparte text not null default '',
  referencia text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists proveedores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  contacto text not null default '',
  telefono text not null default '',
  correo text not null default '',
  rfc text not null default '',
  dias_entrega integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists ordenes (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique,
  proveedor_id uuid references proveedores(id) on delete set null,
  fecha date not null default current_date,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'recibida', 'cancelada')),
  partidas integer not null default 0,
  total numeric(12, 2) not null default 0,
  notas text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists orden_partidas (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid not null references ordenes(id) on delete cascade,
  producto_id uuid references productos(id) on delete set null,
  producto_nombre text not null,
  proveedor_id uuid references proveedores(id) on delete set null,
  proveedor_nombre text not null default '',
  cantidad integer not null check (cantidad > 0),
  precio numeric(12, 2) not null default 0,
  subtotal numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_productos_categoria on productos(categoria_id);
create unique index if not exists idx_productos_codigo_barra on productos(codigo_barra);
create index if not exists idx_movimientos_producto on movimientos(producto_id);
create index if not exists idx_movimientos_fecha on movimientos(fecha);
create index if not exists idx_ordenes_proveedor on ordenes(proveedor_id);
create index if not exists idx_ordenes_fecha on ordenes(fecha);
create index if not exists idx_orden_partidas_orden on orden_partidas(orden_id);

-- RLS habilitado en todas las tablas.
alter table categorias enable row level security;
alter table productos enable row level security;
alter table movimientos enable row level security;
alter table proveedores enable row level security;
alter table ordenes enable row level security;
alter table orden_partidas enable row level security;

-- Políticas de acceso público (solo para desarrollo/interin).
-- TODO: reemplazar por políticas basadas en autenticación.
do $$
declare
  t text;
begin
  foreach t in array array['categorias', 'productos', 'movimientos', 'proveedores', 'ordenes', 'orden_partidas']
  loop
    execute format('create policy "publico select %1$s" on %1$s for select to anon, authenticated using (true)', t);
    execute format('create policy "publico insert %1$s" on %1$s for insert to anon, authenticated with check (true)', t);
    execute format('create policy "publico update %1$s" on %1$s for update to anon, authenticated using (true) with check (true)', t);
    execute format('create policy "publico delete %1$s" on %1$s for delete to anon, authenticated using (true)', t);
  end loop;
end $$;
