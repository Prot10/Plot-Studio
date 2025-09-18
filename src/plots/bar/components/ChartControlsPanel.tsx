import { ChartPageBlock } from '../../../shared/components/ChartPageLayout'
import { ColorField } from '../../../shared/components/ColorField'
import { NumericInput } from '../../../shared/components/NumericInput'
import { SelectField } from '../../../shared/components/SelectField'
import { useHighlightEffect } from '../../../shared/hooks/useHighlightEffect'
import type { BarChartSettings } from '../../../types/bar'
import type { HighlightKey } from '../../../types/base'

type ChartControlsPanelProps = {
  settings: BarChartSettings
  onChange: (settings: BarChartSettings) => void
  highlightSignals?: Partial<Record<HighlightKey, number>>
}

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

type CornerStyleOption = {
  value: BarChartSettings['barCornerStyle']
  label: string
}

const cornerOptions: CornerStyleOption[] = [
  { value: 'top', label: 'Round top only' },
  { value: 'both', label: 'Round top & bottom' },
]

const errorBarModeOptions: Array<{ value: BarChartSettings['errorBarMode']; label: string }> = [
  { value: 'global', label: 'Use global color' },
  { value: 'match', label: 'Match bar border color' },
]

function CornerStyleSelector({
  value,
  onChange,
}: {
  value: BarChartSettings['barCornerStyle']
  onChange: (value: BarChartSettings['barCornerStyle']) => void
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

export function ChartControlsPanel({ settings, onChange, highlightSignals }: ChartControlsPanelProps) {
  const update = <K extends keyof BarChartSettings>(key: K, value: BarChartSettings[K]) => {
    onChange({ ...settings, [key]: value })
  }

  const barDesignHighlight = useHighlightEffect(highlightSignals?.design)
  const typographyHighlight = useHighlightEffect(highlightSignals?.valueLabels)
  const errorHighlight = useHighlightEffect(highlightSignals?.errorBars)

  return (
    <>
      <ChartPageBlock
        title="Bar design"
        highlighted={barDesignHighlight}
        bodyClassName="space-y-4"
      >
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
          title="Value labels"
          value={settings.showValueLabels}
          onChange={(value) => update('showValueLabels', value)}
        />
        <Toggle
          title="Error bars"
          value={settings.showErrorBars}
          onChange={(value) => update('showErrorBars', value)}
        />
        {settings.showErrorBars ? (
          <div
            className={`${errorHighlight ? 'highlight-pulse ' : ''}grid grid-cols-1 gap-3 sm:grid-cols-3`}
          >
            <SelectField<BarChartSettings['errorBarMode']>
              label="Color mode"
              value={settings.errorBarMode}
              onChange={(value) => update('errorBarMode', value)}
              options={errorBarModeOptions}
              placeholder="Select mode"
            />
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
      </ChartPageBlock>

      <ChartPageBlock
        title="Typography"
        highlighted={typographyHighlight}
        bodyClassName="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
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
          title="Value label Y offset"
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
          title="X title offset"
          value={settings.xAxisTitleOffsetY}
          min={-200}
          max={200}
          step={1}
          precision={0}
          onChange={(value) => update('xAxisTitleOffsetY', value)}
          suffix="px"
        />
      </ChartPageBlock>
    </>
  )
}

export default ChartControlsPanel
