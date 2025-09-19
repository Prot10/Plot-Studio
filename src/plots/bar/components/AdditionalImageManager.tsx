import { useState, useRef } from 'react'
import { Trash2, Upload } from 'lucide-react'
import { NumericInput } from '../../../shared/components/NumericInput'
import { SelectField } from '../../../shared/components/SelectField'
import type { AdditionalImageElement } from '../../../types/bar'

type ToggleProps = {
    title: string
    value: boolean
    onChange: (value: boolean) => void
    disabled?: boolean
}

function Toggle({ title, value, onChange, disabled }: ToggleProps) {
    const handleClick = () => {
        if (disabled) return
        onChange(!value)
    }

    return (
        <div className={`flex flex-col gap-1 text-sm text-white ${disabled ? 'opacity-60' : ''}`}>
            <span className="text-xs uppercase tracking-wide text-white/50">{title}</span>
            <div className="h-9 rounded-md border border-white/10 bg-white/10 px-3 flex items-center justify-start">
                <button
                    type="button"
                    onClick={handleClick}
                    className={`relative inline-flex h-5 w-9 flex-none items-center rounded-full transition ${value ? 'bg-sky-400' : 'bg-white/20'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                    role="switch"
                    aria-checked={value}
                    aria-disabled={disabled}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${value ? 'translate-x-4' : 'translate-x-0.5'}`}
                    />
                </button>
            </div>
        </div>
    )
}

type AdditionalImageManagerProps = {
    imageElements: AdditionalImageElement[]
    onChange: (imageElements: AdditionalImageElement[]) => void
}

export function AdditionalImageManager({ imageElements, onChange }: AdditionalImageManagerProps) {
    const [selectedElementId, setSelectedElementId] = useState<string>(imageElements[0]?.id || '')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const selectedElement = imageElements.find(el => el.id === selectedElementId) || imageElements[0]

    const generateId = () => `image-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    const createNewImageElement = (src: string, originalWidth: number, originalHeight: number): AdditionalImageElement => {
        // Start with a relatively small scale
        const startScale = Math.min(150 / Math.max(originalWidth, originalHeight), 1.0)

        return {
            id: generateId(),
            src,
            x: 100,
            y: 100,
            scale: startScale,
            originalWidth,
            originalHeight,
            rotation: 0,
            opacity: 1.0,
            grayscale: false,
        }
    }

    const handleFileUpload = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Check if it's a valid image type
        if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
            alert('Please select a JPG, JPEG, or PNG image file.')
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const src = e.target?.result as string
            if (!src) return

            // Create a temporary image to get dimensions
            const img = new Image()
            img.onload = () => {
                const newElement = createNewImageElement(src, img.width, img.height)
                const updatedElements = [...imageElements, newElement]
                onChange(updatedElements)
                setSelectedElementId(newElement.id)
            }
            img.src = src
        }
        reader.readAsDataURL(file)

        // Reset the file input
        event.target.value = ''
    }

    const removeImageElement = (elementId: string) => {
        const updatedElements = imageElements.filter(el => el.id !== elementId)
        onChange(updatedElements)

        // Select the first element if the current selection was removed
        if (elementId === selectedElementId) {
            setSelectedElementId(updatedElements[0]?.id || '')
        }
    }

    const updateImageElement = (elementId: string, field: keyof Omit<AdditionalImageElement, 'id'>, value: string | number | boolean) => {
        const updatedElements = imageElements.map(el =>
            el.id === elementId ? { ...el, [field]: value } : el
        )
        onChange(updatedElements)
    }

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white/80">Image Elements</h4>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleFileUpload}
                        className="flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
                    >
                        <Upload className="h-3 w-3" />
                        Add Image
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
            </div>

            {imageElements.length === 0 ? (
                <div className="rounded-md border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-sm text-white/60">No image elements added yet</p>
                    <p className="text-xs text-white/40 mt-1">Click "Add Image" to upload your first image</p>
                    <p className="text-xs text-white/40 mt-1">Supported formats: JPG, JPEG, PNG</p>
                </div>
            ) : (
                <>
                    {/* Element Selection */}
                    <div className="flex items-center justify-start gap-4">
                        <span className="text-sm font-semibold text-white/80 whitespace-nowrap">Active Image:</span>
                        <SelectField<string>
                            className="flex-1"
                            label=""
                            value={selectedElementId}
                            onChange={setSelectedElementId}
                            options={imageElements.map((el, index) => ({
                                value: el.id,
                                label: `Image ${index + 1}`
                            }))}
                            placeholder="Select image element"
                        />
                        {selectedElement && (
                            <button
                                type="button"
                                onClick={() => removeImageElement(selectedElement.id)}
                                className="flex items-center gap-1 rounded-md border border-red-400/20 bg-red-500/10 px-2 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
                                title="Delete this image element"
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        )}
                    </div>

                    {/* Image Element Settings */}
                    {selectedElement && (
                        <div className="space-y-4">
                            {/* Image Preview */}
                            <div className="rounded-md border border-white/10 bg-white/5 p-4">
                                <h5 className="text-xs uppercase tracking-wide text-white/50 mb-2">Preview</h5>
                                <div className="flex items-center justify-center min-h-[100px] max-h-[200px] overflow-hidden rounded">
                                    <img
                                        src={selectedElement.src}
                                        alt="Image preview"
                                        className="max-w-full max-h-full object-contain"
                                        style={{
                                            opacity: selectedElement.opacity,
                                            filter: selectedElement.grayscale ? 'grayscale(100%)' : 'none',
                                            transform: `scale(${selectedElement.scale}) rotate(${selectedElement.rotation}deg)`
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Position Controls */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <NumericInput
                                    title="X position"
                                    value={selectedElement.x}
                                    min={-500}
                                    max={1500}
                                    step={1}
                                    precision={0}
                                    onChange={(value) => updateImageElement(selectedElement.id, 'x', value)}
                                    suffix="px"
                                />
                                <NumericInput
                                    title="Y position"
                                    value={selectedElement.y}
                                    min={-500}
                                    max={1500}
                                    step={1}
                                    precision={0}
                                    onChange={(value) => updateImageElement(selectedElement.id, 'y', value)}
                                    suffix="px"
                                />
                            </div>

                            {/* Scale and Rotation Controls */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <NumericInput
                                    title="Scale"
                                    value={selectedElement.scale}
                                    min={0.001}
                                    max={5.0}
                                    step={0.1}
                                    precision={2}
                                    onChange={(value) => updateImageElement(selectedElement.id, 'scale', value)}
                                    suffix="×"
                                />
                                <NumericInput
                                    title="Rotation"
                                    value={selectedElement.rotation}
                                    min={-360}
                                    max={360}
                                    step={1}
                                    precision={0}
                                    onChange={(value) => updateImageElement(selectedElement.id, 'rotation', value)}
                                    suffix="°"
                                />
                            </div>

                            {/* Appearance Controls */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <NumericInput
                                    title="Opacity"
                                    value={selectedElement.opacity}
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    precision={2}
                                    onChange={(value) => updateImageElement(selectedElement.id, 'opacity', value)}
                                />
                                <Toggle
                                    title="Grayscale"
                                    value={selectedElement.grayscale}
                                    onChange={(value) => updateImageElement(selectedElement.id, 'grayscale', value)}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default AdditionalImageManager
