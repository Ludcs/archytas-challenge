Actuá como Tech Lead Fullstack especializado en Next.js 16, TypeScript, Supabase y automatizaciones con n8n.

Estoy trabajando en un technical challenge para Archytas, rol Forward Deployed Engineer.

Ya existe un repositorio con esta estructura aproximada:

archytas-challenge/
├── n8n/
│   └── workflows/
│       ├── 01-sigprov-price-sync.json
│       ├── 02-sigprov-supplier-account-sync.json
│       └── 03-sigprov-invoice-sync.json
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_suppliers_and_account_movements.sql
│       └── 003_invoices.sql
├── ui/
│   └── [proyecto Next.js 16 ya creado]
├── docker-compose.yml
└── README.md

IMPORTANTE:
- Todo el trabajo de frontend debe hacerse exclusivamente dentro de /ui.
- No modificar los workflows de n8n.
- No modificar las migraciones existentes salvo que sea estrictamente necesario, y en principio NO debería ser necesario.
- La aplicación será una demo local, no hace falta deploy.
- Queremos avanzar problema por problema del challenge.
- En esta iteración SOLO debemos resolver a nivel UI el “Problema de los precios”.
- La UI debe ser simple, sobria, clara, profesional y rápida de implementar.
- No construir un design system complejo.
- Evitar sobreingeniería.
- Priorizar UX, claridad y mantenibilidad.
- Usar TypeScript estricto.
- Usar Server Components por defecto.
- Crear Client Components solo cuando haya una necesidad real de interacción.
- Usar Server Actions únicamente para mutaciones o acciones de servidor, no para lecturas normales.
- Las lecturas de Supabase deben ejecutarse server-side.
- Nunca exponer una service role key al browser.
- No usar fetch client-side para cargar los datos iniciales de /prices.
- No crear API Routes innecesarias si una Server Action resuelve el caso.
- No agregar Redux, Zustand, React Query, SWR ni ninguna capa de estado global.
- No agregar autenticación todavía.
- No resolver otros problemas del challenge todavía.
- No inventar datos.
- Trabajar exclusivamente con datos reales de Supabase.

==================================================
CONTEXTO FUNCIONAL
==================================================

El cliente tiene un sistema legacy llamado SIGProv.

El problema de negocio es:

“El proveedor publica una lista de precios actualizada en un portal web.
No existe una integración directa pública que el cliente pueda usar.
Antes una persona debía ingresar manualmente y descargar el archivo.
La solución construida automatiza esa sincronización dos veces por día.”

Ya existe un workflow de n8n llamado conceptualmente:

SIGProv Price Sync

Ese workflow:

1. Se ejecuta mediante Schedule Trigger a las 08:00 y 20:00.
2. También posee un Webhook POST para poder disparar la misma sincronización manualmente desde la UI durante la demo.
3. Inicia sesión en SIGProv.
4. Obtiene un token.
5. Descarga el Excel de precios.
6. Extrae los productos.
7. Normaliza los campos.
8. Detecta si el producto existe.
9. Crea o actualiza productos en Supabase.
10. Si cambia el precio, registra un histórico.
11. Registra la ejecución en sync_runs.

Para la demo local el webhook será algo como:

http://localhost:5678/webhook-test/price-sync

La URL NO debe quedar hardcodeada.

==================================================
SCHEMA REAL DE SUPABASE
==================================================

Tenemos estas tablas:

products

- id uuid
- external_code text unique
- description text
- category_raw text nullable
- subcategory_raw text nullable
- current_price numeric(14,2)
- stock integer nullable
- created_at timestamptz
- updated_at timestamptz
- last_synced_at timestamptz

price_history

- id uuid
- product_id uuid FK products(id)
- price numeric(14,2)
- recorded_at timestamptz
- source text default sigprov

sync_runs

- id uuid
- sync_type text
- started_at timestamptz
- finished_at timestamptz nullable
- status:
  running | success | partial | failed
- rows_received integer
- rows_created integer
- rows_updated integer
- rows_rejected integer
- error_message text nullable
- created_at timestamptz

Actualmente existen alrededor de 100 productos.

Ejemplo real:

{
  external_code: "COR-0001",
  description: "Adhesivos - Articulo 1",
  category_raw: "PINTURAS Y ADHESIVOS",
  subcategory_raw: "Adhesivos",
  current_price: 48210,
  stock: 310
}

