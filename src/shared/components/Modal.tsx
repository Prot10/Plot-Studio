import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

type ModalProps = {
    isOpen: boolean
    onClose: () => void
    children: ReactNode
    title?: string
    className?: string
}

export function Modal({ isOpen, onClose, children, title, className = '' }: ModalProps) {
    useEffect(() => {
        if (!isOpen) return

        // Escape key handler
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKey)

        // Prevent background scrolling while the modal is open. The position:fixed
        // approach works more reliably across browsers (including iOS Safari)
        // than body overflow alone. We store previous body styles so we can
        // restore them when the last modal closes.
        const w = window as unknown as {
            __modalOpenCount?: number
            __previousBodyOverflow?: string
            __previousBodyPosition?: string
            __previousBodyTop?: string
            __previousScrollY?: number
        }

        w.__modalOpenCount = (w.__modalOpenCount || 0) + 1
        if (w.__modalOpenCount === 1) {
            // store previous styles
            w.__previousBodyOverflow = document.body.style.overflow || ''
            w.__previousBodyPosition = document.body.style.position || ''
            w.__previousBodyTop = document.body.style.top || ''
            w.__previousScrollY = window.scrollY || window.pageYOffset || 0

            // lock body: position fixed keeps viewport stable and prevents scrolling
            document.body.style.overflow = 'hidden'
            document.body.style.position = 'fixed'
            document.body.style.top = `-${w.__previousScrollY}px`
            document.body.style.left = '0'
            document.body.style.right = '0'
            document.body.style.width = '100%'
        }

        return () => {
            window.removeEventListener('keydown', handleKey)
            w.__modalOpenCount = Math.max((w.__modalOpenCount || 1) - 1, 0)
            if (w.__modalOpenCount === 0) {
                // restore previous styles
                document.body.style.overflow = w.__previousBodyOverflow || ''
                document.body.style.position = w.__previousBodyPosition || ''
                document.body.style.top = w.__previousBodyTop || ''
                document.body.style.left = ''
                document.body.style.right = ''
                document.body.style.width = ''

                // restore scroll position
                const scrollY = w.__previousScrollY || 0
                window.scrollTo(0, scrollY)

                // cleanup
                w.__previousBodyOverflow = undefined
                w.__previousBodyPosition = undefined
                w.__previousBodyTop = undefined
                w.__previousScrollY = undefined
            }
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const node = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
            />
            <div
                role="dialog"
                aria-modal="true"
                className={`relative w-full max-w-3xl px-4 ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-full rounded-2xl border border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl max-h-[90vh] overflow-auto">
                    <div className="flex items-start justify-between gap-4">
                        {title ? <h3 className="text-lg font-semibold">{title}</h3> : <div />}
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close dialog"
                            className="rounded-md p-1 text-white/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="mt-4">{children}</div>
                </div>
            </div>
        </div>
    )

    return createPortal(node, document.body)
}

export default Modal
