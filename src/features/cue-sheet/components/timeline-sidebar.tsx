import { useCallback, useState } from 'react'
import { Icon } from '../../../components/icon'
import { ScrollArea } from '../../../components/scroll-area'
import { useTimeline } from '../context/timeline-context'
import type { Track } from '../types'
import { TRACK_COLORS } from '../utils'
import { TRACK_HEIGHT, SIDEBAR_WIDTH } from '../utils/timeline-constants'
import { TimelineTrackHeader } from './timeline-track-header'
import { TimelineTrackRow } from './timeline-track-row'

export function TimelineSidebar() {
  const {
    selectedEvent, eventId, totalMinutes, dispatch,
    currentTimeMinutes, isPlaying, handlePlayPause,
    trackDragState, handleTrackDragStart,
    handleSidebarScroll, sidebarScrollRef,
  } = useTimeline()

  const [editingTrackId, setEditingTrackId] = useState<string | null>(null)
  const [editingTrackName, setEditingTrackName] = useState('')
  const [isAddingTrackInline, setIsAddingTrackInline] = useState(false)
  const [newTrackName, setNewTrackName] = useState('')
  const canDeleteTracks = selectedEvent.tracks.length > 1

  const handleAddTrackInline = useCallback(() => {
    if (!newTrackName.trim()) return
    const colorIndex = selectedEvent.tracks.length % TRACK_COLORS.length
    dispatch({ type: 'ADD_TRACK', payload: { eventId, data: { name: newTrackName.trim(), color: TRACK_COLORS[colorIndex] } } })
    setNewTrackName('')
    setIsAddingTrackInline(false)
  }, [newTrackName, selectedEvent.tracks.length, dispatch, eventId])

  const handleDeleteTrack = useCallback((trackId: string) => {
    if (!canDeleteTracks) return
    dispatch({ type: 'DELETE_TRACK', payload: { eventId, trackId } })
  }, [canDeleteTracks, dispatch, eventId])

  const handleStartRenameTrack = useCallback((track: Track) => {
    setEditingTrackId(track.id)
    setEditingTrackName(track.name)
  }, [])

  const handleUpdateTrackName = useCallback((trackId: string) => {
    if (!editingTrackName.trim()) { setEditingTrackId(null); return }
    dispatch({ type: 'UPDATE_TRACK', payload: { eventId, trackId, data: { name: editingTrackName.trim() } } })
    setEditingTrackId(null)
  }, [dispatch, editingTrackName, eventId])

  const handleCancelRename = useCallback(() => {
    setEditingTrackId(null)
    setEditingTrackName('')
  }, [])

  const handleToggleTrackHidden = useCallback((track: Track) => {
    dispatch({ type: 'UPDATE_TRACK', payload: { eventId, trackId: track.id, data: { hidden: !track.hidden } } })
  }, [dispatch, eventId])

  const handleToggleTrackLocked = useCallback((track: Track) => {
    dispatch({ type: 'UPDATE_TRACK', payload: { eventId, trackId: track.id, data: { locked: !track.locked } } })
  }, [dispatch, eventId])

  const handleSetTrackColor = useCallback((trackId: string, color: string) => {
    dispatch({ type: 'UPDATE_TRACK', payload: { eventId, trackId, data: { color } } })
  }, [dispatch, eventId])

  return (
    <div className="flex min-h-0 shrink-0 flex-col border-r border-gray-200 bg-gray-50" style={{ width: SIDEBAR_WIDTH }}>
      <TimelineTrackHeader
        currentTimeMinutes={currentTimeMinutes}
        totalMinutes={totalMinutes}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
      />

      <ScrollArea containerRef={sidebarScrollRef} onScroll={handleSidebarScroll} className="min-h-0 flex-1 overflow-y-auto">
        {selectedEvent.tracks.map((track, index) => (
          <TimelineTrackRow
            key={track.id}
            track={track}
            index={index}
            isEditing={editingTrackId === track.id}
            editingTrackName={editingTrackName}
            canDeleteTracks={canDeleteTracks}
            isDragSource={trackDragState?.trackId === track.id}
            isDragTarget={Boolean(trackDragState && trackDragState.trackId !== track.id && trackDragState.currentIndex === index)}
            onTrackDragStart={handleTrackDragStart}
            onEditingTrackNameChange={setEditingTrackName}
            onUpdateTrackName={handleUpdateTrackName}
            onCancelRename={handleCancelRename}
            onRenameTrack={handleStartRenameTrack}
            onToggleTrackHidden={handleToggleTrackHidden}
            onToggleTrackLocked={handleToggleTrackLocked}
            onDeleteTrack={handleDeleteTrack}
            onSetTrackColor={handleSetTrackColor}
          />
        ))}

        <div className="border-b border-gray-100 px-3 flex items-center" style={{ height: TRACK_HEIGHT }}>
          {isAddingTrackInline ? (
            <div className="flex items-center gap-2 w-full">
              <div className="w-3 h-3 rounded-full shrink-0 bg-gray-300" />
              <input
                type="text"
                value={newTrackName}
                onChange={(e) => setNewTrackName(e.target.value)}
                onBlur={() => { if (newTrackName.trim()) handleAddTrackInline(); else setIsAddingTrackInline(false) }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTrackInline(); if (e.key === 'Escape') { setNewTrackName(''); setIsAddingTrackInline(false) } }}
                placeholder="Track name..."
                className="text-sm text-gray-700 bg-white border border-gray-300 rounded px-1 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-foreground-brand-primary/40"
                autoFocus
              />
            </div>
          ) : (
            <button onClick={() => setIsAddingTrackInline(true)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-pink-600 transition-colors w-full">
              <Icon.plus size={16} className="w-4 h-4" />
              <span>Add Track</span>
            </button>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
