import React, { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../../../components/button'
import { Modal } from '../../../components/modal'
import { EmptyState } from '../../../components/empty-state'
import { ScrollArea } from '../../../components/scroll-area'
import { CueItemForm } from './cue-item-form'
import { CUE_TYPE_ICON_OPTIONS, getCueTypeIcon } from '../cue-type-icons'
import { useCueSheet } from '../hooks/use-cue-sheet'
import { TRACK_COLORS, generateId } from '../utils'
import type { CueItem, CueItemFormData, CueType, CueTypeIcon } from '../types'

const MIN_ZOOM = 1
const MAX_EFFECTIVE_ZOOM = 8
const ZOOM_STEP = 0.25
const BASE_PIXELS_PER_MINUTE = 8
const TRACK_HEIGHT = 56
const TIME_RULER_HEIGHT = 36
const SIDEBAR_WIDTH = 180
const PLAYBACK_TICK_MS = 50
const PLAYBACK_SPEED_MULTIPLIER = 1
const PLAYHEAD_FOLLOW_THRESHOLD_RATIO = 0.75
const PLAYHEAD_FOLLOW_TARGET_RATIO = 0.6
const FOLLOW_SCROLL_MIN_DELTA_PX = 2
const PLAYHEAD_DRAG_EDGE_THRESHOLD_RATIO = 0.06
const PLAYHEAD_DRAG_MIN_EDGE_THRESHOLD_PX = 14.4
const CUE_DRAG_CLICK_SUPPRESS_MS = 120

interface TimelineViewProps {
  onCreateEvent: () => void
  optionsContainer?: HTMLDivElement | null
}

export function TimelineView({ onCreateEvent, optionsContainer }: TimelineViewProps) {
  const { selectedEvent, dispatch, state } = useCueSheet()
  const [isAddingCue, setIsAddingCue] = useState(false)
  const [addCueDefaults, setAddCueDefaults] = useState<{ trackId: string; startMinute: number } | null>(null)
  const [editingCue, setEditingCue] = useState<CueItem | null>(null)
  const [isConfiguringCueTypes, setIsConfiguringCueTypes] = useState(false)
  const [iconPickerCueTypeId, setIconPickerCueTypeId] = useState<string | null>(null)
  const [draftCueTypes, setDraftCueTypes] = useState<CueType[]>([])
  const [newTrackName, setNewTrackName] = useState('')
  const [isAddingTrackInline, setIsAddingTrackInline] = useState(false)
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null)
  const [editingTrackName, setEditingTrackName] = useState('')
  const [colorPickerTrackId, setColorPickerTrackId] = useState<string | null>(null)
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [containerWidth, setContainerWidth] = useState(0)

  // Playback state
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false)

  // Track drag state for reordering
  const [trackDragState, setTrackDragState] = useState<{
    trackId: string
    startIndex: number
    currentIndex: number
    startY: number
  } | null>(null)

  const [dragState, setDragState] = useState<{
    cueId: string
    type: 'move' | 'resize-left' | 'resize-right'
    startX: number
    startY: number
    startMinute: number
    startDuration: number
    startTrackId: string
  } | null>(null)
  const [isConfirmingCueDelete, setIsConfirmingCueDelete] = useState(false)

  const trackRowsRef = useRef<HTMLDivElement>(null)
  const timelineContainerRef = useRef<HTMLDivElement>(null)
  const sidebarScrollRef = useRef<HTMLDivElement>(null)
  const optionsMenuRef = useRef<HTMLDivElement>(null)
  const justDraggedRef = useRef(false)
  const isSyncingVerticalScrollRef = useRef<null | 'timeline' | 'sidebar'>(null)
  const cueDragResetTimeoutRef = useRef<number | null>(null)
  const playheadPointerClientXRef = useRef<number | null>(null)
  const playheadDragRafRef = useRef<number | null>(null)

  const totalMinutes = selectedEvent?.totalDurationMinutes ?? 90
  const eventId = selectedEvent?.id ?? ''
  const cueTypes = state.cueTypes
  const fallbackCueType = cueTypes[0] ?? { id: 'performance', name: 'Performance', icon: 'music' as CueTypeIcon }

  // Fit zoom is the effective scale where the full event duration exactly fills the viewport.
  // Relative zoom of 1x (100%) always maps to this fit state.
  const fitZoom = containerWidth > 0 ? containerWidth / (totalMinutes * BASE_PIXELS_PER_MINUTE) : 1
  const maxZoom = Math.max(MIN_ZOOM, MAX_EFFECTIVE_ZOOM / fitZoom)
  const clampedZoom = Math.min(maxZoom, Math.max(MIN_ZOOM, zoom))
  const effectiveZoom = fitZoom * clampedZoom
  const pixelsPerMinute = BASE_PIXELS_PER_MINUTE * effectiveZoom

  // Track container width with ResizeObserver
  useEffect(() => {
    const container = timelineContainerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })

    observer.observe(container)
    // Initial measurement
    setContainerWidth(container.clientWidth)

    return () => observer.disconnect()
  }, [])

  // Calculate which track the mouse is over based on Y position
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
  }, [selectedEvent])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState || !selectedEvent) return

      const deltaX = e.clientX - dragState.startX
      const deltaY = e.clientY - dragState.startY
      const deltaMinutes = Math.round(deltaX / pixelsPerMinute)

      // Track drag intent in a ref so click suppression is reliable even on fast release.
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        justDraggedRef.current = true
      }

      if (dragState.type === 'move') {
        const newStart = Math.max(0, Math.min(totalMinutes - 1, dragState.startMinute + deltaMinutes))
        const newTrackId = getTrackAtY(e.clientY) ?? dragState.startTrackId

        dispatch({
          type: 'MOVE_CUE_ITEM',
          payload: {
            eventId: selectedEvent.id,
            cueItemId: dragState.cueId,
            startMinute: newStart,
            trackId: newTrackId,
          },
        })
      } else if (dragState.type === 'resize-right') {
        const newDuration = Math.max(1, dragState.startDuration + deltaMinutes)
        dispatch({
          type: 'UPDATE_CUE_ITEM',
          payload: {
            eventId: selectedEvent.id,
            cueItemId: dragState.cueId,
            data: { durationMinutes: newDuration },
          },
        })
      } else if (dragState.type === 'resize-left') {
        const newStart = Math.max(0, dragState.startMinute + deltaMinutes)
        const startDelta = newStart - dragState.startMinute
        const newDuration = Math.max(1, dragState.startDuration - startDelta)
        dispatch({
          type: 'UPDATE_CUE_ITEM',
          payload: {
            eventId: selectedEvent.id,
            cueItemId: dragState.cueId,
            data: { startMinute: newStart, durationMinutes: newDuration },
          },
        })
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

  // Add global mouse event listeners when dragging
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

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return

    let lastTickAt = performance.now()
    const interval = setInterval(() => {
      const now = performance.now()
      const elapsedMs = now - lastTickAt
      lastTickAt = now
      const elapsedMinutes = (elapsedMs / 60000) * PLAYBACK_SPEED_MULTIPLIER

      setCurrentTimeMinutes((t) => {
        const next = t + elapsedMinutes
        if (next >= totalMinutes) {
          setIsPlaying(false)
          return totalMinutes
        }
        return next
      })
    }, PLAYBACK_TICK_MS)

    return () => clearInterval(interval)
  }, [isPlaying, totalMinutes])

  // While playing, keep the playhead visible by following once it crosses a threshold.
  useEffect(() => {
    const container = timelineContainerRef.current
    if (!container || !isPlaying || isDraggingPlayhead) return

    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth)
    if (maxScrollLeft <= 0) return

    const playheadTimelineX = currentTimeMinutes * pixelsPerMinute
    const playheadViewportX = playheadTimelineX - container.scrollLeft
    const thresholdX = container.clientWidth * PLAYHEAD_FOLLOW_THRESHOLD_RATIO

    if (playheadViewportX < thresholdX) return

    const targetViewportX = container.clientWidth * PLAYHEAD_FOLLOW_TARGET_RATIO
    const targetScrollLeft = Math.min(
      maxScrollLeft,
      Math.max(0, playheadTimelineX - targetViewportX)
    )

    if (Math.abs(targetScrollLeft - container.scrollLeft) >= FOLLOW_SCROLL_MIN_DELTA_PX) {
      container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' })
    }
  }, [currentTimeMinutes, pixelsPerMinute, isPlaying, isDraggingPlayhead])

  // Track drag handlers
  const handleTrackDragStart = useCallback((trackId: string, index: number, e: React.MouseEvent) => {
    e.preventDefault()
    setTrackDragState({
      trackId,
      startIndex: index,
      currentIndex: index,
      startY: e.clientY,
    })
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
      dispatch({
        type: 'REORDER_TRACKS',
        payload: {
          eventId,
          fromIndex: trackDragState.startIndex,
          toIndex: trackDragState.currentIndex,
        },
      })
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

  // Close color picker on outside click
  useEffect(() => {
    if (!colorPickerTrackId) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-color-picker]')) {
        setColorPickerTrackId(null)
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [colorPickerTrackId])

  useEffect(() => {
    if (!isOptionsMenuOpen) return
    const handleOutsideClick = (event: MouseEvent) => {
      if (!optionsMenuRef.current?.contains(event.target as Node)) {
        setIsOptionsMenuOpen(false)
      }
    }
    window.addEventListener('mousedown', handleOutsideClick)
    return () => window.removeEventListener('mousedown', handleOutsideClick)
  }, [isOptionsMenuOpen])

  useEffect(() => {
    if (!iconPickerCueTypeId) return
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-cue-type-icon-picker]')) {
        setIconPickerCueTypeId(null)
      }
    }
    window.addEventListener('mousedown', handleOutsideClick)
    return () => window.removeEventListener('mousedown', handleOutsideClick)
  }, [iconPickerCueTypeId])

  // Playhead drag handlers
  const updatePlayheadFromPointer = useCallback(
    (clientX: number) => {
      const container = timelineContainerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const viewportWidth = rect.width
      if (viewportWidth <= 0) return

      const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth)
      const edgeThreshold = Math.max(
        PLAYHEAD_DRAG_MIN_EDGE_THRESHOLD_PX,
        viewportWidth * PLAYHEAD_DRAG_EDGE_THRESHOLD_RATIO
      )

      const pointerViewportXRaw = clientX - rect.left
      let nextScrollLeft = container.scrollLeft

      if (maxScrollLeft > 0) {
        const leftEdgeLimit = edgeThreshold
        const rightEdgeLimit = viewportWidth - edgeThreshold

        if (pointerViewportXRaw < leftEdgeLimit && nextScrollLeft > 0) {
          const overshoot = leftEdgeLimit - pointerViewportXRaw
          nextScrollLeft = Math.max(0, nextScrollLeft - overshoot)
        } else if (pointerViewportXRaw > rightEdgeLimit && nextScrollLeft < maxScrollLeft) {
          const overshoot = pointerViewportXRaw - rightEdgeLimit
          nextScrollLeft = Math.min(maxScrollLeft, nextScrollLeft + overshoot)
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

      setCurrentTimeMinutes((prevTime) => (
        Math.abs(prevTime - newTime) < 0.0001 ? prevTime : newTime
      ))
    },
    [pixelsPerMinute, totalMinutes]
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

  const updateZoomAnchoredToPlayhead = useCallback(
    (direction: 'in' | 'out') => {
      const container = timelineContainerRef.current
      if (!container) return

      const scrollLeftBeforeZoom = container.scrollLeft

      setZoom((z) => {
        const currentZoom = Math.min(maxZoom, Math.max(MIN_ZOOM, z))
        const currentEffectiveZoom = fitZoom * currentZoom
        const playheadViewportX =
          currentTimeMinutes * BASE_PIXELS_PER_MINUTE * currentEffectiveZoom - scrollLeftBeforeZoom

        const nextRawZoom = direction === 'in' ? currentZoom + ZOOM_STEP : currentZoom - ZOOM_STEP
        const clampedRawZoom = Math.min(maxZoom, Math.max(MIN_ZOOM, nextRawZoom))
        const nextEffectiveZoom = fitZoom * clampedRawZoom

        requestAnimationFrame(() => {
          const playheadTimelineXAfterZoom =
            currentTimeMinutes * BASE_PIXELS_PER_MINUTE * nextEffectiveZoom
          const targetScrollLeft = playheadTimelineXAfterZoom - playheadViewportX
          const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth)
          container.scrollLeft = Math.min(maxScrollLeft, Math.max(0, targetScrollLeft))
        })

        return clampedRawZoom
      })
    },
    [currentTimeMinutes, fitZoom, maxZoom]
  )

  // Wheel zoom handler (shift+scroll or pinch) anchored to playhead
  useEffect(() => {
    const container = timelineContainerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      // Check for pinch gesture (ctrlKey is true for pinch on trackpad) or shift+scroll
      if (e.ctrlKey || e.shiftKey) {
        e.preventDefault()

        // For shift+scroll, some browsers report delta in deltaX instead of deltaY
        const delta = e.shiftKey && e.deltaX !== 0 ? e.deltaX : e.deltaY
        updateZoomAnchoredToPlayhead(delta > 0 ? 'out' : 'in')
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [updateZoomAnchoredToPlayhead])

  const handleTimelineScroll = useCallback(() => {
    const timeline = timelineContainerRef.current
    const sidebar = sidebarScrollRef.current
    if (!timeline || !sidebar) return

    if (isSyncingVerticalScrollRef.current === 'sidebar') {
      isSyncingVerticalScrollRef.current = null
      return
    }

    if (Math.abs(timeline.scrollTop - sidebar.scrollTop) < 1) return

    isSyncingVerticalScrollRef.current = 'timeline'
    sidebar.scrollTop = timeline.scrollTop
  }, [])

  const handleSidebarScroll = useCallback(() => {
    const timeline = timelineContainerRef.current
    const sidebar = sidebarScrollRef.current
    if (!timeline || !sidebar) return

    if (isSyncingVerticalScrollRef.current === 'timeline') {
      isSyncingVerticalScrollRef.current = null
      return
    }

    if (Math.abs(timeline.scrollTop - sidebar.scrollTop) < 1) return

    isSyncingVerticalScrollRef.current = 'sidebar'
    timeline.scrollTop = sidebar.scrollTop
  }, [])

  // Early return after all hooks
  if (!selectedEvent) {
    return null
  }

  const timelineWidth = totalMinutes * pixelsPerMinute
  const playheadLeft = Math.round(currentTimeMinutes * pixelsPerMinute)

  const handleAddCue = (data: CueItemFormData) => {
    dispatch({
      type: 'ADD_CUE_ITEM',
      payload: { eventId, data },
    })
    setIsAddingCue(false)
    setAddCueDefaults(null)
  }

  const handleUpdateCue = (data: CueItemFormData) => {
    if (!editingCue) return
    dispatch({
      type: 'UPDATE_CUE_ITEM',
      payload: { eventId, cueItemId: editingCue.id, data },
    })
    setEditingCue(null)
    setIsConfirmingCueDelete(false)
  }

  const closeEditCueModal = () => {
    setIsConfirmingCueDelete(false)
    setEditingCue(null)
  }

  const handleConfirmDeleteCue = () => {
    if (!editingCue) return
    dispatch({
      type: 'DELETE_CUE_ITEM',
      payload: { eventId, cueItemId: editingCue.id },
    })
    setIsConfirmingCueDelete(false)
    setEditingCue(null)
  }

  const openConfigureCueTypes = () => {
    setDraftCueTypes(cueTypes.map((cueType) => ({ ...cueType })))
    setIconPickerCueTypeId(null)
    setIsConfiguringCueTypes(true)
    setIsOptionsMenuOpen(false)
  }

  const handleCueTypeNameChange = (id: string, name: string) => {
    setDraftCueTypes((types) =>
      types.map((cueType) =>
        cueType.id === id
          ? { ...cueType, name }
          : cueType
      )
    )
  }

  const handleCueTypeIconChange = (id: string, icon: CueTypeIcon) => {
    setDraftCueTypes((types) =>
      types.map((cueType) =>
        cueType.id === id
          ? { ...cueType, icon }
          : cueType
      )
    )
  }

  const handleAddCueType = () => {
    const icon = CUE_TYPE_ICON_OPTIONS[0].value
    setDraftCueTypes((types) => [
      ...types,
      {
        id: generateId(),
        name: `Custom ${types.length + 1}`,
        icon,
      },
    ])
  }

  const handleSaveCueTypes = () => {
    const sanitizedTypes = draftCueTypes
      .map((cueType) => ({
        ...cueType,
        name: cueType.name.trim(),
      }))
      .filter((cueType) => cueType.name.length > 0)

    if (sanitizedTypes.length === 0) return

    dispatch({
      type: 'SET_CUE_TYPES',
      payload: sanitizedTypes,
    })
    setIconPickerCueTypeId(null)
    setIsConfiguringCueTypes(false)
  }

  const handleAddTrackInline = () => {
    if (!newTrackName.trim()) return
    const colorIndex = selectedEvent.tracks.length % TRACK_COLORS.length
    dispatch({
      type: 'ADD_TRACK',
      payload: {
        eventId,
        data: { name: newTrackName.trim(), color: TRACK_COLORS[colorIndex] },
      },
    })
    setNewTrackName('')
    setIsAddingTrackInline(false)
  }

  const handleDeleteTrack = (trackId: string) => {
    dispatch({
      type: 'DELETE_TRACK',
      payload: { eventId, trackId },
    })
  }

  const handleUpdateTrackName = (trackId: string) => {
    if (!editingTrackName.trim()) {
      setEditingTrackId(null)
      return
    }
    dispatch({
      type: 'UPDATE_TRACK',
      payload: { eventId, trackId, data: { name: editingTrackName.trim() } },
    })
    setEditingTrackId(null)
  }

  const handleTrackClick = (trackId: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineContainerRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left + timelineContainerRef.current.scrollLeft
    const startMinute = Math.floor(x / pixelsPerMinute)
    setAddCueDefaults({ trackId, startMinute })
    setIsAddingCue(true)
  }

  const handleMouseDown = (
    e: React.MouseEvent,
    cue: CueItem,
    type: 'move' | 'resize-left' | 'resize-right'
  ) => {
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
  }

  const handleCueClick = (e: React.MouseEvent, cue: CueItem) => {
    e.stopPropagation()
    // Only open modal if we didn't drag (check ref since dragState is cleared on mouseup before click fires)
    if (!justDraggedRef.current) {
      setIsConfirmingCueDelete(false)
      setEditingCue(cue)
    }
  }

  const handleZoomIn = () => {
    updateZoomAnchoredToPlayhead('in')
  }

  const handleZoomOut = () => {
    updateZoomAnchoredToPlayhead('out')
  }

  // Generate time markers based on zoom level
  const getMarkerInterval = () => {
    if (effectiveZoom >= 2) return 5
    if (effectiveZoom >= 1) return totalMinutes <= 60 ? 10 : 15
    return totalMinutes <= 60 ? 15 : 30
  }

  const timeMarkers: number[] = []
  const markerInterval = getMarkerInterval()
  for (let i = 0; i <= totalMinutes; i += markerInterval) {
    timeMarkers.push(i)
  }

  const getCuesByTrack = (trackId: string) =>
    selectedEvent.cueItems.filter((c) => c.trackId === trackId)

  const getTrackColor = (trackId: string) =>
    selectedEvent.tracks.find((t) => t.id === trackId)?.color ?? '#6b7280'

  const getCueTypeById = (cueTypeId: string) =>
    cueTypes.find((cueType) => cueType.id === cueTypeId) ?? fallbackCueType

  // Format time as MM:SS
  const formatTimeDisplay = (minutes: number) => {
    const mins = Math.floor(minutes)
    const secs = Math.floor((minutes - mins) * 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    if (currentTimeMinutes >= totalMinutes) {
      setCurrentTimeMinutes(0)
    }
    setIsPlaying(!isPlaying)
  }

  const handleStop = () => {
    setIsPlaying(false)
    setCurrentTimeMinutes(0)
  }

  const optionsMenuJsx = (
    <div className="flex items-center gap-2">
      <div className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-1.5 shadow-sm">
          <button
            onClick={handleZoomOut}
            disabled={clampedZoom <= MIN_ZOOM}
            className="h-7 w-7 rounded-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
            title="Zoom out"
          >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
          </button>
          <span className="w-10 text-center text-[11px] font-medium text-gray-600">
            {Math.round(clampedZoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={clampedZoom >= maxZoom}
            className="h-7 w-7 rounded-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
            title="Zoom in"
          >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="relative" ref={optionsMenuRef}>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-9 w-9 px-0"
          aria-label="More options"
          onClick={() => setIsOptionsMenuOpen((open) => !open)}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 5.5A1.5 1.5 0 1010 8a1.5 1.5 0 000 3.5zM11.5 15a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
        </Button>

        {isOptionsMenuOpen && (
          <div className="absolute right-0 top-full z-40 mt-1.5 w-48 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setIsOptionsMenuOpen(false)
                setIsAddingCue(true)
              }}
            >
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Cue
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              onClick={openConfigureCueTypes}
            >
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h10" />
              </svg>
              Configure Types
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setIsOptionsMenuOpen(false)
                onCreateEvent()
              }}
            >
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Event
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      {optionsContainer && createPortal(optionsMenuJsx, optionsContainer)}
      {selectedEvent.tracks.length === 0 && !isAddingTrackInline ? (
        <EmptyState
          title="No tracks yet"
          description="Add tracks to organize your cue items."
          action={
            <Button onClick={() => setIsAddingTrackInline(true)}>+ Add First Track</Button>
          }
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
          <div className="flex min-h-0 flex-1">
            {/* Sidebar */}
            <div className="flex min-h-0 shrink-0 flex-col border-r border-gray-200 bg-gray-50" style={{ width: SIDEBAR_WIDTH }}>
              {/* Empty corner for time ruler alignment */}
              <div
                className="border-b border-gray-200 px-2.5 flex items-center gap-1.5"
                style={{ height: TIME_RULER_HEIGHT }}
              >
                <button
                  onClick={handleStop}
                  className="h-6 w-6 rounded-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  title="Stop"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <rect x="4" y="4" width="12" height="12" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={handlePlayPause}
                  className="h-6 w-6 rounded-md flex items-center justify-center text-white bg-pink-600 hover:bg-pink-700 transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <rect x="5" y="4" width="3" height="12" rx="1" />
                      <rect x="12" y="4" width="3" height="12" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6 4l10 6-10 6V4z" />
                    </svg>
                  )}
                </button>
                <span className="w-[92px] whitespace-nowrap text-center text-[10px] leading-none font-mono font-medium text-gray-700">
                  {formatTimeDisplay(currentTimeMinutes)} / {formatTimeDisplay(totalMinutes)}
                </span>
              </div>

              <ScrollArea
                ref={sidebarScrollRef}
                onScroll={handleSidebarScroll}
                className="min-h-0 flex-1 overflow-y-auto"
              >
                {/* Track labels */}
                {selectedEvent.tracks.map((track, index) => (
                  <div
                    key={track.id}
                    data-track-sidebar
                    className={`border-b border-gray-100 px-2 flex items-center justify-between group transition-colors relative ${
                      trackDragState?.trackId === track.id ? 'bg-pink-50' : ''
                    }`}
                    style={{ height: TRACK_HEIGHT }}
                  >
                    {/* Drop indicator - absolutely positioned to not affect layout */}
                    {trackDragState && trackDragState.trackId !== track.id && trackDragState.currentIndex === index && (
                      <div className="absolute inset-x-0 top-0 h-0 z-10 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-pink-500 shadow-sm" />
                      </div>
                    )}
                    {/* Drag handle */}
                    <div
                      className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 shrink-0"
                      onMouseDown={(e) => handleTrackDragStart(track.id, index, e)}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 2a2 2 0 10.001 4.001A2 2 0 007 2zm6 0a2 2 0 10.001 4.001A2 2 0 0013 2zM7 8a2 2 0 10.001 4.001A2 2 0 007 8zm6 0a2 2 0 10.001 4.001A2 2 0 0013 8zM7 14a2 2 0 10.001 4.001A2 2 0 007 14zm6 0a2 2 0 10.001 4.001A2 2 0 0013 14z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="relative shrink-0" data-color-picker>
                        <button
                          type="button"
                          className="w-5 h-5 rounded-full block border-2 border-black/10 hover:border-black/25 transition-colors"
                          style={{ backgroundColor: track.color }}
                          onClick={() => setColorPickerTrackId(colorPickerTrackId === track.id ? null : track.id)}
                          title="Change color"
                        />
                        {colorPickerTrackId === track.id && (
                          <div className="absolute top-full left-0 mt-1.5 z-30 bg-white rounded-lg shadow-lg border border-gray-200 p-2.5 grid grid-cols-4 gap-2 w-[148px]">
                            {TRACK_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                                  track.color === color ? 'border-gray-800 scale-110' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                  dispatch({
                                    type: 'UPDATE_TRACK',
                                    payload: { eventId, trackId: track.id, data: { color } },
                                  })
                                  setColorPickerTrackId(null)
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      {editingTrackId === track.id ? (
                        <input
                          type="text"
                          value={editingTrackName}
                          onChange={(e) => setEditingTrackName(e.target.value)}
                          onBlur={() => handleUpdateTrackName(track.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateTrackName(track.id)
                            if (e.key === 'Escape') setEditingTrackId(null)
                          }}
                          className="text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded px-1 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-pink-500"
                          autoFocus
                        />
                      ) : (
                        <span
                          className="text-sm font-medium text-gray-700 truncate cursor-pointer hover:text-pink-600"
                          onClick={() => {
                            setEditingTrackId(track.id)
                            setEditingTrackName(track.name)
                          }}
                        >
                          {track.name}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTrack(track.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Add Track Row */}
                <div
                  className="border-b border-gray-100 px-3 flex items-center"
                  style={{ height: TRACK_HEIGHT }}
                >
                  {isAddingTrackInline ? (
                    <div className="flex items-center gap-2 w-full">
                      <div className="w-3 h-3 rounded-full shrink-0 bg-gray-300" />
                      <input
                        type="text"
                        value={newTrackName}
                        onChange={(e) => setNewTrackName(e.target.value)}
                        onBlur={() => {
                          if (newTrackName.trim()) {
                            handleAddTrackInline()
                          } else {
                            setIsAddingTrackInline(false)
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddTrackInline()
                          if (e.key === 'Escape') {
                            setNewTrackName('')
                            setIsAddingTrackInline(false)
                          }
                        }}
                        placeholder="Track name..."
                        className="text-sm text-gray-700 bg-white border border-gray-300 rounded px-1 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-pink-500"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingTrackInline(true)}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-pink-600 transition-colors w-full"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Track</span>
                    </button>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Timeline area */}
            <ScrollArea
              className="min-h-0 flex-1 overflow-auto touch-auto overscroll-contain"
              ref={timelineContainerRef}
              onScroll={handleTimelineScroll}
            >
              <div style={{ width: timelineWidth, minWidth: '100%' }} ref={trackRowsRef} className="relative min-h-full">
                {/* Time ruler */}
                <div
                  className="sticky top-0 z-10 border-b border-gray-200 relative bg-gray-50 select-none"
                  style={{ height: TIME_RULER_HEIGHT }}
                  onClick={(e) => {
                    if (!timelineContainerRef.current) return
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = e.clientX - rect.left + timelineContainerRef.current.scrollLeft
                    const newTime = Math.max(0, Math.min(totalMinutes, x / pixelsPerMinute))
                    setCurrentTimeMinutes(newTime)
                  }}
                >
                  {timeMarkers.map((minute, idx) => {
                    const isFirst = idx === 0
                    const isLast = idx === timeMarkers.length - 1
                    const labelTransform = isFirst
                      ? 'translateX(0)'
                      : isLast
                        ? 'translateX(-100%)'
                        : 'translateX(-50%)'
                    const labelTextAlign = isFirst ? 'left' : isLast ? 'right' : 'center'

                    return (
                      <div
                        key={minute}
                        className="absolute top-0 bottom-0"
                        style={{ left: minute * pixelsPerMinute }}
                      >
                        <div
                          className="absolute bottom-4 w-px h-2 bg-gray-300 -translate-x-1/2"
                        />
                        <span
                          className="absolute bottom-1 text-[10px] text-gray-500 whitespace-nowrap px-1"
                          style={{ transform: labelTransform, textAlign: labelTextAlign }}
                        >
                          {formatTimeDisplay(minute)}
                        </span>
                      </div>
                    )
                  })}

                </div>

                {/* Track rows */}
                {selectedEvent.tracks.map((track) => (
                  <div
                    key={track.id}
                    data-track-id={track.id}
                    className="border-b border-gray-100 relative cursor-crosshair"
                    style={{ height: TRACK_HEIGHT }}
                    onClick={(e) => handleTrackClick(track.id, e)}
                  >
                    {/* Grid lines */}
                    {timeMarkers.map((minute) => (
                      <div
                        key={minute}
                        className="absolute top-0 bottom-0 w-px bg-gray-100"
                        style={{ left: minute * pixelsPerMinute }}
                      />
                    ))}

                    {/* Cue items */}
                    {getCuesByTrack(track.id).map((cue) => {
                      const cueType = getCueTypeById(cue.type)
                      const metaParts = [cueType.name, `${cue.durationMinutes}m`]
                      if (cue.notes) metaParts.push(cue.notes)
                      const metaText = metaParts.join(' \u2022 ')

                      return (
                        <div
                          key={cue.id}
                          className="absolute top-1 bottom-1 rounded-lg p-0.5 flex flex-col shadow-sm group cursor-move select-none overflow-hidden"
                          style={{
                            left: cue.startMinute * pixelsPerMinute,
                            width: Math.max(cue.durationMinutes * pixelsPerMinute, 24),
                            backgroundColor: getTrackColor(cue.trackId),
                          }}
                          onClick={(e) => handleCueClick(e, cue)}
                          onMouseDown={(e) => handleMouseDown(e, cue, 'move')}
                        >
                          {/* Left resize handle */}
                          <div
                            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 rounded-l-lg z-10"
                            onMouseDown={(e) => handleMouseDown(e, cue, 'resize-left')}
                          />

                          {/* Metadata row */}
                          <div className="flex items-center px-1.5 py-0.5 min-w-0 gap-1">
                            <p className="text-[11px] leading-tight text-white/80 truncate flex-1 pointer-events-none">
                              {metaText}
                            </p>
                            <button
                              type="button"
                              className="shrink-0 w-4 h-4 flex items-center justify-center rounded text-white/60 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                setIsConfirmingCueDelete(false)
                                setEditingCue(cue)
                              }}
                              title="Edit cue"
                            >
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {/* Title row */}
                          <div className="flex-1 bg-black/20 rounded-md px-1.5 py-1.5 min-w-0 pointer-events-none flex items-center gap-1.5 overflow-hidden">
                            <span className="text-white/90 shrink-0 drop-shadow-sm">
                              {getCueTypeIcon(cueType.icon)}
                            </span>
                            <span className="text-[13px] font-semibold text-white truncate drop-shadow-sm">
                              {cue.title}
                            </span>
                          </div>

                          {/* Right resize handle */}
                          <div
                            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 rounded-r-lg z-10"
                            onMouseDown={(e) => handleMouseDown(e, cue, 'resize-right')}
                          />

                        </div>
                      )
                    })}
                  </div>
                ))}

                {/* Empty row for add track */}
                <div
                  className="border-b border-gray-100 relative"
                  style={{ height: TRACK_HEIGHT }}
                >
                  {/* Grid lines */}
                  {timeMarkers.map((minute) => (
                    <div
                      key={minute}
                      className="absolute top-0 bottom-0 w-px bg-gray-50"
                      style={{ left: minute * pixelsPerMinute }}
                    />
                  ))}
                </div>

                {/* Playhead line and handle */}
                <div
                  className="absolute top-0 bottom-0 -translate-x-1/2 w-px bg-pink-500 pointer-events-none z-20"
                  style={{
                    left: playheadLeft,
                  }}
                />
                <button
                  type="button"
                  onMouseDown={handlePlayheadMouseDown}
                  aria-label="Drag playhead"
                  className="absolute top-1 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 border-white bg-pink-500 shadow-sm cursor-ew-resize z-30 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  style={{ left: playheadLeft }}
                />
              </div>
            </ScrollArea>
          </div>

        </div>
      )}

      <Modal
        isOpen={isConfiguringCueTypes}
        onClose={() => {
          setIconPickerCueTypeId(null)
          setIsConfiguringCueTypes(false)
        }}
        title="Configure Cue Types"
        size="sm"
        compact
      >
        <div className="flex flex-col gap-3">
          <ScrollArea className="flex max-h-[44vh] flex-col gap-2 overflow-y-auto pr-0.5">
            {draftCueTypes.map((cueType) => (
              <div key={cueType.id} className="flex items-center gap-2">
                <div className="relative" data-cue-type-icon-picker>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    onClick={() => setIconPickerCueTypeId((id) => (id === cueType.id ? null : cueType.id))}
                    aria-label={`Select icon for ${cueType.name || 'cue type'}`}
                    title="Select icon"
                  >
                    {getCueTypeIcon(cueType.icon, 'h-4 w-4')}
                  </button>

                  {iconPickerCueTypeId === cueType.id && (
                    <div className="absolute left-0 top-full z-50 mt-1.5 w-[228px] rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                      <div className="grid grid-cols-5 gap-1.5">
                        {CUE_TYPE_ICON_OPTIONS.map((iconOption) => {
                          const isSelected = iconOption.value === cueType.icon
                          return (
                            <button
                              key={iconOption.value}
                              type="button"
                              className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                                isSelected
                                  ? 'border-pink-400 bg-pink-50 text-pink-700'
                                  : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                              }`}
                              onClick={() => {
                                handleCueTypeIconChange(cueType.id, iconOption.value as CueTypeIcon)
                                setIconPickerCueTypeId(null)
                              }}
                              title={iconOption.label}
                              aria-label={iconOption.label}
                            >
                              {getCueTypeIcon(iconOption.value, 'h-4 w-4')}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={cueType.name}
                  onChange={(event) => handleCueTypeNameChange(cueType.id, event.target.value)}
                  placeholder="Type name"
                  className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            ))}
          </ScrollArea>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button type="button" variant="secondary" className="w-full" onClick={handleAddCueType}>
              Add Type
            </Button>
            <Button
              type="button"
              className="w-full"
              onClick={handleSaveCueTypes}
              disabled={draftCueTypes.every((cueType) => cueType.name.trim().length === 0)}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Cue Modal */}
      <Modal
        isOpen={isAddingCue}
        onClose={() => { setIsAddingCue(false); setAddCueDefaults(null) }}
        title="Add Cue Item"
        size="sm"
        compact
      >
        <CueItemForm
          tracks={selectedEvent.tracks}
          cueTypes={cueTypes}
          defaultTrackId={addCueDefaults?.trackId ?? selectedEvent.tracks[0]?.id ?? ''}
          defaultStartMinute={addCueDefaults?.startMinute}
          onSubmit={handleAddCue}
          onCancel={() => { setIsAddingCue(false); setAddCueDefaults(null) }}
        />
      </Modal>

      {/* Edit Cue Modal */}
      <Modal
        isOpen={!!editingCue}
        onClose={() => {
          if (isConfirmingCueDelete) return
          closeEditCueModal()
        }}
        title="Edit Cue"
        size="sm"
        compact
      >
        {editingCue && (
          <CueItemForm
            initialData={{
              title: editingCue.title,
              type: editingCue.type,
              trackId: editingCue.trackId,
              startMinute: editingCue.startMinute,
              durationMinutes: editingCue.durationMinutes,
              notes: editingCue.notes,
            }}
            tracks={selectedEvent.tracks}
            cueTypes={cueTypes}
            defaultTrackId={editingCue.trackId}
            onSubmit={handleUpdateCue}
            onCancel={closeEditCueModal}
            onDelete={() => setIsConfirmingCueDelete(true)}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!editingCue && isConfirmingCueDelete}
        onClose={() => setIsConfirmingCueDelete(false)}
        title="Delete Cue"
        size="sm"
        compact
      >
        {editingCue && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Delete "{editingCue.title}"? This cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button type="button" variant="secondary" className="w-full" onClick={() => setIsConfirmingCueDelete(false)}>
                Keep Cue
              </Button>
              <Button type="button" variant="danger" className="w-full" onClick={handleConfirmDeleteCue}>
                Confirm Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
