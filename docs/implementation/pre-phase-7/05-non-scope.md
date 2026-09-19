# ARBO OS — PRE-PHASE 7 CHECKPOINT
## 05. LO QUE NO FORMA PARTE DE FASE 7 (NON-SCOPE)

---

## 1. DELIMITACIÓN ESTRICTA (ANTI-SCOPE CREEP)

Para proteger la estabilidad del núcleo operativo y evitar desvirtuar el proyecto, **QUEDA TERMINANTEMENTE EXCLUIDO DE LA FASE 7**:

1. **Regímenes Fiscales Fuera de Argentina**:
   - NO implementar facturación del SAT (México), DIAN (Colombia), SII (Chile) ni de otras jurisdicciones. ARBO OS debe consolidar el ecosistema impositivo argentino antes de internacionalizarse.
2. **Controladores Fiscales Físicos de Vieja Generación**:
   - NO implementar soporte para impresoras fiscales matriciales/térmicas previas a 2014 (Hasar / Epson generación 1 sin web services). El sistema opera exclusivamente con **Facturación Electrónica en línea (WSFE)** y tickets con código QR.
3. **Escala Multi-Sucursal Avanzada & Depósitos Centrales**:
   - NO implementar remitos de transferencia de stock entre depósitos (`stock_transfers`). Esto corresponde a la **Fase 8**.
4. **Marketing Saliente Masivo o Campañas de Spam**:
   - Las automatizaciones de Fase 7 son exclusivamente transaccionales y de relacionamiento directo de cortesía (bienvenida, saludo de cumpleaños, aviso de insumo crítico). No se admiten envíos masivos no solicitados.
5. **Plataforma Contable General o Liquidación de Sueldos**:
   - ARBO OS es un sistema operativo gastronómico, no un software de contabilidad general para estudios contables.
