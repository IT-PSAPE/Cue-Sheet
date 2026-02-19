import { useCallback, useEffect, useRef, useState } from 'react'
import { PLAYHEAD_DRAG_EDGE_THRESHOLD_RATIO, PLAYHEAD_DRAG_MIN_EDGE_THRESHOLD_PX } from '../utils/timeline-constants'

interface UsePlayheadDragOptions {
  pixelsPerMinute: number
  totalMinutes: number
  timelineContainerRef: React.RefObject<HTMLDivElement | null>
  setCurrentTimeMinutes: React.Dispatch<React.SetStateAction<number>>
  isDraggingPlayheadRef: React.RefObject<boolean>
}

export function usePlayheadDrag({ pixelsPerMinute, totalMinutes, timelineContainerRef, setCurrentTimeMinutes, isDraggingPlayheadRef }: UsePlayheadDragOptions) {
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false)
  isDraggingPlayheadRef.current = isDraggingPlayhead
  const playheadPointerClientXRef = useRef<number | null>(null)
  const playheadDragRafRef = useRef<number | null>(null)

  const updatePlayheadFromPointer = useCallback(
    (clientX: number) => {
      const container = timelineContainerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const viewportWidth = rect.width
      if (viewportWidth <= 0) return

      const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth)
      const edgeThreshold = Math.max(PLAYHEAD_DRAG_MIN_EDGE_THRESHOLD_PX, viewportWidth * PLAYHEAD_DRAG_EDGE_THRESHOLD_RATIO)
      const pointerViewportXRaw = clientX - rect.left
      let nextScrollLeft = container.scrollLeft

      if (maxScrollLeft > 0) {
        const leftEdgeLimit = edgeThreshold
        const rightEdgeLimit = viewportWidth - edgeThreshold

        if (pointerViewportXRaw < leftEdgeLimit && nextScrollLeft > 0) {
          nextScrollLeft = Math.max(0, nextScrollLeft - (leftEdgeLimit - pointerViewportXRaw))
        } else if (pointerViewportXRaw > rightEdgeLimit && nextScrollLeft < maxScrollLeft) {
          nextScrollLeft = Math.min(maxScrollLeft, nextScrollLeft + (pointerViewportXRaw - rightEdgeLimit))
        }
      }

      if (nextScrollLeft !== container.scrollLeft) {
        container.scrollLeft = nextScrollLeft
      }

      const minViewportX = nextScrollLeft > 0 ? edgeThreshold : 0
      const maxViewportX = nextScrollLeft < maxScrollLeft ? viewportWidth - edgeThreshold : viewportWidth
      const pointerViewportX = Math.min(maxViewportX, Math.max(minViewportX, pointerViewportXRaw))
      const timelineX = nextScrollLeft + pointerViewportX
      const newTime = Math.max(0, Math.min(totalMinutes, timelineX / pixelsPerMinute))

      setCurrentTimeMinutes((prevTime) => (Math.abs(prevTime - newTime) < 0.0001 ? prevTime : newTime))
    },
    [pixelsPerMinute, totalMinutes, timelineContainerRef, setCurrentTimeMinutes]
  )

  const handlePlayheadMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    playheadPointerClientXRef.current = e.clientX
    updatePlayheadFromPointer(e.clientX)
    setIsDraggingPlayhead(true)
  }, [updatePlayheadFromPointer])

  const handlePlayheadMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingPlayhead) return
      playheadPointerClientXRef.current = e.clientX
    },
    [isDraggingPlayhead]
  )

  const handlePlayheadUp = useCallback(() => {
    setIsDraggingPlayhead(false)
    playheadPointerClientXRef.current = null
  }, [])

  useEffect(() => {
    if (isDraggingPlayhead) {
      window.addEventListener('mousemove', handlePlayheadMove)
      window.addEventListener('mouseup', handlePlayheadUp)

      const updateFrame = () => {
        const clientX = playheadPointerClientXRef.current
        if (clientX !== null) {
          updatePlayheadFromPointer(clientX)
        }
        playheadDragRafRef.current = requestAnimationFrame(updateFrame)
      }

      playheadDragRafRef.current = requestAnimationFrame(updateFrame)

      return () => {
        window.removeEventListener('mousemove', handlePlayheadMove)
        window.removeEventListener('mouseup', handlePlayheadUp)
        if (playheadDragRafRef.current !== null) {
          cancelAnimationFrame(playheadDragRafRef.current)
          playheadDragRafRef.current = null
        }
      }
    }
  }, [isDraggingPlayhead, handlePlayheadMove, handlePlayheadUp, updatePlayheadFromPointer])

  return { isDraggingPlayhead, handlePlayheadMouseDown }
}
