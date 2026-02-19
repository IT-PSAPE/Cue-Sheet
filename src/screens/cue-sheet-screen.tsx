import { useState, useRef, useEffect } from 'react'
import { Button } from '../components/button'
import { Modal } from '../components/modal'
import { EmptyState } from '../components/empty-state'
import { ScrollArea } from '../components/scroll-area'
import { EventForm } from '../features/cue-sheet/components/event-form'
import { TimelineView } from '../features/cue-sheet/components/timeline-view'
import { useCueSheet } from '../features/cue-sheet/hooks/use-cue-sheet'
import { formatMinutes } from '../features/cue-sheet/utils'
import type { EventFormData } from '../features/cue-sheet/types'

export function CueSheetScreen() {
  const { state, dispatch, selectedEvent } = useCueSheet()
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [isEditingEvent, setIsEditingEvent] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [optionsContainer, setOptionsContainer] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const handleCreateEvent = (data: EventFormData) => {
    dispatch({ type: 'CREATE_EVENT', payload: data })
    setIsCreatingEvent(false)
    setDropdownOpen(false)
  }

  const handleUpdateEvent = (data: EventFormData) => {
    if (!selectedEvent) return
    dispatch({ type: 'UPDATE_EVENT', payload: { id: selectedEvent.id, data } })
    setIsEditingEvent(false)
  }

  const handleDeleteEvent = () => {
    if (!selectedEvent) return
    dispatch({ type: 'DELETE_EVENT', payload: { id: selectedEvent.id } })
    setShowDeleteConfirm(false)
  }

  const handleSelectEvent = (id: string) => {
    dispatch({ type: 'SELECT_EVENT', payload: { id } })
    setDropdownOpen(false)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <header className="bg-white border-b border-gray-200/90 px-4 py-2 flex items-center gap-3 shrink-0">
        <h1 className="text-sm font-semibold text-gray-900 shrink-0 tracking-tight">Cue Sheet</h1>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="inline-flex h-9 items-center gap-1.5 px-3 text-xs font-medium rounded-lg border border-gray-300 bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
          >
            <span className="truncate max-w-[180px]">
              {selectedEvent ? selectedEvent.name : 'Select Event'}
            </span>
            <svg className={`w-3.5 h-3.5 shrink-0 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
              {state.events.length > 0 && (
                <ScrollArea className="max-h-60 overflow-y-auto">
                  {state.events.map((event) => (
                    <div
                      key={event.id}
                      className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 ${event.id === state.selectedEventId ? 'bg-pink-50' : ''}`}
                    >
                      <div
                        className="flex-1 min-w-0"
                        onClick={() => handleSelectEvent(event.id)}
                      >
                        <div className="text-sm font-medium text-gray-900 truncate">{event.name}</div>
                        <div className="text-[11px] text-gray-500">
                          {formatMinutes(event.totalDurationMinutes)} · {event.tracks.length} tracks · {event.cueItems.length} cues
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectEvent(event.id)
                          setDropdownOpen(false)
                          setIsEditingEvent(true)
                        }}
                        className="p-1 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-md"
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectEvent(event.id)
                          setDropdownOpen(false)
                          setShowDeleteConfirm(true)
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </ScrollArea>
              )}
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  setIsCreatingEvent(true)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-pink-600 hover:bg-pink-50 border-t border-gray-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Event
              </button>
            </div>
          )}
        </div>

        <div ref={setOptionsContainer} className="relative flex flex-1 items-center justify-end" />
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">
        {selectedEvent ? (
          <TimelineView
            onCreateEvent={() => setIsCreatingEvent(true)}
            optionsContainer={optionsContainer}
          />
        ) : (
          <EmptyState
            title="No events yet"
            description="Create your first event to get started."
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

      {selectedEvent && (
        <>
          <Modal
            isOpen={isEditingEvent}
            onClose={() => setIsEditingEvent(false)}
            title="Edit Event"
          >
            <EventForm
              initialData={{
                name: selectedEvent.name,
                description: selectedEvent.description,
                totalDurationMinutes: selectedEvent.totalDurationMinutes,
              }}
              onSubmit={handleUpdateEvent}
              onCancel={() => setIsEditingEvent(false)}
            />
          </Modal>

          <Modal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            title="Delete Event"
          >
            <div className="flex flex-col gap-4">
              <p className="text-gray-600">
                Are you sure you want to delete "{selectedEvent.name}"? This will remove all cue items and cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteEvent}>
                  Delete Event
                </Button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  )
}
