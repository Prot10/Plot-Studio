import { BlockGroup } from '../../../shared/components/BlockGroups';
import { createChartPreviewBlock, type ChartPreviewBlockProps } from './CentralPanel/ChartPreviewBlock';
import { createDataTableBlock, type DataTableBlockProps } from './CentralPanel/DataTableBlock';

export interface BarChartCentralPanelProps {
    chartPreview: ChartPreviewBlockProps[];
    dataTable: DataTableBlockProps;
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
                    {chartPreview.map((previewProps, index) => (
                        <div key={`preview-${index}`}>
                            {createChartPreviewBlock(previewProps).content}
                        </div>
                    ))}
                </div>
            )
        }]
    };

    const dataTableBlock = createDataTableBlock(dataTable);

    return (
        <div className="flex flex-col gap-4 sm:gap-6">
            <BlockGroup
                title={chartPreviewBlock.title}
                sections={chartPreviewBlock.sections}
                defaultExpanded={chartPreviewBlock.defaultExpanded}
                className="w-full max-w-full overflow-hidden"
            />
            <BlockGroup
                title={dataTableBlock.title}
                sections={dataTableBlock.sections}
                defaultExpanded={dataTableBlock.defaultExpanded}
                className="w-full max-w-full overflow-hidden"
            />
        </div>
    );
}