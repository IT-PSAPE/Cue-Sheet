import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../util/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, id, className = '', ...props }: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const textareaClassName = cn('px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none', error && 'border-red-500', className)

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea id={textareaId} className={textareaClassName} rows={3} {...props} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
