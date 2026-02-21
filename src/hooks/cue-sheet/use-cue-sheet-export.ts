import { useCallback, useMemo, useState, type ChangeEventHandler } from 'react'
import { useCueSheet } from './use-cue-sheet'
import { buildCueSheetExportPayload, downloadCueSheetJson } from '@/utils/cue-sheet/cue-sheet-transfer'

function buildSelectionMap(ids: string[], selectedByDefault: boolean): Record<string, boolean> {
  return Object.fromEntries(ids.map((id) => [id, selectedByDefault]))
}

export function useCueSheetExport() {
  const { state } = useCueSheet()
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportIncludeCueTypes, setExportIncludeCueTypes] = useState(true)
  const [exportEventSelection, setExportEventSelection] = useState<Record<string, boolean>>({})

  const eventSelectionItems = useMemo(
    () => state.events.map((event) => ({ id: event.id, name: event.name, cueCount: event.cueItems.length, trackCount: event.tracks.length })),
    [state.events]
  )

  const hasExportSelection = useMemo(
    () => exportIncludeCueTypes || Object.values(exportEventSelection).some(Boolean),
    [exportEventSelection, exportIncludeCueTypes]
  )

  const openExportDialog = useCallback(() => {
    setExportIncludeCueTypes(true)
    setExportEventSelection(buildSelectionMap(state.events.map((event) => event.id), true))
    setIsExportDialogOpen(true)
  }, [state.events])

  const closeExportDialog = useCallback(() => {
    setIsExportDialogOpen(false)
  }, [])

  const handleExportCueTypesToggle = useCallback<ChangeEventHandler<HTMLInputElement>>((event) => {
    setExportIncludeCueTypes(event.target.checked)
  }, [])

  const handleExportEventToggle = useCallback<ChangeEventHandler<HTMLInputElement>>((event) => {
    const targetId = event.target.dataset.itemId
    if (!targetId) return
    const isChecked = event.target.checked
    setExportEventSelection((currentSelection) => ({ ...currentSelection, [targetId]: isChecked }))
  }, [])

  const handleExportSelectAllEvents = useCallback(() => {
    setExportEventSelection(buildSelectionMap(state.events.map((event) => event.id), true))
  }, [state.events])

  const handleExportDeselectAllEvents = useCallback(() => {
    setExportEventSelection(buildSelectionMap(state.events.map((event) => event.id), false))
  }, [state.events])

  const handleExportConfirm = useCallback(() => {
    const includedEventIds = new Set(Object.entries(exportEventSelection).filter(([, isChecked]) => isChecked).map(([eventId]) => eventId))
    const payload = buildCueSheetExportPayload({
      cueTypes: state.cueTypes,
      events: state.events,
      includeCueTypes: exportIncludeCueTypes,
      includedEventIds,
    })
    downloadCueSheetJson(payload)
    closeExportDialog()
  }, [closeExportDialog, exportEventSelection, exportIncludeCueTypes, state.cueTypes, state.events])

  return {
    cueTypeCount: state.cueTypes.length,
    eventSelectionItems,
    isExportDialogOpen,
    exportIncludeCueTypes,
    exportEventSelection,
    hasExportSelection,
    openExportDialog,
    closeExportDialog,
    handleExportCueTypesToggle,
    handleExportEventToggle,
    handleExportSelectAllEvents,
    handleExportDeselectAllEvents,
    handleExportConfirm,
  }
}
