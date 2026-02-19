import { useCallback, type ReactNode } from 'react'
import { cn } from '../util/cn'
import { Icon } from './icon'
import { DialogBackdrop, DialogClose, DialogContent, DialogPortal, DialogRoot, DialogTitle } from './dialog'
import { ScrollArea } from './scroll-area'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  compact?: boolean
  panelClassName?: string
  bodyClassName?: string
}

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({ isOpen, onClose, title, children, size = 'md', compact = false, panelClassName = '', bodyClassName = '' }: ModalProps) {
  const panelClasses = cn('relative w-full rounded-xl bg-white shadow-xl max-h-[90vh] overflow-auto', sizeStyles[size], panelClassName)
  const headerClasses = cn('flex items-center justify-between border-b border-gray-200', compact ? 'px-4 py-3' : 'px-6 py-4')
  const bodyClasses = cn(compact ? 'p-4' : 'p-6', bodyClassName)

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        onClose()
      }
    },
    [onClose]
  )

  return (
    <DialogRoot open={isOpen} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <DialogBackdrop className="absolute inset-0 bg-black/50" aria-hidden="true" />
          <DialogContent className="relative flex w-full justify-center px-4">
            <ScrollArea className={panelClasses}>
              <div className={headerClasses}>
                <DialogTitle className="text-lg font-semibold text-gray-900">{title}</DialogTitle>
                <DialogClose className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 rounded" aria-label="Close">
                  <Icon.x_close size={20} className="w-5 h-5" />
                </DialogClose>
              </div>
              <div className={bodyClasses}>{children}</div>
            </ScrollArea>
          </DialogContent>
        </div>
      </DialogPortal>
    </DialogRoot>
  )
}
