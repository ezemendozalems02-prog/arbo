# ARBO OS — FASE 6: GUEST CHECKOUT & IDENTIFICACIÓN DE BAJA FRICCIÓN
## REGISTRO RÁPIDO SIN FRICCIÓN DE CONTRASEÑAS

---

## 1. PRINCIPIO DE EXPERIENCIA: GUEST CHECKOUT

En gastronomía, exigir contraseñas o procesos de registro extensos destruye la conversión. ARBO OS adopta un modelo de **Guest Checkout inteligente**:

### Datos Requeridos:
- **Nombre y Apellido**: Para rotular la orden y llamar al cliente.
- **Teléfono**: Identificador principal de baja fricción.
- **Email (Opcional)**: Para comprobantes electrónicos.
- **Notas de Entrega**: Indicaciones particulares.

---

## 2. NORMALIZACIÓN Y ASOCIACIÓN AUTOMÁTICA

Mediante `resolveOrCreatePublicCustomer(state, ...)`:
1. El teléfono se normaliza automáticamente (`+54 9 341 555-1234` $\rightarrow$ `+5493415551234`).
2. Se consulta la base de datos con el índice `UNIQUE(organization_id, phone)`:
   - **Si el cliente ya existe**: Se asocia la nueva orden a su ficha histórica, preservando su frecuencia, valor acumulado y saldo de puntos.
   - **Si el cliente es nuevo**: Se inserta un nuevo registro en `customers` con estado `ACTIVE`.
3. **Privacidad Garantizada**: El checkout público nunca expone el historial de compras pasadas ni los saldos acumulados de la persona que posea ese número, evitando filtraciones de PII.
