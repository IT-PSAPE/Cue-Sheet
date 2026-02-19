import { useState } from 'react'
import type { CueItem, CueItemType } from '../types'

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

export function CueItemCard({
  cueItem,
  onEdit,
  onDelete,
  onMoveLeft,
  onMoveRight,
  isFirst,
  isLast,
  row,
}: CueItemCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const styles = typeStyles[cueItem.type]

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return null
    return `${minutes} min`
  }

  return (
    <div
      className={`relative w-48 shrink-0 rounded-lg border-2 ${styles.bg} ${styles.border} p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
      onClick={onEdit}
    >
      {/* Connector line to timeline */}
      <div
        className={`absolute left-1/2 w-px bg-gray-300 ${
          row === 0 ? 'top-full h-4' : 'bottom-full h-4'
        }`}
      />

      {/* Menu button */}
      <div className="absolute top-2 right-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="p-1 rounded hover:bg-black/5 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="4" r="1.5" />
            <circle cx="10" cy="10" r="1.5" />
            <circle cx="10" cy="16" r="1.5" />
          </svg>
        </button>

        {showMenu && (
          <div
            className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                onMoveLeft()
                setShowMenu(false)
              }}
              disabled={isFirst}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Move Left
            </button>
            <button
              onClick={() => {
                onMoveRight()
                setShowMenu(false)
              }}
              disabled={isLast}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Move Right
            </button>
            <hr className="my-1 border-gray-100" />
            <button
              onClick={() => {
                onEdit()
                setShowMenu(false)
              }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              onClick={() => {
                onDelete()
                setShowMenu(false)
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`pr-6 ${styles.text}`}>
        <h4 className="font-semibold text-sm truncate">{cueItem.title}</h4>
        {cueItem.durationMinutes && (
          <p className="text-xs opacity-70 mt-0.5">{formatDuration(cueItem.durationMinutes)}</p>
        )}
      </div>
    </div>
  )
}
