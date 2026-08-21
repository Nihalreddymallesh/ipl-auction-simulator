import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Search, Plus, Trash2, RotateCcw, Pencil } from 'lucide-react'
import type { Player, PlayerRole, AuctionRules, AIDifficulty, Team } from '../types'
import { PLAYER_DATABASE } from '../data/players'
import { validatePlayer } from '../utils/validation'
import { uid } from '../utils/calculations'
import { formatLakh } from '../utils/currency'
import PlayerImage from '../components/PlayerImage'
import PlayerModal from '../components/PlayerModal'

interface Props {
  teams: Team[]
  rules: AuctionRules
  difficulty: AIDifficulty
  leagueName: string
  onBack: () => void
  onStart: (pool: Player[]) => void
}

const ROLES: PlayerRole[] = ['Batsman', 'Wicketkeeper', 'All-rounder', 'Fast Bowler', 'Spin Bowler']

export default function PlayerSetup({ teams, rules, leagueName, onBack, onStart }: Props) {
  const [customPlayers, setCustomPlayers] = useState<Player[]>([])
  const [excluded, setExcluded] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [sort, setSort] = useState<'rating' | 'base-desc' | 'base-asc' | 'name'>('rating')
  const [editing, setEditing] = useState<Player | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const allCountries = useMemo(() => {
    const set = new Set(PLAYER_DATABASE.map((p) => p.nationality))
    return Array.from(set).sort()
  }, [])

  const pool = useMemo(
    () => [...PLAYER_DATABASE, ...customPlayers].filter((p) => !excluded.has(p.id)),
    [customPlayers, excluded],
  )

  const filtered = useMemo(() => {
    let list = pool
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.nationality.toLowerCase().includes(q))
    }
    if (roleFilter !== 'all') list = list.filter((p) => p.role === roleFilter)
    if (countryFilter !== 'all') list = list.filter((p) => p.nationality === countryFilter)
    switch (sort) {
      case 'rating': list = [...list].sort((a, b) => b.rating - a.rating); break
      case 'base-desc': list = [...list].sort((a, b) => b.basePrice - a.basePrice); break
      case 'base-asc': list = [...list].sort((a, b) => a.basePrice - b.basePrice); break
      case 'name': list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break
    }
    return list
  }, [pool, query, roleFilter, countryFilter, sort])

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    pool.forEach((p) => { counts[p.role] = (counts[p.role] ?? 0) + 1 })
    return counts
  }, [pool])

  const enoughPlayers = pool.length >= teams.length * rules.minSquadSize

  const removeCustom = (id: string) => setCustomPlayers((ps) => ps.filter((p) => p.id !== id))

  return (
    <div className="stadium-bg min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-stadium-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="font-display truncate text-xl font-black tracking-wide text-white sm:text-2xl">
            PLAYER POOL · <span className="text-gold-400">{leagueName.toUpperCase()}</span>
          </h1>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 sm:block">{pool.length} in pool</span>
            <button
              onClick={() => onStart(pool)}
              disabled={!enoughPlayers}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition ${
                enoughPlayers ? 'bg-gold-400 text-stadium-950 hover:bg-gold-300' : 'bg-stadium-700 text-slate-500'
              }`}
            >
              Start Auction <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5 pb-24">
        {/* toolbar */}
        <div className="card-premium mb-4 flex flex-wrap items-center gap-2 rounded-xl p-3">
          <div className="relative min-w-44 flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or country…"
              className="w-full rounded-lg border border-slate-700 bg-stadium-800 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-600 focus:border-gold-400 focus:outline-none"
            />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-stadium-800 px-2 py-2 text-sm text-white">
            <option value="all">All roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r} ({roleCounts[r] ?? 0})</option>)}
          </select>
          <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-stadium-800 px-2 py-2 text-sm text-white">
            <option value="all">All countries</option>
            {allCountries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-lg border border-slate-700 bg-stadium-800 px-2 py-2 text-sm text-white">
            <option value="rating">Top rated</option>
            <option value="base-desc">Base price ↓</option>
            <option value="base-asc">Base price ↑</option>
            <option value="name">Name A–Z</option>
          </select>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500/25"
          >
            <Plus size={15} /> Custom Player
          </button>
        </div>

        {/* player grid */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <motion.div key={p.id} layout
              className="card-premium group flex items-center gap-3 rounded-xl p-3">
              <button onClick={() => setEditing(p)} className="shrink-0" title="View details">
                <PlayerImage player={p} className="h-14 w-14" rounded="rounded-lg" />
              </button>
              <button onClick={() => setEditing(p)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-bold text-white group-hover:text-gold-300">{p.name}</p>
                <p className="truncate text-[11px] text-slate-500">{p.nationality} · {p.role}</p>
                <p className="mt-0.5 text-[11px]">
                  <span className="font-bold text-gold-300">{formatLakh(p.basePrice)}</span>
                  <span className="ml-2 text-slate-500">Rating {p.rating}</span>
                </p>
              </button>
              <div className="flex flex-col gap-1">
                {p.custom && (
                  <IconBtn title="Delete custom player" danger onClick={() => removeCustom(p.id)}>
                    <Trash2 size={13} />
                  </IconBtn>
                )}
                <IconBtn
                  title={excluded.has(p.id) ? 'Include in auction' : 'Exclude from auction'}
                  onClick={() =>
                    setExcluded((s) => {
                      const next = new Set(s)
                      if (next.has(p.id)) next.delete(p.id)
                      else next.add(p.id)
                      return next
                    })
                  }
                >
                  {excluded.has(p.id) ? <RotateCcw size={13} /> : <Pencil size={13} />}
                </IconBtn>
              </div>
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="py-16 text-center text-sm text-slate-600">No players match your filters.</p>
        )}
      </main>

      {/* add custom player */}
      {showAdd && (
        <PlayerFormModal
          title="Add Custom Player"
          onClose={() => setShowAdd(false)}
          onSave={(p) => {
            setCustomPlayers((ps) => [{ ...p, id: uid('custom-'), custom: true }, ...ps])
            setShowAdd(false)
          }}
        />
      )}

      {/* view / edit existing */}
      {editing && !showAdd && (
        <PlayerDetailOrEdit
          player={editing}
          onClose={() => setEditing(null)}
          onSave={(p) => {
            setCustomPlayers((ps) => {
              const exists = ps.some((x) => x.id === p.id)
              return exists ? ps.map((x) => (x.id === p.id ? p : x)) : [...ps, p]
            })
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function IconBtn({
  children, onClick, title, danger,
}: {
  children: React.ReactNode; onClick: () => void; title: string; danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-md p-1.5 transition ${
        danger ? 'bg-red-500/10 text-red-400 hover:bg-red-500/25' : 'bg-stadium-700 text-slate-300 hover:bg-stadium-600'
      }`}
    >
      {children}
    </button>
  )
}

