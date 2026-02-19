import { useCallback, useMemo, useState, type MouseEventHandler } from 'react'
import { Icon } from '../../../components/icon'
import { IconButton } from '../../../components/icon-button'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from '../../../components/popover'
import { ScrollArea } from '../../../components/scroll-area'
import { cn } from '../../../util/cn'
import type { Event } from '../types'
import { formatMinutes } from '../utils'

interface EventSelectorProps {
  events: Event[]
  selectedEventId: string | null
  onSelectEvent: (id: string) => void
  onCreateEvent: () => void
  onEditEvent: (id: string) => void
  onDeleteEvent: (id: string) => void
}

export function EventSelector({ events, selectedEventId, onSelectEvent, onCreateEvent, onEditEvent, onDeleteEvent }: EventSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedEvent = useMemo(() => events.find((event) => event.id === selectedEventId) ?? null, [events, selectedEventId])
  const triggerLabel = selectedEvent ? selectedEvent.name : 'Select Event'
  const hasEvents = events.length > 0

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setIsOpen(nextOpen)
  }, [])

  const handleCreateClick = useCallback(() => {
    setIsOpen(false)
    onCreateEvent()
  }, [onCreateEvent])

  const handleSelectClick: MouseEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      const eventId = event.currentTarget.dataset.eventId
      if (!eventId) return
      onSelectEvent(eventId)
      setIsOpen(false)
    },
    [onSelectEvent]
  )

  const handleEditClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      event.stopPropagation()
      const eventId = event.currentTarget.dataset.eventId
      if (!eventId) return
      onSelectEvent(eventId)
      setIsOpen(false)
      onEditEvent(eventId)
    },
    [onEditEvent, onSelectEvent]
  )

  const handleDeleteClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      event.stopPropagation()
      const eventId = event.currentTarget.dataset.eventId
      if (!eventId) return
      onSelectEvent(eventId)
      setIsOpen(false)
      onDeleteEvent(eventId)
    },
    [onDeleteEvent, onSelectEvent]
  )

  const renderEventOption = useCallback(
    function renderEventOption(event: Event) {
      const isSelected = event.id === selectedEventId
      const eventRowClassName = cn(
        'group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 transition-colors',
        isSelected
          ? 'bg-pink-50 ring-1 ring-inset ring-pink-100 hover:bg-pink-100'
          : 'hover:bg-gray-50'
      )

      return (
        <div key={event.id} data-event-id={event.id} className={eventRowClassName} onClick={handleSelectClick}>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{event.name}</div>
            <div className="text-[11px] text-gray-500">
              {formatMinutes(event.totalDurationMinutes)} · {event.tracks.length} tracks · {event.cueItems.length} cues
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <IconButton
              data-event-id={event.id}
              onClick={handleEditClick}
              size="sm"
              className="group-hover:text-gray-500"
              title="Edit"
              aria-label={`Edit ${event.name}`}
            >
              <Icon.edit_03 size={14} className="w-3.5 h-3.5" />
            </IconButton>
            <IconButton
              data-event-id={event.id}
              onClick={handleDeleteClick}
              size="sm"
              variant="danger"
              className="group-hover:text-gray-500"
              title="Delete"
              aria-label={`Delete ${event.name}`}
            >
              <Icon.trash_01 size={14} className="w-3.5 h-3.5" />
            </IconButton>
          </div>
        </div>
      )
    },
    [handleDeleteClick, handleEditClick, handleSelectClick, selectedEventId]
  )

  return (
    <PopoverRoot open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger className="inline-flex h-9 items-center gap-1.5 px-3 text-xs font-medium rounded-lg border border-gray-300 bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors">
        <span className="truncate max-w-[180px]">{triggerLabel}</span>
        <Icon.chevron_down size={14} className={cn('w-3.5 h-3.5 shrink-0 text-gray-500 transition-transform', isOpen && 'rotate-180')} />
      </PopoverTrigger>

      <PopoverPortal>
        <PopoverContent side="bottom" align="start" offset={6} className="w-72 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
          {hasEvents && <ScrollArea className="max-h-60 overflow-y-auto">{events.map(renderEventOption)}</ScrollArea>}
          <button
            type="button"
            onClick={handleCreateClick}
            className="mt-1 flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Icon.plus size={16} className="h-4 w-4 text-pink-600" />
            New Event
          </button>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  )
}
