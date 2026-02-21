import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useCueSheetScreen } from '../hooks/use-cue-sheet-screen'
import { MIN_ZOOM } from '../utils/timeline-constants'
import type { CueItemFormData, CueType, TimelineTopBarControls } from '../types'

interface AppContextValue {
  state: ReturnType<typeof useCueSheetScreen>['state']
  selectedEvent: ReturnType<typeof useCueSheetScreen>['selectedEvent']
  cueTypes: CueType[]
  hasSelectedEvent: boolean
  isCreatingEvent: boolean
  isEditingEvent: boolean
  isDeletingEvent: boolean
  isAddingCue: boolean
  isDeletingCue: boolean
  isConfiguringCueTypes: boolean
  addCueDefaults: ReturnType<typeof useCueSheetScreen>['addCueDefaults']
  editingCue: ReturnType<typeof useCueSheetScreen>['editingCue']
  closeCreateEvent: () => void
  closeEditEvent: () => void
  closeDeleteEvent: () => void
  closeAddCue: () => void
  closeEditCue: () => void
  closeDeleteCue: () => void
  closeConfigureCueTypes: () => void
  handleCreateEvent: ReturnType<typeof useCueSheetScreen>['handleCreateEvent']
  handleUpdateEvent: ReturnType<typeof useCueSheetScreen>['handleUpdateEvent']
  handleDeleteEvent: () => void
  handleAddCue: (data: CueItemFormData) => void
  handleUpdateCue: (data: CueItemFormData) => void
  handleDeleteCue: () => void
  handleSaveCueTypes: (types: CueType[]) => void
  handleSelectEvent: (id: string) => void
  openCreateEvent: () => void
  openEditEvent: () => void
  openDeleteEvent: () => void
  openAddCue: (defaults?: { trackId: string; startMinute: number }) => void
  openEditCue: (cueId: string) => void
  openDeleteCue: () => void
  openConfigureCueTypes: () => void
  zoomValue: number
  minZoomValue: number
  maxZoomValue: number
  handleZoomChange: (value: number) => void
  setTimelineTopBarControls: (controls: TimelineTopBarControls | null) => void
}

const AppContext = createContext<AppContextValue | null>(null)

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [timelineTopBarControls, setTimelineTopBarControls] = useState<TimelineTopBarControls | null>(null)
  const {
    state,
    selectedEvent,
    cueTypes,
    isCreatingEvent,
    isEditingEvent,
    isDeletingEvent,
    isAddingCue,
    isDeletingCue,
    isConfiguringCueTypes,
    addCueDefaults,
    editingCue,
    openCreateEvent,
    openEditEvent,
    openDeleteEvent,
    openAddCue,
    openEditCue,
    openDeleteCue,
    openConfigureCueTypes,
    closeCreateEvent,
    closeEditEvent,
    closeDeleteEvent,
    closeAddCue,
    closeEditCue,
    closeDeleteCue,
    closeConfigureCueTypes,
    handleSelectEvent,
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleAddCue,
    handleUpdateCue,
    handleDeleteCue,
    handleSaveCueTypes,
  } = useCueSheetScreen()

  const hasSelectedEvent = selectedEvent !== null
  const defaultZoomPercent = Math.round(MIN_ZOOM * 100)
  const zoomValue = timelineTopBarControls?.zoomPercent ?? defaultZoomPercent
  const minZoomValue = timelineTopBarControls?.minZoomPercent ?? defaultZoomPercent
  const maxZoomValue = timelineTopBarControls?.maxZoomPercent ?? defaultZoomPercent

  const handleZoomChange = useCallback((value: number) => {
    if (!timelineTopBarControls) return
    timelineTopBarControls.setZoomPercent(value)
  }, [timelineTopBarControls])

  const value = useMemo(
    () => ({
      state,
      selectedEvent,
      cueTypes,
      hasSelectedEvent,
      isCreatingEvent,
      isEditingEvent,
      isDeletingEvent,
      isAddingCue,
      isDeletingCue,
      isConfiguringCueTypes,
      addCueDefaults,
      editingCue,
      closeCreateEvent,
      closeEditEvent,
      closeDeleteEvent,
      closeAddCue,
      closeEditCue,
      closeDeleteCue,
      closeConfigureCueTypes,
      handleCreateEvent,
      handleUpdateEvent,
      handleDeleteEvent,
      handleAddCue,
      handleUpdateCue,
      handleDeleteCue,
      handleSaveCueTypes,
      handleSelectEvent,
      openCreateEvent,
      openEditEvent,
      openDeleteEvent,
      openAddCue,
      openEditCue,
      openDeleteCue,
      openConfigureCueTypes,
      zoomValue,
      minZoomValue,
      maxZoomValue,
      handleZoomChange,
      setTimelineTopBarControls,
    }),
    [
      state,
      selectedEvent,
      cueTypes,
      hasSelectedEvent,
      isCreatingEvent,
      isEditingEvent,
      isDeletingEvent,
      isAddingCue,
      isDeletingCue,
      isConfiguringCueTypes,
      addCueDefaults,
      editingCue,
      closeCreateEvent,
      closeEditEvent,
      closeDeleteEvent,
      closeAddCue,
      closeEditCue,
      closeDeleteCue,
      closeConfigureCueTypes,
      handleCreateEvent,
      handleUpdateEvent,
      handleDeleteEvent,
      handleAddCue,
      handleUpdateCue,
      handleDeleteCue,
      handleSaveCueTypes,
      handleSelectEvent,
      openCreateEvent,
      openEditEvent,
      openDeleteEvent,
      openAddCue,
      openEditCue,
      openDeleteCue,
      openConfigureCueTypes,
      zoomValue,
      minZoomValue,
      maxZoomValue,
      handleZoomChange,
      setTimelineTopBarControls,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}
