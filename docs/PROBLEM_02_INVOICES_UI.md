Actuá como Tech Lead Fullstack especializado en Next.js 16, TypeScript, Supabase, n8n y diseño de interfaces operativas B2B.

Estoy trabajando en un technical challenge para Archytas, rol Forward Deployed Engineer.

Ya existe una primera iteración funcional de la UI para:

/prices

Esa vista ya define el lenguaje visual base de la aplicación.

IMPORTANTE:
- NO rediseñar la aplicación.
- NO cambiar colores globales.
- NO cambiar tipografías.
- NO introducir un nuevo sistema visual.
- NO cambiar spacing, radius, sombras o estilos base salvo que sea necesario para reutilizar exactamente el mismo patrón visual existente.
- Reutilizar componentes y estilos ya creados para /prices cuando corresponda.
- Inspeccionar primero el código existente dentro de /ui antes de implementar.
- Mantener continuidad visual absoluta con /prices.

Todo el trabajo debe hacerse exclusivamente dentro de:

/ui

No modificar:
- workflows de n8n
- migraciones existentes de Supabase
- docker-compose
- README final todavía
- otras áreas del challenge salvo que sea necesario para reutilizar infraestructura ya creada

==================================================
CONTEXTO DEL CHALLENGE
==================================================

El cliente es una PyME llamada Ferretería Industrial Cordillera.

Uno de sus principales problemas es que recibe facturas de múltiples proveedores y necesita:

1. centralizarlas;
2. evitar duplicados;
3. identificar correctamente al proveedor;
4. distinguir pagadas, parcialmente pagadas e impagas;
5. saber qué facturas están vencidas;
6. saber cuáles tienen recibo generado;
7. detectar casos que requieren revisión manual en vez de adivinar.

El backend/integración ya fue resuelto con n8n + Supabase.

Esta iteración NO debe resolver ingestión documental desde cero.

Ya tenemos las facturas normalizadas almacenadas en Supabase.

==================================================
PROBLEMAS DEL CHALLENGE QUE ESTA UI DEBE REPRESENTAR
==================================================

Esta pantalla debe mostrar total o parcialmente:

PROBLEMA 2 — FACTURAS

El cliente recibe facturas en distintos formatos y con nombres inconsistentes de proveedores.

La solución actual:
- centraliza las facturas en Supabase;
- evita duplicados usando external_id;
- conserva el nombre original del proveedor;
- resuelve el proveedor contra una entidad canónica;
- marca como pending lo que no puede resolverse con certeza.

La UI debe hacer visible esa normalización.

PROBLEMA 5 — PAGOS A MEDIAS

El cliente necesita distinguir:
- factura pagada;
- pago parcial;
- factura impaga.

La UI debe mostrar:
- monto total;
- monto pagado;
- saldo;
- estado de pago.

PROBLEMA 11 — FECHAS

El cliente quiere entender vencimientos.

En esta iteración:
- mostrar vencimientos;
- destacar vencidas;
- destacar próximas a vencer.

NO implementar calendario todavía.

PROBLEMA 12 — RECIBOS

El cliente quiere saber qué facturas tienen recibo generado y cuáles no.

En esta iteración:
- mostrar receipt_generated;
- destacar facturas vencidas o próximas a vencer sin recibo.

NO implementar generación de recibos.

==================================================
SCHEMA REAL DE SUPABASE
==================================================

Tabla:

public.invoices

Campos:

id uuid primary key
external_id text unique
invoice_number text
supplier_id uuid nullable FK suppliers(id)
supplier_name_raw text
invoice_date date
due_date date
amount numeric(14,2)
paid_amount numeric(14,2)
balance numeric(14,2)
payment_status text
days_overdue integer
receipt_generated boolean
file_type text nullable
product_external_id text nullable
product_text_raw text nullable
resolution_status text:
  resolved | pending
resolution_note text nullable
created_at timestamptz
updated_at timestamptz
last_synced_at timestamptz

Tabla:

public.suppliers

Campos:

