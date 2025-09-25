import { ColorField } from '../../../../shared/components/ColorField'
import { NumericInput } from '../../../../shared/components/NumericInput'
import { GroupComponents } from '../../../../shared/components/GroupComponents'
import type { BarChartSettings, BarOrientation } from '../../../../types/bar'
import type { HighlightKey } from '../../../../types/base'

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

interface BarplotStyleBlockProps {
    settings: BarChartSettings;
    onChange: (settings: BarChartSettings) => void;
    highlightSignals?: Partial<Record<HighlightKey, number>>;
}

export function BarplotStyleBlock({ settings, onChange }: BarplotStyleBlockProps) {
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

    return {
        globalSettings: (
            <GroupComponents
                maxColumns={2}
                gap={2}
                rowGap={2}
            >
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
            </GroupComponents>
        ),

        borderSettings: (
            <GroupComponents
                maxColumns={2}
                gap={2}
                rowGap={2}
            >
                <NumericInput
                    title="Line width"
                    value={settings.globalBorderWidth}
                    min={0}
                    max={20}
                    step={0.5}
                    precision={1}
                    onChange={(value) => update('globalBorderWidth', value)}
                    suffix="px"
                />
                <ColorField
                    label="Line color"
                    value={settings.globalBorderColor}
                    onChange={(value) => update('globalBorderColor', value)}
                />
            </GroupComponents>
        ),

        errorBars: (
            <GroupComponents
                maxColumns={2}
                gap={2}
                rowGap={2}
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
                />
                <ColorField
                    label="Line color"
                    value={settings.errorBarColor}
                    onChange={(value) => update('errorBarColor', value)}
                />
            </GroupComponents>
        )
    }
}