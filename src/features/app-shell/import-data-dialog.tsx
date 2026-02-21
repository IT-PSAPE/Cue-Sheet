import { useCallback, useMemo, type ChangeEventHandler } from 'react'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { Dialog } from '@/components/dialog'
import { Icon } from '@/components/icon'
import type { Event } from '@/types/cue-sheet'

interface ImportDataDialogProps {
  open: boolean
  importFileName: string
  importError: string | null
  importCueTypeCount: number
  importEvents: Event[]
  includeCueTypes: boolean
  importEventSelection: Record<string, boolean>
  disableImport: boolean
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  onFileChange: ChangeEventHandler<HTMLInputElement>
  onCueTypesToggle: ChangeEventHandler<HTMLInputElement>
  onEventToggle: ChangeEventHandler<HTMLInputElement>
  onSelectAllEvents: () => void
  onDeselectAllEvents: () => void
  onImport: () => void
}

export function ImportDataDialog({ open, importFileName, importError, importCueTypeCount, importEvents, includeCueTypes, importEventSelection, disableImport, onOpenChange, onCancel, onFileChange, onCueTypesToggle, onEventToggle, onSelectAllEvents, onDeselectAllEvents, onImport }: ImportDataDialogProps) {
  const hasParsedFile = importFileName.length > 0
  const hasEvents = importEvents.length > 0

  const renderEventItem = useCallback(
    (eventItem: Event) => {
      const description = `${eventItem.tracks.length} tracks • ${eventItem.cueItems.length} cues`
      return (
        <Checkbox
          key={eventItem.id}
          id={`import-event-${eventItem.id}`}
          data-item-id={eventItem.id}
          checked={Boolean(importEventSelection[eventItem.id])}
          onChange={onEventToggle}
          label={eventItem.name}
          description={description}
        />
      )
    },
    [importEventSelection, onEventToggle]
  )

  const eventList = useMemo(() => importEvents.map(renderEventItem), [importEvents, renderEventItem])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Header>
            <h2 className="text-lg font-semibold text-gray-900">Import Data</h2>
            <Dialog.Close><Icon.x_close size={20} /></Dialog.Close>
          </Dialog.Header>
          <Dialog.Content>
            <div className="space-y-4">
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                <label htmlFor="cue-sheet-import-file" className="text-sm font-medium text-gray-900">Choose JSON export file</label>
                <input id="cue-sheet-import-file" type="file" accept="application/json" onChange={onFileChange} className="mt-2 block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border file:border-gray-200 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-gray-100" />
                {hasParsedFile ? <p className="mt-2 text-xs text-gray-500">Loaded: {importFileName}</p> : null}
                {importError ? <p className="mt-2 text-xs text-red-600">{importError}</p> : null}
              </div>

              {hasParsedFile && !importError ? (
                <div className="rounded-xl border border-gray-200 bg-white p-3">
                  <div className="space-y-2">
                    <Checkbox
                      id="import-cue-types"
                      checked={includeCueTypes}
                      onChange={onCueTypesToggle}
                      label={`Cue Types (${importCueTypeCount})`}
                      description="Import cue types from this file."
                      disabled={importCueTypeCount === 0}
                    />
                    <div className="px-2 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Events</div>
                    {hasEvents ? eventList : <p className="px-2 text-sm text-gray-500">No events found in this file.</p>}
                  </div>
                </div>
              ) : null}

              {hasParsedFile && !importError && hasEvents ? (
                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={onSelectAllEvents}>Select All Events</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={onDeselectAllEvents}>Clear Events</Button>
                </div>
              ) : null}
            </div>
          </Dialog.Content>
          <Dialog.Footer>
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
              <Button type="button" onClick={onImport} disabled={disableImport}>Import Selected</Button>
            </div>
          </Dialog.Footer>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
