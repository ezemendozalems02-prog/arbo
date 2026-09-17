// BLOQUE 32 — auditoría mínima: quién hizo qué, cuándo, y qué cambió.
// Sin permisos/roles todavía (bloque 32 lo dice explícito) — solo registro.
export function buildAuditEntry({ user, action, entity, entityId, before, after, uid }) {
  return { id: uid('audit'), user, action, entity, entityId, before, after, createdAt: new Date() }
}
