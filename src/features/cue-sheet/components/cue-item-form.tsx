import { useState } from 'react'
import { Button } from '../../../components/button'
import { CounterInput } from '../../../components/counter-input'
import { DropdownSelect } from '../../../components/dropdown-select'
import { Input } from '../../../components/input'
import { Textarea } from '../../../components/textarea'
import { getCueTypeIcon } from '../cue-type-icons'
import type { CueItemFormData, CueItemType, CueType, Track } from '../types'
import { isTrackLocked } from '../utils'

interface CueItemFormProps {
  initialData?: Partial<CueItemFormData>
  tracks: Track[]
  cueTypes: CueType[]
  defaultTrackId: string
  defaultStartMinute?: number
  onSubmit: (data: CueItemFormData) => void
  onCancel: () => void
  onDelete?: () => void
}

export function CueItemForm({
  initialData,
  tracks,
  cueTypes,
  defaultTrackId,
  defaultStartMinute = 0,
  onSubmit,
  onCancel,
  onDelete,
}: CueItemFormProps) {
  const fallbackTypeId = cueTypes[0]?.id ?? 'performance'
  const initialTypeId = initialData?.type && cueTypes.some((cueType) => cueType.id === initialData.type)
    ? initialData.type
    : fallbackTypeId
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [type, setType] = useState<CueItemType>(initialTypeId)
  const [trackId, setTrackId] = useState(initialData?.trackId ?? defaultTrackId)
  const [startMinute, setStartMinute] = useState(initialData?.startMinute ?? defaultStartMinute)
  const [durationMinutes, setDurationMinutes] = useState(initialData?.durationMinutes ?? 5)
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const isSelectedTrackLocked = isTrackLocked(tracks, trackId)

  const trackOptions = tracks.map((track) => ({ value: track.id, label: track.locked ? `${track.name} (Locked)` : track.name, disabled: Boolean(track.locked) }))
  const typeOptions = cueTypes.map((cueType) => ({
    value: cueType.id,
    label: cueType.name,
    icon: getCueTypeIcon(cueType.icon, 'h-3.5 w-3.5'),
  }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    if (isSelectedTrackLocked) return
    onSubmit({
      title: title.trim(),
      type,
      trackId,
      startMinute: Math.max(0, startMinute),
      durationMinutes: Math.max(1, durationMinutes),
      notes: notes.trim(),
    })
  }

  const isEditingCue = Boolean(initialData?.title)

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g., Opening Song"
        required
        autoFocus={!window.matchMedia('(pointer: coarse)').matches}
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <DropdownSelect
          label="Track"
          value={trackId}
          onChange={setTrackId}
          options={trackOptions}
        />
        <DropdownSelect
          label="Type"
          value={type}
          onChange={(value) => setType(value as CueItemType)}
          options={typeOptions}
        />
      </div>
      {isSelectedTrackLocked && <p className="text-xs text-gray-500">Locked tracks cannot receive or modify cues.</p>}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <CounterInput
          id="cue-start-minute"
          label="Start (min)"
          value={startMinute}
          min={0}
          onChange={setStartMinute}
        />
        <CounterInput
          id="cue-duration-minute"
          label="Duration (min)"
          value={durationMinutes}
          min={1}
          onChange={setDurationMinutes}
        />
      </div>

      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Additional notes..."
        rows={2}
      />
      {isEditingCue && onDelete ? (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button type="button" variant="danger-secondary" className="w-full" onClick={onDelete}>
            Delete Cue
          </Button>
          <Button type="submit" className="w-full" disabled={!title.trim() || isSelectedTrackLocked}>
            Save Cue
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button type="button" variant="secondary" className="w-full" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="w-full" disabled={!title.trim() || isSelectedTrackLocked}>
            Add Cue
          </Button>
        </div>
      )}
    </form>
  )
}
