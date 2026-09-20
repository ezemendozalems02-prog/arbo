# ARBO OS — GUÍA TÁCTICA PARA EL MEET CON FEDE
## Hoja de Ruta Rápida, Orden de Presentación y Checklist Operativo

---

## 1. OBJETIVO DEL MEET
Lograr que Fede entienda el valor de ARBO OS en los primeros 10 minutos, vea que la plataforma está **realmente construida y funcionando en vivo**, y comprenda cómo resuelve los problemas de rentabilidad, comisiones y descontrol operativo de un local gastronómico.

---

## 2. CHECKLIST ANTES DEL MEET (Tener abierto de antemano)

Antes de entrar a la llamada o prender la cámara, abrí en tu navegador las siguientes pestañas en este orden exacto:

1. **Pestaña 1 — Producción en Vivo (Dashboard):**
   `https://arbo-alpha.vercel.app/admin` (Logueado previamente con credenciales de administrador).
2. **Pestaña 2 — Punto de Venta (POS):**
   `https://arbo-alpha.vercel.app/admin/pos` (Listo para simular una comanda de salón o mostrador).
3. **Pestaña 3 — Pantalla de Cocina (KDS):**
   `https://arbo-alpha.vercel.app/admin/cocina` (Para mostrar en tiempo real cómo entra el pedido).
4. **Pestaña 4 — Ingeniería de Menú & Kasavana-Smith:**
   `https://arbo-alpha.vercel.app/admin/reportes/productos` (Para mostrar la matriz *Star / Plowhorse / Puzzle / Dog* y las alertas de Food Cost en rojo).
5. **Pestaña 5 — Compras Sugeridas:**
   `https://arbo-alpha.vercel.app/admin/compras-sugeridas` (Para mostrar el factor de empaque y stock en tránsito).
6. **Pestaña 6 — Menú Público Online (0% Comisión):**
   `https://arbo-alpha.vercel.app/menu` (En vista responsive de celular o ventana angosta).
7. **Pestaña 7 — ARBO Club & Clientes:**
   `https://arbo-alpha.vercel.app/admin/loyalty` (Para mostrar los niveles Oro/Plata y puntos de clientes).

---

## 3. ORDEN DE LA PRESENTACIÓN (Paso a Paso)

### PASO 1: La Apertura (2 a 3 minutos) — *Sin compartir pantalla todavía*
- **Qué decir:**
  > *"Fede, antes de mostrarte la pantalla, te cuento en dos palabras qué resolvimos. Cualquier restaurante hoy tiene tres problemas graves: le regala el 30% a las apps de delivery, no sabe si los platos son rentables porque la inflación le come los costos en silencio, y la cocina vive a los gritos con papelitos que se pierden.*
  > *ARBO OS es el sistema operativo completo del restaurante: una sola plataforma donde la caja, la cocina, las recetas, el stock real y los clientes están 100% conectados."*
- **Regla de oro:** Hablá de los dolores del gastronómico (plata, tiempo, descontrol), no de código.

---

### PASO 2: La Demostración en Vivo del Core Loop (5 minutos) — *Compartir pantalla*
1. **Andá a la Pestaña 2 (POS):**
   - *"Mirá Fede, esto es el mostrador o la tablet del mozo."*
   - Marcá un café o una hamburguesa en la Mesa 3.
   - Mostrá cómo se le agrega un modificador o nota (*"sin sal"*).
2. **Cambiá a la Pestaña 3 (KDS de Cocina):**
   - *"Al segundo que toco 'Enviar', el cocinero en la cocina ya tiene la comanda en su pantalla en rojo, con el tiempo corriendo, sin ningún papel térmico de por medio."*
   - Tocá el ticket para pasarlo a `PREPARING` y luego a `READY`.
3. **Volvé a la Pestaña 2 y simulá el Cobro:**
   - Cobrá la mesa e ingresá un cliente del club.
   - *"Acá el cliente no solo paga: suma puntos en su club de fidelización y la caja registra un movimiento inmutable que ningún empleado puede borrar ni editar."*

---

### PASO 3: El Diferencial del Margen y Food Cost (3 minutos)
1. **Andá a la Pestaña 4 (Reporte de Productos & Kasavana):**
   - *"Esto es lo que ningún sistema como Fudo o Maxirest te muestra en tiempo real."*
   - Mostrá la **Matriz Kasavana-Smith**:
     - *Estrellas:* Platos que más venden y más ganancia dejan.
     - *Caballos de Batalla:* Platos populares que tienen costo alto.
   - Mostrá la **Alerta de Food Cost Crítico (> 35%)**:
     - *"Fijate este plato en rojo: el sistema te avisa: 'Cuidado, el queso aumentó y ahora el costo de este plato es del 38%. Para ganar lo que corresponde tenés que cobrarlo $X'."*

---

### PASO 4: Compras Inteligentes y Multi-Sucursal (2 a 3 minutos)
1. **Andá a la Pestaña 5 (Compras Sugeridas):**
   - *"La mayoría de los encargados piden mercadería a ojo y se clavan con plata parada."*
   - Explicá el cálculo:
     > *"ARBO mira el stock actual, le suma lo que ya viene en camino en el camión, y te calcula la compra redondeando según cómo te vende el proveedor: si necesitás 17 kg, te sugiere 4 bolsas de 5 kg (20 kg), nunca una fracción imposible."*