IMPORTANTE SOBRE price_history:

Actualmente hay muy pocos registros porque el histórico se genera cuando se detectan cambios o al crear determinados productos durante las pruebas.

NO asumir que todos los productos tienen histórico.

Si un producto no tiene suficiente información histórica, mostrar:

“Sin cambios de precio registrados todavía.”

No fabricar variaciones ni puntos de gráfico.

==================================================
OBJETIVO DE ESTA ITERACIÓN
==================================================

Implementar la página:

/prices

La página tiene que comunicar claramente que los precios ya están sincronizados automáticamente desde SIGProv.

Debe mostrar:

PRECIOS

“Precios sincronizados automáticamente desde SIGProv”

Última sincronización exitosa:
23/08/2026 · 100 productos procesados

Botón:
“Simular scheduled trigger 8 AM / 8 PM”

KPIs:

- Productos
- Último sync
- Estado sync

Tabla:

Código
Producto
Categoría
Precio
Stock

Ejemplo visual:

PRECIOS
Precios sincronizados automáticamente desde SIGProv

Última sincronización exitosa
23/08/2026 · 100 productos procesados

                    [ Simular scheduled trigger 8 AM / 8 PM ]

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐
│ Productos       │ │ Último sync     │ │ Estado sync         │
│ 100             │ │ hace X tiempo   │ │ ✓ Exitoso           │
└─────────────────┘ └─────────────────┘ └─────────────────────┘

Productos
┌──────────┬────────────────────────┬───────────────────┬──────────┬───────┐
│ Código   │ Producto               │ Categoría         │ Precio   │ Stock │
├──────────┼────────────────────────┼───────────────────┼──────────┼───────┤
│ COR-0001 │ Adhesivos - Articulo 1 │ Pinturas...       │ $48.210  │ 310   │
│ COR-0002 │ Herramientas...        │ Herramientas      │ $70.213  │ 38    │
└──────────┴────────────────────────┴───────────────────┴──────────┴───────┘

Al seleccionar un producto queremos mostrar detalle:

COR-0001
Adhesivos - Articulo 1

Precio actual
$48.210

Categoría
PINTURAS Y ADHESIVOS

Subcategoría
Adhesivos

Stock
310

Última sincronización
...

Evolución del precio

[gráfico si existe histórico suficiente]

o:

“Sin cambios de precio registrados todavía.”

==================================================
ARQUITECTURA ESPERADA
==================================================

Usar App Router de Next.js 16.

La arquitectura debe priorizar Server Components.

Propuesta esperada:

ui/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── prices/
│       ├── page.tsx
│       ├── loading.tsx
│       ├── error.tsx si tiene sentido
│       └── actions.ts
│
├── components/
│   └── prices/
│       ├── price-sync-button.tsx
│       ├── prices-table.tsx
│       ├── price-kpis.tsx
│       ├── product-detail.tsx
│       └── price-history-chart.tsx
│
├── lib/
│   ├── supabase/
│   │   └── server.ts
│   ├── prices/
│   │   ├── queries.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   └── env.ts si resulta útil
│
├── .env
└── .env.example

No es obligatorio usar exactamente estos nombres si existe una razón técnica mejor, pero mantener una separación similar:

- app = routing
- components = UI
- lib = acceso a datos, tipos y utilidades
- actions = mutaciones server-side

==================================================
VARIABLES DE ENTORNO
==================================================

Crear dentro de /ui:

.env

y:

.env.example

Variables requeridas:

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
N8N_PRICE_SYNC_WEBHOOK_URL=

IMPORTANTE:

- NO hardcodear valores reales en código.
- .env debe quedar ignorado por git.
- .env.example sí debe poder commitearse.
- .env.example solo debe contener las claves vacías.
- Verificar que .gitignore incluya .env y .env.local si corresponde.
- No usar NEXT_PUBLIC_ para SUPABASE_SERVICE_ROLE_KEY.
- El webhook de n8n tampoco necesita estar expuesto al cliente.
- Toda llamada al webhook debe ejecutarse desde servidor.

Si el proyecto ya tiene .env.local y resulta más coherente mantenerlo, explicame primero qué conviene. Pero si no existe, usar .env porque es lo solicitado.

==================================================
SUPABASE
==================================================

Instalar si no existe:

@supabase/supabase-js

Crear un cliente server-only.

Ejemplo conceptual:

lib/supabase/server.ts

Debe:

