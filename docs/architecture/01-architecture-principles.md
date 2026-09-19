# 01 — LOS 10 PRINCIPIOS ARQUITECTÓNICOS RECTORES DE ARBO OS

---

## INTRODUCCIÓN

Una arquitectura de software no es un conjunto aleatorio de librerías; es la materialización técnica de las prioridades del negocio. La auditoría forense de ARBO OS y su contraste con Fudo demostraron que la ausencia de principios rectores genera sistemas frágiles: datos que se pierden en el navegador, inventarios que no se descuentan al vender, brechas de seguridad por falta de autenticación en backend y modelos multi-sucursal que nacen rotos.

Para garantizar que ARBO OS sea un sistema operativo robusto, resiliente y de nivel enterprise, se establecen **10 Principios Arquitectónicos no negociables**:

---

## 1. INTEGRIDAD TRANSACCIONAL ESTRICTA (TRANSACTIONAL INTEGRITY)

> **"El dinero, el inventario, las ventas y los puntos de fidelización deben procesarse bajo garantías ACID absolutas en base de datos. Ninguna transacción de cobro puede ocurrir a medias."**

- **Justificación Forense:** En el prototipo actual de ARBO, el cobro en caja se registraba en un array en memoria mientras que el inventario permanecía inalterado (`InventoryContext.jsx:18-22`, `[FACT]`). Una venta que cobra dinero pero no descuenta stock genera discrepancias acumulativas que destruyen el Food Cost.
- **Regla Técnica:** La confirmación de una orden, el asiento del pago en caja, la explosión de recetas para descarga de materias primas y la acreditación de puntos en ARBO Club deben ejecutarse en un único bloque transaccional (`BEGIN ... COMMIT`) o mediante un saga orchestrator con transacciones compensatorias.

---

## 2. AUTORIDAD EXCLUSIVA DEL SERVIDOR (SERVER AUTHORITY)

> **"El navegador web o dispositivo móvil es únicamente una terminal de presentación y captura de intención. El servidor (backend) es la ÚNICA fuente de verdad autoritativa para cálculos financieros, descuentos, reglas de negocio y mutaciones de estado."**

- **Justificación Forense:** El prototipo previo permitía que el cliente calculara y manipulara saldos en `localStorage` (`[FACT]`). Un cliente malicioso o un error en la memoria del navegador podía alterar precios o inventarios sin validación.
- **Regla Técnica:** Toda solicitud enviada por el POS o la tienda online (`POST /api/orders`) envía identificadores de productos y variantes; el backend recalcula los precios unitarios, promociones, recargos fiscales y saldos vigentes consultando el catálogo en base de datos antes de persistir la orden.

---

## 3. MULTI-TENANCY DESDE EL DISEÑO (MULTI-TENANT BY DESIGN)

> **"La arquitectura debe aislar los datos de cada organización comercial desde el nivel más bajo de persistencia, imposibilitando física y lógicamente la filtración cruzada de información entre clientes."**

- **Justificación Forense:** Fudo sufrió para evolucionar su modelo de tenencia debido a esquemas rígidos (`docs/research/fudo-vs-arbo/01-architecture-persistence.md`). ARBO debe nacer preparado para servir a miles de restaurantes concurrentes.
- **Regla Técnica:** Cada tabla transaccional o de configuración contiene la clave `organization_id UUID NOT NULL`. El aislamiento se impone a nivel del motor PostgreSQL mediante Row Level Security (RLS), inyectando el tenant en el contexto de sesión (`auth.jwt() -> organization_id`).

---

## 4. MULTI-SUCURSAL NATIVO (MULTI-BRANCH BY DESIGN)

> **"Una organización puede poseer una o múltiples sucursales físicas y depósitos de almacenamiento. Las sucursales no son cuentas aisladas ni silos independientes, sino nodos operativos interconectados dentro de la misma entidad legal."**

- **Justificación Forense:** El gran pecado arquitectónico de Fudo fue aislar sucursales como cuentas inconexas, impidiendo transferencias formales de stock entre locales y fragmentando el historial de clientes (`[FACT: 07-scale-multibranch-franchise.md]`).
- **Regla Técnica:** Toda entidad operativa local (`orders`, `cash_shifts`, `tables`, `kds_tickets`, `stock_levels`) incluye `branch_id UUID`. Las transferencias entre depósitos (`stock_transfers`) son documentos transaccionales nativos de doble entrada (egreso de origen, tránsito, ingreso en destino).

---

## 5. AUDITABILIDAD TOTAL E INMUTABILIDAD DE REGISTROS (AUDITABILITY)

> **"Las operaciones críticas de un restaurante (movimientos de dinero, egresos de stock, cancelaciones de comandas, canjes de puntos y autorizaciones) nunca se sobreescriben ni se eliminan; se registran en estructuras append-only (libros mayores / ledgers) estrictamente auditables."**

