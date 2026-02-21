import { useCallback, useState, type MouseEventHandler } from 'react'
import { Icon } from '@/components/icon'
import { cn } from '@/util/cn'
import type { CueItem, CueItemType } from '@/types/cue-sheet'

interface CueItemCardProps {
  cueItem: CueItem
  onEdit: () => void
  onDelete: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
  isFirst: boolean
  isLast: boolean
  row: number
}

const typeStyles: Record<CueItemType, { bg: string; border: string; text: string }> = {
  performance: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900' },
  technical: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900' },
  equipment: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-900' },
  announcement: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900' },
  transition: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-900' },
}

function formatDuration(minutes: number | null) {
  if (!minutes) return null
  return `${minutes} min`
}

export function CueItemCard({ cueItem, onEdit, onDelete, onMoveLeft, onMoveRight, isFirst, isLast, row }: CueItemCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const styles = typeStyles[cueItem.type]

  const handleCardClick = useCallback(() => {
    onEdit()
  }, [onEdit])

  const handleToggleMenu: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      event.stopPropagation()
      setShowMenu((currentValue) => !currentValue)
    },
    []
  )

  const handleMenuContainerClick: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
    event.stopPropagation()
  }, [])

  const handleMoveLeft = useCallback(() => {
    onMoveLeft()
    setShowMenu(false)
  }, [onMoveLeft])

  const handleMoveRight = useCallback(() => {
    onMoveRight()
    setShowMenu(false)
  }, [onMoveRight])

  const handleEdit = useCallback(() => {
    onEdit()
    setShowMenu(false)
  }, [onEdit])

  const handleDelete = useCallback(() => {
    onDelete()
    setShowMenu(false)
  }, [onDelete])

  return (
    <div className={cn('relative w-48 shrink-0 rounded-lg border-2 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer', styles.bg, styles.border)} onClick={handleCardClick}>
      <div className={cn('absolute left-1/2 w-px bg-gray-300', row === 0 ? 'top-full h-4' : 'bottom-full h-4')} />

      <div className="absolute top-2 right-2">
        <button onClick={handleToggleMenu} className="p-1 rounded hover:bg-black/5 text-gray-400 hover:text-gray-600" aria-label="Open cue menu">
          <Icon.dots_horizontal size={16} className="w-4 h-4" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]" onClick={handleMenuContainerClick}>
            <button onClick={handleMoveLeft} disabled={isFirst} className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
              Move Left
            </button>
            <button onClick={handleMoveRight} disabled={isLast} className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
              Move Right
            </button>
            <hr className="my-1 border-gray-100" />
            <button onClick={handleEdit} className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50">
              Edit
            </button>
            <button onClick={handleDelete} className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50">
              Delete
            </button>
          </div>
        )}
      </div>

      <div className={cn('pr-6', styles.text)}>
        <h4 className="font-semibold text-sm truncate">{cueItem.title}</h4>
        {cueItem.durationMinutes && <p className="text-xs opacity-70 mt-0.5">{formatDuration(cueItem.durationMinutes)}</p>}
      </div>
    </div>
  )
}
