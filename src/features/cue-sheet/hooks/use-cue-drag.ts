import { useCallback, useEffect, useRef, useState } from 'react'
import type { CueItem, Event } from '../types'
import type { CueSheetAction } from '../context/cue-sheet-reducer'
import { CUE_DRAG_CLICK_SUPPRESS_MS } from '../utils/timeline-constants'

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
}

export function useCueDrag({ selectedEvent, dispatch, totalMinutes, pixelsPerMinute, trackRowsRef }: UseCueDragOptions) {
  const [dragState, setDragState] = useState<CueDragState | null>(null)
  const justDraggedRef = useRef(false)
  const cueDragResetTimeoutRef = useRef<number | null>(null)

  const getTrackAtY = useCallback((clientY: number): string | null => {
    if (!trackRowsRef.current || !selectedEvent) return null
    const trackRows = trackRowsRef.current.querySelectorAll('[data-track-id]')
    for (const row of trackRows) {
      const rect = row.getBoundingClientRect()
      if (clientY >= rect.top && clientY <= rect.bottom) {
        return row.getAttribute('data-track-id')
      }
    }
    return null
  }, [selectedEvent, trackRowsRef])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
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

  const handleMouseUp = useCallback(() => {
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
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragState, handleMouseMove, handleMouseUp])

  useEffect(() => {
    return () => {
      if (cueDragResetTimeoutRef.current !== null) {
        window.clearTimeout(cueDragResetTimeoutRef.current)
      }
    }
  }, [])

  const startCueDrag = useCallback((e: React.MouseEvent, cue: CueItem, type: 'move' | 'resize-left' | 'resize-right') => {
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
  }, [])

  return { dragState, justDraggedRef, startCueDrag }
}
