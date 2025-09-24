import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { ColorField } from '../../../../shared/components/ColorField'
import { FontPicker } from '../../../../shared/components/FontPicker'
import { NumericInput } from '../../../../shared/components/NumericInput'
import { SelectField } from '../../../../shared/components/SelectField'
import { TextInput } from '../../../../shared/components/TextInput'
import { TextStyleControls } from '../../../../shared/components/TextStyleControls'
import { DEFAULT_FONT_OPTIONS } from '../../../../shared/constants/fonts'
import type { AdditionalTextElement } from '../../../../types/bar'

type AdditionalTextManagerProps = {
    textElements: AdditionalTextElement[]
    onChange: (textElements: AdditionalTextElement[]) => void
}

export function AdditionalTextManager({ textElements, onChange }: AdditionalTextManagerProps) {
    const [selectedElementId, setSelectedElementId] = useState<string>(textElements[0]?.id || '')

    const selectedElement = textElements.find(el => el.id === selectedElementId) || textElements[0]

    const generateId = () => `text-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    const createNewTextElement = (): AdditionalTextElement => ({
        id: generateId(),
        text: 'New Text',
        x: 100,
        y: 100,
        fontSize: 16,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: '#ffffff',
        isBold: false,
        isItalic: false,
        isUnderline: false,
        opacity: 1.0,
        rotation: 0,
    })

    const addTextElement = () => {
        const newElement = createNewTextElement()
        const updatedElements = [...textElements, newElement]
        onChange(updatedElements)
        setSelectedElementId(newElement.id)
    }

    const removeTextElement = (elementId: string) => {
        const updatedElements = textElements.filter(el => el.id !== elementId)
        onChange(updatedElements)

        // Select the first element if the current selection was removed
        if (elementId === selectedElementId) {
            setSelectedElementId(updatedElements[0]?.id || '')
        }
    }

    const updateTextElement = (elementId: string, field: keyof Omit<AdditionalTextElement, 'id'>, value: string | number | boolean) => {
        const updatedElements = textElements.map(el =>
            el.id === elementId ? { ...el, [field]: value } : el
        )
        onChange(updatedElements)
    }

    const handleTextStyleChange = (elementId: string, styles: { bold: boolean; italic: boolean; underline: boolean }) => {
        const updatedElements = textElements.map(el =>
            el.id === elementId
                ? {
                    ...el,
                    isBold: styles.bold,
                    isItalic: styles.italic,
                    isUnderline: styles.underline
                }
                : el
        )
        onChange(updatedElements)
    }

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white/80">Text Elements</h4>
                <button
                    type="button"
                    onClick={addTextElement}
                    className="flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
                >
                    <Plus className="h-3 w-3" />
                    Add Text
                </button>
            </div>

            {textElements.length === 0 ? (
                <div className="rounded-md border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-sm text-white/60">No text elements added yet</p>
                    <p className="text-xs text-white/40 mt-1">Click "Add Text" to create your first text element</p>
                </div>
            ) : (
                <>
                    {/* Element Selection */}
                    <div className="flex items-center justify-start gap-4">
                        <span className="text-sm font-semibold text-white/80 whitespace-nowrap">Active Text:</span>
                        <SelectField<string>
                            className="flex-1"
                            label=""
                            value={selectedElementId}
                            onChange={setSelectedElementId}
                            options={textElements.map((el, index) => ({
                                value: el.id,
                                label: el.text || `Text ${index + 1}`
                            }))}
                            placeholder="Select text element"
                        />
                        {selectedElement && (
                            <button
                                type="button"
                                onClick={() => removeTextElement(selectedElement.id)}
                                className="flex items-center gap-1 rounded-md border border-red-400/20 bg-red-500/10 px-2 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
                                title="Delete this text element"
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        )}
                    </div>

                    {/* Text Element Settings */}
                    {selectedElement && (
                        <div className="space-y-4">
                            {/* Text Content and Color */}
                            <div className="grid gap-4 sm:grid-cols-3">
                                <TextInput
                                    label="Text content"
                                    value={selectedElement.text}
                                    onChange={(value) => updateTextElement(selectedElement.id, 'text', value)}
                                    placeholder="Enter text..."
                                />
                                <ColorField
                                    label="Text color"
                                    value={selectedElement.color}
                                    onChange={(value) => updateTextElement(selectedElement.id, 'color', value)}
                                />
                                <NumericInput
                                    title="Opacity"
                                    value={selectedElement.opacity}
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    precision={2}
                                    onChange={(value) => updateTextElement(selectedElement.id, 'opacity', value)}
                                />
                            </div>

                            {/* Font and Style Controls */}
                            <div className="grid gap-4 sm:grid-cols-3">
                                <FontPicker
                                    label="Font family"
                                    value={selectedElement.fontFamily}
                                    onChange={(value) => updateTextElement(selectedElement.id, 'fontFamily', value)}
                                    options={DEFAULT_FONT_OPTIONS}
                                />
                                <NumericInput
                                    title="Font size"
                                    value={selectedElement.fontSize}
                                    min={8}
                                    max={96}
                                    step={1}
                                    precision={0}
                                    onChange={(value) => updateTextElement(selectedElement.id, 'fontSize', value)}
                                    suffix="px"
                                />
                                <TextStyleControls
                                    label="Text style"
                                    value={{
                                        bold: selectedElement.isBold,
                                        italic: selectedElement.isItalic,
                                        underline: selectedElement.isUnderline,
                                    }}
                                    onChange={(styles) => handleTextStyleChange(selectedElement.id, styles)}
                                />
                            </div>

                            {/* Position Controls */}
                            <div className="grid gap-4 sm:grid-cols-3">
                                <NumericInput
                                    title="X position"
                                    value={selectedElement.x}
                                    min={-500}
                                    max={1500}
                                    step={1}
                                    precision={0}
                                    onChange={(value) => updateTextElement(selectedElement.id, 'x', value)}
                                    suffix="px"
                                />
                                <NumericInput
                                    title="Y position"
                                    value={selectedElement.y}
                                    min={-500}
                                    max={1500}
                                    step={1}
                                    precision={0}
                                    onChange={(value) => updateTextElement(selectedElement.id, 'y', value)}
                                    suffix="px"
                                />
                                <NumericInput
                                    title="Rotation"
                                    value={selectedElement.rotation}
                                    min={-180}
                                    max={180}
                                    step={1}
                                    precision={0}
                                    onChange={(value) => updateTextElement(selectedElement.id, 'rotation', value)}
                                    suffix="°"
                                />
                            </div>

                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default AdditionalTextManager
