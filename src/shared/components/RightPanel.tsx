import type { ReactNode } from 'react';
import { BlockGroup } from './BlockGroups';
import type { HighlightKey } from '../../types/base';

export interface RightPanelBlock {
    id: string;
    title: string;
    sections: Array<{
        id: string;
        title?: string;
        content: ReactNode;
        className?: string;
        disabled?: boolean;
        toggle?: {
            value: boolean;
            onChange: (value: boolean) => void;
        };
    }>;
    defaultExpanded?: boolean;
    actions?: ReactNode;
    headerActions?: ReactNode;
    highlightKey?: string;
}

export interface RightPanelProps {
    blocks: RightPanelBlock[];
    highlightSignals?: Partial<Record<HighlightKey, number>>;
}

export function RightPanel({ blocks, highlightSignals }: RightPanelProps) {
    return (
        <>
            {blocks.map((block) => (
                <BlockGroup
                    key={block.id}
                    title={block.title}
                    sections={block.sections}
                    defaultExpanded={block.defaultExpanded}
                    highlighted={block.highlightKey ? !!(highlightSignals?.[block.highlightKey as HighlightKey]) : false}
                    actions={block.actions}
                    headerActions={block.headerActions}
                    bodyClassName="space-y-4"
                />
            ))}
        </>
    );
}