import { useContext } from 'react'
import { CueSheetContext, type CueSheetContextValue } from '../context/cue-sheet-context'

export function useCueSheet(): CueSheetContextValue {
  const context = useContext(CueSheetContext)
  if (!context) {
    throw new Error('useCueSheet must be used within a CueSheetProvider')
  }
  return context
}
