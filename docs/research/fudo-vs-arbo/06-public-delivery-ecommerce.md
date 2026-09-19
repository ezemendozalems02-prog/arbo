# 06 — Delivery, Pedidos Online, Reservas y Superficie Pública

**Categorías cubiertas:**
24. Gestión de Delivery y Repartidores
25. Pedidos Online (E-commerce Gastronómico)
26. Gestión de Reservas
27. Sitio Web Público y Menú Digital (QR)

---

## 24. Gestión de Delivery y Repartidores

### FUDO
- **Qué hace:** Módulo operativo completo para despacho de pedidos a domicilio.
- **Qué fue documentado (`DOCUMENTED` en Fase 8 y art. 11730888):**
  - **Bandeja unificada de pedidos:** Recibe en una sola pantalla los pedidos de salón, mostrador, teléfono, Tienda Online y agregadores externos (PedidosYa, Rappi, Uber Eats).
  - **Control de Repartidores propios:** Asignación de cadetes, cálculo de costo de envío según zona geográfica (polígonos en mapa) y liquidación de efectivo cobrado en la calle al regresar el repartidor.
  - Impresión automática de comanda de cocina + tique con datos de entrega para pegar en la bolsa.
- **Limitaciones:** Módulo de pago adicional (add-on) sobre el plan básico.
- **Estado:** `CONFIRMED_WORKING`.

### ARBO OS
- **Qué hace:** No implementa módulo de delivery en el panel administrativo (`/admin/pedidos` está desactivado como `available: false`).
- **Qué fue observado (`OBSERVED`):**
  - Cero gestión de repartidores, zonas de entrega ni cálculo de costos de envío.
  - Cero recepción de pedidos externos.
- **Estado:** `NOT_IMPLEMENTED`.

---

## 25. Pedidos Online (Tienda Propia)

### FUDO
- **Qué hace:** "Tienda Online Fudo" en subdominio propio (`mitienda.fu.do`).
- **Qué fue documentado (`DOCUMENTED` en Fase 9 y 18):**
  - Los clientes eligen platos, seleccionan envío o retiro, y abonan mediante **Mercado Pago obligatorio** (en Argentina).
  - El pedido impacta automáticamente en el POS emitiendo sonido de alerta.
  - **Modelo extractivo de monetización:** Fudo cobra **1,90% + IVA por cada venta en la tienda online**, sumado a una **tasa fija por transacción** que el comercio no puede absorber.
  - **Problema técnico de frontend:** La tienda es una SPA de Angular pesada (~2,3 MB) sin SSR que tarda en cargar en conexiones móviles y no previsualiza imágenes en WhatsApp.
- **Estado:** `CONFIRMED_WORKING` (Transaccional, pero con alta fricción de costos).

### ARBO OS
- **Qué hace:** Módulo de pedidos web con carrito interactivo en `/pedidos`.
- **Qué fue observado (`OBSERVED` en `19-public-vs-admin.md` y `25-bugs.md`):**
  - Interfaz de usuario de diseño premium con carrito lateral (`CartDrawer.jsx`) y checkout en 3 pasos (datos de entrega, resumen, confirmación).
  - **BUG-001 (P0 CRÍTICO): El pedido online se elimina en memoria.**
    ```js
    // src/pages/Pedidos.jsx:166-170
    const confirmOrder = () => {
      setOrderId(`ARBO-${Math.floor(1000 + Math.random() * 9000)}`)
      setStep('done')
      clearCart()
    }
    ```
    Al pulsar "Confirmar pedido", se muestra en pantalla: *"Pedido recibido — Te avisaremos cuando esté listo. #ARBO-XXXX"* y se vacía el carrito. El nombre, teléfono, dirección y platos pedidos **se descartan en memoria**. No hay envío por WhatsApp, ni email, ni inserción en base de datos. El restaurante nunca se entera del pedido.
- **Estado:** `BROKEN` / `CRITICAL` (Falso checkout que engaña al cliente).

---

## 26. Gestión de Reservas

### FUDO
- **Qué hace:** Portal de reservas en línea (`reservas.fu.do/mitienda`).
- **Qué fue documentado (`DOCUMENTED` en Fase 4 y 16):**
  - Permite a comensales reservar mesa especificando comensales, fecha y turno.
  - Las reservas aprobadas bloquean automáticamente mesas en el plano del salón.
  - **Barrera comercial abusiva (`DOCUMENTED`):** Para habilitar el módulo de reservas, Fudo exige contratar su **"Recepcionista Virtual con IA" por $55.000 mensuales adicionales**.
