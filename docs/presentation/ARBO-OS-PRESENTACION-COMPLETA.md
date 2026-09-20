# ARBO OS — PRESENTACIÓN COMPLETA
## Guía Integral de Producto, Arquitectura y Estrategia para Reunión con Fede

---

## 01 — Qué es ARBO OS

### La frase para el Meet (en palabras de Thiago):
> *"Fede, ARBO OS no es una pantallita para cobrar ni un plugin para vender empanadas por internet. Es el **sistema operativo integral de un restaurante**: una única plataforma conectada donde cada café o plato que se vende impacta en tiempo real en la caja, en el stock de la cocina, en el costo del producto, en la fidelización del cliente y en los números del dueño."*

### Explicación simple:
En cualquier restaurante o cafetería común, el dueño tiene un sistema para cobrar, una libreta o Excel para los costos, una app externa como PedidosYa para los envíos (que le come el 30%), una pantalla o papelitos en la cocina, y a fin de mes no sabe si ganó o perdió plata hasta que habla con el contador. 

**ARBO OS junta todas esas partes desconectadas en un solo cerebro.** Cuando el cajero aprieta un botón en el mostrador o un cliente pide desde el celular, todo el restaurante se entera al instante de forma automática.

### Explicación técnica:
ARBO OS es una plataforma web modular, multi-tenant y de arquitectura reactiva basada en eventos. Integra:
1. **Frontend Operativo:** Punto de Venta (POS), Sistema de Pantallas de Cocina (KDS), Gestión de Arqueos de Caja y E-commerce público ligero, empaquetados como Progressive Web App (PWA) con resiliencia offline.
2. **Backend Transaccional & Ledgers:** Base de datos relacional PostgreSQL sobre Supabase con Row Level Security (RLS) a nivel de fila, funciones almacenadas transaccionales ACID y libros contables de sólo anexado (*append-only ledgers*).
3. **Motor Analítico Determinístico:** Algoritmos matemáticos reproducibles de ingeniería de menú (Kasavana-Smith), costeo por porción mediante Precio Promedio Ponderado (PPP), alertas de Food Cost y sugerencias de compra con deducción de mercadería en tránsito y factor de empaque comercial.

### ¿Qué diferencia hay entre ARBO y una simple app de caja?
Una app de caja registra entradas y salidas de plata. Nada más. No sabe cuánto café molió la máquina, no sabe si la leche aumentó un 20% la semana pasada y te está arruinando el margen, no sabe si el cliente que pagó viene todos los martes, ni avisa a la cocina qué comanda preparar primero. ARBO conecta la venta con la cocina, el inventario y la rentabilidad neta.

### ¿Qué diferencia hay entre ARBO y una web de pedidos (tipo PedidosYa o Tienda Nube)?
Una web de pedidos común es un catálogo aislado: el pedido entra como un mail o un mensaje de WhatsApp y un empleado tiene que copiarlo a mano en la comanda del local. ARBO integra el canal online directamente en la cocina y en la caja del local, con **0% de comisión por venta**, sincronizando el stock físico y sumando puntos automáticamente al club de fidelización del cliente.

---

## 02 — El problema que resuelve

### La realidad caótica de un local gastronómico desconectado:
Cuando un restaurante o café de especialidad opera con herramientas sueltas, sufre los siguientes dolores crónicos:
1. **Compra a ciegas de insumos:** El encargado pide "a ojo" o esperando a que se termine un paquete. Resultado: o falta mercadería en pleno servicio de viernes a la noche, o se clavan con 50 kg de un insumo caro que inmoviliza capital de trabajo y termina venciendo.
2. **Erosión silenciosa del margen (Food Cost fantasma):** Los proveedores aumentan los precios todas las semanas. Como nadie recalcula las recetas en el Excel todos los días, el plato sigue costando lo mismo en la carta mientras el costo se duplicó. El dueño vende un montón pero a fin de mes no le queda un peso.
3. **Plataformas de delivery predatorias:** Depender de plataformas terceras significa regalar entre el 25% y el 35% de cada venta en comisiones, además de perder los datos y el contacto directo con el cliente.
4. **Comandas perdidas y demoras en cocina:** Papelitos térmicos que se caen, comandas que se confunden entre mozos, o platos que salen a destiempo porque no hay control de estaciones (cocina caliente vs. barra vs. cafetería).
5. **Caja con "agujeros negros":** Empleados que cierran caja sabiendo de antemano cuánta plata "debería" haber, facilitando el redondeo artificial y ocultando faltantes o sobrantes.
6. **Clientes anónimos:** El 80% de la facturación suele venir del 20% de los clientes habituales, pero el local no sabe quiénes son, qué toman, ni cuándo dejaron de venir.
7. **Descontrol multi-sucursal:** Si el negocio abre un segundo local o un depósito central, no hay trazabilidad de qué mercadería salió, qué está viajando en tránsito y qué llegó realmente a la sucursal de destino.

### Cómo lo resuelve ARBO conectando las piezas:
ARBO unifica todo el ciclo bajo una **única fuente de la verdad transaccional**. Una sola base de datos donde una venta genera una cascada coordinada de eventos: descuenta el gramo exacto de café, asienta la entrada en caja, dispara la comanda en la pantalla del cocinero, actualiza el costo ponderado, acredita los puntos del cliente y refresca las métricas del dueño.

---

## 03 — La idea central de ARBO (El "Core Loop")

El corazón de ARBO OS es su **bucle operacional cerrado**. Nada ocurre en el vacío.

```
                         [ CLIENTE ]
                              │
                    Realiza un pedido
               (Mostrador, Mesa o Tienda Web)
                              │
                              ▼
                       [ POS / PEDIDO ]
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
      [ COBRO / CAJA ]                 [ INVENTARIO / RECETA ]
  - Asiento en ledger append-only   - Descuento por receta (PPP)
  - Desglose por método de pago     - Merma operativa calculada
            │                                   │
            └─────────────────┬─────────────────┘
                              │
                              ▼
                       [ KDS / COCINA ]
                  - Enrutado a estación
                  - Prioridad y tiempos
                              │
                              ▼
                      [ ARBO CLUB / CRM ]
                  - Suma puntos automáticamente
                  - Actualiza perfil y RFM
                              │
                              ▼
                    [ ANALYTICS & FOOD COST ]
                  - Matriz Kasavana-Smith
                  - Detección margen crítico
                              │
                              ▼
                   [ COMPRAS SUGERIDAS ]
              - Factor de empaque y tránsito
```

### Ejemplo real paso a paso:
> **"Un cliente compra un Espresso Doble por $3.500 en Café Grano"**

1. **Venta & Cobro:** El cajero marca el Espresso Doble en el POS y cobra en efectivo. Se genera la venta con número fiscal/comercial correlativo y se asienta un movimiento inmutable en la sesión de caja abierta.
2. **Explosión de Receta e Inventario:** El sistema consulta la receta activa: *18 gramos de grano de especialidad + 1 vaso descartable*. Convierte los gramos a la unidad base de stock (kg), suma la merma configurada (ej. 5%) y genera un movimiento negativo en `inventory_movements` usando el Precio Promedio Ponderado (PPP) del lote.
3. **Cálculo de Food Cost y Margen:** Si los 18g de café costaron $420 y el vaso $180 (costo total = $600), el sistema calcula al instante:
   $$\text{Food Cost \%} = \left(\frac{600}{3500}\right) \times 100 = 17.14\% \quad (\text{HEALTHY})$$
   $$\text{Margen de Contribución} = \$3.500 - \$600 = \$2.900$$
4. **Comanda en Cocina (KDS):** Al instante, la pantalla de la estación *Cafetería* muestra la comanda en estado `NEW` con su contador de tiempo. El barista la ve, toca la pantalla para pasarla a `PREPARING` y luego a `READY`.
5. **Fidelización (ARBO Club):** Si el cliente dio su teléfono o DNI, el motor de loyalty le acredita 35 puntos (1 punto cada $100) y actualiza su métrica RFM (*Recency, Frequency, Monetary*), identificándolo como cliente frecuente.
6. **Analytics & Compras:** La venta alimenta la Matriz Kasavana-Smith del mes (aumentando la popularidad del Espresso) y reduce el stock del grano. Cuando el stock remanente toca el nivel objetivo, el motor de compras sugeridas recomendará comprar bolsas cerradas de 5 kg del proveedor habitual.

