import type { CueType, Event } from '@/types/cue-sheet'
import { generateId } from './cue-sheet-utils'

interface SerializedEvent extends Omit<Event, 'createdAt'> {
  createdAt: string
}

export interface CueSheetTransferPayload {
  version: 1
  exportedAt: string
  cueTypes?: CueType[]
  events?: SerializedEvent[]
}

interface BuildExportPayloadOptions {
  cueTypes: CueType[]
  events: Event[]
  includeCueTypes: boolean
  includedEventIds: Set<string>
}

function toEventJson(event: Event): SerializedEvent {
  return { ...event, createdAt: event.createdAt.toISOString() }
}

export function buildCueSheetExportPayload({ cueTypes, events, includeCueTypes, includedEventIds }: BuildExportPayloadOptions): CueSheetTransferPayload {
  const selectedEvents = events.filter((event) => includedEventIds.has(event.id)).map(toEventJson)
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    cueTypes: includeCueTypes ? cueTypes.map((cueType) => ({ ...cueType })) : undefined,
    events: selectedEvents,
  }
}

export function downloadCueSheetJson(payload: CueSheetTransferPayload) {
  const jsonText = JSON.stringify(payload, null, 2)
  const blob = new Blob([jsonText], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  const dateToken = new Date().toISOString().slice(0, 10)
  anchor.href = url
  anchor.download = `cue-sheet-export-${dateToken}.json`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export function remapImportedEvents(events: Event[]): Event[] {
  return events.map((event) => {
    const eventId = generateId()
    const trackIdMap = new Map<string, string>()
    const tracks = event.tracks.map((track) => {
      const trackId = generateId()
      trackIdMap.set(track.id, trackId)
      return { ...track, id: trackId }
    })
    const fallbackTrackId = tracks[0]?.id ?? generateId()
    const cueItems = event.cueItems.map((cueItem) => ({
      ...cueItem,
      id: generateId(),
      trackId: trackIdMap.get(cueItem.trackId) ?? fallbackTrackId,
    }))

    return { ...event, id: eventId, tracks, cueItems }
  })
}

export function mergeCueTypes(existingCueTypes: CueType[], importedCueTypes: CueType[]): CueType[] {
  if (importedCueTypes.length === 0) return existingCueTypes
  const importedById = new Map(importedCueTypes.map((cueType) => [cueType.id, cueType]))
  const merged = existingCueTypes.map((cueType) => importedById.get(cueType.id) ?? cueType)
  const existingIds = new Set(existingCueTypes.map((cueType) => cueType.id))
  const newCueTypes = importedCueTypes.filter((cueType) => !existingIds.has(cueType.id))
  return [...merged, ...newCueTypes]
}
