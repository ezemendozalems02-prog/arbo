# ARBO OS — FASE 7: CAPA FISCAL ARGENTINA & AUTOMATIZACIONES
## 01. PUERTO FISCAL (FISCAL PORT) — ARQUITECTURA HEXAGONAL

---

## 1. PROPÓSITO & DESACOPLAMIENTO
El puerto fiscal (`FiscalPort`) es la abstracción fundamental que aísla el núcleo transaccional de ventas de ARBO OS de cualquier SDK, protocolo o servidor externo (como los Web Services de AFIP / ARCA).

```
┌───────────────────────────────────────┐
│     DOMINIO DE VENTAS (SALES CORE)    │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│              FiscalPort               │
│  - authorizeInvoice()                 │
│  - cancelInvoice()                    │
│  - getProviderStatus()                │
└──────────┬──────────────────┬─────────┘
           │                  │
           ▼                  ▼
┌─────────────────────┐  ┌─────────────────────┐
│  MockFiscalAdapter  │  │   AfipWsfeAdapter   │
│  (Tests / Local CI) │  │  (WSAA + WSFEv1)    │
└─────────────────────┘  └─────────────────────┘
```

## 2. CONTRATO DE INTERFAZ
Todo adaptador fiscal debe implementar los siguientes métodos de forma obligatoria:
- `authorizeInvoice(request)`: Recibe la solicitud de comprobante y retorna un objeto tipado con `status` ('AUTHORIZED', 'REJECTED', 'PENDING_CONTINGENCY'), `cae`, `caeExpiresAt`, o códigos de error formales.
- `cancelInvoice(request)`: Emite una Nota de Crédito o anulación fiscal.
- `getProviderStatus()`: Chequea la disponibilidad y latencia del proveedor sin bloquear hilos.

## 3. GARANTÍAS DE DOMINIO
1. **Independencia Tecnológica**: La venta, la caja y el stock no conocen XML, SOAP ni certificados criptográficos.
2. **Invarianza**: El fallo de la comunicación fiscal nunca produce rollback sobre la venta ya cobrada en el salón.
