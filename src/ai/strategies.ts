import type { Player, PlayerRole, SquadPlayer, Team, AuctionRules, AIDifficulty } from '../types'
import type { SquadStatus } from '../engine/squadEngine'
import { getSquadStatus } from '../engine/squadEngine'

export interface AuctionContext {
  rules: AuctionRules
  difficulty: AIDifficulty
  /** ids still in queue after current lot */
  upcomingPlayerIds: string[]
  allPlayers: Record<string, Player>
  /** how many lots processed */
  lotsProcessed: number
  totalLots: number
}

export interface TeamNeedProfile {
  status: SquadStatus
  slotsLeft: number
  overseasSlotsLeft: number
  avgSpendPerSlot: number
  pursePressure: number // 0..1, higher = tighter
}

export function buildNeedProfile(
  team: Team,
  squad: SquadPlayer[],
  ctx: AuctionContext,
): TeamNeedProfile {
  const status = getSquadStatus(squad, ctx.allPlayers, ctx.rules)
  const slotsLeft = Math.max(0, ctx.rules.maxSquadSize - squad.length)
  const minStillNeeded = Math.max(0, ctx.rules.minSquadSize - squad.length)
  const overseasSlotsLeft = Math.max(0, ctx.rules.maxOverseasPlayers - status.overseasCount)
  const reserveNeeded = minStillNeeded * 20
  const usablePurse = Math.max(0, team.purse - reserveNeeded)
  const avgSpendPerSlot = slotsLeft > 0 ? usablePurse / slotsLeft : 0
  const idealSpendPerSlot = team.budget / Math.max(1, ctx.rules.maxSquadSize)
  const pursePressure = clamp01(1 - avgSpendPerSlot / Math.max(1, idealSpendPerSlot * 1.4))
  return { status, slotsLeft, overseasSlotsLeft, avgSpendPerSlot, pursePressure }
}

/**
 * Core valuation: what is this player worth (in lakh) to this team?
 * Considers rating, role fit, scarcity, stage, and purse.
 */
export function valuePlayer(
  player: Player,
  team: Team,
  _squad: SquadPlayer[],
  profile: TeamNeedProfile,
  ctx: AuctionContext,
): number {
  // Anchor: base price scaled by rating quality
  const ratingFactor = (player.rating - 55) / 40 // -0.37 .. 1.1
  let value = player.basePrice * (1.2 + Math.max(0, ratingFactor) * 3.2)

  // Role need multipliers
  const roleCount = profile.status.roleCounts[player.role] ?? 0
  const targetForRole = roleTarget(player.role, ctx.rules.maxSquadSize)
  if (roleCount === 0) value *= 1.35 // fills a gap
  else if (roleCount < targetForRole) value *= 1.05
  else value *= Math.max(0.35, 1 - (roleCount - targetForRole) * 0.22) // saturated

  // Preferred roles bonus from AI personality
  if (team.aiProfile.preferredRoles.includes(player.role)) value *= 1.15

  // Overseas constraint
  if (player.nationality !== 'India') {
    if (profile.overseasSlotsLeft <= 0) return 0
    if (profile.overseasSlotsLeft <= 2) value *= 0.85
  }

  // Scarcity: fewer similar players left => worth more (expert+hard)
  if (ctx.difficulty === 'hard' || ctx.difficulty === 'expert') {
    const sameRoleUpcoming = ctx.upcomingPlayerIds.filter((id) => {
      const p = ctx.allPlayers[id]
      return p?.role === player.role && p.rating >= player.rating - 5
    }).length
    const scarcityBoost = clampMap(sameRoleUpcoming, 8, 0, 1.0, 1.28)
    value *= scarcityBoost
  }

  // Stage: late auction with unfilled slots => pay premium for anyone decent
  const stageProgress = ctx.totalLots > 0 ? ctx.lotsProcessed / ctx.totalLots : 0
  if (stageProgress > 0.7 && profile.slotsLeft > 0 && profile.status.missingRoles.length > 0) {
    if (profile.status.missingRoles.includes(player.role)) value *= 1.3
  }

  // Purse discipline: scale down as pressure rises
  value *= 1 - profile.pursePressure * 0.45

  // Personality: aggressive teams overpay slightly, cautious underpay
  value *= 0.9 + team.aiProfile.aggressiveness * 0.25

  // Never below base price, never above what they can afford
  const affordableCap = Math.max(0, team.purse - reserveFor(team, profile))
  return Math.min(value, affordableCap)
}

function reserveFor(_team: Team, profile: TeamNeedProfile): number {
  const minStillNeeded = Math.max(0, 12 - (profile.status.size))
  void minStillNeeded
  return Math.max(0, profile.slotsLeft > 0 ? 20 : 0)
}

function roleTarget(role: PlayerRole, maxSquad: number): number {
  const share: Record<PlayerRole, number> = {
    Batsman: 0.24,
    Wicketkeeper: 0.12,
    'All-rounder': 0.2,
    'Fast Bowler': 0.26,
    'Spin Bowler': 0.18,
  }
  return Math.max(1, Math.round(maxSquad * share[role]))
}

export function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

function clampMap(n: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  const t = clamp01((n - inMin) / (inMax - inMin))
  return outMin + t * (outMax - outMin)
}
