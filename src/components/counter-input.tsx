import { useCallback, useMemo, type ChangeEventHandler } from 'react'
import { Icon } from './icon'
import { IconButton } from './icon-button'
import { cn } from '../util/cn'

interface CounterInputProps {
  id: string
  label: string
  value: number
  min: number
  max?: number
  step?: number
  format?: 'number' | 'percent'
  className?: string
  onChange: (value: number) => void
}

function clamp(value: number, min: number, max?: number): number {
  if (max === undefined) {
    return Math.max(min, value)
  }

  return Math.min(max, Math.max(min, value))
}

export function CounterInput({ id, label, value, min, max, step = 1, format = 'number', className = '', onChange }: CounterInputProps) {
  const sanitizedValue = useMemo(() => clamp(value, min, max), [value, min, max])
  const canDecrease = sanitizedValue > min
  const canIncrease = max === undefined || sanitizedValue < max
  const displayValue = format === 'percent' ? `${sanitizedValue}%` : String(sanitizedValue)

  const handleDecrease = useCallback(() => {
    if (!canDecrease) return
    onChange(clamp(sanitizedValue - step, min, max))
  }, [canDecrease, max, min, onChange, sanitizedValue, step])

  const handleIncrease = useCallback(() => {
    if (!canIncrease) return
    onChange(clamp(sanitizedValue + step, min, max))
  }, [canIncrease, max, min, onChange, sanitizedValue, step])

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const digitsOnly = event.target.value.replace(/\D/g, '')
      const parsed = digitsOnly === '' ? min : parseInt(digitsOnly, 10)
      onChange(clamp(parsed, min, max))
    },
    [max, min, onChange]
  )

  return (
    <div className={cn('flex h-8 items-center gap-0.5 rounded-lg border border-[#e8e8e8] bg-white p-px focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500', className)}>
      <IconButton
        variant="ghost"
        size="sm"
        onClick={handleDecrease}
        disabled={!canDecrease}
        aria-label={`Decrease ${label}`}
        icon={<Icon.minus size={16} className="h-4 w-4" />}
      />
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={displayValue}
        onChange={handleInputChange}
        className="h-full min-w-0 flex-1 bg-transparent px-1.5 text-center text-[11px] font-medium leading-[16.5px] text-[#4a5565] outline-none"
      />
      <IconButton
        variant="ghost"
        size="sm"
        onClick={handleIncrease}
        disabled={!canIncrease}
        aria-label={`Increase ${label}`}
        icon={<Icon.plus size={16} className="h-4 w-4" />}
      />
    </div>
  )
}
