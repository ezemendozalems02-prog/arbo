# ARBO OS — FASE 10: OPTIMIZACIÓN MÓVIL Y TABLETAS
## Experiencia Táctil y Diseño Responsivo

### 1. Interfaz Táctil para Salón y Cocina
- Componentes diseñados para áreas de toque cómodas (mínimo 44x44px según directrices de accesibilidad).
- Drawer lateral colapsable (`AdminLayout.jsx`) en pantallas de ancho inferior a 1024px.
- Pantalla KDS adaptada a visibilidad de larga distancia (tipografía de gran contraste y tarjetas amplias).

### 2. Indicador de Conectividad en Tiempo Real
El componente `ConnectivityBanner.jsx` ofrece feedback visual inmediato:
- **Punto Verde:** En línea y sincronizado.
- **Punto Ámbar:** Sincronizando transacciones locales pendientes.
- **Punto Rojo / Alerta:** Modo offline activo, indicando la cantidad exacta de operaciones diferidas en cola.
