import { useCallback, useEffect, useState } from 'react'
import { Icon } from '../../../components/icon'
import { ScrollArea } from '../../../components/scroll-area'
import { useTimeline } from '../context/timeline-context'
import { TRACK_COLORS } from '../utils'
import { TRACK_HEIGHT, TIME_RULER_HEIGHT, SIDEBAR_WIDTH } from '../utils/timeline-constants'
import { formatTimeDisplay } from '../utils/timeline-utils'

export function TimelineSidebar() {
  const {
    selectedEvent, eventId, totalMinutes, dispatch,
    currentTimeMinutes, isPlaying, handlePlayPause, handleStop,
    trackDragState, handleTrackDragStart,
    handleSidebarScroll, sidebarScrollRef,
  } = useTimeline()

  const [colorPickerTrackId, setColorPickerTrackId] = useState<string | null>(null)
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null)
  const [editingTrackName, setEditingTrackName] = useState('')
  const [isAddingTrackInline, setIsAddingTrackInline] = useState(false)
  const [newTrackName, setNewTrackName] = useState('')

  useEffect(() => {
    if (!colorPickerTrackId) return
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-color-picker]')) setColorPickerTrackId(null)
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [colorPickerTrackId])

  const handleAddTrackInline = useCallback(() => {
    if (!newTrackName.trim()) return
    const colorIndex = selectedEvent.tracks.length % TRACK_COLORS.length
    dispatch({ type: 'ADD_TRACK', payload: { eventId, data: { name: newTrackName.trim(), color: TRACK_COLORS[colorIndex] } } })
    setNewTrackName('')
    setIsAddingTrackInline(false)
  }, [newTrackName, selectedEvent.tracks.length, dispatch, eventId])

  const handleDeleteTrack = useCallback((trackId: string) => {
    dispatch({ type: 'DELETE_TRACK', payload: { eventId, trackId } })
  }, [dispatch, eventId])

  const handleUpdateTrackName = useCallback((trackId: string) => {
    if (!editingTrackName.trim()) { setEditingTrackId(null); return }
    dispatch({ type: 'UPDATE_TRACK', payload: { eventId, trackId, data: { name: editingTrackName.trim() } } })
    setEditingTrackId(null)
  }, [dispatch, editingTrackName, eventId])

  return (
    <div className="flex min-h-0 shrink-0 flex-col border-r border-gray-200 bg-gray-50" style={{ width: SIDEBAR_WIDTH }}>
      <div className="border-b border-gray-200 px-2.5 flex items-center gap-1.5" style={{ height: TIME_RULER_HEIGHT }}>
        <button onClick={handleStop} className="h-6 w-6 rounded-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors" title="Stop">
          <Icon.stop size={14} className="w-3.5 h-3.5" />
        </button>
        <button onClick={handlePlayPause} className="h-6 w-6 rounded-md flex items-center justify-center text-white bg-pink-600 hover:bg-pink-700 transition-colors" title={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <Icon.pause_square size={14} className="w-3.5 h-3.5" /> : <Icon.play size={14} className="w-3.5 h-3.5 ml-0.5" />}
        </button>
        <span className="w-[92px] whitespace-nowrap text-center text-[10px] leading-none font-mono font-medium text-gray-700">
          {formatTimeDisplay(currentTimeMinutes)} / {formatTimeDisplay(totalMinutes)}
        </span>
      </div>

      <ScrollArea containerRef={sidebarScrollRef} onScroll={handleSidebarScroll} className="min-h-0 flex-1 overflow-y-auto">
        {selectedEvent.tracks.map((track, index) => (
          <div
            key={track.id}
            data-track-sidebar
            className={`border-b border-gray-100 px-2 flex items-center justify-between group transition-colors relative ${trackDragState?.trackId === track.id ? 'bg-pink-50' : ''}`}
            style={{ height: TRACK_HEIGHT }}
          >
            {trackDragState && trackDragState.trackId !== track.id && trackDragState.currentIndex === index && (
              <div className="absolute inset-x-0 top-0 h-0 z-10 flex items-center justify-center">
                <div className="w-full h-0.5 bg-pink-500 shadow-sm" />
              </div>
            )}
            <div className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 shrink-0" onMouseDown={(e) => handleTrackDragStart(track.id, index, e)}>
              <Icon.dots_grid size={16} className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="relative shrink-0" data-color-picker>
                <button type="button" className="w-5 h-5 rounded-full block border-2 border-black/10 hover:border-black/25 transition-colors" style={{ backgroundColor: track.color }} onClick={() => setColorPickerTrackId(colorPickerTrackId === track.id ? null : track.id)} title="Change color" />
                {colorPickerTrackId === track.id && (
                  <div className="absolute top-full left-0 mt-1.5 z-30 bg-white rounded-lg shadow-lg border border-gray-200 p-2.5 grid grid-cols-4 gap-2 w-[148px]">
                    {TRACK_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${track.color === color ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => { dispatch({ type: 'UPDATE_TRACK', payload: { eventId, trackId: track.id, data: { color } } }); setColorPickerTrackId(null) }}
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
                  onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateTrackName(track.id); if (e.key === 'Escape') setEditingTrackId(null) }}
                  className="text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded px-1 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-pink-500"
                  autoFocus
                />
              ) : (
                <span className="text-sm font-medium text-gray-700 truncate cursor-pointer hover:text-pink-600" onClick={() => { setEditingTrackId(track.id); setEditingTrackName(track.name) }}>
                  {track.name}
                </span>
              )}
            </div>
            <button onClick={() => handleDeleteTrack(track.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity shrink-0">
              <Icon.x_close size={16} className="w-4 h-4" />
            </button>
          </div>
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
                className="text-sm text-gray-700 bg-white border border-gray-300 rounded px-1 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-pink-500"
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
