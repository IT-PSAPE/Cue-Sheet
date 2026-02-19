import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cv } from '../util/cv'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'neutral' | 'danger'
  isActive?: boolean
  children: ReactNode
}

const iconButtonStyles = cv({
  base: [
    'inline-flex items-center justify-center rounded-md',
    'focus:outline-none focus:ring-2 focus:ring-pink-500',
    'transition-colors disabled:cursor-not-allowed disabled:opacity-40',
  ],
  variants: {
    size: {
      sm: ['h-7 w-7'],
      md: ['h-8 w-8'],
      lg: ['h-9 w-9'],
    },
    variant: {
      neutral: ['text-gray-400 hover:bg-gray-100 hover:text-gray-700'],
      danger: ['text-gray-400 hover:bg-red-50 hover:text-red-600'],
    },
    state: {
      default: ['bg-transparent'],
      active: ['bg-pink-50 text-pink-700'],
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'neutral',
    state: 'default',
  },
})

export function IconButton({ size = 'md', variant = 'neutral', isActive = false, className = '', children, type = 'button', ...props }: IconButtonProps) {
  const state = isActive ? 'active' : 'default'
  return (
    <button type={type} className={iconButtonStyles({ size, variant, state, className })} {...props}>
      {children}
    </button>
  )
}
