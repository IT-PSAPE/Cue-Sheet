import type { ChangeEventHandler, InputHTMLAttributes, ReactNode } from 'react'
import { Icon } from './icon'
import { cn } from '@/util/cn'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange'> {
  checked: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
  label?: ReactNode
  description?: ReactNode
}

export function Checkbox({ checked, onChange, label, description, className = '', disabled, id, ...props }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 transition-colors',
        disabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-gray-50',
        className
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="peer sr-only"
        {...props}
      />
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors',
          checked ? 'border-pink-600 bg-pink-600 text-white' : 'border-gray-300 bg-white text-transparent',
          !disabled && !checked ? 'peer-focus-visible:border-pink-400 peer-focus-visible:ring-2 peer-focus-visible:ring-pink-300/40' : ''
        )}
      >
        <Icon.check size={12} />
      </span>
      <span className="min-w-0">
        {label ? <span className="block text-sm font-medium text-gray-900">{label}</span> : null}
        {description ? <span className="block text-xs text-gray-500">{description}</span> : null}
      </span>
    </label>
  )
}
