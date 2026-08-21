import type { AuctionState, Player, Team, AIDifficulty } from '../types'
import { valuePlayer, buildNeedProfile, type AuctionContext } from './strategies'

export interface AIDecision {
  teamId: string
  amount: number | null // null = pass
  interest: number // 0..1, for UI indicators
}

function noise(magnitude: number): number {
  return 1 + (Math.random() * 2 - 1) * magnitude
}

function difficultyNoise(d: AIDifficulty): number {
  switch (d) {
    case 'easy': return 0.5
    case 'medium': return 0.25
    case 'hard': return 0.12
    case 'expert': return 0.06
  }
}

function difficultySkipChance(d: AIDifficulty): number {
  switch (d) {
    case 'easy': return 0.35
    case 'medium': return 0.18
    case 'hard': return 0.08
    case 'expert': return 0.04
  }
}

export function buildContext(state: AuctionState, allPlayers: Record<string, Player>): AuctionContext {
  return {
    rules: state.config.rules,
    difficulty: state.config.aiDifficulty,
    upcomingPlayerIds: state.playerQueue,
    allPlayers,
    lotsProcessed: state.lotsProcessed,
    totalLots:
      state.lotsProcessed + state.playerQueue.length + (state.currentPlayerId ? 1 : 0),
  }
}

/**
 * Decide whether an AI team raises the current bid.
 * Returns null when the team passes.
 */
export function decideAIBid(
  state: AuctionState,
  team: Team,
  player: Player,
  allPlayers: Record<string, Player>,
): AIDecision {
  const ctx = buildContext(state, allPlayers)
  const squad = state.squads[team.id] ?? []
  const profile = buildNeedProfile(team, squad, ctx)

  if (profile.slotsLeft === 0) {
    return { teamId: team.id, amount: null, interest: 0 }
  }

  const valuation = valuePlayer(player, team, squad, profile, ctx)
  const d = ctx.difficulty

  // Easy AI sometimes doesn't even evaluate properly
  if (Math.random() < difficultySkipChance(d)) {
    return { teamId: team.id, amount: null, interest: Math.random() * 0.4 }
  }

  const noisyValuation = valuation * noise(difficultyNoise(d))
  const increment = ctx.rules.bidIncrement

  let interest = 0
  if (state.currentBidTeamId === null) {
    // Opening decision: bid base price if worth it
    interest = clampInterest(noisyValuation / Math.max(1, player.basePrice))
    if (noisyValuation >= player.basePrice && passesGutCheck(team, d)) {
      return { teamId: team.id, amount: player.basePrice, interest }
    }
    return { teamId: team.id, amount: null, interest: interest * 0.5 }
  }

  // Someone else holds the bid
  if (state.currentBidTeamId === team.id) {
    return { teamId: team.id, amount: null, interest } // never bid against self
  }

  const nextAmount = state.currentBid + increment
  interest = clampInterest(noisyValuation / Math.max(1, nextAmount))

  if (nextAmount > team.purse) {
    return { teamId: team.id, amount: null, interest: 0 }
  }

  // Expert strategic saving: if it's early and this isn't a priority role,
  // occasionally let rivals spend instead of driving prices up.
  if (d === 'expert' && interest > 1 && interest < 1.12 && Math.random() < 0.3) {
    return { teamId: team.id, amount: null, interest: interest - 0.1 }
  }

  // Raise only if the next amount is still below their valuation
  if (noisyValuation >= nextAmount && gutCheck(team, d)) {
    // Cap the raise at valuation-aware ceiling so they don't chase forever
    return { teamId: team.id, amount: nextAmount, interest }
  }

  return { teamId: team.id, amount: null, interest: Math.min(interest, 0.9) }
}

function passesGutCheck(_team: Team, _d: AIDifficulty): boolean {
  return true
}

function gutCheck(team: Team, d: AIDifficulty): boolean {
  // Easy teams are erratic; expert teams are composed
  const stability = d === 'easy' ? 0.55 : d === 'medium' ? 0.8 : d === 'hard' ? 0.92 : 0.97
  return Math.random() < stability + team.aiProfile.riskTolerance * 0.03
}

/** Compute silent interest levels of all AI teams (for UI indicators). */
export function computeInterests(
  state: AuctionState,
  player: Player,
  allPlayers: Record<string, Player>,
): Record<string, number> {
  const ctx = buildContext(state, allPlayers)
  const result: Record<string, number> = {}
  state.teams.forEach((team) => {
    if (team.controller !== 'ai') return
    const squad = state.squads[team.id] ?? []
    const profile = buildNeedProfile(team, squad, ctx)
    if (profile.slotsLeft === 0) {
      result[team.id] = 0
      return
    }
    const valuation = valuePlayer(player, team, squad, profile, ctx)
    const reference = state.currentBid > 0 ? state.currentBid : player.basePrice
    result[team.id] = clampInterest(valuation / Math.max(1, reference))
  })
  return result
}

function clampInterest(n: number): number {
  return Math.min(1, Math.max(0, n))
}
