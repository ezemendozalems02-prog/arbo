# 22 — UX, Responsive y Accesibilidad

**Archivos:** `src/admin/layout/AdminLayout.jsx`, `src/admin/pages/pos/POS.jsx`, `src/admin/components/*`, `src/hooks/useMediaQuery.js`  
**Estado general:** `PARTIAL` — layout administrativo general responsive con drawer lateral móvil; POS completamente roto en pantallas angostas (BUG-007) y accesibilidad deficiente.

---

## 22.1 Comportamiento Responsive

### Lo que funciona bien (`CONFIRMED_WORKING`)
- `AdminLayout.jsx` implementa `useIsMobile()` (umbral 768px):
  - En desktop (>768px): Sidebar fijo de 260px con scroll independiente.
  - En mobile (≤768px): Sidebar colapsado en un drawer con backdrop semitransparente y botón hamburguesa accesible.
- Tablas y listas administrativas (`Ventas.jsx`, `Purchases.jsx`, `CustomersDashboard.jsx`): usan tarjetas apilables con textos que se truncan adecuadamente.
- KDS (`/admin/cocina`): Se adapta ocupando el ancho completo de pantalla sin encajonamiento.

### La falla crítica: El POS en móviles y tablets verticales (BUG-007)
En `src/admin/pages/pos/POS.jsx:90`:
```jsx
<div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 20 }}>
```
- **390 px (Smartphones):** La columna de catálogo colapsa a **0 px**. El panel de orden se superpone e impide tocar o elegir productos (Evidencia: `evidence/07-pos-mobile-390.png`).
- **768 px (iPad vertical / Tablet de salón):** La columna de productos mide apenas **84 px**. Siendo la tablet vertical el dispositivo estándar para mozos en gastronomía, el POS resulta inoperable.

---

## 22.2 Accesibilidad (A11y) y Atajos

| Criterio WCAG | Estado | Observación |
|---|---|---|
| Contraste tipográfico | `CONFIRMED_WORKING` | Paleta cálida basada en `greenDark` (#1F402F) sobre `cream` (#F7F1E3) con ratio > 7:1. |
| Trampa de foco en modales | `NOT_IMPLEMENTED` | Los modales (`AdminModal.jsx`) no atrapan el foco del teclado; tabular permite salir al fondo. |
| Atributos ARIA | `PARTIAL` | Botones principales tienen `aria-label`; tarjetas interactivas carecen de roles `role="button"`. |
| Atajos de teclado en POS | `NOT_IMPLEMENTED` | Sin atajos para cobro rápido (Enter), búsqueda (Ctrl+K) ni escape de comanda (Esc). |
| Touch targets | `CONFIRMED_WORKING` | Botones de adición y steppers cumplen la recomendación mínima de 44x44px. |
