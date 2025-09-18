import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { createBar } from '../../../shared/utils/barFactory';
import type { BarDataPoint } from '../../../types/bar';
import type { PaletteKey } from '../../../types/base';

interface DataTableProps {
    data: BarDataPoint[];
    paletteName: PaletteKey;
    onChange: (data: BarDataPoint[]) => void;
    className?: string;
}

export function DataTable({ data, paletteName, onChange, className = '' }: DataTableProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null); const handleCellEdit = useCallback((rowIndex: number, column: string, value: string) => {
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
            // Update IDs and colors to maintain consistency
            const reindexedData = updatedData.map((bar, newIndex) => {
                const colorTemplate = createBar(newIndex, paletteName);
                return {
                    ...bar,
                    id: `bar-${newIndex}`,
                    fillColor: colorTemplate.fillColor,
                    borderColor: colorTemplate.borderColor,
                };
            });
            onChange(reindexedData);
        }
    }, [data, paletteName, onChange]);

    const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
        e.dataTransfer.effectAllowed = 'move';
        setDraggedIndex(index);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            return;
        }

        const updatedData = [...data];
        const draggedItem = updatedData[draggedIndex];

        // Remove the dragged item
        updatedData.splice(draggedIndex, 1);

        // Insert at new position
        const actualDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
        updatedData.splice(actualDropIndex, 0, draggedItem);

        // Update IDs and colors to maintain consistency after reordering
        const reindexedData = updatedData.map((bar, newIndex) => {
            const colorTemplate = createBar(newIndex, paletteName);
            return {
                ...bar,
                id: `bar-${newIndex}`,
                fillColor: colorTemplate.fillColor,
                borderColor: colorTemplate.borderColor,
            };
        });

        onChange(reindexedData);
        setDraggedIndex(null);
        setDragOverIndex(null);
    }, [data, draggedIndex, paletteName, onChange]);

    const getCellValue = useCallback((row: BarDataPoint, column: string) => {
        switch (column) {
            case 'label':
                return row.label;
            case 'value':
                return row.value.toString();
            case 'error':
                return row.error.toString();
            case 'group':
                return row.group || '';
            default:
                return '';
        }
    }, []);

    const renderCell = useCallback((row: BarDataPoint, rowIndex: number, column: string, label: string) => {
        const value = getCellValue(row, column);

        const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const target = e.target as HTMLSpanElement;
                target.blur();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                const target = e.target as HTMLSpanElement;
                target.textContent = value;
                target.blur();
            }
        };

        const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
            const newValue = e.target.textContent || '';
            if (newValue !== value) {
                handleCellEdit(rowIndex, column, newValue);
            }
        };

        const handleFocus = (e: React.FocusEvent<HTMLSpanElement>) => {
            // Select all text when focused
            const range = document.createRange();
            range.selectNodeContents(e.target);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
        };

        return (
            <span
                contentEditable
                suppressContentEditableWarning
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className="cursor-text hover:bg-white/10 rounded px-2 py-1 block transition-colors focus:outline-none focus:bg-white/10"
                title={`Click to edit ${label.toLowerCase()}`}
                style={{ minHeight: '1.5rem' }}
            >
                {value || (column === 'value' || column === 'error' ? '0' : `${label} ${rowIndex + 1}`)}
            </span>
        );
    }, [getCellValue, handleCellEdit]);

    return (
        <div className={`overflow-hidden ${className}`}>
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Data Editor</h3>
                    <button
                        onClick={addRow}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-white/10 border border-white/10 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Row
                    </button>
                </div>
            </div>

            {/* Scrollable Table Container */}
            <div className="overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-white/10 sticky top-0 z-10 backdrop-blur">
                            <tr>
                                <th scope="col" className="w-8 px-2 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                                    {/* Drag handle column */}
                                </th>
                                <th scope="col" className="w-12 px-3 py-3 text-center text-xs font-medium text-white/50 uppercase tracking-wider">
                                    Color
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                                    Label
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                                    Value
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                                    Error (SD)
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                                    Group
                                </th>
                                <th scope="col" className="w-16 px-6 py-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-white/10">
                            {data.map((row, index) => (
                                <tr
                                    key={row.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    onDrop={(e) => handleDrop(e, index)}
                                    className={`
                    hover:bg-white/10 transition-colors
                    ${draggedIndex === index ? 'opacity-50' : ''}
                    ${dragOverIndex === index ? 'border-t-2 border-sky-400' : ''}
                  `}
                                >
                                    {/* Drag Handle */}
                                    <td className="px-2 py-4 whitespace-nowrap">
                                        <GripVertical className="w-4 h-4 text-white/60 cursor-grab active:cursor-grabbing" />
                                    </td>

                                    {/* Color Indicator */}
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div
                                            className="w-6 h-6 rounded border-2 shadow-sm"
                                            style={{
                                                backgroundColor: row.fillColor,
                                                borderColor: row.borderColor,
                                                opacity: row.opacity
                                            }}
                                            title={`Fill: ${row.fillColor}`}
                                        />
                                    </td>

                                    {/* Label Column */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {renderCell(row, index, 'label', 'Label')}
                                    </td>

                                    {/* Value Column */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                        {renderCell(row, index, 'value', 'Value')}
                                    </td>

                                    {/* Error Column */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                        {renderCell(row, index, 'error', 'Error')}
                                    </td>

                                    {/* Group Column */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                        {renderCell(row, index, 'group', 'Group')}
                                    </td>

                                    {/* Actions Column */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => deleteRow(index)}
                                            disabled={data.length <= 1}
                                            className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            title={data.length <= 1 ? "Cannot delete the last row" : "Delete row"}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-white/10 border-t border-white/10">
                <p className="text-sm text-white/60">
                    {data.length} {data.length === 1 ? 'row' : 'rows'} • Double-click any cell to edit • Drag rows to reorder
                </p>
            </div>
        </div>
    );
}