import { Button } from '../components/button'
import { EmptyState } from '../components/empty-state'
import { CueSheetTopBar } from '../features/cue-sheet/components/cue-sheet-top-bar'
import { EventDialogs } from '../features/cue-sheet/components/event-dialogs'
import { TimelineView } from '../features/cue-sheet/components/timeline-view'
import { useAppContext } from '../features/cue-sheet/context/app-context'

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

      <EventDialogs />
    </div>
  )
}

export function AppScreen() {
  return <AppScreenContent />
}
