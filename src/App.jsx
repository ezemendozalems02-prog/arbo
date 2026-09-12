import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { SiteProvider } from './context/SiteContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import NuestraSelva from './pages/Nosotros'
import Menu from './pages/Menu'
import Galeria from './pages/Galeria'
import Contacto from './pages/Contacto'
import Admin from './pages/Admin'
import TakeAway from './pages/TakeAway'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function PublicLayout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/nuestra-selva"  element={<NuestraSelva />} />
          <Route path="/nosotros"       element={<NuestraSelva />} />
          <Route path="/menu"           element={<Menu />} />
          <Route path="/galeria"        element={<Galeria />} />
          <Route path="/contacto"       element={<Contacto />} />
          <Route path="/takeaway"       element={<TakeAway />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

function AppRoutes() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  if (isAdmin) return <Routes><Route path="/admin" element={<Admin />} /></Routes>
  return <PublicLayout />
}

export default function App() {
  return (
    <SiteProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </SiteProvider>
  )
}
