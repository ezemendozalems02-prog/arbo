// Espejo JS de los tokens de os.css para estilos inline. Cada valor es una
// referencia `var(--os-…)`: la fuente de verdad sigue siendo el CSS, así un
// cambio de paleta (o un modo oscuro) nunca deja estilos inline desfasados.

const v = (name) => `var(--os-${name})`

export const OS = {
  color: {
    forest: v('forest'), deep: v('deep'), leaf: v('leaf'), leafSoft: v('leaf-soft'),
    sand: v('sand'), cream: v('cream'), white: v('white'), gold: v('gold'),
    ink: v('ink'), ink2: v('ink-2'), ink3: v('ink-3'),
    inkInverse: v('ink-inverse'), inkInverse2: v('ink-inverse-2'), inkInverse3: v('ink-inverse-3'),
    bg: v('bg'), surface: v('surface'), surface2: v('surface-2'), surface3: v('surface-3'),
    surfaceInverse: v('surface-inverse'), overlay: v('overlay'),
    line: v('line'), lineStrong: v('line-strong'), lineInverse: v('line-inverse'),
    success: v('success'), successBg: v('success-bg'),
    warning: v('warning'), warningBg: v('warning-bg'),
    danger: v('danger'), dangerBg: v('danger-bg'),
    info: v('info'), infoBg: v('info-bg'),
  },
  font: { display: v('font-display'), ui: v('font-ui'), mono: v('font-mono') },
  text: {
    display: v('text-display'), title: v('text-title'), heading: v('text-heading'),
    body: v('text-body'), sm: v('text-sm'), caption: v('text-caption'), label: v('text-label'), data: v('text-data'),
  },
  space: (n) => v(`space-${n}`),
  radius: { xs: v('radius-xs'), sm: v('radius-sm'), md: v('radius-md'), lg: v('radius-lg'), xl: v('radius-xl'), xxl: v('radius-2xl'), pill: v('radius-pill') },
  shadow: { sm: v('shadow-sm'), card: v('shadow-card'), elevated: v('shadow-elevated'), floating: v('shadow-floating') },
  z: { sidebar: v('z-sidebar'), topbar: v('z-topbar'), dropdown: v('z-dropdown'), drawer: v('z-drawer'), modal: v('z-modal'), toast: v('z-toast'), tour: v('z-tour'), palette: v('z-palette') },
}

// Estilos de texto reutilizables (roles tipográficos del sistema).
export const TYPE = {
  display: { fontFamily: OS.font.display, fontSize: OS.text.display, fontWeight: 500, lineHeight: 1.1, color: OS.color.ink },
  title: { fontFamily: OS.font.display, fontSize: OS.text.title, fontWeight: 500, lineHeight: 1.15, color: OS.color.ink },
  heading: { fontFamily: OS.font.ui, fontSize: OS.text.heading, fontWeight: 700, lineHeight: 1.3, color: OS.color.ink },
  body: { fontFamily: OS.font.ui, fontSize: OS.text.body, color: OS.color.ink2, lineHeight: 1.55 },
  caption: { fontFamily: OS.font.ui, fontSize: OS.text.caption, color: OS.color.ink3, lineHeight: 1.45 },
  label: { fontFamily: OS.font.ui, fontSize: OS.text.label, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: OS.color.ink3 },
  data: { fontFamily: OS.font.ui, fontSize: OS.text.data, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, color: OS.color.ink, fontVariantNumeric: 'tabular-nums' },
}
