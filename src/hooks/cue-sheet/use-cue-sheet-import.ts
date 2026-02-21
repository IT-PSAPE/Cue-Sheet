import { useCallback, useMemo, useState, type ChangeEventHandler } from 'react'
import { useCueSheet } from './use-cue-sheet'
import { remapImportedEvents } from '@/utils/cue-sheet/cue-sheet-transfer'
import { parseCueSheetImportJson, type ParsedImportData } from '@/utils/cue-sheet/cue-sheet-import-parser'

function buildSelectionMap(ids: string[], selectedByDefault: boolean): Record<string, boolean> {
  return Object.fromEntries(ids.map((id) => [id, selectedByDefault]))
}

export function useCueSheetImport() {
  const { dispatch } = useCueSheet()
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importIncludeCueTypes, setImportIncludeCueTypes] = useState(true)
  const [importEventSelection, setImportEventSelection] = useState<Record<string, boolean>>({})
  const [parsedImportData, setParsedImportData] = useState<ParsedImportData | null>(null)
  const [importFileName, setImportFileName] = useState('')
  const [importError, setImportError] = useState<string | null>(null)

  const hasImportSelection = useMemo(() => {
    if (!parsedImportData) return false
    const hasCueTypeSelection = importIncludeCueTypes && parsedImportData.cueTypes.length > 0
    const hasEventSelection = Object.values(importEventSelection).some(Boolean)
    return hasCueTypeSelection || hasEventSelection
  }, [importEventSelection, importIncludeCueTypes, parsedImportData])

  const openImportDialog = useCallback(() => {
    setParsedImportData(null)
    setImportFileName('')
    setImportError(null)
    setImportIncludeCueTypes(true)
    setImportEventSelection({})
    setIsImportDialogOpen(true)
  }, [])

  const closeImportDialog = useCallback(() => {
    setIsImportDialogOpen(false)
  }, [])

  const handleImportFileChange = useCallback<ChangeEventHandler<HTMLInputElement>>(async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const jsonText = await file.text()
      const nextParsedData = parseCueSheetImportJson(jsonText)
      setImportFileName(file.name)
      setImportError(null)
      setParsedImportData(nextParsedData)
      setImportIncludeCueTypes(nextParsedData.cueTypes.length > 0)
      setImportEventSelection(buildSelectionMap(nextParsedData.events.map((item) => item.id), true))
    } catch {
      setImportFileName(file.name)
      setParsedImportData(null)
      setImportIncludeCueTypes(false)
      setImportEventSelection({})
      setImportError('Could not parse this file. Please choose a valid cue sheet JSON export.')
    }
  }, [])

  const handleImportCueTypesToggle = useCallback<ChangeEventHandler<HTMLInputElement>>((event) => {
    setImportIncludeCueTypes(event.target.checked)
  }, [])

  const handleImportEventToggle = useCallback<ChangeEventHandler<HTMLInputElement>>((event) => {
    const targetId = event.target.dataset.itemId
    if (!targetId) return
    const isChecked = event.target.checked
    setImportEventSelection((currentSelection) => ({ ...currentSelection, [targetId]: isChecked }))
  }, [])

  const handleImportSelectAllEvents = useCallback(() => {
    if (!parsedImportData) return
    setImportEventSelection(buildSelectionMap(parsedImportData.events.map((item) => item.id), true))
  }, [parsedImportData])

  const handleImportDeselectAllEvents = useCallback(() => {
    if (!parsedImportData) return
    setImportEventSelection(buildSelectionMap(parsedImportData.events.map((item) => item.id), false))
  }, [parsedImportData])

  const handleImportConfirm = useCallback(() => {
    if (!parsedImportData) return
    const selectedEvents = parsedImportData.events.filter((event) => importEventSelection[event.id])
    const remappedEvents = remapImportedEvents(selectedEvents)
    const selectedCueTypes = importIncludeCueTypes ? parsedImportData.cueTypes : []

    dispatch({
      type: 'IMPORT_DATA',
      payload: {
        events: remappedEvents,
        cueTypes: importIncludeCueTypes ? selectedCueTypes : undefined,
      },
    })

    closeImportDialog()
  }, [closeImportDialog, dispatch, importEventSelection, importIncludeCueTypes, parsedImportData])

  return {
    isImportDialogOpen,
    importIncludeCueTypes,
    importEventSelection,
    parsedImportData,
    importFileName,
    importError,
    hasImportSelection,
    openImportDialog,
    closeImportDialog,
    handleImportFileChange,
    handleImportCueTypesToggle,
    handleImportEventToggle,
    handleImportSelectAllEvents,
    handleImportDeselectAllEvents,
    handleImportConfirm,
  }
}
