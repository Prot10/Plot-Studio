import { useEffect, useRef, type MutableRefObject } from 'react'
import { NumericInput } from '../shared/components/NumericInput'
import { SelectField } from '../shared/components/SelectField'
import { useHighlightEffect } from '../shared/hooks/useHighlightEffect'
import type { AxisSettings, ChartSettings, FocusRequest, HighlightKey } from '../types'
import { ColorField } from './ColorField'

type ChartControlsPanelProps = {
  settings: ChartSettings
  onChange: (settings: ChartSettings) => void
  highlightSignals?: Partial<Record<HighlightKey, number>>
  focusRequest?: FocusRequest | null
}

type ToggleProps = {
  label: string
  value: boolean
  onChange: (value: boolean) => void
  description?: string
  disabled?: boolean
}

function Toggle({ label, description, value, onChange, disabled }: ToggleProps) {
  const handleClick = () => {
    if (disabled) return
    onChange(!value)
  }

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-lg border border-white/10 px-3 py-2 ${disabled ? 'bg-white/5 opacity-60' : 'bg-white/5'}`}
    >
      <div>
        <span className="text-sm font-medium text-white">{label}</span>
        {description ? <p className="text-xs text-white/60">{description}</p> : null}
      </div>
      <button
        type="button"
        onClick={handleClick}
        className={`relative inline-flex h-6 w-11 flex-none items-center rounded-full transition ${value ? 'bg-sky-400' : 'bg-white/20'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        role="switch"
        aria-checked={value}
        aria-disabled={disabled}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${value ? 'translate-x-5' : 'translate-x-1'}`}
        />
      </button>
    </div>
  )
}

type CornerStyleOption = {
  value: ChartSettings['barCornerStyle']
  label: string
}

const cornerOptions: CornerStyleOption[] = [
  { value: 'top', label: 'Round top only' },
  { value: 'both', label: 'Round top & bottom' },
]

const errorBarModeOptions: Array<{ value: ChartSettings['errorBarMode']; label: string }> = [
  { value: 'global', label: 'Use global color' },
  { value: 'match', label: 'Match bar border color' },
]

function CornerStyleSelector({
  value,
  onChange,
}: {
  value: ChartSettings['barCornerStyle']
  onChange: (value: ChartSettings['barCornerStyle']) => void
}) {
  return (
    <div className="flex gap-2">
      {cornerOptions.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-md border px-3 py-1.5 text-sm transition ${isActive ? 'border-sky-400 bg-sky-400/20 text-white' : 'border-white/10 bg-white/5 text-white/70 hover:text-white'}`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function AxisSection({
  label,
  settings,
  onChange,
  highlightSignal,
  titleRef,
}: {
  label: string
  settings: AxisSettings
  onChange: (settings: AxisSettings) => void
  highlightSignal?: number
  titleRef?: MutableRefObject<HTMLInputElement | null>
}) {
  const update = <K extends keyof AxisSettings>(key: K, value: AxisSettings[K]) => {
    onChange({ ...settings, [key]: value })
  }

  const disabled = !settings.showAxisLines
  const highlight = useHighlightEffect(highlightSignal)

  return (
    <section
      className={`flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 ${disabled ? 'opacity-80' : ''} ${highlight ? 'highlight-pulse' : ''}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{label} axis</h3>
        <Toggle
          label={settings.showAxisLines ? 'Visible' : 'Hidden'}
          value={settings.showAxisLines}
          onChange={(value) => update('showAxisLines', value)}
        />
      </div>
      <label className="flex flex-col gap-1 text-sm text-white">
        <span className="text-xs uppercase tracking-wide text-white/50">Title</span>
        <input
          type="text"
          value={settings.title}
          onChange={(event) => update('title', event.target.value)}
          className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/60 disabled:cursor-not-allowed disabled:bg-white/10"
          disabled={disabled}
          ref={titleRef}
        />
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <NumericInput
          title="Line width"
          value={settings.axisLineWidth}
          min={0}
          max={8}
          step={0.5}
          precision={1}
          onChange={(value) => update('axisLineWidth', value)}
          disabled={disabled}
        />
        <ColorField
          label="Line color"
          value={settings.axisLineColor}
          onChange={(value) => update('axisLineColor', value)}
          disabled={disabled}
        />
        <Toggle
          label={settings.showTickLabels ? 'Ticks visible' : 'Ticks hidden'}
          value={settings.showTickLabels}
          onChange={(value) => update('showTickLabels', value)}
          disabled={disabled}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ColorField
          label="Tick color"
          value={settings.tickLabelColor}
          onChange={(value) => update('tickLabelColor', value)}
          disabled={disabled}
        />
        <Toggle
          label={settings.showGridLines ? 'Grid visible' : 'Grid hidden'}
          value={settings.showGridLines}
          onChange={(value) => update('showGridLines', value)}
          disabled={disabled}
        />
      </div>
      {settings.showGridLines ? (
        <ColorField
          label="Grid color"
          value={settings.gridLineColor}
          onChange={(value) => update('gridLineColor', value)}
          disabled={disabled}
        />
      ) : null}
    </section>
  )
}

export function ChartControlsPanel({ settings, onChange, highlightSignals, focusRequest }: ChartControlsPanelProps) {
  const update = <K extends keyof ChartSettings>(key: K, value: ChartSettings[K]) => {
    onChange({ ...settings, [key]: value })
  }

  const updateAxis = (key: 'xAxis' | 'yAxis', value: AxisSettings) => {
    onChange({ ...settings, [key]: value })
  }

  const barDesignHighlight = useHighlightEffect(highlightSignals?.barDesign)
  const typographyHighlight = useHighlightEffect(highlightSignals?.valueLabels)
  const errorHighlight = useHighlightEffect(highlightSignals?.errorBars)
  const xAxisTitleRef = useRef<HTMLInputElement | null>(null)
  const yAxisTitleRef = useRef<HTMLInputElement | null>(null)
  const handledFocusRef = useRef(0)

  const focusInput = (input: HTMLInputElement | null | undefined) => {
    if (!input) return false
    try {
      input.focus({ preventScroll: true })
    } catch {
      input.focus()
    }
    input.select()
    if (typeof input.scrollIntoView === 'function') {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return true
  }

  useEffect(() => {
    if (!focusRequest) return
    if (focusRequest.requestId === handledFocusRef.current) return

    if (focusRequest.target.type === 'xAxisTitle') {
      if (focusInput(xAxisTitleRef.current)) {
        handledFocusRef.current = focusRequest.requestId
      }
      return
    }

    if (focusRequest.target.type === 'yAxisTitle') {
      if (focusInput(yAxisTitleRef.current)) {
        handledFocusRef.current = focusRequest.requestId
      }
    }
  }, [focusRequest])

  return (
    <div className="space-y-6">
      <section
        className={`space-y-4 rounded-xl border border-white/10 bg-white/5 p-4 ${barDesignHighlight ? 'highlight-pulse' : ''}`}
      >
        <h2 className="text-lg font-semibold text-white">Bar design</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <NumericInput
            title="Default opacity"
            value={settings.barOpacity}
            min={0}
            max={1}
            step={0.05}
            precision={2}
            onChange={(value) => update('barOpacity', value)}
          />
          <NumericInput
            title="Default border width"
            value={settings.barBorderWidth}
            min={0}
            max={20}
            step={0.5}
            precision={1}
            onChange={(value) => update('barBorderWidth', value)}
            suffix="px"
          />
          <label className="flex flex-col gap-1 text-sm text-white">
            <span className="text-xs uppercase tracking-wide text-white/50">Bar spacing</span>
            <input
              type="range"
              min={0}
              max={0.6}
              step={0.02}
              value={settings.barGap}
              onChange={(event) => update('barGap', Number.parseFloat(event.target.value))}
              className="accent-sky-400"
            />
            <span className="text-xs text-white/40">{settings.barGap.toFixed(2)}</span>
          </label>
        </div>
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-wide text-white/50">Corner radius</span>
          <input
            type="range"
            min={0}
            max={96}
            step={2}
            value={settings.barCornerRadius}
            onChange={(event) => update('barCornerRadius', Number.parseFloat(event.target.value))}
            className="accent-sky-400"
          />
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>{settings.barCornerRadius.toFixed(0)} px</span>
            <CornerStyleSelector
              value={settings.barCornerStyle}
              onChange={(value) => update('barCornerStyle', value)}
            />
          </div>
        </div>
        <Toggle
          label={settings.showValueLabels ? 'Value labels visible' : 'Value labels hidden'}
          description="Toggle values on top of bars"
          value={settings.showValueLabels}
          onChange={(value) => update('showValueLabels', value)}
        />
        <Toggle
          label={settings.showErrorBars ? 'Error bars visible' : 'Error bars hidden'}
          description="Show indecision bars on top of each bar"
          value={settings.showErrorBars}
          onChange={(value) => update('showErrorBars', value)}
        />
        {settings.showErrorBars ? (
          <div
            className={`grid grid-cols-1 gap-3 sm:grid-cols-3 ${errorHighlight ? 'highlight-pulse' : ''}`}
          >
            <label className="flex flex-col gap-1 text-sm text-white">
              <span className="text-xs uppercase tracking-wide text-white/50">Color mode</span>
              <SelectField<ChartSettings['errorBarMode']>
                value={settings.errorBarMode}
                onChange={(value) => update('errorBarMode', value)}
                options={errorBarModeOptions}
                placeholder="Select mode"
              />
            </label>
            {settings.errorBarMode === 'global' ? (
              <ColorField
                label="Error bar color"
                value={settings.errorBarColor}
                onChange={(value) => update('errorBarColor', value)}
              />
            ) : (
              <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
                Using each bar border color
              </div>
            )}
            <NumericInput
              title="Line width"
              value={settings.errorBarWidth}
              min={0}
              max={12}
              step={0.5}
              precision={1}
              onChange={(value) => update('errorBarWidth', value)}
              suffix="px"
            />
            <NumericInput
              title="Cap width"
              value={settings.errorBarCapWidth}
              min={0}
              max={96}
              step={2}
              precision={0}
              onChange={(value) => update('errorBarCapWidth', value)}
              suffix="px"
            />
          </div>
        ) : null}
      </section>

      <section
        className={`space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 ${typographyHighlight ? 'highlight-pulse' : ''}`}
      >
        <h2 className="text-lg font-semibold text-white">Typography</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumericInput
            title="Value labels"
            value={settings.valueLabelFontSize}
            min={8}
            max={64}
            step={1}
            precision={0}
            onChange={(value) => update('valueLabelFontSize', value)}
            suffix="px"
          />
          <NumericInput
            title="Value label offset"
            value={settings.valueLabelOffsetY}
            min={-200}
            max={200}
            step={1}
            precision={0}
            onChange={(value) => update('valueLabelOffsetY', value)}
            suffix="px"
          />
          <NumericInput
            title="Value label X offset"
            value={settings.valueLabelOffsetX}
            min={-200}
            max={200}
            step={1}
            precision={0}
            onChange={(value) => update('valueLabelOffsetX', value)}
            suffix="px"
          />
          <NumericInput
            title="Axis titles"
            value={settings.axisTitleFontSize}
            min={8}
            max={72}
            step={1}
            precision={0}
            onChange={(value) => update('axisTitleFontSize', value)}
            suffix="px"
          />
          <NumericInput
            title="X label offset"
            value={settings.xAxisTitleOffsetY}
            min={-200}
            max={200}
            step={1}
            precision={0}
            onChange={(value) => update('xAxisTitleOffsetY', value)}
            suffix="px"
          />
          <NumericInput
            title="Axis ticks"
            value={settings.axisTickFontSize}
            min={6}
            max={48}
            step={1}
            precision={0}
            onChange={(value) => update('axisTickFontSize', value)}
            suffix="px"
          />
          <NumericInput
            title="Y label offset"
            value={settings.yAxisTitleOffsetX}
            min={-200}
            max={200}
            step={1}
            precision={0}
            onChange={(value) => update('yAxisTitleOffsetX', value)}
            suffix="px"
          />
        </div>
      </section>

      <AxisSection
        label="X"
        settings={settings.xAxis}
        onChange={(config) => updateAxis('xAxis', config)}
        highlightSignal={highlightSignals?.xAxis}
        titleRef={xAxisTitleRef}
      />
      <AxisSection
        label="Y"
        settings={settings.yAxis}
        onChange={(config) => updateAxis('yAxis', config)}
        highlightSignal={highlightSignals?.yAxis}
        titleRef={yAxisTitleRef}
      />

    </div>
  )
}

export default ChartControlsPanel
