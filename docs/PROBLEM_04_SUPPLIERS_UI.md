Actuá como Tech Lead Fullstack especializado en Next.js 16, TypeScript, Supabase y automatizaciones con n8n.

Estoy trabajando en un technical challenge para Archytas, rol Forward Deployed Engineer.

La aplicación ya tiene implementados y funcionando:

/prices
/invoices
/invoices/[id]

Existe un lenguaje visual ya definido en esas pantallas.

Esta nueva iteración debe implementar:

/suppliers
/suppliers/[id]

y debe mantener EXACTAMENTE la misma identidad visual y arquitectura general.

==================================================
OBJETIVO DEL CLIENTE
==================================================

El problema original del cliente con proveedores es:

- no sabe con cuántos proveedores trabaja realmente;
- el mismo proveedor aparece escrito de varias formas;
- cuando intenta calcular cuánto compró a uno, los datos no coinciden;
- no sabe cuánto le debe a cada proveedor;
- no puede ver fácilmente si viene pagando tarde;
- quiere poder abrir un proveedor y entender:
  - cuánto compró;
  - cuánto pagó;
  - cuánto debe;
  - su historial de movimientos;
- necesita tener CUIT y email a mano.

La integración ya resolvió gran parte de este problema usando:

n8n
→ Supabase

La UI NO debe volver a resolver identidad de proveedores.

La base ya contiene proveedores canónicos.

==================================================
SCOPE DE ESTA ITERACIÓN
==================================================

Implementar únicamente:

/suppliers
/suppliers/[id]

Debe ser una implementación SIMPLE.

No sobreingenierizar.

No agregar:
- gráficos;
- tabs;
- dashboards secundarios;
- filtros complejos;
- búsqueda avanzada;
- edición;
- mutaciones;
- formularios;
- Server Actions;
- realtime;
- paginación;
- autenticación;
- roles.

Tenemos solamente alrededor de 8 proveedores.

No necesitamos infraestructura compleja.

==================================================
DATOS REALES DISPONIBLES
==================================================

Tabla:

public.suppliers

Campos:

id uuid primary key

external_slug text unique

canonical_name text

cuit text unique

email text nullable

phone text nullable

address text nullable

payment_terms_days integer nullable

current_balance numeric(14,2)

created_at timestamptz

updated_at timestamptz

last_synced_at timestamptz

==================================================
MOVIMIENTOS DE CUENTA CORRIENTE
==================================================

Tabla:

public.supplier_account_movements

Campos:

id uuid primary key

supplier_id uuid FK suppliers(id)

movement_date date

movement_type text

reference text

debe numeric(14,2)

haber numeric(14,2)

saldo numeric(14,2)

created_at timestamptz

last_synced_at timestamptz

Existe:

unique (
  supplier_id,
  movement_type,
  reference
)

==================================================
RELACIÓN
==================================================

supplier_account_movements.supplier_id
→ suppliers.id

Los movimientos representan principalmente:

Factura

Pago

==================================================
ARQUITECTURA
==================================================

Usar Next.js 16 App Router.

Mantener Server Components por defecto.

Estas páginas deben ser Server Components:

/suppliers/page.tsx

/suppliers/[id]/page.tsx

NO poner:

"use client"

salvo que sea absolutamente necesario.

Para esta iteración idealmente NO debería haber ningún Client Component nuevo.

NO usar Server Actions.

No crear API Routes.

No hacer fetch desde browser.

No usar React Query.
No usar SWR.
No usar Redux.
No usar Zustand.

Reutilizar el cliente Supabase server-only que ya existe en el proyecto.

==================================================
CONSISTENCIA VISUAL
==================================================

ANTES DE ESCRIBIR CÓDIGO:

inspeccioná completamente:

/prices
/prices/[id]
/invoices
/invoices/[id]

Identificá y reutilizá:

- layout
- max-width
- padding horizontal
- spacing vertical
- tipografía
- tamaños de títulos
- colores
- cards
- borders
- radius
- shadows
- badges
- tablas
- links
- loading states
- empty states
- helpers de moneda
- helpers de fecha

NO crear una identidad visual nueva.

NO cambiar:
- fuentes;
- colores globales;
- globals.css salvo necesidad estricta;
- theme;
- Tailwind config salvo necesidad estricta.

La vista de suppliers debe parecer parte exacta de la misma aplicación.

==================================================
ESTRUCTURA DE CARPETAS ESPERADA
==================================================

Mantener una estructura similar a:

ui/
├── app/
│   └── suppliers/
│       ├── page.tsx
│       ├── loading.tsx
│       └── [id]/
│           ├── page.tsx
│           ├── loading.tsx
│           └── not-found.tsx
│
├── components/
│   └── suppliers/
│       ├── supplier-kpis.tsx
│       ├── suppliers-table.tsx
│       └── supplier-movements-table.tsx
│
└── lib/
    └── suppliers/
        ├── queries.ts
        ├── types.ts
        └── utils.ts

