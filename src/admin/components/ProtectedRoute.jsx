import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ArboSprout from '../ui/ArboSprout'

// Misma lógica de protección; la espera usa el brote de marca en vez de un spinner.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div role="status" aria-label="Iniciando sesión" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
        background: '#F7F4EE', color: '#4B5750', fontFamily: "'Manrope', system-ui, sans-serif",
      }}>
        <ArboSprout size={48} color="#527A63" />
        <p style={{ fontSize: 14 }}>Preparando ARBO OS…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirige al login guardando la ruta intentada para volver luego
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}
