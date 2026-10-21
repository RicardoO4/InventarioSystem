import { Badge } from "@/components/ui/badge";
import type { EstadoOrden } from "@/lib/types";

const config: Record<EstadoOrden, { tone: "gray" | "green" | "amber" | "indigo"; label: string }> = {
  recibida: { tone: "green", label: "Recibida" },
  pendiente: { tone: "amber", label: "Pendiente" },
  recibida_parcial: { tone: "indigo", label: "Recibida parcial" },
  cancelada: { tone: "gray", label: "Cancelada" },
};

export function OrdenEstadoBadge({ estado }: { estado: EstadoOrden }) {
  const c = config[estado];
  return <Badge tone={c.tone}>{c.label}</Badge>;
}
