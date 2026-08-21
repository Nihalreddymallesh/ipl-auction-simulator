import type { AuctionConfig, AuctionState, Player, Team, AIDifficulty } from '../types'
import { IPL_PRESET_TEAMS, buildPresetTeams, presetTeamLogoPath } from './teams'
import { PLAYER_DATABASE, quickPool } from './players'
import { DEFAULT_RULES, QUICK_RULES } from '../config/auctionRules'
import { createAuction } from '../engine/auctionEngine'
import { uid } from '../utils/calculations'

function randomAIProfile() {
  const roles = ['Batsman', 'Wicketkeeper', 'All-rounder', 'Fast Bowler', 'Spin Bowler'] as const
  const shuffled = [...roles].sort(() => Math.random() - 0.5)
  return {
    aggressiveness: 0.3 + Math.random() * 0.55,
    riskTolerance: Math.random(),
    preferredRoles: shuffled.slice(0, 1 + Math.floor(Math.random() * 2)) as Team['aiProfile']['preferredRoles'],
  }
}

export function buildIPLPresetAuction(userTeamId: string | null): AuctionState {
  const teams = buildPresetTeams(userTeamId ?? pickRandomTeamId(), () => randomAIProfile())
  const config: AuctionConfig = {
    leagueName: 'IPL Preset League',
    rules: DEFAULT_RULES,
    aiDifficulty: 'hard',
  }
  return createAuction(config, teams, PLAYER_DATABASE)
}

export function buildQuickAuction(userTeamId: string | null): AuctionState {
  const pool = quickPool()
  const teamCount = 4
  const teams: Team[] = Array.from({ length: teamCount }, (_, i) => {
    const def = IPL_PRESET_TEAMS[i % IPL_PRESET_TEAMS.length]
    return {
      id: uid('team-'),
      name: def.name,
      shortName: def.shortName,
      logo: presetTeamLogoPath(def.id),
      primaryColor: def.primaryColor,
      secondaryColor: def.secondaryColor,
      budget: 6000,
      purse: 6000,
      controller: 'ai',
      aiProfile: randomAIProfile(),
    }
  })
  if (userTeamId) {
    const idx = teams.findIndex((t) => t.id === userTeamId)
    if (idx >= 0) teams[idx] = { ...teams[idx], controller: 'user' }
  } else {
    teams[0] = { ...teams[0], controller: 'user' }
  }
  const config: AuctionConfig = {
    leagueName: 'Quick Auction',
    rules: QUICK_RULES,
    aiDifficulty: 'medium',
  }
  return createAuction(config, teams, pool)
}

export function buildCustomAuction(
  leagueName: string,
  teams: Team[],
  rules: AuctionRulesLike,
  difficulty: AIDifficulty,
  pool: Player[],
): AuctionState {
  const config: AuctionConfig = {
    leagueName,
    rules,
    aiDifficulty: difficulty,
  }
  return createAuction(config, teams, pool)
}

type AuctionRulesLike = AuctionConfig['rules']

function pickRandomTeamId(): string {
  const ids = IPL_PRESET_TEAMS.map((t) => t.id)
  return ids[Math.floor(Math.random() * ids.length)]
}
