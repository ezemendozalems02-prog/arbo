# ARBO OS — PRE-PHASE 9 CHECKPOINT
## 06. MAPA CONCEPTUAL DE DOMINIOS

```
ORGANIZATION (Tenant Raíz)
│
├── BRANCH (Sucursal / Locación Física)
│   ├── WAREHOUSE (Depósito Primario / Barra / Cocina)
│   │   └── INVENTORY MOVEMENTS (Ledger Append-Only con Costo Snapshot)
│   │
│   ├── POS & MESAS (Punto de Venta Salón / Mostrador)
│   ├── CASH SESSIONS & MOVEMENTS (Control de Turno & Arqueo Ciego)
│   ├── KDS STATIONS & TICKETS (Despacho en Cocina / Barra Realtime)
│   └── BRANCH PRODUCT SETTINGS (Disponibilidad y Precio Regional)
│
├── CATALOG & COSTING
│   ├── CATEGORIES & PRODUCTS (Catálogo Maestro)
│   ├── INGREDIENTS & SUPPLIERS (Insumos Base & Factores de Empaque)
│   └── RECIPES & RECIPE ITEMS (Fichas Técnicas con Rinde y Merma)
│
├── SALES & FINANCE
│   ├── SALES & SALE ITEMS (Transacciones ACID)
│   ├── PAYMENTS (Cobro Multi-medio)
│   └── FISCAL INVOICES & CONTINGENCY (AFIP WSFE / ARCA)
│
├── STOCK TRANSFERS & LOGISTICS
│   ├── STOCK TRANSFERS (Remitos Internos TR-XXXX)
│   └── STOCK TRANSFER ITEMS (Snapshots & Mermas en Tránsito)
│
├── CUSTOMER & GROWTH
│   ├── CUSTOMERS & SEGMENTS (CRM Dinámico)
│   └── ARBO CLUB (Ledger de Puntos, Tiers & Recompensas)
│
└── AUTOMATION & INTELLIGENCE (AMPLIADO EN FASE 9)
    ├── AUTOMATION RULES & EXECUTIONS (Fase 7)
    ├── PURCHASE SUGGESTIONS (Fase 9 - Compras Sugeridas por Insumo/Bulto)
    ├── MENU ENGINEERING MATRIX (Fase 9 - Kasavana-Smith)
    ├── FOOD COST ALERTS (Fase 9 - Alertas de Margen Crítico)
    └── EXECUTIVE ANALYTICS VIEWS (Fase 9 - Reportes de Ventas, Platos, Clientes)
```
