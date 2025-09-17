import { useEffect, useRef, type ChangeEvent, type MutableRefObject } from 'react'
import type { AxisSettings, ChartSettings, FocusRequest, HighlightKey } from '../types'
import { useHighlightEffect } from '../hooks/useHighlightEffect'
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

type NumberFieldProps = {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
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

function NumberField({ label, value, onChange, min, max, step, suffix, disabled }: NumberFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(event.target.value)
    if (Number.isNaN(parsed)) {
      return
    }
    onChange(parsed)
  }

  return (
    <label className={`flex flex-col gap-1 text-sm text-white ${disabled ? 'opacity-60' : ''}`}>
      <span className="text-xs uppercase tracking-wide text-white/50">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        disabled={disabled}
        className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40 disabled:cursor-not-allowed disabled:bg-white/10"
      />
      {suffix ? <span className="text-xs text-white/40">{suffix}</span> : null}
    </label>
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
        <NumberField
          label="Line width"
          value={settings.axisLineWidth}
          min={0}
          max={8}
          step={0.5}
          onChange={(value) => update('axisLineWidth', Number.isNaN(value) ? settings.axisLineWidth : value)}
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
    } catch (error) {
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
          <NumberField
            label="Default opacity"
            value={settings.barOpacity}
            min={0}
            max={1}
            step={0.05}
            onChange={(value) => update('barOpacity', Number.isNaN(value) ? settings.barOpacity : Math.min(Math.max(value, 0), 1))}
            suffix="0 → transparent, 1 → solid"
          />
          <NumberField
            label="Default border width"
            value={settings.barBorderWidth}
            min={0}
            max={20}
            step={0.5}
            onChange={(value) => update('barBorderWidth', Number.isNaN(value) ? settings.barBorderWidth : Math.max(value, 0))}
            suffix="Pixels"
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
              <select
                value={settings.errorBarMode}
                onChange={(event) => update('errorBarMode', event.target.value as ChartSettings['errorBarMode'])}
                className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
              >
                <option value="global">Use global color</option>
                <option value="match">Match bar border color</option>
              </select>
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
            <NumberField
              label="Line width"
              value={settings.errorBarWidth}
              min={0}
              max={12}
              step={0.5}
              onChange={(value) => update('errorBarWidth', Number.isNaN(value) ? settings.errorBarWidth : Math.max(value, 0))}
              suffix="px"
            />
            <NumberField
              label="Cap width"
              value={settings.errorBarCapWidth}
              min={0}
              max={96}
              step={2}
              onChange={(value) => update('errorBarCapWidth', Number.isNaN(value) ? settings.errorBarCapWidth : Math.max(value, 0))}
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
          <NumberField
            label="Chart title"
            value={settings.titleFontSize}
            min={10}
            max={96}
            step={1}
            onChange={(value) => update('titleFontSize', Number.isNaN(value) ? settings.titleFontSize : Math.max(value, 8))}
            suffix="px"
          />
          <NumberField
            label="Title offset"
            value={settings.titleOffsetY}
            min={-200}
            max={200}
            step={1}
            onChange={(value) => update('titleOffsetY', Number.isNaN(value) ? settings.titleOffsetY : value)}
            suffix="px"
          />
          <NumberField
            label="Value labels"
            value={settings.valueLabelFontSize}
            min={8}
            max={64}
            step={1}
            onChange={(value) => update('valueLabelFontSize', Number.isNaN(value) ? settings.valueLabelFontSize : Math.max(value, 6))}
            suffix="px"
          />
          <NumberField
            label="Value label offset"
            value={settings.valueLabelOffsetY}
            min={-200}
            max={200}
            step={1}
            onChange={(value) => update('valueLabelOffsetY', Number.isNaN(value) ? settings.valueLabelOffsetY : value)}
            suffix="px (positive moves down)"
          />
          <NumberField
            label="Value label X offset"
            value={settings.valueLabelOffsetX}
            min={-200}
            max={200}
            step={1}
            onChange={(value) => update('valueLabelOffsetX', Number.isNaN(value) ? settings.valueLabelOffsetX : value)}
            suffix="px (positive moves right)"
          />
          <NumberField
            label="Axis titles"
            value={settings.axisTitleFontSize}
            min={8}
            max={72}
            step={1}
            onChange={(value) => update('axisTitleFontSize', Number.isNaN(value) ? settings.axisTitleFontSize : Math.max(value, 6))}
            suffix="px"
          />
          <NumberField
            label="X label offset"
            value={settings.xAxisTitleOffsetY}
            min={-200}
            max={200}
            step={1}
            onChange={(value) => update('xAxisTitleOffsetY', Number.isNaN(value) ? settings.xAxisTitleOffsetY : value)}
            suffix="px"
          />
          <NumberField
            label="Axis ticks"
            value={settings.axisTickFontSize}
            min={6}
            max={48}
            step={1}
            onChange={(value) => update('axisTickFontSize', Number.isNaN(value) ? settings.axisTickFontSize : Math.max(value, 6))}
            suffix="px"
          />
          <NumberField
            label="Y label offset"
            value={settings.yAxisTitleOffsetX}
            min={-200}
            max={200}
            step={1}
            onChange={(value) => update('yAxisTitleOffsetX', Number.isNaN(value) ? settings.yAxisTitleOffsetX : value)}
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
