'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { platformPresets, PlatformPreset } from '@/config/platform-presets'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ExportOptionsProps {
  onExport: (preset?: PlatformPreset) => Promise<void>
  isExporting: boolean
  disabled?: boolean
}

export function ExportOptions({ onExport, isExporting, disabled }: ExportOptionsProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('direct')

  const handleExport = async () => {
    try {
      const preset = selectedPreset === 'direct' ? undefined : platformPresets.find(p => p.id === selectedPreset)
      await onExport(preset)
    } catch (error) {
      console.error('Error exporting:', error)
    }
  }

  return (
    <div className="flex gap-4 items-center">
      <Select
        value={selectedPreset}
        onValueChange={setSelectedPreset}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select platform" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="direct">Download directly</SelectItem>
          {platformPresets.map((preset) => (
            <SelectItem key={preset.id} value={preset.id}>
              {preset.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button 
        onClick={handleExport}
        disabled={disabled || isExporting}
      >
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>
    </div>
  )
}
