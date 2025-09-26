import { useEffect, useId, useMemo, useState, useRef, type ReactNode } from 'react';
import { useHighlightEffect } from '../hooks/useHighlightEffect';
import { Minimize2, Maximize2, Pin, PinOff } from 'lucide-react';

interface BlockSection {
    id: string;
    title?: string;
    content: ReactNode;
    className?: string;
    disabled?: boolean;
    toggle?: {
        value: boolean;
        onChange: (value: boolean) => void;
    };
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
    enableStickyMobile?: boolean;
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
    enableStickyMobile = false,
}: BlockGroupProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const [isSticky, setIsSticky] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [originalHeight, setOriginalHeight] = useState(0);
    const [isPinned, setIsPinned] = useState(false); // Manual pin control
    const [autoStickyTriggered, setAutoStickyTriggered] = useState(false); // Track if auto-sticky was triggered
    const [manualOverride, setManualOverride] = useState(false); // Track if user has manually controlled the pin
    const contentId = useId();
    const highlightEffect = useHighlightEffect(highlighted ? 1 : 0);
    const blockRef = useRef<HTMLElement>(null);

    // Scroll-based sticky functionality
    useEffect(() => {
        if (!enableStickyMobile) return;

        const block = blockRef.current;
        if (!block) return;

        // Store original height and position
        const updateHeight = () => {
            if (!isSticky && block.offsetHeight > 0) {
                setOriginalHeight(block.offsetHeight);
            }
        };

        updateHeight();

        let originalOffsetTop = 0;

        const updateOriginalPosition = () => {
            if (!isSticky) {
                originalOffsetTop = block.offsetTop;
            }
        };

        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Only on mobile screens
            if (window.innerWidth >= 1280) return; // xl breakpoint

            // If user has manually controlled the pin, disable all auto scroll behavior
            if (manualOverride) {
                console.log('Manual override active - ignoring scroll');
                return;
            }

            if (!isSticky && !isPinned) {
                updateOriginalPosition();

                // Make sticky when scrolled past the element (only if no manual override)
                if (scrollTop > originalOffsetTop) {
                    updateHeight();
                    setIsSticky(true);
                    setAutoStickyTriggered(true); // Mark that auto-sticky was triggered
                    console.log('Auto-made sticky at scroll:', scrollTop, 'element top:', originalOffsetTop);
                }
            } else if (isSticky && autoStickyTriggered && !isPinned) {
                // Only auto-return to normal if it was auto-triggered and not manually controlled
                if (scrollTop <= originalOffsetTop - 50) { // 50px buffer
                    setIsSticky(false);
                    setIsMinimized(false);
                    setAutoStickyTriggered(false);
                    console.log('Auto-made non-sticky at scroll:', scrollTop, 'element top:', originalOffsetTop);
                }
            }
        };

        // Initial position
        updateOriginalPosition();

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', updateOriginalPosition, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', updateOriginalPosition);
        };
    }, [enableStickyMobile, isSticky, isPinned, autoStickyTriggered, manualOverride]); const sectionClassName = useMemo(
        () =>
            classNames(
                'border border-white/10 shadow-xl backdrop-blur transition-all duration-300 ease-in-out w-full max-w-full overflow-hidden',
                // Regular styles when not sticky
                !isSticky && 'rounded-xl sm:rounded-2xl bg-black/30',
                // Sticky styles - only on mobile (xl:hidden ensures it's not sticky on desktop)
                enableStickyMobile && isSticky && 'xl:hidden fixed top-0 left-0 right-0 z-50 rounded-none border-b border-white/10 shadow-2xl bg-slate-950/99 backdrop-blur-xl',
                // Always relative on desktop - override sticky styles
                enableStickyMobile && 'xl:!relative xl:!top-auto xl:!left-auto xl:!right-auto xl:!z-auto xl:!rounded-xl xl:sm:!rounded-2xl xl:!border-white/10 xl:!bg-black/30 xl:!shadow-xl xl:!backdrop-blur',
                highlightEffect && 'highlight-pulse',
                className,
            ),
        [className, highlightEffect, enableStickyMobile, isSticky],
    );

    const toggle = () => {
        setExpanded((current) => !current);
    };

    const toggleMinimized = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMinimized(!isMinimized);
    };

    const togglePin = (e: React.MouseEvent) => {
        e.stopPropagation();

        // Mark that user has manually controlled the pin - this disables auto scroll behavior
        setManualOverride(true);

        if (isPinned || isSticky) {
            // DETACH: Return to normal visualization
            console.log('Manual detach - returning to normal');
            setIsPinned(false);
            setIsSticky(false);
            setIsMinimized(false);
            setAutoStickyTriggered(false);
        } else {
            // ATTACH: Make sticky (pin to top)
            console.log('Manual attach - making sticky');
            const block = blockRef.current;
            if (block && block.offsetHeight > 0) {
                setOriginalHeight(block.offsetHeight);
            }
            setIsPinned(true);
            setIsSticky(true);
        }
    };

    useEffect(() => {
        if (highlighted && !expanded) {
            setExpanded(true);
        }
    }, [highlighted, expanded]);

    return (
        <>
            {/* Spacer to prevent content jump when element becomes sticky */}
            {enableStickyMobile && isSticky && (
                <div
                    className="xl:hidden"
                    style={{ height: originalHeight > 0 ? `${originalHeight}px` : '280px' }}
                />
            )}

            <section
                ref={blockRef}
                className={sectionClassName}
            >
                <header className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4">
                    <h2 className={classNames(
                        'font-semibold text-white truncate',
                        enableStickyMobile && isSticky ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
                    )}>
                        {title}
                    </h2>
                    <div className="flex items-center gap-2 shrink-0">
                        {actions ?? null}

                        {/* Minimize button for sticky mobile */}
                        {enableStickyMobile && isSticky && (
                            <button
                                type="button"
                                onClick={toggleMinimized}
                                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 transition-all hover:bg-white/20 active:scale-95"
                                title={isMinimized ? 'Expand preview' : 'Minimize preview'}
                            >
                                {isMinimized ? (
                                    <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                ) : (
                                    <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                )}
                            </button>
                        )}

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
                            'border-t border-white/5 px-4 sm:px-5 pb-4 sm:pb-5 pt-3 sm:pt-4 max-w-full transition-all duration-300 ease-in-out',
                            // When sticky and minimized, hide content completely
                            enableStickyMobile && isSticky && isMinimized && 'xl:block !h-0 !p-0 !overflow-hidden opacity-0',
                            // When sticky and not minimized, limit height and enable scrolling
                            enableStickyMobile && isSticky && !isMinimized && 'xl:max-h-none xl:overflow-auto max-h-[50vh] min-h-[200px] overflow-y-auto overflow-x-hidden',
                            // Regular overflow handling
                            !isSticky && 'overflow-x-auto',
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
                            {sections.map((section, index) => {
                                const isActive = section.toggle ? section.toggle.value : true;
                                return (
                                    <div key={section.id} className={classNames(
                                        section.className,
                                        section.disabled && 'opacity-50 pointer-events-none',
                                        index > 0 && section.title && 'border-t border-white/10 pt-8'
                                    )}>
                                        {section.title && (
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className="text-sm font-semibold text-white/80">
                                                    {section.title}
                                                </h3>
                                                {section.toggle && (
                                                    <button
                                                        type="button"
                                                        onClick={() => section.toggle?.onChange(!section.toggle.value)}
                                                        className={`relative inline-flex h-4 w-8 flex-none items-center rounded-full transition ${section.toggle.value ? 'bg-sky-400' : 'bg-white/20'
                                                            }`}
                                                        role="switch"
                                                        aria-checked={section.toggle.value}
                                                    >
                                                        <span
                                                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${section.toggle.value ? 'translate-x-4' : 'translate-x-0.5'
                                                                }`}
                                                        />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {isActive && (
                                            <div className={classNames(
                                                'relative',
                                                // Add pin button for first section (chart preview) on mobile
                                                enableStickyMobile && index === 0 && 'xl:after:hidden after:content-[""] after:absolute after:top-2 after:right-2 after:z-10'
                                            )}>
                                                {/* Pin button for mobile - only on first section (chart preview) */}
                                                {enableStickyMobile && index === 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={togglePin}
                                                        className={classNames(
                                                            'xl:hidden absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border transition-all active:scale-95 hover:scale-105',
                                                            isPinned || isSticky
                                                                ? 'border-sky-400/60 bg-sky-400/20 text-sky-300 shadow-lg hover:bg-sky-400/30'
                                                                : 'border-white/20 bg-black/40 text-white/70 hover:bg-white/10 hover:border-white/40'
                                                        )}
                                                        title={isPinned || isSticky ? 'Detach preview (return to normal)' : 'Attach preview (pin to top)'}
                                                    >
                                                        {isPinned || isSticky ? (
                                                            <Pin className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <PinOff className="h-3.5 w-3.5" />
                                                        )}
                                                    </button>
                                                )}
                                                {section.content}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : null}
            </section>
        </>
    );
}

function classNames(...values: Array<string | false | null | undefined>) {
    return values.filter(Boolean).join(' ');
}