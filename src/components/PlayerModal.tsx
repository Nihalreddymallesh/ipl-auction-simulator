import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { Player } from '../types'
import PlayerImage from './PlayerImage'
import { formatLakh } from '../utils/currency'

interface Props {
  player: Player | null
  currentBid?: number | null
  bidTeamName?: string | null
  history?: Array<{ teamName: string; amount: number; timestamp: number }>
  onClose: () => void
}

export default function PlayerModal({ player, currentBid, bidTeamName, history = [], onClose }: Props) {
  return (
    <AnimatePresence>
      {player && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="card-premium scrollbar-thin relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6"
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-stadium-700 p-1.5 text-slate-300 transition hover:bg-stadium-600 hover:text-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex gap-5">
              <PlayerImage player={player} className="h-36 w-36 shrink-0" rounded="rounded-2xl" />
              <div className="min-w-0">
                <h2 className="pr-6 text-2xl font-black text-white">{player.name}</h2>
                <p className="mt-0.5 text-sm text-slate-400">
                  {player.nationality} · {player.role}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Tag>{player.battingStyle}</Tag>
                  {player.bowlingStyle !== 'None' && <Tag>{player.bowlingStyle}</Tag>}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Base Price</p>
                    <p className="font-bold text-gold-300">{formatLakh(player.basePrice)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Rating</p>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{player.rating}</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-stadium-700">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                          style={{ width: `${player.rating}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {currentBid !== undefined && currentBid !== null && currentBid > 0 && (
                  <div className="mt-3 rounded-lg bg-stadium-800 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Current Bid</p>
                    <p className="font-bold text-emerald-300">
                      {formatLakh(currentBid)}{' '}
                      {bidTeamName && <span className="text-xs font-normal text-slate-400">· {bidTeamName}</span>}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <h3 className="mt-5 text-xs font-black uppercase tracking-widest text-slate-400">Career Stats</h3>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              <Stat label="Matches" value={player.stats.matches} />
              <Stat label="Runs" value={player.stats.runs} />
              <Stat label="Average" value={player.stats.average} />
              <Stat label="Strike Rate" value={player.stats.strikeRate} />
              <Stat label="Fifties" value={player.stats.fifties} />
              <Stat label="Hundreds" value={player.stats.hundreds} />
              <Stat label="Wickets" value={player.stats.wickets} />
              <Stat label="Economy" value={player.stats.economy} />
              <Stat label="Bowl Avg" value={player.stats.bowlingAverage} />
              <Stat label="Best" value={player.stats.bestBowling} />
              <Stat label="Catches" value={player.stats.catches} />
            </div>

            {history.length > 0 && (
              <>
                <h3 className="mt-5 text-xs font-black uppercase tracking-widest text-slate-400">Bid History</h3>
                <div className="mt-2 space-y-1">
                  {history.map((h, i) => (
                    <div key={i} className="flex justify-between rounded bg-stadium-800/70 px-3 py-1.5 text-xs">
                      <span className="text-slate-300">{h.teamName}</span>
                      <span className="font-mono font-bold text-gold-300">{formatLakh(h.amount)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-stadium-700/80 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
      {children}
    </span>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-stadium-800/70 px-2 py-1.5 text-center">
      <p className="truncate font-mono text-sm font-bold text-white">{value}</p>
      <p className="text-[9px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  )
}