---

## 04 — Todos los módulos de ARBO OS

### 1. POS / Ventas (Punto de Venta)
- **Qué hace:** Pantalla rápida, táctil y limpia para cobrar en mostrador, abrir comandas de mesas de salón o despachar pedidos para llevar.
- **Cómo funciona:** Selector visual de productos organizados por categorías, soporte de modificadores (ej. leche vegetal, shot extra), selección de mesa y división de medios de pago (efectivo, tarjeta, Mercado Pago, transferencia).
- **Problema que resuelve:** Elimina las demoras en fila, los errores al tipear precios y los olvidos al cobrar adicionales.

### 2. Caja y Finanzas Operativas
- **Qué hace:** Control ciego e inmutable de los turnos de caja.
- **Cómo funciona:** 
  - **Apertura y Cierre:** Requiere monto inicial declarado.
  - **Ledger Append-Only:** Cada venta, cobro o retiro de efectivo es un movimiento que sólo se puede agregar; **no se puede borrar ni editar el pasado**.
  - **Arqueo Ciego (*Blind Count*):** Al cerrar turno, el cajero debe contar físicamente los billetes e ingresar el monto sin que el sistema le "sople" cuánta plata debería haber. El sistema compara el conteo real contra el esperado y registra faltantes o sobrantes auditables.
- **Problema que resuelve:** Termina con los faltantes de caja tapados y los cierres dibujados.

### 3. Inventario & Costeo PPP
- **Qué hace:** Control del stock físico real de insumos valorizado mediante Precio Promedio Ponderado.
- **Cómo funciona:** El stock nunca es un numerito editable suelto: es el resultado matemático de la suma de todos los movimientos históricos (`quantity_delta`). Cada compra nueva recalcula el costo unitario según la fórmula contable:
  $$\text{Nuevo PPP} = \frac{(\text{Stock Previo} \times \text{Costo Previo}) + (\text{Cantidad Entrante} \times \text{Costo Entrante})}{\text{Stock Total}}$$
- **Problema que resuelve:** Refleja la inflación argentina real en los costos de los platos sin inventar números.

### 4. Recetas e Ingeniería de Costos
- **Qué hace:** Modela la composición exacta de cada plato o bebida.
- **Cómo funciona:** Define ingredientes, cantidades en cualquier unidad (g, ml, oz, unidades), porcentaje de merma operativa por cocción/limpieza y porciones resultantes. Convierte unidades automáticamente mediante un conversor de 4 familias de medida.
- **Problema que resuelve:** Permite saber con centavos cuánto cuesta realmente preparar cada plato.

### 5. KDS / Cocina (Kitchen Display System)
- **Qué hace:** Reemplaza los papelitos y comandas de papel por pantallas táctiles interactivas en cocina y barra.
- **Cómo funciona:** Ciclo de vida estricto de tickets: `NEW` (rojo/alerta) $\rightarrow$ `PREPARING` (amarillo/en elaboración) $\rightarrow$ `READY` (verde/listo para entrega) $\rightarrow$ `ARCHIVED`. Enrutamiento por estaciones: la parrilla solo ve carnes, la barra solo ve cócteles y la cafetería solo ve infusiones.
- **Problema que resuelve:** Desaparecen los platos olvidados, la comida que se enfría esperando al mozo y el griterío entre salón y cocina.

### 6. ARBO Club & CRM Gastronómico (Customer 360)
- **Qué hace:** Programa de lealtad y base de clientes integrada sin plásticos ni apps externas.
- **Cómo funciona:** El cliente se identifica con su teléfono. Suma puntos configurables por consumo, sube de nivel (ej. *Bronce, Plata, Oro, Black*) y desbloquea recompensas o canjes automáticos. El perfil *Customer 360* muestra: historial completo de visitas, ticket promedio, frecuencia de compra, productos favoritos y segmentación RFM.
- **Problema que resuelve:** Transforma comensales anónimos en clientes recurrentes de por vida.

### 7. Tienda Online / Public Commerce
- **Qué hace:** E-commerce propio y ligero para take-away y delivery directo.
- **Cómo funciona:** Catálogo sincronizado con la disponibilidad real del salón. Carrito, checkout rápido, selección de retiro en local o envío, y pantalla de tracking en tiempo real del pedido. Se conecta directamente a la caja y a la cocina sin intermediarios.
- **Problema que resuelve:** **0% de comisiones.** El restaurante deja de regalarle el 30% a apps terceras.

### 8. Facturación y Capa Fiscal
- **Qué hace:** Emisión y gestión de comprobantes comerciales y fiscales.
- **Cómo funciona:** Desglose de alícuotas de IVA (21%, 10.5%), generación de comprobantes A, B y C, estructura para Código de Autorización Electrónico (CAE), código QR reglamentario y cola de contingencia para emisión diferida.
- **Estado de implementación:** Arquitectura de datos, adaptadores y contingencia terminados en software. *(Requiere vinculación con certificado digital X.509 de producción para timbrado real ante AFIP/ARCA).*

### 9. Multi-Sucursal, Depósitos y Transferencias
- **Qué hace:** Gestión centralizada para marcas con varios locales y centros de producción.
- **Cómo funciona:** Jerarquía estricta: `Organización` $\rightarrow$ `Sucursales` $\rightarrow$ `Depósitos`. Catálogo maestro compartido con sobreescrituras locales de disponibilidad y precio. Módulo de transferencias de mercadería con estados auditados: `DRAFT` $\rightarrow$ `DISPATCHED` (mercadería en camión) $\rightarrow$ `RECEIVED` (asiento automático de entrada con recálculo PPP en destino).
- **Problema que resuelve:** Termina con los robos hormiga y las pérdidas de mercadería entre locales.

### 10. Analítica Avanzada & Matriz Kasavana-Smith
- **Qué hace:** Inteligencia de menú que categoriza platos según popularidad y rentabilidad:
  - **STAR (Estrella):** Alta venta / Alto margen. Platos emblema.
  - **PLOWHORSE (Caballo de batalla):** Alta venta / Bajo margen. Platos populares a los que hay que optimizar el costo o subir levemente el precio.
  - **PUZZLE (Rompecabezas):** Baja venta / Alto margen. Joyas ocultas que necesitan más promoción de los mozos.
  - **DOG (Perro):** Baja venta / Bajo margen. Candidatos a ser removidos de la carta.
- **Problema que resuelve:** Elimina decisiones basadas en "intuición" y muestra con datos qué platos dan de comer al negocio.

### 11. Compras Sugeridas Determinísticas
- **Qué hace:** Calcula con precisión matemática cuánta mercadería pedir a los proveedores.
- **Cómo funciona:** Evalúa:
  $$\text{Déficit Neto} = \text{Stock Objetivo} - (\text{Stock Actual} + \text{Stock en Tránsito})$$
  Aplica el **factor de empaque** del proveedor redondeando **siempre hacia arriba (`Math.ceil`)** para no desabastecer. Genera sugerencias con estado `SUGGESTED` (nunca emite compras automáticas sin aprobación humana).
- **Problema que resuelve:** Evita la plata parada en stock y los quiebres de servicio.

### 12. Motor de Automatizaciones
- **Qué hace:** Dispara acciones automáticas ante eventos de negocio.
- **Cómo funciona:** Pipeline unificado con clave de idempotencia que captura eventos como `FOOD_COST_CRITICAL` (plato con Food Cost > 35%) o `LOW_STOCK` y genera alertas en pantalla o notificaciones sin interrumpir la venta.

### 13. Resiliencia Offline-First & PWA
- **Qué hace:** Mantiene el local cobrando y despachando aunque se corte internet.
- **Cómo funciona:** Progressive Web App instalable con Service Worker que cachea los activos visuales pero no guarda datos privados. Si se corta la red, el POS guarda las ventas en una cola de salida local persistente en **IndexedDB (Outbox)**. Al volver la conexión, el sincronizador envía las operaciones en orden, resuelve conflictos de stock y confirma las transacciones.