id uuid primary key
external_slug text
canonical_name text
cuit text
email text nullable
phone text nullable
address text nullable
payment_terms_days integer nullable
current_balance numeric(14,2)
created_at timestamptz
updated_at timestamptz
last_synced_at timestamptz

Relación:

invoices.supplier_id
→ suppliers.id

IMPORTANTE:
supplier_id puede ser null si la factura no pudo resolverse con certeza.

==================================================
DATOS REALES DE REFERENCIA
==================================================

Ejemplo 1:

{
  invoice_number: "F-5816",
  supplier_name_raw: "Aceros Belgrano S.A.",
  amount: 32165,
  paid_amount: 32165,
  balance: 0,
  payment_status: "Pagada",
  due_date: "2024-03-05",
  receipt_generated: true,
  file_type: "Excel",
  resolution_status: "resolved"
}

Ejemplo 2:

{
  invoice_number: "F-2059",
  supplier_name_raw: "Aceros Belgrano SA",
  amount: 536745,
  paid_amount: 0,
  balance: 536745,
  payment_status: "Impaga",
  due_date: "2023-05-27",
  receipt_generated: true,
  file_type: "PDF (escaneado)",
  resolution_status: "resolved"
}

Ejemplo 3:

{
  invoice_number: "F-5133",
  supplier_name_raw: "Aceros Belgrano SA",
  amount: 173451,
  paid_amount: 65100,
  balance: 108351,
  payment_status: "Pago parcial",
  due_date: "2026-09-13",
  receipt_generated: true,
  file_type: "Excel",
  resolution_status: "resolved"
}

El proveedor canónico asociado a esos ejemplos es:

Aceros Belgrano SA

La UI debe poder mostrar:

Proveedor canónico:
Aceros Belgrano SA

Nombre recibido:
Aceros Belgrano S.A.

Eso es importante porque demuestra visualmente la normalización de identidad de proveedor.

==================================================
OBJETIVO DE ESTA ITERACIÓN
==================================================

Implementar:

/invoices

y:

/invoices/[id]

Mantener todo simple.

La pantalla principal debe ser una vista operativa de facturas.

La pregunta UX que debe responder rápidamente es:

- ¿Qué debo?
- ¿Qué está vencido?
- ¿Qué está parcialmente pagado?
- ¿Qué necesita atención?
- ¿Qué facturas tienen recibo?
- ¿Qué facturas no pudieron resolverse con certeza?

==================================================
ESTRUCTURA DE CARPETAS ESPERADA
==================================================

Mantener una estructura similar a:

ui/
├── app/
│   ├── invoices/
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       ├── loading.tsx
│   │       └── not-found.tsx si corresponde
│
├── components/
│   └── invoices/
│       ├── invoice-kpis.tsx
│       ├── invoices-table.tsx
│       ├── invoice-payment-status-badge.tsx
│       ├── invoice-receipt-status.tsx
│       ├── invoice-resolution-status.tsx
│       ├── invoice-due-status.tsx
│       └── payment-progress.tsx
│
├── lib/
│   └── invoices/
│       ├── queries.ts
│       ├── types.ts
│       └── utils.ts

No es obligatorio usar exactamente esos nombres si existe una razón clara mejor.

Pero mantener separación de responsabilidades:

app
→ routing y composición

components
→ presentación

lib/invoices
→ queries, tipos y helpers

==================================================
ARQUITECTURA NEXT.JS
==================================================

Usar App Router.

Usar Server Components por defecto.

Estas páginas deben seguir siendo Server Components:

/invoices/page.tsx
/invoices/[id]/page.tsx

NO poner:

"use client"

en esas páginas.

No usar Server Actions porque no hay ninguna mutación en esta iteración.

No crear API Routes.

No cargar los datos iniciales desde el browser.

No usar React Query.
No usar SWR.
No usar Zustand.
No usar Redux.
No usar Supabase browser client.

Toda lectura debe ser server-side.

Reutilizar el cliente Supabase server-only existente de /prices.

==================================================
QUERY PRINCIPAL
==================================================

