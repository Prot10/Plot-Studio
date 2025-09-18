import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Database, Download, Settings, Sparkles, UploadCloud } from 'lucide-react';
import { ChartActionMenu } from '../../shared/components/ChartActionMenu';
import { ChartPageBlock, ChartPageLayout } from '../../shared/components/ChartPageLayout';
import { TitleSettingsPanel } from '../../shared/components/TitleSettingsPanel';
import { useHighlightEffect } from '../../shared/hooks/useHighlightEffect';
import { createBar } from '../../shared/utils/barFactory';
import type { BarChartSettings, BarDataPoint } from '../../types/bar';
import type { FocusRequest, FocusTarget, HighlightKey, PaletteKey } from '../../types/base';
import { BarDataEditor } from './components/BarDataEditor';
import { ChartBasicsPanel } from './components/ChartBasicsPanel';
import { ChartControlsPanel } from './components/ChartControlsPanel';
import { ChartPreview } from './components/ChartPreview';
import { defaultBarChartSettings } from './defaultSettings';

const STORAGE_KEY = 'barplot-studio-state-v1';
const STORAGE_VERSION = 2;
const DEFAULT_DATA_LENGTH = defaultBarChartSettings.data.length;

function buildDefaultData(paletteName: PaletteKey, length = DEFAULT_DATA_LENGTH) {
    return Array.from({ length }, (_, index) => createBar(index, paletteName));
}

function buildDefaultSettings(
    paletteName: PaletteKey = defaultBarChartSettings.paletteName,
    length = DEFAULT_DATA_LENGTH,
): BarChartSettings {
    return {
        ...defaultBarChartSettings,
        paletteName,
        data: buildDefaultData(paletteName, length),
        xAxis: { ...defaultBarChartSettings.xAxis },
        yAxis: { ...defaultBarChartSettings.yAxis },
    };
}

function mergeStoredSettings(stored?: Partial<BarChartSettings>): BarChartSettings {
    if (!stored || typeof stored !== 'object') {
        return buildDefaultSettings();
    }

    const paletteName = stored.paletteName ?? defaultBarChartSettings.paletteName;
    const storedData = Array.isArray(stored.data) ? stored.data : defaultBarChartSettings.data;
    const defaults = buildDefaultSettings(paletteName, Math.max(storedData.length, DEFAULT_DATA_LENGTH));

    const mergedData = storedData.map((bar, index) => {
        const template = createBar(index, paletteName);
        return {
            ...template,
            ...bar,
            fillColor: bar?.fillColor ?? template.fillColor,
            borderColor: bar?.borderColor ?? template.borderColor,
            borderWidth: typeof bar?.borderWidth === 'number' ? bar.borderWidth : template.borderWidth,
            opacity: typeof bar?.opacity === 'number' ? bar.opacity : template.opacity,
            error: typeof bar?.error === 'number' ? bar.error : template.error,
            pattern: (bar?.pattern as BarDataPoint['pattern']) ?? template.pattern,
            patternColor: typeof bar?.patternColor === 'string' ? bar.patternColor : template.patternColor,
            patternOpacity: typeof bar?.patternOpacity === 'number' ? bar.patternOpacity : template.patternOpacity,
            patternSize: typeof bar?.patternSize === 'number' ? bar.patternSize : template.patternSize,
        };
    });

    const xAxis = { ...defaultBarChartSettings.xAxis, ...stored.xAxis };
    const yAxis = { ...defaultBarChartSettings.yAxis, ...stored.yAxis };

    const titleColor = typeof stored.titleColor === 'string' ? stored.titleColor : defaults.titleColor;
    const titleFontFamily = stored.titleFontFamily ?? defaults.titleFontFamily;
    const titleIsBold = typeof stored.titleIsBold === 'boolean' ? stored.titleIsBold : defaults.titleIsBold;
    const titleIsItalic = typeof stored.titleIsItalic === 'boolean' ? stored.titleIsItalic : defaults.titleIsItalic;
    const titleIsUnderline = typeof stored.titleIsUnderline === 'boolean' ? stored.titleIsUnderline : defaults.titleIsUnderline;
    const titleOffsetX = typeof stored.titleOffsetX === 'number' ? stored.titleOffsetX : defaults.titleOffsetX;

    return {
        ...defaults,
        ...stored,
        paletteName,
        data: mergedData,
        xAxis,
        yAxis,
        titleColor,
        titleFontFamily,
        titleIsBold,
        titleIsItalic,
        titleIsUnderline,
        titleOffsetX,
    };
}

