# ARBO OS — FASE 7: CAPA FISCAL ARGENTINA & AUTOMATIZACIONES
## 05. COLA DE CONTINGENCIA FISCAL (`fiscal_contingency_queue`)

---

## 1. PRINCIPIO DE RESILIENCIA OPERATIVA
En gastronomía, el salón no puede detenerse porque un servidor estatal esté caído. Si la comunicación con AFIP falla o supera los 3.5 segundos:
1. La venta se confirma y cobra en caja normalmente.
2. El comprobante se registra en estado `PENDING_CONTINGENCY`.
3. Se inserta un trabajo asíncrono en `fiscal_contingency_queue`.
4. El cliente recibe un comprobante provisional con leyenda legal de procesamiento en curso.

```
                  ┌───────────────────────┐
                  │    VENTA CONFIRMADA   │
                  └──────────┬────────────┘
                             │
                             ▼
                    ¿Responde AFIP en <3.5s?
                           ╱   ╲
                     SÍ   ╱     ╲   NO / ERROR
                         ▼       ▼
              ┌──────────────┐   ┌───────────────────────────┐
              │  AUTHORIZED  │   │     COLA CONTINGENCIA     │
              │  (CAE / QR)  │   │  (Reintentos asíncronos)  │
              └──────────────┘   └─────────────┬─────────────┘
                                               │
                                               ▼
                                  Resolución diferida con CAE
```

## 2. ESQUEMA DE LA COLA
- `id`: UUID Primary Key.
- `organization_id`: Tenant.
- `fiscal_invoice_id`: Referencia al comprobante pendiente.
- `payload`: JSON congelado con el requerimiento original.
- `retry_count`: Cantidad de intentos ejecutados.
- `max_retries`: Máximo permitido (5 reintentos).
- `status`: `PENDING` -> `PROCESSING` -> `RESOLVED` (o `FAILED_PERMANENT`).
- `last_error`: Registro diagnóstico del último fallo de conexión.

## 3. IDEMPOTENCIA EN REINTENTOS
Los reintentos procesan el mismo número de comprobante asignado originalmente, impidiendo saltos de numeración o duplicaciones fiscales.
