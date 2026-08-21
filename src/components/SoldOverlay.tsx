import { motion, AnimatePresence } from 'framer-motion'
import PlayerImage from './PlayerImage'

export interface OverlayData {
  kind: 'sold' | 'unsold'
  playerName: string
  price: number
  teamName: string
  teamLogo?: string
  teamColor: string
  playerImage?: string
  basePrice?: number
}

interface Props {
  data: OverlayData | null
}

export default function ResultOverlay({ data }: Props) {
  return (
    <AnimatePresence>
      {data && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {data.kind === 'sold' ? (
            <motion.div
              initial={{ scale: 0.6, rotateX: 40, opacity: 0 }}
              animate={{ scale: 1, rotateX: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="card-premium relative mx-4 w-full max-w-md overflow-hidden rounded-2xl p-8 text-center"
            >
              <div
                className="absolute inset-x-0 top-0 h-1.5"
                style={{ background: `linear-gradient(90deg, ${data.teamColor}, transparent)` }}
              />
              <motion.h1
                className="text-glow-gold font-display text-6xl font-black tracking-widest text-gold-400"
                initial={{ letterSpacing: '0.6em', opacity: 0 }}
                animate={{ letterSpacing: '0.15em', opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                SOLD!
              </motion.h1>
              <div className="mt-6 flex items-center justify-center gap-5">
                <PlayerImage player={null} className="h-24 w-24" rounded="rounded-2xl" />
                <div className="text-left">
                  <p className="text-xl font-bold text-white">{data.playerName}</p>
                  <motion.p
                    className="font-display text-4xl font-black text-emerald-300"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.35, type: 'spring' }}
                  >
                    ₹{formatPrice(data.price)}
                  </motion.p>
                </div>
              </div>
              <motion.div
                className="mt-6 flex items-center justify-center gap-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {data.teamLogo && (
                  <img src={data.teamLogo} alt="" className="h-10 w-10 object-contain" />
                )}
                <span className="text-lg font-bold" style={{ color: data.teamColor }}>
                  {data.teamName}
                </span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              className="card-premium mx-4 w-full max-w-sm rounded-2xl p-8 text-center"
            >
              <motion.h1
                className="font-display text-5xl font-black tracking-[0.2em] text-slate-400"
                initial={{ letterSpacing: '0.7em', opacity: 0 }}
                animate={{ letterSpacing: '0.2em', opacity: 1 }}
                transition={{ duration: 0.45 }}
              >
                UNSOLD
              </motion.h1>
              <p className="mt-5 text-xl font-bold text-white">{data.playerName}</p>
              <p className="mt-1 text-sm text-slate-500">
                Base price ₹{formatPrice(data.basePrice ?? data.price)}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function formatPrice(lakh: number): string {
  if (lakh >= 100) return `${(lakh / 100).toFixed(2).replace(/\.00$/, '')} Cr`
  return `${lakh} L`
}
