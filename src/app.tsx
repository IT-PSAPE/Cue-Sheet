import { AppProvider } from './features/cue-sheet/context/app-context'
import { CueSheetProvider } from './features/cue-sheet/context/cue-sheet-context'
import { AppScreen } from './screens/app-screen'

export function App() {
  return (
    <CueSheetProvider>
      <AppProvider>
        <AppScreen />
      </AppProvider>
    </CueSheetProvider>
  )
}
