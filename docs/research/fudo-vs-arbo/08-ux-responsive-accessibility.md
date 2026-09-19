# 08 — UX, Responsive, Accesibilidad y Rendimiento Web

**Categorías cubiertas:**
35. Experiencia de Usuario y Diseño de Interfaz (UX/UI)
36. Diseño Adaptativo (Responsive)
37. Accesibilidad Digital (A11y / WCAG)
38. Rendimiento Web y Core Web Vitals

---

## 35. Experiencia de Usuario y Diseño Visual (UX/UI)

### FUDO
- **Panel Administrativo y POS (`app-v2.fu.do`):**
  - **Enfoque de diseño:** Herramienta utilitaria de alta densidad informacional optimizada para operadores de mostrador y cajeros experimentados.
  - **Puntos fuertes:** Velocidad de tipeo puro con teclado, navegación sin mouse, confirmación visual de estados por colores (verde, rojo, amarillo).
  - **Debilidades:** Estética visual anticuada (estilo software de escritorio de los años 2010 migrado a la web), formularios densos y curvas de aprendizaje pronunciadas para camareros eventuales.
- **Superficies del Comensal (`menu.fu.do` / `reservas.fu.do`):**
  - **Enfoque de diseño:** Genérico y uniforme. Las 6.166 tiendas publicadas en su plataforma comparten exactamente la misma grilla gris/blanca, sin posibilidad de plasmar la identidad de marca del restaurante.
- **Estado:** `CONFIRMED_WORKING` (Eficiente para operación de caja; deficiente para experiencia de comensal).

### ARBO OS
- **Panel Administrativo y POS (`/admin/*`):**
  - **Enfoque de diseño:** Estética premium contemporánea, tipografía curada (Serif/Sans), paleta de colores armónica (verde bosque patagónico, crema cálido, acentos dorados) y componentes modulares con `StatCard` y `Panel`.
  - **Puntos fuertes:** Experiencia visual agradable, paneles informativos limpios y comprensión inmediata de métricas para dueños y encargados.
  - **Debilidades:** El POS depende exclusivamente de interacciones de ratón o toque; no ofrece atajos de teclado para despacho rápido de mostrador.
- **Sitio Público (`/*`):**
  - Calidad de diseño sobresaliente con animaciones suaves de entrada (`Framer Motion`), microinteracciones y narrativa de marca inmersiva.
- **Estado:** `CONFIRMED_WORKING` (En estética y modernidad visual; inferior a Fudo en velocidad de carga por teclado en caja).

---

## 36. Diseño Adaptativo (Responsive)

### FUDO
- **Qué hace:** El panel de Fudo se utiliza habitualmente en ordenadores de punto de venta. Para salón ofrece una interfaz web simplificada para móviles y aplicación de mozo.
- **Limitaciones:** En pantallas intermedias (tablets pequeñas), la cuadrícula del mapa de mesas sufre desbordamientos horizontales si el salón tiene más de 30 mesas configuradas.
- **Estado:** `CONFIRMED_WORKING`.

### ARBO OS
- **Qué hace:** Layout general adaptativo con hook `useIsMobile()` que transforma el sidebar en un menú lateral deslizable (`drawer`).
- **BUG-007 (P1 · Defecto Crítico en POS):**
  En `src/admin/pages/pos/POS.jsx:90`:
  ```jsx
  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 20 }}>
  ```
  - En teléfonos (390 px): La columna de catálogo colapsa a **0 px**, imposibilitando agregar productos a una orden (Evidencia: `evidence/07-pos-mobile-390.png`).
  - En tablets verticales (768 px - ancho estándar de iPad de mozo): El catálogo mide apenas **84 px**.
- **Estado:** `BROKEN` en POS; `CONFIRMED_WORKING` en el resto del admin.

---

## 37. Accesibilidad Digital (A11y / WCAG)

### FUDO
- **Fallas de Accesibilidad Comprobadas (`OBSERVED` en Fase 18 y 20):**
  - En `menu.fu.do`, el color del precio de los platos no alcanza el contraste mínimo de 4.5:1 exigido por **WCAG 2.1 Nivel AA**.
  - Inexistencia de estructura semántica: Ausencia total de etiquetas `<h1>` y landmarks semánticos (`<main>`, `<nav>`, `<header>`).
  - Directiva `<html class="notranslate" translate="no">` que **bloquea la traducción del navegador**, afectando a usuarios que no comprenden el idioma original.
- **Estado:** `BROKEN` (En cumplimiento de accesibilidad web pública).

### ARBO OS
- **Qué fue observado (`OBSERVED` en `22-ux-accessibility.md`):**
  - Contraste tipográfico de excelencia: verde oscuro (`#1F402F`) sobre crema (`#F7F1E3`) con ratio superior a **7:1** (supera WCAG AAA).
  - **Fallas observadas:** Modales (`AdminModal.jsx`) sin captura de foco (`focus-trap`); un usuario que navega por tabulación puede salirse del modal al contenido de fondo. Cero soporte de lectores de pantalla en comandas.
- **Estado:** `PARTIAL`.

---

## 38. Rendimiento Web y Carga (Performance)

### FUDO
- **Métricas Comprobadas en Carta Pública (`menu.fu.do`):**
  - Descarga un bundle masivo de **~2,3 MB de JavaScript**.
  - Inyecta librerías innecesarias para una carta de menú: **Google Maps (~1,3 MB)** y el **SDK completo de Mercado Pago**, incrementando drásticamente el consumo de datos de los comensales en redes móviles.
  - Cero Server-Side Rendering (SSR).
- **Estado:** `PARTIAL` / `INSUFICIENTE`.

### ARBO OS
- **Métricas Comprobadas en Producción:**
  - Bundle JavaScript total: **761 kB** (gzip: 203 kB).
  - Advertencia de Vite: `(!) Some chunks are larger than 500 kB after minification`.
  - **Ausencia de Code-Splitting:** Un usuario que entra a ver la cafetería en su celular descarga también el panel de administración, el KDS y la base de datos mock completa.
  - Serialización síncrona en el hilo principal (`JSON.stringify` sobre 176 KB en cada acción).
- **Estado:** `PARTIAL`.

---

## Síntesis Clasificatoria

| Dimensión | Clasificación FUDO | Clasificación ARBO OS | Tipo de Brecha |
|---|---|---|---|
| **Velocidad de Caja (Atajos)** | `CONFIRMED_WORKING` (Teclado puro) | `NOT_IMPLEMENTED` (Solo ratón) | **GAP** |
| **Estética y Branding** | `PARTIAL` (Legacy / rígido) | `CONFIRMED_WORKING` (Nivel premium) | **VENTAJA NETA ARBO** |
| **Responsive en POS** | `CONFIRMED_WORKING` | `BROKEN` (BUG-007 en 390px/768px)| **GAP CRÍTICO ARBO**|
| **Contraste de Color** | `BROKEN` (Falla WCAG AA) | `CONFIRMED_WORKING` (Supera AAA) | **VENTAJA NETA ARBO** |
| **Traducción Web** | `BROKEN` (Bloqueada por atributo) | `CONFIRMED_WORKING` (Habilitada) | **VENTAJA NETA ARBO** |
| **Peso de Carta Digital** | `BROKEN` (2,3 MB con Maps) | `CONFIRMED_WORKING` (Carta en web) | **VENTAJA NETA ARBO** |
| **Code Splitting** | `PARTIAL` (Bundles pesados) | `NOT_IMPLEMENTED` (Monolito) | **DEUDA TÉCNICA COMÚN**|
