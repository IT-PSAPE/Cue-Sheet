import type {
  CueType,
  Event,
  EventFormData,
  CueItem,
  CueItemFormData,
  Track,
  TrackFormData,
} from '@/types/cue-sheet'

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID()
    } catch { /* falls through to fallback in non-secure contexts */ }
  }
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export const TRACK_COLORS = [
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#a855f7', // purple
]

export const DEFAULT_CUE_TYPES: CueType[] = [
  { id: 'performance', name: 'Performance', icon: 'music' },
  { id: 'technical', name: 'Technical', icon: 'wrench' },
  { id: 'equipment', name: 'Equipment', icon: 'briefcase' },
  { id: 'announcement', name: 'Announcement', icon: 'microphone' },
  { id: 'transition', name: 'Transition', icon: 'transition' },
]

/** @deprecated Use TRACK_COLORS instead */
export const DEFAULT_TRACK_COLORS = TRACK_COLORS

export function createTrack(data: TrackFormData): Track {
  return {
    id: generateId(),
    name: data.name,
    color: data.color,
    hidden: data.hidden ?? false,
    locked: data.locked ?? false,
  }
}

export function createDefaultTracks(): Track[] {
  return [
    { id: generateId(), name: 'Main Stage', color: DEFAULT_TRACK_COLORS[0], hidden: false, locked: false },
  ]
}

export function createDefaultCueTypes(): CueType[] {
  return DEFAULT_CUE_TYPES.map((type) => ({ ...type }))
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

export function getTrackById(tracks: Track[], trackId: string): Track | null {
  return tracks.find((track) => track.id === trackId) ?? null
}

export function isTrackLocked(tracks: Track[], trackId: string): boolean {
  return Boolean(getTrackById(tracks, trackId)?.locked)
}

export function hasUnlockedTracks(tracks: Track[]): boolean {
  return tracks.some((track) => !track.locked)
}

export function getFirstUnlockedTrack(tracks: Track[]): Track | null {
  return tracks.find((track) => !track.locked) ?? null
}
