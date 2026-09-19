# ARBO OS — FASE 10: SEGURIDAD DEL CACHÉ PÚBLICO
## Protección de PII y Datos Comerciales

### 1. El Riesgo de Dispositivos Compartidos
En un restaurante, múltiples camareros o cajeros pueden utilizar la misma tableta o terminal POS a lo largo del día.

### 2. Aislamiento Criptográfico y Local
- Los datos de clientes (nombre, teléfono, email, saldo de puntos ARBO Club) **NUNCA** se almacenan en la caché del Service Worker accesible a recursos no autenticados.
- Las consultas al catálogo público `/menu` solo exponen productos con `is_available = true` y precios públicos de venta, sin revelar costos PPP, recetas ni márgenes.
