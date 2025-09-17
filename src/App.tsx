import { useState } from 'react';
import { PlotSelectionPage } from './pages/PlotSelectionPage';
import { BarChartPage } from './plots/bar/BarChartPage';
import { ScatterPlotPage } from './plots/scatter/ScatterPlotPage';
import type { PlotType } from './types/base';

type AppState =
  | { page: 'selection' }
  | { page: 'editor'; plotType: PlotType };

function App() {
  const [appState, setAppState] = useState<AppState>({ page: 'selection' });

  const handleSelectPlotType = (plotType: PlotType) => {
    setAppState({ page: 'editor', plotType });
  };

  const handleBackToSelection = () => {
    setAppState({ page: 'selection' });
  };

  if (appState.page === 'selection') {
    return <PlotSelectionPage onSelectPlotType={handleSelectPlotType} />;
  }

  if (appState.page === 'editor') {
    switch (appState.plotType) {
      case 'bar':
        return <BarChartPage onBack={handleBackToSelection} />;
      case 'scatter':
        return <ScatterPlotPage onBack={handleBackToSelection} />;
      default:
        return <PlotSelectionPage onSelectPlotType={handleSelectPlotType} />;
    }
  }

  return <PlotSelectionPage onSelectPlotType={handleSelectPlotType} />;
}

export default App;
