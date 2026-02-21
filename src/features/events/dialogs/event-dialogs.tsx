import { DeleteEventDialog } from './delete-event-dialog'
import { EditEventDialog } from './edit-event-dialog'
import { NewEventDialog } from './new-event-dialog'

export function EventDialogs() {
  return (
    <>
      <NewEventDialog />
      <EditEventDialog />
      <DeleteEventDialog />
    </>
  )
}
