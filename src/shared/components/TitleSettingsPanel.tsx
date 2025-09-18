import { useEffect, useRef } from 'react'
import type { FocusRequest } from '../../types/base'
import { useHighlightEffect } from '../hooks/useHighlightEffect'
import { NumericInput } from './NumericInput'
import { ColorField } from './ColorField'
import { FontPicker } from './FontPicker'
import { TextStyleControls } from './TextStyleControls'
import { TextInput } from './TextInput'
import { DEFAULT_FONT_OPTIONS, DEFAULT_FONT_STACK } from '../constants/fonts'

type TitleSettingsShape = {
  title: string
  titleFontSize: number
  titleOffsetY: number
  titleOffsetX: number
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
    <section className={classNames('space-y-16', highlight ? 'highlight-pulse' : null, className)}>
      <div className="grid gap-16 sm:grid-cols-2">
        <TextInput
          ref={titleRef}
          label="Text"
          value={settings.title}
          onChange={(value) => update('title', value)}
          placeholder="Untitled chart"
        />
        <ColorField
          label="Color"
          value={settings.titleColor}
          onChange={(value) => update('titleColor', value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-8">
        <div className="min-w-[12rem] flex-1 sm:flex-none">
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
        </div>
        <TextStyleControls
          value={{
            bold: settings.titleIsBold,
            italic: settings.titleIsItalic,
            underline: settings.titleIsUnderline,
          }}
          onChange={handleStyleChange}
        />
        <FontPicker
          className="w-[12rem] flex-1"
          value={settings.titleFontFamily || DEFAULT_FONT_STACK}
          onChange={(value) => update('titleFontFamily', value)}
          options={DEFAULT_FONT_OPTIONS}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
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
        <NumericInput
          title="Horizontal offset"
          value={settings.titleOffsetX}
          min={-400}
          max={400}
          step={1}
          precision={0}
          onChange={(value) => update('titleOffsetX', value)}
          suffix="px"
          description="Positive moves right"
        />
      </div>
    </section>
  )
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
