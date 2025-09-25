import { useEffect, useRef } from 'react'
import { ColorField } from '../../../../shared/components/ColorField'
import { NumericInput } from '../../../../shared/components/NumericInput'
import { GroupComponents } from '../../../../shared/components/GroupComponents'
import type { BarChartSettings } from '../../../../types/bar'
import type { AxisSettings, FocusRequest } from '../../../../types/base'
import { shouldSyncAxisField } from './axisSync'

type XAxisBlockProps = {
    settings: BarChartSettings
    onChange: (settings: BarChartSettings) => void
    focusRequest?: FocusRequest | null
}

export function XAxisBlock({ settings, onChange, focusRequest }: XAxisBlockProps) {
    const xAxisTitleRef = useRef<HTMLInputElement | null>(null)
    const handledFocusRef = useRef(0)

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

    return {
        title: (
            <div className="space-y-6">
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

                {settings.xAxis.title.trim() && (
                    <GroupComponents
                        maxColumns={2}
                        gap={2}
                        rowGap={2}
                    >
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
                    </GroupComponents>
                )}
            </div>
        ),

        appearance: (
            <GroupComponents
                maxColumns={2}
                gap={2}
                rowGap={2}
            >
                <NumericInput
                    title="Line width"
                    value={settings.xAxis.axisLineWidth}
                    min={0}
                    max={8}
                    step={0.5}
                    precision={1}
                    onChange={(value) => updateAxisField('axisLineWidth', value)}
                />
                <ColorField
                    label="Line color"
                    value={settings.xAxis.axisLineColor}
                    onChange={(value) => updateAxisField('axisLineColor', value)}
                />
            </GroupComponents>
        ),

        ticks: (
            <GroupComponents
                maxColumns={3}
                gap={2}
                rowGap={2}
            >
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
                <ColorField
                    label="Label color"
                    value={settings.xAxis.tickLabelColor}
                    onChange={(value) => updateAxisField('tickLabelColor', value)}
                />
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
            </GroupComponents>
        )
    }
}