import { motion, AnimatePresence } from 'framer-motion'
import type { AuctionEvent } from '../types'
import { formatLakh } from '../utils/currency'

interface Props {
  events: AuctionEvent[]
  teamLogos: Record<string, string | undefined>
  teamColors: Record<string, string>
}

export default function BidHistory({ events, teamLogos, teamColors }: Props) {
  const recent = [...events].reverse().slice(0, 40)
  return (
    <div className="card-premium flex h-full flex-col rounded-xl">
      <div className="border-b border-slate-700/50 px-4 py-2.5">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Auction Feed</h3>
      </div>
      <div className="scrollbar-thin max-h-56 flex-1 space-y-1.5 overflow-y-auto p-3 lg:max-h-none">
        <AnimatePresence initial={false}>
          {recent.map((ev) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-lg bg-stadium-800/60 px-2.5 py-1.5 text-xs"
            >
              {ev.teamId ? (
                <img
                  src={teamLogos[ev.teamId]}
                  alt=""
                  className="h-5 w-5 rounded-full object-contain"
                  onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
                />
              ) : (
                <span
                  className="h-5 w-5 shrink-0 rounded-full"
                  style={{
                    background:
                      ev.type === 'sold' ? '#22c55e' : ev.type === 'unsold' ? '#64748b' : '#334155',
                  }}
                />
              )}
              <span className="min-w-0 flex-1 truncate text-slate-300">
                {ev.type === 'bid' && (
                  <>
                    <span className="font-semibold" style={{ color: teamColors[ev.teamId ?? ''] ?? '#fff' }}>
                      {ev.teamName}
                    </span>{' '}
                    → {ev.playerName} · {formatLakh(ev.amount ?? 0)}
                  </>
                )}
                {ev.type === 'sold' && (
                  <span className="font-semibold text-emerald-300">
                    SOLD · {ev.playerName} → {ev.teamName} · {formatLakh(ev.amount ?? 0)}
                  </span>
                )}
                {ev.type === 'unsold' && (
                  <span className="text-slate-400">UNSOLD · {ev.playerName}</span>
                )}
                {(ev.type === 'auction-start' || ev.type === 'set-aside') && (
                  <span className="text-slate-500">{ev.message}</span>
                )}
              </span>
              <span className="shrink-0 text-[10px] text-slate-600">
                {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {recent.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-600">No activity yet.</p>
        )}
      </div>
    </div>
  )
}
