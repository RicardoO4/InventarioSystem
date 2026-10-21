import { cn } from "@/lib/cn";

const tones = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-rose-500",
  "bg-violet-500",
];

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const tone = tones[name.length % tones.length];
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
        tone,
        className
      )}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
