import type { BaseChartSettings, HighlightKey, PaletteKey } from '../../types/base';
import { useHighlightEffect } from '../hooks/useHighlightEffect';
import { paletteOptions } from '../utils/palettes';
import { ColorField } from './ColorField';
import { SelectField } from './SelectField';

interface BaseChartBasicsPanelProps<TSettings extends BaseChartSettings> {
    settings: TSettings;
    onChange: (settings: TSettings) => void;
    highlightSignals?: Partial<Record<HighlightKey, number>>;
    onPaletteChange?: (nextPalette: PaletteKey) => void;
    children?: React.ReactNode; // For plot-specific controls
}

export function BaseChartBasicsPanel<TSettings extends BaseChartSettings>({
    settings,
    onChange,
    highlightSignals,
    onPaletteChange,
    children,
}: BaseChartBasicsPanelProps<TSettings>) {
    const update = <K extends keyof TSettings>(key: K, value: TSettings[K]) => {
        onChange({ ...settings, [key]: value });
    };

    const panelHighlight = useHighlightEffect(highlightSignals?.chartBasics);
    const yAxisHighlight = useHighlightEffect(highlightSignals?.yAxis);

    const handlePaletteChange = (nextPalette: PaletteKey) => {
        update('paletteName', nextPalette);
        onPaletteChange?.(nextPalette);
    };

    return (
        <section className={`space-y-3 ${panelHighlight ? 'highlight-pulse' : ''}`}>
            <h2 className="text-lg font-semibold text-white">Chart</h2>
            <label className="flex flex-col gap-1 text-sm text-white">
                <span className="text-xs uppercase tracking-wide text-white/50">Palette</span>
                <SelectField<PaletteKey>
                    label="Palette"
                    value={settings.paletteName}
                    onChange={(nextPalette) => handlePaletteChange(nextPalette)}
                    options={paletteOptions}
                    placeholder="Select a palette"
                />
            </label>
            <label className="flex flex-col gap-1 text-sm text-white">
                <span className="text-xs uppercase tracking-wide text-white/50">Inner padding</span>
                <input
                    type="number"
                    value={settings.canvasPadding}
                    min={0}
                    max={160}
                    step={4}
                    onChange={(event) => update('canvasPadding', Math.max(Number.parseFloat(event.target.value) || 0, 0))}
                    className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                />
                <span className="text-xs text-white/40">Space around the plot</span>
            </label>
            <ColorField
                label="Background"
                value={settings.backgroundColor}
                onChange={(value) => update('backgroundColor', value)}
            />
            <ColorField
                label="Value label color"
                value={settings.textColor}
                onChange={(value) => update('textColor', value)}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-white">
                    <span className="text-xs uppercase tracking-wide text-white/50">Custom width</span>
                    <input
                        type="number"
                        min={120}
                        step={10}
                        value={settings.customWidth ?? ''}
                        onChange={(event) => {
                            const val = event.target.value;
                            update('customWidth', val === '' ? null : Number.parseFloat(val));
                        }}
                        placeholder="auto"
                        className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm text-white">
                    <span className="text-xs uppercase tracking-wide text-white/50">Custom height</span>
                    <input
                        type="number"
                        min={120}
                        step={10}
                        value={settings.customHeight ?? ''}
                        onChange={(event) => {
                            const val = event.target.value;
                            update('customHeight', val === '' ? null : Number.parseFloat(val));
                        }}
                        placeholder="auto"
                        className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                    />
                </label>
            </div>
            <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${yAxisHighlight ? 'highlight-pulse' : ''}`}>
                <label className="flex flex-col gap-1 text-sm text-white">
                    <span className="text-xs uppercase tracking-wide text-white/50">Y min</span>
                    <input
                        type="number"
                        value={settings.yAxisMin ?? ''}
                        onChange={(event) => {
                            const val = event.target.value;
                            update('yAxisMin', val === '' ? null : Number.parseFloat(val));
                        }}
                        placeholder="auto"
                        className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm text-white">
                    <span className="text-xs uppercase tracking-wide text-white/50">Y max</span>
                    <input
                        type="number"
                        value={settings.yAxisMax ?? ''}
                        onChange={(event) => {
                            const val = event.target.value;
                            update('yAxisMax', val === '' ? null : Number.parseFloat(val));
                        }}
                        placeholder="auto"
                        className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm text-white">
                    <span className="text-xs uppercase tracking-wide text-white/50">Tick step</span>
                    <input
                        type="number"
                        value={settings.yAxisTickStep ?? ''}
                        onChange={(event) => {
                            const val = event.target.value;
                            update('yAxisTickStep', val === '' ? null : Number.parseFloat(val));
                        }}
                        min={0}
                        step={0.001}
                        placeholder="auto"
                        className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                    />
                </label>
            </div>
            <label className="flex flex-col gap-2 text-sm text-white">
                <span className="text-xs uppercase tracking-wide text-white/50">Aspect ratio</span>
                <input
                    type="range"
                    min={0.3}
                    max={1.2}
                    step={0.02}
                    value={settings.aspectRatio}
                    onChange={(event) => update('aspectRatio', Number.parseFloat(event.target.value))}
                    className="accent-sky-400"
                />
                <span className="text-xs text-white/40">
                    Height = width × {settings.aspectRatio.toFixed(2)}
                </span>
            </label>
            {children}
        </section>
    );
}
