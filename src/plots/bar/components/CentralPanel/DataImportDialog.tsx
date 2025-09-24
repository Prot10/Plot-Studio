import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { SelectField } from '../../../../shared/components/SelectField';
import { createBar } from '../../../../shared/utils/barFactory';
import type { BarDataPoint } from '../../../../types/bar';
import type { PaletteKey } from '../../../../types/base';

const MAX_IMPORT_ROWS = 30;

const delimiterPresets = [
    { value: ',', label: 'Comma (,)' },
    { value: ';', label: 'Semicolon (;)' },
    { value: '\\t', label: 'Tab' },
    { value: '|', label: 'Pipe (|)' },
    { value: 'space', label: 'Space' },
    { value: 'custom', label: 'Custom' },
];

const decimalOptions: Array<{ value: '.' | ','; label: string }> = [
    { value: '.', label: 'Dot (.)' },
    { value: ',', label: 'Comma (,)' },
];

type ColumnKind = 'label' | 'value' | 'error' | 'group';

type ColumnMapping = Record<ColumnKind, number | null>;

type DataImportDialogProps = {
    isOpen: boolean;
    paletteName: PaletteKey;
    onCancel: () => void;
    onConfirm: (bars: BarDataPoint[]) => void;
};

type ParsedRowIssue = {
    column: ColumnKind;
    rows: number[];
};

type NumericParseResult = {
    value: number | null;
    isValid: boolean;
};

type ParseNumericOptions = {
    allowBlank?: boolean;
};

const emptyMapping: ColumnMapping = { label: null, value: null, error: null, group: null };

