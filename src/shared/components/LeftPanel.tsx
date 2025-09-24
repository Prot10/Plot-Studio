import { BlockGroup } from './BlockGroups';
import type { LeftPanelBlock } from '../utils/leftPanelHelpers';
import type { FocusRequest, HighlightKey } from '../../types/base';

export interface LeftPanelProps {
    blocks: LeftPanelBlock[];
    highlightSignals?: Partial<Record<HighlightKey, number>>;
    focusRequest?: FocusRequest | null;
}

export function LeftPanel({ blocks, highlightSignals }: LeftPanelProps) {
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