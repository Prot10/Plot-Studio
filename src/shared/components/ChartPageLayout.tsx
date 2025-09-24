import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';

interface ChartPageLayoutProps {
    left: ReactNode;
    center: ReactNode;
    right: ReactNode;
}

/**
 * Responsive chart page layout that adapts based on screen size.
 * 
 * Desktop (xl+): Left | Center | Right (3-column grid)
 * Mobile/Tablet: Center -> Right -> Left (single column, center-first)
 */
export function ChartPageLayout({ left, center, right }: ChartPageLayoutProps) {
    return (
        <main className="w-full flex-1 px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,5fr)_minmax(0,3fr)]">
                {/* Center Panel - First on mobile, center on desktop */}
                <div className="flex flex-col gap-4 sm:gap-6 xl:col-start-2 xl:row-start-1 min-w-0">
                    {center}
                </div>

                {/* Right Panel - Second on mobile, right on desktop */}
                <div className="flex flex-col gap-4 sm:gap-6 xl:col-start-3 xl:row-start-1 min-w-0">
                    {right}
                </div>

                {/* Left Panel - Last on mobile, left on desktop */}
                <div className="flex flex-col gap-4 sm:gap-6 xl:col-start-1 xl:row-start-1 min-w-0">
                    {left}
                </div>
            </div>
        </main>
    );
}

interface ChartPageBlockProps {
    title: string;
    children: ReactNode;
    defaultExpanded?: boolean;
    highlighted?: boolean;
    className?: string;
    bodyClassName?: string;
    actions?: ReactNode;
}

export function ChartPageBlock({
    title,
    children,
    defaultExpanded = false,
    highlighted = false,
    className,
    bodyClassName,
    actions,
}: ChartPageBlockProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const contentId = useId();

    const sectionClassName = useMemo(
        () =>
            classNames(
                'rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 shadow-xl backdrop-blur transition w-full max-w-full overflow-hidden',
                highlighted && 'highlight-pulse',
                className,
            ),
        [className, highlighted],
    );

    const toggle = () => {
        setExpanded((current) => !current);
    };

    useEffect(() => {
        if (highlighted && !expanded) {
            setExpanded(true);
        }
    }, [highlighted, expanded]);

    return (
        <section className={sectionClassName}>
            <header className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4">
                <h2 className="text-base sm:text-lg font-semibold text-white truncate">
                    {title}
                </h2>
                <div className="flex items-center gap-2 shrink-0">
                    {actions ?? null}
                    <button
                        type="button"
                        onClick={toggle}
                        className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition hover:bg-white/20"
                        aria-expanded={expanded}
                        aria-controls={contentId}
                    >
                        <svg
                            className={classNames('h-3 w-3 sm:h-4 sm:w-4 transition-transform', expanded ? 'rotate-180' : 'rotate-0')}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                </div>
            </header>
            {expanded ? (
                <div
                    id={contentId}
                    className={classNames(
                        'border-t border-white/5 px-4 sm:px-5 pb-4 sm:pb-5 pt-3 sm:pt-4 max-w-full overflow-x-auto',
                        bodyClassName
                    )}
                >
                    {children}
                </div>
            ) : null}
        </section>
    );
}

function classNames(...values: Array<string | false | null | undefined>) {
    return values.filter(Boolean).join(' ');
}
