import type { LucideIcon } from 'lucide-react'

export type ChartAction = {
  id: string
  label: string
  icon: LucideIcon
  onClick: () => void
  disabled?: boolean
}

type ChartActionMenuProps = {
  actions: ChartAction[]
  className?: string
}

export function ChartActionMenu({ actions, className }: ChartActionMenuProps) {
  return (
    <section
      className={[
        'rounded-2xl border border-white/10 bg-black/30 shadow-xl backdrop-blur',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        {actions.map(({ id, label, icon: Icon, onClick, disabled }) => (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            onClick={onClick}
            disabled={disabled}
            className="group flex h-12 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon className="h-5 w-5 transition-transform group-hover:scale-105" />
            <span className="sr-only">{label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
