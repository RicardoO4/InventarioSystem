import type { ComponentType } from "react";
import {
  BoxIcon,
  ChipIcon,
  FileTextIcon,
  ShieldIcon,
  SprayIcon,
  ToolsIcon,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";

export const iconosCategoria: Record<string, ComponentType<IconProps>> = {
  chip: ChipIcon,
  tools: ToolsIcon,
  shield: ShieldIcon,
  file: FileTextIcon,
  box: BoxIcon,
  spray: SprayIcon,
};
