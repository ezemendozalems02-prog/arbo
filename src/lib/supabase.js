import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon')
)

// Inicialización segura del cliente Supabase
// Si no hay variables de entorno (ej. preview local inicial), se inicializa con placeholders
// válidos para que los hooks no crasheen y expone un warning claro en consola.
const url = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co'
const key = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'

if (!isSupabaseConfigured) {
  console.warn(
    '[ARBO OS] Supabase no está configurado con credenciales reales. ' +
    'Configure VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en su archivo .env.local para persistencia real en la nube.'
  )
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