---

### PASO 5: La Tienda Online al 0% de Comisión (2 minutos)
1. **Andá a la Pestaña 6 (Menú Web):**
   - *"Este es el menú propio del restaurante. El cliente pide desde el celular para take-away o delivery."*
   - *"¿La gran diferencia? **Cero por ciento de comisión**. Si vendés $3.000.000 de delivery al mes, te ahorrás casi $1.000.000 de comisiones de PedidosYa, y los clientes quedan guardados en tu base propia."*

---

### PASO 6: La Resiliencia Técnica (2 minutos)
- **Qué decir:**
  > *"Todo esto está construido para la Patagonia real: si se corta internet un sábado a la noche, el sistema no se cuelga. Sigue cobrando, sigue mandando platos a cocina y guarda todo en una cola local protegida. Apenas vuelve la red, se sincroniza todo solo sin duplicar ventas."*

---

## 4. QUÉ MOSTRAR Y QUÉ NO MOSTRAR EN PANTALLA

### SÍ MOSTRAR:
- El POS cobrando rápido y limpio.
- La pantalla KDS cambiando de color en cocina.
- La matriz de ingeniería de menú con platos clasificados.
- La tienda online limpia en el celular.
- El panel de fidelización ARBO Club.

### NO MOSTRAR:
- **NO abras código fuente ni el repositorio de GitHub:** A Fede no le interesa ver archivos JavaScript ni terminales de PowerShell; le interesa ver cómo funciona el negocio.
- **NO abras la consola de desarrollo del navegador:** Puede generar preguntas técnicas innecesarias que distraigan la atención.
- **NO intentes conectar una impresora física en la llamada:** Si no tenés la impresora enchufada y configurada en el momento, no improvises. Explicá que la arquitectura ESC/POS está lista en software.
- **NO prometas fechas fiscales de AFIP en vivo:** Explicá con honestidad que la capa impositiva está lista y solo espera que el cliente suba su certificado fiscal.

---

## 5. CUÁNDO ENTRAR EN DETALLES TÉCNICOS Y CUÁNDO VOLVER AL NEGOCIO

- **Si Fede pregunta algo comercial:** *"¿Cuánto podemos cobrar por esto?"* o *"¿A quién le sirve?"*
  $\rightarrow$ **Respondé con negocio:** *"Le sirve a cualquier café de especialidad, pizzería o restaurante que facture más de 100 cubiertos al día y quiera dejar de regalar plata en comisiones y mermas."*
- **Si Fede pregunta algo técnico:** *"¿Y qué pasa con la base de datos?"* o *"¿Cómo hacen para que no se pisen los datos?"*
  $\rightarrow$ **Demostrá solvencia técnica concisa:** *"Usamos PostgreSQL con Supabase, funciones atómicas ACID para que una venta sea todo o nada, y Row Level Security para que ningún local vea la plata de otro."*
- **Inmediatamente después, volvé al negocio:** *"En criollo: tus datos están más seguros que en un banco y el sistema no se corrompe nunca."*

---

## 6. LAS 5 PREGUNTAS CLAVE QUE SEGURO VAN A APARECER

1. **"¿Por qué no usamos Fudo y listo?"**
   - *Respuesta:* Fudo es una caja tradicional. No tiene delivery propio con 0% de comisión, no tiene club de puntos gamificado, y para saber tus márgenes tenés que hacer magia en Excel. ARBO está pensado para maximizar la rentabilidad del dueño.
2. **"¿Está terminado o es un prototipo?"**
   - *Respuesta:* Está terminado y en producción. Tiene 10 fases de ingeniería completas, 383 pruebas automáticas pasando y podés entrar a usarlo ahora mismo desde tu teléfono en `arbo-alpha.vercel.app`.
3. **"¿Qué falta para ponerlo en un local mañana?"**
   - *Respuesta:* Dos validaciones de campo: conectar físicamente la impresora térmica de comandas por USB/red en el mostrador para calibrar el corte de papel, y subir el certificado digital de AFIP si el dueño quiere emitir facturas con CAE en vivo.
4. **"¿Qué pasa si se corta la luz o internet?"**
   - *Respuesta:* Opera offline-first con PWA e IndexedDB. En celulares o tablets a batería sigue cobrando y emitiendo comandas. Al volver la luz y la red, sube todo solo sin duplicar un solo peso.
5. **"¿Tiene IA?"**
   - *Respuesta:* Tiene inteligencia analítica matemática real (Food Cost dinámico, matriz Kasavana-Smith y compras sugeridas). No usamos chatbots que adivinen números; en gastronomía necesitás precisión contable exacta.

---

## 7. FRASE DE CIERRE PARA IMPACTAR

> *"Fede, la mayoría de los sistemas gastronómicos te ayudan a registrar lo que pasó ayer. ARBO OS está diseñado para que ganes más plata mañana."*
