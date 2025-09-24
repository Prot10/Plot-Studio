import { ColorField } from '../../../../shared/components/ColorField';
import { GroupComponents } from '../../../../shared/components/GroupComponents';
import { NumericInput } from '../../../../shared/components/NumericInput';
import { SelectField } from '../../../../shared/components/SelectField';
import { Toggle } from '../../../../shared/components/Toggle';
import type { BarChartSettings } from '../../../../types/bar';

const errorBarModeOptions: Array<{ value: BarChartSettings['errorBarMode']; label: string }> = [
    { value: 'global', label: 'Uniform' },
    { value: 'match', label: 'Border' },
];

export interface ErrorBarsBlockProps {
    settings: BarChartSettings;
    onChange: (settings: BarChartSettings) => void;
}

export function ErrorBarsBlock({ settings, onChange }: ErrorBarsBlockProps) {
    const update = <K extends keyof BarChartSettings>(key: K, value: BarChartSettings[K]) => {
        onChange({ ...settings, [key]: value });
    };

    return {
        toggleAndMode: (
            <GroupComponents
                minComponentWidth={20}
                maxColumns={2}
                gap={2}
                rowGap={2}
            >
                <Toggle
                    title="Show error bars"
                    value={settings.showErrorBars}
                    onChange={(value) => update('showErrorBars', value)}
                />
                <div className={`transition-opacity ${!settings.showErrorBars ? 'opacity-50 pointer-events-none' : ''}`}>
                    <SelectField
                        label="Color mode"
                        value={settings.errorBarMode}
                        onChange={(value) => update('errorBarMode', value)}
                        options={errorBarModeOptions}
                        placeholder="Select mode"
                    />
                </div>
            </GroupComponents>
        ),

        styling: (
            <div className={`transition-opacity ${!settings.showErrorBars ? 'opacity-50 pointer-events-none' : ''}`}>
                <GroupComponents
                    minComponentWidth={16}
                    maxColumns={3}
                    gap={2}
                    rowGap={2}
                >
                    <ColorField
                        label="Error bar color"
                        value={settings.errorBarColor}
                        onChange={(value) => update('errorBarColor', value)}
                    />
                    <NumericInput
                        title="Line width"
                        value={settings.errorBarWidth}
                        min={0.5}
                        max={10}
                        step={0.5}
                        precision={1}
                        onChange={(value) => update('errorBarWidth', value)}
                    />
                    <NumericInput
                        title="Cap width"
                        value={settings.errorBarCapWidth}
                        min={0}
                        max={50}
                        step={1}
                        precision={0}
                        onChange={(value) => update('errorBarCapWidth', value)}
                    />
                </GroupComponents>
            </div>
        )
    };
}