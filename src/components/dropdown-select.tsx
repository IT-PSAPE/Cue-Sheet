import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { cn } from '../util/cn'
import { Icon } from './icon'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from './popover'
import { ScrollArea } from './scroll-area'

interface DropdownOption {
  value: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

interface DropdownSelectProps {
  label?: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function DropdownSelect({ label, value, options, onChange, disabled = false, className = '' }: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = useMemo(() => options.find((option) => option.value === value) ?? options[0], [options, value])

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setIsOpen(nextOpen)
  }, [])

  const handleSelectOption = useCallback(
    (nextValue: string) => {
      onChange(nextValue)
      setIsOpen(false)
    },
    [onChange]
  )

  const renderOption = useCallback(
    function renderOption(option: DropdownOption) {
      const isSelected = option.value === value
      const isDisabled = option.disabled === true
      const optionClassName = cn(
        'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
        isDisabled ? 'cursor-not-allowed text-gray-400' : isSelected ? 'bg-pink-50 text-pink-700' : 'text-gray-700 hover:bg-gray-50'
      )

      const handleClick = () => {
        if (isDisabled) return
        handleSelectOption(option.value)
      }

      return (
        <button key={option.value} type="button" onClick={handleClick} className={optionClassName} disabled={isDisabled}>
          {option.icon && <span className="text-gray-500">{option.icon}</span>}
          <span className="truncate">{option.label}</span>
        </button>
      )
    },
    [handleSelectOption, value]
  )

  return (
    <div className={cn('relative flex flex-col gap-1', className)}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <PopoverRoot open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          type="button"
          disabled={disabled}
          className="inline-flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-foreground-brand-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex min-w-0 items-center gap-2">
            {selectedOption?.icon && <span className="text-gray-500">{selectedOption.icon}</span>}
            <span className="truncate">{selectedOption?.label ?? 'Select option'}</span>
          </span>
          <Icon.chevron_down size={14} className={cn('h-3.5 w-3.5 shrink-0 text-gray-500 transition-transform', isOpen && 'rotate-180')} />
        </PopoverTrigger>

        <PopoverPortal>
          <PopoverContent side="bottom" align="start" offset={6} matchTriggerWidth className="rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
            <ScrollArea className="max-h-60 overflow-y-auto">{options.map(renderOption)}</ScrollArea>
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
    </div>
  )
}
