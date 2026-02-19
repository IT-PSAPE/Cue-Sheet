import { useCallback, useEffect, useRef, useState } from 'react'
import { MIN_ZOOM, MAX_EFFECTIVE_ZOOM, ZOOM_STEP, BASE_PIXELS_PER_MINUTE } from '../utils/timeline-constants'

interface UseTimelineZoomOptions {
  totalMinutes: number
  timelineContainer: HTMLDivElement | null
  currentTimeMinutesRef: React.RefObject<number>
}

export function useTimelineZoom({ totalMinutes, timelineContainer, currentTimeMinutesRef }: UseTimelineZoomOptions) {
  const [zoom, setZoom] = useState(1)
  const [containerWidth, setContainerWidth] = useState(0)

  const fitZoom = containerWidth > 0 ? containerWidth / (totalMinutes * BASE_PIXELS_PER_MINUTE) : 1
  const maxZoom = Math.max(MIN_ZOOM, MAX_EFFECTIVE_ZOOM / fitZoom)
  const clampedZoom = Math.min(maxZoom, Math.max(MIN_ZOOM, zoom))
  const effectiveZoom = fitZoom * clampedZoom
  const pixelsPerMinute = BASE_PIXELS_PER_MINUTE * effectiveZoom

  const fitZoomRef = useRef(fitZoom)
  fitZoomRef.current = fitZoom
  const maxZoomRef = useRef(maxZoom)
  maxZoomRef.current = maxZoom

  // Track container width with ResizeObserver
  useEffect(() => {
    if (!timelineContainer) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })

    observer.observe(timelineContainer)
    setContainerWidth(timelineContainer.clientWidth)
    return () => observer.disconnect()
  }, [timelineContainer])

  const updateZoomAnchoredToPlayhead = useCallback(
    (direction: 'in' | 'out') => {
      if (!timelineContainer) return

      const scrollLeftBeforeZoom = timelineContainer.scrollLeft
      const time = currentTimeMinutesRef.current

      setZoom((z) => {
        const currentZoom = Math.min(maxZoomRef.current, Math.max(MIN_ZOOM, z))
        const currentEffectiveZoom = fitZoomRef.current * currentZoom
        const playheadViewportX = time * BASE_PIXELS_PER_MINUTE * currentEffectiveZoom - scrollLeftBeforeZoom

        const nextRawZoom = direction === 'in' ? currentZoom + ZOOM_STEP : currentZoom - ZOOM_STEP
        const clampedRawZoom = Math.min(maxZoomRef.current, Math.max(MIN_ZOOM, nextRawZoom))
        const nextEffectiveZoom = fitZoomRef.current * clampedRawZoom

        requestAnimationFrame(() => {
          const playheadTimelineXAfterZoom = time * BASE_PIXELS_PER_MINUTE * nextEffectiveZoom
          const targetScrollLeft = playheadTimelineXAfterZoom - playheadViewportX
          const maxScrollLeft = Math.max(0, timelineContainer.scrollWidth - timelineContainer.clientWidth)
          timelineContainer.scrollLeft = Math.min(maxScrollLeft, Math.max(0, targetScrollLeft))
        })

        return clampedRawZoom
      })
    },
    [timelineContainer, currentTimeMinutesRef]
  )

  // Wheel handler: Ctrl/Cmd+scroll = zoom, Shift+scroll = horizontal scroll
  useEffect(() => {
    if (!timelineContainer) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        updateZoomAnchoredToPlayhead(e.deltaY > 0 ? 'out' : 'in')
      } else if (e.shiftKey) {
        e.preventDefault()
        timelineContainer.scrollLeft += e.deltaY
      }
    }

    timelineContainer.addEventListener('wheel', handleWheel, { passive: false })
    return () => timelineContainer.removeEventListener('wheel', handleWheel)
  }, [updateZoomAnchoredToPlayhead, timelineContainer])

  return {
    zoom,
    clampedZoom,
    fitZoom,
    maxZoom,
    effectiveZoom,
    pixelsPerMinute,
    containerWidth,
    updateZoomAnchoredToPlayhead,
  }
}
