# 20 — ESTRATEGIA DE MIGRACIÓN: DEL PROTOTIPO A LA ARQUITECTURA OBJETIVO

---

## 1. PRINCIPIO DE LA MIGRACIÓN

> **"La transición desde el prototipo actual (React SPA sobre `localStorage`) hacia la arquitectura objetivo (React + Backend PostgreSQL + Auth + Realtime) no debe realizarse mediante un 'big bang' descontrolado que rompa el trabajo estético previo. Se ejecuta mediante una sustitución quirúrgica por capas, preservando el 100% del valor visual y matemático ya construido."**

---

## 2. INVENTARIO DE MIGRACIÓN: CONSERVAR, REESCRIBIR, ELIMINAR Y ADAPTAR

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MATRIZ DE DISPOSICIÓN DE CÓDIGO                 │
├───────────────────────────────┬────────────────────────────────────────┤
│ QUÉ SE CONSERVA (PRESERVED)   │ - Sistema de diseño (Tailwind CSS v4). │
│                               │ - Paleta de colores cálidos y layouts. │
│                               │ - Algoritmos puros de costeo y PPP.    │
│                               │ - Lógica de partición KDS por estación.│
│                               │ - Ledger matemático de puntos y tiers. │
├───────────────────────────────┼────────────────────────────────────────┤
│ QUÉ SE REESCRIBE (REWRITTEN)  │ - Contextos de React (InventoryContext,│
│                               │   ClientContext) -> TanStack Query.    │
│                               │ - Cobro del POS -> Transacción SQL.    │
│                               │ - Checkout público -> API persistida.  │
├───────────────────────────────┼────────────────────────────────────────┤
│ QUÉ SE ELIMINA (ELIMINATED)   │ - Almacenamiento en 'localStorage'.    │
│                               │ - Acceso público sin login a /admin.   │
│                               │ - Simulación de compras en memoria.    │
├───────────────────────────────┼────────────────────────────────────────┤
│ QUÉ SE ADAPTA (ADAPTED)       │ - Componentes JS -> TypeScript (.tsx). │
│                               │ - IDs numéricos temporales -> UUID v4. │
│                               │ - Hooks de API con estados de carga.   │
└───────────────────────────────┴────────────────────────────────────────┘
```

---

## 3. HOJA DE RUTA DE MIGRACIÓN PASO A PASO

### Fase M1: Creación de la Capa de Tipos y Clientes API (TypeScript DTOs)
- Definir interfaces TypeScript estrictas para cada tabla y comando (`Order`, `OrderItem`, `CashShift`, `Ingredient`, `Recipe`).
- Configurar el cliente oficial `@supabase/supabase-js` con tipado automático generado desde el esquema de PostgreSQL.

### Fase M2: Sustitución de Contextos de React por TanStack Query
- Reemplazar el `InventoryContext` que guardaba arrays en memoria por hooks tipados:
  - `useInventory(warehouseId)` -> `GET /api/inventory`
  - `useRecipeCost(recipeId)` -> `GET /api/recipes/{id}/cost`
  - `useDepleteInventoryMutation()` -> ejecuta función transaccional en servidor.

### Fase M3: Blindaje de Rutas y Autenticación
- Instalar el middleware de verificación de sesión en `/admin`.
- Adaptar las pantallas existentes para consumir el usuario activo y rol desde `useAuthSession()`.

### Fase M4: Migración de Datos Semilla (Seed Data)
- Convertir los datos de demostración de cafetería y hamburguesería de `src/utils/` en un archivo formal de migración SQL (`00_seed_catalog.sql`) para inicializar ambientes de desarrollo y pruebas locales con un clic.
