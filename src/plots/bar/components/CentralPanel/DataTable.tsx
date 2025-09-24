import { Palette } from 'lucide-react';
import { useCallback } from 'react';
import { createBar } from '../../../../shared/utils/barFactory';
import { ColorField } from '../../../../shared/components/ColorField';
import { DataTable as SharedDataTable, type DataTableColumn } from '../../../../shared/components/DataTable';
import type { BarDataPoint } from '../../../../types/bar';
import type { PaletteKey } from '../../../../types/base';

interface BarDataTableProps {
    data: BarDataPoint[];
    paletteName: PaletteKey;
    onChange: (data: BarDataPoint[]) => void;
    onDesignBar?: (barIndex: number) => void;
    className?: string;
}

export function DataTable({ data, paletteName, onChange, onDesignBar, className = '' }: BarDataTableProps) {
    const handleCellEdit = useCallback((rowIndex: number, column: string, value: string) => {
        const updatedData = [...data];
        const row = { ...updatedData[rowIndex] };

        switch (column) {
            case 'label':
                row.label = value || `Bar ${rowIndex + 1}`;
                break;
            case 'value':
                row.value = parseFloat(value) || 0;
                break;
            case 'error':
                row.error = parseFloat(value) || 0;
                break;
            case 'group':
                row.group = value || `Group ${rowIndex + 1}`;
                break;
        }

        updatedData[rowIndex] = row;
        onChange(updatedData);
    }, [data, onChange]);

    const handleColorChange = useCallback((rowIndex: number, colorType: 'fillColor', value: string) => {
        const updatedData = [...data];
        const row = { ...updatedData[rowIndex] };
        row[colorType] = value;
        updatedData[rowIndex] = row;
        onChange(updatedData);
    }, [data, onChange]);

    const addRow = useCallback(() => {
        const newIndex = data.length;
        const newBar = createBar(newIndex, paletteName);
        newBar.label = `Bar ${newIndex + 1}`;
        newBar.group = `Group ${newIndex + 1}`;
        newBar.value = 0;
        newBar.error = 0;
        onChange([...data, newBar]);
    }, [data, paletteName, onChange]);

    const deleteRow = useCallback((index: number) => {
        if (data.length > 1) {
            const updatedData = data.filter((_, i) => i !== index);
            // Update only IDs to maintain order, but preserve all other properties including colors
            const reindexedData = updatedData.map((bar, newIndex) => ({
                ...bar,
                id: `bar-${newIndex}`,
            }));
            onChange(reindexedData);
        }
    }, [data, onChange]);

    const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
        const updatedData = [...data];
        const draggedItem = updatedData[fromIndex];

        // Remove the dragged item
        updatedData.splice(fromIndex, 1);

        // Insert at new position
        const actualDropIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
        updatedData.splice(actualDropIndex, 0, draggedItem);

        // Update only IDs to maintain order, but preserve all other properties including colors
        const reindexedData = updatedData.map((bar, newIndex) => ({
            ...bar,
            id: `bar-${newIndex}`,
        }));

        onChange(reindexedData);
    }, [data, onChange]);

    const columns: DataTableColumn<BarDataPoint>[] = [
        {
            key: 'fillColor',
            label: 'Color',
            width: 'w-32 sm:w-48',
            render: (_, row, index) => (
                <ColorField
                    label=""
                    value={row.fillColor}
                    onChange={(value) => handleColorChange(index, 'fillColor', value)}
                    inputProps={{ className: "text-xs" }}
                />
            )
        },
        {
            key: 'label',
            label: 'Label'
        },
        {
            key: 'value',
            label: 'Value'
        },
        {
            key: 'error',
            label: 'Error (SD)'
        },
        {
            key: 'group',
            label: 'Group'
        }
    ];

    const renderActions = useCallback((_row: BarDataPoint, index: number) => (
        <>
            {onDesignBar && (
                <button
                    onClick={() => onDesignBar(index)}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors p-1"
                    title="Design this bar"
                >
                    <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
            )}
        </>
    ), [onDesignBar]);

    return (
        <SharedDataTable
            data={data}
            columns={columns}
            onRowAdd={addRow}
            onRowDelete={deleteRow}
            onRowReorder={handleReorder}
            onCellEdit={handleCellEdit}
            addButtonLabel="Add Bar"
            canDelete={() => data.length > 1}
            actions={renderActions}
            className={className}
        />
    );
}

