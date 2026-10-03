import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
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
import OrderTracking from './pages/OrderTracking'
import { Privacidad, Terminos } from './pages/Legal'
import { AuthProvider } from './context/AuthContext'

// ARBO OS se descarga aparte: quien visita el sitio público no carga el admin.
const AdminApp = lazy(() => import('./admin/AdminApp'))
const isAdminPath = () => typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')

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

function PublicShell() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/carta" element={<Carta />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/store/:slug" element={<Pedidos />} />
          <Route path="/order/:token" element={<OrderTracking />} />
          <Route path="/pedidos/tracking/:token" element={<OrderTracking />} />
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
  // La intro de marca es para el sitio público; en ARBO OS, que se usa todo
  // el día, sería una espera innecesaria en cada recarga.
  const [loading, setLoading] = useState(() => !isAdminPath())
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), reduced ? 0 : 1100)
    return () => clearTimeout(t)
  }, [reduced])

  return (
    <AuthProvider>
      <CartProvider>
        <AnimatePresence>
          {loading && <LoadingScreen key="loading" />}
        </AnimatePresence>
        <BrowserRouter>
          <Routes>
            {/* ARBO OS (admin) tiene su propio layout y autenticación estricta — nunca comparte
                Navbar/Footer/carrito del sitio público. */}
            <Route path="/admin/*" element={
              <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F7F4EE' }} />}>
                <AdminApp />
              </Suspense>
            } />
            <Route path="/*" element={<PublicShell />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
