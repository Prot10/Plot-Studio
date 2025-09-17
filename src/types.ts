export type BarDatum = {
  id: string
  label: string
  value: number
  fillColor: string
  borderColor: string
  borderWidth: number
  opacity: number
  error: number
  pattern: BarPattern
}

export type BarPattern = 'solid' | 'diagonal' | 'dots' | 'crosshatch' | 'vertical'

export type AxisSettings = {
  showAxisLines: boolean
  showTickLabels: boolean
  showGridLines: boolean
  axisLineColor: string
  axisLineWidth: number
  tickLabelColor: string
  gridLineColor: string
  title: string
}

export type ChartSettings = {
  bars: BarDatum[]
  showErrorBars: boolean
  showValueLabels: boolean
  barOpacity: number
  barBorderWidth: number
  barCornerRadius: number
  barCornerStyle: 'top' | 'both'
  barGap: number
  backgroundColor: string
  canvasPadding: number
  textColor: string
  title: string
  titleFontSize: number
  titleOffsetY: number
  axisTitleFontSize: number
  axisTickFontSize: number
  valueLabelFontSize: number
  valueLabelOffsetY: number
  valueLabelOffsetX: number
  xAxisTitleOffsetY: number
  yAxisTitleOffsetX: number
  yAxisMin: number | null
  yAxisMax: number | null
  aspectRatio: number
  customWidth: number | null
  customHeight: number | null
  errorBarMode: 'global' | 'match'
  errorBarColor: string
  errorBarWidth: number
  errorBarCapWidth: number
  yAxisTickStep: number | null
  exportScale: number
  exportTransparent: boolean
  exportFileName: string
  paletteName: PaletteKey
  xAxis: AxisSettings
  yAxis: AxisSettings
}

export type PaletteKey = 'vibrant' | 'cool' | 'warm' | 'pastel'

export type HighlightKey =
  | 'chartBasics'
  | 'yAxis'
  | 'xAxis'
  | 'data'
  | 'barDesign'
  | 'valueLabels'
  | 'errorBars'
