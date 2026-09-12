import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { CartProvider, useCartContext } from './context/CartContext'
import { usePrefersReducedMotion } from './hooks/useMediaQuery'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import WhatsAppButton from './components/WhatsAppButton'
import LoadingScreen from './components/LoadingScreen'
import Home from './pages/Home'
import Carta from './pages/Carta'
import Pedidos from './pages/Pedidos'
import Reservas from './pages/Reservas'
import Eventos from './pages/Eventos'
import Franquicia from './pages/Franquicia'
import ArboClub from './pages/ArboClub'
import { Privacidad, Terminos } from './pages/Legal'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function GlobalCartDrawer() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setDrawerOpen, setCheckoutOpen } = useCartContext()

  const handleCheckout = () => {
    setDrawerOpen(false)
    setCheckoutOpen(true)
    if (location.pathname !== '/pedidos') navigate('/pedidos')
  }

  return <CartDrawer onCheckout={handleCheckout} />
}

function GlobalWhatsApp() {
  const location = useLocation()
  const { itemCount } = useCartContext()
  const lifted = location.pathname === '/pedidos' && itemCount > 0
  return <WhatsAppButton lifted={lifted} />
}

function AppShell() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/carta" element={<Carta />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/franquicia" element={<Franquicia />} />
          <Route path="/arbo-club" element={<ArboClub />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <GlobalCartDrawer />
      <GlobalWhatsApp />
    </>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), reduced ? 0 : 1100)
    return () => clearTimeout(t)
  }, [reduced])

  return (
    <CartProvider>
      <AnimatePresence>
        {loading && <LoadingScreen key="loading" />}
      </AnimatePresence>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </CartProvider>
  )
}
