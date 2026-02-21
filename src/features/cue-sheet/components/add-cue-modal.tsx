import { useCallback } from 'react'
import { Dialog } from '../../../components/dialog'
import { Icon } from '../../../components/icon'
import { useAppContext } from '../context/app-context'
import { getFirstUnlockedTrack } from '../utils'
import { CueItemForm } from './cue-item-form'

export function AddCueModal() {
  const { selectedEvent, cueTypes, isAddingCue, addCueDefaults, closeAddCue, handleAddCue } = useAppContext()
  const firstUnlockedTrack = selectedEvent ? getFirstUnlockedTrack(selectedEvent.tracks) : null
  const defaultTrackId = addCueDefaults?.trackId ?? firstUnlockedTrack?.id ?? ''
  const defaultStartMinute = addCueDefaults?.startMinute
  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeAddCue()
    },
    [closeAddCue]
  )

  if (!selectedEvent || !firstUnlockedTrack) return null

  return (
    <Dialog.Root open={isAddingCue} onOpenChange={handleDialogOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport size="sm">
          <Dialog.Header>
            <h2 className="text-lg font-semibold text-gray-900">Add Cue Item</h2>
            <Dialog.Close><Icon.x_close size={20} /></Dialog.Close>
          </Dialog.Header>
          <Dialog.Content>
            <CueItemForm tracks={selectedEvent.tracks} cueTypes={cueTypes} defaultTrackId={defaultTrackId} defaultStartMinute={defaultStartMinute} onSubmit={handleAddCue} onCancel={closeAddCue} />
          </Dialog.Content>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