Crear una función como:

getInvoices()

Debe traer las facturas con su proveedor asociado.

Usar una query equivalente a:

invoices
.select(`
  id,
  external_id,
  invoice_number,
  supplier_id,
  supplier_name_raw,
  invoice_date,
  due_date,
  amount,
  paid_amount,
  balance,
  payment_status,
  days_overdue,
  receipt_generated,
  file_type,
  product_external_id,
  product_text_raw,
  resolution_status,
  resolution_note,
  created_at,
  updated_at,
  last_synced_at,
  suppliers (
    id,
    canonical_name,
    cuit,
    email,
    phone,
    payment_terms_days
  )
`)

No hacer una query por invoice.

Evitar N+1.

==================================================
TYPES
==================================================

Crear tipos explícitos.

Ejemplo conceptual:

type InvoiceSupplier = {
  id: string
  canonical_name: string
  cuit: string
  email: string | null
  phone: string | null
  payment_terms_days: number | null
}

type Invoice = {
  id: string
  external_id: string
  invoice_number: string
  supplier_id: string | null
  supplier_name_raw: string
  invoice_date: string
  due_date: string
  amount: number
  paid_amount: number
  balance: number
  payment_status: "Pagada" | "Pago parcial" | "Impaga" | string
  days_overdue: number
  receipt_generated: boolean
  file_type: string | null
  product_external_id: string | null
  product_text_raw: string | null
  resolution_status: "resolved" | "pending"
  resolution_note: string | null
  created_at: string
  updated_at: string
  last_synced_at: string
  suppliers: InvoiceSupplier | null
}

Verificar la forma real que devuelve Supabase.

No usar any.

No hacer casts innecesarios.

==================================================
QUERY DE DETALLE
==================================================

Crear:

getInvoiceById(id)

Debe consultar una única factura por su id.

Incluir relación supplier.

Si no existe:
usar notFound() desde Next.js.

No retornar null silenciosamente si la ruta es inválida.

==================================================
ORDEN DE FACTURAS
==================================================

Para la vista operativa:

priorizar lo urgente.

Preferencia:

1. vencidas con saldo > 0
2. próximas a vencer
3. resto por due_date ascendente

Si hacerlo enteramente en SQL complica demasiado la implementación, traer las facturas ordenadas por due_date y aplicar una función pequeña server-side para priorización.

No sobreingenierizar.

==================================================
PÁGINA /invoices
==================================================

Debe mantener exactamente el mismo lenguaje visual de /prices.

Mismo:
- ancho máximo
- padding
- encabezados
- tipografía
- colores
- cards
- bordes
- radius
- badges
- espaciado vertical
- tratamiento de tablas
- responsive behavior

Antes de crear estilos nuevos:
inspeccionar /prices y reutilizar.

La página debe verse como otro módulo de la misma aplicación.

==================================================
HEADER
==================================================

Título:

Facturas

Descripción:

Facturas centralizadas y normalizadas desde SIGProv.

No agregar marketing copy.

==================================================
KPIs
==================================================

Mostrar 4 cards.

1.

Total
100

Derivar de invoices.length.

2.

Impagas
X

payment_status = "Impaga"

3.

Pago parcial
X

payment_status = "Pago parcial"

4.

Vencidas
X

Condición recomendada:

balance > 0
AND due_date < hoy

No usar únicamente days_overdue.

==================================================
IMPORTANTE SOBRE days_overdue
==================================================

days_overdue viene sincronizado desde SIGProv.

No usarlo como única fuente para calcular mensajes relativos actuales porque puede quedar desactualizado entre sincronizaciones.

Para UI calcular vencimiento usando due_date contra la fecha actual.

Crear helper server-side.

Ejemplos:

"Vence hoy"

"Vence en 3 días"

"Vencida hace 12 días"

"Pagada"

Si la factura está completamente pagada, evitar tratarla como una urgencia aunque su due_date sea vieja.

==================================================
BLOQUE REQUIEREN ATENCIÓN
==================================================

