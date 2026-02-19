import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useState, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { Portal } from './portal'

type PopoverSide = 'top' | 'bottom'
type PopoverAlign = 'start' | 'center' | 'end'

interface PopoverContextValue {
  contentId: string
  open: boolean
  setOpen: (nextOpen: boolean) => void
  triggerElement: HTMLElement | null
  setTriggerElement: (element: HTMLElement | null) => void
  contentElement: HTMLElement | null
  setContentElement: (element: HTMLElement | null) => void
}

const PopoverContext = createContext<PopoverContextValue | null>(null)

interface PopoverRootProps {
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (nextOpen: boolean) => void
}

export function PopoverRoot({ children, open, defaultOpen = false, onOpenChange }: PopoverRootProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null)
  const [contentElement, setContentElement] = useState<HTMLElement | null>(null)
  const contentId = useId()
  const isControlled = typeof open === 'boolean'
  const resolvedOpen = isControlled ? open : uncontrolledOpen

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen)
      }
      if (onOpenChange) {
        onOpenChange(nextOpen)
      }
    },
    [isControlled, onOpenChange]
  )

  const contextValue = useMemo(
    () => ({
      contentId,
      open: resolvedOpen,
      setOpen,
      triggerElement,
      setTriggerElement,
      contentElement,
      setContentElement,
    }),
    [contentId, resolvedOpen, setOpen, triggerElement, contentElement]
  )

  return <PopoverContext.Provider value={contextValue}>{children}</PopoverContext.Provider>
}

function usePopoverContext() {
  const context = useContext(PopoverContext)
  if (!context) {
    throw new Error('Popover components must be used within PopoverRoot')
  }
  return context
}

interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function PopoverTrigger({ children, onClick, type = 'button', ...props }: PopoverTriggerProps) {
  const { contentId, open, setOpen, setTriggerElement } = usePopoverContext()

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      if (onClick) {
        onClick(event)
      }
      if (event.defaultPrevented) return
      setOpen(!open)
    },
    [onClick, open, setOpen]
  )

  return (
    <button ref={setTriggerElement} type={type} aria-controls={contentId} aria-expanded={open} onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

interface PopoverPortalProps {
  children: ReactNode
  container?: HTMLElement | null
}

export function PopoverPortal({ children, container }: PopoverPortalProps) {
  const { open } = usePopoverContext()
  if (!open) return null
  return <Portal container={container}>{children}</Portal>
}

interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  side?: PopoverSide
  align?: PopoverAlign
  offset?: number
  matchTriggerWidth?: boolean
}

export function PopoverContent({ children, side = 'bottom', align = 'start', offset = 8, matchTriggerWidth = false, className = '', ...props }: PopoverContentProps) {
  const { contentId, open, setOpen, triggerElement, contentElement, setContentElement } = usePopoverContext()
  const [position, setPosition] = useState<CSSProperties>({ position: 'fixed', top: -9999, left: -9999, visibility: 'hidden' })

  const updatePosition = useCallback(() => {
    if (!triggerElement || !contentElement) return

    const viewportPadding = 8
    const triggerRect = triggerElement.getBoundingClientRect()
    const contentRect = contentElement.getBoundingClientRect()
    const availableBelow = window.innerHeight - triggerRect.bottom - offset - viewportPadding
    const availableAbove = triggerRect.top - offset - viewportPadding

    let resolvedSide = side
    if (resolvedSide === 'bottom' && contentRect.height > availableBelow && availableAbove > availableBelow) {
      resolvedSide = 'top'
    }
    if (resolvedSide === 'top' && contentRect.height > availableAbove && availableBelow > availableAbove) {
      resolvedSide = 'bottom'
    }

    const topOffset = resolvedSide === 'bottom' ? triggerRect.bottom + offset : triggerRect.top - contentRect.height - offset
    const baseLeft = align === 'start' ? triggerRect.left : align === 'end' ? triggerRect.right - contentRect.width : triggerRect.left + (triggerRect.width - contentRect.width) / 2
    const maxLeft = Math.max(viewportPadding, window.innerWidth - contentRect.width - viewportPadding)
    const boundedLeft = Math.max(viewportPadding, Math.min(baseLeft, maxLeft))
    const maxTop = Math.max(viewportPadding, window.innerHeight - contentRect.height - viewportPadding)
    const nextTop = Math.max(viewportPadding, Math.min(topOffset, maxTop))
    const nextStyle: CSSProperties = {
      position: 'fixed',
      top: nextTop,
      left: boundedLeft,
      zIndex: 1000,
      visibility: 'visible',
    }

    if (matchTriggerWidth) {
      nextStyle.minWidth = triggerRect.width
    }

    setPosition(nextStyle)
  }, [align, contentElement, matchTriggerWidth, offset, side, triggerElement])

  useLayoutEffect(() => {
    if (!open) return
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerElement?.contains(target) || contentElement?.contains(target)) return
      setOpen(false)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [contentElement, open, setOpen, triggerElement])

  if (!open) return null

  return (
    <div id={contentId} ref={setContentElement} style={position} className={className} {...props}>
      {children}
    </div>
  )
}
