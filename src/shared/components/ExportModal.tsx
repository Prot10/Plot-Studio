import Modal from './Modal'
import { useState, useEffect } from 'react'

type Props = {
    isOpen: boolean
    onClose: () => void
    onExport: (options: { format: 'png' | 'svg' | 'pdf'; fileName: string; scale: number; transparent: boolean }) => Promise<void> | void
    initial?: { format?: 'png' | 'svg' | 'pdf'; fileName?: string; scale?: number; transparent?: boolean }
}

export function ExportModal({ isOpen, onClose, onExport, initial }: Props) {
    const [format, setFormat] = useState<'png' | 'svg' | 'pdf'>(initial?.format ?? 'png')
    const [fileName, setFileName] = useState(initial?.fileName ?? 'chart')
    const [scale, setScale] = useState(initial?.scale ?? 2)
    const [transparent, setTransparent] = useState(Boolean(initial?.transparent))
    const [isWorking, setIsWorking] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        setFormat(initial?.format ?? 'png')
        setFileName(initial?.fileName ?? 'chart')
        setScale(initial?.scale ?? 2)
        setTransparent(Boolean(initial?.transparent))
    }, [isOpen, initial])

    const handleConfirm = async () => {
        if (isWorking) return
        setIsWorking(true)
        try {
            await onExport({ format, fileName: fileName.trim() || 'chart', scale, transparent })
            onClose()
        } finally {
            setIsWorking(false)
        }
    }

    const formatOptions: Array<{ value: 'png' | 'svg' | 'pdf'; label: string; description: string }> = [
        { value: 'png', label: 'PNG', description: 'High-quality raster image with transparency support' },
        { value: 'svg', label: 'SVG', description: 'Scalable vector graphic for design tools' },
        { value: 'pdf', label: 'PDF', description: 'Printable document' },
    ]

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Export chart">
            <div className="mt-2 space-y-4">
                <label className="flex flex-col gap-1 text-sm">
                    <span className="text-xs uppercase tracking-wide text-white/50">File name</span>
                    <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/40" />
                </label>

                <div className="space-y-2">
                    <span className="text-xs uppercase tracking-wide text-white/50">Format</span>
                    <div className="grid gap-2">
                        {formatOptions.map((option) => {
                            const checked = format === option.value
                            return (
                                <label key={option.value} className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition ${checked ? 'border-sky-400 bg-sky-400/15 text-white' : 'border-white/10 bg-white/5 text-white/70 hover:text-white'}`}>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{option.label}</span>
                                        <span className="text-xs text-white/50">{option.description}</span>
                                    </div>
                                    <input type="radio" name="export-format" value={option.value} checked={checked} onChange={() => setFormat(option.value)} className="sr-only" />
                                </label>
                            )
                        })}
                    </div>
                </div>

                <label className="flex flex-col gap-2 text-sm">
                    <span className="text-xs uppercase tracking-wide text-white/50">Quality</span>
                    <input type="range" min={1} max={6} step={1} value={scale} onChange={(e) => setScale(Number.parseInt(e.target.value, 10))} className="accent-sky-400" />
                    <span className="text-xs text-white/50">Scale ×{scale}</span>
                </label>

                <label className="flex items-center gap-3 text-sm">
                    <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} className="h-4 w-4 rounded border border-white/20 bg-white/10 text-sky-400 focus:ring-sky-400" />
                    <span>Transparent background</span>
                </label>

                <div className="mt-4 flex justify-end gap-3 text-sm">
                    <button type="button" onClick={onClose} disabled={isWorking} className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
                    <button type="button" onClick={handleConfirm} disabled={isWorking} className="inline-flex items-center gap-2 rounded-md border border-sky-400 bg-sky-400/20 px-3 py-1.5 font-medium text-white transition hover:bg-sky-400/30 disabled:cursor-not-allowed disabled:opacity-60">{isWorking ? 'Exporting…' : 'Export'}</button>
                </div>
            </div>
        </Modal>
    )
}

export default ExportModal
