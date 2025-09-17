import { useCallback, useEffect, useRef, useState } from 'react'
import { BarDataEditor } from './components/BarDataEditor'
import { ChartBasicsPanel } from './components/ChartBasicsPanel'
import { ChartControlsPanel } from './components/ChartControlsPanel'
import { ChartPreview } from './components/ChartPreview'
import { defaultSettings } from './defaultSettings'
import type { BarDatum, ChartSettings, HighlightKey, FocusRequest, FocusTarget } from './types'
import { createBar } from './utils/barFactory'
import useHighlightEffect from './hooks/useHighlightEffect'

const STORAGE_KEY = 'barplot-studio-state-v1'

function App() {
  const [settings, setSettings] = useState<ChartSettings>(defaultSettings)
  const [isHydrated, setIsHydrated] = useState(false)
  const [highlightSignals, setHighlightSignals] = useState<Record<HighlightKey, number>>({
    chartBasics: 0,
    yAxis: 0,
    xAxis: 0,
    data: 0,
    barDesign: 0,
    valueLabels: 0,
    errorBars: 0,
  })
  const focusRequestIdRef = useRef(0)
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || isHydrated) return

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        setIsHydrated(true)
        return
      }

      const parsed = JSON.parse(stored)
      const storedSettings: Partial<ChartSettings> | undefined =
        parsed?.settings ?? parsed

      if (!storedSettings || typeof storedSettings !== 'object') {
        setIsHydrated(true)
        return
      }

      const mergedPalette = storedSettings.paletteName ?? defaultSettings.paletteName

      const mergedBarsSource = Array.isArray(storedSettings.bars)
        ? storedSettings.bars
        : defaultSettings.bars

      const mergedBars = mergedBarsSource.map((bar, index) => {
        const defaults = createBar(index, mergedPalette)
        return {
          ...defaults,
          ...bar,
          fillColor: bar?.fillColor ?? defaults.fillColor,
          borderColor: bar?.borderColor ?? defaults.borderColor,
          borderWidth: typeof bar?.borderWidth === 'number' ? bar.borderWidth : defaults.borderWidth,
          opacity: typeof bar?.opacity === 'number' ? bar.opacity : defaults.opacity,
          error: typeof bar?.error === 'number' ? bar.error : defaults.error,
          pattern: (bar?.pattern as BarDatum['pattern']) ?? defaults.pattern,
          patternColor: typeof bar?.patternColor === 'string' ? bar.patternColor : defaults.patternColor,
          patternOpacity:
            typeof bar?.patternOpacity === 'number' ? bar.patternOpacity : defaults.patternOpacity,
          patternSize: typeof bar?.patternSize === 'number' ? bar.patternSize : defaults.patternSize,
        }
      })

      const mergedSettings: ChartSettings = {
        ...defaultSettings,
        ...storedSettings,
        paletteName: mergedPalette,
        bars: mergedBars,
      }

      setSettings(mergedSettings)
    } catch (error) {
      console.warn('Failed to load saved chart state', error)
    } finally {
      setIsHydrated(true)
    }
  }, [isHydrated])

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings }))
    } catch (error) {
      console.warn('Failed to save chart state', error)
    }
  }, [settings, isHydrated])

  const triggerHighlight = useCallback((keys: HighlightKey[]) => {
    if (!keys.length) return
    setHighlightSignals((prev) => {
      const next = { ...prev }
      keys.forEach((key) => {
        next[key] = (prev[key] ?? 0) + 1
      })
      return next
    })
  }, [])

  const requestFocus = useCallback((target: FocusTarget) => {
    focusRequestIdRef.current += 1
    setFocusRequest({ target, requestId: focusRequestIdRef.current })
  }, [])

  const basicsHighlight = useHighlightEffect(highlightSignals.chartBasics)
  const dataHighlight = useHighlightEffect(highlightSignals.data)
  const controlsHighlightSignal =
    (highlightSignals.barDesign ?? 0) +
    (highlightSignals.valueLabels ?? 0) +
    (highlightSignals.errorBars ?? 0) +
    (highlightSignals.xAxis ?? 0) +
    (highlightSignals.yAxis ?? 0)
  const controlsSignalValue = controlsHighlightSignal === 0 ? undefined : controlsHighlightSignal
  const controlsHighlight = useHighlightEffect(controlsSignalValue)

  const handleBarsChange = (bars: BarDatum[]) => {
    setSettings((current) => ({ ...current, bars }))
  }

  const handleSettingsChange = (nextSettings: ChartSettings) => {
    setSettings(nextSettings)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto w-full max-w-content px-6 py-8 text-center text-white">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Barplot Studio</h1>
          <p className="mt-2 text-base text-white/60 sm:text-lg">
            Build expressive bar charts with precise control over every detail.
          </p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-content flex-1 px-6 py-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(360px,460px)_minmax(520px,_1fr)_minmax(320px,380px)]">
          <div className="flex flex-col gap-6">
            <section
              className={`rounded-2xl border border-white/10 bg-black/30 p-5 shadow-xl backdrop-blur ${basicsHighlight ? 'highlight-pulse' : ''}`}
            >
              <ChartBasicsPanel
                settings={settings}
                bars={settings.bars}
                onChange={handleSettingsChange}
                onBarsChange={handleBarsChange}
                highlightSignals={highlightSignals}
                focusRequest={focusRequest}
              />
            </section>
            <section
              className={`rounded-2xl border border-white/10 bg-black/30 p-5 shadow-xl backdrop-blur ${dataHighlight ? 'highlight-pulse' : ''}`}
            >
              <BarDataEditor
                bars={settings.bars}
                paletteName={settings.paletteName}
                onChange={handleBarsChange}
                highlightSignal={highlightSignals.data}
                focusRequest={focusRequest}
              />
            </section>
          </div>
          <section className="rounded-3xl border border-white/10 bg-black/50 p-6 shadow-2xl backdrop-blur">
            <ChartPreview
              settings={settings}
              onUpdateSettings={setSettings}
              onHighlight={triggerHighlight}
              onRequestFocus={requestFocus}
            />
          </section>
          <section
            className={`rounded-2xl border border-white/10 bg-black/30 p-5 shadow-xl backdrop-blur ${controlsHighlight ? 'highlight-pulse' : ''}`}
          >
            <ChartControlsPanel
              settings={settings}
              onChange={handleSettingsChange}
              highlightSignals={highlightSignals}
              focusRequest={focusRequest}
            />
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
