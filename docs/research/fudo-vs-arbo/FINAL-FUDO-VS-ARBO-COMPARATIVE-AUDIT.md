# DICTAMEN CONSOLIDADO: FUDO vs ARBO OS
## Forensic Comparative Audit & Competitive Intelligence

**Fecha del dictamen:** 19 de septiembre de 2026  
**Sujetos comparados:**  
1. **FUDO** (Benchmark comercial LATAM · SaaS multi-tenant en producción con ~6.166 tiendas).
2. **ARBO OS** (Commit `52c01cb` · SPA monolítica React 19 + Vite 8 en prototipo funcional).

---

## 1. Naturaleza de los Sujetos Auditados

- **FUDO:** Es un ecosistema maduro de punto de venta, gestión operativa y pagos electrónicos para gastronomía. Su fortaleza radica en la velocidad transaccional de salón/mostrador (operable por teclado), integración con agregadores (Rappi, PedidosYa), facturación fiscal electrónica homologada (AFIP, SAT, SII) y conciliación ciega de caja. Su debilidad estructural reside en un modelo comercial extractivo (comisión de 1,9% en tienda propia, add-ons obligatorios para salón y reservas), la ausencia de fidelización nativa, la falta de soporte multi-sucursal real (cuentas separadas sin transferencias de stock) y un frontend comensal deficiente (bundle de 2,3 MB sin SSR ni accesibilidad).
- **ARBO OS:** Es una maqueta interactiva avanzada con un diseño visual de alta gama y una capa de servicios de dominio extraordinariamente limpia en JavaScript puro (`src/services/`). Sus fortalezas son la sofisticación conceptual en fidelización de clientes (ARBO Club con libro mayor de puntos), motor de segmentación dinámico y cálculo de Food Cost. Sus debilidades críticas radican en la **ausencia total de backend y base de datos** (corre 100% en el navegador con `localStorage`), la desconexión del stock frente a las ventas, el descarte de pedidos y reservas en memoria en su web pública, y la exposición de datos personales (PII) en producción sin autenticación.

---

## 2. Matriz Maestra de Comparación

