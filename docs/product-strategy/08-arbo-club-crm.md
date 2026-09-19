# 08 — ARBO CLUB Y CRM: ARQUITECTURA TRANSVERSAL DE RETENCIÓN

---

## 1. CLASIFICACIÓN ESTRATÉGICA DE ARBO CLUB

### El Dilema de Clasificación
Para definir el rol de ARBO Club en el producto, se evaluaron cuatro alternativas estratégicas:
- **Opción A: Feature Secundaria.** (Tratarlo como un simple descuento o pantalla adicional de cupones).
- **Opción B: Pilar Aislado de Producto.** (Un módulo independiente que se vende por separado).
- **Opción C: Sistema Transversal de Producto.** (Una capa conectada directamente con POS, Salón, Tienda Online, CRM y Caja).
- **Opción D: Demasiado Temprano.** (Descartarlo y postergarlo indefinidamente).

### Veredicto Basado en Evidencia: OPCIÓN C — SISTEMA TRANSVERSAL
> **"ARBO Club debe operar como un SISTEMA TRANSVERSAL DE PRODUCTO. No es una feature accesoria ni un producto separado: es el pegamento de datos que convierte una transacción aislada en una relación duradera con el comensal."**

### Justificación Basada en Evidencia
1. **Evidencia en Código:** ARBO OS ya cuenta con un servicio de puntos inmutable (`src/services/loyaltyPointsService.js`) con cálculo determinístico (`earned = floor(totalSpent * pointsRatio)`), balance auditable y niveles/tiers (`[FACT]`).
2. **Defecto de Fudo:** Fudo trata a los comensales como una libreta de contactos muerta; no tiene ningún incentivo nativo de retorno (`[FACT: docs/research/fudo-vs-arbo/05-customers-crm-loyalty-marketing.md]`).
3. **Punto de Apalancamiento:** Si ARBO Club fuera una feature secundaria aislada, el cajero en el POS no la usaría por fricción de tiempo. Si fuera un producto separado, rompería la experiencia unificada. Al ser transversal, **cada venta en mostrador, mesa o delivery acumula puntos automáticamente en el mismo ledger**, y el saldo acumulado puede descontarse directamente al cobrar.

---

## 2. ANATOMÍA FUNCIONAL DE ARBO CLUB

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ARBO CLUB ENGINE ARTIFACTS                      │
├───────────────────┬────────────────────┬───────────────────────────────┤
│ 1. PUNTOS         │ 2. TIERS / NIVELES │ 3. RECOMPENSAS / CANJES       │
│    Ratio de gasto │    Bronce, Plata,  │    Catálogo de premios        │
│    Ledger append  │    Oro, Black      │    Descuento directo en POS   │
└───────────────────┴────────────────────┴───────────────────────────────┘
```

### 2.1. Ledger de Puntos Inmutable
- Cada movimiento de puntos es un registro append-only: `id`, `customer_id`, `order_id`, `points_delta` (+ para acumulación, - para canje), `reason`, `created_at`.
- Los puntos nunca se editan ni se sobreescriben directamente; el saldo es la suma agregada del ledger (`[FACT: src/services/loyaltyPointsService.js]`).

### 2.2. Niveles / Tiers Dinámicos
- Los tiers se recalculan en función del gasto histórico o puntos acumulados en una ventana móvil (ej. últimos 12 meses).
- Cada tier desbloquea multiplicadores (ej. Nivel Oro suma 1.5x puntos por peso gastado) y beneficios exclusivos (ej. café de cortesía en cada visita).

### 2.3. Canjes e Integración Transaccional en POS (Resolución de BUG-021)
- Al momento de cobrar en el POS, el cajero identifica al cliente (por teléfono o QR).
- Si el cliente tiene recompensas disponibles, el POS muestra un selector modal que aplica un descuento financiero en el ticket y genera el débito correspondiente en el ledger de puntos de forma atómica con el pago.

---

## 3. EL CICLO DE CRM & AUTOMATIZACIÓN

El CRM no es una base de datos estática; es un motor de ciclo continuo basado en eventos:

```
    ┌────────────────────────────────────────────────────────┐
    │                      1. CLIENTE                        │
    │         (Registro en Mesa / Delivery / Mostrador)      │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
    ┌────────────────────────────────────────────────────────┐
    │                   2. COMPORTAMIENTO                    │
    │    (Frecuencia, Platos Favoritos, Ticket Promedio)     │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
    ┌────────────────────────────────────────────────────────┐
    │                      3. SEGMENTO                       │
    │        (Reglas dinámicas AND/OR: VIP, En Riesgo)       │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
    ┌────────────────────────────────────────────────────────┐
    │                   4. AUTOMATIZACIÓN                    │
    │        (Triggers: Cumpleaños, 30 días sin venir)       │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
    ┌────────────────────────────────────────────────────────┐
    │                      5. ACCIÓN                         │
    │     (Disparo de Mensaje WhatsApp / Cupón de Puntos)    │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
    ┌────────────────────────────────────────────────────────┐
    │                     6. RESULTADO                       │
    │            (Retorno del Comensal al Local)             │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
    ┌────────────────────────────────────────────────────────┐
    │                    7. NUEVO DATO                       │
    │       (Ticket cerrado, Puntos redimidos, Ciclo++)      │
    └────────────────────────────────────────────────────────┘
```

### 3.1. Motor de Segmentación Booleana
- **Capacidad probada:** `src/services/segmentService.js` evalúa reglas complejas combinando condiciones con operadores `AND` y `OR` (`[FACT]`).
- **Segmentos Clave:**
  - *Comensales VIP:* Gasto acumulado > $50.000 y > 4 visitas al mes.
  - *En Riesgo de Abandono:* Clientes recurrentes con > 45 días sin visitas.
  - *Nuevos Clientes:* Registrados en los últimos 7 días con 1 sola orden.
  - *Cumpleañeros del Mes:* Filtro por fecha de nacimiento.

### 3.2. Requisitos de Backend y Arquitectura de Eventos
Para que este ciclo sea operativo y no se quede en un prototipo visual de frontend, se requieren los siguientes componentes arquitectónicos en backend:
1. **Event Bus / Webhooks Internos:** La emisión del evento `ORDER_SETTLED` debe disparar asíncronamente el cálculo del ledger y la actualización del perfil del comensal.
2. **Cron Scheduler / Background Workers:** Un proceso diario que ejecute la evaluación de segmentos (ej. detectar clientes en riesgo o aniversarios a las 09:00 AM).
3. **Outbound Messaging Gateway:** Integración con proveedores de mensajería (ej. WhatsApp Cloud API oficial de Meta o servicio de Email transaccional) para despachar las comunicaciones automatizadas.

---

## 4. ESTADO DE IMPLEMENTACIÓN Y TRANSICIÓN

| Componente | Estado Actual en ARBO | Destino Arquitectónico |
| :--- | :--- | :--- |
| **Cálculo de Puntos** | Listo en memoria (`loyaltyPointsService.js`) | Tabla `loyalty_ledger` con RLS en BD |
| **Definición de Tiers** | Configuración hardcodeada en frontend | Tabla `loyalty_tiers` configurable |
| **Canje en POS** | Desconectado (`BUG-021`) | Modal de redención integrado en Checkout POS |
| **Evaluador de Segmentos** | Funcional en cliente (`segmentService.js`) | Vista materializada / Edge Function en servidor |
| **Disparo de Mensajería** | UI de campañas simulada | Worker en cola de tareas con WhatsApp Cloud API |
