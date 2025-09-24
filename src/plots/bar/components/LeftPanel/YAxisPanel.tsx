import { useEffect, useRef } from 'react'
import { ColorField } from '../../../../shared/components/ColorField'
import { NumericInput } from '../../../../shared/components/NumericInput'
import { SelectField } from '../../../../shared/components/SelectField'
import { AutoNumericInput } from '../../../../shared/components/AutoNumericInput'
import { Toggle } from '../../../../shared/components/Toggle'
import { useHighlightEffect } from '../../../../shared/hooks/useHighlightEffect'
import type { BarChartSettings } from '../../../../types/bar'
import type { AxisSettings, FocusRequest, HighlightKey } from '../../../../types/base'
import { shouldSyncAxisField } from './axisSync'

type YAxisPanelProps = {
    settings: BarChartSettings
    onChange: (settings: BarChartSettings) => void
    highlightSignals?: Partial<Record<HighlightKey, number>>
    focusRequest?: FocusRequest | null
}



export function YAxisPanel({ settings, onChange, highlightSignals, focusRequest }: YAxisPanelProps) {
    const update = <K extends keyof BarChartSettings>(key: K, value: BarChartSettings[K]) => {
        onChange({ ...settings, [key]: value })
    }

    const updateAxis = (value: AxisSettings) => {
        onChange({ ...settings, yAxis: value })
    }

    const updateAxisField = <K extends keyof AxisSettings>(key: K, value: AxisSettings[K]) => {
        const nextYAxis = { ...settings.yAxis, [key]: value }

        if (settings.axesSynced && shouldSyncAxisField(key)) {
            const nextXAxis = { ...settings.xAxis, [key]: value }
            onChange({
                ...settings,
                yAxis: nextYAxis,
                xAxis: nextXAxis,
            })
            return
        }

        updateAxis(nextYAxis)
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
            yAxisTitleFontSize: value,
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
            yAxisTickFontSize: value,
        })
    }

    const handleTickOffsetXChange = (value: number) => {
        if (settings.axesSynced) {
            onChange({
                ...settings,
                xAxisTickOffsetX: value,
                yAxisTickOffsetX: value,
            })
            return
        }
        onChange({
            ...settings,
            yAxisTickOffsetX: value,
        })
    }

    const handleTickOffsetYChange = (value: number) => {
        if (settings.axesSynced) {
            onChange({
                ...settings,
                xAxisTickOffsetY: value,
                yAxisTickOffsetY: value,
            })
            return
        }
        onChange({
            ...settings,
            yAxisTickOffsetY: value,
        })
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
            <div className="space-y-8 border-t border-white/10 pt-8">
                <h3 className="text-sm font-semibold text-white/80">Title</h3>

                {/* All title settings in one responsive row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                            value={settings.yAxisTitleFontSize}
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

            <div className="space-y-8">
                <h3 className="text-sm font-semibold text-white/80">Appearance</h3>

                {/* Visibility, Line Width, and Line Color in one row */}
                <div className="grid grid-cols-3 gap-8">
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
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
                        "grid grid-cols-1 sm:grid-cols-2 gap-8 transition-opacity",
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
                <h3 className="text-sm font-semibold text-white/80">Ticks</h3>

                {/* First row: Tick labels toggle and orientation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div>
                        <Toggle
                            title="Tick labels"
                            value={settings.yAxis.showTickLabels}
                            onChange={(value) => updateAxisField('showTickLabels', value)}
                        />
                    </div>

                    <div className={classNames(
                        "transition-opacity",
                        !settings.yAxis.showTickLabels && "opacity-50 pointer-events-none"
                    )}>
                        <NumericInput
                            title="Label font size"
                            value={settings.yAxisTickFontSize}
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
                        !settings.yAxis.showTickLabels && "opacity-50 pointer-events-none"
                    )}>
                        <ColorField
                            label="Label color"
                            value={settings.yAxis.tickLabelColor}
                            onChange={(value) => updateAxisField('tickLabelColor', value)}
                        />
                    </div>
                </div>

                {/* Second row: Label font size and color */}
                <div className={classNames(
                    "grid grid-cols-1 sm:grid-cols-3 gap-8 transition-opacity",
                    !settings.yAxis.showTickLabels && "opacity-50 pointer-events-none"
                )}>
                    <div>
                        <NumericInput
                            title="Label orientation"
                            value={settings.yAxis.tickLabelOrientation}
                            onChange={(value) => updateAxisField('tickLabelOrientation', value)}
                            min={0}
                            max={360}
                            step={15}
                            precision={0}
                            suffix="°"
                        />
                    </div>

                    <div>
                        <NumericInput
                            title="Label X offset"
                            value={settings.yAxisTickOffsetX}
                            min={-200}
                            max={200}
                            step={1}
                            precision={0}
                            onChange={handleTickOffsetXChange}
                            suffix="px"
                        />
                    </div>

                    <div>
                        <NumericInput
                            title="Label Y offset"
                            value={settings.yAxisTickOffsetY}
                            min={-200}
                            max={200}
                            step={1}
                            precision={0}
                            onChange={handleTickOffsetYChange}
                            suffix="px"
                        />
                    </div>
                </div>

                {/* Third row: Range controls - disabled when tick labels are off */}
                <div className={classNames(
                    "grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 transition-opacity",
                    !settings.yAxis.showTickLabels && "opacity-50 pointer-events-none"
                )}>
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
            </div>
        </section>
    )
}

function classNames(...values: Array<string | false | null | undefined>) {
    return values.filter(Boolean).join(' ')
}

export default YAxisPanel
