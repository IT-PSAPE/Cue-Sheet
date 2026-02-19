import type { HTMLAttributes, Ref } from 'react'
import { cn } from '../util/cn'

interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
  containerRef?: Ref<HTMLDivElement>
}

export function ScrollArea({ className = '', containerRef, ...props }: ScrollAreaProps) {
  return <div ref={containerRef} className={cn('scroll-area', className)} {...props} />
}
