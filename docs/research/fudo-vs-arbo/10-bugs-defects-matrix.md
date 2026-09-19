# 10 — Matriz Comparativa de Bugs y Defectos

Matriz forense que cataloga los defectos comprobados en ambos sistemas, analizando qué rompen, severidad, impacto operacional y financiero:

---

## 1. Defectos de ARBO OS

| ID | Módulo | Problema Técnico Comprobado | Severidad | Evidencia / Archivo | Impacto Operacional / Financiero |
|---|---|---|---|---|---|
| **BUG-001** | Público / Pedidos | `confirmOrder` genera ID aleatorio y borra el pedido en memoria sin enviarlo. | **P0** | `src/pages/Pedidos.jsx:166` | Pérdida total de ventas de delivery y comensales engañados. |
| **BUG-002** | Público / Reservas | `next` genera ID aleatorio y muestra "Reserva confirmada" sin guardarla. | **P0** | `src/pages/Reservas.jsx:63` | Comensales que se presentan al restaurante con reserva inexistente. |
| **BUG-003** | POS / Cocina | Cancelar comanda en KDS no descuenta `sentQty` en el pedido del POS. | **P1** | `POSContext.jsx:285`, `OrderPanel.jsx:68` | Se le cobra al cliente un plato cancelado por falta de stock; cajero bloqueado. |
| **BUG-004** | POS / Cocina | Cobrar una mesa libera la mesa pero no cancela ni cierra los tickets en KDS. | **P1** | `POSContext.jsx:325`, `evidence/05-*.png` | Cocina continúa cocinando platos de mesas ya cobradas; comandas huérfanas. |
| **BUG-005** | Dashboard | El Dashboard lee `mock/orders.js` y no consume las ventas de `POSContext`. | **P1** | `dashboardService.js:5-31` | Tablero directivo congelado en $585.300; ciego a la recaudación real. |
| **BUG-006** | CRM / POS | `CustomerPickerModal` lee el array estático y no el contexto mutable del CRM. | **P1** | `CustomerPickerModal.jsx:4` | Clientes dados de alta en mostrador no pueden asociarse a su venta ni sumar puntos. |
| **BUG-007** | POS / Responsive | `gridTemplateColumns: 'minmax(0, 1fr) 340px'` colapsa el catálogo a 0 px en móviles. | **P1** | `POS.jsx:90`, `evidence/07-*.png` | Inoperable en smartphones (0 px) y tablets verticales de mozo (84 px). |
| **BUG-018** | Caja / Arqueos | `openCashRegister` ejecuta `movements: []`, destruyendo el historial previo. | **P1** | `POSContext.jsx:70`, `Caja.jsx:28` | Imposibilidad de auditoría contable o fiscal retrospectiva de turnos de caja. |
| **BUG-021** | ARBO Club / POS | El POS no tiene campo, lector ni validador para ingresar códigos `ARBO-XXXXX`. | **P1** | `CheckoutModal.jsx`, `POSContext.jsx` | Los comensales no pueden canjear sus premios en el momento del cobro. |
| **BUG-024** | Franquicias | `DossierForm` simula el envío con `setSent(true)` y descarta los datos. | **P1** | `src/pages/Franquicia.jsx:20` | Pérdida silenciosa de inversores y postulantes a franquicia. |
| **BUG-008** | Caja | Vender con caja cerrada omite registrar el movimiento en el arqueo. | **P2** | `POSContext.jsx:326` | Dinero físico en cajón que no coincide con el sistema al abrir caja después. |
| **BUG-009** | Mermas | Recorta silenciosamente la cantidad declarada al stock actual y falla unidad. | **P2** | `InventoryContext.jsx:167` | Distorsiona el reporte real de desperdicio de insumos. |
| **BUG-010** | ARBO Club | Cancelar un canje con estado `utilizado` devuelve los puntos al cliente. | **P2** | `CRMContext.jsx:171` | Fraude interno: comensal consume el beneficio y recupera sus puntos. |
| **BUG-019** | Caja | Muestra "Efectivo esperado" antes del conteo y permite cerrar con descuadre. | **P2** | `CloseCashModal.jsx:20` | Elimina el control por arqueo ciego; facilita ocultamiento de faltantes. |
| **BUG-020** | CRM | Deduplicación de clientes existe en código pero nunca se ejecuta (`CODE_ONLY`).| **P2** | `customerMatchingService.js` | Duplicación ilimitada de clientes con el mismo email o teléfono. |
| **BUG-022** | Público / Club | `/arbo-club` es una maqueta con cliente demo fijo de 2.840 puntos. | **P2** | `src/pages/ArboClub.jsx:3` | Clientes reales no pueden consultar sus puntos en la web. |
| **BUG-023** | Marketing | Automatizaciones importan mocks estáticos en vez de escuchar eventos en vivo. | **P2** | `automationService.js:4` | Los disparadores automáticos ignoran las ventas reales del día. |
| **BUG-011** | Compras | `cancelPurchase` en contexto no valida si la compra ya fue recibida. | **P3** | `InventoryContext.jsx:155` | Defecto latente en capa lógica (mitigado en UI). |
| **BUG-012** | Compras | Cantidades fraccionarias en unidades de conteo (11,2 panes). | **P3** | `mock/purchases.js` | Falta de restricción de enteros en unidades discretas. |
| **BUG-013** | Público / SEO | Ausencia de página 404: cualquier ruta rota devuelve home con código 200. | **P3** | `src/App.jsx:64` | Afecta indexación en buscadores y desorienta al usuario. |
| **BUG-014** | Admin / Router | Rutas inexistentes bajo `/admin/*` renderizan el layout en blanco sin mensaje. | **P3** | `src/admin/AdminApp.jsx:110` | Falta de ruta comodín de captura de errores en el panel. |
| **BUG-015** | POS | Buscador de clientes sin mensaje explicativo con menos de 2 caracteres. | **P3** | `CustomerPickerModal.jsx:19` | Parece vacío o roto al tipear un solo carácter. |
| **BUG-016** | CRM | Formulario de alta no valida formato ni sintaxis de email ni teléfono. | **P3** | `NewCustomerModal.jsx:31` | Carga de datos de contacto sucios o maliciosos en la base. |
| **BUG-017** | Configuración | URL muerta `externalMenuUrl` apuntando a Fudo en `src/data/site.js`. | **P3** | `src/data/site.js:28` | Código residual de desarrollo previo. |

