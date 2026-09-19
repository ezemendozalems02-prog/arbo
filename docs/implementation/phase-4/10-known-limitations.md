# ARBO OS — FASE 4: LIMITACIONES CONOCIDAS Y ALCANCE POSTERGADO

---

## 1. ALCANCES ESTRICTAMENTE POSTERGADOS

1. **Hardware de Impresoras Físicas (ESC/POS):**
   - No se emitieron bytes crudos ni se integraron agentes de impresión térmicos USB/Ethernet; la producción se canaliza íntegramente a través de la pantalla digital KDS.
2. **Audio Complejo:**
   - La alerta de comanda nueva se mantiene visual y opcional para no infringir políticas de autoplay de navegadores móviles ni saturar la acústica de la cocina.
3. **Métricas SLA Avanzadas & Predicción de Demoras:**
   - Se calculan tiempos reales transcurridos (`elapsed time`) y umbrales de demora (>10 min), pero no modelos de machine learning ni predicción de tiempos de entrega.
4. **Offline-First Bidireccional en Cocina:**
   - KDS requiere conexión de red local a la base de datos PostgreSQL, asistida por fallback de polling HTTP a 5s.
