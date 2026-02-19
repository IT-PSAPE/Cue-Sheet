import { useCallback, useState } from 'react'
import { Button } from '../../../components/button'
import { Modal } from '../../../components/modal'
import { ScrollArea } from '../../../components/scroll-area'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from '../../../components/popover'
import { CUE_TYPE_ICON_OPTIONS, getCueTypeIcon } from '../cue-type-icons'
import type { CueType, CueTypeIcon } from '../types'
import { generateId } from '../utils'

interface ConfigureCueTypesModalProps {
  isOpen: boolean
  onClose: () => void
  cueTypes: CueType[]
  onSave: (cueTypes: CueType[]) => void
}

export function ConfigureCueTypesModal({ isOpen, onClose, cueTypes, onSave }: ConfigureCueTypesModalProps) {
  const [draftCueTypes, setDraftCueTypes] = useState<CueType[]>([])
  const [iconPickerCueTypeId, setIconPickerCueTypeId] = useState<string | null>(null)

  const handleOpen = useCallback(() => {
    setDraftCueTypes(cueTypes.map((ct) => ({ ...ct })))
    setIconPickerCueTypeId(null)
  }, [cueTypes])

  const handleClose = useCallback(() => {
    setIconPickerCueTypeId(null)
    onClose()
  }, [onClose])

  const handleNameChange = useCallback((id: string, name: string) => {
    setDraftCueTypes((types) => types.map((ct) => (ct.id === id ? { ...ct, name } : ct)))
  }, [])

  const handleIconSelect = useCallback((id: string, icon: CueTypeIcon) => {
    setDraftCueTypes((types) => types.map((ct) => (ct.id === id ? { ...ct, icon } : ct)))
    setIconPickerCueTypeId(null)
  }, [])

  const handleAddType = useCallback(() => {
    const icon = CUE_TYPE_ICON_OPTIONS[0].value
    setDraftCueTypes((types) => [...types, { id: generateId(), name: `Custom ${types.length + 1}`, icon }])
  }, [])

  const handleSave = useCallback(() => {
    const sanitized = draftCueTypes.map((ct) => ({ ...ct, name: ct.name.trim() })).filter((ct) => ct.name.length > 0)
    if (sanitized.length === 0) return
    onSave(sanitized)
    setIconPickerCueTypeId(null)
  }, [draftCueTypes, onSave])

  // Sync draft when modal opens
  if (isOpen && draftCueTypes.length === 0 && cueTypes.length > 0) {
    handleOpen()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Configure Cue Types" size="sm" compact>
      <div className="flex flex-col gap-3">
        <ScrollArea className="flex max-h-[44vh] flex-col gap-2 overflow-y-auto px-1 py-1">
          {draftCueTypes.map((cueType) => (
            <div key={cueType.id} className="flex items-center gap-2">
              <PopoverRoot open={iconPickerCueTypeId === cueType.id} onOpenChange={(next) => setIconPickerCueTypeId(next ? cueType.id : null)}>
                <PopoverTrigger type="button" className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500" aria-label={`Select icon for ${cueType.name || 'cue type'}`} title="Select icon">
                  {getCueTypeIcon(cueType.icon, 'h-4 w-4')}
                </PopoverTrigger>
                <PopoverPortal>
                  <PopoverContent side="bottom" align="start" offset={6} className="z-[1050] w-[228px] rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                    <div className="grid grid-cols-5 gap-1.5">
                      {CUE_TYPE_ICON_OPTIONS.map((iconOption) => {
                        const isSelected = iconOption.value === cueType.icon
                        return (
                          <button key={iconOption.value} type="button" className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${isSelected ? 'border-pink-400 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`} onClick={() => handleIconSelect(cueType.id, iconOption.value as CueTypeIcon)} title={iconOption.label} aria-label={iconOption.label}>
                            {getCueTypeIcon(iconOption.value, 'h-4 w-4')}
                          </button>
                        )
                      })}
                    </div>
                  </PopoverContent>
                </PopoverPortal>
              </PopoverRoot>
              <input type="text" value={cueType.name} onChange={(e) => handleNameChange(cueType.id, e.target.value)} placeholder="Type name" className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500" />
            </div>
          ))}
        </ScrollArea>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button type="button" variant="secondary" className="w-full" onClick={handleAddType}>Add Type</Button>
          <Button type="button" className="w-full" onClick={handleSave} disabled={draftCueTypes.every((ct) => ct.name.trim().length === 0)}>Save</Button>
        </div>
      </div>
    </Modal>
  )
}
