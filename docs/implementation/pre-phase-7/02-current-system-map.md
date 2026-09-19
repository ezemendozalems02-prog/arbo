# ARBO OS — PRE-PHASE 7 CHECKPOINT
## 02. MAPA DEL SISTEMA ACTUAL vs SISTEMAS PENDIENTES

---

## 1. INVENTARIO EXHAUSTIVO DE DOMINIOS

A continuación se detalla la matriz de dominios funcionales, contrastando lo realmente construido y validado frente a los módulos pendientes de fases posteriores:

| Dominio Funcional | Estado | Implementado (Evidencia en Código) | Pendiente (Fases Futuras) | Fase Oficial |
| :--- | :---: | :--- | :--- | :---: |
| **Auth & Profiles** | **COMPLETO** | Supabase Auth, `user_profiles`, JWT, sesiones | Roles granulares por pantalla | Fase 1 |
| **Tenancy & RLS** | **COMPLETO** | `organizations`, `branches`, RLS 20 tablas | Jerarquía de franquicias global | Fase 1 |
| **Catálogo** | **COMPLETO** | `categories`, `products`, modificadores base | Catálogo centralizado multi-marca | Fase 2 |
| **Recetas & PPP** | **COMPLETO** | `recipes`, `recipe_items`, PPP, Food Cost % | Variantes de recetas por sucursal | Fase 2 |
| **Inventario Físico**| **COMPLETO** | `inventory_movements` (append-only ledger) | Transferencias entre depósitos | Fase 2 / 8 |
| **Ventas & POS** | **COMPLETO** | `sales`, `sale_items`, snapshots de precio | Modo offline con CRDTs | Fase 3 |
| **Caja & Turnos** | **COMPLETO** | `cash_registers`, `cash_sessions`, `cash_movements`| Múltiples cajas paralelas por local | Fase 3 / 7 |
| **Cocina (KDS)** | **COMPLETO** | `kitchen_stations`, `kitchen_tickets`, Realtime | Enrutamiento a impresoras térmicas ESC/POS | Fase 4 |
| **Clientes & CRM** | **COMPLETO** | `customers`, Customer 360, RFM dinámico | Campañas salientes masivas | Fase 5 |
| **ARBO Club** | **COMPLETO** | `loyalty_transactions`, $\lfloor \text{total}/100 \rfloor$, canjes | Multiplicadores por día o evento | Fase 5 |
| **Public Commerce**| **COMPLETO** | `public_orders`, tracking criptográfico, routing | Gateways online (MP/Stripe webhook) | Fase 6 |
| **Capa Fiscal Argentina** | **PENDIENTE** | Esquema base tributario (`tax_id` en orgs) | Facturas A/B/C, CAE, WSFE, QR AFIP | **FASE 7** |
| **Automatizaciones** | **PENDIENTE** | Registro de eventos base | Worker de cumpleaños, recordatorios | **FASE 7** |
| **Depósitos Centrales** | **PENDIENTE** | Stock por sucursal | Remitos de transferencia intercompañía | Fase 8 |

---

## 2. HALLAZGO CLAVE

El núcleo transaccional comercial (`Sales` $\rightarrow$ `Inventory` $\rightarrow$ `Cash` $\rightarrow$ `KDS` $\rightarrow$ `Customers` $\rightarrow$ `ARBO Club`) está **100% operativo y cerrado**.
El siguiente paso natural en la evolución legal, operativa y comercial en Argentina es la **Capa Fiscal (Facturación Electrónica AFIP/ARCA)** y el **Motor de Automatizaciones de Soporte**.
