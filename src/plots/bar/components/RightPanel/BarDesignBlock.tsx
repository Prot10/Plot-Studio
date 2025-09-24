import { useState, useEffect } from 'react'
import { ColorField } from '../../../../shared/components/ColorField'
import { NumericInput } from '../../../../shared/components/NumericInput'
import { SelectField } from '../../../../shared/components/SelectField'
import type { BarChartSettings, BarDataPoint, BarPattern } from '../../../../types/bar'

const patternOptions: Array<{ value: BarPattern; label: string }> = [
    { value: 'solid', label: 'Solid' },
    { value: 'diagonal', label: 'Diagonal lines' },
    { value: 'dots', label: 'Dots' },
    { value: 'crosshatch', label: 'Crosshatch' },
    { value: 'vertical', label: 'Vertical stripes' },
]

interface BarDesignBlockProps {
    settings: BarChartSettings;
    bars: BarDataPoint[];
    onBarsChange: (bars: BarDataPoint[]) => void;
    selectedBarId?: string | null;
    onSelectBar?: (barId: string | null) => void;
}

export function BarDesignBlock({
    settings,
    bars,
    onBarsChange,
    selectedBarId: externalSelectedBarId,
    onSelectBar
}: BarDesignBlockProps) {
    const [internalSelectedBarId, setInternalSelectedBarId] = useState<string>(bars[0]?.id || '')

    // Use external selection if provided, otherwise use internal state
    const selectedBarId = externalSelectedBarId || internalSelectedBarId
    const setSelectedBarId = onSelectBar || setInternalSelectedBarId

    // Update selected bar when bars change
    useEffect(() => {
        if (!bars.find(bar => bar.id === selectedBarId)) {
            setSelectedBarId(bars[0]?.id || '')
        }
    }, [bars, selectedBarId, setSelectedBarId])

    const updateBar = (barId: string, field: keyof Omit<BarDataPoint, 'id'>, value: string | number | BarPattern) => {
        const updatedBars = bars.map(bar =>
            bar.id === barId ? { ...bar, [field]: value } : bar
        )
        onBarsChange(updatedBars)
    }

    const selectedBar = bars.find(bar => bar.id === selectedBarId) || bars[0]

    return {
        barSelector: (
            <div>
                <div className="flex items-center justify-start gap-4 mb-4">
                    <span className="text-sm font-semibold text-white/80">Active Bar:</span>
                    <SelectField<string>
                        className="w-48"
                        label=""
                        value={selectedBarId}
                        onChange={(newBarId) => setSelectedBarId(newBarId)}
                        options={bars.map(bar => ({
                            value: bar.id,
                            label: bar.label || `Bar ${bars.indexOf(bar) + 1}`
                        }))}
                        placeholder="Select bar to edit"
                    />
                </div>
            </div>
        ),

        barSettings: selectedBar ? (
            <div className="space-y-4">
                {(() => {
                    const isPatternActive = selectedBar.pattern !== 'solid'

                    return (
                        <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <ColorField
                                    label="Fill color"
                                    value={selectedBar.fillColor}
                                    onChange={(value) => updateBar(selectedBar.id, 'fillColor', value)}
                                />
                                <NumericInput
                                    title="Fill opacity"
                                    value={selectedBar.opacity}
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    precision={2}
                                    onChange={(value) => updateBar(selectedBar.id, 'opacity', value)}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="relative">
                                    <ColorField
                                        label="Border color"
                                        value={selectedBar.borderColor}
                                        onChange={(value) => updateBar(selectedBar.id, 'borderColor', value)}
                                        disabled={!settings.showBorder}
                                    />
                                    {!settings.showBorder && (
                                        <div
                                            className="absolute inset-0 cursor-help rounded-md border border-red-400/20 bg-red-500/5"
                                            title="Enable 'Show border' in Barplot Style to modify border color"
                                        >
                                            <div className="flex items-center justify-center h-full">
                                                <span className="text-xs text-red-400/70 font-medium">Disabled</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="relative">
                                    <NumericInput
                                        title="Border opacity"
                                        value={selectedBar.borderOpacity}
                                        min={0}
                                        max={1}
                                        step={0.05}
                                        precision={2}
                                        onChange={(value) => updateBar(selectedBar.id, 'borderOpacity', value)}
                                        disabled={!settings.showBorder}
                                    />
                                    {!settings.showBorder && (
                                        <div
                                            className="absolute inset-0 cursor-help rounded-md border border-red-400/20 bg-red-500/5"
                                            title="Enable 'Show border' in Barplot Style to modify border opacity"
                                        >
                                            <div className="flex items-center justify-center h-full">
                                                <span className="text-xs text-red-400/70 font-medium">Disabled</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <SelectField<BarPattern>
                                    label="Pattern"
                                    value={selectedBar.pattern}
                                    onChange={(value) => updateBar(selectedBar.id, 'pattern', value)}
                                    options={patternOptions}
                                    placeholder="Select pattern"
                                />
                                <NumericInput
                                    title="Pattern size"
                                    value={selectedBar.patternSize}
                                    min={2}
                                    max={64}
                                    step={1}
                                    precision={0}
                                    onChange={(value) => updateBar(selectedBar.id, 'patternSize', value)}
                                    disabled={!isPatternActive}
                                    suffix="px"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <ColorField
                                    label="Pattern color"
                                    value={selectedBar.patternColor}
                                    onChange={(value) => updateBar(selectedBar.id, 'patternColor', value)}
                                    disabled={!isPatternActive}
                                />
                                <NumericInput
                                    title="Pattern opacity"
                                    value={selectedBar.patternOpacity}
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    precision={2}
                                    onChange={(value) => updateBar(selectedBar.id, 'patternOpacity', value)}
                                    disabled={!isPatternActive}
                                />
                            </div>
                        </div>
                    )
                })()}
            </div>
        ) : null
    }
}