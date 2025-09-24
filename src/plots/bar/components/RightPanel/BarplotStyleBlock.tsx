import { ColorField } from '../../../../shared/components/ColorField'
import { NumericInput } from '../../../../shared/components/NumericInput'
import { useHighlightEffect } from '../../../../shared/hooks/useHighlightEffect'
import type { BarChartSettings, BarOrientation } from '../../../../types/bar'
import type { HighlightKey } from '../../../../types/base'

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
                    className={`relative inline-flex h-5 w-9 flex-none items-center rounded-full transition ${value ? 'bg-sky-400' : 'bg-white/20'
                        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                    role="switch"
                    aria-checked={value}
                    aria-disabled={disabled}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${value ? 'translate-x-4' : 'translate-x-0.5'
                            }`}
                    />
                </button>
            </div>
        </div>
    )
}

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

const errorBarModeOptions: Array<{ value: BarChartSettings['errorBarMode']; label: string }> = [
    { value: 'global', label: 'Uniform' },
    { value: 'match', label: 'Border' },
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

function ErrorBarModeSelector({
    value,
    onChange,
    disabled,
}: {
    value: BarChartSettings['errorBarMode']
    onChange: (value: BarChartSettings['errorBarMode']) => void
    disabled?: boolean
}) {
    return (
        <div className={`flex flex-col gap-1 text-sm text-white ${disabled ? 'opacity-50' : ''}`}>
            <span className="text-xs uppercase tracking-wide text-white/50">Color mode</span>
            <div className="flex overflow-hidden rounded-md border border-white/10 bg-white/10 text-white shadow-sm h-9">
                {errorBarModeOptions.map((option, index) => {
                    const isActive = option.value === value
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => !disabled && onChange(option.value)}
                            disabled={disabled}
                            className={`flex flex-1 items-center justify-center px-3 text-xs font-medium transition focus:outline-none ${disabled
                                ? 'cursor-not-allowed'
                                : isActive
                                    ? 'bg-sky-500/20 text-white'
                                    : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white'
                                } ${index < errorBarModeOptions.length - 1 ? 'border-r border-white/10' : ''
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

export function BarplotStyleBlock({ settings, onChange, highlightSignals }: BarplotStyleBlockProps) {
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

    const errorHighlight = useHighlightEffect(highlightSignals?.errorBars)

    return {
        globalSettings: (
            <div>
                <h3 className="text-sm font-semibold text-white/80 mb-4">Global Settings</h3>
                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
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
                </div>
            </div>
        ),

        borderSettings: (
            <div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Toggle
                        title="Show border"
                        value={settings.showBorder}
                        onChange={(value) => update('showBorder', value)}
                    />

                    <div className={`transition-opacity ${settings.showBorder ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <NumericInput
                            title="Border width"
                            value={settings.globalBorderWidth}
                            min={0}
                            max={20}
                            step={0.5}
                            precision={1}
                            onChange={(value) => update('globalBorderWidth', value)}
                            suffix="px"
                            disabled={!settings.showBorder}
                        />
                    </div>

                </div>
            </div>
        ),

        errorBars: (
            <div>

                <div
                    className="grid gap-4 sm:grid-cols-3"
                >
                    <Toggle
                        title="Show error bars"
                        value={settings.showErrorBars}
                        onChange={(value) => update('showErrorBars', value)}
                    />
                    <div
                        className={`${errorHighlight ? 'highlight-pulse ' : ''}transition-opacity ${settings.showErrorBars ? 'opacity-100' : 'opacity-50 pointer-events-none'
                            }`}
                    >
                        <ErrorBarModeSelector
                            value={settings.errorBarMode}
                            onChange={(value) => update('errorBarMode', value)}
                            disabled={!settings.showErrorBars}
                        />
                    </div>
                    <div
                        className={`${errorHighlight ? 'highlight-pulse ' : ''}transition-opacity ${settings.showErrorBars ? 'opacity-100' : 'opacity-50 pointer-events-none'
                            }`}
                    >
                        <ColorField
                            label="Error bar color"
                            value={settings.errorBarColor}
                            onChange={(value) => update('errorBarColor', value)}
                            disabled={!settings.showErrorBars || settings.errorBarMode !== 'global'}
                        />
                    </div>
                </div>

                <div
                    className={`mt-4 ${errorHighlight ? 'highlight-pulse ' : ''}grid gap-4 sm:grid-cols-2 transition-opacity ${settings.showErrorBars ? 'opacity-100' : 'opacity-50 pointer-events-none'
                        }`}
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
                        disabled={!settings.showErrorBars}
                    />
                    <NumericInput
                        title="Cap width"
                        value={settings.errorBarCapWidth}
                        min={0}
                        max={96}
                        step={2}
                        precision={0}
                        onChange={(value) => update('errorBarCapWidth', value)}
                        suffix="px"
                        disabled={!settings.showErrorBars}
                    />
                </div>
            </div>
        )
    }
}