# 16 — COMERCIO PÚBLICO: MENÚ QR, TIENDA Y RESERVAS AISLADAS

---

## 1. SEPARACIÓN FÍSICA Y LÓGICA: PUBLIC vs ADMIN

Para erradicar la filtración de código interno y datos de clientes descubierta en la auditoría forense, la arquitectura impone una **separación absoluta entre el espacio público y el administrativo**:

```
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│     ESPACIO PÚBLICO (COMENSALES)     │ │   ESPACIO ADMINISTRATIVO      │
│  - Ruta: /menu, /pedidos, /reservas  │ │  - Ruta: /admin/* (Protegida) │
│  - Bundle liviano (<300 KB JS)       │ │  - Bundle con auth obligatoria│
│  - Cero código administrativo        │ │  - Acceso a caja, P&L y stock │
│  - Consumo exclusivo de API pública  │ │  - Políticas RLS estrictas    │
└──────────────────────────────────────┘ └───────────────────────────────┘
```

---

## 2. EL PIPELINE DE COMPRA ONLINE (DELIVERY & TAKEAWAY)

```
[Comensal Navega en Menú Web] ──► [Agrega Platos al Carrito Local]
                                              │
                                              ▼
[Selecciona Takeaway o Envío] ──► [Ingresa Teléfono / WhatsApp]
                                              │
                                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│            POST /api/public/{slug}/orders (Rate-Limited)               │
│ - El servidor recalcula precios unitarios desde la base de datos       │
│ - Se genera la orden en estado 'PENDING_PAYMENT'                       │
│ - Se genera la preferencia de pago en MercadoPago Checkout Pro         │
└─────────────────────────────────────┬──────────────────────────────────┘
                                      │ Retorna URL de Pago
                                      ▼
                      [Comensal Paga en MercadoPago]
                                      │
                                      ▼ Webhook Oficial
┌────────────────────────────────────────────────────────────────────────┐
│            POST /api/webhooks/mercadopago (Firma Criptográfica)        │
│ 1. Valida firma del webhook con MP_WEBHOOK_SECRET                      │
│ 2. Consulta estado en API de MercadoPago -> Confirmado                 │
│ 3. Actualiza orden a 'CONFIRMED' / 'SETTLED' en transacción atómica    │
│ 4. Inyecta ticket automáticamente en el KDS de Cocina en tiempo real   │
│ 5. Descuenta stock por receta y acredita puntos de ARBO Club           │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1. Resolución Definitiva de BUG-001 (Pedidos Descartados)
En el código original (`src/pages/PublicDelivery.jsx`), el botón de confirmación de pedido se limitaba a mostrar un modal visual sin persistir la orden en ninguna base de datos (`[FACT: BUG-001]`). Con el pipeline actual, la orden queda formalmente persistida en PostgreSQL con trazabilidad de pago antes de llegar a la cocina.

---

## 3. MÓDULO DE RESERVAS WEB INTEGRADO A SALÓN

### 3.1. Flujo de Reserva
1. El comensal ingresa a `/reservas`, selecciona cantidad de cubiertos, fecha y franja horaria.
2. La API `POST /api/public/{slug}/reservations` valida disponibilidad en el salón según la capacidad configurada de mesas.
3. Se inserta el registro en estado `CONFIRMED` o `PENDING_CONFIRMATION` (según política del local).
4. El plano de mesas (`FloorPlan.jsx`) proyecta visualmente la reserva en la mesa asignada para ese turno.

### 3.2. Resolución Definitiva de BUG-002 (Reservas Descartadas)
En el prototipo anterior (`src/pages/Reservas.jsx`), las reservas enviadas por el formulario web desaparecían al recargar la página (`[FACT: BUG-002]`). En la nueva arquitectura, las reservas residen en la tabla `reservations` vinculada al `branch_id`.

---

## 4. CONTRATOS DE ENDPOINTS PÚBLICOS

- `GET /api/public/{slug}/menu`: Retorna categorías, productos activos, fotos y modificadores. Cacheado en Cloudflare/Vercel Edge con revalidación automática (ISR) ante cambios en el catálogo.
- `POST /api/public/{slug}/orders`: Inicia la orden. Rate limit: 5 peticiones por minuto por IP para prevenir ataques de denegación de servicio.
- `POST /api/public/{slug}/reservations`: Registra la solicitud de reserva.
- `GET /api/public/club/balance?phone=...`: Permite al cliente consultar sus puntos enviando un código OTP por WhatsApp.
