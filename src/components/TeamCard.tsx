import { motion } from 'framer-motion'
import type { Team } from '../types'
import TeamLogo from './TeamLogo'
import PurseBar from './PurseBar'
import { formatLakh } from '../utils/currency'

interface Props {
  team: Team
  squadCount: number
  maxSquad: number
  isHighestBidder: boolean
  leadingAmount?: number
  interest?: number
  onSelectToBid?: (teamId: string) => void
  canBidNow: boolean
}

export default function TeamCard({
  team,
  squadCount,
  maxSquad,
  isHighestBidder,
  leadingAmount,
  interest = 0,
}: Props) {
  return (
    <motion.div
      layout
      className={`card-premium relative overflow-hidden rounded-xl p-3 transition-all ${
        isHighestBidder ? 'ring-2' : ''
      }`}
      style={{ '--tw-ring-color': team.primaryColor } as React.CSSProperties}
    >
      {isHighestBidder && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0.25 }}
          animate={{ opacity: [0.08, 0.2, 0.08] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          style={{ background: `linear-gradient(120deg, ${team.primaryColor}33, transparent)` }}
        />
      )}
      <div className="relative flex items-center gap-2.5">
        <TeamLogo team={team} size={38} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-bold text-slate-100">{team.name}</p>
            {team.controller === 'user' && (
              <span className="rounded bg-gold-400/20 px-1 text-[9px] font-black uppercase tracking-wider text-gold-300">
                You
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            Squad {squadCount}/{maxSquad}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-bold text-emerald-300">{formatLakh(team.purse)}</p>
          {isHighestBidder && leadingAmount !== undefined && (
            <motion.p
              key={leadingAmount}
              initial={{ scale: 1.3, color: '#f5c542' }}
              animate={{ scale: 1, color: '#fbbf24' }}
              className="font-mono text-[11px] font-bold"
            >
              ▲ {formatLakh(leadingAmount)}
            </motion.p>
          )}
        </div>
      </div>

      {/* live interest indicator for AI teams */}
      {!isHighestBidder && interest > 0 && (
        <div className="relative mt-2 flex items-center gap-1.5">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-stadium-700">
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${Math.round(interest * 100)}%` }}
              transition={{ duration: 0.5 }}
              style={{ background: team.primaryColor }}
            />
          </div>
          <span className="text-[9px] uppercase tracking-wider text-slate-500">interest</span>
        </div>
      )}

      <div className="relative mt-2">
        <PurseBar team={team} compact />
      </div>
    </motion.div>
  )
}
