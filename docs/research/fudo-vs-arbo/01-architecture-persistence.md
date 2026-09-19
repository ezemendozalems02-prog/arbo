# 01 — Arquitectura, Persistencia, Seguridad y APIs

**Categorías cubiertas:**
1. Arquitectura general
2. Persistencia y base de datos
3. Autenticación y permisos (RBAC)
31. Integraciones externas
32. API pública y de desarrollo
38. Rendimiento arquitectónico y sincronización
39. Seguridad, exposición de datos y cumplimiento

---

## 1. Arquitectura General

### FUDO
- **Qué hace:** Plataforma SaaS multi-tenant en la nube. Frontend SPA en Angular para el portal comensal/tienda/reservas (`app-v2.fu.do`, `menu.fu.do`, `reservas.fu.do`), respaldado por una infraestructura de backend en microservicios/APIs cloud y base de datos relacional centralizada.
- **Qué fue observado (`OBSERVED`):**
  - El shell servido para las 6.166 tiendas de `menu.fu.do` es idéntico: 2.453 bytes HTML sin SSR.
  - La tienda online, carta QR y portal de reservas comparten el mismo artefacto Angular (`data-beasties-container`), diferenciado en runtime por hostname.
- **Qué fue documentado (`DOCUMENTED`):** Arquitectura cliente-servidor con sincronización en tiempo real vía WebSockets/polling hacia el backend; soporte multi-dispositivo simultáneo (mozos en Android/iOS, comandas en cocina, caja en PC).
- **Limitaciones:**
  - Dependencia de conexión a internet para operaciones no cacheadas.
  - Inexistencia de SSR en superficies públicas (carta QR y reservas son invisibles para scrapers de WhatsApp y buscadores).
- **Bugs conocidos:** Fricción de reconexión de terminales ante microcortes de red.
- **Estado:** `CONFIRMED_WORKING` (Nivel SaaS comercial en producción con miles de locales).

### ARBO OS
- **Qué hace:** Single Page Application (SPA) cliente construida con React 19, Vite 8 y Tailwind CSS v4.
- **Qué fue observado (`OBSERVED`):**
  - No existe backend, no existe API REST, no existe servidor Node.js/Python ni base de datos Postgres/Supabase (`01-architecture.md:8-16`).
  - Todo el sistema corre dentro del navegador del usuario. Cero llamadas `fetch()` o `axios` en el runtime.
- **Qué está implementado:** 22 servicios en `src/services/` como funciones puras desacopladas de React (ventas, costos, cocina, mermas, segmentación).
- **Limitaciones:** Monolito cliente de 761 kB. Sin comunicación entre dispositivos. Dos pestañas del mismo navegador divergen y se sobreescriben (`02-database.md:86`).
- **Bugs:** BUG-014 (Rutas inexistentes en `/admin` renderizan contenido en blanco).
- **Estado:** `PARTIAL` / `PROTOTYPE` (Excelente lógica de dominio en JavaScript puro, pero carece de servidor).

### DIFERENCIA COMPROBADA
FUDO cuenta con una arquitectura de servidor multi-tenant en la nube que coordina transacciones concurrentes entre múltiples terminales de mozos, cocina y caja. ARBO OS es una SPA exclusivamente del lado del cliente ejecutada sobre un solo hilo en un único navegador.

### IMPLICACIÓN
ARBO OS no puede ser utilizado en un restaurante real con más de una pantalla física hasta que no implemente una capa de backend (ej. Supabase) que centralice el estado mediante base de datos y WebSockets.

---

## 2. Persistencia y Base de Datos

### FUDO
- **Qué hace:** Almacena la totalidad de datos transaccionales, históricos, maestros y contables en un motor relacional de base de datos en la nube.
- **Qué fue documentado (`DOCUMENTED`):**
  - Entidades formales con relaciones de clave foránea (`foreign keys`), constraints de unicidad y transacciones ACID.
  - Mantiene historial permanente de ventas, arqueos cerrados, movimientos de stock, auditoría de comandas eliminadas y cuentas corrientes.
- **Limitaciones:** El modelo relacional vincula cada registro a una única tienda física; la entidad `sucursal` no existe como dimensión nativa del modelo de datos (`Fase 14: multibranch`).
- **Estado:** `CONFIRMED_WORKING`.

