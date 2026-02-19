import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../../../components/button'
import { EmptyState } from '../../../components/empty-state'
import { useCueSheet } from '../hooks/use-cue-sheet'
import { TimelineProvider } from '../context/timeline-context'
import { TimelineSidebar } from './timeline-sidebar'
import { TimelineCanvas } from './timeline-canvas'
import { TimelineOptionsMenu } from './timeline-options-menu'
import { ConfigureCueTypesModal } from './configure-cue-types-modal'
import { AddCueModal } from './add-cue-modal'
import { EditCueModal } from './edit-cue-modal'
import { DeleteCueModal } from './delete-cue-modal'
import type { CueItem, CueItemFormData, CueType } from '../types'

interface TimelineViewProps {
  onCreateEvent: () => void
  optionsContainer?: HTMLDivElement | null
}

export function TimelineView({ onCreateEvent, optionsContainer }: TimelineViewProps) {
  const { selectedEvent, dispatch, state } = useCueSheet()
  const [isAddingCue, setIsAddingCue] = useState(false)
  const [addCueDefaults, setAddCueDefaults] = useState<{ trackId: string; startMinute: number } | null>(null)
  const [editingCue, setEditingCue] = useState<CueItem | null>(null)
  const [isConfirmingCueDelete, setIsConfirmingCueDelete] = useState(false)
  const [isConfiguringCueTypes, setIsConfiguringCueTypes] = useState(false)

  if (!selectedEvent) return null

  const eventId = selectedEvent.id
  const cueTypes = state.cueTypes

  const handleTrackClick = (trackId: string, startMinute: number) => {
    setAddCueDefaults({ trackId, startMinute })
    setIsAddingCue(true)
  }

  const handleCueClick = (cue: CueItem) => {
    setIsConfirmingCueDelete(false)
    setEditingCue(cue)
  }

  const handleAddCue = (data: CueItemFormData) => {
    dispatch({ type: 'ADD_CUE_ITEM', payload: { eventId, data } })
    setIsAddingCue(false)
    setAddCueDefaults(null)
  }

  const handleUpdateCue = (data: CueItemFormData) => {
    if (!editingCue) return
    dispatch({ type: 'UPDATE_CUE_ITEM', payload: { eventId, cueItemId: editingCue.id, data } })
    setEditingCue(null)
    setIsConfirmingCueDelete(false)
  }

  const handleConfirmDeleteCue = () => {
    if (!editingCue) return
    dispatch({ type: 'DELETE_CUE_ITEM', payload: { eventId, cueItemId: editingCue.id } })
    setIsConfirmingCueDelete(false)
    setEditingCue(null)
  }

  const closeEditCueModal = () => {
    if (isConfirmingCueDelete) return
    setIsConfirmingCueDelete(false)
    setEditingCue(null)
  }

  const handleSaveCueTypes = (types: CueType[]) => {
    dispatch({ type: 'SET_CUE_TYPES', payload: types })
    setIsConfiguringCueTypes(false)
  }

  return (
    <TimelineProvider selectedEvent={selectedEvent} onTrackClick={handleTrackClick} onCueClick={handleCueClick}>
      <div className="flex h-full min-h-0 flex-col">
        {optionsContainer && createPortal(
          <TimelineOptionsMenu onAddCue={() => setIsAddingCue(true)} onConfigureCueTypes={() => setIsConfiguringCueTypes(true)} onCreateEvent={onCreateEvent} />,
          optionsContainer,
        )}

        {selectedEvent.tracks.length === 0 ? (
          <EmptyState title="No tracks yet" description="Add tracks to organize your cue items." action={<Button onClick={() => setIsAddingCue(true)}>+ Add First Track</Button>} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
            <div className="flex min-h-0 flex-1">
              <TimelineSidebar />
              <TimelineCanvas />
            </div>
          </div>
        )}

        <ConfigureCueTypesModal isOpen={isConfiguringCueTypes} onClose={() => setIsConfiguringCueTypes(false)} cueTypes={cueTypes} onSave={handleSaveCueTypes} />
        <AddCueModal isOpen={isAddingCue} onClose={() => { setIsAddingCue(false); setAddCueDefaults(null) }} tracks={selectedEvent.tracks} cueTypes={cueTypes} defaultTrackId={addCueDefaults?.trackId ?? selectedEvent.tracks[0]?.id ?? ''} defaultStartMinute={addCueDefaults?.startMinute} onSubmit={handleAddCue} />
        <EditCueModal cue={editingCue} onClose={closeEditCueModal} tracks={selectedEvent.tracks} cueTypes={cueTypes} onSubmit={handleUpdateCue} onDelete={() => setIsConfirmingCueDelete(true)} />
        <DeleteCueModal cue={editingCue} isOpen={!!editingCue && isConfirmingCueDelete} onClose={() => setIsConfirmingCueDelete(false)} onConfirm={handleConfirmDeleteCue} />
      </div>
    </TimelineProvider>
  )
}
