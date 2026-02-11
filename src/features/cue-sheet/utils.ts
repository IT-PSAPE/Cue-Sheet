import type { Event, EventFormData, CueItem, CueItemFormData, Track, TrackFormData } from './types'

export function generateId(): string {
  return crypto.randomUUID()
}

export const DEFAULT_TRACK_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
]

export function createTrack(data: TrackFormData): Track {
  return {
    id: generateId(),
    name: data.name,
    color: data.color,
  }
}

export function createDefaultTracks(): Track[] {
  return [
    { id: generateId(), name: 'Main Stage', color: DEFAULT_TRACK_COLORS[0] },
    { id: generateId(), name: 'Audio', color: DEFAULT_TRACK_COLORS[1] },
    { id: generateId(), name: 'Lighting', color: DEFAULT_TRACK_COLORS[2] },
  ]
}

export function createEvent(data: EventFormData): Event {
  const tracks = createDefaultTracks()
  return {
    id: generateId(),
    name: data.name,
    description: data.description,
    totalDurationMinutes: data.totalDurationMinutes,
    tracks,
    cueItems: [],
    createdAt: new Date(),
  }
}

export function createCueItem(data: CueItemFormData): CueItem {
  return {
    id: generateId(),
    title: data.title,
    description: data.description,
    type: data.type,
    trackId: data.trackId,
    startMinute: data.startMinute,
    durationMinutes: data.durationMinutes,
    notes: data.notes,
  }
}

export function formatMinutes(minutes: number): string {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs > 0) {
    return `${hrs}h ${mins}m`
  }
  return `${mins}m`
}
