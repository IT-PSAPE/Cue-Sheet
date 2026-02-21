import { useCallback, useState } from 'react'
import type { CueItemFormData, CueType, EventFormData } from '../types'
import { useCueSheet } from './use-cue-sheet'
import { useCueDialogState, type AddCueDefaults } from './use-cue-dialog-state'

type EventDialog = 'create' | 'edit' | 'delete' | null

interface UseCueSheetScreenValue {
  state: ReturnType<typeof useCueSheet>['state']
  selectedEvent: ReturnType<typeof useCueSheet>['selectedEvent']
  cueTypes: CueType[]
  isCreatingEvent: boolean
  isEditingEvent: boolean
  isDeletingEvent: boolean
  isAddingCue: boolean
  isDeletingCue: boolean
  isConfiguringCueTypes: boolean
  addCueDefaults: AddCueDefaults | null
  editingCue: ReturnType<typeof useCueDialogState>['editingCue']
  openCreateEvent: () => void
  openEditEvent: () => void
  openDeleteEvent: () => void
  openAddCue: (defaults?: AddCueDefaults) => void
  openEditCue: (cueId: string) => void
  openDeleteCue: () => void
  openConfigureCueTypes: () => void
  closeCreateEvent: () => void
  closeEditEvent: () => void
  closeDeleteEvent: () => void
  closeAddCue: () => void
  closeEditCue: () => void
  closeDeleteCue: () => void
  closeConfigureCueTypes: () => void
  handleSelectEvent: (id: string) => void
  handleCreateEvent: (data: EventFormData) => void
  handleUpdateEvent: (data: EventFormData) => void
  handleDeleteEvent: () => void
  handleAddCue: (data: CueItemFormData) => void
  handleUpdateCue: (data: CueItemFormData) => void
  handleDeleteCue: () => void
  handleSaveCueTypes: (types: CueType[]) => void
}

export function useCueSheetScreen(): UseCueSheetScreenValue {
  const { state, dispatch, selectedEvent } = useCueSheet()
  const [activeDialog, setActiveDialog] = useState<EventDialog>(null)
  const { resetCueDialogs, ...cueDialogs } = useCueDialogState({ selectedEvent, dispatch })

  const openCreateEvent = useCallback(() => {
    setActiveDialog('create')
  }, [])

  const openEditEvent = useCallback(() => {
    setActiveDialog('edit')
  }, [])

  const openDeleteEvent = useCallback(() => {
    setActiveDialog('delete')
  }, [])

  const closeCreateEvent = useCallback(() => {
    setActiveDialog((currentDialog) => (currentDialog === 'create' ? null : currentDialog))
  }, [])

  const closeEditEvent = useCallback(() => {
    setActiveDialog((currentDialog) => (currentDialog === 'edit' ? null : currentDialog))
  }, [])

  const closeDeleteEvent = useCallback(() => {
    setActiveDialog((currentDialog) => (currentDialog === 'delete' ? null : currentDialog))
  }, [])

  const handleSelectEvent = useCallback(
    (id: string) => {
      resetCueDialogs()
      dispatch({ type: 'SELECT_EVENT', payload: { id } })
    },
    [dispatch, resetCueDialogs]
  )

  const handleCreateEvent = useCallback(
    (data: EventFormData) => {
      dispatch({ type: 'CREATE_EVENT', payload: data })
      closeCreateEvent()
    },
    [closeCreateEvent, dispatch]
  )

  const handleUpdateEvent = useCallback(
    (data: EventFormData) => {
      if (!selectedEvent) return
      dispatch({ type: 'UPDATE_EVENT', payload: { id: selectedEvent.id, data } })
      closeEditEvent()
    },
    [closeEditEvent, dispatch, selectedEvent]
  )

  const handleDeleteEvent = useCallback(() => {
    if (!selectedEvent) return
    resetCueDialogs()
    dispatch({ type: 'DELETE_EVENT', payload: { id: selectedEvent.id } })
    closeDeleteEvent()
  }, [closeDeleteEvent, dispatch, resetCueDialogs, selectedEvent])

  return {
    state,
    selectedEvent,
    cueTypes: state.cueTypes,
    isCreatingEvent: activeDialog === 'create',
    isEditingEvent: activeDialog === 'edit',
    isDeletingEvent: activeDialog === 'delete',
    openCreateEvent,
    openEditEvent,
    openDeleteEvent,
    closeCreateEvent,
    closeEditEvent,
    closeDeleteEvent,
    handleSelectEvent,
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    ...cueDialogs,
  }
}
