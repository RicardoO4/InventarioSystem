"use client";

import { useState, useTransition } from "react";
import { toggleEstadoProducto } from "@/app/catalogo/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function AccionesEstadoProducto({
  productoId,
  estado,
}: {
  productoId: string;
  estado: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, startTransition] = useTransition();

  const inactivo = estado === "inactivo";

  function cambiar(nuevo: "activo" | "inactivo") {
    setError(null);
    startTransition(async () => {
      const res = await toggleEstadoProducto(productoId, nuevo);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setAbierto(false);
    });
  }

  if (inactivo) {
    return (
      <Button variant="secondary" onClick={() => cambiar("activo")} disabled={enviando}>
        {enviando ? "Reactivando…" : "Reactivar"}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          setError(null);
          setAbierto(true);
        }}
      >
        Desactivar
      </Button>
      <Modal
        open={abierto}
        onClose={() => !enviando && setAbierto(false)}
        title="Desactivar producto"
        description="El producto dejará de estar activo, pero se conserva todo su historial."
        footer={
          <>
            <Button variant="secondary" onClick={() => setAbierto(false)} disabled={enviando}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => cambiar("inactivo")} disabled={enviando}>
              {enviando ? "Desactivando…" : "Desactivar"}
            </Button>
          </>
        }
      >
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : (
          <p className="text-sm text-zinc-600">
            ¿Seguro que quieres desactivar este producto? Podrás reactivarlo cuando quieras y no se
            perderá su historial de movimientos.
          </p>
        )}
      </Modal>
    </>
  );
}
