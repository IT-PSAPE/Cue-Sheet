import { CueSheetProvider } from './features/cue-sheet/context/cue-sheet-context'
import { CueSheetScreen } from './screens/cue-sheet-screen'

export function App() {
  return (
    <CueSheetProvider>
      <CueSheetScreen />
    </CueSheetProvider>
  )
}
