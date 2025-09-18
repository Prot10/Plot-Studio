import { ChartPageBlock } from '../../../shared/components/ChartPageLayout'
import { ColorField } from '../../../shared/components/ColorField'
import { FontPicker } from '../../../shared/components/FontPicker'
import { NumericInput } from '../../../shared/components/NumericInput'
import { SelectField } from '../../../shared/components/SelectField'
import { TitleSettingsPanel } from '../../../shared/components/TitleSettingsPanel'
import { DEFAULT_FONT_OPTIONS } from '../../../shared/constants/fonts'
import { useHighlightEffect } from '../../../shared/hooks/useHighlightEffect'
import { paletteOptions, palettes } from '../../../shared/utils/palettes'
import type { BarChartSettings, BarDataPoint } from '../../../types/bar'
import type { FocusRequest, HighlightKey, PaletteKey } from '../../../types/base'
import { XAxisPanel } from './XAxisPanel'
import { YAxisPanel } from './YAxisPanel'

type ToggleProps = {
  title: string
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}

function Toggle({ title, value, onChange, disabled }: ToggleProps) {
  const handleClick = () => {
    if (disabled) return
    onChange(!value)
  }

  return (
    <div className={`flex flex-col gap-1 text-sm text-white ${disabled ? 'opacity-60' : ''}`}>
      <span className="text-xs uppercase tracking-wide text-white/50">{title}</span>
      <div className="h-9 rounded-md border border-white/10 bg-white/10 px-3 flex items-center justify-start">
        <button
          type="button"
          onClick={handleClick}
          className={`relative inline-flex h-5 w-9 flex-none items-center rounded-full transition ${value ? 'bg-sky-400' : 'bg-white/20'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          role="switch"
          aria-checked={value}
          aria-disabled={disabled}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${value ? 'translate-x-4' : 'translate-x-0.5'}`}
          />
        </button>
      </div>
    </div>
  )
}

type LeftPanelProps = {
  settings: BarChartSettings
  bars: BarDataPoint[]
  onChange: (settings: BarChartSettings) => void
  onBarsChange: (bars: BarDataPoint[]) => void
  highlightSignals?: Partial<Record<HighlightKey, number>>
  focusRequest?: FocusRequest | null
}

