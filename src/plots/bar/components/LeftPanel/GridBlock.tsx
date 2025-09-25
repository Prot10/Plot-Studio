import { useState } from 'react'
import { ColorField } from '../../../../shared/components/ColorField'
import { NumericInput } from '../../../../shared/components/NumericInput'
import { SelectField } from '../../../../shared/components/SelectField'
import { GroupComponents } from '../../../../shared/components/GroupComponents'
import type { BarChartSettings } from '../../../../types/bar'
import type { AxisSettings } from '../../../../types/base'

type GridBlockProps = {
    settings: BarChartSettings
    onChange: (settings: BarChartSettings) => void
}

export function GridBlock({ settings, onChange }: GridBlockProps) {
    const [gridSynced, setGridSynced] = useState(false)

    const updateXAxisField = <K extends keyof AxisSettings>(key: K, value: AxisSettings[K]) => {
        const nextXAxis = { ...settings.xAxis, [key]: value }
        const updates: Partial<BarChartSettings> = { xAxis: nextXAxis }

        // If grid is synced, also update Y-axis
        if (gridSynced) {
            updates.yAxis = { ...settings.yAxis, [key]: value }
        }

        onChange({ ...settings, ...updates })
    }

    const updateYAxisField = <K extends keyof AxisSettings>(key: K, value: AxisSettings[K]) => {
        const nextYAxis = { ...settings.yAxis, [key]: value }
        const updates: Partial<BarChartSettings> = { yAxis: nextYAxis }

        // If grid is synced, also update X-axis
        if (gridSynced) {
            updates.xAxis = { ...settings.xAxis, [key]: value }
        }

        onChange({ ...settings, ...updates })
    }

    const syncGridSettings = () => {
        setGridSynced(!gridSynced)

        if (!gridSynced) {
            // When enabling sync, copy Y-axis grid settings to X-axis
            onChange({
                ...settings,
                xAxis: {
                    ...settings.xAxis,
                    showGridLines: settings.yAxis.showGridLines,
                    gridLineStyle: settings.yAxis.gridLineStyle,
                    gridLineWidth: settings.yAxis.gridLineWidth,
                    gridLineOpacity: settings.yAxis.gridLineOpacity,
                    gridLineColor: settings.yAxis.gridLineColor,
                }
            })
        }
    }

    return {
        vertical: (
            <GroupComponents
                maxColumns={2}
                gap={2}
                rowGap={2}
            >
                <SelectField<'solid' | 'dashed' | 'dotted'>
                    label="Line Style"
                    value={settings.xAxis.gridLineStyle}
                    onChange={(style) => updateXAxisField('gridLineStyle', style)}
                    options={[
                        { value: 'solid', label: 'Solid' },
                        { value: 'dashed', label: 'Dashed' },
                        { value: 'dotted', label: 'Dotted' }
                    ]}
                    placeholder="Select style"
                />
                <NumericInput
                    title="Line Width"
                    value={settings.xAxis.gridLineWidth}
                    onChange={(value) => updateXAxisField('gridLineWidth', value)}
                    min={0.5}
                    max={5}
                    step={0.5}
                    precision={1}
                />
                <NumericInput
                    title="Opacity"
                    value={settings.xAxis.gridLineOpacity}
                    onChange={(value) => updateXAxisField('gridLineOpacity', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    precision={1}
                />
                <ColorField
                    label="Grid line color"
                    value={settings.xAxis.gridLineColor}
                    onChange={(value) => updateXAxisField('gridLineColor', value)}
                />
            </GroupComponents>
        ),

        horizontal: (
            <GroupComponents
                maxColumns={2}
                gap={2}
                rowGap={2}
            >
                <SelectField<'solid' | 'dashed' | 'dotted'>
                    label="Line Style"
                    value={settings.yAxis.gridLineStyle}
                    onChange={(style) => updateYAxisField('gridLineStyle', style)}
                    options={[
                        { value: 'solid', label: 'Solid' },
                        { value: 'dashed', label: 'Dashed' },
                        { value: 'dotted', label: 'Dotted' }
                    ]}
                    placeholder="Select style"
                />
                <NumericInput
                    title="Line Width"
                    value={settings.yAxis.gridLineWidth}
                    onChange={(value) => updateYAxisField('gridLineWidth', value)}
                    min={0.5}
                    max={5}
                    step={0.5}
                    precision={1}
                />
                <NumericInput
                    title="Opacity"
                    value={settings.yAxis.gridLineOpacity}
                    onChange={(value) => updateYAxisField('gridLineOpacity', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    precision={1}
                />
                <ColorField
                    label="Grid line color"
                    value={settings.yAxis.gridLineColor}
                    onChange={(value) => updateYAxisField('gridLineColor', value)}
                />
            </GroupComponents>
        ),

        syncButton: (
            <div className="flex justify-start">
                <button
                    type="button"
                    onClick={syncGridSettings}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${gridSynced
                        ? 'bg-sky-600 text-white hover:bg-sky-700'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                >
                    <svg
                        className={`h-4 w-4 transition-transform ${gridSynced ? 'rotate-0' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                    </svg>
                    {gridSynced ? 'V and H Grid Lines Synced' : 'Sync V and H Grid Lines'}
                </button>
            </div>
        )
    }
}