-- Migración: folios atómicos por secuencia (solo aditivo).
-- Asigna ENT-####, SAL-#### y OC-#### desde una secuencia, evitando
-- colisiones de folio cuando varios usuarios guardan a la vez.
-- No modifica datos ni políticas. Ejecuta esto en el SQL Editor de Supabase UNA VEZ.

-- 1) Secuencias independientes por prefijo.
create sequence if not exists public.mov_folio_ent_seq;
create sequence if not exists public.mov_folio_sal_seq;
create sequence if not exists public.orden_folio_seq;

-- 2) Sembrar cada secuencia desde el folio máximo ya existente.
select setval(
  'public.mov_folio_ent_seq',
  coalesce(
    (select max(nullif(regexp_replace(folio, '\D', '', 'g'), '')::int)
       from public.movimientos where folio like 'ENT-%'),
    0
  ) + 1,
  false
);

select setval(
  'public.mov_folio_sal_seq',
  coalesce(
    (select max(nullif(regexp_replace(folio, '\D', '', 'g'), '')::int)
       from public.movimientos where folio like 'SAL-%'),
    0
  ) + 1,
  false
);

select setval(
  'public.orden_folio_seq',
  coalesce(
    (select max(nullif(regexp_replace(folio, '\D', '', 'g'), '')::int)
       from public.ordenes where folio like 'OC-%'),
    0
  ) + 1,
  false
);

-- 3) Permisos de uso para los roles que insertan movimientos/órdenes.
grant usage, select on sequence public.mov_folio_ent_seq to anon, authenticated;
grant usage, select on sequence public.mov_folio_sal_seq to anon, authenticated;
grant usage, select on sequence public.orden_folio_seq to anon, authenticated;

-- 4) Trigger que asigna el folio del movimiento si no viene informado.
create or replace function public.set_folio_movimiento()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_prefijo text;
  v_secuencia text;
begin
  if new.folio is not null and new.folio <> '' then
    return new;
  end if;

  if new.tipo = 'entrada' then
    v_prefijo := 'ENT';
    v_secuencia := 'public.mov_folio_ent_seq';
  else
    v_prefijo := 'SAL';
    v_secuencia := 'public.mov_folio_sal_seq';
  end if;

  new.folio := v_prefijo || '-' || lpad(nextval(v_secuencia::regclass)::text, 4, '0');
  return new;
end;
$$;

drop trigger if exists trg_set_folio_movimiento on public.movimientos;
create trigger trg_set_folio_movimiento
  before insert on public.movimientos
  for each row execute function public.set_folio_movimiento();

-- 5) Trigger que asigna el folio de la orden si no viene informado.
create or replace function public.set_folio_orden()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.folio is not null and new.folio <> '' then
    return new;
  end if;

  new.folio := 'OC-' || lpad(nextval('public.orden_folio_seq'::regclass)::text, 4, '0');
  return new;
end;
$$;

drop trigger if exists trg_set_folio_orden on public.ordenes;
create trigger trg_set_folio_orden
  before insert on public.ordenes
  for each row execute function public.set_folio_orden();
