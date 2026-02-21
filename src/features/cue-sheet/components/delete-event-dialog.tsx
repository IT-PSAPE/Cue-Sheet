import { useCallback, useMemo } from 'react'
import { Button } from '../../../components/button'
import { Dialog } from '../../../components/dialog'
import { Icon } from '../../../components/icon'
import { useAppContext } from '../context/app-context'

export function DeleteEventDialog() {
  const { selectedEvent, isDeletingEvent, closeDeleteEvent, handleDeleteEvent } = useAppContext()
  const description = useMemo(
    () =>
      selectedEvent
        ? `Are you sure you want to delete "${selectedEvent.name}"? This will remove all cue items and cannot be undone.`
        : '',
    [selectedEvent]
  )
  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeDeleteEvent()
    },
    [closeDeleteEvent]
  )

  if (!selectedEvent) return null

  return (
    <Dialog.Root open={isDeletingEvent} onOpenChange={handleDialogOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport size="sm">
          <Dialog.Header>
            <h2 className="text-lg font-semibold text-gray-900">Delete Event</h2>
            <Dialog.Close><Icon.x_close size={20} /></Dialog.Close>
          </Dialog.Header>
          <Dialog.Content>
            <div className="flex flex-col gap-4">
              <p className="text-gray-600">{description}</p>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={closeDeleteEvent}>Cancel</Button>
                <Button variant="danger" onClick={handleDeleteEvent}>Delete Event</Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
