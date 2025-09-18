# Plot Studio - Repository Structure Guide

This document explains the new repository structure designed to support multiple plot types with a scalable, reusable architecture.

## 🏗️ Architecture Overview

The repository has been restructured to support multiple plot types while maintaining code reusability and consistency. All plot types follow a **3-pane layout** pattern with shared components and utilities.

### Core Principles

1. **Scalability** - Easy to add new plot types
2. **Reusability** - Shared components, utilities, and types
3. **Consistency** - All plots follow the same 3-pane structure
4. **Type Safety** - Strong TypeScript typing throughout

## 📁 Directory Structure

```
src/
├── components/           # Legacy components (being phased out)
├── hooks/               # Legacy hooks (being phased out)
├── utils/               # Legacy utils (being phased out)
├── pages/               # Top-level application pages
│   └── PlotSelectionPage.tsx
├── plots/               # Plot-specific implementations
│   ├── bar/            # Bar chart implementation
│   │   ├── components/
│   │   │   ├── BarDataEditor.tsx
│   │   │   ├── LeftPanel.tsx
│   │   │   ├── RightPanel.tsx
│   │   │   └── ChartPreview.tsx
│   │   ├── BarChartPage.tsx
│   │   └── index.ts
│   └── scatter/        # Scatter plot implementation
│       ├── components/
│       ├── ScatterPlotPage.tsx
│       └── index.ts
├── shared/             # Shared resources across all plots
│   ├── components/     # Reusable UI components
│   │   └── ColorField.tsx
│   ├── hooks/          # Reusable React hooks
│   │   ├── useElementSize.ts
│   │   └── useHighlightEffect.ts
│   └── utils/          # Shared utility functions
│       ├── barFactory.ts
│       └── palettes.ts
├── types/              # TypeScript type definitions
│   ├── base.ts         # Base types for all plots
│   ├── bar.ts          # Bar chart specific types
│   └── scatter.ts      # Scatter plot specific types
├── App.tsx             # Main application router
├── main.tsx            # Application entry point
└── defaultSettings.ts  # Default configuration
```

## 🎯 Plot Types Architecture

### Base Types (`src/types/base.ts`)

All plot types extend from base interfaces:

```typescript
export interface BasePlotSettings {
  title: string;
  subtitle: string;
  // ... common settings
}

export interface BaseDataPoint {
  id: string;
  // ... common data properties
}
```

### Plot-Specific Types

Each plot type has its own type definitions:

- `src/types/bar.ts` - Bar chart types
- `src/types/scatter.ts` - Scatter plot types

### Legacy Compatibility

The type system maintains backward compatibility with legacy components through type aliases:

```typescript
// Legacy aliases for backward compatibility
export type HighlightKey = keyof typeof HIGHLIGHT_KEYS;
export type FocusTarget = keyof typeof FOCUS_TARGETS;
```

## 🔧 Adding a New Plot Type

To add a new plot type (e.g., "line"), follow these steps:

### 1. Create Type Definitions

Create `src/types/line.ts`:

```typescript
import { BasePlotSettings, BaseDataPoint } from "./base";

export interface LineChartSettings extends BasePlotSettings {
  // Line-specific settings
  lineWidth: number;
  showPoints: boolean;
  // ...
}

export interface LineDataPoint extends BaseDataPoint {
  // Line-specific data properties
  x: number;
  y: number;
  // ...
}
```

### 2. Create Plot Directory Structure

```
src/plots/line/
├── components/
│   ├── LineDataEditor.tsx
│   ├── LeftPanel.tsx             # General chart settings
│   ├── RightPanel.tsx            # Design + data controls
│   └── ChartPreview.tsx
├── LineChartPage.tsx
└── index.ts
```

### 3. Implement the 3-Pane Layout

Each plot type follows the same structure in its main page component:

```tsx
export default function LineChartPage() {
  const [settings, setSettings] = useState<LineChartSettings>(defaultSettings);
  const [data, setData] = useState<LineDataPoint[]>(defaultData);
  const [highlightSignals, setHighlightSignals] = useState<
    Record<HighlightKey, number>
  >({
    // Initialize all highlight keys
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Pane - General settings */}
      <div className="w-80 border-r bg-white">
        <LeftPanel
          settings={settings}
          data={data}
          onSettingsChange={setSettings}
          onDataChange={setData}
          highlightSignals={highlightSignals}
        />
      </div>

      {/* Middle Pane - Live preview */}
      <div className="flex-1 border-r bg-white">
        <ChartPreview
          settings={settings}
          data={data}
          highlightSignals={highlightSignals}
        />
      </div>

      {/* Right Pane - Design & data tools */}
      <div className="w-96 bg-white">
        <RightPanel
          settings={settings}
          data={data}
          onSettingsChange={setSettings}
          onDataChange={setData}
          highlightSignals={highlightSignals}
        />
      </div>
    </div>
  );
}
```

