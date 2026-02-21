import { useCallback } from 'react'
import { Dialog } from '../../../components/dialog'
import { Icon } from '../../../components/icon'
import type { EventFormData } from '../types'
import { EventForm } from './event-form'

interface EventEditorDialogProps {
  open: boolean
  title: string
  initialData?: Partial<EventFormData>
  onCancel: () => void
  onSubmit: (data: EventFormData) => void
}

export function EventEditorDialog({ open, title, initialData, onCancel, onSubmit }: EventEditorDialogProps) {
  const handleDialogOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) onCancel()
    },
    [onCancel]
  )

  return (
    <Dialog.Root open={open} onOpenChange={handleDialogOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Header>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <Dialog.Close><Icon.x_close size={20} /></Dialog.Close>
          </Dialog.Header>
          <Dialog.Content>
            <EventForm initialData={initialData} onSubmit={onSubmit} onCancel={onCancel} />
          </Dialog.Content>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
