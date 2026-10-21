-- Migración: sincronizar stock y estado de productos automáticamente con los movimientos.
-- Un trigger actualiza el stock (y el estado "agotado"/"activo") al INSERTAR, ELIMINAR
-- o MODIFICAR movimientos, sin importar desde dónde se haga (app o SQL Editor).
-- Ejecuta esto en el SQL Editor de Supabase UNA SOLA VEZ.

create or replace function public.sincronizar_stock_movimiento()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid;
  delta integer;
  nuevo_stock integer;
  nuevo_estado text;
begin
  if tg_op = 'INSERT' then
    pid := NEW.producto_id;
    delta := case when NEW.tipo = 'entrada' then NEW.cantidad else -NEW.cantidad end;
  elsif tg_op = 'DELETE' then
    pid := OLD.producto_id;
    delta := case when OLD.tipo = 'entrada' then -OLD.cantidad else OLD.cantidad end;
  else
    pid := OLD.producto_id;
    delta := (case when NEW.tipo = 'entrada' then NEW.cantidad else -NEW.cantidad end)
           - (case when OLD.tipo = 'entrada' then OLD.cantidad else -OLD.cantidad end);
  end if;

  if pid is null then
    return coalesce(NEW, OLD);
  end if;

  select stock into nuevo_stock from public.productos where id = pid;
  if nuevo_stock is null then
    return coalesce(NEW, OLD);
  end if;

  nuevo_stock := nuevo_stock + delta;
  select estado into nuevo_estado from public.productos where id = pid;

  if nuevo_stock <= 0 then
    nuevo_estado := 'agotado';
  elsif nuevo_estado = 'agotado' then
    nuevo_estado := 'activo';
  end if;

  update public.productos
  set stock = nuevo_stock,
      estado = nuevo_estado
  where id = pid;

  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists trg_movimiento_stock on public.movimientos;
create trigger trg_movimiento_stock
  after insert or update or delete on public.movimientos
  for each row execute function public.sincronizar_stock_movimiento();

-- Corrige el estado de productos existentes según su stock actual.
update public.productos set estado = 'agotado' where stock <= 0 and estado <> 'agotado';
update public.productos set estado = 'activo' where stock > 0 and estado = 'agotado';
