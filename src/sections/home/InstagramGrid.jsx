import { useState } from 'react'
import { motion } from 'framer-motion'
import { COLORS, FONTS } from '../../styles/theme'
import { SITE } from '../../data/site'
import SectionLabel from '../../components/ui/SectionLabel'
import Reveal from '../../components/ui/Reveal'
import { InstagramIcon } from '../../components/ui/icons'

// Imágenes DEMO — reemplazar por publicaciones reales de @arbo.patagonia.
const POSTS = [
  { id: 'p1', img: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=75', label: 'Café' },
  { id: 'p2', img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=75', label: 'Vino' },
  { id: 'p3', img: 'https://images.unsplash.com/photo-1518623001395-125242310d0c?w=600&q=75', label: 'Patagonia' },
  { id: 'p4', img: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600&q=75', label: 'Café' },
  { id: 'p5', img: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=75', label: 'Momentos' },
  { id: 'p6', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=75', label: 'Momentos' },
]

function Post({ post, index }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.a href={SITE.contact.instagramUrl} target="_blank" rel="noopener noreferrer"
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: 'relative', display: 'block', overflow: 'hidden', aspectRatio: '1 / 1' }}
      aria-label={`Ver en Instagram: ${post.label}`}
    >
      <motion.img src={post.img} alt={post.label} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        animate={{ scale: hov ? 1.08 : 1 }} transition={{ duration: 0.45 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(12,16,20,0.55)', opacity: hov ? 1 : 0, transition: 'opacity 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: COLORS.cream }}>
        <InstagramIcon />
        <span style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{post.label}</span>
      </div>
    </motion.a>
  )
}

export default function InstagramGrid() {
  return (
    <section style={{ background: COLORS.warmWhite, padding: '110px 28px' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <SectionLabel index="08" label="Comunidad" color={COLORS.green} align="center" style={{ marginBottom: 16, justifyContent: 'center' }} />
            <h2 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(30px, 4vw, 46px)', color: COLORS.greenDark, fontWeight: 400 }}>
              Desde {SITE.contact.instagramHandle}
            </h2>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 4 }}>
          {POSTS.map((p, i) => <Post key={p.id} post={p} index={i} />)}
        </div>
      </div>
    </section>
  )
}
