# 18 — OPERACIÓN EN MODO DEGRADADO Y RESILIENCIA OFFLINE

---

## 1. LA REALIDAD OPERATIVA GASTRONÓMICA

> **"Un restaurante no puede depender ciegamente de la fibra óptica de su barrio. Si internet se corta un sábado a las 22:00 hs con el salón lleno de comensales, el personal debe poder seguir tomando pedidos, despachando platos y cobrando en efectivo sin interrupción."**

---

## 2. MATRIZ DE DEGRADACIÓN POR MÓDULO

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MATRIZ DE DISPONIBILIDAD                        │
├───────────────────┬────────────────────┬───────────────────────────────┤
│ 1. MUST CONTINUE  │ 2. CAN DEGRADE     │ 3. MUST STOP                  │
│    (Sigue operando│    (Funciona con   │    (Se desactiva              │
│     sin internet) │     contingencia)  │     inevitablemente)          │
├───────────────────┼────────────────────┼───────────────────────────────┤
│ - POS Mostrador   │ - Facturación AFIP │ - Tienda Delivery Externa     │
│ - Plano de Mesas  │   (Emite provis.)  │   (El comensal no conecta)    │
│ - Cobro Efectivo  │ - ARBO Club Puntos │ - Pagos QR MercadoPago        │
│ - KDS / Comandas  │   (Encola crédito) │   (Requiere API bancaria)     │
│   (Red local LAN) │ - Descarga Stock   │ - Reservas Web desde internet │
│ - Arqueo de Caja  │   (Encola egresos) │   (Sin canal entrante)        │
└───────────────────┴────────────────────┴───────────────────────────────┘
```

---

## 3. ARQUITECTURA TÉCNICA OFFLINE-FIRST EN EL DISPOSITIVO (PWA)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENTE PWA (BROWSER / TABLET)                  │
├────────────────────────────────────────────────────────────────────────┤
│ 1. SERVICE WORKER CACHE                                                │
│    - Almacena el App Shell completo (HTML, CSS, JS, Iconos).           │
│    - Permite cargar la aplicación aunque el navegador esté desconectado│
├────────────────────────────────────────────────────────────────────────┤
│ 2. SNAPSHOT DE CATÁLOGO LOCAL (IndexedDB)                              │
│    - Almacena copia local de productos, precios y fichas técnicas.     │
│    - Se sincroniza silenciosamente cada vez que hay conexión online.   │
├────────────────────────────────────────────────────────────────────────┤
│ 3. COLA DE TRANSACCIONES OFFLINE ('offline_outbox_queue')             │
│    - Órdenes cobradas y movimientos se guardan con UUID local v4.      │
│    - Estado: 'QUEUED_FOR_SYNC'.                                        │
├────────────────────────────────────────────────────────────────────────┤
│ 4. SYNC MANAGER (Motor de Drenaje y Sincronización)                    │
│    - Escucha evento del navegador: 'window.addEventListener("online")' │
│    - Envía las órdenes encoladas al backend respetando orden temporal. │
│    - Utiliza Idempotency-Key para prevenir duplicados.                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. COMUNICACIÓN EN COCINA ANTE CORTE DE INTERNET

Si el local pierde internet pero su red Wi-Fi / Router interno sigue encendido (Red LAN local):
- **Opción A (Impresora Térmica ESC/POS de Red):** Las comandas viajan directamente por la IP local del router a la impresora de cocina (`192.168.1.200:9100`), garantizando la salida del ticket físico de preparación sin depender de la nube.
- **Opción B (KDS Local Peer-to-Peer):** Sincronización por protocolo local de red si se dispone de un servidor edge en el local (Fase 5 del Roadmap).