Debajo de los KPIs crear un bloque visual sobrio:

Requieren atención

Mostrar hasta tres métricas:

1.

X facturas vencidas sin recibo

Condición:

balance > 0
AND due_date < today
AND receipt_generated = false

2.

X facturas próximas a vencer sin recibo

Definir próximas a vencer como:

due_date >= today
AND due_date <= today + 7 días
AND balance > 0
AND receipt_generated = false

3.

X facturas requieren revisión manual

resolution_status = "pending"

Si una métrica da 0, se puede mostrar igual de forma discreta o esconderla.

Elegir la opción más consistente con /prices.

No mostrar alertas agresivas.

==================================================
FILTROS
==================================================

Implementar filtros simples usando searchParams.

No convertir la página en Client Component.

Filtros deseados:

Todas
Impagas
Pago parcial
Pagadas
Vencidas

Ejemplos de URL:

/invoices

/invoices?status=unpaid

/invoices?status=partial

/invoices?status=paid

/invoices?filter=overdue

Implementar links o botones que naveguen mediante URL.

Mantener el estilo visual de /prices.

==================================================
BÚSQUEDA
==================================================

Agregar búsqueda simple.

Debe permitir buscar por:

invoice_number

supplier canonical_name

supplier_name_raw

La forma más simple y robusta es mediante searchParams:

/invoices?q=aceros

No hace falta debounce complejo.

Un form GET es suficiente.

Evitar Client Component si no es necesario.

==================================================
TABLA PRINCIPAL
==================================================

Columnas:

Factura
Proveedor
Total
Pagado
Saldo
Vencimiento
Estado
Recibo

No agregar más columnas.

Datos:

Factura
→ invoice_number

Proveedor
→ suppliers.canonical_name si existe
→ si supplier es null, mostrar supplier_name_raw

Total
→ amount

Pagado
→ paid_amount

Saldo
→ balance

Vencimiento
→ due_date

Estado
→ payment_status

Recibo
→ receipt_generated

Cada fila debe ser navegable al detalle.

Preferencia:

Link sobre invoice_number o toda la fila si es accesible.

No romper accesibilidad usando onClick innecesario.

==================================================
FORMATO DE MONEDA
==================================================

Reutilizar helper existente si ya existe.

Si no:

Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0
})

No concatenar manualmente símbolos.

Ejemplos:

$ 32.165
$ 536.745
$ 173.451

Mantener el mismo formato usado en /prices.

==================================================
ESTADO DE PAGO
==================================================

Crear componente:

InvoicePaymentStatusBadge

Estados:

Pagada
Pago parcial
Impaga

Reutilizar el mismo sistema de badges de /prices si existe.

No hardcodear clases por toda la app.

Definir variantes centralizadas o una función pequeña.

Semántica visual:

Pagada
→ estado positivo/sobrio

Pago parcial
→ atención

Impaga
→ alerta moderada

No usar colores saturados.

==================================================
RECIBO
==================================================

Crear:

InvoiceReceiptStatus

true:

"Generado"

false:

"Pendiente"

Usar icono solo si el proyecto ya tiene librería de iconos instalada.

No instalar una nueva solo por esto.

==================================================
RESOLUCIÓN DEL PROVEEDOR
==================================================

resolution_status:

resolved
→ "Resuelto automáticamente"

pending
→ "Requiere revisión"

La tabla principal puede no mostrarlo como columna para evitar ruido.

Pero si una factura está pending:
hacer visible alguna señal discreta junto al proveedor o en la fila.

El detalle sí debe mostrarlo explícitamente.

==================================================
PÁGINA /invoices/[id]
==================================================

Debe mantener exactamente el mismo estilo de detalle que /prices/[id] si ya existe.

No crear un layout completamente diferente.

Encabezado:

← Volver a facturas

Factura F-XXXX

Badges:

Estado de pago
Estado de vencimiento
Estado de recibo

Ejemplo:

[ Impaga ] [ Vencida ] [ Recibo generado ]

==================================================
DETALLE — BLOQUE PROVEEDOR
==================================================

