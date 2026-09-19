# 16 — PRODUCT DECISIONS REQUIRED (DECISIONES ABIERTAS DE NEGOCIO)

---

## 1. PRINCIPIO METODOLÓGICO

> **"Un análisis riguroso no toma decisiones comerciales en nombre de los fundadores cuando la evidencia empírica es insuficiente. Este documento identifica las decisiones estratégicas abiertas de negocio y producto que requieren definición humana y directiva antes o durante la fase de arquitectura."**

---

## 2. MATRIZ DE DECISIONES ABIERTAS

| ID | Área | Decisión Clave | Opciones Disponibles | Impacto Técnico / Negocio |
| :--- | :--- | :--- | :--- | :--- |
| **DEC-01** | **Estrategia Fiscal** | ¿En qué momento es obligatoria la facturación electrónica AFIP/ARCA? | **A.** Día 1 en MVP para cualquier usuario.<br>**B.** Solo en V1; el piloto MVP opera con ticket interno X. | La opción A requiere implementar certificados digitales y Web Services AFIP antes de abrir el primer piloto. |
| **DEC-02** | **Modelo de Precios (SaaS Pricing)** | ¿Cuál será la estructura de tarifas para competir contra Fudo? | **A.** Tarifa plana mensual sin límites (ej. $X/mes).<br>**B.** Tarifa por sucursal + add-on de volumen.<br>**C.** Freemium básico con cobro por ARBO Club/CRM. | Define el posicionamiento comercial y la propuesta de valor frente al 1.9% de Fudo. |
| **DEC-03** | **Hardware de Impresión Térmica** | ¿Cómo se gestionará la impresión en comanderas físicas? | **A.** Impresión nativa del navegador (Ctrl+P).<br>**B.** Agente local ligero en background (Desktop Bridge).<br>**C.** Conexión directa WebUSB / Red ESC/POS. | La opción B o C elimina el diálogo emergente del navegador para impresión inmediata con un clic. |
| **DEC-04** | **Logística de Delivery Propio** | ¿Hasta dónde llega el módulo de Delivery en la Tienda Online? | **A.** Solo gestión de cadetes propios del local.<br>**B.** Integración con flotas on-demand (ej. Uber Direct API). | La opción B añade complejidad de webhook y tarifas por viaje pero ahorra cadetes al restaurante. |
| **DEC-05** | **Canal de Mensajería WhatsApp** | ¿Qué proveedor se utilizará para el CRM y notificaciones? | **A.** WhatsApp Cloud API Oficial de Meta (pago por conversación).<br>**B.** Proveedor no oficial por emulación Web (ej. Baileys/Wppconnect). | La opción A garantiza estabilidad y evita baneos de números; la opción B es económica pero frágil. |
| **DEC-06** | **Nivel de Entrada del ICP** | ¿En qué formato gastronómico se concentrará el primer local piloto? | **A.** Cafetería de especialidad (alta rotación mostrador, recetas simples).<br>**B.** Restaurante con mesas y salón (alta rotación mozos, KDS). | Determina si se pule primero la experiencia de Mostrador o la de Salón/Mesas. |

---

## 3. HOJA DE RUTA PARA RESOLVER ESTAS DECISIONES

1. **DEC-01 y DEC-06:** Deben definirse **antes de iniciar el desarrollo del MVP** para acotar el alcance de la primera versión operativa de prueba.
2. **DEC-02:** Debe definirse **antes del lanzamiento comercial de V1**.
3. **DEC-03, DEC-04 y DEC-05:** Pueden evaluarse en paralelo durante el diseño de la arquitectura técnica.
