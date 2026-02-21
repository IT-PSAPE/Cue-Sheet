export type CueItemType = string

export type CueTypeIcon =
  | 'music'
  | 'wrench'
  | 'briefcase'
  | 'microphone'
  | 'transition'
  | 'star'
  | 'flag'
  | 'bolt'
  | 'bell'
  | 'users'
  | 'camera'
  | 'video'
  | 'lightbulb'
  | 'clock'
  | 'calendar'
  | 'clipboard'
  | 'pin'
  | 'speaker'
  | 'shield'
  | 'check-circle'
  | 'alert'
  | 'heart'
  | 'book'
  | 'truck'
  | 'sparkles'

export interface CueType {
  id: string
  name: string
  icon: CueTypeIcon
}

export interface Track {
  id: string
  name: string
  color: string
  hidden?: boolean
  locked?: boolean
}

export interface CueItem {
  id: string
  title: string
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
  type: CueItemType
  trackId: string
  startMinute: number
  durationMinutes: number
  notes: string
}

export interface TrackFormData {
  name: string
  color: string
  hidden?: boolean
  locked?: boolean
}

export interface TimelineTopBarControls {
  zoomPercent: number
  minZoomPercent: number
  maxZoomPercent: number
  setZoomPercent: (value: number) => void
}
