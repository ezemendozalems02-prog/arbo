import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

const LOCAL_STORAGE_SESSION_KEY = 'arbo_auth_session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [currentOrg, setCurrentOrg] = useState(null)
  const [currentBranch, setCurrentBranch] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Carga los datos de organización y membresía del usuario autenticado
  const fetchUserData = async (userId) => {
    if (!isSupabaseConfigured) {
      // Perfil de desarrollo / demostración si Supabase no está conectado
      setProfile({ first_name: 'Thiago', last_name: 'Mendoza', role: 'OWNER' })
      setCurrentOrg({ id: '11111111-1111-1111-1111-111111111111', name: 'Café Arbo Palermo' })
      setCurrentBranch({ id: '11111111-1111-1111-1111-000000000001', name: 'Palermo Soho', code: 'PALERMO-01' })
      setUserRole('OWNER')
      return
    }

    try {
      // 1. Obtener perfil
      const { data: prof } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (prof) setProfile(prof)

      // 2. Obtener membresías y organizaciones
      const { data: memberships } = await supabase
        .from('user_memberships')
        .select('*, organizations(*), branches(*)')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (memberships && memberships.length > 0) {
        const primary = memberships[0]
        setUserRole(primary.role)
        if (primary.organizations) setCurrentOrg(primary.organizations)
        if (primary.branches) setCurrentBranch(primary.branches)
      }
    } catch (err) {
      console.error('[AuthContext] Error cargando perfil de usuario:', err)
    }
  }

  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      if (isSupabaseConfigured) {
        try {
          const { data: { session: initialSession } } = await supabase.auth.getSession()
          if (mounted) {
            setSession(initialSession)
            setUser(initialSession?.user ?? null)
            if (initialSession?.user) {
              await fetchUserData(initialSession.user.id)
            }
          }
        } catch (err) {
          console.error('[AuthContext] Error inicializando sesión:', err)
        }
      } else {
        // En modo local sin backend cloud, recuperamos sesión local si existe
        const stored = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY)
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            setUser(parsed.user)
            setSession(parsed.session)
            await fetchUserData('local-user')
          } catch {
            localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY)
          }
        }
      }

      if (mounted) setIsLoading(false)
    }

    initializeAuth()

    // Listener de cambios en el estado de autenticación (login, logout, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return
      setSession(newSession)
      setUser(newSession?.user ?? null)

      if (newSession?.user) {
        await fetchUserData(newSession.user.id)
      } else {
        setProfile(null)
        setCurrentOrg(null)
        setCurrentBranch(null)
        setUserRole(null)
      }
      setIsLoading(false)
    })

    return () => {
      mounted = false
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  // Inicio de sesión
  const signIn = async ({ email, password }) => {
    setIsLoading(true)
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setSession(data.session)
        setUser(data.user)
        await fetchUserData(data.user.id)
        return { success: true }
      } else {
        // Mock Auth para desarrollo local cuando Supabase no está provisionado
        if (password.length >= 6) {
          const mockUser = {
            id: 'a0000000-0000-0000-0000-000000000001',
            email,
            user_metadata: { first_name: 'Thiago', last_name: 'Mendoza' }
          }
          const mockSession = { access_token: 'mock-jwt-token', user: mockUser }
          setUser(mockUser)
          setSession(mockSession)
          localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify({ user: mockUser, session: mockSession }))
          await fetchUserData(mockUser.id)
          return { success: true }
        } else {
          throw new Error('La contraseña debe tener al menos 6 caracteres')
        }
      }
    } catch (err) {
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Cierre de sesión
  const signOut = async () => {
    setIsLoading(true)
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut()
      }
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY)
      setUser(null)
      setSession(null)
      setProfile(null)
      setCurrentOrg(null)
      setCurrentBranch(null)
      setUserRole(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        currentOrg,
        currentBranch,
        userRole,
        isLoading,
        isAuthenticated: Boolean(user),
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
