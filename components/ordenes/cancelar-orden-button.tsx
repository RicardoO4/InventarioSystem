"use client";

import { useState } from "react";
import { cancelarOrden } from "@/app/ordenes/actions";
import { AlertTriangleIcon, XIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type Props = {
  ordenId: string;
  folio: string;
};

export function CancelarOrdenButton({ ordenId, folio }: Props) {
  const [open, setOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancelar() {
    setEnviando(true);
    setError(null);
    try {
      const resultado = await cancelarOrden(ordenId);
      if (!resultado.ok) {
        setError(resultado.error);
        setEnviando(false);
        return;
      }
      setOpen(false);
      setEnviando(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cancelar la orden");
      setEnviando(false);
    }
  }

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        <XIcon className="h-4 w-4" />
        Cancelar orden
      </Button>

      <Modal
        open={open}
        onClose={() => !enviando && setOpen(false)}
        title="Cancelar orden"
        description={`La orden ${folio} quedará cancelada y no podrá recibirse.`}
        icon={<AlertTriangleIcon className="h-4 w-4" />}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={enviando}>
              Mantener
            </Button>
            <Button variant="danger" onClick={cancelar} disabled={enviando}>
              {enviando ? "Cancelando…" : "Sí, cancelar orden"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-zinc-500">
          El stock que ya haya sido recibido de esta orden no se revierte.
        </p>
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        )}
      </Modal>
    </>
  );
}
