# ARBO OS — PRE-PHASE 7 CHECKPOINT
## 11. TRANSACCIONALIDAD & DESACOPLE FISCAL
## ¿AFIP DEBE BLOQUEAR LA TRANSACCIÓN DE VENTA?

---

## 1. ANÁLISIS DE LA FRONTERA ACID

Una decisión crítica en la arquitectura gastronómica es:
> **"Si los servidores de AFIP tardan 10 segundos o devuelven error 500, ¿la venta debe abortar y el comensal debe esperar sin poder pagar?"**

### Respuesta Arquitectónica de ARBO OS:
**NO.** La facturación fiscal se desacopla temporalmente de la venta operativa.

---

## 2. EL PROTOCOLO DE DOS FASES

```mermaid
sequenceDiagram
    autonumber
    actor Mozo as Cajero / Mozo
    participant POS as Punto de Venta
    participant Core as ARBO OS Core (ACID)
    participant Fiscal as Adaptador AFIP WSFE
    participant AFIP as Servidores AFIP / ARCA

    Mozo->>POS: Cobrar $3.500 (Efectivo / Tarjeta)
    POS->>Core: executeSaleCheckoutAtomic(...)
    Core->>Core: Venta + Pago + Stock + Caja + KDS + Puntos
    Core-->>POS: Venta Exitosa (sale_id)
    Note over POS,Fiscal: INTENTO FISCAL SINCRÓNICO (Timeout: 3.5s)
    POS->>Fiscal: emitirComprobante(sale_id)
    Fiscal->>AFIP: FECAESolicitar()
    alt AFIP responde OK (< 3.5s)
        AFIP-->>Fiscal: CAE Aprobado + QR
        Fiscal-->>POS: Factura Fiscal Oficial Emitida
    else AFIP Timeout o Error 500
        Fiscal-->>POS: Contingencia: "COMPROBANTE EN PROCESO DE CAE"
        Fiscal->>Core: Encolar en fiscal_contingency_queue
        Note over Core,AFIP: Worker en background reintenta hasta obtener CAE
    end
```

### Ventajas Operativas:
1. El comensal paga y se retira en menos de 3 segundos sin demoras.
2. El salón nunca se congela por saturación de los servidores del Estado.
3. El restaurante cumple estrictamente con la obtención posterior del CAE según los plazos legales de contingencia fiscal de AFIP.
