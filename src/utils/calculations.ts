import type { Player, Team, SquadPlayer, AuctionRules } from '../types'

export function teamSpent(squad: SquadPlayer[]): number {
  return squad.reduce((sum, p) => sum + p.price, 0)
}

export function averagePlayerPrice(squad: SquadPlayer[]): number {
  if (squad.length === 0) return 0
  return Math.round(teamSpent(squad) / squad.length)
}

export function squadRating(squad: SquadPlayer[], players: Record<string, Player>): number {
  if (squad.length === 0) return 0
  const total = squad.reduce((sum, p) => sum + (players[p.playerId]?.rating ?? 50), 0)
  return Math.round(total / squad.length)
}

export function overseasCount(
  squad: SquadPlayer[],
  players: Record<string, Player>,
): number {
  return squad.filter((p) => players[p.playerId]?.nationality !== 'India').length
}

export function roleDistribution(
  squad: SquadPlayer[],
  players: Record<string, Player>,
): Record<string, number> {
  const dist: Record<string, number> = {}
  squad.forEach((sp) => {
    const role = players[sp.playerId]?.role ?? 'Unknown'
    dist[role] = (dist[role] ?? 0) + 1
  })
  return dist
}

export function battingStrength(
  squad: SquadPlayer[],
  players: Record<string, Player>,
): number {
  if (squad.length === 0) return 0
  const batters = squad.filter((sp) => {
    const p = players[sp.playerId]
    if (!p) return false
    return (
      p.role === 'Batsman' ||
      p.role === 'Wicketkeeper' ||
      p.role === 'All-rounder' ||
      p.stats.runs > 2000
    )
  })
  if (batters.length === 0) return 0
  const weighted = batters.reduce((sum, sp) => {
    const p = players[sp.playerId]
    const batScore = p ? p.rating * 0.6 + Math.min(40, p.stats.average * 0.8) : 50
    return sum + batScore
  }, 0)
  return Math.round(weighted / batters.length)
}

export function bowlingStrength(
  squad: SquadPlayer[],
  players: Record<string, Player>,
): number {
  if (squad.length === 0) return 0
  const bowlers = squad.filter((sp) => {
    const p = players[sp.playerId]
    if (!p) return false
    return (
      p.role === 'Fast Bowler' ||
      p.role === 'Spin Bowler' ||
      p.role === 'All-rounder'
    )
  })
  if (bowlers.length === 0) return 0
  const weighted = bowlers.reduce((sum, sp) => {
    const p = players[sp.playerId]
    const bowlScore = p
      ? p.rating * 0.6 +
        Math.max(0, Math.min(40, (p.stats.wickets / Math.max(1, p.stats.matches)) * 30))
      : 50
    return sum + bowlScore
  }, 0)
  return Math.round(weighted / bowlers.length)
}

export function allrounderStrength(
  squad: SquadPlayer[],
  players: Record<string, Player>,
): number {
  const allrounders = squad.filter((sp) => players[sp.playerId]?.role === 'All-rounder')
  if (allrounders.length === 0) return 0
  return Math.round(
    allrounders.reduce((s, sp) => s + (players[sp.playerId]?.rating ?? 50), 0) /
      allrounders.length,
  )
}

export interface TeamScorecard {
  ratingScore: number // 0-100
  balanceScore: number // 0-100
  valueScore: number // 0-100
  purseScore: number // 0-100
  overall: number // 0-100
}

export function scoreTeam(
  team: Team,
  squad: SquadPlayer[],
  players: Record<string, Player>,
  rules: AuctionRules,
): TeamScorecard {
  const rating = squadRating(squad, players)
  const ratingScore = clamp(((rating - 55) / 25) * 100, 0, 100)

  const dist = roleDistribution(squad, players)
  const ideal: Record<string, number> = {
    Batsman: rules.maxSquadSize * 0.24,
    Wicketkeeper: rules.maxSquadSize * 0.12,
    'All-rounder': rules.maxSquadSize * 0.2,
    'Fast Bowler': rules.maxSquadSize * 0.26,
    'Spin Bowler': rules.maxSquadSize * 0.18,
  }
  let balancePenalty = 0
  Object.keys(ideal).forEach((role) => {
    const expected = ideal[role]
    const actual = dist[role] ?? 0
    balancePenalty += Math.abs(actual - expected) / expected
  })
  const balanceScore = clamp(100 - balancePenalty * 18, 0, 100)

  const spent = teamSpent(squad)
  const avgRating = rating || 60
  const valuePerPoint = spent > 0 ? spent / avgRating : 0
  const bestValuePerPoint = 0.9 // ~90L per rating point is excellent
  const valueScore =
    spent === 0 ? 50 : clamp(100 - ((valuePerPoint - bestValuePerPoint) / bestValuePerPoint) * 80, 0, 100)

  const purseRatio = team.purse / team.budget
  const purseScore = clamp(purseRatio * 130, 0, 100)

  const overall = Math.round(
    ratingScore * 0.4 + balanceScore * 0.2 + valueScore * 0.2 + purseScore * 0.2,
  )

  return { ratingScore, balanceScore, valueScore, purseScore, overall }
}

export function rankTeams(
  teams: Team[],
  squads: Record<string, SquadPlayer[]>,
  players: Record<string, Player>,
  rules: AuctionRules,
): Array<{ team: Team; score: TeamScorecard; rank: number }> {
  const scored = teams.map((team) => ({
    team,
    score: scoreTeam(team, squads[team.id] ?? [], players, rules),
  }))
  scored.sort((a, b) => b.score.overall - a.score.overall)
  return scored.map((entry, i) => ({ ...entry, rank: i + 1 }))
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function uid(prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`
}
