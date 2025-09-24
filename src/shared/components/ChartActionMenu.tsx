import { Eraser, GitCompare } from 'lucide-react'
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
  comparison?: {
    comparisonEnabled: boolean
    activePlot: 0 | 1
    onToggleComparison: (enabled: boolean) => void
    onSelectPlot: (plot: 0 | 1) => void
  }
}

export function ChartActionMenu({ actions, className, comparison }: ChartActionMenuProps) {
  const uploadAction = actions.find((action) => action.id === 'upload')
  const themeAction = actions.find((action) => action.id === 'theme-toggle')
  const exportAction = actions.find((action) => action.id === 'export')
  const cleanActions = actions.filter((action) => action.id.startsWith('clean-'))

  return (
    <section
      className={classNames(
        'rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 shadow-xl backdrop-blur w-full max-w-full overflow-hidden',
        className,
      )}
    >
      <div className="px-4 sm:px-5 py-3 sm:py-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {uploadAction ? <IconButton key={uploadAction.id} action={uploadAction} /> : null}
          {comparison ? (
            <ComparisonGroup
              comparisonEnabled={comparison.comparisonEnabled}
              activePlot={comparison.activePlot}
              onToggleComparison={comparison.onToggleComparison}
              onSelectPlot={comparison.onSelectPlot}
            />
          ) : null}
          {themeAction ? <IconOnlyButton key={themeAction.id} action={themeAction} /> : null}
          {cleanActions.length ? <CleanGroup actions={cleanActions} /> : null}
          {exportAction ? <IconButton key={exportAction.id} action={exportAction} /> : null}
        </div>
      </div>
    </section>
  )
}

function IconButton({ action }: { action: ChartAction }) {
  const { label, icon: Icon, onClick, disabled } = action
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="group flex h-10 sm:h-12 flex-1 min-w-[6rem] sm:min-w-[8rem] items-center justify-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 text-xs sm:text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-105 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  )
}

function IconOnlyButton({ action }: { action: ChartAction }) {
  const { label, icon: Icon, onClick, disabled } = action
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="group flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-105" />
    </button>
  )
}

type ComparisonGroupProps = {
  comparisonEnabled: boolean
  activePlot: 0 | 1
  onToggleComparison: (enabled: boolean) => void
  onSelectPlot: (plot: 0 | 1) => void
}

function ComparisonGroup({ comparisonEnabled, activePlot, onToggleComparison, onSelectPlot }: ComparisonGroupProps) {
  const baseButtonClasses =
    'flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
  const inactiveClasses = 'text-white/70 hover:text-white hover:bg-white/10'
  const activeClasses = 'bg-sky-500/20 text-white'

  return (
    <div className="flex flex-1 min-w-[10rem] sm:min-w-[14rem] h-10 sm:h-12">
      <div className="inline-flex w-full overflow-hidden rounded-lg sm:rounded-xl border border-white/10 bg-white/5 text-white shadow-sm">
        <button
          type="button"
          className={classNames(
            'inline-flex items-center justify-center gap-1 sm:gap-2 border-r border-white/10',
            baseButtonClasses,
            comparisonEnabled ? activeClasses : inactiveClasses,
          )}
          aria-pressed={comparisonEnabled}
          onClick={() => onToggleComparison(!comparisonEnabled)}
        >
          <GitCompare className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
        <button
          type="button"
          className={classNames(
            'inline-flex items-center justify-center gap-1 sm:gap-2 border-r border-white/10',
            baseButtonClasses,
            activePlot === 0 ? activeClasses : inactiveClasses,
          )}
          aria-pressed={activePlot === 0}
          onClick={() => onSelectPlot(0)}
        >
          <span className="hidden sm:inline">Plot </span>1
        </button>
        <button
          type="button"
          className={classNames(
            'inline-flex items-center justify-center gap-1 sm:gap-2',
            baseButtonClasses,
            activePlot === 1 ? activeClasses : inactiveClasses,
          )}
          aria-pressed={activePlot === 1}
          onClick={() => onSelectPlot(1)}
        >
          <span className="hidden sm:inline">Plot </span>2
        </button>
      </div>
    </div>
  )
}

type CleanGroupProps = {
  actions: ChartAction[]
}

function CleanGroup({ actions }: CleanGroupProps) {
  const baseButtonClasses =
    'flex-1 h-10 sm:h-12 px-3 sm:px-4 text-xs sm:text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
  const inactiveClasses = 'text-white/70 hover:text-white hover:bg-white/10'

  return (
    <div className="flex flex-1 min-w-[9rem] sm:min-w-[14rem] h-10 sm:h-12">
      <div className="inline-flex w-full overflow-hidden rounded-lg sm:rounded-xl border border-white/10 bg-white/5 text-white shadow-sm">
        {actions.map(({ id, label, icon: OverlayIcon, onClick, disabled }, index) => {
          const showOverlay = id === 'clean-data' || id === 'clean-settings'
          return (
            <button
              key={id}
              type="button"
              title={label}
              aria-label={label}
              onClick={onClick}
              disabled={disabled}
              className={classNames(
                'inline-flex items-center justify-center gap-1 sm:gap-2',
                baseButtonClasses,
                index < actions.length - 1 ? 'border-r border-white/10' : null,
                disabled ? 'opacity-60' : inactiveClasses,
              )}
            >
              <div className="relative flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center">
                <Eraser className="h-4 w-4 sm:h-5 sm:w-5" />
                {showOverlay && OverlayIcon ? (
                  <OverlayIcon className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-black/80 p-[1px]" />
                ) : null}
              </div>
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