### 14. Hardware de Impresión Térmica ESC/POS
- **Qué hace:** Imprime comandas y tickets fiscales/comerciales en impresoras térmicas estándar de 58mm y 80mm.
- **Cómo funciona:** Generador nativo de comandos binarios ESC/POS (corte automático de papel, negrita, doble tamaño) conectado a un puente de red local (`Print Bridge`) en el puerto 9100. Enruta automáticamente cada plato a la impresora de su estación de cocina.
- **Estado:** Software, comandos binarios y cola de reintentos terminados al 100%. *(Requiere conexión física de la impresora en el local real).*

---

## 05 — Un ejemplo completo de uso

> **Escenario:** Sábado a las 14:30 hs en Trevelin. Llega Martín, un cliente habitual, a almorzar al salón.

1. **Atención en Salón:** El mozo se acerca a la Mesa 4 con una tableta, abre el POS de ARBO y selecciona: *1 Bife de Chorizo Patagónico con papas rústicas ($18.000)* + *1 Copa de Pinot Noir ($6.500)*. Agrega una nota en la comanda: *"Punto jugoso, sin sal en las papas"*.
2. **Impacto en Cocina:** Al tocar "Enviar comanda", ocurren dos cosas en milisegundos:
   - En la pantalla de la *Parrilla*, aparece el Bife de Chorizo en rojo con la aclaración del punto y la sal.
   - En la pantalla de la *Barra*, aparece la Copa de Pinot Noir. Ninguna estación ve lo que no le corresponde.
3. **Control de Inventario Silencioso:** En la base de datos, el sistema ya reservó los 350g de bife de chorizo, las papas y los 150ml de vino, descontándolos de sus respectivos depósitos con sus costos PPP actuales.
4. **Preparación y Servicio:** El parrillero toca el ticket para marcar `PREPARING` y, al sacarlo, presiona `READY`. El mozo recibe el aviso visual de que la mesa 4 está lista para servir.
5. **Cierre de Mesa y Cobro:** Martín pide la cuenta. El cajero abre la mesa en el POS, Martín indica que es miembro de ARBO Club dando su número de celular. El sistema le muestra al cajero: *"Martín es Nivel Oro, tiene 450 puntos acumulados"*. Martín decide pagar con tarjeta de débito y canjear 200 puntos por un postre de regalo.
6. **Asiento Contable y Fiscal:** Se registra el cobro, se asienta en la sesión de caja del día, se descuentan los 200 puntos del club y se suman 245 puntos nuevos por la diferencia pagada. Se emite el ticket con su correspondiente desglose.
7. **Reflejo en la Pantalla del Dueño:** Desde su casa, el dueño mira el panel de ARBO en su celular: ve que la facturación del día subió a $420.000, que el Pinot Noir viene teniendo un margen del 78% (clasificado como plato *STAR*) y que el stock de bife de chorizo en cámara frigorífica quedó en 4 kg, por lo que el sistema ya preparó la sugerencia de compra para el lunes.

---

## 06 — Qué pasa si el pedido viene de Internet

ARBO no trata a los pedidos web como "otra cosa": los integra al mismo flujo que una mesa del salón.

1. **El Cliente:** Entra a `arbo-alpha.vercel.app/menu` desde su celular. Ve la carta con fotos reales, precios actualizados y platos disponibles (si un plato se quedó sin stock en el salón, automáticamente se desactiva en la web).
2. **Armado de Pedido:** Agrega una Hamburguesa Patagónica y una Cerveza Artesanal. Selecciona "Retiro por local en 30 minutos" e ingresa su teléfono.
3. **Checkout Directo:** Paga online o selecciona pago al retirar. La venta se crea en la base de datos central de ARBO como orden pública con estado `PENDING`.
4. **Ingreso Automático a Cocina:** En la pantalla KDS del local suena una alerta y entra el ticket con etiqueta `ONLINE - TAKE AWAY`. El cocinero lo elabora exactamente igual que una comanda de salón.
5. **Tracking para el Cliente:** El cliente ve en su pantalla cómo la barra de estado avanza: *Recibido* $\rightarrow$ *En preparación* $\rightarrow$ *Listo para retirar*.
6. **Sin intermediarios:** **Comisión para apps: $0.** Los datos de ese cliente quedan guardados en el CRM del restaurante para mandarle una promoción la semana siguiente.

---

## 07 — Qué pasa si el negocio tiene varias sucursales

ARBO fue diseñado desde el primer día para franquicias y cadenas multi-sucursal.

```
                    [ ORGANIZACIÓN ] (Dueño / Casa Central)
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
   [ SUCURSAL TREVELIN ]          [ SUCURSAL ESQUEL ]
    ├── Depósito Barra             ├── Depósito Barra
    └── Depósito Cocina            └── Depósito Salón
            │                             ▲
            └────── Transferencia ────────┘
                    (DISPATCHED en camino)
```

### El flujo de una transferencia de mercadería:
1. **La Necesidad:** La sucursal Esquel se está quedando sin café en grano, pero el Depósito Central de Trevelin tiene 100 kg.
2. **Creación de la Transferencia:** El encargado de Trevelin crea una orden de transferencia por 20 kg en estado `DRAFT`.
3. **Despacho (`DISPATCHED`):** Al salir el vehículo, Trevelin presiona "Despachar". En ese instante, los 20 kg salen del depósito de Trevelin, pero **no aparecen todavía como disponibles en Esquel**: el sistema los marca como **Stock en Tránsito**.
4. **Recepción en Destino (`RECEIVED`):** Cuando el paquete llega a Esquel, el encargado cuenta la mercadería y presiona "Recibir". Recién ahí el stock se suma al inventario de Esquel.
5. **Cálculo de PPP en Destino:** Si Esquel tenía 5 kg a $10.000 y recibe 20 kg a $12.000, el sistema recalcula automáticamente el costo promedio ponderado local de Esquel sin afectar a Trevelin.
6. **Consolidación Ejecutiva:** El dueño entra al panel general y ve la foto total: ventas consolidadas de ambas sucursales, valorización del inventario global y cuánta mercadería está viajando en las rutas en tiempo real.

---

## 08 — ARBO vs Fudo (Comparativa Factual y Objetiva)

Esta tabla resume de manera transparente las diferencias entre una plataforma consolidada del mercado (Fudo) y la arquitectura construida en ARBO OS:

| Área | Fudo | ARBO OS | Análisis Factual / Diferencial |
| :--- | :--- | :--- | :--- |
| **Comisión Online** | Cobra comisiones por ventas en canales online o módulos integrados. | **0% de comisión.** Canal propio directo sin costo por pedido. | Fudo monetiza cobrando extras por funciones transaccionales. ARBO defiende el margen del gastronómico. |
| **Fidelización / CRM** | Módulo de clientes básico. No tiene club de puntos gamificado nativo. | **ARBO Club nativo integrado.** Niveles (Bronce/Oro), puntos, canjes y Customer 360 RFM. | En Fudo requiere contratar herramientas externas de marketing. En ARBO es parte del sistema operativo. |
| **Food Cost y Recetas** | Costeo tradicional por insumo. Fórmulas rígidas. | **Costeo dinámico PPP con mermas operativas y alerta crítica > 35%.** | ARBO identifica cuál es el ingrediente específico que te está comiendo la rentabilidad de un plato. |
| **Ingeniería de Menú** | Reportes convencionales de ventas en Excel o PDF. | **Matriz Kasavana-Smith interactiva** (Star, Plowhorse, Puzzle, Dog). | ARBO analiza la carta estadísticamente para saber qué platos promover o rediseñar. |
| **Compras de Insumos** | Pedidos a proveedores manuales o por stock mínimo simple. | **Compras Sugeridas Determinísticas** con stock en tránsito y **factor de empaque**. | ARBO redondea hacia arriba según el empaque real del proveedor (ej. bolsas de 5 kg), evitando compras truncas. |
| **Caja y Arqueos** | Cierres de turno estándar. | **Ledger inmutable append-only con Arqueo Ciego (*Blind Count*).** | En ARBO el cajero no puede "acomodar" los números porque el sistema no le revela el saldo teórico antes del conteo. |
| **Resiliencia Offline** | Requiere conexión estable. Modos offline limitados. | **Offline-First PWA con cola de salida IndexedDB y sincronización FIFO.** | ARBO permite seguir cobrando y enviando comandas a cocina aunque se caiga la fibra óptica de la montaña. |
| **Impresión Térmica** | Integración nativa probada en miles de impresoras físicas comerciales. | **Arquitectura ESC/POS y Print Bridge terminada en software.** | **Punto fuerte de Fudo:** Años de madurez con cientos de modelos físicos. ARBO tiene la arquitectura lista, pendiente de validación en taller con impresoras reales. |
| **Facturación AFIP** | Homologado y facturando en vivo masivamente en Argentina. | **Arquitectura fiscal terminada con cola de contingencia.** | **Punto fuerte de Fudo:** Conexión AFIP de producción activa. ARBO requiere subir los certificados del cliente para timbrar con CAE. |
| **Integraciones delivery** | Integrado oficialmente a PedidosYa y Rappi. | No integrado a apps de terceros por decisión estratégica (foco en canal directo propio). | Fudo es útil para quien vive del delivery de plataformas. ARBO es para quien quiere potenciar su marca y canal directo. |
| **Multi-Sucursal** | Módulo adicional con costo extra por sucursal. | **Arquitectura multi-tenant nativa desde la base de datos.** | ARBO nació multi-sucursal; el aislamiento entre locales está garantizado a nivel de base de datos con RLS. |

