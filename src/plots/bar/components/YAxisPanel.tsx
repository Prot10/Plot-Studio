import { useEffect, useRef } from 'react'
import { ColorField } from '../../../shared/components/ColorField'
import { NumericInput } from '../../../shared/components/NumericInput'
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

export function YAxisPanel({ settings, onChange, highlightSignals, focusRequest }: YAxisPanelProps) {
    const update = <K extends keyof BarChartSettings>(key: K, value: BarChartSettings[K]) => {
        onChange({ ...settings, [key]: value })
    }

    const updateAxis = (value: AxisSettings) => {
        onChange({ ...settings, yAxis: value })
    }

    const updateAxisField = <K extends keyof AxisSettings>(key: K, value: AxisSettings[K]) => {
        updateAxis({ ...settings.yAxis, [key]: value })
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
                <h3 className="text-sm font-semibold text-white/80">Visibility & Title</h3>

                <div className="space-y-4">
                    <Toggle
                        label={isAxisVisible ? 'Y-axis visible' : 'Y-axis hidden'}
                        description="Toggle the entire Y-axis display"
                        value={isAxisVisible}
                        onChange={(value) => updateAxisField('showAxisLines', value)}
                    />

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
            </div>

            <div className="space-y-8 border-t border-white/10 pt-8">
                <h3 className="text-sm font-semibold text-white/80">Range & Scale</h3>

                <div className="grid gap-16 sm:grid-cols-2">
                    <div className="flex flex-col gap-1 text-sm text-white">
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
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-white">
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
                    </div>
                </div>

                <div className="grid gap-16 sm:grid-cols-1">
                    <div className="flex flex-col gap-1 text-sm text-white">
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
                    </div>
                </div>
            </div>

            <div className="space-y-8 border-t border-white/10 pt-8">
                <h3 className="text-sm font-semibold text-white/80">Appearance</h3>

                <div className="grid gap-16 sm:grid-cols-2">
                    <NumericInput
                        title="Line width"
                        value={settings.yAxis.axisLineWidth}
                        min={0}
                        max={8}
                        step={0.5}
                        precision={1}
                        onChange={(value) => updateAxisField('axisLineWidth', value)}
                    />
                    <ColorField
                        label="Line color"
                        value={settings.yAxis.axisLineColor}
                        onChange={(value) => updateAxisField('axisLineColor', value)}
                    />
                </div>

                <div className="grid gap-16 sm:grid-cols-2">
                    <Toggle
                        label={settings.yAxis.showTickLabels ? 'Tick labels visible' : 'Tick labels hidden'}
                        description="Show/hide numeric labels on the axis"
                        value={settings.yAxis.showTickLabels}
                        onChange={(value) => updateAxisField('showTickLabels', value)}
                    />
                    <ColorField
                        label="Tick label color"
                        value={settings.yAxis.tickLabelColor}
                        onChange={(value) => updateAxisField('tickLabelColor', value)}
                    />
                </div>

                <div className="grid gap-16 sm:grid-cols-2">
                    <Toggle
                        label={settings.yAxis.showGridLines ? 'Grid lines visible' : 'Grid lines hidden'}
                        description="Show/hide horizontal grid lines"
                        value={settings.yAxis.showGridLines}
                        onChange={(value) => updateAxisField('showGridLines', value)}
                    />
                    {settings.yAxis.showGridLines && (
                        <ColorField
                            label="Grid line color"
                            value={settings.yAxis.gridLineColor}
                            onChange={(value) => updateAxisField('gridLineColor', value)}
                        />
                    )}
                </div>
            </div>

            <div className="space-y-8 border-t border-white/10 pt-8">
                <h3 className="text-sm font-semibold text-white/80">Typography</h3>

                <div className="grid gap-16 sm:grid-cols-2">
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
