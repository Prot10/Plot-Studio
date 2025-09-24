import { CentralPanel, type CentralPanelBlock } from '../../../shared/components/CentralPanel';
import { createChartPreviewBlock, type ChartPreviewBlockProps } from './CentralPanel/ChartPreviewBlock';
import { createDataTableBlock, type DataTableBlockProps } from './CentralPanel/DataTableBlock';

export interface BarChartCentralPanelProps {
    chartPreview: ChartPreviewBlockProps[];
    dataTable: DataTableBlockProps;
}

export function BarChartCentralPanel({ chartPreview, dataTable }: BarChartCentralPanelProps) {
    const blocks: CentralPanelBlock[] = [
        // Chart preview block - can have multiple previews for comparison
        {
            id: 'chart-preview-container',
            content: (
                <div className={chartPreview.length > 1 ? 'space-y-4 sm:space-y-6' : undefined}>
                    {chartPreview.map((previewProps, index) => (
                        <div key={`preview-${index}`}>
                            {createChartPreviewBlock(previewProps).content}
                        </div>
                    ))}
                </div>
            ),
            className: 'w-full max-w-full overflow-hidden'
        },

        // Data table block
        {
            ...createDataTableBlock(dataTable),
            className: 'w-full max-w-full overflow-hidden'
        }
    ];

    return <CentralPanel blocks={blocks} />;
}