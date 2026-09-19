# 13 — WHAT ARBO WILL NOT BUILD YET (ANTI-SCOPE & DISCIPLINA)

---

## 1. PRINCIPIO FUNDAMENTAL DEL ANTI-SCOPE

> **"La tentación más destructiva para un producto gastronómico en etapa de maduración es el *feature creep*: intentar complacer cada pedido exótico de un usuario antes de garantizar que el pedido, el cobro y el stock funcionen a la perfección. La excelencia de ARBO OS se define con la misma firmeza por lo que decidimos NO CONSTRUIR hoy que por lo que construimos."**

Todas las funcionalidades listadas a continuación están **explícitamente vetadas** para las fases de MVP y V1. Construirlas en este momento generaría dispersión técnica, degradaría la velocidad del sistema y aumentaría la superficie de errores.

---

## 2. MATRIZ DE FUNCIONALIDADES VETADAS (ANTI-SCOPE)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TABLA DE VETO ESTRATÉGICO                       │
├───────────────────────────────┬────────────────────────────────────────┤
│ FUNCIONALIDAD VETADA          │ MOTIVO ESTRATÉGICO & RIESGO ASOCIADO   │
├───────────────────────────────┼────────────────────────────────────────┤
│ 1. Marketplace Propio         │ Distrae del SaaS B2B y quema capital   │
│ 2. Liquidación de Sueldos ERP │ Complejidad legal ajena al core        │
│ 3. LLMs y Chatbots Invasivos  │ Alucinación de datos y costo por token │
│ 4. Integraciones con 10 Apps  │ Fragilidad de APIs de terceros         │
│ 5. Hardware Propietario       │ Costo logístico y riesgo de inventario │
│ 6. Facturación Multi-País     │ Dilución de foco antes de dominar Arg  │
│ 7. Billetera Virtual (Fintech)│ Exigencias regulatorias bancarias/BCRA │
└───────────────────────────────┴────────────────────────────────────────┘
```

---

## 3. DESGLOSE DETALLADO DEL ANTI-SCOPE

### 3.1. NO construir un Marketplace de Delivery de Consumidor Final
- **La tentación:** Crear un "PedidosYa propio" donde los usuarios busquen restaurantes.
- **Por qué NO:** ARBO es un SaaS para que el restaurante potencie su marca y venta directa. Un marketplace requiere millones de dólares en marketing B2C para atraer tráfico de comensales, desviando a ARBO de su negocio de software.

### 3.2. NO construir un Módulo de Sueldos y RRHH Complejo
- **La tentación:** Calcular cargas sociales, convenios colectivos (UTHGRA), licencias médicas y recibos de sueldo.
- **Por qué NO:** Es un pozo sin fondo de complejidad legal y contable cambiante que pertenece a ERPs tradicionales. ARBO solo registrará turnos y propinas operativas; los sueldos se liquidan externamente.

### 3.3. NO incorporar Chatbots de IA Generativa en el Flujo Operativo Crítico
- **La tentación:** Reemplazar los botones de la comanda con un bot de voz o un chat que intente interpretar pedidos con IA.
- **Por qué NO:** En horas pico de un restaurante con ruido ambiente, un error en la interpretación de un plato o modificador causa platos devueltos y pérdidas inmediatas. La interfaz táctil con botones grandes y categorizados es incomparablemente superior en velocidad y certeza.

### 3.4. NO desarrollar Integraciones Bidireccionales con 10 Agregadores en MVP
- **La tentación:** Sincronizar simultáneamente con Rappi, PedidosYa, UberEats, Didi Food e iFood desde el Día 1.
- **Por qué NO:** Cada agregador cambia sus APIs continuamente, cobra suscripciones de desarrollador y añade una fragilidad constante a la caja del local. ARBO prioriza su propio canal de venta directa y dejará la integración con agregadores para una etapa posterior vía middleware consolidado (ej. Hubster/Deliverect) si la demanda lo exige.

### 3.5. NO Fabricar ni Vender Hardware Propietario
- **La tentación:** Diseñar y vender tablets o terminales POS propietarias con la marca ARBO.
- **Por qué NO:** Convierte una empresa de software de alto margen en una operación logística pesada con garantías de hardware, importaciones y soporte técnico físico. ARBO corre sobre navegadores web modernos en cualquier tablet, PC, Mac o smartphone estándar.

### 3.6. NO Implementar Facturación Fiscal Multi-País Simultánea
- **La tentación:** Desarrollar adaptadores fiscales para Argentina, México, Colombia y Chile al mismo tiempo.
- **Por qué NO:** Cada régimen fiscal (AFIP en Argentina, SAT en México, DIAN en Colombia) es un ecosistema burocrático completo con certificaciones específicas. ARBO debe dominar y validar exhaustivamente el mercado argentino antes de expandir su capa fiscal a otras jurisdicciones.

### 3.7. NO Convertirse en Procesador de Pagos / Billetera Fintech
- **La tentación:** Retener fondos de clientes y emitir cuentas virtuales propias (CVU/CBU).
- **Por qué NO:** Implica regulaciones bancarias estrictas, cumplimiento contra lavado de dinero (AML/KYC) y balance de capital inmenso. ARBO se integra de forma transparente con líderes establecidos como MercadoPago.

---

## 4. CRITERIO DE CONTENCIÓN PARA EL EQUIPO

Si durante el diseño o desarrollo surge una propuesta de feature no contemplada en el Roadmap de V1, la pregunta de descarte debe ser:

> **"¿Un restaurante de nuestro ICP dejará de operar mañana si esta feature no existe?"**

Si la respuesta es "no", la funcionalidad se archiva automáticamente en el backlog de exploración futura.
