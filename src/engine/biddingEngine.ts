import type { AuctionRules } from '../types'

/** Next legal bid above the current amount */
export function nextBidAmount(currentBid: number | null, basePrice: number, rules: AuctionRules): number {
  if (currentBid === null || currentBid < basePrice) return basePrice
  return currentBid + rules.bidIncrement
}

export function isValidIncrement(currentBid: number, amount: number, basePrice: number, rules: AuctionRules): boolean {
  if (currentBid === null || currentBid < basePrice) {
    return amount >= basePrice
  }
  return amount === currentBid + rules.bidIncrement
}
