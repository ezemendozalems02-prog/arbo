import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { CUSTOMERS } from '../mock/customers'
import { LOYALTY_LEVELS, getLevelForPoints } from '../mock/loyaltyLevels'
import { POINT_TRANSACTIONS } from '../mock/loyaltyTransactions'
import { REWARDS } from '../mock/rewards'
import { REDEMPTIONS } from '../mock/redemptions'
import { SEGMENTS } from '../mock/segments'
import { CAMPAIGNS } from '../mock/campaigns'
import { AUTOMATIONS } from '../mock/automations'
import { CURRENT_STAFF_NAME } from '../mock/staff'
import { buildTransaction } from '../services/loyaltyPointsService'
import { validateRedemption, buildRedemption } from '../services/redemptionService'
import { simulateSend as simulateCampaignSend } from '../services/campaignService'
import { simulateRun as simulateAutomationRun } from '../services/automationService'
import { buildAuditEntry } from '../services/auditLogService'

// Estado en vivo del módulo CRM/ARBO CLUB/Marketing (Fase 5) — mismo patrón
// que InventoryContext en Fase 4: arranca desde Mock Data y persiste en
// localStorage. Cuando exista Supabase, cada acción de abajo pasa a llamar a
// un repositorio real (CustomerRepository, LoyaltyRepository, etc.) sin que
// la UI que las consume tenga que cambiar.
//
// Nota de alcance: los clientes de POS/Dashboard (src/mock/customers.js,
// usado por POSContext desde Fase 2) siguen existiendo tal cual — este
// contexto parte de esa misma lista pero mantiene su PROPIA copia editable
// (con notas/tags/consentimientos/puntos en vivo), igual que Inventario
// nunca reescribe products.js. No se tocó el flujo de cobro del POS.
const KEY = 'arbo_crm_v1'
const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`

function initialState() {
  return {
    customers: CUSTOMERS.map(c => ({ tags: [], notes: [], consent: { email: false, whatsapp: false, marketing: false, updatedAt: null }, ...c })),
    levels: LOYALTY_LEVELS,
    transactions: POINT_TRANSACTIONS,
    rewards: REWARDS,
    redemptions: REDEMPTIONS,
    segments: SEGMENTS,
    campaigns: CAMPAIGNS,
    automations: AUTOMATIONS,
    automationRuns: [],
    auditLog: [],
  }
}

const DATE_KEYS = ['createdAt', 'lastActivity', 'birthDate', 'startDate', 'endDate', 'usedAt', 'scheduledAt', 'sentAt', 'at', 'updatedAt', 'lastRun']
function reviveDates(obj) {
  if (Array.isArray(obj)) return obj.map(reviveDates)
  if (obj && typeof obj === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(obj)) {
      if (DATE_KEYS.includes(k) && typeof v === 'string') out[k] = new Date(v)
      else out[k] = reviveDates(v)
    }
    return out
  }
  return obj
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initialState()
    return { ...initialState(), ...reviveDates(JSON.parse(raw)) }
  } catch {
    return initialState()
  }
}

const CRMContext = createContext(null)

export function CRMProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* storage unavailable */ }
  }, [state])

  const pushAudit = (s, entry) => ({ ...s, auditLog: [buildAuditEntry({ ...entry, uid }), ...s.auditLog] })

  // ---------- Clientes ----------
  const createCustomer = useCallback((data) => {
    const now = new Date()
    const customer = {
      id: uid('cli'), birthDate: null, createdAt: now, lastActivity: now, visits: 0, orders: 0, reservations: 0,
      totalSpent: 0, avgTicket: 0, points: 0, tier: getLevelForPoints(0), tags: [], notes: [],
      consent: { email: false, whatsapp: false, marketing: false, updatedAt: null }, ...data,
    }
    setState(s => pushAudit({ ...s, customers: [customer, ...s.customers] }, { user: CURRENT_STAFF_NAME, action: 'crear', entity: 'cliente', entityId: customer.id, before: null, after: customer }))
    return customer.id
  }, [])

  const addCustomerNote = useCallback((customerId, text, user = CURRENT_STAFF_NAME) => {
    setState(s => ({
      ...s,
      customers: s.customers.map(c => c.id === customerId
        ? { ...c, notes: [{ id: uid('note'), text, user, createdAt: new Date() }, ...c.notes] }
        : c),
    }))
  }, [])

  const setCustomerTags = useCallback((customerId, tags) => {
    setState(s => ({ ...s, customers: s.customers.map(c => c.id === customerId ? { ...c, tags } : c) }))
  }, [])

  const updateConsent = useCallback((customerId, patch) => {
    setState(s => ({
      ...s,
      customers: s.customers.map(c => c.id === customerId ? { ...c, consent: { ...c.consent, ...patch, updatedAt: new Date() } } : c),
    }))
  }, [])

  // ---------- Puntos ----------
  // Toda variación de saldo pasa por acá: nunca se toca customer.points
  // directo sin dejar una transacción, igual que el stock en Fase 4.
  const applyPointsTransaction = (s, { customerId, type, amount, reason, reference, user = CURRENT_STAFF_NAME }) => {
    const customer = s.customers.find(c => c.id === customerId)
    if (!customer) return s
    const now = new Date()
    const txn = buildTransaction({ customerId, type, amount, reason, reference, user, balanceBefore: customer.points, uid, now })
    return {
      ...s,
      transactions: [txn, ...s.transactions],
      customers: s.customers.map(c => c.id === customerId ? { ...c, points: txn.balanceAfter, tier: getLevelForPoints(txn.balanceAfter) } : c),
    }
  }

  const adjustPoints = useCallback(({ customerId, type, amount, reason, user }) => {
    setState(s => applyPointsTransaction(s, { customerId, type, amount, reason, user }))
  }, [])

  // ---------- Beneficios / Canjes ----------
  const createReward = useCallback((data) => {
    const reward = { id: uid('rwd'), status: 'activo', redeemedCount: 0, stock: null, endDate: null, ...data }
    setState(s => pushAudit({ ...s, rewards: [...s.rewards, reward] }, { user: CURRENT_STAFF_NAME, action: 'crear', entity: 'beneficio', entityId: reward.id, before: null, after: reward }))
    return reward.id
  }, [])

  const redeemReward = useCallback(({ customerId, rewardId, user = CURRENT_STAFF_NAME }) => {
    let result = { ok: false, error: 'Cliente o beneficio inexistente.' }
    setState(s => {
      const customer = s.customers.find(c => c.id === customerId)
      const reward = s.rewards.find(r => r.id === rewardId)
      if (!customer || !reward) return s
      const now = new Date()
      const check = validateRedemption({ reward, pointsBalance: customer.points, now })
      if (!check.ok) { result = check; return s }

      const redemption = buildRedemption({ customer, reward, uid, now })
      let next = applyPointsTransaction(s, {
        customerId, type: 'REDEEM', amount: -reward.pointsCost, reason: `Canje: ${reward.name}`, reference: redemption.id, user,
      })
      next = {
        ...next,
        redemptions: [redemption, ...next.redemptions],
        rewards: next.rewards.map(r => r.id === rewardId ? { ...r, redeemedCount: r.redeemedCount + 1 } : r),
      }
      next = pushAudit(next, { user, action: 'canjear', entity: 'beneficio', entityId: rewardId, before: null, after: redemption })
      result = { ok: true, error: null, redemption }
      return next
    })
    return result
  }, [])

  const markRedemptionUsed = useCallback((redemptionId) => {
    setState(s => ({ ...s, redemptions: s.redemptions.map(r => r.id === redemptionId ? { ...r, status: 'utilizado', usedAt: new Date() } : r) }))
  }, [])

  // Cancelar un canje devuelve los puntos (bloque 11) — nunca se descuentan
  // dos veces ni quedan "perdidos" en el aire.
  const cancelRedemption = useCallback((redemptionId) => {
    setState(s => {
      const redemption = s.redemptions.find(r => r.id === redemptionId)
      if (!redemption || redemption.status === 'cancelado') return s
      let next = applyPointsTransaction(s, {
        customerId: redemption.customerId, type: 'REFUND', amount: redemption.pointsUsed,
        reason: 'Canje cancelado — puntos devueltos', reference: redemptionId,
      })
      return { ...next, redemptions: next.redemptions.map(r => r.id === redemptionId ? { ...r, status: 'cancelado' } : r) }
    })
  }, [])

  // ---------- Niveles ----------
  const createLevel = useCallback((data) => {
    setState(s => ({ ...s, levels: [...s.levels, { id: uid('lvl'), status: 'activo', benefits: [], ...data }] }))
  }, [])

  const updateLevel = useCallback((levelId, patch) => {
    setState(s => ({ ...s, levels: s.levels.map(l => l.id === levelId ? { ...l, ...patch } : l) }))
  }, [])

  // ---------- Segmentos ----------
  const createSegment = useCallback((data) => {
    const segment = { id: uid('seg'), kind: 'personalizado', ...data }
    setState(s => pushAudit({ ...s, segments: [...s.segments, segment] }, { user: CURRENT_STAFF_NAME, action: 'crear', entity: 'segmento', entityId: segment.id, before: null, after: segment }))
    return segment.id
  }, [])

  // ---------- Campañas ----------
  const createCampaign = useCallback((data) => {
    const campaign = { id: uid('cmp'), status: 'DRAFT', stats: null, sentAt: null, createdAt: new Date(), ...data }
    setState(s => pushAudit({ ...s, campaigns: [campaign, ...s.campaigns] }, { user: CURRENT_STAFF_NAME, action: 'crear', entity: 'campaña', entityId: campaign.id, before: null, after: campaign }))
    return campaign.id
  }, [])

  const sendCampaign = useCallback((campaignId) => {
    setState(s => {
      const campaign = s.campaigns.find(c => c.id === campaignId)
      if (!campaign) return s
      const now = new Date()
      const deps = { now, getRedemptionsForCustomer: (id) => s.redemptions.filter(r => r.customerId === id) }
      const result = simulateCampaignSend(campaign, s.segments, s.customers, deps)
      const updated = { ...campaign, ...result }
      let next = { ...s, campaigns: s.campaigns.map(c => c.id === campaignId ? updated : c) }
      next = pushAudit(next, { user: CURRENT_STAFF_NAME, action: 'enviar', entity: 'campaña', entityId: campaignId, before: { status: campaign.status }, after: { status: 'COMPLETED' } })
      return next
    })
  }, [])

  const cancelCampaign = useCallback((campaignId) => {
    setState(s => ({ ...s, campaigns: s.campaigns.map(c => c.id === campaignId ? { ...c, status: 'CANCELLED' } : c) }))
  }, [])

  // ---------- Automatizaciones ----------
  const createAutomation = useCallback((data) => {
    setState(s => ({ ...s, automations: [...s.automations, { id: uid('aut'), status: 'activa', timesTriggered: 0, lastRun: null, ...data }] }))
  }, [])

  const toggleAutomation = useCallback((automationId) => {
    setState(s => ({ ...s, automations: s.automations.map(a => a.id === automationId ? { ...a, status: a.status === 'activa' ? 'pausada' : 'activa' } : a) }))
  }, [])

  const runAutomation = useCallback((automationId) => {
    let runResult = null
    setState(s => {
      const automation = s.automations.find(a => a.id === automationId)
      if (!automation) return s
      const now = new Date()
      const run = simulateAutomationRun(automation, s.customers, { now, uid })
      runResult = run
      return {
        ...s,
        automationRuns: [run, ...s.automationRuns],
        automations: s.automations.map(a => a.id === automationId ? { ...a, timesTriggered: a.timesTriggered + run.matchedCount, lastRun: now } : a),
      }
    })
    return runResult
  }, [])

  const value = {
    customers: state.customers,
    levels: state.levels,
    transactions: state.transactions,
    rewards: state.rewards,
    redemptions: state.redemptions,
    segments: state.segments,
    campaigns: state.campaigns,
    automations: state.automations,
    automationRuns: state.automationRuns,
    auditLog: state.auditLog,
    createCustomer, addCustomerNote, setCustomerTags, updateConsent, adjustPoints,
    createReward, redeemReward, markRedemptionUsed, cancelRedemption,
    createLevel, updateLevel, createSegment,
    createCampaign, sendCampaign, cancelCampaign,
    createAutomation, toggleAutomation, runAutomation,
    getCustomerById: (id) => state.customers.find(c => c.id === id) ?? null,
    getRedemptionsForCustomer: (customerId) => state.redemptions.filter(r => r.customerId === customerId),
    getTransactionsForCustomer: (customerId) => state.transactions.filter(t => t.customerId === customerId),
    getRewardById: (id) => state.rewards.find(r => r.id === id) ?? null,
    getSegmentById: (id) => state.segments.find(s => s.id === id) ?? null,
    getCampaignById: (id) => state.campaigns.find(c => c.id === id) ?? null,
    getAutomationById: (id) => state.automations.find(a => a.id === id) ?? null,
    getLevelForPoints: (points) => getLevelForPoints(points, state.levels),
  }

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook vive junto a su Provider a propósito
export function useCRM() {
  const ctx = useContext(CRMContext)
  if (!ctx) throw new Error('useCRM debe usarse dentro de <CRMProvider>')
  return ctx
}
