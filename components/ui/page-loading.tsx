import { Skeleton } from "@/components/ui/skeleton";

export function PageLoading({ tarjetas = 6, filas = 6 }: { tarjetas?: number; filas?: number }) {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Cargando contenido">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {tarjetas > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: tarjetas }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-4">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="space-y-3 px-5 py-4">
          {Array.from({ length: filas }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
