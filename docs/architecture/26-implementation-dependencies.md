# 26 — GRAFO ESTRICTO DE DEPENDENCIAS TÉCNICAS DE IMPLEMENTACIÓN

---

## 1. EL GRAFO TOPOLÓGICO DE CONSTRUCCIÓN

La implementación del sistema no admite atajos. Intentar construir la tienda online o las automatizaciones antes de que la base de datos y la transacción de venta sean inquebrantables provocaría el colapso del proyecto. 

El siguiente grafo define el **único orden técnicamente válido** de ejecución:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FASE 1: PERSISTENCIA & TENANCY BASE                  │
│       (PostgreSQL 16, Migraciones, Organizations, Branches, RLS)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Desbloquea
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 FASE 2: CATÁLOGO, INSUMOS & RECETAS                    │
│      (Productos, Fichas Técnicas, Costeo Dinámico, PPP, Unidades)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Desbloquea
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               FASE 3: NÚCLEO TRANSACCIONAL DE VENTAS & CAJA            │
│       (Órdenes, Mesas, Cobro Multi-medio, Turnos de Caja Inmutables)   │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │ Desbloquea                    │ Desbloquea
                    ▼                               ▼
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│     FASE 4: KDS & REALTIME COCINA    │ │ FASE 5: MOTOR DE INVENTARIO   │
│ (WebSockets, Routing por Estación,   │ │ (Explosión de Recetas, Compras│
│  Máquina de Estados de Preparación)  │ │  PPP, Descuento Atómico Stock)│
└───────────────────┬──────────────────┘ └──────────┬────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    │ Desbloquean conjuntamente
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              FASE 6: RETENCIÓN, CRM & ARBO CLUB INTEGRADO              │
│       (Ledger de Puntos Inmutable, Canje en POS, Segmentos RFM)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Desbloquea
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│            FASE 7: COMERCIO PÚBLICO & SOBERANÍA DIGITAL                │
│    (Menú QR Liviano, Delivery Web Propio, Reservas, MercadoPago)       │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
                    ▼                               ▼
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│       FASE 8: CAPA FISCAL ARGENTINA  │ │ FASE 9: AUTOMATIZACIONES &    │
│ (Adaptador AFIP WSFE, Factura A/B/C, │ │         INTELIGENCIA          │
│  Cola de Contingencia Asíncrona)     │ │ (Workers, WhatsApp, Food Cost)│
└──────────────────────────────────────┘ └──────────┬────────────────────┘
                                                    │
                                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             FASE 10: ESCALA MULTI-SUCURSAL & FRANQUICIAS               │
│ (Transferencias de Stock entre Depósitos, Catálogo Global, Consolidado)│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. JUSTIFICACIÓN DE CADA ESLABÓN DEL GRAFO

### Fase 1: Persistencia & Tenancy Base
- **Por qué primero:** Todo registro en el sistema necesita pertenecer a una organización y sucursal. Configurar el motor relacional y las políticas RLS desde el inicio erradica la posibilidad de filtraciones de datos.
- **Qué desbloquea:** Permite crear cualquier tabla transaccional con claves foráneas seguras.

### Fase 2: Catálogo, Insumos & Recetas
- **Por qué depende de Fase 1:** Los productos e ingredientes pertenecen al catálogo de la organización.
- **Qué desbloquea:** Permite cargar la carta física del restaurante antes de iniciar cualquier comanda.

### Fase 3: Núcleo Transaccional de Ventas & Caja
- **Por qué depende de Fase 2:** El POS y las mesas necesitan productos reales y precios para generar tickets.
- **Qué desbloquea:** Permite operar físicamente el restaurante (tomar pedidos y cobrar con caja cuadrada).

### Fase 4: KDS & Realtime Cocina
- **Por qué depende de Fase 3:** La pantalla de cocina necesita una orden creada para proyectar los platos en preparación.
- **Qué desbloquea:** Erradica las comandas en papel y sincroniza salón con despacho.

### Fase 5: Motor de Inventario & Explosión de Recetas
- **Por qué depende de Fases 2 y 3:** Necesita que la venta se haya cobrado (Fase 3) para descontar los ingredientes según su ficha técnica (Fase 2).
- **Qué desbloquea:** Control exacto de existencias y cálculo del Food Cost real.

### Fase 6: Retención, CRM & ARBO Club
- **Por qué depende de Fases 3 y 5:** Los puntos de fidelización derivan de ventas cobradas reales y los canjes de premios impactan como descuentos en el ticket de cobro del POS.
- **Qué desbloquea:** La capacidad de convertir al comensal en un cliente recurrente.

### Fase 7: Comercio Público (Delivery, Menú QR & Reservas)
- **Por qué depende de Fases 3, 4, 5 y 6:** El pedido online debe inyectarse en cocina (Fase 4), cobrar por pasarela (Fase 3), descontar stock para no sobrevender (Fase 5) y acumular puntos (Fase 6).
- **Qué desbloquea:** Ventas por internet a 0% de comisión para el restaurante.

### Fase 8: Capa Fiscal Argentina
- **Por qué depende de Fase 3:** Requiere una orden cobrada con desglose de IVA y medios de pago para emitir el comprobante oficial ante AFIP.
- **Qué desbloquea:** Operación 100% en regla fiscal para locales comerciales.

### Fase 9: Automatizaciones & Capa de Inteligencia
- **Por qué depende de Fases 5 y 6:** Las alertas de compra sugerida necesitan el stock real (Fase 5) y las campañas de marketing necesitan el historial de clientes (Fase 6).
- **Qué desbloquea:** Ahorro de tiempo para el dueño mediante decisiones proactivas.

### Fase 10: Escala Multi-Sucursal Avanzada
- **Por qué es la última:** Requiere que la operación de una sucursal individual esté totalmente estabilizada antes de habilitar transferencias de stock complejas entre múltiples depósitos.
