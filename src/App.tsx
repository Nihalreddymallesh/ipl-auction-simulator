import { useState } from 'react'
import type { AuctionState, AuctionRules, AIDifficulty, Player, Team } from './types'
import Home from './pages/Home'
import TeamSetup from './pages/TeamSetup'
import PlayerSetup from './pages/PlayerSetup'
import AuctionPage from './pages/Auction'
import Results from './pages/Results'
import Analytics from './pages/Analytics'
import { buildIPLPresetAuction, buildQuickAuction, buildCustomAuction } from './data/presets'
import { IPL_PRESET_TEAMS } from './data/teams'

type View = 'home' | 'team-setup' | 'player-setup' | 'auction' | 'results' | 'analytics' | 'pick-ipl-team'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [leagueName, setLeagueName] = useState('Custom League')
  const [teams, setTeams] = useState<Team[]>([])
  const [rules, setRules] = useState<AuctionRules | undefined>(undefined)
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium')
  const [auction, setAuction] = useState<AuctionState | null>(null)
  const [resultsState, setResultsState] = useState<AuctionState | null>(null)

  const goHome = () => {
    setView('home')
    setAuction(null)
    setResultsState(null)
  }

  switch (view) {
    case 'home':
      return (
        <Home
          onIPLPreset={() => setView('pick-ipl-team')}
          onQuickAuction={() => {
            setAuction(buildQuickAuction(null))
            setView('auction')
          }}
          onCustomAuction={() => {
            setLeagueName('Custom League')
            setTeams([])
            setRules(undefined)
            setView('team-setup')
          }}
          onResume={(saved) => {
            if (saved.status === 'completed') {
              setResultsState(saved)
              setView('results')
            } else {
              setAuction(saved)
              setView('auction')
            }
          }}
        />
      )

    case 'pick-ipl-team':
      return (
        <PickIPLTeam
          onBack={goHome}
          onPick={(teamId) => {
            setAuction(buildIPLPresetAuction(teamId))
            setView('auction')
          }}
        />
      )

    case 'team-setup':
      return (
        <TeamSetup
          leagueName={leagueName}
          initialTeams={teams.length >= 2 ? teams : undefined}
          initialRules={rules}
          initialDifficulty={difficulty}
          onBack={goHome}
          onConfirm={(t, r, d) => {
            setTeams(t)
            setRules(r)
            setDifficulty(d)
            setView('player-setup')
          }}
        />
      )

    case 'player-setup':
      return (
        <PlayerSetup
          leagueName={leagueName}
          teams={teams}
          rules={rules ?? defaultRulesFallback()}
          difficulty={difficulty}
          onBack={() => setView('team-setup')}
          onStart={(pool: Player[]) => {
            setAuction(
              buildCustomAuction(leagueName, teams, rules ?? defaultRulesFallback(), difficulty, pool),
            )
            setView('auction')
          }}
        />
      )

    case 'auction':
      if (!auction) {
        goHome()
        return null
      }
      return (
        <AuctionPage
          key={auction.id}
          initialState={auction}
          onExit={goHome}
          onViewResults={(s) => {
            setResultsState(s)
            setView('results')
          }}
        />
      )

    case 'results':
      if (!resultsState) {
        goHome()
        return null
      }
      return (
        <Results
          state={resultsState}
          onBack={() => setView(resultsState.status === 'completed' ? 'home' : 'auction')}
          onViewAnalytics={() => setView('analytics')}
        />
      )

    case 'analytics':
      if (!resultsState) {
        goHome()
        return null
      }
      return <Analytics state={resultsState} onBack={() => setView('results')} />

    default:
      return null
  }
}

function defaultRulesFallback(): AuctionRules {
  return {
    bidIncrement: 20,
    timerSeconds: 10,
    maxSquadSize: 16,
    minSquadSize: 12,
    maxOverseasPlayers: 6,
    playerOrder: 'role-based',
    currencyUnit: 'lakh',
  }
}

function PickIPLTeam({ onBack, onPick }: { onBack: () => void; onPick: (id: string) => void }) {
  return (
    <div className="stadium-bg flex min-h-screen flex-col items-center justify-center p-4">
      <button onClick={onBack} className="mb-6 self-start ml-4 text-sm text-slate-400 hover:text-white lg:ml-0">
        ← Back
      </button>
      <h1 className="font-display text-center text-3xl font-black tracking-wide text-white sm:text-4xl">
        CHOOSE YOUR <span className="text-gold-400">FRANCHISE</span>
      </h1>
      <p className="mt-1 mb-8 text-sm text-slate-400">All other teams will be managed by AI.</p>
      <div className="grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {IPL_PRESET_TEAMS.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t.id)}
            className="card-premium group flex flex-col items-center gap-2 rounded-xl p-4 transition hover:scale-[1.03]"
            style={{ borderTop: `3px solid ${t.primaryColor}` }}
          >
            <img src={`/assets/teams/${t.id}.svg`} alt={t.name} className="h-14 w-14 object-contain" />
            <span className="text-center text-xs font-bold leading-tight text-slate-200 group-hover:text-white">
              {t.name}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: t.primaryColor }}>
              {t.shortName}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
