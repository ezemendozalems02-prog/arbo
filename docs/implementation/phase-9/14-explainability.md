# ARBO OS — FASE 9: EXPLICABILIDAD DE RECOMENDACIONES
## Principio "¿Por qué ARBO me muestra esto?"

### 1. Requisito Normativo
Ningún valor ni alerta analítica se presenta como una "caja negra" o predicción mágica. Toda recomendación generada por el sistema incluye su explicación determinística con datos cuantificables.

### 2. Estructura de Explicación de Compras Sugeridas
Cada sugerencia contiene:
- `Stock actual`: Unidades registradas en el almacén.
- `En tránsito`: Mercadería despachada hacia el depósito pero aún no recibida.
- `Stock objetivo`: Nivel mínimo/óptimo de inventario configurado.
- `Déficit neto`: Brecha a reponer (`objetivo - (actual + tránsito)`).
- `Factor de empaque`: Tamaño de bulto mínimo del proveedor.
- `Bultos sugeridos`: Redondeo matemático hacia arriba (`Math.ceil`).
- `Razón textual`: Frase construida a partir de los datos exactos.

### 3. Explicabilidad en Food Cost Crítico
- Porcentaje real actual vs umbral del 35.00%.
- Insumo de mayor incidencia.
- Precio sugerido calculado con fórmula inversa para target del 30.00%.
