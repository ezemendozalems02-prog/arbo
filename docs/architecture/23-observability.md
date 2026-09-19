# 23 — OBSERVABILIDAD, REGISTRO ESTRUCTURADO Y TELEMETRÍA

---

## 1. PRINCIPIOS DE OBSERVABILIDAD EN ARBO OS

> **"Un sistema transaccional que maneja dinero e inventario no puede depurarse con `console.log` dispersos. Cada anomalía operativa, discrepancia de caja o timeout fiscal debe ser localizable en segundos mediante identificadores de correlación únicos y logs estructurados."**

---

## 2. FORMATO DE LOGS ESTRUCTURADOS (JSON SCHEMA)

Todos los servicios emiten logs estructurados en formato JSON estándar:
```json
{
  "timestamp": "2026-09-19T14:45:02.891Z",
  "level": "WARN",
  "service": "sales-transaction-service",
  "correlation_id": "corr_7c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f",
  "organization_id": "org_a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "branch_id": "br_11223344-5566-7788-99aa-bbccddeeff00",
  "user_id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "event_type": "ANOMALY_CASH_DISCREPANCY",
  "message": "Arqueo ciego cerrado con faltante de efectivo superior al umbral de tolerancia",
  "context": {
    "shift_id": "shf_55443322-1100-9988-7766-554433221100",
    "declared_amount": 42000.00,
    "theoretical_amount": 45500.00,
    "discrepancy": -3500.00,
    "tolerance_threshold": 500.00
  }
}
```

---

## 3. IDENTIFICADORES DE CORRELACIÓN (`X-Correlation-Id`)

1. **Generación en Frontend:** Cuando el cajero presiona "Cobrar" en el POS, el cliente genera un `UUID v4` y lo adjunta en el encabezado HTTP `X-Correlation-Id`.
2. **Propagación:** El API Gateway y las Edge Functions registran ese mismo ID en cada consulta SQL (`/* correlation_id: ... */`), llamadas a MercadoPago y logs de eventos.
3. **Diagnóstico Inmediato:** Ante una queja de cobro o problema de stock, el desarrollador o soporte técnico busca el `correlation_id` y obtiene la traza completa de punta a punta en Sentry o Grafana.

---

## 4. MATRIZ DE ALERTAS CRÍTICAS DE TELEMETRÍA

| Código de Alerta | Severidad | Condición de Disparo | Notificación Inmediata |
| :--- | :--- | :--- | :--- |
| `ALERT_NEGATIVE_STOCK` | MEDIA | Un ingrediente cae por debajo de 0 tras una venta. | Panel de Compras del Encargado. |
| `ALERT_CASH_DISCREPANCY` | ALTA | Discrepancia de arqueo de caja $> \$1.000$ ARS. | Email / WhatsApp al Dueño (Owner). |
| `ALERT_AFIP_OFFLINE` | MEDIA | Servidor de AFIP no responde en 3.5s; entra contingencia. | Dashboard de Soporte Técnico. |
| `ALERT_KDS_SOCKET_DROP` | ALTA | Más de 3 terminales KDS pierden WebSockets simultáneamente. | Alerta visual en pantalla de sala y soporte. |
| `ALERT_AUTH_BRUTE_FORCE` | CRÍTICA | Más de 5 intentos fallidos de login en `/admin` en 1 min. | Bloqueo temporal de IP y alerta de seguridad. |

---

## 5. HEALTHCHECKS Y ENDPOINTS DE DIAGNÓSTICO

- `GET /healthz`: Verifica la disponibilidad inmediata del servidor HTTP (`200 OK`).
- `GET /readyz`: Verifica la conectividad activa con PostgreSQL, el estado de las colas de Redis y el pool de conexiones. Utilizado por Kubernetes / Vercel para enrutar tráfico.
