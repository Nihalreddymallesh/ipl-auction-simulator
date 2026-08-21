import type { Player } from '../types'

export interface ImageFallbackInfo {
  initials: string
  role?: string
  country?: string
}

export function playerInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function teamInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return words.slice(0, 3).map((w) => w[0]?.toUpperCase() ?? '').join('')
  }
  return name.slice(0, 3).toUpperCase()
}

/** Deterministic pastel background from a string seed */
export function seedColor(seed: string): { bg: string; fg: string } {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  const hue = Math.abs(hash) % 360
  return {
    bg: `hsl(${hue}, 45%, 22%)`,
    fg: `hsl(${hue}, 70%, 78%)`,
  }
}

export function onImageError(e: React.SyntheticEvent<HTMLImageElement>): void {
  e.currentTarget.style.display = 'none'
}

export function hasUsableImage(player?: Player | null): boolean {
  return Boolean(player?.image && player.image.trim() !== '')
}
