# Archytas FDE Challenge

Solución del challenge técnico de Archytas para modernizar parte del flujo operativo de **Ferretería Industrial Cordillera**.

La solución utiliza:

- **n8n** para automatización e integración con SIGProv.
- **Supabase** como base de datos canónica.
- **Next.js 16 + TypeScript + Tailwind CSS** para la capa de presentación.

## Estructura del proyecto

```text
archytas-challenge/
├── n8n/
│   └── workflows/
│       ├── 01-sigprov-price-sync.json
│       ├── 02-sigprov-supplier-account-sync.json
│       └── 03-sigprov-invoice-sync.json.json
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_suppliers_and_account_movements.sql
│       └── 003_invoices.sql
├── ui/
├── docker-compose.yml
└── README.md
```

## Requisitos

- Docker / Docker Compose
- Node.js `v22.21.1`
- npm
- Una cuenta/proyecto de Supabase

## 1. Configurar Supabase

Crear un proyecto nuevo en Supabase y ejecutar manualmente, en este orden, los scripts disponibles en:

```text
supabase/migrations/
```

Orden:

```text
001_initial_schema.sql
002_suppliers_and_account_movements.sql
003_invoices.sql
```

Luego obtener desde Supabase:

- Project URL
- Service Role Key

## 2. Levantar n8n

Desde la raíz del repositorio:

```bash
docker compose up -d
```

n8n quedará disponible en:

```text
http://localhost:5678
```

Importar manualmente los workflows ubicados en:

```text
n8n/workflows/
```

Después de importarlos:

1. Crear/configurar la credencial de Supabase en n8n.
2. Asociar esa credencial a los nodos Supabase de los workflows.
3. Reemplazar los placeholders de SIGProv:

```text
__SIGPROV_USERNAME__
__SIGPROV_PASSWORD__
```

por las credenciales correspondientes al challenge.

## 3. Configurar la UI

Entrar a:

```bash
cd ui
```

Instalar dependencias:

```bash
npm install
```

Crear el archivo:

```text
ui/.env
```

con:

```env
SUPABASE_URL=<SUPABASE_PROJECT_URL>
SUPABASE_SERVICE_ROLE_KEY=<SUPABASE_SERVICE_ROLE_KEY>
N8N_PRICE_SYNC_WEBHOOK_URL=http://localhost:5678/webhook-test/price-sync
```

## 4. Ejecutar Next.js

Desde `/ui`:

```bash
npm run dev
```

La aplicación estará disponible en:

```text
http://localhost:3000
```

## Rutas principales

```text
/prices
/invoices
/suppliers
```

También existen vistas de detalle para los módulos que corresponden.

## Simular sincronización de precios

La sincronización automática de precios está preparada en n8n para ejecutarse a las **08:00 y 20:00**.

Para facilitar la demo local, `/prices` incluye el botón:

```text
Simular scheduled trigger 8 AM / 8 PM
```

Antes de utilizarlo:

1. Abrir el workflow de precios en n8n.
2. Abrir el nodo `Webhook`.
3. Hacer click en `Listen for test event`.
4. Volver a `/prices` y disparar la sincronización desde la UI.

La UI inicia el workflow mediante el webhook y consulta su estado en `sync_runs` hasta que la ejecución finaliza.

## Detener el entorno

Desde la raíz:

```bash
docker compose down
```
