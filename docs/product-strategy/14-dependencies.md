# 14 — GRAFO CONCEPTUAL DE DEPENDENCIAS DE ARBO OS

---

## 1. PRINCIPIO DE ORDEN TOPOLÓGICO

> **"Un rascacielos no puede sostenerse sobre cimientos de barro. El error de la fase previa de ARBO OS fue construir hermosos componentes de frontend (campañas de marketing, ARBO Club, tienda pública) sobre un almacenamiento volátil (`localStorage`) sin transacciones reales. Toda la estrategia de producto depende de respetar estrictamente la cadena de dependencias naturales del negocio gastronómico."**

---

## 2. GRAFO CONCEPTUAL DE DEPENDENCIAS

```
                      ┌──────────────────────────────────────┐
                      │    NIVEL 0: AUTENTICACIÓN & TENANCY  │
                      │   (Auth, Roles, Organization, Branch)│
                      └──────────────────┬───────────────────┘
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │    NIVEL 1: CATÁLOGO & MATERIAS PRIMAS│
                      │  (Ingredientes, Productos, Recetas)  │
                      └──────────────────┬───────────────────┘
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │   NIVEL 2: EJECUCIÓN TRANSACCIONAL   │
                      │    (Salón, POS, KDS Cocina, Caja)    │
                      └──────────────────┬───────────────────┘
                                         │
                    ┌────────────────────┴───────────────────┐
                    ▼                                        ▼
    ┌────────────────────────────────┐       ┌────────────────────────────────┐
    │  NIVEL 3A: INVENTARIO & COSTEO │       │  NIVEL 3B: CLIENTES & FIDELIZ. │
    │(Descarga recetas, Compras, CMV)│       │ (Directorio, Ledger ARBO Club) │
    └───────────────┬────────────────┘       └───────────────┬────────────────┘
                    │                                        │
                    └────────────────────┬───────────────────┘
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │   NIVEL 4: CANALES PÚBLICOS PROPIOS  │
                      │ (Menú QR, Tienda Delivery, Reservas) │
                      └──────────────────┬───────────────────┘
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │ NIVEL 5: INTELIGENCIA & AUTOMATIZACIÓN│
                      │(Sugerencias Compra, Triggers, Alertas│
                      └──────────────────────────────────────┘
```

---

## 3. JUSTIFICACIÓN DE CADA NIVEL DE DEPENDENCIA

### Nivel 0: Autenticación & Multi-Tenancy (Bloqueante Absoluto)
- **Por qué es primero:** No se puede guardar una venta ni un gramo de harina si no sabemos a qué organización (`organization_id`), sucursal (`branch_id`) y usuario cajero pertenece.
- **Riesgo si se posterga:** Si se programa el catálogo sin `branch_id`, toda la base de datos tendrá que reescribirse cuando se active la segunda sucursal (`[FACT: El gran error de Fudo]`).

### Nivel 1: Catálogo, Ingredientes & Recetas
- **Por qué depende de Nivel 0:** Los insumos y recetas pertenecen al catálogo del tenant.
- **Por qué precede a las transacciones:** El POS y la Cocina no pueden despachar productos que no existen formalmente modelados con sus ingredientes y costos base.

### Nivel 2: Ejecución Transaccional (POS, Salón, KDS, Caja)
- **Por qué depende de Nivel 1:** Utiliza los productos del catálogo para armar tickets y comandas.
- **Por qué es el corazón:** Aquí se genera el dinero y el flujo de trabajo físico del local. Si una comanda no llega a cocina o un cobro no cierra caja, el restaurante colapsa.

### Nivel 3A: Inventario & Costeo
- **Por qué depende de Nivel 2:** La "explosión de recetas" requiere que la venta haya ocurrido en el POS o Mesa para saber exactamente qué descontar del stock (`[FACT: InventoryContext.jsx:18-22]`).

### Nivel 3B: Clientes & ARBO Club
- **Por qué depende de Nivel 2:** Los puntos del Club se ganan a partir de los montos efectivamente cobrados en caja. No puede haber puntos sin transacciones reales.

### Nivel 4: Canales Públicos Propios (Delivery, QR, Reservas)
- **Por qué depende de Niveles 1, 2, 3A y 3B:** 
  - La tienda online necesita leer el menú activo del catálogo (Nivel 1).
  - El pedido online debe inyectarse en el KDS de cocina y la caja (Nivel 2).
  - La venta online debe descontar stock para no vender platos agotados (Nivel 3A).
  - El comensal online acumula o canjea puntos de su cuenta (Nivel 3B).

### Nivel 5: Inteligencia & Automatización
- **Por qué depende de todos los anteriores:** Las sugerencias de reposición necesitan el stock real (Nivel 3A); la segmentación de clientes necesita el historial de consumo acumulado (Nivel 3B); y las alertas de margen necesitan los costos reales de compra e ingredientes (Niveles 1 y 3A).

---

## 4. CONCLUSIÓN DIRECTIVA PARA LA ARQUITECTURA

Cualquier esfuerzo de desarrollo que intente construir componentes de Niveles 4 o 5 antes de haber completado y estabilizado los Niveles 0, 1 y 2 en base de datos **será inmediatamente rechazado**, ya que reproduciría la ilusión de funcionalidad que llevó al estado de prototipo desconectado anterior.
