import { cn } from "@/lib/cn";
import { completarEAN13, encodeCode128, encodeEAN13 } from "@/lib/barcode";

export function Barcode({
  value,
  format = "code128",
  height = 48,
  showText = true,
  className,
}: {
  value: string;
  format?: "code128" | "ean13";
  height?: number;
  showText?: boolean;
  className?: string;
}) {
  let encoded: ReturnType<typeof encodeCode128> | null = null;
  let texto: string | null = null;
  try {
    if (format === "ean13") {
      const ean = completarEAN13(value);
      if (ean) {
        encoded = encodeEAN13(ean);
        texto = ean;
      }
    } else {
      encoded = value.length > 0 ? encodeCode128(value) : null;
      texto = value.length > 0 ? value : null;
    }
  } catch {
    encoded = null;
    texto = null;
  }

  if (!encoded) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-white py-3 text-center text-xs text-zinc-400",
          className
        )}
      >
        Sin código de barras
      </div>
    );
  }

  return (
    <div className={cn("inline-flex flex-col items-center gap-1.5", className)}>
      <svg
        viewBox={`0 0 ${encoded.totalWidth} ${height}`}
        style={{ height }}
        role="img"
        aria-label={`Código de barras ${texto}`}
        className="block"
      >
        <rect x="0" y="0" width={encoded.totalWidth} height={height} fill="#fff" />
        {encoded.bars.map((bar, i) => (
          <rect key={i} x={bar.x} y={0} width={bar.width} height={height} fill="#18181b" />
        ))}
      </svg>
      {showText && texto && (
        <span className="text-center font-mono text-[11px] leading-none tracking-wider text-zinc-600">
          {texto}
        </span>
      )}
    </div>
  );
}