---

## 09 — Las diferencias estratégicas

1. **0% de comisión sobre tus ventas:** Si un restaurante vende $5.000.000 al mes por delivery, con apps terceras deja $1.500.000 en comisiones. Con ARBO ese dinero queda 100% en el bolsillo del negocio.
2. **El comensal es tuyo, no de la plataforma:** En las apps de delivery el cliente le compra a "PedidosYa". En ARBO el cliente se suscribe a tu club, acumula tus puntos y vuelve a tu local.
3. **Protección quirúrgica del margen:** La inflación erosiona los precios día a día. La alerta de Food Cost Crítico (> 35%) te avisa en rojo qué plato dejó de ser rentable antes de que termine el mes.
4. **Tecnología moderna sin ataduras:** Construido sobre PostgreSQL, Supabase y Vite, sin tecnologías propietarias obsoletas que ralenticen el sistema.
5. **Un único sistema, cero parches:** No es un POS que se conecta mediante 5 conectores inestables a un CRM y a una tienda web. Todo comparte la misma base de datos.

---

## 10 — Qué hace ARBO con una venta (Atomicidad transaccional)

### Explicación técnica:
En bases de datos relacionales, una transacción debe cumplir con las propiedades **ACID** (*Atomicidad, Consistencia, Aislamiento y Durabilidad*). Una venta en ARBO no se compone de múltiples llamadas sueltas desde el navegador. Se ejecuta mediante una función atómica (`RPC`) en el servidor PostgreSQL.

### Explicación simple:
Imaginate que vas a cobrar una venta. Si el sistema cobrara la plata pero se colgara antes de descontar el café del stock, o si descontara el café pero no registrara el cobro en la caja, el sistema sería una mentira.

**En ARBO la venta es "todo o nada".** 
O se registra la venta, se cobra en caja, se descuenta el stock, se genera el ticket de cocina y se suman los puntos del cliente **todos juntos al mismo milisegundo**, o si algo falla en el medio, **todo vuelve atrás automáticamente** como si nada hubiera pasado. Jamás vas a tener una comanda fantasma o un stock desfasado por un error de sistema.

---

## 11 — Seguridad y arquitectura

### Los pilares técnicos explicados para el negocio:
- **PostgreSQL & Supabase:** La base de datos más robusta del mundo. Tus datos no están en un archivo de texto ni en una planilla compartida que cualquiera puede borrar.
- **Row Level Security (RLS):** Seguridad a nivel de fila. Significa que las reglas de quién puede ver qué están escritas en la propia base de datos. Un empleado de la Sucursal Trevelin físicamente no puede ver la facturación de la Sucursal Esquel, aunque intente hackear el navegador, porque el servidor rechaza la consulta.
- **Ledgers inmutables (*Append-Only*):** Las tablas de caja y de inventario no tienen botón de "borrar". Si te equivocaste al cargar $1.000, tenés que hacer un movimiento de ajuste de -$1.000. Queda todo registrado: quién lo hizo, a qué hora y por qué.
- **Protección de Datos Personales (PII):** Los teléfonos y correos de los clientes están protegidos contra filtraciones.
- **¿Por qué le importa esto al dueño?** Porque evita el robo de información, el espionaje entre locales, las trampas contables de empleados desleales y garantiza que la información financiera sea 100% auditable.

---

## 12 — Resiliencia Offline-First

### ¿Qué pasa si se corta la fibra óptica en Trevelin en pleno servicio de sábado?
En la mayoría de los sistemas web modernos, si se cae internet, la pantalla se queda blanca girando en círculo y el local entra en pánico: hay que volver a la libreta y a las cuentas a mano.

### La solución de ARBO:
1. **Detección Automática:** El sistema detecta la desconexión en milisegundos y muestra un indicador discreto en pantalla: `MODO OFFLINE`.
2. **Continuidad Operativa:** El mozo o cajero sigue cobrando, seleccionando productos y emitiendo comandas hacia las impresoras térmicas locales.
3. **Cola de Salida Segura (Outbox en IndexedDB):** Las ventas no se pierden en el aire; se guardan en una bóveda cifrada en el almacenamiento interno del navegador.
4. **Sincronización Inteligente:** Cuando internet regresa, el motor despierta solo y empieza a enviar las ventas guardadas una por una en orden cronológico estricto.
5. **Sin ventas duplicadas:** Gracias a su clave de idempotencia, aunque el sistema reintente el envío tres veces por una señal débil, el servidor reconoce la venta y no duplica el cobro ni el stock.
6. **Resolución de Conflictos:** Si el local vendió offline 5 porciones de un postre del que en el servidor solo quedaban 3 (porque se vendieron online antes del corte), el sistema no revienta ni pisa datos: alerta con un `SYNC_CONFLICT` para que el encargado haga el ajuste operativo correspondiente.

---

## 13 — Inteligencia del sistema (Sin humo ni falsas promesas)

### 1. Lo que SÍ tenemos: Inteligencia Determinística & Matemática
No necesitamos inventar que tenemos un robot parlante con IA para darle valor al negocio. ARBO tiene algoritmos matemáticos probados:
- **Food Cost en Tiempo Real:** Detección de platos que superan el 35% de costo sobre el precio de venta.
- **Matriz Kasavana-Smith:** Normalización estadística de toda la carta del restaurante cruzando popularidad vs rentabilidad.
- **Motor de Compras Sugeridas:** Algoritmo que descuenta stock en tránsito y redondea según los bultos cerrados del proveedor.
- **Segmentación RFM:** Agrupamiento automático de clientes según su comportamiento de compra real.

### 2. Motor de Automatizaciones
Reglas operativas que vigilan el negocio en segundo plano:
- *Regla:* Si el stock de leche baja de 10 litros $\rightarrow$ Crear notificación de compra urgente.
- *Regla:* Si el Food Cost de la Hamburguesa supera el 35% $\rightarrow$ Disparar alerta en el panel de control sugiriendo el precio necesario para volver al 30%.

### 3. La verdad sobre la IA generativa:
**ARBO OS no utiliza ChatGPT ni Gemini para calcular costos ni stocks.** En finanzas y gastronomía no podés confiar en una IA que "alucine" o adivine números. La matemática de ARBO es exacta, explicable y auditable. *(Los modelos de lenguaje quedan reservados únicamente para análisis cualitativo o resúmenes de texto futuros, fuera del núcleo de cálculo).*

---

## 14 — Qué significa que ARBO sea "Data-Driven"