| Área Funcional | Capacidad FUDO | Capacidad ARBO OS | Evidencia FUDO | Evidencia ARBO OS | Tipo de Brecha | Oportunidad de Producto |
|---|---|---|---|---|---|---|
| **Arquitectura** | Cloud multi-tenant cliente-servidor con sincronización WebSockets | SPA cliente 100% en navegador; monolito Vite de 761 kB | Fase 1 y 18 (Helpcenter + Network) | `01-architecture.md:8-32` | **GAP** | Migrar a Supabase (PostgreSQL + Auth + Realtime). |
| **Persistencia** | Base de datos relacional cloud con transacciones ACID | `localStorage` volátil (cuota 5 MB); serialización monolítica | Fase 2 y 18 | `02-database.md:36-60` | **GAP** | Esquema relacional con integridad referencial. |
| **Seguridad & RBAC**| 25 grupos de permisos; usuarios ilimitados; API Key segura | Sin login, sin roles, sin permisos; `/admin` público en internet | Fase 13 (Art. 11730992) | `03-auth-permissions.md`, `23-security.md` | **GAP CRÍTICO** | Implementar RBAC granular con Supabase RLS. |
| **POS: Entrada** | 100% operable por teclado sin ratón; búsqueda rápida | Solo ratón/toque; sin atajos de teclado | Fase 3 (Art. 11712764) | `04-pos.md:48-52` | **GAP** | Incorporar atajos de teclado en el mostrador. |
| **POS: Responsive** | Interfaz web responsive y app para camareros | Roto en móviles (0 px) y tablets verticales (84 px) | Fase 4 y 17 | `BUG-007`, `evidence/07-*.png` | **GAP CRÍTICO** | Corregir grilla CSS de dos columnas en POS. |
| **POS: Integridad** | Confirmación en 2 fases con auditoría inmutable | Cancela comanda pero retiene ítem como cobrable | Fase 3 (Art. 11730841) | `BUG-003`, `evidence/04-*.png` | **GAP CRÍTICO** | Desvincular ítems cancelados del cobro final. |
| **Mesas: Salón** | Unir mesas, cambiar comensales, transferir platos | Grilla de 14 mesas estática; sin movimientos de salón | Fase 4 (Art. 11730672) | `05-tables-orders.md:35-39` | **GAP** | Soporte de salón dinámico (mover/unir mesas). |
| **División Cuenta** | Cobro fraccionado por producto o partes en base de datos | Calculadora equitativa en pantalla (`UI_ONLY`) | Fase 3 y 4 | `05-tables-orders.md:51-60` | **GAP** | División transaccional de cuentas por ítem. |
| **Comandas / KDS** | KDS digital + ruteo a impresoras térmicas ESC/POS | KDS digital con ruteo a estaciones (`cocina`, `bar`) | Fase 5 (Art. 11730998) | `06-kds.md:29-58` | **PARIDAD / GAP** | KDS ARBO es superior; falta comanda térmica. |
| **Comandas Huérfanas**| Cobro de mesa cierra o audita comandas activas | Cobro de mesa deja comandas huérfanas en cocina | Fase 3 y 5 | `BUG-004`, `evidence/05-*.png` | **GAP CRÍTICO** | Cerrar comandas automáticamente al cobrar. |
| **Venta ↔ Stock** | Venta descuenta stock de insumos automáticamente | **La venta NO descuenta stock** (inventario ciego) | Fase 6 (Art. 11730848) | `10-stock.md:13-35` | **GAP CRÍTICO** | Trigger automático de consumo en base de datos. |
| **Costo Ponderado** | Recalcula costo promedio ponderado al recibir compras | Algoritmo puro de costo ponderado y conversión de unidades | Fase 6 (Art. 11730864) | `purchaseService.js:28-48` | **PARIDAD** | Ambas lógicas matemáticas son rigurosas. |
| **Recetas y Costos**| Fichas técnicas con subrecetas recursivas; reporte P&L | Fichas técnicas, cálculo de Food Cost en vivo y márgenes | Fase 6 y 12 | `Costs.jsx:47-66`, `08-recipes-costs.md` | **PARIDAD** | ARBO posee una interfaz de costos superior. |
| **Modificadores** | Modificadores alteran precio y descuentan insumos | Modificadores suman precio pero ignoran el stock | Fase 6 | `09-modifiers.md:74-78` | **GAP** | Vincular modificadores a insumos de inventario. |
| **Caja: Registros** | Múltiples cajas independientes por sala o usuario | Una sola caja registradora en el sistema | Fase 7 (Art. 11730876) | `12-cash-register.md` | **GAP** | Permitir apertura de múltiples cajas simultáneas. |
| **Caja: Historial** | Historial permanente inmutable de todos los turnos | **Reapertura de caja destruye historial anterior** | Fase 7 | `BUG-018`, `POSContext.jsx:70` | **GAP CRÍTICO** | Bitácora relacional histórica de turnos (reporte Z). |
| **Caja: Arqueo** | Arqueo ciego opcional (oculta saldo esperado a cajero) | Exhibe el efectivo esperado antes del recuento | Fase 13 (RBAC) | `BUG-019`, `CloseCashModal.jsx` | **GAP** | Habilitar arqueo ciego para control antifraude. |
| **Cuentas Corrientes**| Cuentas corrientes para clientes ("fiado") y proveedores| No existe cuenta corriente en comensales ni compras | Fase 7 y 11 | `12-cash-register.md` | **GAP** | Gestión de saldos deudores y acreedores. |
| **Facturación AFIP** | Factura A, B, C, CAE oficial, QR fiscal, controladores | **Cero facturación fiscal** (comprobantes informales) | Fase 15 (WSFE AFIP) | `17-fiscal-billing.md` | **GAP CRÍTICO** | Integración oficial con Web Services de AFIP. |
| **CRM / Clientes** | Directorio transaccional básico sin segmentación | Ficha rica con notas, tags, consentimientos y métricas | Fase 11 | `13-crm-customers.md` | **OPORTUNIDAD ARBO** | ARBO supera a Fudo en analítica de clientes. |
| **CRM ↔ POS** | Búsqueda fluida de clientes al cobrar en salón | Clientes creados en CRM no son visibles en el POS | Fase 3 y 11 | `BUG-006`, `evidence/06-*.png` | **GAP CRÍTICO** | Unificar la fuente de datos de clientes. |
| **Fidelización** | Inexistente de forma nativa (`NOT_IMPLEMENTED`) | ARBO Club completo: libro mayor de puntos y niveles | Fase 11 y 23 | `14-loyalty-arbo-club.md` | **VENTAJA ARBO** | Conectar cupones de canje en el POS (BUG-021). |
| **Marketing & Auto**| Inexistente de forma nativa (`NOT_IMPLEMENTED`) | Campañas y automatizaciones diseñadas (simuladas) | Fase 11 y 16 | `15-marketing-automations.md` | **OPORTUNIDAD ARBO** | Conectar a APIs reales de WhatsApp y Email. |
| **Delivery Apps** | Integración con PedidosYa, Rappi, Uber Eats, Didi | Cero integración con plataformas de delivery | Fase 8 y 15 | `19-public-vs-admin.md` | **GAP** | Integrar agregadores o despachar por WhatsApp. |
| **Pedidos Web** | Tienda online transaccional (comisión 1,9% + tasa) | Checkout web descarta pedidos en memoria (`BUG-001`) | Fase 9 | `Pedidos.jsx:166`, `BUG-001` | **GAP CRÍTICO** | Resolver canal de salida para delivery propio. |
| **Reservas Web** | Portal de reservas activo (exige add-on de $55.000/mes) | Asistente de reservas descarta datos (`BUG-002`) | Fase 4 y 16 | `Reservas.jsx:63`, `BUG-002` | **OPORTUNIDAD ARBO** | Reservas nativas sin costo extorsivo mensual. |
| **Branding y Web** | Menú QR utilitario de 2,3 MB sin identidad ni SEO | Sitio web de marca de nivel editorial y diseño premium | Fase 10 y 18 | `Arbo Patagonia Web` | **VENTAJA ARBO** | La experiencia comensal de ARBO es muy superior. |
| **Multi-sucursal** | Cuentas independientes con selector rápido de locales | Mono-local en prototipo; relacional en arquitectura | Fase 14 | `18-multibranch-scale.md`, `27-*.md` | **OPORTUNIDAD ARBO** | Multi-sucursal nativo con transferencias reales. |

