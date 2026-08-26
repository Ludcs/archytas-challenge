Actuá como Tech Lead Fullstack especializado en Next.js 16, TypeScript y diseño de interfaces operativas B2B.

Estoy trabajando en un technical challenge para Archytas.

La aplicación ya tiene implementados y funcionando estos módulos:

/prices
/invoices
/invoices/[id]
/suppliers
/suppliers/[id]

Ahora necesito implementar la página de inicio:

/

La home debe ser MUY simple, clara y funcional.

No debe convertirse en un dashboard.

Debe funcionar como puerta de entrada a los tres módulos principales:

- Precios
- Facturas
- Proveedores

==================================================
IMPORTANTE: REEMPLAZAR EL REDIRECT ACTUAL
==================================================

Antes de implementar, revisar:

app/page.tsx

Actualmente es posible que tenga algo como:

redirect("/prices")

Eso debe ELIMINARSE.

La ruta:

/

NO debe redirigir más a /prices.

Debe renderizar la nueva Home.

Este punto es obligatorio.

==================================================
CONTEXTO DE PRODUCTO
==================================================

Este sistema pertenece al cliente:

Ferretería Industrial Cordillera

SIGProv es únicamente una fuente externa/integración.

Por lo tanto:

NO presentar la Home como:

“SIGProv Dashboard”
“SIGProv System”
“SIGProv Admin”

El protagonista de la Home debe ser:

Ferretería Industrial Cordillera

La aplicación representa el sistema interno/operativo del cliente.

==================================================
OBJETIVO UX
==================================================

La página debe responder una única pregunta:

“¿A qué módulo quiero entrar?”

No queremos:

- métricas globales;
- gráficos;
- actividad reciente;
- alertas;
- widgets;
- sidebar compleja;
- dashboard ejecutivo;
- sincronizaciones;
- tablas;
- filtros.

Solo queremos:

- identidad del sistema;
- fecha actual;
- descripción breve;
- acceso claro a Precios;
- acceso claro a Facturas;
- acceso claro a Proveedores.

==================================================
CONSISTENCIA VISUAL
==================================================

ANTES DE ESCRIBIR CÓDIGO:

inspeccioná completamente las vistas existentes:

/prices
/invoices
/suppliers

y, si es útil:

/prices/[id]
/invoices/[id]
/suppliers/[id]

Identificá y reutilizá exactamente:

- max-width;
- padding horizontal;
- spacing vertical;
- tipografía;
- font weights;
- colores;
- background;
- cards;
- borders;
- radius;
- shadows;
- links;
- responsive breakpoints.

La Home debe parecer parte exacta del mismo producto.

NO:

- cambiar globals.css salvo necesidad estricta;
- cambiar colores globales;
- agregar tipografías;
- agregar gradients;
- agregar glassmorphism;
- agregar ilustraciones;
- agregar hero marketing;
- agregar logos nuevos;
- instalar librerías de componentes.

==================================================
ARQUITECTURA
==================================================

Usar Next.js 16 App Router.

La Home debe ser Server Component.

NO agregar:

"use client"

No usar Client Components salvo que exista una razón técnica real.

No usar Server Actions.

No hacer fetch.

No consultar Supabase.

No necesitamos datos externos para esta página.

La única información dinámica es la fecha actual.

==================================================
ARCHIVO PRINCIPAL
==================================================

Implementar en:

app/page.tsx

Si actualmente ese archivo hace:

redirect("/prices")

reemplazar completamente ese comportamiento por la nueva Home.

No crear una segunda ruta alternativa.

La Home oficial debe ser:

/

==================================================
HEADER
==================================================

El encabezado debe incluir:

FERRETERÍA INDUSTRIAL CORDILLERA

Debajo:

Sistema de gestión operativa

Descripción breve:

Información centralizada de precios, facturas y proveedores.

También debe mostrar la fecha actual.

Texto:

Hoy es {fecha actual}

Ejemplo:

Hoy es 25 de agosto de 2026

==================================================
FECHA ACTUAL
==================================================

