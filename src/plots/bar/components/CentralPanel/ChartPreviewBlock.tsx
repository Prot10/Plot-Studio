import { ChartPreview } from './ChartPreview';
import type { BarChartSettings } from '../../../../types/bar';
import type { FocusTarget, HighlightKey } from '../../../../types/base';

export type ChartPreviewAction = 'importData' | 'exportChart';

export interface ChartPreviewBlockProps {
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

export function createChartPreviewBlock(props: ChartPreviewBlockProps) {
    return {
        id: 'chart-preview',
        content: <ChartPreview {...props} />
    };
}