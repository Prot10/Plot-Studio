import { ColorField } from '../../../shared/components/ColorField'
import { NumericInput } from '../../../shared/components/NumericInput'
import { SelectField } from '../../../shared/components/SelectField'
import { useHighlightEffect } from '../../../shared/hooks/useHighlightEffect'
import { paletteOptions, palettes } from '../../../shared/utils/palettes'
import type { BarChartSettings, BarDataPoint } from '../../../types/bar'
import type { HighlightKey, PaletteKey } from '../../../types/base'

type ChartBasicsPanelProps = {
  settings: BarChartSettings
  bars: BarDataPoint[]
  onChange: (settings: BarChartSettings) => void
  onBarsChange: (bars: BarDataPoint[]) => void
  highlightSignals?: Partial<Record<HighlightKey, number>>
}

export function ChartBasicsPanel({ settings, bars, onChange, onBarsChange, highlightSignals }: ChartBasicsPanelProps) {
  const update = <K extends keyof BarChartSettings>(key: K, value: BarChartSettings[K]) => {
    onChange({ ...settings, [key]: value })
  }

  const panelHighlight = useHighlightEffect(highlightSignals?.chartBasics)

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
    <section className={classNames('space-y-10', panelHighlight ? 'highlight-pulse' : null)}>
      <div className="space-y-8">
        <h3 className="text-sm font-semibold text-white/80">Chart Appearance</h3>

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

        <div className="grid gap-16 sm:grid-cols-1">
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
    </section>
  )
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export default ChartBasicsPanel
