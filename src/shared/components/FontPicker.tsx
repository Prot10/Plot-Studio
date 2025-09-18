import type { ReactNode } from 'react'
import { SelectField, type SelectOption } from './SelectField'
import {
  DEFAULT_FONT_STACK,
  DEFAULT_FONT_OPTIONS,
} from '../constants/fonts'

type FontOption = {
  label: string
  value: string
}

type FontPickerProps = {
  label: string
  value: string | null
  onChange: (value: string) => void
  options?: FontOption[]
  placeholder?: string
  className?: string
}

export function FontPicker({ label, value, onChange, options = DEFAULT_FONT_OPTIONS, placeholder, className }: FontPickerProps) {
  const selectOptions: Array<SelectOption<string>> = options.map((option) => ({
    value: option.value,
    label: renderOption(option.label, option.value),
  }))

  const currentValue = value ?? DEFAULT_FONT_STACK

  return (
    <div className={`flex flex-col gap-1 text-sm text-white ${className || ''}`}>
      <span className="text-xs uppercase tracking-wide text-white/50">{label}</span>
      <SelectField<string>
        value={currentValue}
        onChange={onChange}
        options={selectOptions}
        placeholder={placeholder ?? 'Select font'}
      />
    </div>
  )
}

function renderOption(label: string, fontFamily: string): ReactNode {
  return (
    <span className="flex items-center" style={{ fontFamily }}>
      {label}
    </span>
  )
}