Mostrar:

Proveedor
<canonical_name>

CUIT
<cuit>

Email
<email>

Si email es null:
"Sin email registrado"

Nombre recibido desde SIGProv
<supplier_name_raw>

Si supplier_id es null:

Proveedor canónico
"Sin resolver"

y dejar visible:

Nombre recibido
<supplier_name_raw>

==================================================
DETALLE — ESTADO DE PAGO
==================================================

Mostrar:

Monto total
amount

Pagado
paid_amount

Saldo pendiente
balance

Agregar una barra de progreso sencilla.

Porcentaje:

paid_amount / amount * 100

Clamp entre 0 y 100.

Si amount <= 0:
evitar división.

Ejemplo para F-5133:

65.100 / 173.451 ≈ 37.5%

Mostrar valor aproximado:

38% pagado

No instalar librería para progress bar.

Tailwind es suficiente.

==================================================
DETALLE — FECHAS
==================================================

Mostrar:

Fecha de factura
invoice_date

Vencimiento
due_date

Estado actual

Ejemplos:

Vencida hace 1186 días
Vence en 19 días
Vence hoy

Calcular desde due_date.

No usar únicamente days_overdue.

También se puede mostrar el campo original como metadata si aporta:

"Días vencida informados por SIGProv"

pero no es obligatorio.

==================================================
DETALLE — RECIBO
==================================================

Mostrar bloque:

Recibo

Si receipt_generated:

"Recibo generado"

Si no:

"Recibo pendiente"

Si además está próxima a vencer o vencida y receipt_generated = false:
mostrar una observación sobria:

"Esta factura requiere atención."

No crear botón para generar recibo.

==================================================
DETALLE — RESOLUCIÓN
==================================================

Crear sección:

Resolución del proveedor

Si resolved:

"Resuelto automáticamente"

Mostrar:

Nombre original
supplier_name_raw

Proveedor asociado
suppliers.canonical_name

Detalle
resolution_note

Ejemplo:

Nombre original:
Aceros Belgrano S.A.

Proveedor asociado:
Aceros Belgrano SA

Detalle:
Resolved from supplier account movement

Eso demuestra de forma explícita cómo resolvimos la inconsistencia de nombres.

Si pending:

"Requiere revisión manual"

Mostrar:

Nombre recibido
supplier_name_raw

Motivo
resolution_note

No esconder este caso.

==================================================
DETALLE — DATOS DE ORIGEN
==================================================

Agregar un bloque secundario:

Datos de origen

Mostrar:

Tipo de archivo
file_type

Referencia de producto
product_external_id

Producto recibido
product_text_raw

Última sincronización
last_synced_at

No usar esta información como foco principal.

Debe ser metadata secundaria.

==================================================
FILE TYPE
==================================================

Los valores reales pueden ser:

Excel
PDF
PDF (escaneado)

Mostrar el valor tal cual viene de la fuente.

NO afirmar que nuestra solución hizo OCR del PDF escaneado.

La UI únicamente está mostrando el tipo original registrado.

Esto es importante para no aparentar una funcionalidad que no implementamos.

==================================================
UTILIDADES
==================================================

Crear helpers server-safe, por ejemplo:

formatCurrency()

formatDate()

formatDateTime()

getInvoiceDueStatus()

getPaymentPercentage()

getInvoiceAttentionMetrics()

Reutilizar helpers existentes de /prices siempre que sea lógico.

No duplicar formatCurrency si ya existe uno global.

Si /prices tiene:

lib/utils.ts

o similar:
evaluar mover helpers comunes a una ubicación compartida.

Solo hacerlo si no rompe nada y mejora realmente la arquitectura.

==================================================
EJEMPLO DE getInvoiceDueStatus
==================================================

Conceptualmente puede devolver algo como:

type InvoiceDueStatus =
  | {
      type: "paid"
      label: "Pagada"
    }
  | {
      type: "overdue"
      label: "Vencida hace 12 días"
      days: 12
    }
  | {
      type: "today"
      label: "Vence hoy"
    }
  | {
      type: "upcoming"
      label: "Vence en 4 días"
      days: 4
    };