function PlayerFormModal({
  title, initial, onClose, onSave,
}: {
  title: string
  initial?: Player
  onClose: () => void
  onSave: (p: Player) => void
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    nationality: initial?.nationality ?? 'India',
    role: initial?.role ?? 'Batsman',
    battingStyle: initial?.battingStyle ?? 'Right-handed',
    bowlingStyle: initial?.bowlingStyle ?? 'None',
    basePriceCr: String((initial?.basePrice ?? 50) / 100),
    rating: String(initial?.rating ?? 70),
    image: initial?.image ?? '',
  })
  const errors = validatePlayer({
    name: form.name,
    nationality: form.nationality,
    role: form.role as PlayerRole,
    basePrice: Math.round(parseFloat(form.basePriceCr || '0') * 100),
    rating: parseInt(form.rating || '0', 10),
  })

  const save = () => {
    if (errors.length > 0) return
    onSave({
      ...(initial ?? { id: '', stats: emptyStats() }),
      name: form.name.trim(),
      nationality: form.nationality.trim(),
      role: form.role as PlayerRole,
      battingStyle: form.battingStyle as Player['battingStyle'],
      bowlingStyle: form.bowlingStyle as Player['bowlingStyle'],
      basePrice: Math.round(parseFloat(form.basePriceCr) * 100),
      rating: parseInt(form.rating, 10),
      image: form.image.trim() || undefined,
      stats: initial?.stats ?? emptyStats(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="card-premium scrollbar-thin max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 font-display text-2xl font-black text-white">{title}</h2>
        <div className="space-y-3">
          <Field label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Country"><input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} className={inputCls} /></Field>
            <Field label="Role">
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as PlayerRole })} className={inputCls}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Batting">
              <select value={form.battingStyle} onChange={(e) => setForm({ ...form, battingStyle: e.target.value as Player['battingStyle'] })} className={inputCls}>
                <option>Right-handed</option><option>Left-handed</option>
              </select>
            </Field>
            <Field label="Bowling">
              <select value={form.bowlingStyle} onChange={(e) => setForm({ ...form, bowlingStyle: e.target.value as Player['bowlingStyle'] })} className={inputCls}>
                {['None', 'Right-arm fast', 'Right-arm medium', 'Left-arm fast', 'Left-arm medium', 'Off break', 'Leg break', 'Left-arm orthodox'].map((b) => <option key={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Base Price (Cr)">
              <input value={form.basePriceCr} inputMode="decimal" onChange={(e) => setForm({ ...form, basePriceCr: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Rating (40–99)">
              <input value={form.rating} inputMode="numeric" onChange={(e) => setForm({ ...form, rating: e.target.value.replace(/\D/g, '').slice(0, 2) })} className={inputCls} />
            </Field>
          </div>
          <Field label="Image URL (optional)">
            <input value={form.image.startsWith('/assets/') ? '' : form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" className={inputCls} />
          </Field>
        </div>
        {errors.length > 0 && (
          <ul className="mt-3 list-inside list-disc text-xs text-red-400">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white">Cancel</button>
          <button onClick={save} disabled={errors.length > 0}
            className="rounded-lg bg-gold-400 px-5 py-2 text-sm font-black text-stadium-950 transition hover:bg-gold-300 disabled:bg-stadium-700 disabled:text-slate-500">
            Save Player
          </button>
        </div>
      </div>
    </div>
  )
}

function PlayerDetailOrEdit({
  player, onClose, onSave,
}: {
  player: Player
  onClose: () => void
  onSave: (p: Player) => void
}) {
  if (player.custom) {
    return (
      <PlayerFormModal
        title="Edit Custom Player"
        initial={player}
        onClose={onClose}
        onSave={(p) => onSave({ ...p, id: player.id, custom: true })}
      />
    )
  }
  return (
    <PlayerModal
      player={player}
      onClose={onClose}
    />
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-slate-700 bg-stadium-800 px-3 py-2 text-sm text-white focus:border-gold-400 focus:outline-none'

function emptyStats() {
  return {
    matches: 0, runs: 0, average: 0, strikeRate: 0, fifties: 0, hundreds: 0,
    wickets: 0, economy: 0, bowlingAverage: 0, bestBowling: '-', catches: 0,
  }
}
