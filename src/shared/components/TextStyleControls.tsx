import { Bold, Italic, Underline } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type TextStyleState = {
  bold: boolean
  italic: boolean
  underline: boolean
}

type TextStyleControlsProps = {
  value: TextStyleState
  onChange: (next: TextStyleState) => void
  label: string
  className?: string
}

export function TextStyleControls({ value, onChange, label, className }: TextStyleControlsProps) {
  const toggles: Array<{ key: keyof TextStyleState; label: string; icon: LucideIcon }> = [
    { key: 'bold', label: 'Bold', icon: Bold },
    { key: 'italic', label: 'Italic', icon: Italic },
    { key: 'underline', label: 'Underline', icon: Underline },
  ]

  const handleToggle = (key: keyof TextStyleState) => {
    onChange({ ...value, [key]: !value[key] })
  }

  return (
    <div className={`flex flex-col gap-1 text-sm text-white ${className || ''}`}>
      <span className="text-xs uppercase tracking-wide text-white/50">{label}</span>
      <div
        className="flex overflow-hidden rounded-md border border-white/10 bg-white/10 text-white shadow-sm h-9"
      >
        {toggles.map(({ key, label, icon: Icon }, index) => {
          const active = value[key]
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleToggle(key)}
              aria-pressed={active}
              title={label}
              className={classNames(
                'flex flex-1 items-center justify-center border-r border-white/10 text-white transition focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/60',
                active ? 'bg-sky-500/20 text-white' : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white',
                index === toggles.length - 1 ? 'border-r-0' : null,
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="sr-only">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
