import { Routes, Route, Navigate } from 'react-router-dom';
import { PlotSelectionPage } from './pages/PlotSelectionPage';
import { BarChartPage } from './plots/bar/BarChartPage';
import { ScatterPlotPage } from './plots/scatter/ScatterPlotPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PlotSelectionPage />} />
      <Route path="/bar" element={<BarChartPage />} />
      <Route path="/scatter" element={<ScatterPlotPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
