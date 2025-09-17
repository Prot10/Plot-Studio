import { BarChart3, ScatterChart } from 'lucide-react';
import type { PlotType } from '../types/base';

interface PlotSelectionPageProps {
    onSelectPlotType: (plotType: PlotType) => void;
}

interface PlotTypeOption {
    type: PlotType;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
}

const plotTypes: PlotTypeOption[] = [
    {
        type: 'bar',
        title: 'Bar Chart',
        description: 'Create beautiful bar charts with precise control over every detail. Perfect for comparing categories and showing data distributions.',
        icon: BarChart3,
        gradient: 'from-blue-500 to-purple-600',
    },
    {
        type: 'scatter',
        title: 'Scatter Plot',
        description: 'Visualize relationships between two variables with customizable scatter plots. Great for correlation analysis and trend identification.',
        icon: ScatterChart,
        gradient: 'from-green-500 to-blue-500',
    },
];

export function PlotSelectionPage({ onSelectPlotType }: PlotSelectionPageProps) {
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <header className="border-b border-white/10 bg-black/20 backdrop-blur">
                <div className="mx-auto w-full max-w-4xl px-6 py-8 text-center text-white">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Plot Studio</h1>
                    <p className="mt-4 text-xl text-white/70 sm:text-2xl">
                        Create stunning visualizations with professional precision
                    </p>
                    <p className="mt-2 text-base text-white/50 sm:text-lg">
                        Choose your plot type to get started
                    </p>
                </div>
            </header>

            <main className="flex-1 px-6 py-12">
                <div className="mx-auto max-w-4xl">
                    <div className="grid gap-8 md:grid-cols-2">
                        {plotTypes.map((plotType) => {
                            const IconComponent = plotType.icon;
                            return (
                                <button
                                    key={plotType.type}
                                    onClick={() => onSelectPlotType(plotType.type)}
                                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-8 text-left transition-all duration-300 hover:scale-105 hover:border-white/20 hover:bg-black/40 hover:shadow-2xl backdrop-blur"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${plotType.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-10`} />

                                    <div className="relative z-10">
                                        <div className={`inline-flex rounded-xl bg-gradient-to-br ${plotType.gradient} p-3 text-white shadow-lg`}>
                                            <IconComponent className="h-8 w-8" />
                                        </div>

                                        <h3 className="mt-6 text-2xl font-semibold text-white">
                                            {plotType.title}
                                        </h3>

                                        <p className="mt-3 text-white/70 leading-relaxed">
                                            {plotType.description}
                                        </p>

                                        <div className="mt-6 flex items-center text-sm font-medium text-white/80">
                                            <span>Create {plotType.title.toLowerCase()}</span>
                                            <svg
                                                className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-white/50">
                            More plot types coming soon! Stay tuned for line charts, histograms, and more.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}