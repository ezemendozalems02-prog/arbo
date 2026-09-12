import { motion } from 'framer-motion'
import { COLORS, FONTS } from '../styles/theme'

// Intro de marca ~1s: ARBO, una línea se dibuja, TREVELIN · PATAGONIA.
export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: COLORS.black,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}
      aria-hidden="true"
    >
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        style={{
          fontFamily: FONTS.serif, color: COLORS.cream, fontSize: 'clamp(40px, 8vw, 64px)',
          letterSpacing: '0.16em', fontWeight: 500, marginBottom: 18,
        }}
      >
        ARBO
      </motion.h1>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 72 }}
        transition={{ duration: 0.55, delay: 0.3 }}
        style={{ height: 1, background: COLORS.green, marginBottom: 18 }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.62 }}
        style={{
          fontFamily: FONTS.sans, color: COLORS.onDarkMuted, fontSize: 11,
          letterSpacing: '0.4em', textTransform: 'uppercase',
        }}
      >
        Trevelin · Patagonia
      </motion.p>
    </motion.div>
  )
}
