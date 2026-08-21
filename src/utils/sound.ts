/**
 * Lightweight WebAudio sound engine — no external audio files required.
 * All sounds are synthesized so the app works fully offline.
 */

let ctx: AudioContext | null = null
let muted = false

export function setMuted(m: boolean): void {
  muted = m
}

export function isMuted(): boolean {
  return muted
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(
  freq: number,
  durationMs: number,
  type: OscillatorType = 'sine',
  gain = 0.08,
  delayMs = 0,
): void {
  const c = getCtx()
  if (!c || muted) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(0, c.currentTime + delayMs / 1000)
  g.gain.linearRampToValueAtTime(gain, c.currentTime + delayMs / 1000 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + delayMs / 1000 + durationMs / 1000)
  osc.connect(g).connect(c.destination)
  osc.start(c.currentTime + delayMs / 1000)
  osc.stop(c.currentTime + delayMs / 1000 + durationMs / 1000)
}

export const sounds = {
  bid(): void {
    tone(660, 120, 'square', 0.05)
    tone(880, 100, 'square', 0.04, 60)
  },
  timerWarning(): void {
    tone(440, 150, 'triangle', 0.06)
  },
  sold(): void {
    tone(523, 180, 'sawtooth', 0.07)
    tone(659, 180, 'sawtooth', 0.07, 140)
    tone(784, 320, 'sawtooth', 0.08, 280)
  },
  unsold(): void {
    tone(330, 250, 'triangle', 0.06)
    tone(220, 400, 'triangle', 0.06, 200)
  },
  start(): void {
    tone(392, 150, 'square', 0.05)
    tone(523, 150, 'square', 0.05, 130)
    tone(659, 260, 'square', 0.06, 260)
  },
}
