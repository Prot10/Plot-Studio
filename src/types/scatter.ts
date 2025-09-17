import type { BaseDataPoint, PlotSettings } from "./base";

export interface ScatterDataPoint extends BaseDataPoint {
  x: number;
  y: number;
  size: number;
  fillColor: string;
  borderColor: string;
  borderWidth: number;
  opacity: number;
  shape: ScatterPointShape;
}

export type ScatterPointShape = "circle" | "square" | "triangle" | "diamond";

export interface ScatterPlotSettings extends PlotSettings<ScatterDataPoint> {
  showValueLabels: boolean;
  defaultPointSize: number;
  pointOpacity: number;
  pointBorderWidth: number;
  valueLabelFontSize: number;
  valueLabelOffsetY: number;
  valueLabelOffsetX: number;
  showConnectingLines: boolean;
  connectingLineColor: string;
  connectingLineWidth: number;
  xAxisMin: number | null;
  xAxisMax: number | null;
  xAxisTickStep: number | null;
}
