import type { ReactNode } from 'react';
import { BlockGroup } from './BlockGroups';

export interface DataEditorBlockProps {
    title?: string;
    children: ReactNode;
    defaultExpanded?: boolean;
    className?: string;
    bodyClassName?: string;
    actions?: ReactNode;
    headerActions?: ReactNode;
}

export function DataEditorBlock({
    title = 'Data Editor',
    children,
    defaultExpanded = false,
    className,
    bodyClassName,
    actions,
    headerActions
}: DataEditorBlockProps) {
    return (
        <BlockGroup
            title={title}
            sections={[{
                id: 'data-editor-content',
                content: children
            }]}
            defaultExpanded={defaultExpanded}
            className={className}
            bodyClassName={bodyClassName}
            actions={actions}
            headerActions={headerActions}
        />
    );
}