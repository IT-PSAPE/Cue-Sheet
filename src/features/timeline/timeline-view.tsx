import { useCallback, useEffect, useMemo } from 'react'
import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
import { TimelineProvider, useTimeline } from '@/contexts/timeline-context'
import { useAppContext } from '@/contexts/app-context'
import type { CueItem } from '@/types/cue-sheet'
import { MIN_ZOOM } from '@/utils/timeline/timeline-constants'
import { isTrackLocked } from '@/utils/cue-sheet/cue-sheet-utils'
import { AddCueModal } from '@/features/cues/dialogs/add-cue-modal'
import { ConfigureCueTypesModal } from '@/features/cues/dialogs/configure-cue-types-modal'
import { DeleteCueModal } from '@/features/cues/dialogs/delete-cue-modal'
import { EditCueModal } from '@/features/cues/dialogs/edit-cue-modal'
import { TimelineShell } from './timeline-shell'


function TimelineTopBarBridge() {
  const { clampedZoom, maxZoom, setZoomAnchoredToPlayhead } = useTimeline()
  const minZoomPercent = Math.round(MIN_ZOOM * 100)
  const maxZoomPercent = Math.round(maxZoom * 100)
  const zoomPercent = Math.round(clampedZoom * 100)

  const { setTimelineTopBarControls } = useAppContext()

  const setZoomPercent = useCallback(
    (value: number) => {
      const clampedValue = Math.min(maxZoomPercent, Math.max(minZoomPercent, value))
      setZoomAnchoredToPlayhead(clampedValue / 100)
    },
    [maxZoomPercent, minZoomPercent, setZoomAnchoredToPlayhead]
  )

  const controls = useMemo(
    () => ({ zoomPercent, minZoomPercent, maxZoomPercent, setZoomPercent }),
    [maxZoomPercent, minZoomPercent, setZoomPercent, zoomPercent]
  )

  useEffect(() => {
    setTimelineTopBarControls(controls)
    return () => setTimelineTopBarControls(null)
  }, [controls, setTimelineTopBarControls])

  return null
}

export function TimelineView() {
  const { selectedEvent, openAddCue, openEditCue } = useAppContext()

  const handleTrackClick = useCallback(
    (trackId: string, startMinute: number) => {
      if (!selectedEvent) return
      if (isTrackLocked(selectedEvent.tracks, trackId)) return
      openAddCue({ trackId, startMinute })
    },
    [openAddCue, selectedEvent]
  )

  const handleCueClick = useCallback(
    (cue: CueItem) => {
      if (!selectedEvent) return
      if (isTrackLocked(selectedEvent.tracks, cue.trackId)) return
      openEditCue(cue.id)
    },
    [openEditCue, selectedEvent]
  )

  const handleAddTrackAction = useCallback(() => {
    openAddCue()
  }, [openAddCue])

  if (!selectedEvent) return null

  return (
    <TimelineProvider selectedEvent={selectedEvent} onTrackClick={handleTrackClick} onCueClick={handleCueClick}>
      <div className="flex h-full min-h-0 flex-col">
        <TimelineTopBarBridge />

        <EmptyState
          show={selectedEvent.tracks.length === 0}
          title="No tracks yet"
          description="Add tracks to organize your cue items."
          action={<Button onClick={handleAddTrackAction}>+ Add First Track</Button>}
        />

        <TimelineShell />

        <ConfigureCueTypesModal />

        <AddCueModal />

        <EditCueModal />

        <DeleteCueModal />
      </div>
    </TimelineProvider>
  )
}