export function DataImportDialog({ isOpen, paletteName, onCancel, onConfirm }: DataImportDialogProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [rawContent, setRawContent] = useState('');
    const [readError, setReadError] = useState<string | null>(null);
    const [delimiterPreset, setDelimiterPreset] = useState<string>(',');
    const [customDelimiter, setCustomDelimiter] = useState('');
    const [hasHeader, setHasHeader] = useState(true);
    const [decimalSeparator, setDecimalSeparator] = useState<'.' | ','>('.');
    const [mapping, setMapping] = useState<ColumnMapping>(emptyMapping);
    const [mappingTouched, setMappingTouched] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setFileName(null);
        setRawContent('');
        setReadError(null);
        setDelimiterPreset(',');
        setCustomDelimiter('');
        setHasHeader(true);
        setDecimalSeparator('.');
        setMapping(emptyMapping);
        setMappingTouched(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onCancel();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => {
            window.removeEventListener('keydown', handleKey);
        };
    }, [isOpen, onCancel]);

    const resolvedDelimiter = useMemo(() => {
        switch (delimiterPreset) {
            case '\\t':
                return '\t';
            case 'space':
                return ' ';
            case 'custom':
                return customDelimiter;
            default:
                return delimiterPreset;
        }
    }, [customDelimiter, delimiterPreset]);

    const parsedRows = useMemo(() => {
        if (!rawContent.trim()) return [];
        if (!resolvedDelimiter) return [];
        return parseDelimited(rawContent, resolvedDelimiter);
    }, [rawContent, resolvedDelimiter]);

    const limitedRows = useMemo(() => {
        if (!parsedRows.length) return [];
        const rowLimit = hasHeader ? MAX_IMPORT_ROWS + 1 : MAX_IMPORT_ROWS;
        return parsedRows.slice(0, rowLimit);
    }, [hasHeader, parsedRows]);

    const totalDataRows = useMemo(() => {
        if (!parsedRows.length) return 0;
        return hasHeader ? Math.max(parsedRows.length - 1, 0) : parsedRows.length;
    }, [hasHeader, parsedRows]);

    const limitedDataRowsCount = useMemo(() => {
        if (!limitedRows.length) return 0;
        return hasHeader ? Math.max(limitedRows.length - 1, 0) : limitedRows.length;
    }, [hasHeader, limitedRows]);

    const truncatedRowsCount = Math.max(totalDataRows - limitedDataRowsCount, 0);

    const columnHeaders = useMemo(() => {
        if (!limitedRows.length) return [] as string[];
        const headerRow = hasHeader ? limitedRows[0] : limitedRows[0] ?? [];
        return headerRow.map((value, index) => {
            const trimmed = value.trim();
            if (trimmed) return trimmed;
            return `Column ${index + 1}`;
        });
    }, [hasHeader, limitedRows]);

    const dataRows = useMemo(() => {
        if (!limitedRows.length) return [] as string[][];
        return hasHeader ? limitedRows.slice(1) : limitedRows;
    }, [hasHeader, limitedRows]);

    useEffect(() => {
        if (!columnHeaders.length) {
            setMapping(emptyMapping);
            setMappingTouched(false);
            return;
        }

        if (!mappingTouched) {
            setMapping((current) => {
                const guessed = guessMapping(columnHeaders);
                if (mappingsEqual(current, guessed)) {
                    return current;
                }
                return guessed;
            });
            return;
        }

        setMapping((current) =>
            clampMapping(current, columnHeaders.length),
        );
    }, [columnHeaders, mappingTouched]);

    const issues = useMemo(() => {
        const nextIssues: ParsedRowIssue[] = [];
        if (!columnHeaders.length) return nextIssues;

        if (mapping.label !== null) {
            const emptyRowsIndices: number[] = [];
            dataRows.forEach((row, index) => {
                const cell = row[mapping.label ?? 0];
                if (!cell || !cell.trim()) {
                    emptyRowsIndices.push(index + 1);
                }
            });
            if (emptyRowsIndices.length) {
                nextIssues.push({ column: 'label', rows: emptyRowsIndices });
            }
        }

        if (mapping.value !== null) {
            const invalidValueRows: number[] = [];
            dataRows.forEach((row, index) => {
                const cell = row[mapping.value ?? 0];
                const parsed = parseNumeric(cell, decimalSeparator);
                if (!parsed.isValid) {
                    invalidValueRows.push(index + 1);
                }
            });
            if (invalidValueRows.length) {
                nextIssues.push({ column: 'value', rows: invalidValueRows });
            }
        }

        if (mapping.error !== null) {
            const invalidErrorRows: number[] = [];
            dataRows.forEach((row, index) => {
                const cell = row[mapping.error ?? 0];
                const parsed = parseNumeric(cell, decimalSeparator, { allowBlank: true });
                if (!parsed.isValid) {
                    invalidErrorRows.push(index + 1);
                }
            });
            if (invalidErrorRows.length) {
                nextIssues.push({ column: 'error', rows: invalidErrorRows });
            }
        }

        return nextIssues;
    }, [columnHeaders.length, dataRows, decimalSeparator, mapping.error, mapping.label, mapping.value]);

    const validationMessages = useMemo(() => {
        const messages: string[] = [];
        if (!fileName) {
            messages.push('Select a CSV file to begin.');
        }
        if (delimiterPreset === 'custom' && !customDelimiter) {
            messages.push('Provide a custom separator.');
        }
        if (fileName && !rawContent.trim()) {
            messages.push('The selected file appears to be empty.');
        }
        if (fileName && rawContent.trim() && !columnHeaders.length) {
            messages.push('No columns were detected with the current separator.');
        }
        if (columnHeaders.length && mapping.label === null) {
            messages.push('Choose a column to use for the bar names.');
        }
        if (columnHeaders.length && mapping.value === null) {
            messages.push('Choose a column to use for the numeric values.');
        }
        if (columnHeaders.length && dataRows.length === 0) {
            messages.push('No data rows detected to import.');
        }
        issues.forEach((issue) => {
            if (!issue.rows.length) return;
            const prefix = formatColumnIssuePrefix(issue.column);
            const sample = issue.rows.slice(0, 5).join(', ');
            const suffix = issue.rows.length > 5 ? '…' : '';
            messages.push(`${prefix} found in rows ${sample}${suffix}`);
        });
        return messages;
    }, [columnHeaders.length, customDelimiter, dataRows.length, delimiterPreset, fileName, issues, mapping.label, mapping.value, rawContent]);

    const canImport = validationMessages.length === 0;

    const previewRows = useMemo(() => dataRows.slice(0, 6), [dataRows]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            setFileName(null);
            setRawContent('');
            setReadError(null);
            setMapping(emptyMapping);
            setMappingTouched(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const text = typeof reader.result === 'string' ? reader.result : '';
            setFileName(file.name);
            setRawContent(text);
            setReadError(null);
            setMapping(emptyMapping);
            setMappingTouched(false);
        };
        reader.onerror = () => {
            setReadError('Unable to read the selected file.');
            setFileName(null);
            setRawContent('');
        };
        reader.readAsText(file);
    };

    const handleMappingChange = (column: ColumnKind, rawValue: string) => {
        setMappingTouched(true);
        setMapping((current) => {
            const nextValue = rawValue === '' ? null : Number.parseInt(rawValue, 10);
            if (Number.isNaN(nextValue as number)) {
                return current;
            }
            return {
                ...current,
                [column]: nextValue,
            };
        });
    };

    const handleConfirm = () => {
        if (!canImport || mapping.label === null || mapping.value === null) return;
        const bars: BarDataPoint[] = dataRows.map((row, index) => {
            const defaults = createBar(index, paletteName);
            const rawLabel = row[mapping.label ?? 0] ?? '';
            const label = rawLabel.trim() || `Item ${index + 1}`;
            const valueCell = row[mapping.value ?? 0] ?? '';
            const parsedValue = parseNumeric(valueCell, decimalSeparator);
            const value = parsedValue.value ?? 0;
            const errorCell = mapping.error !== null ? row[mapping.error] ?? '' : '';
            const parsedError = mapping.error !== null ? parseNumeric(errorCell, decimalSeparator, { allowBlank: true }) : null;
            const errorValue = parsedError?.value ?? 0;
            const groupCell = mapping.group !== null ? row[mapping.group] ?? '' : '';
            const group = groupCell.trim() || undefined;
            return {
                ...defaults,
                label,
                value,
                error: errorValue,
                group,
            };
        });
        onConfirm(bars);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={onCancel}>
            <div
                className="w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-8">
                    <h3 className="text-lg font-semibold">Import data from CSV</h3>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-white/60 transition hover:text-white"
                        aria-label="Close import dialog"
                    >
                        ×
                    </button>
                </div>
                <div className="mt-5 space-y-6 text-sm">
                    <section className="space-y-2">
                        <h4 className="text-xs uppercase tracking-wide text-white/50">1. Choose your file</h4>
                        <label className="flex flex-col gap-2 rounded-xl border border-dashed border-white/15 bg-white/5 p-4">
                            <span className="text-white/70">Select a CSV file to import (UTF-8).</span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,text/csv"
                                onChange={handleFileChange}
                                className="cursor-pointer text-white"
                            />
                        </label>
                        {fileName ? (
                            <p className="text-xs text-white/50">Loaded file: {fileName}</p>
                        ) : null}
                        {readError ? <p className="text-xs text-rose-300">{readError}</p> : null}
                    </section>

                    <section className="space-y-3">
                        <h4 className="text-xs uppercase tracking-wide text-white/50">2. Configure import options</h4>
                        <div className="grid gap-8 sm:grid-cols-2">
                            <label className="flex flex-col gap-2">
                                <span className="text-xs font-medium text-white/60">Column separator</span>
                                <SelectField<string>
                                    label="Column separator"
                                    value={delimiterPreset}
                                    onChange={(value) => setDelimiterPreset(value)}
                                    options={delimiterPresets}
                                    placeholder="Select separator"
                                />
                                {delimiterPreset === 'custom' ? (
                                    <input
                                        type="text"
                                        value={customDelimiter}
                                        onChange={(event) => setCustomDelimiter(event.target.value)}
                                        placeholder="Enter custom separator"
                                        className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                                    />
                                ) : null}
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-xs font-medium text-white/60">Decimal separator</span>
                                <SelectField<'.' | ','>
                                    label="Decimal separator"
                                    value={decimalSeparator}
                                    onChange={(value) => setDecimalSeparator(value)}
                                    options={decimalOptions}
                                    placeholder="Select decimal"
                                />
                            </label>
                        </div>
                        <label className="flex items-center gap-2 text-xs text-white/70">
                            <input
                                type="checkbox"
                                checked={hasHeader}
                                onChange={(event) => setHasHeader(event.target.checked)}
                                className="h-4 w-4 rounded border border-white/20 bg-white/10 text-sky-400 focus:ring-sky-400"
                            />
                            First row contains column titles
                        </label>
                    </section>

                    <section className="space-y-3">
                        <h4 className="text-xs uppercase tracking-wide text-white/50">3. Match columns</h4>
                        {columnHeaders.length ? (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <ColumnSelect
                                    label="Name *"
                                    description="Select the column that contains bar labels"
                                    column="label"
                                    mapping={mapping}
                                    columns={columnHeaders}
                                    onChange={handleMappingChange}
                                />
                                <ColumnSelect
                                    label="Value *"
                                    description="Numeric value for each bar"
                                    column="value"
                                    mapping={mapping}
                                    columns={columnHeaders}
                                    onChange={handleMappingChange}
                                />
                                <ColumnSelect
                                    label="Error"
                                    description="Optional numeric error margin"
                                    column="error"
                                    mapping={mapping}
                                    columns={columnHeaders}
                                    onChange={handleMappingChange}
                                />
                                <ColumnSelect
                                    label="Group"
                                    description="Optional grouping/category column"
                                    column="group"
                                    mapping={mapping}
                                    columns={columnHeaders}
                                    onChange={handleMappingChange}
                                />
                            </div>
                        ) : (
                            <p className="text-xs text-white/50">Load a CSV file to map its columns.</p>
                        )}
                    </section>

                    {columnHeaders.length ? (
                        <section className="space-y-2">
                            <h4 className="text-xs uppercase tracking-wide text-white/50">Preview</h4>
                            <div className="overflow-hidden rounded-xl border border-white/10">
                                <table className="min-w-full table-fixed border-collapse text-xs">
                                    <thead className="bg-white/10 text-left text-white/70">
                                        <tr>
                                            {columnHeaders.map((header, index) => (
                                                <th key={index} className="px-3 py-2 font-medium">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {previewRows.length ? (
                                            previewRows.map((row, rowIndex) => (
                                                <tr key={rowIndex} className="bg-white/[0.02]">
                                                    {row.map((cell, cellIndex) => (
                                                        <td key={cellIndex} className="truncate px-3 py-2 text-white/80">
                                                            {cell}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={columnHeaders.length} className="px-3 py-4 text-center text-white/50">
                                                    No data rows detected with the current configuration.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {truncatedRowsCount > 0 ? (
                                <p className="text-xs text-white/50">
                                    Only the first {MAX_IMPORT_ROWS} rows will be imported ({truncatedRowsCount} rows ignored).
                                </p>
                            ) : null}
                        </section>
                    ) : null}

                    {validationMessages.length ? (
                        <section className="space-y-2">
                            <h4 className="text-xs uppercase tracking-wide text-rose-300/80">Check before importing</h4>
                            <ul className="space-y-1 text-xs text-rose-200">
                                {validationMessages.map((message, index) => (
                                    <li key={index}>{message}</li>
                                ))}
                            </ul>
                        </section>
                    ) : null}

                    <div className="flex justify-end gap-3 text-sm">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-white transition hover:bg-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!canImport}
                            className="inline-flex items-center gap-2 rounded-md border border-sky-400 bg-sky-400/20 px-3 py-1.5 font-medium text-white transition hover:bg-sky-400/30 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Import data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function parseDelimited(text: string, delimiter: string) {
    if (!text.trim()) return [] as string[][];
    if (!delimiter) return [] as string[][];

    const rows: string[][] = [];
    let field = '';
    let row: string[] = [];
    let inQuotes = false;
    let index = 0;
    const delimiterLength = delimiter.length;

    const pushField = () => {
        row.push(field);
        field = '';
    };

    const pushRow = () => {
        pushField();
        const isEmpty = row.every((cell) => cell === '');
        if (!isEmpty || rows.length === 0) {
            rows.push(row);
        }
        row = [];
    };

    while (index < text.length) {
        const char = text[index];

        if (inQuotes) {
            if (char === '"') {
                const nextChar = text[index + 1];
                if (nextChar === '"') {
                    field += '"';
                    index += 2;
                    continue;
                }
                inQuotes = false;
                index += 1;
                continue;
            }
            field += char;
            index += 1;
            continue;
        }

        if (char === '"') {
            inQuotes = true;
            index += 1;
            continue;
        }

        if (char === '\r') {
            index += 1;
            continue;
        }

        if (char === '\n') {
            pushRow();
            index += 1;
            continue;
        }

        const isDelimiter = delimiterLength === 1
            ? char === delimiter
            : text.slice(index, index + delimiterLength) === delimiter;

        if (isDelimiter) {
            pushField();
            index += delimiterLength;
            continue;
        }

        field += char;
        index += 1;
    }

    pushField();
    if (row.length) {
        const isEmpty = row.every((cell) => cell === '');
        if (!isEmpty || rows.length === 0) {
            rows.push(row);
        }
    }

    if (!rows.length) return [] as string[][];

    const maxColumns = rows.reduce((max, current) => Math.max(max, current.length), 0);
    return rows.map((current) => {
        if (current.length === maxColumns) return current;
        return [...current, ...Array(maxColumns - current.length).fill('')];
    });
}

function clampMapping(mapping: ColumnMapping, columnCount: number): ColumnMapping {
    const clamp = (value: number | null) => {
        if (value === null) return null;
        if (value < 0 || value >= columnCount) return null;
        return value;
    };
    return {
        label: clamp(mapping.label),
        value: clamp(mapping.value),
        error: clamp(mapping.error),
        group: clamp(mapping.group),
    };
}

function guessMapping(columns: string[]): ColumnMapping {
    if (!columns.length) return emptyMapping;
    const normalized = columns.map((column) => column.trim().toLowerCase());
    const available = new Set<number>(columns.map((_, index) => index));

    const take = (keywords: string[]) => {
        for (const keyword of keywords) {
            const matchIndex = normalized.findIndex((name, index) => available.has(index) && name.includes(keyword));
            if (matchIndex !== -1) {
                available.delete(matchIndex);
                return matchIndex;
            }
        }
        return null;
    };

    const guess: ColumnMapping = { ...emptyMapping };
    guess.label = take(['label', 'name', 'title']);
    guess.value = take(['value', 'amount', 'score', 'total', 'count', 'number']);
    guess.error = take(['error', 'err', 'uncert', 'sd', 'stdev']);
    guess.group = take(['group', 'category', 'series', 'segment']);

    if (guess.label === null && columns.length >= 1) {
        const index = [...available][0] ?? 0;
        available.delete(index);
        guess.label = index;
    }

    if (guess.value === null && columns.length >= 2) {
        const index = [...available][0] ?? 0;
        available.delete(index);
        guess.value = index;
    }

    if (guess.value === guess.label) {
        const fallback = [...available][0] ?? null;
        guess.value = fallback;
        if (fallback !== null) {
            available.delete(fallback);
        }
    }

    return guess;
}

function mappingsEqual(a: ColumnMapping, b: ColumnMapping) {
    return a.label === b.label && a.value === b.value && a.error === b.error && a.group === b.group;
}

function parseNumeric(value: string, decimalSeparator: '.' | ',', options: ParseNumericOptions = {}): NumericParseResult {
    const { allowBlank = false } = options;
    const trimmed = value.trim();
    if (!trimmed) {
        return { value: null, isValid: allowBlank };
    }

    let normalized = trimmed.replace(/\s+/g, '');
    if (decimalSeparator === ',') {
        normalized = normalized.replace(/\./g, '').replace(/,/g, '.');
    } else {
        normalized = normalized.replace(/,/g, '');
    }

    const numeric = Number.parseFloat(normalized);
    if (Number.isFinite(numeric)) {
        return { value: numeric, isValid: true };
    }
    return { value: null, isValid: false };
}

function formatColumnIssuePrefix(column: ColumnKind) {
    switch (column) {
        case 'label':
            return 'Missing names';
        case 'value':
            return 'Non-numeric values';
        case 'error':
            return 'Non-numeric errors';
        case 'group':
            return 'Group issues';
        default:
            return 'Column issue';
    }
}

type ColumnSelectProps = {
    label: string;
    description: string;
    column: ColumnKind;
    mapping: ColumnMapping;
    columns: string[];
    onChange: (column: ColumnKind, value: string) => void;
};

function ColumnSelect({ label, description, column, mapping, columns, onChange }: ColumnSelectProps) {
    const currentValue = mapping[column];
    const options = useMemo(
        () => [
            { value: '', label: 'Ignore' },
            ...columns.map((name, index) => ({ value: String(index), label: name })),
        ],
        [columns],
    );
    return (
        <label className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/5 p-3">
            <span className="text-sm font-medium text-white/80">{label}</span>
            <SelectField<string>
                label={label}
                value={currentValue !== null ? String(currentValue) : ''}
                onChange={(value) => onChange(column, value)}
                options={options}
                placeholder="Select column"
            />
            <span className="text-xs text-white/50">{description}</span>
        </label>
    );
}
