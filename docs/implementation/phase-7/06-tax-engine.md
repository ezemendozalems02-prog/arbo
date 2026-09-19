# ARBO OS — FASE 7: CAPA FISCAL ARGENTINA & AUTOMATIZACIONES
## 06. MOTOR DE IMPUESTOS (TAX ENGINE)

---

## 1. PRECIOS CON IVA INCLUIDO EN CATÁLOGO
En ARBO OS, todos los precios mostrados en el menú y en la carta incluyen los impuestos al consumidor final ($P_{final}$).
Para discriminar el débito fiscal en comprobantes discriminados (Factura A):

$$\text{Neto Gravado} = \frac{P_{final}}{1 + \text{Alícuota}}$$
$$\text{IVA} = P_{final} - \text{Neto Gravado}$$

## 2. ALÍCUOTAS SOPORTADAS
- **21% (General)**: Café, pastelería general, bebidas alcohólicas y gastronomía en salón.
- **10.5% (Reducida)**: Bienes de capital o insumos agropecuarios específicos.
- **0% (Exento)**: Libros, publicaciones o insumos expresamente exentos por ley de IVA.

## 3. LÍNEAS DE VENTA MIXTAS Y REDONDEO FINANCIERO
Cuando una venta contiene productos gravados al 21% y productos gravados al 10.5%:
1. Cada línea calcula su neto e IVA de forma independiente a 2 decimales.
2. Los subtotales se consolidan por alícuota en el bloque impositivo.
3. Se aplica compensación de redondeo (`roundToTwoDecimals`) para garantizar que la suma exacta de todos los netos más los importes de IVA sea idéntica al importe total cobrado al centavo.
