import { BaseChartBasicsPanel } from '../../../shared/components/BaseChartBasicsPanel';
import { palettes } from '../../../shared/utils/palettes';
import type { BarChartSettings, BarDataPoint } from '../../../types/bar';
import type { HighlightKey, PaletteKey } from '../../../types/base';

interface BarChartBasicsPanelProps {
    settings: BarChartSettings;
    onChange: (settings: BarChartSettings) => void;
    onDataChange: (data: BarDataPoint[]) => void;
    highlightSignals?: Partial<Record<HighlightKey, number>>;
}

export function BarChartBasicsPanel({
    settings,
    onChange,
    onDataChange,
    highlightSignals,
}: BarChartBasicsPanelProps) {
    const handlePaletteChange = (nextPalette: PaletteKey) => {
        const palette = palettes[nextPalette];
        if (!palette) return;

        const nextData = settings.data.map((bar, index) => ({
            ...bar,
            fillColor: palette[index % palette.length],
        }));

        onDataChange(nextData);
    };

    return (
        <BaseChartBasicsPanel
            settings={settings}
            onChange={onChange}
            highlightSignals={highlightSignals}
            onPaletteChange={handlePaletteChange}
        />
    );
}
