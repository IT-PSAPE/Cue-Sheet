import { useEffect, useReducer, type ReactNode } from 'react'
import type { CueType, Event, EventFormData, CueItemFormData, TrackFormData } from '../types'
import { createDefaultCueTypes, createEvent, createCueItem, createTrack } from '../utils'
import { CueSheetContext, type CueSheetContextValue } from './cue-sheet-context-store'

const STORAGE_KEY = 'cue-sheet-data'

export type CueSheetAction =
  | { type: 'CREATE_EVENT'; payload: EventFormData }
  | { type: 'UPDATE_EVENT'; payload: { id: string; data: Partial<EventFormData> } }
  | { type: 'DELETE_EVENT'; payload: { id: string } }
  | { type: 'SELECT_EVENT'; payload: { id: string | null } }
  | { type: 'ADD_TRACK'; payload: { eventId: string; data: TrackFormData } }
  | { type: 'UPDATE_TRACK'; payload: { eventId: string; trackId: string; data: Partial<TrackFormData> } }
  | { type: 'DELETE_TRACK'; payload: { eventId: string; trackId: string } }
  | { type: 'REORDER_TRACKS'; payload: { eventId: string; fromIndex: number; toIndex: number } }
  | { type: 'ADD_CUE_ITEM'; payload: { eventId: string; data: CueItemFormData } }
  | { type: 'UPDATE_CUE_ITEM'; payload: { eventId: string; cueItemId: string; data: Partial<CueItemFormData> } }
  | { type: 'DELETE_CUE_ITEM'; payload: { eventId: string; cueItemId: string } }
  | { type: 'MOVE_CUE_ITEM'; payload: { eventId: string; cueItemId: string; startMinute: number; trackId?: string } }
  | { type: 'SET_CUE_TYPES'; payload: CueType[] }

export interface CueSheetState {
  events: Event[]
  selectedEventId: string | null
  cueTypes: CueType[]
}

const initialState: CueSheetState = {
  events: [],
  selectedEventId: null,
  cueTypes: createDefaultCueTypes(),
}

function loadState(): CueSheetState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw) as CueSheetState
    const cueTypes = Array.isArray(parsed.cueTypes) && parsed.cueTypes.length > 0
      ? parsed.cueTypes
      : createDefaultCueTypes()
    const validTypeIds = new Set(cueTypes.map((type) => type.id))
    const fallbackTypeId = cueTypes[0]?.id ?? createDefaultCueTypes()[0].id

    const events = (parsed.events ?? []).map((event) => ({
      ...event,
      createdAt: new Date(event.createdAt),
      cueItems: (event.cueItems ?? []).map((item) => ({
        ...item,
        type: validTypeIds.has(item.type) ? item.type : fallbackTypeId,
      })),
    }))

    return {
      events,
      selectedEventId: parsed.selectedEventId ?? events[0]?.id ?? null,
      cueTypes,
    }
  } catch {
    return initialState
  }
}

