import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download, Eraser, SlidersHorizontal, Sparkles, UploadCloud } from 'lucide-react';
import { ChartActionMenu } from '../../shared/components/ChartActionMenu';
import { ChartPageBlock, ChartPageLayout } from '../../shared/components/ChartPageLayout';
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
const DEFAULT_DATA_LENGTH = defaultBarChartSettings.data.length;

function buildDefaultData(paletteName: PaletteKey) {
    return Array.from({ length: DEFAULT_DATA_LENGTH }, (_, index) => createBar(index, paletteName));
}

function buildDefaultSettings(): BarChartSettings {
    return {
        ...defaultBarChartSettings,
        data: buildDefaultData(defaultBarChartSettings.paletteName),
        xAxis: { ...defaultBarChartSettings.xAxis },
        yAxis: { ...defaultBarChartSettings.yAxis },
    };
}

interface BarChartPageProps {
    onBack: () => void;
}

export function BarChartPage({ onBack }: BarChartPageProps) {
    const [settings, setSettings] = useState<BarChartSettings>(defaultBarChartSettings);
    const [isHydrated, setIsHydrated] = useState(false);
    const [highlightSignals, setHighlightSignals] = useState<Record<HighlightKey, number>>({
        chartBasics: 0,
        yAxis: 0,
        xAxis: 0,
        data: 0,
        design: 0,
        barDesign: 0,
        valueLabels: 0,
        errorBars: 0,
    });
    const focusRequestIdRef = useRef(0);
    const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
    const [previewAction, setPreviewAction] = useState<'importData' | 'exportChart' | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || isHydrated) return;

        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                setIsHydrated(true);
                return;
            }

            const parsed = JSON.parse(stored);
            const storedSettings: Partial<BarChartSettings> | undefined =
                parsed?.settings ?? parsed;

            if (!storedSettings || typeof storedSettings !== 'object') {
                setIsHydrated(true);
                return;
            }

            const mergedPalette = storedSettings.paletteName ?? defaultBarChartSettings.paletteName;

            const mergedDataSource = Array.isArray(storedSettings.data)
                ? storedSettings.data
                : defaultBarChartSettings.data;

            const mergedData = mergedDataSource.map((bar, index) => {
                const defaults = createBar(index, mergedPalette);
                return {
                    ...defaults,
                    ...bar,
                    fillColor: bar?.fillColor ?? defaults.fillColor,
                    borderColor: bar?.borderColor ?? defaults.borderColor,
                    borderWidth: typeof bar?.borderWidth === 'number' ? bar.borderWidth : defaults.borderWidth,
                    opacity: typeof bar?.opacity === 'number' ? bar.opacity : defaults.opacity,
                    error: typeof bar?.error === 'number' ? bar.error : defaults.error,
                    pattern: (bar?.pattern as BarDataPoint['pattern']) ?? defaults.pattern,
                    patternColor: typeof bar?.patternColor === 'string' ? bar.patternColor : defaults.patternColor,
                    patternOpacity:
                        typeof bar?.patternOpacity === 'number' ? bar.patternOpacity : defaults.patternOpacity,
                    patternSize: typeof bar?.patternSize === 'number' ? bar.patternSize : defaults.patternSize,
                };
            });

            const mergedSettings: BarChartSettings = {
                ...defaultBarChartSettings,
                ...storedSettings,
                paletteName: mergedPalette,
                data: mergedData,
            };

            setSettings(mergedSettings);
        } catch (error) {
            console.warn('Failed to load saved chart state', error);
        } finally {
            setIsHydrated(true);
        }
    }, [isHydrated]);

    useEffect(() => {
        if (!isHydrated || typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings }));
        } catch (error) {
            console.warn('Failed to save chart state', error);
        }
    }, [settings, isHydrated]);

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

    const basicsHighlight = useHighlightEffect(highlightSignals.chartBasics);
    const dataHighlight = useHighlightEffect(highlightSignals.data);
    const controlsHighlightSignal =
        (highlightSignals.design ?? 0) +
        (highlightSignals.valueLabels ?? 0) +
        (highlightSignals.errorBars ?? 0) +
        (highlightSignals.xAxis ?? 0) +
        (highlightSignals.yAxis ?? 0);
    const controlsSignalValue = controlsHighlightSignal === 0 ? undefined : controlsHighlightSignal;
    const controlsHighlight = useHighlightEffect(controlsSignalValue);

    const handleDataChange = (data: BarDataPoint[]) => {
        setSettings((current) => ({ ...current, data }));
    };

    const handleSettingsChange = (nextSettings: BarChartSettings) => {
        setSettings(nextSettings);
    };

    const handlePreviewActionHandled = useCallback(() => {
        setPreviewAction(null);
    }, []);

    const handleRequestImport = useCallback(() => {
        setPreviewAction('importData');
    }, []);

    const handleRequestExport = useCallback(() => {
        setPreviewAction('exportChart');
    }, []);

    const handleResetStudio = useCallback(() => {
        const defaults = buildDefaultSettings();
        setSettings(defaults);
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
        setSettings((current) => ({
            ...current,
            data: buildDefaultData(current.paletteName),
        }));
        triggerHighlight(['data']);
    }, [triggerHighlight]);

    const handleResetSettings = useCallback(() => {
        setSettings((current) => {
            const defaults = buildDefaultSettings();
            const paletteTemplate = defaults.data;
            const nextData = current.data.map((bar, index) => {
                const template = paletteTemplate[index % paletteTemplate.length];
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
    }, [triggerHighlight]);

    const actionMenuItems = useMemo(
        () => [
            { id: 'upload', label: 'Upload data', icon: UploadCloud, onClick: handleRequestImport },
            { id: 'clean-studio', label: 'Clean Studio', icon: Sparkles, onClick: handleResetStudio },
            { id: 'clean-data', label: 'Clean Data', icon: Eraser, onClick: handleResetData },
            { id: 'clean-settings', label: 'Clean Settings', icon: SlidersHorizontal, onClick: handleResetSettings },
            { id: 'export', label: 'Export chart', icon: Download, onClick: handleRequestExport },
        ],
        [handleRequestImport, handleResetStudio, handleResetData, handleResetSettings, handleRequestExport],
    );

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <header className="border-b border-white/10 bg-black/20 backdrop-blur">
                <div className="mx-auto w-full max-w-content px-6 py-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white hover:bg-white/20 transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                        <div className="text-center text-white flex-1">
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
                                settings={settings}
                                bars={settings.data}
                                onChange={handleSettingsChange}
                                onBarsChange={handleDataChange}
                                highlightSignals={highlightSignals}
                                focusRequest={focusRequest}
                            />
                        </ChartPageBlock>
                        <ChartPageBlock title="Data" highlighted={dataHighlight}>
                            <BarDataEditor
                                bars={settings.data}
                                paletteName={settings.paletteName}
                                onChange={handleDataChange}
                                highlightSignal={highlightSignals.data}
                                focusRequest={focusRequest}
                            />
                        </ChartPageBlock>
                    </>
                }
                center={
                    <>
                        <ChartActionMenu actions={actionMenuItems} />
                        <section className="rounded-3xl border border-white/10 bg-black/50 p-6 shadow-2xl backdrop-blur">
                            <ChartPreview
                                settings={settings}
                                onUpdateSettings={setSettings}
                                onHighlight={triggerHighlight}
                                onRequestFocus={requestFocus}
                                actionRequest={previewAction}
                                onActionHandled={handlePreviewActionHandled}
                            />
                        </section>
                    </>
                }
                right={
                    <div className={`flex flex-col gap-6 ${controlsHighlight ? 'highlight-pulse' : ''}`}>
                        <ChartControlsPanel
                            settings={settings}
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
