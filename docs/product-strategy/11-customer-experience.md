# 11 — EXPERIENCIA PÚBLICA DEL COMENSAL (PUBLIC-FACING LAYER)

---

## 1. DETERMINACIÓN DEL ROL ESTRATÉGICO

Para definir el alcance de la capa pública de cara al comensal (sitio web, menú QR, tienda delivery y reservas), se evaluaron tres posturas de producto:

- **Opción A: Complemento Opcional.** (Un simple link genérico que se entrega al restaurante como extra secundario).
- **Opción B: Módulo Separado / Add-on Pago.** (El modelo de Fudo: cobrar 1.9% extra por venta online y $55.000/mes por reservas).
- **Opción C: Canal Estratégico Nativo de Soberanía Digital.** (Un componente intrínseco del sistema operativo que conecta al comensal directamente con la cocina y el CRM).

### Veredicto Basado en Evidencia: OPCIÓN C — CANAL ESTRATÉGICO NATIVO
> **"La experiencia pública del comensal en ARBO OS no es un accesorio ni un add-on de cobro extra: es un CANAL ESTRATÉGICO NATIVO. Es el punto de captura de datos donde el comensal anónimo se transforma en cliente identificado, miembro de ARBO Club y fuente de pedidos directos sin comisiones."**

---

## 2. POR QUÉ EL ENFOQUE DE FUDO ES UN ANTIPATRÓN

La auditoría forense de Fudo (`docs/research/fudo-vs-arbo/06-public-delivery-ecommerce.md` y `08-ux-responsive-accessibility.md`) reveló múltiples fallas estructurales en su capa pública:
1. **Comisión Extractiva (1.9% + IVA):** Fudo penaliza al restaurante por vender en su propia web (`[FACT: docs/research/fudo/14-fudo-online.md]`).
2. **Bundle Masivo y Lento (2.3 MB JS):** El comensal que escanea un código QR en la mesa debe descargar más de 2 MB de JavaScript (cargando mapas pesados y SDKs de pago aun si solo quiere ver los precios), consumiendo datos móviles y generando lentitud (`[FACT]`).
3. **Mala Experiencia y Barreras de Idioma:** Usa `translate="no"` forzado, rompiendo la traducción automática para turistas extranjeros, y carece de contraste accesible WCAG AA (`[FACT]`).
4. **Muro de Pago para Reservas:** No permite tomar reservas web salvo que el restaurante pague $55.000 ARS/mes por su bot de WhatsApp (`[FACT: 09-fudo-ia.md]`).

---

## 3. LOS COMPONENTES DE LA EXPERIENCIA PÚBLICA DE ARBO OS

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ARBO PUBLIC EXPERIENCE                          │
├───────────────────┬────────────────────┬───────────────────────────────┤
│ 1. MENÚ DIGITAL   │ 2. TIENDA DELIVERY │ 3. RESERVAS ONLINE            │
│    QR ultraliviano│    Directo sin %   │    Integradas a mesas         │
├───────────────────┴────────────────────┴───────────────────────────────┤
│ 4. PORTAL DE FIDELIZACIÓN ARBO CLUB (Puntos, Tiers, Recompensas)       │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1. Menú Digital QR Ultra-Rápido y Accesible
- **Propósito:** Lectura instantánea de la carta en el salón o mostrador.
- **Rendimiento:** Bundle ultraliviano (<300 KB inicial), renderizado progresivo de imágenes en formato WebP con compresión optimizada.
- **Internacionalización y Accesibilidad:** Cumplimiento total de WCAG 2.1 AA (contraste tipográfico adecuado para personas con visión reducida) y compatibilidad nativa con Google Translate en el navegador.

### 3.2. Tienda Online de Pedidos Directos (Takeaway & Delivery)
- **Propósito:** Canal de venta directa que ahorra entre el 15% y el 25% de comisiones de apps externas y el 1.9% de Fudo.
- **Flujo:** Selección de platos con modificadores claros (ej. "Término medio de cocción", "Sin cebolla") -> Checkout ágil con validación de zona de entrega -> Pago digital vía MercadoPago Checkout Pro -> Confirmación e inyección automática en el KDS de cocina.
- **Resolución Crítica:** Resolver BUG-001 para que el pedido no se descarte en memoria y viaje como orden persistida al backend.

### 3.3. Sistema de Reservas Online Nativo
- **Propósito:** Permitir al comensal reservar mesa desde la web o Instagram del local sin intermediarios ni costos mensuales abusivos.
- **Integración:** Cada reserva confirmada bloquea la mesa en el `FloorPlan.jsx` del salón en el horario correspondiente.
- **Resolución Crítica:** Resolver BUG-002 para que el formulario de reservas persista y notifique al encargado.

### 3.4. Portal del Comensal ARBO Club (PWA / Web)
- **Propósito:** Espacio personal donde el comensal consulta su saldo de puntos, nivel de membresía (tier), premios desbloqueados y cupones de cumpleaños.
- **Acceso sin fricción:** Login por magic link o código SMS/WhatsApp sin exigir contraseñas complejas.

---

## 4. IMPACTO EN SEO, PERFORMANCE Y BRANDING

- **SEO Local:** La tienda y menú de ARBO contarán con marcado estructurado Schema.org (`Restaurant`, `Menu`, `MenuItem`, `GeoCoordinates`), permitiendo que los platos aparezcan indexados en Google Search y Google Maps orgánicamente.
- **Marca Propia:** La interfaz pública refleja la identidad visual premium del restaurante (logo, tipografía editorial, paleta de colores), eliminando el aspecto genérico de "plantilla de Fudo".
