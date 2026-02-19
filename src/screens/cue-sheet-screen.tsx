import { useCallback, useMemo } from 'react'
import { Button } from '../components/button'
import { Modal } from '../components/modal'
import { EmptyState } from '../components/empty-state'
import { EventSelector } from '../features/cue-sheet/components/event-selector'
import { EventForm } from '../features/cue-sheet/components/event-form'
import { TimelineView } from '../features/cue-sheet/components/timeline-view'
import { useCueSheetScreen } from '../features/cue-sheet/hooks/use-cue-sheet-screen'

export function CueSheetScreen() {
  const {
    state,
    selectedEvent,
    optionsContainer,
    setOptionsContainer,
    isCreatingEvent,
    isEditingEvent,
    isDeletingEvent,
    openCreateEvent,
    openEditEvent,
    openDeleteEvent,
    closeCreateEvent,
    closeEditEvent,
    closeDeleteEvent,
    handleSelectEvent,
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent,
  } = useCueSheetScreen()

  const handleOpenEditFromSelector = useCallback((eventId: string) => {
    void eventId
    openEditEvent()
  }, [openEditEvent])

  const handleOpenDeleteFromSelector = useCallback((eventId: string) => {
    void eventId
    openDeleteEvent()
  }, [openDeleteEvent])

  const editInitialData = useMemo(
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

  const deleteDescription = useMemo(
    () =>
      selectedEvent
        ? `Are you sure you want to delete "${selectedEvent.name}"? This will remove all cue items and cannot be undone.`
        : '',
    [selectedEvent]
  )

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <header className="bg-white border-b border-gray-200/90 px-4 py-2 flex items-center gap-3 shrink-0">
        <h1 className="text-sm font-semibold text-gray-900 shrink-0 tracking-tight">Cue Sheet</h1>

        <EventSelector
          events={state.events}
          selectedEventId={state.selectedEventId}
          onSelectEvent={handleSelectEvent}
          onCreateEvent={openCreateEvent}
          onEditEvent={handleOpenEditFromSelector}
          onDeleteEvent={handleOpenDeleteFromSelector}
        />

        <div ref={setOptionsContainer} className="relative flex flex-1 items-center justify-end" />
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">
        {selectedEvent ? (
          <TimelineView
            onCreateEvent={openCreateEvent}
            optionsContainer={optionsContainer}
          />
        ) : (
          <EmptyState
            title="No events yet"
            description="Create your first event to get started."
            action={
              <Button onClick={openCreateEvent}>
                + Create First Event
              </Button>
            }
          />
        )}
      </main>

      <Modal
        isOpen={isCreatingEvent}
        onClose={closeCreateEvent}
        title="Create New Event"
      >
        <EventForm
          onSubmit={handleCreateEvent}
          onCancel={closeCreateEvent}
        />
      </Modal>

      <Modal
        isOpen={isEditingEvent && Boolean(selectedEvent)}
        onClose={closeEditEvent}
        title="Edit Event"
      >
        {selectedEvent && (
          <EventForm
            initialData={editInitialData}
            onSubmit={handleUpdateEvent}
            onCancel={closeEditEvent}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeletingEvent && Boolean(selectedEvent)}
        onClose={closeDeleteEvent}
        title="Delete Event"
      >
        <div className="flex flex-col gap-4">
          <p className="text-gray-600">{deleteDescription}</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeDeleteEvent}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteEvent}>
              Delete Event
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
