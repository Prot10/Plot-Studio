import type { ReactNode } from 'react';
import { TitleSettingsPanel } from '../components/TitleSettingsPanel';
import { AxisSyncButton } from '../components/AxisSyncButton';
import type { FocusRequest } from '../../types/base';

export interface LeftPanelBlock {
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

// Convenience function to create title block
export function createTitleBlock<TSettings extends {
    title: string;
    titleFontSize: number;
    titleOffsetY: number;
    titleOffsetX: number;
    titleColor: string;
    titleFontFamily: string;
    titleIsBold: boolean;
    titleIsItalic: boolean;
    titleIsUnderline: boolean;
    subtitle: string;
    subtitleFontSize: number;
    subtitleOffsetY: number;
    subtitleOffsetX: number;
    subtitleColor: string;
    subtitleFontFamily: string;
    subtitleIsBold: boolean;
    subtitleIsItalic: boolean;
    subtitleIsUnderline: boolean;
}>(
    settings: TSettings,
    onChange: (settings: TSettings) => void,
    focusRequest?: FocusRequest | null,
    highlightSignal?: number
): LeftPanelBlock {
    return {
        id: 'title-subtitle',
        title: 'Title & Subtitle',
        highlightKey: 'title',
        sections: [{
            id: 'title-content',
            content: (
                <TitleSettingsPanel
                    settings={settings}
                    onChange={onChange}
                    focusRequest={focusRequest}
                    highlightSignal={highlightSignal}
                />
            )
        }]
    };
}

// Convenience function to create axis sync button
export function createAxisSyncButton(isActive: boolean, onToggle: () => void): ReactNode {
    return <AxisSyncButton isActive={isActive} onToggle={onToggle} />;
}