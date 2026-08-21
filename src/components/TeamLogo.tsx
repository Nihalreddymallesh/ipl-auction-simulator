import { useState } from 'react'
import type { Team } from '../types'
import { teamInitials } from '../utils/imageFallback'

interface Props {
  team: Pick<Team, 'name' | 'logo' | 'primaryColor' | 'secondaryColor'>
  size?: number
  className?: string
}

export default function TeamLogo({ team, size = 40, className = '' }: Props) {
  const [failed, setFailed] = useState(false)

  if (team.logo && !failed) {
    return (
      <img
        src={team.logo}
        alt={team.name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
        draggable={false}
      />
    )
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full font-black select-none ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: `linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor})`,
        color: '#fff',
        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        border: `2px solid ${team.secondaryColor}`,
      }}
    >
      {teamInitials(team.name)}
    </div>
  )
}
