import { useMemo } from 'react'

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

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex h-10 items-center overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500">
        <button
          type="button"
          onClick={() => onChange(clamp(sanitizedValue - 1, min, max))}
          className="grid h-full w-10 place-items-center text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
          aria-label={`Decrease ${label}`}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 9h12v2H4z" />
          </svg>
        </button>
        <div className="h-6 w-px bg-gray-200" />
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={sanitizedValue}
          onChange={(e) => {
            const digitsOnly = e.target.value.replace(/\D/g, '')
            const parsed = digitsOnly === '' ? min : parseInt(digitsOnly, 10)
            onChange(clamp(parsed, min, max))
          }}
          className="h-full flex-1 bg-transparent px-2 text-center text-base font-medium text-gray-700 outline-none"
        />
        <div className="h-6 w-px bg-gray-200" />
        <button
          type="button"
          onClick={() => onChange(clamp(sanitizedValue + 1, min, max))}
          className="grid h-full w-10 place-items-center text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
          aria-label={`Increase ${label}`}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4h2v5h5v2h-5v5H9v-5H4V9h5V4z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
