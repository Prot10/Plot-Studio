import type { BaseDataPoint, PlotSettings } from "./base";

export type BarPattern =
  | "solid"
  | "diagonal"
  | "dots"
  | "crosshatch"
  | "vertical";

export type BarOrientation = "vertical" | "horizontal";

export interface BarDataPoint extends BaseDataPoint {
  value: number;
  fillColor: string;
  borderColor: string;
  borderWidth: number;
  opacity: number;
  borderOpacity: number;
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
  // Chart orientation
  orientation: BarOrientation;
  // Global bar design settings
  barOpacity: number;
  barBorderWidth: number;
  barCornerRadius: number;
  barCornerStyle: "top" | "both";
  barGap: number;
  // Global border settings
  showBorder: boolean;
  globalBorderWidth: number;
  // Global bar styling (used as defaults)
  globalFillColor: string;
  globalFillOpacity: number;
  globalBorderColor: string;
  globalBorderOpacity: number;
  globalPattern: BarPattern;
  globalPatternColor: string;
  globalPatternOpacity: number;
  globalPatternSize: number;
  // Value labels
  valueLabelFontSize: number;
  valueLabelOffsetY: number;
  valueLabelOffsetX: number;
  // Error bars
  errorBarMode: "global" | "match";
  errorBarColor: string;
  errorBarWidth: number;
  errorBarCapWidth: number;
  // Axis synchronization setting
  axesSynced: boolean;
  // Plot box border settings
  showPlotBox: boolean;
  plotBoxLineWidth: number;
  plotBoxColor: string;
}

// Legacy type aliases for backward compatibility
export type BarDatum = BarDataPoint;
export type ChartSettings = BarChartSettings;
