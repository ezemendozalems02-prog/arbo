# 15 — CAPA FISCAL ARGENTINA DESACOPLADA (AFIP / ARCA)

---

## 1. PRINCIPIO DE DESACOPLAMIENTO FISCAL

> **"La facturación electrónica obligatoria de Argentina (AFIP / ARCA) no debe estar hardcodeada dentro de los botones de la interfaz del POS ni acoplada directamente al modelo de ventas. El POS solo sabe que debe 'emitir un comprobante'; un adaptador fiscal traduce esa intención en los llamados específicos del organismo regulador."**

---

## 2. ARQUITECTURA DE PUERTOS Y ADAPTADORES (HEXAGONAL)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        POS & CHECKOUT CONTROLLER                       │
│             Invoca: FiscalPort.authorizeInvoice(payload)               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        INTERFAZ: FiscalProvider                        │
│  + authorizeInvoice(data: FiscalRequest): Promise<FiscalResponse>      │
│  + cancelInvoice(data: CancelRequest): Promise<FiscalResponse>         │
│  + getProviderStatus(): Promise<HealthStatus>                          │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
                    ▼                               ▼
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│     ADAPTADOR AFIP / ARCA (WSFE)     │ │     MOCK FISCAL ADAPTER       │
│  - Autenticación WSAA (Ticket Wsaa)  │ │  - Generación de CAE simulado │
│  - Web Service WSFEv1 (SOAP/XML)     │ │  - Para tests unitarios y     │
│  - Obtención de CAE oficial y QR     │ │    desarrollo local           │
└──────────────────────────────────────┘ └───────────────────────────────┘
```

---

## 3. COMPROBANTES SOPORTADOS Y MAPEO TRIBUTARIO

| Tipo de Comprobante | Código AFIP | Destinatario | Requisitos Obligatorios |
| :--- | :--- | :--- | :--- |
| **Factura A** | `01` | Responsable Inscripto | CUIT validado, Razón Social, Discriminación de IVA (21%, 10.5%). |
| **Factura B** | `06` | Consumidor Final | Si el monto supera el umbral legal AFIP, exige DNI/Nombre del comensal. IVA incluido. |
| **Factura C** | `11` | Monotributo | Sin discriminación de IVA. Apta para pequeños locales monotributistas. |
| **Nota de Crédito A/B/C** | `03 / 08 / 13` | Anulaciones | Vinculada al número de factura y CAE original que anula. |
| **Comprobante Interno X** | `N/A` | Control interno | Documento no fiscal para auditoría operativa y comanda de pago. |

---

## 4. PROTOCOLO DE CONTINGENCIA ANTE CAÍDAS DE AFIP

Los servidores de AFIP sufren caídas frecuentes e intermitencias los fines de semana. Un restaurante no puede detener la salida de mesas esperando la respuesta del servidor fiscal:

```
┌────────────────────────────────────────────────────────────────────────┐
│                 PROTOCOLO DE RESILIENCIA FISCAL                        │
├────────────────────────────────────────────────────────────────────────┤
│ 1. INTENTO SINCRÓNICO: Timeout estricto de 3.5 segundos.               │
│ 2. SI AFIP RESPONDE:                                                   │
│    - Guarda CAE, fecha de vencimiento y genera QR oficial.             │
│    - Imprime ticket fiscal final.                                      │
├────────────────────────────────────────────────────────────────────────┤
│ 3. SI AFIP EXPIRA (TIMEOUT O ERROR 500):                               │
│    - La venta se completa exitosamente en el local.                    │
│    - Se emite comprobante transitorio: "COMPROBANTE EN PROCESO DE CAE"│
│    - Se encola la solicitud en la tabla 'fiscal_contingency_queue'.    │
│ 4. WORKER DE REINTENTO (Background cada 60 segundos):                  │
│    - Reintenta la obtención del CAE una vez restablecido el servicio.  │
│    - Envía la factura digitalizada al comensal por email / WhatsApp.   │
└────────────────────────────────────────────────────────────────────────┘
```
