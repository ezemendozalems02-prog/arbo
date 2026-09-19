# 03 — ARQUITECTURA DE ALTO NIVEL DEL SISTEMA

---

## 1. DIAGRAMA CONCEPTUAL DEL SISTEMA COMPLETO

La arquitectura de ARBO OS desacopla estrictamente los canales de entrada, la capa de aplicación, los servicios de dominio y la infraestructura de almacenamiento:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CANALES PÚBLICOS & EXTERNOS                     │
│   (Comensal Web, Menú QR, Clientes WhatsApp, Webhooks de Pago MP)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATIONS (PWA)                       │
│  - Public Store & QR Menu    - POS Mostrador / Takeaway                │
│  - Salón (Floor Plan)        - KDS Pantalla de Cocina / Barra          │
│  - Portal Administrativo     - Terminal Móvil de Mozos                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │  HTTPS / WebSockets (WSS)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    APPLICATION & SECURITY LAYER                        │
│  - Reverse Proxy / CDN (Vercel / Cloudflare)                           │
│  - API Gateway & Middleware (JWT Verification, Rate Limiting, CORS)    │
│  - Supabase Auth Service (GoTrue) + RBAC Authorizer                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     DOMAIN SERVICES (LÓGICA PURA)                      │
│  - Order & Pricing Service      - Recipe Explosion & Costing Engine    │
│  - Inventory Ledger Service     - Cash Session & Shift Calculator      │
│  - ARBO Club Loyalty Engine     - Customer Segmentation Engine         │
│  - Fiscal Adapter (AFIP)        - Kitchen Dispatcher & Station Router  │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
                    ▼                               ▼
┌───────────────────────────────────┐ ┌──────────────────────────────────┐
│   DATABASE & PERSISTENCE LAYER    │ │    BACKGROUND & EVENT BUS        │
│  - PostgreSQL 16+ Engine          │ │  - Redis / Queue Worker          │
│  - Row Level Security (RLS)       │ │  - Scheduled Cron Jobs (pg_cron) │
│  - WAL CDC (Supabase Realtime)    │ │  - Domain Event Dispatcher       │
│  - S3 Storage (Comprobantes)      │ │  - Async Notification Queue      │
└───────────────────────────────────┘ └──────────────────┬───────────────┘
                                                         │
                                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICE INTEGRATIONS                      │
│  - Pasarelas de Pago (MercadoPago Checkout Pro & Webhooks)             │
│  - Facturación Electrónica Fiscal (AFIP / ARCA Web Services)           │
│  - Mensajería Directa (Meta WhatsApp Cloud API / Email Transaccional)  │
│  - Hardware de Impresión (Agente ESC/POS Local / Impresoras de Red)    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. DESGLOSE DE LAS 5 CAPAS ESTRATÉGICAS

### 2.1. Public Customer Layer (Capa Pública de Comensales)
- **Componentes:** Menú Digital QR (`PublicMenu.jsx`), Tienda Online de Takeaway/Delivery (`PublicDelivery.jsx`), Módulo de Reservas Web (`Reservas.jsx`) y Portal de Miembros de ARBO Club.
- **Límites de Seguridad:** No tiene acceso a APIs administrativas. Solo consume endpoints públicos cacheados mediante CDN y un endpoint restringido de checkout (`POST /api/public/orders`) que valida existencias y genera la orden en estado `PENDING_PAYMENT`.
- **Rendimiento:** Carga inicial ultrarrápida (<300 KB), HTML semántico para SEO y PWA instalable sin login obligatorio para lectura del menú.

### 2.2. Operational Layer (Capa de Ejecución de Piso y Cocina)
- **Componentes:** POS de mostrador (`POS.jsx`), Gestión de Mesas (`FloorPlan.jsx`), Pantalla de Cocina KDS (`KitchenDisplay.jsx`) y Módulo de Caja (`Caja.jsx`).
- **Comportamiento:** Aplicaciones PWA con persistencia local (IndexedDB) para absorber fluctuaciones de red. Comunicación bidireccional en tiempo real con el servidor mediante WebSockets para sincronizar comandas y estados de mesa en menos de 200 ms.

### 2.3. Management Layer (Capa de Gestión y Control)
- **Componentes:** Administración de Recetas y Fichas Técnicas (`Recetas.jsx`), Control de Inventario y Auditorías (`Inventory.jsx`), Registro de Compras y Proveedores (`Compras.jsx`), CRM de Clientes (`Clientes.jsx`) y Reportes de Ventas y Food Cost.
- **Comportamiento:** Interfaces optimizadas para escritorio y tablet, con tablas avanzadas, filtrado server-side, exportación de datos y cálculos determinísticos de rentabilidad.

### 2.4. Growth Layer (Capa de Retención y Fidelización)
- **Componentes:** Motor de ARBO Club (ledger de puntos, niveles/tiers, catálogo de premios), Segmentador Dinámico de Comensales (reglas RFM) y Motor de Automatización de Campañas.
- **Comportamiento:** Opera de manera asíncrona reaccionando a los eventos de venta emitidos por la Capa Operativa, actualizando perfiles de clientes y programando disparos de comunicación externa.

### 2.5. Platform Layer (Capa de Plataforma y Gobierno)
- **Componentes:** Servicio de Autenticación, Control de Roles y Permisos (RBAC), Motor Multi-Tenant y Multi-Sucursal, Ledger de Auditoría Inmutable, Configuración Fiscal y Conectores de Hardware.
- **Comportamiento:** Garantiza la seguridad, el aislamiento de datos entre restaurantes y la trazabilidad de cada acción ejecutada en el sistema.

---

## 3. FLUJO GENERAL DE INFORMACIÓN Y LÍMITES TRANSACCIONALES

1. **Captura:** El pedido ingresa por el Salón, Mostrador o Web pública.
2. **Autorización y Validación:** El API Gateway autentica la sesión y valida el tenant (`organization_id`, `branch_id`).
3. **Persistencia y Ejecución:** La orden se asienta en PostgreSQL; se emite el evento en tiempo real para el KDS de cocina.
4. **Liquidación:** Al momento del pago, la base de datos ejecuta en una transacción atómica el cobro en caja, la descarga de ingredientes según receta y el cálculo de puntos de ARBO Club.
5. **Difusión Asíncrona:** El bus de eventos notifica a los servicios de fondo (revisión de stock bajo para compra sugerida, actualización de segmentos de CRM y facturación electrónica).
