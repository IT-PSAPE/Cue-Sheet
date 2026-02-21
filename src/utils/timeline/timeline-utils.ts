import type { CueItem, CueType, CueTypeIcon, Track } from '@/types/cue-sheet'

export function formatTimeDisplay(minutes: number): string {
  const mins = Math.floor(minutes)
  const secs = Math.floor((minutes - mins) * 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function getMarkerInterval(effectiveZoom: number, totalMinutes: number): number {
  if (effectiveZoom >= 2) return 5
  if (effectiveZoom >= 1) return totalMinutes <= 60 ? 10 : 15
  return totalMinutes <= 60 ? 15 : 30
}

export function buildTimeMarkers(totalMinutes: number, markerInterval: number): number[] {
  const markers: number[] = []
  for (let i = 0; i <= totalMinutes; i += markerInterval) {
    markers.push(i)
  }
  return markers
}

export function getCuesByTrack(cueItems: CueItem[], trackId: string): CueItem[] {
  return cueItems.filter((c) => c.trackId === trackId)
}

export function getTrackColor(tracks: Track[], trackId: string): string {
  return tracks.find((t) => t.id === trackId)?.color ?? '#6b7280'
}

export function getCueTypeById(cueTypes: CueType[], cueTypeId: string, fallbackIcon: CueTypeIcon = 'music'): CueType {
  return cueTypes.find((cueType) => cueType.id === cueTypeId) ?? { id: cueTypeId, name: 'Unknown', icon: fallbackIcon }
}
