// ARBO OS — DOMAIN SERVICE: AUTOMATION ENGINE
// Evaluador de reglas operativas, pipeline de eventos y registro auditable de ejecuciones.
// Regla Crítica: El fallo de una automatización NUNCA aborta la transacción comercial principal.
// Idempotencia estricta: Evita ejecuciones duplicadas y spam mediante clave única.

/**
 * Genera una clave de idempotencia única y determinista para un evento y regla dados.
 */
export function buildIdempotencyKey({ ruleId, eventType, referenceId }) {
  return `rule_${ruleId}_evt_${eventType}_ref_${referenceId || 'global'}`
}

/**
 * Evalúa si las condiciones de una regla se cumplen para un payload dado.
 */
export function evaluateRuleCondition(condition = {}, payload = {}) {
  if (!condition || Object.keys(condition).length === 0) {
    return true // Sin condiciones específicas = aplica siempre al evento
  }

  for (const [key, expectedValue] of Object.entries(condition)) {
    const actualValue = payload[key]

    if (typeof expectedValue === 'object' && expectedValue !== null) {
      if (expectedValue.$gte !== undefined && Number(actualValue) < Number(expectedValue.$gte)) {
        return false
      }
      if (expectedValue.$lte !== undefined && Number(actualValue) > Number(expectedValue.$lte)) {
        return false
      }
      if (expectedValue.$eq !== undefined && actualValue !== expectedValue.$eq) {
        return false
      }
    } else if (actualValue !== expectedValue) {
      return false
    }
  }

  return true
}

/**
 * Ejecuta una acción de automatización concreta de forma aislada.
 */
export async function executeRuleAction({ rule, payload, actionHandler }) {
  if (actionHandler) {
    return await actionHandler({ rule, payload })
  }

  // Comportamiento por defecto según tipo de acción
  switch (rule.action_type) {
    case 'SEND_DIGITAL_TICKET':
      return {
        action: 'SEND_DIGITAL_TICKET',
        recipient: payload.customer_phone || payload.customer_email || 'anonymous',
        ticketNumber: payload.sale_number || payload.order_number,
        delivered: true,
      }
    case 'NOTIFY_STAFF':
      return {
        action: 'NOTIFY_STAFF',
        channel: rule.action_config?.channel || 'KDS_ALERT',
        message: `Notificación para comanda #${payload.ticket_number || payload.order_number}`,
        sent: true,
      }
    case 'LOG_AUDIT':
      return {
        action: 'LOG_AUDIT',
        auditCode: rule.action_config?.auditCode || 'SYSTEM_EVENT',
        loggedAt: new Date().toISOString(),
      }
    default:
      return {
        action: rule.action_type,
        config: rule.action_config,
        executed: true,
      }
  }
}

/**
 * Procesa un evento contra todas las reglas activas de la organización.
 */
export async function dispatchDomainEvent({
  state,
  eventType,
  payload = {},
  actionHandler = null,
}) {
  const {
    automationRules = [],
    automationExecutions = [],
  } = state

  const orgId = payload.organization_id || payload.organizationId
  const referenceId = payload.id || payload.sale_id || payload.order_id || payload.saleId || 'ref'

  // Filtrar reglas habilitadas para esta organización y tipo de evento
  const applicableRules = automationRules.filter(
    rule => rule.is_enabled !== false &&
           (!orgId || rule.organization_id === orgId) &&
           rule.event_type === eventType
  )

  let updatedExecutions = [...automationExecutions]
  const executionResults = []

  for (const rule of applicableRules) {
    // 1. Verificar idempotencia estricta
    const idempotencyKey = buildIdempotencyKey({
      ruleId: rule.id,
      eventType,
      referenceId,
    })

    const alreadyExecuted = updatedExecutions.some(
      exec => exec.idempotency_key === idempotencyKey && exec.organization_id === rule.organization_id
    )

    if (alreadyExecuted) {
      executionResults.push({
        ruleId: rule.id,
        ruleName: rule.name,
        status: 'SKIPPED_DUPLICATE',
        idempotencyKey,
      })
      continue
    }

    // 2. Evaluar condiciones
    const conditionMatched = evaluateRuleCondition(rule.condition, payload)
    if (!conditionMatched) {
      executionResults.push({
        ruleId: rule.id,
        ruleName: rule.name,
        status: 'SKIPPED_CONDITION_UNMET',
      })
      continue
    }

    // 3. Ejecución segura con aislamiento de fallos (Failure Isolation)
    const executionId = `aexec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    const executedAt = new Date().toISOString()

    try {
      const result = await executeRuleAction({ rule, payload, actionHandler })

      const successExecution = {
        id: executionId,
        organization_id: rule.organization_id,
        rule_id: rule.id,
        event_type: eventType,
        idempotency_key: idempotencyKey,
        status: 'SUCCESS',
        payload,
        result,
        error_message: null,
        executed_at: executedAt,
      }

      updatedExecutions.push(successExecution)
      executionResults.push({
        ruleId: rule.id,
        ruleName: rule.name,
        status: 'SUCCESS',
        executionId,
      })
    } catch (actionError) {
      // Regla de oro: El fallo de una automatización NUNCA interrumpe el flujo principal
      const failedExecution = {
        id: executionId,
        organization_id: rule.organization_id,
        rule_id: rule.id,
        event_type: eventType,
        idempotency_key: idempotencyKey,
        status: 'FAILED',
        payload,
        result: null,
        error_message: actionError.message || 'Error desconocido en ejecución de regla',
        executed_at: executedAt,
      }

      updatedExecutions.push(failedExecution)
      executionResults.push({
        ruleId: rule.id,
        ruleName: rule.name,
        status: 'FAILED',
        executionId,
        error: actionError.message,
      })
    }
  }

  return {
    success: true,
    eventType,
    results: executionResults,
    updatedState: {
      ...state,
      automationExecutions: updatedExecutions,
    },
  }
}
