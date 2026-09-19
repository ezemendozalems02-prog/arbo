import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { COLORS, FONTS } from '../../../styles/theme'
import { isSupabaseConfigured } from '../../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/admin'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!email || !password) {
      setErrorMsg('Por favor complete todos los campos')
      return
    }

    setIsSubmitting(true)
    const result = await signIn({ email, password })
    setIsSubmitting(false)

    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setErrorMsg(result.error || 'Credenciales inválidas')
    }
  }

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setErrorMsg('')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${COLORS.greenDark} 0%, #152B20 100%)`,
      padding: '24px',
      fontFamily: FONTS.sans,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: COLORS.cream,
        borderRadius: 16,
        padding: '40px 36px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        border: `1px solid ${COLORS.lineOnLight}`,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 20,
            background: COLORS.greenSoft,
            color: COLORS.green,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            Sistema Operativo Gastronómico
          </div>
          <h1 style={{
            fontFamily: FONTS.serif,
            fontSize: 34,
            fontWeight: 600,
            color: COLORS.onLight,
            margin: '0 0 6px 0',
            letterSpacing: '-0.02em',
          }}>
            ARBO OS
          </h1>
          <p style={{
            fontSize: 14,
            color: COLORS.onLightMuted,
            margin: 0,
          }}>
            Acceso seguro a sucursal y administración
          </p>
        </div>

        {/* Indicador de estado Supabase */}
        <div style={{
          padding: '8px 12px',
          borderRadius: 8,
          background: isSupabaseConfigured ? 'rgba(48,77,59,0.1)' : 'rgba(217,119,6,0.12)',
          color: isSupabaseConfigured ? COLORS.green : '#B45309',
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 20,
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: isSupabaseConfigured ? '#10B981' : '#F59E0B',
            display: 'inline-block',
          }} />
          <span>
            {isSupabaseConfigured 
              ? 'Conectado a PostgreSQL Cloud con RLS activo'
              : 'Modo Desarrollo Local (Simulación de Sesión)'}
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            padding: '12px 14px',
            borderRadius: 8,
            background: '#FEE2E2',
            border: '1px solid #F87171',
            color: '#B91C1C',
            fontSize: 13,
            marginBottom: 20,
          }}>
            {errorMsg}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.onLight, marginBottom: 6 }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@arbo.app"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                border: `1px solid ${COLORS.lineOnLight}`,
                background: '#FFFFFF',
                fontSize: 14,
                color: COLORS.onLight,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.onLight, marginBottom: 6 }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                border: `1px solid ${COLORS.lineOnLight}`,
                background: '#FFFFFF',
                fontSize: 14,
                color: COLORS.onLight,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 8,
              background: COLORS.green,
              color: COLORS.warmWhite,
              fontSize: 15,
              fontWeight: 600,
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              marginTop: 6,
              transition: 'background 0.2s',
            }}
          >
            {isSubmitting ? 'Verificando credenciales...' : 'Ingresar a ARBO OS'}
          </button>
        </form>

        {/* Demo Fast Logins */}
        <div style={{ marginTop: 26, paddingTop: 20, borderTop: `1px solid ${COLORS.lineOnLight}` }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.onLightFaint, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px 0', textAlign: 'center' }}>
            Acceso Rápido de Prueba (Demo)
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => fillDemo('admin@arbo.app', 'arbo2026')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 6,
                background: '#FFFFFF',
                border: `1px solid ${COLORS.lineOnLight}`,
                fontSize: 12,
                color: COLORS.onLight,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              👑 Dueño Palermo
            </button>
            <button
              type="button"
              onClick={() => fillDemo('cajero@arbo.app', 'arbo2026')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 6,
                background: '#FFFFFF',
                border: `1px solid ${COLORS.lineOnLight}`,
                fontSize: 12,
                color: COLORS.onLight,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              💵 Cajero Palermo
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin.belgrano@arbo.app', 'arbo2026')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 6,
                background: '#FFFFFF',
                border: `1px solid ${COLORS.lineOnLight}`,
                fontSize: 12,
                color: COLORS.onLight,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              🍔 Dueño Belgrano
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
