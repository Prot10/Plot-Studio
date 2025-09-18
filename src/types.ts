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
  patternColor: string
  patternOpacity: number
  patternSize: number
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
  titleColor: string
  titleFontFamily: string
  titleIsBold: boolean
  titleIsItalic: boolean
  titleIsUnderline: boolean
  titleOffsetX: number
  title: string
  titleFontSize: number
  titleOffsetY: number
  subtitle: string
  subtitleFontSize: number
  subtitleOffsetY: number
  subtitleOffsetX: number
  subtitleColor: string
  subtitleFontFamily: string
  subtitleIsBold: boolean
  subtitleIsItalic: boolean
  subtitleIsUnderline: boolean
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
  | 'title'
  | 'barDesign'
  | 'valueLabels'
  | 'errorBars'

export type FocusTarget =
  | { type: 'chartTitle' }
  | { type: 'chartSubtitle' }
  | { type: 'barLabel'; barId: string }
  | { type: 'barValue'; barId: string }
  | { type: 'xAxisTitle' }
  | { type: 'yAxisTitle' }

export type FocusRequest = {
  target: FocusTarget
  requestId: number
}
