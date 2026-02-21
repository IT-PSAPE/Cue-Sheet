import { Icon } from '@/components/icon'
import { IconButton } from '@/components/icon-button'
import { TIME_RULER_HEIGHT } from '@/utils/timeline/timeline-constants'
import { formatTimeDisplay } from '@/utils/timeline/timeline-utils'

interface TimelineTrackHeaderProps {
  currentTimeMinutes: number
  totalMinutes: number
  isPlaying: boolean
  onPlayPause: () => void
}

export function TimelineTrackHeader({ currentTimeMinutes, totalMinutes, isPlaying, onPlayPause }: TimelineTrackHeaderProps) {
  return (
    <div className="border-b border-gray-200 px-2.5 flex items-center gap-1.5" style={{ height: TIME_RULER_HEIGHT }}>
      <IconButton size="sm" variant={isPlaying ? 'primary' : 'ghost'} onClick={onPlayPause} aria-label={isPlaying ? 'Pause' : 'Play'} icon={isPlaying ? <Icon.pause_square size={14} /> : <Icon.play size={14} />} />
      <span className="w-[92px] whitespace-nowrap text-center text-[10px] leading-none font-mono font-medium text-gray-700">
        {formatTimeDisplay(currentTimeMinutes)} / {formatTimeDisplay(totalMinutes)}
      </span>
    </div>
  )
}
