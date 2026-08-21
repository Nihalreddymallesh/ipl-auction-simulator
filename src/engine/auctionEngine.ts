import type {
  AuctionState,
  AuctionConfig,
  Team,
  Player,
  BidRecord,
} from '../types'
import { DEFAULT_RULES } from '../config/auctionRules'
import { uid } from '../utils/calculations'
import { ROLE_ORDER } from '../config/auctionRules'

export function orderPlayers(
  players: Player[],
  order: 'role-based' | 'random' | 'rating-desc' | 'custom',
): string[] {
  const ids = players.map((p) => p.id)
  if (order === 'random') return shuffle(ids)
  if (order === 'rating-desc') {
    return [...players].sort((a, b) => b.rating - a.rating).map((p) => p.id)
  }
  if (order === 'custom') return ids
  // role-based: marquee (top-rated) first, then by role groups
  const marquee = [...players]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, Math.min(8, Math.ceil(players.length * 0.08)))
    .map((p) => p.id)
  const rest = players.filter((p) => !marquee.includes(p.id))
  const grouped: string[] = []
  ROLE_ORDER.forEach((role) => {
    const group = rest
      .filter((p) => p.role === role)
      .sort((a, b) => b.basePrice - a.basePrice)
      .map((p) => p.id)
    grouped.push(...group)
  })
  return [...marquee, ...grouped]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function createAuction(
  config: AuctionConfig,
  teams: Team[],
  playerPool: Player[],
): AuctionState {
  const now = Date.now()
  return {
    id: uid('auction-'),
    createdAt: now,
    updatedAt: now,
    status: 'idle',
    config: config ?? { leagueName: 'Custom League', rules: DEFAULT_RULES, aiDifficulty: 'medium' },
    teams: teams.map((t) => ({ ...t })),
    squads: Object.fromEntries(teams.map((t) => [t.id, []])),
    playerQueue: orderPlayers(playerPool, config?.rules?.playerOrder ?? 'role-based'),
    currentPlayerId: null,
    currentBid: 0,
    currentBidTeamId: null,
    bidsThisLot: [],
    history: [
      {
        id: uid('ev-'),
        type: 'auction-start',
        message: `Auction created with ${teams.length} teams and ${playerPool.length} players.`,
        timestamp: now,
      },
    ],
    soldPlayerIds: [],
    unsoldPlayerIds: [],
    lotsProcessed: 0,
  }
}

export function openNextLot(state: AuctionState): AuctionState {
  if (state.playerQueue.length === 0) {
    return finishAuction(state)
  }
  const [currentPlayerId, ...rest] = state.playerQueue
  return {
    ...state,
    status: 'running',
    playerQueue: rest,
    currentPlayerId,
    currentBid: 0,
    currentBidTeamId: null,
    bidsThisLot: [],
    updatedAt: Date.now(),
  }
}

export interface BidResult {
  ok: boolean
  reason?: string
  state?: AuctionState
}

export function placeBid(
  state: AuctionState,
  teamId: string,
  amount: number,
  players: Record<string, Player>,
): BidResult {
  if (state.status !== 'running') return { ok: false, reason: 'Auction is not active.' }
  if (!state.currentPlayerId) return { ok: false, reason: 'No player on the block.' }
  const team = state.teams.find((t) => t.id === teamId)
  if (!team) return { ok: false, reason: 'Unknown team.' }
  const squad = state.squads[teamId] ?? []
  const player = players[state.currentPlayerId]
  if (!player) return { ok: false, reason: 'Unknown player.' }

  // First bid must be at least base price; later bids must raise by increment
  const minAmount =
    state.currentBidTeamId === null ? player.basePrice : state.currentBid + state.config.rules.bidIncrement
  if (amount < minAmount) {
    return { ok: false, reason: `Minimum bid is ₹${minAmount} L.` }
  }
  if (amount > team.purse) {
    return { ok: false, reason: 'Bid exceeds remaining purse.' }
  }
  if (squad.length >= state.config.rules.maxSquadSize) {
    return { ok: false, reason: 'Squad is full.' }
  }

  const record: BidRecord = {
    teamId,
    teamName: team.name,
    amount,
    playerId: player.id,
    playerName: player.name,
    timestamp: Date.now(),
  }

  const nextState: AuctionState = {
    ...state,
    currentBid: amount,
    currentBidTeamId: teamId,
    bidsThisLot: [...state.bidsThisLot, record],
    history: [
      ...state.history,
      {
        id: uid('ev-'),
        type: 'bid',
        teamId,
        teamName: team.name,
        playerId: player.id,
        playerName: player.name,
        amount,
        message: `${team.name} bid ₹${amount} L for ${player.name}.`,
        timestamp: Date.now(),
      },
    ],
    updatedAt: Date.now(),
  }
  return { ok: true, state: nextState }
}

