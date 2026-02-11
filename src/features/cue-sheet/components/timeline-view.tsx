import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '../../../components/button'
import { Modal } from '../../../components/modal'
import { EmptyState } from '../../../components/empty-state'
import { CueItemForm } from './cue-item-form'
import { useCueSheet } from '../hooks/use-cue-sheet'
import { DEFAULT_TRACK_COLORS } from '../utils'
import type { CueItem, CueItemFormData, CueItemType } from '../types'

const MAX_ZOOM = 8
const ZOOM_STEP = 0.25
const BASE_PIXELS_PER_MINUTE = 8
const TRACK_HEIGHT = 48
const TIME_RULER_HEIGHT = 32
const SIDEBAR_WIDTH = 180

// Type icons as small SVG components
const typeIcons: Record<CueItemType, React.ReactNode> = {
  performance: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
    </svg>
  ),
  technical: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  ),
  equipment: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
    </svg>
  ),
  announcement: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
    </svg>
  ),
  transition: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
    </svg>
  ),
}

export function TimelineView() {
  const { selectedEvent, dispatch } = useCueSheet()
  const [isAddingCue, setIsAddingCue] = useState(false)
  const [addCueDefaults, setAddCueDefaults] = useState<{ trackId: string; startMinute: number } | null>(null)
  const [editingCue, setEditingCue] = useState<CueItem | null>(null)
  const [deletingCue, setDeletingCue] = useState<CueItem | null>(null)
  const [newTrackName, setNewTrackName] = useState('')
  const [isAddingTrackInline, setIsAddingTrackInline] = useState(false)
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null)
  const [editingTrackName, setEditingTrackName] = useState('')
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
    hasDragged: boolean
  } | null>(null)

  const trackRowsRef = useRef<HTMLDivElement>(null)
  const timelineContainerRef = useRef<HTMLDivElement>(null)
  const justDraggedRef = useRef(false)

  const totalMinutes = selectedEvent?.totalDurationMinutes ?? 90
  const eventId = selectedEvent?.id ?? ''

  // Calculate minimum zoom so timeline fits exactly in container
  const minZoom = containerWidth > 0 ? containerWidth / (totalMinutes * BASE_PIXELS_PER_MINUTE) : 1
  const effectiveZoom = Math.max(minZoom, zoom)
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

      // Check if we've actually dragged (moved more than 3 pixels)
      if (!dragState.hasDragged && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
        setDragState({ ...dragState, hasDragged: true })
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
    // Preserve hasDragged state for the click handler that fires after mouseup
    if (dragState?.hasDragged) {
      justDraggedRef.current = true
      // Reset after a tick so the click event can see it
      setTimeout(() => {
        justDraggedRef.current = false
      }, 0)
    }
    setDragState(null)
  }, [dragState?.hasDragged])

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

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentTimeMinutes((t) => {
        const next = t + 1 / 60 // Advance by 1 second (1/60 of a minute)
        if (next >= totalMinutes) {
          setIsPlaying(false)
          return totalMinutes
        }
        return next
      })
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [isPlaying, totalMinutes])

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

  // Playhead drag handlers
  const handlePlayheadMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingPlayhead(true)
  }, [])

  const handlePlayheadMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingPlayhead || !timelineContainerRef.current) return

      const rect = timelineContainerRef.current.getBoundingClientRect()
      const scrollLeft = timelineContainerRef.current.scrollLeft
      const x = e.clientX - rect.left + scrollLeft
      const newTime = Math.max(0, Math.min(totalMinutes, x / pixelsPerMinute))
      setCurrentTimeMinutes(newTime)
    },
    [isDraggingPlayhead, totalMinutes, pixelsPerMinute]
  )

  const handlePlayheadUp = useCallback(() => {
    setIsDraggingPlayhead(false)
  }, [])

  useEffect(() => {
    if (isDraggingPlayhead) {
      window.addEventListener('mousemove', handlePlayheadMove)
      window.addEventListener('mouseup', handlePlayheadUp)
      return () => {
        window.removeEventListener('mousemove', handlePlayheadMove)
        window.removeEventListener('mouseup', handlePlayheadUp)
      }
    }
  }, [isDraggingPlayhead, handlePlayheadMove, handlePlayheadUp])

  // Wheel zoom handler (shift+scroll or pinch) with zoom-to-cursor
  useEffect(() => {
    const container = timelineContainerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      // Check for pinch gesture (ctrlKey is true for pinch on trackpad) or shift+scroll
      if (e.ctrlKey || e.shiftKey) {
        e.preventDefault()

        // For shift+scroll, some browsers report delta in deltaX instead of deltaY
        const delta = e.shiftKey && e.deltaX !== 0 ? e.deltaX : e.deltaY

        // Get cursor position relative to container
        const rect = container.getBoundingClientRect()
        const cursorX = e.clientX - rect.left + container.scrollLeft

        // Calculate the time position under cursor
        const currentPxPerMin = BASE_PIXELS_PER_MINUTE * zoom
        const timeUnderCursor = cursorX / currentPxPerMin

        setZoom((z) => {
          const newZoom = delta > 0
            ? Math.max(minZoom, z - ZOOM_STEP)
            : Math.min(MAX_ZOOM, z + ZOOM_STEP)

          // After zoom, adjust scroll to keep cursor position stable
          // Schedule this for after the state update
          requestAnimationFrame(() => {
            const newPxPerMin = BASE_PIXELS_PER_MINUTE * newZoom
            const newCursorX = timeUnderCursor * newPxPerMin
            const cursorOffsetFromLeft = e.clientX - rect.left
            container.scrollLeft = newCursorX - cursorOffsetFromLeft
          })

          return newZoom
        })
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [minZoom, zoom])

  // Early return after all hooks
  if (!selectedEvent) {
    return null
  }

  const timelineWidth = totalMinutes * pixelsPerMinute

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
  }

  const handleDeleteCue = () => {
    if (!deletingCue) return
    dispatch({
      type: 'DELETE_CUE_ITEM',
      payload: { eventId, cueItemId: deletingCue.id },
    })
    setDeletingCue(null)
  }

  const handleAddTrackInline = () => {
    if (!newTrackName.trim()) return
    const colorIndex = selectedEvent.tracks.length % DEFAULT_TRACK_COLORS.length
    dispatch({
      type: 'ADD_TRACK',
      payload: {
        eventId,
        data: { name: newTrackName.trim(), color: DEFAULT_TRACK_COLORS[colorIndex] },
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
    const x = e.clientX - rect.left
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
    setDragState({
      cueId: cue.id,
      type,
      startX: e.clientX,
      startY: e.clientY,
      startMinute: cue.startMinute,
      startDuration: cue.durationMinutes,
      startTrackId: cue.trackId,
      hasDragged: false,
    })
  }

  const handleCueClick = (e: React.MouseEvent, cue: CueItem) => {
    e.stopPropagation()
    // Only open modal if we didn't drag (check ref since dragState is cleared on mouseup before click fires)
    if (!justDraggedRef.current) {
      setEditingCue(cue)
    }
  }

  const handleZoomIn = () => {
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))
  }

  const handleZoomOut = () => {
    setZoom((z) => Math.max(minZoom, z - ZOOM_STEP))
  }

  // Generate time markers based on zoom level
  const getMarkerInterval = () => {
    if (zoom >= 2) return 5
    if (zoom >= 1) return totalMinutes <= 60 ? 10 : 15
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

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
        <div className="flex items-center gap-4">
          {/* Playback controls */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
            <button
              onClick={handleStop}
              className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900"
              title="Stop"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <rect x="4" y="4" width="12" height="12" rx="1" />
              </svg>
            </button>
            <button
              onClick={handlePlayPause}
              className="w-7 h-7 flex items-center justify-center text-white bg-blue-500 hover:bg-blue-600 rounded-full"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <rect x="5" y="4" width="3" height="12" rx="1" />
                  <rect x="12" y="4" width="3" height="12" rx="1" />
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 4l10 6-10 6V4z" />
                </svg>
              )}
            </button>
            <span className="text-xs font-mono font-medium text-gray-700 w-20 text-center">
              {formatTimeDisplay(currentTimeMinutes)} / {formatTimeDisplay(totalMinutes)}
            </span>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= minZoom}
              className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-xs font-medium text-gray-600 w-12 text-center">
              {Math.round(effectiveZoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
              className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <Button size="sm" onClick={() => setIsAddingCue(true)}>
            + Add Cue
          </Button>
        </div>
      </div>

      {selectedEvent.tracks.length === 0 && !isAddingTrackInline ? (
        <EmptyState
          title="No tracks yet"
          description="Add tracks to organize your cue items."
          action={
            <Button onClick={() => setIsAddingTrackInline(true)}>+ Add First Track</Button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex">
            {/* Sidebar */}
            <div className="shrink-0 border-r border-gray-200 bg-gray-50" style={{ width: SIDEBAR_WIDTH }}>
              {/* Empty corner for time ruler alignment */}
              <div
                className="border-b border-gray-200 px-3 flex items-center justify-between"
                style={{ height: TIME_RULER_HEIGHT }}
              >
                <span className="text-xs font-medium text-gray-500">Tracks</span>
              </div>

              {/* Track labels */}
              {selectedEvent.tracks.map((track, index) => (
                <div
                  key={track.id}
                  data-track-sidebar
                  className={`border-b border-gray-100 px-2 flex items-center justify-between group transition-colors relative ${
                    trackDragState?.trackId === track.id ? 'bg-blue-50' : ''
                  }`}
                  style={{ height: TRACK_HEIGHT }}
                >
                  {/* Drop indicator - absolutely positioned to not affect layout */}
                  {trackDragState && trackDragState.trackId !== track.id && trackDragState.currentIndex === index && (
                    <div className="absolute inset-x-0 top-0 h-0 z-10 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-blue-500 shadow-sm" />
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
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: track.color }}
                    />
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
                        className="text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded px-1 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                    ) : (
                      <span
                        className="text-sm font-medium text-gray-700 truncate cursor-pointer hover:text-blue-600"
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
                      className="text-sm text-gray-700 bg-white border border-gray-300 rounded px-1 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingTrackInline(true)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors w-full"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Track</span>
                  </button>
                )}
              </div>
            </div>

            {/* Timeline area */}
            <div className="flex-1 overflow-x-auto" ref={timelineContainerRef}>
              <div style={{ width: timelineWidth, minWidth: '100%' }} ref={trackRowsRef} className="relative">
                {/* Time ruler */}
                <div
                  className="border-b border-gray-200 relative bg-gray-50 select-none"
                  style={{ height: TIME_RULER_HEIGHT }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = e.clientX - rect.left
                    const newTime = Math.max(0, Math.min(totalMinutes, x / pixelsPerMinute))
                    setCurrentTimeMinutes(newTime)
                  }}
                >
                  {timeMarkers.map((minute, idx) => (
                    <div
                      key={minute}
                      className="absolute top-0 bottom-0 flex flex-col justify-end pb-1"
                      style={{
                        left: minute * pixelsPerMinute,
                        transform: idx === 0 ? 'none' : 'translateX(-50%)',
                      }}
                    >
                      <div className="w-px h-2 bg-gray-300 mx-auto" />
                      <span className="text-[10px] text-gray-500 whitespace-nowrap px-1">
                        {formatTimeDisplay(minute)}
                      </span>
                    </div>
                  ))}

                  {/* Playhead handle in ruler */}
                  <div
                    className="absolute top-0 w-4 -ml-2 cursor-ew-resize z-20 flex flex-col items-center"
                    style={{ left: currentTimeMinutes * pixelsPerMinute, height: TIME_RULER_HEIGHT }}
                    onMouseDown={handlePlayheadMouseDown}
                  >
                    <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-8 border-l-transparent border-r-transparent border-t-red-500 mt-0.5" />
                    <div className="w-0.5 flex-1 bg-red-500" />
                  </div>
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
                    {getCuesByTrack(track.id).map((cue) => (
                      <div
                        key={cue.id}
                        className="absolute top-1 bottom-1 rounded-md shadow-sm flex items-center group cursor-move select-none"
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
                          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 rounded-l-md"
                          onMouseDown={(e) => handleMouseDown(e, cue, 'resize-left')}
                        />

                        {/* Content with type icon */}
                        <div className="flex-1 px-2 min-w-0 pointer-events-none overflow-hidden flex items-center gap-1">
                          <span className="text-white/90 shrink-0 drop-shadow-sm">
                            {typeIcons[cue.type]}
                          </span>
                          <span className="text-xs font-medium text-white truncate drop-shadow-sm">
                            {cue.title}
                          </span>
                        </div>

                        {/* Right resize handle */}
                        <div
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 rounded-r-md"
                          onMouseDown={(e) => handleMouseDown(e, cue, 'resize-right')}
                        />

                        {/* Delete button on hover */}
                        <button
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeletingCue(cue)
                          }}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
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

                {/* Playhead line through all tracks */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
                  style={{
                    left: currentTimeMinutes * pixelsPerMinute,
                    top: TIME_RULER_HEIGHT,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Cue Modal */}
      <Modal isOpen={isAddingCue} onClose={() => { setIsAddingCue(false); setAddCueDefaults(null) }} title="Add Cue Item">
        <CueItemForm
          tracks={selectedEvent.tracks}
          defaultTrackId={addCueDefaults?.trackId ?? selectedEvent.tracks[0]?.id ?? ''}
          defaultStartMinute={addCueDefaults?.startMinute}
          onSubmit={handleAddCue}
          onCancel={() => { setIsAddingCue(false); setAddCueDefaults(null) }}
        />
      </Modal>

      {/* Edit Cue Modal */}
      <Modal
        isOpen={!!editingCue}
        onClose={() => setEditingCue(null)}
        title="Edit Cue Item"
      >
        {editingCue && (
          <CueItemForm
            initialData={{
              title: editingCue.title,
              description: editingCue.description,
              type: editingCue.type,
              trackId: editingCue.trackId,
              startMinute: editingCue.startMinute,
              durationMinutes: editingCue.durationMinutes,
              notes: editingCue.notes,
            }}
            tracks={selectedEvent.tracks}
            defaultTrackId={editingCue.trackId}
            onSubmit={handleUpdateCue}
            onCancel={() => setEditingCue(null)}
          />
        )}
      </Modal>

      {/* Delete Cue Modal */}
      <Modal
        isOpen={!!deletingCue}
        onClose={() => setDeletingCue(null)}
        title="Delete Cue Item"
      >
        <div className="flex flex-col gap-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{deletingCue?.title}"? This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeletingCue(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteCue}>
              Delete Cue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
