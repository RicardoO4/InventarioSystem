const formatoMoneda = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
});

const formatoNumero = new Intl.NumberFormat("es-MX");

const formatoFecha = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const formatoFechaLarga = new Intl.DateTimeFormat("es-MX", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatCurrency(valor: number): string {
  return formatoMoneda.format(valor);
}

export function formatNumber(valor: number): string {
  return formatoNumero.format(valor);
}

export function formatDate(iso: string): string {
  return formatoFecha.format(new Date(iso));
}

export function formatDateLong(iso: string): string {
  return formatoFechaLarga.format(new Date(iso));
}
