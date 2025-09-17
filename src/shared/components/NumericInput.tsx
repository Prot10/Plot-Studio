import { useState, type ChangeEvent, type KeyboardEvent } from 'react'

type NumericInputProps = {
    /** The label displayed above the input */
    title: string
    /** Current value */
    value: number
    /** Callback when value changes */
    onChange: (value: number) => void
    /** Minimum allowed value */
    min: number
    /** Maximum allowed value */
    max: number
    /** Step size for the slider */
    step: number
    /** Number of decimal places to display */
    precision?: number
    /** Optional suffix for the value display (e.g., "%", "px") */
    suffix?: string
    /** Optional description text below the title */
    description?: string
    /** Whether the input is disabled */
    disabled?: boolean
}

export function NumericInput({
    title,
    value,
    onChange,
    min,
    max,
    step,
    precision = 2,
    suffix = '',
    description,
    disabled = false,
}: NumericInputProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState('')

    // Clamp value to valid range
    const clampedValue = Math.max(min, Math.min(max, value))

    // Format value for display
    const formatValue = (val: number) => {
        return val.toFixed(precision)
    }

    const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (disabled) return
        const newValue = Number.parseFloat(event.target.value)
        if (!Number.isNaN(newValue)) {
            onChange(newValue)
        }
    }

    const handleValueClick = () => {
        if (disabled) return
        setIsEditing(true)
        setEditValue(formatValue(clampedValue))
    }

    const handleEditChange = (event: ChangeEvent<HTMLInputElement>) => {
        setEditValue(event.target.value)
    }

    const handleEditSubmit = () => {
        const newValue = Number.parseFloat(editValue)
        if (!Number.isNaN(newValue)) {
            // Clamp the new value to valid range
            const clampedNewValue = Math.max(min, Math.min(max, newValue))
            onChange(clampedNewValue)
        }
        setIsEditing(false)
    }

    const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleEditSubmit()
        } else if (event.key === 'Escape') {
            setIsEditing(false)
        }
    }

    const handleEditBlur = () => {
        handleEditSubmit()
    }

    return (
        <div className={`space-y-3 ${disabled ? 'opacity-60' : ''}`}>
            {/* Title */}
            <div>
                <h4 className="text-sm font-medium text-white">{title}</h4>
                {description && (
                    <p className="mt-1 text-xs text-white/60">{description}</p>
                )}
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-4">
                {/* Slider */}
                <div className="flex-1">
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={clampedValue}
                        onChange={handleSliderChange}
                        disabled={disabled}
                        className={`
              w-full h-2 rounded-lg appearance-none cursor-pointer
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
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-webkit-slider-thumb]:hover:shadow-xl
              [&::-webkit-slider-thumb]:hover:shadow-sky-400/50
              [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-gradient-to-br
              [&::-moz-range-thumb]:from-sky-400
              [&::-moz-range-thumb]:to-sky-500
              [&::-moz-range-thumb]:border-2
              [&::-moz-range-thumb]:border-white/30
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:transition-all
              [&::-moz-range-thumb]:duration-150
              [&::-moz-range-track]:bg-white/20
              [&::-moz-range-track]:rounded-lg
              [&::-moz-range-track]:h-2
              disabled:cursor-not-allowed
              disabled:opacity-50
            `}
                    />
                </div>

                {/* Value Display */}
                <div className="flex-shrink-0">
                    {isEditing ? (
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
                            className="
                w-20 px-3 py-2 text-sm text-white text-center
                bg-black/40 border border-sky-400/50 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-sky-400/40
                focus:border-sky-400
              "
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={handleValueClick}
                            disabled={disabled}
                            className={`
                group relative px-4 py-2 min-w-[5rem] text-sm font-medium text-center
                border border-white/20 rounded-lg
                transition-all duration-200 ease-out
                ${disabled
                                    ? 'cursor-not-allowed'
                                    : 'hover:border-white/30 cursor-pointer'
                                }
              `}
                        >
                            <span className="text-white">
                                {formatValue(clampedValue)}
                                {suffix && <span className="text-white/60 ml-1">{suffix}</span>}
                            </span>
                            {!disabled && (
                                <div className="
                  absolute inset-0 rounded-lg opacity-0 
                  bg-gradient-to-br from-sky-400/20 to-sky-500/20
                  transition-opacity duration-200
                  group-hover:opacity-100
                " />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Range indicator */}
            <div className="flex justify-between text-xs text-white/50 border-t border-white/10 pt-2">
                <span>{formatValue(min)}</span>
                <span>{formatValue(max)}</span>
            </div>
        </div>
    )
}