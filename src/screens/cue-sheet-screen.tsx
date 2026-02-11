import { useState } from 'react'
import { Button } from '../components/button'
import { Modal } from '../components/modal'
import { EmptyState } from '../components/empty-state'
import { EventForm } from '../features/cue-sheet/components/event-form'
import { EventHeader } from '../features/cue-sheet/components/event-header'
import { TimelineView } from '../features/cue-sheet/components/timeline-view'
import { useCueSheet } from '../features/cue-sheet/hooks/use-cue-sheet'
import type { EventFormData } from '../features/cue-sheet/types'

export function CueSheetScreen() {
  const { state, dispatch, selectedEvent } = useCueSheet()
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)

  const handleCreateEvent = (data: EventFormData) => {
    dispatch({ type: 'CREATE_EVENT', payload: data })
    setIsCreatingEvent(false)
  }

  const handleUpdateEvent = (data: Partial<EventFormData>) => {
    if (!selectedEvent) return
    dispatch({ type: 'UPDATE_EVENT', payload: { id: selectedEvent.id, data } })
  }

  const handleDeleteEvent = () => {
    if (!selectedEvent) return
    dispatch({ type: 'DELETE_EVENT', payload: { id: selectedEvent.id } })
  }

  const handleSelectEvent = (id: string) => {
    dispatch({ type: 'SELECT_EVENT', payload: { id } })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Cue Sheet</h1>
          <Button onClick={() => setIsCreatingEvent(true)}>+ New Event</Button>
        </div>
      </header>

      <main className="mx-auto px-4 py-6">
        {state.events.length > 1 && (
          <div className="mb-6 flex gap-2 flex-wrap">
            {state.events.map((event) => (
              <button
                key={event.id}
                onClick={() => handleSelectEvent(event.id)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  event.id === state.selectedEventId
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {event.name}
              </button>
            ))}
          </div>
        )}

        {selectedEvent ? (
          <>
            <EventHeader
              event={selectedEvent}
              onUpdate={handleUpdateEvent}
              onDelete={handleDeleteEvent}
            />
            <TimelineView />
          </>
        ) : (
          <EmptyState
            title="No events yet"
            description="Create your first event to start building your cue sheet."
            action={
              <Button onClick={() => setIsCreatingEvent(true)}>
                + Create First Event
              </Button>
            }
          />
        )}
      </main>

      <Modal
        isOpen={isCreatingEvent}
        onClose={() => setIsCreatingEvent(false)}
        title="Create New Event"
      >
        <EventForm
          onSubmit={handleCreateEvent}
          onCancel={() => setIsCreatingEvent(false)}
        />
      </Modal>
    </div>
  )
}
