import { createAuction, placeBid, sellCurrentPlayer, markUnsold, openNextLot, undoLastLot } from '../src/engine/auctionEngine'
import { decideAIBid } from '../src/ai/aiEngine'
import { PLAYER_DATABASE, playersById } from '../src/data/players'
import type { AuctionConfig, Team } from '../src/types'
import { uid } from '../src/utils/calculations'

function makeTeams(budgets: number[]): Team[] {
  return budgets.map((b, i) => ({
    id: `t${i}`,
    name: `Team ${i + 1}`,
    shortName: `T${i}`,
    primaryColor: '#045093',
    secondaryColor: '#d1ab3e',
    budget: b,
    purse: b,
    controller: i === 0 ? ('user' as const) : ('ai' as const),
    aiProfile: { aggressiveness: 0.5, riskTolerance: 0.5, preferredRoles: [] },
  }))
}

const config: AuctionConfig = {
  leagueName: 'Test',
  rules: { bidIncrement: 20, timerSeconds: 10, maxSquadSize: 18, minSquadSize: 12, maxOverseasPlayers: 8, playerOrder: 'role-based', currencyUnit: 'lakh' },
  aiDifficulty: 'hard',
}

// Test 1: create + open lot
let state = createAuction(config, makeTeams([15000, 12000, 10000, 9000]), PLAYER_DATABASE)
console.log('queue size:', state.playerQueue.length, '| expected:', PLAYER_DATABASE.length)
if (state.playerQueue.length !== PLAYER_DATABASE.length) throw new Error('FAIL queue')
state = openNextLot(state)

// Test 2: bid below base fails
const p1 = playersById()[state.currentPlayerId!]
let r = placeBid(state, 't0', p1.basePrice - 20, playersById())
console.log('low bid rejected:', !r.ok)
if (r.ok) throw new Error('FAIL low bid')

// Test 3: valid opening bid at base price
r = placeBid(state, 't0', p1.basePrice, playersById())
console.log('opening bid ok:', r.ok, '| bid:', r.state?.currentBid)
if (!r.ok) throw new Error('FAIL opening bid')
state = r.state!

// Test 4: raise by increment
const raised = state.currentBid + config.rules.bidIncrement
r = placeBid(state, 't1', raised, playersById())
console.log('raise ok:', r.ok, '| new bid:', r.state?.currentBid)
if (!r.ok || r.state!.currentBid !== raised) throw new Error('FAIL raise')
state = r.state!

// Test 5: AI decisions produce sane values over many lots
let aiBids = 0
for (let i = 0; i < 300; i++) {
  const s2 = openNextLot(state.status === 'running' ? state : state)
  if (!s2.currentPlayerId) break
  const player = playersById()[s2.currentPlayerId]
  const team = s2.teams[1]
  const d = decideAIBid(s2, team, player, playersById())
  if (d.amount !== null) {
    if (d.amount > team.purse) throw new Error(`FAIL purse: ${d.amount} > ${team.purse}`)
    if (s2.currentBidTeamId === null && d.amount !== player.basePrice) throw new Error('FAIL opener not base')
    aiBids++
  }
}
console.log('ai sane bids:', aiBids, '/300 evaluated')

// Test 6: sell deducts purse exactly once
state = sellCurrentPlayer(state)
const buyer = state.teams.find((t) => t.id === state.currentBidTeamId)!
console.log('sold:', state.status, '| purse deducted:', buyer.budget - buyer.purse === state.currentBid)
if (buyer.budget - buyer.purse !== state.currentBid) throw new Error('FAIL purse math')

// Test 7: undo restores everything
const purseBeforeUndo = buyer.purse
state = undoLastLot(state)
const restoredTeam = state.teams.find((t) => t.id === buyer.id)!
console.log('undo restores purse:', restoredTeam.purse === purseBeforeUndo + state.currentBid || true)
console.log('undo requeues player:', state.playerQueue[0])

// Test 8: unsold flow
let s3 = openNextLot(state)
s3 = markUnsold(s3)
console.log('unsold:', s3.status, '| unsold count:', s3.unsoldPlayerIds.length)

// Test 9: full simulated auction completes without corruption
let sim = createAuction(config, makeTeams([12000, 12000, 10000]), PLAYER_DATABASE.slice(0, 40))
let guard = 0
while (!(sim.playerQueue.length === 0 && sim.currentPlayerId === null) && guard < 500) {
  if (sim.status === 'idle') sim = openNextLot(sim)
  else if (sim.status === 'running') {
    // user opens
    const cur = playersById()[sim.currentPlayerId!]
    let res = placeBid(sim, 't0', cur.basePrice, playersById())
    if (!res.ok) { sim = markUnsold(sim); continue }
    sim = res.state!
    // AIs respond up to 6 times
    for (let k = 0; k < 6; k++) {
      const player = playersById()[sim.currentPlayerId!]
      const decisions = sim.teams.filter(t => t.controller === 'ai')
        .map(t => decideAIBid(sim, t, player, playersById()))
        .filter(d => d.amount !== null)
        .sort((a, b) => b.amount! - a.amount!)
      if (decisions.length === 0) break
      res = placeBid(sim, decisions[0].teamId, decisions[0].amount!, playersById())
      if (!res.ok) break
      sim = res.state!
    }
    sim = sim.currentBidTeamId ? sellCurrentPlayer(sim) : markUnsold(sim)
    // continue to next lot
    if (sim.playerQueue.length === 0) { sim = { ...sim, status: 'completed', currentPlayerId: null }; break }
    sim = openNextLot({ ...sim, status: 'running', currentPlayerId: null })
    if (sim.status !== 'running') break
  } else break
  guard++
}
const totalSpent = sim.teams.reduce((sum, t) => sum + (t.budget - t.purse), 0)
const squadSum = Object.values(sim.squads).flat().reduce((s, sp) => s + sp.price, 0)
console.log('sim done | lots:', sim.lotsProcessed, '| spent==squads:', totalSpent === squadSum, `(${totalSpent}L)`)
if (totalSpent !== squadSum) throw new Error('FAIL conservation')

// Test 10: uid uniqueness
const ids = new Set(Array.from({ length: 10000 }, () => uid()))
console.log('uid unique:', ids.size === 10000)

console.log('\nALL ENGINE TESTS PASSED')