interface BarChartPageProps {
    onBack: () => void;
}

type PreviewAction = { type: 'importData' | 'exportChart'; target: 0 | 1 };

type PlotTuple = [BarChartSettings, BarChartSettings];

export function BarChartPage({ onBack }: BarChartPageProps) {
    const [plots, setPlots] = useState<PlotTuple>(() => [buildDefaultSettings(), buildDefaultSettings()]);
    const [activePlot, setActivePlot] = useState<0 | 1>(0);
    const [comparisonEnabled, setComparisonEnabled] = useState(false);
    const [previewAction, setPreviewAction] = useState<PreviewAction | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const [highlightSignals, setHighlightSignals] = useState<Record<HighlightKey, number>>({
        chartBasics: 0,
        yAxis: 0,
        xAxis: 0,
        data: 0,
        title: 0,
        design: 0,
        barDesign: 0,
        valueLabels: 0,
        errorBars: 0,
    });
    const focusRequestIdRef = useRef(0);
    const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || isHydrated) return;

        try {
            const storedRaw = window.localStorage.getItem(STORAGE_KEY);
            if (!storedRaw) {
                setIsHydrated(true);
                return;
            }

            const parsed = JSON.parse(storedRaw);

            if (parsed && Array.isArray(parsed.plots)) {
                const storedPlots = parsed.plots as Array<Partial<BarChartSettings> | undefined>;
                const nextPlots: PlotTuple = [
                    mergeStoredSettings(storedPlots[0]),
                    mergeStoredSettings(storedPlots[1]),
                ];
                setPlots(nextPlots);
                setActivePlot(parsed.activePlot === 1 ? 1 : 0);
                setComparisonEnabled(Boolean(parsed.comparisonEnabled));
            } else if (parsed?.settings) {
                const merged = mergeStoredSettings(parsed.settings as Partial<BarChartSettings>);
                setPlots([merged, buildDefaultSettings()]);
                setActivePlot(0);
                setComparisonEnabled(false);
            } else {
                setPlots([buildDefaultSettings(), buildDefaultSettings()]);
            }
        } catch (error) {
            console.warn('Failed to load saved chart state', error);
        } finally {
            setIsHydrated(true);
        }
    }, [isHydrated]);

    useEffect(() => {
        if (!isHydrated || typeof window === 'undefined') return;

        try {
            const payload = {
                version: STORAGE_VERSION,
                plots,
                activePlot,
                comparisonEnabled,
            };
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (error) {
            console.warn('Failed to save chart state', error);
        }
    }, [plots, activePlot, comparisonEnabled, isHydrated]);

    const setPlot = useCallback(
        (index: 0 | 1, updater: BarChartSettings | ((prev: BarChartSettings) => BarChartSettings)) => {
            setPlots((current) => {
                const next = current.slice() as PlotTuple;
                const previous = current[index];
                next[index] = typeof updater === 'function'
                    ? (updater as (prev: BarChartSettings) => BarChartSettings)(previous)
                    : updater;
                return next;
            });
        },
        [],
    );

    const triggerHighlight = useCallback((keys: HighlightKey[]) => {
        if (!keys.length) return;
        setHighlightSignals((prev) => {
            const next = { ...prev };
            keys.forEach((key) => {
                next[key] = (prev[key] ?? 0) + 1;
            });
            return next;
        });
    }, []);

    const requestFocus = useCallback((target: FocusTarget) => {
        focusRequestIdRef.current += 1;
        setFocusRequest({ target, requestId: focusRequestIdRef.current });
    }, []);

    const basicsHighlight = useHighlightEffect(highlightSignals?.chartBasics);
    const titleHighlight = useHighlightEffect(highlightSignals?.title);
    const dataHighlight = useHighlightEffect(highlightSignals.data);
    const controlsHighlightSignal =
        (highlightSignals.design ?? 0) +
        (highlightSignals.valueLabels ?? 0) +
        (highlightSignals.errorBars ?? 0) +
        (highlightSignals.xAxis ?? 0) +
        (highlightSignals.yAxis ?? 0);
    const controlsSignalValue = controlsHighlightSignal === 0 ? undefined : controlsHighlightSignal;
    const controlsHighlight = useHighlightEffect(controlsSignalValue);

    const activeSettings = plots[activePlot];

    const handleSettingsChange = useCallback(
        (nextSettings: BarChartSettings) => {
            setPlot(activePlot, nextSettings);
        },
        [activePlot, setPlot],
    );

    const handlePreviewActionHandled = useCallback(() => {
        setPreviewAction(null);
    }, []);

    const handleRequestImport = useCallback(() => {
        setPreviewAction({ type: 'importData', target: activePlot });
    }, [activePlot]);

    const handleRequestExport = useCallback(() => {
        setPreviewAction({ type: 'exportChart', target: activePlot });
    }, [activePlot]);

    const handleResetStudio = useCallback(() => {
        setPlots([buildDefaultSettings(), buildDefaultSettings()]);
        setActivePlot(0);
        setComparisonEnabled(false);
        setPreviewAction(null);
        setFocusRequest(null);
        triggerHighlight(['chartBasics', 'data']);
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.removeItem(STORAGE_KEY);
            } catch (error) {
                console.warn('Failed to clear saved chart state', error);
            }
        }
    }, [triggerHighlight]);

    const handleResetData = useCallback(() => {
        setPlot(activePlot, (current) => ({
            ...current,
            data: buildDefaultData(current.paletteName, Math.max(current.data.length, 1)),
        }));
        triggerHighlight(['data']);
    }, [activePlot, setPlot, triggerHighlight]);

    const handleResetSettings = useCallback(() => {
        setPlot(activePlot, (current) => {
            const defaults = buildDefaultSettings(current.paletteName, Math.max(current.data.length, DEFAULT_DATA_LENGTH));
            const nextData = current.data.map((bar, index) => {
                const template = createBar(index, current.paletteName);
                return {
                    ...bar,
                    fillColor: template.fillColor,
                    borderColor: template.borderColor,
                };
            });
            return {
                ...defaults,
                data: nextData,
            };
        });
        triggerHighlight(['chartBasics']);
    }, [activePlot, setPlot, triggerHighlight]);

    const handleToggleComparison = useCallback((enabled: boolean) => {
        setComparisonEnabled(enabled);
    }, []);

    const handleSelectPlot = useCallback((index: 0 | 1) => {
        setActivePlot(index);
    }, []);

    const handlePreviewFocus = useCallback(
        (index: 0 | 1, target: FocusTarget) => {
            if (activePlot !== index) {
                setActivePlot(index);
            }
            requestFocus(target);
        },
        [activePlot, requestFocus],
    );

    const actionMenuItems = useMemo(
        () => [
            { id: 'upload', label: 'Upload data', icon: UploadCloud, onClick: handleRequestImport },
            { id: 'clean-studio', label: 'Clean Studio', icon: Sparkles, onClick: handleResetStudio },
            { id: 'clean-data', label: 'Clean Data', icon: Database, onClick: handleResetData },
            { id: 'clean-settings', label: 'Clean Settings', icon: Settings, onClick: handleResetSettings },
            { id: 'export', label: 'Export chart', icon: Download, onClick: handleRequestExport },
        ],
        [handleRequestImport, handleResetStudio, handleResetData, handleResetSettings, handleRequestExport],
    );

    const previewIndices = comparisonEnabled ? [0, 1] : [activePlot];

    const previewHeading = useCallback(
        (index: 0 | 1) => {
            if (comparisonEnabled) {
                return `Live preview · Plot ${index + 1}`;
            }
            if (index === 0 && activePlot === 0) {
                return 'Live preview';
            }
            return `Live preview · Plot ${index + 1}`;
        },
        [comparisonEnabled, activePlot],
    );

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <header className="border-b border-white/10 bg-black/20 backdrop-blur">
                <div className="mx-auto w-full max-w-content px-6 py-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white transition-colors hover:bg-white/20"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                        <div className="flex-1 text-center text-white">
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Bar Chart Studio</h1>
                            <p className="mt-2 text-base text-white/60 sm:text-lg">
                                Build expressive bar charts with precise control over every detail.
                            </p>
                        </div>
                    </div>
                </div>
            </header>
            <ChartPageLayout
                left={
                    <>
                        <ChartPageBlock title="Chart basics" highlighted={basicsHighlight}>
                            <ChartBasicsPanel
                                settings={activeSettings}
                                bars={activeSettings.data}
                                onChange={handleSettingsChange}
                                onBarsChange={(bars) =>
                                    setPlot(activePlot, (current) => ({ ...current, data: bars }))
                                }
                                highlightSignals={highlightSignals}
                            />
                        </ChartPageBlock>
                        <ChartPageBlock title="Title" highlighted={titleHighlight}>
                            <TitleSettingsPanel
                                settings={activeSettings}
                                onChange={handleSettingsChange}
                                focusRequest={focusRequest}
                                highlightSignal={highlightSignals?.title}
                            />
                        </ChartPageBlock>
                        <ChartPageBlock title="Data" highlighted={dataHighlight}>
                            <BarDataEditor
                                bars={activeSettings.data}
                                paletteName={activeSettings.paletteName}
                                onChange={(bars) =>
                                    setPlot(activePlot, (current) => ({ ...current, data: bars }))
                                }
                                highlightSignal={highlightSignals.data}
                                focusRequest={focusRequest}
                            />
                        </ChartPageBlock>
                    </>
                }
                center={
                    <>
                        <ChartActionMenu
                            comparison={{
                                comparisonEnabled,
                                activePlot,
                                onToggleComparison: handleToggleComparison,
                                onSelectPlot: handleSelectPlot,
                            }}
                            actions={actionMenuItems}
                        />
                        <section className="rounded-3xl border border-white/10 bg-black/50 p-6 shadow-2xl backdrop-blur">
                            <div className={previewIndices.length > 1 ? 'space-y-6' : undefined}>
                                {previewIndices.map((index) => {
                                    const plotIndex = index as 0 | 1;
                                    return (
                                        <ChartPreview
                                            key={`preview-${plotIndex}`}
                                            settings={plots[plotIndex]}
                                            onUpdateSettings={(next) => setPlot(plotIndex, next)}
                                            onHighlight={triggerHighlight}
                                            onRequestFocus={(target) => handlePreviewFocus(plotIndex, target)}
                                            actionRequest={previewAction?.target === plotIndex ? previewAction.type : null}
                                            onActionHandled={handlePreviewActionHandled}
                                            heading={previewHeading(plotIndex)}
                                            isActive={activePlot === plotIndex}
                                            onActivate={() => handleSelectPlot(plotIndex)}
                                        />
                                    );
                                })}
                            </div>
                        </section>
                    </>
                }
                right={
                    <div className={`flex flex-col gap-6 ${controlsHighlight ? 'highlight-pulse' : ''}`}>
                        <ChartControlsPanel
                            settings={activeSettings}
                            onChange={handleSettingsChange}
                            highlightSignals={highlightSignals}
                            focusRequest={focusRequest}
                        />
                    </div>
                }
            />
        </div>
    );
}
