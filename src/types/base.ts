// Base types for all plot types
export type PlotType = "bar" | "scatter";

export type PaletteKey = "vibrant" | "cool" | "warm" | "pastel";

export type HighlightKey =
  | "chartBasics"
  | "yAxis"
  | "xAxis"
  | "data"
  | "design"
  | "barDesign" // Legacy compatibility
  | "valueLabels"
  | "errorBars";

export type FocusTarget =
  | { type: "chartTitle" }
  | { type: "dataLabel"; dataId: string }
  | { type: "dataValue"; dataId: string }
  | { type: "barLabel"; barId: string } // Legacy compatibility
  | { type: "barValue"; barId: string } // Legacy compatibility
  | { type: "xAxisTitle" }
  | { type: "yAxisTitle" };

export type FocusRequest = {
  target: FocusTarget;
  requestId: number;
};

// Base axis settings that all plot types can use
export type AxisSettings = {
  showAxisLines: boolean;
  showTickLabels: boolean;
  showGridLines: boolean;
  axisLineColor: string;
  axisLineWidth: number;
  tickLabelColor: string;
  gridLineColor: string;
  title: string;
};

// Base chart settings that all plot types share
export type BaseChartSettings = {
  backgroundColor: string;
  canvasPadding: number;
  textColor: string;
  title: string;
  titleFontSize: number;
  titleOffsetY: number;
  axisTitleFontSize: number;
  axisTickFontSize: number;
  aspectRatio: number;
  customWidth: number | null;
  customHeight: number | null;
  exportScale: number;
  exportTransparent: boolean;
  exportFileName: string;
  paletteName: PaletteKey;
  xAxis: AxisSettings;
  yAxis: AxisSettings;
  yAxisMin: number | null;
  yAxisMax: number | null;
  yAxisTickStep: number | null;
  xAxisTitleOffsetY: number;
  yAxisTitleOffsetX: number;
};

// Base data point interface
export interface BaseDataPoint {
  id: string;
  label: string;
}

// Generic plot settings interface
export interface PlotSettings<TData extends BaseDataPoint>
  extends BaseChartSettings {
  data: TData[];
}

// Base component props interfaces
export interface BasePanelProps<TSettings> {
  settings: TSettings;
  onChange: (settings: TSettings) => void;
  highlightSignals: Record<HighlightKey, number>;
  focusRequest: FocusRequest | null;
}

export interface BaseDataEditorProps<TData extends BaseDataPoint> {
  data: TData[];
  paletteName: PaletteKey;
  onChange: (data: TData[]) => void;
  highlightSignal: number;
  focusRequest: FocusRequest | null;
}

export interface BasePreviewProps<TSettings> {
  settings: TSettings;
  onUpdateSettings: (settings: TSettings) => void;
  onHighlight: (keys: HighlightKey[]) => void;
  onRequestFocus: (target: FocusTarget) => void;
}
