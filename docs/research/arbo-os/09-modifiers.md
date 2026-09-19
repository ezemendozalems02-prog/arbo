# 09 — Modificadores

**Archivos:** `src/mock/modifiers.js`, `src/mock/products.js`,
`src/admin/components/pos/ModifierPickerModal.jsx`, `src/services/salesCalculations.js`
**Estado general:** `PARTIAL` — funcionan para **precio**; no tienen ningún
efecto sobre receta, costo ni stock.

## 9.1 Modelo

`MODIFIER_GROUPS` es un objeto de grupos, cada uno con `key`, `name`,
`required`, `min`, `max` y una lista de `options` con `key`, `name` y
`priceDelta`. Está modelado como entidad propia, no como texto concatenado, y
el comentario del archivo indica que está pensado para migrar 1:1 a tablas
`modifier_groups` / `modifier_options`.

Grupos de la semilla:

| Grupo | Obligatorio | min/max | Opciones |
|---|---|---|---|
| `leche` | sí | 1/1 | Entera $0 · Descremada $0 · Vegetal **+$500** |
| `extras_cafe` | no | 0/3 | Shot extra +$700 · Caramelo +$500 · Canela +$300 |
| `punto_carne` | sí | 1/1 | Jugoso · A punto · Bien cocido (todos $0) |
| `extras_platos` | no | — | (ver archivo) |

La asociación producto → grupos vive en `MODIFIER_GROUPS_BY_PRODUCT`
(`mock/products.js:13-23`): 9 productos tienen modificadores.

## 9.2 Qué funciona

| Capacidad | Estado |
|---|---|
| Grupos y opciones | `CONFIRMED_WORKING` |
| Obligatoriedad (`required`) | `CONFIRMED_WORKING` en el modelo |
| Mínimos y máximos | `CONFIRMED_WORKING` en el modelo |
| Precio adicional (`priceDelta`) | `CONFIRMED_WORKING` — `calcModifiersDelta` lo suma al precio unitario |
| Firma para fusionar líneas | `CONFIRMED_WORKING` — ver §9.3 |
| Se arrastran a la comanda de cocina | `CONFIRMED_WORKING` — `kitchenService.js:50` |
| Se guardan en la venta | `CONFIRMED_WORKING` — la línea de venta conserva `modifiers` |
| **Administrar modificadores** | `NOT_IMPLEMENTED` — `/admin/modificadores` está en "Próximamente" |
| **Receta por modificador** | `NOT_IMPLEMENTED` |
| **Descuento de stock por modificador** | `NOT_IMPLEMENTED` |
| **Impacto en el costo** | `NOT_IMPLEMENTED` |

## 9.3 Fusión de líneas — buen detalle

`modifiersSignature` (`salesCalculations.js:52-54`) genera una firma
determinística: ordena `groupKey:optionKey` alfabéticamente y los une con `|`.
Dos líneas del mismo producto con la misma selección se fusionan sumando
cantidad; con selecciones distintas quedan separadas. El ordenamiento previo
evita que el orden de clic genere firmas distintas para la misma selección.

**Verificado en vivo:** dos clics sobre "Copa Malbec Patagónico" (sin
modificadores) produjeron **una sola línea con `quantity: 2`**, no dos líneas.

## 9.4 La cadena que el brief pide verificar

> MODIFICADOR → PRODUCTO → RECETA → INGREDIENTE → STOCK

**Resultado: la cadena se corta en el segundo eslabón.**

```
MODIFICADOR ──> PRODUCTO       ✔ funciona (precio de la línea)
            ──> COMANDA        ✔ funciona (texto informativo para cocina)
            ──> RECETA         ✘ NO EXISTE vínculo
            ──> INGREDIENTE    ✘ NO EXISTE
            ──> STOCK          ✘ NO EXISTE
```

Evidencia: `grep` de `modifier` sobre `src/services/` devuelve **sólo**
`salesCalculations.js` (cálculo de precio y firma) y `kitchenService.js`
(copiarlos al ticket). Ningún servicio de inventario, receta o costo menciona
modificadores.

**Consecuencia concreta:** pedir un latte con leche vegetal cobra $500 más,
pero el sistema descuenta exactamente el mismo stock que un latte con leche
entera — es decir, **ninguno**, porque la venta tampoco descuenta stock (ver
`10-stock.md`). Un "shot extra" de $700 no consume café adicional en el
inventario ni altera el food cost del producto.

Clasificación: el precio diferencial es `CONFIRMED_WORKING`; el impacto en
costo y stock es `NOT_IMPLEMENTED`.
