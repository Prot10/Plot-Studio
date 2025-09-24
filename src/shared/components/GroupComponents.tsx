import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * GroupComponents - A responsive layout component that automatically adjusts columns
 * 
 * This component provides a smart grid layout that:
 * - Calculates optimal number of columns based on available space and minimum component widths
 * - Automatically wraps components to new rows when needed
 * - Maintains consistent spacing and responsive behavior
 * - Uses ResizeObserver for real-time layout adjustments
 * 
 * Example usage:
 * ```tsx
 * <GroupComponents minComponentWidth={20} maxColumns={3} gap={2}>
 *   <NumericInput ... />
 *   <ColorField ... />
 *   <SelectField ... />
 * </GroupComponents>
 * ```
 * 
 * If the container is 75rem wide with 3 components (min 20rem each), all fit in one row.
 * If the container is 55rem wide, it shows 2 components in first row, 1 in second row.
 */

type GroupComponentsProps = {
    /** Child components to arrange responsively */
    children: ReactNode[]
    /** Minimum width for each component in rem units (default: 20) */
    minComponentWidth?: number
    /** Maximum number of columns allowed (default: 4) */
    maxColumns?: number
    /** Gap between components in rem units (default: 2) */
    gap?: number
    /** Vertical gap between rows in rem units (default: 2) */
    rowGap?: number
    /** Additional CSS classes to apply to the container */
    className?: string
}

export function GroupComponents({
    children,
    minComponentWidth = 20, // 20rem = 320px at default font size
    maxColumns = 4,
    gap = 2, // 2rem = 32px
    rowGap = 2, // 2rem = 32px
    className = ''
}: GroupComponentsProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [containerWidth, setContainerWidth] = useState(0)
    const [columns, setColumns] = useState(1)

    // Convert rem to pixels (assuming 16px base font size)
    const remToPx = (rem: number) => rem * 16

    useEffect(() => {
        const updateLayout = () => {
            if (!containerRef.current) return

            const containerWidthPx = containerRef.current.offsetWidth
            setContainerWidth(containerWidthPx)

            // Calculate how many components can fit in one row
            const minComponentWidthPx = remToPx(minComponentWidth)
            const gapPx = remToPx(gap)

            // Calculate available width for components (total width minus gaps)
            const availableWidth = containerWidthPx - (gapPx * (maxColumns - 1))

            // Calculate maximum number of components that can fit
            const possibleColumns = Math.floor(availableWidth / minComponentWidthPx)

            // Limit to maxColumns and ensure at least 1 column
            const optimalColumns = Math.max(1, Math.min(maxColumns, possibleColumns))

            setColumns(optimalColumns)
        }

        // Initial calculation
        updateLayout()

        // Set up ResizeObserver to watch for container size changes
        const resizeObserver = new ResizeObserver(updateLayout)
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        return () => {
            resizeObserver.disconnect()
        }
    }, [minComponentWidth, maxColumns, gap])

    // Calculate the actual width for each component
    const calculateComponentWidth = () => {
        if (containerWidth === 0) return '100%'

        const gapPx = remToPx(gap)
        const totalGapWidth = gapPx * (columns - 1)
        const availableWidth = containerWidth - totalGapWidth
        const componentWidth = availableWidth / columns

        return `${componentWidth}px`
    }

    const componentWidth = calculateComponentWidth()

    // Filter out any null/undefined children
    const validChildren = children.filter(child => child != null)

    return (
        <div
            ref={containerRef}
            className={`w-full ${className}`}
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: `${rowGap}rem ${gap}rem`,
            }}
        >
            {validChildren.map((child, index) => (
                <div
                    key={index}
                    style={{
                        width: componentWidth,
                        minWidth: `${minComponentWidth}rem`,
                        flexShrink: 0,
                    }}
                >
                    {child}
                </div>
            ))}
        </div>
    )
}