import type { CueItemFormData, CueType, Event, EventFormData, TrackFormData } from '../types'
import { createCueItem, createDefaultCueTypes, createEvent, createTrack } from '../utils'

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

export const initialCueSheetState: CueSheetState = {
  events: [],
  selectedEventId: null,
  cueTypes: createDefaultCueTypes(),
}

export function cueSheetReducer(state: CueSheetState, action: CueSheetAction): CueSheetState {
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
      const newEvents = state.events.filter((event) => event.id !== action.payload.id)
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
          if (event.tracks.length <= 1) return event
          return {
            ...event,
            tracks: event.tracks.filter((track) => track.id !== action.payload.trackId),
            cueItems: event.cueItems.filter((cueItem) => cueItem.trackId !== action.payload.trackId),
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
            cueItems: event.cueItems.map((cueItem) =>
              cueItem.id === action.payload.cueItemId
                ? { ...cueItem, ...action.payload.data }
                : cueItem
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
            cueItems: event.cueItems.filter((cueItem) => cueItem.id !== action.payload.cueItemId),
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
            cueItems: event.cueItems.map((cueItem) =>
              cueItem.id === action.payload.cueItemId
                ? {
                    ...cueItem,
                    startMinute: Math.max(0, action.payload.startMinute),
                    trackId: action.payload.trackId ?? cueItem.trackId,
                  }
                : cueItem
            ),
          }
        }),
      }
    }
    case 'SET_CUE_TYPES': {
      const cueTypes = action.payload.length > 0 ? action.payload : createDefaultCueTypes()
      const validTypeIds = new Set(cueTypes.map((cueType) => cueType.id))
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
