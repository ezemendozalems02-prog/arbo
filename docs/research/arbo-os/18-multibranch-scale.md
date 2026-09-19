# 18 — Multi-sucursal, Franquicias y Escala

**Rutas:** `/franquicia` (público)  
**Archivos:** `src/pages/Franquicia.jsx`, `src/context/POSContext.jsx`, `InventoryContext.jsx`, `CRMContext.jsx`  
**Estado general:** `NOT_IMPLEMENTED` en el sistema operativo; `UI_ONLY` con pérdida de leads en el sitio público (BUG-024).

---

## 18.1 Ausencia del Concepto de Sucursal / Tenant

**FACT · NOT_IMPLEMENTED** — Todo el modelo de datos de ARBO OS está diseñado para un **único local físico**:
1. **Mesas:** El mapa de 14 mesas (`mock/tables.js`) es plano. No existe discriminación por local o piso.
2. **Stock:** Existe un único valor de `currentStock` por insumo. No hay depósitos (ej. *Depósito Central*, *Barra*, *Cocina*, *Sucursal 2*). No existen transferencias entre depósitos (`stockTransfers`).
3. **Caja:** Solo existe una única caja registradora activa. Imposible operar dos terminales POS en paralelo con cajas separadas.
4. **Catálogo y Precios:** No se admiten listas de precios diferenciadas por zona o sucursal.
5. **Aislamiento Multi-tenant:** No existe `organization_id`, `tenant_id` ni `branch_id` en ninguna estructura. Los tres contextos almacenan arrays globales en `localStorage`.

---

## 18.2 El Formulario de Franquicias (`/franquicia`) — Defecto Crítico

En el sitio público se promociona activamente el modelo de franquicias ARBO ("Patagonia para el mundo"):
- El componente `DossierForm` (`src/pages/Franquicia.jsx:14-36`) solicita: Nombre, Empresa, Ciudad, Email, Teléfono, Capital disponible y Mensaje.
- **BUG-024 · P1 · Formulario de franquicia descarta todos los datos en memoria:**
  ```js
  const submit = (e) => {
    e.preventDefault()
    setSent(true) // DEMO — no hay backend; en producción esto envía el formulario a un endpoint real.
  }
  ```
- **Real:** Al hacer clic en "Solicitar dossier", se muestra una pantalla de confirmación ("Solicitud recibida — Nuestro equipo va a contactarte"). Sin embargo, los datos **no se envían por email, no van a ningún webhook, no se guardan en el CRM ni en `localStorage`**.
- **Impacto comercial:** Pérdida absoluta de inversores y franquiciados potenciales que creen haberse postulado formalmente.

---

## 18.3 Requisitos para la Arquitectura Futura de Franquicias

Para que ARBO OS soporte franquicias o múltiples locales en su migración a Supabase, se requerirá:
1. `tenants` (Organización / Franquicia).
2. `branches` (Sucursales con dirección, CUIT, punto de venta fiscal propio).
3. `warehouses` (Depósitos centrales y locales).
4. `transfers` (Remitos internos de transferencia de insumos entre sucursales).
5. RLS con políticas multi-tenant segregando los datos por `branch_id`.
