import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type {
  AuctionState,
  Player,
} from '../types'
import {
  openNextLot,
  placeBid,
  sellCurrentPlayer,
  markUnsold,
  undoLastLot,
  undoLastBidInLot,
  finishAuction,
} from '../engine/auctionEngine'
import { decideAIBid } from '../ai/aiEngine'
import { useTimer } from './useTimer'
import { STORAGE_KEYS } from '../config/auctionRules'
import { writeLocalStorage } from './useLocalStorage'
import { playersById } from '../data/players'
import { sounds } from '../utils/sound'

export type OverlayKind = 'sold' | 'unsold' | null

export interface UseAuctionReturn {
  state: AuctionState
  allPlayers: Record<string, Player>
  currentPlayer: Player | null
  overlay: OverlayKind
  overlayData: { playerName: string; price: number; teamName: string; teamLogo?: string; teamColor: string } | null
  remaining: number
  paused: boolean
  timerEnabled: boolean
  start: () => void
  pause: () => void
  resume: () => void
  userBid: (teamId: string) => void
  nextBidForUser: number
  hammerNow: () => void
  skipLot: () => void
  undoLot: () => void
  undoBid: () => void
  interests: Record<string, number>
}

const AI_MIN_DELAY = 900
const AI_MAX_DELAY = 2600

