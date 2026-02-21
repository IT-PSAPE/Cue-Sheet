import { useMemo } from 'react'
import { useAppContext } from '@/contexts/app-context'
import { EventEditorDialog } from './event-editor-dialog'

export function EditEventDialog() {
  const { selectedEvent, isEditingEvent, closeEditEvent, handleUpdateEvent } = useAppContext()
  const initialData = useMemo(
    () =>
      selectedEvent
        ? {
            name: selectedEvent.name,
            description: selectedEvent.description,
            totalDurationMinutes: selectedEvent.totalDurationMinutes,
          }
        : undefined,
    [selectedEvent]
  )

  return (
    <EventEditorDialog
      open={isEditingEvent && Boolean(selectedEvent)}
      title="Edit Event"
      initialData={initialData}
      onCancel={closeEditEvent}
      onSubmit={handleUpdateEvent}
    />
  )
}
