import { useEffect, useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { formatMoney, formatDate } from '../../utils/format'
import Button from '../../ui/Button'
import { EmptyState } from '../../components/Panel'

export default function FiscalDashboard() {
  useEffect(() => {
    document.title = 'Gestión Fiscal & Automatizaciones | ARBO OS'
  }, [])

  const [activeTab, setActiveTab] = useState('invoices') // 'invoices' | 'contingency' | 'automations' | 'config'

  // Estado demostrativo sincronizado con la capa de dominio fiscal
  const [config] = useState({
    cuit: '30-71234567-8',
    legalName: 'ARBO PATAGONIA S.R.L.',
    taxCondition: 'Responsable Inscripto',
    posNumber: 1,
    wsfeStatus: 'ONLINE (Modo Contingencia Automática Activo)',
    caeTimeoutLimit: '3.5 segundos',
  })

  const [invoices] = useState([
    {
      id: 'finv_001',
      invoice_type: 'FACTURA_B',
      pos_number: 1,
      invoice_number: 1042,
      total_amount: 3500.00,
      net_amount: 2892.56,
      vat_amount: 607.44,
      cae: '74289123456789',
      cae_expires_at: '2026-09-29',
      customer_name: 'Consumidor Final',
      customer_tax_id: null,
      status: 'AUTHORIZED',
      created_at: new Date().toISOString(),
      qr_url: 'https://www.afip.gob.ar/fe/qr/?p=eyJ2ZXIiOjEsImZlY2hhIjoiMjAyNi0wOS0xOSJ9',
    },
    {
      id: 'finv_002',
      invoice_type: 'FACTURA_A',
      pos_number: 1,
      invoice_number: 1043,
      total_amount: 15400.00,
      net_amount: 12727.27,
      vat_amount: 2672.73,
      cae: '74289123456790',
      cae_expires_at: '2026-09-29',
      customer_name: 'Patagonia Hostería & Spa S.A.',
      customer_tax_id: '30-70899123-4',
      status: 'AUTHORIZED',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      qr_url: 'https://www.afip.gob.ar/fe/qr/?p=eyJ2ZXIiOjEsImZlY2hhIjoiMjAyNi0wOS0xOSJ9',
    },
    {
      id: 'finv_003',
      invoice_type: 'FACTURA_B',
      pos_number: 1,
      invoice_number: 1044,
      total_amount: 4200.00,
      net_amount: 3471.07,
      vat_amount: 728.93,
      cae: null,
      cae_expires_at: null,
      customer_name: 'Consumidor Final',
      customer_tax_id: null,
      status: 'PENDING_CONTINGENCY',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      qr_url: null,
    },
  ])

  const [contingencyQueue, setContingencyQueue] = useState([
    {
      id: 'cq_001',
      fiscal_invoice_id: 'finv_003',
      invoice_ref: 'FACTURA_B #0001-00001044',
      amount: 4200.00,
      retry_count: 1,
      max_retries: 5,
      last_error: 'FISCAL_TIMEOUT: Tiempo de espera agotado (>3.5s)',
      status: 'PENDING',
      next_attempt_at: new Date().toISOString(),
    },
  ])

  const [automations] = useState([
    {
      id: 'rule_01',
      name: 'Envío de Ticket Digital por WhatsApp',
      event_type: 'sale.completed',
      action_type: 'SEND_DIGITAL_TICKET',
      is_enabled: true,
      last_execution: '2026-09-19T08:14:22Z',
    },
    {
      id: 'rule_02',
      name: 'Alerta KDS para Pedidos Web Urgentes',
      event_type: 'order.created',
      action_type: 'NOTIFY_STAFF',
      is_enabled: true,
      last_execution: '2026-09-19T08:20:11Z',
    },
  ])

  const [executions] = useState([
    {
      id: 'aexec_01',
      rule_name: 'Envío de Ticket Digital por WhatsApp',
      event_type: 'sale.completed',
      idempotency_key: 'rule_rule_01_evt_sale.completed_ref_sale_1042',
      status: 'SUCCESS',
      executed_at: '2026-09-19T08:14:22Z',
    },
    {
      id: 'aexec_02',
      rule_name: 'Alerta KDS para Pedidos Web Urgentes',
      event_type: 'order.created',
      idempotency_key: 'rule_rule_02_evt_order.created_ref_pord_882',
      status: 'SUCCESS',
      executed_at: '2026-09-19T08:20:11Z',
    },
  ])

  const handleRetryContingency = (id) => {
    setContingencyQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'RESOLVED', retry_count: item.retry_count + 1 } : item))
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: FONTS.serif, fontSize: 28, color: COLORS.greenDark, margin: 0, fontWeight: 600 }}>
            Gestión Fiscal & Automatizaciones
          </h1>
          <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, marginTop: 4 }}>
            Capa Fiscal Argentina (AFIP / ARCA WSFE) · Resiliencia Operativa & Contingencia Desacoplada
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{
            fontFamily: FONTS.sans, fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 4,
            background: 'rgba(48,77,59,0.1)', color: COLORS.green, border: `1px solid ${COLORS.lineGreen}`
          }}>
            PUNTO DE VENTA #{String(config.posNumber).padStart(4, '0')}
          </span>
          <span style={{
            fontFamily: FONTS.sans, fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 4,
            background: 'rgba(48,77,59,0.06)', color: COLORS.greenDark, border: `1px solid ${COLORS.lineGreen}`
          }}>
            CUIT: {config.cuit}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${COLORS.lineGreen}`, marginBottom: 24, gap: 12 }}>
        {[
          { id: 'invoices', label: `Comprobantes (${invoices.length})` },
          { id: 'contingency', label: `Cola de Contingencia (${contingencyQueue.filter(q => q.status === 'PENDING').length})` },
          { id: 'automations', label: `Automatizaciones (${automations.length})` },
          { id: 'config', label: 'Parámetros AFIP / ARCA' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              fontFamily: FONTS.sans,
              fontSize: 13,
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid ${COLORS.green}` : '2px solid transparent',
              color: activeTab === tab.id ? COLORS.greenDark : COLORS.onLightMuted,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Comprobantes */}
      {activeTab === 'invoices' && (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr 1fr 1.2fr', padding: '12px 18px', background: 'rgba(48,77,59,0.04)', borderBottom: `1px solid ${COLORS.lineGreen}`, fontFamily: FONTS.sans, fontSize: 11, fontWeight: 700, color: COLORS.onLightMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Comprobante</span>
            <span>Receptor</span>
            <span>Neto</span>
            <span>IVA</span>
            <span>Total</span>
            <span style={{ textAlign: 'right' }}>Estado / CAE</span>
          </div>
          {invoices.map((inv, i) => (
            <div key={inv.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr 1fr 1.2fr', padding: '14px 18px', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', alignItems: 'center', fontFamily: FONTS.sans, fontSize: 13 }}>
              <div>
                <p style={{ fontWeight: 700, color: COLORS.greenDark, margin: 0 }}>{inv.invoice_type.replace('_', ' ')}</p>
                <p style={{ fontFamily: 'monospace', fontSize: 11, color: COLORS.onLightMuted, margin: '2px 0 0' }}>
                  #{String(inv.pos_number).padStart(4, '0')}-{String(inv.invoice_number).padStart(8, '0')}
                </p>
              </div>
              <div>
                <p style={{ color: COLORS.onLight, margin: 0 }}>{inv.customer_name}</p>
                {inv.customer_tax_id && <p style={{ fontFamily: 'monospace', fontSize: 11, color: COLORS.onLightFaint, margin: '2px 0 0' }}>CUIT: {inv.customer_tax_id}</p>}
              </div>
              <span style={{ color: COLORS.onLightMuted }}>{formatMoney(inv.net_amount)}</span>
              <span style={{ color: COLORS.onLightMuted }}>{formatMoney(inv.vat_amount)}</span>
              <span style={{ fontWeight: 700, color: COLORS.greenDark }}>{formatMoney(inv.total_amount)}</span>
              <div style={{ textAlign: 'right' }}>
                {inv.status === 'AUTHORIZED' ? (
                  <>
                    <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(48,77,59,0.1)', color: COLORS.green, padding: '3px 8px', borderRadius: 3, display: 'inline-block' }}>
                      CAE: {inv.cae}
                    </span>
                    {inv.qr_url && (
                      <a href={inv.qr_url} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: 11, color: COLORS.green, marginTop: 4, textDecoration: 'none' }}>
                        Ver QR AFIP ↗
                      </a>
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(176,138,62,0.15)', color: '#8A6A2E', padding: '3px 8px', borderRadius: 3 }}>
                    EN CONTINGENCIA
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Contingencia */}
      {activeTab === 'contingency' && (
        <div>
          <div style={{ padding: '14px 18px', background: 'rgba(176,138,62,0.08)', border: `1px solid #B08A3E`, marginBottom: 16 }}>
            <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: '#8A6A2E', margin: 0, fontWeight: 600 }}>
              Protocolo de Resiliencia Operativa Activo
            </p>
            <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted, margin: '4px 0 0' }}>
              Las ventas del salón y la app nunca son bloqueadas por caídas de AFIP. Los comprobantes se encolan con un timeout estricto de 3.5 segundos y se resuelven en background sin alterar la caja ni el inventario.
            </p>
          </div>

          {contingencyQueue.length === 0 ? (
            <EmptyState label="Sin comprobantes en cola de contingencia." />
          ) : (
            <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}` }}>
              {contingencyQueue.map((item, i) => (
                <div key={item.id} style={{ padding: '16px 18px', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <p style={{ fontFamily: FONTS.sans, fontSize: 14, fontWeight: 700, color: COLORS.greenDark, margin: 0 }}>
                      {item.invoice_ref} · {formatMoney(item.amount)}
                    </p>
                    <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: '#A65B4A', margin: '4px 0 0' }}>
                      Causa: {item.last_error}
                    </p>
                    <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightFaint, margin: '4px 0 0' }}>
                      Reintentos: {item.retry_count} / {item.max_retries} · Estado: {item.status}
                    </p>
                  </div>
                  <div>
                    {item.status === 'PENDING' ? (
                      <Button size="sm" onClick={() => handleRetryContingency(item.id)}>
                        Resolver Ahora
                      </Button>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.green }}>✓ RESUELTO</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Automatizaciones */}
      {activeTab === 'automations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h3 style={{ fontFamily: FONTS.sans, fontSize: 15, fontWeight: 700, color: COLORS.greenDark, marginBottom: 12 }}>
              Reglas Activas en el Pipeline de Eventos
            </h3>
            <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}` }}>
              {automations.map((rule, i) => (
                <div key={rule.id} style={{ padding: '14px 18px', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontFamily: FONTS.sans, fontSize: 13, fontWeight: 700, color: COLORS.greenDark, margin: 0 }}>{rule.name}</p>
                    <p style={{ fontFamily: 'monospace', fontSize: 11, color: COLORS.onLightMuted, margin: '3px 0 0' }}>
                      Evento: {rule.event_type} → Acción: {rule.action_type}
                    </p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(48,77,59,0.1)', color: COLORS.green, padding: '3px 8px', borderRadius: 3 }}>
                    ACTIVA
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontFamily: FONTS.sans, fontSize: 15, fontWeight: 700, color: COLORS.greenDark, marginBottom: 12 }}>
              Registro de Ejecuciones & Claves de Idempotencia (Anti-Spam)
            </h3>
            <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}` }}>
              {executions.map((exec, i) => (
                <div key={exec.id} style={{ padding: '12px 18px', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight, margin: 0, fontWeight: 600 }}>{exec.rule_name}</p>
                    <p style={{ fontFamily: 'monospace', fontSize: 11, color: COLORS.onLightFaint, margin: '2px 0 0' }}>
                      Key: {exec.idempotency_key}
                    </p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.green }}>
                    ✓ SUCCESS ({formatDate(exec.executed_at)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Parámetros AFIP */}
      {activeTab === 'config' && (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, padding: 24, maxWidth: 640 }}>
          <h3 style={{ fontFamily: FONTS.serif, fontSize: 18, color: COLORS.greenDark, marginTop: 0, marginBottom: 16 }}>
            Parámetros Fiscales del Contribuyente
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: FONTS.sans, fontSize: 13 }}>
            <div>
              <span style={{ color: COLORS.onLightMuted, display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Razón Social</span>
              <span style={{ fontWeight: 600, color: COLORS.greenDark }}>{config.legalName}</span>
            </div>
            <div>
              <span style={{ color: COLORS.onLightMuted, display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CUIT Emisor</span>
              <span style={{ fontWeight: 600, color: COLORS.greenDark }}>{config.cuit}</span>
            </div>
            <div>
              <span style={{ color: COLORS.onLightMuted, display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Condición Tributaria</span>
              <span style={{ fontWeight: 600, color: COLORS.greenDark }}>{config.taxCondition}</span>
            </div>
            <div>
              <span style={{ color: COLORS.onLightMuted, display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Punto de Venta Habilitado</span>
              <span style={{ fontWeight: 600, color: COLORS.greenDark }}>Pto. Vta. #{config.posNumber} (Facturación Electrónica WSFE)</span>
            </div>
            <div>
              <span style={{ color: COLORS.onLightMuted, display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Límite de Timeout en Salón</span>
              <span style={{ fontWeight: 600, color: COLORS.greenDark }}>{config.caeTimeoutLimit}</span>
            </div>
          </div>
          <div style={{ marginTop: 24, padding: 12, background: 'rgba(48,77,59,0.06)', border: `1px solid ${COLORS.lineGreen}`, fontSize: 11, color: COLORS.onLightMuted }}>
            ⚠️ <strong>Validación Externa:</strong> Los certificados digitales X.509 y claves privadas deben residir en el Vault seguro del backend. La UI nunca expone secretos criptográficos.
          </div>
        </div>
      )}
    </div>
  )
}
