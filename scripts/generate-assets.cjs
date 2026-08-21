/**
 * Generates local SVG assets:
 *  - public/assets/teams/<id>.svg      : clean team crests (initials + colors)
 *  - public/assets/players/<id>.svg    : player avatars (initials + role)
 *
 * These are original generated graphics so the project never depends on
 * copyrighted logos/photos and never shows broken images. See ASSETS.md.
 */
const fs = require('fs')
const path = require('path')

const TEAMS = [
  ['mi', 'Mumbai Indians', 'MI', '#045093', '#d1ab3e'],
  ['csk', 'Chennai Super Kings', 'CSK', '#f9cd05', '#005db8'],
  ['rcb', 'Royal Challengers Bengaluru', 'RCB', '#d5152b', '#211a1c'],
  ['kkr', 'Kolkata Knight Riders', 'KKR', '#3a225d', '#f0bc42'],
  ['dc', 'Delhi Capitals', 'DC', '#17449b', '#ef1b23'],
  ['rr', 'Rajasthan Royals', 'RR', '#ea1a85', '#124b9b'],
  ['pbks', 'Punjab Kings', 'PBKS', '#dd1f2d', '#a7a9ac'],
  ['srh', 'Sunrisers Hyderabad', 'SRH', '#f26522', '#111111'],
  ['gt', 'Gujarat Titans', 'GT', '#1b2133', '#b4945a'],
  ['lsg', 'Lucknow Super Giants', 'LSG', '#005baa', '#f78d1e'],
]

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function darken(hex, f = 0.55) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.round(((n >> 16) & 255) * f)
  const g = Math.round(((n >> 8) & 255) * f)
  const b = Math.round((n & 255) * f)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

function crest(id, name, short, primary, secondary) {
  const textOnPrimary = luminance(primary) > 0.6 ? '#101418' : '#ffffff'
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="g-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${darken(primary)}"/>
    </linearGradient>
  </defs>
  <path d="M100 8 L182 34 V104 C182 148 146 176 100 192 C54 176 18 148 18 104 V34 Z"
        fill="url(#g-${id})" stroke="${secondary}" stroke-width="7"/>
  <path d="M100 26 L166 46 V102 C166 138 138 161 100 175 C62 161 34 138 34 102 V46 Z"
        fill="none" stroke="${secondary}" stroke-width="2.5" opacity="0.85"/>
  <circle cx="100" cy="86" r="40" fill="${secondary}" opacity="0.16"/>
  <text x="100" y="103" text-anchor="middle" font-family="Arial Black, Arial, sans-serif"
        font-size="44" font-weight="900" fill="${textOnPrimary}" letter-spacing="2">${esc(short)}</text>
  <rect x="52" y="126" width="96" height="5" rx="2.5" fill="${secondary}" opacity="0.9"/>
</svg>`
}

const ROLE_COLORS = {
  Batsman: ['#2563eb', '#93c5fd'],
  Wicketkeeper: ['#16a34a', '#86efac'],
  'All-rounder': ['#9333ea', '#d8b4fe'],
  'Fast Bowler': ['#dc2626', '#fca5a5'],
  'Spin Bowler': ['#ea580c', '#fdba74'],
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

function avatar(id, name, role, country) {
  const [c1, c2] = ROLE_COLORS[role] ?? ['#334155', '#94a3b8']
  const ini = initials(name)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
  <defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="#0b1220"/>
    </linearGradient>
  </defs>
  <rect width="240" height="240" rx="24" fill="url(#bg-${id})"/>
  <circle cx="120" cy="120" r="92" fill="none" stroke="${c2}" stroke-width="3" opacity="0.35"/>
  <circle cx="120" cy="120" r="78" fill="none" stroke="${c2}" stroke-width="1.5" opacity="0.25"/>
  <text x="120" y="140" text-anchor="middle" font-family="Arial Black, Arial, sans-serif"
        font-size="72" font-weight="900" fill="#ffffff" opacity="0.95">${esc(ini)}</text>
  <text x="120" y="196" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="17" font-weight="700" fill="${c2}" letter-spacing="3">${esc(role.toUpperCase())}</text>
  <text x="120" y="42" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="14" font-weight="600" fill="#e2e8f0" letter-spacing="2" opacity="0.8">${esc(country.toUpperCase())}</text>
</svg>`
}

// ---- players: parse from src/data/players.ts rows ----
const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'players.ts'), 'utf8')
const rowRe = /\['([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'[^']*',\s*'[^']*',/g
const players = []
let m
while ((m = rowRe.exec(src)) !== null) {
  players.push({ id: m[1].trim(), name: m[2].trim(), country: m[3], role: m[4] })
}

const teamsDir = path.join(__dirname, '..', 'public', 'assets', 'teams')
const playersDir = path.join(__dirname, '..', 'public', 'assets', 'players')
fs.mkdirSync(teamsDir, { recursive: true })
fs.mkdirSync(playersDir, { recursive: true })

TEAMS.forEach(([id, name, short, p, s]) => {
  fs.writeFileSync(path.join(teamsDir, `${id}.svg`), crest(id, name, short, p, s))
})

let count = 0
players.forEach((p) => {
  if (!p.id || !p.name) return
  fs.writeFileSync(path.join(playersDir, `${p.id}.svg`), avatar(p.id, p.name, p.role, p.country))
  count++
})

console.log(`Generated ${TEAMS.length} team crests and ${count} player avatars.`)
