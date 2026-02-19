import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ScrollArea } from './scroll-area'

interface DropdownOption {
  value: string
  label: string
  icon?: ReactNode
}

interface DropdownSelectProps {
  label?: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function DropdownSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
  className = '',
}: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      window.addEventListener('mousedown', handleOutsideClick)
    }

    return () => window.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  return (
    <div className={`relative flex flex-col gap-1 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selectedOption?.icon && (
            <span className="text-gray-500">{selectedOption.icon}</span>
          )}
          <span className="truncate">{selectedOption?.label ?? 'Select option'}</span>
        </span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ScrollArea className="absolute left-0 top-full z-40 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                option.value === value
                  ? 'bg-pink-50 text-pink-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option.icon && (
                <span className="text-gray-500">{option.icon}</span>
              )}
              <span className="truncate">{option.label}</span>
            </button>
          ))}
        </ScrollArea>
      )}
    </div>
  )
}
