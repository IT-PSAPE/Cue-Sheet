import { useState } from 'react'
import { Button } from '../../../components/button'
import { Input } from '../../../components/input'
import { Textarea } from '../../../components/textarea'
import { Select } from '../../../components/select'
import type { CueItemFormData, CueItemType, Track } from '../types'

interface CueItemFormProps {
  initialData?: Partial<CueItemFormData>
  tracks: Track[]
  defaultTrackId: string
  defaultStartMinute?: number
  onSubmit: (data: CueItemFormData) => void
  onCancel: () => void
}

const typeOptions = [
  { value: 'performance', label: 'Performance' },
  { value: 'technical', label: 'Technical' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'transition', label: 'Transition' },
]

export function CueItemForm({
  initialData,
  tracks,
  defaultTrackId,
  defaultStartMinute = 0,
  onSubmit,
  onCancel,
}: CueItemFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [type, setType] = useState<CueItemType>(initialData?.type ?? 'performance')
  const [trackId, setTrackId] = useState(initialData?.trackId ?? defaultTrackId)
  const [startMinute, setStartMinute] = useState(
    (initialData?.startMinute ?? defaultStartMinute).toString()
  )
  const [durationMinutes, setDurationMinutes] = useState<string>(
    (initialData?.durationMinutes ?? 5).toString()
  )
  const [notes, setNotes] = useState(initialData?.notes ?? '')

  const trackOptions = tracks.map((t) => ({ value: t.id, label: t.name }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      type,
      trackId,
      startMinute: parseInt(startMinute, 10) || 0,
      durationMinutes: parseInt(durationMinutes, 10) || 5,
      notes: notes.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g., Opening Song"
        required
        autoFocus
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Track"
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
          options={trackOptions}
        />
        <Select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value as CueItemType)}
          options={typeOptions}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Time (minutes)"
          type="number"
          min="0"
          value={startMinute}
          onChange={(e) => setStartMinute(e.target.value)}
        />
        <Input
          label="Duration (minutes)"
          type="number"
          min="1"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
        />
      </div>
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Details about this cue..."
      />
      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Additional notes..."
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!title.trim()}>
          {initialData?.title ? 'Save Changes' : 'Add Cue'}
        </Button>
      </div>
    </form>
  )
}
