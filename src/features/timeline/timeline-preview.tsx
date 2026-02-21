import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTimeline } from '@/contexts/timeline-context'
import { getCuesByTrack, getTrackColor } from '@/utils/timeline/timeline-utils'
import { TIMELINE_HORIZONTAL_PADDING } from '@/utils/timeline/timeline-constants'

const PREVIEW_HEIGHT = 32
const PREVIEW_PADDING = 6
const PREVIEW_MAX_WIDTH_PERCENT = 0.95

export function TimelinePreview() {
  const {
    selectedEvent,
    totalMinutes,
    pixelsPerMinute,
    timelineContainerRef,
    currentTimeMinutes,
  } = useTimeline()

  const previewRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const [viewportWidthState, setViewportWidthState] = useState(window.innerWidth)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartXRef = useRef(0)
  const dragStartScrollLeftRef = useRef(0)

  const tracks = selectedEvent.tracks
  const cues = selectedEvent.cueItems
  const trackCount = tracks.length

  // Calculate track height to fit all tracks within fixed preview height
  const availableHeight = PREVIEW_HEIGHT - 2 * PREVIEW_PADDING
  const gap = 2
  const minimapTrackHeight = trackCount > 0 ? (availableHeight - (trackCount - 1) * gap) / trackCount : 0
  const minimapCueHeight = Math.max(2, minimapTrackHeight - 2)

  const timelineWidth = totalMinutes * pixelsPerMinute + 2 * TIMELINE_HORIZONTAL_PADDING

  const previewMaxWidth = viewportWidthState * PREVIEW_MAX_WIDTH_PERCENT - 2 * PREVIEW_PADDING

  const scale = useMemo(() => {
    return previewMaxWidth / timelineWidth
  }, [previewMaxWidth, timelineWidth])

  const minimapWidth = Math.min(timelineWidth * scale, previewMaxWidth)
  const viewportWidth = containerWidth * scale

  const viewportLeft = useMemo(() => {
    if (!timelineContainerRef.current) return 0
    const maxScrollLeft = Math.max(0, timelineWidth - containerWidth)
    const scrollProgress = maxScrollLeft > 0 ? scrollLeft / maxScrollLeft : 0
    return scrollProgress * (minimapWidth - viewportWidth)
  }, [scrollLeft, timelineWidth, containerWidth, minimapWidth, viewportWidth, timelineContainerRef])

  const playheadLeft = useMemo(() => {
    return currentTimeMinutes * pixelsPerMinute * scale + TIMELINE_HORIZONTAL_PADDING * scale
  }, [currentTimeMinutes, pixelsPerMinute, scale])

  useEffect(() => {
    const container = timelineContainerRef.current
    if (!container) return

    const updateScroll = () => {
      setScrollLeft(container.scrollLeft)
      setContainerWidth(container.clientWidth)
    }

    const handleResize = () => {
      setViewportWidthState(window.innerWidth)
      setContainerWidth(container.clientWidth)
    }

    updateScroll()

    container.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    const resizeObserver = new ResizeObserver(updateScroll)
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener('scroll', updateScroll)
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
    }
  }, [timelineContainerRef])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!previewRef.current || !timelineContainerRef.current) return

    e.preventDefault()
    setIsDragging(true)
    dragStartXRef.current = e.clientX
    dragStartScrollLeftRef.current = timelineContainerRef.current.scrollLeft

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!previewRef.current || !timelineContainerRef.current) return

      const deltaX = moveEvent.clientX - dragStartXRef.current
      const scaleX = timelineWidth / minimapWidth
      const scrollDelta = deltaX * scaleX

      const newScrollLeft = Math.max(
        0,
        Math.min(
          timelineWidth - containerWidth,
          dragStartScrollLeftRef.current + scrollDelta
        )
      )

      timelineContainerRef.current.scrollLeft = newScrollLeft
    }

    const handlePointerUp = () => {
      setIsDragging(false)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }, [timelineContainerRef, timelineWidth, minimapWidth, containerWidth])

  const handleMinimapClick = useCallback((e: React.MouseEvent) => {
    if (!previewRef.current || !timelineContainerRef.current || isDragging) return

    const rect = previewRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left - PREVIEW_PADDING
    const clickRatio = Math.max(0, Math.min(1, clickX / minimapWidth))

    const maxScrollLeft = Math.max(0, timelineWidth - containerWidth)
    const targetScrollLeft = clickRatio * maxScrollLeft - containerWidth / 2

    timelineContainerRef.current.scrollLeft = Math.max(0, Math.min(maxScrollLeft, targetScrollLeft))
  }, [previewRef, timelineContainerRef, minimapWidth, timelineWidth, containerWidth, isDragging])

  return (
    <div
      ref={previewRef}
      className="hidden lg:block fixed bottom-4 right-4 z-50 rounded-lg bg-white/95 shadow-lg border border-gray-200 backdrop-blur-sm"
      style={{ width: minimapWidth + 2 * PREVIEW_PADDING, height: PREVIEW_HEIGHT }}
    >
      <div
        className="absolute inset-0 cursor-pointer"
        style={{ padding: PREVIEW_PADDING }}
        onClick={handleMinimapClick}
      >
        {/* Track rows */}
        <div className="relative">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className="absolute left-0 right-0 bg-gray-100 rounded-sm"
              style={{
                top: index * (minimapTrackHeight + 2),
                height: minimapTrackHeight,
              }}
            >
              {getCuesByTrack(cues, track.id).map((cue) => (
                <div
                  key={cue.id}
                  className="absolute rounded-sm"
                  style={{
                    left: cue.startMinute * pixelsPerMinute * scale + TIMELINE_HORIZONTAL_PADDING * scale,
                    width: Math.max(cue.durationMinutes * pixelsPerMinute * scale, 2),
                    height: minimapCueHeight,
                    top: (minimapTrackHeight - minimapCueHeight) / 2,
                    backgroundColor: getTrackColor(tracks, cue.trackId),
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Playhead indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-pink-500 pointer-events-none z-10"
          style={{ left: playheadLeft }}
        />

        {/* Viewport window */}
        <div
          className="absolute top-0 bottom-0 bg-blue-500/10 border-2 border-blue-500/50 rounded cursor-move hover:bg-blue-500/20 transition-colors touch-none"
          style={{
            left: viewportLeft,
            width: viewportWidth,
          }}
          onPointerDown={handlePointerDown}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handles */}
          <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-blue-500/60 rounded-full" />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-blue-500/60 rounded-full" />
        </div>
      </div>
    </div>
  )
}