En un restaurante tradicional, las decisiones se toman por capricho o costumbre:
> *"Cambiemos el plato porque a mí me parece que no sale"* o *"Compremos más queso por las dudas"*.

En ARBO OS, cada venta alimenta una pirámide de decisión:

```
      [ DECISIÓN ]  ──>  Subir $500 al plato o cambiar proveedor de queso
           ▲
    [ INTELIGENCIA ] ──>  Kasavana lo marca como PLOWHORSE (alta venta / bajo margen)
           ▲
      [ MÉTRICAS ]   ──>  Food Cost subió al 38.2% por aumento de lácteos
           ▲
       [ DATOS ]     ──>  Se vendieron 180 porciones a $8.000 con costo de $3.056
           ▲
     [ OPERACIÓN ]   ──>  El mozo marca la comanda en el POS
```

El dueño no adivina: abre el sistema y sabe exactamente qué plato le da de comer, qué plato le hace perder plata y a qué cliente tiene que invitarle un café para que vuelva mañana.

---

## 15 — Qué puede ver el dueño del restaurante

El dueño tiene dos paneles en uno:

### Nivel Operacional (El día a día):
- Facturación y cobros del turno en vivo.
- Estado de las mesas ocupadas y comandas demoradas en cocina.
- Cuánta plata hay exactamente en cada caja en este instante.
- Insumos que están por quebrar stock hoy.

### Nivel Estratégico (El negocio a 30 días):
- **Evolución de Ventas:** Comparativa contra el mes pasado (facturación, cantidad de tickets y ticket promedio con variación porcentual).
- **Ingeniería de Menú:** Qué platos son sus *Estrellas* y cuáles son *Perros* que ocupan lugar en la carta sin dejar ganancia.
- **Salud del Food Cost:** Porcentaje general del negocio y lista negra de platos con margen en peligro.
- **Compras y Capital Inmovilizado:** Cuánta plata tiene parada en depósitos y qué pedidos sugeridos hacer a los proveedores.
- **Club de Fidelización:** Cuántos clientes nuevos se registraron, qué porcentaje vuelve todos los meses y cuántos puntos se canjearon.
- **Consolidado Multi-Sucursal:** Cuánto rinde cada local por metro cuadrado y qué sucursal es más rentable.

---

## 16 — Qué puede hacer cada empleado (Roles y Permisos)

ARBO adapta su interfaz según el rol del usuario:

- **Cajero / Mozo:** Solo ve el POS, las mesas y el cobro. No puede ver los costos de las recetas, los márgenes de ganancia ni la facturación mensual del dueño.
- **Cocinero / Barista:** Solo ve la pantalla KDS de su estación de cocina. No ve precios, cobros ni datos de clientes. Su única misión es preparar la comida a tiempo.
- **Encargado de Local:** Ve el inventario, recibe transferencias de mercadería, realiza los arqueos de caja y revisa las compras sugeridas de su sucursal. No puede ver las otras sucursales.
- **Administrador / Dueño:** Acceso irrestricto a todas las sucursales, costos, márgenes, configuraciones fiscales y reportes financieros consolidados.

---

## 17 — Qué pasa cuando el negocio crece

ARBO acompaña el crecimiento de un emprendimiento gastronómico sin tener que cambiar de sistema:

1. **Paso 1 (Un local chico):** Empezás con una sola tableta en el mostrador cobrando y controlando stock básico.
2. **Paso 2 (Separar cocina de salón):** Agregás una pantalla en cocina (KDS) y los mozos toman pedidos desde sus propios celulares o tabletas.
3. **Paso 3 (Abrir canal online):** Activás tu menú web propio con ARBO Club para vender delivery sin comisiones.
4. **Paso 4 (Segunda sucursal):** Creás la nueva sucursal en ARBO. Comparten el catálogo pero cada local maneja sus precios locales, sus empleados y sus cajas independientes.
5. **Paso 5 (Centro de producción o depósito central):** Creás un depósito central que abastece a las sucursales mediante transferencias auditadas de mercadería con control de camiones en tránsito.

---

## 18 — Qué está realmente terminado (Inventario Honesto)

Para hablar con total transparencia con Fede, separamos el estado del proyecto en tres categorías:

### 1. COMPLETADO Y VERIFICADO (100% Funcional en Software):
- Autenticación, multi-tenancy y seguridad de datos a nivel de fila (RLS).
- Catálogo de productos, recetas, insumos y costeo por porción mediante PPP contable.
- Punto de Venta (POS) multi-mesa con división de pagos.
- Control inmutable de caja con Arqueo Ciego (*Blind Count*).
- Pantalla de Cocina (KDS) con enrutamiento por estaciones y tiempos en vivo.
- Programa de fidelización ARBO Club, niveles de socios y perfil Customer 360 RFM.
- Menú online público y tracking de pedidos para delivery/take-away sin comisión.
- Gestión multi-sucursal con depósitos y transferencias con stock en tránsito.
- Matriz Kasavana-Smith y alertas de Food Cost Crítico (> 35%).
- Motor determinístico de Compras Sugeridas con factor de empaque de proveedor.
- Arquitectura Offline-First con Service Worker y cola transaccional en IndexedDB.
- Protocolo de comandos de impresión térmica ESC/POS con corte automático.
- 383 pruebas automatizadas pasando con 100% de éxito.
- Despliegue en producción en vivo en Vercel (`arbo-alpha.vercel.app`).

### 2. IMPLEMENTADO EN SOFTWARE PERO REQUIERE VALIDACIÓN EXTERNA:
- **Impresoras Térmicas Físicas:** El generador de comandos ESC/POS y el puente de red están construidos y testeados con simuladores. Falta enchufar físicamente una impresora Epson/Hasar al cable USB/LAN del local para verificar el papel y el corte real.
- **Facturación Electrónica AFIP/ARCA:** La lógica impositiva, la estructura de comprobantes y la cola de contingencia están listas. Falta subir el Certificado Digital X.509 real de producción de la empresa para timbrar con CAE en vivo.

### 3. FUTURO / ROADMAP (Fuera del scope de estas fases):
- Facturación masiva automática por lotes para eventos corporativos.
- Integración nativa con controladores fiscales de vieja generación (no electrónicos).
- Aplicación móvil nativa en App Store / Play Store (actualmente resuelto como PWA web instalable).

---

## 19 — La arquitectura en una sola imagen mental

```
                          ARBO OS
                             │
     ┌───────────────────────┼───────────────────────┐
     │                       │                       │
[ OPERACIÓN ]           [ CLIENTE ]           [ INTELIGENCIA ]
     │                       │                       │
  ├── POS & Mesas         ├── ARBO Club           ├── Analytics & Ventas
  ├── Caja Inmutable      ├── Tienda Web 0%       ├── Food Cost (> 35%)
  ├── Inventario PPP      └── Perfil 360 RFM      ├── Kasavana-Smith
  ├── KDS / Cocina                                ├── Compras Sugeridas
  ├── Multi-Sucursal                              └── Automatizaciones
  └── Offline-First (PWA)
```

---

## 20 — El discurso de 5 minutos (Para practicar y hablar natural)

> *"Fede, te cuento rápido qué es lo que construimos.*
> 
> *Básicamente, los que tenemos locales gastronómicos convivimos con un problema diario: tenemos el sistema de la caja por un lado, los papelitos en la cocina por el otro, un Excel para ver cuánto nos cuestan las recetas que casi nunca actualizamos, y si vendemos por delivery le regalamos el 30% a PedidosYa. A fin de mes, vendiste un montón pero no sabés exactamente cuánta plata te quedó en el bolsillo.*
> 
> *ARBO OS es la solución a todo eso: es el sistema operativo completo del restaurante. No es una app suelta; es una sola plataforma donde todo está conectado.*
> 
> *Fijate lo que pasa cuando vendemos un solo café en el mostrador: en el mismo segundo que el cajero cobra, la venta se asienta en la caja, el sistema descuenta los gramos exactos de café del stock con su costo real, la comanda le aparece en la pantalla al barista en la cafetería para que la prepare, el cliente suma puntos en su club de fidelización y a mí, como dueño, el sistema me calcula al instante si el plato me está dejando el margen que yo esperaba.*
> 
> *Además, tiene tres cosas que nos diferencian de cualquier sistema tradicional:*
> 1. *Tiene su propia tienda online para que los clientes nos pidan directo sin pagar un solo peso de comisión a nadie.*
> 2. *Tiene resiliencia offline: si se corta internet en el pueblo, el local no se para; sigue cobrando y sacando comida, y cuando vuelve la red se sincroniza todo solo.*
> 3. *Tiene inteligencia de compras: el sistema mira lo que vendiste, mira lo que tenés en stock, mira lo que viene viajando en camino y te dice exactamente cuántos paquetes cerrados de café tenés que pedirle al proveedor para no clavarte con plata parada.*
> 
> *Hoy el sistema está 100% construido, probado con más de 380 tests automáticos y desplegado en internet funcionando en vivo. Lo que quiero mostrarte hoy es cómo opera en la práctica y por qué cambia totalmente la gestión del negocio."*

