# Agent Guidelines

## Commands
- **Dev**: `npm run dev`
- **Build**: `npm run build` (runs `tsc -b` then `vite build`)
- **Lint**: `npm run lint`
- **No tests configured** - verify changes manually via `npm run dev`

## Code Style
- **TypeScript**: Strict mode enabled. Use explicit types for exports, props, and function returns
- **Imports**: Use `type` imports for type-only imports (e.g., `import type { Foo } from './types'`)
- **Formatting**: No semicolons. Single quotes for strings
- **Components**: Functional components with TypeScript. Extract reusable logic to shared components
- **Props**: Use TypeScript interfaces with descriptive names (e.g., `XAxisBlockProps`). Document with JSDoc if complex
- **Naming**: camelCase for variables/functions, PascalCase for components/types, UPPER_CASE for constants
- **State**: Use React hooks. Prefer composition over deep nesting
- **Error handling**: Try-catch for risky operations (e.g., `focus()` with fallback)
- **File structure**: Organize by feature in `src/plots/`, shared code in `src/shared/`
- **Comments**: Minimal comments - code should be self-documenting

## Architecture
- Vite + React 19 + TypeScript + Tailwind CSS v4
- Chart types in `src/plots/` with modular left/center/right panel components
- Shared components, hooks, utils in `src/shared/`
- Type definitions in `src/types/` - use `extends` for chart-specific types

## Component Architecture (Blocks System)
- **3-Panel Layout**: Every chart uses `ChartPage` with `leftPanel`, `centerPanel`, `rightPanel`
- **Block Functions**: Settings organized as functions returning content objects (e.g., `XAxisBlock()` returns `{ title, appearance, ticks }`)
- **Panel Composers**: Each chart has 3 composers (e.g., `BarChartLeftPanel`) that assemble blocks into arrays
- **Generic Panels**: `LeftPanel`, `CentralPanel`, `RightPanel` accept block arrays and render with `BlockGroup`
- **Shared Components**: Use `NumericInput`, `ColorField`, `Toggle`, `GroupComponents`, `AxisSyncButton` from `src/shared/components/`

## Adding New Features
- **New Blocks**: Create function returning content object, add to panel composer's blocks array
- **New Sections**: Add to existing block's `sections` array with `{ id, title?, content, toggle? }`
- **New Chart Type**: Create `src/plots/[type]/` with Page, defaultSettings, and 3 panel composers following bar chart pattern
- **Reuse First**: Check `src/shared/` before creating new components. Extract common patterns to shared/
