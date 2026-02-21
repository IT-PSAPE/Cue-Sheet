import { useCallback, useEffect, useState } from 'react'

function getFullscreenElement(): Element | null {
  return document.fullscreenElement ?? (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ?? null
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(() => getFullscreenElement() !== null)

  useEffect(() => {
    const handleChange = () => setIsFullscreen(getFullscreenElement() !== null)
    document.addEventListener('fullscreenchange', handleChange)
    document.addEventListener('webkitfullscreenchange', handleChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleChange)
      document.removeEventListener('webkitfullscreenchange', handleChange)
    }
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (getFullscreenElement()) {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
        await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen()
      }
    } else {
      const el = document.documentElement
      if (el.requestFullscreen) {
        await el.requestFullscreen()
      } else if ((el as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
        await (el as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen()
      }
    }
  }, [])

  return { isFullscreen, toggleFullscreen }
}
