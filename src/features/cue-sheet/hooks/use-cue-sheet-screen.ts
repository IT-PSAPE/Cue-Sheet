import { useCallback, useState } from 'react'
import type { EventFormData } from '../types'
import { useCueSheet } from './use-cue-sheet'

type EventDialog = 'create' | 'edit' | 'delete' | null

interface UseCueSheetScreenValue {
  state: ReturnType<typeof useCueSheet>['state']
  selectedEvent: ReturnType<typeof useCueSheet>['selectedEvent']
  optionsContainer: HTMLDivElement | null
  setOptionsContainer: (element: HTMLDivElement | null) => void
  isCreatingEvent: boolean
  isEditingEvent: boolean
  isDeletingEvent: boolean
  openCreateEvent: () => void
  openEditEvent: () => void
  openDeleteEvent: () => void
  closeCreateEvent: () => void
  closeEditEvent: () => void
  closeDeleteEvent: () => void
  handleSelectEvent: (id: string) => void
  handleCreateEvent: (data: EventFormData) => void
  handleUpdateEvent: (data: EventFormData) => void
  handleDeleteEvent: () => void
}

export function useCueSheetScreen(): UseCueSheetScreenValue {
  const { state, dispatch, selectedEvent } = useCueSheet()
  const [activeDialog, setActiveDialog] = useState<EventDialog>(null)
  const [optionsContainer, setOptionsContainer] = useState<HTMLDivElement | null>(null)

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
      dispatch({ type: 'SELECT_EVENT', payload: { id } })
    },
    [dispatch]
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
    dispatch({ type: 'DELETE_EVENT', payload: { id: selectedEvent.id } })
    closeDeleteEvent()
  }, [closeDeleteEvent, dispatch, selectedEvent])

  return {
    state,
    selectedEvent,
    optionsContainer,
    setOptionsContainer,
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
  }
}
