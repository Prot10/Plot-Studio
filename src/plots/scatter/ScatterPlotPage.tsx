import { useEffect, useState } from 'react';
import { useHighlightEffect } from '../../shared/hooks/useHighlightEffect';
import type { HighlightKey } from '../../types/base';
import type { ScatterPlotSettings } from '../../types/scatter';
import { defaultScatterPlotSettings } from './defaultSettings';

const STORAGE_KEY = 'scatterplot-studio-state-v1';

interface ScatterPlotPageProps {
    onBack: () => void;
}

export function ScatterPlotPage({ onBack }: ScatterPlotPageProps) {
    const [settings, setSettings] = useState<ScatterPlotSettings>(defaultScatterPlotSettings);
    const [isHydrated, setIsHydrated] = useState(false);
    const [highlightSignals] = useState<Record<HighlightKey, number>>({
        chartBasics: 0,
        yAxis: 0,
        xAxis: 0,
        data: 0,
        design: 0,
        barDesign: 0,
        valueLabels: 0,
        errorBars: 0,
    });

    // Load from localStorage
    useEffect(() => {
        if (typeof window === 'undefined' || isHydrated) return;

        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                const storedSettings = parsed?.settings ?? parsed;
                if (storedSettings && typeof storedSettings === 'object') {
                    setSettings({ ...defaultScatterPlotSettings, ...storedSettings });
                }
            }
        } catch (error) {
            console.warn('Failed to load saved chart state', error);
        } finally {
            setIsHydrated(true);
        }
    }, [isHydrated]);

    // Save to localStorage
    useEffect(() => {
        if (!isHydrated || typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings }));
        } catch (error) {
            console.warn('Failed to save chart state', error);
        }
    }, [settings, isHydrated]);

    const handleSettingsChange = (nextSettings: ScatterPlotSettings) => {
        setSettings(nextSettings);
    };

    const basicsHighlight = useHighlightEffect(highlightSignals.chartBasics);

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
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Scatter Plot Studio</h1>
                            <p className="mt-2 text-base text-white/60 sm:text-lg">
                                Visualize relationships between variables with beautiful scatter plots.
                            </p>
                        </div>
                    </div>
                </div>
            </header>
            <main className="mx-auto w-full max-w-content flex-1 px-6 py-8">
                <div className="grid gap-6 xl:grid-cols-[minmax(360px,460px)_minmax(520px,_1fr)_minmax(320px,380px)]">
                    <div className="flex flex-col gap-6">
                        <section
                            className={`rounded-2xl border border-white/10 bg-black/30 p-5 shadow-xl backdrop-blur ${basicsHighlight ? 'highlight-pulse' : ''}`}
                        >
                            <div className="text-white">
                                <h2 className="text-lg font-semibold">Chart</h2>
                                <p className="text-white/60 mt-2">Scatter plot basics panel will go here</p>
                            </div>
                        </section>
                        <section className="rounded-2xl border border-white/10 bg-black/30 p-5 shadow-xl backdrop-blur">
                            <div className="text-white">
                                <h2 className="text-lg font-semibold">Data Editor</h2>
                                <p className="text-white/60 mt-2">Point data editor will go here</p>
                                <div className="mt-4 space-y-2">
                                    {settings.data.map((point, index) => (
                                        <div key={point.id} className="bg-white/10 p-3 rounded-lg">
                                            <p className="text-sm">Point {index + 1}: ({point.x}, {point.y})</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                    <section className="rounded-3xl border border-white/10 bg-black/50 p-6 shadow-2xl backdrop-blur">
                        <div className="text-white text-center">
                            <h2 className="text-lg font-semibold">Chart Preview</h2>
                            <p className="text-white/60 mt-2">Scatter plot preview will go here</p>
                            <div className="mt-8 h-64 bg-white/10 rounded-lg flex items-center justify-center">
                                <p className="text-white/40">Scatter Plot Preview Placeholder</p>
                            </div>
                        </div>
                    </section>
                    <section className="rounded-2xl border border-white/10 bg-black/30 p-5 shadow-xl backdrop-blur">
                        <div className="text-white">
                            <h2 className="text-lg font-semibold">Controls</h2>
                            <p className="text-white/60 mt-2">Point styling and advanced controls will go here</p>
                            <div className="mt-4 space-y-3">
                                <label className="flex flex-col gap-1 text-sm">
                                    <span className="text-xs uppercase tracking-wide text-white/50">Point Size</span>
                                    <input
                                        type="range"
                                        min={4}
                                        max={20}
                                        value={settings.defaultPointSize}
                                        onChange={(e) => handleSettingsChange({
                                            ...settings,
                                            defaultPointSize: Number(e.target.value)
                                        })}
                                        className="accent-sky-400"
                                    />
                                    <span className="text-xs text-white/40">{settings.defaultPointSize}px</span>
                                </label>
                                <label className="flex flex-col gap-1 text-sm">
                                    <span className="text-xs uppercase tracking-wide text-white/50">Opacity</span>
                                    <input
                                        type="range"
                                        min={0.1}
                                        max={1}
                                        step={0.1}
                                        value={settings.pointOpacity}
                                        onChange={(e) => handleSettingsChange({
                                            ...settings,
                                            pointOpacity: Number(e.target.value)
                                        })}
                                        className="accent-sky-400"
                                    />
                                    <span className="text-xs text-white/40">{(settings.pointOpacity * 100)}%</span>
                                </label>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}