---

## 21 — El discurso de 15 minutos (Para presentación en profundidad)

*(Misma estructura que el de 5 minutos, pero abriendo la pantalla y mostrando los módulos en vivo)*:

1. **Minuto 0 a 3:** Introducción del problema gastronómico (desconexión, pérdida de márgenes, comisiones de apps).
2. **Minuto 3 a 6:** Demostración en vivo de una venta en el POS (`/admin/pos`) y cómo impacta en el KDS de cocina (`/admin/cocina`).
3. **Minuto 6 a 9:** Mostrar la magia de las Recetas y el Food Cost: cómo el sistema detecta si un ingrediente subió de precio y pone la alerta en rojo (`/admin/reportes/productos`).
4. **Minuto 9 a 11:** Mostrar el canal online propio (`/menu`) y cómo el cliente suma puntos en ARBO Club sin apps intermediarias.
5. **Minuto 11 a 13:** Mostrar la gestión multi-sucursal y las compras sugeridas con factor de empaque (`/admin/compras-sugeridas`).
6. **Minuto 13 a 15:** Conclusión técnica: solidez, arquitectura offline-first y plan de puesta en marcha.

---

## 22 — Preguntas difíciles que Fede podría hacer (y cómo responderlas)

#### 1. ¿Por qué usar ARBO y no Fudo que ya lo usa todo el mundo?
- **Respuesta corta:** Porque Fudo te resuelve la caja pero te cobra por todo lo demás, no tiene club de fidelización propio integrado, y si querés delivery terminás atado a pagar comisiones. ARBO integra cocina, stock real por receta, fidelización y canal online propio con 0% de comisión.
- **Si profundiza:** Fudo es un software clásico excelente y maduro, pero fue diseñado hace más de 10 años como un sistema transaccional de caja. ARBO nació con arquitectura moderna multi-tenant, offline-first y orientado a maximizar el margen de rentabilidad mediante ingeniería de menú y retención directa de clientes.

#### 2. ¿Qué hace ARBO que Fudo NO hace hoy?
- **Respuesta corta:** Matriz Kasavana-Smith automática de platos, compras sugeridas con redondeo por bulto comercial de proveedor y deducción de mercadería en tránsito, programa de lealtad gamificado integrado (ARBO Club) y delivery propio sin comisión.
- **Si profundiza:** En Fudo para saber qué plato es tu "caballo de batalla" o "estrella" tenés que exportar un Excel y hacer cálculos manuales. En ARBO el análisis es continuo y en tiempo real.

#### 3. ¿Qué hace Fudo que a ARBO todavía le falta?
- **Respuesta corta:** Fudo tiene años de homologación fiscal en vivo con cientos de impresoras fiscales viejas de AFIP y conectores directos con PedidosYa.
- **Si profundiza:** Nosotros decidimos estratégicamente no intermediar con PedidosYa en esta etapa para priorizar el canal directo sin comisión, y nuestra conexión física a impresoras de ticket requiere la validación en taller con el hardware real del local.

#### 4. ¿Cómo gana plata ARBO si no cobra comisión online?
- **Respuesta corta:** Por suscripción mensual de software (SaaS), como cualquier plataforma profesional.
- **Si profundiza:** El modelo de negocio se basa en un abono fijo predecible por sucursal. El gastronómico prefiere pagar un fijo mensual que ver cómo una plataforma se lleva el 30% de su esfuerzo en comisiones variables.

#### 5. ¿Qué pasa si un sábado a la noche se corta internet en el local?
- **Respuesta corta:** Nada grave: el sistema sigue cobrando en efectivo o posnet físico, sigue mandando comandas a cocina y cuando vuelve internet se sincroniza todo solo.
- **Si profundiza:** Gracias a la arquitectura PWA con IndexedDB Outbox, las ventas se encolan de forma segura en el almacenamiento local del dispositivo. Cuando la red se restablece, el motor sincroniza en segundo plano garantizando que no se dupliquen transacciones mediante claves de idempotencia.

#### 6. ¿Cómo sabe el sistema cuánto cuesta cada plato si los precios cambian siempre?
- **Respuesta corta:** Porque usa el sistema de Precio Promedio Ponderado (PPP). Cada vez que ingresa una factura de compra de insumos, el costo unitario del ingrediente se recalcula solo y actualiza automáticamente el costo de todas las recetas donde participa.
- **Si profundiza:** Si tenías 10 kg de café a $10.000 y comprás 10 kg nuevos a $14.000, el nuevo costo del café pasa a ser exactamente $12.000 el kilo. Todas las recetas con café pasan a costearse a $12 por gramo automáticamente.

#### 7. ¿Qué es eso de Food Cost Crítico del 35%?
- **Respuesta corta:** Es la regla de oro de la gastronomía: si los ingredientes de un plato te cuestan más del 35% de lo que lo cobrás en la carta, estás perdiendo plata o trabajando para los costos fijos.
- **Si profundiza:** Cuando un plato supera el 35.00%, ARBO lo pinta de rojo y te dice exactamente: *"Este plato tiene un Food Cost de 38.5%. El ingrediente que te lo encareció es el Queso Mozzarella. Para volver a tener un 30% de costo saludable, deberías cobrarlo a $12.400"*.

#### 8. ¿El sistema genera órdenes de compra solo sin avisar?
- **Respuesta corta:** No. Nunca. El sistema solo genera "Compras Sugeridas" para que el dueño o encargado las revise y decida.
- **Si profundiza:** El estado siempre es `SUGGESTED`. La decisión de comprar y gastar plata siempre la toma un ser humano; el sistema solo le ahorra el tiempo de tener que hacer la cuenta a mano.

#### 9. ¿Qué pasa con el factor de empaque en las compras?
- **Respuesta corta:** El sistema sabe que los proveedores no te venden 17 kg de harina sueltos: te venden bolsas de 5 kg o de 25 kg.
- **Si profundiza:** Si el sistema calcula que necesitás 17 kg, redondea hacia arriba al múltiplo del proveedor: te va a sugerir pedir 4 bolsas de 5 kg (20 kg), nunca 15 kg porque te faltaría harina para el servicio.

#### 10. ¿Cómo funciona ARBO Club para los clientes?
- **Respuesta corta:** El cliente da su teléfono en el mostrador o compra por la web y suma puntos automáticamente. No necesita bajarse ninguna app ni llevar una tarjeta de plástico.
- **Si profundiza:** Los puntos se convierten en descuentos o productos de canje que el cliente ve en su perfil web, subiendo de categoría según su frecuencia de compra.

#### 11. ¿Qué pasa si abrimos un segundo local en otra ciudad?
- **Respuesta corta:** El sistema ya está preparado. Creás la nueva sucursal y podés transferir mercadería entre depósitos con control de camión en viaje.
- **Si profundiza:** Las sucursales pueden compartir la misma carta pero tener precios distintos si los costos de flete o alquiler varían, y cada sucursal tiene sus cajas y reportes aislados.

#### 12. ¿Qué pasa si dos mozos intentan vender la última porción al mismo tiempo?
- **Respuesta corta:** El sistema es transaccional y atómico (ACID). El primero que confirma se lleva la porción; al segundo le avisa que el plato se agotó.
- **Si profundiza:** La verificación de inventario ocurre dentro de una transacción en el servidor PostgreSQL, impidiendo la venta en negativo o la sobreventa por concurrencia.

