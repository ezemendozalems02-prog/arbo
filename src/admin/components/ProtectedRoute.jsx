import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { COLORS, FONTS } from '../../styles/theme'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.cream,
        color: COLORS.forest,
        fontFamily: FONTS.serif,
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: `3px solid ${COLORS.gold}30`,
          borderTopColor: COLORS.gold,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: 16,
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>Iniciando sesión segura en ARBO OS...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirige al login guardando la ruta intentada para volver luego
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}
