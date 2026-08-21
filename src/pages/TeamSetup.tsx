import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Plus, Copy, Trash2, Upload, Users,
} from 'lucide-react'
import type { Team, AIDifficulty, AuctionRules } from '../types'
import { MAX_TEAMS, MIN_TEAMS, AI_DIFFICULTY_LABELS, AI_DIFFICULTY_DESCRIPTIONS } from '../config/auctionRules'
import { validateTeamSetup } from '../utils/validation'
import { uid } from '../utils/calculations'
import { formatLakh, parseBudgetInput } from '../utils/currency'
import TeamLogo from '../components/TeamLogo'

const PALETTE = [
  ['#045093', '#d1ab3e'], ['#f9cd05', '#005db8'], ['#d5152b', '#211a1c'],
  ['#3a225d', '#f0bc42'], ['#17449b', '#ef1b23'], ['#ea1a85', '#124b9b'],
  ['#dd1f2d', '#a7a9ac'], ['#f26522', '#111111'], ['#1b2133', '#b4945a'],
  ['#005baa', '#f78d1e'], ['#0f766e', '#5eead4'], ['#7c2d12', '#fed7aa'],
  ['#4c1d95', '#c4b5fd'], ['#065f46', '#6ee7b7'], ['#1e3a8a', '#93c5fd'],
  ['#831843', '#f9a8d4'], ['#374151', '#d1d5db'], ['#713f12', '#fde68a'],
  ['#134e4a', '#99f6e4'], ['#450a0a', '#fca5a5'],
]

interface Props {
  initialTeams?: Team[]
  initialRules?: AuctionRules
  initialDifficulty?: AIDifficulty
  leagueName: string
  onBack: () => void
  onConfirm: (teams: Team[], rules: AuctionRules, difficulty: AIDifficulty) => void
}

function makeTeam(index: number): Team {
  const [primary, secondary] = PALETTE[index % PALETTE.length]
  return {
    id: uid('team-'),
    name: `Team ${index + 1}`,
    shortName: `T${index + 1}`,
    logo: undefined,
    primaryColor: primary,
    secondaryColor: secondary,
    budget: 9000,
    purse: 9000,
    controller: 'ai',
    aiProfile: {
      aggressiveness: 0.35 + Math.random() * 0.5,
      riskTolerance: Math.random(),
      preferredRoles: [],
    },
  }
}

