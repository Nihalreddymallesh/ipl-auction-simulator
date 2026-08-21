import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Zap, Settings2, BookOpen, Trophy, X } from 'lucide-react'
import type { SavedAuctionMeta } from '../types'
import { readLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../config/auctionRules'
import type { AuctionState } from '../types'

interface Props {
  onIPLPreset: () => void
  onQuickAuction: () => void
  onCustomAuction: () => void
  onResume: (auction: AuctionState) => void
}

export default function Home({ onIPLPreset, onQuickAuction, onCustomAuction, onResume }: Props) {
  const [showHow, setShowHow] = useState(false)
  const saved = getSavedAuctions()

  return (
    <div className="stadium-bg pitch-lines min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2 text-gold-400">
            <Trophy size={28} />
            <span className="text-xs font-black uppercase tracking-[0.35em]">Fan-Made Simulator</span>
          </div>
          <h1 className="font-display text-6xl font-black leading-none tracking-tight text-white sm:text-7xl md:text-8xl">
            IPL AUCTION
            <span className="text-glow-gold block text-gold-400">SIMULATOR</span>
          </h1>
          <p className="mt-4 text-lg font-medium text-slate-300 sm:text-xl">
            Build your team. Manage your purse. Win the auction.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 grid w-full max-w-2xl gap-3 sm:grid-cols-2"
        >
          <ActionButton
            icon={<Play size={20} />}
            title="IPL Preset"
            subtitle="10 franchises · full player pool"
            onClick={onIPLPreset}
            accent="#f5c542"
          />
          <ActionButton
            icon={<Zap size={20} />}
            title="Quick Auction"
            subtitle="Smaller pool · faster timer"
            onClick={onQuickAuction}
            accent="#34d399"
          />
          <ActionButton
            icon={<Settings2 size={20} />}
            title="Custom Auction"
            subtitle="Your teams, budgets & rules"
            onClick={onCustomAuction}
            accent="#60a5fa"
          />
          <ActionButton
            icon={<BookOpen size={20} />}
            title="How It Works"
            subtitle="Rules, bidding & AI explained"
            onClick={() => setShowHow(true)}
            accent="#a78bfa"
          />
        </motion.div>

        {saved.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="card-premium mt-8 w-full max-w-2xl rounded-xl p-4"
          >
            <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">
              Continue Auction
            </h3>
            <div className="space-y-1.5">
              {saved.map((meta) => (
                <button
                  key={meta.id}
                  onClick={() => {
                    const raw = readLocalStorage<Record<string, AuctionState>>(STORAGE_KEYS.auctions)
                    const found = raw?.[meta.id]
                    if (found) onResume(found)
                  }}
                  className="flex w-full items-center justify-between rounded-lg bg-stadium-800/70 px-3 py-2 text-left transition hover:bg-stadium-700"
                >
                  <span className="text-sm font-semibold text-slate-200">{meta.leagueName}</span>
                  <span className="text-xs text-slate-500">
                    {meta.teamsCount} teams · {meta.lotsProcessed} lots ·{' '}
                    {new Date(meta.savedAt).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <p className="mt-10 text-center text-[11px] uppercase tracking-widest text-slate-600">
          Unofficial Fan-Made IPL Auction Simulator · Not affiliated with the IPL, BCCI or any franchise
        </p>
      </div>

      {showHow && <HowItWorksModal onClose={() => setShowHow(false)} />}
    </div>
  )
}

function ActionButton({
  icon,
  title,
  subtitle,
  onClick,
  accent,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  onClick: () => void
  accent: string
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="card-premium group flex items-center gap-4 rounded-xl p-5 text-left transition-colors"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-stadium-950"
        style={{ background: accent }}
      >
        {icon}
      </span>
      <span>
        <span className="block text-base font-bold text-white">{title}</span>
        <span className="block text-xs text-slate-400">{subtitle}</span>
      </span>
    </motion.button>
  )
}

function HowItWorksModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card-premium scrollbar-thin max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-3xl font-black text-white">How It Works</h2>
          <button onClick={onClose} className="rounded-full bg-stadium-700 p-1.5 text-slate-300 hover:text-white" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <ol className="space-y-3 text-sm leading-relaxed text-slate-300">
          <Step n={1} title="Pick a mode">
            Use the IPL preset with 10 franchises and a full player pool, run a quick auction, or build a fully custom league with any number of teams (2–20) and independent budgets.
          </Step>
          <Step n={2} title="Configure teams">
            Name your teams, set individual purses, upload logos or pick colors, and choose which team you control — every other team is managed by AI.
          </Step>
          <Step n={3} title="Bid live">
            Players come to the block one at a time. Open at base price, raise by the bid increment, and watch the countdown. Every new bid resets the clock.
          </Step>
          <Step n={4} title="Beat the AI">
            AI teams evaluate squad needs, purse position, role gaps, overseas limits, player scarcity and auction stage before bidding. Four difficulty levels change how sharp they are.
          </Step>
          <Step n={5} title="Hammer & results">
            When the timer hits zero the player is SOLD to the highest bidder or goes UNSOLD. After the last lot, review squads, Best XI, analytics and the final leaderboard.
          </Step>
        </ol>
        <p className="mt-5 rounded-lg bg-stadium-800 p-3 text-xs text-slate-400">
          Squad rules are enforced automatically: maximum squad size, minimum squad size and overseas limits. Teams can never bid more than their remaining purse.
        </p>
      </div>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-400/15 text-xs font-black text-gold-400">
        {n}
      </span>
      <span>
        <strong className="text-white">{title}. </strong>
        {children}
      </span>
    </li>
  )
}

function getSavedAuctions(): SavedAuctionMeta[] {
  const raw = readLocalStorage<Record<string, AuctionState>>(STORAGE_KEYS.auctions)
  if (!raw) return []
  return Object.values(raw)
    .map((a) => ({
      id: a.id,
      leagueName: a.config?.leagueName ?? 'Auction',
      savedAt: a.updatedAt,
      teamsCount: a.teams.length,
      lotsProcessed: a.lotsProcessed,
      status: a.status,
    }))
    .sort((x, y) => y.savedAt - x.savedAt)
    .slice(0, 5)
}
