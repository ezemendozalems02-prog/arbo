# 19 — Sitio Público vs ARBO OS

**Rutas:** `/*` (Sitio público) vs `/admin/*` (ARBO OS)  
**Archivos:** `src/App.jsx`, `src/pages/*`, `src/admin/AdminApp.jsx`, `src/context/*`  
**Estado general:** `BROKEN` / `DISCONNECTED` — existen dos aplicaciones completamente divorciadas dentro del mismo repositorio y bundle que no comparten estado, comunicación ni canales de datos.

---

## 19.1 La Fractura Arquitectónica en `App.jsx`

En `src/App.jsx:88-95`, el router raíz separa la experiencia en dos universos aislados:

```jsx
<Routes>
  <Route path="/admin/*" element={<AdminApp />} />
  <Route path="/*" element={<PublicShell />} />
</Routes>
```

| Dimensión | Sitio Público (`/*`) | ARBO OS (`/admin/*`) |
|---|---|---|
| Providers activos | Solo `CartProvider` | `ToastProvider` → `POSProvider` → `InventoryProvider` → `CRMProvider` |
| Persistencia | `arbo_cart_v1` (solo carrito) | `arbo_pos_v1`, `arbo_inventory_v1`, `arbo_crm_v1` |
| Comunicación | Ninguna | Ninguna hacia el público |
| Autenticación | No existe | No existe |

---

## 19.2 Matriz de Puntos de Contacto y Defectos

| Flujo Público | Lo que ve el usuario | Lo que recibe el negocio | Clasificación |
|---|---|---|---|
| Pedido Online (`/pedidos`) | "Pedido recibido #ARBO-XXXX" | **Nada.** Datos eliminados en memoria. | **BUG-001 · P0** |
| Reserva de Mesa (`/reservas`) | "Reserva confirmada" | **Nada.** Descartada; `/admin/reservas` dice "Próximamente". | **BUG-002 · P0** |
| Formulario Franquicia (`/franquicia`) | "Solicitud recibida" | **Nada.** Lead perdido en memoria. | **BUG-024 · P1** |
| ARBO Club (`/arbo-club`) | Demo fija con 2.840 puntos | No hay consulta ni login de socios. | **BUG-022 · P2** |
| Carta Online (`/carta`) | Menú con fotos y precios | Lee de `src/data/menu.js` (estático). | `CONFIRMED_WORKING` |
| Pedidos en Admin (`/admin/pedidos`) | Enlace en sidebar | `available: false` (Pantalla "Próximamente"). | `NOT_IMPLEMENTED` |
| Reservas en Admin (`/admin/reservas`) | Enlace en sidebar | `available: false` (Pantalla "Próximamente"). | `NOT_IMPLEMENTED` |

---

## 19.3 Consecuencias para el Negocio

El sitio público promete un ecosistema digital moderno (delivery propio, reservas online, club de fidelización y franquicias), pero **el 100% de las acciones transaccionales del cliente público caen en un agujero negro**. El personal en el local nunca se entera de los pedidos ni de las reservas generadas desde la web.