export default function TeamSetup({
  initialTeams, initialRules, initialDifficulty = 'medium', leagueName, onBack, onConfirm,
}: Props) {
  const [teams, setTeams] = useState<Team[]>(
    initialTeams && initialTeams.length >= MIN_TEAMS
      ? initialTeams
      : Array.from({ length: 8 }, (_, i) => makeTeam(i)),
  )
  const [rules, setRules] = useState<AuctionRules>(
    initialRules ?? {
      bidIncrement: 20, timerSeconds: 10, maxSquadSize: 16, minSquadSize: 12,
      maxOverseasPlayers: 6, playerOrder: 'role-based', currencyUnit: 'lakh',
    },
  )
  const [difficulty, setDifficulty] = useState<AIDifficulty>(initialDifficulty)
  const [touched, setTouched] = useState(false)

  const validation = useMemo(() => validateTeamSetup(teams), [teams])
  const totalPurse = teams.reduce((s, t) => s + t.budget, 0)

  const updateTeam = (id: string, patch: Partial<Team>) =>
    setTeams((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)))

  const addTeam = () => {
    if (teams.length >= MAX_TEAMS) return
    setTeams((ts) => [...ts, makeTeam(ts.length)])
  }

  const removeTeam = (id: string) => {
    if (teams.length <= MIN_TEAMS) return
    setTeams((ts) => ts.filter((t) => t.id !== id))
  }

  const duplicateTeam = (id: string) => {
    if (teams.length >= MAX_TEAMS) return
    setTeams((ts) => {
      const idx = ts.findIndex((t) => t.id === id)
      const src = ts[idx]
      const copy: Team = { ...src, id: uid('team-'), name: `${src.name} II`, controller: 'ai' }
      return [...ts.slice(0, idx + 1), copy, ...ts.slice(idx + 1)]
    })
  }

  const handleLogoUpload = (id: string, file: File) => {
    const reader = new FileReader()
    reader.onload = () => updateTeam(id, { logo: reader.result as string })
    reader.readAsDataURL(file)
  }

  const confirm = () => {
    setTouched(true)
    if (!validation.valid) return
    // ensure exactly one user team: first user team wins, rest become AI
    const firstUserIdx = teams.findIndex((t) => t.controller === 'user')
    const finalTeams = teams.map((t, i) => ({
      ...t,
      name: t.name.trim() || `Team ${i + 1}`,
      purse: t.budget,
      controller: i === firstUserIdx ? ('user' as const) : ('ai' as const),
    }))
    onConfirm(finalTeams, rules, difficulty)
  }

  return (
    <div className="stadium-bg min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-stadium-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="font-display text-xl font-black tracking-wide text-white sm:text-2xl">
            CONFIGURE <span className="text-gold-400">{leagueName.toUpperCase()}</span>
          </h1>
          <button
            onClick={confirm}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition ${
              validation.valid
                ? 'bg-gold-400 text-stadium-950 hover:bg-gold-300'
                : 'bg-stadium-700 text-slate-500'
            }`}
          >
            Next: Players <ArrowRight size={16} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 pb-32">
        {/* validation errors */}
        {touched && !validation.valid && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4">
            <ul className="list-inside list-disc space-y-1 text-sm text-red-300">
              {validation.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        {/* team count + summary */}
        <section className="card-premium rounded-xl p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <Users size={22} className="text-gold-400" />
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Number of Teams</label>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    onClick={() => teams.length > MIN_TEAMS && setTeams((ts) => ts.slice(0, -1))}
                    className="h-8 w-8 rounded-lg bg-stadium-700 font-black text-white hover:bg-stadium-600"
                  >−</button>
                  <span className="w-10 text-center font-display text-2xl font-black text-white">{teams.length}</span>
                  <button
                    onClick={addTeam}
                    disabled={teams.length >= MAX_TEAMS}
                    className="h-8 w-8 rounded-lg bg-stadium-700 font-black text-white hover:bg-stadium-600 disabled:opacity-30"
                  >+</button>
                </div>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs uppercase tracking-wider text-slate-500">Combined Purse</p>
              <p className="font-display text-2xl font-black text-emerald-300">{formatLakh(totalPurse)}</p>
            </div>
          </div>
        </section>

        {/* rules */}
        <section className="card-premium grid grid-cols-2 gap-4 rounded-xl p-5 sm:grid-cols-3 lg:grid-cols-6">
          <NumberField label="Bid Increment (L)" value={rules.bidIncrement} min={5} max={100} step={5}
            onChange={(v) => setRules({ ...rules, bidIncrement: v })} />
          <NumberField label="Timer (sec)" value={rules.timerSeconds} min={5} max={30}
            onChange={(v) => setRules({ ...rules, timerSeconds: v })} />
          <NumberField label="Max Squad" value={rules.maxSquadSize} min={8} max={25}
            onChange={(v) => setRules({ ...rules, maxSquadSize: v })} />
          <NumberField label="Min Squad" value={rules.minSquadSize} min={5} max={rules.maxSquadSize - 1}
            onChange={(v) => setRules({ ...rules, minSquadSize: v })} />
          <NumberField label="Max Overseas" value={rules.maxOverseasPlayers} min={1} max={rules.maxSquadSize}
            onChange={(v) => setRules({ ...rules, maxOverseasPlayers: v })} />
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Player Order</label>
            <select
              value={rules.playerOrder}
              onChange={(e) => setRules({ ...rules, playerOrder: e.target.value as AuctionRules['playerOrder'] })}
              className="w-full rounded-lg border border-slate-700 bg-stadium-800 px-2 py-2 text-sm text-white"
            >
              <option value="role-based">Role-based</option>
              <option value="random">Random</option>
              <option value="rating-desc">Top rating first</option>
            </select>
          </div>
        </section>

        {/* AI difficulty */}
        <section className="card-premium rounded-xl p-5">
          <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">AI Difficulty</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(AI_DIFFICULTY_LABELS) as AIDifficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`rounded-lg border p-3 text-left transition ${
                  difficulty === d
                    ? 'border-gold-400 bg-gold-400/10'
                    : 'border-slate-700 bg-stadium-800 hover:border-slate-600'
                }`}
              >
                <p className={`text-sm font-bold ${difficulty === d ? 'text-gold-300' : 'text-slate-200'}`}>
                  {AI_DIFFICULTY_LABELS[d]}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{AI_DIFFICULTY_DESCRIPTIONS[d]}</p>
              </button>
            ))}
          </div>
        </section>

        {/* team cards */}
        <section className="grid gap-4 md:grid-cols-2">
          {teams.map((team, idx) => (
            <motion.div key={team.id} layout className="card-premium rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-2">
                  <TeamLogo team={team} size={56} />
                  <label className="cursor-pointer rounded-md bg-stadium-700 p-1.5 text-slate-300 transition hover:bg-stadium-600 hover:text-white" title="Upload logo">
                    <Upload size={14} />
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleLogoUpload(team.id, e.target.files[0])} />
                  </label>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Team {idx + 1}</span>
                    <div className="flex gap-1">
                      <IconBtn title="Duplicate" onClick={() => duplicateTeam(team.id)}><Copy size={13} /></IconBtn>
                      <IconBtn title="Remove" danger disabled={teams.length <= MIN_TEAMS} onClick={() => removeTeam(team.id)}>
                        <Trash2 size={13} />
                      </IconBtn>
                    </div>
                  </div>
                  <input
                    value={team.name}
                    onChange={(e) => updateTeam(team.id, { name: e.target.value })}
                    placeholder="Team name"
                    className="w-full rounded-lg border border-slate-700 bg-stadium-800 px-3 py-1.5 text-sm font-bold text-white focus:border-gold-400 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      value={team.shortName}
                      onChange={(e) => updateTeam(team.id, { shortName: e.target.value.slice(0, 4) })}
                      placeholder="ABR"
                      className="w-16 rounded-lg border border-slate-700 bg-stadium-800 px-2 py-1.5 text-center text-sm font-black uppercase text-white focus:border-gold-400 focus:outline-none"
                    />
                    <BudgetInput team={team} onChange={(v) => updateTeam(team.id, { budget: v })} />
                  </div>
                  <div className="flex items-center gap-2">
                    <ColorInput value={team.primaryColor} onChange={(c) => updateTeam(team.id, { primaryColor: c })} label="Primary" />
                    <ColorInput value={team.secondaryColor} onChange={(c) => updateTeam(team.id, { secondaryColor: c })} label="Accent" />
                    <ControllerToggle
                      value={team.controller}
                      onChange={(c) => {
                        setTeams((ts) => {
                          if (c === 'user') return ts.map((t) => ({ ...t, controller: t.id === team.id ? 'user' : 'ai' }))
                          return ts.map((t) => (t.id === team.id ? { ...t, controller: c } : t))
                        })
                      }}
                    />
                  </div>
                  <input
                    value={team.logo?.startsWith('data:') ? '' : team.logo ?? ''}
                    onChange={(e) => updateTeam(team.id, { logo: e.target.value || undefined })}
                    placeholder="Logo URL (optional)"
                    className="w-full rounded-lg border border-slate-700 bg-stadium-800 px-3 py-1 text-xs text-slate-300 focus:border-gold-400 focus:outline-none"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        <button
          onClick={addTeam}
          disabled={teams.length >= MAX_TEAMS}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700 py-4 text-sm font-bold text-slate-400 transition hover:border-gold-400/50 hover:text-gold-300 disabled:opacity-30"
        >
          <Plus size={16} /> Add Team ({teams.length}/{MAX_TEAMS})
        </button>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-800 bg-stadium-950/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {validation.valid ? 'All checks passed.' : validation.errors[0]}
          </p>
          <button
            onClick={confirm}
            className={`rounded-lg px-6 py-2.5 text-sm font-black transition ${
              validation.valid
                ? 'bg-gold-400 text-stadium-950 hover:bg-gold-300'
                : 'bg-stadium-700 text-slate-500'
            }`}
          >
            CONTINUE TO PLAYERS →
          </button>
        </div>
      </div>
    </div>
  )
}

function BudgetInput({ team, onChange }: { team: Team; onChange: (lakh: number) => void }) {
  const [raw, setRaw] = useState(String(team.budget / 100))
  return (
    <div className="relative flex-1">
      <input
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value)
          const parsed = parseBudgetInput(e.target.value)
          if (parsed !== null && parsed > 0) onChange(parsed)
        }}
        onBlur={() => setRaw(String(team.budget / 100))}
        inputMode="decimal"
        className="w-full rounded-lg border border-slate-700 bg-stadium-800 px-3 py-1.5 text-sm font-bold text-emerald-300 focus:border-gold-400 focus:outline-none"
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase text-slate-500">Cr</span>
    </div>
  )
}

function ColorInput({ value, onChange, label }: { value: string; onChange: (c: string) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-stadium-800 px-2 py-1.5" title={label}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
      />
      <span className="text-[10px] font-semibold uppercase text-slate-400">{label}</span>
    </label>
  )
}

function ControllerToggle({ value, onChange }: { value: 'user' | 'ai'; onChange: (c: 'user' | 'ai') => void }) {
  return (
    <div className="ml-auto flex overflow-hidden rounded-lg border border-slate-700">
      {(['user', 'ai'] as const).map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide transition ${
            value === c ? (c === 'user' ? 'bg-gold-400 text-stadium-950' : 'bg-blue-500 text-white') : 'bg-stadium-800 text-slate-500'
          }`}
        >
          {c === 'user' ? 'You' : 'AI'}
        </button>
      ))}
    </div>
  )
}

function IconBtn({
  children, onClick, title, danger, disabled,
}: {
  children: React.ReactNode; onClick: () => void; title: string; danger?: boolean; disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`rounded-md p-1.5 transition ${
        danger ? 'bg-red-500/10 text-red-400 hover:bg-red-500/25' : 'bg-stadium-700 text-slate-300 hover:bg-stadium-600'
      } disabled:opacity-30`}
    >
      {children}
    </button>
  )
}

function NumberField({
  label, value, onChange, min, max, step = 1,
}: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const v = Number(e.target.value)
          if (!Number.isNaN(v)) onChange(Math.min(max, Math.max(min, Math.round(v))))
        }}
        className="w-full rounded-lg border border-slate-700 bg-stadium-800 px-2 py-2 text-sm font-bold text-white focus:border-gold-400 focus:outline-none"
      />
    </div>
  )
}
