import type { PaletteKey } from "../../types";

export const palettes: Record<PaletteKey, string[]> = {
  vibrant: [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ],
  cool: [
    "#0ea5e9",
    "#6366f1",
    "#22d3ee",
    "#38bdf8",
    "#a855f7",
    "#2dd4bf",
    "#1e3a8a",
  ],
  warm: [
    "#fb923c",
    "#f97316",
    "#ef4444",
    "#facc15",
    "#b45309",
    "#f87171",
    "#fbbf24",
  ],
  pastel: [
    "#a5b4fc",
    "#fbcfe8",
    "#fde68a",
    "#bbf7d0",
    "#fca5a5",
    "#c4b5fd",
    "#f5d0fe",
  ],
};

export const paletteOptions: Array<{ label: string; value: PaletteKey }> = [
  { label: "Vibrant", value: "vibrant" },
  { label: "Cool breeze", value: "cool" },
  { label: "Warm sunset", value: "warm" },
  { label: "Soft pastel", value: "pastel" },
];
