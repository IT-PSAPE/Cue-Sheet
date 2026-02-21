import type { CueItem, CueType, Event, Track } from '@/types/cue-sheet'
import { createDefaultCueTypes, generateId } from './cue-sheet-utils'
import type { CueSheetTransferPayload } from './cue-sheet-transfer'

export interface ParsedImportData {
  cueTypes: CueType[]
  events: Event[]
}

function isCueType(value: unknown): value is CueType {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return typeof record.id === 'string' && typeof record.name === 'string' && typeof record.icon === 'string'
}

function isTrack(value: unknown): value is Track {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return typeof record.id === 'string' && typeof record.name === 'string' && typeof record.color === 'string'
}

function isCueItem(value: unknown): value is CueItem {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string'
    && typeof record.title === 'string'
    && typeof record.type === 'string'
    && typeof record.trackId === 'string'
    && typeof record.startMinute === 'number'
    && typeof record.durationMinutes === 'number'
    && typeof record.notes === 'string'
  )
}

function normalizeTrack(rawTrack: Track): Track {
  return {
    id: rawTrack.id,
    name: rawTrack.name,
    color: rawTrack.color,
    hidden: Boolean(rawTrack.hidden),
    locked: Boolean(rawTrack.locked),
  }
}

function normalizeCueItem(rawCueItem: CueItem, fallbackTrackId: string, fallbackTypeId: string, trackIds: Set<string>): CueItem {
  return {
    ...rawCueItem,
    trackId: trackIds.has(rawCueItem.trackId) ? rawCueItem.trackId : fallbackTrackId,
    type: rawCueItem.type || fallbackTypeId,
    startMinute: Math.max(0, Math.floor(rawCueItem.startMinute)),
    durationMinutes: Math.max(1, Math.floor(rawCueItem.durationMinutes)),
  }
}

function normalizeImportedEvent(rawEvent: unknown, index: number, fallbackTypeId: string): Event {
  const eventRecord = (rawEvent && typeof rawEvent === 'object' ? rawEvent : {}) as Partial<Event>
  const tracks = Array.isArray(eventRecord.tracks) ? eventRecord.tracks.filter(isTrack).map(normalizeTrack) : []
  const safeTracks = tracks.length > 0 ? tracks : [{ id: generateId(), name: 'Main Track', color: '#ec4899', hidden: false, locked: false }]
  const trackIds = new Set(safeTracks.map((track) => track.id))
  const fallbackTrackId = safeTracks[0].id
  const cueItems = Array.isArray(eventRecord.cueItems)
    ? eventRecord.cueItems.filter(isCueItem).map((cueItem) => normalizeCueItem(cueItem, fallbackTrackId, fallbackTypeId, trackIds))
    : []
  const createdAtDate = eventRecord.createdAt instanceof Date ? eventRecord.createdAt : new Date(eventRecord.createdAt ?? Date.now())

  return {
    id: typeof eventRecord.id === 'string' ? eventRecord.id : generateId(),
    name: typeof eventRecord.name === 'string' && eventRecord.name.trim().length > 0 ? eventRecord.name : `Imported Event ${index + 1}`,
    description: typeof eventRecord.description === 'string' ? eventRecord.description : '',
    totalDurationMinutes: typeof eventRecord.totalDurationMinutes === 'number' ? Math.max(1, Math.floor(eventRecord.totalDurationMinutes)) : 60,
    tracks: safeTracks,
    cueItems,
    createdAt: Number.isNaN(createdAtDate.getTime()) ? new Date() : createdAtDate,
  }
}

export function parseCueSheetImportJson(jsonText: string): ParsedImportData {
  const parsed = JSON.parse(jsonText) as Partial<CueSheetTransferPayload>
  const cueTypes = Array.isArray(parsed.cueTypes) ? parsed.cueTypes.filter(isCueType) : []
  const fallbackTypeId = cueTypes[0]?.id ?? createDefaultCueTypes()[0].id
  const rawEvents = Array.isArray(parsed.events) ? parsed.events : []
  const normalizedEvents = rawEvents.map((event, index) => normalizeImportedEvent(event, index, fallbackTypeId))
  const uniqueEvents: Event[] = []
  const seenIds = new Set<string>()

  for (const event of normalizedEvents) {
    const nextId = seenIds.has(event.id) ? generateId() : event.id
    seenIds.add(nextId)
    uniqueEvents.push({ ...event, id: nextId })
  }

  return { cueTypes, events: uniqueEvents }
}
