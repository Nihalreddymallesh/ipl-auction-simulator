export type PlayerRole =
  | 'Batsman'
  | 'Wicketkeeper'
  | 'All-rounder'
  | 'Fast Bowler'
  | 'Spin Bowler'

export type BattingStyle = 'Right-handed' | 'Left-handed'
export type BowlingStyle =
  | 'None'
  | 'Right-arm fast'
  | 'Right-arm medium'
  | 'Left-arm fast'
  | 'Left-arm medium'
  | 'Off break'
  | 'Leg break'
  | 'Left-arm orthodox'
  | 'Chinaman'

export interface PlayerStats {
  matches: number
  runs: number
  average: number
  strikeRate: number
  fifties: number
  hundreds: number
  wickets: number
  economy: number
  bowlingAverage: number
  bestBowling: string
  catches: number
}

export interface Player {
  id: string
  name: string
  nationality: string
  role: PlayerRole
  battingStyle: BattingStyle
  bowlingStyle: BowlingStyle
  basePrice: number // in lakh (100 lakh = 1 Cr)
  rating: number // 40 - 99
  image?: string
  stats: PlayerStats
  custom?: boolean
}

export interface Team {
  id: string
  name: string
  shortName: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  budget: number // starting purse in lakh
  purse: number // remaining purse in lakh
  controller: 'user' | 'ai'
  aiProfile: AIProfile
}

export interface AIProfile {
  aggressiveness: number // 0-1
  riskTolerance: number // 0-1
  preferredRoles: PlayerRole[]
}

export interface SquadPlayer {
  playerId: string
  price: number
  soldAt: number // auction order index
}

export type AuctionStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'sold'
  | 'unsold'
  | 'completed'

export interface BidRecord {
  teamId: string
  teamName: string
  amount: number
  playerId: string
  playerName: string
  timestamp: number
}

export type HistoryEventType =
  | 'bid'
  | 'sold'
  | 'unsold'
  | 'auction-start'
  | 'set-aside'

export interface AuctionEvent {
  id: string
  type: HistoryEventType
  teamId?: string
  teamName?: string
  playerId?: string
  playerName?: string
  amount?: number
  message: string
  timestamp: number
}

export interface AuctionRules {
  bidIncrement: number // lakh
  timerSeconds: number
  /** When false, lots have no countdown — resolve manually with Hammer / Pass */
  timerEnabled: boolean
  maxSquadSize: number
  minSquadSize: number
  maxOverseasPlayers: number
  playerOrder: 'role-based' | 'random' | 'rating-desc' | 'custom'
  currencyUnit: 'lakh'
}

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'expert'

export interface AuctionConfig {
  leagueName: string
  rules: AuctionRules
  aiDifficulty: AIDifficulty
}

export interface AuctionState {
  id: string
  createdAt: number
  updatedAt: number
  status: AuctionStatus
  config: AuctionConfig
  teams: Team[]
  squads: Record<string, SquadPlayer[]> // teamId -> players
  playerQueue: string[] // ordered player ids remaining
  currentPlayerId: string | null
  currentBid: number // lakh; equals base price when opened
  currentBidTeamId: string | null
  bidsThisLot: BidRecord[]
  history: AuctionEvent[]
  soldPlayerIds: string[]
  unsoldPlayerIds: string[]
  lotsProcessed: number
}

export interface SavedAuctionMeta {
  id: string
  leagueName: string
  savedAt: number
  teamsCount: number
  lotsProcessed: number
  status: AuctionStatus
}
