import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';

interface ChartPageLayoutProps {
    left: ReactNode;
    center: ReactNode;
    right: ReactNode;
}

export function ChartPageLayout({ left, center, right }: ChartPageLayoutProps) {
    return (
        <main className="mx-auto w-full max-w-content flex-1 px-6 py-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,5fr)_minmax(0,3fr)]">
                <div className="flex flex-col gap-6">{left}</div>
                <div className="flex flex-col gap-6">{center}</div>
                <div className="flex flex-col gap-6">{right}</div>
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
}

export function ChartPageBlock({
    title,
    children,
    defaultExpanded = false,
    highlighted = false,
    className,
    bodyClassName,
}: ChartPageBlockProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const contentId = useId();

    const sectionClassName = useMemo(
        () =>
            classNames(
                'rounded-2xl border border-white/10 bg-black/30 shadow-xl backdrop-blur transition',
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
            <header className="flex items-center justify-between gap-3 px-5 py-4">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <button
                    type="button"
                    onClick={toggle}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition hover:bg-white/20"
                    aria-expanded={expanded}
                    aria-controls={contentId}
                >
                    <svg
                        className={classNames('h-4 w-4 transition-transform', expanded ? 'rotate-180' : 'rotate-0')}
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
            </header>
            {expanded ? (
                <div id={contentId} className={classNames('border-t border-white/5 px-5 pb-5 pt-4', bodyClassName)}>
                    {children}
                </div>
            ) : null}
        </section>
    );
}

function classNames(...values: Array<string | false | null | undefined>) {
    return values.filter(Boolean).join(' ');
}
