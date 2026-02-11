export type CueItemType = 'performance' | 'technical' | 'equipment' | 'announcement' | 'transition'

export interface Track {
  id: string
  name: string
  color: string
}

export interface CueItem {
  id: string
  title: string
  description: string
  type: CueItemType
  trackId: string
  startMinute: number
  durationMinutes: number
  notes: string
}

export interface Event {
  id: string
  name: string
  description: string
  totalDurationMinutes: number
  tracks: Track[]
  cueItems: CueItem[]
  createdAt: Date
}

export interface EventFormData {
  name: string
  description: string
  totalDurationMinutes: number
}

export interface CueItemFormData {
  title: string
  description: string
  type: CueItemType
  trackId: string
  startMinute: number
  durationMinutes: number
  notes: string
}

export interface TrackFormData {
  name: string
  color: string
}
