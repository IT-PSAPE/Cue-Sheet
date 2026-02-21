import { useCallback, useEffect, useRef, useState } from 'react'
import type { Event } from '@/types/cue-sheet'
import type { CueSheetAction } from '@/contexts/cue-sheet/cue-sheet-reducer'

interface TrackDragState {
  trackId: string
  startIndex: number
  currentIndex: number
  startY: number
}

interface PendingTrackDragState extends TrackDragState {
  pointerId: number
  hasMoved: boolean
}

interface UseTrackDragOptions {
  selectedEvent: Event | null
  dispatch: React.Dispatch<CueSheetAction>
  eventId: string
  disableTouchInteractions: boolean
}

const TRACK_DRAG_START_THRESHOLD_PX = 4

export function useTrackDrag({ selectedEvent, dispatch, eventId, disableTouchInteractions }: UseTrackDragOptions) {
  const [trackDragState, setTrackDragState] = useState<TrackDragState | null>(null)
  const [isTrackingPointer, setIsTrackingPointer] = useState(false)
  const pendingTrackDragRef = useRef<PendingTrackDragState | null>(null)

  const getTrackIndexFromPointer = useCallback((clientY: number, fallbackIndex: number) => {
    const trackElements = document.querySelectorAll('[data-track-sidebar]')
    for (let i = 0; i < trackElements.length; i++) {
      const rect = trackElements[i].getBoundingClientRect()
      if (clientY >= rect.top && clientY <= rect.bottom) {
        return i
      }
    }
    return fallbackIndex
  }, [])

  const handleTrackDragStart = useCallback((trackId: string, index: number, e: React.PointerEvent) => {
    if (disableTouchInteractions && e.pointerType === 'touch') return
    pendingTrackDragRef.current = {
      trackId,
      startIndex: index,
      currentIndex: index,
      startY: e.clientY,
      pointerId: e.pointerId,
      hasMoved: false,
    }
    setIsTrackingPointer(true)
  }, [disableTouchInteractions])

  const handleTrackDragMove = useCallback(
    (e: PointerEvent) => {
      const pendingTrackDragState = pendingTrackDragRef.current
      if (!pendingTrackDragState || !selectedEvent) return
      if (e.pointerId !== pendingTrackDragState.pointerId) return

      const pointerDeltaY = Math.abs(e.clientY - pendingTrackDragState.startY)
      if (!pendingTrackDragState.hasMoved && pointerDeltaY < TRACK_DRAG_START_THRESHOLD_PX) return

      if (!pendingTrackDragState.hasMoved) {
        pendingTrackDragState.hasMoved = true
        setTrackDragState({
          trackId: pendingTrackDragState.trackId,
          startIndex: pendingTrackDragState.startIndex,
          currentIndex: pendingTrackDragState.startIndex,
          startY: pendingTrackDragState.startY,
        })
      }

      const newIndex = getTrackIndexFromPointer(e.clientY, pendingTrackDragState.startIndex)
      if (newIndex === pendingTrackDragState.currentIndex) return

      pendingTrackDragState.currentIndex = newIndex
      setTrackDragState((currentTrackDragState) => {
        if (!currentTrackDragState) return currentTrackDragState
        return { ...currentTrackDragState, currentIndex: newIndex }
      })
    },
    [getTrackIndexFromPointer, selectedEvent]
  )

  const handleTrackDragEnd = useCallback((e: PointerEvent) => {
    const pendingTrackDragState = pendingTrackDragRef.current
    if (!pendingTrackDragState) return
    if (e.pointerId !== pendingTrackDragState.pointerId) return

    if (pendingTrackDragState.hasMoved && pendingTrackDragState.startIndex !== pendingTrackDragState.currentIndex) {
      dispatch({
        type: 'REORDER_TRACKS',
        payload: { eventId, fromIndex: pendingTrackDragState.startIndex, toIndex: pendingTrackDragState.currentIndex },
      })
    }

    pendingTrackDragRef.current = null
    setTrackDragState(null)
    setIsTrackingPointer(false)
  }, [dispatch, eventId])

  useEffect(() => {
    if (isTrackingPointer) {
      window.addEventListener('pointermove', handleTrackDragMove)
      window.addEventListener('pointerup', handleTrackDragEnd)
      window.addEventListener('pointercancel', handleTrackDragEnd)
      return () => {
        window.removeEventListener('pointermove', handleTrackDragMove)
        window.removeEventListener('pointerup', handleTrackDragEnd)
        window.removeEventListener('pointercancel', handleTrackDragEnd)
      }
    }
  }, [isTrackingPointer, handleTrackDragMove, handleTrackDragEnd])

  return { trackDragState, handleTrackDragStart }
}
