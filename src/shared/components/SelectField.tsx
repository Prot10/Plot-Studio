import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { KeyboardEvent, ReactNode } from 'react'

export type SelectOption<TValue extends string> = {
  value: TValue
  label: ReactNode
  disabled?: boolean
}

type DropdownPosition = {
  top: number
  left: number
  width: number
  maxHeight: number
}

type SelectFieldProps<TValue extends string> = {
  label: string
  value: TValue | null
  onChange: (value: TValue) => void
  options: Array<SelectOption<TValue>>
  placeholder?: string
  disabled?: boolean
  name?: string
  id?: string
  className?: string
  dropdownClassName?: string
}

export function SelectField<TValue extends string>({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  disabled = false,
  name,
  id,
  className,
  dropdownClassName,
}: SelectFieldProps<TValue>) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(() => findSelectedIndex(options, value))
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null)

  const portalTarget = typeof document !== 'undefined' ? document.body : null

  const generatedId = useId()
  const triggerId = id ?? generatedId
  const selectedIndex = useMemo(() => findSelectedIndex(options, value), [options, value])
  const selectedOption = useMemo(() => {
    if (value == null) return null
    return options.find((option) => option.value === value) ?? null
  }, [options, value])
  const enabledIndexes = useMemo(
    () => options.reduce<number[]>((accumulator, option, index) => {
      if (!option.disabled) accumulator.push(index)
      return accumulator
    }, []),
    [options],
  )

  useEffect(() => {
    if (isOpen) return
    setHighlightedIndex(selectedIndex)
  }, [isOpen, selectedIndex])

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (containerRef.current?.contains(target)) return
      if (listRef.current?.contains(target)) return
      setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setDropdownPosition(null)
      return
    }

    const OFFSET = 6
    const GUTTER = 8
    const MIN_HEIGHT = 132
    const PREFERRED_HEIGHT = 288

    const computePosition = () => {
      const trigger = triggerRef.current
      if (!trigger) return

      const rect = trigger.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      const maxDropdownHeight = Math.min(PREFERRED_HEIGHT, Math.max(80, viewportHeight - GUTTER * 2))
      const minHeight = Math.min(MIN_HEIGHT, maxDropdownHeight)

      const availableBelow = Math.max(0, viewportHeight - rect.bottom - OFFSET - GUTTER)
      const availableAbove = Math.max(0, rect.top - OFFSET - GUTTER)

      let openAbove = false
      let maxHeight = availableBelow

      if (maxHeight < minHeight && availableAbove > availableBelow) {
        openAbove = true
        maxHeight = availableAbove
      }

      maxHeight = Math.max(maxHeight, minHeight)
      maxHeight = Math.min(maxHeight, maxDropdownHeight)

      let top = openAbove ? rect.top - OFFSET - maxHeight : rect.bottom + OFFSET
      if (top < GUTTER) top = GUTTER
      if (top + maxHeight > viewportHeight - GUTTER) {
        top = Math.max(GUTTER, viewportHeight - maxHeight - GUTTER)
      }

      const width = rect.width
      let left = rect.left
      const overflowRight = left + width + GUTTER - viewportWidth
      if (overflowRight > 0) {
        left = Math.max(GUTTER, viewportWidth - width - GUTTER)
      }

      setDropdownPosition({
        top,
        left,
        width,
        maxHeight,
      })
    }

    computePosition()
    const handleScroll = () => computePosition()
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', computePosition)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', computePosition)
    }
  }, [isOpen, options.length])

  const previousValueRef = useRef(value)
  useEffect(() => {
    if (isOpen && value !== previousValueRef.current) {
      setIsOpen(false)
    }
    previousValueRef.current = value
  }, [value, isOpen])

  useEffect(() => {
    if (!isOpen) return
    if (highlightedIndex < 0) return

    const item = listRef.current?.querySelector<HTMLElement>(`[data-index="${highlightedIndex}"]`)
    item?.scrollIntoView({ block: 'nearest' })
  }, [highlightedIndex, isOpen])

  const handleToggle = () => {
    if (disabled) return
    setIsOpen((prev) => !prev)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        if (!isOpen) {
          openAndHighlight(event.key === 'ArrowDown' ? 1 : 0)
        } else {
          moveHighlight(1)
        }
        break
      }
      case 'ArrowUp': {
        event.preventDefault()
        if (!isOpen) {
          openAndHighlight(-1)
        } else {
          moveHighlight(-1)
        }
        break
      }
      case 'Home': {
        event.preventDefault()
        if (!isOpen) {
          openAndHighlight(0)
        }
        highlightIndex(enabledIndexes[0])
        break
      }
      case 'End': {
        event.preventDefault()
        if (!isOpen) {
          openAndHighlight(0)
        }
        highlightIndex(enabledIndexes[enabledIndexes.length - 1])
        break
      }
      case 'Enter':
      case ' ': {
        event.preventDefault()
        if (!isOpen) {
          openAndHighlight(0)
          return
        }
        if (highlightedIndex >= 0) {
          const option = options[highlightedIndex]
          if (!option?.disabled) {
            onChange(option.value)
            setIsOpen(false)
          }
        }
        break
      }
      case 'Escape': {
        if (isOpen) {
          event.preventDefault()
          setIsOpen(false)
        }
        break
      }
      case 'Tab': {
        if (isOpen) {
          setIsOpen(false)
        }
        break
      }
      default:
        break
    }
  }

  const moveHighlight = (direction: 1 | -1) => {
    if (!enabledIndexes.length) return
    setHighlightedIndex((current) => {
      const currentPos = current >= 0 ? enabledIndexes.indexOf(current) : -1
      const selectedPos = selectedIndex >= 0 ? enabledIndexes.indexOf(selectedIndex) : -1
      const basePos =
        currentPos >= 0
          ? currentPos
          : selectedPos >= 0
            ? selectedPos
            : direction === 1
              ? -1
              : enabledIndexes.length
      let nextPos = basePos + direction
      if (nextPos < 0) nextPos = enabledIndexes.length - 1
      if (nextPos >= enabledIndexes.length) nextPos = 0
      return enabledIndexes[nextPos]
    })
  }

  const openAndHighlight = (direction: 1 | -1 | 0) => {
    setIsOpen(true)
    if (!enabledIndexes.length) return
    setHighlightedIndex((current) => {
      if (direction === 0) {
        if (current >= 0) return current
        if (selectedIndex >= 0) return selectedIndex
        return enabledIndexes[0]
      }

      const selectedPos = selectedIndex >= 0 ? enabledIndexes.indexOf(selectedIndex) : -1
      const basePos =
        direction === 1
          ? selectedPos
          : selectedPos >= 0
            ? selectedPos
            : enabledIndexes.length

      let nextPos = basePos + direction
      if (nextPos < 0) nextPos = enabledIndexes.length - 1
      if (nextPos >= enabledIndexes.length || nextPos === -1) nextPos = 0
      return enabledIndexes[nextPos]
    })
  }

  const highlightIndex = (index: number | undefined) => {
    if (index == null || index < 0) return
    setHighlightedIndex(index)
  }

  const handleOptionSelect = (index: number) => {
    const option = options[index]
    if (!option || option.disabled) return
    onChange(option.value)
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  const displayLabel = selectedOption?.label ?? placeholder
  const showPlaceholder = !selectedOption

  const dropdownNode =
    isOpen && dropdownPosition && portalTarget
      ? createPortal(
        <div
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 1000,
          }}
        >
          <div
            ref={listRef}
            id={`${triggerId}-options`}
            role="listbox"
            aria-labelledby={triggerId}
            style={{ maxHeight: dropdownPosition.maxHeight }}
            className={classNames(
              'max-h-72 w-full overflow-y-auto rounded-lg border border-white/10 bg-slate-950/95 p-1 shadow-xl backdrop-blur-sm scrollbar-thin scrollbar-track-white/10 scrollbar-thumb-white/30',
              dropdownClassName,
            )}
          >
            {options.map((option, index) => {
              const isSelected = option.value === selectedOption?.value
              const isHighlighted = index === highlightedIndex
              return (
                <button
                  type="button"
                  key={option.value}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  className={classNames(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition',
                    option.disabled ? 'cursor-not-allowed text-white/30' : 'cursor-pointer text-white/80 hover:bg-white/10',
                    isHighlighted ? 'bg-white/15 text-white' : null,
                    isSelected ? 'font-semibold text-sky-300' : null,
                  )}
                  onMouseEnter={() => highlightIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleOptionSelect(index)}
                >
                  <span className="truncate text-left">{option.label}</span>
                  <span className={classNames('ml-3 text-sky-300 transition', isSelected ? 'opacity-100' : 'opacity-0')}>
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                </button>
              )
            })}
          </div>
        </div>,
        portalTarget,
      )
      : null

  return (
    <div className={`flex flex-col gap-1 text-sm text-white ${className || ''}`}>
      <span className="text-xs uppercase tracking-wide text-white/50">{label}</span>
      <div ref={containerRef} className="relative w-full">
        {name ? <input type="hidden" name={name} value={selectedOption?.value ?? ''} /> : null}
        <button
          id={triggerId}
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? `${triggerId}-options` : undefined}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={classNames(
            'relative flex w-full items-center justify-between gap-2 h-9 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-start text-sm text-white transition focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-white/15',
            isOpen ? 'border-sky-300/60' : null,
          )}
        >
          <span className={classNames('block truncate', showPlaceholder ? 'font-normal text-white/40' : 'text-white')}>
            {displayLabel}
          </span>
          <span className="pointer-events-none">
            <svg className="h-4 w-4 text-white/60" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7 15 5 5 5-5" />
              <path d="m7 9 5-5 5 5" />
            </svg>
          </span>
        </button>
        {dropdownNode}
      </div>
    </div>
  )
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

function findSelectedIndex<TValue extends string>(options: Array<SelectOption<TValue>>, value: TValue | null) {
  if (value == null) return -1
  return options.findIndex((option) => option.value === value)
}
