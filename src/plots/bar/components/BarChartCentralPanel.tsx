import { BlockGroup } from '../../../shared/components/BlockGroups';
import { ChartPreviewBlock } from '../../../shared/components/ChartPreviewBlock';
import { DataEditorBlock } from '../../../shared/components/DataEditorBlock';
import { ChartPreview } from './CentralPanel/ChartPreview';
import { DataTable } from './CentralPanel/DataTable';
import type { BarChartSettings, BarDataPoint } from '../../../types/bar';
import type { FocusTarget, HighlightKey, PaletteKey } from '../../../types/base';

export type ChartPreviewAction = 'importData' | 'exportChart';

export interface ChartPreviewProps {
    settings: BarChartSettings;
    onUpdateSettings: (settings: BarChartSettings) => void;
    onHighlight: (keys: HighlightKey[]) => void;
    onRequestFocus: (target: FocusTarget) => void;
    actionRequest?: ChartPreviewAction | null;
    onActionHandled?: () => void;
    heading?: string;
    isActive?: boolean;
    onActivate?: () => void;
    comparisonEnabled?: boolean;
}

export interface DataTableProps {
    data: BarDataPoint[];
    paletteName: PaletteKey;
    onChange: (data: BarDataPoint[]) => void;
    onDesignBar?: (barIndex: number) => void;
}

export interface BarChartCentralPanelProps {
    chartPreview: ChartPreviewProps[];
    dataTable: DataTableProps;
}

export function BarChartCentralPanel({ chartPreview, dataTable }: BarChartCentralPanelProps) {
    const chartPreviewBlock = {
        id: 'chart-preview-container',
        title: 'Chart Preview',
        defaultExpanded: true,
        sections: [{
            id: 'chart-preview-content',
            content: (
                <div className={chartPreview.length > 1 ? 'space-y-4 sm:space-y-6' : undefined}>
                    {chartPreview.map((previewProps, index) => {
                        const { heading, ...chartPreviewProps } = previewProps;
                        return (
                            <ChartPreviewBlock
                                key={`preview-${index}`}
                                chartElement={<ChartPreview {...chartPreviewProps} />}
                                heading={heading}
                                isActive={previewProps.isActive}
                                onActivate={previewProps.onActivate}
                                comparisonEnabled={previewProps.comparisonEnabled}
                            />
                        );
                    })}
                </div>
            )
        }]
    };

    return (
        <div className="flex flex-col gap-4 sm:gap-6">
            <BlockGroup
                title={chartPreviewBlock.title}
                sections={chartPreviewBlock.sections}
                defaultExpanded={chartPreviewBlock.defaultExpanded}
                className="w-full max-w-full overflow-hidden"
            />
            <DataEditorBlock
                title="Data Editor"
                defaultExpanded={false}
                className="w-full max-w-full overflow-hidden"
            >
                <DataTable {...dataTable} />
            </DataEditorBlock>
        </div>
    );
}