export function useAuction(initialState: AuctionState): UseAuctionReturn {
  const [state, setState] = useState<AuctionState>(initialState)
  const [overlay, setOverlay] = useState<OverlayKind>(null)
  const [overlayData, setOverlayData] = useState<UseAuctionReturn['overlayData']>(null)
  const [paused, setPaused] = useState(false)
  const [interests, setInterests] = useState<Record<string, number>>({})
  const stateRef = useRef(state)
  stateRef.current = state

  const allPlayers = useMemo(() => playersById(), [])
  const currentPlayer = state.currentPlayerId ? allPlayers[state.currentPlayerId] ?? null : null

  // ---- persistence ----
  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.activeAuctionId, state.id)
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.auctions)
      const map = raw ? (JSON.parse(raw) as Record<string, AuctionState>) : {}
      map[state.id] = state
      // keep at most 5 saved auctions
      const entries = Object.entries(map).sort((a, b) => b[1].updatedAt - a[1].updatedAt)
      const trimmed = Object.fromEntries(entries.slice(0, 5))
      window.localStorage.setItem(STORAGE_KEYS.auctions, JSON.stringify(trimmed))
    } catch {
      // ignore quota errors
    }
  }, [state])

  // ---- timer ----
  const timerSeconds = state.config.rules.timerSeconds
  // Backwards compat: saved auctions from before the flag exist treat as enabled.
  const timerEnabled = state.config.rules.timerEnabled !== false

  const resolveLot = useCallback(() => {
    const s = stateRef.current
    if (s.status !== 'running' || !s.currentPlayerId) return
    if (s.currentBidTeamId) {
      const sold = sellCurrentPlayer(s)
      const team = sold.teams.find((t) => t.id === s.currentBidTeamId)
      setOverlayData({
        playerName: currentPlayerName(s),
        price: s.currentBid,
        teamName: team?.name ?? '',
        teamLogo: team?.logo,
        teamColor: team?.primaryColor ?? '#f5c542',
      })
      setOverlay('sold')
      setState(sold)
      sounds.sold()
    } else {
      const unsold = markUnsold(s)
      const p = s.currentPlayerId ? allPlayers[s.currentPlayerId] : null
      setOverlayData({
        playerName: currentPlayerName(s) || p?.name || '',
        price: p?.basePrice ?? 0,
        teamName: '',
        teamLogo: undefined,
        teamColor: '#64748b',
      })
      setOverlay('unsold')
      setState(unsold)
      sounds.unsold()
    }
  }, [allPlayers])

  const { remaining, reset } = useTimer(
    timerSeconds,
    timerEnabled && state.status === 'running' && !paused && !overlay,
    resolveLot,
  )

  // ---- advance to next lot after overlay ----
  useEffect(() => {
    if (!overlay) return
    const delay = overlay === 'sold' ? 2800 : 2000
    const t = window.setTimeout(() => {
      setOverlay(null)
      setState((prev) => {
        let next = openNextLot(prev)
        if (next.playerQueue.length === 0 && next.currentPlayerId && next.status === 'running') {
          // continue normally — last lot
        }
        if (next.playerQueue.length === 0 && !next.currentPlayerId) {
          next = finishAuction(next)
        }
        return next
      })
      reset()
    }, delay)
    return () => window.clearTimeout(t)
  }, [overlay, reset])

  // ---- open first lot when starting ----
  const start = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'idle') return prev
      return openNextLot(prev)
    })
    setPaused(false)
    reset()
    sounds.start()
  }, [reset])

  const pause = useCallback(() => setPaused(true), [])
  const resume = useCallback(() => setPaused(false), [])

  // ---- AI bidding loop ----
  useEffect(() => {
    if (state.status !== 'running' || paused || overlay || !state.currentPlayerId) return
    const player = allPlayers[state.currentPlayerId]
    if (!player) return

    const aiTeams = state.teams.filter(
      (t) => t.controller === 'ai' && (state.squads[t.id] ?? []).length < state.config.rules.maxSquadSize,
    )
    if (aiTeams.length === 0) return

    // Decide for each AI team whether it wants to raise
    const decisions = aiTeams
      .map((team) => decideAIBid(state, team, player, allPlayers))
      .filter((d): d is NonNullable<typeof d> => d.amount !== null)
      .sort((a, b) => b.amount! - a.amount!)

    // Update interest indicators regardless of bidding
    const interestMap: Record<string, number> = {}
    aiTeams.forEach((team) => {
      const dec = decisions.find((x) => x.teamId === team.id)
      if (dec) {
        interestMap[team.id] = dec.interest
      } else {
        const fallback = decideAIBid({ ...state, currentBidTeamId: null, currentBid: 0 }, team, player, allPlayers)
        interestMap[team.id] = fallback.amount !== null ? fallback.interest : fallback.interest
      }
    })
    setInterests(interestMap)

    if (decisions.length === 0) {
      // Spectator mode (no human teams) with no time limit: nothing left to
      // wait for, so settle the lot automatically.
      if (!timerEnabled && state.teams.every((t) => t.controller !== 'user')) {
        const t0 = window.setTimeout(() => resolveLot(), AI_MIN_DELAY)
        return () => window.clearTimeout(t0)
      }
      return
    }

    // Highest willing bidder raises after a human-feeling delay
    const winner = decisions[0]
    const delay = AI_MIN_DELAY + Math.random() * (AI_MAX_DELAY - AI_MIN_DELAY)
    const t = window.setTimeout(() => {
      setState((prev) => {
        if (prev.status !== 'running') return prev
        const result = placeBid(prev, winner.teamId, winner.amount!, allPlayers)
        if (result.ok && result.state) {
          sounds.bid()
          return result.state
        }
        return prev
      })
      reset()
    }, delay)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.currentPlayerId, state.currentBid, state.currentBidTeamId, paused, overlay, timerEnabled])

  // ---- timer warning sound ----
  const warnedRef = useRef(false)
  useEffect(() => {
    if (!timerEnabled) return
    if (remaining <= 3 && remaining > 0 && state.status === 'running' && !paused && !overlay) {
      if (!warnedRef.current) {
        warnedRef.current = true
        sounds.timerWarning()
      }
    }
    if (remaining > 3) warnedRef.current = false
  }, [remaining, state.status, paused, overlay, timerEnabled])

  // ---- user actions ----
  const nextBidForUser =
    state.currentBidTeamId === null && currentPlayer
      ? currentPlayer.basePrice
      : state.currentBid + state.config.rules.bidIncrement

  const userBid = useCallback(
    (teamId: string) => {
      setState((prev) => {
        if (prev.status !== 'running') return prev
        const minAmount =
          prev.currentBidTeamId === null
            ? (allPlayers[prev.currentPlayerId ?? '']?.basePrice ?? 0)
            : prev.currentBid + prev.config.rules.bidIncrement
        const result = placeBid(prev, teamId, minAmount, allPlayers)
        if (result.ok && result.state) {
          sounds.bid()
          return result.state
        }
        return prev
      })
      reset()
    },
    [allPlayers, reset],
  )

  const hammerNow = useCallback(() => {
    resolveLot()
  }, [resolveLot])

  const skipLot = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'running') return prev
      return markUnsold(prev)
    })
  }, [])

  const undoLot = useCallback(() => {
    setOverlay(null)
    setState((prev) => undoLastLot(prev))
    reset()
  }, [reset])

  const undoBid = useCallback(() => {
    setState((prev) => undoLastBidInLot(prev))
  }, [])

  return {
    state,
    allPlayers,
    currentPlayer,
    overlay,
    overlayData,
    remaining,
    paused,
    timerEnabled,
    start,
    pause,
    resume,
    userBid,
    nextBidForUser,
    hammerNow,
    skipLot,
    undoLot,
    undoBid,
    interests,
  }
}

function currentPlayerName(s: AuctionState): string {
  return s.bidsThisLot.at(-1)?.playerName ?? ''
}

