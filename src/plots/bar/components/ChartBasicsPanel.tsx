import { useEffect, useRef } from 'react'
import { ColorField } from '../../../shared/components/ColorField'
import { useHighlightEffect } from '../../../shared/hooks/useHighlightEffect'
import { paletteOptions, palettes } from '../../../shared/utils/palettes'
import type { BarChartSettings, BarDataPoint } from '../../../types/bar'
import type { FocusRequest, HighlightKey, PaletteKey } from '../../../types/base'

type ChartBasicsPanelProps = {
  settings: BarChartSettings
  bars: BarDataPoint[]
  onChange: (settings: BarChartSettings) => void
  onBarsChange: (bars: BarDataPoint[]) => void
  highlightSignals?: Partial<Record<HighlightKey, number>>
  focusRequest?: FocusRequest | null
}

export function ChartBasicsPanel({ settings, bars, onChange, onBarsChange, highlightSignals, focusRequest }: ChartBasicsPanelProps) {
  const update = <K extends keyof BarChartSettings>(key: K, value: BarChartSettings[K]) => {
    onChange({ ...settings, [key]: value })
  }

  const panelHighlight = useHighlightEffect(highlightSignals?.chartBasics)
  const yAxisHighlight = useHighlightEffect(highlightSignals?.yAxis)
  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const handledFocusRef = useRef(0)

  useEffect(() => {
    if (!focusRequest) return
    if (focusRequest.requestId === handledFocusRef.current) return
    if (focusRequest.target.type !== 'chartTitle') return

    const input = titleInputRef.current
    if (!input) return

    handledFocusRef.current = focusRequest.requestId
    try {
      input.focus({ preventScroll: true })
    } catch {
      input.focus()
    }
    input.select()
    if (typeof input.scrollIntoView === 'function') {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [focusRequest])

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
    <section className={`space-y-3 ${panelHighlight ? 'highlight-pulse' : ''}`}>
      <h2 className="text-lg font-semibold text-white">Chart</h2>
      <label className="flex flex-col gap-1 text-sm text-white">
        <span className="text-xs uppercase tracking-wide text-white/50">Title</span>
        <input
          type="text"
          value={settings.title}
          onChange={(event) => update('title', event.target.value)}
          ref={titleInputRef}
          className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
          placeholder="Untitled chart"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-white">
        <span className="text-xs uppercase tracking-wide text-white/50">Palette</span>
        <select
          value={settings.paletteName}
          onChange={(event) => handlePaletteChange(event.target.value as PaletteKey)}
          className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
        >
          {paletteOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-white">
        <span className="text-xs uppercase tracking-wide text-white/50">Inner padding</span>
        <input
          type="number"
          value={settings.canvasPadding}
          min={0}
          max={160}
          step={4}
          onChange={(event) => update('canvasPadding', Math.max(Number.parseFloat(event.target.value) || 0, 0))}
          className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
        />
        <span className="text-xs text-white/40">Space around the plot</span>
      </label>
      <ColorField
        label="Background"
        value={settings.backgroundColor}
        onChange={(value) => update('backgroundColor', value)}
      />
      <ColorField
        label="Text color"
        value={settings.textColor}
        onChange={(value) => update('textColor', value)}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-white">
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
        </label>
        <label className="flex flex-col gap-1 text-sm text-white">
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
        </label>
      </div>
      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${yAxisHighlight ? 'highlight-pulse' : ''}`}>
        <label className="flex flex-col gap-1 text-sm text-white">
          <span className="text-xs uppercase tracking-wide text-white/50">Y min</span>
          <input
            type="number"
            value={settings.yAxisMin ?? ''}
            onChange={(event) => {
              const val = event.target.value
              update('yAxisMin', val === '' ? null : Number.parseFloat(val))
            }}
            placeholder="auto"
            className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white">
          <span className="text-xs uppercase tracking-wide text-white/50">Y max</span>
          <input
            type="number"
            value={settings.yAxisMax ?? ''}
            onChange={(event) => {
              const val = event.target.value
              update('yAxisMax', val === '' ? null : Number.parseFloat(val))
            }}
            placeholder="auto"
            className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white">
          <span className="text-xs uppercase tracking-wide text-white/50">Tick step</span>
          <input
            type="number"
            value={settings.yAxisTickStep ?? ''}
            onChange={(event) => {
              const val = event.target.value
              update('yAxisTickStep', val === '' ? null : Number.parseFloat(val))
            }}
            min={0}
            step={0.001}
            placeholder="auto"
            className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
          />
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm text-white">
        <span className="text-xs uppercase tracking-wide text-white/50">Aspect ratio</span>
        <input
          type="range"
          min={0.3}
          max={1.2}
          step={0.02}
          value={settings.aspectRatio}
          onChange={(event) => update('aspectRatio', Number.parseFloat(event.target.value))}
          className="accent-sky-400"
        />
        <span className="text-xs text-white/40">
          Height = width × {settings.aspectRatio.toFixed(2)}
        </span>
      </label>
    </section>
  )
}

export default ChartBasicsPanel
