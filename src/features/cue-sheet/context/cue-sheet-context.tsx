import { createContext, useReducer, type ReactNode } from 'react'
import type { Event, EventFormData, CueItemFormData, TrackFormData } from '../types'
import { createEvent, createCueItem, createTrack } from '../utils'

type CueSheetAction =
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

interface CueSheetState {
  events: Event[]
  selectedEventId: string | null
}

const initialState: CueSheetState = {
  events: [],
  selectedEventId: null,
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
    default:
      return state
  }
}

export interface CueSheetContextValue {
  state: CueSheetState
  dispatch: React.Dispatch<CueSheetAction>
  selectedEvent: Event | null
}

export const CueSheetContext = createContext<CueSheetContextValue | null>(null)

interface CueSheetProviderProps {
  children: ReactNode
}

export function CueSheetProvider({ children }: CueSheetProviderProps) {
  const [state, dispatch] = useReducer(cueSheetReducer, initialState)

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
