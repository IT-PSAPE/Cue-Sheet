import { useState } from 'react'
import { Button } from '../../../components/button'
import { Modal } from '../../../components/modal'
import { EventForm } from './event-form'
import { formatMinutes } from '../utils'
import type { Event, EventFormData } from '../types'

interface EventHeaderProps {
  event: Event
  onUpdate: (data: Partial<EventFormData>) => void
  onDelete: () => void
}

export function EventHeader({ event, onUpdate, onDelete }: EventHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleUpdate = (data: EventFormData) => {
    onUpdate(data)
    setIsEditing(false)
  }

  const handleDelete = () => {
    onDelete()
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
            {event.description && (
              <p className="text-gray-600 mt-1">{event.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Duration: {formatMinutes(event.totalDurationMinutes)} · {event.tracks.length} tracks · {event.cueItems.length} cues
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </Button>
          </div>
        </div>
      </div>

      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Event">
        <EventForm
          initialData={{
            name: event.name,
            description: event.description,
            totalDurationMinutes: event.totalDurationMinutes,
          }}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Event"
      >
        <div className="flex flex-col gap-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{event.name}"? This will remove all cue items and cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Event
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
