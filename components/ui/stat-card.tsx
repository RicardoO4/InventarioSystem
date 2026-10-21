import { cn } from "@/lib/cn";

type Tone = "indigo" | "emerald" | "amber" | "red" | "sky";

const tones: Record<Tone, string> = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  sky: "bg-sky-50 text-sky-600",
};

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  tone?: Tone;
  trend?: { direction: "up" | "down"; text: string };
};

export function StatCard({ label, value, hint, icon, tone = "indigo", trend }: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-zinc-500">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
          {icon}
        </div>
      </div>
      {(hint || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                trend.direction === "up" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              )}
            >
              {trend.direction === "up" ? "↑" : "↓"} {trend.text}
            </span>
          )}
          {hint && <span className="text-zinc-500">{hint}</span>}
        </div>
      )}
    </div>
  );
}
