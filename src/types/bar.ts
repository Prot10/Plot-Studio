import type { BaseDataPoint, PlotSettings } from "./base";

export type BarPattern =
  | "solid"
  | "diagonal"
  | "dots"
  | "crosshatch"
  | "vertical";

export interface BarDataPoint extends BaseDataPoint {
  value: number;
  fillColor: string;
  borderColor: string;
  borderWidth: number;
  opacity: number;
  error: number;
  group?: string;
  pattern: BarPattern;
  patternColor: string;
  patternOpacity: number;
  patternSize: number;
}

export interface BarChartSettings extends PlotSettings<BarDataPoint> {
  showErrorBars: boolean;
  showValueLabels: boolean;
  barOpacity: number;
  barBorderWidth: number;
  barCornerRadius: number;
  barCornerStyle: "top" | "both";
  barGap: number;
  valueLabelFontSize: number;
  valueLabelOffsetY: number;
  valueLabelOffsetX: number;
  errorBarMode: "global" | "match";
  errorBarColor: string;
  errorBarWidth: number;
  errorBarCapWidth: number;
}

// Legacy type aliases for backward compatibility
export type BarDatum = BarDataPoint;
export type ChartSettings = BarChartSettings;
