import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "gray" | "green" | "amber" | "red" | "indigo" | "blue";

const tones: Record<Tone, string> = {
  gray: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
};

export function Badge({ tone = "gray", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
