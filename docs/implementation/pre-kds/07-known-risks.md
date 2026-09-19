# ARBO OS — PRE-KDS TECHNICAL CHECKPOINT: DEUDA TÉCNICA Y RIESGOS

---

## 1. CLASIFICACIÓN DE HALLAZGOS Y RIESGOS

| Nivel | Hallazgo / Riesgo | Impacto | Decisión Arquitectónica |
| :--- | :--- | :---: | :--- |
| **P0 (Bloquea KDS)** | *Ninguno detectado.* | — | Las bases de catálogo, inventario por movimientos, ventas y RLS son estables y consistentes. |
| **P1 (Riesgo Importante)** | **Momento del Descuento de Stock (Salón vs Mostrador):** `execute_sale_checkout` descuenta stock al cobrar. En salón, el consumo físico ocurre antes de cobrar (al preparar). | Medio | Para KDS (Fase 4), documentar formalmente si el stock se descuenta al enviar la comanda a cocina o al cobrar la venta en caja. Ambas opciones son viables en el append-only ledger. |
| **P2 (Mejora Posterior)** | **Subunidades de Volumen Adicionales:** El conversor actual cubre `kg`, `g`, `l`, `ml`, `u`. No cubre `cl` o `oz` (poco frecuentes en el mercado local argentino, pero útiles para coctelería fina). | Bajo | Extensible en `unitConversion.js` cuando se requiera sin alterar el esquema relacional. |
| **INFO** | **Soporte de Medios de Pago Adicionales:** Tabla `payments` actualmente restringida a `'CASH'`. | Nulo | Añadir nuevos métodos en el enum (`CARD`, `MERCADO_PAGO`) se realizará en la fase de cobros avanzados. |

---

## 2. EVALUACIÓN DE REGRESIONES Y TESTS READ-ONLY

1. **Suite Fase 1 (RLS Isolation):** 5/5 PASADOS (100%).
2. **Suite Fase 2 (Catálogo, Recetas, PPP, Stock):** 20/20 PASADOS (100%).
3. **Suite Fase 3 (Ventas, Caja, Rollback, Transacción ACID):** 38/38 PASADOS (100%).
4. **Build de Producción (`vite build`):** Exitoso en 525ms, código de salida 0. Cero errores de sintaxis o empaquetado.
