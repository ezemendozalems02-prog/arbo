# ARBO OS — PRE-ARBO CLUB CHECKPOINT: MODELO DE CLIENTES E IDENTIDAD

---

## 1. UBICACIÓN Y PERTENENCIA DEL CLIENTE

### ¿Dónde debe vivir el cliente?
El cliente debe pertenecer a la **Organización matriz (`organizations`)**:
- `organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE`.
- Opcionalmente puede registrar una sucursal de preferencia o alta: `registered_branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL`.

### ¿Puede un cliente operar en varias sucursales de la misma organización?
**SÍ**. En la gastronomía de especialidad y franquicias modernas, el cliente se fideliza con la marca comercial, no con un local físico aislado.
- Un cliente registrado en la sucursal Palermo Soho debe poder comprar en la sucursal Belgrano, acumular puntos y canjear recompensas de su cuenta unificada.

### ¿Debe existir un `customer_id` estable?
**SÍ**. Cada cliente debe tener un identificador primario inmutable:
`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`.

---

## 2. ESTRATEGIA DE IDENTIDAD Y UNICIDAD

### ¿Qué identifica a un cliente en el punto de venta?
1. **Identificador Primario de Mostrador:** En Argentina, el identificador de mayor velocidad y menor fricción en caja/salón es el **Número de Celular (WhatsApp)** o el **DNI**.
2. **Identificador Secundario:** Correo electrónico (`email`).
3. **Regla de Unicidad:**
   - **`UNIQUE (organization_id, phone)`**: El número es único dentro de la marca.
   - **`UNIQUE (organization_id, email)`**: Cuando el email esté provisto.
   - **Importante:** No deben definirse restricciones de unicidad global entre distintas organizaciones, ya que el mismo comensal puede ser cliente legítimo de dos marcas gastronómicas distintas que compartan la plataforma multi-tenant.
