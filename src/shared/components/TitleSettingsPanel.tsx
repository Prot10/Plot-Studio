import { useEffect, useRef } from 'react'
import type { FocusRequest } from '../../types/base'
import { useHighlightEffect } from '../hooks/useHighlightEffect'
import { NumericInput } from './NumericInput'
import { ColorField } from './ColorField'
import { TextStyleControls } from './TextStyleControls'
import { TextInput } from './TextInput'

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
  subtitle: string
  subtitleFontSize: number
  subtitleOffsetY: number
  subtitleOffsetX: number
  subtitleColor: string
  subtitleFontFamily: string
  subtitleIsBold: boolean
  subtitleIsItalic: boolean
  subtitleIsUnderline: boolean
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
  const subtitleRef = useRef<HTMLInputElement | null>(null)
  const handledFocusRef = useRef(0)
  const highlight = useHighlightEffect(highlightSignal)

  const update = <K extends keyof TSettings>(key: K, value: TSettings[K]) => {
    onChange({ ...settings, [key]: value })
  }

  const handleTitleStyleChange = (next: { bold: boolean; italic: boolean; underline: boolean }) => {
    onChange({
      ...settings,
      titleIsBold: next.bold,
      titleIsItalic: next.italic,
      titleIsUnderline: next.underline,
    })
  }

  const handleSubtitleStyleChange = (next: { bold: boolean; italic: boolean; underline: boolean }) => {
    onChange({
      ...settings,
      subtitleIsBold: next.bold,
      subtitleIsItalic: next.italic,
      subtitleIsUnderline: next.underline,
    })
  }

  useEffect(() => {
    if (!focusRequest) return
    if (focusRequest.requestId === handledFocusRef.current) return
    if (focusRequest.target.type !== 'chartTitle' && focusRequest.target.type !== 'chartSubtitle') return

    const input = focusRequest.target.type === 'chartTitle' ? titleRef.current : subtitleRef.current
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
    <section className={classNames('space-y-10', highlight ? 'highlight-pulse' : null, className)}>
      <div className="space-y-8">
        <h3 className="text-sm font-semibold text-white/80">Title</h3>
        <div className="grid gap-8 sm:grid-cols-3">
          <TextInput
            ref={titleRef}
            label="Title text"
            value={settings.title}
            onChange={(value) => update('title', value)}
            placeholder="Untitled chart"
          />
          <ColorField
            label="Title color"
            value={settings.titleColor}
            onChange={(value) => update('titleColor', value)}
          />
          <TextStyleControls
            label="Title style"
            value={{
              bold: settings.titleIsBold,
              italic: settings.titleIsItalic,
              underline: settings.titleIsUnderline,
            }}
            onChange={handleTitleStyleChange}
          />
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div className="min-w-[12rem] flex-1 sm:flex-none">
            <NumericInput
              title="Size"
              value={settings.titleFontSize}
              min={10}
              max={96}
              step={1}
              precision={0}
              onChange={(value) => update('titleFontSize', value)}
              suffix="px"
            />
          </div>
          <NumericInput
            title="Vertical offset"
            value={settings.titleOffsetY}
            min={-200}
            max={200}
            step={1}
            precision={0}
            onChange={(value) => update('titleOffsetY', value)}
            suffix="px"
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
          />
        </div>
      </div>

      <div className="space-y-8 border-t border-white/10 pt-8">
        <h3 className="text-sm font-semibold text-white/80">Subtitle</h3>
        <div className="grid gap-8 sm:grid-cols-3">
          <TextInput
            ref={subtitleRef}
            label="Subtitle text"
            value={settings.subtitle}
            onChange={(value) => update('subtitle', value)}
            placeholder="Add a subtitle"
          />
          <ColorField
            label="Subtitle color"
            value={settings.subtitleColor}
            onChange={(value) => update('subtitleColor', value)}
          />
          <TextStyleControls
            label="Subtitle style"
            value={{
              bold: settings.subtitleIsBold,
              italic: settings.subtitleIsItalic,
              underline: settings.subtitleIsUnderline,
            }}
            onChange={handleSubtitleStyleChange}
          />
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div className="min-w-[12rem] flex-1 sm:flex-none">
            <NumericInput
              title="Size"
              value={settings.subtitleFontSize}
              min={8}
              max={72}
              step={1}
              precision={0}
              onChange={(value) => update('subtitleFontSize', value)}
              suffix="px"
            />
          </div>
          <NumericInput
            title="Vertical offset"
            value={settings.subtitleOffsetY}
            min={-200}
            max={200}
            step={1}
            precision={0}
            onChange={(value) => update('subtitleOffsetY', value)}
            suffix="px"
          />
          <NumericInput
            title="Horizontal offset"
            value={settings.subtitleOffsetX}
            min={-400}
            max={400}
            step={1}
            precision={0}
            onChange={(value) => update('subtitleOffsetX', value)}
            suffix="px"
          />
        </div>
      </div>
    </section>
  )
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
