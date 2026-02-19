import { Modal } from '../../../components/modal'
import { CueItemForm } from './cue-item-form'
import type { CueItem, CueItemFormData, CueType, Track } from '../types'

interface EditCueModalProps {
  cue: CueItem | null
  onClose: () => void
  tracks: Track[]
  cueTypes: CueType[]
  onSubmit: (data: CueItemFormData) => void
  onDelete: () => void
}

export function EditCueModal({ cue, onClose, tracks, cueTypes, onSubmit, onDelete }: EditCueModalProps) {
  return (
    <Modal isOpen={!!cue} onClose={onClose} title="Edit Cue" size="sm" compact>
      {cue && (
        <CueItemForm
          initialData={{ title: cue.title, type: cue.type, trackId: cue.trackId, startMinute: cue.startMinute, durationMinutes: cue.durationMinutes, notes: cue.notes }}
          tracks={tracks}
          cueTypes={cueTypes}
          defaultTrackId={cue.trackId}
          onSubmit={onSubmit}
          onCancel={onClose}
          onDelete={onDelete}
        />
      )}
    </Modal>
  )
}
