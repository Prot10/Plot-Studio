import type { ReactNode } from 'react';

type ToggleProps = {
    title: string;
    value: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
    children?: ReactNode;
}

export function Toggle({ title, value, onChange, disabled, children }: ToggleProps) {
    const handleClick = () => {
        if (disabled) return;
        onChange(!value);
    };

    return (
        <div className={`flex flex-col gap-1 text-sm text-white ${disabled ? 'opacity-60' : ''}`}>
            <span className="text-xs uppercase tracking-wide text-white/50">{title}</span>
            <div className="h-9 rounded-md border border-white/10 bg-white/10 px-3 flex items-center justify-start">
                <button
                    type="button"
                    onClick={handleClick}
                    className={`relative inline-flex h-5 w-9 flex-none items-center rounded-full transition ${value ? 'bg-sky-400' : 'bg-white/20'
                        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                    role="switch"
                    aria-checked={value}
                    aria-disabled={disabled}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${value ? 'translate-x-4' : 'translate-x-0.5'
                            }`}
                    />
                </button>
                {children && <div className="ml-2">{children}</div>}
            </div>
        </div>
    );
}