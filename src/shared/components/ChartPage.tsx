import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { ChartActionMenu, type ChartAction } from './ChartActionMenu';

export interface ChartPageProps {
    // Page metadata
    title: string;
    subtitle: string;

    // Panel content
    leftPanel: ReactNode;
    centerPanel: ReactNode;
    rightPanel: ReactNode;

    // Action menu
    actions?: ChartAction[];

    // Comparison support (optional)
    comparison?: {
        comparisonEnabled: boolean;
        activePlot: 0 | 1;
        onToggleComparison: (enabled: boolean) => void;
        onSelectPlot: (plot: 0 | 1) => void;
    };
}

/**
 * Generic, responsive chart page layout component that adapts based on screen size.
 * 
 * Desktop layout (xl screens and above):
 * - 3-column grid: LeftPanel | CenterPanel | RightPanel
 * 
 * Mobile/Tablet layout (below xl):
 * - Single column: CenterPanel -> RightPanel -> LeftPanel
 */
export function ChartPage({
    title,
    subtitle,
    leftPanel,
    centerPanel,
    rightPanel,
    actions = [],
    comparison,
}: ChartPageProps) {
    const navigate = useNavigate();

    const handleBackClick = useCallback(() => {
        navigate('/');
    }, [navigate]);

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur">
                <div className="w-full px-4 sm:px-6 py-6 sm:py-8">
                    {/* Title row with home icon on left, title centered, and logo on right */}
                    <div className="flex items-center justify-between mb-2">
                        {/* Home button on the left */}
                        <button
                            onClick={handleBackClick}
                            className="flex items-center justify-center p-2 text-white/80 hover:text-white"
                            title="Home"
                        >
                            <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>

                        {/* Title centered */}
                        <h1 className="text-xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white">
                            {title}
                        </h1>

                        {/* Logo on the right */}
                        <div className="flex items-center">
                            <img src="/chart-icon.svg" alt="Chart Studio" className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                    </div>

                    {/* Subtitle centered below */}
                    <div className="text-center">
                        <p className="text-sm sm:text-base lg:text-lg text-white/60">
                            {subtitle}
                        </p>
                    </div>
                </div>
            </header>

            {/* Main content with responsive layout */}
            <main className="w-full flex-1 px-4 sm:px-6 py-6 sm:py-8">
                <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,5fr)_minmax(0,3fr)]">

                    {/* Center Panel - First on mobile, center on desktop */}
                    <div className="flex flex-col gap-4 sm:gap-6 xl:col-start-2 xl:row-start-1 min-w-0">
                        {/* Action Menu */}
                        {actions.length > 0 && (
                            <ChartActionMenu
                                actions={actions}
                                comparison={comparison}
                            />
                        )}

                        {/* Center Panel Content */}
                        <div className="space-y-4 sm:space-y-6 min-w-0">
                            {centerPanel}
                        </div>
                    </div>

                    {/* Right Panel - Second on mobile, right on desktop */}
                    <div className="flex flex-col gap-4 sm:gap-6 xl:col-start-3 xl:row-start-1 min-w-0">
                        {rightPanel}
                    </div>

                    {/* Left Panel - Last on mobile, left on desktop */}
                    <div className="flex flex-col gap-4 sm:gap-6 xl:col-start-1 xl:row-start-1 min-w-0">
                        {leftPanel}
                    </div>

                </div>
            </main>
        </div>
    );
}

/**
 * Utility component for creating responsive chart page blocks
 */
export interface ResponsiveChartBlockProps {
    title: string;
    children: ReactNode;
    highlighted?: boolean;
    className?: string;
    bodyClassName?: string;
    actions?: ReactNode;
}

export function ResponsiveChartBlock({
    title,
    children,
    highlighted = false,
    className,
    bodyClassName,
    actions,
}: ResponsiveChartBlockProps) {
    return (
        <section
            className={`
        rounded-xl sm:rounded-2xl 
        border border-white/10 
        bg-black/30 
        shadow-xl 
        backdrop-blur 
        transition-all
        w-full
        max-w-full
        overflow-hidden
        ${highlighted ? 'highlight-pulse' : ''}
        ${className || ''}
      `.trim()}
        >
            <header className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4">
                <h2 className="text-base sm:text-lg font-semibold text-white truncate">
                    {title}
                </h2>
                {actions && (
                    <div className="flex items-center gap-2 shrink-0">
                        {actions}
                    </div>
                )}
            </header>

            <div className={`
        border-t border-white/5 
        px-4 sm:px-5 
        pb-4 sm:pb-5 
        pt-3 sm:pt-4
        max-w-full
        overflow-x-auto
        ${bodyClassName || ''}
      `.trim()}>
                {children}
            </div>
        </section>
    );
}