export function sellCurrentPlayer(state: AuctionState): AuctionState {
  if (!state.currentPlayerId || !state.currentBidTeamId) return state
  const team = state.teams.find((t) => t.id === state.currentBidTeamId)
  const playerId = state.currentPlayerId
  const price = state.currentBid
  if (!team) return state

  const squads = {
    ...state.squads,
    [team.id]: [
      ...(state.squads[team.id] ?? []),
      { playerId, price, soldAt: state.lotsProcessed },
    ],
  }
  const teams = state.teams.map((t) =>
    t.id === team.id ? { ...t, purse: t.purse - price } : t,
  )

  return {
    ...state,
    status: 'sold',
    teams,
    squads,
    soldPlayerIds: [...state.soldPlayerIds, playerId],
    lotsProcessed: state.lotsProcessed + 1,
    history: [
      ...state.history,
      {
        id: uid('ev-'),
        type: 'sold',
        teamId: team.id,
        teamName: team.name,
        playerId,
        playerName: state.bidsThisLot.at(-1)?.playerName ?? '',
        amount: price,
        message: `SOLD: ${state.bidsThisLot.at(-1)?.playerName ?? playerId} to ${team.name} for ₹${price} L.`,
        timestamp: Date.now(),
      },
    ],
    updatedAt: Date.now(),
  }
}

export function markUnsold(state: AuctionState): AuctionState {
  if (!state.currentPlayerId) return state
  const playerName = state.bidsThisLot.at(-1)?.playerName ?? ''
  return {
    ...state,
    status: 'unsold',
    unsoldPlayerIds: [...state.unsoldPlayerIds, state.currentPlayerId],
    lotsProcessed: state.lotsProcessed + 1,
    history: [
      ...state.history,
      {
        id: uid('ev-'),
        type: 'unsold',
        playerId: state.currentPlayerId,
        playerName,
        message: `UNSOLD: ${playerName} went unsold at base price.`,
        timestamp: Date.now(),
      },
    ],
    updatedAt: Date.now(),
  }
}

/** Undo the last completed lot (sold or unsold). Safe: restores purse/squad/history. */
export function undoLastLot(state: AuctionState): AuctionState {
  const lastEvent = [...state.history].reverse().find((e) => e.type === 'sold' || e.type === 'unsold')
  if (!lastEvent || !lastEvent.playerId) return state

  let nextState: AuctionState = { ...state }
  if (lastEvent.type === 'sold' && lastEvent.teamId && lastEvent.amount !== undefined) {
    const teamId = lastEvent.teamId
    nextState.squads = {
      ...nextState.squads,
      [teamId]: (nextState.squads[teamId] ?? []).filter(
        (sp) => sp.playerId !== lastEvent.playerId,
      ),
    }
    nextState.teams = nextState.teams.map((t) =>
      t.id === teamId ? { ...t, purse: t.purse + lastEvent.amount! } : t,
    )
    nextState.soldPlayerIds = nextState.soldPlayerIds.filter((id) => id !== lastEvent.playerId)
  } else if (lastEvent.type === 'unsold') {
    nextState.unsoldPlayerIds = nextState.unsoldPlayerIds.filter((id) => id !== lastEvent.playerId)
  }

  nextState.lotsProcessed = Math.max(0, nextState.lotsProcessed - 1)
  nextState.history = nextState.history.filter((e) => e.id !== lastEvent.id)
  nextState.playerQueue = [lastEvent.playerId, ...nextState.playerQueue]
  nextState.status = 'idle'
  nextState.currentPlayerId = null
  nextState.currentBid = 0
  nextState.currentBidTeamId = null
  nextState.bidsThisLot = []
  nextState.updatedAt = Date.now()
  return nextState
}

/** Undo just the last bid within an open lot (before hammer). */
export function undoLastBidInLot(state: AuctionState): AuctionState {
  if (state.status !== 'running' || state.bidsThisLot.length === 0) return state
  const bids = state.bidsThisLot.slice(0, -1)
  const prev = bids.at(-1)
  return {
    ...state,
    bidsThisLot: bids,
    currentBid: prev?.amount ?? 0,
    currentBidTeamId: prev?.teamId ?? null,
    updatedAt: Date.now(),
  }
}

export function finishAuction(state: AuctionState): AuctionState {
  return {
    ...state,
    status: 'completed',
    currentPlayerId: null,
    currentBid: 0,
    currentBidTeamId: null,
    updatedAt: Date.now(),
  }
}

export function isAuctionComplete(state: AuctionState): boolean {
  return state.playerQueue.length === 0 && state.currentPlayerId === null
}
