import type { AuctionRules, AIDifficulty } from '../types'

export const DEFAULT_RULES: AuctionRules = {
  bidIncrement: 20, // ₹20 lakh
  timerSeconds: 10,
  timerEnabled: true,
  maxSquadSize: 18,
  minSquadSize: 12,
  maxOverseasPlayers: 8,
  playerOrder: 'role-based',
  currencyUnit: 'lakh',
}

export const QUICK_RULES: AuctionRules = {
  bidIncrement: 25,
  timerSeconds: 8,
  timerEnabled: true,
  maxSquadSize: 11,
  minSquadSize: 9,
  maxOverseasPlayers: 5,
  playerOrder: 'random',
  currencyUnit: 'lakh',
}

export const AI_DIFFICULTY_LABELS: Record<AIDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
}

export const AI_DIFFICULTY_DESCRIPTIONS: Record<AIDifficulty, string> = {
  easy: 'Basic bidding with randomness. Misses opportunities.',
  medium: 'Considers team needs and remaining purse.',
  hard: 'Values players accurately and fights for needs.',
  expert: 'Tracks scarcity, opponents, auction stage and saves purse strategically.',
}

export const ROLE_ORDER: string[] = [
  'Batsman',
  'Wicketkeeper',
  'All-rounder',
  'Fast Bowler',
  'Spin Bowler',
]

export const BASE_PRICE_SLABS = [50, 75, 100, 150, 200] // lakh

export const MAX_TEAMS = 20
export const MIN_TEAMS = 2

export const STORAGE_KEYS = {
  auctions: 'ipl-auction-simulator/auctions',
  activeAuctionId: 'ipl-auction-simulator/active-auction-id',
  muted: 'ipl-auction-simulator/muted',
} as const