- **Justificación Forense:** El bug `BUG-018` de ARBO demostró que al reabrir una caja se sobreescribían y destruían los movimientos históricos del turno (`[FACT: src/pages/Caja.jsx]`). Esto constituye una vulnerabilidad contable crítica.
- **Regla Técnica:** Se prohibe el uso de `UPDATE` o `DELETE` sobre tablas de ledger (`cash_movements`, `inventory_movements`, `loyalty_transactions`). Cualquier corrección exige una transacción compensatoria inversa con motivo de auditoría y usuario responsable.

---

## 6. REALTIME SELECTIVO Y ORIENTADO A PROPÓSITO (REALTIME WHERE NEEDED)

> **"No todo el sistema debe estar suscrito a WebSockets continuos. La sincronización en tiempo real se reserva exclusivamente para flujos de alta criticidad ergonómica (KDS de cocina, estados de mesas en salón y alertas operativas)."**

- **Justificación Forense:** Intentar sincronizar por WebSockets catálogos de productos, historiales de clientes o reportes contables sobrecarga la infraestructura y aumenta el consumo de batería en dispositivos móviles sin aportar valor operativo.
- **Regla Técnica:** KDS y Mesas utilizan canales de WebSocket (Supabase Realtime / PostgreSQL CDC) con filtrado estricto por `branch_id`. Módulos administrativos (Reportes, Inventario, Clientes) operan mediante consultas REST/RPC con invalidación inteligente de caché (React Query / SWR).

---

## 7. OPERACIÓN EN MODO DEGRADADO Y RESILIENCIA OFFLINE (OFFLINE / DEGRADED)

> **"Un restaurante en pleno servicio de sábado por la noche no puede detener su facturación ni su despacho de comida porque el proveedor de internet local tenga un microcorte."**

- **Justificación Forense:** Fudo queda inoperable si se corta internet, paralizando la atención del salón (`[FACT]`). ARBO debe proteger la continuidad del negocio.
- **Regla Técnica:** La capa de POS y toma de pedidos en salón debe operar bajo una arquitectura PWA con almacenamiento local transaccional (IndexedDB). En caso de corte de red, los pedidos se encolan localmente con IDs UUIDv4 determinísticos y se sincronizan atómicamente con el servidor al restablecerse la conectividad.

---

## 8. SEGURIDAD Y PRIVACIDAD POR DEFECTO (SECURITY BY DEFAULT)

> **"Ninguna ruta, API o dato administrativo puede depender de la 'oscuridad' de la interfaz del frontend para protegerse. El principio de menor privilegio rige en todas las capas."**

- **Justificación Forense:** ARBO exponía `/admin` en su bundle cliente sin verificación de sesión en backend ni middleware de protección de rutas (`[FACT: FINAL-ARBO-OS-FORENSIC-AUDIT.md]`).
- **Regla Técnica:** El backend rechaza cualquier petición sin token JWT firmado válido. Las políticas de RBAC (Role-Based Access Control) se evalúan en cada endpoint y las políticas RLS bloquean la lectura de datos sensibles a nivel de motor SQL.

---

## 9. SEPARACIÓN RIGUROSA DE CAPAS Y DOMINIO (DOMAIN SEPARATION)

> **"La lógica matemática de negocio (cálculo de recetas, márgenes, redondeos de caja, reglas de puntos) debe estar completamente desacoplada del framework de UI y de la infraestructura de persistencia (Clean Architecture / Hexagonal)."**

- **Justificación Forense:** Los servicios puros de ARBO (`recipeCostService.js`, `purchaseService.js`) tienen un diseño matemático excelente pero estaban mezclados con llamadas a hooks de React y `localStorage` (`[FACT]`).
- **Regla Técnica:** El núcleo de dominio (Domain Services) consiste en funciones puras y tipadas (TypeScript) sin dependencias de React ni de la base de datos. Pueden ejecutarse indistintamente en el cliente (para cálculo previo reactivo) y en el servidor (para validación autoritativa final).

---

## 10. EVOLUTIVIDAD Y EXTENSIBILIDAD (EVOLVABILITY)

> **"El diseño de hoy no debe convertirse en la camisa de fuerza de mañana. Las integraciones externas (pasarelas de pago, facturación fiscal AFIP, mensajería WhatsApp) deben conectarse a través de interfaces y adaptadores desacoplados."**

- **Justificación Forense:** Acoplar el POS directamente a la API de un proveedor fiscal específico (ej. AFIP) impide vender el software en otros países o reemplazar proveedores de hardware de impresión sin reescribir la UI (`[INFERENCE]`).
- **Regla Técnica:** Patrón Adapter / Ports & Adapters para facturación (`FiscalProvider`), pagos (`PaymentGatewayProvider`) y mensajería (`MessagingProvider`). El POS interactúa con la abstracción `emitirComprobante()` sin conocer los detalles de conexión SOAP/REST del organismo fiscal.