---

## 3. Master Conclusion: Respuestas a las 10 Preguntas Clave

### 1. ¿Qué capacidades de FUDO están confirmadas?
Están plenamente confirmadas en producción: (a) Punto de venta operable por teclado de alta velocidad con confirmación en dos fases; (b) Descuento automático de stock al vender en mostrador o salón; (c) Conexión fiscal homologada con AFIP para emisión de Factura A, B, C y CAE; (d) Integración con agregadores de delivery (Rappi, PedidosYa); (e) Múltiples cajas con conciliación y arqueo ciego inmutable; (f) Editor de planos de salón con unión de mesas y cobro parcial por comensal; (g) Gestión de cuentas corrientes de clientes y proveedores; (h) API pública OpenAPI 3 con RBAC granular de 25 dimensiones.

### 2. ¿Qué capacidades de ARBO OS están confirmadas?
Están comprobadas y funcionando con solidez en tiempo de ejecución: (a) Lógica matemática de costos de receta y Food Cost en `/admin/costos`; (b) Algoritmo de costo promedio ponderado y resolución de unidades compuestas en recepción de compras (`purchaseService.js`); (c) Aritmética de caja e ingresos/egresos en sesión única (`cashCalculations.js`); (d) Motor de segmentación dinámica con lógica booleana `AND`/`OR` sobre perfiles calculados (`segmentService.js`); (e) Libro mayor de puntos de fidelización con transacciones inmutables (`loyaltyPointsService.js`); (f) Partición estructural limpia de comandas hacia estaciones de KDS (`kitchenService.js`); (g) Inventario físico con cálculo de diferencias valorizadas (`PhysicalInventory.jsx`); (h) Diseño estético y experiencia visual editorial de vanguardia en el sitio público.

### 3. ¿Qué capacidades de ARBO OS son actualmente solo prototipo?
Son prototipos que no operan transaccionalmente en el mundo real: (a) El checkout de pedidos web (`/pedidos`), que descarta los datos tras mostrar confirmación ficticia (BUG-001); (b) El módulo de reservas (`/reservas`), que no persiste ni notifica las solicitudes (BUG-002); (c) El formulario de franquicias (`/franquicia`), que pierde los contactos de inversores (BUG-024); (d) Las campañas de marketing y automatizaciones, cuyos envíos son simulados con `Math.random()`; (e) La división de cuentas (`SplitBillModal`), que es una calculadora visual sin impacto en el cobro; (f) La deduplicación de clientes, implementada como función pero no invocada por la interfaz; (g) El portal público del club (`/arbo-club`), que muestra un miembro demo estático; (h) La persistencia en `localStorage`, que funciona como un simulador de base de datos volátil.

### 4. ¿Cuáles son los gaps críticos?
Los 5 impedimentos que hacen que ARBO OS sea **no apto para operación real hoy**:
1. **La venta no descuenta stock:** Vender platos no afecta las existencias de insumos en el almacén.
2. **Cero emisión fiscal AFIP / ARCA:** Infracción tributaria directa en Argentina.
3. **Pérdida de pedidos y reservas públicas:** Clientes engañados con confirmaciones que se borran en memoria.
4. **Vulnerabilidad de seguridad y PII expuesta:** `/admin` abierto a internet en Vercel con datos personales de 126 clientes en texto plano en el bundle descargable.
5. **Destrucción de historial de caja:** Abrir un turno borra todos los movimientos del turno anterior.