- leer SUPABASE_URL
- leer SUPABASE_SERVICE_ROLE_KEY
- fallar de manera clara si faltan variables
- exportar una función o instancia server-only
- incluir:

import "server-only"

para ayudar a impedir que este módulo termine accidentalmente en el client bundle.

No crear un cliente Supabase browser porque no lo necesitamos todavía.

==================================================
QUERIES NECESARIAS
==================================================

Crear funciones server-side reutilizables.

Como mínimo:

getProducts()

Debe devolver productos ordenados idealmente por external_code.

Campos necesarios:

id
external_code
description
category_raw
subcategory_raw
current_price
stock
created_at
updated_at
last_synced_at

getLatestSuccessfulPriceSync()

Buscar:

sync_type = "prices"
status = "success"

Ordenar por started_at o finished_at descendente.

Tomar el más reciente.

Campos:

id
started_at
finished_at
status
rows_received
rows_created
rows_updated
rows_rejected

NO utilizar el último sync simplemente por fecha si está en status running.

Queremos específicamente el último exitoso para la cabecera principal.

Opcionalmente:

getLatestPriceSync()

para poder detectar si hay actualmente un sync running o si la última ejecución falló.

getProductPriceHistory(productId)

Ordenar recorded_at ASC.

Debe utilizarse solo cuando haga falta mostrar el detalle de un producto.

Evitar N+1 queries:

NO traer el histórico de los 100 productos cuando carga /prices.

==================================================
SERVER COMPONENTS
==================================================

/prices/page.tsx debe ser Server Component.

Debe obtener del servidor en paralelo cuando sea posible:

- products
- latestSuccessfulPriceSync
- opcionalmente latestSync

Usar Promise.all si corresponde.

NO poner:

"use client"

en page.tsx.

No convertir toda la página en Client Component por comodidad.

==================================================
SERVER ACTION
==================================================

Crear una Server Action para simular la ejecución programada.

Por ejemplo:

simulatePriceSync()

Debe:

1. Ejecutarse únicamente en servidor.
2. Leer N8N_PRICE_SYNC_WEBHOOK_URL desde env.
3. Hacer POST al webhook.
4. Manejar errores.
5. Al finalizar correctamente llamar:

revalidatePath("/prices")

La Server Action NO debe contener lógica de sincronización de productos.

Su única responsabilidad es disparar n8n.

El flujo debe seguir siendo:

UI
→ Server Action
→ n8n
→ SIGProv
→ Supabase

No:

UI
→ Server Action
→ SIGProv directamente

porque queremos demostrar que n8n sigue siendo la capa de integración.

IMPORTANTE SOBRE EL WEBHOOK DE TEST:

Durante la demo local se utilizará:

http://localhost:5678/webhook-test/price-sync

Este endpoint de n8n requiere que el usuario haya pulsado “Listen for test event” en n8n antes de dispararlo.

La UI debe manejar bien el error si n8n no está escuchando.

Mostrar un mensaje entendible, por ejemplo:

“No se pudo iniciar la sincronización. Verificá que n8n esté escuchando el webhook de prueba.”

No mostrar stack traces al usuario.

==================================================
COMPORTAMIENTO DEL BOTÓN
==================================================

Crear un Client Component pequeño exclusivamente para el botón.

Por ejemplo:

PriceSyncButton

Debe utilizar:

useTransition()

o mecanismo equivalente recomendado en React/Next.js para ejecutar la Server Action sin bloquear incorrectamente la UI.

Estados:

normal:
“Simular scheduled trigger 8 AM / 8 PM”

pending:
“Sincronizando…”

disabled mientras está pending.

Al éxito:
mostrar feedback simple:
“Sincronización iniciada correctamente.”

Al error:
mostrar feedback simple:
“No se pudo iniciar la sincronización.”

No agregar librerías pesadas solo para notifications.

Podés usar un pequeño mensaje inline.

IMPORTANTE:

Como el webhook está configurado para responder inmediatamente, que devuelva HTTP 200 significa que n8n aceptó/disparó la ejecución.

No significa necesariamente que los 100 productos ya terminaron de sincronizar.

No representar falsamente:

“Sincronización completada”

si en realidad el webhook respondió inmediatamente.

Usar:
“Sincronización iniciada”

es semánticamente correcto.

Después podemos refrescar/revalidar los datos.

Si la respuesta inmediata hace que revalidatePath ocurra demasiado pronto, NO meter polling complejo en esta iteración.