- **Estado:** `CONFIRMED_WORKING` (Condicionado a pago de suscripción elevada).

### ARBO OS
- **Qué hace:** Flujo de reservas en 5 pasos en `/reservas` (comensales, fecha, horario, sector y contacto).
- **Qué fue observado (`OBSERVED` en `19-public-vs-admin.md` y `25-bugs.md`):**
  - **BUG-002 (P0 CRÍTICO): La reserva no existe.**
    ```js
    // src/pages/Reservas.jsx:63-68
    const next = () => {
      if (step === 4) setReservationId(`ARBO-${Math.floor(1000 + Math.random() * 9000)}`)
      setStep(s => Math.min(s + 1, STEPS.length - 1))
    }
    ```
    El cliente recibe una pantalla afirmativa *"Reserva confirmada"* con ID aleatorio. Los datos no se guardan ni se envían. En el panel del local, `/admin/reservas` figura como "Próximamente". El cliente se presentará en el restaurante con una reserva que el comercio nunca recibió.
- **Estado:** `BROKEN` / `CRITICAL`.

---

## 27. Sitio Web Público y Menú QR

### FUDO
- **Qué hace:** Carta digital QR servida en `menu.fu.do/<tienda>/qr-menu`.
- **Qué fue documentado (`DOCUMENTED` y `OBSERVED` en Fase 10 y 18):**
  - Permite consultar platos agrupados por categoría.
  - **Hallazgo forense:** Entrega un shell HTML idéntico de 2.453 bytes sin OpenGraph, sin `meta description`, sin `<h1>`, y con la directiva `<html class="notranslate" translate="no">` que **bloquea la traducción automática del navegador** (perjudicando a comensales extranjeros/turistas).
  - La carta es puramente utilitaria sin diseño de marca personalizado para cada restaurante.
- **Estado:** `CONFIRMED_WORKING` (Funcional pero tecnológicamente obsoleto y hostil para SEO).

### ARBO OS
- **Qué hace:** Sitio web completo de marca (`arbo.com`) con secciones editoriales, historia, galería, eventos (`/eventos`), carta gastronómica (`/carta`), club (`/arbo-club`) y franquicias (`/franquicia`).
- **Qué fue observado (`OBSERVED`):**
  - **Excelencia Visual:** Estética patagónica cuidada, paleta armónica (`greenDark`, `cream`, `accent`), microanimaciones suaves con Framer Motion, tipografía serif/sans diferenciada.
  - **BUG-017 (P3):** Configuración muerta en `src/data/site.js:28`:
    `externalMenuUrl: 'https://menu.fu.do/arbocafe/qr-menu'`
    conserva una URL residual de pruebas que apunta a la carta QR de Fudo.
  - **BUG-013 (P3):** Ausencia de página 404 (cualquier URL rota redirige a la home sin advertencia).
- **Estado:** `CONFIRMED_WORKING` en presentación editorial y diseño de marca; `BROKEN` en todas sus acciones transaccionales.

---

## Síntesis Clasificatoria

| Capacidad | Clasificación FUDO | Clasificación ARBO OS | Tipo de Brecha |
|---|---|---|---|
| **Gestión de Delivery** | `CONFIRMED_WORKING` (Rappi, cadetes) | `NOT_IMPLEMENTED` | **GAP** |
| **Tienda Online (Cobro)** | `CONFIRMED_WORKING` (1,9% comisión) | `BROKEN` (BUG-001: borra pedido) | **GAP CRÍTICO** |
| **Reservas Web** | `CONFIRMED_WORKING` ($55k add-on) | `BROKEN` (BUG-002: borra reserva) | **OPORTUNIDAD ARBO** |
| **Diseño y Estética de Marca** | `PARTIAL` (Genérico/rígido) | `CONFIRMED_WORKING` (Nivel premium) | **VENTAJA NETA ARBO** |
| **Carta QR comensal** | `CONFIRMED_WORKING` (2,3 MB, no SEO) | `CONFIRMED_WORKING` (En /carta) | **DIFERENCIA DE IMPLEMENTACIÓN** |
| **SEO y Traducción Web** | `BROKEN` (Bloquea traducción) | `PARTIAL` | **OPORTUNIDAD ARBO** |
