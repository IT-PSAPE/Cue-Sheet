import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import { Portal } from './portal'

interface DialogContextValue {
  contentId: string
  titleId: string
  open: boolean
  setOpen: (nextOpen: boolean) => void
}

const DialogContext = createContext<DialogContextValue | null>(null)

interface DialogRootProps {
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (nextOpen: boolean) => void
}

export function DialogRoot({ children, open, defaultOpen = false, onOpenChange }: DialogRootProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = typeof open === 'boolean'
  const resolvedOpen = isControlled ? open : uncontrolledOpen
  const contentId = useId()
  const titleId = useId()

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
      titleId,
      open: resolvedOpen,
      setOpen,
    }),
    [contentId, titleId, resolvedOpen, setOpen]
  )

  return <DialogContext.Provider value={contextValue}>{children}</DialogContext.Provider>
}

function useDialogContext() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('Dialog components must be used within DialogRoot')
  }
  return context
}

interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function DialogTrigger({ children, onClick, type = 'button', ...props }: DialogTriggerProps) {
  const { contentId, open, setOpen } = useDialogContext()

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
    <button type={type} aria-controls={contentId} aria-expanded={open} onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

interface DialogPortalProps {
  children: ReactNode
  container?: HTMLElement | null
}

export function DialogPortal({ children, container }: DialogPortalProps) {
  const { open } = useDialogContext()
  if (!open) return null
  return <Portal container={container}>{children}</Portal>
}

interface DialogBackdropProps extends HTMLAttributes<HTMLDivElement> {
  closeOnClick?: boolean
}

export function DialogBackdrop({ closeOnClick = true, onClick, ...props }: DialogBackdropProps) {
  const { setOpen } = useDialogContext()

  const handleClick: React.MouseEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (onClick) {
        onClick(event)
      }
      if (event.defaultPrevented || !closeOnClick) return
      setOpen(false)
    },
    [closeOnClick, onClick, setOpen]
  )

  return <div onClick={handleClick} {...props} />
}

interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  closeOnEscape?: boolean
}

export function DialogContent({ children, closeOnEscape = true, ...props }: DialogContentProps) {
  const { contentId, titleId, open, setOpen } = useDialogContext()

  useEffect(() => {
    if (!open || !closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [closeOnEscape, open, setOpen])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  return <div id={contentId} role="dialog" aria-modal="true" aria-labelledby={titleId} {...props}>{children}</div>
}

interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
}

export function DialogTitle({ children, ...props }: DialogTitleProps) {
  const { titleId } = useDialogContext()
  return <h2 id={titleId} {...props}>{children}</h2>
}

interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function DialogClose({ children, onClick, type = 'button', ...props }: DialogCloseProps) {
  const { setOpen } = useDialogContext()

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      if (onClick) {
        onClick(event)
      }
      if (event.defaultPrevented) return
      setOpen(false)
    },
    [onClick, setOpen]
  )

  return <button type={type} onClick={handleClick} {...props}>{children}</button>
}
