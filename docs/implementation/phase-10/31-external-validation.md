# ARBO OS — FASE 10: VALIDACIONES EXTERNAS REQUERIDAS
## Protocolo de Comprobación en Entorno Físico Real

### 1. PHYSICAL HARDWARE VALIDATION REQUIRED
- Conectar la impresora térmica física (58mm o 80mm) al puerto USB o red local LAN del salón/cocina.
- Levantar el agente de impresión local (`local print bridge`) en el puerto 9100.
- Ejecutar una prueba de impresión desde `/admin/pos` y verificar el corte de papel automático y la nitidez de la tipografía patagónica.

### 2. EXTERNAL FISCAL VALIDATION REQUIRED
- La facturación electrónica con CAE de AFIP/ARCA en producción requiere vincular el Certificado Digital X.509 de producción del contribuyente y el Punto de Venta homologado.
- La cola de contingencia y reintentos automáticos ha sido implementada y probada técnicamente en la Fase 7 y 10.