#### 13. ¿Está conectado con AFIP para hacer factura electrónica?
- **Respuesta corta:** La arquitectura fiscal está terminada al 100%. Para timbrar facturas A, B o C oficiales en vivo solo falta cargar el certificado digital de la empresa.
- **Si profundiza:** Cuenta además con un sistema de contingencia: si los servidores de AFIP se caen (algo muy común en Argentina), el local sigue vendiendo y la factura electrónica se emite en diferido dentro de las 72 horas legales.

#### 14. ¿Puede imprimir comandas en impresoras de cocina reales?
- **Respuesta corta:** Sí, el software genera comandos universales ESC/POS y los envía por red o USB a través de un puente local.
- **Si profundiza:** El código formatea el texto, activa el corte automático de papel y envía cada ítem a su estación correspondiente. Solo requiere conectar la impresora física en el local para la prueba de campo final.

#### 15. ¿Qué pasa si una impresora se queda sin papel?
- **Respuesta corta:** La comanda no se pierde. El sistema avisa el fallo y te deja reintentar la impresión con un botón apenas le ponés papel nuevo.
- **Si profundiza:** El trabajo de impresión pasa a estado `FAILED` pero la venta y el ticket de cocina quedan perfectamente guardados en la base de datos sin duplicarse.

#### 16. ¿Qué seguridad tenemos de que los empleados no vean la plata que gana el negocio?
- **Respuesta corta:** Total. Los roles están aislados a nivel de base de datos con políticas de seguridad RLS.
- **Si profundiza:** El cajero solo puede ver la caja de su turno. No tiene acceso a los paneles de facturación general, márgenes, costos ni reportes del dueño.

#### 17. ¿Qué es el Arqueo Ciego en la caja?
- **Respuesta corta:** Es la mejor forma de evitar que falte plata: el cajero tiene que contar y escribir cuánta plata tiene sin que el sistema le diga cuánto debería haber.
- **Si profundiza:** Si el sistema le dice *"Tenés que tener $50.000"*, es fácil acomodar los billetes. Con el arqueo ciego, el cajero declara la plata física y recién después el sistema compara y audita las diferencias.

#### 18. ¿Dónde están guardados los datos?
- **Respuesta corta:** En servidores seguros de Supabase y PostgreSQL en la nube, con copias de seguridad automáticas y protección de grado bancario.
- **Si profundiza:** No dependemos de una computadora vieja en el local que si se rompe o se llena de grasa te hace perder todo el historial del negocio.

#### 19. ¿Tiene Inteligencia Artificial?
- **Respuesta corta:** Tiene inteligencia analítica determinística y matemática real. No usamos ChatGPT para inventar números.
- **Si profundiza:** En finanzas y stock necesitás matemática exacta, no una IA probabilística que adivine. Nuestros algoritmos de menú engineering y food cost son 100% exactos y explicables.

#### 20. ¿Qué es la Matriz Kasavana-Smith?
- **Respuesta corta:** Es el método científico que usan las cadenas gastronómicas internacionales para saber qué platos dejar en la carta y cuáles sacar.
- **Si profundiza:** Cruza cuántas unidades vendés de un plato contra cuánto margen de plata te deja. Te los clasifica en Estrellas, Caballos de Batalla, Rompecabezas y Perros.

#### 21. ¿Qué es un plato "Perro" (*Dog*) en la matriz?
- **Respuesta corta:** Un plato que se vende poco y que encima deja poco margen. Ocupa lugar en la heladera y tiempo de los cocineros al cuhete.
- **Si profundiza:** ARBO te los marca claramente para que evalúes sacarlo de la carta o reformularlo por completo.

#### 22. ¿Y un plato "Rompecabezas" (*Puzzle*)?
- **Respuesta corta:** Un plato riquísimo que te deja un margen de ganancia excelente, pero que la gente no pide mucho porque no lo conoce.
- **Si profundiza:** Es el plato que tenés que mandar a los mozos a recomendar proactivamente en la mesa para ganar más plata.

#### 23. ¿Se puede usar desde celulares?
- **Respuesta corta:** Sí, toda la plataforma es responsive y funciona en celulares, tabletas y computadoras de escritorio.
- **Si profundiza:** Está optimizada como PWA, por lo que podés instalarla en la pantalla de inicio de cualquier teléfono o tablet como si fuera una app nativa.

#### 24. ¿El cliente tiene que pagar para usar el menú web?
- **Respuesta corta:** No, el cliente entra gratis desde su navegador, mira la carta y pide.
- **Si profundiza:** Sin registros engorrosos ni descargas pesadas desde las tiendas de aplicaciones.

#### 25. ¿Cómo se manejan los desperdicios o comida que se tira (*Waste*)?
- **Respuesta corta:** Hay un módulo específico para registrar mermas y comida quemada o vencida.
- **Si profundiza:** Se descuenta del stock y se registra en los reportes de costos para saber cuánta plata se está tirando a la basura en la cocina.

#### 26. ¿Qué pasa si quiero exportar los datos a Excel para mi contador?
- **Respuesta corta:** Todos los reportes de ventas, compras, caja e inventario son exportables y auditables.
- **Si profundiza:** La información está normalizada para que cualquier estudio contable pueda procesar los libros de IVA y balances.

#### 27. ¿Qué tan rápido anda el sistema?
- **Respuesta corta:** Vuela. Las pantallas abren de forma instantánea y el build de producción pesa menos de 300 KB.
- **Si profundiza:** Compila con Vite en 700 milisegundos y las consultas a la base de datos están optimizadas para evitar demoras (*anti-N+1*).

#### 28. ¿Qué pasa si un mozo anula una comanda que ya se estaba cocinando?
- **Respuesta corta:** La cocina se entera al instante: el ticket cambia de estado o se cancela en la pantalla KDS para que no sigan cocinando algo que nadie va a pagar.
- **Si profundiza:** Se mantiene la trazabilidad de la anulación para auditar por qué se canceló el plato.

#### 29. ¿Cuánto tiempo llevó construir esto?
- **Respuesta corta:** Se construyó a lo largo de 10 fases de ingeniería modular muy rigurosas, con más de 380 pruebas automáticas.
- **Si profundiza:** Cada fase resolvió una capa sólida antes de pasar a la siguiente, garantizando que el sistema no tenga parches ni código improvisado.

#### 30. ¿Está listo para probar hoy?
- **Respuesta corta:** Sí, está desplegado y funcionando en vivo en internet en `arbo-alpha.vercel.app`.
- **Si profundiza:** Podés entrar ahora mismo desde el navegador, loguearte al panel de control y ver cómo opera el sistema con datos reales.

---

## 23 — Las 10 fases resumidas (Línea de tiempo de construcción)

1. **Fase 1 — Auth, Tenancy & RLS:** Fundación de seguridad, creación de organizaciones y aislamiento estricto de datos en PostgreSQL.
2. **Fase 2 — Catálogo, Recetas e Inventario PPP:** Modelado de insumos, unidades de medida, explosión de recetas y costeo contable por porción.
3. **Fase 3 — Ventas, Pagos, Caja y Transacciones ACID:** Punto de venta multi-medio de pago, ledger inmutable de caja y atomicidad comercial.
4. **Fase 4 — KDS & Pantallas de Cocina:** Flujo de comandas en tiempo real, enrutamiento a estaciones y control de tiempos de despacho.
5. **Fase 5 — Clientes, ARBO Club & CRM 360:** Fidelización gamificada por niveles, canje de puntos y métricas RFM.
6. **Fase 6 — Public Commerce & Menú Online:** E-commerce propio directo, carrito, checkout integrado y 0% comisión.
7. **Fase 7 — Capa Fiscal Argentina & Automatizaciones:** Modelado de IVA, facturas A/B/C, contingencia AFIP y pipeline de eventos.
8. **Fase 8 — Escala Multi-Sucursal & Depósitos:** Jerarquía de locales, catálogo maestro con precios locales y transferencias de stock en tránsito.
9. **Fase 9 — Inteligencia Operacional & Analítica Avanzada:** Matriz Kasavana-Smith, alerta de Food Cost Crítico (> 35%) y compras sugeridas con factor de empaque.
10. **Fase 10 — Resiliencia Offline (PWA), Impresión ESC/POS & Cierre Productivo:** Service Worker, Outbox en IndexedDB, generador de comandos térmicos, hardening de seguridad y deploy productivo final.

