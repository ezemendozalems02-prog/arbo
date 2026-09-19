# FASE 1 — NOTAS DE MIGRACIÓN Y TRANSICIÓN DE CÓDIGO

---

### METADATOS
- **Documento:** `docs/implementation/04-migration-notes.md`
- **Fase:** Fase 1 — Persistencia, Auth & RLS
- **Fecha:** 19 de Septiembre de 2026

---

## 1. ESTRATEGIA DE TRANSICIÓN NO DESTRUCTIVA

Para cumplir la regla de oro de **cero regresiones**, la Fase 1 adopta una estrategia de incorporación progresiva:

1. **Instalación de Dependencia:** Se añade `@supabase/supabase-js` a `package.json`.
2. **Cliente Centralizado:** Se crea `src/lib/supabase.js` que inicializa el cliente utilizando las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Si las variables no están configuradas (ej. en un entorno local offline sin conexión a Supabase), el cliente opera en un modo seguro de emulación para no hacer crashear el bundle de Vite.
3. **Coexistencia de Contextos:**
   - Se introduce `AuthContext.jsx` en la raíz de `/admin`.
   - Los contextos existentes (`POSContext`, `InventoryContext`, `CRMContext`) se mantienen funcionando en paralelo con sus datos en memoria durante esta fase, garantizando que el POS, mesas y KDS sigan siendo navegables mientras se valida el login y la seguridad.
4. **Protección de Rutas:**
   - La ruta `/admin/*` queda envuelta por `<ProtectedRoute>`, el cual verifica si existe una sesión activa en `AuthContext`.
   - Si no hay usuario autenticado, redirige a `/admin/login`.
   - Se provee una pantalla de login profesional integrada al diseño de ARBO.

---

## 2. EXTRACCIÓN DE DATOS PARA LA SEMILLA (SEED.SQL)

Los datos sintéticos de `src/mock/products.js`, `src/mock/recipes.js` y `src/mock/inventoryItems.js` representan un catálogo gastronómico bien diseñado (cafetería de especialidad y hamburguesería gourmet).

Se estructuran en el script formal `supabase/seed.sql` vinculándolos a:
- **Organización A:** "Café Arbo Palermo SRL" (Sucursal: "Palermo Soho")
- **Organización B:** "Burger Arbo Belgrano SRL" (Sucursal: "Belgrano R")
- **Usuarios de prueba:**
  - `admin@arbo.app` (Rol: OWNER de Org A)
  - `cajero@arbo.app` (Rol: CASHIER de Org A)
  - `admin.belgrano@arbo.app` (Rol: OWNER de Org B)

Las ventas mock, campañas y reservas simuladas se descartan formalmente de la migración por carecer de integridad transaccional.
