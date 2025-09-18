import { useEffect, useRef } from 'react'
import type { FocusRequest } from '../../types/base'
import { useHighlightEffect } from '../hooks/useHighlightEffect'
import { NumericInput } from './NumericInput'
import { ColorField } from './ColorField'
import { FontPicker } from './FontPicker'
import { TextStyleControls } from './TextStyleControls'
import { DEFAULT_FONT_OPTIONS, DEFAULT_FONT_STACK } from '../constants/fonts'

type TitleSettingsShape = {
  title: string
  titleFontSize: number
  titleOffsetY: number
  titleColor: string
  titleFontFamily: string
  titleIsBold: boolean
  titleIsItalic: boolean
  titleIsUnderline: boolean
}

type TitleSettingsPanelProps<TSettings extends TitleSettingsShape> = {
  settings: TSettings
  onChange: (settings: TSettings) => void
  highlightSignal?: number
  focusRequest?: FocusRequest | null
  className?: string
}

export function TitleSettingsPanel<TSettings extends TitleSettingsShape>({
  settings,
  onChange,
  highlightSignal,
  focusRequest,
  className,
}: TitleSettingsPanelProps<TSettings>) {
  const titleRef = useRef<HTMLInputElement | null>(null)
  const handledFocusRef = useRef(0)
  const highlight = useHighlightEffect(highlightSignal)

  const update = <K extends keyof TSettings>(key: K, value: TSettings[K]) => {
    onChange({ ...settings, [key]: value })
  }

  const handleStyleChange = (next: { bold: boolean; italic: boolean; underline: boolean }) => {
    onChange({
      ...settings,
      titleIsBold: next.bold,
      titleIsItalic: next.italic,
      titleIsUnderline: next.underline,
    })
  }

  useEffect(() => {
    if (!focusRequest) return
    if (focusRequest.requestId === handledFocusRef.current) return
    if (focusRequest.target.type !== 'chartTitle') return

    const input = titleRef.current
    if (!input) return

    handledFocusRef.current = focusRequest.requestId
    try {
      input.focus({ preventScroll: true })
    } catch {
      input.focus()
    }
    input.select()
    if (typeof input.scrollIntoView === 'function') {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [focusRequest])

  return (
    <section className={classNames('space-y-3', highlight ? 'highlight-pulse' : null, className)}>
      <label className="flex flex-col gap-1 text-sm text-white">
        <span className="text-xs uppercase tracking-wide text-white/50">Text</span>
        <input
          ref={titleRef}
          type="text"
          value={settings.title}
          onChange={(event) => update('title', event.target.value)}
          className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
          placeholder="Untitled chart"
        />
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <NumericInput
          title="Font size"
          value={settings.titleFontSize}
          min={10}
          max={96}
          step={1}
          precision={0}
          onChange={(value) => update('titleFontSize', value)}
          suffix="px"
        />
        <NumericInput
          title="Vertical offset"
          value={settings.titleOffsetY}
          min={-200}
          max={200}
          step={1}
          precision={0}
          onChange={(value) => update('titleOffsetY', value)}
          suffix="px"
          description="Positive moves down"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <TextStyleControls
          value={{
            bold: settings.titleIsBold,
            italic: settings.titleIsItalic,
            underline: settings.titleIsUnderline,
          }}
          onChange={handleStyleChange}
        />
        <FontPicker
          className="min-w-[12rem] flex-1"
          value={settings.titleFontFamily || DEFAULT_FONT_STACK}
          onChange={(value) => update('titleFontFamily', value)}
          options={DEFAULT_FONT_OPTIONS}
        />
      </div>
      <ColorField
        label="Title color"
        value={settings.titleColor}
        onChange={(value) => update('titleColor', value)}
      />
    </section>
  )
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
