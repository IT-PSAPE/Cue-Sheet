import { useAppContext } from '../context/app-context'
import { EventEditorDialog } from './event-editor-dialog'

export function NewEventDialog() {
  const { isCreatingEvent, closeCreateEvent, handleCreateEvent } = useAppContext()

  return (
    <EventEditorDialog
      open={isCreatingEvent}
      title="Create New Event"
      onCancel={closeCreateEvent}
      onSubmit={handleCreateEvent}
    />
  )
}
