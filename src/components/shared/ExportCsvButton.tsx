'use client'

import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { toCsv } from '@/lib/csv'

type Props = {
  rows: Record<string, unknown>[]
  filename: string
  columns?: string[]
  label?: string
}

export function ExportCsvButton({ rows, filename, columns, label = 'Export CSV' }: Props) {
  function download() {
    if (rows.length === 0) {
      toast.error('Nothing to export.')
      return
    }

    // BOM keeps Excel from mangling Thai display names.
    const blob = new Blob(['﻿' + toCsv(rows, columns)], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${rows.length} rows`)
  }

  return (
    <Button variant="outline" size="sm" onClick={download}>
      <Download /> {label}
    </Button>
  )
}