### 5. ¿Cuáles son las diferencias arquitectónicas?
- **FUDO** utiliza una arquitectura cliente-servidor distribuida en la nube, con una base de datos relacional centralizada, backend transaccional y comunicación bidireccional entre dispositivos (mozos, cocina, caja).
- **ARBO OS** es una aplicación 100% de ejecución en el navegador cliente (SPA estática) sin servidor, sin API y con persistencia en el almacenamiento local (`localStorage`) de un único dispositivo.

### 6. ¿Cuáles son las diferencias de UX?
- **FUDO** prioriza la velocidad de tipeo operativo en entornos de caja (atajos de teclado, confirmación en dos fases, alta densidad), descuidando la estética, que resulta anticuada, y descuidando severamente la superficie del comensal (menú QR genérico de 2,3 MB sin identidad de marca).
- **ARBO OS** prioriza la estética contemporánea, la calidez visual, la tipografía curada y la intuición visual basada en paneles modulares, pero carece de atajos de teclado para operaciones rápidas de mostrador y sufre de roturas graves en pantallas táctiles de mozo (0 px en móviles).

### 7. ¿Cuáles son las diferencias operativas?
En FUDO, la operación diaria fluye de extremo a extremo: un mozo adiciona por código en segundos, la cocina imprime la comanda en papel térmico, el stock de carne y harina baja automáticamente, el cajero realiza un arqueo a ciegas sin ver el dinero teórico y la venta se factura con CAE ante AFIP. En ARBO OS, el flujo se fragmenta: la venta no baja el stock, cancelar en cocina bloquea el plato en caja forzando a cobrarlo, las comandas cobradas quedan huérfanas en el monitor y el arqueo de caja se pierde al iniciar la jornada siguiente.

### 8. ¿Dónde existen oportunidades de diferenciación para ARBO OS?
1. **Fidelización Nativa (ARBO Club):** FUDO carece totalmente de programa de puntos propio. ARBO OS tiene la oportunidad de ofrecer acumulación de puntos, tiers y canjes integrados al cobro como ventaja diferencial única.
2. **Segmentación y Marketing Directo:** Mientras Fudo exige $55.000/mes por un bot de WhatsApp, ARBO OS puede ofrecer automatizaciones nativas de cumpleaños, bienvenida y reactivación sin cargos abusivos.
3. **Multi-sucursal con Transferencias Reales:** Superar la limitación histórica de Fudo (que cobra cuentas desconectadas) implementando un modelo multi-sucursal con remitos internos de stock entre locales.
4. **Experiencia Comensal Premium:** Reemplazar el menú QR genérico y lento de Fudo por una carta web ligera, ultra-rápida, indexable por Google y con identidad visual de alta gama.

### 9. ¿Qué cosas NO deberíamos copiar de FUDO?
1. **El empaquetado abusivo de add-ons:** No fragmentar el software cobrando por separado las mesas, la división de cuentas y las reservas.
2. **Las comisiones extractivas en canales propios:** No cobrar 1,9% de comisión por pedidos generados en la tienda online del propio restaurante.
3. **El sobrepeso técnico en la carta del comensal:** No incrustar Google Maps ni librerías de pagos pesadas en una carta digital que solo debe mostrar platos y precios.
4. **El aislamiento de sucursales:** No obligar a las cadenas a pagar múltiples cuentas desconectadas sin transferencias de mercadería.
5. **El bloqueo de traducción web (`translate="no"`):** No impedir a comensales internacionales traducir la carta en sus navegadores.

### 10. ¿Qué información todavía falta para tomar decisiones?
1. **Definición de Salida de Emergencia:** ¿Cómo se resolverá de inmediato la recepción de pedidos web de `/pedidos` y `/reservas` (¿desvío provisional a enlaces `wa.me` de WhatsApp mientras se programa el backend?).
2. **Protección Inmediata de Vercel:** ¿Se activará de inmediato la protección por contraseña en el despliegue de Vercel para frenar la fuga de datos personales de clientes en `/admin`?
3. **Encuadre Fiscal de ARBO:** ¿El local opera como Responsable Inscripto o Monotributista? ¿Se emitirá factura electrónica vía Web Service directo de AFIP o a través de pasarelas fiscales homologadas?
4. **Aprobación del Esquema Supabase:** ¿Se aprueba el esquema relacional documentado en `27-target-architecture.md` como base para iniciar la fase de desarrollo de base de datos?
