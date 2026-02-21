import { useState } from 'react'
import { Button } from '../../../components/button'
import { Input } from '../../../components/input'
import { Textarea } from '../../../components/textarea'
import type { EventFormData } from '../types'

interface EventFormProps {
  initialData?: Partial<EventFormData>
  onSubmit: (data: EventFormData) => void
  onCancel: () => void
}

export function EventForm({ initialData, onSubmit, onCancel }: EventFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [totalDurationMinutes, setTotalDurationMinutes] = useState(
    initialData?.totalDurationMinutes?.toString() ?? '90'
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      totalDurationMinutes: parseInt(totalDurationMinutes, 10) || 90,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Event Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Sunday Morning Service"
        required
        autoFocus={!window.matchMedia('(pointer: coarse)').matches}
      />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Brief description of the event..."
      />
      <Input
        label="Total Duration (minutes)"
        type="number"
        min="5"
        max="480"
        value={totalDurationMinutes}
        onChange={(e) => setTotalDurationMinutes(e.target.value)}
        placeholder="90"
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          {initialData?.name ? 'Save Changes' : 'Create Event'}
        </Button>
      </div>
    </form>
  )
}
