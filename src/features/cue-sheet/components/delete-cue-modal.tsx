import { useCallback } from 'react'
import { Button } from '../../../components/button'
import { Dialog } from '../../../components/dialog'
import { Icon } from '../../../components/icon'
import { useAppContext } from '../context/app-context'

export function DeleteCueModal() {
  const { editingCue, isDeletingCue, closeDeleteCue, handleDeleteCue } = useAppContext()
  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeDeleteCue()
    },
    [closeDeleteCue]
  )

  if (!editingCue) return null

  return (
    <Dialog.Root open={isDeletingCue} onOpenChange={handleDialogOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport size="sm">
          <Dialog.Header>
            <h2 className="text-lg font-semibold text-gray-900">Delete Cue</h2>
            <Dialog.Close><Icon.x_close size={20} /></Dialog.Close>
          </Dialog.Header>
          <Dialog.Content>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">Delete &ldquo;{editingCue.title}&rdquo;? This cannot be undone.</p>
              <div className="grid grid-cols-2 gap-4">
                <Button type="button" variant="secondary" className="w-full" onClick={closeDeleteCue}>Keep Cue</Button>
                <Button type="button" variant="danger" className="w-full" onClick={handleDeleteCue}>Confirm Delete</Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
