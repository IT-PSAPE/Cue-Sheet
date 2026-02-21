import { useEffect, useReducer, type ReactNode } from 'react'
import { CueSheetContext, type CueSheetContextValue } from './cue-sheet-context-store'
import { cueSheetReducer, initialCueSheetState } from './cue-sheet-reducer'
import { loadCueSheetState, saveCueSheetState } from './cue-sheet-storage'

interface CueSheetProviderProps {
  children: ReactNode
}

export function CueSheetProvider({ children }: CueSheetProviderProps) {
  const [state, dispatch] = useReducer(cueSheetReducer, initialCueSheetState, loadCueSheetState)

  useEffect(() => {
    saveCueSheetState(state)
  }, [state])

  const selectedEvent = state.events.find((event) => event.id === state.selectedEventId) ?? null
  const value: CueSheetContextValue = { state, dispatch, selectedEvent }

  return <CueSheetContext.Provider value={value}>{children}</CueSheetContext.Provider>
}
