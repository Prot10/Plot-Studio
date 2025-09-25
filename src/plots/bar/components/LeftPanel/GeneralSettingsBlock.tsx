import { ColorField } from '../../../../shared/components/ColorField';
import { FontPicker } from '../../../../shared/components/FontPicker';
import { GroupComponents } from '../../../../shared/components/GroupComponents';
import { NumericInput } from '../../../../shared/components/NumericInput';
import { SelectField } from '../../../../shared/components/SelectField';
import { AutoNumericInput } from '../../../../shared/components/AutoNumericInput';
import { DEFAULT_FONT_OPTIONS } from '../../../../shared/constants/fonts';
import { paletteOptions, palettes } from '../../../../shared/utils/palettes';
import type { BarChartSettings, BarDataPoint } from '../../../../types/bar';
import type { PaletteKey } from '../../../../types/base';

type GeneralSettingsBlockProps = {
    settings: BarChartSettings;
    bars: BarDataPoint[];
    onChange: (settings: BarChartSettings) => void;
    onBarsChange: (bars: BarDataPoint[]) => void;
}

export function GeneralSettingsBlock({ settings, bars, onChange, onBarsChange }: GeneralSettingsBlockProps) {
    const update = <K extends keyof BarChartSettings>(key: K, value: BarChartSettings[K]) => {
        onChange({ ...settings, [key]: value });
    };

    // Helper function to handle dimension updates with aspect ratio logic
    const handleDimensionUpdate = (dimension: 'width' | 'height', value: number | null) => {
        if (dimension === 'width') {
            const newSettings = { ...settings, customWidth: value };

            // If height is unlocked and width is being set, calculate height from aspect ratio
            if (value !== null && settings.customHeight !== null) {
                // Both dimensions will be set, aspect ratio becomes inactive
                onChange(newSettings);
            } else if (value !== null && settings.customHeight === null) {
                // Only width is set, height should be auto
                onChange(newSettings);
            } else {
                // Width is being set to auto
                onChange(newSettings);
            }
        } else {
            const newSettings = { ...settings, customHeight: value };

            // If width is unlocked and height is being set, calculate width from aspect ratio  
            if (value !== null && settings.customWidth !== null) {
                // Both dimensions will be set, aspect ratio becomes inactive
                onChange(newSettings);
            } else if (value !== null && settings.customWidth === null) {
                // Only height is set, width should be auto
                onChange(newSettings);
            } else {
                // Height is being set to auto
                onChange(newSettings);
            }
        }
    };

    // Calculate computed width/height based on aspect ratio
    const getComputedDimensions = () => {
        const baseWidth = 800;
        const baseHeight = 600;

        if (settings.customWidth !== null && settings.customHeight === null) {
            // Width is set, calculate height from aspect ratio
            return {
                computedWidth: settings.customWidth,
                computedHeight: settings.customWidth / settings.aspectRatio
            };
        } else if (settings.customHeight !== null && settings.customWidth === null) {
            // Height is set, calculate width from aspect ratio
            return {
                computedWidth: settings.customHeight * settings.aspectRatio,
                computedHeight: settings.customHeight
            };
        } else {
            // Both auto or both set - use base dimensions
            return {
                computedWidth: baseWidth,
                computedHeight: baseHeight
            };
        }
    };

    const { computedWidth, computedHeight } = getComputedDimensions();
    const bothDimensionsSet = settings.customWidth !== null && settings.customHeight !== null;
    const aspectRatioActive = !bothDimensionsSet;

    const handlePaletteChange = (nextPalette: PaletteKey) => {
        const palette = palettes[nextPalette];
        if (!palette) return;

        const nextBars = bars.map((bar, index) => ({
            ...bar,
            fillColor: palette[index % palette.length],
        }));

        update('paletteName', nextPalette);
        onBarsChange(nextBars);
    };

    return {
        generalSettings: (
            <GroupComponents
                maxColumns={3}
                gap={2}
                rowGap={2}
            >
                <SelectField<PaletteKey>
                    label="Color Palette"
                    value={settings.paletteName}
                    onChange={(nextPalette) => handlePaletteChange(nextPalette)}
                    options={paletteOptions}
                    placeholder="Select a palette"
                />
                <ColorField
                    label="Background color"
                    value={settings.backgroundColor}
                    onChange={(value) => update('backgroundColor', value)}
                />
                <FontPicker
                    label="Chart text font"
                    value={settings.globalFontFamily}
                    onChange={(value) => update('globalFontFamily', value)}
                    options={DEFAULT_FONT_OPTIONS}
                />
                <NumericInput
                    title="Inner padding"
                    value={settings.canvasPadding}
                    min={0}
                    max={160}
                    step={4}
                    precision={0}
                    onChange={(value) => update('canvasPadding', value)}
                    suffix="px"
                />
            </GroupComponents>
        ),

        chartDimensions: (
            <GroupComponents
                maxColumns={3}
                gap={2}
                rowGap={2}
            >
                <AutoNumericInput
                    title="Custom width"
                    value={settings.customWidth}
                    onChange={(value) => handleDimensionUpdate('width', value)}
                    min={120}
                    max={2000}
                    step={10}
                    precision={0}
                    suffix="px"
                    autoValue={Math.round(computedWidth)}
                    placeholder="auto"
                />
                <AutoNumericInput
                    title="Custom height"
                    value={settings.customHeight}
                    onChange={(value) => handleDimensionUpdate('height', value)}
                    min={120}
                    max={2000}
                    step={10}
                    precision={0}
                    suffix="px"
                    autoValue={Math.round(computedHeight)}
                    placeholder="auto"
                />
                <AutoNumericInput
                    title="Aspect ratio"
                    value={aspectRatioActive ? settings.aspectRatio : null}
                    onChange={(value) => update('aspectRatio', value ?? 1.33)}
                    min={0.3}
                    max={1.2}
                    step={0.02}
                    precision={2}
                    disabled={!aspectRatioActive}
                    autoValue={settings.aspectRatio}
                    placeholder="auto"
                />
            </GroupComponents>
        ),

        plotBoxSettings: (
            <GroupComponents
                maxColumns={2}
                gap={2}
                rowGap={2}
            >
                <NumericInput
                    title="Line width"
                    value={settings.plotBoxLineWidth}
                    min={0.5}
                    max={8}
                    step={0.5}
                    precision={1}
                    onChange={(value) => update('plotBoxLineWidth', value)}
                />
                <ColorField
                    label="Line color"
                    value={settings.plotBoxColor}
                    onChange={(value) => update('plotBoxColor', value)}
                />
            </GroupComponents>
        )
    };
}