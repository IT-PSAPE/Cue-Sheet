import { Modal } from '../../../components/modal'
import { CueItemForm } from './cue-item-form'
import type { CueItemFormData, CueType, Track } from '../types'

interface AddCueModalProps {
  isOpen: boolean
  onClose: () => void
  tracks: Track[]
  cueTypes: CueType[]
  defaultTrackId: string
  defaultStartMinute?: number
  onSubmit: (data: CueItemFormData) => void
}

export function AddCueModal({ isOpen, onClose, tracks, cueTypes, defaultTrackId, defaultStartMinute, onSubmit }: AddCueModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Cue Item" size="sm" compact>
      <CueItemForm tracks={tracks} cueTypes={cueTypes} defaultTrackId={defaultTrackId} defaultStartMinute={defaultStartMinute} onSubmit={onSubmit} onCancel={onClose} />
    </Modal>
  )
}
