import { useState, useEffect } from 'react'
import { ChartPageBlock } from '../../../../shared/components/ChartPageLayout'
import { ColorField } from '../../../../shared/components/ColorField'
import { NumericInput } from '../../../../shared/components/NumericInput'
import { SelectField } from '../../../../shared/components/SelectField'
import { Toggle } from '../../../../shared/components/Toggle'
import { useHighlightEffect } from '../../../../shared/hooks/useHighlightEffect'
import type { BarChartSettings, BarDataPoint, BarPattern, BarOrientation } from '../../../../types/bar'
import type { HighlightKey } from '../../../../types/base'

type RightPanelProps = {
  settings: BarChartSettings
  bars: BarDataPoint[]
  onChange: (settings: BarChartSettings) => void
  onBarsChange: (bars: BarDataPoint[]) => void
  highlightSignals?: Partial<Record<HighlightKey, number>>
  selectedBarId?: string | null
  onSelectBar?: (barId: string | null) => void
}



type CornerStyleOption = {
  value: BarChartSettings['barCornerStyle']
  label: string
}

const cornerOptions: CornerStyleOption[] = [
  { value: 'top', label: 'Top' },
  { value: 'both', label: 'Both' },
]

const orientationOptions: Array<{ value: BarOrientation; label: string }> = [
  { value: 'vertical', label: 'Vertical' },
  { value: 'horizontal', label: 'Horizontal' },
]

const errorBarModeOptions: Array<{ value: BarChartSettings['errorBarMode']; label: string }> = [
  { value: 'global', label: 'Uniform' },
  { value: 'match', label: 'Border' },
]

