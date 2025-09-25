import { PreviewBlock, type PreviewBlockProps } from './PreviewBlock';

export interface ChartPreviewBlockProps extends Omit<PreviewBlockProps, 'children'> {
    chartElement: React.ReactNode;
}

export function ChartPreviewBlock({
    chartElement,
    heading = 'Live preview',
    ...previewProps
}: ChartPreviewBlockProps) {
    return (
        <PreviewBlock heading={heading} {...previewProps}>
            {chartElement}
        </PreviewBlock>
    );
}