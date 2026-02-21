import { useCallback, useState } from 'react'
import { Button } from '@/components/button'
import { Dialog } from '@/components/dialog'
import { Icon } from '@/components/icon'
import { ScrollArea } from '@/components/scroll-area'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from '@/components/popover'
import { CUE_TYPE_ICON_OPTIONS, getCueTypeIcon } from '@/utils/cues/cue-type-icons'
import { useAppContext } from '@/contexts/app-context'
import type { CueType, CueTypeIcon } from '@/types/cue-sheet'
import { generateId } from '@/utils/cue-sheet/cue-sheet-utils'

export function ConfigureCueTypesModal() {
  const { isConfiguringCueTypes, cueTypes, closeConfigureCueTypes, handleSaveCueTypes } = useAppContext()
  const [draftCueTypes, setDraftCueTypes] = useState<CueType[] | null>(null)
  const [iconPickerCueTypeId, setIconPickerCueTypeId] = useState<string | null>(null)
  const activeDraftCueTypes = draftCueTypes ?? cueTypes.map((cueType) => ({ ...cueType }))

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setIconPickerCueTypeId(null)
        setDraftCueTypes(null)
        closeConfigureCueTypes()
      }
    },
    [closeConfigureCueTypes]
  )

  const handleNameChange = useCallback((id: string, name: string) => {
    setDraftCueTypes((types) => (types ?? activeDraftCueTypes).map((cueType) => (cueType.id === id ? { ...cueType, name } : cueType)))
  }, [activeDraftCueTypes])

  const handleIconSelect = useCallback((id: string, icon: CueTypeIcon) => {
    setDraftCueTypes((types) => (types ?? activeDraftCueTypes).map((cueType) => (cueType.id === id ? { ...cueType, icon } : cueType)))
    setIconPickerCueTypeId(null)
  }, [activeDraftCueTypes])

  const handleAddType = useCallback(() => {
    const icon = CUE_TYPE_ICON_OPTIONS[0].value
    setDraftCueTypes((types) => {
      const nextTypes = types ?? activeDraftCueTypes
      return [...nextTypes, { id: generateId(), name: `Custom ${nextTypes.length + 1}`, icon }]
    })
  }, [activeDraftCueTypes])

  const handleSave = useCallback(() => {
    const sanitizedTypes = activeDraftCueTypes.map((cueType) => ({ ...cueType, name: cueType.name.trim() })).filter((cueType) => cueType.name.length > 0)
    if (sanitizedTypes.length === 0) return
    handleSaveCueTypes(sanitizedTypes)
    setIconPickerCueTypeId(null)
    setDraftCueTypes(null)
  }, [activeDraftCueTypes, handleSaveCueTypes])

  return (
    <Dialog.Root open={isConfiguringCueTypes} onOpenChange={handleDialogOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport size="sm">
          <Dialog.Header>
            <h2 className="text-lg font-semibold text-gray-900">Configure Cue Types</h2>
            <Dialog.Close><Icon.x_close size={20} /></Dialog.Close>
          </Dialog.Header>
          <Dialog.Content>
            <div className="flex flex-col gap-3">
              <ScrollArea className="flex max-h-[44vh] flex-col gap-2 overflow-y-auto px-1 py-1">
                {activeDraftCueTypes.map((cueType) => (
                  <div key={cueType.id} className="flex items-center gap-2">
                    <PopoverRoot open={iconPickerCueTypeId === cueType.id} onOpenChange={(nextOpen) => setIconPickerCueTypeId(nextOpen ? cueType.id : null)}>
                      <PopoverTrigger type="button" className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-foreground-brand-primary/40" aria-label={`Select icon for ${cueType.name || 'cue type'}`} title="Select icon">
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
                    <input type="text" value={cueType.name} onChange={(event) => handleNameChange(cueType.id, event.target.value)} placeholder="Type name" className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm focus:border-foreground-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-foreground-brand-primary/40" />
                  </div>
                ))}
              </ScrollArea>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button type="button" variant="secondary" className="w-full" onClick={handleAddType}>Add Type</Button>
                <Button type="button" className="w-full" onClick={handleSave} disabled={activeDraftCueTypes.every((cueType) => cueType.name.trim().length === 0)}>Save</Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
