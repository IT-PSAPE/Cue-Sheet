import { Button } from '../../../components/button'
import { Modal } from '../../../components/modal'
import type { CueItem } from '../types'

interface DeleteCueModalProps {
  cue: CueItem | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteCueModal({ cue, isOpen, onClose, onConfirm }: DeleteCueModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Cue" size="sm" compact>
      {cue && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">Delete &ldquo;{cue.title}&rdquo;? This cannot be undone.</p>
          <div className="grid grid-cols-2 gap-4">
            <Button type="button" variant="secondary" className="w-full" onClick={onClose}>Keep Cue</Button>
            <Button type="button" variant="danger" className="w-full" onClick={onConfirm}>Confirm Delete</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
