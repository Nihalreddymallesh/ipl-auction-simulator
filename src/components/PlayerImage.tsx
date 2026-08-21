import { useState } from 'react'
import type { Player } from '../types'
import { playerInitials } from '../utils/imageFallback'

interface Props {
  player?: Player | null
  className?: string
  rounded?: string
}

export default function PlayerImage({ player, className = '', rounded = 'rounded-xl' }: Props) {
  const [failed, setFailed] = useState(false)
  const showImg = player?.image && !failed

  if (!showImg) {
    const { bg, fg } = seedColors(player?.name ?? '?')
    return (
      <div
        className={`${className} ${rounded} flex flex-col items-center justify-center select-none`}
        style={{ background: `linear-gradient(140deg, ${bg}, #0b1220)` }}
      >
        <span className="text-4xl font-black tracking-wide" style={{ color: fg }}>
          {playerInitials(player?.name ?? '?')}
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest opacity-80">
          {player?.role ?? 'Player'}
        </span>
        <span className="text-[10px] uppercase tracking-widest opacity-60">
          {player?.nationality ?? ''}
        </span>
      </div>
    )
  }

  return (
    <img
      src={player!.image}
      alt={player!.name}
      onError={() => setFailed(true)}
      className={`${className} ${rounded} object-cover`}
      draggable={false}
    />
  )
}

function seedColors(seed: string): { bg: string; fg: string } {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  const hue = Math.abs(hash) % 360
  return { bg: `hsl(${hue}, 45%, 22%)`, fg: `hsl(${hue}, 70%, 78%)` }
}
