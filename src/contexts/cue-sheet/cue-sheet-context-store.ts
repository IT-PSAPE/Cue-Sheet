import { createContext } from 'react'
import type { Event } from '@/types/cue-sheet'
import type { CueSheetAction, CueSheetState } from './cue-sheet-reducer'

export interface CueSheetContextValue {
  state: CueSheetState
  dispatch: React.Dispatch<CueSheetAction>
  selectedEvent: Event | null
}

export const CueSheetContext = createContext<CueSheetContextValue | null>(null)