Podemos aceptar que el usuario refresque o vuelva a consultar unos segundos después.

Si encontrás una solución extremadamente simple y robusta para refrescar luego, proponela, pero no sobreingenierizar.

==================================================
TABLA
==================================================

Crear una tabla responsive y clara.

Columnas:

Código
Producto
Categoría
Precio
Stock

Formato precio en ARS usando Intl.NumberFormat.

Ejemplo:

$ 48.210

o:

$48.210

Mantener consistencia.

Usar locale:

es-AR

No concatenar manualmente puntos de miles.

Stock como integer.

Category:

mostrar category_raw.

No normalizar categorías en frontend porque el problema de rubros todavía NO está resuelto.

Eso es importante.

Si category_raw tiene variantes como:

“Ferreteria Gral.”
“Ferreteria General”
“Sanitarios”
“PINTURAS Y ADHESIVOS”

mostrar el valor real.

No fingir normalización.

==================================================
DETALLE DE PRODUCTO
==================================================

Queremos que el usuario pueda seleccionar un producto desde la tabla.

Elegí la solución más simple y mantenible.

Opciones aceptables:

A)
Link a:

/prices/[id]

B)
Drawer / Sheet lateral

Pero priorizar Server Components.

Por simplicidad arquitectónica recomiendo:

/prices/[id]

si permite mantener el detalle predominantemente server-side.

No construir un modal complejo con mucho estado si no aporta valor.

Si elegís /prices/[id]:

Crear:

app/prices/[id]/page.tsx

Debe cargar:

- producto
- price_history del producto

Mostrar:

Código
Descripción
Precio actual
Categoría
Subcategoría
Stock
Última sincronización

y sección:

“Evolución del precio”

==================================================
HISTÓRICO DE PRECIOS
==================================================

No inventar datos.

Reglas:

0 registros:
“Sin cambios de precio registrados todavía.”

1 registro:
También puede mostrarse el mensaje o un único punto, pero evitar un gráfico engañoso.

2 o más registros:
Mostrar evolución.

Podés usar una librería de chart SOLO si realmente simplifica.

Preferencia:

recharts

pero no instalarla si se puede cumplir visualmente sin necesidad todavía.

Si se instala:

npm install recharts

El chart sería necesariamente Client Component.

Mantenerlo aislado:

PriceHistoryChart

No convertir todo ProductDetail en Client Component.

Formato eje Y en pesos.

Formato eje X en fecha legible.

Responsive.

No usar gráficos 3D, gradientes llamativos ni visuales innecesarios.

==================================================
KPI CARDS
==================================================

Mostrar tres cards sencillas.

1.

Productos
100

Debe derivarse de products.length.

2.

Último sync
“hace 2 días”
o fecha/hora legible.

No hace falta librería date-fns si Intl.RelativeTimeFormat o una función pequeña resuelve el problema.

Podemos mostrar directamente:

23/08/2026 13:40

si esto reduce complejidad.

Preferir claridad sobre efectos.

3.

Estado sync
Exitoso

Badge verde o indicador sobrio.

Si no hay sync exitoso:

“Sin sincronizaciones”

No romper la página.

==================================================
CABECERA
==================================================

La cabecera de /prices debe tener:

Título:
Precios

Descripción:
Precios sincronizados automáticamente desde SIGProv.

Debajo:

Última sincronización exitosa

Ejemplo:

23/08/2026 · 100 productos procesados

A la derecha en desktop:

[ Simular scheduled trigger 8 AM / 8 PM ]

En mobile debe bajar naturalmente debajo.

==================================================
ESTILO
==================================================

Diseño simple.

Usar Tailwind.

No agregar shadcn automáticamente.

Solo instalar shadcn si existe un componente específico donde realmente ahorre tiempo.

Preferencias visuales:

- fondo general gris muy claro o blanco
- cards blancas
- bordes sutiles
- radius moderado
- tipografía del sistema
- buen whitespace
- jerarquía visual clara
- desktop-first razonable pero responsive
- sin sidebar compleja
- sin animaciones innecesarias
- sin hero sections
- sin gradients
- sin glassmorphism
- sin dark mode en esta iteración
- sin logos complejos
- sin marketing copy
- es una herramienta interna operacional

La UX debe parecer una herramienta B2B simple.

==================================================
HOME /
==================================================

No construir dashboard todavía.