La fecha debe generarse server-side.

No hardcodear la fecha.

Usar Intl.DateTimeFormat con locale:

es-AR

Ejemplo conceptual:

new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date())

Mostrar:

Hoy es 25 de agosto de 2026

No mostrar hora.

No agregar librería date-fns.

No hacer componente cliente solo por esto.

==================================================
LAYOUT DEL HEADER
==================================================

En desktop:

alinear la fecha de forma discreta a la derecha del header.

Conceptualmente:

FERRETERÍA INDUSTRIAL CORDILLERA          Hoy es 25 de agosto de 2026

Sistema de gestión operativa

Información centralizada de precios, facturas y proveedores.

En mobile:

la fecha puede bajar debajo del texto principal.

Mantener buena jerarquía visual.

La fecha debe ser secundaria.

No debe competir con el título.

==================================================
MÓDULOS
==================================================

Debajo del header mostrar 3 cards.

En desktop:

3 columnas.

En tablet:

pueden seguir 3 columnas si entra correctamente o adaptarse según el patrón actual.

En mobile:

1 columna.

Cards:

1. Precios
2. Facturas
3. Proveedores

==================================================
CARD PRECIOS
==================================================

Título:

Precios

Descripción:

Consultá los precios actuales y su historial de sincronización.

CTA:

Ver precios →

Destino:

/prices

==================================================
CARD FACTURAS
==================================================

Título:

Facturas

Descripción:

Revisá estados de pago, vencimientos y recibos.

CTA:

Ver facturas →

Destino:

/invoices

==================================================
CARD PROVEEDORES
==================================================

Título:

Proveedores

Descripción:

Consultá proveedores, saldos y movimientos de cuenta corriente.

CTA:

Ver proveedores →

Destino:

/suppliers

==================================================
SEMÁNTICA DE LAS CARDS
==================================================

Cada card debe ser navegable con Link de Next.js.

Preferencia:

hacer que toda la card sea un Link si puede hacerse de forma accesible.

Ejemplo conceptual:

<Link href="/prices">
  <article>
    ...
  </article>
</Link>

No usar:

onClick
router.push

si Link resuelve el caso.

Mantener semántica HTML correcta.

==================================================
COMPONENTE REUTILIZABLE
==================================================

Si resulta limpio, crear:

components/home/module-card.tsx

con props como:

type ModuleCardProps = {
  title: string
  description: string
  href: string
  linkLabel: string
}

Usarlo para las tres opciones.

Pero:

NO crear una abstracción compleja.

Si el componente no aporta claridad real, se puede mantener dentro de app/page.tsx.

Preferir simplicidad.

==================================================
ESTRUCTURA ESPERADA
==================================================

Algo como:

ui/
├── app/
│   └── page.tsx
│
└── components/
    └── home/
        └── module-card.tsx

Solo crear components/home si realmente aporta reutilización.

No crear:

lib/home
actions.ts
hooks
types separados

para una página tan simple.

==================================================
ESTILO VISUAL DE LAS CARDS
==================================================

Mantener exactamente el mismo patrón visual de cards existentes.

Debe sentirse como una herramienta interna B2B.

Cada card debe tener:

- título claro;
- descripción;
- CTA discreto;
- hover sutil;
- border;
- radius;
- buen padding;
- whitespace.

No usar:

- sombras pesadas;
- iconos enormes;
- fondos saturados;
- gradientes;
- animaciones complejas.

Un hover simple de border/background es suficiente si ya existe ese lenguaje.

==================================================
ICONOS
==================================================

No instalar librería nueva.

Si el proyecto ya tiene una librería de iconos instalada y el uso queda muy simple, se puede agregar un icono pequeño por card.

Ejemplos conceptuales:

Precios → etiqueta / monedas
Facturas → documento
Proveedores → usuarios / edificio

Pero es totalmente opcional.

La Home debe funcionar perfectamente sin iconos.

No ampliar scope por esto.

==================================================
COPY FINAL ESPERADO
==================================================

Header:

Ferretería Industrial Cordillera

Sistema de gestión operativa

