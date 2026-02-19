import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import type { CueItem, CueType, CueTypeIcon, Event } from '../types'
import { useCueSheet } from '../hooks/use-cue-sheet'
import { useTimelinePlayback } from '../hooks/use-timeline-playback'
import { useTimelineZoom } from '../hooks/use-timeline-zoom'
import { useCueDrag } from '../hooks/use-cue-drag'
import { useTrackDrag } from '../hooks/use-track-drag'
import { usePlayheadDrag } from '../hooks/use-playhead-drag'
import { useScrollSync } from '../hooks/use-scroll-sync'

interface TimelineContextValue {
  selectedEvent: Event
  eventId: string
  totalMinutes: number
  cueTypes: CueType[]
  fallbackCueType: CueType
  dispatch: ReturnType<typeof useCueSheet>['dispatch']
  clampedZoom: number
  maxZoom: number
  effectiveZoom: number
  pixelsPerMinute: number
  updateZoomAnchoredToPlayhead: (direction: 'in' | 'out') => void
  currentTimeMinutes: number
  setCurrentTimeMinutes: React.Dispatch<React.SetStateAction<number>>
  isPlaying: boolean
  handlePlayPause: () => void
  handleStop: () => void
  isDraggingPlayhead: boolean
  handlePlayheadMouseDown: (e: React.MouseEvent) => void
  justDraggedRef: RefObject<boolean>
  startCueDrag: (e: React.MouseEvent, cue: CueItem, type: 'move' | 'resize-left' | 'resize-right') => void
  trackDragState: { trackId: string; startIndex: number; currentIndex: number; startY: number } | null
  handleTrackDragStart: (trackId: string, index: number, e: React.MouseEvent) => void
  handleTimelineScroll: () => void
  handleSidebarScroll: () => void
  onTrackClick: (trackId: string, startMinute: number) => void
  onCueClick: (cue: CueItem) => void
  onTimelineContainerRef: (node: HTMLDivElement | null) => void
  timelineContainerRef: RefObject<HTMLDivElement | null>
  trackRowsRef: RefObject<HTMLDivElement | null>
  sidebarScrollRef: RefObject<HTMLDivElement | null>
}

const TimelineContext = createContext<TimelineContextValue | null>(null)

export function useTimeline(): TimelineContextValue {
  const ctx = useContext(TimelineContext)
  if (!ctx) throw new Error('useTimeline must be used within TimelineProvider')
  return ctx
}

interface TimelineProviderProps {
  children: ReactNode
  selectedEvent: Event
  onTrackClick: (trackId: string, startMinute: number) => void
  onCueClick: (cue: CueItem) => void
}

export function TimelineProvider({ children, selectedEvent, onTrackClick, onCueClick }: TimelineProviderProps) {
  const { dispatch, state } = useCueSheet()
  const timelineContainerRef = useRef<HTMLDivElement | null>(null)
  const [timelineContainerEl, setTimelineContainerEl] = useState<HTMLDivElement | null>(null)
  const onTimelineContainerRef = useCallback((node: HTMLDivElement | null) => {
    timelineContainerRef.current = node
    setTimelineContainerEl(node)
  }, [])
  const trackRowsRef = useRef<HTMLDivElement | null>(null)
  const sidebarScrollRef = useRef<HTMLDivElement | null>(null)
  const currentTimeMinutesRef = useRef(0)
  const isDraggingPlayheadRef = useRef(false)

  const cueTypes = state.cueTypes
  const fallbackCueType = useMemo(() => cueTypes[0] ?? { id: 'performance', name: 'Performance', icon: 'music' as CueTypeIcon }, [cueTypes])
  const totalMinutes = selectedEvent.totalDurationMinutes
  const eventId = selectedEvent.id

  // 1. Zoom (uses element state so effects re-run when container mounts)
  const zoom = useTimelineZoom({ totalMinutes, timelineContainer: timelineContainerEl, currentTimeMinutesRef })

  // 2. Playback (uses ref for isDraggingPlayhead to avoid circular dep)
  const playback = useTimelinePlayback({ totalMinutes, pixelsPerMinute: zoom.pixelsPerMinute, timelineContainerRef, isDraggingPlayheadRef })
  currentTimeMinutesRef.current = playback.currentTimeMinutes

  // 3. Playhead drag (writes to isDraggingPlayheadRef)
  const playheadDrag = usePlayheadDrag({ pixelsPerMinute: zoom.pixelsPerMinute, totalMinutes, timelineContainerRef, setCurrentTimeMinutes: playback.setCurrentTimeMinutes, isDraggingPlayheadRef })

  // 4. Cue drag + track drag + scroll sync (independent)
  const cueDrag = useCueDrag({ selectedEvent, dispatch, totalMinutes, pixelsPerMinute: zoom.pixelsPerMinute, trackRowsRef })
  const trackDrag = useTrackDrag({ selectedEvent, dispatch, eventId })
  const scrollSync = useScrollSync({ timelineContainerRef, sidebarScrollRef })

  const value: TimelineContextValue = {
    selectedEvent, eventId, totalMinutes, cueTypes, fallbackCueType, dispatch,
    clampedZoom: zoom.clampedZoom, maxZoom: zoom.maxZoom, effectiveZoom: zoom.effectiveZoom,
    pixelsPerMinute: zoom.pixelsPerMinute, updateZoomAnchoredToPlayhead: zoom.updateZoomAnchoredToPlayhead,
    currentTimeMinutes: playback.currentTimeMinutes, setCurrentTimeMinutes: playback.setCurrentTimeMinutes,
    isPlaying: playback.isPlaying, handlePlayPause: playback.handlePlayPause, handleStop: playback.handleStop,
    isDraggingPlayhead: playheadDrag.isDraggingPlayhead, handlePlayheadMouseDown: playheadDrag.handlePlayheadMouseDown,
    justDraggedRef: cueDrag.justDraggedRef, startCueDrag: cueDrag.startCueDrag,
    trackDragState: trackDrag.trackDragState, handleTrackDragStart: trackDrag.handleTrackDragStart,
    handleTimelineScroll: scrollSync.handleTimelineScroll, handleSidebarScroll: scrollSync.handleSidebarScroll,
    onTrackClick, onCueClick,
    onTimelineContainerRef, timelineContainerRef, trackRowsRef, sidebarScrollRef,
  }

  return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>
}
