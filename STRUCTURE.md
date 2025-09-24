# Chart Studio Structure

This document outlines the complete architecture and organization of the Chart Studio application.

## 🏗️ Architecture Overview

The Chart Studio uses a highly modular panel system built around the concept of **blocks**. The architecture has been designed to support multiple chart types while maintaining code reusability and consistency. All chart types follow a **3-panel layout** pattern with shared components and utilities.

### Core Principles

1. **Modular Blocks** - Settings organized into reusable, composable blocks
2. **Shared Abstractions** - Generic panel components that work across chart types  
3. **Type Safety** - Strong TypeScript typing with generic interfaces
4. **Scalability** - Easy to add new chart types following established patterns

## 📁 Directory Structure

```
src/
├── components/           # Legacy shared components (being phased out)
├── pages/               # Page-level components (PlotSelectionPage)
├── plots/               # Chart-specific implementations
│   ├── bar/            # Bar chart implementation
│   └── scatter/        # Scatter plot implementation (placeholder)
├── shared/             # Shared utilities, hooks, and components
├── types/              # TypeScript type definitions
└── assets/             # Static assets
```

## Chart Implementation Architecture

### Modular Panel System

The chart studio uses a highly modular panel system built around the concept of **blocks**. Each chart page is composed of three main panels:

1. **LeftPanel**: Settings and configuration blocks
2. **CentralPanel**: Preview and data editing blocks  
3. **RightPanel**: Individual element styling blocks

### Bar Chart Implementation

```
plots/bar/
├── BarChartPage.tsx              # Main page orchestrator
├── defaultSettings.ts            # Default chart settings
└── components/
    ├── BarChartLeftPanel.tsx     # Left panel composer (uses blocks)
    ├── BarChartCentralPanel.tsx  # Central panel composer
    ├── BarChartRightPanel.tsx    # Right panel composer
    ├── LeftPanel/               # Left panel building blocks
    │   ├── GeneralSettingsBlock.tsx
    │   ├── ValueLabelsBlock.tsx
    │   ├── XAxisPanel.tsx
    │   ├── YAxisPanel.tsx
    │   ├── axisSync.ts
    │   ├── AdditionalTextManager.tsx
    │   └── AdditionalImageManager.tsx
    ├── CentralPanel/            # Central panel building blocks
    │   ├── ChartPreviewBlock.tsx
    │   ├── DataTableBlock.tsx
    │   ├── ChartPreview.tsx
    │   ├── DataTable.tsx
    │   └── DataImportDialog.tsx
    └── RightPanel/              # Right panel building blocks
        ├── BarAppearanceBlock.tsx
        ├── ErrorBarsBlock.tsx
        ├── BarDesignBlock.tsx
        ├── RightPanel.tsx
        └── BarDataEditor.tsx
```

## Shared Components System

The `src/shared/` directory provides the foundation for the modular system:

```
shared/
├── components/          # Core shared components
│   ├── BlockGroups.tsx       # Main block container component
│   ├── LeftPanel.tsx         # Generic left panel composer
│   ├── CentralPanel.tsx      # Generic central panel composer
│   ├── RightPanel.tsx        # Generic right panel composer
│   ├── AutoNumericInput.tsx  # Auto/manual input with lock
│   ├── Toggle.tsx            # Unified toggle component
│   ├── AxisSyncButton.tsx    # Axis synchronization button
│   ├── ChartPage.tsx         # Page layout wrapper
│   ├── ChartPageLayout.tsx   # 3-column responsive layout
│   ├── ColorField.tsx        # Color picker component
│   ├── FontPicker.tsx        # Font selection component
│   ├── GroupComponents.tsx   # Responsive component grouping
│   ├── NumericInput.tsx      # Numeric input with slider
│   ├── SelectField.tsx       # Dropdown selection
│   ├── TextInput.tsx         # Text input component
│   ├── TextStyleControls.tsx # Bold/italic/underline controls
│   └── TitleSettingsPanel.tsx # Title/subtitle settings
├── constants/           # Shared constants
│   └── fonts.ts
├── hooks/              # Reusable React hooks
│   ├── useDocumentTitle.ts
│   ├── useElementSize.ts
│   └── useHighlightEffect.ts
└── utils/              # Utility functions and helpers
    ├── barFactory.ts
    ├── chartHelpers.ts
    └── palettes.ts
```

