import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Gavel, Pause, Play, Undo2, SkipForward, Volume2, VolumeX, Flag, Timer } from 'lucide-react'
import type { AuctionState } from '../types'
import { useAuction } from '../hooks/useAuction'
import { formatLakh } from '../utils/currency'
import { isMuted, setMuted } from '../utils/sound'
import PlayerImage from '../components/PlayerImage'
import TeamLogo from '../components/TeamLogo'
import TeamCard from '../components/TeamCard'
import CountdownTimer from '../components/CountdownTimer'
import BidHistory from '../components/BidHistory'
import ResultOverlay, { type OverlayData } from '../components/SoldOverlay'
import PlayerModal from '../components/PlayerModal'

interface Props {
  initialState: AuctionState
  onExit: () => void
  onViewResults: (state: AuctionState) => void
}

export default function Auction({ initialState, onExit, onViewResults }: Props) {
  const auction = useAuction(initialState)
  const {
    state, allPlayers, currentPlayer, overlay, overlayData, remaining,
    paused, timerEnabled, start, pause, resume, userBid, hammerNow,
    skipLot, undoLot, undoBid, interests,
  } = auction

  const [muted, setMutedState] = useState(isMuted())
  const [showPlayerModal, setShowPlayerModal] = useState(false)

  const userTeams = state.teams.filter((t) => t.controller === 'user')
  const leadingTeam = state.currentBidTeamId
    ? state.teams.find((t) => t.id === state.currentBidTeamId)
    : null

  const teamLogos = useMemo(
    () => Object.fromEntries(state.teams.map((t) => [t.id, t.logo])),
    [state.teams],
  )
  const teamColors = useMemo(
    () => Object.fromEntries(state.teams.map((t) => [t.id, t.primaryColor])),
    [state.teams],
  )

  const overlayForOverlay: OverlayData | null =
    overlay && overlayData
      ? {
          kind: overlay,
          playerName: overlayData.playerName,
          price: overlayData.price,
          teamName: overlayData.teamName,
          teamLogo: overlayData.teamLogo,
          teamColor: overlayData.teamColor,
          basePrice: currentPlayer?.basePrice,
        }
      : null

  const nextBidAmount =
    state.currentBidTeamId === null && currentPlayer
      ? currentPlayer.basePrice
      : state.currentBid + state.config.rules.bidIncrement

  const bidEligible = (team: NonNullable<(typeof userTeams)[number]>) =>
    state.status === 'running' &&
    !paused &&
    !overlay &&
    nextBidAmount <= team.purse &&
    (state.squads[team.id] ?? []).length < state.config.rules.maxSquadSize &&
    state.currentBidTeamId !== team.id

  const squadSizeOf = (teamId: string) => (state.squads[teamId] ?? []).length

  if (state.status === 'completed') {
    return (
      <div className="stadium-bg flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="card-premium rounded-2xl p-10 text-center">
          <h1 className="font-display text-5xl font-black text-gold-400">AUCTION COMPLETE</h1>
          <p className="mt-2 text-slate-400">{state.config.leagueName} · {state.lotsProcessed} lots processed</p>
          <button
            onClick={() => onViewResults(state)}
            className="mt-6 rounded-xl bg-gold-400 px-8 py-3 font-black text-stadium-950 transition hover:bg-gold-300"
          >
            VIEW RESULTS & ANALYTICS →
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="stadium-bg min-h-screen pb-24 lg:pb-6">
      {/* header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-stadium-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="font-display truncate text-lg font-black tracking-wide text-white sm:text-xl">
              {state.config.leagueName.toUpperCase()}
            </span>
            <span className="hidden rounded-full bg-stadium-800 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300 sm:block">
              Lot {state.lotsProcessed + 1}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {state.status === 'idle' ? (
              <button onClick={start} className="flex items-center gap-1.5 rounded-lg bg-gold-400 px-4 py-2 text-sm font-black text-stadium-950 transition hover:bg-gold-300">
                <Play size={15} /> START AUCTION
              </button>
            ) : (
              <>
                <IconBtn title={paused ? 'Resume' : 'Pause'} onClick={() => (paused ? resume() : pause())}>
                  {paused ? <Play size={16} /> : <Pause size={16} />}
                </IconBtn>
                <IconBtn title="Undo last lot" onClick={undoLot}><Undo2 size={16} /></IconBtn>
                {state.status === 'running' && (
                  <>
                    <IconBtn title="Undo last bid" onClick={undoBid} disabled={state.bidsThisLot.length === 0}>
                      <Gavel size={16} />
                    </IconBtn>
                    <IconBtn title="Hammer now" onClick={hammerNow}><Flag size={16} /></IconBtn>
                    <IconBtn title="Skip (unsold)" onClick={skipLot}><SkipForward size={16} /></IconBtn>
                  </>
                )}
              </>
            )}
            <IconBtn
              title={muted ? 'Unmute' : 'Mute'}
              onClick={() => {
                const m = !muted
                setMuted(m)
                setMutedState(m)
              }}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </IconBtn>
            <button onClick={onExit} className="ml-1 hidden rounded-lg bg-stadium-800 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-stadium-700 sm:block">
              Exit
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[minmax(280px,340px)_1fr_minmax(260px,320px)]">
        {/* LEFT: current player */}
        <section className="order-1 lg:order-none">
          {currentPlayer ? (
            <motion.div key={currentPlayer.id}
              initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
              className="card-premium overflow-hidden rounded-xl">
              <button onClick={() => setShowPlayerModal(true)} className="block w-full text-left" title="View full profile">
                <PlayerImage player={currentPlayer} className="h-64 w-full sm:h-72" rounded="rounded-none" />
              </button>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-2xl font-black text-white">{currentPlayer.name}</h2>
                    <p className="text-sm text-slate-400">{currentPlayer.nationality} · {currentPlayer.role}</p>
                  </div>
                  <div className="shrink-0 rounded-lg bg-stadium-800 px-2.5 py-1.5 text-center">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500">Rating</p>
                    <p className="font-display text-xl font-black text-gold-300">{currentPlayer.rating}</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                  <Chip>{currentPlayer.battingStyle}</Chip>
                  {currentPlayer.bowlingStyle !== 'None' && <Chip>{currentPlayer.bowlingStyle}</Chip>}
                  <Chip>Base {formatLakh(currentPlayer.basePrice)}</Chip>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
                  <MiniStat label="Runs" value={currentPlayer.stats.runs} />
                  <MiniStat label="SR" value={currentPlayer.stats.strikeRate} />
                  <MiniStat label="Wkts" value={currentPlayer.stats.wickets} />
                  <MiniStat label="Econ" value={currentPlayer.stats.economy} />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="card-premium flex h-full min-h-72 items-center justify-center rounded-xl p-8 text-center">
              <div>
                <Timer size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="text-sm text-slate-500">
                  {state.status === 'idle' ? 'Press START AUCTION to begin.' : 'Loading next lot…'}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* CENTER: bidding */}
        <section className="order-3 flex flex-col gap-4 lg:order-none">
          <div className="card-premium relative overflow-hidden rounded-xl p-5 text-center">
            {leadingTeam && (
              <div className="absolute inset-x-0 top-0 h-1"
                style={{ background: `linear-gradient(90deg, ${leadingTeam.primaryColor}, transparent)` }} />
            )}
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Current Bid</p>
            <motion.p key={state.currentBid}
              initial={{ scale: 1.15, color: '#f5c542' }} animate={{ scale: 1, color: '#ffffff' }}
              className="font-display text-5xl font-black tracking-tight sm:text-6xl">
              {state.currentBid > 0 ? formatLakh(state.currentBid) : '—'}
            </motion.p>
            <div className="mt-1 flex items-center justify-center gap-2 text-sm">
              {leadingTeam ? (
                <>
                  <TeamLogo team={leadingTeam} size={22} />
                  <span className="font-bold" style={{ color: leadingTeam.primaryColor }}>{leadingTeam.name}</span>
                </>
              ) : (
                <span className="text-slate-500">Awaiting first bid</span>
              )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-4">
              {timerEnabled ? (
                <CountdownTimer remaining={remaining} total={state.config.rules.timerSeconds} />
              ) : (
                <span className="rounded-full border border-slate-600 bg-stadium-800 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  ∞ No Time Limit
                </span>
              )}
              <div className="text-left text-xs text-slate-500">
                <p>Increment</p>
                <p className="font-bold text-slate-300">{formatLakh(state.config.rules.bidIncrement)}</p>
              </div>
            </div>

            {/* co-op: one bid button per human team */}
            {userTeams.length > 0 && state.status === 'running' && !overlay && (
              <div className={`mt-5 grid gap-2 ${userTeams.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                {userTeams.map((team) => {
                  const eligible = bidEligible(team)
                  const squadFull = (state.squads[team.id] ?? []).length >= state.config.rules.maxSquadSize
                  const reason = !eligible
                    ? state.currentBidTeamId === team.id
                      ? `${team.shortName} holds the highest bid`
                      : squadFull
                        ? 'Squad full'
                        : nextBidAmount > team.purse
                          ? 'Over purse'
                          : paused ? 'Paused' : ''
                    : ''
                  return (
                    <motion.button
                      key={team.id}
                      whileTap={eligible ? { scale: 0.97 } : undefined}
                      disabled={!eligible}
                      onClick={() => userBid(team.id)}
                      title={reason}
                      className={`flex items-center justify-center gap-2 rounded-xl py-4 font-display text-xl font-black tracking-widest transition sm:text-2xl ${
                        eligible
                          ? 'text-stadium-950 shadow-lg hover:brightness-110'
                          : 'cursor-not-allowed bg-stadium-700 text-slate-500'
                      }`}
                      style={
                        eligible
                          ? {
                              background: `linear-gradient(90deg, ${team.secondaryColor}, ${team.primaryColor})`,
                              color: '#fff',
                              boxShadow: `0 8px 24px -6px ${team.primaryColor}66`,
                            }
                          : undefined
                      }
                    >
                      BID {formatLakh(nextBidAmount)} · {team.shortName}
                    </motion.button>
                  )
                })}
              </div>
            )}
            {userTeams.length === 1 && !bidEligible(userTeams[0]) && userTeams[0] && state.status === 'running' && !overlay && (
              <p className="mt-2 text-xs text-red-400/80">
                {state.currentBidTeamId === userTeams[0].id
                  ? 'You hold the highest bid.'
                  : (state.squads[userTeams[0].id] ?? []).length >= state.config.rules.maxSquadSize
                    ? 'Your squad is full.'
                    : nextBidAmount > userTeams[0].purse
                      ? 'Bid exceeds your remaining purse.'
                      : ''}
              </p>
            )}

            {/* no-timer controls */}
            {!timerEnabled && state.status === 'running' && !overlay && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={hammerNow}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/25"
                >
                  <Flag size={14} /> Hammer — SOLD
                </button>
                <button
                  onClick={skipLot}
                  className="flex items-center gap-1.5 rounded-lg bg-stadium-800 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-400 transition hover:bg-stadium-700"
                >
                  <SkipForward size={14} /> Pass — UNSOLD
                </button>
              </div>
            )}
            {paused && state.status === 'running' && (
              <p className="mt-3 rounded-lg bg-yellow-500/10 py-1.5 text-xs font-bold uppercase tracking-widest text-yellow-300">
                Paused
              </p>
            )}
          </div>

          {/* squad quick views for every human team */}
          {userTeams.map((team) => (
            <div key={team.id} className="card-premium rounded-xl p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400">
                  <TeamLogo team={team} size={16} />
                  {userTeams.length > 1 ? team.name : 'Your Squad'}
                </h3>
                <span className="text-xs text-slate-500">
                  {(state.squads[team.id] ?? []).length}/{state.config.rules.maxSquadSize} · Purse {formatLakh(team.purse)}
                </span>
              </div>
              <div className="scrollbar-thin flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
                {(state.squads[team.id] ?? []).map((sp) => {
                  const p = allPlayers[sp.playerId]
                  if (!p) return null
                  return (
                    <span key={sp.playerId} className="rounded-md bg-stadium-800 px-2 py-1 text-[11px] text-slate-300">
                      {p.name.split(' ').at(-1)} <span className="font-mono text-gold-400">{formatLakh(sp.price)}</span>
                    </span>
                  )
                })}
                {(state.squads[team.id] ?? []).length === 0 && (
                  <span className="text-xs text-slate-600">No players yet.</span>
                )}
              </div>
            </div>
          ))}

          <div className="hidden lg:block">
            <BidHistory events={state.history} teamLogos={teamLogos} teamColors={teamColors} />
          </div>
        </section>

        {/* RIGHT: teams */}
        <section className="order-2 space-y-2 lg:order-none">
          <h3 className="px-1 text-xs font-black uppercase tracking-widest text-slate-400">
            Teams ({state.teams.length})
          </h3>
          <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-2 lg:max-h-[calc(100vh-140px)] lg:flex-col lg:overflow-y-auto">
            {state.teams.map((team) => (
              <div key={team.id} className="w-64 shrink-0 lg:w-full">
                <TeamCard
                  team={team}
                  squadCount={squadSizeOf(team.id)}
                  maxSquad={state.config.rules.maxSquadSize}
                  isHighestBidder={state.currentBidTeamId === team.id}
                  leadingAmount={state.currentBidTeamId === team.id ? state.currentBid : undefined}
                  interest={interests[team.id] ?? 0}
                  canBidNow={false}
                />
              </div>
            ))}
          </div>
        </section>

        {/* mobile history */}
        <div className="order-4 lg:hidden">
          <BidHistory events={state.history} teamLogos={teamLogos} teamColors={teamColors} />
        </div>
      </main>

      <ResultOverlay data={overlayForOverlay} />

      <PlayerModal
        player={showPlayerModal ? currentPlayer : null}
        currentBid={state.currentBid > 0 ? state.currentBid : undefined}
        bidTeamName={leadingTeam?.name}
        history={state.bidsThisLot.map((b) => ({ teamName: b.teamName, amount: b.amount, timestamp: b.timestamp }))}
        onClose={() => setShowPlayerModal(false)}
      />

      {/* mobile sticky bid */}
      {userTeams.length > 0 && state.status === 'running' && !overlay && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-stadium-950/95 p-3 backdrop-blur lg:hidden">
          <div className={`grid gap-2 ${userTeams.length > 1 ? 'grid-cols-2' : ''}`}>
            {userTeams.map((team) => {
              const eligible = bidEligible(team)
              return (
                <button
                  key={team.id}
                  disabled={!eligible}
                  onClick={() => userBid(team.id)}
                  className={`rounded-xl py-3.5 font-display text-lg font-black tracking-widest ${
                    !eligible
                      ? 'bg-stadium-700 text-slate-500'
                      : userTeams.length === 1
                        ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-stadium-950'
                        : ''
                  }`}
                  style={
                    eligible && userTeams.length > 1
                      ? { background: `linear-gradient(90deg, ${team.secondaryColor}, ${team.primaryColor})`, color: '#fff' }
                      : undefined
                  }
                >
                  BID {formatLakh(nextBidAmount)} · {team.shortName}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function IconBtn({
  children, onClick, title, disabled,
}: {
  children: React.ReactNode; onClick: () => void; title: string; disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="rounded-lg bg-stadium-800 p-2 text-slate-300 transition hover:bg-stadium-700 hover:text-white disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-stadium-800 px-2 py-0.5 font-semibold text-slate-300">{children}</span>
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-stadium-800/70 py-1.5">
      <p className="font-mono text-sm font-bold text-white">{value}</p>
      <p className="text-[9px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  )
}
