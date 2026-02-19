import type { ReactNode } from 'react'
import type { CueTypeIcon } from './types'

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
  switch (icon) {
    case 'music':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
        </svg>
      )
    case 'wrench':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.18 3.64a4.2 4.2 0 01-5.67 5.67L5.7 15.12a2 2 0 11-2.83-2.83l5.81-5.81a4.2 4.2 0 015.67-5.67L12.5 2.66l1.2 2.98 2.98 1.2 1.5-3.2z" />
        </svg>
      )
    case 'briefcase':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M7.5 4V3a2 2 0 012-2h1a2 2 0 012 2v1H16a2 2 0 012 2v2H2V6a2 2 0 012-2h3.5zm1.5 0h2V3H9v1z" />
          <path d="M2 9.5h6V11a1 1 0 102 0V9.5h8V15a2 2 0 01-2 2H4a2 2 0 01-2-2V9.5z" />
        </svg>
      )
    case 'microphone':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a3 3 0 00-3 3v4a3 3 0 106 0V5a3 3 0 00-3-3zm-5 7a1 1 0 112 0 3 3 0 106 0 1 1 0 112 0 5 5 0 01-4 4.9V17h2a1 1 0 110 2H7a1 1 0 110-2h2v-2.1A5 5 0 015 9z" />
        </svg>
      )
    case 'transition':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 6h8L9.6 4.6 11 3.2 14.8 7 11 10.8 9.6 9.4 11 8H3V6zm14 8H9l1.4 1.4-1.4 1.4L5.2 13 9 9.2l1.4 1.4L9 12h8v2z" />
        </svg>
      )
    case 'star':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
      )
    case 'flag':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 2a1 1 0 00-1 1v14a1 1 0 102 0v-4h9l-1.5-3L14 7H5V3a1 1 0 00-1-1z" />
        </svg>
      )
    case 'bolt':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M11.3 1.046A1 1 0 0010.37 1.7l-6 8A1 1 0 005.17 11H9l-1.3 7.954a1 1 0 001.83.746l6-9A1 1 0 0014.7 9H11l1.3-7.954z" />
        </svg>
      )
    case 'bell':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a5 5 0 00-5 5v2.586L3.293 11.293A1 1 0 004 13h12a1 1 0 00.707-1.707L15 9.586V7a5 5 0 00-5-5zm0 16a3 3 0 002.995-2.824L13 15H7a3 3 0 003 3z" />
        </svg>
      )
    case 'users':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 8a3 3 0 110-6 3 3 0 010 6zm6 1a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM2 16a4 4 0 014-4h2a4 4 0 014 4v1H2v-1zm11 1v-1a5.99 5.99 0 00-1.195-3.6A4 4 0 0118 16v1h-5z" />
        </svg>
      )
    case 'camera':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 5a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2.2l-.8-1.2A2 2 0 0011.34 3H8.66a2 2 0 00-1.66.8L6.2 5H4zm6 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
        </svg>
      )
    case 'video':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-2.1l3.2 2a1 1 0 001.8-.85V6.95a1 1 0 00-1.8-.85L14 8.1V6a2 2 0 00-2-2H4z" />
        </svg>
      )
    case 'lightbulb':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-3.74 10.7c.9.73 1.4 1.46 1.55 2.3h4.38c.15-.84.65-1.57 1.55-2.3A6 6 0 0010 2zm-2 14a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm.75 2a.75.75 0 000 1.5h2.5a.75.75 0 000-1.5h-2.5z" />
        </svg>
      )
    case 'clock':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 4a1 1 0 10-2 0v4c0 .27.11.52.29.71l2.5 2.5a1 1 0 001.42-1.42L11 9.59V6z" />
        </svg>
      )
    case 'calendar':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M6 2a1 1 0 012 0v1h4V2a1 1 0 112 0v1h1a2 2 0 012 2v2H3V5a2 2 0 012-2h1V2zm11 7H3v6a2 2 0 002 2h10a2 2 0 002-2V9z" />
        </svg>
      )
    case 'clipboard':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 00-2 2v1H4a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7zm0 3V4h6v1H7z" />
        </svg>
      )
    case 'pin':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a5 5 0 00-5 5c0 3.62 5 11 5 11s5-7.38 5-11a5 5 0 00-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      )
    case 'speaker':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M12 4.55a1 1 0 00-1.53-.85L6.7 6.5H4a2 2 0 00-2 2v3a2 2 0 002 2h2.7l3.77 2.8A1 1 0 0012 15.45v-10.9zM14.83 7.17a1 1 0 011.42 0 4 4 0 010 5.66 1 1 0 11-1.42-1.42 2 2 0 000-2.82 1 1 0 010-1.42z" />
        </svg>
      )
    case 'shield':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2l6 2v5c0 4.06-2.45 7.72-6 9-3.55-1.28-6-4.94-6-9V4l6-2z" />
        </svg>
      )
    case 'check-circle':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.7a1 1 0 00-1.4-1.4L9 10.2 7.7 8.9a1 1 0 10-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    case 'alert':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.26 3.1a2 2 0 013.48 0l6.18 10.83A2 2 0 0116.18 17H3.82a2 2 0 01-1.74-3.07L8.26 3.1zM9 7a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 15z" />
        </svg>
      )
    case 'heart':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M3.17 5.17a4 4 0 015.66 0L10 6.34l1.17-1.17a4 4 0 015.66 5.66L10 17.66 3.17 10.83a4 4 0 010-5.66z" />
        </svg>
      )
    case 'book':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h11a1 1 0 100-2H5V5h10a1 1 0 000-2H4z" />
          <path d="M6 7h6v1H6V7zm0 3h6v1H6v-1z" />
        </svg>
      )
    case 'truck':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v1h2.59a2 2 0 011.7.95l1.4 2.25c.2.33.31.71.31 1.1V13a2 2 0 01-2 2h-.18a2.5 2.5 0 01-4.64 0H9.82a2.5 2.5 0 01-4.64 0H4a2 2 0 01-2-2V5zm4 9a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" />
        </svg>
      )
    case 'sparkles':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2l1.2 3.2L14.4 6.4 11.2 7.6 10 10.8 8.8 7.6 5.6 6.4l3.2-1.2L10 2zm5 7l.8 2.2L18 12l-2.2.8L15 15l-.8-2.2L12 12l2.2-.8L15 9zM5 11l1.2 3.2L9.4 15.4l-3.2 1.2L5 19.8l-1.2-3.2L.6 15.4l3.2-1.2L5 11z" />
        </svg>
      )
    default:
      return null
  }
}
