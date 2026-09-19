import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { COLORS, FONTS } from '../styles/theme'
import { CheckIcon } from '../components/ui/icons'
import Button from '../components/ui/Button'

export default function OrderTracking() {
  const { token } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Seguimiento de Pedido | Arbo Patagonia'
    
    // Simular resolución de tracking público seguro con token no enumerable
    const mockOrder = {
      order_number: 1042,
      status: 'IN_PREPARATION', // 'PENDING', 'CONFIRMED', 'IN_PREPARATION', 'READY', 'COMPLETED'
      fulfillment_type: 'TAKEAWAY',
      customer_name: 'Thiago',
      customer_phone_masked: '+54 9 341 ***-1234',
      items: [
        { name: 'Espresso Doble', quantity: 1, subtotal: 3500 },
        { name: 'Medialuna de Manteca', quantity: 2, subtotal: 3600 }
      ],
      subtotal: 7100,
      total: 7100,
      created_at: new Date().toISOString(),
    }

    const timer = setTimeout(() => {
      setOrder(mockOrder)
      setLoading(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [token])

  const STATUS_STEPS = [
    { key: 'CONFIRMED', label: 'Pedido Confirmado', desc: 'Recibido en el sistema' },
    { key: 'IN_PREPARATION', label: 'En Preparación', desc: 'Baristas elaborando tu pedido' },
    { key: 'READY', label: 'Listo para Retirar', desc: 'Esperando en mostrador' },
    { key: 'COMPLETED', label: 'Entregado', desc: '¡Que lo disfrutes!' },
  ]

  const getCurrentStepIndex = () => {
    if (!order) return 0
    switch (order.status) {
      case 'PENDING': return 0
      case 'CONFIRMED': return 0
      case 'IN_PREPARATION': return 1
      case 'READY': return 2
      case 'COMPLETED': return 3
      default: return 0
    }
  }

  const currentStep = getCurrentStepIndex()

  return (
    <div style={{ minHeight: '80vh', padding: '120px 20px 80px', maxWidth: 680, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.green, marginBottom: 8 }}>
          Online Ordering · ARBO Patagonia
        </p>
        <h1 style={{ fontFamily: FONTS.serif, fontSize: 36, color: COLORS.greenDark, fontWeight: 500 }}>
          Seguimiento de Pedido
        </h1>
        {order && (
          <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onLightMuted, marginTop: 6 }}>
            Orden #{order.order_number} · Retiro en Mostrador (Takeaway)
          </p>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: COLORS.onLightMuted, fontFamily: FONTS.sans }}>
          Cargando estado del pedido...
        </div>
      ) : (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, padding: 32, borderRadius: 2 }}>
          {/* Stepper Visual */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 40, textAlign: 'center' }}>
            {STATUS_STEPS.map((step, idx) => {
              const isPast = idx < currentStep
              const isCurrent = idx === currentStep
              return (
                <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: isCurrent ? COLORS.green : isPast ? 'rgba(48,77,59,0.2)' : '#eee',
                    color: isCurrent ? COLORS.cream : isPast ? COLORS.green : '#999',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, marginBottom: 8,
                    border: isCurrent ? `2px solid ${COLORS.greenDark}` : 'none'
                  }}>
                    {isPast ? <CheckIcon width={14} height={14} /> : idx + 1}
                  </div>
                  <p style={{ fontFamily: FONTS.sans, fontSize: 11, fontWeight: isCurrent ? 600 : 400, color: isCurrent ? COLORS.greenDark : COLORS.onLightMuted }}>
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Resumen de Productos */}
          <div style={{ borderTop: `1px solid ${COLORS.lineGreen}`, paddingTop: 24, marginBottom: 24 }}>
            <h3 style={{ fontFamily: FONTS.serif, fontSize: 18, color: COLORS.greenDark, marginBottom: 16 }}>
              Detalle del Pedido
            </h3>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontFamily: FONTS.sans, fontSize: 14 }}>
                <span>{item.quantity}x {item.name}</span>
                <span style={{ fontWeight: 500 }}>${item.subtotal.toLocaleString('es-AR')}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${COLORS.lineGreen}`, paddingTop: 14, marginTop: 14, fontFamily: FONTS.sans, fontSize: 16, fontWeight: 600, color: COLORS.greenDark }}>
              <span>Total Abonado</span>
              <span>${order.total.toLocaleString('es-AR')}</span>
            </div>
          </div>

          {/* Datos del Cliente Enmascarados */}
          <div style={{ background: 'rgba(48,77,59,0.04)', padding: 16, borderLeft: `3px solid ${COLORS.green}`, marginBottom: 24 }}>
            <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted }}>
              <strong>Cliente:</strong> {order.customer_name} &nbsp;|&nbsp; <strong>Contacto:</strong> {order.customer_phone_masked}
            </p>
            <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightFaint, marginTop: 4 }}>
              * Por seguridad, los datos personales están protegidos y solo visibles con el enlace seguro.
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/carta">
              <Button variant="outline">Volver a la Carta</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