export function LeftPanel({ settings, bars, onChange, onBarsChange, highlightSignals, focusRequest }: LeftPanelProps) {
  const update = <K extends keyof BarChartSettings>(key: K, value: BarChartSettings[K]) => {
    onChange({ ...settings, [key]: value })
  }

  const panelHighlight = useHighlightEffect(highlightSignals?.chartBasics)
  const valueLabelHighlight = useHighlightEffect(highlightSignals?.valueLabels)
  const titleHighlight = useHighlightEffect(highlightSignals?.title)
  const xAxisHighlight = useHighlightEffect(highlightSignals?.xAxis)
  const yAxisHighlight = useHighlightEffect(highlightSignals?.yAxis)

  const handlePaletteChange = (nextPalette: PaletteKey) => {
    const palette = palettes[nextPalette]
    if (!palette) return

    const nextBars = bars.map((bar, index) => ({
      ...bar,
      fillColor: palette[index % palette.length],
    }))

    update('paletteName', nextPalette)
    onBarsChange(nextBars)
  }

  return (
    <>
      <ChartPageBlock title="General Settings" highlighted={panelHighlight}>
        <div className="space-y-8">
          <div className="grid gap-16 sm:grid-cols-2">
            <SelectField<PaletteKey>
              label="Color Palette"
              value={settings.paletteName}
              onChange={(nextPalette) => handlePaletteChange(nextPalette)}
              options={paletteOptions}
              placeholder="Select a palette"
            />
            <ColorField
              label="Background color"
              value={settings.backgroundColor}
              onChange={(value) => update('backgroundColor', value)}
            />
          </div>

          <div className="grid gap-16 sm:grid-cols-2">
            <FontPicker
              label="Chart text font"
              value={settings.globalFontFamily}
              onChange={(value) => update('globalFontFamily', value)}
              options={DEFAULT_FONT_OPTIONS}
            />
            <NumericInput
              title="Inner padding"
              value={settings.canvasPadding}
              min={0}
              max={160}
              step={4}
              precision={0}
              onChange={(value) => update('canvasPadding', value)}
              suffix="px"
            />
          </div>

          <div className="space-y-8 border-t border-white/10 pt-8">
            <h3 className="text-sm font-semibold text-white/80">Chart Dimensions</h3>

            <div className="grid gap-16 sm:grid-cols-2">
              <div className="flex flex-col gap-1 text-sm text-white">
                <span className="text-xs uppercase tracking-wide text-white/50">Custom width</span>
                <input
                  type="number"
                  min={120}
                  step={10}
                  value={settings.customWidth ?? ''}
                  onChange={(event) => {
                    const val = event.target.value
                    update('customWidth', val === '' ? null : Number.parseFloat(val))
                  }}
                  placeholder="auto"
                  className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                />
              </div>
              <div className="flex flex-col gap-1 text-sm text-white">
                <span className="text-xs uppercase tracking-wide text-white/50">Custom height</span>
                <input
                  type="number"
                  min={120}
                  step={10}
                  value={settings.customHeight ?? ''}
                  onChange={(event) => {
                    const val = event.target.value
                    update('customHeight', val === '' ? null : Number.parseFloat(val))
                  }}
                  placeholder="auto"
                  className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                />
              </div>
            </div>

            <div className="grid gap-16 sm:grid-cols-1">
              <NumericInput
                title="Aspect ratio"
                value={settings.aspectRatio}
                onChange={(value) => update('aspectRatio', value)}
                min={0.3}
                max={1.2}
                step={0.02}
                precision={2}
              />
            </div>
          </div>
        </div>
      </ChartPageBlock>

      <ChartPageBlock title="Title & Subtitle" highlighted={titleHighlight}>
        <TitleSettingsPanel
          settings={settings}
          onChange={onChange}
          focusRequest={focusRequest}
          highlightSignal={highlightSignals?.title}
        />
      </ChartPageBlock>

      <ChartPageBlock title="X-Axis" highlighted={xAxisHighlight}>
        <XAxisPanel
          settings={settings}
          onChange={onChange}
          highlightSignals={highlightSignals}
          focusRequest={focusRequest}
        />
      </ChartPageBlock>

      <ChartPageBlock title="Y-Axis" highlighted={yAxisHighlight}>
        <YAxisPanel
          settings={settings}
          onChange={onChange}
          highlightSignals={highlightSignals}
          focusRequest={focusRequest}
        />
      </ChartPageBlock>

      <ChartPageBlock
        title="Value Labels"
        highlighted={valueLabelHighlight}
        bodyClassName="space-y-4"
      >
        {/* First row: Toggle to show value labels and font size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Toggle
              title="Show value labels"
              value={settings.showValueLabels}
              onChange={(value) => update('showValueLabels', value)}
            />
          </div>

          <div className={`transition-opacity ${!settings.showValueLabels ? 'opacity-50 pointer-events-none' : ''}`}>
            <NumericInput
              title="Font size"
              value={settings.valueLabelFontSize}
              min={6}
              max={48}
              step={1}
              precision={0}
              onChange={(value) => update('valueLabelFontSize', value)}
              suffix="px"
            />
          </div>
        </div>

        {/* Second row: Color, X offset, Y offset */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 transition-opacity ${!settings.showValueLabels ? 'opacity-50 pointer-events-none' : ''}`}>
          <div>
            <ColorField
              label="Label color"
              value={settings.textColor}
              onChange={(value) => update('textColor', value)}
            />
          </div>

          <div>
            <NumericInput
              title="X offset"
              value={settings.valueLabelOffsetX}
              min={-100}
              max={100}
              step={1}
              precision={0}
              onChange={(value) => update('valueLabelOffsetX', value)}
              suffix="px"
            />
          </div>

          <div>
            <NumericInput
              title="Y offset"
              value={settings.valueLabelOffsetY}
              min={-100}
              max={100}
              step={1}
              precision={0}
              onChange={(value) => update('valueLabelOffsetY', value)}
              suffix="px"
            />
          </div>
        </div>
      </ChartPageBlock>
    </>
  )
}

export default LeftPanel