No es obligatorio respetar exactamente estos nombres si la estructura actual del proyecto sugiere algo mejor.

Pero mantener la separación:

app
→ routing y composición

components
→ presentación

lib
→ queries, types y utilidades

==================================================
TYPES
==================================================

Crear tipos explícitos.

Ejemplo conceptual:

type Supplier = {
  id: string
  external_slug: string
  canonical_name: string
  cuit: string
  email: string | null
  phone: string | null
  address: string | null
  payment_terms_days: number | null
  current_balance: number
  created_at: string
  updated_at: string
  last_synced_at: string
}

type SupplierAccountMovement = {
  id: string
  supplier_id: string
  movement_date: string
  movement_type: string
  reference: string
  debe: number
  haber: number
  saldo: number
  created_at: string
  last_synced_at: string
}

No usar any.

Verificar la forma real que devuelve Supabase para numeric.

==================================================
QUERY /suppliers
==================================================

Crear:

getSuppliers()

Debe traer:

id
external_slug
canonical_name
cuit
email
phone
address
payment_terms_days
current_balance
last_synced_at

Ordenar por:

canonical_name ASC

No necesitamos movimientos en esta query.

No hacer N+1.

==================================================
QUERY /suppliers/[id]
==================================================

Crear:

getSupplierById(id)

Debe traer el proveedor.

Si no existe:

usar notFound().

Además crear:

getSupplierAccountMovements(supplierId)

Debe traer:

id
movement_date
movement_type
reference
debe
haber
saldo
last_synced_at

Orden:

movement_date DESC

Si existe más de un movimiento en la misma fecha, usar algún segundo criterio estable, por ejemplo created_at DESC o reference.

No complicar más.

==================================================
PÁGINA /suppliers
==================================================

Header:

Proveedores

Descripción:

Proveedores consolidados y normalizados desde SIGProv.

Mantener el mismo patrón de header usado en /prices e /invoices.

==================================================
KPIs /suppliers
==================================================

Mostrar solamente 3 cards.

1.

Proveedores

Valor:

suppliers.length

Ejemplo:

8

2.

Deuda total

Sumar:

current_balance

de todos los proveedores.

Usar el mismo formatCurrency() del proyecto.

3.

Con deuda

Cantidad de proveedores con:

current_balance > 0

No agregar más KPIs.

==================================================
TABLA /suppliers
==================================================

Columnas:

Proveedor
CUIT
Email
Condición de pago
Saldo actual

Ejemplo conceptual:

Aceros Belgrano SA
30-XXXXXXXX-X
compras@...
30 días
$536.745

Cada proveedor debe tener un Link a:

/suppliers/[id]

Preferir que:

canonical_name

sea el link principal.

No usar onClick de fila si un Link semántico es suficiente.

==================================================
EMAIL NULL
==================================================

Si email es null:

mostrar:

Sin email registrado

de forma discreta.

No mostrar:
null
undefined
-

si se puede evitar.

==================================================
PHONE
==================================================

No mostrar teléfono en la tabla principal.

Puede mostrarse en detalle.

Queremos evitar tabla demasiado ancha.

==================================================
CONDICIÓN DE PAGO
==================================================

Usar:

payment_terms_days

Formato:

30 días

45 días

60 días

Si es null:

Sin condición registrada

No inferir valores.

==================================================
SALDO
==================================================

current_balance representa el saldo actual canónico del proveedor.

Mostrarlo con formatCurrency.

Si:

current_balance > 0

representa deuda pendiente.

No recalcular el saldo principal desde los movimientos para reemplazar este valor.

Podemos calcular movimientos para KPIs históricos, pero el saldo actual mostrado debe venir de:

supplier.current_balance

==================================================
NO AGREGAR BÚSQUEDA
==================================================

Tenemos pocos proveedores.

No crear búsqueda.

No crear filtros.

No crear sort controls.

Orden alfabético es suficiente.

==================================================
PÁGINA /suppliers/[id]
==================================================

Debe mantener el mismo estilo de las vistas detalle de:

/prices/[id]
/invoices/[id]

Header:

← Volver a proveedores

<canonical_name>

Debajo mostrar información básica de contacto.

Ejemplo:

Aceros Belgrano SA

CUIT
30-XXXXXXXX-X

Email
compras@...

Teléfono
...

Condición de pago
30 días

==================================================
KPIs DEL DETALLE
==================================================

Mostrar 3 cards:

Comprado

Pagado

Saldo actual

==================================================
CALCULO TOTAL COMPRADO
==================================================

Calcular server-side:

sum(debe)

sobre supplier_account_movements.

