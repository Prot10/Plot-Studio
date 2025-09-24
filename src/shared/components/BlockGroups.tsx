import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { useHighlightEffect } from '../hooks/useHighlightEffect';

interface BlockSection {
    id: string;
    title?: string;
    content: ReactNode;
    className?: string;
    disabled?: boolean;
}

interface BlockGroupProps {
    title: string;
    sections: BlockSection[];
    defaultExpanded?: boolean;
    highlighted?: boolean;
    className?: string;
    bodyClassName?: string;
    actions?: ReactNode;
    headerActions?: ReactNode; // Actions that appear in the first row of content (like sync button)
}

export function BlockGroup({
    title,
    sections,
    defaultExpanded = false,
    highlighted = false,
    className,
    bodyClassName,
    actions,
    headerActions,
}: BlockGroupProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const contentId = useId();
    const highlightEffect = useHighlightEffect(highlighted ? 1 : 0);

    const sectionClassName = useMemo(
        () =>
            classNames(
                'rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 shadow-xl backdrop-blur transition w-full max-w-full overflow-hidden',
                highlightEffect && 'highlight-pulse',
                className,
            ),
        [className, highlightEffect],
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
                    <div className="space-y-8">
                        {/* Header actions (like sync button) appear first */}
                        {headerActions && (
                            <div className="flex justify-start">
                                {headerActions}
                            </div>
                        )}

                        {/* Render sections */}
                        {sections.map((section, index) => (
                            <div key={section.id} className={classNames(
                                section.className,
                                section.disabled && 'opacity-50 pointer-events-none',
                                index > 0 && section.title && 'border-t border-white/10 pt-8'
                            )}>
                                {section.title && (
                                    <h3 className="text-sm font-semibold text-white/80 mb-8">
                                        {section.title}
                                    </h3>
                                )}
                                {section.content}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </section>
    );
}

function classNames(...values: Array<string | false | null | undefined>) {
    return values.filter(Boolean).join(' ');
}