import { ColorField } from '../../../../shared/components/ColorField';
import { GroupComponents } from '../../../../shared/components/GroupComponents';
import { NumericInput } from '../../../../shared/components/NumericInput';
import type { BarChartSettings } from '../../../../types/bar';

type ValueLabelsBlockProps = {
    settings: BarChartSettings;
    onChange: (settings: BarChartSettings) => void;
}

export function ValueLabelsBlock({ settings, onChange }: ValueLabelsBlockProps) {
    const update = <K extends keyof BarChartSettings>(key: K, value: BarChartSettings[K]) => {
        onChange({ ...settings, [key]: value });
    };

    return {
        settings: (
            <GroupComponents
                maxColumns={3}
                gap={2}
                rowGap={2}
            >
                <NumericInput
                    title="Font size"
                    value={settings.valueLabelFontSize}
                    min={6}
                    max={48}
                    step={1}
                    precision={0}
                    onChange={(value) => update('valueLabelFontSize', value)}
                    suffix="px"
                />
                <ColorField
                    label="Label color"
                    value={settings.textColor}
                    onChange={(value) => update('textColor', value)}
                />
                <NumericInput
                    title="X offset"
                    value={settings.valueLabelOffsetX}
                    min={-100}
                    max={100}
                    step={1}
                    precision={0}
                    onChange={(value) => update('valueLabelOffsetX', value)}
                    suffix="px"
                />
                <NumericInput
                    title="Y offset"
                    value={settings.valueLabelOffsetY}
                    min={-100}
                    max={100}
                    step={1}
                    precision={0}
                    onChange={(value) => update('valueLabelOffsetY', value)}
                    suffix="px"
                />
            </GroupComponents>
        )
    };
}