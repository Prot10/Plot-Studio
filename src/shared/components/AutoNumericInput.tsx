import { useState } from 'react';

type AutoNumericInputProps = {
    title: string;
    value: number | null;
    onChange: (value: number | null) => void;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    suffix?: string;
    autoValue?: number; // The computed auto value to display when locked
    placeholder?: string;
    disabled?: boolean;
}

function LockIcon({ locked }: { locked: boolean }) {
    if (locked) {
        return (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        );
    }
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
    );
}

export function AutoNumericInput({
    title,
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    precision = 0,
    suffix = '',
    autoValue,
    placeholder = 'auto',
    disabled = false
}: AutoNumericInputProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');

    const isAuto = value === null;
    const displayValue = isAuto ? autoValue ?? 0 : value;
    const isLocked = isAuto;

    const formatValue = (val: number) => {
        return val.toFixed(precision);
    };

    const handleLockToggle = () => {
        if (disabled) return;
        if (isAuto) {
            // Unlock: set to current auto value or middle of range
            const newValue = autoValue ?? (min + max) / 2;
            onChange(newValue);
        } else {
            // Lock: set to auto (null)
            onChange(null);
        }
    };

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (isAuto || disabled) return;
        const newValue = Number.parseFloat(event.target.value);
        if (!Number.isNaN(newValue)) {
            onChange(newValue);
        }
    };

    const handleValueClick = () => {
        if (isAuto || disabled) return;
        setIsEditing(true);
        setEditValue(formatValue(displayValue));
    };

    const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(event.target.value);
    };

    const handleEditSubmit = () => {
        const newValue = Number.parseFloat(editValue);
        if (!Number.isNaN(newValue)) {
            const clampedValue = Math.max(min, Math.min(max, newValue));
            onChange(clampedValue);
        }
        setIsEditing(false);
    };

    const handleEditKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleEditSubmit();
        } else if (event.key === 'Escape') {
            setIsEditing(false);
        }
    };

    const handleEditBlur = () => {
        handleEditSubmit();
    };

    return (
        <div className={`flex flex-col gap-1 text-sm text-white ${disabled ? 'opacity-50' : ''}`}>
            <span className="text-xs uppercase tracking-wide text-white/50">{title}</span>
            <div className="h-9 rounded-md border border-white/10 bg-white/10 px-3 flex items-center gap-3">
                {/* Lock Button */}
                <button
                    type="button"
                    onClick={handleLockToggle}
                    disabled={disabled}
                    className={`flex-none p-1 rounded transition-colors ${disabled ? 'cursor-not-allowed' : ''} ${isLocked
                        ? 'text-orange-400 hover:text-orange-300'
                        : 'text-sky-400 hover:text-sky-300'
                        }`}
                    title={disabled ? 'Disabled' : isLocked ? 'Auto mode - click to unlock' : 'Manual mode - click to lock'}
                >
                    <LockIcon locked={isLocked} />
                </button>

                {/* Slider */}
                <div className="flex-1 flex items-center">
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={displayValue}
                        onChange={handleSliderChange}
                        disabled={isAuto || disabled}
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer
              bg-gradient-to-r from-white/20 to-white/30
              shadow-inner shadow-black/20
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-gradient-to-br
              [&::-webkit-slider-thumb]:from-sky-400
              [&::-webkit-slider-thumb]:to-sky-500
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-white/30
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:shadow-sky-500/40
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-all
              [&::-webkit-slider-thumb]:duration-150
              ${!isAuto && !disabled ? '[&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:shadow-xl [&::-webkit-slider-thumb]:hover:shadow-sky-400/50' : ''}
              disabled:cursor-not-allowed
              disabled:opacity-50
            `}
                    />
                </div>

                {/* Value Display */}
                <div className="flex-shrink-0">
                    {isAuto ? (
                        <span className="text-sm text-white/60 font-medium min-w-[3rem] text-center">
                            {autoValue !== undefined ? formatValue(autoValue) + suffix : placeholder}
                        </span>
                    ) : isEditing ? (
                        <input
                            type="number"
                            value={editValue}
                            onChange={handleEditChange}
                            onKeyDown={handleEditKeyDown}
                            onBlur={handleEditBlur}
                            min={min}
                            max={max}
                            step={step}
                            autoFocus
                            className="w-16 px-1 py-1 text-sm text-white text-center
                bg-transparent border-b border-sky-400/50 rounded-none
                focus:outline-none focus:border-sky-400
                [&::-webkit-outer-spin-button]:appearance-none
                [&::-webkit-inner-spin-button]:appearance-none
                [-moz-appearance:textfield]"
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={handleValueClick}
                            disabled={disabled}
                            className={`text-sm font-medium text-center min-w-[3rem] transition-colors duration-200
                ${disabled ? 'cursor-not-allowed' : 'hover:text-sky-300 cursor-pointer'} text-white`}
                        >
                            {formatValue(displayValue)}
                            {suffix && <span className="text-white/60 ml-1">{suffix}</span>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}