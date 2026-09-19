# 28 — Preguntas Abiertas e Intervenciones Requeridas

Decisiones estratégicas y de seguridad que requieren definición urgente por parte de los responsables del proyecto:

---

## 28.1 Intervenciones Urgentes de Seguridad

> [!CAUTION]
> ### 1. Bloqueo Inmediato del Acceso Público a `/admin` en Producción
> El proyecto está publicado en `https://arbo-alpha.vercel.app/admin` sin autenticación. Cualquier persona puede acceder al panel, ver los datos personales de clientes y alterar la operación.  
> **Decisión requerida:** ¿Se debe habilitar de inmediato la protección por contraseña de Vercel (*Vercel Password Protection*) o deshabilitar el deploy de producción hasta que se implemente autenticación formal?

> [!WARNING]
> ### 2. Salida de Emergencia para Pedidos, Reservas y Franquicias
> Los formularios públicos (`/pedidos`, `/reservas`, `/franquicia`) actualmente descartan los datos en el navegador del cliente (BUG-001, BUG-002, BUG-024).  
> **Decisión requerida:** Mientras se construye el backend definitivo, ¿se conectan provisionalmente para que envíen el pedido/reserva por **WhatsApp directo (`wa.me`)** y el formulario de franquicia vía un servicio transaccional (Formspree/Resend)?

---

## 28.2 Decisiones de Arquitectura y Producto

1. **Régimen Fiscal e Integración AFIP / ARCA:**
   - ¿Bajo qué personería tributaria opera ARBO (Monotributo / Responsable Inscripto)?
   - ¿Se integrará facturación electrónica directa vía WSFE con generación de CAE, o se utilizará una pasarela de facturación gastronómica externa?
2. **Estrategia de Impresión en Salón y Cocina:**
   - ¿La cocina operará 100% digital con tablets KDS, o se requieren comanderas térmicas de papel de 80mm vía servidor de impresión local (ESC/POS)?
3. **Flujo de Caja y Control de Personal:**
   - ¿Se establecerá arqueo ciego obligatorio para los cajeros?
   - ¿Qué política se adoptará para los descuadres de caja: descuento por planilla o tolerancia con justificación obligatoria?
4. **Adopción de Supabase:**
   - ¿Se aprueba la arquitectura relacional propuesta en `27-target-architecture.md` como hoja de ruta tecnológica para la Fase 6?
