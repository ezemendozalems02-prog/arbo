# ARBO OS — Fase 8: PPP en Tránsito y Destino

### 1. Principio Financiero
El Precio Promedio Ponderado (PPP) no puede fluctuar en tránsito debido a cambios de precios en el origen posteriores al despacho.
Al momento del despacho:
$$Cost_{snapshot} = PPP_{origen}$$

Durante el tránsito, el insumo se encuentra valorizado contablemente a $Cost_{snapshot}$.

### 2. Recálculo en Destino
Al confirmarse la recepción física, el nuevo PPP del destino se calcula mediante la fórmula de costo medio ponderado:
$$PPP_{nuevo} = \frac{(Stock_{existente} \times Cost_{existente}) + (Q_{recibida} \times Cost_{snapshot})}{Stock_{existente} + Q_{recibida}}$$

### 3. Ejemplo Concreto Validado
1. Depósito Central tiene 50 kg de café @ $10.000 PPP.
2. Se despachan 10 kg a Trevelin. Se congela $Cost_{snapshot} = \$10.000$.
3. En tránsito, Central adquiere más café a $12.000. Su PPP sube a $11.000.
4. Trevelin recibe 9.8 kg (0.2 kg merma). Trevelin tenía previamente 5 kg @ $8.000.
5. El nuevo PPP en Trevelin se calcula con el snapshot de $10.000:
   $$PPP_{trevelin} = \frac{(5 \times 8.000) + (9.8 \times 10.000)}{5 + 9.8} = \frac{40.000 + 98.000}{14.8} = \$9.324,32$$
   El incremento de costo en Central no afecta retroactiva ni incorrectamente a Trevelin.
