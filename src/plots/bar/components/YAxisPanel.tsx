import { useEffect, useRef, useState } from 'react'
import { ColorField } from '../../../shared/components/ColorField'
import { NumericInput } from '../../../shared/components/NumericInput'
import { SelectField } from '../../../shared/components/SelectField'
import { useHighlightEffect } from '../../../shared/hooks/useHighlightEffect'
import type { BarChartSettings } from '../../../types/bar'
import type { AxisSettings, FocusRequest, HighlightKey } from '../../../types/base'

type YAxisPanelProps = {
    settings: BarChartSettings
    onChange: (settings: BarChartSettings) => void
    highlightSignals?: Partial<Record<HighlightKey, number>>
    focusRequest?: FocusRequest | null
}

type ToggleProps = {
    title: string
    value: boolean
    onChange: (value: boolean) => void
    disabled?: boolean
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
}

function SyncIcon({ active = false }: { active?: boolean }) {
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
    placeholder = 'auto'
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
        if (isAuto) return
        const newValue = Number.parseFloat(event.target.value)
        if (!Number.isNaN(newValue)) {
            onChange(newValue)
        }
    }

    const handleValueClick = () => {
        if (isAuto) return
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
        <div className="flex flex-col gap-1 text-sm text-white">
            <span className="text-xs uppercase tracking-wide text-white/50">{title}</span>
            <div className="h-9 rounded-md border border-white/10 bg-white/10 px-3 flex items-center gap-3">
                {/* Lock Button */}
                <button
                    type="button"
                    onClick={handleLockToggle}
                    className={`flex-none p-1 rounded transition-colors ${
                        isLocked 
                            ? 'text-orange-400 hover:text-orange-300' 
                            : 'text-sky-400 hover:text-sky-300'
                    }`}
                    title={isLocked ? 'Auto mode - click to unlock' : 'Manual mode - click to lock'}
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
                        disabled={isAuto}
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
                            ${!isAuto ? '[&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:shadow-xl [&::-webkit-slider-thumb]:hover:shadow-sky-400/50' : ''}
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
                            className="text-sm font-medium text-center min-w-[3rem] transition-colors duration-200
                                hover:text-sky-300 cursor-pointer text-white"
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

export function YAxisPanel({ settings, onChange, highlightSignals, focusRequest }: YAxisPanelProps) {
    const update = <K extends keyof BarChartSettings>(key: K, value: BarChartSettings[K]) => {
        onChange({ ...settings, [key]: value })
    }

    const updateAxis = (value: AxisSettings) => {
        onChange({ ...settings, yAxis: value })
    }

    const [syncActive, setSyncActive] = useState(false)

    const updateAxisField = <K extends keyof AxisSettings>(key: K, value: AxisSettings[K]) => {
        updateAxis({ ...settings.yAxis, [key]: value })
    }

    const handleSyncWithXAxis = () => {
        updateAxis({
            ...settings.yAxis,
            axisLineWidth: settings.xAxis.axisLineWidth,
            axisLineColor: settings.xAxis.axisLineColor,
            gridLineStyle: settings.xAxis.gridLineStyle,
            gridLineOpacity: settings.xAxis.gridLineOpacity,
            gridLineColor: settings.xAxis.gridLineColor,
            gridLineWidth: settings.xAxis.gridLineWidth
        })
        
        // Show active state for 1 second
        setSyncActive(true)
        setTimeout(() => setSyncActive(false), 1000)
    }

    const yAxisTitleRef = useRef<HTMLInputElement | null>(null)
    const handledFocusRef = useRef(0)
    const highlight = useHighlightEffect(highlightSignals?.yAxis)

    const isAxisVisible = settings.yAxis.showAxisLines

    useEffect(() => {
        if (!focusRequest) return
        if (focusRequest.requestId === handledFocusRef.current) return
        if (focusRequest.target.type !== 'yAxisTitle') return

        const input = yAxisTitleRef.current
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

    return (
        <section className={classNames('space-y-10', highlight ? 'highlight-pulse' : null)}>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white/80">Appearance</h3>
                    <button
                        onClick={handleSyncWithXAxis}
                        className={classNames(
                            "p-1.5 rounded transition-all duration-200",
                            syncActive
                                ? "text-sky-400 bg-sky-400/20 shadow-sm"
                                : "text-white/40 hover:text-white/70 hover:bg-white/10"
                        )}
                        title="Sync with X-axis appearance"
                    >
                        <SyncIcon active={syncActive} />
                    </button>
                </div>
                
                {/* Visibility, Line Width, and Line Color in one row */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Toggle
                            title="Y-axis visibility"
                            value={isAxisVisible}
                            onChange={(value) => updateAxisField('showAxisLines', value)}
                        />
                    </div>
                    
                    <div className={classNames(
                        "transition-opacity",
                        !isAxisVisible && "opacity-50 pointer-events-none"
                    )}>
                        <NumericInput
                            title="Line width"
                            value={settings.yAxis.axisLineWidth}
                            min={0}
                            max={8}
                            step={0.5}
                            precision={1}
                            onChange={(value) => updateAxisField('axisLineWidth', value)}
                        />
                    </div>
                    
                    <div className={classNames(
                        "transition-opacity",
                        !isAxisVisible && "opacity-50 pointer-events-none"
                    )}>
                        <ColorField
                            label="Line color"
                            value={settings.yAxis.axisLineColor}
                            onChange={(value) => updateAxisField('axisLineColor', value)}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Grid line controls - toggle, style, and width on same row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <Toggle
                                title="Grid lines"
                                value={settings.yAxis.showGridLines}
                                onChange={(value) => updateAxisField('showGridLines', value)}
                            />
                        </div>
                        
                        <div className={classNames(
                            "transition-opacity",
                            !settings.yAxis.showGridLines && "opacity-50 pointer-events-none"
                        )}>
                            <SelectField<'solid' | 'dashed' | 'dotted'>
                                label="Line Style"
                                value={settings.yAxis.gridLineStyle}
                                onChange={(style) => updateAxisField('gridLineStyle', style)}
                                options={[
                                    { value: 'solid', label: 'Solid' },
                                    { value: 'dashed', label: 'Dashed' },
                                    { value: 'dotted', label: 'Dotted' }
                                ]}
                                placeholder="Select style"
                            />
                        </div>
                        
                        <div className={classNames(
                            "transition-opacity",
                            !settings.yAxis.showGridLines && "opacity-50 pointer-events-none"
                        )}>
                            <NumericInput
                                title="Line Width"
                                value={settings.yAxis.gridLineWidth}
                                onChange={(value) => updateAxisField('gridLineWidth', value)}
                                min={0.5}
                                max={5}
                                step={0.5}
                                precision={1}
                            />
                        </div>
                    </div>
                    
                    {/* Opacity and color on second row */}
                    <div className={classNames(
                        "grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity",
                        !settings.yAxis.showGridLines && "opacity-50 pointer-events-none"
                    )}>
                        <div>
                            <NumericInput
                                title="Opacity"
                                value={settings.yAxis.gridLineOpacity}
                                onChange={(value) => updateAxisField('gridLineOpacity', value)}
                                min={0}
                                max={1}
                                step={0.1}
                                precision={1}
                            />
                        </div>
                        
                        <div>
                            <ColorField
                                label="Grid line color"
                                value={settings.yAxis.gridLineColor}
                                onChange={(value) => updateAxisField('gridLineColor', value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8 border-t border-white/10 pt-8">
                <h3 className="text-sm font-semibold text-white/80">Title</h3>
                
                {/* All title settings in one responsive row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <div className="flex flex-col gap-1 text-sm text-white">
                            <span className="text-xs uppercase tracking-wide text-white/50">Axis title</span>
                            <input
                                ref={yAxisTitleRef}
                                type="text"
                                value={settings.yAxis.title}
                                onChange={(event) => updateAxisField('title', event.target.value)}
                                className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
                                placeholder="Y-axis title"
                            />
                        </div>
                    </div>
                    
                    <div className={classNames(
                        "transition-opacity",
                        !settings.yAxis.title.trim() && "opacity-50 pointer-events-none"
                    )}>
                        <NumericInput
                            title="Title font size"
                            value={settings.axisTitleFontSize}
                            min={8}
                            max={72}
                            step={1}
                            precision={0}
                            onChange={(value) => update('axisTitleFontSize', value)}
                            suffix="px"
                        />
                    </div>
                    
                    <div className={classNames(
                        "transition-opacity",
                        !settings.yAxis.title.trim() && "opacity-50 pointer-events-none"
                    )}>
                        <NumericInput
                            title="Title offset"
                            value={settings.yAxisTitleOffsetX}
                            min={-200}
                            max={200}
                            step={1}
                            precision={0}
                            onChange={(value) => update('yAxisTitleOffsetX', value)}
                            suffix="px"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-8 border-t border-white/10 pt-8">
                <h3 className="text-sm font-semibold text-white/80">Ticks</h3>
                
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <AutoNumericInput
                        title="Y min"
                        value={settings.yAxisMin}
                        onChange={(value) => update('yAxisMin', value)}
                        min={-1000}
                        max={1000}
                        step={1}
                        precision={1}
                        autoValue={0} // You can compute this from the actual data
                        placeholder="auto"
                    />
                    <AutoNumericInput
                        title="Y max"
                        value={settings.yAxisMax}
                        onChange={(value) => update('yAxisMax', value)}
                        min={-1000}
                        max={1000}
                        step={1}
                        precision={1}
                        autoValue={100} // You can compute this from the actual data
                        placeholder="auto"
                    />
                    <AutoNumericInput
                        title="Tick step"
                        value={settings.yAxisTickStep}
                        onChange={(value) => update('yAxisTickStep', value)}
                        min={0.001}
                        max={100}
                        step={0.001}
                        precision={3}
                        autoValue={10} // You can compute this from the actual data
                        placeholder="auto"
                    />
                </div>

                <div className="grid gap-16 sm:grid-cols-2">
                    <Toggle
                        title="Tick labels"
                        value={settings.yAxis.showTickLabels}
                        onChange={(value) => updateAxisField('showTickLabels', value)}
                    />
                    <ColorField
                        label="Tick label color"
                        value={settings.yAxis.tickLabelColor}
                        onChange={(value) => updateAxisField('tickLabelColor', value)}
                    />
                </div>

                <div className="grid gap-16 sm:grid-cols-1">
                    <NumericInput
                        title="Tick label font size"
                        value={settings.axisTickFontSize}
                        min={6}
                        max={48}
                        step={1}
                        precision={0}
                        onChange={(value) => update('axisTickFontSize', value)}
                        suffix="px"
                    />
                </div>
            </div>
        </section>
    )
}

function classNames(...values: Array<string | false | null | undefined>) {
    return values.filter(Boolean).join(' ')
}

export default YAxisPanel
