import { LeftPanel } from '../../../shared/components/LeftPanel';
import { createTitleBlock, createAxisSyncButton, type LeftPanelBlock } from '../../../shared/utils/leftPanelHelpers';
import { GeneralSettingsBlock } from './LeftPanel/GeneralSettingsBlock';
import { ValueLabelsBlock } from './LeftPanel/ValueLabelsBlock';
import { XAxisBlock } from './LeftPanel/XAxisBlock';
import { YAxisBlock } from './LeftPanel/YAxisBlock';
import { GridBlock } from './LeftPanel/GridBlock';
import { AdditionalTextManager } from './LeftPanel/AdditionalTextManager';
import { AdditionalImageManager } from './LeftPanel/AdditionalImageManager';
import type { BarChartSettings, BarDataPoint } from '../../../types/bar';
import type { FocusRequest, HighlightKey } from '../../../types/base';

type BarChartLeftPanelProps = {
  settings: BarChartSettings;
  bars: BarDataPoint[];
  onChange: (settings: BarChartSettings) => void;
  onBarsChange: (bars: BarDataPoint[]) => void;
  highlightSignals?: Partial<Record<HighlightKey, number>>;
  focusRequest?: FocusRequest | null;
}

export function BarChartLeftPanel({
  settings,
  bars,
  onChange,
  onBarsChange,
  highlightSignals,
  focusRequest
}: BarChartLeftPanelProps) {
  const update = <K extends keyof BarChartSettings>(key: K, value: BarChartSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const toggleAxesSync = (source: 'x' | 'y') => {
    const nextState = !settings.axesSynced;

    if (!nextState) {
      onChange({ ...settings, axesSynced: false });
      return;
    }

    const sourceAxis = source === 'x' ? settings.xAxis : settings.yAxis;
    const targetAxis = source === 'x' ? { ...settings.yAxis } : { ...settings.xAxis };

    // Sync specific fields between axes
    targetAxis.showAxisLines = sourceAxis.showAxisLines;
    targetAxis.axisLineWidth = sourceAxis.axisLineWidth;
    targetAxis.axisLineColor = sourceAxis.axisLineColor;
    targetAxis.showTickLabels = sourceAxis.showTickLabels;
    targetAxis.tickLabelColor = sourceAxis.tickLabelColor;
    targetAxis.tickLabelOrientation = sourceAxis.tickLabelOrientation;

    if (source === 'x') {
      onChange({
        ...settings,
        axesSynced: true,
        yAxis: targetAxis,
        yAxisTitleFontSize: settings.xAxisTitleFontSize,
        yAxisTickFontSize: settings.xAxisTickFontSize,
        xAxisTitleFontSize: settings.xAxisTitleFontSize,
        xAxisTickFontSize: settings.xAxisTickFontSize,
      });
    } else {
      onChange({
        ...settings,
        axesSynced: true,
        xAxis: targetAxis,
        xAxisTitleFontSize: settings.yAxisTitleFontSize,
        xAxisTickFontSize: settings.yAxisTickFontSize,
        yAxisTitleFontSize: settings.yAxisTitleFontSize,
        yAxisTickFontSize: settings.yAxisTickFontSize,
      });
    }
  };

  // Create the blocks using the GeneralSettingsBlock helper
  const generalSettings = GeneralSettingsBlock({ settings, bars, onChange, onBarsChange });
  const valueLabels = ValueLabelsBlock({ settings, onChange });
  const xAxisBlocks = XAxisBlock({ settings, onChange, focusRequest });
  const yAxisBlocks = YAxisBlock({ settings, onChange, focusRequest });
  const gridBlocks = GridBlock({ settings, onChange });

  const blocks: LeftPanelBlock[] = [
    // General Settings Block
    {
      id: 'general-settings',
      title: 'General Settings',
      highlightKey: 'chartBasics',
      sections: [
        {
          id: 'general-settings-main',
          content: generalSettings.generalSettings
        },
        {
          id: 'chart-dimensions',
          title: 'Chart Dimensions',
          content: generalSettings.chartDimensions
        },
        {
          id: 'plot-box',
          title: 'Plot Box',
          content: generalSettings.plotBoxSettings,
          toggle: {
            value: settings.showPlotBox,
            onChange: (value: boolean) => onChange({ ...settings, showPlotBox: value })
          }
        }
      ]
    },

    // Title & Subtitle Block
    createTitleBlock(settings, onChange, focusRequest, highlightSignals?.title),

    // X-Axis Block
    {
      id: 'x-axis',
      title: 'X-Axis',
      highlightKey: 'xAxis',
      headerActions: createAxisSyncButton(settings.axesSynced, () => toggleAxesSync('x')),
      sections: [
        {
          id: 'x-axis-title',
          title: 'Title',
          content: xAxisBlocks.title
        },
        {
          id: 'x-axis-appearance',
          title: 'Appearance',
          content: xAxisBlocks.appearance,
          toggle: {
            value: settings.xAxis.showAxisLines,
            onChange: (value: boolean) => onChange({
              ...settings,
              xAxis: { ...settings.xAxis, showAxisLines: value }
            })
          }
        },
        {
          id: 'x-axis-ticks',
          title: 'Ticks',
          content: xAxisBlocks.ticks,
          toggle: {
            value: settings.xAxis.showTickLabels,
            onChange: (value: boolean) => onChange({
              ...settings,
              xAxis: { ...settings.xAxis, showTickLabels: value }
            })
          }
        }
      ]
    },

    // Y-Axis Block
    {
      id: 'y-axis',
      title: 'Y-Axis',
      highlightKey: 'yAxis',
      headerActions: createAxisSyncButton(settings.axesSynced, () => toggleAxesSync('y')),
      sections: [
        {
          id: 'y-axis-title',
          title: 'Title',
          content: yAxisBlocks.title
        },
        {
          id: 'y-axis-appearance',
          title: 'Appearance',
          content: yAxisBlocks.appearance,
          toggle: {
            value: settings.yAxis.showAxisLines,
            onChange: (value: boolean) => onChange({
              ...settings,
              yAxis: { ...settings.yAxis, showAxisLines: value }
            })
          }
        },
        {
          id: 'y-axis-ticks',
          title: 'Ticks',
          content: yAxisBlocks.ticks,
          toggle: {
            value: settings.yAxis.showTickLabels,
            onChange: (value: boolean) => onChange({
              ...settings,
              yAxis: { ...settings.yAxis, showTickLabels: value }
            })
          }
        }
      ]
    },

    // Grid Block
    {
      id: 'grid',
      title: 'Grid',
      headerActions: gridBlocks.syncButton,
      sections: [
        {
          id: 'grid-vertical',
          title: 'Vertical',
          content: gridBlocks.vertical,
          toggle: {
            value: settings.xAxis.showGridLines,
            onChange: (value: boolean) => onChange({
              ...settings,
              xAxis: { ...settings.xAxis, showGridLines: value }
            })
          }
        },
        {
          id: 'grid-horizontal',
          title: 'Horizontal',
          content: gridBlocks.horizontal,
          toggle: {
            value: settings.yAxis.showGridLines,
            onChange: (value: boolean) => onChange({
              ...settings,
              yAxis: { ...settings.yAxis, showGridLines: value }
            })
          }
        }
      ]
    },

    // Value Labels Block
    {
      id: 'value-labels',
      title: 'Value Labels',
      highlightKey: 'valueLabels',
      sections: [
        {
          id: 'value-labels-settings',
          title: 'Settings',
          content: valueLabels.settings,
          toggle: {
            value: settings.showValueLabels,
            onChange: (value: boolean) => onChange({ ...settings, showValueLabels: value })
          }
        }
      ]
    },

    // Additional Elements Block
    {
      id: 'additional-elements',
      title: 'Additional Elements',
      sections: [
        {
          id: 'text-elements',
          content: (
            <AdditionalTextManager
              textElements={settings.additionalTextElements}
              onChange={(textElements) => update('additionalTextElements', textElements)}
            />
          ),
          className: 'border-b border-white/10 pb-6'
        },
        {
          id: 'image-elements',
          content: (
            <AdditionalImageManager
              imageElements={settings.additionalImageElements}
              onChange={(imageElements) => update('additionalImageElements', imageElements)}
            />
          )
        }
      ]
    }
  ];

  return (
    <LeftPanel
      blocks={blocks}
      highlightSignals={highlightSignals}
      focusRequest={focusRequest}
    />
  );
}