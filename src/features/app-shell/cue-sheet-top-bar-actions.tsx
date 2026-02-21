import { useCallback } from 'react'
import { Icon } from '@/components/icon'
import { IconButton } from '@/components/icon-button'
import { Menu } from '@/components/menu'
import { useCueSheetExport } from '@/hooks/cue-sheet/use-cue-sheet-export'
import { useCueSheetImport } from '@/hooks/cue-sheet/use-cue-sheet-import'
import { ExportDataDialog } from './export-data-dialog'
import { ImportDataDialog } from './import-data-dialog'

interface CueSheetTopBarActionsProps {
  isFullscreen: boolean
  onToggleFullscreen: () => void
  onConfigureCueTypes: () => void
}

export function CueSheetTopBarActions({ isFullscreen, onToggleFullscreen, onConfigureCueTypes }: CueSheetTopBarActionsProps) {
  const {
    cueTypeCount,
    eventSelectionItems,
    isExportDialogOpen,
    exportIncludeCueTypes,
    exportEventSelection,
    hasExportSelection,
    openExportDialog,
    closeExportDialog,
    handleExportCueTypesToggle,
    handleExportEventToggle,
    handleExportSelectAllEvents,
    handleExportDeselectAllEvents,
    handleExportConfirm,
  } = useCueSheetExport()
  const {
    isImportDialogOpen,
    importIncludeCueTypes,
    importEventSelection,
    parsedImportData,
    importFileName,
    importError,
    hasImportSelection,
    openImportDialog,
    closeImportDialog,
    handleImportFileChange,
    handleImportCueTypesToggle,
    handleImportEventToggle,
    handleImportSelectAllEvents,
    handleImportDeselectAllEvents,
    handleImportConfirm,
  } = useCueSheetImport()

  const handleExportDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeExportDialog()
    },
    [closeExportDialog]
  )

  const handleImportDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeImportDialog()
    },
    [closeImportDialog]
  )

  return (
    <>
      <Menu.Root>
        <Menu.Trigger>
          <IconButton variant="secondary" icon={<Icon.dots_horizontal size={16} />} />
        </Menu.Trigger>
        <Menu.Content anchor="bottom-right">
          <Menu.Item onSelect={onToggleFullscreen}>
            {isFullscreen ? <Icon.minimize_02 size={16} /> : <Icon.maximize_02 size={16} />}
            Expand
          </Menu.Item>
          <Menu.Item onSelect={onConfigureCueTypes}>
            <Icon.sliders_01 size={16} />
            Types
          </Menu.Item>
          <Menu.Item onSelect={openExportDialog}>
            <Icon.download_01 size={16} />
            Export
          </Menu.Item>
          <Menu.Item onSelect={openImportDialog}>
            <Icon.upload_01 size={16} />
            Import
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>
      <ExportDataDialog
        open={isExportDialogOpen}
        cueTypeCount={cueTypeCount}
        eventSelectionItems={eventSelectionItems}
        includeCueTypes={exportIncludeCueTypes}
        eventSelection={exportEventSelection}
        disableExport={!hasExportSelection}
        onOpenChange={handleExportDialogOpenChange}
        onCancel={closeExportDialog}
        onCueTypesToggle={handleExportCueTypesToggle}
        onEventToggle={handleExportEventToggle}
        onSelectAllEvents={handleExportSelectAllEvents}
        onDeselectAllEvents={handleExportDeselectAllEvents}
        onExport={handleExportConfirm}
      />
      <ImportDataDialog
        open={isImportDialogOpen}
        importFileName={importFileName}
        importError={importError}
        importCueTypeCount={parsedImportData?.cueTypes.length ?? 0}
        importEvents={parsedImportData?.events ?? []}
        includeCueTypes={importIncludeCueTypes}
        importEventSelection={importEventSelection}
        disableImport={!hasImportSelection}
        onOpenChange={handleImportDialogOpenChange}
        onCancel={closeImportDialog}
        onFileChange={handleImportFileChange}
        onCueTypesToggle={handleImportCueTypesToggle}
        onEventToggle={handleImportEventToggle}
        onSelectAllEvents={handleImportSelectAllEvents}
        onDeselectAllEvents={handleImportDeselectAllEvents}
        onImport={handleImportConfirm}
      />
    </>
  )
}
