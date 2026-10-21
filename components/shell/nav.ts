import type { ComponentType } from "react";
import type { IconProps } from "@/components/icons";
import {
  ArrowLeftRightIcon,
  BarChart3Icon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  PackageIcon,
  SlidersIcon,
  TagsIcon,
  TruckIcon,
} from "@/components/icons";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
  soloAdmin?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Panel", icon: LayoutDashboardIcon },
  { href: "/catalogo", label: "Catálogo", icon: PackageIcon },
  { href: "/catalogo/categorias", label: "Categorías", icon: TagsIcon },
  { href: "/movimientos", label: "Entradas y salidas", icon: ArrowLeftRightIcon },
  { href: "/proveedores", label: "Proveedores", icon: TruckIcon },
  { href: "/ordenes", label: "Órdenes de compra", icon: ClipboardListIcon },
  { href: "/reportes/valoracion", label: "Reportes", icon: BarChart3Icon },
  { href: "/configuracion", label: "Configuración", icon: SlidersIcon, soloAdmin: true },
];
