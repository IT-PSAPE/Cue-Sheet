import { useCallback, useEffect, useState } from 'react'
import type { Event } from '../types'
import type { CueSheetAction } from '../context/cue-sheet-reducer'

interface TrackDragState {
  trackId: string
  startIndex: number
  currentIndex: number
  startY: number
}

interface UseTrackDragOptions {
  selectedEvent: Event | null
  dispatch: React.Dispatch<CueSheetAction>
  eventId: string
}

export function useTrackDrag({ selectedEvent, dispatch, eventId }: UseTrackDragOptions) {
  const [trackDragState, setTrackDragState] = useState<TrackDragState | null>(null)

  const handleTrackDragStart = useCallback((trackId: string, index: number, e: React.MouseEvent) => {
    e.preventDefault()
    setTrackDragState({ trackId, startIndex: index, currentIndex: index, startY: e.clientY })
  }, [])

  const handleTrackDragMove = useCallback(
    (e: MouseEvent) => {
      if (!trackDragState || !selectedEvent) return
      const trackElements = document.querySelectorAll('[data-track-sidebar]')
      let newIndex = trackDragState.startIndex

      for (let i = 0; i < trackElements.length; i++) {
        const rect = trackElements[i].getBoundingClientRect()
        if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
          newIndex = i
          break
        }
      }

      if (newIndex !== trackDragState.currentIndex) {
        setTrackDragState({ ...trackDragState, currentIndex: newIndex })
      }
    },
    [trackDragState, selectedEvent]
  )

  const handleTrackDragEnd = useCallback(() => {
    if (trackDragState && trackDragState.startIndex !== trackDragState.currentIndex) {
      dispatch({ type: 'REORDER_TRACKS', payload: { eventId, fromIndex: trackDragState.startIndex, toIndex: trackDragState.currentIndex } })
    }
    setTrackDragState(null)
  }, [trackDragState, dispatch, eventId])

  useEffect(() => {
    if (trackDragState) {
      window.addEventListener('mousemove', handleTrackDragMove)
      window.addEventListener('mouseup', handleTrackDragEnd)
      return () => {
        window.removeEventListener('mousemove', handleTrackDragMove)
        window.removeEventListener('mouseup', handleTrackDragEnd)
      }
    }
  }, [trackDragState, handleTrackDragMove, handleTrackDragEnd])

  return { trackDragState, handleTrackDragStart }
}