---

## 2. Defectos y Limitaciones Estructurales de FUDO

| ID | Módulo | Problema Técnico Comprobado | Severidad | Fuente Documental | Impacto Operacional / Financiero |
|---|---|---|---|---|---|
| **FUDO-BUG-01** | Mesas / Ventas | Eliminar una mesa borra la asociación de ventas históricas dejándolas huérfanas. | **P1** | Helpcenter art. 11730986 | Fuga de integridad referencial: estadísticas de mesas históricas distorsionadas. |
| **FUDO-BUG-02** | Concurrencia | Colisión y pérdida de adiciones simultáneas si dos mozos cargan a la vez. | **P2** | Fase 3 y 18 | Descoordinación de pedidos en horas pico de salón. |
| **FUDO-BUG-03** | Documentación | Contradicción documental sobre activación de ventas por comensal (mail vs web). | **P3** | Helpcenter art. 11730673 | Desorientación de clientes y documentación desactualizada. |
| **FUDO-BUG-04** | Accesibilidad | Color de precio en carta QR viola contraste mínimo de 4.5:1 (WCAG AA). | **P2** | Fase 18 y 20 (`menu.fu.do`) | Ilegible para personas con baja visión en 6.166 tiendas. |
| **FUDO-BUG-05** | Internacionalización | Directiva `translate="no"` bloquea traducción automática de la carta en Chrome. | **P2** | Shell HTML (`Fase 18`) | Turistas extranjeros no pueden traducir el menú gastronómico. |
| **FUDO-BUG-06** | Rendimiento Web | Carta QR descarga 2,3 MB de JS (Google Maps 1,3 MB + Mercado Pago) para leer platos. | **P2** | Network inspector (`Fase 10`) | Carga lenta y alto consumo de datos móviles para comensales en mesa. |
| **FUDO-BUG-07** | Recetas | Inconsistencias de costeo por redondeo si las unidades de subrecetas difieren. | **P3** | Helpcenter art. 11730848 | Errores menores en el cálculo de Food Cost de platos compuestos. |

---

## 3. Análisis Comparativo de Defectos

1. **Afectación de Dinero:**
   - ARBO OS sufre el defecto crítico **BUG-003**: retiene ítems cancelados en el subtotal a pagar forzando cobros indebidos. FUDO cuenta con confirmación en dos fases inmutable que audita cancelaciones con precisión.
2. **Pérdida de Transacciones:**
   - ARBO OS presenta fallas de severidad **P0** (**BUG-001** y **BUG-002**) en su superficie pública web, perdiendo el 100% de los pedidos y reservas que entran por el sitio. FUDO cobra por el add-on de pedidos y reservas, pero procesa las órdenes de manera efectiva.
3. **Pérdida de Trazabilidad:**
   - ARBO OS borra el historial de movimientos de caja en cada reapertura de turno (**BUG-018**). FUDO archiva turnos y auditorías de arqueo de manera inmutable.
4. **Calidad de Frontend Comensal:**
   - FUDO presenta defectos serios de performance (2,3 MB) y accesibilidad (**FUDO-BUG-04** y **FUDO-BUG-05**) en sus cartas QR públicas. ARBO OS tiene una calidad de renderizado y diseño visual ampliamente superior en su catálogo web.
