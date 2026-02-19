import { useCallback, useRef } from 'react'

interface UseScrollSyncOptions {
  timelineContainerRef: React.RefObject<HTMLDivElement | null>
  sidebarScrollRef: React.RefObject<HTMLDivElement | null>
}

export function useScrollSync({ timelineContainerRef, sidebarScrollRef }: UseScrollSyncOptions) {
  const isSyncingRef = useRef<null | 'timeline' | 'sidebar'>(null)

  const handleTimelineScroll = useCallback(() => {
    const timeline = timelineContainerRef.current
    const sidebar = sidebarScrollRef.current
    if (!timeline || !sidebar) return

    if (isSyncingRef.current === 'sidebar') {
      isSyncingRef.current = null
      return
    }

    if (Math.abs(timeline.scrollTop - sidebar.scrollTop) < 1) return
    isSyncingRef.current = 'timeline'
    sidebar.scrollTop = timeline.scrollTop
  }, [timelineContainerRef, sidebarScrollRef])

  const handleSidebarScroll = useCallback(() => {
    const timeline = timelineContainerRef.current
    const sidebar = sidebarScrollRef.current
    if (!timeline || !sidebar) return

    if (isSyncingRef.current === 'timeline') {
      isSyncingRef.current = null
      return
    }

    if (Math.abs(timeline.scrollTop - sidebar.scrollTop) < 1) return
    isSyncingRef.current = 'sidebar'
    timeline.scrollTop = sidebar.scrollTop
  }, [timelineContainerRef, sidebarScrollRef])

  return { handleTimelineScroll, handleSidebarScroll }
}
