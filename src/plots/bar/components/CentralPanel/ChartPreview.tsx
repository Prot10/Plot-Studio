import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { DEFAULT_FONT_STACK } from '../../../../shared/constants/fonts'
import useElementSize from '../../../../shared/hooks/useElementSize'
import type { BarChartSettings, BarDataPoint } from '../../../../types/bar'
import type { FocusTarget, HighlightKey } from '../../../../types/base'
import DataImportModal from '../../../../shared/components/DataImportModal'
import ExportModal from '../../../../shared/components/ExportModal'

type ChartPreviewAction = 'importData' | 'exportChart'

type ChartPreviewProps = {
  settings: BarChartSettings
  onUpdateSettings: (settings: BarChartSettings) => void
  onHighlight: (keys: HighlightKey[]) => void
  onRequestFocus: (target: FocusTarget) => void
  actionRequest?: ChartPreviewAction | null
  onActionHandled?: () => void
  isActive?: boolean
  onActivate?: () => void
  comparisonEnabled?: boolean
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
  isHorizontal: boolean = false,
) {
  const r = Math.max(Math.min(radius, width / 2, height / 2), 0)
  if (r === 0) return ''

  if (isHorizontal) {
    // For horizontal bars, rounded corners should be on the right side
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

    // Only right side rounded for horizontal bars
    return [
      `M ${x} ${y}`,
      `H ${x + width - r}`,
      `Q ${x + width} ${y} ${x + width} ${y + r}`,
      `V ${y + height - r}`,
      `Q ${x + width} ${y + height} ${x + width - r} ${y + height}`,
      `H ${x}`,
      'Z',
    ].join(' ')
  }

  // Vertical bars (original logic)
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
  isActive = true,
  onActivate,
  comparisonEnabled = false,
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
      (settings.xAxis.showTickLabels ? settings.xAxisTickFontSize + 24 : 16) +
      Math.max(settings.xAxisTitleOffsetY, 0)
    const leftExtra =
      (settings.yAxis.showTickLabels ? settings.yAxisTickFontSize + 28 : 16) +
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
    settings.xAxisTickFontSize,
    settings.yAxisTickFontSize,
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
    const { data: bars, barGap, barBorderWidth, barOpacity, orientation } = settings
    const count = bars.length || 1
    const isHorizontal = orientation === 'horizontal'

    if (isHorizontal) {
      // Horizontal bars: spread along Y-axis, extend along X-axis
      const band = chartBounds.height / count
      const gap = band * clamp(barGap, 0, 0.9)
      const barHeight = Math.max(band - gap, 4)

      return bars.map((bar, index) => {
        const y = margin.top + band * index + (band - barHeight) / 2
        const valueRatio = clamp((bar.value - axisMin) / axisRange, 0, 1)
        const barWidth = chartBounds.width * valueRatio
        const x = margin.left
        const opacity = Number.isFinite(bar.opacity) ? bar.opacity : barOpacity
        const borderWidth = Number.isFinite(bar.borderWidth) ? bar.borderWidth : barBorderWidth

        return {
          data: bar,
          x,
          y,
          width: barWidth,
          height: barHeight,
          center: y + barHeight / 2,
          opacity: clamp(opacity, 0, 1),
          borderWidth,
        }
      })
    } else {
      // Vertical bars: spread along X-axis, extend along Y-axis (original behavior)
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
    }
  }, [settings, axisMin, axisRange, chartBounds.width, chartBounds.height, margin.left, margin.top])

  const toCanvasY = (value: number) => margin.top + scaleY(value)

  const toCanvasX = (value: number) => {
    const ratio = clamp((value - axisMin) / axisRange, 0, 1)
    return margin.left + ratio * chartBounds.width
  }

  const axisStyles = {
    x: settings.xAxis,
    y: settings.yAxis,
  }

  const globalFontFamily = settings.globalFontFamily || DEFAULT_FONT_STACK
  const titleColor = settings.titleColor ?? settings.textColor
  const titleFontWeight = settings.titleIsBold ? 700 : 500
  const titleFontStyle = settings.titleIsItalic ? 'italic' : 'normal'
  const titleTextDecoration = settings.titleIsUnderline ? 'underline' : 'none'
  const subtitleColor = settings.subtitleColor || settings.textColor
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
  const baseXAxisTitleY = chartAreaBottom + settings.xAxisTitleFontSize + 12 + settings.xAxisTitleOffsetY
  const xAxisTitleY = clamp(baseXAxisTitleY, settings.xAxisTitleFontSize, measuredHeight - 8)
  const baseYAxisTitleX = Math.max(Math.min(margin.left - 24, 80), 16)
  const yAxisTitleX = clamp(baseYAxisTitleX + settings.yAxisTitleOffsetX, 8, margin.left + 160)
  const yAxisTitleY = chartAreaTop + chartBounds.height / 2
  const xTickBaseY = Math.min(chartAreaBottom + settings.xAxisTickFontSize + 6, measuredHeight - 4)

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
      <div
        ref={wrapperRef}
        className={classNames(
          'relative flex min-h-[280px] sm:min-h-[420px] flex-1 items-center justify-center transition w-full max-w-full overflow-hidden',
          comparisonEnabled
            ? classNames(
              'border border-white/10',
              isActive ? 'ring-2 ring-sky-400/70 border-sky-400/60' : 'border-white/10'
            )
            : 'rounded-2xl'
        )}
        style={{ backgroundColor: settings.backgroundColor, minHeight: `${Math.min(minContainerHeight, 420)}px` }}
        onClick={onActivate}
      >
        <svg
          ref={svgRef}
          className="max-w-full h-auto"
          width={measuredWidth}
          height={measuredHeight}
          viewBox={`0 0 ${measuredWidth} ${measuredHeight}`}
          role="img"
        >
          <title>{settings.title || 'Bar plot'}</title>
          <defs>
            {/* No global font styling - fonts applied individually to text elements */}

            {/* Grayscale filter for images */}
            <filter id="grayscale">
              <feColorMatrix type="saturate" values="0" />
            </filter>
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
              fontFamily={globalFontFamily}
              style={{
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
              fontFamily={globalFontFamily}
              style={{
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

          {/* Grid lines */}
          {/* Horizontal grid lines - based on value ticks */}
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
                  key={`h-grid-${tick}`}
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
            : null
          }

          {/* Vertical grid lines - based on category positions */}
          {axisStyles.x.showGridLines && settings.orientation === 'vertical'
            ? barLayout.slice(0, -1).map(({ data }, index) => {
              const band = chartBounds.width / barLayout.length
              const x = margin.left + band * (index + 1) // Position between bars

              // Create stroke dash array based on line style
              let strokeDasharray = 'none'
              switch (axisStyles.x.gridLineStyle) {
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
                  key={`v-grid-${data.id}`}
                  x1={x}
                  x2={x}
                  y1={margin.top}
                  y2={measuredHeight - margin.bottom}
                  stroke={axisStyles.x.gridLineColor}
                  strokeWidth={axisStyles.x.gridLineWidth}
                  strokeDasharray={strokeDasharray}
                  strokeOpacity={axisStyles.x.gridLineOpacity}
                />
              )
            })
            : null
          }

          {/* For horizontal orientation, vertical grid lines based on value ticks */}
          {axisStyles.x.showGridLines && settings.orientation === 'horizontal'
            ? ticks.map((tick) => {
              const x = margin.left + ((tick - axisMin) / axisRange) * chartBounds.width

              // Create stroke dash array based on line style
              let strokeDasharray = 'none'
              switch (axisStyles.x.gridLineStyle) {
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
                  key={`v-grid-${tick}`}
                  x1={x}
                  x2={x}
                  y1={margin.top}
                  y2={measuredHeight - margin.bottom}
                  stroke={axisStyles.x.gridLineColor}
                  strokeWidth={axisStyles.x.gridLineWidth}
                  strokeDasharray={strokeDasharray}
                  strokeOpacity={axisStyles.x.gridLineOpacity}
                />
              )
            })
            : null
          }

          {/* Bars */}
          {barLayout.map(({ data, x, y, width, height, center, opacity }) => {
            const isHorizontal = settings.orientation === 'horizontal'
            const patternType = data.pattern ?? 'solid'
            const barTop = y
            const barHeight = Math.max(height, 0.01)
            const barWidth = Math.max(width, 0.01)
            const cornerSetting = clamp(settings.barCornerRadius, 0, 96)
            const radius = Math.min(cornerSetting, barHeight / 2, barWidth / 2)
            const pathD = createBarPath(x, barTop, barWidth, barHeight, radius, settings.barCornerStyle, isHorizontal)

            // Use global border settings if showBorder is enabled, otherwise no border
            const actualBorderWidth = settings.showBorder ? Math.max(settings.globalBorderWidth, 0) : 0
            const borderOpacity = settings.showBorder ? (Number.isFinite(data.borderOpacity) ? data.borderOpacity : 1.0) : 0

            // Value label positioning
            let valueLabelX: number, valueLabelY: number
            if (isHorizontal) {
              // For horizontal bars, place label at the end of the bar
              const maxLabelX = x + barWidth + 4
              const desiredLabelX = x + barWidth + settings.valueLabelFontSize * 0.6 + 4
              const baseLabelX = Math.max(desiredLabelX, maxLabelX)
              const offsetLabelX = baseLabelX + (settings.valueLabelOffsetX ?? 0)
              valueLabelX = Math.min(offsetLabelX, measuredWidth - margin.right - 4)
              valueLabelY = center + (settings.valueLabelOffsetY ?? 0)
            } else {
              // For vertical bars, place label above the bar (original logic)
              const maxLabelY = barTop - 4
              const desiredLabelY = barTop - settings.valueLabelFontSize * 0.6 - 4
              const baseLabelY = Math.min(desiredLabelY, maxLabelY)
              const offsetLabelY = baseLabelY + (settings.valueLabelOffsetY ?? 0)
              valueLabelY = Math.max(Math.min(offsetLabelY, chartAreaBottom - 4), 0)
              valueLabelX = center + (settings.valueLabelOffsetX ?? 0)
            }

            // Error bar positioning
            const errorValue = Math.max(data.error, 0)
            let errorX1: number, errorY1: number, errorX2: number, errorY2: number
            let errorLength: number

            if (isHorizontal) {
              const leftX = toCanvasX(data.value - errorValue)
              const rightX = toCanvasX(data.value + errorValue)
              errorX1 = Math.min(leftX, rightX)
              errorX2 = Math.max(leftX, rightX)
              errorY1 = center
              errorY2 = center
              errorLength = errorX2 - errorX1
            } else {
              const upperY = toCanvasY(data.value + errorValue)
              const lowerY = toCanvasY(data.value - errorValue)
              errorX1 = center
              errorX2 = center
              errorY1 = Math.min(upperY, lowerY)
              errorY2 = Math.max(upperY, lowerY)
              errorLength = errorY2 - errorY1
            }

            const errorColor = settings.errorBarMode === 'match' ? data.borderColor : settings.errorBarColor
            const errorStroke = Math.max(settings.errorBarWidth, 0)
            const capHalfWidth = settings.errorBarCapWidth / 2
            const errorVisible = settings.showErrorBars && errorLength > 0.5
            const patternId = `pattern-${data.id}`
            const fillValue = patternType === 'solid' ? data.fillColor : `url(#${patternId})`
            const fillOpacity = patternType === 'solid' ? opacity : 1

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
                    strokeWidth={actualBorderWidth}
                    strokeOpacity={borderOpacity}
                    strokeLinejoin="round"
                  />
                ) : (
                  <rect
                    x={x}
                    y={barTop}
                    width={barWidth}
                    height={barHeight}
                    fill={fillValue}
                    fillOpacity={fillOpacity}
                    stroke={data.borderColor}
                    strokeWidth={actualBorderWidth}
                    strokeOpacity={borderOpacity}
                  />
                )}
                {settings.showValueLabels ? (
                  <text
                    x={valueLabelX}
                    y={valueLabelY}
                    textAnchor={isHorizontal ? "start" : "middle"}
                    dominantBaseline={isHorizontal ? "middle" : "auto"}
                    fill={settings.textColor}
                    fontFamily={globalFontFamily}
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
                      x1={errorX1}
                      x2={errorX2}
                      y1={errorY1}
                      y2={errorY2}
                      stroke={errorColor}
                      strokeWidth={errorStroke}
                      strokeLinecap="round"
                    />
                    {isHorizontal ? (
                      <>
                        <line
                          x1={errorX1}
                          x2={errorX1}
                          y1={center - capHalfWidth}
                          y2={center + capHalfWidth}
                          stroke={errorColor}
                          strokeWidth={errorStroke}
                          strokeLinecap="round"
                        />
                        <line
                          x1={errorX2}
                          x2={errorX2}
                          y1={center - capHalfWidth}
                          y2={center + capHalfWidth}
                          stroke={errorColor}
                          strokeWidth={errorStroke}
                          strokeLinecap="round"
                        />
                      </>
                    ) : (
                      <>
                        <line
                          x1={center - capHalfWidth}
                          x2={center + capHalfWidth}
                          y1={errorY1}
                          y2={errorY1}
                          stroke={errorColor}
                          strokeWidth={errorStroke}
                          strokeLinecap="round"
                        />
                        <line
                          x1={center - capHalfWidth}
                          x2={center + capHalfWidth}
                          y1={errorY2}
                          y2={errorY2}
                          stroke={errorColor}
                          strokeWidth={errorStroke}
                          strokeLinecap="round"
                        />
                      </>
                    )}
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
              fontFamily={globalFontFamily}
              fontSize={settings.xAxisTitleFontSize}
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
              fontFamily={globalFontFamily}
              fontSize={settings.yAxisTitleFontSize}
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
          {settings.orientation === 'horizontal' ? (
            // Horizontal orientation: category labels on Y-axis, value labels on X-axis
            <>
              {/* Category labels on Y-axis */}
              {axisStyles.y.showTickLabels
                ? barLayout.map(({ data, center }) => {
                  const baseX = margin.left - 10 + (settings.yAxisTickOffsetX ?? 0)
                  const baseY = center + settings.yAxisTickFontSize / 3 + (settings.yAxisTickOffsetY ?? 0)
                  return (
                    <text
                      key={`ylabel-${data.id}`}
                      x={baseX}
                      y={baseY}
                      textAnchor="end"
                      fill={axisStyles.y.tickLabelColor}
                      fontFamily={globalFontFamily}
                      fontSize={settings.yAxisTickFontSize}
                      transform={axisStyles.y.tickLabelOrientation !== 0 ? `rotate(${axisStyles.y.tickLabelOrientation}, ${baseX}, ${baseY})` : undefined}
                      onDoubleClick={(event) => {
                        sendHighlight(['data'], event)
                        onRequestFocus({ type: 'barLabel', barId: data.id })
                      }}
                    >
                      {data.label}
                    </text>
                  )
                })
                : null}

              {/* Value labels on X-axis */}
              {axisStyles.x.showTickLabels
                ? ticks.map((tick) => {
                  const x = margin.left + ((tick - axisMin) / axisRange) * chartBounds.width
                  const baseX = x + (settings.xAxisTickOffsetX ?? 0)
                  const baseY = xTickBaseY + (settings.xAxisTickOffsetY ?? 0)
                  return (
                    <text
                      key={`xtick-${tick}`}
                      x={baseX}
                      y={baseY}
                      textAnchor="middle"
                      fill={axisStyles.x.tickLabelColor}
                      fontFamily={globalFontFamily}
                      fontSize={settings.xAxisTickFontSize}
                      transform={axisStyles.x.tickLabelOrientation !== 0 ? `rotate(${axisStyles.x.tickLabelOrientation}, ${baseX}, ${baseY})` : undefined}
                      onDoubleClick={(event) => sendHighlight(['xAxis'], event)}
                    >
                      {tick.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </text>
                  )
                })
                : null}
            </>
          ) : (
            // Vertical orientation: value labels on Y-axis, category labels on X-axis (original behavior)
            <>
              {/* Value labels on Y-axis */}
              {axisStyles.y.showTickLabels
                ? ticks.map((tick) => {
                  const y = margin.top + scaleY(tick)
                  const x = margin.left - 10
                  const baseX = x + (settings.yAxisTickOffsetX ?? 0)
                  const baseY = y + settings.yAxisTickFontSize / 3 + (settings.yAxisTickOffsetY ?? 0)
                  return (
                    <text
                      key={`ytick-${tick}`}
                      x={baseX}
                      y={baseY}
                      textAnchor="end"
                      fill={axisStyles.y.tickLabelColor}
                      fontFamily={globalFontFamily}
                      fontSize={settings.yAxisTickFontSize}
                      transform={axisStyles.y.tickLabelOrientation !== 0 ? `rotate(${axisStyles.y.tickLabelOrientation}, ${baseX}, ${baseY})` : undefined}
                      onDoubleClick={(event) => sendHighlight(['yAxis'], event)}
                    >
                      {tick.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </text>
                  )
                })
                : null}

              {/* Category labels on X-axis */}
              {axisStyles.x.showTickLabels
                ? barLayout.map(({ data, center }) => {
                  const baseX = center + (settings.xAxisTickOffsetX ?? 0)
                  const baseY = xTickBaseY + (settings.xAxisTickOffsetY ?? 0)
                  return (
                    <text
                      key={`xlabel-${data.id}`}
                      x={baseX}
                      y={baseY}
                      textAnchor="middle"
                      fill={axisStyles.x.tickLabelColor}
                      fontFamily={globalFontFamily}
                      fontSize={settings.xAxisTickFontSize}
                      transform={axisStyles.x.tickLabelOrientation !== 0 ? `rotate(${axisStyles.x.tickLabelOrientation}, ${baseX}, ${baseY})` : undefined}
                      onDoubleClick={(event) => {
                        sendHighlight(['data'], event)
                        onRequestFocus({ type: 'barLabel', barId: data.id })
                      }}
                    >
                      {data.label}
                    </text>
                  )
                })
                : null}
            </>
          )}

          {/* Plot box border */}
          {settings.showPlotBox ? (
            <rect
              x={margin.left}
              y={margin.top}
              width={chartBounds.width}
              height={chartBounds.height}
              fill="none"
              stroke={settings.plotBoxColor}
              strokeWidth={settings.plotBoxLineWidth}
              onDoubleClick={(event) => sendHighlight(['chartBasics'], event)}
            />
          ) : null}

          {/* Additional Text Elements */}
          {settings.additionalTextElements?.map((textElement) => {
            const fontWeight = textElement.isBold ? 700 : 400
            const fontStyle = textElement.isItalic ? 'italic' : 'normal'
            const textDecoration = textElement.isUnderline ? 'underline' : 'none'
            const x = margin.left + textElement.x
            const y = margin.top + textElement.y

            return (
              <text
                key={textElement.id}
                x={x}
                y={y}
                fill={textElement.color}
                fontSize={textElement.fontSize}
                fontFamily={textElement.fontFamily}
                fillOpacity={textElement.opacity}
                style={{
                  fontWeight,
                  fontStyle,
                  textDecoration,
                }}
                transform={textElement.rotation !== 0 ? `rotate(${textElement.rotation} ${x} ${y})` : undefined}
              >
                {textElement.text}
              </text>
            )
          })}

          {/* Additional Image Elements */}
          {settings.additionalImageElements?.map((imageElement) => {
            const x = margin.left + imageElement.x
            const y = margin.top + imageElement.y
            const width = imageElement.originalWidth * imageElement.scale
            const height = imageElement.originalHeight * imageElement.scale

            // Calculate center point for rotation
            const centerX = x + width / 2
            const centerY = y + height / 2

            return (
              <image
                key={imageElement.id}
                x={x}
                y={y}
                width={width}
                height={height}
                href={imageElement.src}
                opacity={imageElement.opacity}
                filter={imageElement.grayscale ? 'url(#grayscale)' : undefined}
                transform={imageElement.rotation !== 0 ? `rotate(${imageElement.rotation} ${centerX} ${centerY})` : undefined}
              />
            )
          })}
        </svg>
      </div>
      <DataImportModal isOpen={isImportDialogOpen} paletteName={settings.paletteName} onCancel={handleImportCancel} onConfirm={handleImportConfirm} />
      <ExportModal
        isOpen={isExportDialogOpen}
        onClose={closeExportDialog}
        initial={{ format: exportFormat, fileName: exportFileName, scale: exportScale, transparent: exportTransparent }}
        onExport={async (opts) => {
          setExportFormat(opts.format)
          setExportFileName(opts.fileName)
          setExportScale(opts.scale)
          setExportTransparent(opts.transparent)
          await handleExportConfirm()
        }}
      />
    </>
  )
}

export default ChartPreview

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
