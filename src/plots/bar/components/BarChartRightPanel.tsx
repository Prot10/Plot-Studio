import { RightPanel } from '../../../shared/components/RightPanel';
import { BarplotStyleBlock } from './RightPanel/BarplotStyleBlock';
import { BarDesignBlock } from './RightPanel/BarDesignBlock';
import { LegendBlock } from './RightPanel/LegendBlock';
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
    const legend = LegendBlock({ settings, onChange });

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
        },

        // Legend Block
        {
            id: 'legend',
            title: 'Legend',
            sections: [
                {
                    id: 'legend-position',
                    content: legend.position
                },
                {
                    id: 'legend-text',
                    title: 'Text',
                    content: legend.textSettings,
                    className: 'border-t border-white/10 pt-6'
                },
                {
                    id: 'legend-background',
                    title: 'Background & Border',
                    content: legend.background,
                    className: 'border-t border-white/10 pt-6'
                },
                {
                    id: 'legend-spacing',
                    title: 'Spacing',
                    content: legend.spacing,
                    className: 'border-t border-white/10 pt-6'
                },
                {
                    id: 'legend-marker',
                    title: 'Marker',
                    content: legend.markerSettings,
                    className: 'border-t border-white/10 pt-6'
                },
                {
                    id: 'legend-offset',
                    title: 'Position Offset',
                    content: legend.position_offset,
                    className: 'border-t border-white/10 pt-6'
                }
            ],
            toggle: {
                value: settings.legend.show,
                onChange: (value: boolean) => onChange({ ...settings, legend: { ...settings.legend, show: value } })
            }
        }
    ];

    return (
        <RightPanel
            blocks={blocks}
            highlightSignals={highlightSignals}
        />
    );
}