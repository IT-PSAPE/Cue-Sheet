import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
import { CueSheetTopBar } from '@/features/app-shell/cue-sheet-top-bar'
import { DeleteEventDialog } from '@/features/events/dialogs/delete-event-dialog'
import { EditEventDialog } from '@/features/events/dialogs/edit-event-dialog'
import { NewEventDialog } from '@/features/events/dialogs/new-event-dialog'
import { TimelineView } from '@/features/timeline/timeline-view'
import { useAppContext } from '@/contexts/app-context'

function AppScreenContent() {
  const { hasSelectedEvent, openCreateEvent } = useAppContext()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <CueSheetTopBar />

      <main className="min-h-0 flex-1 overflow-hidden">
        <TimelineView />
        <EmptyState
          show={!hasSelectedEvent}
          title="No events yet"
          description="Create your first event to get started."
          action={<Button onClick={openCreateEvent}>+ Create First Event</Button>}
        />
      </main>
      <NewEventDialog />
      <EditEventDialog />
      <DeleteEventDialog />
    </div>
  )
}

export function AppScreen() {
  return <AppScreenContent />
}
