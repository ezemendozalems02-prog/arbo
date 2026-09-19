# ARBO OS — FASE 3: LIMITACIONES CONOCIDAS Y ALCANCE POSTERGADO

---

## 1. LIMITACIONES Y ALCANCES POSTERGADOS

1. **Métodos de Pago:**
   - La Fase 3 implementa de forma operativa y transaccional **exclusivamente pagos en efectivo (`CASH`)**.
   - Pagos electrónicos (tarjetas de crédito/débito, Mercado Pago, transferencias QR interoperable) quedan expresamente reservados para fases futuras.
2. **KDS & Despacho:**
   - El enrutamiento de comandas a pantallas de cocina y barismo en tiempo real no forma parte del núcleo ACID de ventas y se implementará en su fase dedicada.
3. **Fiscalidad AFIP / ARCA:**
   - La emisión de Facturas A, B, C y la obtención de CAE no se ejecutan en esta fase.
4. **Offline-First:**
   - La sincronización bidireccional P2P / CRDT con IndexedDB offline no está activa en este sprint; la persistencia transaccional se apoya en PostgreSQL y RPC.
5. **ARBO Club / Fidelización:**
   - Puntos, tiers de fidelidad y canje de beneficios se encuentran desacoplados del checkout transaccional principal.
