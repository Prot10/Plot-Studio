import { BarChart3, ScatterChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../shared/hooks/useDocumentTitle';
import type { PlotType } from '../types/base';

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

export function PlotSelectionPage() {
    const navigate = useNavigate();
    useDocumentTitle('Chart Studio - Professional Data Visualization Tool');

    const handleSelectPlotType = (plotType: PlotType) => {
        navigate(`/${plotType}`);
    };

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <header className="border-b border-white/10 bg-black/20 backdrop-blur">
                <div className="w-full px-4 sm:px-6 py-6 sm:py-8 text-center text-white">
                    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <img src="/chart-icon.svg" alt="Chart Studio" className="w-8 h-8 sm:w-12 sm:h-12" />
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight">Chart Studio</h1>
                    </div>
                    <p className="mt-3 sm:mt-4 text-lg sm:text-xl lg:text-2xl text-white/70">
                        Create stunning visualizations with professional precision
                    </p>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg text-white/50">
                        Choose your plot type to get started
                    </p>
                </div>
            </header>

            <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
                <div className="mx-auto max-w-6xl">
                    <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
                        {plotTypes.map((plotType) => {
                            const IconComponent = plotType.icon;
                            const isDisabled = plotType.type === 'scatter';

                            if (isDisabled) {
                                return (
                                    <div
                                        key={plotType.type}
                                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-8 text-left opacity-70 cursor-not-allowed w-full max-w-sm"
                                        aria-disabled={true}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${plotType.gradient} opacity-5`} />

                                        <div className="relative z-10">
                                            <div className={`inline-flex rounded-xl bg-gradient-to-br ${plotType.gradient} p-3 text-white/60 shadow-lg filter grayscale`}>
                                                <IconComponent className="h-8 w-8" />
                                            </div>

                                            <h3 className="mt-6 text-2xl font-semibold text-white/70">
                                                {plotType.title}
                                            </h3>

                                            <p className="mt-3 text-white/50 leading-relaxed">
                                                Coming next...
                                            </p>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <button
                                    key={plotType.type}
                                    onClick={() => handleSelectPlotType(plotType.type)}
                                    className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 p-6 sm:p-8 text-left transition-all duration-300 hover:border-white/20 hover:bg-black/40 hover:shadow-2xl backdrop-blur w-full max-w-sm"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${plotType.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-10`} />

                                    <div className="relative z-10">
                                        <div className={`inline-flex rounded-xl bg-gradient-to-br ${plotType.gradient} p-3 text-white shadow-lg`}>
                                            <IconComponent className="h-8 w-8" />
                                        </div>

                                        <h3 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-semibold text-white">
                                            {plotType.title}
                                        </h3>

                                        <p className="mt-2 sm:mt-3 text-sm sm:text-base text-white/70 leading-relaxed">
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