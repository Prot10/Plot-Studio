import { useEffect, useRef } from 'react'
import { ColorField } from '../../../shared/components/ColorField'
import { NumericInput } from '../../../shared/components/NumericInput'
import { useHighlightEffect } from '../../../shared/hooks/useHighlightEffect'
import type { BarChartSettings } from '../../../types/bar'
import type { AxisSettings, FocusRequest, HighlightKey } from '../../../types/base'
import { shouldSyncAxisField } from './axisSync'

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
    const xAxisTitleRef = useRef<HTMLInputElement | null>(null)
    const handledFocusRef = useRef(0)
    const highlight = useHighlightEffect(highlightSignals?.xAxis)

    const update = <K extends keyof BarChartSettings>(key: K, value: BarChartSettings[K]) => {
        onChange({ ...settings, [key]: value })
    }

    const updateAxisField = <K extends keyof AxisSettings>(key: K, value: AxisSettings[K]) => {
        const nextXAxis = { ...settings.xAxis, [key]: value }

        if (settings.axesSynced && shouldSyncAxisField(key)) {
            const nextYAxis = { ...settings.yAxis, [key]: value }
            onChange({
                ...settings,
                xAxis: nextXAxis,
                yAxis: nextYAxis,
            })
            return
        }

        onChange({
            ...settings,
            xAxis: nextXAxis,
        })
    }

    const handleTitleFontSizeChange = (value: number) => {
        if (settings.axesSynced) {
            onChange({
                ...settings,
                xAxisTitleFontSize: value,
                yAxisTitleFontSize: value,
            })
            return
        }
        onChange({
            ...settings,
            xAxisTitleFontSize: value,
        })
    }

    const handleTickFontSizeChange = (value: number) => {
        if (settings.axesSynced) {
            onChange({
                ...settings,
                xAxisTickFontSize: value,
                yAxisTickFontSize: value,
            })
            return
        }
        onChange({
            ...settings,
            xAxisTickFontSize: value,
        })
    }

    const isAxisVisible = settings.xAxis.showAxisLines

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                            value={settings.xAxisTitleFontSize}
                            min={8}
                            max={72}
                            step={1}
                            precision={0}
                            onChange={handleTitleFontSizeChange}
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
                <h3 className="text-sm font-semibold text-white/80">Appearance</h3>

                {/* Visibility, Line Width, and Line Color in one row */}
                <div className="grid grid-cols-3 gap-8">
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
                <h3 className="text-sm font-semibold text-white/80">Ticks</h3>

                {/* First row: Tick labels toggle and orientation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
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
                            title="Label font size"
                            value={settings.xAxisTickFontSize}
                            min={6}
                            max={48}
                            step={1}
                            precision={0}
                            onChange={handleTickFontSizeChange}
                            suffix="px"
                        />
                    </div>

                    <div className={classNames(
                        "transition-opacity",
                        !settings.xAxis.showTickLabels && "opacity-50 pointer-events-none"
                    )}>
                        <ColorField
                            label="Label color"
                            value={settings.xAxis.tickLabelColor}
                            onChange={(value) => updateAxisField('tickLabelColor', value)}
                        />
                    </div>
                </div>

                {/* Second row: Label font size and color */}
                <div className={classNames(
                    "grid grid-cols-1 sm:grid-cols-3 gap-8 transition-opacity",
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

                    <div>
                        <NumericInput
                            title="Label X offset"
                            value={settings.xAxisTickOffsetX}
                            min={-200}
                            max={200}
                            step={1}
                            precision={0}
                            onChange={(value) => update('xAxisTickOffsetX', value)}
                            suffix="px"
                        />
                    </div>

                    <div>
                        <NumericInput
                            title="Label Y offset"
                            value={settings.xAxisTickOffsetY}
                            min={-200}
                            max={200}
                            step={1}
                            precision={0}
                            onChange={(value) => update('xAxisTickOffsetY', value)}
                            suffix="px"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default XAxisPanel
