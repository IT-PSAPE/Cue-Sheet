import { useCallback } from 'react'
import { Icon } from '../../../components/icon'
import { ScrollArea } from '../../../components/scroll-area'
import { useTimeline } from '../context/timeline-context'
import { getCueTypeIcon } from '../cue-type-icons'
import type { CueItem } from '../types'
import { TRACK_HEIGHT, TIME_RULER_HEIGHT } from '../utils/timeline-constants'
import { formatTimeDisplay, getMarkerInterval, buildTimeMarkers, getCuesByTrack, getTrackColor, getCueTypeById } from '../utils/timeline-utils'

export function TimelineCanvas() {
  const {
    selectedEvent, totalMinutes, cueTypes, fallbackCueType,
    pixelsPerMinute, effectiveZoom, currentTimeMinutes,
    setCurrentTimeMinutes, handlePlayheadMouseDown,
    startCueDrag, justDraggedRef,
    handleTimelineScroll, onTimelineContainerRef, timelineContainerRef, trackRowsRef,
    onTrackClick, onCueClick,
  } = useTimeline()

  const markerInterval = getMarkerInterval(effectiveZoom, totalMinutes)
  const timeMarkers = buildTimeMarkers(totalMinutes, markerInterval)
  const timelineWidth = totalMinutes * pixelsPerMinute
  const playheadLeft = Math.round(currentTimeMinutes * pixelsPerMinute)

  const handleTimeRulerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineContainerRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left + timelineContainerRef.current.scrollLeft
    setCurrentTimeMinutes(Math.max(0, Math.min(totalMinutes, x / pixelsPerMinute)))
  }, [timelineContainerRef, setCurrentTimeMinutes, totalMinutes, pixelsPerMinute])

  const handleTrackRowClick = useCallback((trackId: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineContainerRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left + timelineContainerRef.current.scrollLeft
    const startMinute = Math.floor(x / pixelsPerMinute)
    onTrackClick(trackId, startMinute)
  }, [timelineContainerRef, pixelsPerMinute, onTrackClick])

  const handleCueClick = useCallback((e: React.MouseEvent, cue: CueItem) => {
    e.stopPropagation()
    if (!justDraggedRef.current) {
      onCueClick(cue)
    }
  }, [justDraggedRef, onCueClick])

  return (
    <ScrollArea className="min-h-0 flex-1 overflow-auto touch-auto overscroll-contain" containerRef={onTimelineContainerRef} onScroll={handleTimelineScroll}>
      <div style={{ width: timelineWidth, minWidth: '100%' }} ref={trackRowsRef} className="relative min-h-full">
        {/* Time ruler */}
        <div className="sticky top-0 z-10 border-b border-gray-200 relative bg-gray-50 select-none" style={{ height: TIME_RULER_HEIGHT }} onClick={handleTimeRulerClick}>
          {timeMarkers.map((minute, idx) => {
            const isFirst = idx === 0
            const isLast = idx === timeMarkers.length - 1
            const labelTransform = isFirst ? 'translateX(0)' : isLast ? 'translateX(-100%)' : 'translateX(-50%)'
            const labelTextAlign: React.CSSProperties['textAlign'] = isFirst ? 'left' : isLast ? 'right' : 'center'

            return (
              <div key={minute} className="absolute top-0 bottom-0" style={{ left: minute * pixelsPerMinute }}>
                <div className="absolute bottom-4 w-px h-2 bg-gray-300 -translate-x-1/2" />
                <span className="absolute bottom-1 text-[10px] text-gray-500 whitespace-nowrap px-1" style={{ transform: labelTransform, textAlign: labelTextAlign }}>
                  {formatTimeDisplay(minute)}
                </span>
              </div>
            )
          })}
        </div>

        {/* Track rows */}
        {selectedEvent.tracks.map((track) => (
          <div key={track.id} data-track-id={track.id} className="border-b border-gray-100 relative cursor-crosshair" style={{ height: TRACK_HEIGHT }} onClick={(e) => handleTrackRowClick(track.id, e)}>
            {timeMarkers.map((minute) => (
              <div key={minute} className="absolute top-0 bottom-0 w-px bg-gray-100" style={{ left: minute * pixelsPerMinute }} />
            ))}

            {getCuesByTrack(selectedEvent.cueItems, track.id).map((cue) => {
              const cueType = getCueTypeById(cueTypes, cue.type, fallbackCueType.icon)
              const metaParts = [cueType.name, `${cue.durationMinutes}m`]
              if (cue.notes) metaParts.push(cue.notes)
              const metaText = metaParts.join(' \u2022 ')

              return (
                <div
                  key={cue.id}
                  className="absolute top-1 bottom-1 rounded-lg p-0.5 flex flex-col shadow-sm group cursor-move select-none overflow-hidden"
                  style={{ left: cue.startMinute * pixelsPerMinute, width: Math.max(cue.durationMinutes * pixelsPerMinute, 24), backgroundColor: getTrackColor(selectedEvent.tracks, cue.trackId) }}
                  onClick={(e) => handleCueClick(e, cue)}
                  onMouseDown={(e) => startCueDrag(e, cue, 'move')}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 rounded-l-lg z-10" onMouseDown={(e) => startCueDrag(e, cue, 'resize-left')} />
                  <div className="flex items-center px-1.5 py-0.5 min-w-0 gap-1">
                    <p className="text-[11px] leading-tight text-white/80 truncate flex-1 pointer-events-none">{metaText}</p>
                    <button
                      type="button"
                      className="shrink-0 w-4 h-4 flex items-center justify-center rounded text-white/60 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); onCueClick(cue) }}
                      title="Edit cue"
                    >
                      <Icon.x_close size={10} className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div className="flex-1 bg-black/20 rounded-md px-1.5 py-1.5 min-w-0 pointer-events-none flex items-center gap-1.5 overflow-hidden">
                    <span className="text-white/90 shrink-0 drop-shadow-sm">{getCueTypeIcon(cueType.icon)}</span>
                    <span className="text-[13px] font-semibold text-white truncate drop-shadow-sm">{cue.title}</span>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 rounded-r-lg z-10" onMouseDown={(e) => startCueDrag(e, cue, 'resize-right')} />
                </div>
              )
            })}
          </div>
        ))}

        {/* Empty row for add track */}
        <div className="border-b border-gray-100 relative" style={{ height: TRACK_HEIGHT }}>
          {timeMarkers.map((minute) => (
            <div key={minute} className="absolute top-0 bottom-0 w-px bg-gray-50" style={{ left: minute * pixelsPerMinute }} />
          ))}
        </div>

        {/* Playhead */}
        <div className="absolute top-0 bottom-0 -translate-x-1/2 w-px bg-pink-500 pointer-events-none z-20" style={{ left: playheadLeft }} />
        <button type="button" onMouseDown={handlePlayheadMouseDown} aria-label="Drag playhead" className="absolute top-0 z-30 h-10 w-10 -translate-x-1/2 flex items-center justify-center pb-2 text-pink-500" style={{ left: playheadLeft }}>
          <svg height="100%" viewBox="0 0 20 41" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 30.306V2C0 0.89543 0.895431 0 2 0H18C19.1046 0 20 0.895429 20 2V30.306C20 30.8414 19.7853 31.3545 19.404 31.7303L11.404 39.6161C10.6253 40.3836 9.37465 40.3836 8.596 39.6161L0.595997 31.7303C0.214684 31.3545 0 30.8414 0 30.306Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </ScrollArea>
  )
}
