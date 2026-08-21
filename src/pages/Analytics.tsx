import { useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, CartesianGrid,
} from 'recharts'
import type { AuctionState, Player } from '../types'
import { formatLakh, lakhToCrore } from '../utils/currency'
import {
  teamSpent, averagePlayerPrice, squadRating, overseasCount,
  battingStrength, bowlingStrength, allrounderStrength,
} from '../utils/calculations'
import { playersById } from '../data/players'
import TeamLogo from '../components/TeamLogo'

interface Props {
  state: AuctionState
  onBack: () => void
}

const CHART_COLORS = ['#f5c542', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#fb923c', '#4ade80', '#38bdf8']

export default function Analytics({ state, onBack }: Props) {
  const playersMap = useMemo(() => playersById(), [])

  const teamData = useMemo(
    () =>
      state.teams.map((t) => {
        const squad = state.squads[t.id] ?? []
        return {
          name: t.shortName || t.name.slice(0, 6),
          fullName: t.name,
          color: t.primaryColor,
          spentCr: +lakhToCrore(teamSpent(squad)).toFixed(2),
          remainingCr: +lakhToCrore(t.purse).toFixed(2),
          avgPriceCr: +(averagePlayerPrice(squad) / 100).toFixed(2),
          players: squad.length,
          rating: squadRating(squad, playersMap),
          overseas: overseasCount(squad, playersMap),
          batting: battingStrength(squad, playersMap),
          bowling: bowlingStrength(squad, playersMap),
          allrounder: allrounderStrength(squad, playersMap),
        }
      }),
    [state, playersMap],
  )

  const topPlayers = useMemo(() => {
    const sold = [
      ...state.soldPlayerIds.map((id) => ({ id })),
    ]
      .map(({ id }) => {
        let price = 0
        let teamName = ''
        Object.entries(state.squads).forEach(([tid, squad]) => {
          const sp = squad.find((s) => s.playerId === id)
          if (sp) {
            price = sp.price
            teamName = state.teams.find((t) => t.id === tid)?.name ?? ''
          }
        })
        const p = playersMap[id]
        return p ? { player: p, price, teamName } : null
      })
      .filter((x): x is { player: Player; price: number; teamName: string } => x !== null)
      .sort((a, b) => b.price - a.price)
      .slice(0, 10)
    return sold
  }, [state, playersMap])

  const roleDistData = useMemo(() => {
    const counts: Record<string, number> = {}
    state.soldPlayerIds.forEach((id) => {
      const role = playersMap[id]?.role
      if (role) counts[role] = (counts[role] ?? 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [state, playersMap])

  const overseasSplit = useMemo(() => {
    let indian = 0
    let overseas = 0
    state.soldPlayerIds.forEach((id) => {
      if (playersMap[id]?.nationality === 'India') indian++
      else overseas++
    })
    return [
      { name: 'Indian', value: indian },
      { name: 'Overseas', value: overseas },
    ]
  }, [state, playersMap])

  const radarData = useMemo(
    () =>
      teamData.map((t) => ({
        team: t.name,
        Batting: t.batting,
        Bowling: t.bowling,
        AllRounder: t.allrounder,
        Rating: t.rating,
      })),
    [teamData],
  )

  const unsoldCount = state.unsoldPlayerIds.length

  return (
    <div className="stadium-bg min-h-screen pb-16">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-stadium-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="font-display text-xl font-black tracking-wide text-white sm:text-2xl">
            AUCTION <span className="text-gold-400">ANALYTICS</span>
          </h1>
          <span className="text-xs text-slate-500">{state.config.leagueName}</span>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6 md:grid-cols-2">
        <ChartCard title="Team Spending (₹ Cr)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={teamData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => `₹${v} Cr`} />
              <Bar dataKey="spentCr" radius={[4, 4, 0, 0]}>
                {teamData.map((t) => <Cell key={t.name} fill={t.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Remaining Purse (₹ Cr)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={teamData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => `₹${v} Cr`} />
              <Bar dataKey="remainingCr" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most Expensive Players">
          <div className="space-y-1.5">
            {topPlayers.map(({ player, price, teamName }, i) => (
              <div key={player.id} className="flex items-center gap-2.5 rounded-lg bg-stadium-800/60 px-3 py-2">
                <span className="w-5 text-center font-display text-sm font-black text-slate-500">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{player.name}</p>
                  <p className="text-[10px] text-slate-500">{teamName}</p>
                </div>
                <span className="font-mono text-sm font-bold text-gold-300">{formatLakh(price)}</span>
              </div>
            ))}
            {topPlayers.length === 0 && <p className="py-8 text-center text-xs text-slate-600">No players sold.</p>}
          </div>
        </ChartCard>

        <ChartCard title="Average Player Price (₹ Cr)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={teamData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => `₹${v} Cr`} />
              <Bar dataKey="avgPriceCr" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Role Distribution (Sold)">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={roleDistData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {roleDistData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Overseas Split (Sold)">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={overseasSplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                <Cell fill="#34d399" />
                <Cell fill="#f472b6" />
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Squad Strength Profile" wide>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="team" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Radar name="Batting" dataKey="Batting" stroke="#34d399" fill="#34d399" fillOpacity={0.25} />
              <Radar name="Bowling" dataKey="Bowling" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.2} />
              <Radar name="Rating" dataKey="Rating" stroke="#f5c542" fill="#f5c542" fillOpacity={0.15} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Players Purchased vs Unsold">
          <div className="grid h-full grid-cols-3 gap-3">
            <BigStat label="Sold" value={state.soldPlayerIds.length} color="#34d399" />
            <BigStat label="Unsold" value={unsoldCount} color="#64748b" />
            <BigStat label="Lots" value={state.lotsProcessed} color="#f5c542" />
          </div>
        </ChartCard>

        <ChartCard title="Team Overview" wide>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700/50 text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-3">Team</th>
                  <th className="px-2">Spent</th>
                  <th className="px-2">Left</th>
                  <th className="px-2">Players</th>
                  <th className="px-2">Overseas</th>
                  <th className="px-2">Avg ₹</th>
                  <th className="px-2">Rating</th>
                </tr>
              </thead>
              <tbody>
                {state.teams.map((t) => {
                  const squad = state.squads[t.id] ?? []
                  const d = teamData.find((x) => x.fullName === t.name)
                  return (
                    <tr key={t.id} className="border-b border-slate-800/50">
                      <td className="flex items-center gap-2 py-2 pr-3">
                        <TeamLogo team={t} size={20} />
                        <span className="font-semibold text-slate-200">{t.name}</span>
                      </td>
                      <td className="px-2 font-mono text-slate-300">{formatLakh(teamSpent(squad))}</td>
                      <td className="px-2 font-mono text-emerald-300">{formatLakh(t.purse)}</td>
                      <td className="px-2 text-slate-300">{squad.length}</td>
                      <td className="px-2 text-slate-300">{d?.overseas ?? 0}</td>
                      <td className="px-2 font-mono text-slate-300">{formatLakh(averagePlayerPrice(squad))}</td>
                      <td className="px-2 font-bold text-gold-300">{d?.rating ?? 0}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </main>
    </div>
  )
}

const tooltipStyle = {
  background: '#111a2e',
  border: '1px solid #243356',
  borderRadius: 8,
  fontSize: 12,
  color: '#e7ecf5',
}

function ChartCard({
  title, children, wide,
}: {
  title: string; children: React.ReactNode; wide?: boolean
}) {
  return (
    <section className={`card-premium rounded-xl p-4 ${wide ? 'md:col-span-2' : ''}`}>
      <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">{title}</h3>
      {children}
    </section>
  )
}

function BigStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex h-full min-h-32 flex-col items-center justify-center rounded-lg bg-stadium-800/60">
      <span className="font-display text-4xl font-black" style={{ color }}>{value}</span>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
    </div>
  )
}


