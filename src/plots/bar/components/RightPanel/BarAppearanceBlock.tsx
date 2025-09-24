import { GroupComponents } from '../../../../shared/components/GroupComponents';
import { NumericInput } from '../../../../shared/components/NumericInput';
import { SelectField } from '../../../../shared/components/SelectField';
import { Toggle } from '../../../../shared/components/Toggle';
import type { BarChartSettings, BarOrientation } from '../../../../types/bar';

const orientationOptions: Array<{ value: BarOrientation; label: string }> = [
    { value: 'vertical', label: 'Vertical' },
    { value: 'horizontal', label: 'Horizontal' },
];

const cornerOptions: Array<{ value: BarChartSettings['barCornerStyle']; label: string }> = [
    { value: 'top', label: 'Top' },
    { value: 'both', label: 'Both' },
];

export interface BarAppearanceBlockProps {
    settings: BarChartSettings;
    onChange: (settings: BarChartSettings) => void;
}

export function BarAppearanceBlock({ settings, onChange }: BarAppearanceBlockProps) {
    const update = <K extends keyof BarChartSettings>(key: K, value: BarChartSettings[K]) => {
        onChange({ ...settings, [key]: value });
    };

    return {
        orientationAndSpacing: (
            <GroupComponents
                minComponentWidth={20}
                maxColumns={2}
                gap={2}
                rowGap={2}
            >
                <SelectField<BarOrientation>
                    label="Orientation"
                    value={settings.orientation}
                    onChange={(value) => update('orientation', value)}
                    options={orientationOptions}
                    placeholder="Select orientation"
                />
                <NumericInput
                    title="Bar gap"
                    value={settings.barGap}
                    min={0}
                    max={200}
                    step={1}
                    precision={0}
                    onChange={(value) => update('barGap', value)}
                    suffix="%"
                />
            </GroupComponents>
        ),

        borderAndCorners: (
            <GroupComponents
                minComponentWidth={16}
                maxColumns={3}
                gap={2}
                rowGap={2}
            >
                <Toggle
                    title="Show borders"
                    value={settings.showBorder}
                    onChange={(value) => update('showBorder', value)}
                />
                <div className={`transition-opacity ${!settings.showBorder ? 'opacity-50 pointer-events-none' : ''}`}>
                    <NumericInput
                        title="Border width"
                        value={settings.barBorderWidth}
                        min={0}
                        max={20}
                        step={0.5}
                        precision={1}
                        onChange={(value) => update('barBorderWidth', value)}
                    />
                </div>
                <div className={`transition-opacity ${!settings.showBorder ? 'opacity-50 pointer-events-none' : ''}`}>
                    <SelectField<BarChartSettings['barCornerStyle']>
                        label="Corner style"
                        value={settings.barCornerStyle}
                        onChange={(value) => update('barCornerStyle', value)}
                        options={cornerOptions}
                        placeholder="Select style"
                    />
                </div>
            </GroupComponents>
        ),

        cornerRadius: (
            <GroupComponents
                minComponentWidth={20}
                maxColumns={2}
                gap={2}
                rowGap={2}
            >
                <NumericInput
                    title="Corner radius"
                    value={settings.barCornerRadius}
                    min={0}
                    max={50}
                    step={1}
                    precision={0}
                    onChange={(value) => update('barCornerRadius', value)}
                    suffix="px"
                />
                <NumericInput
                    title="Opacity"
                    value={settings.barOpacity * 100}
                    min={0}
                    max={100}
                    step={1}
                    precision={0}
                    onChange={(value) => update('barOpacity', value / 100)}
                    suffix="%"
                />
            </GroupComponents>
        )
    };
}