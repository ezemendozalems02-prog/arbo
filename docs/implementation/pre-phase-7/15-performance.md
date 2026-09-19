# ARBO OS — PRE-PHASE 7 CHECKPOINT
## 15. RENDIMIENTO & IMPACTO EN TIEMPOS DE RESPUESTA

---

## 1. PRESUPUESTO DE LATENCIA EN CHECKOUT

En un local gastronómico en hora pico, cada segundo cuenta:
- **Latencia Objetivo de Cobro**: $< 500\text{ ms}$ (procesamiento de venta, caja e inventario en PostgreSQL).
- **Timeout Fiscal Máximo**: $3.5\text{ s}$ en la llamada HTTP SOAP al Web Service de AFIP.
- **Si AFIP demora $> 3.5\text{ s}$**: El sistema interrumpe la llamada síncrona, entrega el comprobante en proceso de CAE al cliente y delega la finalización al worker en background.
- **Resultado**: La pantalla del cajero se libera de inmediato para atender al siguiente cliente en la fila.

---

## 2. GENERACIÓN DEL CÓDIGO QR EN TIEMPO REAL

- La construcción de la cadena de texto oficial de AFIP y su codificación en Base64 se realiza en memoria en $< 2\text{ ms}$.
- El renderizado visual del código QR se genera mediante SVG o Canvas vectorial liviano sin librerías pesadas que inflen el bundle.
