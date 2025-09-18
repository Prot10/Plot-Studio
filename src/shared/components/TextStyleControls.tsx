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
  className?: string
}

export function TextStyleControls({ value, onChange, className }: TextStyleControlsProps) {
  const toggles: Array<{ key: keyof TextStyleState; label: string; icon: LucideIcon }> = [
    { key: 'bold', label: 'Bold', icon: Bold },
    { key: 'italic', label: 'Italic', icon: Italic },
    { key: 'underline', label: 'Underline', icon: Underline },
  ]

  const handleToggle = (key: keyof TextStyleState) => {
    onChange({ ...value, [key]: !value[key] })
  }

  return (
    <div
      className={classNames(
        'inline-flex overflow-hidden rounded-xl border border-white/10 bg-white/5 text-white shadow-sm h-10',
        className,
      )}
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
              'flex w-12 items-center justify-center border-r border-white/10 text-white transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-sky-300',
              active ? 'bg-sky-500/20 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white',
              index === toggles.length - 1 ? 'border-r-0' : null,
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
