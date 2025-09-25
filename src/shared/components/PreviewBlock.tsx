import type { ReactNode } from 'react';

export interface PreviewBlockProps {
    children: ReactNode;
    heading?: string;
    isActive?: boolean;
    onActivate?: () => void;
    comparisonEnabled?: boolean;
    className?: string;
}

export function PreviewBlock({
    children,
    heading,
    isActive = true,
    onActivate,
    comparisonEnabled = false,
    className = ''
}: PreviewBlockProps) {
    const classNames = (...values: Array<string | false | null | undefined>) => {
        return values.filter(Boolean).join(' ');
    };

    return (
        <div className={`flex h-full flex-col gap-8 ${className}`}>
            {heading && (
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-white">{heading}</h2>
                </div>
            )}
            <div
                className={classNames(
                    'relative flex min-h-[280px] sm:min-h-[420px] flex-1 items-center justify-center transition w-full max-w-full overflow-hidden',
                    comparisonEnabled
                        ? classNames(
                            'border border-white/10',
                            isActive ? 'ring-2 ring-sky-400/70 border-sky-400/60' : 'border-white/10'
                        )
                        : 'rounded-2xl'
                )}
                onClick={onActivate}
            >
                {children}
            </div>
        </div>
    );
}