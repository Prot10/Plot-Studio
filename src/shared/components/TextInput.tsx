import { forwardRef } from 'react'

type TextInputProps = {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    type?: string
    className?: string
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ label, value, onChange, placeholder, type = "text", className }, ref) => {
        return (
            <label className={`flex flex-col gap-1 text-sm text-white ${className || ''}`}>
                <span className="text-xs uppercase tracking-wide text-white/50">{label}</span>
                <input
                    ref={ref}
                    type={type}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-9 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
                    placeholder={placeholder}
                />
            </label>
        )
    }
)

TextInput.displayName = 'TextInput'