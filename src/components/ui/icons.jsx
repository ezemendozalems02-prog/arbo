// Iconografía propia, fina y consistente (stroke 1.5), en vez de mezclar
// varias librerías de íconos.

const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const CartIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20.5 8H6" />
    <circle cx="9.5" cy="21" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="17.5" cy="21" r="1.4" fill="currentColor" stroke="none" />
  </svg>
)

export const MenuIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

export const CloseIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M5 5l14 14M19 5L5 19" />
  </svg>
)

export const InstagramIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.6" cy="6.4" r="0.6" fill="currentColor" stroke="none" />
  </svg>
)

export const ChevronDownIcon = (props) => (
  <svg {...base} {...props}><path d="M6 9l6 6 6-6" /></svg>
)

export const ArrowRightIcon = (props) => (
  <svg {...base} {...props}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)

export const CheckIcon = (props) => (
  <svg {...base} {...props}><path d="M5 13l4 4L19 7" /></svg>
)

export const LeafIcon = (props) => (
  <svg {...base} fill="currentColor" stroke="none" {...props}>
    <path d="M17 8C8 10 5.9 16.17 3.82 19.34L5.71 21c1-1.66 2.13-3.26 3.51-4.53 1.32-1.21 2.82-2.1 4.64-2.5-.74 1.64-1.9 3.03-3.38 4.03L12 20l4-6.5C17.84 11.84 18.5 10 17 8z" />
  </svg>
)

export const WineGlassIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M7 3h10l-1 6a4 4 0 0 1-8 0L7 3Z" />
    <path d="M12 13v6M8 21h8" />
  </svg>
)

export const CoffeeIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" />
    <path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17" />
    <path d="M7 4c0 1-1 1-1 2M11 4c0 1-1 1-1 2" />
  </svg>
)
