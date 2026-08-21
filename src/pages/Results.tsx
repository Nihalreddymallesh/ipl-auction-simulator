import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Repeat, Trophy, ChevronDown } from 'lucide-react'
import type { AuctionState } from '../types'
import { formatLakh } from '../utils/currency'
import {
  teamSpent, averagePlayerPrice, overseasCount, roleDistribution,
  rankTeams,
} from '../utils/calculations'
import { generateBestXI, swapInXI } from '../engine/bestXI'
import { playersById } from '../data/players'
import TeamLogo from '../components/TeamLogo'
import PlayerImage from '../components/PlayerImage'

interface Props {
  state: AuctionState
  onBack: () => void
  onViewAnalytics: () => void
}

export default function Results({ state, onBack, onViewAnalytics }: Props) {
  const playersMap = useMemo(() => playersById(), [])
  const rankings = useMemo(
    () => rankTeams(state.teams, state.squads, playersMap, state.config.rules),
    [state, playersMap],
  )
  const [openTeam, setOpenTeam] = useState<string | null>(rankings[0]?.team.id ?? null)
  const [swapSource, setSwapSource] = useState<{ teamId: string; playerId: string } | null>(null)
  const [bestXIs, setBestXIs] = useState<Record<string, { xi: string[]; bench: string[] }>>(() =>
    Object.fromEntries(
      state.teams.map((t) => [t.id, generateBestXI(state.squads[t.id] ?? [], playersMap)]),
    ),
  )

  function selectForSwap(teamId: string, playerId: string) {
    if (swapSource && swapSource.teamId === teamId && swapSource.playerId !== playerId) {
      setBestXIs((prev) => ({
        ...prev,
        [teamId]: swapInXI(prev[teamId], swapSource.playerId, playerId),
      }))
      setSwapSource(null)
    } else {
      setSwapSource(swapSource?.playerId === playerId ? null : { teamId, playerId })
    }
  }

  return (
    <div className="stadium-bg min-h-screen pb-16">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-stadium-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="font-display text-xl font-black tracking-wide text-white sm:text-2xl">
            AUCTION <span className="text-gold-400">RESULTS</span>
          </h1>
          <button onClick={onViewAnalytics} className="rounded-lg bg-stadium-800 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-stadium-700">
            Analytics →
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        <section className="card-premium overflow-hidden rounded-xl">
          <div className="flex items-center gap-2 border-b border-slate-700/50 px-4 py-3">
            <Trophy size={18} className="text-gold-400" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-300">Leaderboard</h2>
            <span className="ml-auto hidden text-[10px] uppercase tracking-wider text-slate-500 sm:block">
              rating · balance · value · purse
            </span>
          </div>
          <div className="divide-y divide-slate-800/60">
            {rankings.map(({ team, score, rank }) => (
              <button key={team.id} onClick={() => setOpenTeam(openTeam === team.id ? null : team.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-stadium-800/50">
                <span className={`w-8 text-center font-display text-xl font-black ${
                  rank === 1 ? 'text-gold-400' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-amber-600' : 'text-slate-600'
                }`}>
                  {rank}
                </span>
                <TeamLogo team={team} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{team.name}</p>
                  <div className="mt-1 flex h-1.5 gap-0.5">
                    <Seg value={score.ratingScore} color="#34d399" />
                    <Seg value={score.balanceScore} color="#60a5fa" />
                    <Seg value={score.valueScore} color="#f5c542" />
                    <Seg value={score.purseScore} color="#a78bfa" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-black text-white">{score.overall}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">{formatLakh(team.purse)} left</p>
                </div>
                <ChevronDown size={16} className={`shrink-0 text-slate-500 transition ${openTeam === team.id ? 'rotate-180' : ''}`} />
              </button>
            ))}
          </div>
        </section>

        {state.teams.map((team) => {
          if (openTeam !== team.id) return null
          const squad = state.squads[team.id] ?? []
          const dist = roleDistribution(squad, playersMap)
          const xi = bestXIs[team.id]
          return (
            <motion.section key={team.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="card-premium rounded-xl p-5">
              <div className="flex flex-wrap items-center gap-3">
                <TeamLogo team={team} size={44} />
                <div>
                  <h3 className="font-display text-2xl font-black text-white">{team.name}</h3>
                  <p className="text-xs text-slate-500">{team.controller === 'user' ? 'Your team' : 'AI-managed'}</p>
                </div>
                <div className="ml-auto grid grid-cols-2 gap-x-5 gap-y-2 text-right sm:grid-cols-5">
                  <Metric label="Spent" value={formatLakh(teamSpent(squad))} />
                  <Metric label="Remaining" value={formatLakh(team.purse)} accent />
                  <Metric label="Squad" value={`${squad.length}/${state.config.rules.maxSquadSize}`} />
                  <Metric label="Overseas" value={`${overseasCount(squad, playersMap)}/${state.config.rules.maxOverseasPlayers}`} />
                  <Metric label="Avg Price" value={formatLakh(averagePlayerPrice(squad))} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(dist).map(([role, count]) => (
                  <span key={role} className="rounded-full bg-stadium-800 px-3 py-1 text-xs text-slate-300">
                    {role}: <strong className="text-white">{count}</strong>
                  </span>
                ))}
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gold-400">Best XI</h4>
                  <span className="text-[10px] text-slate-500">Tap a player, then another to swap</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
                  {(xi?.xi ?? []).map((pid) => {
                    const p = playersMap[pid]
                    if (!p) return null
                    const sp = squad.find((s) => s.playerId === pid)
                    return (
                      <button key={pid}
                        onClick={() => selectForSwap(team.id, pid)}
                        className={`flex items-center gap-2 rounded-lg p-2 text-left transition ${
                          swapSource?.playerId === pid && swapSource?.teamId === team.id
                            ? 'bg-gold-400/20 ring-1 ring-gold-400'
                            : 'bg-stadium-800 hover:bg-stadium-700'
                        }`}>
                        <PlayerImage player={p} className="h-9 w-9 shrink-0" rounded="rounded-md" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-white">{p.name}</p>
                          <p className="text-[10px] text-slate-500">{formatLakh(sp?.price ?? 0)}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {(xi?.bench ?? []).length > 0 && (
                  <>
                    <div className="mb-1.5 mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <Repeat size={11} /> Bench
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
                      {(xi?.bench ?? []).map((pid) => {
                        const p = playersMap[pid]
                        if (!p) return null
                        const sp = squad.find((s) => s.playerId === pid)
                        return (
                          <button key={pid}
                            onClick={() => selectForSwap(team.id, pid)}
                            className={`flex items-center gap-2 rounded-lg bg-stadium-900/70 p-2 text-left opacity-75 transition hover:opacity-100 ${
                              swapSource?.playerId === pid && swapSource?.teamId === team.id ? 'ring-1 ring-gold-400' : ''
                            }`}>
                            <PlayerImage player={p} className="h-8 w-8 shrink-0" rounded="rounded-md" />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-slate-300">{p.name}</p>
                              <p className="text-[10px] text-slate-600">{formatLakh(sp?.price ?? 0)}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </motion.section>
          )
        })}
      </main>
    </div>
  )
}

function Seg({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-full flex-1 overflow-hidden rounded-full bg-stadium-700">
      <div className="h-full rounded-full" style={{ width: `${Math.round(value)}%`, background: color }} />
    </div>
  )
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`text-sm font-bold ${accent ? 'text-emerald-300' : 'text-white'}`}>{value}</p>
    </div>
  )
}
