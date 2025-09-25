import { useEffect, useRef } from 'react'
import { ColorField } from '../../../../shared/components/ColorField'
import { NumericInput } from '../../../../shared/components/NumericInput'
import { AutoNumericInput } from '../../../../shared/components/AutoNumericInput'
import { GroupComponents } from '../../../../shared/components/GroupComponents'
import type { BarChartSettings } from '../../../../types/bar'
import type { AxisSettings, FocusRequest } from '../../../../types/base'
import { shouldSyncAxisField } from './axisSync'

type YAxisBlockProps = {
    settings: BarChartSettings
    onChange: (settings: BarChartSettings) => void
    focusRequest?: FocusRequest | null
}

export function YAxisBlock({ settings, onChange, focusRequest }: YAxisBlockProps) {
    const yAxisTitleRef = useRef<HTMLInputElement | null>(null)
    const handledFocusRef = useRef(0)

    const update = <K extends keyof BarChartSettings>(key: K, value: BarChartSettings[K]) => {
        onChange({ ...settings, [key]: value })
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

        onChange({
            ...settings,
            yAxis: nextYAxis,
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

    return {
        title: (
            <GroupComponents
                minComponentWidth={16}
                maxColumns={3}
                gap={2}
                rowGap={2}
            >
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

                <div className={`transition-opacity ${!settings.yAxis.title.trim() ? 'opacity-50 pointer-events-none' : ''}`}>
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

                <div className={`transition-opacity ${!settings.yAxis.title.trim() ? 'opacity-50 pointer-events-none' : ''}`}>
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
            </GroupComponents>
        ),

        appearance: (
            <GroupComponents
                minComponentWidth={16}
                maxColumns={2}
                gap={2}
                rowGap={2}
            >
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
            </GroupComponents>
        ),

        ticks: (
            <GroupComponents
                minComponentWidth={16}
                maxColumns={3}
                gap={2}
                rowGap={2}
            >
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
                <ColorField
                    label="Label color"
                    value={settings.yAxis.tickLabelColor}
                    onChange={(value) => updateAxisField('tickLabelColor', value)}
                />
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
                <AutoNumericInput
                    title="Y min"
                    value={settings.yAxisMin}
                    onChange={(value) => update('yAxisMin', value)}
                    min={-1000}
                    max={1000}
                    step={1}
                    precision={1}
                    autoValue={0}
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
                    autoValue={100}
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
                    autoValue={10}
                    placeholder="auto"
                />
            </GroupComponents>
        )
    }
}