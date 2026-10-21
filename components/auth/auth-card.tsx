import Image from "next/image";

export function AuthCard({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Image
            src="/images.png"
            alt="InventarioPro"
            width={44}
            height={44}
            className="h-11 w-11 rounded-xl object-contain"
          />
          <span className="text-lg font-semibold tracking-tight text-zinc-900">
            Inventario<span className="text-zinc-400">Pro</span>
          </span>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h1 className="text-base font-semibold tracking-tight text-zinc-900">{titulo}</h1>
            <p className="mt-1 text-sm text-zinc-500">{descripcion}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
