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
    toggle?: {
        value: boolean;
        onChange: (value: boolean) => void;
    };
}

export interface RightPanelProps {
    blocks: RightPanelBlock[];
    highlightSignals?: Partial<Record<HighlightKey, number>>;
}

export function RightPanel({ blocks, highlightSignals }: RightPanelProps) {
    return (
        <>
            {blocks.map((block) => {
                const hasBlockToggle = block.toggle !== undefined
                const blockToggleValue = block.toggle?.value ?? true

                const blockSections = hasBlockToggle
                    ? block.sections.map((section, index) => {
                        if (index === 0) {
                            return section
                        }
                        return {
                            ...section,
                            disabled: !blockToggleValue
                        }
                    })
                    : block.sections

                const blockActions = hasBlockToggle && block.toggle ? (
                    <button
                        type="button"
                        onClick={() => {
                            if (block.toggle) {
                                block.toggle.onChange(!block.toggle.value)
                            }
                        }}
                        className={`relative inline-flex h-4 w-8 flex-none items-center rounded-full transition ${blockToggleValue ? 'bg-sky-400' : 'bg-white/20'}`}
                        role="switch"
                        aria-checked={blockToggleValue}
                    >
                        <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${blockToggleValue ? 'translate-x-4' : 'translate-x-0.5'}`}
                        />
                    </button>
                ) : block.actions

                return (
                    <BlockGroup
                        key={block.id}
                        title={block.title}
                        sections={blockSections}
                        defaultExpanded={block.defaultExpanded}
                        highlighted={block.highlightKey ? !!(highlightSignals?.[block.highlightKey as HighlightKey]) : false}
                        actions={blockActions}
                        headerActions={block.headerActions}
                        bodyClassName="space-y-4"
                    />
                )
            })}
        </>
    );
}