function saveState(state: CueSheetState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

function cueSheetReducer(state: CueSheetState, action: CueSheetAction): CueSheetState {
  switch (action.type) {
    case 'CREATE_EVENT': {
      const newEvent = createEvent(action.payload)
      return {
        ...state,
        events: [...state.events, newEvent],
        selectedEventId: newEvent.id,
      }
    }
    case 'UPDATE_EVENT': {
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.id
            ? { ...event, ...action.payload.data }
            : event
        ),
      }
    }
    case 'DELETE_EVENT': {
      const newEvents = state.events.filter((e) => e.id !== action.payload.id)
      return {
        ...state,
        events: newEvents,
        selectedEventId:
          state.selectedEventId === action.payload.id
            ? newEvents[0]?.id ?? null
            : state.selectedEventId,
      }
    }
    case 'SELECT_EVENT': {
      return { ...state, selectedEventId: action.payload.id }
    }
    case 'ADD_TRACK': {
      return {
        ...state,
        events: state.events.map((event) => {
          if (event.id !== action.payload.eventId) return event
          const newTrack = createTrack(action.payload.data)
          return { ...event, tracks: [...event.tracks, newTrack] }
        }),
      }
    }
    case 'UPDATE_TRACK': {
      return {
        ...state,
        events: state.events.map((event) => {
          if (event.id !== action.payload.eventId) return event
          return {
            ...event,
            tracks: event.tracks.map((track) =>
              track.id === action.payload.trackId
                ? { ...track, ...action.payload.data }
                : track
            ),
          }
        }),
      }
    }
    case 'DELETE_TRACK': {
      return {
        ...state,
        events: state.events.map((event) => {
          if (event.id !== action.payload.eventId) return event
          return {
            ...event,
            tracks: event.tracks.filter((t) => t.id !== action.payload.trackId),
            cueItems: event.cueItems.filter((c) => c.trackId !== action.payload.trackId),
          }
        }),
      }
    }
    case 'REORDER_TRACKS': {
      return {
        ...state,
        events: state.events.map((event) => {
          if (event.id !== action.payload.eventId) return event
          const { fromIndex, toIndex } = action.payload
          const newTracks = [...event.tracks]
          const [removed] = newTracks.splice(fromIndex, 1)
          newTracks.splice(toIndex, 0, removed)
          return { ...event, tracks: newTracks }
        }),
      }
    }
    case 'ADD_CUE_ITEM': {
      return {
        ...state,
        events: state.events.map((event) => {
          if (event.id !== action.payload.eventId) return event
          const newCueItem = createCueItem(action.payload.data)
          return { ...event, cueItems: [...event.cueItems, newCueItem] }
        }),
      }
    }
    case 'UPDATE_CUE_ITEM': {
      return {
        ...state,
        events: state.events.map((event) => {
          if (event.id !== action.payload.eventId) return event
          return {
            ...event,
            cueItems: event.cueItems.map((item) =>
              item.id === action.payload.cueItemId
                ? { ...item, ...action.payload.data }
                : item
            ),
          }
        }),
      }
    }
    case 'DELETE_CUE_ITEM': {
      return {
        ...state,
        events: state.events.map((event) => {
          if (event.id !== action.payload.eventId) return event
          return {
            ...event,
            cueItems: event.cueItems.filter((item) => item.id !== action.payload.cueItemId),
          }
        }),
      }
    }
    case 'MOVE_CUE_ITEM': {
      return {
        ...state,
        events: state.events.map((event) => {
          if (event.id !== action.payload.eventId) return event
          return {
            ...event,
            cueItems: event.cueItems.map((item) =>
              item.id === action.payload.cueItemId
                ? {
                    ...item,
                    startMinute: Math.max(0, action.payload.startMinute),
                    trackId: action.payload.trackId ?? item.trackId,
                  }
                : item
            ),
          }
        }),
      }
    }
    case 'SET_CUE_TYPES': {
      const cueTypes = action.payload.length > 0 ? action.payload : createDefaultCueTypes()
      const validTypeIds = new Set(cueTypes.map((type) => type.id))
      const fallbackTypeId = cueTypes[0].id

      return {
        ...state,
        cueTypes,
        events: state.events.map((event) => ({
          ...event,
          cueItems: event.cueItems.map((cueItem) => ({
            ...cueItem,
            type: validTypeIds.has(cueItem.type) ? cueItem.type : fallbackTypeId,
          })),
        })),
      }
    }
    default:
      return state
  }
}

interface CueSheetProviderProps {
  children: ReactNode
}

export function CueSheetProvider({ children }: CueSheetProviderProps) {
  const [state, dispatch] = useReducer(cueSheetReducer, undefined, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const selectedEvent = state.events.find((e) => e.id === state.selectedEventId) ?? null

  const value: CueSheetContextValue = {
    state,
    dispatch,
    selectedEvent,
  }

  return (
    <CueSheetContext.Provider value={value}>
      {children}
    </CueSheetContext.Provider>
  )
}
