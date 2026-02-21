import type { ReactNode } from 'react'
import { Icon } from '@/components/icon'
import { cn } from '@/util/cn'
import type { CueTypeIcon } from '@/types/cue-sheet'

export interface CueTypeIconOption {
  value: CueTypeIcon
  label: string
}

export const CUE_TYPE_ICON_OPTIONS: CueTypeIconOption[] = [
  { value: 'music', label: 'Music' },
  { value: 'wrench', label: 'Wrench' },
  { value: 'briefcase', label: 'Briefcase' },
  { value: 'microphone', label: 'Microphone' },
  { value: 'transition', label: 'Transition' },
  { value: 'star', label: 'Star' },
  { value: 'flag', label: 'Flag' },
  { value: 'bolt', label: 'Bolt' },
  { value: 'bell', label: 'Bell' },
  { value: 'users', label: 'Users' },
  { value: 'camera', label: 'Camera' },
  { value: 'video', label: 'Video' },
  { value: 'lightbulb', label: 'Lightbulb' },
  { value: 'clock', label: 'Clock' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'clipboard', label: 'Clipboard' },
  { value: 'pin', label: 'Pin' },
  { value: 'speaker', label: 'Speaker' },
  { value: 'shield', label: 'Shield' },
  { value: 'check-circle', label: 'Check Circle' },
  { value: 'alert', label: 'Alert' },
  { value: 'heart', label: 'Heart' },
  { value: 'book', label: 'Book' },
  { value: 'truck', label: 'Truck' },
  { value: 'sparkles', label: 'Sparkles' },
]

export function getCueTypeIcon(icon: CueTypeIcon, className = 'w-3 h-3'): ReactNode {
  const iconClassName = cn(className)

  switch (icon) {
    case 'music':
      return <Icon.music_note_01 size={16} className={iconClassName} />
    case 'wrench':
      return <Icon.tool_01 size={16} className={iconClassName} />
    case 'briefcase':
      return <Icon.briefcase_01 size={16} className={iconClassName} />
    case 'microphone':
      return <Icon.microphone_01 size={16} className={iconClassName} />
    case 'transition':
      return <Icon.repeat_01 size={16} className={iconClassName} />
    case 'star':
      return <Icon.star_01 size={16} className={iconClassName} />
    case 'flag':
      return <Icon.flag_01 size={16} className={iconClassName} />
    case 'bolt':
      return <Icon.zap size={16} className={iconClassName} />
    case 'bell':
      return <Icon.bell_01 size={16} className={iconClassName} />
    case 'users':
      return <Icon.users_01 size={16} className={iconClassName} />
    case 'camera':
      return <Icon.camera_01 size={16} className={iconClassName} />
    case 'video':
      return <Icon.video_recorder size={16} className={iconClassName} />
    case 'lightbulb':
      return <Icon.lightbulb_01 size={16} className={iconClassName} />
    case 'clock':
      return <Icon.clock size={16} className={iconClassName} />
    case 'calendar':
      return <Icon.calendar size={16} className={iconClassName} />
    case 'clipboard':
      return <Icon.clipboard size={16} className={iconClassName} />
    case 'pin':
      return <Icon.marker_pin_01 size={16} className={iconClassName} />
    case 'speaker':
      return <Icon.volume_plus size={16} className={iconClassName} />
    case 'shield':
      return <Icon.shield_01 size={16} className={iconClassName} />
    case 'check-circle':
      return <Icon.check_circle size={16} className={iconClassName} />
    case 'alert':
      return <Icon.alert_triangle size={16} className={iconClassName} />
    case 'heart':
      return <Icon.heart size={16} className={iconClassName} />
    case 'book':
      return <Icon.book_open_01 size={16} className={iconClassName} />
    case 'truck':
      return <Icon.truck_01 size={16} className={iconClassName} />
    case 'sparkles':
      return <Icon.stars_01 size={16} className={iconClassName} />
    default:
      return null
  }
}