Ejemplo conceptual:

const totalPurchased = movements.reduce(
  (total, movement) => total + movement.debe,
  0
)

No asumir únicamente movement_type = Factura si los datos ya representan debe correctamente.

Pero si inspeccionando los datos reales ves que conviene filtrar explícitamente movement_type === "Factura", podés hacerlo y documentarlo.

Preferencia:
usar la semántica contable de debe/haber, porque es más robusta.

==================================================
CALCULO TOTAL PAGADO
==================================================

Calcular:

sum(haber)

server-side.

==================================================
SALDO ACTUAL
==================================================

Usar:

supplier.current_balance

NO:

totalPurchased - totalPaid

como fuente primaria del KPI.

¿Por qué?

Porque current_balance ya es el saldo canónico sincronizado desde SIGProv.

La resta puede utilizarse como validación interna si querés, pero no crear lógica adicional salvo necesidad.

==================================================
CUENTA CORRIENTE
==================================================

Debajo de KPIs mostrar:

Cuenta corriente

Tabla:

Fecha
Tipo
Referencia
Debe
Haber
Saldo

Ejemplo:

15/07/2026
Factura
F-5133
$173.451
$0
$173.451

01/08/2026
Pago
P-XXXX
$0
$65.100
$108.351

==================================================
MOVEMENT TYPE
==================================================

Mostrar movement_type tal cual está registrado.

Ejemplos:

Factura
Pago

Si ya existe un sistema de badges reusable:
podés usar badge discreto.

No es obligatorio.

No agregar colores exagerados.

==================================================
DEBE / HABER
==================================================

Mostrar valores monetarios usando el mismo helper de moneda.

Si un valor es 0:

mostrar:

—

en lugar de:

$0

solo si esto coincide con el estilo actual de tablas.

Elegir consistencia con /invoices.

==================================================
SALDO EN MOVIMIENTOS
==================================================

Mostrar movement.saldo.

No recalcular fila por fila.

Es un dato de origen.

==================================================
ORDEN
==================================================

Movimientos más recientes primero.

movement_date DESC

==================================================
BLOQUE DATOS DEL PROVEEDOR
==================================================

Además de los KPIs, mostrar un bloque simple con:

CUIT
Email
Teléfono
Dirección
Condición de pago
Última sincronización

No crear una card gigante innecesariamente.

Mantener jerarquía y whitespace.

==================================================
LINK A FACTURAS
==================================================

Si resulta muy simple agregarlo y /invoices ya soporta búsqueda o filtros por proveedor, agregar un link discreto:

Ver facturas de este proveedor →

Pero SOLO si se puede conectar correctamente con la implementación real existente.

No inventar:

/invoices?supplier=...

si ese filtro no existe.

Si no existe una integración clara, omitir el link.

No ampliar scope para construir filtros nuevos en invoices.

==================================================
DATOS VACÍOS
==================================================

Si un proveedor no tiene movimientos:

mostrar:

No hay movimientos registrados para este proveedor.

No renderizar tabla vacía rota.

==================================================
NOT FOUND
==================================================

Si el supplier id no existe:

notFound()

Crear:

app/suppliers/[id]/not-found.tsx

si mantiene el patrón actual.

Mensaje:

Proveedor no encontrado.

Link:

Volver a proveedores

==================================================
LOADING
==================================================

Agregar:

/suppliers/loading.tsx

/suppliers/[id]/loading.tsx

Reutilizar los patrones de skeleton/loading actuales.

No instalar librerías.

==================================================
UTILIDADES
==================================================

ANTES de crear helpers nuevos revisar los existentes.

Especialmente:

formatCurrency
formatDate
formatDateTime

Si ya existen globalmente:
reutilizarlos.

No duplicarlos dentro de lib/suppliers.

Crear solo helpers realmente específicos si hacen falta.

Ejemplo:

getSupplierFinancialSummary(movements)

puede devolver:

{
  totalPurchased,
  totalPaid
}

Pero si reduce() directo en la página queda claro y corto, no crear abstracción innecesaria.

==================================================
FECHAS
==================================================

movement_date es:

date

No timestamptz.

Evitar problemas de timezone/off-by-one.

Reutilizar el mismo helper seguro implementado para invoices si existe.

==================================================
FORMATO VISUAL /suppliers
==================================================

La pantalla debe verse aproximadamente:

PROVEEDORES
Proveedores consolidados y normalizados desde SIGProv.

┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Proveedores    │ │ Deuda total    │ │ Con deuda      │
│ 8              │ │ $X.XXX.XXX     │ │ X              │
└────────────────┘ └────────────────┘ └────────────────┘

Proveedores
──────────────────────────────────────────────────────────────
Proveedor               CUIT         Email          Condición   Saldo
Aceros Belgrano SA      ...          ...            30 días     $...
Cañerías del Litoral    ...          ...            45 días     $...
...

