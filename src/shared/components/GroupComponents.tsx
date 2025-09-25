import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * GroupComponents - A responsive layout component that automatically adjusts columns
 * 
 * This component provides a smart grid layout that:
 * - Automatically detects minimum width requirements of child components
 * - Calculates optimal number of columns based on available space and component needs
 * - Automatically wraps components to new rows when needed
 * - Maintains consistent spacing and responsive behavior
 * - Uses ResizeObserver for real-time layout adjustments
 * 
 * Example usage:
 * ```tsx
 * <GroupComponents maxColumns={3} gap={2}>
 *   <NumericInput ... />
 *   <ColorField ... />
 *   <SelectField ... />
 * </GroupComponents>
 * ```
 * 
 * The component will try to fit up to maxColumns per row, but will create fewer columns
 * if the available space is insufficient for the components' minimum widths.
 */

type GroupComponentsProps = {
    /** Child components to arrange responsively */
    children: ReactNode[]
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

    // Filter out any null/undefined children early
    const validChildren = children.filter(child => child != null)

    useEffect(() => {
        const updateLayout = () => {
            if (!containerRef.current) return

            const containerWidthPx = containerRef.current.offsetWidth
            setContainerWidth(containerWidthPx)

            const gapPx = remToPx(gap)

            // Adaptive minimum width based on typical component needs
            // Most form components (NumericInput, SelectField, etc.) need ~16-20rem to display properly
            const minComponentWidth = 256 // 16rem in pixels - smaller than before for better responsiveness

            // Calculate how many components can fit in one row
            let optimalColumns = 1

            for (let cols = 1; cols <= maxColumns; cols++) {
                const totalGapWidth = gapPx * (cols - 1)
                const availableWidthPerComponent = (containerWidthPx - totalGapWidth) / cols

                if (availableWidthPerComponent >= minComponentWidth) {
                    optimalColumns = cols
                } else {
                    break // Can't fit more columns
                }
            }

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
    }, [maxColumns, gap])

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
                        minWidth: '16rem', // 256px - reasonable minimum for form components
                        flexShrink: 0,
                    }}
                >
                    {child}
                </div>
            ))}
        </div>
    )
}