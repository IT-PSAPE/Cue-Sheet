import { useCallback, useMemo, type ChangeEventHandler } from 'react'
import { Icon } from './icon'

interface CounterInputProps {
  id: string
  label: string
  value: number
  min: number
  max?: number
  onChange: (value: number) => void
}

function clamp(value: number, min: number, max?: number): number {
  if (max === undefined) {
    return Math.max(min, value)
  }

  return Math.min(max, Math.max(min, value))
}

export function CounterInput({ id, label, value, min, max, onChange }: CounterInputProps) {
  const sanitizedValue = useMemo(() => clamp(value, min, max), [value, min, max])

  const handleDecrease = useCallback(() => {
    onChange(clamp(sanitizedValue - 1, min, max))
  }, [max, min, onChange, sanitizedValue])

  const handleIncrease = useCallback(() => {
    onChange(clamp(sanitizedValue + 1, min, max))
  }, [max, min, onChange, sanitizedValue])

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const digitsOnly = event.target.value.replace(/\D/g, '')
      const parsed = digitsOnly === '' ? min : parseInt(digitsOnly, 10)
      onChange(clamp(parsed, min, max))
    },
    [max, min, onChange]
  )

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex h-10 items-center overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500">
        <button
          type="button"
          onClick={handleDecrease}
          className="grid h-full w-10 shrink-0 place-items-center text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
          aria-label={`Decrease ${label}`}
        >
          <Icon.minus size={16} className="h-4 w-4" />
        </button>
        <div className="h-6 w-px shrink-0 bg-gray-200" />
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={sanitizedValue}
          onChange={handleInputChange}
          className="h-full min-w-0 flex-1 bg-transparent px-2 text-center text-base font-medium text-gray-700 outline-none"
        />
        <div className="h-6 w-px shrink-0 bg-gray-200" />
        <button
          type="button"
          onClick={handleIncrease}
          className="grid h-full w-10 shrink-0 place-items-center text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
          aria-label={`Increase ${label}`}
        >
          <Icon.plus size={16} className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
