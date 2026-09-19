# 01 — ARBO OS PRODUCT THESIS & DEFINITION

---

## 1. ¿QUÉ ES ARBO OS?

ARBO OS **no** es un "software genérico de gestión gastronómica", ni un simple punto de venta (POS), ni una planilla contable digitalizada. 

ARBO OS es un **Sistema Operativo Gastronómico Transaccional de Bucle Cerrado** diseñado para unificar en tiempo real la operación de piso/mostrador, la producción de cocina, el control de inventario con costeo unitario y la retención directa de clientes, erradicando los silos de información y las comisiones extractivas de intermediarios.

### 1.1. Qué problema resuelve concretamente
- **El abismo operativo entre el pedido y el costo:** En los sistemas tradicionales (como Fudo y POS heredados), cobrar una mesa no deduce el stock con precisión de recetas ni calcula el margen neto en tiempo real (`[FACT]`). El gastronómico descubre sus pérdidas semanas después al hacer inventario manual.
- **La fragmentación de herramientas:** Los locales deben contratar un POS básico, un servicio de pedidos online externo con comisiones abusivas (del 1.9% al 15%), un bot de reservas pago, un sistema de fidelización desconectado y planillas Excel para recetas.
- **La despersonalización y pérdida del comensal:** El negocio atiende a cientos de clientes diarios pero no sabe quiénes son, qué consumen con frecuencia, cuándo dejaron de venir ni cómo reactivarlos sin pagar publicidad masiva.

### 1.2. Para quién es
Para operadores gastronómicos independientes, locales de especialidad (cafeterías, hamburgueserías, pizzerías, cervecerías) y pequeños grupos multi-sucursal que exigen velocidad operativa en mostrador/mesas, precisión milimétrica en el costo de sus recetas y control directo sobre su cartera de comensales sin intermediarios.

### 1.3. En qué contexto operativo
En entornos gastronómicos de alta rotación y estrés operativo diario, donde:
- El cajero y el mozo no pueden esperar pantallas lentas o transiciones bloqueantes.
- La cocina necesita despachar comandas claras sin desorden ni platos duplicados.
- El encargado necesita cuadrar la caja sin pérdidas de stock ni discrepancias de efectivo.
- El dueño necesita conocer el Food Cost real y la rentabilidad diaria desde cualquier dispositivo.

### 1.4. Cuál es su núcleo (Core)
El núcleo de ARBO OS es su **Motor Transaccional Unificado**: una comanda tomada en cualquier canal (Mostrador, Salón o Tienda Pública Web) impacta de forma atómica y simultánea en la cola de cocina (KDS), el arqueo de caja, la descarga de materias primas según ficha técnica y el perfil de consumo y fidelización del comensal.

### 1.5. Qué lo diferencia conceptualmente
- **Cierre del ciclo operativo:** La fidelización y el costeo no son módulos accesorios añadidos; son consecuencias directas y automáticas de cada venta.
- **Soberanía digital del restaurante:** Tienda online, menú QR y reservas nativas a coste cero por transacción, con experiencia visual premium de marca.
- **Precisión técnica de recetas:** Costeo dinámico por unidad de compra, factor de empaque y merma con recálculo automático de márgenes (`[FACT: src/services/recipeCostService.js]`).

### 1.6. Qué NO pretende resolver
- **NO es un ERP contable integral ni liquidador de sueldos:** No busca reemplazar a SAP, Tango o sistemas de recursos humanos complejos.
- **NO es un marketplace de delivery:** No compite con PedidosYa ni Rappi para generar demanda externa; gestiona y potencia el canal de venta directa del restaurante.
- **NO es un software para retail o farmacias:** Su modelo de datos, lógica de comandas y recetas están estrictamente calibrados para alimentos y bebidas.

---

## 2. ARBO OS PRODUCT THESIS

> **"ARBO OS es el sistema operativo que conecta cada comanda de tu salón, mostrador o tienda online con tu cocina, tu caja, tu inventario y la fidelización de tus clientes en un solo flujo continuo y en tiempo real. Le da a tu equipo la velocidad para despachar sin errores y al dueño la claridad exacta de su rentabilidad por plato y la lealtad de sus comensales sin pagar comisiones por vender."**

---

## 3. CÓMO LO ENTIENDE CADA ROL OPERATIVO

### El Dueño de Restaurante
> *"Sé exactamente cuánto me cuesta cada plato hoy, cuánto gano en cada turno y quiénes son mis clientes más fieles, todo en un sistema propio sin pagar comisiones mensuales por cada reserva o pedido online."*

### El Encargado / Gerente
> *"Tengo el control total de las compras, el stock se descuenta solo al vender y la caja me cuadra al centavo al cierre de turno sin planillas auxiliares ni sorpresas."*

### El Cajero / Mozo
> *"Cobro y adiciono en segundos desde una interfaz limpia y moderna que no se cuelga, puedo aplicar puntos del club al instante y sé que la comanda ya llegó perfecta a la cocina."*

### El Cocinero / Jefe de Cocina
> *"Las comandas entran ordenadas por estación y tiempo en la pantalla de cocina, con modificadores claros y sin tickets de papel perdidos ni pedidos duplicados."*
