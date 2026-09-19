# ARBO OS — PRE-PUBLIC COMMERCE CHECKPOINT
## 16. REGISTRO DE RIESGOS CONOCIDOS PRE-FASE 6

---

## 1. RIESGOS IDENTIFICADOS PARA LA FASE 6

Antes de dar comienzo a la implementación de Public Commerce / Online Ordering, se documentan los riesgos arquitectónicos y operacionales clave:

1. **Riesgo de Desfase de Inventario por Concurrencia**:
   - Si un producto de alta rotación (ej. Medialunas de manteca) se vende simultáneamente en el salón físico y en la web, el sistema debe garantizar que el checkout web no confirme ventas si el stock físico se agotó primero.
2. **Riesgo de Fuga de PII en URLs de Tracking**:
   - Utilizar IDs secuenciales para el seguimiento de pedidos permitiría a atacantes iterar IDs (`/orden/1001`, `/orden/1002`) y recolectar nombres, teléfonos y direcciones.
   - *Mitigación obligatoria para Fase 6*: Usar UUID o tokens secretos no enumerables para el tracking público.
3. **Riesgo de Políticas RLS Permisivas**:
   - Para permitir pedidos anónimos, existe la tentación de otorgar permisos `anon INSERT` directos en la tabla `sales` o `loyalty_transactions`.
   - *Mitigación obligatoria*: Mantener las tablas del core bloqueadas. Crear una tabla de tránsito `public_orders` y realizar la conversión a través de RPCs con validación estricta en el servidor.
4. **Riesgo de Tamaño de Bundle en Redes Móviles**:
   - Como se identificó en la auditoría de rendimiento, el bundle actual no está dividido en chunks dinámicos. En conexiones lentas, el tiempo de carga de la carta digital podría perjudicar la tasa de conversión.
   - *Mitigación*: Implementar `React.lazy()` en el router.
5. **Riesgo de Dependencia Externa en Gateways**:
   - Caídas o lentitud en la API de Mercado Pago o Stripe no deben bloquear el punto de venta físico del restaurante. El POS local debe operar de forma totalmente independiente a las pasarelas online.
