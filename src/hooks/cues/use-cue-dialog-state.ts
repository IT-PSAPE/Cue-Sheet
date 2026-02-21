import { useCallback, useMemo, useState, type Dispatch } from 'react'
import type { CueSheetAction } from '@/contexts/cue-sheet/cue-sheet-reducer'
import type { CueItem, CueItemFormData, CueType, Event } from '@/types/cue-sheet'
import { getFirstUnlockedTrack, isTrackLocked } from '@/utils/cue-sheet/cue-sheet-utils'

export type AddCueDefaults = { trackId: string; startMinute: number }

interface UseCueDialogStateProps {
  selectedEvent: Event | null
  dispatch: Dispatch<CueSheetAction>
}

interface UseCueDialogStateValue {
  isAddingCue: boolean
  isDeletingCue: boolean
  isConfiguringCueTypes: boolean
  addCueDefaults: AddCueDefaults | null
  editingCue: CueItem | null
  openAddCue: (defaults?: AddCueDefaults) => void
  openEditCue: (cueId: string) => void
  openDeleteCue: () => void
  openConfigureCueTypes: () => void
  closeAddCue: () => void
  closeEditCue: () => void
  closeDeleteCue: () => void
  closeConfigureCueTypes: () => void
  handleAddCue: (data: CueItemFormData) => void
  handleUpdateCue: (data: CueItemFormData) => void
  handleDeleteCue: () => void
  handleSaveCueTypes: (types: CueType[]) => void
  resetCueDialogs: () => void
}

export function useCueDialogState({ selectedEvent, dispatch }: UseCueDialogStateProps): UseCueDialogStateValue {
  const [isAddingCue, setIsAddingCue] = useState(false)
  const [addCueDefaults, setAddCueDefaults] = useState<AddCueDefaults | null>(null)
  const [editingCueId, setEditingCueId] = useState<string | null>(null)
  const [isDeletingCue, setIsDeletingCue] = useState(false)
  const [isConfiguringCueTypes, setIsConfiguringCueTypes] = useState(false)

  const editingCue = useMemo(() => {
    if (!selectedEvent || !editingCueId) return null
    return selectedEvent.cueItems.find((cueItem) => cueItem.id === editingCueId) ?? null
  }, [editingCueId, selectedEvent])

  const openAddCue = useCallback((defaults?: AddCueDefaults) => {
    if (!selectedEvent) return
    const firstUnlockedTrack = getFirstUnlockedTrack(selectedEvent.tracks)
    if (!firstUnlockedTrack) return
    const nextTrackId = defaults && !isTrackLocked(selectedEvent.tracks, defaults.trackId) ? defaults.trackId : firstUnlockedTrack.id
    setAddCueDefaults({ trackId: nextTrackId, startMinute: defaults?.startMinute ?? 0 })
    setIsAddingCue(true)
  }, [selectedEvent])

  const openEditCue = useCallback((cueId: string) => {
    if (!selectedEvent) return
    const cue = selectedEvent.cueItems.find((cueItem) => cueItem.id === cueId)
    if (!cue || isTrackLocked(selectedEvent.tracks, cue.trackId)) return
    setIsDeletingCue(false)
    setEditingCueId(cueId)
  }, [selectedEvent])

  const openDeleteCue = useCallback(() => {
    if (!editingCueId) return
    setIsDeletingCue(true)
  }, [editingCueId])

  const openConfigureCueTypes = useCallback(() => {
    setIsConfiguringCueTypes(true)
  }, [])

  const closeAddCue = useCallback(() => {
    setIsAddingCue(false)
    setAddCueDefaults(null)
  }, [])

  const closeEditCue = useCallback(() => {
    if (isDeletingCue) return
    setIsDeletingCue(false)
    setEditingCueId(null)
  }, [isDeletingCue])

  const closeDeleteCue = useCallback(() => {
    setIsDeletingCue(false)
  }, [])

  const closeConfigureCueTypes = useCallback(() => {
    setIsConfiguringCueTypes(false)
  }, [])

  const resetCueDialogs = useCallback(() => {
    setIsAddingCue(false)
    setAddCueDefaults(null)
    setEditingCueId(null)
    setIsDeletingCue(false)
    setIsConfiguringCueTypes(false)
  }, [])

  const handleAddCue = useCallback(
    (data: CueItemFormData) => {
      if (!selectedEvent) return
      if (isTrackLocked(selectedEvent.tracks, data.trackId)) return
      dispatch({ type: 'ADD_CUE_ITEM', payload: { eventId: selectedEvent.id, data } })
      closeAddCue()
    },
    [closeAddCue, dispatch, selectedEvent]
  )

  const handleUpdateCue = useCallback(
    (data: CueItemFormData) => {
      if (!selectedEvent || !editingCue) return
      if (isTrackLocked(selectedEvent.tracks, editingCue.trackId)) return
      if (isTrackLocked(selectedEvent.tracks, data.trackId)) return
      dispatch({ type: 'UPDATE_CUE_ITEM', payload: { eventId: selectedEvent.id, cueItemId: editingCue.id, data } })
      setIsDeletingCue(false)
      setEditingCueId(null)
    },
    [dispatch, editingCue, selectedEvent]
  )

  const handleDeleteCue = useCallback(() => {
    if (!selectedEvent || !editingCue) return
    if (isTrackLocked(selectedEvent.tracks, editingCue.trackId)) return
    dispatch({ type: 'DELETE_CUE_ITEM', payload: { eventId: selectedEvent.id, cueItemId: editingCue.id } })
    setIsDeletingCue(false)
    setEditingCueId(null)
  }, [dispatch, editingCue, selectedEvent])

  const handleSaveCueTypes = useCallback(
    (types: CueType[]) => {
      dispatch({ type: 'SET_CUE_TYPES', payload: types })
      closeConfigureCueTypes()
    },
    [closeConfigureCueTypes, dispatch]
  )

  return {
    isAddingCue,
    isDeletingCue,
    isConfiguringCueTypes,
    addCueDefaults,
    editingCue,
    openAddCue,
    openEditCue,
    openDeleteCue,
    openConfigureCueTypes,
    closeAddCue,
    closeEditCue,
    closeDeleteCue,
    closeConfigureCueTypes,
    handleAddCue,
    handleUpdateCue,
    handleDeleteCue,
    handleSaveCueTypes,
    resetCueDialogs,
  }
}