==================================================
FORMATO VISUAL /suppliers/[id]
==================================================

← Volver a proveedores

Aceros Belgrano SA

CUIT · Email · Teléfono

Condición de pago: 30 días


┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Comprado       │ │ Pagado         │ │ Saldo actual   │
│ $X             │ │ $X             │ │ $X             │
└────────────────┘ └────────────────┘ └────────────────┘


Datos del proveedor

CUIT
...

Email
...

Teléfono
...

Dirección
...

Condición de pago
30 días

Última sincronización
...


Cuenta corriente
────────────────────────────────────────────────────────────────
Fecha       Tipo       Referencia       Debe       Haber      Saldo
...         Factura    F-XXXX           $...       —          $...
...         Pago       P-XXXX           —          $...       $...

==================================================
NO USAR INVOICES PARA CALCULAR CUENTA CORRIENTE
==================================================

La cuenta corriente debe salir de:

supplier_account_movements

No reconstruirla desde invoices.

El workflow de suppliers ya sincroniza específicamente esa fuente.

==================================================
NO NORMALIZAR NOMBRES EN FRONTEND
==================================================

canonical_name ya representa la entidad normalizada.

Mostrar:

canonical_name

No crear funciones como:

normalizeSupplierName()

No usar fuzzy matching.

No arreglar strings.

La resolución ocurrió en backend/integración.

==================================================
NO IMPLEMENTAR
==================================================

No implementar:

- creación de proveedor;
- edición de proveedor;
- eliminación;
- registrar pagos;
- agregar movimientos;
- cambiar condiciones de pago;
- generar recibos;
- alertas;
- aging report complejo;
- gráficos;
- calendario;
- mensajes;
- realtime;
- autenticación;
- RBAC;
- export CSV;
- impresión;
- paginación;
- búsqueda;
- filtros;
- sorting interactivo.

==================================================
PERFORMANCE
==================================================

Dataset pequeño.

No optimizar prematuramente.

Sí evitar:

- N+1;
- queries por fila;
- cliente Supabase browser;
- múltiples fetch innecesarios.

En detalle se pueden ejecutar en paralelo:

getSupplierById(id)
getSupplierAccountMovements(id)

usando Promise.all si tiene sentido.

==================================================
ACCESSIBILITY
==================================================

Mantener:

- tablas semánticas;
- th;
- links reales;
- buen contraste;
- estados no dependientes solo de color;
- headings correctos.

==================================================
RESPONSIVE
==================================================

Mantener exactamente el enfoque responsive existente.

Desktop:
tabla completa.

Mobile:
overflow-x-auto si es necesario.

No convertir todas las filas en cards salvo que ya exista ese patrón.

==================================================
BUENAS PRÁCTICAS
==================================================

Aplicar:

- TypeScript strict;
- no any;
- no datos hardcodeados;
- no mocks;
- funciones pequeñas;
- nombres claros;
- Server Components;
- queries aisladas;
- no lógica de acceso a datos dentro de componentes presentacionales;
- no console.log final;
- no secretos;
- no dependencias innecesarias;
- evitar duplicación;
- reutilizar helpers;
- no generalizar prematuramente.

==================================================
IMPORTANTE: NO ROMPER LO EXISTENTE
==================================================

Después de implementar verificar que siguen funcionando:

/prices
/prices/[id]

/invoices
/invoices/[id]

No modificar su comportamiento salvo una refactorización mínima y segura de un helper compartido.

==================================================
VALIDACIÓN FINAL
==================================================

Al terminar ejecutar:

npm run lint

npm run build

Resolver TODOS los errores antes de finalizar.

Después verificar manualmente:

/suppliers

- muestra proveedores reales;
- muestra cantidad correcta;
- calcula deuda total;
- calcula proveedores con deuda;
- muestra CUIT;
- email;
- condición;
- saldo;
- links funcionan.

/suppliers/[id]

- proveedor real;
- datos de contacto;
- total comprado;
- total pagado;
- saldo actual;
- movimientos reales;
- orden correcto;
- formato de moneda;
- fechas correctas;
- empty state;
- not found.

También verificar:

/prices
/invoices

siguen funcionando.

==================================================
ENTREGA DEL AGENTE
==================================================

Antes de implementar:
inspeccioná el proyecto actual dentro de /ui.

Después ejecutá la implementación completa.

Al finalizar reportame solamente:

1. archivos creados;
2. archivos modificados;
3. componentes/helpers reutilizados;
4. queries creadas;
5. cálculos implementados;
6. edge cases manejados;
7. resultado de npm run lint;
8. resultado de npm run build;
9. cualquier decisión técnica relevante.

No te limites a explicar qué harías.

Implementá todo.