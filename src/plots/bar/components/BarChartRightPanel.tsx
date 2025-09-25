import { RightPanel } from '../../../shared/components/RightPanel';
import { BarplotStyleBlock } from './RightPanel/BarplotStyleBlock';
import { BarDesignBlock } from './RightPanel/BarDesignBlock';
import type { BarChartSettings, BarDataPoint } from '../../../types/bar'
import type { HighlightKey } from '../../../types/base'
import type { RightPanelBlock } from '../../../shared/components/RightPanel';

export interface BarChartRightPanelProps {
    settings: BarChartSettings;
    bars: BarDataPoint[];
    onChange: (settings: BarChartSettings) => void;
    onBarsChange: (bars: BarDataPoint[]) => void;
    highlightSignals?: Partial<Record<HighlightKey, number>>;
    selectedBarId?: string | null;
    onSelectBar?: (barId: string | null) => void;
}

export function BarChartRightPanel({
    settings,
    bars,
    onChange,
    onBarsChange,
    highlightSignals,
    selectedBarId,
    onSelectBar
}: BarChartRightPanelProps) {
    // Create the blocks using the component helpers
    const barplotStyle = BarplotStyleBlock({ settings, onChange, highlightSignals });
    const barDesign = BarDesignBlock({ settings, bars, onBarsChange, selectedBarId, onSelectBar });

    const blocks: RightPanelBlock[] = [
        // Barplot Style Block
        {
            id: 'barplot-style',
            title: 'Barplot Style',
            sections: [
                {
                    id: 'global-settings',
                    content: barplotStyle.globalSettings
                },
                {
                    id: 'border-settings',
                    title: 'Border',
                    content: barplotStyle.borderSettings,
                    className: 'border-t border-white/10 pt-6',
                    toggle: {
                        value: settings.showBorder,
                        onChange: (value: boolean) => onChange({ ...settings, showBorder: value })
                    }
                },
                {
                    id: 'error-bars',
                    title: 'Error Bars',
                    content: barplotStyle.errorBars,
                    className: 'border-t border-white/10 pt-6',
                    toggle: {
                        value: settings.showErrorBars,
                        onChange: (value: boolean) => onChange({ ...settings, showErrorBars: value })
                    }
                }
            ]
        },

        // Bar Design Block
        {
            id: 'bar-design',
            title: 'Bar Design',
            sections: [
                {
                    id: 'bar-selector',
                    content: barDesign.barSelector
                },
                {
                    id: 'bar-settings',
                    content: barDesign.barSettings
                }
            ]
        }
    ];

    return (
        <RightPanel
            blocks={blocks}
            highlightSignals={highlightSignals}
        />
    );
}