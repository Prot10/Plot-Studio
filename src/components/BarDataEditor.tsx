import { useEffect, useRef } from 'react'
import type { BarDatum, FocusRequest, PaletteKey } from '../types'
import { createBar } from '../utils/barFactory'
import { ColorField } from './ColorField'
import { useHighlightEffect } from '../hooks/useHighlightEffect'

type BarDataEditorProps = {
  bars: BarDatum[]
  paletteName: PaletteKey
  onChange: (bars: BarDatum[]) => void
  highlightSignal?: number
  focusRequest?: FocusRequest | null
}

const patternOptions: Array<{ value: BarDatum['pattern']; label: string }> = [
  { value: 'solid', label: 'Solid' },
  { value: 'diagonal', label: 'Diagonal lines' },
  { value: 'dots', label: 'Dots' },
  { value: 'crosshatch', label: 'Crosshatch' },
  { value: 'vertical', label: 'Vertical stripes' },
]
export function BarDataEditor({ bars, paletteName, onChange, highlightSignal, focusRequest }: BarDataEditorProps) {
  const highlight = useHighlightEffect(highlightSignal)
  const labelRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const valueRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const handledFocusRef = useRef(0)

  const focusInput = (input: HTMLInputElement | null | undefined) => {
    if (!input) return false
    try {
      input.focus({ preventScroll: true })
    } catch (error) {
      input.focus()
    }
    input.select()
    if (typeof input.scrollIntoView === 'function') {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return true
  }

  useEffect(() => {
    if (!focusRequest) return
    if (focusRequest.requestId === handledFocusRef.current) return

    if (focusRequest.target.type === 'barLabel') {
      const input = labelRefs.current[focusRequest.target.barId]
      if (focusInput(input)) {
        handledFocusRef.current = focusRequest.requestId
      }
      return
    }

    if (focusRequest.target.type === 'barValue') {
      const input = valueRefs.current[focusRequest.target.barId]
      if (focusInput(input)) {
        handledFocusRef.current = focusRequest.requestId
      }
    }
  }, [focusRequest])
  const handleFieldChange = (
    id: string,
    field: keyof Omit<BarDatum, 'id'>,
    rawValue: string,
  ) => {
    const nextBars = bars.map((bar) => {
      if (bar.id !== id) return bar

      if (
        field === 'value' ||
        field === 'error' ||
        field === 'opacity' ||
        field === 'borderWidth' ||
        field === 'patternOpacity' ||
        field === 'patternSize'
      ) {
        const numeric = Number.parseFloat(rawValue)
        if (Number.isNaN(numeric)) {
          if (field === 'patternSize') {
            return { ...bar, patternSize: 2 }
          }
          return { ...bar, [field]: 0 }
        }

        if (field === 'opacity') {
          const clamped = Math.min(Math.max(numeric, 0), 1)
          return { ...bar, opacity: clamped }
        }

        if (field === 'borderWidth') {
          const clamped = Math.max(numeric, 0)
          return { ...bar, borderWidth: clamped }
        }

        if (field === 'patternOpacity') {
          const clamped = Math.min(Math.max(numeric, 0), 1)
          return { ...bar, patternOpacity: clamped }
        }

        if (field === 'patternSize') {
          const clamped = Math.max(numeric, 2)
          return { ...bar, patternSize: clamped }
        }

        return { ...bar, [field]: numeric }
      }

      if (field === 'pattern') {
        return { ...bar, pattern: rawValue as BarDatum['pattern'] }
      }

      return { ...bar, [field]: rawValue }
    })

    onChange(nextBars)
  }

  const addBar = () => {
    const nextBar = createBar(bars.length, paletteName)
    onChange([...bars, nextBar])
  }

  const removeBar = (id: string) => {
    if (bars.length <= 1) return
    onChange(bars.filter((bar) => bar.id !== id))
  }

  const moveBar = (id: string, direction: -1 | 1) => {
    const index = bars.findIndex((bar) => bar.id === id)
    if (index === -1) return
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= bars.length) return

    const nextBars = [...bars]
    const [removed] = nextBars.splice(index, 1)
    nextBars.splice(targetIndex, 0, removed)
    onChange(nextBars)
  }

  return (
    <div className={`flex flex-col gap-4 ${highlight ? 'highlight-pulse' : ''}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Data</h2>
        <button
          type="button"
          onClick={addBar}
          className="rounded-md bg-sky-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
        >
          Add bar
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {bars.map((bar, index) => (
          <div
            key={bar.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white/70">#{index + 1}</span>
                <input
                  type="text"
                  value={bar.label}
                  onChange={(event) => handleFieldChange(bar.id, 'label', event.target.value)}
                  ref={(node) => {
                    if (node) {
                      labelRefs.current[bar.id] = node
                    } else {
                      delete labelRefs.current[bar.id]
                    }
                  }}
                  className="w-full rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveBar(bar.id, -1)}
                  className="rounded-md p-1 text-white/50 transition hover:text-white"
                  aria-label="Move bar up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveBar(bar.id, 1)}
                  className="rounded-md p-1 text-white/50 transition hover:text-white"
                  aria-label="Move bar down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeBar(bar.id)}
                  className="rounded-md p-1 text-white/50 transition hover:text-rose-300"
                  aria-label="Remove bar"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm text-white/80">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-white/50">Value</span>
                  <input
                    type="number"
                    value={bar.value}
                    min={0}
                    step={0.1}
                    onChange={(event) => handleFieldChange(bar.id, 'value', event.target.value)}
                    ref={(node) => {
                      if (node) {
                        valueRefs.current[bar.id] = node
                      } else {
                        delete valueRefs.current[bar.id]
                      }
                    }}
                    className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                  />
                </label>
                <ColorField
                  label="Fill"
                  value={bar.fillColor}
                  onChange={(next) => handleFieldChange(bar.id, 'fillColor', next)}
                />
                <ColorField
                  label="Border"
                  value={bar.borderColor}
                  onChange={(next) => handleFieldChange(bar.id, 'borderColor', next)}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <label className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-white/50">Error ±</span>
                  <input
                    type="number"
                    value={bar.error}
                    min={0}
                    step={0.1}
                    onChange={(event) => handleFieldChange(bar.id, 'error', event.target.value)}
                    className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-white/50">Border width</span>
                  <input
                    type="number"
                    value={bar.borderWidth}
                    min={0}
                    max={20}
                    step={0.5}
                    onChange={(event) => handleFieldChange(bar.id, 'borderWidth', event.target.value)}
                    className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-white/50">Opacity</span>
                  <input
                    type="number"
                    value={bar.opacity}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(event) => handleFieldChange(bar.id, 'opacity', event.target.value)}
                    className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-white/50">Pattern</span>
                  <select
                    value={bar.pattern ?? 'solid'}
                    onChange={(event) => handleFieldChange(bar.id, 'pattern', event.target.value)}
                    className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                  >
                    {patternOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {bar.pattern !== 'solid' ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <ColorField
                    label="Pattern color"
                    value={bar.patternColor}
                    onChange={(next) => handleFieldChange(bar.id, 'patternColor', next)}
                  />
                  <label className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-white/50">Pattern opacity</span>
                    <input
                      type="number"
                      value={bar.patternOpacity}
                      min={0}
                      max={1}
                      step={0.05}
                      onChange={(event) => handleFieldChange(bar.id, 'patternOpacity', event.target.value)}
                      className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-white/50">Pattern size</span>
                    <input
                      type="number"
                      value={bar.patternSize}
                      min={2}
                      max={64}
                      step={1}
                      onChange={(event) => handleFieldChange(bar.id, 'patternSize', event.target.value)}
                      className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                    />
                    <span className="text-xs text-white/40">Higher values create larger pattern tiles</span>
                  </label>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BarDataEditor
