// ARBO OS — DOMAIN SERVICE: GESTIÓN AUDITABLE DE SESIONES DE CAJA
// Implementa el ciclo de vida de turnos de caja sin sobreescritura de historial.
// Caja -> Sesión de Caja -> Movimientos (Append-Only Ledger).

/**
 * Abre una nueva sesión de caja.
 * Regla arquitectónica: NUNCA destruye ni sobreescribe sesiones o movimientos previos.
 */
export function openCashSession(sessions = [], movements = [], {
  id = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
  organizationId,
  branchId,
  cashRegisterId,
  openedBy,
  initialAmount = 0.00,
  notes = null,
} = {}) {
  // Verificar si ya hay una sesión abierta para esta caja registradora
  const activeSession = sessions.find(s => 
    s.cash_register_id === cashRegisterId && 
    s.branch_id === branchId && 
    s.status === 'OPEN'
  )

  if (activeSession) {
    throw new Error(`ACTIVE_SESSION_EXISTS: La registradora ya tiene una sesión abierta activa (ID: ${activeSession.id})`)
  }

  const initialParsed = Number(initialAmount)
  if (isNaN(initialParsed) || initialParsed < 0) {
    throw new Error('INVALID_INITIAL_AMOUNT: El monto de apertura debe ser un número mayor o igual a 0.')
  }

  const newSession = {
    id,
    organization_id: organizationId,
    branch_id: branchId,
    cash_register_id: cashRegisterId,
    status: 'OPEN',
    opened_by: openedBy,
    closed_by: null,
    initial_amount: initialParsed,
    closing_declared_amount: null,
    closing_expected_amount: null,
    closing_difference: null,
    notes,
    opened_at: new Date().toISOString(),
    closed_at: null,
  }

  const openingMovement = {
    id: `cmov_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    organization_id: organizationId,
    branch_id: branchId,
    cash_session_id: id,
    movement_type: 'OPENING',
    amount: initialParsed,
    payment_method: 'CASH',
    reference_id: null,
    notes: 'Apertura de turno de caja',
    created_by: openedBy,
    created_at: new Date().toISOString(),
  }

  return {
    sessions: [...sessions, newSession],
    movements: [...movements, openingMovement],
    session: newSession,
  }
}

/**
 * Calcula el arqueo esperado de una sesión sumando los movimientos del ledger.
 */
export function calculateSessionExpectedCash(session, movements = []) {
  if (!session) return 0.00

  const sessionMovements = movements.filter(m => m.cash_session_id === session.id)

  let expected = 0.00
  for (const mov of sessionMovements) {
    if (mov.movement_type === 'OPENING' || mov.movement_type === 'SALE' || mov.movement_type === 'ADJUSTMENT_IN') {
      expected += Number(mov.amount)
    } else if (mov.movement_type === 'REFUND' || mov.movement_type === 'ADJUSTMENT_OUT') {
      expected -= Math.abs(Number(mov.amount))
    }
  }

  return Number(expected.toFixed(2))
}

/**
 * Cierra una sesión de caja calculando diferencias contra el dinero declarado.
 */
export function closeCashSession(sessions = [], movements = [], {
  sessionId,
  closedBy,
  declaredAmount = 0.00,
  notes = null,
} = {}) {
  const sessionIndex = sessions.findIndex(s => s.id === sessionId)
  if (sessionIndex === -1) {
    throw new Error(`SESSION_NOT_FOUND: No se encontró la sesión de caja ${sessionId}`)
  }

  const currentSession = sessions[sessionIndex]
  if (currentSession.status === 'CLOSED') {
    throw new Error(`SESSION_ALREADY_CLOSED: La sesión de caja ${sessionId} ya fue cerrada previamente.`)
  }

  const declaredParsed = Number(declaredAmount)
  if (isNaN(declaredParsed) || declaredParsed < 0) {
    throw new Error('INVALID_DECLARED_AMOUNT: El monto declarado debe ser un número mayor o igual a 0.')
  }

  const expectedAmount = calculateSessionExpectedCash(currentSession, movements)
  const difference = Number((declaredParsed - expectedAmount).toFixed(2))

  const closedSession = {
    ...currentSession,
    status: 'CLOSED',
    closed_by: closedBy,
    closing_declared_amount: declaredParsed,
    closing_expected_amount: expectedAmount,
    closing_difference: difference,
    notes: notes || currentSession.notes,
    closed_at: new Date().toISOString(),
  }

  const updatedSessions = [...sessions]
  updatedSessions[sessionIndex] = closedSession

  return {
    sessions: updatedSessions,
    closedSession,
    expectedAmount,
    difference,
  }
}
