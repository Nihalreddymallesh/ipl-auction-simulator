import type { Team } from '../types'
import { formatLakh } from '../utils/currency'

interface Props {
  team: Team
  compact?: boolean
}

export default function PurseBar({ team, compact = false }: Props) {
  const pct = Math.max(0, Math.min(100, (team.purse / team.budget) * 100))
  const spentPct = 100 - pct
  return (
    <div className="w-full">
      {!compact && (
        <div className="mb-1 flex items-baseline justify-between text-xs">
          <span className="text-slate-400">Remaining</span>
          <span className="font-bold text-emerald-300">{formatLakh(team.purse)}</span>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-stadium-700 ${compact ? 'h-1.5' : 'h-2.5'}`}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${team.primaryColor}, ${team.secondaryColor})`,
          }}
        />
      </div>
      {compact && (
        <div className="mt-0.5 text-right text-[10px] text-slate-500">
          {formatLakh(team.purse)} left
        </div>
      )}
      {!compact && (
        <div className="mt-1 flex justify-between text-[10px] text-slate-500">
          <span>Spent {formatLakh(spentPct / 100 * team.budget)}</span>
          <span>Budget {formatLakh(team.budget)}</span>
        </div>
      )}
    </div>
  )
}
