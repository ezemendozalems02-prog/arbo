# ARBO OS — FASE 4: ENRUTAMIENTO POR ESTACIONES OPERATIVAS

---

## 1. ESTACIONES DE PRODUCCIÓN

La tabla `kitchen_stations` permite particionar la cocina física de una sucursal en áreas de especialidad:
- `BAR` (Barra, Cafetería, Coctelería)
- `KITCHEN` (Cocina Caliente, Horno, Planchas)
- `PASTRY` (Pastelería, Postres)

---

## 2. REGLA DE ASIGNACIÓN

1. **A Nivel de Producto:** La columna `products.station_id` permite declarar la estación de elaboración predeterminada para cada artículo del menú.
2. **Fallback Automático:** Si un producto no tiene estación explícita, se enruta a la estación primaria activa de la sucursal (ej. `BAR` o primera estación creada).
3. **Filtrado en Pantalla KDS:** La interfaz del KDS provee pestañas superiores para conmutar entre estaciones (`BAR`, `COCINA`, etc.) o consolidar la vista general, permitiendo que cada terminal táctil se enfoque en su área operativa.