### ARBO OS
- **Qué hace:** Almacena el estado mutable en 4 claves de `localStorage` del navegador (`arbo_pos_v1`, `arbo_inventory_v1`, `arbo_crm_v1`, `arbo_cart_v1`). Los datos iniciales parten de 25 archivos de semilla estáticos en `src/mock/`.
- **Qué fue observado (`OBSERVED`):**
  - Serialización monolítica síncrona en cada cambio: mutar una etiqueta de cliente re-serializa los 176 KB del CRM completos vía `JSON.stringify(state)` (`02-database.md:57-60`).
  - No existen tablas, foreign keys, índices, triggers ni transacciones atómicas.
- **Limitaciones:** Cuota de 5 MB de navegador. Pérdida total de datos si el usuario limpia el historial/caché.
- **Bugs:** BUG-018 (Abrir caja ejecuta `movements: []`, destruyendo el historial del turno anterior).
- **Estado:** `NOT_IMPLEMENTED` (A nivel base de datos real).

### DIFERENCIA COMPROBADA
FUDO persiste datos en un motor de base de datos centralizado con integridad referencial. ARBO OS persiste en el almacenamiento local volátil del navegador web del cliente.

### IMPLICACIÓN
ARBO OS corre riesgo inminente de pérdida de datos por limpieza de navegador, saturación de cuota o desincronización entre pestañas. Requiere migración urgente a PostgreSQL relacional (`27-target-architecture.md`).

---

## 3. Autenticación, Roles y Permisos (RBAC)

### FUDO
- **Qué hace:** Sistema de Control de Acceso Basado en Roles (RBAC) granular con usuarios ilimitados sin costo adicional por asiento.
- **Qué fue documentado (`DOCUMENTED` en Fase 13 y Helpcenter art. 11730992):**
  - Credenciales individuales: Usuario, Clave, Rol (uno solo), PIN de mozo, Superusuario (bypass).
  - 25 grupos de recursos protegidos con permisos específicos:
    - `Ver costo` en productos e insumos (oculta márgenes al personal de piso).
    - `Modificar precio al adicionar` (habilita o bloquea cambio de precios por mozo).
    - `Ver "Según sistema"` en arqueos (control de arqueo ciego).
  - Usuarios ilimitados: FUDO no cobra por usuario conectado.
  - El token de API hereda exactamente los permisos del usuario creador (un token sin permiso de ventas no puede leer ventas).
- **Limitaciones:**
  - Un solo rol por usuario (sin herencia ni acumulación de roles).
  - Sin roles diferenciados por sucursal.
- **Estado:** `CONFIRMED_WORKING`.

### ARBO OS
- **Qué hace:** No implementa ninguna capa de autenticación ni control de permisos.
- **Qué fue observado (`OBSERVED` en `03-auth-permissions.md`):**
  - No existe pantalla de login (`/login` no existe).
  - No existen sesiones, cookies, JWT ni tokens.
  - La URL `/admin` es de acceso libre.
  - Hay un único usuario hardcodeado en el código: `CURRENT_STAFF_NAME = 'Valentina (mozo)'` (`mock/staff.js`).
  - Todas las acciones de administración, caja, inventario y visualización de costos están disponibles sin restricción para cualquier visitante.
- **Limitaciones:** Imposibilidad de segregar responsabilidades entre mozo, cocinero, cajero y dueño.
- **Estado:** `NOT_IMPLEMENTED`.

### DIFERENCIA COMPROBADA
FUDO posee un RBAC comercial maduro con 25 dimensiones de control y usuarios ilimitados. ARBO OS no tiene login, ni roles, ni protección de rutas.

### IMPLICACIÓN
En ARBO OS, cualquier empleado o cliente que acceda a la URL puede alterar la caja, ver costos confidenciales o borrar comandas. Se requiere implementar Supabase Auth con RLS (`27-target-architecture.md`).

---

## 31 & 32. Integraciones y APIs

### FUDO
- **Qué hace:** Ecosistema cerrado con API pública en plan Pro y acuerdos comerciales con agregadores.
- **Qué fue documentado (`DOCUMENTED` en Fase 15):**
  - **API Pública General (OpenAPI 3):** Exposición de 20 entidades (`Clientes`, `Ventas`, `Productos`, `Mesas`, etc.) mediante API Key + API Secret con ciclo de vida de token de 24h renovable.
  - **Integraciones nativas de Delivery:** PedidosYa, Rappi, Uber Eats, Mercado Pago Delivery y Didi Food integradas directamente a nivel backend.
  - **Pasarelas de Pago:** Integración profunda con Mercado Pago (QR, Point) y Fudo Pagos propio.
  - **Facturación electrónica:** Integración homologada con AFIP (Argentina), SAT (México) y SII (Chile).