No es obligatorio usar exactamente ese shape.

La lógica debe ser clara y testeable.

==================================================
DATE HANDLING
==================================================

Tener cuidado con fechas SQL tipo:

2026-09-13

Son fechas sin timezone.

Evitar generar off-by-one day por convertir incorrectamente con Date.

Implementar helper seguro.

Idealmente tratar due_date como fecha de calendario local.

No mostrar:

12/09

por error cuando en DB está:

13/09

Validar esto.

==================================================
ESTADO VACÍO
==================================================

Si no hay facturas:

"No hay facturas sincronizadas todavía."

No renderizar una tabla rota.

==================================================
NO SUPPLIER
==================================================

Si suppliers es null:

Proveedor:
supplier_name_raw

y alguna señal:

"Proveedor sin resolver"

No lanzar error.

==================================================
LOADING
==================================================

Agregar:

/invoices/loading.tsx

y:

/invoices/[id]/loading.tsx

Mantener mismo estilo de loading/skeleton que /prices.

No instalar librerías.

==================================================
NOT FOUND
==================================================

Para /invoices/[id]:

si el id no existe:
notFound()

Crear not-found.tsx local si mejora UX.

Mensaje simple:

"Factura no encontrada."

Link:
"Volver a facturas"

==================================================
RESPONSIVE
==================================================

Mantener el mismo breakpoint strategy usado en /prices.

En desktop:
tabla completa.

En mobile:
permitir overflow horizontal si es la solución más simple y consistente.

No transformar toda la tabla en cards si eso requiere demasiado código.

Priorizar robustez.

==================================================
ACCESIBILIDAD
==================================================

- tablas semánticas
- th adecuados
- Links reales
- labels en búsqueda
- contrastes suficientes
- no depender solo del color para representar estados

==================================================
NO IMPLEMENTAR
==================================================

No implementar:

- generación de recibos
- edición de facturas
- registrar pagos
- calendario
- realtime
- autenticación
- roles
- upload de archivos
- OCR
- parsing de PDF
- parsing de Excel
- notificaciones
- acciones de proveedor
- supplier_account_movements
- dashboard general
- ventas
- compras
- rubros
- órdenes de compra

No ampliar scope.

==================================================
NO USAR supplier_account_movements
==================================================

Aunque existe la tabla:

supplier_account_movements

NO usarla en /invoices.

Ese dataset se utilizará posteriormente en:

/suppliers/[id]

Para la vista factura ya tenemos:

amount
paid_amount
balance
payment_status

No duplicar conceptos.

==================================================
CONSISTENCIA CON /prices
==================================================

Antes de escribir código:

inspeccionar:

/prices
/prices/[id]

Identificar:

- layout
- max-width
- header component
- cards
- typography
- badges
- colors
- spacing
- table styles
- links
- loading states
- utility functions

Reutilizar todo lo posible.

Si existe un componente genérico reusable:
usar ese.

Si hay código duplicado claro entre /prices e /invoices:
extraer un componente compartido solo si la abstracción es obvia.

No hacer generalizaciones prematuras.

==================================================
DEPENDENCIAS
==================================================

NO instalar nuevas dependencias salvo que sea absolutamente necesario.

Antes revisar package.json.

Usar:
- React
- Next.js
- Tailwind
- Supabase client ya existente
- utilidades ya existentes

No necesitamos gráficos.

No necesitamos shadcn si no está instalado.

Si shadcn ya está instalado:
reutilizar sus primitives sin reconfigurar el tema.

==================================================
BUENAS PRÁCTICAS
==================================================

Aplicar:

- TypeScript strict
- no any
- funciones pequeñas
- nombres explícitos
- responsabilidad única
- no lógica compleja dentro de JSX
- evitar duplicación
- no console.log final
- no secretos
- no mocks
- no datos hardcodeados
- no TODOs innecesarios
- errores explícitos
- queries separadas de presentación
- no fetch client-side inicial