Información centralizada de precios, facturas y proveedores.

Hoy es 25 de agosto de 2026


Card 1:

Precios

Consultá los precios actuales y su historial de sincronización.

Ver precios →


Card 2:

Facturas

Revisá estados de pago, vencimientos y recibos.

Ver facturas →


Card 3:

Proveedores

Consultá proveedores, saldos y movimientos de cuenta corriente.

Ver proveedores →

==================================================
VISUAL APROXIMADO
==================================================

FERRETERÍA INDUSTRIAL CORDILLERA             Hoy es 25 de agosto de 2026

Sistema de gestión operativa

Información centralizada de precios, facturas y proveedores.


┌──────────────────────────┐
│ Precios                  │
│                          │
│ Consultá los precios     │
│ actuales y su historial  │
│ de sincronización.       │
│                          │
│ Ver precios →            │
└──────────────────────────┘

┌──────────────────────────┐
│ Facturas                 │
│                          │
│ Revisá estados de pago,  │
│ vencimientos y recibos.  │
│                          │
│ Ver facturas →           │
└──────────────────────────┘

┌──────────────────────────┐
│ Proveedores              │
│                          │
│ Consultá proveedores,    │
│ saldos y movimientos de  │
│ cuenta corriente.        │
│                          │
│ Ver proveedores →        │
└──────────────────────────┘

En desktop:

[ Precios ]   [ Facturas ]   [ Proveedores ]

==================================================
RESPONSIVE
==================================================

Desktop:
3 columnas.

Mobile:
1 columna.

Usar CSS/Tailwind responsive ya disponible.

No hacer JS para detectar viewport.

==================================================
ACCESSIBILITY
==================================================

Usar:

- h1 para nombre/sistema principal;
- h2 para títulos de cards;
- Links reales;
- buen contraste;
- focus-visible;
- no depender únicamente de hover.

==================================================
NO IMPLEMENTAR
==================================================

No implementar:

- dashboard;
- KPIs;
- estadísticas;
- llamadas Supabase;
- últimos syncs;
- alertas;
- sidebar;
- navbar compleja;
- breadcrumb;
- login;
- usuario/avatar;
- settings;
- dark mode;
- gráficos;
- tablas;
- filtros;
- footer complejo.

Esta página debe ser deliberadamente simple.

==================================================
NO ROMPER LO EXISTENTE
==================================================

Verificar que sigan funcionando:

/prices
/prices/[id]

/invoices
/invoices/[id]

/suppliers
/suppliers/[id]

No modificar esos módulos salvo reutilización mínima de estilos/componentes.

==================================================
BUENAS PRÁCTICAS
==================================================

Aplicar:

- TypeScript strict;
- Server Component;
- código simple;
- no any;
- no dependencias nuevas;
- no datos ficticios;
- no console.log;
- no código muerto;
- no abstracciones innecesarias;
- semántica HTML correcta;
- reutilización visual;
- componentes pequeños.

==================================================
VALIDACIÓN FINAL
==================================================

Al terminar:

1. ejecutar:

npm run lint

2. ejecutar:

npm run build

3. corregir todos los errores.

4. verificar manualmente:

http://localhost:3000/

Debe mostrar la Home.

5. comprobar que:

/ NO redirige más a /prices.

6. comprobar links:

Precios → /prices

Facturas → /invoices

Proveedores → /suppliers

7. comprobar que la fecha:

- usa la fecha actual;
- está en español;
- no está hardcodeada.

8. comprobar desktop.

9. comprobar mobile.

10. comprobar que los módulos existentes siguen funcionando.

==================================================
ENTREGA DEL AGENTE
==================================================

Antes de implementar:

inspeccioná el código existente y especialmente app/page.tsx.

Después implementá la Home.

Al finalizar reportame:

1. archivos creados;
2. archivos modificados;
3. componentes reutilizados;
4. si se creó ModuleCard, explicar brevemente por qué;
5. resultado de npm run lint;
6. resultado de npm run build.

No te limites a describir qué harías.

Implementá la solución completa.