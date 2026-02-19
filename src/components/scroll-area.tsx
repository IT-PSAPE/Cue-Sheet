import { forwardRef, type HTMLAttributes } from 'react'

interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  function ScrollArea({ className = '', ...props }, ref) {
    return <div ref={ref} className={`scroll-area ${className}`.trim()} {...props} />
  }
)
