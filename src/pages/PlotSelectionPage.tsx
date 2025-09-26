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
    backgroundImage?: string;
}

const plotTypes: PlotTypeOption[] = [
    {
        type: 'bar',
        title: 'Bar Chart',
        description: 'Create beautiful bar charts with precise control over styling and data presentation.',
        icon: BarChart3,
        gradient: 'from-blue-500 to-purple-600',
        backgroundImage: '/barplot.png',
    },
    {
        type: 'scatter',
        title: 'Scatter Plot',
        description: 'Visualize relationships between variables with customizable scatter plots.',
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
                            const isDisabled = plotType.type === 'scatter';

                            if (isDisabled) {
                                return (
                                    <div
                                        key={plotType.type}
                                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 text-left opacity-70 cursor-not-allowed w-full max-w-sm h-80"
                                        aria-disabled={true}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${plotType.gradient} opacity-5`} />

                                        {/* Gradient overlay for fading effect */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-transparent" />

                                        <div className="relative z-10 p-6 h-full flex flex-col">
                                            <h3 className="text-2xl font-semibold text-white/70 mb-3">
                                                {plotType.title}
                                            </h3>

                                            <p className="text-white/50 leading-relaxed">
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
                                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 text-left transition-all duration-300 hover:border-white/20 hover:shadow-2xl backdrop-blur w-full max-w-sm h-96"
                                >
                                    {/* Background image */}
                                    {plotType.backgroundImage && (
                                        <div
                                            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                                            style={{
                                                backgroundImage: `url(${plotType.backgroundImage})`,
                                                backgroundPosition: 'center bottom',
                                            }}
                                        />
                                    )}

                                    {/* Gradient overlay for fading effect - invisible at top, fully visible at bottom */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/70 to-black/30 transition-opacity duration-300 group-hover:from-black/90 group-hover:via-black/60 group-hover:to-black/20" />

                                    <div className="relative z-10 p-6 h-full flex flex-col">
                                        <h3 className="text-2xl font-semibold text-white mb-3">
                                            {plotType.title}
                                        </h3>

                                        <p className="text-white/80 leading-relaxed mb-4 flex-grow">
                                            {plotType.description}
                                        </p>

                                        <div className="flex items-center text-sm font-medium text-white/90 mt-auto">
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