import { TimelineSidebar } from './timeline-sidebar'
import { TimelineCanvas } from './timeline-canvas'
import { useAppContext } from '../context/app-context'

export function TimelineShell() {
  const { selectedEvent } = useAppContext()

  if (selectedEvent && selectedEvent.tracks.length === 0) {
    return null
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <div className="flex min-h-0 flex-1">
        <TimelineSidebar />
        <TimelineCanvas />
      </div>
    </div>
  )
}
