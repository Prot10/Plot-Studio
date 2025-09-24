import type { LucideIcon } from 'lucide-react';
import type { ChartAction } from '../components/ChartActionMenu';

/**
 * Utility for creating action menu items
 */
export function createChartAction(
    id: string,
    label: string,
    icon: LucideIcon,
    onClick: () => void,
    disabled?: boolean
): ChartAction {
    return {
        id,
        label,
        icon,
        onClick,
        disabled,
    };
}