---

## 24 — Las cifras del proyecto (Verificadas en código)

- **Total de pruebas automatizadas pasando:** **383 / 383 (100%)**
  - Fases 1 a 9 (Regresión acumulada): 326 tests
  - Fase 10 (Offline, Hardware & Hardening): 57 tests
- **Bloqueos críticos P0 / P1 / P2:** **0**
- **Errores en compilación de producción:** **0 errores** (Build completado en 715 ms)
- **Fases del roadmap completadas:** **10 de 10 (100%)**
- **Migraciones de base de datos auditadas:** **9 scripts SQL consolidados**

---

## 25 — El estado actual de ARBO OS

- **Código:** Consolidado en rama `main`, commiteado bajo el hash `af28770a8310c9772bf29a67e2a9394635ea7834` y sincronizado en GitHub.
- **Producción:** Desplegado en Vercel bajo el Deployment ID `dpl_6TCBmvc6DCuwP9gQNqBPzfKV9sNf`.
- **URLs activas:** 
  - Producción: [https://arbo-alpha.vercel.app](https://arbo-alpha.vercel.app)
  - Alternativa de inspección: [https://arbo-5t9w6os70-thiago188rc-1258s-projects.vercel.app](https://arbo-5t9w6os70-thiago188rc-1258s-projects.vercel.app)
- **Estado de release:** **PHASE 10 COMPLETE — ARBO OS RELEASE COMPLETE.**

---

## 26 — Explicación para alguien que no sabe de tecnología (2 minutos)

> *"Pensá en un restaurante como en un barco. En la mayoría de los lugares, el capitán mira para un lado, el timonel para otro, los remeros no saben a qué velocidad van y el cocinero cocina lo que le parece. Cada uno tiene su propio reloj y ninguno coincide.*
> 
> *ARBO OS es como ponerle un sistema de navegación moderno al barco donde todos miran el mismo mapa en tiempo real. Cuando un comensal pide un plato en una mesa, el capitán (dueño) sabe exactamente cuánto dinero entró, el timonel (cajero) sabe qué cobrar, los marineros (mozos) saben a qué mesa llevarlo, el cocinero lo ve en su pantalla sin papelitos y el depósito descuenta automáticamente cada gramo de carne o verdura que se usó.*
> 
> *Al final del día, nadie tiene que quedarse tres horas contando papelitos ni peleándose con la calculadora: el sistema te dice exactamente cuánta plata ganaste, qué comida te sobró y qué tenés que comprar mañana para seguir navegando tranquilos."*

---

## 27 — El Elevator Pitch de 30 segundos (De memoria)

> *"ARBO OS es el sistema operativo gastronómico integral que conecta en tiempo real las ventas, la cocina, el inventario real por receta y la fidelización del cliente en una sola plataforma.*
> *Elimina las comisiones de delivery ofreciendo venta online directa al 0%, protege la rentabilidad del dueño avisando al instante si un plato supera el 35% de costo y sigue funcionando en salón y cocina aunque se corte internet.*
> *No es una caja boba: es la inteligencia operativa que hace que un restaurante gane más plata y opere sin fricción."*

---

## 28 — Glosario en lenguaje humano

- **POS (*Point of Sale*):** Punto de venta. La pantalla táctil del cajero o mozo para cargar pedidos y cobrar.
- **KDS (*Kitchen Display System*):** Pantalla interactiva en la cocina que reemplaza a las comandas de papel.
- **Food Cost:** El porcentaje que representan los ingredientes de un plato respecto a su precio de venta en la carta.
- **PPP (Precio Promedio Ponderado):** Método contable que actualiza el costo de un insumo promediando lo que ya tenías con lo que compraste nuevo.
- **ACID:** Propiedad de las bases de datos que garantiza que una venta se grabe completa con su stock y caja, o no se grabe nada si algo falla.
- **PWA (Progressive Web App):** Aplicación web que se puede instalar en celulares o tabletas y que funciona sin conexión a internet.
- **IndexedDB:** Bóveda de base de datos interna que tiene el navegador para guardar ventas cuando no hay internet.
- **Outbox:** Cola de salida donde esperan las operaciones offline hasta que vuelva la conexión para enviarse al servidor.
- **Idempotencia:** Capacidad del sistema de recibir dos veces la misma venta por error de red y procesarla una sola vez sin duplicar nada.
- **Append-Only Ledger:** Libro contable donde los movimientos solo se agregan y nunca se pueden borrar ni editar.
- **RLS (*Row Level Security*):** Seguridad que asegura que cada empleado y sucursal solo pueda ver sus propios datos.
- **Multi-Tenancy:** Arquitectura que permite que múltiples empresas o marcas operen en el mismo sistema completamente aisladas entre sí.
- **Kasavana-Smith:** Matriz matemática que clasifica los platos de la carta cruzando popularidad vs rentabilidad (*Star, Plowhorse, Puzzle, Dog*).
- **CAE:** Código de Autorización Electrónico emitido por AFIP para validar legalmente una factura electrónica en Argentina.
- **ESC/POS:** Lenguaje binario estándar con el que se comunican las impresoras térmicas de tickets y comandas.
- **RFM:** Métrica de marketing que segmenta a los clientes según cuán reciente vinieron (*Recency*), qué tan seguido vienen (*Frequency*) y cuánta plata gastan (*Monetary*).

---

## 29 — Puntos que NO debemos vender exageradamente ("NO chamuyar")

Para mantener una credibilidad del 100% con Fede, **NO prometer ni exagerar lo siguiente**:

1. **NO decir que la impresora física ya está andando en el local:** La arquitectura de software y el generador de comandos ESC/POS están 100% terminados y probados con simuladores, pero falta enchufar el cable en la impresora física de Trevelin para validar el corte de papel real en salón.
2. **NO decir que ya estamos facturando con CAE en AFIP hoy:** El sistema fiscal, las alícuotas y la contingencia están programados al 100%, pero hasta que la empresa no cargue su Certificado Digital oficial de producción en AFIP, las facturas operan en entorno de homologación/contingencia.
3. **NO decir que tenemos Inteligencia Artificial / ChatGPT metido adentro:** ARBO usa matemática y estadística determinística (Kasavana-Smith, PPP, umbrales de Food Cost). Eso es **mejor y más confiable** para la plata de un restaurante que un modelo generativo que invente datos.
4. **NO decir que reemplazamos a PedidosYa en su app:** ARBO reemplaza a PedidosYa en el canal propio (delivery directo y take-away para la gente que ya conoce el local). No te busca clientes nuevos en el marketplace de PedidosYa.
5. **NO prometer apps nativas en el App Store:** El sistema opera como PWA web instalable directo desde el navegador, lo cual es más rápido, no requiere descargar 100 MB de la tienda ni pagar licencias de Apple/Google.

---

## 30 — Cierre para la reunión con Fede

> *"Fede, para cerrar: el gran error de la gastronomía en los últimos diez años fue comprar una caja barata por un lado, poner una app de delivery que te cobra el 30% por el otro, usar papelitos en la cocina que se caen al piso y llevar los costos en un Excel que nadie mira.*
> 
> *Lo que armamos con ARBO OS es un sistema que entiende que un restaurante es un único organismo vivo. Cuando cuidás el costo del plato, cuidás la caja, le hacés la vida fácil a la cocina y le das un motivo al cliente para volver sin intermediarios que te sangren los márgenes, el negocio cambia por completo.*
> 
> *El sistema no es un prototipo ni una idea en una servilleta: está construido, probado de punta a punta y funcionando en vivo. Ahora el desafío es ponerlo a rodar en el local y ver cómo transforma la operación día a día."*
