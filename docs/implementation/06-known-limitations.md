# FASE 1 — LIMITACIONES CONOCIDAS Y ALCANCE DIFERIDO

---

### METADATOS
- **Documento:** `docs/implementation/06-known-limitations.md`
- **Fase:** Fase 1 — Persistencia, Auth & RLS
- **Fecha:** 19 de Septiembre de 2026

---

## 1. ALCANCE ESTRICTAMENTE DIFERIDO POR DISEÑO

En estricto cumplimiento de las directivas del `IMPLEMENTATION-GATE.md`, las siguientes capacidades quedan conscientemente fuera del alcance de la Fase 1 y se abordarán en sus fases correspondientes:

1. **Tablas de Catálogo y Recetas (Fase 2):**
   - El catálogo de productos e ingredientes no se persistió aún en PostgreSQL; reside preparado en `supabase/seed.sql` y en los mocks locales para ser conectado en la Fase 2.
2. **Explosión de Recetas en Transacción de Venta (Fase 3):**
   - El cobro del POS aún no ejecuta el descuento atómico de stock en base de datos.
3. **Sincronización WebSockets CDC para KDS (Fase 4):**
   - La pantalla de cocina sigue operando con el estado en memoria de `POSContext`.
4. **Capa Fiscal Argentina AFIP (Fase 7):**
   - No se emitieron certificados fiscales ni se realizaron llamadas a los web services de AFIP.
5. **Comercio Público Persistido (Fase 6):**
   - El formulario de pedidos online y reservas continúa en modo cliente hasta que el núcleo de caja e inventario esté cerrado.

---

## 2. MODALIDAD DUAL DEL CLIENTE SUPABASE

Para permitir que el equipo de desarrollo pueda trabajar tanto en entornos locales sin internet como en proyectos de Supabase conectados en la nube:
- Si `VITE_SUPABASE_URL` no está definida, `src/lib/supabase.js` activa un modo de emulación local seguro que permite iniciar sesión como demostración sin crashear el navegador.
- En cuanto se configuran las variables reales en `.env.local`, el cliente se conecta de inmediato a la instancia real de PostgreSQL con RLS activado.
