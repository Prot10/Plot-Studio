import { type ReactNode } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

export interface DataTableColumn<T = unknown> {
    key: string;
    label: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: unknown, row: T, rowIndex: number) => ReactNode;
}

export interface DataTableRow {
    id: string;
    [key: string]: unknown;
}

export interface DataTableProps<T extends DataTableRow = DataTableRow> {
    data: T[];
    columns: DataTableColumn<T>[];
    onRowAdd?: () => void;
    onRowDelete?: (index: number) => void;
    onRowReorder?: (fromIndex: number, toIndex: number) => void;
    onCellEdit?: (rowIndex: number, columnKey: string, value: string) => void;
    addButtonLabel?: string;
    addButtonIcon?: ReactNode;
    canDelete?: (row: T, index: number) => boolean;
    dragDisabled?: boolean;
    actions?: (row: T, index: number) => ReactNode;
    className?: string;
    maxHeight?: string;
    minWidth?: string;
}

export function DataTable<T extends DataTableRow = DataTableRow>({
    data,
    columns,
    onRowAdd,
    onRowDelete,
    onRowReorder,
    onCellEdit,
    addButtonLabel = "Add Row",
    addButtonIcon = <Plus className="w-3 h-3 sm:w-4 sm:h-4" />,
    canDelete = () => true,
    dragDisabled = false,
    actions,
    className = '',
    maxHeight = "max-h-64 sm:max-h-96",
    minWidth = "600px"
}: DataTableProps<T>) {
    const handleDragStart = (e: React.DragEvent, index: number) => {
        if (dragDisabled) return;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (dragDisabled) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        if (dragDisabled) return;
        e.preventDefault();

        const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (draggedIndex !== dropIndex && onRowReorder) {
            onRowReorder(draggedIndex, dropIndex);
        }
    };

    const renderCell = (row: T, column: DataTableColumn<T>, rowIndex: number) => {
        if (column.render) {
            return column.render(row[column.key], row, rowIndex);
        }

        if (onCellEdit) {
            const value = row[column.key]?.toString() || '';

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
                    onCellEdit(rowIndex, column.key, newValue);
                }
            };

            const handleFocus = (e: React.FocusEvent<HTMLSpanElement>) => {
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
                    title={`Click to edit ${column.label.toLowerCase()}`}
                    style={{ minHeight: '1.5rem' }}
                >
                    {value || `${column.label} ${rowIndex + 1}`}
                </span>
            );
        }

        return <span className="px-2 py-1">{String(row[column.key] ?? '')}</span>;
    };

    return (
        <div className={`overflow-hidden w-full ${className}`}>
            {/* Add Row Button */}
            {onRowAdd && (
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
                    <div className="flex items-center justify-end">
                        <button
                            onClick={onRowAdd}
                            className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-white/10 border border-white/10 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors"
                        >
                            {addButtonIcon}
                            <span className="hidden sm:inline">{addButtonLabel}</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Scrollable Table Container */}
            <div className="overflow-hidden">
                <div className={`${maxHeight} overflow-x-auto overflow-y-auto`}>
                    <table className="min-w-full divide-y divide-white/10" style={{ minWidth }}>
                        <thead className="bg-white/10 sticky top-0 z-10 backdrop-blur">
                            <tr>
                                {/* Drag handle column */}
                                {!dragDisabled && onRowReorder && (
                                    <th scope="col" className="w-6 sm:w-8 px-1 sm:px-2 py-2 sm:py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                                        {/* Empty header for drag handle */}
                                    </th>
                                )}

                                {/* Data columns */}
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        scope="col"
                                        className={`px-3 sm:px-6 py-2 sm:py-3 text-${column.align || 'left'} text-xs font-medium text-white/50 uppercase tracking-wider ${column.width || ''}`}
                                    >
                                        {column.label}
                                    </th>
                                ))}

                                {/* Actions column */}
                                {(actions || onRowDelete) && (
                                    <th scope="col" className="w-12 sm:w-16 px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">
                                        <span className="sr-only sm:not-sr-only">Actions</span>
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-white/10">
                            {data.map((row, index) => (
                                <tr
                                    key={row.id}
                                    draggable={!dragDisabled && !!onRowReorder}
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                    className="hover:bg-white/10 transition-colors"
                                >
                                    {/* Drag Handle */}
                                    {!dragDisabled && onRowReorder && (
                                        <td className="px-1 sm:px-2 py-3 sm:py-4 whitespace-nowrap">
                                            <GripVertical className="w-3 h-3 sm:w-4 sm:h-4 text-white/60 cursor-grab active:cursor-grabbing" />
                                        </td>
                                    )}

                                    {/* Data columns */}
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'} text-white`}
                                        >
                                            {renderCell(row, column, index)}
                                        </td>
                                    ))}

                                    {/* Actions Column */}
                                    {(actions || onRowDelete) && (
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                {actions && actions(row, index)}

                                                {onRowDelete && (
                                                    <button
                                                        onClick={() => onRowDelete(index)}
                                                        disabled={!canDelete(row, index)}
                                                        className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-1"
                                                        title={!canDelete(row, index) ? "Cannot delete this row" : "Delete row"}
                                                    >
                                                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-2 sm:py-3 bg-white/10 border-t border-white/10">
                <p className="text-xs sm:text-sm text-white/60">
                    {data.length} {data.length === 1 ? 'row' : 'rows'}
                    <span className="hidden sm:inline"> • Double-click any cell to edit • Drag rows to reorder</span>
                </p>
            </div>
        </div>
    );
}