/**
 * All monetary values are stored internally in LAKH.
 * 1 Crore = 100 Lakh.
 */

export const LAKH_PER_CRORE = 100

export function formatLakh(lakh: number): string {
  if (!Number.isFinite(lakh)) return '₹0'
  const abs = Math.abs(lakh)
  const sign = lakh < 0 ? '-' : ''
  if (abs >= LAKH_PER_CRORE) {
    const cr = abs / LAKH_PER_CRORE
    const formatted = Number.isInteger(cr) ? cr.toString() : cr.toFixed(cr < 10 ? 2 : 1)
    return `${sign}₹${trimZeros(formatted)} Cr`
  }
  return `${sign}₹${Math.round(abs)} L`
}

export function formatCrore(lakh: number): string {
  return `₹${(lakh / LAKH_PER_CRORE).toFixed(2).replace(/\.00$/, '')} Cr`
}

export function croreToLakh(cr: number): number {
  return Math.round(cr * LAKH_PER_CRORE)
}

export function lakhToCrore(lakh: number): number {
  return lakh / LAKH_PER_CRORE
}

function trimZeros(s: string): string {
  if (s.includes('.')) {
    return s.replace(/0+$/, '').replace(/\.$/, '')
  }
  return s
}

/** Parse user input like "120", "120cr", "7.5 Cr", "500 L" into lakh */
export function parseBudgetInput(input: string): number | null {
  const cleaned = input.trim().toLowerCase().replace(/₹/g, '')
  const match = cleaned.match(/^(\d+(?:\.\d+)?)\s*(cr|crore|l|lakh|lakhs)?$/)
  if (!match) return null
  const value = parseFloat(match[1])
  const unit = match[2]
  if (unit === 'l' || unit === 'lakh' || unit === 'lakhs') return Math.round(value)
  return croreToLakh(value)
}
