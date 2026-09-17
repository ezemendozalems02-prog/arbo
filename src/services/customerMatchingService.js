// Deduplicación de clientes — Fase 5, bloque 40. Cuando una reserva u orden
// trae email/teléfono, esto evita crear un "cliente" nuevo si ya existe uno
// con ese contacto (bloque 57: "no permitir clientes duplicados por
// email/teléfono cuando exista coincidencia clara").
export function findCustomerByContact({ email, phone }, customers) {
  const normEmail = email?.trim().toLowerCase()
  const normPhone = phone?.replace(/\s|-/g, '')
  return customers.find(c =>
    (normEmail && c.email.toLowerCase() === normEmail) ||
    (normPhone && c.phone.replace(/\s|-/g, '') === normPhone)
  ) ?? null
}

export function buildNewCustomer({ name, email, phone }, { uid, now }) {
  return {
    id: uid('cli'), name, email: email ?? '', phone: phone ?? '',
    birthDate: null, createdAt: now, visits: 0, orders: 0, reservations: 0,
    totalSpent: 0, avgTicket: 0, points: 0, tier: null, lastActivity: now,
    tags: [], notes: [], consent: { email: false, whatsapp: false, marketing: false, updatedAt: null },
  }
}

export function findOrCreateCustomer(contact, customers, { uid, now }) {
  const existing = findCustomerByContact(contact, customers)
  if (existing) return { customer: existing, created: false }
  return { customer: buildNewCustomer(contact, { uid, now }), created: true }
}
