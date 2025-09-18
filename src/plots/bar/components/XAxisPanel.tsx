import { useEffect, useRef, useState } from 'react'
import { ColorField } from '../../../shared/components/ColorField'
import { NumericInput } from '../../../shared/components/NumericInput'
import { useHighlightEffect } from '../../../shared/hooks/useHighlightEffect'
import type { BarChartSettings } from '../../../types/bar'
import type { AxisSettings, FocusRequest, HighlightKey } from '../../../types/base'

type XAxisPanelProps = {
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

function classNames(...values: (string | null | undefined | false)[]): string {
    return values.filter(Boolean).join(' ')
}

export function XAxisPanel({ settings, onChange, highlightSignals, focusRequest }: XAxisPanelProps) {
    const [syncActive, setSyncActive] = useState(false)
    const [tickSyncActive, setTickSyncActive] = useState(false)

    const xAxisTitleRef = useRef<HTMLInputElement | null>(null)
    const handledFocusRef = useRef(0)
    const highlight = useHighlightEffect(highlightSignals?.xAxis)

    const update = <K extends keyof BarChartSettings>(key: K, value: BarChartSettings[K]) => {
        onChange({ ...settings, [key]: value })
    }

    const updateAxisField = <K extends keyof AxisSettings>(key: K, value: AxisSettings[K]) => {
        onChange({
            ...settings,
            xAxis: { ...settings.xAxis, [key]: value }
        })
    }

    const isAxisVisible = settings.xAxis.showAxisLines

    const handleSyncWithYAxis = () => {
        // Copy X-axis values TO Y-axis
        const updatedYAxis = {
            ...settings.yAxis,
            axisLineWidth: settings.xAxis.axisLineWidth,
            axisLineColor: settings.xAxis.axisLineColor
        }

        onChange({
            ...settings,
            yAxis: updatedYAxis
        })

        // Toggle active state permanently
        setSyncActive(!syncActive)
    }

    const handleSyncTickLabelsWithYAxis = () => {
        // Copy X-axis tick label values TO Y-axis
        const updatedYAxis = {
            ...settings.yAxis,
            tickLabelColor: settings.xAxis.tickLabelColor,
            tickLabelOrientation: settings.xAxis.tickLabelOrientation
        }

        onChange({
            ...settings,
            yAxis: updatedYAxis,
            axisTickFontSize: settings.axisTickFontSize
        })

        // Toggle active state permanently
        setTickSyncActive(!tickSyncActive)
    }

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
        if (focusRequest.target.type !== 'xAxisTitle') return

        const input = xAxisTitleRef.current
        if (!input) return

        if (focusInput(input)) {
            handledFocusRef.current = focusRequest.requestId
        }
    }, [focusRequest])

    return (
        <section className={classNames('space-y-10', highlight ? 'highlight-pulse' : null)}>
            <div className="space-y-8 border-t border-white/10 pt-8">
                <h3 className="text-sm font-semibold text-white/80">Title</h3>

                {/* All title settings in one responsive row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <div className="flex flex-col gap-1 text-sm text-white">
                            <span className="text-xs uppercase tracking-wide text-white/50">Axis title</span>
                            <input
                                ref={xAxisTitleRef}
                                type="text"
                                value={settings.xAxis.title}
                                onChange={(event) => updateAxisField('title', event.target.value)}
                                className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
                                placeholder="X-axis title"
                            />
                        </div>
                    </div>

                    <div className={classNames(
                        "transition-opacity",
                        !settings.xAxis.title.trim() && "opacity-50 pointer-events-none"
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
                        !settings.xAxis.title.trim() && "opacity-50 pointer-events-none"
                    )}>
                        <NumericInput
                            title="Title offset"
                            value={settings.xAxisTitleOffsetY}
                            min={-200}
                            max={200}
                            step={1}
                            precision={0}
                            onChange={(value) => update('xAxisTitleOffsetY', value)}
                            suffix="px"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white/80">Appearance</h3>
                    <button
                        onClick={handleSyncWithYAxis}
                        className={classNames(
                            "flex items-center gap-2 px-3 py-1.5 rounded transition-all duration-200 text-xs",
                            syncActive
                                ? "text-sky-400 bg-sky-400/20 shadow-sm"
                                : "text-white/40 hover:text-white/70 hover:bg-white/10"
                        )}
                        title="Sync with Y-axis appearance"
                    >
                        <SyncIcon active={syncActive} />
                        <span>Sync with Y-axis</span>
                    </button>
                </div>

                {/* Visibility, Line Width, and Line Color in one row */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Toggle
                            title="X-axis visibility"
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
                            value={settings.xAxis.axisLineWidth}
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
                            value={settings.xAxis.axisLineColor}
                            onChange={(value) => updateAxisField('axisLineColor', value)}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-8 border-t border-white/10 pt-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white/80">Ticks</h3>
                    <button
                        onClick={handleSyncTickLabelsWithYAxis}
                        className={classNames(
                            "flex items-center gap-2 px-3 py-1.5 rounded transition-all duration-200 text-xs",
                            tickSyncActive
                                ? "text-sky-400 bg-sky-400/20 shadow-sm"
                                : "text-white/40 hover:text-white/70 hover:bg-white/10"
                        )}
                        title="Sync tick labels with Y-axis"
                    >
                        <SyncIcon active={tickSyncActive} />
                        <span>Sync with Y-axis</span>
                    </button>
                </div>

                {/* First row: Tick labels toggle and orientation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Toggle
                            title="Tick labels"
                            value={settings.xAxis.showTickLabels}
                            onChange={(value) => updateAxisField('showTickLabels', value)}
                        />
                    </div>

                    <div className={classNames(
                        "transition-opacity",
                        !settings.xAxis.showTickLabels && "opacity-50 pointer-events-none"
                    )}>
                        <NumericInput
                            title="Label orientation"
                            value={settings.xAxis.tickLabelOrientation}
                            onChange={(value) => updateAxisField('tickLabelOrientation', value)}
                            min={0}
                            max={360}
                            step={15}
                            precision={0}
                            suffix="°"
                        />
                    </div>
                </div>

                {/* Second row: Label font size and color */}
                <div className={classNames(
                    "grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity",
                    !settings.xAxis.showTickLabels && "opacity-50 pointer-events-none"
                )}>
                    <div>
                        <NumericInput
                            title="Label font size"
                            value={settings.axisTickFontSize}
                            min={6}
                            max={48}
                            step={1}
                            precision={0}
                            onChange={(value) => update('axisTickFontSize', value)}
                            suffix="px"
                        />
                    </div>

                    <div>
                        <ColorField
                            label="Label color"
                            value={settings.xAxis.tickLabelColor}
                            onChange={(value) => updateAxisField('tickLabelColor', value)}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default XAxisPanel
