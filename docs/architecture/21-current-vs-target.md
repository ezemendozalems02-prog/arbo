# 21 — MATRIZ EXHAUSTIVA DE BRECHAS: CÓDIGO ACTUAL vs ARQUITECTURA OBJETIVO

---

## MATRIZ COMPARATIVA DE CAPACIDADES TÉCNICAS

Esta matriz consolida la distancia exacta entre el estado actual del prototipo y el blueprint arquitectónico definido, asignando a cada componente una acción directiva formal:

| Dominio | Estado en Código Actual (Prototipo) | Arquitectura Objetivo (Target Architecture) | Acción Técnica |
| :--- | :--- | :--- | :--- |
| **Persistencia Primaria** | `localStorage` del navegador y arrays volátiles en memoria. | Base de datos relacional PostgreSQL 16+ con transacciones ACID. | **REPLACE** |
| **Arquitectura General** | SPA monolítica de React en cliente, sin backend real. | Arquitectura en 5 capas desacopladas (Clean Architecture / Hexagonal). | **REWRITE** |
| **Gestión de Estado** | React Contexts gigantes (`InventoryContext`, `ClientContext`) sin sincronía. | Separación: Server State (TanStack Query) + Client State (Zustand / IDB). | **REFACTOR** |
| **Autenticación & RBAC** | Rutas `/admin` públicas sin login; roles cosméticos no forzados. | Supabase Auth (JWT firmado), Middleware de servidor y 7 roles estrictos. | **REPLACE** |
| **Aislamiento de Datos** | Sin aislamiento (un solo espacio de datos en el navegador). | Multi-Tenancy y Multi-Sucursal nativo con Row Level Security (RLS). | **REPLACE** |
| **Transacción de Venta** | `handleCheckout` agrega un objeto a un array en memoria; no descuenta stock. | Pipeline transaccional en servidor con Idempotency-Key y commit atómico. | **REWRITE** |
| **Descarga de Inventario** | Comentario explícito `TODO` (`InventoryContext.jsx:18-22`); no descuenta materias primas. | Motor de explosión de recetas en base de datos (`fn_deplete_order_inventory`). | **REPLACE** |
| **Control de Caja** | BUG-018: reabrir una caja destruye los movimientos históricos previos. | Libro mayor de caja inmutable (append-only) con protocolo de arqueo ciego. | **REWRITE** |
| **Cocina (KDS)** | BUG-003 y BUG-004: ítems huérfanos y desincronización con el POS. | WebSockets CDC por estación con máquina de estados y fallback a polling. | **REFACTOR** |
| **Fidelización (Club)** | BUG-021: servicio de puntos desconectado del checkout del POS. | Sistema transversal con ledger auditable y selector de canje en POS. | **REFACTOR** |
| **Tienda Delivery Web** | BUG-001: el checkout de `/pedidos` no persiste la orden ni cobra. | API pública persistida en PostgreSQL + Webhooks de MercadoPago. | **REWRITE** |
| **Reservas Web** | BUG-002: las reservas enviadas desaparecen al recargar la página. | Tabla `reservations` persistida con mapeo automático al mapa de mesas. | **REWRITE** |
| **Capa Fiscal** | Cero soporte fiscal (sin emisión de Factura A, B, C ni CAE). | Capa fiscal desacoplada con patrón Adapter (AFIP WSFE y contingencia). | **REPLACE** |
| **Operación Offline** | Si se corta internet, la SPA carga de memoria pero no sincroniza. | PWA Offline-First con IndexedDB y gestor de drenaje con reconciliación. | **ENHANCE** |
| **Diseño y Estética** | Excelente interfaz en Tailwind CSS v4, Framer Motion y componentes cálidos. | Se preserva íntegramente el sistema de diseño visual migrando a TypeScript. | **PRESERVE** |
| **Lógica Matemática** | Algoritmos puros de costeo, PPP y segmentación matemática impecables. | Se preservan como Domain Services puros desacoplados de React. | **PRESERVE** |
