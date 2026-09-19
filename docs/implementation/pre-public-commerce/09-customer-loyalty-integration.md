# ARBO OS — PRE-PUBLIC COMMERCE CHECKPOINT
## 09. INTEGRACIÓN CON CUSTOMER, CRM & ARBO CLUB DESDE LA WEB PÚBLICA

---

## 1. COMPRA INVITADO vs CLIENTE REGISTRADO (GUEST CHECKOUT)

En el comercio gastronómico de alta conversión, **obligar al usuario a crear usuario y contraseña antes de pedir un café genera un abandono de carrito superior al 60%**.

### Estrategia de Identidad de Baja Fricción:
- **Guest Checkout Obligatorio**: El usuario sólo ingresa su Nombre y Teléfono móvil.
- **Asociación en Backend**:
  - Al ingresar el teléfono, el backend normaliza el número (`+5493410000000`) y busca si ya existe un cliente registrado en la organización con ese número (`UNIQUE(organization_id, phone)`).
  - Si existe: asocia la venta al `customer_id` existente.
  - Si no existe: crea automáticamente un registro `customers` en estado `ACTIVE`.

---

## 2. ARBO CLUB: ACUMULACIÓN DE PUNTOS ONLINE

- Toda venta online confirmada y pagada acumula puntos bajo la regla oficial de Fase 5:
  $$\text{Puntos Ganados} = \left\lfloor \frac{\text{Total}}{100} \right\rfloor$$
- Se inserta un movimiento `EARN` en el `loyalty_transactions` ledger con referencia al `sale_id`.
- La pantalla de confirmación muestra:
  *"¡Sumaste X puntos en ARBO Club con tu pedido!"*.

---

## 3. PROTECCIÓN DE PRIVACIDAD EN EL CANJE ONLINE

### Riesgo de Suplantación:
Si un usuario anónimo ingresa en la web el teléfono de otra persona, **NUNCA** se le debe permitir canjear los puntos de esa persona sin verificar su identidad.

### Reglas para Fase 6:
1. **Acumulación**: Es segura con sólo el teléfono (sumar puntos beneficia al titular).
2. **Consulta de Saldo & Canje de Recompensas (`REDEEM`)**:
   - Requiere un factor de autenticación (ej. código OTP temporal por SMS/WhatsApp o token de sesión autenticada).
   - Un cliente anónimo en la web jamás podrá ver el historial completo de compras o saldo de puntos de otro número de teléfono.
