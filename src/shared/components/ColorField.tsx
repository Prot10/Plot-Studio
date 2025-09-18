import { useRef } from 'react'
import type { ChangeEvent, InputHTMLAttributes } from 'react'

function normalizeColor(value: string) {
  const trimmed = value.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase()
  }
  return trimmed
}

function fallbackColor(value: string, fallback = '#000000') {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback
}

type ColorFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  inputProps?: InputHTMLAttributes<HTMLInputElement>
}

export function ColorField({ label, value, onChange, disabled, inputProps }: ColorFieldProps) {
  const colorInputRef = useRef<HTMLInputElement | null>(null)

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value.toUpperCase())
  }

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(normalizeColor(event.target.value))
  }

  const colorValue = fallbackColor(value, '#000000')

  return (
    <label className={`flex flex-col gap-1 text-sm text-white ${disabled ? 'opacity-60' : ''}`}>
      <span className="text-xs uppercase tracking-wide text-white/50">{label}</span>
      <div className="flex items-center gap-2">
        <div className="relative h-9 w-9 flex-none">
          <span
            aria-hidden="true"
            className="block h-full w-full rounded-md border border-white/10"
            style={{ backgroundColor: colorValue }}
          />
          <input
            ref={colorInputRef}
            type="color"
            value={colorValue}
            disabled={disabled}
            onChange={handleColorChange}
            aria-label={`Choose ${label.toLowerCase()} color`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={handleTextChange}
          placeholder="#000000"
          maxLength={7}
          className="flex-1 min-w-0 h-9 rounded-md border border-white/10 bg-white/10 px-3 py-2 font-mono text-xs uppercase tracking-wide text-white placeholder:text-white/40 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40 disabled:cursor-not-allowed disabled:bg-white/10"
          {...inputProps}
        />
      </div>
    </label>
  )
}

export default ColorField
