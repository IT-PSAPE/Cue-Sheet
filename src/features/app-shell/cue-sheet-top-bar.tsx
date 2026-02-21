import { useCallback, useMemo } from 'react'
import { CueSheetBrand } from './cue-sheet-brand'
import type { Event } from '@/types/cue-sheet'
import { IconButton } from '@/components/icon-button'
import { Icon } from '@/components/icon'
import { Menu } from '@/components/menu'
import { CounterInput } from '@/components/counter-input'
import { useFullscreen } from '@/hooks/ui/use-fullscreen'
import { useAppContext } from '@/contexts/app-context'
import { hasUnlockedTracks } from '@/utils/cue-sheet/cue-sheet-utils'
import { CueSheetTopBarActions } from './cue-sheet-top-bar-actions'

export function CueSheetTopBar() {
  const { state, selectedEvent, zoomValue, minZoomValue, maxZoomValue, handleSelectEvent, openCreateEvent, openEditEvent, openDeleteEvent, openAddCue, openConfigureCueTypes, handleZoomChange } = useAppContext()
  const events = state.events
  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const triggerLabel = selectedEvent ? selectedEvent.name : 'Select Event'
  const canAddCue = Boolean(selectedEvent && hasUnlockedTracks(selectedEvent.tracks))
  const canDeleteEvents = events.length > 1
  const eventSelectHandlers = useMemo(
    () =>
      Object.fromEntries(
        events.map((event) => [
          event.id,
          () => {
            handleSelectEvent(event.id)
          },
        ])
      ) as Record<string, () => void>,
    [events, handleSelectEvent]
  )

  const handleExpandSelect = useCallback(() => {
    toggleFullscreen()
  }, [toggleFullscreen])

  const handleCreateEventSelect = useCallback(() => {
    openCreateEvent()
  }, [openCreateEvent])

  const handleOpenAddCue = useCallback(() => {
    if (!canAddCue) return
    openAddCue()
  }, [canAddCue, openAddCue])

  const renderEventMenuItem = useCallback(
    (event: Event) => (
      <Menu.Item key={event.id} onSelect={eventSelectHandlers[event.id]}>
        <span className="truncate">{event.name}</span>
      </Menu.Item>
    ),
    [eventSelectHandlers]
  )

  const handleNoopEdit = useCallback(
    () => {
      if (!selectedEvent) return
      openEditEvent()
    },
    [openEditEvent, selectedEvent]
  )

  const handleNoopDelete = useCallback(
    () => {
      if (!canDeleteEvents) return
      if (!selectedEvent) return
      openDeleteEvent()
    },
    [canDeleteEvents, openDeleteEvent, selectedEvent]
  )
  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200/90 bg-white px-2 py-2">
      <div className="flex items-center gap-2">
        <CueSheetBrand />

        <Menu.Root>
          <Menu.Trigger>
            <div className="relative inline-flex min-w-[104px] items-center gap-[var(--spacing-md,8px)] rounded-[8px] border border-[var(--border-secondary,#e8e8e8)] bg-[var(--background-primary,white)] px-[var(--spacing-lg,13px)] py-[var(--spacing-md,9px)]">
              <span className="max-w-[180px] truncate text-center text-[12px] font-medium leading-[16px] text-black">{triggerLabel}</span>
              <Icon.chevron_down size={16} className="size-[16px] shrink-0 text-black" />
            </div>
          </Menu.Trigger>
          <Menu.Content anchor="bottom-left">
            {events.map(renderEventMenuItem)}
            <div className="my-1 h-px bg-white/10" />
            <Menu.Item onSelect={handleCreateEventSelect}>
              <Icon.plus size={16} />
              New Event
            </Menu.Item>
            <Menu.Item onSelect={handleNoopEdit}>
              <Icon.edit_03 size={16} />
              Edit Event
            </Menu.Item>
            {canDeleteEvents ? (
              <Menu.Item onSelect={handleNoopDelete}>
                <Icon.trash_01 size={16} />
                Delete Event
              </Menu.Item>
            ) : null}
          </Menu.Content>
        </Menu.Root>
      </div>

      <div className="flex items-center gap-2">
        <CounterInput id="cue-sheet-top-bar-counter" className="w-[116px]" label="Zoom" value={zoomValue} min={minZoomValue} max={maxZoomValue} step={10} format="percent" onChange={handleZoomChange} />
        <IconButton variant="secondary" onClick={handleOpenAddCue} aria-label="Add cue" icon={<Icon.plus size={16} />} disabled={!canAddCue} />
        <CueSheetTopBarActions isFullscreen={isFullscreen} onToggleFullscreen={handleExpandSelect} onConfigureCueTypes={openConfigureCueTypes} />
      </div>
    </header>
  )
}