## Building Blocks System

### Block Structure

Every panel is composed of **blocks**. Each block has:

```typescript
interface Block {
  id: string;                    // Unique identifier
  title: string;                 // Display title
  sections: Section[];           // Content sections
  defaultExpanded?: boolean;     // Initial state
  actions?: ReactNode;           // Header actions
  headerActions?: ReactNode;     // First-row actions (like sync buttons)
  highlightKey?: string;         // For highlighting effects
}

interface Section {
  id: string;                    // Unique identifier  
  title?: string;                // Optional section title
  content: ReactNode;            // Actual content
  className?: string;            // Additional styling
  disabled?: boolean;            // Whether section is disabled
}
```

### Creating Blocks

Blocks are created using specialized block functions:

```typescript
// General Settings Block
const generalSettings = GeneralSettingsBlock({ settings, bars, onChange, onBarsChange });

// Returns structured content:
// - generalSettings.generalSettings
// - generalSettings.chartSettings  
// - generalSettings.chartDimensions
// - generalSettings.plotBoxSettings

// Value Labels Block
const valueLabels = ValueLabelsBlock({ settings, onChange });

// Returns structured content:
// - valueLabels.toggleAndFontSize
// - valueLabels.colorAndOffsets
```

### Panel Composers

Each chart type has three panel composers that assemble blocks:

```typescript
// BarChartLeftPanel.tsx - Assembles left panel blocks
export function BarChartLeftPanel({ settings, bars, onChange, ... }) {
  const blocks: LeftPanelBlock[] = [
    {
      id: 'general-settings',
      title: 'General Settings', 
      sections: [
        { id: 'main', content: generalSettings.generalSettings },
        { id: 'dimensions', title: 'Chart Dimensions', content: generalSettings.chartDimensions }
      ]
    },
    createTitleBlock(settings, onChange, focusRequest, highlightSignals?.title),
    // ... more blocks
  ];
  
  return <LeftPanel blocks={blocks} highlightSignals={highlightSignals} />;
}
```

### Core Building Block Components

The shared component library provides essential UI elements:

#### BlockGroups.tsx
Main container component that renders collapsible sections with highlighting:
```typescript
interface BlockGroupsProps {
  blocks: Block[];
  highlightSignals?: Record<string, number>;
}
```

#### AutoNumericInput.tsx
Input component with auto/manual toggle and lock mechanism:
```typescript
interface AutoNumericInputProps {
  value: number;
  isAuto: boolean;
  autoValue?: number;
  onValueChange: (value: number) => void;
  onAutoChange: (isAuto: boolean) => void;
  // ... other props
}
```

#### Toggle.tsx
Unified toggle switch component:
```typescript
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  // ... other props
}
```

#### AxisSyncButton.tsx
Button for synchronizing axis properties:
```typescript
interface AxisSyncButtonProps {
  onSync: () => void;
  tooltip?: string;
}
```

## Panel System Architecture

### Left Panel Structure
The left panel contains general chart settings organized into expandable blocks:
- **General Settings**: Chart type, dimensions, basic configuration
- **Title Settings**: Main title and subtitle configuration
- **X-Axis Settings**: X-axis labels, styling, and behavior
- **Y-Axis Settings**: Y-axis labels, styling, and behavior
- **Value Labels**: Data point label configuration
- **Additional Text**: Custom text overlays
- **Additional Images**: Custom image overlays

### Central Panel Structure
The central panel provides data editing and chart preview:
- **Chart Preview**: Live chart rendering with highlighting
- **Data Table**: Inline data editing with CSV import/export

