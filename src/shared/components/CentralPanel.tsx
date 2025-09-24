import type { ReactNode } from 'react';

export interface CentralPanelBlock {
    id: string;
    title?: string;
    content: ReactNode;
    className?: string;
    actions?: ReactNode;
}

export interface CentralPanelProps {
    blocks: CentralPanelBlock[];
    className?: string;
}

export function CentralPanel({ blocks, className = '' }: CentralPanelProps) {
    return (
        <div className={`flex flex-col gap-4 sm:gap-6 ${className}`}>
            {blocks.map((block) => (
                <section
                    key={block.id}
                    className={`rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 shadow-xl backdrop-blur ${block.className || ''}`}
                >
                    {block.title && (
                        <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5">
                            <h2 className="text-base sm:text-lg font-semibold text-white truncate">
                                {block.title}
                            </h2>
                            {block.actions && (
                                <div className="flex items-center gap-2 shrink-0">
                                    {block.actions}
                                </div>
                            )}
                        </header>
                    )}
                    <div className={`${block.title ? '' : 'p-4 sm:p-6'} ${block.title ? 'p-4 sm:p-6' : ''} w-full max-w-full overflow-hidden`}>
                        {block.content}
                    </div>
                </section>
            ))}
        </div>
    );
}