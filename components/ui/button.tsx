import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50",
    size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
    variant === "primary" && "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500",
    variant === "secondary" && "border border-zinc-300 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50",
    variant === "ghost" && "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
    variant === "danger" && "bg-red-600 text-white shadow-sm hover:bg-red-500",
    className
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button suppressHydrationWarning className={buttonClasses(variant, size, className)} {...props} />;
}

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

export function ButtonLink({ href, variant = "primary", size = "md", className, children }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)} suppressHydrationWarning>
      {children}
    </Link>
  );
}
