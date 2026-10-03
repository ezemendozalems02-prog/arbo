import { useAuth } from '../../context/AuthContext'
import { CURRENT_STAFF_NAME } from '../../mock/staff'
import { SITE } from '../../data/site'

const ROLE_LABELS = {
  OWNER: 'Dueño',
  ADMIN: 'Administración',
  MANAGER: 'Encargado',
  CASHIER: 'Caja',
  WAITER: 'Salón',
  KITCHEN: 'Cocina',
}

const humanize = (role) => role ? role.charAt(0) + role.slice(1).toLowerCase() : 'Equipo'

// Identidad de quien está usando ARBO OS para la UI (sidebar, topbar,
// saludo del dashboard). Lee la sesión real de AuthContext; sin sesión
// cae al usuario simulado de los mocks.
export function useCurrentStaff() {
  const { user, profile, currentOrg, currentBranch, userRole, signOut } = useAuth()
  const fromProfile = profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() : ''
  const fromUser = user?.user_metadata?.first_name || user?.email?.split('@')[0] || ''
  const name = fromProfile || fromUser || CURRENT_STAFF_NAME.replace(/\s*\(.*\)/, '')

  return {
    name,
    firstName: name.split(' ')[0],
    role: ROLE_LABELS[userRole] ?? humanize(userRole),
    email: user?.email ?? null,
    orgName: currentOrg?.name ?? 'ARBO',
    branchName: currentBranch?.name ?? SITE.location.city,
    signOut,
  }
}
