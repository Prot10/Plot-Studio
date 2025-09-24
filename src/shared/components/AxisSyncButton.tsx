function SyncIcon({ active }: { active: boolean }) {
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={active ? 2.5 : 2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
        </svg>
    );
}

type AxisSyncButtonProps = {
    isActive: boolean;
    onToggle: () => void;
}

export function AxisSyncButton({ isActive, onToggle }: AxisSyncButtonProps) {
    const baseClasses = 'flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors';
    const stateClasses = isActive
        ? ' border-sky-400 bg-sky-400/20 text-sky-100 shadow-sm'
        : ' border-white/10 bg-white/10 text-white/60 hover:bg-white/20 hover:text-white';

    return (
        <button
            type="button"
            onClick={onToggle}
            className={`${baseClasses}${stateClasses}`}
            title={isActive ? 'Axes are linked' : 'Link X and Y axes'}
        >
            <SyncIcon active={isActive} />
            <span>{isActive ? 'Axes style linked' : 'Link axes style'}</span>
        </button>
    );
}