import type { BarDataPoint } from "../../types/bar";
import { palettes } from "./palettes";

export const defaultPalette = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
}

export function createBar(
  index: number,
  paletteName: keyof typeof palettes = "vibrant"
): BarDataPoint {
  const palette = palettes[paletteName] ?? defaultPalette;
  const color = palette[index % palette.length];
  return {
    id: randomId(),
    label: `Bar ${index + 1}`,
    value: 10,
    fillColor: color,
    borderColor: "#0f172a",
    borderWidth: 2,
    opacity: 0.85,
    borderOpacity: 1.0,
    error: 0,
    pattern: "solid",
    patternColor: "#ffffff",
    patternOpacity: 0.35,
    patternSize: 8,
  };
}
