import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '../../../components/icon'
import { IconButton } from '../../../components/icon-button'
import { useTimeline } from '../context/timeline-context'
import { MIN_ZOOM } from '../utils/timeline-constants'

interface TimelineOptionsMenuProps {
  onAddCue: () => void
  onConfigureCueTypes: () => void
  onCreateEvent: () => void
}

export function TimelineOptionsMenu({ onAddCue, onConfigureCueTypes, onCreateEvent }: TimelineOptionsMenuProps) {
  const { clampedZoom, maxZoom, updateZoomAnchoredToPlayhead } = useTimeline()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    window.addEventListener('mousedown', handleOutsideClick)
    return () => window.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  const handleZoomIn = useCallback(() => updateZoomAnchoredToPlayhead('in'), [updateZoomAnchoredToPlayhead])
  const handleZoomOut = useCallback(() => updateZoomAnchoredToPlayhead('out'), [updateZoomAnchoredToPlayhead])

  const handleAddCue = useCallback(() => { setIsOpen(false); onAddCue() }, [onAddCue])
  const handleConfigureTypes = useCallback(() => { setIsOpen(false); onConfigureCueTypes() }, [onConfigureCueTypes])
  const handleNewEvent = useCallback(() => { setIsOpen(false); onCreateEvent() }, [onCreateEvent])

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-1.5 shadow-sm">
        <button onClick={handleZoomOut} disabled={clampedZoom <= MIN_ZOOM} className="h-7 w-7 rounded-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors" title="Zoom out">
          <Icon.minus size={14} className="w-3.5 h-3.5" />
        </button>
        <span className="w-10 text-center text-[11px] font-medium text-gray-600">{Math.round(clampedZoom * 100)}%</span>
        <button onClick={handleZoomIn} disabled={clampedZoom >= maxZoom} className="h-7 w-7 rounded-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors" title="Zoom in">
          <Icon.plus size={14} className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative" ref={menuRef}>
        <IconButton size="lg" className="rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900" aria-label="More options" onClick={() => setIsOpen((o) => !o)}>
          <Icon.dots_horizontal size={16} className="w-4 h-4" />
        </IconButton>

        {isOpen && (
          <div className="absolute right-0 top-full z-40 mt-1.5 w-48 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
            <button type="button" className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-gray-700 hover:bg-gray-50" onClick={handleAddCue}>
              <Icon.plus size={16} className="h-4 w-4 text-gray-500" />
              Add Cue
            </button>
            <button type="button" className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-gray-700 hover:bg-gray-50" onClick={handleConfigureTypes}>
              <Icon.list size={16} className="h-4 w-4 text-gray-500" />
              Configure Types
            </button>
            <button type="button" className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-gray-700 hover:bg-gray-50" onClick={handleNewEvent}>
              <Icon.plus size={16} className="h-4 w-4 text-gray-500" />
              New Event
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
