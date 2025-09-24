import type { BaseDataPoint, PlotSettings } from "./base";
import type { DataTableRow } from "../shared/components/DataTable";

export type BarPattern =
  | "solid"
  | "diagonal"
  | "dots"
  | "crosshatch"
  | "vertical";

export type BarOrientation = "vertical" | "horizontal";

// Additional elements for text and images
export interface AdditionalTextElement {
  id: string;
  text: string;
  x: number; // X position in pixels (relative to chart area)
  y: number; // Y position in pixels (relative to chart area)
  fontSize: number;
  fontFamily: string;
  color: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  opacity: number;
  rotation: number; // Rotation in degrees
}

export interface AdditionalImageElement {
  id: string;
  src: string; // Base64 data URL or URL to image
  x: number; // X position in pixels (relative to chart area)
  y: number; // Y position in pixels (relative to chart area)
  scale: number; // Scale factor (1.0 = original size)
  originalWidth: number; // Original image width in pixels
  originalHeight: number; // Original image height in pixels
  rotation: number; // Rotation in degrees
  opacity: number;
  grayscale: boolean; // Whether to apply grayscale filter
}

export interface BarDataPoint extends BaseDataPoint, DataTableRow {
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
  // Additional elements
  additionalTextElements: AdditionalTextElement[];
  additionalImageElements: AdditionalImageElement[];
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
