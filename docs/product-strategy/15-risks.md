# 15 — MATRIZ INTEGRAL DE RIESGOS DE PRODUCTO

---

## 1. METODOLOGÍA DE EVALUACIÓN DE RIESGOS

Cada riesgo identificado en esta matriz deriva de la evidencia recopilada durante las auditorías de ARBO OS y Fudo. Los riesgos se clasifican en 8 dominios críticos, evaluando su probabilidad, impacto operativo y mitigación concreta.

---

## 2. MATRIZ DE RIESGOS

### 2.1. TECHNICAL RISKS (Riesgos Técnicos)
- **R1: Caída de Conectividad a Internet en Pleno Servicio**
  - *Descripción:* Pérdida de acceso a la base de datos cloud durante horas pico de salón o mostrador.
  - *Evidencia:* Las arquitecturas puramente cloud (como Fudo) se vuelven inoperables si se corta la fibra óptica local (`[FACT]`).
  - *Impacto:* Crítico (bloquea la toma de pedidos y cobros).
  - *Dependencia:* Nivel 2 (Ejecución Transaccional).
  - *Mitigación:* Arquitectura con Service Workers y cache local transaccional (PWA Offline First) para encolar ventas y sincronizar con backend al recuperar conexión.

- **R2: Latencia o Caída en WebSockets de Cocina (KDS)**
  - *Descripción:* Los pedidos no llegan a la pantalla de cocina en tiempo real debido a desconexión de sockets.
  - *Evidencia:* Pruebas de KDS en ARBO mostraron orfandad de tickets al perder sincronía (`[FACT: BUG-004]`).
  - *Impacto:* Alto (retrasos de 30+ minutos en despacho de comida).
  - *Mitigación:* Mecanismo de heartbeat con reconexión automática y polling de respaldo cada 5 segundos si el socket cae, junto con alerta visual ("Modo Desconectado").

---

### 2.2. OPERATIONAL RISKS (Riesgos Operativos)
- **R3: Resistencia al Cambio de los Mozos y Cajeros**
  - *Descripción:* El personal acostumbrado a interfaces antiguas o a papel rechaza el sistema si percibe fricción o pasos innecesarios.
  - *Evidencia:* La auditoría de Fudo demostró que interfaces con demasiados modales ralentizan la rotación (`[FACT: 08-ux-responsive-accessibility.md]`).
  - *Impacto:* Alto (errores de carga, abandono del software).
  - *Mitigación:* Modos de carga rápida con teclado numérico ergonómico, atajos de teclado y botones grandes táctiles tipo "grilla de autoservicio".

- **R4: Descuadre entre Stock Teórico y Real por Descarte No Registrado**
  - *Descripción:* Cocina quema un plato o tira insumos vencidos sin registrar la merma en el sistema, falseando el Food Cost.
  - *Evidencia:* Ausencia actual de pantalla ágil para descarte rápido en cocina (`[FACT: 26-product-gaps.md]`).
  - *Impacto:* Medio/Alto (inventario desfasado con la realidad física).
  - *Mitigación:* Botón de "Registro Rápido de Merma/Rotura" accesible desde el KDS o terminal de cocina con un solo toque y motivo predefinido.

---

### 2.3. FISCAL RISKS (Riesgos Fiscales)
- **R5: Rechazo o Timeout de los Servidores de AFIP / ARCA**
  - *Descripción:* La API de AFIP se cae durante un sábado a la noche, impidiendo obtener el CAE para emitir la factura electrónica obligatoria.
  - *Evidencia:* Frecuentes intermitencias documentadas en los servicios web de AFIP en Argentina (`[DOCUMENTED]`).
  - *Impacto:* Crítico (imposibilidad legal de entregar factura al comensal).
  - *Mitigación:* Sistema de contingencia fiscal: emisión de comprobante de venta transitorio offline con reintento automático y obtención asíncrona de CAE mediante cola de tareas al restablecerse el servicio.

---

### 2.4. SECURITY & PRIVACY RISKS (Riesgos de Seguridad)
- **R6: Exposición Pública del Panel de Administración e Inyección de Datos**
  - *Descripción:* Acceso sin login a `/admin` o fuga de datos sensibles de comensales en bundles JavaScript.
  - *Evidencia:* ARBO expone actualmente la ruta `/admin` de forma pública en frontend (`[FACT: docs/research/arbo-os/FINAL-ARBO-OS-FORENSIC-AUDIT.md]`).
  - *Impacto:* Crítico (violación de privacidad de clientes, robo o alteración maliciosa de caja).
  - *Mitigación:* Middleware de autenticación estricto en servidor, políticas RLS en base de datos y eliminación de toda información PII del bundle público del cliente.

---

### 2.5. DATA INTEGRITY RISKS (Riesgos de Integridad de Datos)
- **R7: Ventas Concurrentes Generando Inventario Negativo No Controlado**
  - *Descripción:* Dos mozos venden la última porción de un corte de carne simultáneamente desde distintos dispositivos.
  - *Evidencia:* En el código actual no existen locks ni transacciones atómicas (`[FACT: InventoryContext.jsx]`).
  - *Impacto:* Medio (plato vendido que no se puede preparar en cocina).
  - *Mitigación:* Transacciones SQL atómicas en backend con verificación de stock disponible antes de confirmar la comanda (`SELECT ... FOR UPDATE`).

---

### 2.6. ADOPTION & CHURN RISKS (Riesgos de Adopción y Abandono)
- **R8: El Restaurante No Logra Cargar Fichas Técnicas Complejas**
  - *Descripción:* El gastronómico promedio no tiene tiempo de desglosar cada gramo de sal o condimento de sus 80 platos y abandona el módulo de recetas.
  - *Evidencia:* Las fichas técnicas exhaustivas son la principal causa de fricción en la incorporación de clientes gastronómicos (`[INFERENCE]`).
  - *Impacto:* Alto (subutilización del software).
  - *Mitigación:* Modo "Recetas Progresivas": permitir costeo básico solo con los 3 o 4 ingredientes principales de mayor valor (proteína, queso, pan) sin exigir listar insumos marginales desde el Día 1.

---

### 2.7. SCOPE & EXECUTION RISKS (Riesgos de Alcance)
- **R9: Dispersión en Automatizaciones Sofisticadas antes de Consolidar el POS**
  - *Descripción:* Invertir semanas en bots de WhatsApp o integraciones complejas dejando bugs pendientes en la caja y cocina.
  - *Evidencia:* La auditoría previa detectó 21 bugs funcionales mientras existían interfaces de fidelización muy elaboradas (`[FACT]`).
  - *Impacto:* Crítico (producto inoperable en la práctica).
  - *Mitigación:* Disciplina férrea de Anti-Scope (Capítulo 13) y cumplimiento del orden de dependencias (Capítulo 14).
