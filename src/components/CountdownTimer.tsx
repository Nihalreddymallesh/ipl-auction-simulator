import { motion } from 'framer-motion'

interface Props {
  remaining: number
  total: number
}

export default function CountdownTimer({ remaining, total }: Props) {
  const pct = total > 0 ? (remaining / total) * 100 : 0
  const urgent = remaining <= 3
  return (
    <div className="flex items-center gap-3">
      <motion.div
        key={remaining}
        initial={{ scale: urgent ? 1.25 : 1.08, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className={`flex h-14 w-14 items-center justify-center rounded-full border-2 font-display text-2xl font-black ${
          urgent
            ? 'border-red-500 bg-red-500/15 text-red-300'
            : 'border-gold-400/60 bg-gold-400/10 text-gold-300'
        }`}
      >
        {remaining}
      </motion.div>
      <div className="h-2 w-28 overflow-hidden rounded-full bg-stadium-700">
        <motion.div
          className={`h-full rounded-full ${urgent ? 'bg-red-500' : 'bg-gold-400'}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  )
}
