/** Minimal RFC 4180 CSV serialiser — quotes anything containing a delimiter. */
export function toCsv(rows: Record<string, unknown>[], columns?: string[]): string {
  if (rows.length === 0) return ''
  const headers = columns ?? Object.keys(rows[0])
  const lines = [headers.map(escapeCell).join(',')]

  for (const row of rows) {
    lines.push(headers.map((header) => escapeCell(row[header])).join(','))
  }

  return lines.join('\r\n')
}

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}