const patternOptions: Array<{ value: BarPattern; label: string }> = [
  { value: 'solid', label: 'Solid' },
  { value: 'diagonal', label: 'Diagonal lines' },
  { value: 'dots', label: 'Dots' },
  { value: 'crosshatch', label: 'Crosshatch' },
  { value: 'vertical', label: 'Vertical stripes' },
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

function OrientationSelector({
  value,
  onChange,
}: {
  value: BarOrientation
  onChange: (value: BarOrientation) => void
}) {
  return (
    <div className="flex flex-col gap-1 text-sm text-white">
      <span className="text-xs uppercase tracking-wide text-white/50">Orientation</span>
      <div className="flex overflow-hidden rounded-md border border-white/10 bg-white/10 text-white shadow-sm h-9">
        {orientationOptions.map((option, index) => {
          const isActive = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex flex-1 items-center justify-center px-3 text-xs font-medium transition focus:outline-none ${isActive
                ? 'bg-sky-500/20 text-white'
                : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white'
                } ${index < orientationOptions.length - 1 ? 'border-r border-white/10' : ''
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

function ErrorBarModeSelector({
  value,
  onChange,
  disabled,
}: {
  value: BarChartSettings['errorBarMode']
  onChange: (value: BarChartSettings['errorBarMode']) => void
  disabled?: boolean
}) {
  return (
    <div className={`flex flex-col gap-1 text-sm text-white ${disabled ? 'opacity-50' : ''}`}>
      <span className="text-xs uppercase tracking-wide text-white/50">Color mode</span>
      <div className="flex overflow-hidden rounded-md border border-white/10 bg-white/10 text-white shadow-sm h-9">
        {errorBarModeOptions.map((option, index) => {
          const isActive = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
              className={`flex flex-1 items-center justify-center px-3 text-xs font-medium transition focus:outline-none ${disabled
                ? 'cursor-not-allowed'
                : isActive
                  ? 'bg-sky-500/20 text-white'
                  : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white'
                } ${index < errorBarModeOptions.length - 1 ? 'border-r border-white/10' : ''
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

export function RightPanel({ settings, bars, onChange, onBarsChange, highlightSignals, selectedBarId: externalSelectedBarId, onSelectBar }: RightPanelProps) {
  const [internalSelectedBarId, setInternalSelectedBarId] = useState<string>(bars[0]?.id || '')

  // Use external selection if provided, otherwise use internal state
  const selectedBarId = externalSelectedBarId || internalSelectedBarId
  const setSelectedBarId = onSelectBar || setInternalSelectedBarId

  // Update selected bar when bars change
  useEffect(() => {
    if (!bars.find(bar => bar.id === selectedBarId)) {
      setSelectedBarId(bars[0]?.id || '')
    }
  }, [bars, selectedBarId, setSelectedBarId])

  const update = <K extends keyof BarChartSettings>(key: K, value: BarChartSettings[K]) => {
    if (key === 'orientation') {
      // When orientation changes, swap X and Y axis configurations
      const currentOrientation = settings.orientation
      const newOrientation = value as BarOrientation

      if (currentOrientation !== newOrientation) {
        const swappedSettings: BarChartSettings = {
          ...settings,
          [key]: value,
          // Swap axis configurations and titles appropriately
          xAxis: {
            ...settings.yAxis,
            // For horizontal: X-axis shows values, Y-axis shows categories
            // For vertical: X-axis shows categories, Y-axis shows values
            title: newOrientation === 'horizontal' ? 'Values' : 'Categories',
          },
          yAxis: {
            ...settings.xAxis,
            title: newOrientation === 'horizontal' ? 'Categories' : 'Values',
          },
          // Swap font sizes
          xAxisTitleFontSize: settings.yAxisTitleFontSize,
          yAxisTitleFontSize: settings.xAxisTitleFontSize,
          xAxisTickFontSize: settings.yAxisTickFontSize,
          yAxisTickFontSize: settings.xAxisTickFontSize,
          // Swap axis offsets
          xAxisTickOffsetX: settings.yAxisTickOffsetX,
          xAxisTickOffsetY: settings.yAxisTickOffsetY,
          yAxisTickOffsetX: settings.xAxisTickOffsetX,
          yAxisTickOffsetY: settings.xAxisTickOffsetY,
          xAxisTitleOffsetY: settings.yAxisTitleOffsetX,
          yAxisTitleOffsetX: settings.xAxisTitleOffsetY,
        }
        onChange(swappedSettings)
        return
      }
    }
    onChange({ ...settings, [key]: value })
  }

  const updateBar = (barId: string, field: keyof Omit<BarDataPoint, 'id'>, value: string | number | BarPattern) => {
    const updatedBars = bars.map(bar =>
      bar.id === barId ? { ...bar, [field]: value } : bar
    )
    onBarsChange(updatedBars)
  }

  const barDesignHighlight = useHighlightEffect(highlightSignals?.design)
  const errorHighlight = useHighlightEffect(highlightSignals?.errorBars)

  const selectedBar = bars.find(bar => bar.id === selectedBarId) || bars[0]

  return (
    <>
      {/* Barplot Style Block */}
      <ChartPageBlock
        title="Barplot Style"
        highlighted={barDesignHighlight}
      >
        <div className="space-y-6">
          {/* Global Settings */}
          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-4">Global Settings</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <OrientationSelector
                value={settings.orientation}
                onChange={(value) => update('orientation', value)}
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
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <CornerStyleSelector
                value={settings.barCornerStyle}
                onChange={(value) => update('barCornerStyle', value)}
              />
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
            </div>
          </div>

          {/* Border Settings */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-sm font-semibold text-white/80 mb-4">Border</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <Toggle
                title="Show border"
                value={settings.showBorder}
                onChange={(value) => update('showBorder', value)}
              />

              <div className={`transition-opacity ${settings.showBorder ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <NumericInput
                  title="Border width"
                  value={settings.globalBorderWidth}
                  min={0}
                  max={20}
                  step={0.5}
                  precision={1}
                  onChange={(value) => update('globalBorderWidth', value)}
                  suffix="px"
                  disabled={!settings.showBorder}
                />
              </div>

            </div>
          </div>

          {/* Error Bars Section */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-sm font-semibold text-white/80 mb-4">Error Bars</h3>

            <div
              className="grid gap-4 sm:grid-cols-3"
            >
              <Toggle
                title="Show error bars"
                value={settings.showErrorBars}
                onChange={(value) => update('showErrorBars', value)}
              />
              <div
                className={`${errorHighlight ? 'highlight-pulse ' : ''}transition-opacity ${settings.showErrorBars ? 'opacity-100' : 'opacity-50 pointer-events-none'
                  }`}
              >
                <ErrorBarModeSelector
                  value={settings.errorBarMode}
                  onChange={(value) => update('errorBarMode', value)}
                  disabled={!settings.showErrorBars}
                />
              </div>
              <div
                className={`${errorHighlight ? 'highlight-pulse ' : ''}transition-opacity ${settings.showErrorBars ? 'opacity-100' : 'opacity-50 pointer-events-none'
                  }`}
              >
                <ColorField
                  label="Error bar color"
                  value={settings.errorBarColor}
                  onChange={(value) => update('errorBarColor', value)}
                  disabled={!settings.showErrorBars || settings.errorBarMode !== 'global'}
                />
              </div>
            </div>

            <div
              className={`mt-4 ${errorHighlight ? 'highlight-pulse ' : ''}grid gap-4 sm:grid-cols-2 transition-opacity ${settings.showErrorBars ? 'opacity-100' : 'opacity-50 pointer-events-none'
                }`}
            >
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

      {/* Bar Design Block */}
      <ChartPageBlock
        title="Bar Design"
        highlighted={barDesignHighlight}
      >
        <div className="space-y-6">
          {/* Individual Bar Settings */}
          <div>
            <div className="flex items-center justify-start gap-4 mb-4">
              <span className="text-sm font-semibold text-white/80">Active Bar:</span>
              <SelectField<string>
                className="w-48"
                label=""
                value={selectedBarId}
                onChange={(newBarId) => setSelectedBarId(newBarId)}
                options={bars.map(bar => ({
                  value: bar.id,
                  label: bar.label || `Bar ${bars.indexOf(bar) + 1}`
                }))}
                placeholder="Select bar to edit"
              />
            </div>

            {selectedBar && (
              <div className="space-y-4">
                {(() => {
                  const isPatternActive = selectedBar.pattern !== 'solid'

                  return (
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <ColorField
                          label="Fill color"
                          value={selectedBar.fillColor}
                          onChange={(value) => updateBar(selectedBar.id, 'fillColor', value)}
                        />
                        <NumericInput
                          title="Fill opacity"
                          value={selectedBar.opacity}
                          min={0}
                          max={1}
                          step={0.05}
                          precision={2}
                          onChange={(value) => updateBar(selectedBar.id, 'opacity', value)}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="relative">
                          <ColorField
                            label="Border color"
                            value={selectedBar.borderColor}
                            onChange={(value) => updateBar(selectedBar.id, 'borderColor', value)}
                            disabled={!settings.showBorder}
                          />
                          {!settings.showBorder && (
                            <div
                              className="absolute inset-0 cursor-help rounded-md border border-red-400/20 bg-red-500/5"
                              title="Enable 'Show border' in Barplot Style to modify border color"
                            >
                              <div className="flex items-center justify-center h-full">
                                <span className="text-xs text-red-400/70 font-medium">Disabled</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <NumericInput
                            title="Border opacity"
                            value={selectedBar.borderOpacity}
                            min={0}
                            max={1}
                            step={0.05}
                            precision={2}
                            onChange={(value) => updateBar(selectedBar.id, 'borderOpacity', value)}
                            disabled={!settings.showBorder}
                          />
                          {!settings.showBorder && (
                            <div
                              className="absolute inset-0 cursor-help rounded-md border border-red-400/20 bg-red-500/5"
                              title="Enable 'Show border' in Barplot Style to modify border opacity"
                            >
                              <div className="flex items-center justify-center h-full">
                                <span className="text-xs text-red-400/70 font-medium">Disabled</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <SelectField<BarPattern>
                          label="Pattern"
                          value={selectedBar.pattern}
                          onChange={(value) => updateBar(selectedBar.id, 'pattern', value)}
                          options={patternOptions}
                          placeholder="Select pattern"
                        />
                        <NumericInput
                          title="Pattern size"
                          value={selectedBar.patternSize}
                          min={2}
                          max={64}
                          step={1}
                          precision={0}
                          onChange={(value) => updateBar(selectedBar.id, 'patternSize', value)}
                          disabled={!isPatternActive}
                          suffix="px"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <ColorField
                          label="Pattern color"
                          value={selectedBar.patternColor}
                          onChange={(value) => updateBar(selectedBar.id, 'patternColor', value)}
                          disabled={!isPatternActive}
                        />
                        <NumericInput
                          title="Pattern opacity"
                          value={selectedBar.patternOpacity}
                          min={0}
                          max={1}
                          step={0.05}
                          precision={2}
                          onChange={(value) => updateBar(selectedBar.id, 'patternOpacity', value)}
                          disabled={!isPatternActive}
                        />
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        </div>
      </ChartPageBlock>
    </>
  )
}

export default RightPanel