El problema de “no ver nada” se resolverá más adelante.

Para evitar una home vacía, app/page.tsx puede simplemente redirigir a:

/prices

Usar:

redirect("/prices")

desde next/navigation.

==================================================
LOADING Y ERROR STATES
==================================================

Agregar loading.tsx para /prices con skeleton simple o texto:

“Cargando precios…”

No hace falta librería.

Manejar:

- Supabase sin conexión
- sin productos
- sin sync_runs
- error en webhook

Si no hay productos:

“No hay productos sincronizados todavía.”

No romper la tabla.

==================================================
TYPESCRIPT
==================================================

Crear tipos claros.

Ejemplo conceptual:

type Product = {
  id: string
  external_code: string
  description: string
  category_raw: string | null
  subcategory_raw: string | null
  current_price: number
  stock: number | null
  created_at: string
  updated_at: string
  last_synced_at: string
}

Recordar que Supabase puede devolver numeric como number dependiendo del SDK/query, pero verificar inferencia real.

No usar any.

No usar type assertions indiscriminadamente.

==================================================
UTILIDADES
==================================================

Crear funciones reutilizables para:

formatCurrency()

formatDate()

formatDateTime()

si resultan necesarias.

Ejemplo:

Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0
})

Para fechas usar Intl.DateTimeFormat("es-AR").

==================================================
SEGURIDAD
==================================================

La service role key nunca puede terminar en cliente.

Agregar:

import "server-only"

en módulos sensibles.

No pasar env secretos como props.

No imprimir secrets en console.log.

No devolver el webhook URL desde la Server Action.

No exponer errores internos completos.

==================================================
DEPENDENCIAS
==================================================

Antes de instalar cosas:

1. Revisar package.json existente.
2. Utilizar las dependencias que ya estén instaladas.
3. Instalar únicamente lo necesario.

Seguro necesitaremos:

@supabase/supabase-js

No instalar librerías por comodidad si Tailwind/React/Intl ya solucionan el problema.

==================================================
CALIDAD DE CÓDIGO
==================================================

Aplicar buenas prácticas:

- funciones pequeñas
- nombres explícitos
- evitar componentes gigantes
- evitar duplicación
- separar data access de presentación
- evitar lógica de negocio dentro del JSX
- preferir const
- no usar console.log salvo debugging temporal
- eliminar debugging al terminar
- no dejar TODOs innecesarios
- comentarios solo cuando agregan contexto
- manejo explícito de errores
- no ocultar errores silenciosamente
- no usar mocks cuando existe Supabase real

==================================================
VALIDACIONES FINALES
==================================================

Al terminar:

1. Ejecutar:

npm run lint

2. Ejecutar:

npm run build

3. Resolver todos los errores de TypeScript.

4. Verificar que:

/ redirige a /prices

5. Verificar que:

/prices

muestra productos reales de Supabase.

6. Verificar que la última sincronización corresponde a:

sync_type = prices
status = success

7. Verificar que el botón intenta realizar:

POST N8N_PRICE_SYNC_WEBHOOK_URL

desde servidor.

8. Verificar que la service role key no aparece en bundles del cliente.

9. Verificar layout responsive.

10. Verificar estado de tabla vacía.

11. Verificar producto sin price_history.

12. Verificar producto con price_history.

==================================================
IMPORTANTE SOBRE EL SCOPE
==================================================

NO implementar:

- proveedores
- facturas
- pagos
- calendario
- autenticación
- roles
- dashboard
- ventas
- stock analytics
- rubros normalizados
- notificaciones
- recibos
- órdenes de compra

Aunque veas tablas relacionadas en Supabase.

Esta iteración debe concentrarse exclusivamente en demostrar:

PROBLEMA 1:
Automatización y visualización de precios de SIGProv.

==================================================
ENTREGA QUE ESPERO DE VOS
==================================================

Primero inspeccioná el proyecto existente dentro de /ui.

Después implementá los cambios directamente.

Al terminar, mostrame:

1. Archivos creados.
2. Archivos modificados.
3. Dependencias agregadas.
4. Variables que debo completar manualmente en .env.
5. Cómo correr el proyecto.
6. Cómo probar el webhook.
7. Cualquier decisión técnica relevante que hayas tomado.
8. Resultado de npm run lint.
9. Resultado de npm run build.

NO te limites a describir qué habría que hacer.

Quiero que ejecutes la implementación completa dentro de /ui.