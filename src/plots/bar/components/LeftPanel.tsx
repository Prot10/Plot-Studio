import { useState } from 'react'
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

type AutoNumericInputProps = {
  title: string
  value: number | null
  onChange: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  precision?: number
  suffix?: string
  autoValue?: number // The computed auto value to display when locked
  placeholder?: string
  disabled?: boolean
}

function LockIcon({ locked }: { locked: boolean }) {
  if (locked) {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
  }
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
    </svg>
  )
}

function AutoNumericInput({
  title,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  precision = 0,
  suffix = '',
  autoValue,
  placeholder = 'auto',
  disabled = false
}: AutoNumericInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  const isAuto = value === null
  const displayValue = isAuto ? autoValue ?? 0 : value
  const isLocked = isAuto

  const formatValue = (val: number) => {
    return val.toFixed(precision)
  }

  const handleLockToggle = () => {
    if (disabled) return
    if (isAuto) {
      // Unlock: set to current auto value or middle of range
      const newValue = autoValue ?? (min + max) / 2
      onChange(newValue)
    } else {
      // Lock: set to auto (null)
      onChange(null)
    }
  }

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isAuto || disabled) return
    const newValue = Number.parseFloat(event.target.value)
    if (!Number.isNaN(newValue)) {
      onChange(newValue)
    }
  }

  const handleValueClick = () => {
    if (isAuto || disabled) return
    setIsEditing(true)
    setEditValue(formatValue(displayValue))
  }

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(event.target.value)
  }

  const handleEditSubmit = () => {
    const newValue = Number.parseFloat(editValue)
    if (!Number.isNaN(newValue)) {
      const clampedValue = Math.max(min, Math.min(max, newValue))
      onChange(clampedValue)
    }
    setIsEditing(false)
  }

  const handleEditKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleEditSubmit()
    } else if (event.key === 'Escape') {
      setIsEditing(false)
    }
  }

  const handleEditBlur = () => {
    handleEditSubmit()
  }

  return (
    <div className={`flex flex-col gap-1 text-sm text-white ${disabled ? 'opacity-50' : ''}`}>
      <span className="text-xs uppercase tracking-wide text-white/50">{title}</span>
      <div className="h-9 rounded-md border border-white/10 bg-white/10 px-3 flex items-center gap-3">
        {/* Lock Button */}
        <button
          type="button"
          onClick={handleLockToggle}
          disabled={disabled}
          className={`flex-none p-1 rounded transition-colors ${disabled ? 'cursor-not-allowed' : ''} ${isLocked
            ? 'text-orange-400 hover:text-orange-300'
            : 'text-sky-400 hover:text-sky-300'
            }`}
          title={disabled ? 'Disabled' : isLocked ? 'Auto mode - click to unlock' : 'Manual mode - click to lock'}
        >
          <LockIcon locked={isLocked} />
        </button>

        {/* Slider */}
        <div className="flex-1 flex items-center">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={displayValue}
            onChange={handleSliderChange}
            disabled={isAuto || disabled}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer
              bg-gradient-to-r from-white/20 to-white/30
              shadow-inner shadow-black/20
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-gradient-to-br
              [&::-webkit-slider-thumb]:from-sky-400
              [&::-webkit-slider-thumb]:to-sky-500
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-white/30
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:shadow-sky-500/40
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-all
              [&::-webkit-slider-thumb]:duration-150
              ${!isAuto && !disabled ? '[&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:shadow-xl [&::-webkit-slider-thumb]:hover:shadow-sky-400/50' : ''}
              disabled:cursor-not-allowed
              disabled:opacity-50
            `}
          />
        </div>

        {/* Value Display */}
        <div className="flex-shrink-0">
          {isAuto ? (
            <span className="text-sm text-white/60 font-medium min-w-[3rem] text-center">
              {autoValue !== undefined ? formatValue(autoValue) + suffix : placeholder}
            </span>
          ) : isEditing ? (
            <input
              type="number"
              value={editValue}
              onChange={handleEditChange}
              onKeyDown={handleEditKeyDown}
              onBlur={handleEditBlur}
              min={min}
              max={max}
              step={step}
              autoFocus
              className="w-16 px-1 py-1 text-sm text-white text-center
                bg-transparent border-b border-sky-400/50 rounded-none
                focus:outline-none focus:border-sky-400
                [&::-webkit-outer-spin-button]:appearance-none
                [&::-webkit-inner-spin-button]:appearance-none
                [-moz-appearance:textfield]"
            />
          ) : (
            <button
              type="button"
              onClick={handleValueClick}
              disabled={disabled}
              className={`text-sm font-medium text-center min-w-[3rem] transition-colors duration-200
                ${disabled ? 'cursor-not-allowed' : 'hover:text-sky-300 cursor-pointer'} text-white`}
            >
              {formatValue(displayValue)}
              {suffix && <span className="text-white/60 ml-1">{suffix}</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function SyncIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={active ? 2.5 : 2}
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  )
}

type AxisSyncButtonProps = {
  isActive: boolean
  onToggle: () => void
}

function AxisSyncButton({ isActive, onToggle }: AxisSyncButtonProps) {
  const baseClasses = 'flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors'
  const stateClasses = isActive
    ? ' border-sky-400 bg-sky-400/20 text-sky-100 shadow-sm'
    : ' border-white/10 bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`${baseClasses}${stateClasses}`}
      title={isActive ? 'Axes are linked' : 'Link X and Y axes'}
    >
      <SyncIcon active={isActive} />
      <span>{isActive ? 'Axes style linked' : 'Link axes style'}</span>
    </button>
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

  // Helper function to handle dimension updates with aspect ratio logic
  const handleDimensionUpdate = (dimension: 'width' | 'height', value: number | null) => {
    if (dimension === 'width') {
      const newSettings = { ...settings, customWidth: value }

      // If height is unlocked and width is being set, calculate height from aspect ratio
      if (value !== null && settings.customHeight !== null) {
        // Both dimensions will be set, aspect ratio becomes inactive
        onChange(newSettings)
      } else if (value !== null && settings.customHeight === null) {
        // Only width is set, height should be auto
        onChange(newSettings)
      } else {
        // Width is being set to auto
        onChange(newSettings)
      }
    } else {
      const newSettings = { ...settings, customHeight: value }

      // If width is unlocked and height is being set, calculate width from aspect ratio  
      if (value !== null && settings.customWidth !== null) {
        // Both dimensions will be set, aspect ratio becomes inactive
        onChange(newSettings)
      } else if (value !== null && settings.customWidth === null) {
        // Only height is set, width should be auto
        onChange(newSettings)
      } else {
        // Height is being set to auto
        onChange(newSettings)
      }
    }
  }

  // Calculate computed width/height based on aspect ratio
  const getComputedDimensions = () => {
    const baseWidth = 800
    const baseHeight = 600

    if (settings.customWidth !== null && settings.customHeight === null) {
      // Width is set, calculate height from aspect ratio
      return {
        computedWidth: settings.customWidth,
        computedHeight: settings.customWidth / settings.aspectRatio
      }
    } else if (settings.customHeight !== null && settings.customWidth === null) {
      // Height is set, calculate width from aspect ratio
      return {
        computedWidth: settings.customHeight * settings.aspectRatio,
        computedHeight: settings.customHeight
      }
    } else {
      // Both auto or both set - use base dimensions
      return {
        computedWidth: baseWidth,
        computedHeight: baseHeight
      }
    }
  }

  const { computedWidth, computedHeight } = getComputedDimensions()
  const bothDimensionsSet = settings.customWidth !== null && settings.customHeight !== null
  const aspectRatioActive = !bothDimensionsSet

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

  const toggleAxesSync = (source: 'x' | 'y') => {
    const nextState = !settings.axesSynced

    if (!nextState) {
      onChange({ ...settings, axesSynced: false })
      return
    }

    const sourceAxis = source === 'x' ? settings.xAxis : settings.yAxis
    const targetAxis = source === 'x' ? { ...settings.yAxis } : { ...settings.xAxis }

    // Sync specific fields between axes
    targetAxis.showAxisLines = sourceAxis.showAxisLines
    targetAxis.axisLineWidth = sourceAxis.axisLineWidth
    targetAxis.axisLineColor = sourceAxis.axisLineColor
    targetAxis.showTickLabels = sourceAxis.showTickLabels
    targetAxis.tickLabelColor = sourceAxis.tickLabelColor
    targetAxis.tickLabelOrientation = sourceAxis.tickLabelOrientation

    if (source === 'x') {
      onChange({
        ...settings,
        axesSynced: true,
        yAxis: targetAxis,
        yAxisTitleFontSize: settings.xAxisTitleFontSize,
        yAxisTickFontSize: settings.xAxisTickFontSize,
        xAxisTitleFontSize: settings.xAxisTitleFontSize,
        xAxisTickFontSize: settings.xAxisTickFontSize,
      })
    } else {
      onChange({
        ...settings,
        axesSynced: true,
        xAxis: targetAxis,
        xAxisTitleFontSize: settings.yAxisTitleFontSize,
        xAxisTickFontSize: settings.yAxisTickFontSize,
        yAxisTitleFontSize: settings.yAxisTitleFontSize,
        yAxisTickFontSize: settings.yAxisTickFontSize,
      })
    }
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

            {/* Chart dimensions controls - all in one row with 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <AutoNumericInput
                title="Custom width"
                value={settings.customWidth}
                onChange={(value) => handleDimensionUpdate('width', value)}
                min={120}
                max={2000}
                step={10}
                precision={0}
                suffix="px"
                autoValue={Math.round(computedWidth)}
                placeholder="auto"
              />
              <AutoNumericInput
                title="Custom height"
                value={settings.customHeight}
                onChange={(value) => handleDimensionUpdate('height', value)}
                min={120}
                max={2000}
                step={10}
                precision={0}
                suffix="px"
                autoValue={Math.round(computedHeight)}
                placeholder="auto"
              />
              <AutoNumericInput
                title="Aspect ratio"
                value={aspectRatioActive ? settings.aspectRatio : null}
                onChange={(value) => update('aspectRatio', value ?? 1.33)}
                min={0.3}
                max={1.2}
                step={0.02}
                precision={2}
                disabled={!aspectRatioActive}
                autoValue={settings.aspectRatio}
                placeholder="auto"
              />
            </div>
          </div>

          <div className="space-y-8 border-t border-white/10 pt-8">
            <h3 className="text-sm font-semibold text-white/80">Plot Box</h3>

            {/* Plot box controls - toggle, line width, and color */}
            <div className="grid grid-cols-3 gap-8">
              <div>
                <Toggle
                  title="Show plot box"
                  value={settings.showPlotBox}
                  onChange={(value) => update('showPlotBox', value)}
                />
              </div>

              <div className={`transition-opacity ${!settings.showPlotBox ? 'opacity-50 pointer-events-none' : ''}`}>
                <NumericInput
                  title="Line width"
                  value={settings.plotBoxLineWidth}
                  min={0.5}
                  max={8}
                  step={0.5}
                  precision={1}
                  onChange={(value) => update('plotBoxLineWidth', value)}
                />
              </div>

              <div className={`transition-opacity ${!settings.showPlotBox ? 'opacity-50 pointer-events-none' : ''}`}>
                <ColorField
                  label="Line color"
                  value={settings.plotBoxColor}
                  onChange={(value) => update('plotBoxColor', value)}
                />
              </div>
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

      <ChartPageBlock
        title="X-Axis"
        highlighted={xAxisHighlight}
        actions={<AxisSyncButton isActive={settings.axesSynced} onToggle={() => toggleAxesSync('x')} />}
      >
        <XAxisPanel
          settings={settings}
          onChange={onChange}
          highlightSignals={highlightSignals}
          focusRequest={focusRequest}
        />
      </ChartPageBlock>

      <ChartPageBlock
        title="Y-Axis"
        highlighted={yAxisHighlight}
        actions={<AxisSyncButton isActive={settings.axesSynced} onToggle={() => toggleAxesSync('y')} />}
      >
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-8 transition-opacity ${!settings.showValueLabels ? 'opacity-50 pointer-events-none' : ''}`}>
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
