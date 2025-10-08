import { ColorField } from '../../../../shared/components/ColorField'
import { NumericInput } from '../../../../shared/components/NumericInput'
import { GroupComponents } from '../../../../shared/components/GroupComponents'
import { SelectField, type SelectOption } from '../../../../shared/components/SelectField'
import { FontPicker } from '../../../../shared/components/FontPicker'
import { TextStyleControls } from '../../../../shared/components/TextStyleControls'
import type { BarChartSettings, LegendPosition } from '../../../../types/bar'

const positionOptions: Array<SelectOption<LegendPosition>> = [
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-right', label: 'Bottom Right' },
]

interface LegendBlockProps {
    settings: BarChartSettings
    onChange: (settings: BarChartSettings) => void
}

export function LegendBlock({ settings, onChange }: LegendBlockProps) {
    const updateLegend = <K extends keyof BarChartSettings['legend']>(
        key: K,
        value: BarChartSettings['legend'][K]
    ) => {
        onChange({
            ...settings,
            legend: {
                ...settings.legend,
                [key]: value,
            },
        })
    }

    return {
        position: (
            <SelectField<LegendPosition>
                label="Position"
                value={settings.legend.position}
                onChange={(value) => updateLegend('position', value)}
                options={positionOptions}
            />
        ),

        textSettings: (
            <div className="space-y-6">
                <GroupComponents maxColumns={2} gap={2} rowGap={2}>
                    <NumericInput
                        title="Font size"
                        value={settings.legend.fontSize}
                        min={8}
                        max={48}
                        step={1}
                        precision={0}
                        onChange={(value) => updateLegend('fontSize', value)}
                        suffix="px"
                    />
                    <ColorField
                        label="Text color"
                        value={settings.legend.textColor}
                        onChange={(value) => updateLegend('textColor', value)}
                    />
                </GroupComponents>

                <FontPicker
                    label="Font family"
                    value={settings.legend.fontFamily}
                    onChange={(value) => updateLegend('fontFamily', value)}
                />

                <TextStyleControls
                    label="Text style"
                    value={{
                        bold: settings.legend.isBold,
                        italic: settings.legend.isItalic,
                        underline: false,
                    }}
                    onChange={(value) => {
                        updateLegend('isBold', value.bold)
                        updateLegend('isItalic', value.italic)
                    }}
                />
            </div>
        ),

        background: (
            <div className="space-y-6">
                <GroupComponents maxColumns={2} gap={2} rowGap={2}>
                    <ColorField
                        label="Background color"
                        value={settings.legend.backgroundColor}
                        onChange={(value) => updateLegend('backgroundColor', value)}
                    />
                    <NumericInput
                        title="Background opacity"
                        value={settings.legend.backgroundOpacity}
                        min={0}
                        max={1}
                        step={0.05}
                        precision={2}
                        onChange={(value) => updateLegend('backgroundOpacity', value)}
                    />
                </GroupComponents>

                <GroupComponents maxColumns={3} gap={2} rowGap={2}>
                    <ColorField
                        label="Border color"
                        value={settings.legend.borderColor}
                        onChange={(value) => updateLegend('borderColor', value)}
                    />
                    <NumericInput
                        title="Border width"
                        value={settings.legend.borderWidth}
                        min={0}
                        max={8}
                        step={0.5}
                        precision={1}
                        onChange={(value) => updateLegend('borderWidth', value)}
                        suffix="px"
                    />
                    <NumericInput
                        title="Border radius"
                        value={settings.legend.borderRadius}
                        min={0}
                        max={32}
                        step={1}
                        precision={0}
                        onChange={(value) => updateLegend('borderRadius', value)}
                        suffix="px"
                    />
                </GroupComponents>
            </div>
        ),

        spacing: (
            <GroupComponents maxColumns={2} gap={2} rowGap={2}>
                <NumericInput
                    title="Padding X"
                    value={settings.legend.paddingX}
                    min={0}
                    max={48}
                    step={1}
                    precision={0}
                    onChange={(value) => updateLegend('paddingX', value)}
                    suffix="px"
                />
                <NumericInput
                    title="Padding Y"
                    value={settings.legend.paddingY}
                    min={0}
                    max={48}
                    step={1}
                    precision={0}
                    onChange={(value) => updateLegend('paddingY', value)}
                    suffix="px"
                />
                <NumericInput
                    title="Item spacing"
                    value={settings.legend.itemSpacing}
                    min={0}
                    max={48}
                    step={1}
                    precision={0}
                    onChange={(value) => updateLegend('itemSpacing', value)}
                    suffix="px"
                />
                <NumericInput
                    title="Marker spacing"
                    value={settings.legend.markerSpacing}
                    min={0}
                    max={24}
                    step={1}
                    precision={0}
                    onChange={(value) => updateLegend('markerSpacing', value)}
                    suffix="px"
                />
            </GroupComponents>
        ),

        markerSettings: (
            <NumericInput
                title="Marker size"
                value={settings.legend.markerSize}
                min={8}
                max={48}
                step={1}
                precision={0}
                onChange={(value) => updateLegend('markerSize', value)}
                suffix="px"
            />
        ),

        position_offset: (
            <GroupComponents maxColumns={2} gap={2} rowGap={2}>
                <NumericInput
                    title="Offset X"
                    value={settings.legend.offsetX}
                    min={-200}
                    max={200}
                    step={1}
                    precision={0}
                    onChange={(value) => updateLegend('offsetX', value)}
                    suffix="px"
                />
                <NumericInput
                    title="Offset Y"
                    value={settings.legend.offsetY}
                    min={-200}
                    max={200}
                    step={1}
                    precision={0}
                    onChange={(value) => updateLegend('offsetY', value)}
                    suffix="px"
                />
            </GroupComponents>
        ),
    }
}