### Right Panel Structure
The right panel focuses on individual element styling:
- **Bar Appearance**: Individual bar styling and colors
- **Error Bars**: Error bar configuration and styling
- **Bar Design**: Advanced bar design options

## Creating New Chart Types

To add a new chart type (e.g., line chart):

### 1. Create Directory Structure

```
src/plots/line/
├── LineChartPage.tsx
├── defaultSettings.ts
└── components/
    ├── LineChartLeftPanel.tsx
    ├── LineChartCentralPanel.tsx
    ├── LineChartRightPanel.tsx
    ├── LeftPanel/
    │   ├── LineSettingsBlock.tsx
    │   └── LineStyleBlock.tsx
    ├── CentralPanel/
    │   └── LinePreviewBlock.tsx
    └── RightPanel/
        └── LinePointsBlock.tsx
```

### 2. Define Types

```typescript
// src/types/line.ts
export interface LineDataPoint extends BaseDataPoint {
  x: number;
  y: number;
  // ... line-specific properties
}

export interface LineChartSettings extends PlotSettings<LineDataPoint> {
  showLines: boolean;
  lineWidth: number;
  // ... line-specific settings
}
```

### 3. Create Building Blocks

Each block returns structured content objects:

```typescript
// LeftPanel/LineSettingsBlock.tsx
export function LineSettingsBlock({ settings, onChange }: LineSettingsBlockProps) {
  return {
    lineAppearance: (
      <div className="space-y-4">
        <Toggle
          checked={settings.showLines}
          onChange={(checked) => onChange({ ...settings, showLines: checked })}
          label="Show Lines"
        />
        <NumericInput
          label="Line Width"
          value={settings.lineWidth}
          onChange={(value) => onChange({ ...settings, lineWidth: value })}
        />
      </div>
    ),
    pointSettings: (
      <div className="space-y-4">
        {/* Point configuration JSX */}
      </div>
    ),
  };
}
```

### 4. Create Panel Composers

```typescript
// LineChartLeftPanel.tsx
export function LineChartLeftPanel({ settings, onChange, highlightSignals }: LineChartLeftPanelProps) {
  const lineSettings = LineSettingsBlock({ settings, onChange });
  
  const blocks: LeftPanelBlock[] = [
    {
      id: 'line-settings',
      title: 'Line Settings',
      sections: [
        { id: 'appearance', content: lineSettings.lineAppearance },
        { id: 'points', content: lineSettings.pointSettings }
      ],
      defaultExpanded: true,
    },
    {
      id: 'title-settings',
      title: 'Title & Labels',
      sections: [
        { id: 'main', content: /* title configuration */ }
      ]
    },
    // ... more blocks
  ];
  
  return <LeftPanel blocks={blocks} highlightSignals={highlightSignals} />;
}
```

### 5. Create Main Page

```typescript
// LineChartPage.tsx
export function LineChartPage() {
  const [activeSettings, setActiveSettings] = useState<LineChartSettings>(defaultSettings);
  const [data, setData] = useState<LineDataPoint[]>([]);
  const [highlightSignals, setHighlightSignals] = useState<Record<string, number>>({});
  
  // ... state management logic
  
  return (
    <ChartPage
      title="Line Chart Studio"
      leftPanel={
        <LineChartLeftPanel 
          settings={activeSettings} 
          onChange={handleSettingsChange}
          highlightSignals={highlightSignals}
        />
      }
      centerPanel={
        <LineChartCentralPanel 
          chartPreview={/* chart preview component */}
          dataTable={/* data table component */}
        />
      }
      rightPanel={
        <LineChartRightPanel 
          settings={activeSettings} 
          onChange={handleSettingsChange}
        />
      }
    />
  );
}
```

### 6. Add to Route System

Update `src/pages/PlotSelectionPage.tsx` and `src/App.tsx` to include the new chart type.

## Helper Functions and Utilities

### Block Creation Helpers

Common patterns for creating blocks are abstracted into helper functions:

