# 19 — ESTRATEGIA DE RENDIMIENTO Y OPTIMIZACIÓN TÉCNICA

---

## 1. OBJETIVOS TÉCNICOS DE RENDIMIENTO (SLAs)

Para garantizar que ARBO OS supere ampliamente la experiencia de usuario de competidores lentos como Fudo, se establecen los siguientes objetivos cuantificables:

| Métrica | Objetivo Técnico | Impacto en la Operación |
| :--- | :--- | :--- |
| **Carga Inicial Menú QR (LCP)** | `< 1.2 segundos` en 4G | El comensal ve los platos inmediatamente al escanear. |
| **Transición entre Rutas / Pantallas** | `< 100 milisegundos` | Sensación de aplicación nativa de alta gama. |
| **Respuesta al Clic en POS / Mesa** | `< 50 milisegundos` | Agilidad ergonómica para el cajero y mozo. |
| **Latencia de Comanda a KDS Cocina** | `< 300 milisegundos` | La orden aparece en la pantalla de cocineros al instante. |
| **Latencia p95 de Consultas a BD** | `< 25 milisegundos` | Servidores no saturados en horas pico de alta rotación. |

---

## 2. ESTRATEGIA DE BUNDLE SPLITTING Y DIVISIÓN DE CÓDIGO

Fudo descarga 2.3 MB de JavaScript de golpe, forzando al comensal a esperar (`[FACT: docs/research/fudo-vs-arbo/06-public-delivery-ecommerce.md]`). ARBO OS divide sus artefactos en tres paquetes completamente independientes mediante Vite Code Splitting:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DIVISIÓN DE BUNDLES DE JS                       │
├───────────────────────────────┬────────────────────────────────────────┤
│ 1. BUNDLE PÚBLICO (<300 KB)   │ Solo contiene el menú digital, carrito │
│    (Public Diner Bundle)      │ y formulario de reservas. Cero admin.  │
├───────────────────────────────┼────────────────────────────────────────┤
│ 2. BUNDLE OPERATIVO (~650 KB) │ Contiene POS, Salón, KDS y Caja.       │
│    (Core Operational PWA)     │ Optimizado para velocidad y offline.   │
├───────────────────────────────┼────────────────────────────────────────┤
│ 3. BUNDLE GESTIÓN (Lazy Load) │ Módulos pesados cargados bajo demanda: │
│    (Management & Analytics)   │ Gráficos, Fichas Técnicas y Reportes.  │
└───────────────────────────────┴────────────────────────────────────────┘
```

---

## 3. ESTRATEGIA DE IMÁGENES Y ASSETS

1. **Conversión Automática a WebP / AVIF:** Todas las fotos de platos cargadas por el restaurante se comprimen y redimensionan en el backend en tres resoluciones:
   - Miniatura POS / Carrito: `150x150 px` (~10 KB).
   - Tarjeta de Menú Digital: `450x300 px` (~35 KB).
   - Vista Detalle / Banner: `900x600 px` (~80 KB).
2. **Caché en el Borde (Edge CDN):** Las imágenes y assets estáticos se distribuyen a través de Cloudflare / Vercel Edge con directivas `Cache-Control: public, max-age=31536000, immutable`.

---

## 4. OPTIMIZACIÓN DE BASE DE DATOS Y POOLING DE CONEXIONES

- **Supavisor / PgBouncer en Transaction Mode:** PostgreSQL crea un proceso pesado por cada conexión directa. Para permitir que cientos de terminales de mozos y pantallas de cocina permanezcan conectadas sin agotar la memoria del servidor, se utiliza pooling a nivel de transacción.
- **Consultas con Índices Cubrientes (Covering Indexes):** Para que las consultas más frecuentes (ej. obtener mesas activas de una sucursal) no tengan que leer la tabla completa del disco:
  ```sql
  CREATE INDEX idx_tables_branch_active ON tables(branch_id, status) INCLUDE (table_number, capacity);
  ```