==================================================
PERFORMANCE
==================================================

Tenemos aproximadamente 100 facturas.

No implementar paginación compleja todavía.

Cargar las 100 facturas server-side es aceptable para este challenge.

Sí evitar:

- N+1 queries
- fetch individual por proveedor
- histórico/movimientos innecesarios
- estado global
- re-render client-side masivo

==================================================
QUERY + FILTROS
==================================================

Podés elegir entre:

A:
traer las 100 facturas y filtrar server-side mediante searchParams.

B:
aplicar filtros directamente en query Supabase.

Para este volumen, A es perfectamente aceptable y probablemente más simple.

No optimizar prematuramente.

La búsqueda y filtros deben seguir siendo server-side.

==================================================
VISUAL FINAL ESPERADO
==================================================

Aproximadamente:

FACTURAS
Facturas centralizadas y normalizadas desde SIGProv.

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total        │ │ Impagas      │ │ Pago parcial │ │ Vencidas     │
│ 100          │ │ XX           │ │ XX           │ │ XX           │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

Requieren atención

⚠ X vencidas sin recibo
⚠ X próximas a vencer sin recibo
⚠ X requieren revisión manual

[ Todas ] [ Impagas ] [ Pago parcial ] [ Pagadas ] [ Vencidas ]

[ Buscar por factura o proveedor... ]

Facturas
───────────────────────────────────────────────────────────────────────────
Factura   Proveedor             Total       Pagado      Saldo      Estado
F-5816    Aceros Belgrano SA    $32.165     $32.165     $0         Pagada
F-2059    Aceros Belgrano SA    $536.745    $0          $536.745   Impaga
F-5133    Aceros Belgrano SA    $173.451    $65.100     $108.351   Parcial

Agregar columnas:
Vencimiento
Recibo

sin perder legibilidad.

==================================================
DETALLE VISUAL ESPERADO
==================================================

← Volver a facturas

Factura F-5133

[ Pago parcial ] [ Próxima a vencer ] [ Recibo generado ]


Proveedor
Aceros Belgrano SA

CUIT
...

Email
...

Nombre recibido desde SIGProv
Aceros Belgrano SA


Estado de pago

Monto total
$173.451

Pagado
$65.100

Saldo pendiente
$108.351

████████░░░░░░░░░░
38% pagado


Fechas

Fecha de factura
15/07/2026

Vencimiento
13/09/2026

Estado
Vence en X días


Recibo

✓ Recibo generado


Resolución del proveedor

✓ Resuelto automáticamente

Nombre original
Aceros Belgrano SA

Proveedor asociado
Aceros Belgrano SA

Detalle
Resolved from supplier account movement


Datos de origen

Tipo de archivo
Excel

Producto
COR-0015 - Pinturas - Articulo 15

Última sincronización
...

==================================================
VALIDACIÓN FINAL
==================================================

Al terminar:

1. ejecutar:

npm run lint

2. ejecutar:

npm run build

3. resolver todos los errores TypeScript.

4. probar:

/invoices

5. probar:

/invoices/[id]

6. validar:
- factura Pagada
- factura Pago parcial
- factura Impaga
- factura vencida
- receipt_generated true
- si existe receipt_generated false, verificarlo
- resolved
- si existe pending, verificarlo
- proveedor canónico
- supplier_name_raw diferente del canónico

7. comprobar que no se agregaron dependencias innecesarias.

8. comprobar que /prices no se rompió.

9. comprobar responsive.

10. comprobar fechas sin off-by-one.

==================================================
ENTREGA DEL AGENTE
==================================================

Primero inspeccioná el código actual dentro de /ui.

Después implementá directamente.

Al finalizar, reportame:

1. archivos creados;
2. archivos modificados;
3. componentes reutilizados de /prices;
4. decisiones técnicas;
5. queries implementadas;
6. filtros implementados;
7. cualquier edge case manejado;
8. resultado de npm run lint;
9. resultado de npm run build.

NO te limites a describir.

Ejecutá la implementación completa.