```typescript
// Creates a standard title block
export function createTitleBlock(
  settings: ChartSettings,
  onChange: (settings: ChartSettings) => void,
  focusRequest?: FocusRequestCallback,
  highlighted?: boolean
): LeftPanelBlock {
  return {
    id: 'title-settings',
    title: 'Title & Labels',
    sections: [
      {
        id: 'main',
        content: <TitleSettingsPanel /* ... */ />
      }
    ],
    highlightKey: 'title',
    defaultExpanded: true
  };
}
```

### Content Organization

Block content is organized using consistent patterns:

- **Settings Groups**: Related settings are grouped in `<div className="space-y-4">` containers
- **Input Pairs**: Related inputs use `<GroupComponents>` for responsive layout
- **Section Titles**: Optional section titles separate different areas within blocks
- **Disabled Sections**: Sections can be disabled based on other settings

## State Management

### Settings Flow
1. Settings are maintained at the page level in each chart component
2. Settings flow down to panels through props
3. Changes bubble up through callback functions
4. All panels receive the same settings object reference

### Highlighting System
The highlighting system provides visual feedback across components:

```typescript
const [highlightSignals, setHighlightSignals] = useState<Record<string, number>>({
  title: 0,
  xAxis: 0,
  yAxis: 0,
  data: 0,
  design: 0,
  // ... other highlight keys
});

// Trigger highlights from any component
const triggerHighlight = (key: string) => {
  setHighlightSignals(prev => ({
    ...prev,
    [key]: prev[key] + 1
  }));
};
```

### Focus Management
Focus requests allow cross-panel communication:

```typescript
interface FocusRequest {
  target: string;
  timestamp: number;
}

// Request focus on a specific input
const requestFocus = useCallback((target: string) => {
  setFocusRequest({ target, timestamp: Date.now() });
}, []);
```

## Key Features

### Modular Architecture
- **Composable Blocks**: Settings are organized into reusable blocks
- **Structured Content**: Each block returns organized content objects  
- **Easy Extension**: New blocks can be added without changing core layout
- **Type Safety**: Full TypeScript support with generic interfaces

### Shared Components
- **Unified UI**: All charts use the same base components
- **Consistent Behavior**: Toggles, inputs, and controls work identically
- **Theme Support**: Dark/light themes work across all components
- **Responsive Design**: Components adapt to different screen sizes

### Developer Experience
- **Hot Reload**: Changes appear instantly during development
- **Clear Structure**: Easy to find and modify specific functionality
- **Helper Functions**: Utilities for common block creation patterns
- **Type Checking**: Compile-time error detection with TypeScript

### User Features
- **Real-time Preview**: Live updates as settings change
- **Comparison Mode**: Side-by-side chart comparison
- **Export Capabilities**: PNG, SVG, and PDF export
- **Data Import**: CSV import and manual data entry
- **Persistent State**: Settings saved to localStorage
- **Undo/Redo**: Built-in state history management

## Best Practices

### Block Design
- Keep blocks focused on a single concern
- Return structured content objects, not JSX directly
- Use consistent naming conventions for content objects
- Include proper TypeScript interfaces for all props

### Panel Composition  
- Group related blocks logically
- Use appropriate highlight keys for user guidance
- Include header actions where they make sense (like sync buttons)
- Maintain consistent section structure across chart types

### Component Reuse
- Always use shared components from `src/shared/components/`
- Create new shared components for patterns used across chart types
- Avoid duplicating component logic between chart implementations
- Extract common functionality to utility functions

### Type Safety
- Define interfaces for all component props
- Use generic types for reusable components
- Extend base interfaces for chart-specific settings
- Maintain backward compatibility when updating interfaces

## Development Workflow

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
2. **Create blocks** - Build composable block functions that return structured content
3. **Compose panels** - Use shared panel components to assemble blocks
4. **Follow patterns** - Use existing chart types as templates
5. **Test thoroughly** - Ensure all panels work correctly together

This modular system provides a scalable foundation for adding new chart types while maintaining consistency and code quality across the entire application.
