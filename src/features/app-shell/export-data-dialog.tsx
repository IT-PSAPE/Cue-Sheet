import { useCallback, useMemo, type ChangeEventHandler } from 'react'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { Dialog } from '@/components/dialog'
import { Icon } from '@/components/icon'

interface EventSelectionItem {
  id: string
  name: string
  cueCount: number
  trackCount: number
}

interface ExportDataDialogProps {
  open: boolean
  cueTypeCount: number
  eventSelectionItems: EventSelectionItem[]
  includeCueTypes: boolean
  eventSelection: Record<string, boolean>
  disableExport: boolean
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  onCueTypesToggle: ChangeEventHandler<HTMLInputElement>
  onEventToggle: ChangeEventHandler<HTMLInputElement>
  onSelectAllEvents: () => void
  onDeselectAllEvents: () => void
  onExport: () => void
}

export function ExportDataDialog({ open, cueTypeCount, eventSelectionItems, includeCueTypes, eventSelection, disableExport, onOpenChange, onCancel, onCueTypesToggle, onEventToggle, onSelectAllEvents, onDeselectAllEvents, onExport }: ExportDataDialogProps) {
  const hasEvents = eventSelectionItems.length > 0

  const renderEventItem = useCallback(
    (eventItem: EventSelectionItem) => {
      const description = `${eventItem.trackCount} tracks • ${eventItem.cueCount} cues`
      return (
        <Checkbox
          key={eventItem.id}
          id={`export-event-${eventItem.id}`}
          data-item-id={eventItem.id}
          checked={Boolean(eventSelection[eventItem.id])}
          onChange={onEventToggle}
          label={eventItem.name}
          description={description}
        />
      )
    },
    [eventSelection, onEventToggle]
  )

  const eventList = useMemo(() => eventSelectionItems.map(renderEventItem), [eventSelectionItems, renderEventItem])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Header>
            <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
            <Dialog.Close><Icon.x_close size={20} /></Dialog.Close>
          </Dialog.Header>
          <Dialog.Content>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Select the data you want to include in your JSON export file.</p>
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="space-y-2">
                  <Checkbox
                    id="export-cue-types"
                    checked={includeCueTypes}
                    onChange={onCueTypesToggle}
                    label={`Cue Types (${cueTypeCount})`}
                    description="Includes default and custom cue types."
                  />
                  <div className="px-2 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Events</div>
                  {hasEvents ? eventList : <p className="px-2 text-sm text-gray-500">No events available for export.</p>}
                </div>
              </div>
              {hasEvents ? (
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
              <Button type="button" onClick={onExport} disabled={disableExport}>Export JSON</Button>
            </div>
          </Dialog.Footer>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
