import { useCallback, useEffect } from 'react'
import { Dialog } from '../../../components/dialog'
import { Icon } from '../../../components/icon'
import { useAppContext } from '../context/app-context'
import { isTrackLocked } from '../utils'
import { CueItemForm } from './cue-item-form'

export function EditCueModal() {
  const { selectedEvent, cueTypes, editingCue, closeEditCue, handleUpdateCue, openDeleteCue } = useAppContext()
  const isEditingCueLocked = Boolean(selectedEvent && editingCue && isTrackLocked(selectedEvent.tracks, editingCue.trackId))
  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeEditCue()
    },
    [closeEditCue]
  )

  useEffect(() => {
    if (isEditingCueLocked) closeEditCue()
  }, [closeEditCue, isEditingCueLocked])

  if (!selectedEvent || !editingCue || isEditingCueLocked) return null

  return (
    <Dialog.Root open={Boolean(editingCue)} onOpenChange={handleDialogOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport size="sm">
          <Dialog.Header>
            <h2 className="text-lg font-semibold text-gray-900">Edit Cue</h2>
            <Dialog.Close><Icon.x_close size={20} /></Dialog.Close>
          </Dialog.Header>
          <Dialog.Content>
            <CueItemForm
              initialData={{ title: editingCue.title, type: editingCue.type, trackId: editingCue.trackId, startMinute: editingCue.startMinute, durationMinutes: editingCue.durationMinutes, notes: editingCue.notes }}
              tracks={selectedEvent.tracks}
              cueTypes={cueTypes}
              defaultTrackId={editingCue.trackId}
              onSubmit={handleUpdateCue}
              onCancel={closeEditCue}
              onDelete={openDeleteCue}
            />
          </Dialog.Content>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