- **Limitaciones:** La API solo está disponible en el plan más costoso (Pro). No existen webhooks bidireccionales documentados para eventos de comanda en tiempo real.
- **Estado:** `CONFIRMED_WORKING`.

### ARBO OS
- **Qué hace:** Cero integraciones con servicios externos.
- **Qué fue observado (`OBSERVED`):**
  - Cero endpoints expuestos y cero consumo de APIs de terceros.
  - No hay integración con agregadores de delivery (PedidosYa/Rappi).
  - No hay pasarela de pagos integrada (Mercado Pago es solo una etiqueta de texto en el selector de métodos).
  - Cero integración con AFIP/ARCA (`17-fiscal-billing.md`).
- **Estado:** `NOT_IMPLEMENTED`.

### DIFERENCIA COMPROBADA
FUDO cuenta con integración a las principales apps de delivery de LATAM, pasarelas de pago y API OpenAPI 3. ARBO OS es una isla cerrada sin integraciones de software ni hardware.

### IMPLICACIÓN
Operar ARBO OS hoy requiere doble carga manual para cualquier pedido de delivery y cobro por POS físico separado sin conciliación automática.

---

## 38 & 39. Rendimiento, Seguridad y Cumplimiento

### FUDO
- **Rendimiento:**
  - Backend cloud con alta disponibilidad comprobada en miles de locales.
  - Frente público deficiente: entrega un bundle JS de ~2,3 MB para una carta QR digital, sin Server-Side Rendering (Fase 18 y 19).
- **Seguridad:**
  - Datos resguardados en servidores seguros con certificados SSL y RBAC estricto.
  - Datos de clientes protegidos detrás de autenticación de backend.
- **Estado:** `CONFIRMED_WORKING` en seguridad de datos de backend; `PARTIAL` en rendimiento de cliente web público.

### ARBO OS
- **Rendimiento:**
  - Build ultrarrápido con Vite (1,03s).
  - Bundle monolítico único de 761 kB sin `React.lazy()` ni code-splitting (`21-performance.md`).
  - Riesgo de congelamiento de UI (jank) en terminales de mozos por serialización síncrona en `localStorage`.
- **Seguridad:**
  - **Vulnerabilidad Crítica P0:** Desplegado públicamente en Vercel (`https://arbo-alpha.vercel.app/admin`) sin clave ni protección (`23-security.md`).
  - **Fuga Masiva de Datos (PII):** Los 126 clientes con nombre, email, teléfono, gastos y fechas de cumpleaños están empaquetados en texto plano en el archivo JavaScript descargable por cualquier usuario de internet.
  - Cero cabeceras de seguridad en `vercel.json` (sin CSP, sin X-Frame-Options).
- **Estado:** `BROKEN` / `CRITICAL` (Incumplimiento de normativas de protección de datos personales).

---

## Síntesis Clasificatoria

| Categoría | Clasificación FUDO | Clasificación ARBO OS | Tipo de Brecha |
|---|---|---|---|
| **Arquitectura** | `CONFIRMED_WORKING` (Cloud multi-tenant) | `PARTIAL` (SPA sin backend) | **GAP** (ARBO carece de capa server) |
| **Persistencia** | `CONFIRMED_WORKING` (RDBMS cloud) | `NOT_IMPLEMENTED` (localStorage) | **GAP** (ARBO carece de base de datos) |
| **Auth / RBAC** | `CONFIRMED_WORKING` (25 grupos, usuarios ilimitados) | `NOT_IMPLEMENTED` (Sin auth) | **GAP** (ARBO carece de seguridad) |
| **Integraciones / API**| `CONFIRMED_WORKING` (OpenAPI, Rappi, AFIP) | `NOT_IMPLEMENTED` | **GAP** (ARBO desconectado) |
| **Performance Web** | `PARTIAL` (Bundle 2,3 MB sin SSR) | `PARTIAL` (Bundle 761 kB sin split) | **DIFERENCIA DE IMPLEMENTACIÓN** |
| **Seguridad de Datos** | `CONFIRMED_WORKING` | `BROKEN` (PII expuesta públicamente) | **GAP CRÍTICO** |
