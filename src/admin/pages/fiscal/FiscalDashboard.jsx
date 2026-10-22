import { useEffect, useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { usePOS } from '../../../context/POSContext'
import {
  formatInvoiceLabel, DEMO_TAXPAYER, DEMO_FISCAL_MODES, STATUS_LABELS,
} from '../../../services/domain/demoFiscalEmission'
import { formatDate, formatMoney } from '../../utils/format'
import { EmptyState } from '../../components/Panel'

// Pantalla Fiscal en MODO DEMOSTRACIÓN (homologación simulada). Permite PROBAR
// el flujo de facturación completo (autorizado, rechazado, contingencia con
// reintento) con comprobantes SIMULADOS que genera el POS. Todo lleva el sello
// "DEMO · Sin validez fiscal": no se conecta a ARCA y el CAE no tiene validez
// fiscal. La emisión real sigue pendiente (certificado + CUIT + servidor).

const DEMO_AUTOMATIONS = [
  { id: 'rule_01', name: 'Envío de Ticket Digital por WhatsApp', event_type: 'sale.completed', action_type: 'SEND_DIGITAL_TICKET' },
  { id: 'rule_02', name: 'Alerta KDS para Pedidos Web Urgentes', event_type: 'order.created', action_type: 'NOTIFY_STAFF' },
]

const DEMO_EXECUTIONS = [
  { id: 'aexec_01', rule_name: 'Envío de Ticket Digital por WhatsApp', idempotency_key: 'rule_rule_01_evt_sale.completed_ref_sale_1042', executed_at: '2026-09-19T08:14:22Z' },
  { id: 'aexec_02', rule_name: 'Alerta KDS para Pedidos Web Urgentes', idempotency_key: 'rule_rule_02_evt_order.created_ref_pord_882', executed_at: '2026-09-19T08:20:11Z' },
]

const sectionTitle = { fontFamily: FONTS.sans, fontSize: 15, fontWeight: 700, color: COLORS.greenDark, margin: 0 }

const STATUS_STYLE = {
  AUTHORIZED: { bg: 'rgba(48,77,59,0.1)', fg: COLORS.greenDark, bd: 'rgba(48,77,59,0.3)' },
  REJECTED: { bg: 'rgba(166,91,74,0.14)', fg: '#8A4536', bd: 'rgba(166,91,74,0.4)' },
  PENDING_CONTINGENCY: { bg: 'rgba(176,138,62,0.16)', fg: '#6E5423', bd: 'rgba(176,138,62,0.4)' },
}

function StatusBadge({ status }) {
  const st = STATUS_STYLE[status] || STATUS_STYLE.AUTHORIZED
  return (
    <span style={{
      fontFamily: FONTS.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
      color: st.fg, background: st.bg, border: `1px solid ${st.bd}`, padding: '3px 8px', borderRadius: 3, whiteSpace: 'nowrap',
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

function DemoBadge() {
  return (
    <span style={{
      fontFamily: FONTS.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      padding: '4px 9px', borderRadius: 3, whiteSpace: 'nowrap',
      background: 'rgba(176,138,62,0.16)', color: '#6E5423', border: '1px solid rgba(176,138,62,0.4)',
    }}>
      DEMO · Sin validez fiscal
    </span>
  )
}

function InvoiceRow({ inv, first, onRetry }) {
  return (
    <div style={{ padding: '14px 18px', borderTop: first ? 'none' : `1px solid ${COLORS.lineGreen}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: FONTS.sans, fontSize: 13, fontWeight: 700, color: COLORS.greenDark, margin: 0 }}>
          {formatInvoiceLabel(inv)} <span style={{ fontWeight: 500, color: COLORS.onLightMuted }}>· Venta #{String(inv.sale_number).padStart(4, '0')}</span>
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: 11, color: COLORS.onLightMuted, margin: '3px 0 0', overflowWrap: 'anywhere' }}>
          {inv.cae ? `CAE ${inv.cae} · Vto ${inv.cae_expires_at} · ` : ''}Neto {formatMoney(inv.net_amount)} · IVA {formatMoney(inv.vat_amount)}
        </p>
        {inv.error_message && (
          <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: '#8A4536', margin: '3px 0 0' }}>
            {inv.error_code ? `Error ${inv.error_code}: ` : ''}{inv.error_message}
          </p>
        )}
        {inv.afip_qr_url && (
          <a href={inv.afip_qr_url} target="_blank" rel="noreferrer"
            style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.green, textDecoration: 'underline', display: 'inline-block', marginTop: 4 }}>
            Ver QR de validación AFIP (demo)
          </a>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: FONTS.serif, fontSize: 16, fontWeight: 600, color: COLORS.greenDark }}>{formatMoney(inv.total_amount)}</span>
        <StatusBadge status={inv.status} />
        {onRetry && inv.status === 'PENDING_CONTINGENCY' && (
          <button onClick={() => onRetry(inv.id)} style={{
            fontFamily: FONTS.sans, fontSize: 11, fontWeight: 700, cursor: 'pointer',
            background: COLORS.green, color: COLORS.cream, border: 'none', padding: '6px 12px', borderRadius: 4,
          }}>
            Reintentar (demo)
          </button>
        )}
      </div>
    </div>
  )
}

export default function FiscalDashboard() {
  useEffect(() => {
    document.title = 'Fiscal | ARBO OS'
  }, [])

  const [activeTab, setActiveTab] = useState('invoices') // 'invoices' | 'contingency' | 'automations' | 'config'
  const { fiscalInvoices = [], fiscalDemoMode = 'SUCCESS', setFiscalDemoMode, retryContingency } = usePOS()

  const demoInvoices = [...fiscalInvoices].reverse() // más recientes primero
  const contingencyInvoices = demoInvoices.filter(inv => inv.status === 'PENDING_CONTINGENCY')

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: FONTS.serif, fontSize: 28, color: COLORS.greenDark, margin: 0, fontWeight: 600 }}>
            Facturación electrónica
          </h1>
          <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, marginTop: 4 }}>
            ARCA (ex AFIP) · Modo demostración (homologación simulada)
          </p>
        </div>
        <span style={{
          fontFamily: FONTS.sans, fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 4,
          background: 'rgba(176,138,62,0.16)', color: '#6E5423', border: '1px solid rgba(176,138,62,0.4)',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          DEMO · Sin validez fiscal
        </span>
      </div>

      <div role="status" style={{ padding: '14px 18px', background: 'rgba(176,138,62,0.1)', border: '1px solid rgba(176,138,62,0.4)', marginBottom: 20 }}>
        <p style={{ fontFamily: FONTS.sans, fontSize: 13, fontWeight: 700, color: '#8A6A2E', margin: 0 }}>
          Modo demostración · Homologación simulada · Sin validez fiscal
        </p>
        <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted, margin: '4px 0 0', lineHeight: 1.5 }}>
          Los comprobantes son una SIMULACIÓN para probar el flujo de facturación: no se conectan con ARCA y el CAE no tiene validez fiscal.
          La emisión real de homologación necesita, aparte, el certificado digital y el CUIT del contribuyente, y un servicio de servidor que firme ante AFIP.
        </p>
      </div>

      {/* Simulador: qué responde AFIP en la próxima venta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        <span style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.onLightMuted }}>
          Respuesta de AFIP a simular en la próxima venta:
        </span>
        {DEMO_FISCAL_MODES.map(m => (
          <button key={m.id} onClick={() => setFiscalDemoMode?.(m.id)} style={{
            fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '7px 12px', borderRadius: 4,
            border: `1.5px solid ${fiscalDemoMode === m.id ? COLORS.green : COLORS.lineGreen}`,
            background: fiscalDemoMode === m.id ? COLORS.green : 'transparent',
            color: fiscalDemoMode === m.id ? COLORS.cream : COLORS.onLightMuted,
          }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${COLORS.lineGreen}`, marginBottom: 24, gap: 12, overflowX: 'auto' }}>
        {[
          { id: 'invoices', label: `Comprobantes (${demoInvoices.length})` },
          { id: 'contingency', label: `Contingencia (${contingencyInvoices.length})` },
          { id: 'automations', label: 'Automatizaciones (demo)' },
          { id: 'config', label: 'Datos del contribuyente' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px', fontFamily: FONTS.sans, fontSize: 13, fontWeight: 600,
              background: 'transparent', border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid ${COLORS.green}` : '2px solid transparent',
              color: activeTab === tab.id ? COLORS.greenDark : COLORS.onLightMuted,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Comprobantes (simulados) */}
      {activeTab === 'invoices' && (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}` }}>
          {demoInvoices.length === 0 ? (
            <EmptyState label="Todavía no hay comprobantes. Cobrá una venta en el POS y vas a ver acá su comprobante simulado (demo)." />
          ) : (
            demoInvoices.map((inv, i) => <InvoiceRow key={inv.id} inv={inv} first={i === 0} />)
          )}
        </div>
      )}

      {/* Tab: Contingencia (con reintento demo) */}
      {activeTab === 'contingency' && (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}` }}>
          {contingencyInvoices.length === 0 ? (
            <EmptyState label="Sin comprobantes en contingencia. Simulá 'AFIP caído' arriba y cobrá una venta para ver cómo cae uno acá." />
          ) : (
            contingencyInvoices.map((inv, i) => <InvoiceRow key={inv.id} inv={inv} first={i === 0} onRetry={retryContingency} />)
          )}
        </div>
      )}

      {/* Tab: Automatizaciones (demostración) */}
      {activeTab === 'automations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <h3 style={sectionTitle}>Reglas del pipeline de eventos</h3>
              <DemoBadge />
            </div>
            <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}` }}>
              {DEMO_AUTOMATIONS.map((rule, i) => (
                <div key={rule.id} style={{ padding: '14px 18px', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: FONTS.sans, fontSize: 13, fontWeight: 700, color: COLORS.greenDark, margin: 0 }}>{rule.name}</p>
                    <p style={{ fontFamily: 'monospace', fontSize: 11, color: COLORS.onLightMuted, margin: '3px 0 0', overflowWrap: 'anywhere' }}>
                      Evento: {rule.event_type} → Acción: {rule.action_type}
                    </p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.onLightMuted, flexShrink: 0 }}>DEMO</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <h3 style={sectionTitle}>Registro de ejecuciones y claves de idempotencia</h3>
              <DemoBadge />
            </div>
            <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}` }}>
              {DEMO_EXECUTIONS.map((exec, i) => (
                <div key={exec.id} style={{ padding: '12px 18px', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight, margin: 0, fontWeight: 600 }}>{exec.rule_name}</p>
                    <p style={{ fontFamily: 'monospace', fontSize: 11, color: COLORS.onLightFaint, margin: '2px 0 0', overflowWrap: 'anywhere' }}>
                      Key: {exec.idempotency_key}
                    </p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.onLightMuted, flexShrink: 0 }}>
                    DEMO · {formatDate(new Date(exec.executed_at))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Datos del contribuyente (DEMO) */}
      {activeTab === 'config' && (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, padding: 24, maxWidth: 640 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <h3 style={{ fontFamily: FONTS.serif, fontSize: 18, color: COLORS.greenDark, margin: 0 }}>
              Datos fiscales del contribuyente
            </h3>
            <DemoBadge />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: FONTS.sans, fontSize: 13 }}>
            {DEMO_TAXPAYER.map(([label, value]) => (
              <div key={label}>
                <span style={{ color: COLORS.onLightMuted, display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <span style={{ fontWeight: 600, color: COLORS.greenDark }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, padding: 12, background: 'rgba(48,77,59,0.06)', border: `1px solid ${COLORS.lineGreen}`, fontSize: 11, color: COLORS.onLightMuted, fontFamily: FONTS.sans, lineHeight: 1.5 }}>
            Estos datos son de DEMOSTRACIÓN: el CUIT es de ejemplo y el CAE es sintético, sin validez fiscal. Para la emisión real, el certificado digital y su clave privada se van a guardar solo en el servidor, nunca en el navegador.
          </div>
        </div>
      )}
    </div>
  )
}
