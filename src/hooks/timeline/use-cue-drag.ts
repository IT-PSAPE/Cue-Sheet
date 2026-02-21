import { useCallback, useEffect, useRef, useState } from 'react'
import type { CueItem, Event } from '@/types/cue-sheet'
import type { CueSheetAction } from '@/contexts/cue-sheet/cue-sheet-reducer'
import { CUE_DRAG_CLICK_SUPPRESS_MS } from '@/utils/timeline/timeline-constants'
import { isTrackLocked } from '@/utils/cue-sheet/cue-sheet-utils'

interface CueDragState {
  cueId: string
  type: 'move' | 'resize-left' | 'resize-right'
  startX: number
  startY: number
  startMinute: number
  startDuration: number
  startTrackId: string
}

interface UseCueDragOptions {
  selectedEvent: Event | null
  dispatch: React.Dispatch<CueSheetAction>
  totalMinutes: number
  pixelsPerMinute: number
  trackRowsRef: React.RefObject<HTMLDivElement | null>
  disableTouchInteractions: boolean
}

export function useCueDrag({ selectedEvent, dispatch, totalMinutes, pixelsPerMinute, trackRowsRef, disableTouchInteractions }: UseCueDragOptions) {
  const [dragState, setDragState] = useState<CueDragState | null>(null)
  const justDraggedRef = useRef(false)
  const cueDragResetTimeoutRef = useRef<number | null>(null)

  const getTrackAtY = useCallback((clientY: number): string | null => {
    if (!trackRowsRef.current || !selectedEvent) return null
    const trackRows = trackRowsRef.current.querySelectorAll('[data-track-id]')
    for (const row of trackRows) {
      const rect = row.getBoundingClientRect()
      if (clientY >= rect.top && clientY <= rect.bottom) {
        const trackId = row.getAttribute('data-track-id')
        if (!trackId) continue
        if (isTrackLocked(selectedEvent.tracks, trackId)) continue
        return trackId
      }
    }
    return null
  }, [selectedEvent, trackRowsRef])

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragState || !selectedEvent) return

      const deltaX = e.clientX - dragState.startX
      const deltaY = e.clientY - dragState.startY
      const deltaMinutes = Math.round(deltaX / pixelsPerMinute)

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        justDraggedRef.current = true
      }

      if (dragState.type === 'move') {
        const newStart = Math.max(0, Math.min(totalMinutes - 1, dragState.startMinute + deltaMinutes))
        const newTrackId = getTrackAtY(e.clientY) ?? dragState.startTrackId
        dispatch({ type: 'MOVE_CUE_ITEM', payload: { eventId: selectedEvent.id, cueItemId: dragState.cueId, startMinute: newStart, trackId: newTrackId } })
      } else if (dragState.type === 'resize-right') {
        const newDuration = Math.max(1, dragState.startDuration + deltaMinutes)
        dispatch({ type: 'UPDATE_CUE_ITEM', payload: { eventId: selectedEvent.id, cueItemId: dragState.cueId, data: { durationMinutes: newDuration } } })
      } else if (dragState.type === 'resize-left') {
        const newStart = Math.max(0, dragState.startMinute + deltaMinutes)
        const startDelta = newStart - dragState.startMinute
        const newDuration = Math.max(1, dragState.startDuration - startDelta)
        dispatch({ type: 'UPDATE_CUE_ITEM', payload: { eventId: selectedEvent.id, cueItemId: dragState.cueId, data: { startMinute: newStart, durationMinutes: newDuration } } })
      }
    },
    [dragState, selectedEvent, dispatch, totalMinutes, pixelsPerMinute, getTrackAtY]
  )

  const handlePointerUp = useCallback(() => {
    if (cueDragResetTimeoutRef.current !== null) {
      window.clearTimeout(cueDragResetTimeoutRef.current)
      cueDragResetTimeoutRef.current = null
    }
    if (justDraggedRef.current) {
      cueDragResetTimeoutRef.current = window.setTimeout(() => {
        justDraggedRef.current = false
        cueDragResetTimeoutRef.current = null
      }, CUE_DRAG_CLICK_SUPPRESS_MS)
    }
    setDragState(null)
  }, [])

  useEffect(() => {
    if (dragState) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      return () => {
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }
    }
  }, [dragState, handlePointerMove, handlePointerUp])

  useEffect(() => {
    if (!disableTouchInteractions) return
    setDragState(null)
  }, [disableTouchInteractions])

  useEffect(() => {
    return () => {
      if (cueDragResetTimeoutRef.current !== null) {
        window.clearTimeout(cueDragResetTimeoutRef.current)
      }
    }
  }, [])

  const startCueDrag = useCallback((e: React.PointerEvent, cue: CueItem, type: 'move' | 'resize-left' | 'resize-right') => {
    if (disableTouchInteractions && e.pointerType === 'touch') return
    if (!selectedEvent) return
    if (isTrackLocked(selectedEvent.tracks, cue.trackId)) return
    e.stopPropagation()
    e.preventDefault()
    if (cueDragResetTimeoutRef.current !== null) {
      window.clearTimeout(cueDragResetTimeoutRef.current)
      cueDragResetTimeoutRef.current = null
    }
    justDraggedRef.current = false
    setDragState({
      cueId: cue.id,
      type,
      startX: e.clientX,
      startY: e.clientY,
      startMinute: cue.startMinute,
      startDuration: cue.durationMinutes,
      startTrackId: cue.trackId,
    })
  }, [disableTouchInteractions, selectedEvent])

  return { dragState, justDraggedRef, startCueDrag }
}
