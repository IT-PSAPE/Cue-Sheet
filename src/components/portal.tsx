import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

interface PortalProps {
  children: ReactNode
  container?: HTMLElement | null
}

export function Portal({ children, container }: PortalProps) {
  if (typeof document === 'undefined') return null

  const target = container ?? document.body
  return createPortal(children, target)
}
