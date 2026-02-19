import { createDefaultCueTypes } from '../utils'
import type { CueSheetState } from './cue-sheet-reducer'

const STORAGE_KEY = 'cue-sheet-data'

export function loadCueSheetState(initialState: CueSheetState): CueSheetState {
  try {
    const rawState = localStorage.getItem(STORAGE_KEY)
    if (!rawState) return initialState

    const parsedState = JSON.parse(rawState) as CueSheetState
    const cueTypes = Array.isArray(parsedState.cueTypes) && parsedState.cueTypes.length > 0
      ? parsedState.cueTypes
      : createDefaultCueTypes()
    const validTypeIds = new Set(cueTypes.map((cueType) => cueType.id))
    const fallbackTypeId = cueTypes[0]?.id ?? createDefaultCueTypes()[0].id
    const events = (parsedState.events ?? []).map((event) => ({
      ...event,
      createdAt: new Date(event.createdAt),
      cueItems: (event.cueItems ?? []).map((cueItem) => ({
        ...cueItem,
        type: validTypeIds.has(cueItem.type) ? cueItem.type : fallbackTypeId,
      })),
    }))

    return {
      events,
      selectedEventId: parsedState.selectedEventId ?? events[0]?.id ?? null,
      cueTypes,
    }
  } catch {
    return initialState
  }
}

export function saveCueSheetState(state: CueSheetState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or unavailable — silently ignore.
  }
}
