import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { AppShell } from "@/components/shell/app-shell";
import { getPerfil } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InventarioPro",
  description: "Sistema de gestión de inventarios",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const esRutaAuth = pathname === "/login" || pathname.startsWith("/auth/");
  const perfil = esRutaAuth ? null : await getPerfil();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {perfil ? <AppShell perfil={perfil}>{children}</AppShell> : children}
      </body>
    </html>
  );
}
