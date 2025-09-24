import { DataTable } from './DataTable';
import type { BarDataPoint } from '../../../../types/bar';
import type { PaletteKey } from '../../../../types/base';

export interface DataTableBlockProps {
    data: BarDataPoint[];
    paletteName: PaletteKey;
    onChange: (data: BarDataPoint[]) => void;
    onDesignBar?: (barIndex: number) => void;
}

export function createDataTableBlock(props: DataTableBlockProps) {
    return {
        id: 'data-table',
        title: 'Data Editor',
        defaultExpanded: false,
        sections: [{
            id: 'data-table-content',
            content: <DataTable {...props} />
        }]
    };
}