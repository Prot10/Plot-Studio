import { ChartPageBlock } from '../../../shared/components/ChartPageLayout'
import { ColorField } from '../../../shared/components/ColorField'
import { NumericInput } from '../../../shared/components/NumericInput'
import { SelectField } from '../../../shared/components/SelectField'
import { useHighlightEffect } from '../../../shared/hooks/useHighlightEffect'
import type { BarChartSettings, BarDataPoint } from '../../../types/bar'
import type { FocusRequest, HighlightKey } from '../../../types/base'
import { BarDataEditor } from './BarDataEditor'

type RightPanelProps = {
  settings: BarChartSettings
  bars: BarDataPoint[]
  onChange: (settings: BarChartSettings) => void
  onBarsChange: (bars: BarDataPoint[]) => void
  highlightSignals?: Partial<Record<HighlightKey, number>>
  focusRequest?: FocusRequest | null
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
    <div className="flex flex-col gap-1 text-sm text-white">
      <span className="text-xs uppercase tracking-wide text-white/50">Rounded</span>
      <div className="flex overflow-hidden rounded-md border border-white/10 bg-white/10 text-white shadow-sm h-9">
        {cornerOptions.map((option, index) => {
          const isActive = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex flex-1 items-center justify-center px-3 text-xs font-medium transition focus:outline-none ${isActive
                  ? 'bg-sky-500/20 text-white'
                  : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white'
                } ${index < cornerOptions.length - 1 ? 'border-r border-white/10' : ''
                }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function RightPanel({ settings, bars, onChange, onBarsChange, highlightSignals, focusRequest }: RightPanelProps) {
  const update = <K extends keyof BarChartSettings>(key: K, value: BarChartSettings[K]) => {
    onChange({ ...settings, [key]: value })
  }

  const barDesignHighlight = useHighlightEffect(highlightSignals?.design)
  const errorHighlight = useHighlightEffect(highlightSignals?.errorBars)
  const dataHighlight = useHighlightEffect(highlightSignals?.data)

  return (
    <>
      <ChartPageBlock
        title="Bar design"
        highlighted={barDesignHighlight}
      >
        <div className="space-y-8">
          <div className="grid gap-8 sm:grid-cols-3">
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
            <NumericInput
              title="Bar spacing"
              value={settings.barGap}
              min={0}
              max={0.6}
              step={0.02}
              precision={2}
              onChange={(value) => update('barGap', value)}
            />
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <NumericInput
              title="Corner radius"
              value={settings.barCornerRadius}
              min={0}
              max={96}
              step={2}
              precision={0}
              onChange={(value) => update('barCornerRadius', value)}
              suffix="px"
            />
            <CornerStyleSelector
              value={settings.barCornerStyle}
              onChange={(value) => update('barCornerStyle', value)}
            />
          </div>

          <div className="space-y-8 border-t border-white/10 pt-8">
            <h3 className="text-sm font-semibold text-white/80">Error Bars</h3>

            <Toggle
              title="Show error bars"
              value={settings.showErrorBars}
              onChange={(value) => update('showErrorBars', value)}
            />

            <div
              className={`${errorHighlight ? 'highlight-pulse ' : ''}grid gap-8 sm:grid-cols-3 transition-opacity ${settings.showErrorBars ? 'opacity-100' : 'opacity-50 pointer-events-none'
                }`}
            >
              <SelectField<BarChartSettings['errorBarMode']>
                label="Color mode"
                value={settings.errorBarMode}
                onChange={(value) => update('errorBarMode', value)}
                options={errorBarModeOptions}
                placeholder="Select mode"
                disabled={!settings.showErrorBars}
              />
              <ColorField
                label="Error bar color"
                value={settings.errorBarColor}
                onChange={(value) => update('errorBarColor', value)}
                disabled={!settings.showErrorBars || settings.errorBarMode !== 'global'}
              />
              <NumericInput
                title="Line width"
                value={settings.errorBarWidth}
                min={0}
                max={12}
                step={0.5}
                precision={1}
                onChange={(value) => update('errorBarWidth', value)}
                suffix="px"
                disabled={!settings.showErrorBars}
              />
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              <NumericInput
                title="Cap width"
                value={settings.errorBarCapWidth}
                min={0}
                max={96}
                step={2}
                precision={0}
                onChange={(value) => update('errorBarCapWidth', value)}
                suffix="px"
                disabled={!settings.showErrorBars}
              />
            </div>
          </div>
        </div>
      </ChartPageBlock>

      <ChartPageBlock title="Data" highlighted={dataHighlight}>
        <BarDataEditor
          bars={bars}
          paletteName={settings.paletteName}
          onChange={onBarsChange}
          highlightSignal={highlightSignals?.data}
          focusRequest={focusRequest}
        />
      </ChartPageBlock>
    </>
  )
}

export default RightPanel