### 4. Add to Plot Selection

Update `src/pages/PlotSelectionPage.tsx` to include the new plot type:

```tsx
const plotTypes = [
  { id: "bar", name: "Bar Chart", icon: BarChart },
  { id: "scatter", name: "Scatter Plot", icon: Scatter },
  { id: "line", name: "Line Chart", icon: LineChart }, // Add this
];
```

### 5. Update App Router

Add the new route to `src/App.tsx`:

```tsx
import LineChartPage from "./plots/line/LineChartPage";

// In the router section:
{
  plotType === "line" && <LineChartPage />;
}
```

## 🔄 Shared Components

### Reusable Components

Components in `src/shared/components/` can be used across all plot types:

- `ColorField.tsx` - Color picker component
- Add more shared UI components as needed

### Shared Hooks

Hooks in `src/shared/hooks/` provide common functionality:

- `useElementSize.ts` - Track element dimensions
- `useHighlightEffect.ts` - Handle highlight animations

### Shared Utilities

Utilities in `src/shared/utils/` offer common functions:

- `palettes.ts` - Color palette definitions
- `barFactory.ts` - Chart generation utilities

## 🎨 The 3-Pane Layout

Every plot type follows the same consistent layout:

### Left Pane - Chart Basics

- Title and subtitle
- Dimensions (width/height)
- Basic chart configuration

### Middle Pane - Data Editor

- Data input and editing
- Import/export functionality
- Data validation

### Right Pane - Preview & Controls

- Live chart preview (top)
- Advanced styling controls (bottom)
- Export options

## 🔧 Working with Highlight System

The highlight system provides visual feedback across components:

```typescript
// All plots use the same highlight keys
const [highlightSignals, setHighlightSignals] = useState<
  Record<HighlightKey, number>
>({
  chartBasics: 0,
  yAxis: 0,
  xAxis: 0,
  data: 0,
  design: 0,
  barDesign: 0, // Legacy compatibility
  valueLabels: 0,
  errorBars: 0,
});

// Trigger highlights from any component
const triggerHighlight = (key: HighlightKey) => {
  setHighlightSignals((prev) => ({
    ...prev,
    [key]: prev[key] + 1,
  }));
};
```

## 🚀 Development Workflow

### Running the Application

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

### Adding New Features

1. **Start with types** - Define TypeScript interfaces first
2. **Follow the pattern** - Use existing plot types as templates
3. **Reuse when possible** - Leverage shared components and utilities
4. **Maintain consistency** - Follow the 3-pane layout structure

### Best Practices

- **Strong typing** - Always define proper TypeScript types
- **Component isolation** - Keep plot-specific logic in plot folders
- **Shared utilities** - Extract common functionality to shared folder
- **Legacy compatibility** - Maintain backward compatibility when refactoring

## 📝 Migration Notes

### From Legacy Structure

The old structure had all components in a flat `src/components/` folder. The new structure:

- **Maintains all functionality** - No features were removed
- **Improves organization** - Clear separation of concerns
- **Enables scaling** - Easy to add new plot types
- **Preserves compatibility** - Legacy type aliases ensure old code works

### Breaking Changes

- Import paths have changed for plot-specific components
- Some property names were standardized (e.g., `bars` → `data`)
- Type definitions were reorganized but maintain compatibility

## 🎯 Future Enhancements

The new structure enables:

1. **Easy plot type addition** - Follow the established pattern
2. **Shared component library** - Build reusable UI components
3. **Plugin architecture** - Potential for plot type plugins
4. **Better testing** - Isolated components are easier to test
5. **Documentation generation** - Structured types enable auto-docs

## 🤝 Contributing

When adding new features:

1. Follow the established folder structure
2. Define types first in the appropriate `src/types/*.ts` file
3. Create components in the plot-specific folder
4. Add shared utilities to `src/shared/` if reusable
5. Update this documentation as needed

---

This structure provides a solid foundation for scaling Plot Studio to support many different chart types while maintaining code quality and developer experience.
