import type { Player, SquadPlayer } from '../types'

export interface BestXIResult {
  xi: string[]
  bench: string[]
}

/**
 * Generates a balanced Best XI from a squad.
 * Constraints: exactly 11 players, max 4 overseas, >=1 wicketkeeper,
 * >=4 bowling options (fast/spin/all-rounder), sensible batting core.
 */
export function generateBestXI(
  squad: SquadPlayer[],
  players: Record<string, Player>,
): BestXIResult {
  const entries = squad
    .map((sp) => ({ sp, p: players[sp.playerId] }))
    .filter((e) => e.p !== undefined)
    .sort((a, b) => b.p.rating - a.p.rating)

  const xi: typeof entries = []
  let overseas = 0

  const isOverseas = (e: (typeof entries)[number]) => e.p.nationality !== 'India'
  const bowlCount = () =>
    xi.filter((e) => ['Fast Bowler', 'Spin Bowler', 'All-rounder'].includes(e.p.role)).length

  // Pass 1: mandatory slots
  const mandatory: Array<(e: (typeof entries)[number]) => boolean> = [
    (e) => e.p.role === 'Wicketkeeper',
    (e) => e.p.role === 'Fast Bowler',
    (e) => e.p.role === 'Fast Bowler' || e.p.role === 'Spin Bowler',
    (e) => e.p.role === 'Spin Bowler' || e.p.role === 'All-rounder',
    (e) => e.p.role === 'Batsman' || e.p.role === 'All-rounder' || e.p.role === 'Wicketkeeper',
    (e) => e.p.role === 'Batsman' || e.p.role === 'All-rounder' || e.p.role === 'Wicketkeeper',
  ]

  const pool = [...entries]
  for (const check of mandatory) {
    if (xi.length >= 11) break
    const idx = pool.findIndex((e) => {
      if (isOverseas(e) && overseas >= 4) return false
      return check(e)
    })
    if (idx >= 0) {
      const [picked] = pool.splice(idx, 1)
      if (isOverseas(picked)) overseas++
      xi.push(picked)
    }
  }

  // Pass 2: fill remaining with best available (respecting overseas cap,
  // ensure at least 4 bowling options overall)
  while (xi.length < 11 && pool.length > 0) {
    let idx = pool.findIndex((e) => !isOverseas(e) || overseas < 4)
    if (idx < 0) break
    // prefer bowlers until we have 4+ bowling options
    if (bowlCount() < 4) {
      const bowlerIdx = pool.findIndex(
        (e, i) => i >= idx && ['Fast Bowler', 'Spin Bowler', 'All-rounder'].includes(e.p.role),
      )
      if (bowlerIdx >= 0) idx = bowlerIdx
    }
    const [picked] = pool.splice(idx, 1)
    if (isOverseas(picked)) overseas++
    xi.push(picked)
  }

  xi.sort((a, b) => b.p.rating - a.p.rating)
  return {
    xi: xi.map((e) => e.sp.playerId),
    bench: pool.map((e) => e.sp.playerId),
  }
}

export function swapInXI(result: BestXIResult, outId: string, inId: string): BestXIResult {
  const xi = result.xi.filter((id) => id !== outId)
  const bench = result.bench.filter((id) => id !== inId)
  return { xi: [...xi, inId], bench: [...bench, outId] }
}
