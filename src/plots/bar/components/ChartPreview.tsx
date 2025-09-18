import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { DEFAULT_FONT_STACK } from '../../../shared/constants/fonts'
import useElementSize from '../../../shared/hooks/useElementSize'
import type { BarChartSettings, BarDataPoint } from '../../../types/bar'
import type { FocusTarget, HighlightKey } from '../../../types/base'
import { DataImportDialog } from './DataImportDialog'

type ChartPreviewAction = 'importData' | 'exportChart'

type ChartPreviewProps = {
  settings: BarChartSettings
  onUpdateSettings: (settings: BarChartSettings) => void
  onHighlight: (keys: HighlightKey[]) => void
  onRequestFocus: (target: FocusTarget) => void
  actionRequest?: ChartPreviewAction | null
  onActionHandled?: () => void
  heading?: string
  isActive?: boolean
  onActivate?: () => void
}

type ExportFormat = 'png' | 'svg' | 'pdf'

type ExportOptions = {
  format: ExportFormat
  fileName: string
  scale: number
  transparent: boolean
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

function createBarPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  style: BarChartSettings['barCornerStyle'],
) {
  const r = Math.max(Math.min(radius, width / 2, height / 2), 0)
  if (r === 0) return ''

  if (style === 'both') {
    return [
      `M ${x + r} ${y}`,
      `H ${x + width - r}`,
      `Q ${x + width} ${y} ${x + width} ${y + r}`,
      `V ${y + height - r}`,
      `Q ${x + width} ${y + height} ${x + width - r} ${y + height}`,
      `H ${x + r}`,
      `Q ${x} ${y + height} ${x} ${y + height - r}`,
      `V ${y + r}`,
      `Q ${x} ${y} ${x + r} ${y}`,
      'Z',
    ].join(' ')
  }

  return [
    `M ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `H ${x + width - r}`,
    `Q ${x + width} ${y} ${x + width} ${y + r}`,
    `V ${y + height}`,
    `H ${x}`,
    'Z',
  ].join(' ')
}

function generateTicksRange(minValue: number, maxValue: number, count = 6) {
  if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
    return [0, 1]
  }

  if (minValue === maxValue) {
    const step = Math.abs(minValue) > 1 ? Math.abs(minValue) * 0.2 : 1
    return [minValue - step, minValue + step]
  }

  const niceNumber = (range: number, round: boolean) => {
    const exponent = Math.floor(Math.log10(range))
    const fraction = range / 10 ** exponent
    let niceFraction: number

    if (round) {
      if (fraction < 1.5) niceFraction = 1
      else if (fraction < 3) niceFraction = 2
      else if (fraction < 7) niceFraction = 5
      else niceFraction = 10
    } else {
      if (fraction <= 1) niceFraction = 1
      else if (fraction <= 2) niceFraction = 2
      else if (fraction <= 5) niceFraction = 5
      else niceFraction = 10
    }

    return niceFraction * 10 ** exponent
  }

  const rawRange = maxValue - minValue
  const niceRange = niceNumber(Math.abs(rawRange), false)
  const spacing = niceNumber(niceRange / Math.max(count - 1, 1), true)
  const niceMin = Math.floor(minValue / spacing) * spacing
  const niceMax = Math.ceil(maxValue / spacing) * spacing

  const ticks: number[] = []
  for (let tick = niceMin; tick <= niceMax + spacing / 2; tick += spacing) {
    ticks.push(Number.parseFloat(tick.toPrecision(12)))
  }

  return ticks
}

export function ChartPreview({
  settings,
  onUpdateSettings,
  onHighlight,
  onRequestFocus,
  actionRequest,
  onActionHandled,
  heading,
  isActive = true,
  onActivate,
}: ChartPreviewProps) {
  const [wrapperRef, size] = useElementSize<HTMLDivElement>()
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png')
  const [exportFileName, setExportFileName] = useState(settings.exportFileName)
  const [exportScale, setExportScale] = useState(settings.exportScale)
  const [exportTransparent, setExportTransparent] = useState(settings.exportTransparent)

  useEffect(() => {
    setExportFileName(settings.exportFileName)
    setExportScale(settings.exportScale)
    setExportTransparent(settings.exportTransparent)
  }, [settings.exportFileName, settings.exportScale, settings.exportTransparent])

  useEffect(() => {
    if (!actionRequest) return
    if (actionRequest === 'importData') {
      setIsImportDialogOpen(true)
    } else if (actionRequest === 'exportChart') {
      setIsExportDialogOpen(true)
    }
    onActionHandled?.()
  }, [actionRequest, onActionHandled])

  const customWidth = settings.customWidth && settings.customWidth > 0 ? settings.customWidth : null
  const customHeight = settings.customHeight && settings.customHeight > 0 ? settings.customHeight : null
  const measuredWidth = customWidth ?? (size.width > 0 ? size.width : 960)
  const aspectRatio = clamp(settings.aspectRatio ?? 0.6, 0.2, 2)
  const fallbackHeight = customHeight ?? Math.max(measuredWidth * aspectRatio, 320)
  const measuredHeight = customHeight ?? (size.width > 0 ? Math.max(size.width * aspectRatio, 320) : fallbackHeight)
  const minContainerHeight = customHeight ?? Math.max(320, measuredWidth * aspectRatio)

  const sendHighlight = (keys: HighlightKey[], event?: MouseEvent<SVGElement | HTMLDivElement>) => {
    if (event) {
      event.stopPropagation()
    }
    if (keys.length === 0) return
    onHighlight(keys)
  }

  const hasTitle = Boolean(settings.title)
  const hasSubtitle = Boolean(settings.subtitle)
  const headingGap = hasTitle && hasSubtitle ? Math.max(settings.subtitleFontSize * 0.5, 12) : 0
  const basePadding = settings.canvasPadding
  const margin = useMemo(() => {
    const titleBlock = hasTitle ? settings.titleFontSize * 1.6 : 0
    const subtitleBlock = hasSubtitle ? settings.subtitleFontSize * 1.4 : 0
    const topNegativeOffset = Math.max(
      hasTitle ? Math.max(-settings.titleOffsetY, 0) : 0,
      hasSubtitle ? Math.max(-settings.subtitleOffsetY, 0) : 0,
    )
    const topExtra = hasTitle || hasSubtitle ? titleBlock + subtitleBlock + headingGap + topNegativeOffset : 16
    const bottomExtra =
      (settings.xAxis.showTickLabels ? settings.axisTickFontSize + 24 : 16) +
      Math.max(settings.xAxisTitleOffsetY, 0)
    const leftExtra =
      (settings.yAxis.showTickLabels ? settings.axisTickFontSize + 28 : 16) +
      Math.max(-settings.yAxisTitleOffsetX, 0)
    const labelExtra = settings.valueLabelOffsetY < 0 ? Math.abs(settings.valueLabelOffsetY) : 0

    const top = clamp(basePadding + topExtra + labelExtra, 24, measuredHeight / 2 - 20)
    const bottom = clamp(basePadding + bottomExtra, 32, measuredHeight / 2 - 20)
    const left = clamp(basePadding + leftExtra, 32, measuredWidth / 2 - 20)
    const right = clamp(basePadding + 12, 24, measuredWidth / 2 - 20)

    return { top, right, bottom, left }
  }, [
    basePadding,
    hasSubtitle,
    hasTitle,
    headingGap,
    measuredHeight,
    measuredWidth,
    settings.axisTickFontSize,
    settings.subtitleFontSize,
    settings.subtitleOffsetY,
    settings.valueLabelOffsetY,
    settings.titleFontSize,
    settings.titleOffsetY,
    settings.xAxisTitleOffsetY,
    settings.xAxis.showTickLabels,
    settings.yAxisTitleOffsetX,
    settings.yAxis.showTickLabels,
  ])

  const chartBounds = {
    width: Math.max(measuredWidth - margin.left - margin.right, 120),
    height: Math.max(measuredHeight - margin.top - margin.bottom, 160),
  }

  const { dataMin, dataMax } = useMemo(() => {
    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY
    settings.data.forEach((bar) => {
      const lower = settings.showErrorBars ? bar.value - bar.error : bar.value
      const upper = settings.showErrorBars ? bar.value + bar.error : bar.value
      min = Math.min(min, lower)
      max = Math.max(max, upper)
    })

    if (!Number.isFinite(min)) min = 0
    if (!Number.isFinite(max)) max = 1

    return {
      dataMin: Math.min(min, 0),
      dataMax: max,
    }
  }, [settings.data, settings.showErrorBars])

  const { axisMin, axisMax, ticks } = useMemo(() => {
    const desiredMin = settings.yAxisMin ?? dataMin
    const desiredMax = settings.yAxisMax ?? Math.max(dataMax, dataMin + 1)

    let minValue = Number.isFinite(desiredMin) ? desiredMin : dataMin
    let maxValue = Number.isFinite(desiredMax) ? desiredMax : dataMax

    if (minValue === maxValue) {
      maxValue = minValue + 1
    }
    if (minValue > maxValue) {
      const temp = minValue
      minValue = maxValue
      maxValue = temp
    }

    let tickValues: number[]
    const step = settings.yAxisTickStep

    if (step && Number.isFinite(step) && step > 0) {
      const clampedStep = Math.max(step, Number.EPSILON)
      const firstTick = Math.ceil(minValue / clampedStep) * clampedStep
      const ticksArray: number[] = []
      for (let tick = firstTick; tick <= maxValue + clampedStep / 2; tick += clampedStep) {
        ticksArray.push(Number.parseFloat(tick.toFixed(6)))
      }
      if (ticksArray.length === 0 || ticksArray[0] > minValue) {
        ticksArray.unshift(Number.parseFloat(minValue.toFixed(6)))
      }
      if (ticksArray[ticksArray.length - 1] < maxValue) {
        ticksArray.push(Number.parseFloat(maxValue.toFixed(6)))
      }
      tickValues = ticksArray
    } else {
      tickValues = generateTicksRange(minValue, maxValue)
    }
    const finalMin = tickValues[0] ?? minValue
    const finalMax = tickValues[tickValues.length - 1] ?? maxValue

    return {
      axisMin: finalMin,
      axisMax: finalMax,
      ticks: tickValues.length > 0 ? tickValues : [finalMin, finalMax],
    }
  }, [settings.yAxisMin, settings.yAxisMax, settings.yAxisTickStep, dataMin, dataMax])

  const axisRange = Math.max(axisMax - axisMin, Number.EPSILON)

  const scaleY = (value: number) => {
    const ratio = clamp((value - axisMin) / axisRange, 0, 1)
    return chartBounds.height - ratio * chartBounds.height
  }

  const barLayout = useMemo(() => {
    const { data: bars, barGap, barBorderWidth, barOpacity } = settings
    const count = bars.length || 1
    const band = chartBounds.width / count
    const gap = band * clamp(barGap, 0, 0.9)
    const barWidth = Math.max(band - gap, 4)

    return bars.map((bar, index) => {
      const x = margin.left + band * index + (band - barWidth) / 2
      const valueRatio = clamp((bar.value - axisMin) / axisRange, 0, 1)
      const valueHeight = chartBounds.height * valueRatio
      const y = margin.top + chartBounds.height - valueHeight
      const opacity = Number.isFinite(bar.opacity) ? bar.opacity : barOpacity
      const borderWidth = Number.isFinite(bar.borderWidth) ? bar.borderWidth : barBorderWidth

      return {
        data: bar,
        x,
        y,
        width: barWidth,
        height: valueHeight,
        center: x + barWidth / 2,
        opacity: clamp(opacity, 0, 1),
        borderWidth,
      }
    })
  }, [settings, axisMin, axisRange, chartBounds.width, chartBounds.height, margin.left, margin.top])

  const toCanvasY = (value: number) => margin.top + scaleY(value)

  const axisStyles = {
    x: settings.xAxis,
    y: settings.yAxis,
  }

  const formatOptions: Array<{ value: ExportFormat; label: string; description: string }> = [
    { value: 'png', label: 'PNG', description: 'High-quality raster image with transparency support' },
    { value: 'svg', label: 'SVG', description: 'Scalable vector graphic for design tools' },
    { value: 'pdf', label: 'PDF', description: 'Printable document' },
  ]

  const defaultFontFamily = DEFAULT_FONT_STACK
  const titleColor = settings.titleColor ?? settings.textColor
  const titleFontFamily = settings.titleFontFamily || defaultFontFamily
  const titleFontWeight = settings.titleIsBold ? 700 : 500
  const titleFontStyle = settings.titleIsItalic ? 'italic' : 'normal'
  const titleTextDecoration = settings.titleIsUnderline ? 'underline' : 'none'
  const subtitleColor = settings.subtitleColor || settings.textColor
  const subtitleFontFamily = settings.subtitleFontFamily || defaultFontFamily
  const subtitleFontWeight = settings.subtitleIsBold ? 600 : 400
  const subtitleFontStyle = settings.subtitleIsItalic ? 'italic' : 'normal'
  const subtitleTextDecoration = settings.subtitleIsUnderline ? 'underline' : 'none'

  const chartAreaTop = margin.top
  const chartAreaBottom = margin.top + chartBounds.height
  const chartTitleOffset = clamp(settings.titleFontSize * 0.75, 12, Math.max(margin.top - 8, 12))
  const baseTitleY = margin.top - chartTitleOffset
  const chartTitleY = baseTitleY + settings.titleOffsetY
  const baseTitleX = measuredWidth / 2
  const chartTitleX = clamp(
    baseTitleX + (settings.titleOffsetX ?? 0),
    margin.left,
    measuredWidth - margin.right,
  )
  const subtitleBaseOffset = clamp(settings.subtitleFontSize * 0.6, 10, Math.max(margin.top - 8, 10))
  const baseSubtitleY = hasTitle
    ? chartTitleY + settings.titleFontSize + headingGap
    : margin.top - subtitleBaseOffset
  const chartSubtitleY = baseSubtitleY + settings.subtitleOffsetY
  const baseSubtitleX = measuredWidth / 2
  const chartSubtitleX = clamp(
    baseSubtitleX + (settings.subtitleOffsetX ?? 0),
    margin.left,
    measuredWidth - margin.right,
  )
  const baseXAxisTitleY = chartAreaBottom + settings.axisTitleFontSize + 12 + settings.xAxisTitleOffsetY
  const xAxisTitleY = clamp(baseXAxisTitleY, settings.axisTitleFontSize, measuredHeight - 8)
  const baseYAxisTitleX = Math.max(Math.min(margin.left - 24, 80), 16)
  const yAxisTitleX = clamp(baseYAxisTitleX + settings.yAxisTitleOffsetX, 8, margin.left + 160)
  const yAxisTitleY = chartAreaTop + chartBounds.height / 2
  const xTickBaseY = Math.min(chartAreaBottom + settings.axisTickFontSize + 6, measuredHeight - 4)

  const download = async (options: ExportOptions) => {
    if (!svgRef.current) return

    const serializer = new XMLSerializer()
    const clone = svgRef.current.cloneNode(true) as SVGSVGElement

    if (options.transparent) {
      const backgroundRect = clone.querySelector('[data-role="background"]') as SVGRectElement | null
      if (backgroundRect) {
        backgroundRect.setAttribute('fill', 'transparent')
      }
    }

    const source = serializer.serializeToString(clone)
    const encoded = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`

    const safeName = options.fileName.trim() || 'barplot'

    if (options.format === 'svg') {
      const link = document.createElement('a')
      link.href = encoded
      link.download = safeName.endsWith('.svg') ? safeName : `${safeName}.svg`
      link.click()
      return
    }

    const svgImage = new Image()
    const quality = clamp(options.scale ?? 1, 1, 6)
    const deviceScale = window.devicePixelRatio || 1
    const scale = quality * deviceScale

    await new Promise<void>((resolve, reject) => {
      svgImage.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = measuredWidth * scale
        canvas.height = measuredHeight * scale
        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('Unable to create canvas context'))
          return
        }
        context.scale(scale, scale)
        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = 'high'
        if (!options.transparent) {
          context.fillStyle = settings.backgroundColor
          context.fillRect(0, 0, measuredWidth, measuredHeight)
        } else {
          context.clearRect(0, 0, measuredWidth, measuredHeight)
        }
        context.drawImage(svgImage, 0, 0, measuredWidth, measuredHeight)

        if (options.format === 'png') {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to export PNG'))
              return
            }
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = safeName.endsWith('.png') ? safeName : `${safeName}.png`
            link.click()
            URL.revokeObjectURL(url)
            resolve()
          }, 'image/png')
          return
        }

        const dataUrl = canvas.toDataURL('image/png', 1)
          ; (async () => {
            const { default: jsPDF } = await import('jspdf')
            const pdf = new jsPDF({
              orientation: measuredWidth >= measuredHeight ? 'landscape' : 'portrait',
              unit: 'px',
              format: [measuredWidth, measuredHeight],
            })
            pdf.addImage(dataUrl, 'PNG', 0, 0, measuredWidth, measuredHeight)
            pdf.save(safeName.endsWith('.pdf') ? safeName : `${safeName}.pdf`)
            resolve()
          })().catch((error) => reject(error))
      }
      svgImage.onerror = () => reject(new Error('Failed to load SVG image'))
      svgImage.src = encoded
    })
  }

  const closeExportDialog = () => {
    if (isExporting) return
    setIsExportDialogOpen(false)
  }

  useEffect(() => {
    if (!isExportDialogOpen) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExportDialogOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
    }
  }, [isExportDialogOpen])

  const handleExportConfirm = async () => {
    if (isExporting) return
    const options: ExportOptions = {
      format: exportFormat,
      fileName: exportFileName.trim() || 'barplot',
      scale: exportScale,
      transparent: exportTransparent,
    }

    try {
      setIsExporting(true)
      onUpdateSettings({
        ...settings,
        exportScale: options.scale,
        exportFileName: options.fileName,
        exportTransparent: options.transparent,
      })
      await download(options)
      setIsExportDialogOpen(false)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportConfirm = (bars: BarDataPoint[]) => {
    setIsImportDialogOpen(false)
    if (!bars.length) return
    onUpdateSettings({
      ...settings,
      data: bars,
    })
    onHighlight(['data'])
  }

  const handleImportCancel = () => {
    setIsImportDialogOpen(false)
  }

  return (
    <>
      <div className="flex h-full flex-col gap-4" style={{ color: settings.textColor }}>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">{heading ?? 'Live preview'}</h2>
          <p className="text-sm text-white/60">
            Import data, fine-tune the design, and export the chart once it looks right.
          </p>
        </div>
        <div
          ref={wrapperRef}
          className={classNames(
            'relative flex min-h-[420px] flex-1 items-center justify-center rounded-2xl border border-white/10 transition',
            isActive ? 'ring-2 ring-sky-400/70 border-sky-400/60' : 'border-white/10',
          )}
          style={{ backgroundColor: settings.backgroundColor, minHeight: `${minContainerHeight}px` }}
          onClick={onActivate}
        >
          <svg
            ref={svgRef}
            width={measuredWidth}
            height={measuredHeight}
            viewBox={`0 0 ${measuredWidth} ${measuredHeight}`}
            role="img"
          >
            <title>{settings.title || 'Bar plot'}</title>
            <defs>
          <style>{`*{font-family:${defaultFontFamily};}`}</style>
            </defs>
            <rect
              data-role="background"
              x={0}
              y={0}
              width={measuredWidth}
              height={measuredHeight}
              fill={settings.backgroundColor}
              onDoubleClick={(event) => sendHighlight(['chartBasics'], event)}
            />
            {settings.title ? (
              <text
                x={chartTitleX}
                y={chartTitleY}
                textAnchor="middle"
                fill={titleColor}
                fontSize={settings.titleFontSize}
                style={{
                  fontFamily: titleFontFamily,
                  fontWeight: titleFontWeight,
                  fontStyle: titleFontStyle,
                  textDecoration: titleTextDecoration,
                }}
                onDoubleClick={(event) => {
                  sendHighlight(['title'], event)
                  onRequestFocus({ type: 'chartTitle' })
                }}
              >
                {settings.title}
              </text>
            ) : null}
            {settings.subtitle ? (
              <text
                x={chartSubtitleX}
                y={chartSubtitleY}
                textAnchor="middle"
                fill={subtitleColor}
                fontSize={settings.subtitleFontSize}
                style={{
                  fontFamily: subtitleFontFamily,
                  fontWeight: subtitleFontWeight,
                  fontStyle: subtitleFontStyle,
                  textDecoration: subtitleTextDecoration,
                }}
                onDoubleClick={(event) => {
                  sendHighlight(['title'], event)
                  onRequestFocus({ type: 'chartSubtitle' })
                }}
              >
                {settings.subtitle}
              </text>
            ) : null}

            {/* Y axis grid lines */}
            <defs>
              {barLayout
                .filter(({ data }) => (data.pattern ?? 'solid') !== 'solid')
                .map(({ data, opacity }) => {
                  const patternId = `pattern-${data.id}`
                  const patternType = data.pattern ?? 'solid'
                  const patternSizeRaw = Number.isFinite(data.patternSize) ? data.patternSize : 8
                  const patternSize = Math.max(patternSizeRaw, 2)
                  const accentOpacity = clamp(
                    Number.isFinite(data.patternOpacity) ? data.patternOpacity : 0.35,
                    0,
                    1,
                  )
                  const accentColor = data.patternColor || '#ffffff'
                  const primaryStroke = Math.max(patternSize * 0.18, 0.75)
                  const secondaryStroke = Math.max(patternSize * 0.14, 0.6)
                  const halfSize = patternSize / 2
                  const quarterSize = patternSize / 4
                  const dotRadius = Math.max(patternSize * 0.2, 1)
                  switch (patternType) {
                    case 'diagonal':
                      return (
                        <pattern
                          key={patternId}
                          id={patternId}
                          patternUnits="userSpaceOnUse"
                          width={patternSize}
                          height={patternSize}
                        >
                          <rect width={patternSize} height={patternSize} fill={data.fillColor} opacity={opacity} />
                          <path
                            d={`M0 ${patternSize} L ${patternSize} 0`}
                            stroke={accentColor}
                            strokeOpacity={accentOpacity}
                            strokeWidth={primaryStroke}
                          />
                          <path
                            d={`M-${halfSize} ${patternSize} L ${halfSize} 0`}
                            stroke={accentColor}
                            strokeOpacity={accentOpacity}
                            strokeWidth={primaryStroke}
                          />
                          <path
                            d={`${halfSize} ${patternSize} L ${patternSize + halfSize} 0`}
                            stroke={accentColor}
                            strokeOpacity={accentOpacity}
                            strokeWidth={primaryStroke}
                          />
                        </pattern>
                      )
                    case 'dots':
                      return (
                        <pattern
                          key={patternId}
                          id={patternId}
                          patternUnits="userSpaceOnUse"
                          width={patternSize}
                          height={patternSize}
                        >
                          <rect width={patternSize} height={patternSize} fill={data.fillColor} opacity={opacity} />
                          <circle
                            cx={quarterSize * 1.5}
                            cy={quarterSize * 1.5}
                            r={dotRadius}
                            fill={accentColor}
                            fillOpacity={accentOpacity}
                          />
                          <circle
                            cx={patternSize - quarterSize * 1.5}
                            cy={patternSize - quarterSize * 1.5}
                            r={dotRadius}
                            fill={accentColor}
                            fillOpacity={accentOpacity}
                          />
                        </pattern>
                      )
                    case 'crosshatch':
                      return (
                        <pattern
                          key={patternId}
                          id={patternId}
                          patternUnits="userSpaceOnUse"
                          width={patternSize}
                          height={patternSize}
                        >
                          <rect width={patternSize} height={patternSize} fill={data.fillColor} opacity={opacity} />
                          <path
                            d={`M0 ${halfSize} H ${patternSize}`}
                            stroke={accentColor}
                            strokeOpacity={accentOpacity}
                            strokeWidth={secondaryStroke}
                          />
                          <path
                            d={`M${halfSize} 0 V ${patternSize}`}
                            stroke={accentColor}
                            strokeOpacity={accentOpacity}
                            strokeWidth={secondaryStroke}
                          />
                        </pattern>
                      )
                    case 'vertical':
                      return (
                        <pattern
                          key={patternId}
                          id={patternId}
                          patternUnits="userSpaceOnUse"
                          width={patternSize}
                          height={patternSize}
                        >
                          <rect width={patternSize} height={patternSize} fill={data.fillColor} opacity={opacity} />
                          <path
                            d={`M${quarterSize} 0 V ${patternSize}`}
                            stroke={accentColor}
                            strokeOpacity={accentOpacity}
                            strokeWidth={primaryStroke}
                          />
                          <path
                            d={`M${patternSize - quarterSize} 0 V ${patternSize}`}
                            stroke={accentColor}
                            strokeOpacity={accentOpacity}
                            strokeWidth={primaryStroke}
                          />
                        </pattern>
                      )
                    default:
                      return null
                  }
                })}
            </defs>

            {axisStyles.y.showGridLines
              ? ticks.map((tick) => {
                const y = margin.top + scaleY(tick)
                
                // Create stroke dash array based on line style
                let strokeDasharray = 'none'
                switch (axisStyles.y.gridLineStyle) {
                  case 'dashed':
                    strokeDasharray = '8 4'
                    break
                  case 'dotted':
                    strokeDasharray = '2 2'
                    break
                  case 'solid':
                  default:
                    strokeDasharray = 'none'
                    break
                }
                
                return (
                  <line
                    key={`grid-${tick}`}
                    x1={margin.left}
                    x2={measuredWidth - margin.right}
                    y1={y}
                    y2={y}
                    stroke={axisStyles.y.gridLineColor}
                    strokeWidth={axisStyles.y.gridLineWidth}
                    strokeDasharray={strokeDasharray}
                    strokeOpacity={axisStyles.y.gridLineOpacity}
                  />
                )
              })
              : null}

            {/* Bars */}
            {barLayout.map(({ data, x, y, width, height, center, opacity, borderWidth }) => {
              const patternType = data.pattern ?? 'solid'
              const barTop = y
              const barHeight = Math.max(height, 0.01)
              const cornerSetting = clamp(settings.barCornerRadius, 0, 96)
              const radius = Math.min(cornerSetting, barHeight / 2, width / 2)
              const pathD = createBarPath(x, barTop, width, barHeight, radius, settings.barCornerStyle)
              const strokeWidth = Math.max(borderWidth, 0)
              const maxLabelY = barTop - 4
              const desiredLabelY = barTop - settings.valueLabelFontSize * 0.6 - 4
              const baseLabelY = Math.min(desiredLabelY, maxLabelY)
              const offsetLabelY = baseLabelY + (settings.valueLabelOffsetY ?? 0)
              let valueLabelY = offsetLabelY
              valueLabelY = Math.max(valueLabelY, 0)
              valueLabelY = Math.min(valueLabelY, chartAreaBottom - 4)
              const errorValue = Math.max(data.error, 0)
              const upperY = toCanvasY(data.value + errorValue)
              const lowerY = toCanvasY(data.value - errorValue)
              const errorTopY = Math.min(upperY, lowerY)
              const errorBottomY = Math.max(upperY, lowerY)
              const errorLength = errorBottomY - errorTopY
              const errorColor = settings.errorBarMode === 'match' ? data.borderColor : settings.errorBarColor
              const errorStroke = Math.max(settings.errorBarWidth, 0)
              const capHalfWidth = settings.errorBarCapWidth / 2
              const errorVisible =
                settings.showErrorBars && errorLength > 0.5 && errorTopY < errorBottomY - 0.5
              const patternId = `pattern-${data.id}`
              const fillValue = patternType === 'solid' ? data.fillColor : `url(#${patternId})`
              const fillOpacity = patternType === 'solid' ? opacity : 1
              const valueLabelX = center + (settings.valueLabelOffsetX ?? 0)

              return (
                <g
                  key={data.id}
                  onDoubleClick={(event) => sendHighlight(['data', 'design'], event)}
                >
                  {pathD ? (
                    <path
                      d={pathD}
                      fill={fillValue}
                      fillOpacity={fillOpacity}
                      stroke={data.borderColor}
                      strokeWidth={strokeWidth}
                      strokeLinejoin="round"
                    />
                  ) : (
                    <rect
                      x={x}
                      y={barTop}
                      width={width}
                      height={barHeight}
                      fill={fillValue}
                      fillOpacity={fillOpacity}
                      stroke={data.borderColor}
                      strokeWidth={strokeWidth}
                    />
                  )}
                  {settings.showValueLabels ? (
                    <text
                      x={valueLabelX}
                      y={valueLabelY}
                      textAnchor="middle"
                      fill={settings.textColor}
          fontFamily={defaultFontFamily}
                      fontSize={settings.valueLabelFontSize}
                      fontWeight={500}
                      onDoubleClick={(event) => {
                        sendHighlight(['data', 'valueLabels'], event)
                        onRequestFocus({ type: 'dataValue', dataId: data.id })
                      }}
                    >
                      {`${data.value}`}
                    </text>
                  ) : null}
                  {errorVisible ? (
                    <g onDoubleClick={(event) => sendHighlight(['errorBars'], event)}>
                      <line
                        x1={center}
                        x2={center}
                        y1={errorTopY}
                        y2={errorBottomY}
                        stroke={errorColor}
                        strokeWidth={errorStroke}
                        strokeLinecap="round"
                      />
                      <line
                        x1={center - capHalfWidth}
                        x2={center + capHalfWidth}
                        y1={errorTopY}
                        y2={errorTopY}
                        stroke={errorColor}
                        strokeWidth={errorStroke}
                        strokeLinecap="round"
                      />
                      <line
                        x1={center - capHalfWidth}
                        x2={center + capHalfWidth}
                        y1={errorBottomY}
                        y2={errorBottomY}
                        stroke={errorColor}
                        strokeWidth={errorStroke}
                        strokeLinecap="round"
                      />
                    </g>
                  ) : null}
                </g>
              )
            })}

            {/* Axes */}
            {axisStyles.x.showAxisLines ? (
              <line
                x1={margin.left}
                x2={measuredWidth - margin.right}
                y1={margin.top + chartBounds.height}
                y2={margin.top + chartBounds.height}
                stroke={axisStyles.x.axisLineColor}
                strokeWidth={axisStyles.x.axisLineWidth}
                onDoubleClick={(event) => sendHighlight(['xAxis'], event)}
              />
            ) : null}
            {axisStyles.y.showAxisLines ? (
              <line
                x1={margin.left}
                x2={margin.left}
                y1={margin.top}
                y2={margin.top + chartBounds.height}
                stroke={axisStyles.y.axisLineColor}
                strokeWidth={axisStyles.y.axisLineWidth}
                onDoubleClick={(event) => sendHighlight(['yAxis'], event)}
              />
            ) : null}

            {/* Axis titles */}
            {axisStyles.x.title ? (
              <text
                x={(measuredWidth - margin.right + margin.left) / 2}
                y={xAxisTitleY}
                textAnchor="middle"
                fill={axisStyles.x.axisLineColor}
                      fontFamily={defaultFontFamily}
                fontSize={settings.axisTitleFontSize}
                fontWeight={500}
                onDoubleClick={(event) => {
                  sendHighlight(['xAxis'], event)
                  onRequestFocus({ type: 'xAxisTitle' })
                }}
              >
                {axisStyles.x.title}
              </text>
            ) : null}
            {axisStyles.y.title ? (
              <text
                x={yAxisTitleX}
                y={yAxisTitleY}
                textAnchor="middle"
                fill={axisStyles.y.axisLineColor}
                fontFamily={defaultFontFamily}
                fontSize={settings.axisTitleFontSize}
                fontWeight={500}
                transform={`rotate(-90 ${yAxisTitleX} ${yAxisTitleY})`}
                onDoubleClick={(event) => {
                  sendHighlight(['yAxis'], event)
                  onRequestFocus({ type: 'yAxisTitle' })
                }}
              >
                {axisStyles.y.title}
              </text>
            ) : null}

            {/* Tick labels */}
            {axisStyles.y.showTickLabels
              ? ticks.map((tick) => {
                const y = margin.top + scaleY(tick)
                return (
                  <text
                    key={`ytick-${tick}`}
                    x={margin.left - 10}
                    y={y + settings.axisTickFontSize / 3}
                    textAnchor="end"
                    fill={axisStyles.y.tickLabelColor}
                    fontFamily={defaultFontFamily}
                    fontSize={settings.axisTickFontSize}
                    onDoubleClick={(event) => sendHighlight(['yAxis'], event)}
                  >
                    {tick.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </text>
                )
              })
              : null}

            {axisStyles.x.showTickLabels
              ? barLayout.map(({ data, center }) => (
                <text
                  key={`xlabel-${data.id}`}
                  x={center}
                  y={xTickBaseY}
                  textAnchor="middle"
                  fill={axisStyles.x.tickLabelColor}
                  fontFamily={defaultFontFamily}
                  fontSize={settings.axisTickFontSize}
                  onDoubleClick={(event) => {
                    sendHighlight(['data'], event)
                    onRequestFocus({ type: 'barLabel', barId: data.id })
                  }}
                >
                  {data.label}
                </text>
              ))
              : null}
          </svg>
        </div>
      </div>
      <DataImportDialog
        isOpen={isImportDialogOpen}
        paletteName={settings.paletteName}
        onCancel={handleImportCancel}
        onConfirm={handleImportConfirm}
      />
      {isExportDialogOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={closeExportDialog}
        >
          <div
            className="w-full max-w-md scale-100 rounded-2xl border border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Export chart</h3>
              <button
                type="button"
                onClick={closeExportDialog}
                className="text-white/60 transition hover:text-white"
                aria-label="Close export dialog"
              >
                ×
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-xs uppercase tracking-wide text-white/50">File name</span>
                <input
                  type="text"
                  value={exportFileName}
                  onChange={(event) => setExportFileName(event.target.value)}
                  className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                  placeholder="barplot"
                />
              </label>
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wide text-white/50">Format</span>
                <div className="grid gap-2">
                  {formatOptions.map((option) => {
                    const id = `export-format-${option.value}`
                    const checked = exportFormat === option.value
                    return (
                      <label
                        key={option.value}
                        htmlFor={id}
                        className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition ${checked ? 'border-sky-400 bg-sky-400/15 text-white' : 'border-white/10 bg-white/5 text-white/70 hover:text-white'}`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-white/50">{option.description}</span>
                        </div>
                        <input
                          id={id}
                          type="radio"
                          name="export-format"
                          value={option.value}
                          checked={checked}
                          onChange={() => setExportFormat(option.value)}
                          className="sr-only"
                        />
                      </label>
                    )
                  })}
                </div>
              </div>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-xs uppercase tracking-wide text-white/50">Quality</span>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={1}
                  value={exportScale}
                  onChange={(event) => setExportScale(Number.parseInt(event.target.value, 10))}
                  className="accent-sky-400"
                />
                <span className="text-xs text-white/50">Scale ×{exportScale}</span>
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={exportTransparent}
                  onChange={(event) => setExportTransparent(event.target.checked)}
                  className="h-4 w-4 rounded border border-white/20 bg-white/10 text-sky-400 focus:ring-sky-400"
                />
                <span>Transparent background</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3 text-sm">
              <button
                type="button"
                onClick={closeExportDialog}
                disabled={isExporting}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExportConfirm}
                disabled={isExporting}
                className="inline-flex items-center gap-2 rounded-md border border-sky-400 bg-sky-400/20 px-3 py-1.5 font-medium text-white transition hover:bg-sky-400/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExporting ? 'Exporting…' : 'Export'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default ChartPreview

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
