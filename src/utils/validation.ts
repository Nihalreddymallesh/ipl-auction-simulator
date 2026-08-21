import type { Team, Player } from '../types'
import { MAX_TEAMS, MIN_TEAMS } from '../config/auctionRules'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateTeamSetup(teams: Team[]): ValidationResult {
  const errors: string[] = []
  if (teams.length < MIN_TEAMS) errors.push(`At least ${MIN_TEAMS} teams are required.`)
  if (teams.length > MAX_TEAMS) errors.push(`Maximum ${MAX_TEAMS} teams allowed.`)

  const names = teams.map((t) => t.name.trim().toLowerCase())
  if (names.some((n) => n === '')) errors.push('Every team needs a name.')
  const dupes = names.filter((n, i) => names.indexOf(n) !== i)
  if (dupes.length > 0) errors.push('Team names must be unique.')

  teams.forEach((t) => {
    if (!Number.isFinite(t.budget) || t.budget <= 0) {
      errors.push(`${t.name || 'Team'}: budget must be greater than zero.`)
    }
  })

  return { valid: errors.length === 0, errors }
}

export function validatePlayer(player: Partial<Player>): string[] {
  const errors: string[] = []
  if (!player.name || player.name.trim() === '') errors.push('Name is required.')
  if (!player.nationality || player.nationality.trim() === '') errors.push('Country is required.')
  if (!player.role) errors.push('Role is required.')
  if (player.basePrice !== undefined && (player.basePrice < 20 || player.basePrice > 500)) {
    errors.push('Base price must be between ₹20 L and ₹5 Cr.')
  }
  if (player.rating !== undefined && (player.rating < 40 || player.rating > 99)) {
    errors.push('Rating must be between 40 and 99.')
  }
  return errors
}
