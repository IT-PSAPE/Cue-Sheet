import { AppProvider } from '@/contexts/app-context'
import { CueSheetProvider } from '@/contexts/cue-sheet/cue-sheet-context'
import { AppScreen } from '@/screens/app-screen'

export function App() {
  return (
    <CueSheetProvider>
      <AppProvider>
        <AppScreen />
      </AppProvider>
    </CueSheetProvider>
  )
}
