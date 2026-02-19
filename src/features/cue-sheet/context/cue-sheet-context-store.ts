import { createContext } from 'react'
import type { Event } from '../types'
import type { CueSheetState, CueSheetAction } from './cue-sheet-context'

export interface CueSheetContextValue {
  state: CueSheetState
  dispatch: React.Dispatch<CueSheetAction>
  selectedEvent: Event | null
}

export const CueSheetContext = createContext<CueSheetContextValue | null>(null)
