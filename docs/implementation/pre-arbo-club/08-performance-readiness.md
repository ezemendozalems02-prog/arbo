# ARBO OS — PRE-ARBO CLUB CHECKPOINT: RENDIMIENTO E ÍNDICES NECESARIOS

---

## 1. EVALUACIÓN DE CONSULTAS DE ALTA FRECUENCIA

En la Fase 5, se ejecutarán con frecuencia las siguientes consultas:
1. **Búsqueda instantánea de cliente en Mostrador / POS:**
   Por teléfono o DNI durante el tipeo rápido del cajero ($<50\text{ms}$).
2. **Historial de compras del cliente:**
   Extracción de las últimas ventas de un cliente específico.
3. **Auditoría de puntos:**
   Extracción de los últimos movimientos del ledger `loyalty_transactions`.

---

## 2. ÍNDICES RECOMENDADOS PARA FASE 5 (DECISIONES PRE-DEFINIDAS)

Para garantizar tiempos de respuesta sub-100ms cuando la base de datos crezca a decenas de miles de ventas:

```sql
-- 1. Búsqueda instantánea de clientes en mostrador
CREATE INDEX IF NOT EXISTS idx_customers_org_phone ON public.customers(organization_id, phone);
CREATE INDEX IF NOT EXISTS idx_customers_org_email ON public.customers(organization_id, email);

-- 2. Historial de ventas por cliente
CREATE INDEX IF NOT EXISTS idx_sales_org_customer_time ON public.sales(organization_id, customer_id, created_at DESC);

-- 3. Libro mayor de fidelización
CREATE INDEX IF NOT EXISTS idx_loyalty_tx_customer ON public.loyalty_transactions(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_tx_reference ON public.loyalty_transactions(reference_id);
```

*(Nota: Estos índices se definen como parte de la especificación técnica de Fase 5 y se crearán en la migración SQL correspondiente).*
