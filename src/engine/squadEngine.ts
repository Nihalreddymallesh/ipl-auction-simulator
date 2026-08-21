import type { Player, PlayerRole, SquadPlayer, Team, AuctionRules } from '../types'

export interface SquadStatus {
  size: number
  isFull: boolean
  overseasCount: number
  overseasFull: boolean
  roleCounts: Record<PlayerRole, number>
  missingRoles: PlayerRole[]
}

const ALL_ROLES: PlayerRole[] = ['Batsman', 'Wicketkeeper', 'All-rounder', 'Fast Bowler', 'Spin Bowler']

export function getSquadStatus(
  squad: SquadPlayer[],
  players: Record<string, Player>,
  rules: AuctionRules,
): SquadStatus {
  const roleCounts = Object.fromEntries(ALL_ROLES.map((r) => [r, 0])) as Record<PlayerRole, number>
  let overseasCount = 0
  squad.forEach((sp) => {
    const p = players[sp.playerId]
    if (!p) return
    roleCounts[p.role] = (roleCounts[p.role] ?? 0) + 1
    if (p.nationality !== 'India') overseasCount++
  })
  return {
    size: squad.length,
    isFull: squad.length >= rules.maxSquadSize,
    overseasCount,
    overseasFull: overseasCount >= rules.maxOverseasPlayers,
    roleCounts,
    missingRoles: ALL_ROLES.filter((r) => roleCounts[r] === 0),
  }
}

/**
 * How much a team should ideally keep in reserve to fill its remaining
 * mandatory slots at minimum base price.
 */
export function reserveForMinSlots(_team: Team, squadSize: number, rules: AuctionRules): number {
  const needed = Math.max(0, rules.minSquadSize - squadSize)
  return needed * 20
}

export function maxAffordableBid(team: Team, squadSize: number, rules: AuctionRules): number {
  return Math.max(0, team.purse - reserveForMinSlots(team, squadSize, rules))
}
