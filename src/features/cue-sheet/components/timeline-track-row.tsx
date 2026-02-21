import { Icon } from '../../../components/icon'
import { IconButton } from '../../../components/icon-button'
import { Menu } from '../../../components/menu'
import type { Track } from '../types'
import { TRACK_COLORS } from '../utils'
import { TRACK_HEIGHT } from '../utils/timeline-constants'

interface TimelineTrackRowProps {
  track: Track
  index: number
  isEditing: boolean
  editingTrackName: string
  canDeleteTracks: boolean
  isDragSource: boolean
  isDragTarget: boolean
  onTrackDragStart: (trackId: string, index: number, e: React.PointerEvent) => void
  onEditingTrackNameChange: (value: string) => void
  onUpdateTrackName: (trackId: string) => void
  onCancelRename: () => void
  onRenameTrack: (track: Track) => void
  onToggleTrackHidden: (track: Track) => void
  onToggleTrackLocked: (track: Track) => void
  onDeleteTrack: (trackId: string) => void
  onSetTrackColor: (trackId: string, color: string) => void
}

export function TimelineTrackRow({ track, index, isEditing, editingTrackName, canDeleteTracks, isDragSource, isDragTarget, onTrackDragStart, onEditingTrackNameChange, onUpdateTrackName, onCancelRename, onRenameTrack, onToggleTrackHidden, onToggleTrackLocked, onDeleteTrack, onSetTrackColor }: TimelineTrackRowProps) {
  const rowClassName = `relative flex items-center justify-between gap-2 border-b border-[var(--border-secondary,#e8e8e8)] px-[var(--spacing-md,8px)] pb-px transition-colors ${track.hidden ? 'opacity-45' : ''} ${isDragSource ? 'bg-pink-50' : ''}`

  return (
    <div data-track-sidebar className={rowClassName} style={{ height: TRACK_HEIGHT }}>
      {isDragTarget && (
        <div className="absolute inset-x-0 top-0 h-0 z-10 flex items-center justify-center">
          <div className="w-full h-0.5 bg-pink-500 shadow-sm" />
        </div>
      )}
      <div className="shrink-0 cursor-grab p-0.5 text-gray-400 hover:text-gray-600 active:cursor-grabbing touch-none" onPointerDown={(e) => onTrackDragStart(track.id, index, e)}>
        <Icon.dots_grid size={20} className="size-5" />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-[var(--spacing-xsm,4px)]">
        <div className="size-4 shrink-0 rounded-full border border-black/20" style={{ backgroundColor: track.color }} />
        {isEditing ? (
          <input
            type="text"
            value={editingTrackName}
            onChange={(e) => onEditingTrackNameChange(e.target.value)}
            onBlur={() => onUpdateTrackName(track.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onUpdateTrackName(track.id)
              if (e.key === 'Escape') onCancelRename()
            }}
            className="min-h-px min-w-px flex-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-sm font-medium leading-5 text-[color:var(--text-primary,#1a1a1a)] focus:outline-none focus:ring-1 focus:ring-foreground-brand-primary/40"
            autoFocus
          />
        ) : (
          <>
            <span className="min-h-px min-w-px flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-medium leading-5 text-[color:var(--text-primary,#1a1a1a)]">
              {track.name}
            </span>
            {track.locked && <Icon.lock_01 size={12} className="size-3 shrink-0 text-gray-400" />}
          </>
        )}
      </div>
      <Menu.Root>
        <Menu.Trigger>
          <IconButton variant="ghost" size="sm" className="text-gray-500" icon={<Icon.dots_horizontal size={16} className="size-4" />} />
        </Menu.Trigger>
        <Menu.Content anchor="bottom-right">
          <Menu.Item onSelect={() => onRenameTrack(track)}>
            <Icon.edit_03 size={16} />
            Rename
          </Menu.Item>
          <Menu.Item onSelect={() => onToggleTrackHidden(track)}>
            {track.hidden ? <Icon.eye size={16} /> : <Icon.eye_off size={16} />}
            {track.hidden ? 'Show Track' : 'Hide Track'}
          </Menu.Item>
          <Menu.Item onSelect={() => onToggleTrackLocked(track)}>
            {track.locked ? <Icon.lock_unlocked_01 size={16} /> : <Icon.lock_01 size={16} />}
            {track.locked ? 'Unlock Track' : 'Lock Track'}
          </Menu.Item>
          {canDeleteTracks && (
            <Menu.Item onSelect={() => onDeleteTrack(track.id)}>
              <Icon.trash_01 size={16} />
              Delete
            </Menu.Item>
          )}
          <div className="my-1 h-px bg-white/10" />
          <div className="px-2 pb-1 pt-1">
            <p className="px-1 text-[11px] font-medium uppercase tracking-wide text-white/60">Color</p>
            <div className="mt-1.5 grid grid-cols-4 gap-1.5">
              {TRACK_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`size-6 rounded-full border transition-transform hover:scale-105 ${track.color === color ? 'border-white' : 'border-white/20'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => onSetTrackColor(track.id, color)}
                  aria-label={`Set ${track.name} color`}
                />
              ))}
            </div>
          </div>
        </Menu.Content>
      </Menu.Root>
    </div>
  )
}
